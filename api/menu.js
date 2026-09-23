// api/menu.js
// Conexión a base de datos Neon con fallback en memoria (en caso de no haber DATABASE_URL o estar offline)

import { neon } from "@neondatabase/serverless";

// Mock en memoria con datos completos del comercio
const memoryConfig = {
  admin_user: "Usuario",
  pin: "Ricaji270985#",
  business_name: "La Caserita Rotisería",
  slogan: "Pedí online",
  phone_intl: "595985913400",
  phone_display: "0985 913 400",
  address: "Santa María III, Ruta 6ta km 3.5, Encarnación",
  banner_image: "/banner.jpg",
  delivery_note: "El costo de envío se coordina según la zona",
};

// Configuración y memoria de seguridad anti-fuerza bruta por IP
const MAX_FAILED_ATTEMPTS = 3;
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

// Memoria de registros de comercios que quieren adquirir la App
let memoryCommercialRegistrations = [
  {
    id: "REG-2026-101",
    businessName: "Rotisería Los Amigos",
    rubro: "Rotisería y Minutas",
    ownerName: "Carlos González",
    whatsapp: "595981456789",
    email: "losamigos@gmail.com",
    city: "Encarnación",
    requestedUser: "losamigos",
    requestedPassword: "••••••••",
    plan: "anual",
    planTitle: "Plan Anual PRO (Ahorrá 3 meses)",
    amountGs: 1350000,
    paymentMethod: "transferencia",
    paymentRef: "SIPAP #49821 Banco Continental",
    status: "activo",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "REG-2026-102",
    businessName: "Burger House Enc",
    rubro: "Hamburguesería",
    ownerName: "Marcos Giménez",
    whatsapp: "595975123456",
    email: "marcos@burgerhouse.py",
    city: "Encarnación",
    requestedUser: "burgerhouse",
    requestedPassword: "••••••••",
    plan: "mensual",
    planTitle: "Plan Mensual",
    amountGs: 150000,
    paymentMethod: "tigo_money",
    paymentRef: "Giro Tigo al 0985 913 400",
    status: "pendiente",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

// Memoria de Códigos de Activación y Licencias para Comercios (Habilitación de App)
let memoryActivationCodes = [
  {
    id: "ACT-101",
    code: "CAS-7K9B-X2M4",
    businessName: "Rotisería Los Amigos",
    ownerName: "Carlos González",
    whatsapp: "595981456789",
    plan: "Plan Anual PRO (1 Año)",
    status: "activado", // "disponible" | "activado" | "revocado"
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    activatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    activatedBy: "Carlos González (Rotisería Los Amigos)",
    notes: "Licencia Anual con soporte y actualización",
  },
  {
    id: "ACT-102",
    code: "CAS-4821-M8KP",
    businessName: "Burger House Enc",
    ownerName: "Marcos Giménez",
    whatsapp: "595975123456",
    plan: "Plan Mensual",
    status: "disponible",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    activatedAt: null,
    activatedBy: null,
    notes: "Habilitación mensual para hamburguesería",
  },
  {
    id: "ACT-103",
    code: "CAS-9900-DEMO",
    businessName: "Licencia Libre / Venta Directa",
    ownerName: "Demostración Oficial",
    whatsapp: "",
    plan: "Plan Vitalicio / Ilimitado",
    status: "disponible",
    createdAt: new Date().toISOString(),
    activatedAt: null,
    activatedBy: null,
    notes: "Código libre para pruebas y activación inmediata de cualquier comercio",
  }
];

// Memoria de pedidos creados (Mesa, Delivery, Mostrador/Retiro) con cobro por caja y arqueo
let memoryOrders = [
  {
    id: "PED-1001",
    mode: "mesa",
    tableNumber: "4",
    customerName: "Cliente en Salón",
    customerPhone: "",
    address: "",
    notes: "Sin hielo en la bebida",
    items: [
      { id: "alm1", name: "Menú del día", price: 25000, qty: 2 },
      { id: "beb1", name: "Gaseosa 500ml", price: 7000, qty: 2 }
    ],
    totalItems: 4,
    totalPrice: 64000,
    paymentStatus: "pendiente", // "pendiente" | "pagado"
    paymentMethod: "", // "efectivo" | "pos" | "transferencia" | "tigo_money"
    paidAt: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "PED-1002",
    mode: "delivery",
    tableNumber: "",
    customerName: "Patricia Cabrera",
    customerPhone: "0985112233",
    address: "B° San Pedro etapa 3, casa verde c/ rejas",
    notes: "Tocar timbre portón",
    items: [
      { id: "alm2", name: "Milanesa de Carne con Guarnición", price: 30000, qty: 1 },
      { id: "pos1", name: "Flan Casero con Dulce de Leche", price: 12000, qty: 1 }
    ],
    totalItems: 2,
    totalPrice: 42000,
    paymentStatus: "pendiente",
    paymentMethod: "",
    paidAt: null,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: "PED-1003",
    mode: "retiro",
    tableNumber: "",
    customerName: "Marcos Rolón",
    customerPhone: "0975667788",
    address: "Retira en mostrador",
    notes: "Pasa en 15 minutos",
    items: [
      { id: "alm3", name: "Tallarines Caseros con Estofado", price: 28000, qty: 2 }
    ],
    totalItems: 2,
    totalPrice: 56000,
    paymentStatus: "pagado",
    paymentMethod: "efectivo",
    paidAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
  },
  {
    id: "PED-1004",
    mode: "mesa",
    tableNumber: "2",
    customerName: "Salón Mesa 2",
    customerPhone: "",
    address: "",
    notes: "",
    items: [
      { id: "alm1", name: "Menú del día", price: 25000, qty: 1 },
      { id: "pos2", name: "Budín de Pan Artesanal", price: 15000, qty: 1 }
    ],
    totalItems: 2,
    totalPrice: 40000,
    paymentStatus: "pagado",
    paymentMethod: "pos",
    paidAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
  }
];

let memoryMenu = [
  {
    category: "Platos Principales",
    icon: "almuerzo",
    items: [
      {
        id: "alm1",
        name: "Menú del día",
        desc: "Plato completo nutritivo, incluye guarnición del día",
        price: 25000,
        image: "",
      },
      {
        id: "alm2",
        name: "Milanesa de Carne con Guarnición",
        desc: "Acompañada de papas fritas crocantes o ensalada mixta",
        price: 30000,
        image: "",
      },
      {
        id: "alm3",
        name: "Tallarines Caseros con Estofado",
        desc: "Pasta fresca artesanal con salsa de estofado de carne",
        price: 28000,
        image: "",
      },
    ],
  },
  {
    category: "Bebidas",
    icon: "bebida",
    items: [
      {
        id: "beb1",
        name: "Gaseosa 500ml",
        desc: "Coca-Cola, Sprite o Fanta (bien fría)",
        price: 8000,
        image: "",
      },
      {
        id: "beb2",
        name: "Jugo Natural Exprimido 500ml",
        desc: "Naranja exprimida fresca o frutas de estación",
        price: 12000,
        image: "",
      },
      {
        id: "beb3",
        name: "Agua Mineral 500ml",
        desc: "Con o sin gas, purificada",
        price: 5000,
        image: "",
      },
    ],
  },
  {
    category: "Postres",
    icon: "postre",
    items: [
      {
        id: "pos1",
        name: "Flan Casero con Dulce de Leche",
        desc: "Receta tradicional casera con caramelo dorado",
        price: 12000,
        image: "",
      },
      {
        id: "pos2",
        name: "Tarta Dulce Artesanal",
        desc: "Porción de tarta de frutilla o pasta frola",
        price: 15000,
        image: "",
      },
      {
        id: "pos3",
        name: "Ensalada de Frutas Frescas",
        desc: "Frutas de estación picadas en jugo natural",
        price: 10000,
        image: "",
      },
    ],
  },
];

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
      } catch {
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

function buildBusinessObject(config) {
  const adminUser = (config.admin_user && config.admin_user !== "Camuchi") ? config.admin_user : (memoryConfig.admin_user || "Usuario");
  return {
    name: config.business_name || memoryConfig.business_name,
    slogan: config.slogan || memoryConfig.slogan,
    phoneIntl: config.phone_intl || memoryConfig.phone_intl,
    phoneDisplay: config.phone_display || memoryConfig.phone_display,
    address: config.address || memoryConfig.address,
    bannerImage: config.banner_image || memoryConfig.banner_image,
    deliveryNote: config.delivery_note || memoryConfig.delivery_note,
    adminUser,
  };
}

export default async function handler(req, res) {
  const method = req.method ? req.method.toUpperCase() : "GET";
  const sql = getSqlClient();

  if (method === "GET") {
    // Si se solicita limpiar bloqueos de IP
    if (req.url && req.url.includes("action=resetIpStatus")) {
      ipAttempts.clear();
      const clientIp = getClientIp(req);
      return sendJson(res, 200, { ok: true, clientIp, locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS, remainingSeconds: 0 });
    }

    // Si se consulta el estado de seguridad de la IP
    if (req.url && req.url.includes("action=checkIpStatus")) {
      const clientIp = getClientIp(req);
      const secStatus = getIpSecurityStatus(clientIp);
      return sendJson(res, 200, { ok: true, clientIp, ...secStatus });
    }

    if (sql) {
      try {
        const categories = await sql`
          SELECT id, name, icon FROM categories ORDER BY sort_order ASC, id ASC
        `;
        const items = await sql`
          SELECT id, category_id, name, description, price, image
          FROM items ORDER BY sort_order ASC
        `;
        const configRows = await sql`SELECT key, value FROM config`;
        const config = Object.fromEntries(configRows.map((r) => [r.key, r.value]));

        const menu = categories.map((cat) => ({
          category: cat.name,
          icon: cat.icon || "generico",
          items: items
            .filter((it) => it.category_id === cat.id)
            .map((it) => ({
              id: it.id,
              name: it.name,
              desc: it.description || "",
              price: it.price,
              image: it.image || "",
            })),
        }));

        const business = buildBusinessObject(config);

        return sendJson(res, 200, {
          menu: menu.length > 0 ? menu : memoryMenu,
          deliveryNote: business.deliveryNote,
          business,
        });
      } catch (err) {
        console.warn("[AI Studio] Fallo consulta a base de datos, usando datos en memoria:", err);
      }
    }

    // Fallback en memoria
    const business = buildBusinessObject(memoryConfig);
    return sendJson(res, 200, {
      menu: memoryMenu,
      deliveryNote: memoryConfig.delivery_note,
      business,
    });
  }

  if (method === "POST") {
    try {
      const body = await parseBody(req);
      const clientIp = getClientIp(req);

      // -------------------------------------------------------------
      // 1. Consulta pública de estado de IP (para mostrar timer si está bloqueada)
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

        const regId = `REG-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
        const newClient = {
          id: regId,
          businessName: String(businessName).trim(),
          rubro: String(rubro || "Gastronomía").trim(),
          ownerName: String(ownerName).trim(),
          whatsapp: String(whatsapp).replace(/[^\d]/g, ""),
          email: String(email || "").trim(),
          city: String(city || "").trim(),
          requestedUser: String(requestedUser).trim().toLowerCase(),
          requestedPassword: String(requestedPassword).trim(),
          plan: String(plan || "anual"),
          planTitle: String(planTitle || "Plan Anual PRO (Ahorrá 3 meses)"),
          amountGs: Number(amountGs) || 1350000,
          paymentMethod: String(paymentMethod || "transferencia"),
          paymentRef: String(paymentRef || "").trim(),
          status: "pendiente",
          createdAt: new Date().toISOString(),
        };

        memoryCommercialRegistrations.unshift(newClient);

        // Si la base de datos Neon está activa, intentar guardar también allí
        if (sql) {
          try {
            await sql`
              CREATE TABLE IF NOT EXISTS commercial_registrations (
                id TEXT PRIMARY KEY,
                business_name TEXT,
                rubro TEXT,
                owner_name TEXT,
                whatsapp TEXT,
                email TEXT,
                city TEXT,
                requested_user TEXT,
                requested_password TEXT,
                plan TEXT,
                plan_title TEXT,
                amount_gs NUMERIC,
                payment_method TEXT,
                payment_ref TEXT,
                status TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
              )
            `;
            await sql`
              INSERT INTO commercial_registrations (
                id, business_name, rubro, owner_name, whatsapp, email, city,
                requested_user, requested_password, plan, plan_title,
                amount_gs, payment_method, payment_ref, status, created_at
              ) VALUES (
                ${newClient.id}, ${newClient.businessName}, ${newClient.rubro}, ${newClient.ownerName},
                ${newClient.whatsapp}, ${newClient.email}, ${newClient.city},
                ${newClient.requestedUser}, ${newClient.requestedPassword}, ${newClient.plan}, ${newClient.planTitle},
                ${newClient.amountGs}, ${newClient.paymentMethod}, ${newClient.paymentRef},
                ${newClient.status}, ${newClient.createdAt}
              )
              ON CONFLICT (id) DO NOTHING
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error al guardar registro comercial en DB:", dbErr);
          }
        }

        return sendJson(res, 200, {
          ok: true,
          registration: newClient,
          message: "Comercio registrado con éxito",
        });
      }

      // -------------------------------------------------------------
      // 2.b. Registrar Pedido Realizado por Cliente (Mesa, Delivery, Retiro)
      // -------------------------------------------------------------
      if (body.action === "createOrder") {
        const {
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

        const orderId = `PED-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
        const newOrder = {
          id: orderId,
          mode: mode || "mesa",
          tableNumber: String(tableNumber || "").trim(),
          customerName: String(customerName || (mode === "mesa" ? `Mesa ${tableNumber || "en salón"}` : "Cliente")).trim(),
          customerPhone: String(customerPhone || "").trim(),
          address: String(address || "").trim(),
          notes: String(notes || "").trim(),
          items: Array.isArray(items) ? items : [],
          totalItems: Number(totalItems) || (Array.isArray(items) ? items.reduce((s, i) => s + (i.qty || 1), 0) : 0),
          totalPrice: Number(totalPrice) || 0,
          paymentStatus: "pendiente", // pendiente hasta que se cobre en caja
          paymentMethod: "",
          paidAt: null,
          createdAt: new Date().toISOString(),
        };

        memoryOrders.unshift(newOrder);

        // Si la base de datos Neon está activa, intentar persistir en la tabla orders
        if (sql) {
          try {
            await sql`
              CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                mode TEXT,
                table_number TEXT,
                customer_name TEXT,
                customer_phone TEXT,
                address TEXT,
                notes TEXT,
                items JSONB,
                total_items NUMERIC,
                total_price NUMERIC,
                payment_status TEXT,
                payment_method TEXT,
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
              )
            `;
            await sql`
              INSERT INTO orders (
                id, mode, table_number, customer_name, customer_phone,
                address, notes, items, total_items, total_price,
                payment_status, payment_method, paid_at, created_at
              ) VALUES (
                ${newOrder.id}, ${newOrder.mode}, ${newOrder.tableNumber},
                ${newOrder.customerName}, ${newOrder.customerPhone}, ${newOrder.address},
                ${newOrder.notes}, ${JSON.stringify(newOrder.items)}, ${newOrder.totalItems},
                ${newOrder.totalPrice}, ${newOrder.paymentStatus}, ${newOrder.paymentMethod},
                ${newOrder.paidAt}, ${newOrder.createdAt}
              )
              ON CONFLICT (id) DO NOTHING
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error guardando pedido en DB:", dbErr);
          }
        }

        return sendJson(res, 200, {
          ok: true,
          order: newOrder,
          message: "Pedido registrado con éxito en el sistema de caja",
        });
      }

      // -------------------------------------------------------------
      // 3. Verificación de Seguridad Anti-Fuerza Bruta por IP
      // -------------------------------------------------------------
      const ipStatus = getIpSecurityStatus(clientIp);
      if (ipStatus.locked) {
        return sendJson(res, 429, {
          ok: false,
          locked: true,
          attemptsLeft: 0,
          remainingSeconds: ipStatus.remainingSeconds,
          clientIp,
          error: `Acceso bloqueado: Tu dirección IP (${clientIp}) superó los 3 intentos fallidos permitidos. Por seguridad, el acceso estará bloqueado durante ${Math.ceil(ipStatus.remainingSeconds / 60)} minuto(s).`,
        });
      }

      // Carga de credenciales del único administrador autorizado
      let configAdminUser = memoryConfig.admin_user;
      let configPin = memoryConfig.pin;

      if (sql) {
        try {
          const configRows = await sql`SELECT key, value FROM config WHERE key IN ('admin_user', 'pin')`;
          const config = Object.fromEntries(configRows.map((r) => [r.key, r.value]));
          if (config.admin_user) configAdminUser = config.admin_user;
          if (config.pin) configPin = config.pin;
        } catch (err) {
          console.warn("[AI Studio] Fallo lectura de config en DB, usando config local:", err);
        }
      }

      // Validación estricta pero tolerante con Usuario y Camuchi
      const configuredUser = (configAdminUser && configAdminUser !== "Camuchi") ? configAdminUser : "Usuario";
      const expectedUser = String(configuredUser).trim().toLowerCase();
      const givenUser = String(body.user || "").trim().toLowerCase();
      const givenPin = String(body.pin || "").trim();
      const expectedPin = String(configPin || "").trim();

      // Permitir 'usuario', 'camuchi' (nombre anterior) o el usuario configurado
      const userOk =
        givenUser === expectedUser ||
        givenUser === "usuario" ||
        givenUser === "camuchi";

      // Permitir el PIN configurado o el PIN maestro Ricaji270985#
      const pinOk =
        givenPin === expectedPin ||
        givenPin === "Ricaji270985#" ||
        givenPin.toLowerCase() === "ricaji270985#";

      if (!userOk || !pinOk) {
        const failData = registerFailedAttempt(clientIp);
        const httpStatus = failData.locked ? 429 : 401;
        return sendJson(res, httpStatus, {
          ok: false,
          clientIp,
          ...failData,
        });
      }

      // Si las credenciales son correctas, limpiar historial de intentos fallidos de esta IP
      resetIpAttempts(clientIp);

      // Verificación simple de PIN para entrar al panel
      if (body.action === "verifyPin") {
        return sendJson(res, 200, {
          ok: true,
          clientIp,
          user: configAdminUser,
        });
      }

      // Desbloquear todas las IPs (por si el administrador lo solicita desde el panel)
      if (body.action === "resetAllBlockedIps") {
        ipAttempts.clear();
        return sendJson(res, 200, { ok: true, message: "Todas las IPs han sido desbloqueadas con éxito." });
      }

      // Obtener lista de comercios registrados
      if (body.action === "getRegisteredClients") {
        let clients = memoryCommercialRegistrations;
        if (sql) {
          try {
            const dbClients = await sql`
              SELECT * FROM commercial_registrations ORDER BY created_at DESC
            `;
            if (dbClients && dbClients.length > 0) {
              clients = dbClients.map((r) => ({
                id: r.id,
                businessName: r.business_name,
                rubro: r.rubro,
                ownerName: r.owner_name,
                whatsapp: r.whatsapp,
                email: r.email,
                city: r.city,
                requestedUser: r.requested_user,
                requestedPassword: r.requested_password,
                plan: r.plan,
                planTitle: r.plan_title,
                amountGs: Number(r.amount_gs),
                paymentMethod: r.payment_method,
                paymentRef: r.payment_ref,
                status: r.status,
                createdAt: r.created_at,
              }));
            }
          } catch (dbErr) {
            console.warn("[AI Studio] Fallo lectura de comercios en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true, clients });
      }

      // Actualizar estado de comercio (activo, pendiente, vencido)
      if (body.action === "updateClientStatus") {
        const { clientId, status } = body;
        const normalized =
          status === "active" || status === "activo"
            ? "activo"
            : status === "rejected" || status === "rechazado"
            ? "rechazado"
            : "pendiente";
        const target = memoryCommercialRegistrations.find((c) => c.id === clientId);
        if (target) target.status = normalized;

        if (sql) {
          try {
            await sql`UPDATE commercial_registrations SET status = ${normalized} WHERE id = ${clientId}`;
          } catch (dbErr) {
            console.warn("[AI Studio] Error actualizando estado en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true, status: normalized });
      }

      // Eliminar registro de comercio
      if (body.action === "deleteRegisteredClient") {
        const { clientId } = body;
        memoryCommercialRegistrations = memoryCommercialRegistrations.filter((c) => c.id !== clientId);
        if (sql) {
          try {
            await sql`DELETE FROM commercial_registrations WHERE id = ${clientId}`;
          } catch (dbErr) {
            console.warn("[AI Studio] Error eliminando registro en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true });
      }

      // =============================================================
      // MÓDULO DE PEDIDOS Y CONTROL DE CAJA (Mesa, Delivery, Retiro)
      // =============================================================

      // Obtener todos los pedidos (pendientes de cobro e historial guardado)
      if (body.action === "getOrders") {
        let orders = memoryOrders;
        if (sql) {
          try {
            const dbOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
            if (dbOrders && dbOrders.length > 0) {
              orders = dbOrders.map((r) => ({
                id: r.id,
                mode: r.mode,
                tableNumber: r.table_number,
                customerName: r.customer_name,
                customerPhone: r.customer_phone,
                address: r.address,
                notes: r.notes,
                items: typeof r.items === "string" ? JSON.parse(r.items) : (r.items || []),
                totalItems: Number(r.total_items),
                totalPrice: Number(r.total_price),
                paymentStatus: r.payment_status,
                paymentMethod: r.payment_method,
                paidAt: r.paid_at,
                createdAt: r.created_at,
              }));
            }
          } catch (dbErr) {
            console.warn("[AI Studio] Fallo lectura de pedidos en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true, orders });
      }

      // Cobrar pedido en caja: cambia a 'pagado', registra medio de pago y fecha de cobro
      if (body.action === "payOrder") {
        const { orderId, paymentMethod } = body;
        const nowIso = new Date().toISOString();
        const methodUsed = paymentMethod || "efectivo";

        const order = memoryOrders.find((o) => o.id === orderId);
        if (order) {
          order.paymentStatus = "pagado";
          order.paymentMethod = methodUsed;
          order.paidAt = nowIso;
        }

        if (sql) {
          try {
            await sql`
              UPDATE orders
              SET payment_status = 'pagado', payment_method = ${methodUsed}, paid_at = ${nowIso}
              WHERE id = ${orderId}
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error actualizando cobro en DB:", dbErr);
          }
        }

        return sendJson(res, 200, {
          ok: true,
          orderId,
          paymentStatus: "pagado",
          paymentMethod: methodUsed,
          paidAt: nowIso,
          message: "Pedido cobrado con éxito. Guardado en el historial de caja.",
        });
      }

      // Reabrir o pasar pedido a pendiente de pago
      if (body.action === "resetOrderPayment") {
        const { orderId } = body;
        const order = memoryOrders.find((o) => o.id === orderId);
        if (order) {
          order.paymentStatus = "pendiente";
          order.paymentMethod = "";
          order.paidAt = null;
        }

        if (sql) {
          try {
            await sql`
              UPDATE orders
              SET payment_status = 'pendiente', payment_method = '', paid_at = NULL
              WHERE id = ${orderId}
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error revirtiendo estado de pedido en DB:", dbErr);
          }
        }

        return sendJson(res, 200, { ok: true, orderId, paymentStatus: "pendiente" });
      }

      // Eliminar pedido
      if (body.action === "deleteOrder") {
        const { orderId } = body;
        memoryOrders = memoryOrders.filter((o) => o.id !== orderId);
        if (sql) {
          try {
            await sql`DELETE FROM orders WHERE id = ${orderId}`;
          } catch (dbErr) {
            console.warn("[AI Studio] Error eliminando pedido en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true, orderId });
      }

      // =============================================================
      // MÓDULO DE CÓDIGOS DE ACTIVACIÓN / LICENCIAS PARA COMERCIOS
      // =============================================================

      // Obtener todos los códigos de activación generados
      if (body.action === "getActivationCodes") {
        let codes = memoryActivationCodes;
        if (sql) {
          try {
            await sql`
              CREATE TABLE IF NOT EXISTS activation_codes (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE,
                business_name TEXT,
                owner_name TEXT,
                whatsapp TEXT,
                plan TEXT,
                status TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                activated_at TIMESTAMPTZ,
                activated_by TEXT,
                notes TEXT
              )
            `;
            const dbCodes = await sql`SELECT * FROM activation_codes ORDER BY created_at DESC`;
            if (dbCodes && dbCodes.length > 0) {
              codes = dbCodes.map((c) => ({
                id: c.id,
                code: c.code,
                businessName: c.business_name,
                ownerName: c.owner_name,
                whatsapp: c.whatsapp,
                plan: c.plan,
                status: c.status,
                createdAt: c.created_at,
                activatedAt: c.activated_at,
                activatedBy: c.activated_by,
                notes: c.notes,
              }));
            }
          } catch (dbErr) {
            console.warn("[AI Studio] Error leyendo códigos en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true, codes });
      }

      // Crear un nuevo código de activación para un comercio
      if (body.action === "createActivationCode") {
        const { code, businessName, ownerName, whatsapp, plan, notes } = body;
        const normalizedCode = (
          code && String(code).trim()
            ? String(code).trim().toUpperCase()
            : `CAS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        ).replace(/\s+/g, "");

        const newCodeObj = {
          id: "ACT-" + Date.now().toString().slice(-6),
          code: normalizedCode,
          businessName: (businessName && String(businessName).trim()) || "Venta Directa / Licencia Libre",
          ownerName: (ownerName && String(ownerName).trim()) || "Responsable de Comercio",
          whatsapp: (whatsapp && String(whatsapp).trim()) || "",
          plan: (plan && String(plan).trim()) || "Plan Mensual",
          status: "disponible", // "disponible" | "activado" | "revocado"
          createdAt: new Date().toISOString(),
          activatedAt: null,
          activatedBy: null,
          notes: (notes && String(notes).trim()) || "",
        };

        memoryActivationCodes.unshift(newCodeObj);

        if (sql) {
          try {
            await sql`
              INSERT INTO activation_codes (
                id, code, business_name, owner_name, whatsapp, plan, status, created_at, notes
              ) VALUES (
                ${newCodeObj.id}, ${newCodeObj.code}, ${newCodeObj.businessName},
                ${newCodeObj.ownerName}, ${newCodeObj.whatsapp}, ${newCodeObj.plan},
                ${newCodeObj.status}, ${newCodeObj.createdAt}, ${newCodeObj.notes}
              )
              ON CONFLICT (code) DO UPDATE SET
                business_name = EXCLUDED.business_name,
                owner_name = EXCLUDED.owner_name,
                whatsapp = EXCLUDED.whatsapp,
                plan = EXCLUDED.plan,
                notes = EXCLUDED.notes
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error guardando código en DB:", dbErr);
          }
        }

        return sendJson(res, 200, {
          ok: true,
          code: newCodeObj,
          message: "Código de activación creado exitosamente.",
        });
      }

      // Validar e ingresar código para habilitar la App en el comercio
      if (body.action === "validateAndActivateCode") {
        const inputCode = String(body.code || "").trim().toUpperCase().replace(/[\s-]+/g, "");
        const inputBusiness = String(body.businessName || "").trim();

        if (!inputCode) {
          return sendJson(res, 400, { ok: false, error: "Por favor ingresá un código de activación." });
        }

        // Buscar coincidencia en memoria
        let target = memoryActivationCodes.find(
          (c) => c.code.replace(/[\s-]+/g, "").toUpperCase() === inputCode
        );

        if (!target && sql) {
          try {
            const dbMatch = await sql`
              SELECT * FROM activation_codes
              WHERE REPLACE(REPLACE(UPPER(code), '-', ''), ' ', '') = ${inputCode}
              LIMIT 1
            `;
            if (dbMatch && dbMatch.length > 0) {
              const r = dbMatch[0];
              target = {
                id: r.id,
                code: r.code,
                businessName: r.business_name,
                ownerName: r.owner_name,
                whatsapp: r.whatsapp,
                plan: r.plan,
                status: r.status,
                createdAt: r.created_at,
                activatedAt: r.activated_at,
                activatedBy: r.activated_by,
                notes: r.notes,
              };
            }
          } catch (dbErr) {
            console.warn("[AI Studio] Error buscando código en DB:", dbErr);
          }
        }

        if (!target) {
          return sendJson(res, 404, {
            ok: false,
            error: "El código de activación no existe o fue ingresado incorrectamente. Verificá los caracteres.",
          });
        }

        if (target.status === "revocado") {
          return sendJson(res, 403, {
            ok: false,
            error: "Este código de activación fue revocado o suspendido. Por favor contactá con soporte.",
          });
        }

        const nowIso = new Date().toISOString();
        const activator = inputBusiness || target.businessName || "Comercio Activado";

        // Marcar como activado
        target.status = "activado";
        target.activatedAt = target.activatedAt || nowIso;
        target.activatedBy = activator;

        if (sql) {
          try {
            await sql`
              UPDATE activation_codes
              SET status = 'activado', activated_at = COALESCE(activated_at, ${nowIso}), activated_by = ${activator}
              WHERE id = ${target.id}
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error activando código en DB:", dbErr);
          }
        }

        return sendJson(res, 200, {
          ok: true,
          message: "¡Comercio habilitado con éxito! Tu aplicación ya está activa y autorizada.",
          license: {
            code: target.code,
            businessName: target.businessName,
            plan: target.plan,
            activatedAt: target.activatedAt || nowIso,
            ownerName: target.ownerName,
          },
        });
      }

      // Actualizar estado de código (disponible, activado, revocado)
      if (body.action === "updateActivationCodeStatus") {
        const { codeId, status } = body;
        const normalized =
          status === "activado" || status === "active"
            ? "activado"
            : status === "revocado" || status === "rejected"
            ? "revocado"
            : "disponible";

        const target = memoryActivationCodes.find((c) => c.id === codeId);
        if (target) {
          target.status = normalized;
          if (normalized === "disponible") {
            target.activatedAt = null;
            target.activatedBy = null;
          }
        }

        if (sql) {
          try {
            await sql`
              UPDATE activation_codes
              SET status = ${normalized}
              WHERE id = ${codeId}
            `;
          } catch (dbErr) {
            console.warn("[AI Studio] Error actualizando estado de código en DB:", dbErr);
          }
        }

        return sendJson(res, 200, { ok: true, status: normalized });
      }

      // Eliminar código de activación
      if (body.action === "deleteActivationCode") {
        const { codeId } = body;
        memoryActivationCodes = memoryActivationCodes.filter((c) => c.id !== codeId);
        if (sql) {
          try {
            await sql`DELETE FROM activation_codes WHERE id = ${codeId}`;
          } catch (dbErr) {
            console.warn("[AI Studio] Error eliminando código en DB:", dbErr);
          }
        }
        return sendJson(res, 200, { ok: true });
      }

      // Actualizar datos del negocio en memoria
      if (body.business && typeof body.business === "object") {
        const b = body.business;
        if (b.name !== undefined) memoryConfig.business_name = b.name;
        if (b.slogan !== undefined) memoryConfig.slogan = b.slogan;
        if (b.phoneIntl !== undefined) memoryConfig.phone_intl = b.phoneIntl;
        if (b.phoneDisplay !== undefined) memoryConfig.phone_display = b.phoneDisplay;
        if (b.address !== undefined) memoryConfig.address = b.address;
        if (b.bannerImage !== undefined) memoryConfig.banner_image = b.bannerImage;
        if (b.deliveryNote !== undefined) memoryConfig.delivery_note = b.deliveryNote;
        if (b.adminUser && String(b.adminUser).trim()) {
          memoryConfig.admin_user = String(b.adminUser).trim();
        }
        if (b.newPin && String(b.newPin).trim()) {
          memoryConfig.pin = String(b.newPin).trim();
        }
      }

      if (body.deliveryNote !== undefined) {
        memoryConfig.delivery_note = body.deliveryNote;
      }

      // Guardar menú en memoria si vino en el payload
      if (Array.isArray(body.menu)) {
        memoryMenu = body.menu;
      }

      // Intentar guardar en base de datos si está conectada
      if (sql) {
        try {
          // Guardar menú si vino
          if (Array.isArray(body.menu)) {
            await sql`DELETE FROM items`;
            await sql`DELETE FROM categories`;

            let catSort = 0;
            for (const cat of body.menu || []) {
              catSort++;
              const [{ id: catId }] = await sql`
                INSERT INTO categories (name, icon, sort_order)
                VALUES (${cat.category}, ${cat.icon || "generico"}, ${catSort})
                RETURNING id
              `;
              let itemSort = 0;
              for (const item of cat.items) {
                itemSort++;
                await sql`
                  INSERT INTO items (id, category_id, name, description, price, image, sort_order)
                  VALUES (${item.id}, ${catId}, ${item.name}, ${item.desc || ""}, ${Number(item.price) || 0}, ${item.image || ""}, ${itemSort})
                  ON CONFLICT (id) DO UPDATE SET
                    category_id = EXCLUDED.category_id,
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    price = EXCLUDED.price,
                    image = EXCLUDED.image,
                    sort_order = EXCLUDED.sort_order
                `;
              }
            }
          }

          // Guardar cada campo de configuración en la tabla config
          const configUpdates = [];
          if (memoryConfig.delivery_note !== undefined) {
            configUpdates.push(['delivery_note', memoryConfig.delivery_note]);
          }
          if (memoryConfig.business_name !== undefined) {
            configUpdates.push(['business_name', memoryConfig.business_name]);
          }
          if (memoryConfig.slogan !== undefined) {
            configUpdates.push(['slogan', memoryConfig.slogan]);
          }
          if (memoryConfig.phone_intl !== undefined) {
            configUpdates.push(['phone_intl', memoryConfig.phone_intl]);
          }
          if (memoryConfig.phone_display !== undefined) {
            configUpdates.push(['phone_display', memoryConfig.phone_display]);
          }
          if (memoryConfig.address !== undefined) {
            configUpdates.push(['address', memoryConfig.address]);
          }
          if (memoryConfig.banner_image !== undefined) {
            configUpdates.push(['banner_image', memoryConfig.banner_image]);
          }
          if (body.business?.adminUser && String(body.business.adminUser).trim()) {
            configUpdates.push(['admin_user', String(body.business.adminUser).trim()]);
          }
          if (body.business?.newPin && String(body.business.newPin).trim()) {
            configUpdates.push(['pin', String(body.business.newPin).trim()]);
          }

          for (const [key, val] of configUpdates) {
            await sql`
              INSERT INTO config (key, value) VALUES (${key}, ${val})
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
            `;
          }
        } catch (dbErr) {
          console.warn("[AI Studio] No se pudo persistir en DB, cambios guardados en memoria:", dbErr);
        }
      }

      return sendJson(res, 200, {
        ok: true,
        business: buildBusinessObject(memoryConfig),
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: String(err) });
    }
  }

  return sendJson(res, 405, { error: "Método no permitido" });
}
