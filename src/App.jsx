import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart, Plus, Minus, X, MapPin, Store, Send, Trash2,
  Settings, Lock, Save, ArrowLeft, LoaderCircle, Navigation,
  CheckCircle2, Image as ImageIcon,
} from "lucide-react";

/* =========================================================================
   CONFIGURACIÓN
   ========================================================================= */

const SHEETS_API_URL = "/api/menu"; 

const PHONE_INTL = "595985913400";
const PHONE_DISPLAY = "0985 913 400";
const ADDRESS = "Santa María III, Ruta 6ta km 3.5, Encarnación";

/* ========================================================================= */

const BRAND = {
  charcoal: "#2A2018",
  paper: "#F0E2BF",
  paperDark: "#E6D2A3",
  tomato: "#C1392B",
  tomatoDark: "#9E2C20",
  mustard: "#E3A23B",
  green: "#45603C",
  cream: "#FBF2DD",
};

const DEFAULT_MENU = [
  {
    category: "Almuerzos",
    items: [{ id: "alm1", name: "Menú del día", desc: "Plato completo, varía según el día", price: 25000, image: "" }],
  },
];
const DEFAULT_DELIVERY_NOTE = "El costo de envío se coordina según la zona";

function formatGs(n) {
  return "₲ " + Number(n || 0).toLocaleString("es-PY");
}
function formatPriceInput(price) {
  if (price === "" || price === null || price === undefined) return "";
  return Number(price).toLocaleString("es-PY") + " Gs.";
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const ICON_PATHS = {
  almuerzo: "M12 2a1 1 0 011 1v6.06A5 5 0 0119 14a1 1 0 01-1 1H6a1 1 0 01-1-1 5 5 0 016-4.94V3a1 1 0 011-1zM4 18a1 1 0 011-1h14a1 1 0 011 1 3 3 0 01-3 3H7a3 3 0 01-3-3z",
  minuta: "M8 8V3a1 1 0 012 0v5h1V4a1 1 0 012 0v4h1V3a1 1 0 012 0v5l-1 12a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  sandwich: "M3 11l9-7 9 7v2H3zM4 15h16v2a3 3 0 01-3 3H7a3 3 0 01-3-3zM3 14h18v-1H3z",
  empanada: "M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-4.5 9.5c1 .8 2 1.6 3 .8s1-1.6 2-.8 2 1.6 3 .8",
  hamburguesa: "M4 10c0-3 3.5-6 8-6s8 3 8 6zM3 11h18v2H3zM4 15h16v1a3 3 0 01-3 3H7a3 3 0 01-3-3zM3 13.2h18v.6H3z",
  pizza: "M12 2L22 20H2z",
  bebida: "M8 2h8l-1 18a2 2 0 01-2 2h-2a2 2 0 01-2-2zM7 8h10v2H7z",
  postre: "M6 20a4 4 0 004-4H6zm4-4a4 4 0 004 4 4 4 0 004-4zM10 4a2 2 0 114 0c0 1-.5 1.6-1 2h-2c-.5-.4-1-1-1-2zM11 8h2v8h-2z",
  cafe: "M4 4h13v9a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 6h1a3 3 0 013 3 3 3 0 01-3 3h-1V6z",
  pollo: "M12 3c3 0 5 2 5 5 0 2-1 3-2 4l3 8-3 1-2-6-1 .3V21h-2v-5.7l-1-.3-2 6-3-1 3-8c-1-1-2-2-2-4 0-3 2-5 5-5z",
  ensalada: "M4 12a8 8 0 1116 0zM6 14h12l-1 3a2 2 0 01-2 2H9a2 2 0 01-2-2z",
  generico: "M6 2a1 1 0 011 1v6a2 2 0 001 1.7V22a1 1 0 01-2 0v-11.3A2 2 0 015 9V3a1 1 0 011-1zm4 0a1 1 0 011 1v6a2 2 0 01-1 1.7V22a1 1 0 01-2 0V10.7A2 2 0 019 9V3a1 1 0 011-1zm8 1v8a3 3 0 01-2 2.8V22a1 1 0 01-2 0V3.8a3 3 0 012-2.8z",
};

const ICON_OPTIONS = [
  { key: "almuerzo", label: "Almuerzo" },
  { key: "minuta", label: "Minuta / papas" },
  { key: "sandwich", label: "Sandwich" },
  { key: "empanada", label: "Empanada" },
  { key: "hamburguesa", label: "Hamburguesa" },
  { key: "pizza", label: "Pizza" },
  { key: "bebida", label: "Bebida" },
  { key: "postre", label: "Postre" },
  { key: "cafe", label: "Café / desayuno" },
  { key: "pollo", label: "Pollo / asado" },
  { key: "ensalada", label: "Ensalada" },
  { key: "generico", label: "Genérico" },
];

function guessIconKey(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("almuerzo") || n.includes("menú") || n.includes("menu") || n.includes("plato")) return "almuerzo";
  if (n.includes("minuta") || n.includes("papa") || n.includes("frita")) return "minuta";
  if (n.includes("sandwich") || n.includes("miga") || n.includes("milanesa") || n.includes("panch")) return "sandwich";
  if (n.includes("empanada")) return "empanada";
  if (n.includes("hamburgues")) return "hamburguesa";
  if (n.includes("pizza")) return "pizza";
  if (n.includes("jugo") || n.includes("licuado") || n.includes("bebida")) return "bebida";
  if (n.includes("postre") || n.includes("dulce") || n.includes("torta")) return "postre";
  if (n.includes("café") || n.includes("cafe") || n.includes("desayuno")) return "cafe";
  if (n.includes("pollo") || n.includes("asado") || n.includes("parrilla")) return "pollo";
  if (n.includes("ensalada")) return "ensalada";
  return "generico";
}

function CategoryIcon({ name, icon, size = 18, color = "currentColor" }) {
  const key = icon && ICON_PATHS[icon] ? icon : guessIconKey(name);
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: color };
  if (key === "pizza") {
    return (
      <svg {...props}><path d={ICON_PATHS.pizza} /><circle cx="10" cy="10" r="1.1" fill="#F0E2BF" /><circle cx="14" cy="13" r="1.1" fill="#F0E2BF" /><circle cx="11" cy="16" r="1.1" fill="#F0E2BF" /></svg>
    );
  }
  return <svg {...props}><path d={ICON_PATHS[key]} /></svg>;
}

function compressImage(file, maxSize = 320, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [deliveryNote, setDeliveryNote] = useState(DEFAULT_DELIVERY_NOTE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [openCat, setOpenCat] = useState("");
  const [mode, setMode] = useState("retiro");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [locStatus, setLocStatus] = useState("idle");

  const [view, setView] = useState("menu");
  const [userInput, setUserInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [draft, setDraft] = useState(null);
  const [draftNote, setDraftNote] = useState(DEFAULT_DELIVERY_NOTE);
  const [draftPin, setDraftPin] = useState("");
  const [draftUser, setDraftUser] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Estilo de Fondo Corregido: Una sola imagen adaptada al centro sin repetirse en mosaico
  const pageBackgroundStyle = {
    backgroundImage: `url('/fondocaserita.png')`,
    backgroundSize: '350px auto', // Controla exactamente el tamaño del patrón
    backgroundPosition: 'center top',
    backgroundRepeat: 'repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%',
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SHEETS_API_URL);
        const data = await res.json();
        if (data.menu && data.menu.length > 0) {
          setMenu(data.menu);
          setOpenCat(data.menu[0].category);
        } else {
          setOpenCat(DEFAULT_MENU[0].category);
        }
        if (data.deliveryNote) setDeliveryNote(data.deliveryNote);
      } catch (err) {
        setLoadError("No se pudo cargar el menú. Revisá tu conexión o la configuración de la planilla.");
        setOpenCat(DEFAULT_MENU[0].category);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allItems = useMemo(() => menu.flatMap((c) => c.items), [menu]);

  useEffect(() => {
    if (!loading && menu.length > 0 && !menu.some((c) => c.category === openCat)) {
      setOpenCat(menu[0].category);
    }
  }, [menu, loading]);

  const addItem = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeItem = (id) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  const clearItem = (id) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => {
      const item = allItems.find((i) => i.id === id);
      return item ? { ...item, qty } : null;
    })
    .filter(Boolean);

  const totalQty = cartLines.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.qty * l.price, 0);
  const totalPrice = subtotal;

  const buildMessage = () => {
    let msg = `¡Hola La Caserita! 👋 Quiero hacer este pedido:\n\n`;
    cartLines.forEach((l) => {
      msg += `• ${l.qty}x ${l.name} — ${formatGs(l.qty * l.price)}\n`;
    });
    msg += `\nSubtotal: ${formatGs(subtotal)}\n`;
    msg += `Modalidad: ${mode === "retiro" ? "Retiro en el local" : "Delivery"}\n`;
    if (mode === "delivery") {
      if (mapLink) msg += `Ubicación (Google Maps): ${mapLink}\n`;
      if (address.trim()) msg += `Dirección / referencia: ${address}\n`;
      if (!mapLink && !address.trim()) msg += `Dirección de entrega: (especificar)\n`;
      msg += `(${deliveryNote})\n`;
    }
    msg += `\nTotal (sin envío): ${formatGs(totalPrice)}\n`;
    if (notes.trim()) msg += `Nota: ${notes.trim()}\n`;
    return msg;
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setLocStatus("done");
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sendOrder = () => {
    const text = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${PHONE_INTL}?text=${text}`, "_blank");
  };

  const saveMenu = async (nextMenu, nextNote, nextPin) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || draftUser,
          pin: pinInput || draftPin,
          menu: nextMenu,
          deliveryNote: nextNote,
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        setSaveError(result.error || "Error al guardar");
        setSaving(false);
        return;
      }
      setMenu(nextMenu);
      setDeliveryNote(nextNote);
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (err) {
      setSaveError("No se pudo guardar. Revisá tu conexión, y tocá Guardar de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const commitSave = () => {
    if (!draft) return;
    const sanitized = draft.map((c) => ({
      ...c,
      items: c.items.map((it) => ({ ...it, price: Number(it.price) || 0 })),
    }));
    saveMenu(sanitized, draftNote);
  };

  const [verifying, setVerifying] = useState(false);

  const enterAdmin = () => {
    setDraft(JSON.parse(JSON.stringify(menu)));
    setDraftNote(deliveryNote);
    setDraftPin(pinInput);
    setDraftUser(userInput);
    setDirty(false);
    setView("admin");
  };

  const checkPinAndEnter = async () => {
    if (!userInput.trim() || !pinInput.trim()) {
      setPinError("Completá usuario y PIN");
      return;
    }
    setVerifying(true);
    setPinError("");
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userInput, pin: pinInput, action: "verifyPin" }),
      });
      const result = await res.json();
      if (result.ok) {
        enterAdmin();
      } else {
        setPinError("Usuario o PIN incorrecto");
      }
    } catch {
      setPinError("No se pudo verificar. Revisá tu conexión.");
    } finally {
      setVerifying(false);
    }
  };

  const updateItemField = (catIdx, itemIdx, field, value) => {
    setDraft((d) =>
      d.map((c, ci) =>
        ci !== catIdx ? c : { ...c, items: c.items.map((it, ii) => (ii !== itemIdx ? it : { ...it, [field]: value })) }
      )
    );
    setDirty(true);
  };
  const deleteItem = (catIdx, itemIdx) => {
    setDraft((d) => d.map((c, ci) => (ci !== catIdx ? c : { ...c, items: c.items.filter((_, ii) => ii !== itemIdx) })));
    setDirty(true);
  };
  const addItem2 = (catIdx) => {
    setDraft((d) =>
      d.map((c, ci) =>
        ci !== catIdx ? c : { ...c, items: [...c.items, { id: uid(), name: "Nuevo producto", desc: "", price: "", image: "" }] }
      )
    );
    setDirty(true);
  };
  const deleteCategory = (catIdx) => {
    setDraft((d) => d.filter((_, ci) => ci !== catIdx));
    setDirty(true);
  };
  const renameCategory = (catIdx, value) => {
    setDraft((d) => d.map((c, ci) => (ci !== catIdx ? c : { ...c, category: value })));
    setDirty(true);
  };
  const updateCategoryIcon = (catIdx, iconKey) => {
    setDraft((d) => d.map((c, ci) => (ci !== catIdx ? c : { ...c, icon: iconKey })));
    setDirty(true);
  };
  const addCategory = () => {
    setDraft((d) => [...d, { category: "Nueva categoría", icon: "generico", items: [] }]);
    setDirty(true);
  };

  const [imgLoading, setImgLoading] = useState(null);
  const [imgError, setImgError] = useState("");

  const handleImageUpload = async (catIdx, itemIdx, file) => {
    if (!file) return;
    const itemId = draft[catIdx].items[itemIdx].id;
    setImgLoading(itemId);
    setImgError("");
    try {
      const dataUrl = await compressImage(file);
      updateItemField(catIdx, itemIdx, "image", dataUrl);
    } catch {
      setImgError("No se pudo procesar esa imagen. Probá con otra foto.");
    } finally {
      setImgLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: BRAND.paper, minHeight: "100vh" }} className="flex items-center justify-center">
        <LoaderCircle className="animate-spin" color={BRAND.tomato} size={32} />
      </div>
    );
  }

  if (view === "adminLogin") {
    return (
      <div style={{ background: BRAND.charcoal, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif" }} className="flex items-center justify-center px-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;600;700;800&display=swap'); .slab{font-family:'Alfa Slab One',serif;}`}</style>
        <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: BRAND.paper }}>
          <button onClick={() => setView("menu")} className="flex items-center gap-1 text-sm font-bold mb-4" style={{ color: BRAND.charcoal }}>
            <ArrowLeft size={16} /> Volver al menú
          </button>
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full" style={{ background: BRAND.tomato }}>
              <Lock size={22} color={BRAND.cream} />
            </div>
          </div>
          <h2 className="slab text-xl text-center mb-4" style={{ color: BRAND.charcoal }}>Acceso administrador</h2>
          <input
            type="text"
            autoComplete="off"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Usuario"
            className="w-full rounded-lg p-3 text-center text-lg border-2 mb-3"
            style={{ borderColor: BRAND.paperDark, background: BRAND.cream }}
          />
          <input
            type="password"
            autoComplete="off"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN"
            className="w-full rounded-lg p-3 text-center text-lg border-2 tracking-widest"
            style={{ borderColor: BRAND.paperDark, background: BRAND.cream }}
          />
          {pinError && (
            <p className="text-xs mt-2 text-center font-bold" style={{ color: BRAND.tomato }}>⚠️ {pinError}</p>
          )}
          <button
            onClick={checkPinAndEnter}
            disabled={verifying}
            className="w-full mt-4 rounded-xl p-3 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: BRAND.tomato, color: BRAND.cream }}
          >
            {verifying ? (<><LoaderCircle className="animate-spin" size={18} /> Verificando...</>) : "Ingresar"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "admin" && draft) {
    return (
      <div style={{ background: BRAND.paper, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;600;700;800&display=swap'); .slab{font-family:'Alfa Slab One',serif;}`}</style>
        <div style={{ background: BRAND.charcoal }} className="px-5 py-4 sticky top-0 z-20 flex items-center justify-between">
          <button
            onClick={() => (dirty ? setShowExitConfirm(true) : setView("menu"))}
            className="flex items-center gap-1 text-sm font-bold"
            style={{ color: BRAND.cream }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 className="slab text-lg" style={{ color: BRAND.mustard }}>Administrar menú</h1>
          <span className="text-xs" style={{ color: dirty ? BRAND.mustard : BRAND.green }}>
            {dirty ? "Sin guardar" : "Al día"}
          </span>
        </div>

        {showExitConfirm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.55)" }}>
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: BRAND.cream }}>
              <p className="font-bold text-base mb-1" style={{ color: BRAND.charcoal }}>Tenés cambios sin guardar</p>
              <p className="text-sm text-gray-600 mb-4">Si salís ahora, vas a perder lo que modificaste. ¿Qué querés hacer?</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setShowExitConfirm(false); commitSave(); setView("menu"); }} className="w-full rounded-lg p-3 text-sm font-semibold" style={{ background: BRAND.green, color: BRAND.cream }}>
                  Guardar y salir
                </button>
                <button onClick={() => { setShowExitConfirm(false); setView("menu"); }} className="w-full rounded-lg p-3 text-sm font-semibold" style={{ background: BRAND.tomato, color: BRAND.cream }}>
                  Salir sin guardar
                </button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full rounded-lg p-3 text-sm font-semibold border-2" style={{ borderColor: BRAND.paperDark, color: BRAND.charcoal }}>
                  Seguir editando
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-5 max-w-xl mx-auto pb-28">
          <div className="mb-4 rounded-lg p-3 flex items-start gap-2" style={{ background: "#FFF3C4", border: `1px solid ${BRAND.mustard}` }}>
            <span className="text-lg">💡</span>
            <p className="text-xs" style={{ color: BRAND.charcoal }}>
              Después de editar, tocá <b>"Guardar cambios"</b> abajo de todo.
            </p>
          </div>

          <div className="mb-6 rounded-xl p-4 border-2" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
            <p className="font-bold text-sm mb-1" style={{ color: BRAND.charcoal }}>Mensaje sobre el envío (delivery)</p>
            <input
              value={draftNote}
              onChange={(e) => { setDraftNote(e.target.value); setDirty(true); }}
              className="w-full rounded p-2 text-sm border-2"
              style={{ borderColor: BRAND.paperDark }}
            />
          </div>

          {draft.map((c, catIdx) => (
            <div key={catIdx} className="mb-6 rounded-xl p-4 border-2" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
              <div className="flex items-center gap-2 mb-3">
                <input
                  value={c.category}
                  onChange={(e) => renameCategory(catIdx, e.target.value)}
                  className="slab flex-1 text-lg bg-transparent border-b-2 pb-1"
                  style={{ color: BRAND.tomato, borderColor: BRAND.paperDark }}
                />
                <button onClick={() => deleteCategory(catIdx)} className="p-2 rounded-lg" style={{ background: BRAND.tomato }}>
                  <Trash2 size={14} color={BRAND.cream} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold mb-1.5" style={{ color: BRAND.charcoal }}>Ícono de esta categoría</p>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const selected = (c.icon || guessIconKey(c.category)) === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => updateCategoryIcon(catIdx, opt.key)}
                        title={opt.label}
                        className="p-2 rounded-lg border-2 flex items-center justify-center"
                        style={selected ? { background: BRAND.tomato, borderColor: BRAND.tomatoDark } : { background: BRAND.paper, borderColor: BRAND.paperDark }}
                      >
                        <CategoryIcon icon={opt.key} name="" size={18} color={selected ? BRAND.cream : BRAND.charcoal} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {c.items.map((item, itemIdx) => (
                  <div key={item.id} className="rounded-lg p-3 flex gap-3" style={{ background: BRAND.paper }}>
                    <label
                      className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center cursor-pointer"
                      style={{ borderColor: BRAND.paperDark, background: BRAND.cream }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(catIdx, itemIdx, e.target.files?.[0])}
                      />
                      {imgLoading === item.id ? (
                        <LoaderCircle className="animate-spin" size={18} color={BRAND.tomato} />
                      ) : item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} color={BRAND.tomatoDark} />
                      )}
                      {item.image && imgLoading !== item.id && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); updateItemField(catIdx, itemIdx, "image", ""); }}
                          className="absolute top-0.5 right-0.5 rounded-full p-0.5"
                          style={{ background: BRAND.tomato }}
                        >
                          <X size={10} color={BRAND.cream} />
                        </button>
                      )}
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-center mb-2">
                        <input
                          value={item.name}
                          onChange={(e) => updateItemField(catIdx, itemIdx, "name", e.target.value)}
                          placeholder="Nombre del producto"
                          className="flex-1 rounded p-2 text-sm font-bold border"
                          style={{ borderColor: BRAND.paperDark }}
                        />
                        <button onClick={() => deleteItem(catIdx, itemIdx)} className="p-2 rounded" style={{ background: BRAND.tomato }}>
                          <Trash2 size={13} color={BRAND.cream} />
                        </button>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={item.desc}
                          onChange={(e) => updateItemField(catIdx, itemIdx, "desc", e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="flex-1 rounded p-2 text-xs border"
                          style={{ borderColor: BRAND.paperDark }}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatPriceInput(item.price)}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^\d]/g, "");
                            updateItemField(catIdx, itemIdx, "price", digits === "" ? "" : Number(digits));
                          }}
                          placeholder="0 Gs."
                          className="w-28 rounded p-2 text-xs border text-right"
                          style={{ borderColor: BRAND.paperDark }}
                        />
                      </div>
                      <input
                        value={item.image && item.image.startsWith("data:") ? "" : (item.image || "")}
                        onChange={(e) => updateItemField(catIdx, itemIdx, "image", e.target.value)}
                        placeholder={item.image && item.image.startsWith("data:") ? "Foto subida ✓ (o pegá un link para reemplazarla)" : "O pegá un link de foto (opcional)"}
                        className="w-full rounded p-2 text-xs border"
                        style={{ borderColor: BRAND.paperDark }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {imgError && (
                <p className="text-xs mt-2" style={{ color: BRAND.tomato }}>⚠️ {imgError}</p>
              )}

              <button
                onClick={() => addItem2(catIdx)}
                className="w-full mt-3 rounded-lg p-2 text-sm font-bold flex items-center justify-center gap-1"
                style={{ background: BRAND.mustard, color: BRAND.charcoal }}
              >
                <Plus size={14} /> Agregar producto en {c.category}
              </button>
            </div>
          ))}

          <button
            onClick={addCategory}
            className="w-full rounded-xl p-3 font-bold flex items-center justify-center gap-2"
            style={{ background: BRAND.green, color: BRAND.cream }}
          >
            <Plus size={16} /> Nueva categoría
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: BRAND.charcoal }}>
          {saveError && (
            <p className="text-xs mb-2 text-center max-w-xl mx-auto" style={{ color: BRAND.mustard }}>⚠️ {saveError}</p>
          )}
          <button
            onClick={commitSave}
            disabled={!dirty || saving}
            className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 rounded-xl p-4 font-semibold text-base disabled:opacity-50"
            style={{ background: savedFlash ? BRAND.green : BRAND.tomato, color: BRAND.cream }}
          >
            {saving ? (<><LoaderCircle className="animate-spin" size={18} /> Guardando...</>) :
              savedFlash ? (<>✓ Cambios guardados</>) :
              (<><Save size={18} /> Guardar cambios</>)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageBackgroundStyle} className="min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Caveat:wght@600;700&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .slab { font-family: 'Alfa Slab One', serif; }
        .hand { font-family: 'Caveat', cursive; }
      `}</style>

      {loadError && (
        <p className="text-xs text-center py-2" style={{ background: BRAND.mustard, color: BRAND.charcoal }}>⚠️ {loadError}</p>
      )}

      {/* Contenedor del banner con fondo oscuro para PC */}
      <div style={{ background: BRAND.charcoal }} className="w-full flex justify-center">
        <img src="/banner.jpg" alt="La Caserita" className="w-full block" />
      </div>

      <div style={{ background: BRAND.charcoal }} className="sticky top-0 z-20 shadow-lg">
        <div className="flex items-center justify-between px-5 py-3 gap-3 max-w-xl mx-auto">
          <p className="hand text-2xl" style={{ color: BRAND.mustard }}>Pedí online</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="hand text-lg text-right leading-tight hidden sm:block" style={{ color: "#FFD600", maxWidth: 160 }}>
                Seleccione los productos y confirme en el carrito
              </span>
              <span className="hidden sm:block text-2xl">👉</span>
              <button onClick={() => setCartOpen(true)} className="relative p-3 rounded-full flex-shrink-0" style={{ background: BRAND.tomato }}>
                <ShoppingCart size={22} color={BRAND.cream} />
                {totalQty > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: BRAND.mustard, color: BRAND.charcoal, width: 20, height: 20 }}>
                    {totalQty}
                  </span>
                )}
              </button>
            </div>
            <button onClick={() => { setUserInput(""); setPinInput(""); setPinError(""); setView("adminLogin"); }} className="p-3 rounded-full flex-shrink-0" style={{ background: BRAND.paperDark }} title="Administrar menú">
              <Settings size={20} color={BRAND.charcoal} />
            </button>
          </div>
        </div>
        <p className="hand text-base text-center pb-2 sm:hidden flex items-center justify-center gap-1" style={{ color: "#FFD600" }}>
          Seleccione los productos y confirme en el carrito <span className="text-xl">👇</span>
        </p>
      </div>

      <div style={{ background: BRAND.paperDark }}>
        <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-xl mx-auto">
          {menu.map((c) => (
            <button
              key={c.category}
              onClick={() => setOpenCat(c.category)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border-2 flex items-center gap-1.5"
              style={openCat === c.category
                ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                : { background: "transparent", color: BRAND.charcoal, borderColor: BRAND.charcoal }}
            >
              <CategoryIcon name={c.category} icon={c.icon} size={16} />
              {c.category}
            </button>
          ))}
        </div>
      </div>

      {/* Menú de Productos */}
      <div className="p-4 max-w-xl mx-auto pb-24">
        {menu
          .filter((c) => c.category === openCat)
          .map((c) => (
            <div key={c.category} className="flex flex-col gap-3">
              {c.items.map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} className="rounded-xl p-3 flex gap-3 shadow-md border" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base leading-snug" style={{ color: BRAND.charcoal }}>{item.name}</h3>
                        {item.desc && <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{item.desc}</p>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-sm" style={{ color: BRAND.tomato }}>{formatGs(item.price)}</span>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button onClick={() => removeItem(item.id)} className="p-1 rounded-full" style={{ background: BRAND.paperDark, color: BRAND.charcoal }}>
                                <Minus size={16} />
                              </button>
                              <span className="font-bold text-sm min-w-[16px] text-center">{qty}</span>
                            </>
                          )}
                          <button onClick={() => addItem(item.id)} className="p-1 rounded-full" style={{ background: BRAND.tomato, color: BRAND.cream }}>
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {/* Modal Carrito */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto flex flex-col" style={{ background: BRAND.paper }}>
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: BRAND.paperDark }}>
              <h2 className="slab text-xl" style={{ color: BRAND.charcoal }}>Tu Pedido</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-full" style={{ background: BRAND.paperDark }}>
                <X size={20} color={BRAND.charcoal} />
              </button>
            </div>

            {cartLines.length === 0 ? (
              <p className="text-center py-8 text-gray-600">El carrito está vacío</p>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  {cartLines.map((l) => (
                    <div key={l.id} className="flex items-center justify-between pb-2 border-b" style={{ borderColor: BRAND.paperDark }}>
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-sm">{l.name}</p>
                        <p className="text-xs text-gray-600">{formatGs(l.price)} x {l.qty} = {formatGs(l.price * l.qty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeItem(l.id)} className="p-1 rounded-full" style={{ background: BRAND.paperDark }}>
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm">{l.qty}</span>
                        <button onClick={() => addItem(l.id)} className="p-1 rounded-full" style={{ background: BRAND.tomato, color: BRAND.cream }}>
                          <Plus size={14} />
                        </button>
                        <button onClick={() => clearItem(l.id)} className="p-1 ml-1 text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="font-bold text-sm mb-2">Modalidad de entrega:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode("retiro")}
                      className="p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border-2"
                      style={mode === "retiro" ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark } : { background: BRAND.cream, borderColor: BRAND.paperDark }}
                    >
                      <Store size={16} /> Retiro
                    </button>
                    <button
                      onClick={() => setMode("delivery")}
                      className="p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border-2"
                      style={mode === "delivery" ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark } : { background: BRAND.cream, borderColor: BRAND.paperDark }}
                    >
                      <MapPin size={16} /> Delivery
                    </button>
                  </div>
                </div>

                {mode === "delivery" && (
                  <div className="mb-4 flex flex-col gap-2 p-3 rounded-lg border-2" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                    <button
                      onClick={shareLocation}
                      className="p-2 rounded text-xs font-bold flex items-center justify-center gap-1"
                      style={{ background: BRAND.mustard, color: BRAND.charcoal }}
                    >
                      <Navigation size={14} />
                      {locStatus === "loading" ? "Obteniendo ubicación..." : locStatus === "done" ? "Ubicación lista ✓" : "Compartir mi ubicación GPS"}
                    </button>
                    <input
                      type="text"
                      placeholder="Dirección o referencia (Ej: Calle X c/ Y)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2 text-xs rounded border"
                      style={{ borderColor: BRAND.paperDark }}
                    />
                    <p className="text-[11px] text-gray-500 italic">* {deliveryNote}</p>
                  </div>
                )}

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Aclaraciones o notas (ej: sin cebolla)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 text-xs rounded border"
                    style={{ borderColor: BRAND.paperDark }}
                  />
                </div>

                <div className="pt-2 border-t flex items-center justify-between mb-4" style={{ borderColor: BRAND.paperDark }}>
                  <span className="font-bold text-base">Total:</span>
                  <span className="font-extrabold text-lg" style={{ color: BRAND.tomato }}>{formatGs(totalPrice)}</span>
                </div>

                <button
                  onClick={sendOrder}
                  className="w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: BRAND.green, color: BRAND.cream }}
                >
                  <Send size={18} /> Enviar pedido por WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
