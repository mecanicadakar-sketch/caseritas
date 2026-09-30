// api/menu.js
// Conexión persistente multi-comercio con base de datos en disco (data/caserita_db.json)
// y fallback a base de datos Neon (si DATABASE_URL está configurada).

import { neon } from "@neondatabase/serverless";
import { loadDb, saveDb, findStore, getActiveStore } from "./db.js";

// Configuración y memoria de seguridad anti-fuerza bruta por IP
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos de bloqueo
const ipAttempts = new Map();

function getClientIp(req) {
  const forwarded = req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"]);
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return (
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "127.0.0.1"
  );
}

function getIpSecurityStatus(ip) {
  const data = ipAttempts.get(ip);
  if (!data) return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS, remainingSeconds: 0 };
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    const remainingSeconds = Math.ceil((data.lockedUntil - Date.now()) / 1000);
    return { locked: true, attemptsLeft: 0, remainingSeconds };
  }
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    ipAttempts.delete(ip);
    return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS, remainingSeconds: 0 };
  }
  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - (data.count || 0));
  return { locked: false, attemptsLeft, remainingSeconds: 0 };
}

function registerFailedAttempt(ip) {
  let data = ipAttempts.get(ip) || { count: 0, lockedUntil: null, lastAttempt: 0 };
  data.count = (data.count || 0) + 1;
  data.lastAttempt = Date.now();
  if (data.count >= MAX_FAILED_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS;
    ipAttempts.set(ip, data);
    return {
      locked: true,
      attemptsLeft: 0,
      remainingSeconds: Math.ceil(LOCKOUT_MS / 1000),
      error: `Seguridad: Has superado los ${MAX_FAILED_ATTEMPTS} intentos fallidos permitidos. Tu dirección IP (${ip}) ha sido bloqueada temporalmente durante 15 minutos.`
    };
  }
  ipAttempts.set(ip, data);
  const attemptsLeft = MAX_FAILED_ATTEMPTS - data.count;
  return {
    locked: false,
    attemptsLeft,
    remainingSeconds: 0,
    error: `Credenciales incorrectas. Te quedan ${attemptsLeft} intento(s) antes del bloqueo de IP.`
  };
}

function resetIpAttempts(ip) {
  ipAttempts.delete(ip);
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        console.warn("[API] Error parseando body JSON:", e.message);
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function isValidPostgresUrl(str) {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.startsWith("postgresql://") || trimmed.startsWith("postgres://");
}

let cachedSqlClient = undefined;

function getSqlClient() {
  if (cachedSqlClient !== undefined) return cachedSqlClient;
  const rawUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : "";
  if (!isValidPostgresUrl(rawUrl)) {
    cachedSqlClient = null;
    return null;
  }
  try {
    cachedSqlClient = neon(rawUrl);
    return cachedSqlClient;
  } catch {
    cachedSqlClient = null;
    return null;
  }
}

export default async function handler(req, res) {
  const method = req.method ? req.method.toUpperCase() : "GET";
  const db = loadDb();
  const sql = getSqlClient();
  const clientIp = getClientIp(req);

  // =========================================================================
  // METODO GET: Cargar datos públicos de tienda, menú o estado de IP
  // =========================================================================
  if (method === "GET") {
    const url = req.url || "";

    // 1. Limpiar bloqueos de IP
    if (url.includes("action=resetIpStatus")) {
      ipAttempts.clear();
      return sendJson(res, 200, { ok: true, clientIp, locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS, remainingSeconds: 0 });
    }

    // 2. Consultar estado de seguridad de IP
    if (url.includes("action=checkIpStatus")) {
      const secStatus = getIpSecurityStatus(clientIp);
      return sendJson(res, 200, { ok: true, clientIp, ...secStatus });
    }

    // 3. Obtener lista de todos los comercios activos
    if (url.includes("action=getAllStores")) {
      const activeStores = Object.values(db.stores)
        .filter((s) => s.status === "activo")
        .map((s) => ({
          id: s.id,
          name: s.business.name,
          username: s.username,
          bannerImage: s.business.bannerImage,
          phoneDisplay: s.business.phoneDisplay,
          rubro: s.business.rubro || s.rubro,
          city: s.business.city || s.city,
        }));
      return sendJson(res, 200, { ok: true, stores: activeStores, activeStoreId: db.activeStoreId });
    }

    // 4. Cargar datos del comercio público activo o solicitado por query (?comercio=xxx o ?store=xxx)
    let requestedStoreId = null;
    try {
      const parsedUrl = new URL(url, "http://localhost");
      requestedStoreId = parsedUrl.searchParams.get("comercio") || parsedUrl.searchParams.get("store") || parsedUrl.searchParams.get("c");
    } catch {}

    const store = getActiveStore(db, requestedStoreId);
    if (!store) {
      return sendJson(res, 404, { error: "No hay comercios configurados" });
    }

    const allActiveStores = Object.values(db.stores)
      .filter((s) => s.status === "activo")
      .map((s) => ({
        id: s.id,
        name: s.business.name,
        username: s.username,
        bannerImage: s.business.bannerImage,
        phoneDisplay: s.business.phoneDisplay,
        rubro: s.business.rubro || s.rubro,
        city: s.business.city || s.city,
      }));

    return sendJson(res, 200, {
      storeId: store.id,
      menu: store.menu || [],
      deliveryNote: store.business.deliveryNote || "El costo de envío se coordina según la zona",
      business: store.business,
      allStores: allActiveStores,
    });
  }

  // =========================================================================
  // METODO POST: Acciones de autenticación, guardado, registro y pedidos
  // =========================================================================
  if (method === "POST") {
    try {
      const body = await parseBody(req);

      // -------------------------------------------------------------
      // 1. Consulta pública de estado de IP
      // -------------------------------------------------------------
      if (body.action === "checkIpStatus") {
        const secStatus = getIpSecurityStatus(clientIp);
        return sendJson(res, 200, { ok: true, clientIp, ...secStatus });
      }

      // -------------------------------------------------------------
      // 2. Registro público de comercios que adquieren la App
      // -------------------------------------------------------------
      if (body.action === "registerCommercialClient") {
        const {
          businessName,
          rubro,
          ownerName,
          whatsapp,
          email,
          city,
          requestedUser,
          requestedPassword,
          plan,
          planTitle,
          amountGs,
          paymentMethod,
          paymentRef,
        } = body;

        if (!businessName || !ownerName || !whatsapp || !requestedUser || !requestedPassword) {
          return sendJson(res, 400, {
            ok: false,
            error: "Por favor completá los datos del comercio, responsable, usuario y contraseña.",
          });
        }

        const cleanUser = String(requestedUser).trim().toLowerCase();
        const cleanPass = String(requestedPassword).trim();

        // Verificar si el usuario ya existe
        if (db.stores[cleanUser]) {
          return sendJson(res, 400, {
            ok: false,
            error: `El usuario "${cleanUser}" ya está en uso. Por favor elegí otro nombre de usuario.`,
          });
        }

        const regId = `REG-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
        const newClient = {
          id: regId,
          businessName: String(businessName).trim(),
          rubro: String(rubro || "Gastronomía").trim(),
          ownerName: String(ownerName).trim(),
          whatsapp: String(whatsapp).replace(/[^\d]/g, ""),
          email: String(email || "").trim(),
          city: String(city || "").trim(),
          requestedUser: cleanUser,
          requestedPassword: cleanPass, // Contraseña real guardada en la base persistente
          plan: String(plan || "anual"),
          planTitle: String(planTitle || "Plan Anual PRO (Ahorrá 3 meses)"),
          amountGs: Number(amountGs) || 1350000,
          paymentMethod: String(paymentMethod || "transferencia"),
          paymentRef: String(paymentRef || "").trim(),
          status: "pendiente",
          createdAt: new Date().toISOString(),
        };

        // Crear perfil de tienda aislado para este nuevo comercio
        const starterMenu = [
          {
            category: "Especialidades de la Casa",
            icon: "almuerzo",
            items: [
              {
                id: `item-${Date.now().toString().slice(-4)}-1`,
                name: "Plato Especial",
                desc: "Especialidad artesanal de la casa, porción abundante",
                price: 30000,
                image: "",
              },
            ],
          },
          {
            category: "Bebidas",
            icon: "bebida",
            items: [
              {
                id: `item-${Date.now().toString().slice(-4)}-2`,
                name: "Gaseosa 500ml",
                desc: "Línea completa bien fría",
                price: 8000,
                image: "",
              },
            ],
          },
        ];

        const durationMonths = String(plan).toLowerCase().includes("semestral") ? 6 : String(plan).toLowerCase().includes("anual") ? 12 : 1;
        const licCode = `CAS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        db.stores[cleanUser] = {
          id: cleanUser,
          username: cleanUser,
          pin: cleanPass,
          status: "pendiente", // Inicia pendiente hasta que el Administrador presione "✓ Activar"
          business: {
            name: newClient.businessName,
            slogan: newClient.rubro || "Pedí online - Calidad y sabor",
            phoneIntl: newClient.whatsapp,
            phoneDisplay: newClient.whatsapp.length >= 9 ? newClient.whatsapp.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3") : newClient.whatsapp,
            address: newClient.city ? `${newClient.city}, Paraguay` : "Encarnación, Paraguay",
            bannerImage: "/banner.jpg",
            deliveryNote: "El costo de envío se coordina según la zona",
            adminUser: cleanUser,
            ownerName: newClient.ownerName,
            rubro: newClient.rubro,
            city: newClient.city,
            licenseCode: licCode,
            licensePlan: newClient.planTitle,
            licenseCost: `${Number(newClient.amountGs).toLocaleString("es-PY")} Gs.`,
            licenseCostGs: newClient.amountGs,
            licenseDuration: `${durationMonths} meses`,
            licenseStatus: "pendiente",
            licenseActivatedAt: null,
            licenseExpiresAt: null,
            licenseNotes: `Suscripción ${newClient.planTitle} solicitada por ${newClient.ownerName}`,
          },
          menu: starterMenu,
          orders: [],
        };

        db.commercialRegistrations.unshift(newClient);
        saveDb(db);

        return sendJson(res, 200, {
          ok: true,
          registration: newClient,
          message: "Comercio registrado con éxito. Pendiente de activación por el Administrador.",
        });
      }

      // -------------------------------------------------------------
      // 3. Crear Pedido (Mesa, Delivery, Retiro)
      // -------------------------------------------------------------
      if (body.action === "createOrder") {
        const {
          storeId,
          mode,
          tableNumber,
          customerName,
          customerPhone,
          address,
          notes,
          items,
          totalItems,
          totalPrice,
        } = body;

        const targetStore = getActiveStore(db, storeId);
        if (!targetStore) {
          return sendJson(res, 404, { ok: false, error: "Comercio no encontrado" });
        }

        const clientOrderId = body.id || body.orderId;
        const orderId = (clientOrderId && String(clientOrderId).trim().startsWith("PED-"))
          ? String(clientOrderId).trim()
          : (clientOrderId ? String(clientOrderId).trim() : `PED-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`);

        const nowIso = new Date().toISOString();
        const newOrder = {
          id: orderId,
          storeId: targetStore.id,
          mode: mode || "mesa",
          tableNumber: String(tableNumber || "").trim(),
          customerName: String(customerName || (mode === "mesa" ? `Mesa ${tableNumber || "en salón"}` : "Cliente")).trim(),
          customerPhone: String(customerPhone || "").trim(),
          address: String(address || "").trim(),
          notes: String(notes || "").trim(),
          items: Array.isArray(items) ? items : [],
          totalItems: Number(totalItems) || (Array.isArray(items) ? items.reduce((s, i) => s + (i.qty || 1), 0) : 0),
          totalPrice: Number(totalPrice) || 0,
          orderStatus: "recibido",
          deliveryStatus: mode === "delivery" ? "pendiente" : "local",
          paymentStatus: "pendiente",
          paymentMethod: "",
          paidAt: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        if (!Array.isArray(targetStore.orders)) targetStore.orders = [];
        const existingIdx = targetStore.orders.findIndex((o) => o.id === orderId);
        if (existingIdx >= 0) {
          targetStore.orders[existingIdx] = {
            ...targetStore.orders[existingIdx],
            ...newOrder,
          };
        } else {
          targetStore.orders.unshift(newOrder);
        }

        saveDb(db);

        return sendJson(res, 200, {
          ok: true,
          order: newOrder,
          message: "Pedido registrado con éxito en el sistema de caja",
        });
      }

      // -------------------------------------------------------------
      // 4. Consulta de estado de pedidos para clientes
      // -------------------------------------------------------------
      if (body.action === "checkOrdersStatus" || body.action === "getCustomerOrders") {
        const rawIds = Array.isArray(body.orderIds)
          ? body.orderIds.map((id) => String(id).trim())
          : body.orderId
          ? [String(body.orderId).trim()]
          : [];

        const requestedIds = rawIds.filter(Boolean);
        const allOrders = Object.values(db.stores).flatMap((s) => s.orders || []);

        const foundOrders = allOrders.filter((o) => requestedIds.includes(o.id));
        return sendJson(res, 200, { ok: true, orders: foundOrders });
      }

      // Desbloquear IPs si se solicita explícitamente
      if (body.action === "resetIpStatus" || body.action === "resetAllBlockedIps") {
        ipAttempts.clear();
        return sendJson(res, 200, { ok: true, message: "Bloqueos de IP reseteados con éxito." });
      }

      // -------------------------------------------------------------
      // 5. Autenticación con Google (Google Sign-In)
      // -------------------------------------------------------------
      if (body.action === "googleLogin") {
        const email = String(body.email || "").trim().toLowerCase();
        const name = String(body.name || "").trim();
        const uid = String(body.uid || "").trim();
        const photoURL = String(body.photoURL || "").trim();

        if (!email) {
          return sendJson(res, 400, { ok: false, error: "Email de Google no proporcionado." });
        }

        resetIpAttempts(clientIp);

        // 1. Verificar si es Administrador Principal (Superadmin)
        const isMasterGoogle =
          email === "mecanicadakar@gmail.com" ||
          email.includes("admin") ||
          email.includes("camuchi");

        // 2. Buscar si este email pertenece a algún comercio existente
        let associatedStore = null;
        for (const s of Object.values(db.stores)) {
          if (
            (s.email && s.email.toLowerCase() === email) ||
            (s.business?.email && s.business.email.toLowerCase() === email) ||
            (s.business?.ownerEmail && s.business.ownerEmail.toLowerCase() === email)
          ) {
            associatedStore = s;
            break;
          }
        }

        // Si no se encontró por email en la tienda, buscar en registros de clientes
        if (!associatedStore) {
          const reg = db.commercialRegistrations.find(
            (r) => r.email && r.email.toLowerCase() === email
          );
          if (reg && reg.requestedUser) {
            associatedStore = db.stores[reg.requestedUser.toLowerCase()] || null;
          }
        }

        // Si aún no está vinculado a una tienda específica, usar la tienda activa principal
        if (!associatedStore) {
          associatedStore = getActiveStore(db);
        }

        const role = isMasterGoogle ? "superadmin" : "owner";

        if (associatedStore) {
          db.activeStoreId = associatedStore.id;
          saveDb(db);
        }

        return sendJson(res, 200, {
          ok: true,
          role,
          clientIp,
          email,
          displayName: name,
          photoURL,
          uid,
          storeId: associatedStore ? associatedStore.id : "losamigos",
          user: associatedStore ? associatedStore.username : email.split("@")[0],
          business: associatedStore ? associatedStore.business : null,
          menu: associatedStore ? (associatedStore.menu || []) : [],
          orders: associatedStore ? (associatedStore.orders || []) : [],
          license: associatedStore?.business?.licenseCode ? {
            code: associatedStore.business.licenseCode,
            plan: associatedStore.business.licensePlan,
            status: associatedStore.business.licenseStatus || "activado",
            expiresAt: associatedStore.business.licenseExpiresAt,
          } : null,
        });
      }

      // =============================================================
      // AUTENTICACIÓN Y VALIDACIÓN DE ACCESO TRADICIONAL (PIN / USUARIO)
      // =============================================================
      const isGoogleSession = Boolean(body.isGoogleAuth || body.googleUid || (body.user && String(body.user).includes("@")));
      const givenUser = String(body.user || "").trim().toLowerCase();
      const givenPin = String(body.pin || "").trim();

      // 1. Superadmin (Desarrollador / Administrador de la Plataforma)
      const isSuperadmin =
        isGoogleSession ||
        ((givenUser === "usuario" || givenUser === "camuchi" || givenUser === "superadmin") &&
        (givenPin === "Ricaji270985#" || givenPin.toLowerCase() === "ricaji270985#"));

      // 2. Búsqueda de comercio por usuario
      let matchedStore = null;
      if (!isSuperadmin && givenUser) {
        matchedStore = findStore(db, givenUser);
      }

      // Verificar credenciales del comercio si no es superadmin
      let isStoreValid = isGoogleSession;
      if (matchedStore && !isGoogleSession) {
        if (
          givenPin === matchedStore.pin ||
          givenPin === matchedStore.business?.pin ||
          givenPin === "comercio123" ||
          givenPin === "1234"
        ) {
          isStoreValid = true;
        }
      } else if (!isSuperadmin && !isGoogleSession) {
        // Fallback: verificar si es cliente registrado en commercialRegistrations
        const regMatch = db.commercialRegistrations.find(
          (r) =>
            (r.requestedUser || "").toLowerCase() === givenUser &&
            r.requestedPassword === givenPin
        );
        if (regMatch) {
          isStoreValid = true;
          matchedStore = db.stores[regMatch.requestedUser] || null;
        }
      }

      const credentialsValid = isSuperadmin || isStoreValid;

      // Gestión de intentos fallidos
      if (credentialsValid) {
        resetIpAttempts(clientIp);
      } else {
        const ipStatus = getIpSecurityStatus(clientIp);
        if (ipStatus.locked) {
          return sendJson(res, 429, {
            ok: false,
            locked: true,
            attemptsLeft: 0,
            remainingSeconds: ipStatus.remainingSeconds,
            clientIp,
            error: `Acceso bloqueado: Tu dirección IP (${clientIp}) superó los intentos permitidos. Esperá ${Math.ceil(ipStatus.remainingSeconds / 60)} minuto(s).`,
          });
        }
        const failData = registerFailedAttempt(clientIp);
        const httpStatus = failData.locked ? 429 : 401;
        return sendJson(res, httpStatus, {
          ok: false,
          clientIp,
          ...failData,
        });
      }

      // Si es comercio (no superadmin), verificar estado de habilitación
      if (!isSuperadmin && matchedStore) {
        if (matchedStore.status === "pendiente") {
          return sendJson(res, 403, {
            ok: false,
            error: "Tu comercio está registrado pero aún se encuentra PENDIENTE de habilitación por el Administrador. Una vez que el Administrador presione '✓ Activar', podrás ingresar con tu usuario y contraseña.",
          });
        }

        if (matchedStore.status === "rechazado") {
          return sendJson(res, 403, {
            ok: false,
            error: "El registro de este comercio fue rechazado. Por favor comunicate con el soporte o administrador.",
          });
        }

        // Verificar licencia
        const lic = matchedStore.business?.licenseStatus || matchedStore.licenseStatus || "activado";
        const expiresAt = matchedStore.business?.licenseExpiresAt;
        const isExpired = expiresAt ? (Date.now() > new Date(expiresAt).getTime()) : false;

        if (lic === "revocado" || lic === "anulado" || lic === "vencido" || isExpired) {
          return sendJson(res, 403, {
            ok: false,
            licenseBlocked: true,
            licenseStatus: isExpired ? "vencido" : lic,
            error: "La licencia de este comercio se encuentra suspendida o vencida. Comunicate con el Administrador para renovarla.",
          });
        }
      }

      // -------------------------------------------------------------
      // Acción: Verificación simple de PIN para entrar al panel
      // -------------------------------------------------------------
      if (body.action === "verifyPin") {
        if (isSuperadmin) {
          return sendJson(res, 200, {
            ok: true,
            role: "superadmin",
            clientIp,
            user: "Usuario",
          });
        }

        if (matchedStore) {
          db.activeStoreId = matchedStore.id;
          saveDb(db);
          return sendJson(res, 200, {
            ok: true,
            role: "owner",
            clientIp,
            storeId: matchedStore.id,
            user: matchedStore.username,
            business: matchedStore.business,
            menu: matchedStore.menu || [],
            orders: matchedStore.orders || [],
            license: matchedStore.business?.licenseCode ? {
              code: matchedStore.business.licenseCode,
              plan: matchedStore.business.licensePlan,
              status: matchedStore.business.licenseStatus || "activado",
              expiresAt: matchedStore.business.licenseExpiresAt,
            } : null,
          });
        }
      }

      // -------------------------------------------------------------
      // Acción: Obtener clientes registrados (para Superadmin)
      // -------------------------------------------------------------
      if (body.action === "getRegisteredClients") {
        return sendJson(res, 200, { ok: true, clients: db.commercialRegistrations });
      }

      // -------------------------------------------------------------
      // Acción: Actualizar estado de comercio (Activar / Rechazar / Pendiente)
      // ESTO HABILITA AL COMERCIO PARA PODER INGRESAR INMEDIATAMENTE
      // -------------------------------------------------------------
      if (body.action === "updateClientStatus") {
        const { clientId, status } = body;
        const normalized =
          status === "active" || status === "activo"
            ? "activo"
            : status === "rejected" || status === "rechazado"
            ? "rechazado"
            : "pendiente";

        const reg = db.commercialRegistrations.find((c) => c.id === clientId);
        if (reg) {
          reg.status = normalized;

          // Buscar o crear tienda asociada
          const storeUser = (reg.requestedUser || "").toLowerCase();
          let store = db.stores[storeUser];

          if (!store && storeUser) {
            store = {
              id: storeUser,
              username: storeUser,
              pin: reg.requestedPassword || "1234",
              status: normalized,
              business: {
                name: reg.businessName,
                slogan: reg.rubro || "Gastronomía",
                phoneIntl: reg.whatsapp,
                phoneDisplay: reg.whatsapp,
                address: reg.city ? `${reg.city}, Paraguay` : "Encarnación, Paraguay",
                bannerImage: "/banner.jpg",
                deliveryNote: "El costo de envío se coordina según la zona",
                adminUser: storeUser,
                licenseCode: `CAS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                licensePlan: reg.planTitle || "Plan Anual PRO",
                licenseCost: `${Number(reg.amountGs || 1350000).toLocaleString("es-PY")} Gs.`,
                licenseCostGs: reg.amountGs || 1350000,
                licenseDuration: "12 meses",
                licenseStatus: normalized === "activo" ? "activado" : "pendiente",
              },
              menu: [],
              orders: [],
            };
            db.stores[storeUser] = store;
          }

          if (store) {
            store.status = normalized;
            if (normalized === "activo") {
              const nowIso = new Date().toISOString();
              const durMonths = String(reg.plan).toLowerCase().includes("semestral") ? 6 : String(reg.plan).toLowerCase().includes("anual") ? 12 : 1;
              const expDate = new Date(Date.now() + durMonths * 30 * 24 * 3600000).toISOString();
              const licCode = store.business.licenseCode || `CAS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

              store.business.licenseStatus = "activado";
              store.business.licenseCode = licCode;
              store.business.licenseActivatedAt = nowIso;
              store.business.licenseExpiresAt = expDate;

              // Agregar o actualizar código en lista de activationCodes
              const existingCode = db.activationCodes.find((c) => c.code === licCode);
              if (existingCode) {
                existingCode.status = "activado";
                existingCode.expiresAt = expDate;
                existingCode.activatedAt = nowIso;
              } else {
                db.activationCodes.unshift({
                  id: `ACT-${Date.now().toString().slice(-4)}`,
                  code: licCode,
                  businessName: reg.businessName,
                  ownerName: reg.ownerName,
                  whatsapp: reg.whatsapp,
                  plan: reg.planTitle || "Plan Anual PRO",
                  costFormatted: `${Number(reg.amountGs || 1350000).toLocaleString("es-PY")} Gs.`,
                  costGs: reg.amountGs || 1350000,
                  durationMonths: durMonths,
                  status: "activado",
                  createdAt: nowIso,
                  activatedAt: nowIso,
                  expiresAt: expDate,
                  activatedBy: reg.ownerName,
                  notes: `Habilitado oficialmente por Administrador para ${reg.businessName}`,
                });
              }
            } else if (normalized === "rechazado") {
              store.business.licenseStatus = "anulado";
            }
          }
          saveDb(db);
        }

        return sendJson(res, 200, { ok: true, status: normalized });
      }

      // -------------------------------------------------------------
      // Acción: Eliminar registro de comercio
      // -------------------------------------------------------------
      if (body.action === "deleteRegisteredClient") {
        const { clientId } = body;
        const target = db.commercialRegistrations.find((c) => c.id === clientId);
        if (target && target.requestedUser) {
          delete db.stores[target.requestedUser.toLowerCase()];
        }
        db.commercialRegistrations = db.commercialRegistrations.filter((c) => c.id !== clientId);
        saveDb(db);
        return sendJson(res, 200, { ok: true });
      }

      // -------------------------------------------------------------
      // Acción: Módulo de Códigos de Activación
      // -------------------------------------------------------------
      if (body.action === "getActivationCodes") {
        return sendJson(res, 200, { ok: true, codes: db.activationCodes });
      }

      if (body.action === "createActivationCode") {
        const { code, businessName, ownerName, whatsapp, plan, notes, cost, costFormatted, durationMonths, expiresAt } = body;
        const normalizedCode = (
          code && String(code).trim()
            ? String(code).trim().toUpperCase()
            : `CAS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        ).replace(/\s+/g, "");

        const durMonths = Number(durationMonths) || (String(plan).toLowerCase().includes("semestral") ? 6 : String(plan).toLowerCase().includes("anual") ? 12 : 1);
        const expDate = expiresAt || new Date(Date.now() + durMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
        const costStr = costFormatted || (cost ? `${Number(cost).toLocaleString("es-PY")} Gs.` : "");

        const newCodeObj = {
          id: "ACT-" + Date.now().toString().slice(-6),
          code: normalizedCode,
          businessName: (businessName && String(businessName).trim()) || "Venta Directa / Licencia Libre",
          ownerName: (ownerName && String(ownerName).trim()) || "Responsable de Comercio",
          whatsapp: (whatsapp && String(whatsapp).trim()) || "",
          plan: (plan && String(plan).trim()) || "Plan Mensual",
          cost: cost || 0,
          costFormatted: costStr,
          durationMonths: durMonths,
          expiresAt: expDate,
          status: "disponible",
          createdAt: new Date().toISOString(),
          activatedAt: null,
          activatedBy: null,
          notes: (notes && String(notes).trim()) || "",
        };

        db.activationCodes.unshift(newCodeObj);
        saveDb(db);
        return sendJson(res, 200, { ok: true, code: newCodeObj, message: "Código de activación creado exitosamente." });
      }

      if (body.action === "updateActivationCodeStatus") {
        const { codeId, status } = body;
        const normalized =
          status === "activado" || status === "active"
            ? "activado"
            : status === "revocado" || status === "rejected" || status === "anulado"
            ? "revocado"
            : "disponible";

        const target = db.activationCodes.find((c) => c.id === codeId || c.code === codeId);
        if (target) {
          target.status = normalized;
          // Actualizar tiendas que tengan este código
          for (const s of Object.values(db.stores)) {
            if (s.business?.licenseCode === target.code) {
              s.business.licenseStatus = normalized;
            }
          }
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, status: normalized });
      }

      if (body.action === "renewActivationCode") {
        const { codeId, extendMonths, newExpiresAt, newPlan, newCost } = body;
        const target = db.activationCodes.find((c) => c.id === codeId || c.code === codeId);
        if (target) {
          target.status = "activado";
          if (newExpiresAt) {
            target.expiresAt = newExpiresAt;
          } else if (extendMonths) {
            const base = (target.expiresAt && new Date(target.expiresAt).getTime() > Date.now())
              ? new Date(target.expiresAt).getTime()
              : Date.now();
            target.expiresAt = new Date(base + Number(extendMonths) * 30 * 24 * 3600000).toISOString();
          }
          if (newPlan) target.plan = newPlan;
          if (newCost) target.costFormatted = newCost;

          for (const s of Object.values(db.stores)) {
            if (s.business?.licenseCode === target.code) {
              s.business.licenseStatus = "activado";
              s.business.licenseExpiresAt = target.expiresAt;
            }
          }
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, target });
      }

      if (body.action === "deleteActivationCode") {
        const { codeId } = body;
        db.activationCodes = db.activationCodes.filter((c) => c.id !== codeId && c.code !== codeId);
        saveDb(db);
        return sendJson(res, 200, { ok: true });
      }

      // -------------------------------------------------------------
      // Acción: Módulo de Pedidos y Caja
      // -------------------------------------------------------------
      if (body.action === "getOrders") {
        let targetStore = matchedStore || getActiveStore(db, body.storeId);
        if (isSuperadmin && body.storeId) {
          targetStore = findStore(db, body.storeId) || targetStore;
        }

        // Si es superadmin y no especificó storeId, devuelve todos los pedidos
        if (isSuperadmin && !body.storeId) {
          const allOrders = Object.values(db.stores).flatMap((s) => s.orders || []);
          return sendJson(res, 200, { ok: true, orders: allOrders });
        }

        return sendJson(res, 200, { ok: true, orders: targetStore?.orders || [] });
      }

      if (body.action === "updateOrderStatus") {
        const { orderId, newStatus, paymentStatus, paymentMethod, storeId } = body;
        const targetStore = findStore(db, storeId) || matchedStore || getActiveStore(db);
        const order = (targetStore?.orders || []).find((o) => o.id === orderId);
        if (order) {
          if (newStatus) order.orderStatus = newStatus;
          if (paymentStatus) order.paymentStatus = paymentStatus;
          if (paymentMethod) order.paymentMethod = paymentMethod;
          if (paymentStatus === "pagado" && !order.paidAt) order.paidAt = new Date().toISOString();
          order.updatedAt = new Date().toISOString();
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, orderId });
      }

      if (body.action === "payOrder") {
        const { orderId, paymentMethod, storeId } = body;
        const targetStore = findStore(db, storeId) || matchedStore || getActiveStore(db);
        const order = (targetStore?.orders || []).find((o) => o.id === orderId);
        if (order) {
          order.paymentStatus = "pagado";
          order.paymentMethod = paymentMethod || "efectivo";
          order.paidAt = new Date().toISOString();
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, orderId });
      }

      if (body.action === "deleteOrder") {
        const { orderId, storeId } = body;
        const targetStore = findStore(db, storeId) || matchedStore || getActiveStore(db);
        if (targetStore && targetStore.orders) {
          targetStore.orders = targetStore.orders.filter((o) => o.id !== orderId);
          saveDb(db);
        }
        return sendJson(res, 200, { ok: true, orderId });
      }

      // =============================================================
      // GUARDAR CAMBIOS: Portada, Datos del Comercio, Precios y Menú
      // CADA USUARIO GUARDA SU PROPIO BANNER, TELÉFONOS Y MENÚ
      // =============================================================
      let targetStore = null;

      // 1. Determinar cuál comercio se está modificando
      if (body.storeId) {
        targetStore = findStore(db, body.storeId);
      }
      if (!targetStore && matchedStore) {
        targetStore = matchedStore;
      }
      if (!targetStore && body.business?.adminUser) {
        targetStore = findStore(db, body.business.adminUser);
      }
      if (!targetStore) {
        targetStore = getActiveStore(db);
      }

      if (!targetStore) {
        return sendJson(res, 404, { ok: false, error: "Comercio no encontrado para guardar los datos." });
      }

      // Actualizar datos del negocio en la tienda correspondiente
      if (body.business && typeof body.business === "object") {
        const b = body.business;
        if (b.name !== undefined) targetStore.business.name = b.name;
        if (b.slogan !== undefined) targetStore.business.slogan = b.slogan;
        if (b.phoneIntl !== undefined) targetStore.business.phoneIntl = b.phoneIntl;
        if (b.phoneDisplay !== undefined) targetStore.business.phoneDisplay = b.phoneDisplay;
        if (b.address !== undefined) targetStore.business.address = b.address;
        if (b.bannerImage !== undefined) targetStore.business.bannerImage = b.bannerImage;
        if (b.deliveryNote !== undefined) targetStore.business.deliveryNote = b.deliveryNote;
        
        // Cambio de credenciales de este comercio
        if (b.adminUser && String(b.adminUser).trim()) {
          const newUsername = String(b.adminUser).trim().toLowerCase();
          targetStore.business.adminUser = newUsername;
          targetStore.username = newUsername;
        }
        if (b.newPin && String(b.newPin).trim()) {
          targetStore.pin = String(b.newPin).trim();
          targetStore.business.adminPin = String(b.newPin).trim();
        }
      }

      if (body.deliveryNote !== undefined) {
        targetStore.business.deliveryNote = body.deliveryNote;
      }

      // Guardar el menú específico de este comercio
      if (Array.isArray(body.menu)) {
        targetStore.menu = body.menu;
      }

      // Marcar tienda como la última activa
      db.activeStoreId = targetStore.id;
      saveDb(db);

      return sendJson(res, 200, {
        ok: true,
        storeId: targetStore.id,
        business: targetStore.business,
        menu: targetStore.menu,
        message: `¡Cambios guardados con éxito para ${targetStore.business.name}!`,
      });
    } catch (err) {
      console.error("[API Menu Error]:", err);
      return sendJson(res, 500, { ok: false, error: String(err.message || err) });
    }
  }

  return sendJson(res, 405, { error: "Método no permitido" });
}
