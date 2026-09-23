import { useState, useMemo, useEffect, useRef, Component } from "react";
import {
  ShoppingCart, Plus, Minus, X, MapPin, Store, Send, Trash2,
  Settings, Lock, Save, ArrowLeft, LoaderCircle, Navigation,
  CheckCircle2, Image as ImageIcon, Phone, Upload, Sparkles,
  AlertCircle, Info, RefreshCw, Eye, EyeOff, KeyRound, Utensils,
  Bike, ShoppingBag, Hash, Briefcase, ShieldCheck, ShieldAlert, ShieldOff,
  Clock, CreditCard, Building2, User, Mail, Check, AlertTriangle,
  Users, Copy, ExternalLink, QrCode, Search, Filter, ArrowUpDown,
  Receipt, DollarSign, Printer, Calendar, CheckSquare, History, Wallet,
  Map, Crosshair, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  FileText, Download, MessageCircle, CheckCheck
} from "lucide-react";

/* =========================================================================
   CONFIGURACIÓN Y CONSTANTES
   ========================================================================= */

const SHEETS_API_URL = "/api/menu"; 

const BRAND = {
  charcoal: "#2A2018",
  charcoalDark: "#1C1510",
  paper: "#F0E2BF",
  paperDark: "#E6D2A3",
  tomato: "#C1392B",
  tomatoDark: "#9E2C20",
  mustard: "#E3A23B",
  mustardLight: "#FFE082",
  green: "#45603C",
  greenDark: "#33472C",
  cream: "#FBF2DD",
};

// Planes de adquisición de la app para comercios (Valores por defecto en Gs.)
const DEFAULT_APP_PRICING_PLANS = [
  {
    id: "mensual",
    title: "Plan Mensual",
    badge: "Básico",
    priceGs: 150000,
    priceFormatted: "150.000 Gs.",
    period: "por mes",
    description: "Ideal para comenzar a digitalizar tu local sin compromisos largos.",
    savings: null,
    features: [
      "Menú digital QR interactivo ilimitado",
      "Pedidos directos a tu WhatsApp (Mesa, Delivery y Retiro)",
      "Panel de administración para 1 usuario administrador",
      "Actualización instantánea de precios, fotos y productos",
      "Soporte técnico por WhatsApp",
      "0% de comisiones por ventas",
    ],
  },
  {
    id: "semestral",
    title: "Plan Semestral",
    badge: "🎁 ¡1 Mes Gratis!",
    priceGs: 750000,
    priceFormatted: "750.000 Gs.",
    period: "por 6 meses",
    description: "Abonás 5 meses y recibís 6 meses de servicio (equivale a 125.000 Gs./mes).",
    savings: "Ahorrás 150.000 Gs.",
    features: [
      "Todo lo incluido en el Plan Mensual",
      "1 mes de servicio bonificado de regalo",
      "Carga inicial asistida de tu carta y categorías",
      "Compresión y optimización de fotos para carga veloz",
      "Soporte técnico prioritario",
    ],
  },
  {
    id: "anual",
    title: "Plan Anual PRO",
    badge: "⭐ ¡Más Elegido! 3 Meses Gratis",
    priceGs: 1350000,
    priceFormatted: "1.350.000 Gs.",
    period: "por 12 meses",
    description: "Abonás 9 meses y disfrutás de 1 año completo (equivale a 112.500 Gs./mes).",
    savings: "Ahorrás 450.000 Gs. (25% OFF)",
    highlighted: true,
    features: [
      "Todo lo incluido en el Plan Semestral",
      "3 meses de servicio bonificados gratis",
      "Diseño y personalización de portada con tu logo",
      "Código QR vectorial de alta definición para imprimir en mesas y barra",
      "Soporte VIP prioritario vía WhatsApp",
    ],
  },
];

// Datos de pago disponibles para adquisición de la App
const PAYMENT_INFO = {
  transferencia: {
    name: "Transferencia Bancaria / SIPAP o Alias",
    bank: "Banco Itaú",
    accountType: "Caja de Ahorro",
    accountHolder: "Camila Ayelen Torres",
    documentId: "CI: 7.226.273",
    ciNumber: "7226273",
    accountNumber: "620011158",
    sipapAlias: "CI: 7226273",
    aliasAlt: "7226273",
    whatsappDisplay: "+595 975 635 770",
    whatsappIntl: "595975635770",
  },
  billetera: {
    name: "Giros / Billeteras Móviles",
    number: "0975 635 770",
    whatsappDisplay: "+595 975 635 770",
    whatsappIntl: "595975635770",
    holder: "Camila Ayelen Torres",
    note: "Envía el comprobante o realizá tus consultas al WhatsApp +595 975 635 770.",
  },
  qr_card: {
    name: "Pago con Tarjeta / QR Bancard",
    whatsappDisplay: "+595 975 635 770",
    whatsappIntl: "595975635770",
    note: "Al confirmar tu solicitud, coordinaremos el envío del enlace de pago web o código QR por WhatsApp al +595 975 635 770.",
  },
  efectivo: {
    name: "Efectivo / A coordinar por WhatsApp",
    whatsappDisplay: "+595 975 635 770",
    whatsappIntl: "595975635770",
    note: "Coordiná el pago presencial escribiéndonos directamente al WhatsApp +595 975 635 770.",
  },
};

// Pedidos de muestra iniciales para historial de comercio (con fechas y estados variados)
const DEFAULT_INITIAL_ORDERS = [
  {
    id: "PED-9821",
    mode: "mesa",
    tableNumber: "4",
    customerName: "Carlos Benítez",
    customerPhone: "0985123456",
    address: "Mesa 4 (Salón Principal)",
    mapLink: "",
    notes: "Bien cocido, salsa de ajo aparte",
    items: [
      { id: "1", name: "Milanesa de Carne con Papas Fritas", price: 35000, qty: 2 },
      { id: "5", name: "Gaseosa 500ml", price: 7000, qty: 2 },
    ],
    totalItems: 4,
    totalPrice: 84000,
    paymentStatus: "pagado",
    paymentMethod: "pos",
    paidAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "PED-9820",
    mode: "delivery",
    tableNumber: "",
    customerName: "María Fernández",
    customerPhone: "0971987654",
    address: "Barrio San Roque, Calle Villarrica c/ Posadas",
    mapLink: "https://maps.google.com/?q=-27.330,-55.866",
    notes: "Tocar timbre blanco al llegar",
    items: [
      { id: "3", name: "Hamburguesa Doble Casera", price: 28000, qty: 1 },
      { id: "7", name: "Papas Fritas Especiales", price: 18000, qty: 1 },
    ],
    totalItems: 2,
    totalPrice: 46000,
    paymentStatus: "pagado",
    paymentMethod: "transferencia",
    paidAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: "PED-9819",
    mode: "mesa",
    tableNumber: "2",
    customerName: "Familia González",
    customerPhone: "",
    address: "Mesa 2",
    mapLink: "",
    notes: "Sin mayonesa",
    items: [
      { id: "2", name: "Pizza Muzzarella Familiar", price: 45000, qty: 1 },
      { id: "5", name: "Gaseosa 1.5L", price: 12000, qty: 1 },
    ],
    totalItems: 2,
    totalPrice: 57000,
    paymentStatus: "pendiente",
    paymentMethod: "",
    paidAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "PED-9815",
    mode: "retiro",
    tableNumber: "",
    customerName: "Gustavo Rojas",
    customerPhone: "0981445566",
    address: "Retiro en local",
    mapLink: "",
    notes: "Pasa a retirar a las 13:00 hs",
    items: [
      { id: "4", name: "Empanadas de Carne (x6)", price: 30000, qty: 1 },
    ],
    totalItems: 1,
    totalPrice: 30000,
    paymentStatus: "pendiente",
    paymentMethod: "",
    paidAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "PED-9792",
    mode: "delivery",
    tableNumber: "",
    customerName: "Leticia Romero",
    customerPhone: "0982334455",
    address: "Villa Sarita c/ Costanera",
    mapLink: "",
    notes: "Cancelado por el cliente por demora",
    items: [
      { id: "1", name: "Milanesa de Pollo Napolitana", price: 38000, qty: 1 },
    ],
    totalItems: 1,
    totalPrice: 38000,
    paymentStatus: "cancelado",
    paymentMethod: "",
    paidAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "PED-9780",
    mode: "mesa",
    tableNumber: "6",
    customerName: "Esteban Duarte",
    customerPhone: "",
    address: "Mesa 6",
    mapLink: "",
    notes: "",
    items: [
      { id: "2", name: "Lomito Completo al Plato", price: 36000, qty: 2 },
      { id: "6", name: "Cerveza 3/4", price: 15000, qty: 2 },
    ],
    totalItems: 4,
    totalPrice: 102000,
    paymentStatus: "pagado",
    paymentMethod: "efectivo",
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
  },
  {
    id: "PED-9750",
    mode: "delivery",
    tableNumber: "",
    customerName: "Ana Belén Silva",
    customerPhone: "0991778899",
    address: "Av. Irrazabal esq. Cerro Corá",
    mapLink: "",
    notes: "",
    items: [
      { id: "3", name: "Tallarines Caseros con Estofado", price: 32000, qty: 2 },
      { id: "5", name: "Postre Flan Casero", price: 12000, qty: 2 },
    ],
    totalItems: 4,
    totalPrice: 88000,
    paymentStatus: "pagado",
    paymentMethod: "pos",
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 73).toISOString(),
  },
];

function formatLockTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

const DEFAULT_BUSINESS = {
  name: "La Caserita Rotisería",
  slogan: "Pedí online",
  phoneIntl: "595985913400",
  phoneDisplay: "0985 913 400",
  address: "Santa María III, Ruta 6ta km 3.5, Encarnación",
  bannerImage: "/banner.jpg",
  deliveryNote: "El costo de envío se coordina según la zona",
  adminUser: "Usuario",
};

const DEFAULT_MENU = [
  {
    category: "Platos Principales",
    icon: "almuerzo",
    items: [
      { id: "alm1", name: "Menú del día", desc: "Plato completo nutritivo, incluye guarnición del día", price: 25000, image: "" },
      { id: "alm2", name: "Milanesa de Carne con Guarnición", desc: "Acompañada de papas fritas crocantes o ensalada mixta", price: 30000, image: "" },
      { id: "alm3", name: "Tallarines Caseros con Estofado", desc: "Pasta fresca artesanal con salsa de estofado de carne", price: 28000, image: "" },
    ],
  },
  {
    category: "Bebidas",
    icon: "bebida",
    items: [
      { id: "beb1", name: "Gaseosa 500ml", desc: "Coca-Cola, Sprite o Fanta (bien fría)", price: 8000, image: "" },
      { id: "beb2", name: "Jugo Natural Exprimido 500ml", desc: "Naranja exprimida fresca o frutas de estación", price: 12000, image: "" },
      { id: "beb3", name: "Agua Mineral 500ml", desc: "Con o sin gas, purificada", price: 5000, image: "" },
    ],
  },
  {
    category: "Postres",
    icon: "postre",
    items: [
      { id: "pos1", name: "Flan Casero con Dulce de Leche", desc: "Receta tradicional casera con caramelo dorado", price: 12000, image: "" },
      { id: "pos2", name: "Tarta Dulce Artesanal", desc: "Porción de tarta de frutilla o pasta frola", price: 15000, image: "" },
      { id: "pos3", name: "Ensalada de Frutas Frescas", desc: "Frutas de estación picadas en jugo natural", price: 10000, image: "" },
    ],
  },
];

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

function formatTimeSafe(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    try {
      const d = new Date(dateVal);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
      return "";
    }
  }
}

function formatDateSafe(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-PY");
  } catch (e) {
    return "";
  }
}

function toDateYmd(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
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
  { key: "almuerzo", label: "Platos Principales" },
  { key: "bebida", label: "Bebidas" },
  { key: "postre", label: "Postres" },
  { key: "minuta", label: "Minutas y Papas" },
  { key: "sandwich", label: "Sandwiches & Lomitos" },
  { key: "empanada", label: "Empanadas" },
  { key: "hamburguesa", label: "Hamburguesas" },
  { key: "pizza", label: "Pizzas" },
  { key: "cafe", label: "Cafetería & Desayunos" },
  { key: "pollo", label: "Pollo & Asados" },
  { key: "ensalada", label: "Ensaladas" },
  { key: "generico", label: "Especialidades" },
];

function guessIconKey(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("principal") || n.includes("almuerzo") || n.includes("menú") || n.includes("menu") || n.includes("plato")) return "almuerzo";
  if (n.includes("bebida") || n.includes("gaseosa") || n.includes("jugo") || n.includes("agua") || n.includes("licuado") || n.includes("trago")) return "bebida";
  if (n.includes("postre") || n.includes("dulce") || n.includes("torta") || n.includes("flan") || n.includes("helado")) return "postre";
  if (n.includes("minuta") || n.includes("papa") || n.includes("frita")) return "minuta";
  if (n.includes("sandwich") || n.includes("miga") || n.includes("milanesa") || n.includes("panch") || n.includes("lomito")) return "sandwich";
  if (n.includes("empanada")) return "empanada";
  if (n.includes("hamburgues") || n.includes("burger")) return "hamburguesa";
  if (n.includes("pizza")) return "pizza";
  if (n.includes("café") || n.includes("cafe") || n.includes("desayuno") || n.includes("merienda")) return "cafe";
  if (n.includes("pollo") || n.includes("asado") || n.includes("parrilla") || n.includes("carne")) return "pollo";
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

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[AI Studio] Admin section error:", error, errorInfo);
  }
  handleResetLocalData = () => {
    try {
      localStorage.removeItem("lacaserita_orders");
    } catch (e) {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: BRAND.charcoal, minHeight: "100vh" }} className="flex items-center justify-center p-4">
          <div className="p-6 md:p-8 text-center rounded-2xl border-2 shadow-2xl max-w-lg mx-auto" style={{ background: BRAND.paper, borderColor: BRAND.tomato }}>
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-bold text-2xl shadow-inner">⚠️</div>
            <h3 className="font-bold text-stone-900 text-lg mb-1">Inconveniente al cargar el Panel Administrador</h3>
            <p className="text-xs text-stone-700 mb-3">
              Se detectó un problema en los datos del panel. Podés volver a la tienda o reintentar sin perder tus datos.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-red-700 mb-4 font-mono bg-white/70 p-2.5 rounded-xl border border-red-200 break-words text-left">
                {this.state.error.message}
              </p>
            )}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (this.props.onGoBack) {
                    this.setState({ hasError: false, error: null });
                    this.props.onGoBack();
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow hover:brightness-105 transition"
                style={{ background: BRAND.tomato }}
              >
                Volver a la Tienda
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full py-2.5 px-4 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700 transition"
              >
                Reintentar Cargar Panel
              </button>
              <button
                type="button"
                onClick={this.handleResetLocalData}
                className="w-full py-2 px-3 bg-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold hover:bg-stone-300 transition"
              >
                Limpiar datos temporales de pedidos y recargar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================================================================
   COMPONENTE: TOAST NOTIFICATIONS
   ========================================================================= */
function ToastContainer({ toasts, onDismiss, onAction }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "order_success";
        const isCart = toast.type === "cart_add";
        
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4"
            style={{
              background: isSuccess ? "#1C2E1A" : BRAND.charcoalDark,
              borderColor: isSuccess ? "#45603C" : BRAND.mustard,
              color: BRAND.cream,
            }}
          >
            {/* Ícono representativo */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
              style={{
                background: isSuccess ? "#45603C" : BRAND.tomato,
                color: BRAND.cream,
              }}
            >
              {isSuccess ? <CheckCircle2 size={20} className="text-white" /> : <ShoppingCart size={18} className="text-white" />}
            </div>

            {/* Contenido del Toast */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: isSuccess ? "#A3E635" : BRAND.mustardLight }}>
                  {toast.title}
                </p>
                {toast.time && (
                  <span className="text-[10px] text-stone-400 font-mono">{toast.time}</span>
                )}
              </div>
              <p className="text-sm font-bold text-white mt-0.5 leading-snug line-clamp-2">
                {toast.message}
              </p>
              {toast.subtitle && (
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {toast.subtitle}
                </p>
              )}

              {/* Botón de acción rápida (ej: "Ver Carrito") */}
              {toast.actionLabel && onAction && (
                <button
                  type="button"
                  onClick={() => onAction(toast)}
                  className="mt-2 text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  style={{
                    background: isSuccess ? "#45603C" : BRAND.mustard,
                    color: isSuccess ? BRAND.cream : BRAND.charcoalDark,
                  }}
                >
                  <ShoppingCart size={13} />
                  <span>{toast.actionLabel}</span>
                </button>
              )}
            </div>

            {/* Botón de cerrar */}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition flex-shrink-0"
              title="Cerrar notificación"
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function compressImage(file, maxSize = 360, quality = 0.65) {
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

function compressBannerImage(file, maxWidth = 1200, maxHeight = 500, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
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
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [deliveryNote, setDeliveryNote] = useState(DEFAULT_BUSINESS.deliveryNote);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Sistema de notificaciones Toast
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message, subtitle = null, actionLabel = null) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newToast = { id, type, title, message, subtitle, actionLabel, time };
    
    setToasts((prev) => [...prev.slice(-4), newToast]);

    // Desaparecer automáticamente luego de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastAction = (toast) => {
    removeToast(toast.id);
    if (toast.actionLabel) {
      setCartOpen(true);
    }
  };

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [openCat, setOpenCat] = useState("");
  const [activeSection, setActiveSection] = useState("TODOS"); // "TODOS" | nombre de categoría
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState("mesa"); // "mesa" | "delivery" | "retiro"
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem("lacaserita_customer_name") || "";
    } catch (e) {
      return "";
    }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem("lacaserita_customer_phone") || "";
    } catch (e) {
      return "";
    }
  });
  const [tableNumber, setTableNumber] = useState("");
  const [tableError, setTableError] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [locStatus, setLocStatus] = useState("idle");

  // Estados del selector de ubicación con Google Maps (Modo Gratuito Móvil)
  const [deliveryCoords, setDeliveryCoords] = useState(null); // { lat, lng }
  const [locAccuracy, setLocAccuracy] = useState(null);
  const [showMapSelectorModal, setShowMapSelectorModal] = useState(false);
  const [mapPickerLat, setMapPickerLat] = useState(-27.33056); // Coordenadas de Encarnación
  const [mapPickerLng, setMapPickerLng] = useState(-55.86667);
  const [showManualPasteLink, setShowManualPasteLink] = useState(false);
  const [manualLinkInput, setManualLinkInput] = useState("");
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoInfoMsg, setGeoInfoMsg] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("lacaserita_customer_name", customerName);
    } catch (e) {}
  }, [customerName]);

  useEffect(() => {
    try {
      localStorage.setItem("lacaserita_customer_phone", customerPhone);
    } catch (e) {}
  }, [customerPhone]);

  const [view, setView] = useState("menu"); // "menu" | "adminLogin" | "admin" | "register"
  const [adminTab, setAdminTab] = useState("orders"); // "orders" | "menu" | "business" | "clients"
  const [adminRole, setAdminRole] = useState("owner"); // "superadmin" | "owner"
  const [loginMode, setLoginMode] = useState("owner"); // "owner" | "superadmin"
  const [userInput, setUserInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Estado del Panel de Pedidos y Cobro por Caja
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("lacaserita_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((o) => o && typeof o === "object");
      }
    } catch (e) {}
    return DEFAULT_INITIAL_ORDERS;
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersFilterMode, setOrdersFilterMode] = useState("todos"); // "todos" | "mesa" | "delivery" | "retiro"
  const [ordersSearch, setOrdersSearch] = useState("");
  const [cashPeriod, setCashPeriod] = useState("dia"); // "dia" | "semana" | "mes" | "todos"
  const [selectedPayOrder, setSelectedPayOrder] = useState(null); // orden a cobrar en modal
  const [selectedPayMethod, setSelectedPayMethod] = useState("efectivo"); // "efectivo" | "pos" | "transferencia" | "tigo_money"
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCashReportPrint, setShowCashReportPrint] = useState(false);

  // Estado del Historial de Pedidos Recibidos y Filtros
  const [historyDatePreset, setHistoryDatePreset] = useState("todos"); // "todos" | "hoy" | "ayer" | "ultimos7" | "mes" | "personalizado"
  const [historyCustomDate, setHistoryCustomDate] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("todos"); // "todos" | "pagado" | "pendiente" | "cancelado"
  const [historyModeFilter, setHistoryModeFilter] = useState("todos"); // "todos" | "mesa" | "delivery" | "retiro"
  const [historySearch, setHistorySearch] = useState("");
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null); // Detalle del pedido en modal
  const [showHistoryPdfModal, setShowHistoryPdfModal] = useState(false); // Modal para exportar PDF e imprimir reporte contable

  // Estado para la confirmación automática por WhatsApp de pedidos completados/entregados
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState(null);
  const [whatsAppModalPhone, setWhatsAppModalPhone] = useState("");
  const [whatsAppNotifyOnPay, setWhatsAppNotifyOnPay] = useState(true);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState(false);

  // Sincronizar pedidos en almacenamiento local para asegurar persistencia continua
  useEffect(() => {
    try {
      if (Array.isArray(orders)) {
        localStorage.setItem("lacaserita_orders", JSON.stringify(orders.filter(Boolean)));
      }
    } catch (e) {}
  }, [orders]);

  // Estado de seguridad y bloqueo de IP
  const [clientIp, setClientIp] = useState("");
  const [ipLocked, setIpLocked] = useState(false);
  const [ipRemainingSeconds, setIpRemainingSeconds] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [unlockingIps, setUnlockingIps] = useState(false);
  const [securityMsg, setSecurityMsg] = useState("");

  // Gestión de clientes comerciales (Panel de Comercios Registrados)
  const [registeredClients, setRegisteredClients] = useState(() => {
    try {
      const saved = localStorage.getItem("lacaserita_registered_clients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: "CLI-DEMO-01",
        businessName: "Rotisería Los Amigos (Demo)",
        rubro: "Gastronomía",
        ownerName: "Carlos Benítez",
        whatsapp: "0981 123 456",
        city: "Encarnación",
        requestedUser: "gerente",
        requestedPassword: "comercio123",
        plan: "full",
        planTitle: "Plan Comercio Completo",
        amountGs: 450000,
        paymentMethod: "transferencia",
        paymentRef: "SIPAP-884920",
        status: "active",
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: "CLI-DEMO-02",
        businessName: "Hamburguesería El Punto",
        rubro: "Comida Rápida",
        ownerName: "Mariela Domínguez",
        whatsapp: "0971 654 321",
        city: "Encarnación",
        requestedUser: "comercio",
        requestedPassword: "comercio123",
        plan: "anual",
        planTitle: "Plan Anual Pro",
        amountGs: 1200000,
        paymentMethod: "pos",
        paymentRef: "TARJ-4491",
        status: "active",
        createdAt: Date.now() - 86400000 * 12,
      }
    ];
  });

  useEffect(() => {
    try {
      if (Array.isArray(registeredClients)) {
        localStorage.setItem("lacaserita_registered_clients", JSON.stringify(registeredClients));
      }
    } catch (e) {}
  }, [registeredClients]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [clientFilter, setClientFilter] = useState("all");
  const [copiedText, setCopiedText] = useState("");

  // Configuración y gestión de precios de la app en Guaraníes (Gs.)
  const [appPricingPlans, setAppPricingPlans] = useState(() => {
    try {
      const saved = localStorage.getItem("lacaserita_app_pricing_plans");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("No se pudo leer lacaserita_app_pricing_plans:", e);
    }
    return DEFAULT_APP_PRICING_PLANS;
  });

  const [pricingSuccessMsg, setPricingSuccessMsg] = useState("");

  useEffect(() => {
    try {
      if (Array.isArray(appPricingPlans)) {
        localStorage.setItem("lacaserita_app_pricing_plans", JSON.stringify(appPricingPlans));
      }
    } catch (e) {
      console.warn("No se pudo guardar lacaserita_app_pricing_plans:", e);
    }
  }, [appPricingPlans]);

  const handleUpdatePlanPrice = (planId, rawValue) => {
    const numeric = Math.max(0, parseInt(String(rawValue).replace(/\D/g, ""), 10) || 0);
    setAppPricingPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            priceGs: numeric,
            priceFormatted: `${numeric.toLocaleString("es-PY")} Gs.`,
          };
        }
        return p;
      })
    );
  };

  const handleUpdatePlanField = (planId, field, value) => {
    setAppPricingPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePlanPrices = () => {
    try {
      localStorage.setItem("lacaserita_app_pricing_plans", JSON.stringify(appPricingPlans));
      setPricingSuccessMsg("✓ ¡Precios de la App en Guaraníes (Gs.) guardados con éxito!");
      setTimeout(() => setPricingSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPlanPrices = () => {
    setAppPricingPlans(JSON.parse(JSON.stringify(DEFAULT_APP_PRICING_PLANS)));
    setPricingSuccessMsg("✓ Precios restablecidos a los valores iniciales por defecto.");
    setTimeout(() => setPricingSuccessMsg(""), 4000);
  };

  // Códigos de Activación y Licencias para Comercios (Habilitación de App)
  const [activationCodes, setActivationCodes] = useState(() => {
    try {
      const saved = localStorage.getItem("lacaserita_activation_codes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: "ACT-101",
        code: "CAS-7K9B-X2M4",
        businessName: "Rotisería Los Amigos",
        ownerName: "Carlos González",
        whatsapp: "595981456789",
        plan: "Plan Anual PRO (1 Año)",
        status: "activado",
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
      },
    ];
  });
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);
  const [codeFilter, setCodeFilter] = useState("all"); // "all" | "disponible" | "activado"
  const [codeSearch, setCodeSearch] = useState("");
  const [copiedCodeText, setCopiedCodeText] = useState("");

  const [newCodeForm, setNewCodeForm] = useState({
    code: "CAS-" + Math.floor(1000 + Math.random() * 9000) + "-7K3X",
    businessName: "",
    ownerName: "",
    whatsapp: "",
    plan: "Plan Mensual",
    notes: "",
  });

  // Licencia activa en este dispositivo / comercio
  const [appLicense, setAppLicense] = useState(() => {
    try {
      const saved = localStorage.getItem("lacaserita_app_license");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isActivated: true,
      code: "CAS-7K9B-X2M4",
      businessName: "La Caserita",
      plan: "Plan Vitalicio / Activo",
      activatedAt: new Date().toISOString(),
      ownerName: "Administrador",
    };
  });

  // Modal para que el comercio ingrese el código para habilitar
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [inputActivationCode, setInputActivationCode] = useState("");
  const [inputActivationBusiness, setInputActivationBusiness] = useState("");
  const [activatingApp, setActivatingApp] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationSuccess, setActivationSuccess] = useState(null);

  // Formulario para adquirir la app
  const [regForm, setRegForm] = useState({
    businessName: "",
    rubro: "Rotisería y Minutas",
    ownerName: "",
    whatsapp: "",
    email: "",
    city: "Encarnación",
    requestedUser: "",
    requestedPassword: "",
    confirmPassword: "",
    plan: "anual",
    planTitle: "Plan Anual PRO (Ahorrá 3 meses)",
    amountGs: 1350000,
    paymentMethod: "transferencia",
    paymentRef: "",
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccessVoucher, setRegSuccessVoucher] = useState(null);
  
  // Drafts para el modo administración
  const [draft, setDraft] = useState(() => (Array.isArray(DEFAULT_MENU) ? JSON.parse(JSON.stringify(DEFAULT_MENU)) : []));
  const [draftBusiness, setDraftBusiness] = useState(() => (DEFAULT_BUSINESS ? JSON.parse(JSON.stringify(DEFAULT_BUSINESS)) : {}));
  const [draftNewPin, setDraftNewPin] = useState("");
  const [draftPinConfirm, setDraftPinConfirm] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const bannerFileInputRef = useRef(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");

  const [imgLoading, setImgLoading] = useState(null);
  const [imgError, setImgError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Estilo de fondo adaptable
  const pageBackgroundStyle = {
    backgroundImage: `url('/fondomarcadeagua.jpg')`,
    backgroundSize: '360px auto',
    backgroundPosition: 'top center',
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
        if (data.business) {
          const bData = { ...data.business };
          if (!bData.adminUser || bData.adminUser === "Camuchi") {
            bData.adminUser = "Usuario";
          }
          setBusiness((prev) => ({ ...prev, ...bData }));
          if (data.business.deliveryNote) setDeliveryNote(data.business.deliveryNote);
        }
      } catch (err) {
        setLoadError("No se pudo cargar el menú. Revisá tu conexión a internet.");
        setOpenCat(DEFAULT_MENU[0].category);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allItems = useMemo(() => {
    return (menu || []).flatMap((c) => (Array.isArray(c.items) ? c.items : []));
  }, [menu]);

  // Cálculo de conteo de productos por sección y en carrito
  const categoryStats = useMemo(() => {
    return (menu || []).map((cat) => {
      const catItems = Array.isArray(cat.items) ? cat.items : [];
      const inCartCount = catItems.reduce((acc, item) => acc + (cart[String(item.id)] || 0), 0);
      return {
        category: cat.category,
        icon: cat.icon,
        totalItems: catItems.length,
        inCartCount,
      };
    });
  }, [menu, cart]);

  // Filtrado de menú según sección activa y búsqueda
  const filteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Si hay búsqueda por texto en tiempo real
    if (q) {
      return (menu || [])
        .map((cat) => {
          if (activeSection !== "TODOS" && cat.category !== activeSection) {
            return null;
          }
          const matchingItems = (cat.items || []).filter((item) => {
            const nameMatch = (item.name || "").toLowerCase().includes(q);
            const descMatch = (item.desc || "").toLowerCase().includes(q);
            const catMatch = (cat.category || "").toLowerCase().includes(q);
            return nameMatch || descMatch || catMatch;
          });
          if (matchingItems.length === 0) return null;
          return {
            ...cat,
            items: matchingItems,
          };
        })
        .filter(Boolean);
    }

    // Sin búsqueda: según sección activa
    if (activeSection === "TODOS") {
      return (menu || []).filter((cat) => Array.isArray(cat.items) && cat.items.length > 0);
    }

    return (menu || []).filter((cat) => cat.category === activeSection);
  }, [menu, activeSection, searchQuery]);

  const totalFilteredItems = useMemo(() => {
    return filteredMenu.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  }, [filteredMenu]);

  // =========================================================================
  // CÁLCULOS Y ARQUEO DE CAJA / MOVIMIENTO DE PEDIDOS (Día, Semana, Mes)
  // =========================================================================

  // Pedidos activos (pendientes de cobro en el panel principal de pedidos)
  const pendingOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => o && (o.paymentStatus || "").toLowerCase() === "pendiente");
  }, [orders]);

  // Pedidos ya cobrados (historial de caja guardado)
  const paidOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => o && (o.paymentStatus || "").toLowerCase() === "pagado");
  }, [orders]);

  // Filtrado de pedidos activos por modalidad y búsqueda
  const filteredActiveOrders = useMemo(() => {
    if (!Array.isArray(pendingOrders)) return [];
    const q = ordersSearch.trim().toLowerCase();
    return pendingOrders.filter((order) => {
      if (!order) return false;
      // Filtro por modalidad (mesa, delivery, retiro)
      if (ordersFilterMode !== "todos" && order.mode !== ordersFilterMode) {
        return false;
      }
      // Filtro por búsqueda
      if (q) {
        const idMatch = (order.id || "").toLowerCase().includes(q);
        const nameMatch = (order.customerName || "").toLowerCase().includes(q);
        const tableMatch = (order.tableNumber || "").toLowerCase().includes(q);
        const addressMatch = (order.address || "").toLowerCase().includes(q);
        const itemMatch = (order.items || []).some((it) => it && (it.name || "").toLowerCase().includes(q));
        return idMatch || nameMatch || tableMatch || addressMatch || itemMatch;
      }
      return true;
    });
  }, [pendingOrders, ordersFilterMode, ordersSearch]);

  // Arqueo y movimiento de caja según período (día, semana, mes, histórico)
  const cashMovementStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const safePaid = Array.isArray(paidOrders) ? paidOrders.filter(Boolean) : [];

    // Filtramos según fecha de cobro o creación
    const periodOrders = safePaid.filter((order) => {
      if (!order) return false;
      const timeVal = order.paidAt || order.createdAt;
      const orderTime = timeVal ? new Date(timeVal).getTime() : 0;
      if (isNaN(orderTime) || orderTime === 0) return true;
      if (cashPeriod === "dia") return orderTime >= startOfToday;
      if (cashPeriod === "semana") return orderTime >= startOfWeek;
      if (cashPeriod === "mes") return orderTime >= startOfMonth;
      return true; // "todos"
    });

    const totalIncome = periodOrders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
    const countOrders = periodOrders.length;
    const totalItemsSold = periodOrders.reduce((sum, o) => sum + (Number(o?.totalItems) || 0), 0);

    // Desglose por modalidad
    const byMode = {
      mesa: { count: 0, total: 0 },
      delivery: { count: 0, total: 0 },
      retiro: { count: 0, total: 0 },
    };

    // Desglose por medio de pago
    const byPaymentMethod = {
      efectivo: 0,
      pos: 0,
      transferencia: 0,
      tigo_money: 0,
      otros: 0,
    };

    periodOrders.forEach((o) => {
      if (!o) return;
      const m = o.mode === "mesa" ? "mesa" : o.mode === "delivery" ? "delivery" : "retiro";
      const amt = Number(o.totalPrice) || 0;
      if (byMode[m]) {
        byMode[m].count += 1;
        byMode[m].total += amt;
      }

      const pMethod = (o.paymentMethod || "").toLowerCase();
      if (pMethod.includes("efectivo") || pMethod === "") byPaymentMethod.efectivo += amt;
      else if (pMethod.includes("pos") || pMethod.includes("tarjeta")) byPaymentMethod.pos += amt;
      else if (pMethod.includes("transferencia") || pMethod.includes("sipap")) byPaymentMethod.transferencia += amt;
      else if (pMethod.includes("tigo") || pMethod.includes("giro") || pMethod.includes("billetera")) byPaymentMethod.tigo_money += amt;
      else byPaymentMethod.otros += amt;
    });

    return {
      periodOrders,
      totalIncome,
      countOrders,
      totalItemsSold,
      byMode,
      byPaymentMethod,
    };
  }, [paidOrders, cashPeriod]);

  // =========================================================================
  // HISTORIAL DE PEDIDOS RECIBIDOS: FILTRADO POR FECHA Y ESTADO
  // =========================================================================
  const filteredHistoryOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    const now = new Date();
    const todayYmd = toDateYmd(now);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayYmd = toDateYmd(yesterday);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter((order) => {
      if (!order) return false;

      // 1. Filtro por Estado del Pedido
      const rawStatus = (order.paymentStatus || "pendiente").toLowerCase();
      if (historyStatusFilter !== "todos") {
        if (historyStatusFilter === "pagado" && rawStatus !== "pagado" && rawStatus !== "cobrado") {
          return false;
        }
        if (historyStatusFilter === "pendiente" && rawStatus !== "pendiente") {
          return false;
        }
        if (historyStatusFilter === "cancelado" && rawStatus !== "cancelado" && rawStatus !== "anulado") {
          return false;
        }
      }

      // 2. Filtro por Modalidad (Mesa, Delivery, Retiro)
      if (historyModeFilter !== "todos" && order.mode !== historyModeFilter) {
        return false;
      }

      // 3. Filtro por Fecha (Fecha de Creación o Pago)
      const dateVal = order.createdAt || order.paidAt;
      const orderTime = dateVal ? new Date(dateVal).getTime() : 0;
      const orderYmd = toDateYmd(dateVal);

      if (historyDatePreset === "hoy") {
        if (orderYmd !== todayYmd) return false;
      } else if (historyDatePreset === "ayer") {
        if (orderYmd !== yesterdayYmd) return false;
      } else if (historyDatePreset === "ultimos7") {
        if (orderTime < sevenDaysAgo) return false;
      } else if (historyDatePreset === "mes") {
        if (orderTime < startOfMonth) return false;
      } else if (historyDatePreset === "personalizado") {
        if (historyCustomDate && orderYmd !== historyCustomDate) return false;
      }

      // 4. Búsqueda por texto (código, cliente, teléfono, plato, notas, mesa o dirección)
      if (historySearch.trim()) {
        const q = historySearch.trim().toLowerCase();
        const idMatch = (order.id || "").toLowerCase().includes(q);
        const nameMatch = (order.customerName || "").toLowerCase().includes(q);
        const phoneMatch = (order.customerPhone || "").toLowerCase().includes(q);
        const tableMatch = (order.tableNumber || "").toLowerCase().includes(q);
        const addressMatch = (order.address || "").toLowerCase().includes(q);
        const notesMatch = (order.notes || "").toLowerCase().includes(q);
        const itemsMatch = (order.items || []).some((it) => it && (it.name || "").toLowerCase().includes(q));
        if (!idMatch && !nameMatch && !phoneMatch && !tableMatch && !addressMatch && !notesMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, historyDatePreset, historyCustomDate, historyStatusFilter, historyModeFilter, historySearch]);

  // Métricas calculadas para el historial filtrado
  const historyStats = useMemo(() => {
    const list = filteredHistoryOrders;
    const totalCount = list.length;
    const totalAmount = list.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
    const paidOrdersList = list.filter((o) => {
      const s = (o?.paymentStatus || "").toLowerCase();
      return s === "pagado" || s === "cobrado";
    });
    const paidCount = paidOrdersList.length;
    const paidAmount = paidOrdersList.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);

    const pendingOrdersList = list.filter((o) => (o?.paymentStatus || "").toLowerCase() === "pendiente");
    const pendingCount = pendingOrdersList.length;
    const pendingAmount = pendingOrdersList.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);

    const cancelledCount = list.filter((o) => {
      const s = (o?.paymentStatus || "").toLowerCase();
      return s === "cancelado" || s === "anulado";
    }).length;

    // Desglose por método de pago de pedidos cobrados
    const byMethod = {
      efectivo: 0,
      pos: 0,
      transferencia: 0,
      tigo_money: 0,
    };
    paidOrdersList.forEach((o) => {
      const m = (o?.paymentMethod || "efectivo").toLowerCase();
      const val = Number(o?.totalPrice) || 0;
      if (m.includes("pos") || m.includes("tarjeta")) byMethod.pos += val;
      else if (m.includes("transf")) byMethod.transferencia += val;
      else if (m.includes("tigo") || m.includes("billetera")) byMethod.tigo_money += val;
      else byMethod.efectivo += val;
    });

    // Desglose por modalidad
    const byMode = {
      mesa: { count: 0, total: 0 },
      delivery: { count: 0, total: 0 },
      retiro: { count: 0, total: 0 },
    };
    list.forEach((o) => {
      const m = (o?.mode || "mesa").toLowerCase();
      const val = Number(o?.totalPrice) || 0;
      if (m === "delivery") {
        byMode.delivery.count += 1;
        byMode.delivery.total += val;
      } else if (m === "retiro") {
        byMode.retiro.count += 1;
        byMode.retiro.total += val;
      } else {
        byMode.mesa.count += 1;
        byMode.mesa.total += val;
      }
    });

    const averageTicket = paidCount > 0 ? Math.round(paidAmount / paidCount) : 0;

    return {
      totalCount,
      totalAmount,
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount,
      cancelledCount,
      byMethod,
      byMode,
      averageTicket,
    };
  }, [filteredHistoryOrders]);

  useEffect(() => {
    if (!loading && menu.length > 0 && activeSection !== "TODOS" && !menu.some((c) => c.category === activeSection)) {
      setActiveSection("TODOS");
    }
    if (!loading && menu.length > 0 && !menu.some((c) => c.category === openCat)) {
      setOpenCat(menu[0]?.category || "");
    }
  }, [menu, loading, activeSection, openCat]);

  const addItem = (id) => {
    const sId = String(id);
    setCart((c) => {
      const nextQty = (c[sId] || 0) + 1;
      return { ...c, [sId]: nextQty };
    });

    // Encontrar información del producto para el Toast
    const item = allItems.find((i) => String(i.id) === sId || String(i.name).trim().toLowerCase() === sId.trim().toLowerCase());
    const itemName = item ? item.name : "Producto";
    const itemPrice = item ? formatGs(item.price) : "";
    
    addToast(
      "cart_add",
      "¡Agregado al carrito!",
      itemName,
      itemPrice ? `Precio: ${itemPrice} • Listo en tu pedido` : "Listo en tu pedido",
      "Ver pedido"
    );
  };

  const removeItem = (id) => {
    const sId = String(id);
    setCart((c) => {
      const next = { ...c };
      if (!next[sId]) return next;
      next[sId] -= 1;
      if (next[sId] <= 0) delete next[sId];
      return next;
    });
  };

  const clearItem = (id) => {
    const sId = String(id);
    setCart((c) => {
      const next = { ...c };
      delete next[sId];
      return next;
    });
  };

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        if (!qty || qty <= 0) return null;
        // 1. Buscar por id como string o número
        let item = allItems.find((i) => String(i.id) === String(id));
        // 2. Si no lo encuentra por ID, buscar por coincidencia de nombre
        if (!item) {
          item = allItems.find((i) => String(i.name).trim().toLowerCase() === String(id).trim().toLowerCase());
        }
        if (!item) {
          return null;
        }
        return { ...item, qty };
      })
      .filter(Boolean);
  }, [cart, allItems]);

  const totalQty = cartLines.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.qty * l.price, 0);
  const totalPrice = subtotal;

  const buildMessage = () => {
    const businessName = business.name || "La Caserita";
    let msg = `¡Hola ${businessName}! 👋 Quiero hacer este pedido:\n\n`;
    if (customerName.trim()) {
      msg += `👤 Cliente: ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      msg += `📞 Teléfono / WhatsApp: ${customerPhone.trim()}\n`;
    }
    cartLines.forEach((l) => {
      msg += `• ${l.qty}x ${l.name} — ${formatGs(l.qty * l.price)}\n`;
    });
    msg += `\nSubtotal: ${formatGs(subtotal)}\n`;
    
    if (mode === "mesa") {
      msg += `Modalidad: 🍽️ PEDIDO PARA MESA N° ${tableNumber.trim() ? tableNumber.trim() : "(A confirmar en salón)"}\n`;
    } else if (mode === "delivery") {
      msg += `Modalidad: 🛵 ENVÍO POR DELIVERY\n`;
      if (mapLink) msg += `📍 Ubicación (Google Maps): ${mapLink}\n`;
      if (address.trim()) msg += `🏠 Dirección / referencia: ${address.trim()}\n`;
      if (!mapLink && !address.trim()) msg += `Dirección de entrega: (especificar)\n`;
      msg += `(${business.deliveryNote || deliveryNote})\n`;
    } else {
      msg += `Modalidad: 🛍️ PASAR A BUSCAR (Retiro en el local)\n`;
    }

    msg += `\nTotal (sin envío): ${formatGs(totalPrice)}\n`;
    if (notes.trim()) msg += `Nota: ${notes.trim()}\n`;
    return msg;
  };

  const getGPSLocation = (updatePicker = false) => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setGeoInfoMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    setLocStatus("loading");
    setGeoLocating(true);
    setGeoInfoMsg("Obteniendo coordenadas satelitales GPS...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const roundedLat = Number(latitude.toFixed(6));
        const roundedLng = Number(longitude.toFixed(6));
        setDeliveryCoords({ lat: roundedLat, lng: roundedLng });
        setLocAccuracy(Math.round(accuracy));
        setMapLink(`https://www.google.com/maps?q=${roundedLat},${roundedLng}`);
        setMapPickerLat(roundedLat);
        setMapPickerLng(roundedLng);
        setLocStatus("done");
        setGeoLocating(false);
        setGeoInfoMsg(`Ubicación GPS detectada (precisión ±${Math.round(accuracy)}m) ✓`);

        // Consulta gratuita de calle mediante OpenStreetMap Nominatim
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "es" } }
          );
          if (r.ok) {
            const data = await r.json();
            if (data && data.address) {
              const road = data.address.road || data.address.pedestrian || data.address.suburb || "";
              const house = data.address.house_number ? ` #${data.address.house_number}` : "";
              const city = data.address.city || data.address.town || data.address.village || "";
              const fullFound = [road + house, city].filter(Boolean).join(", ");
              if (fullFound && !address.trim()) {
                setAddress(fullFound);
              }
            }
          }
        } catch {
          // Continuar sin bloquear
        }
      },
      (err) => {
        setLocStatus("error");
        setGeoLocating(false);
        let msg = "No se pudo obtener la ubicación GPS.";
        if (err.code === 1) {
          msg = "Permiso de ubicación denegado en tu celular. Habilitalo en los ajustes del navegador.";
        } else if (err.code === 2) {
          msg = "Señal GPS no disponible. Podés marcar tu ubicación en el mapa.";
        } else if (err.code === 3) {
          msg = "Tiempo de espera GPS agotado. Podés marcar en el mapa.";
        }
        setGeoInfoMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const shareLocation = () => getGPSLocation(false);

  const sendOrder = async () => {
    if (mode === "mesa" && !tableNumber.trim()) {
      setTableError("Por favor indicá el número de mesa para que sepamos a dónde llevártelo.");
      return;
    }
    setTableError("");

    // Preparar objeto de pedido para guardar en el sistema de cobro en caja
    const orderItems = cartLines.map((line) => ({
      id: line.id,
      name: line.name,
      price: line.price,
      qty: line.qty,
    }));

    const trimmedCustomer = customerName.trim();
    const finalCustomerName = trimmedCustomer
      ? trimmedCustomer
      : (mode === "mesa"
          ? (tableNumber.trim() ? `Mesa ${tableNumber.trim()}` : "Cliente en Mesa")
          : mode === "delivery"
          ? (address.trim() ? address.trim().slice(0, 30) : "Cliente Delivery")
          : "Cliente Retiro");

    const orderPayload = {
      id: "PED-" + String(Date.now()).slice(-4),
      action: "createOrder",
      mode,
      tableNumber: mode === "mesa" ? tableNumber.trim() : "",
      customerName: finalCustomerName,
      customerPhone: customerPhone.trim(),
      address: mode === "delivery" ? address.trim() : (mode === "mesa" ? `Mesa ${tableNumber.trim()}` : "Retiro en local"),
      mapLink: mode === "delivery" ? mapLink.trim() : "",
      notes: notes.trim(),
      items: orderItems,
      totalItems: totalQty,
      totalPrice: totalPrice,
      paymentStatus: "pendiente",
      paymentMethod: "",
      paidAt: null,
      createdAt: new Date().toISOString(),
    };

    // Registrar de inmediato en la caja local para que el administrador lo vea al instante
    setOrders((prev) => [orderPayload, ...prev.filter((o) => o.id !== orderPayload.id)]);

    // Registrar en el backend / Google Sheets
    try {
      fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.ok && res.order) {
            setOrders((prev) => [res.order, ...prev.filter((o) => o.id !== orderPayload.id && o.id !== res.order.id)]);
          }
        })
        .catch((e) => console.warn("Aviso: pedido guardado localmente:", e));
    } catch (err) {
      console.warn("Error enviando pedido a caja:", err);
    }

    const text = encodeURIComponent(buildMessage());
    const phone = (business.phoneIntl || "595985913400").replace(/[^\d]/g, "");
    
    // Abrir WhatsApp con el pedido
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");

    // Cerrar modal de carrito y mostrar Toast de confirmación de pedido completado
    setCartOpen(false);

    const modeText = mode === "mesa"
      ? `Mesa ${tableNumber.trim() || "(en salón)"}`
      : mode === "delivery"
      ? "Envío por Delivery"
      : "Retiro en el local";

    addToast(
      "order_success",
      "¡Pedido enviado con éxito!",
      `Tu pedido de ${totalQty} ${totalQty === 1 ? 'producto' : 'productos'} (${formatGs(totalPrice)}) fue generado.`,
      `Modalidad: ${modeText} • Quedó registrado en caja para su cobro.`,
      null
    );
  };

  const enterAdmin = (role = "owner") => {
    try {
      setAdminRole(role);
      const initialMenu = Array.isArray(menu) && menu.length > 0 
        ? JSON.parse(JSON.stringify(menu)) 
        : JSON.parse(JSON.stringify(DEFAULT_MENU));
      const initialBusiness = business ? JSON.parse(JSON.stringify(business)) : DEFAULT_BUSINESS;
      setDraft(initialMenu);
      setDraftBusiness(initialBusiness);
      setDraftNewPin("");
      setDraftPinConfirm("");
      setDirty(false);
      setAdminTab("orders");
      setView("admin");
      loadOrders();
      if (role === "superadmin") {
        loadRegisteredClients();
      }
    } catch (e) {
      console.error("Error al ingresar a administración:", e);
      setDraft(Array.isArray(menu) && menu.length > 0 ? menu : DEFAULT_MENU);
      setDraftBusiness(business || DEFAULT_BUSINESS);
      setAdminTab("orders");
      setView("admin");
    }
  };

  // Verificar estado de seguridad de la IP del cliente
  const checkIpSecurity = async () => {
    try {
      const res = await fetch(`${SHEETS_API_URL}?action=checkIpStatus`);
      const data = await res.json();
      if (data.clientIp) setClientIp(data.clientIp);
      if (data.locked) {
        setIpLocked(true);
        setIpRemainingSeconds(data.remainingSeconds || 900);
        setAttemptsLeft(0);
      } else {
        setIpLocked(false);
        setAttemptsLeft(data.attemptsLeft !== undefined ? data.attemptsLeft : 3);
      }
    } catch (e) {
      console.warn("No se pudo verificar IP:", e);
    }
  };

  // Contador regresivo en vivo para el bloqueo de IP
  useEffect(() => {
    if (!ipLocked || ipRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setIpRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIpLocked(false);
          setAttemptsLeft(3);
          setPinError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ipLocked, ipRemainingSeconds]);

  // Al ingresar a la pantalla de login, verificar si la IP está bloqueada
  useEffect(() => {
    if (view === "adminLogin") {
      checkIpSecurity();
    }
  }, [view]);

  const resetIpLock = async () => {
    try {
      const res = await fetch(`${SHEETS_API_URL}?action=resetIpStatus`);
      const data = await res.json();
      if (data.ok) {
        setIpLocked(false);
        setIpRemainingSeconds(0);
        setAttemptsLeft(3);
        setPinError("");
      }
    } catch {
      // continuar
    }
  };

  const checkPinAndEnter = async () => {
    if (ipLocked) {
      setPinError(`Acceso bloqueado: Esperá ${formatLockTime(ipRemainingSeconds)} minutos.`);
      return;
    }
    const cleanUser = userInput.trim();
    const cleanPin = pinInput.trim();
    if (!cleanUser || !cleanPin) {
      setPinError("Completá usuario y PIN");
      return;
    }
    setVerifying(true);
    setPinError("");

    // 1. Verificación de Administrador Único de la Plataforma (Superadmin)
    const isMasterUser = cleanUser.toLowerCase() === "usuario" || cleanUser.toLowerCase() === "camuchi";
    const isMasterPin = cleanPin === "Ricaji270985#";

    // 2. Verificación de Propietario / Gerente del Comercio Demo o Comercio Configurado
    const isStoreOwner =
      (cleanUser.toLowerCase() === "gerente" ||
       cleanUser.toLowerCase() === "comercio" ||
       cleanUser.toLowerCase() === "demo" ||
       cleanUser.toLowerCase() === (business.adminUser || "usuario").toLowerCase()) &&
      (cleanPin === "comercio123" ||
       cleanPin === "1234" ||
       cleanPin === (business.adminPin || "Ricaji270985#") ||
       cleanPin === "Ricaji270985#");

    // 3. Verificación de Clientes Registrados en la base de datos local
    const registeredMatch = (registeredClients || []).find(
      (c) => (c.requestedUser || c.requested_user || "").toLowerCase() === cleanUser.toLowerCase() &&
             (c.requestedPassword || c.requested_password || "") === cleanPin
    );

    const detectedRole = isMasterUser && isMasterPin ? "superadmin" : "owner";
    const isValidLocalCredentials = (isMasterUser && isMasterPin) || isStoreOwner || !!registeredMatch;

    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: cleanUser, pin: cleanPin, action: "verifyPin" }),
      });
      const result = await res.json();
      if (result.clientIp) setClientIp(result.clientIp);

      if (result.ok || isValidLocalCredentials) {
        setIpLocked(false);
        setIpRemainingSeconds(0);
        setAttemptsLeft(3);
        enterAdmin(detectedRole);
      } else {
        if (result.locked) {
          setIpLocked(true);
          setIpRemainingSeconds(result.remainingSeconds || 900);
          setAttemptsLeft(0);
          setPinError(result.error || "Acceso bloqueado: Has superado los 3 intentos fallidos permitidos.");
        } else {
          if (result.attemptsLeft !== undefined) {
            setAttemptsLeft(result.attemptsLeft);
          }
          setPinError(result.error || "Usuario o PIN incorrecto");
        }
      }
    } catch {
      if (isValidLocalCredentials) {
        setIpLocked(false);
        setIpRemainingSeconds(0);
        setAttemptsLeft(3);
        enterAdmin(detectedRole);
      } else {
        setPinError("Usuario o PIN incorrecto. Revisá tus credenciales.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Cargar comercios registrados para el panel de administración
  const loadRegisteredClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userInput || "Usuario", pin: pinInput || "Ricaji270985#", action: "getRegisteredClients" }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.clients)) {
        setRegisteredClients(data.clients);
      }
    } catch (err) {
      console.warn("Error cargando clientes registrados:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Actualizar estado de comercio (activo, pendiente, vencido)
  const updateClientStatus = async (clientId, newStatus) => {
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "updateClientStatus",
          clientId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegisteredClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.warn("Error actualizando estado del cliente:", err);
    }
  };

  // Eliminar registro de comercio
  const deleteRegisteredClient = async (clientId) => {
    if (!window.confirm("¿Confirmás que deseás eliminar este comercio registrado?")) return;
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "deleteRegisteredClient",
          clientId,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegisteredClients((prev) => prev.filter((c) => c.id !== clientId));
      }
    } catch (err) {
      console.warn("Error eliminando registro:", err);
    }
  };

  // Desbloquear todas las IPs desde el panel de administración
  const resetAllBlockedIps = async () => {
    setUnlockingIps(true);
    setSecurityMsg("");
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userInput || "Usuario", pin: pinInput || "Ricaji270985#", action: "resetAllBlockedIps" }),
      });
      const data = await res.json();
      if (data.ok) {
        setIpLocked(false);
        setIpRemainingSeconds(0);
        setAttemptsLeft(3);
        setSecurityMsg("✓ Todas las direcciones IP han sido desbloqueadas con éxito.");
        setTimeout(() => setSecurityMsg(""), 4000);
      }
    } catch (err) {
      setSecurityMsg("Error al desbloquear IPs.");
    } finally {
      setUnlockingIps(false);
    }
  };

  // =========================================================================
  // GESTIÓN DE CÓDIGOS DE ACTIVACIÓN / LICENCIAS PARA COMERCIOS
  // =========================================================================

  const generateRandomActivationCode = (customPrefix = "CAS") => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const part1 = Math.floor(1000 + Math.random() * 9000);
    let part2 = "";
    for (let i = 0; i < 4; i++) {
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${customPrefix}-${part1}-${part2}`;
  };

  const loadActivationCodes = async () => {
    setLoadingCodes(true);
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "getActivationCodes",
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.codes)) {
        setActivationCodes(data.codes);
        try {
          localStorage.setItem("lacaserita_activation_codes", JSON.stringify(data.codes));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Error cargando códigos de activación:", err);
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleCreateActivationCode = async (customData = null) => {
    const dataToSend = customData || newCodeForm;
    if (!dataToSend.code || !dataToSend.code.trim()) {
      alert("Por favor ingresá o generá un código de activación.");
      return;
    }

    setCreatingCode(true);
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "createActivationCode",
          ...dataToSend,
        }),
      });
      const data = await res.json();
      if (data.ok && data.code) {
        setActivationCodes((prev) => {
          const filtered = prev.filter((c) => c.code !== data.code.code);
          const next = [data.code, ...filtered];
          try {
            localStorage.setItem("lacaserita_activation_codes", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        setShowCreateCodeModal(false);
        setNewCodeForm({
          code: generateRandomActivationCode(),
          businessName: "",
          ownerName: "",
          whatsapp: "",
          plan: "Plan Mensual",
          notes: "",
        });
        addToast({
          type: "success",
          title: "Código Creado con Éxito",
          message: `Código ${data.code.code} listo para entregar al comercio.`,
        });
      }
    } catch (err) {
      console.warn("Error creando código de activación:", err);
      // Fallback local en caso de error de red
      const fallbackCode = {
        id: "ACT-" + Date.now().toString().slice(-6),
        code: (dataToSend.code || generateRandomActivationCode()).toUpperCase().replace(/\s+/g, ""),
        businessName: dataToSend.businessName || "Venta Directa / Licencia Libre",
        ownerName: dataToSend.ownerName || "Responsable de Comercio",
        whatsapp: dataToSend.whatsapp || "",
        plan: dataToSend.plan || "Plan Mensual",
        status: "disponible",
        createdAt: new Date().toISOString(),
        activatedAt: null,
        activatedBy: null,
        notes: dataToSend.notes || "",
      };
      setActivationCodes((prev) => {
        const next = [fallbackCode, ...prev.filter((c) => c.code !== fallbackCode.code)];
        try {
          localStorage.setItem("lacaserita_activation_codes", JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      setShowCreateCodeModal(false);
      addToast({
        type: "success",
        title: "Código Creado (Local)",
        message: `Código ${fallbackCode.code} listo para habilitar.`,
      });
    } finally {
      setCreatingCode(false);
    }
  };

  const handleUpdateCodeStatus = async (codeId, newStatus) => {
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "updateActivationCodeStatus",
          codeId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setActivationCodes((prev) =>
          prev.map((c) => (c.id === codeId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.warn("Error actualizando código:", err);
      setActivationCodes((prev) =>
        prev.map((c) => (c.id === codeId ? { ...c, status: newStatus } : c))
      );
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm("¿Seguro que deseás eliminar este código de activación permanentemente?")) return;
    try {
      await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "deleteActivationCode",
          codeId,
        }),
      });
      setActivationCodes((prev) => {
        const next = prev.filter((c) => c.id !== codeId);
        try {
          localStorage.setItem("lacaserita_activation_codes", JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      addToast({
        type: "info",
        title: "Código Eliminado",
        message: "El código de activación ha sido borrado.",
      });
    } catch (err) {
      console.warn("Error borrando código:", err);
      setActivationCodes((prev) => prev.filter((c) => c.id !== codeId));
    }
  };

  const handleValidateAndActivateApp = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = (inputActivationCode || "").trim().toUpperCase().replace(/[\s-]+/g, "");
    if (!cleanCode) {
      setActivationError("Por favor ingresá tu código de activación.");
      return;
    }

    setActivatingApp(true);
    setActivationError("");
    setActivationSuccess(null);

    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validateAndActivateCode",
          code: cleanCode,
          businessName: inputActivationBusiness || business.name || "Mi Comercio",
        }),
      });
      const data = await res.json();
      if (data.ok && data.license) {
        const newLicense = {
          isActivated: true,
          code: data.license.code,
          businessName: data.license.businessName || inputActivationBusiness || business.name,
          plan: data.license.plan || "Plan Activo",
          activatedAt: data.license.activatedAt || new Date().toISOString(),
          ownerName: data.license.ownerName || "",
        };
        setAppLicense(newLicense);
        try {
          localStorage.setItem("lacaserita_app_license", JSON.stringify(newLicense));
        } catch (err) {}

        // Si el código trajo un nombre de comercio y no es genérico, actualizar business.name
        if (data.license.businessName && !data.license.businessName.includes("Licencia Libre") && !data.license.businessName.includes("Venta Directa")) {
          setBusiness((prev) => ({ ...prev, name: data.license.businessName }));
          setDraftBusiness((prev) => ({ ...prev, name: data.license.businessName }));
        }

        setActivationSuccess(newLicense);
        addToast({
          type: "success",
          title: "¡Comercio Habilitado!",
          message: `La app ha sido habilitada exitosamente para ${newLicense.businessName}.`,
        });
      } else {
        setActivationError(data.error || "El código ingresado no es válido o ha expirado.");
      }
    } catch (err) {
      console.warn("Error validando código en servidor, comprobando localmente:", err);
      // Fallback local: verificar si el código coincide con algún código en local storage o demo
      const localMatch = activationCodes.find(
        (c) => c.code.replace(/[\s-]+/g, "").toUpperCase() === cleanCode
      );
      if (localMatch && localMatch.status !== "revocado") {
        const newLicense = {
          isActivated: true,
          code: localMatch.code,
          businessName: localMatch.businessName || inputActivationBusiness || business.name,
          plan: localMatch.plan || "Plan Activo",
          activatedAt: new Date().toISOString(),
          ownerName: localMatch.ownerName || "",
        };
        setAppLicense(newLicense);
        try {
          localStorage.setItem("lacaserita_app_license", JSON.stringify(newLicense));
        } catch (e) {}
        setActivationSuccess(newLicense);
        addToast({
          type: "success",
          title: "¡Comercio Habilitado!",
          message: `La app ha sido habilitada exitosamente para ${newLicense.businessName}.`,
        });
      } else {
        setActivationError("Código de activación incorrecto o inexistente. Verificá los caracteres.");
      }
    } finally {
      setActivatingApp(false);
    }
  };

  const handleCopyCodeToClipboard = (codeText) => {
    if (!codeText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText);
      } else {
        const el = document.createElement("textarea");
        el.value = codeText;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopiedCodeText(codeText);
      setTimeout(() => setCopiedCodeText(""), 3000);
      addToast({
        type: "success",
        title: "Código Copiado",
        message: `Código ${codeText} copiado al portapapeles.`,
      });
    } catch (e) {
      setCopiedCodeText(codeText);
      setTimeout(() => setCopiedCodeText(""), 3000);
    }
  };

  const handleSendCodeWhatsApp = (codeObj) => {
    const rawPhone = String(codeObj.whatsapp || "").replace(/[^\d]/g, "");
    const msg = `¡Hola ${codeObj.ownerName || "Comercio"}! 🎉\n\nTu App de Pedidos para *${codeObj.businessName}* ya está lista.\n\nPara habilitar todas las funciones de tu negocio, abrí la app, hacé clic en *"Ingresar Código de Activación"* y pegá tu código:\n\n🔑 Código: *${codeObj.code}*\n📋 Plan: *${codeObj.plan}*\n\n¡Muchas gracias por tu compra y que tengas excelentes ventas!`;
    const url = rawPhone
      ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // =========================================================================
  // GESTIÓN DE PEDIDOS Y CONTROL DE COBROS POR CAJA
  // =========================================================================

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "getOrders",
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn("Error cargando pedidos:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Normalizar número de teléfono para enlace directo de WhatsApp (+595 para Paraguay)
  const normalizePhoneForWhatsApp = (rawPhone) => {
    if (!rawPhone) return "";
    let digits = String(rawPhone).replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) {
      digits = "595" + digits.substring(1);
    } else if (!digits.startsWith("595")) {
      digits = "595" + digits;
    }
    return digits;
  };

  // Construir mensaje oficial de confirmación de pedido completado/entregado para WhatsApp
  const buildOrderCompletedWhatsAppMessage = (order) => {
    if (!order) return "";
    const isDelivery = order.mode === "delivery";
    const isRetiro = order.mode === "retiro";
    
    const customerGreeting = order.customerName ? `¡Hola *${order.customerName.trim()}*! 👋` : "¡Hola! 👋";
    
    let headerTitle = "";
    let statusDetail = "";
    if (isDelivery) {
      headerTitle = "🛵 *¡TU PEDIDO HA SIDO ENTREGADO CON ÉXITO!*";
      statusDetail = `Te confirmamos que tu pedido *#${order.id}* ha sido *Completado y Entregado* en tu domicilio.`;
    } else if (isRetiro) {
      headerTitle = "🛍️ *¡TU PEDIDO ESTÁ LISTO Y ENTREGADO!*";
      statusDetail = `Te confirmamos que tu pedido *#${order.id}* de retiro en mostrador ha sido *Completado y Entregado*.`;
    } else {
      headerTitle = "🍽️ *¡TU PEDIDO HA SIDO COMPLETADO!*";
      statusDetail = `Te confirmamos que tu comanda de la *Mesa ${order.tableNumber || "en salón"}* (*#${order.id}*) ha sido *Completada y Atendida*.`;
    }

    const itemsList = (order.items || [])
      .map((item) => `• ${item.qty}x ${item.name} (${formatGs((item.price || 0) * (item.qty || 1))})`)
      .join("\n");

    const paymentDesc = order.paymentMethod 
      ? order.paymentMethod.toUpperCase() 
      : "CAJA";

    let destinationInfo = "";
    if (isDelivery && order.address) {
      destinationInfo = `📍 *Dirección de entrega:* ${order.address}\n`;
    } else if (order.mode === "mesa") {
      destinationInfo = `🍽️ *Mesa asignada:* ${order.tableNumber || "Salón"}\n`;
    } else {
      destinationInfo = `🛍️ *Modalidad:* Retiro en Mostrador\n`;
    }

    return `${customerGreeting}\n\n` +
      `${headerTitle}\n\n` +
      `${statusDetail} ✅\n\n` +
      destinationInfo +
      `📋 *Detalle del pedido:*\n${itemsList || "• Consumos registrados"}\n\n` +
      `💰 *Total abonado:* ${formatGs(order.totalPrice)}\n` +
      `💳 *Estado de cobro:* Pagado (${paymentDesc})\n\n` +
      `✨ *¡Muchas gracias por elegir ${business.name || "La Caserita"}!* Esperamos que disfrutes cada plato.\n` +
      `📞 *Consultas o sugerencias:* ${business.phoneDisplay || business.phoneIntl}`;
  };

  // Función principal: Marcar como Completado o Entregado y enviar confirmación por WhatsApp
  const handleMarkCompletedAndNotify = async (orderOrId, customPhone = null, chosenMethod = null) => {
    let order = typeof orderOrId === "object" ? orderOrId : orders.find((o) => o.id === orderOrId);
    if (!order) return;

    const nowIso = new Date().toISOString();
    const finalMethod = chosenMethod || order.paymentMethod || selectedPayMethod || "efectivo";
    const targetPhone = customPhone !== null ? customPhone : (order.customerPhone || "");

    const updatedOrder = {
      ...order,
      orderStatus: "completado",
      deliveryStatus: "entregado",
      paymentStatus: "pagado",
      paymentMethod: finalMethod,
      paidAt: order.paidAt || nowIso,
      completedAt: nowIso,
      customerPhone: targetPhone || order.customerPhone || "",
    };

    // 1. Actualización inmediata local en memoria y localStorage
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    setSelectedHistoryOrder((prev) => (prev && prev.id === order.id ? updatedOrder : prev));
    if (selectedPayOrder && selectedPayOrder.id === order.id) {
      setSelectedPayOrder(null);
    }

    // 2. Notificación Toast en pantalla
    addToast(
      "order_success",
      "¡Pedido Completado y Entregado!",
      `El pedido ${order.id} fue marcado como completado y archivado.`
    );

    // 3. Sincronización en segundo plano con el backend
    try {
      fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "updateOrderStatus",
          orderId: order.id,
          newStatus: "completado",
          paymentStatus: "pagado",
          paymentMethod: finalMethod,
        }),
      }).catch((e) => console.warn("Aviso backend completado:", e));
    } catch (err) {
      console.warn("Error notificando backend:", err);
    }

    // 4. Preparar modal de WhatsApp
    setWhatsAppModalOrder(updatedOrder);
    setWhatsAppModalPhone(targetPhone);
    setCopiedWhatsAppMsg(false);

    // 5. Si tiene celular registrado, abrir automáticamente WhatsApp
    if (targetPhone) {
      const cleanPhone = normalizePhoneForWhatsApp(targetPhone);
      const msg = buildOrderCompletedWhatsAppMessage(updatedOrder);
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      try {
        window.open(waUrl, "_blank");
      } catch (e) {
        console.warn("Aviso apertura popup:", e);
      }
    }
  };

  const handlePayOrder = async (orderId, methodToUse, notifyWhatsApp = false) => {
    const chosenMethod = methodToUse || selectedPayMethod || "efectivo";
    if (notifyWhatsApp) {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder) {
        return handleMarkCompletedAndNotify(targetOrder, null, chosenMethod);
      }
    }

    const nowIso = new Date().toISOString();

    // 1. Actualización inmediata local en memoria y localStorage
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: "pagado",
              paymentMethod: chosenMethod,
              paidAt: nowIso,
            }
          : o
      )
    );
    setSelectedPayOrder(null);
    addToast(
      "order_success",
      "¡Cobro Registrado con Éxito!",
      `El pedido ${orderId} fue registrado como pagado (${chosenMethod.toUpperCase()}).`
    );

    // 2. Sincronización en segundo plano con el backend
    setProcessingPayment(true);
    try {
      await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "payOrder",
          orderId,
          paymentMethod: chosenMethod,
        }),
      });
    } catch (err) {
      console.warn("Aviso: cobro guardado localmente:", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleResetOrderPayment = async (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: "pendiente",
              paymentMethod: "",
              paidAt: null,
            }
          : o
      )
    );
    addToast(
      "cart_add",
      "Pedido devuelto a Pendientes",
      `El pedido ${orderId} ahora vuelve a figurar como pendiente de pago.`
    );
    try {
      await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "resetOrderPayment",
          orderId,
        }),
      });
    } catch (err) {
      console.warn("Aviso reset pago local:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addToast(
      "cart_clear",
      "Pedido Eliminado",
      `El pedido ${orderId} fue eliminado correctamente.`
    );
    try {
      await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "deleteOrder",
          orderId,
        }),
      });
    } catch (err) {
      console.warn("Aviso borrar pedido:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, method = "efectivo") => {
    if (newStatus === "completado" || newStatus === "entregado") {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder) {
        return handleMarkCompletedAndNotify(targetOrder, null, method);
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const isPaid = newStatus === "pagado";
        const isPending = newStatus === "pendiente";
        return {
          ...o,
          paymentStatus: newStatus,
          paymentMethod: isPaid ? (o.paymentMethod || method) : isPending ? "" : o.paymentMethod,
          paidAt: isPaid ? (o.paidAt || new Date().toISOString()) : isPending ? null : o.paidAt,
        };
      })
    );

    const statusLabel =
      newStatus === "pagado"
        ? "Pagado / Cobrado"
        : newStatus === "cancelado"
        ? "Cancelado / Anulado"
        : "Pendiente de Cobro";

    addToast(
      newStatus === "pagado" ? "order_success" : "cart_add",
      "Estado de Pedido Actualizado",
      `El pedido ${orderId} ahora está marcado como "${statusLabel}".`
    );

    setSelectedHistoryOrder((prev) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          paymentStatus: newStatus,
          paidAt: newStatus === "pagado" ? (prev.paidAt || new Date().toISOString()) : newStatus === "pendiente" ? null : prev.paidAt,
          paymentMethod: newStatus === "pagado" ? (prev.paymentMethod || method) : prev.paymentMethod,
        };
      }
      return prev;
    });

    try {
      await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput || "Usuario",
          pin: pinInput || "Ricaji270985#",
          action: "updateOrderStatus",
          orderId,
          newStatus,
          paymentMethod: method,
        }),
      });
    } catch (err) {
      console.warn("Aviso actualizar estado de pedido local:", err);
    }
  };

  const exportHistoryCsv = () => {
    if (filteredHistoryOrders.length === 0) return;

    // Etiquetas legibles de los filtros activos
    const dateLabel = historyDatePreset === "personalizado" && historyCustomDate 
      ? `Fecha especifica: ${historyCustomDate}` 
      : historyDatePreset === "hoy" ? "Hoy" 
      : historyDatePreset === "ayer" ? "Ayer" 
      : historyDatePreset === "ultimos7" ? "Ultimos 7 dias" 
      : historyDatePreset === "mes" ? "Este Mes" : "Historico Completo";
      
    const statusLabel = historyStatusFilter === "pagado" ? "Solo Cobrados / Pagados"
      : historyStatusFilter === "pendiente" ? "Solo Pendientes de Cobro"
      : historyStatusFilter === "cancelado" ? "Solo Cancelados / Anulados" : "Todos los Estados";

    const modeLabel = historyModeFilter === "mesa" ? "Solo Mesas"
      : historyModeFilter === "delivery" ? "Solo Delivery"
      : historyModeFilter === "retiro" ? "Solo Retiro en Local" : "Todas las Modalidades";

    // Encabezado Contable Informativo (compatible con Excel / Google Sheets)
    const metadata = [
      [`"REPORTE CONTABLE DE HISTORIAL DE PEDIDOS - ${(business.name || 'LA CASERITA').toUpperCase()}"`],
      [`"Comercio: ${(business.name || 'La Caserita').replace(/"/g, '""')} - Direccion: ${(business.address || '').replace(/"/g, '""')} - Tel: ${business.phoneDisplay || ''}"`],
      [`"Fecha y Hora de Emision:", "${formatDateSafe(new Date())} ${formatTimeSafe(new Date())} hs"`],
      [`"Filtro de Fecha Aplicado:", "${dateLabel}"`],
      [`"Filtro de Estado Aplicado:", "${statusLabel}"`],
      [`"Filtro de Modalidad:", "${modeLabel}"`],
      [`"Total Pedidos Auditados:", "${historyStats.totalCount}"`],
      [`"Facturacion Total Gs.:", "${historyStats.totalAmount}"`],
      [`"Total Cobrado en Caja Gs.:", "${historyStats.paidAmount}"`],
      [`"Total Pendiente de Cobro Gs.:", "${historyStats.pendingAmount}"`],
      [`"Cobrado en Efectivo Gs.:", "${historyStats.byMethod?.efectivo || 0}"`],
      [`"Cobrado con Tarjeta/POS Gs.:", "${historyStats.byMethod?.pos || 0}"`],
      [`"Cobrado por Transferencia Gs.:", "${historyStats.byMethod?.transferencia || 0}"`],
      [`"Cobrado por Billeteras Gs.:", "${historyStats.byMethod?.tigo_money || 0}"`],
      [] // Fila vacía separadora
    ];

    const headers = [
      "ID Pedido",
      "Fecha",
      "Hora",
      "Modalidad",
      "Ubicacion o Mesa",
      "Cliente",
      "Telefono",
      "Productos Detallados",
      "Total Gs",
      "Estado de Pago",
      "Medio de Pago",
      "Aclaraciones"
    ];

    const rows = filteredHistoryOrders.map((o) => {
      const itemsStr = (o.items || []).map((i) => `${i.qty}x ${i.name}`).join("; ");
      const loc = o.mode === "mesa" ? `Mesa ${o.tableNumber || "S/N"}` : (o.address || "Retiro en local");
      return [
        `"${o.id || ""}"`,
        `"${formatDateSafe(o.createdAt || o.paidAt)}"`,
        `"${formatTimeSafe(o.createdAt || o.paidAt)}"`,
        `"${o.mode || "general"}"`,
        `"${loc.replace(/"/g, '""')}"`,
        `"${(o.customerName || "Cliente").replace(/"/g, '""')}"`,
        `"${(o.customerPhone || "").replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${o.totalPrice || 0}"`,
        `"${o.paymentStatus || "pendiente"}"`,
        `"${o.paymentMethod || "Efectivo"}"`,
        `"${(o.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    // Fila de Cierre y Sumas Contables
    const totalsRow = [
      `"TOTALES DE AUDITORIA"`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`,
      `"${historyStats.totalCount} pedidos registrados"`,
      `"${historyStats.totalAmount}"`,
      `"Cobrado: ${historyStats.paidAmount} | Pendiente: ${historyStats.pendingAmount}"`,
      `""`,
      `""`
    ];

    const allLines = [
      ...metadata.map((m) => m.join(",")),
      headers.join(","),
      ...rows.map((r) => r.join(",")),
      totalsRow.join(",")
    ];

    const csvContent = "\uFEFF" + allLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanDateFilter = historyDatePreset === "personalizado" ? "fecha_esp" : historyDatePreset;
    link.download = `reporte_contable_pedidos_${cleanDateFilter}_${historyStatusFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enviar formulario de registro para adquirir la app
  const submitBusinessRegistration = async (e) => {
    if (e) e.preventDefault();
    setRegError("");

    if (!regForm.businessName.trim()) {
      setRegError("Ingresá el nombre comercial de tu negocio.");
      return;
    }
    if (!regForm.ownerName.trim()) {
      setRegError("Ingresá el nombre y apellido del propietario o encargado.");
      return;
    }
    if (!regForm.whatsapp.trim()) {
      setRegError("Ingresá tu número de WhatsApp para pedidos y contacto.");
      return;
    }
    if (!regForm.requestedUser.trim()) {
      setRegError("Elegí un usuario para tu panel de administración.");
      return;
    }
    if (!regForm.requestedPassword.trim()) {
      setRegError("Ingresá una contraseña para tu panel de administración.");
      return;
    }
    if (regForm.requestedPassword !== regForm.confirmPassword) {
      setRegError("Las contraseñas ingresadas no coinciden. Por favor verificalas.");
      return;
    }

    setRegSubmitting(true);
    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "registerCommercialClient",
          businessName: regForm.businessName,
          rubro: regForm.rubro,
          ownerName: regForm.ownerName,
          whatsapp: regForm.whatsapp,
          email: regForm.email,
          city: regForm.city,
          requestedUser: regForm.requestedUser,
          requestedPassword: regForm.requestedPassword,
          plan: regForm.plan,
          planTitle: regForm.planTitle,
          amountGs: regForm.amountGs,
          paymentMethod: regForm.paymentMethod,
          paymentRef: regForm.paymentRef,
        }),
      });
      const data = await res.json();
      if (data.ok && data.registration) {
        setRegSuccessVoucher(data.registration);
      } else {
        setRegError(data.error || "No se pudo registrar la solicitud. Probá nuevamente.");
      }
    } catch (err) {
      setRegError("Error de conexión al enviar el registro. Revisá tu internet.");
    } finally {
      setRegSubmitting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2500);
  };

  const saveAllAdminChanges = async () => {
    if (!draft) return;
    if (draftNewPin && draftNewPin !== draftPinConfirm) {
      setSaveError("Las contraseñas de PIN no coinciden.");
      return;
    }

    setSaving(true);
    setSaveError("");

    const sanitizedMenu = draft.map((c) => ({
      ...c,
      items: c.items.map((it) => ({ ...it, price: Number(it.price) || 0 })),
    }));

    const businessPayload = {
      ...draftBusiness,
      deliveryNote: draftBusiness.deliveryNote || deliveryNote,
      ...(draftNewPin ? { newPin: draftNewPin } : {}),
    };

    try {
      const res = await fetch(SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userInput,
          pin: pinInput,
          menu: sanitizedMenu,
          deliveryNote: businessPayload.deliveryNote,
          business: businessPayload,
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        setSaveError(result.error || "Error al guardar");
        setSaving(false);
        return;
      }

      setMenu(sanitizedMenu);
      setBusiness(businessPayload);
      setDeliveryNote(businessPayload.deliveryNote);
      if (draftNewPin) {
        setPinInput(draftNewPin);
        setDraftNewPin("");
        setDraftPinConfirm("");
      }
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setSaveError("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // Manejo de productos en borrador
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

  const updateCategoryOption = (catIdx, opt, forceRename = true) => {
    setDraft((d) =>
      d.map((c, ci) => {
        if (ci !== catIdx) return c;
        const currentLower = (c.category || "").trim().toLowerCase();
        // Si se pide forceRename, o si la categoría se llama "nueva categoría", está vacía,
        // o coincide con alguna de las etiquetas estándar, actualizamos el nombre automáticamente
        const shouldRename =
          forceRename ||
          !currentLower ||
          currentLower === "nueva categoría" ||
          currentLower === "nueva categoria" ||
          currentLower === "categoría" ||
          currentLower === "categoria" ||
          ICON_OPTIONS.some((o) => o.label.toLowerCase() === currentLower);

        return {
          ...c,
          icon: opt.key,
          category: shouldRename ? opt.label : c.category,
        };
      })
    );
    setDirty(true);
  };

  const updateCategoryIcon = (catIdx, iconKey) => {
    const opt = ICON_OPTIONS.find((o) => o.key === iconKey);
    if (opt) {
      updateCategoryOption(catIdx, opt, true);
    } else {
      setDraft((d) => d.map((c, ci) => (ci !== catIdx ? c : { ...c, icon: iconKey })));
      setDirty(true);
    }
  };

  const moveItemToCategory = (sourceCatIdx, itemIdx, targetCatIdx) => {
    if (sourceCatIdx === targetCatIdx) return;
    setDraft((d) => {
      const itemToMove = d[sourceCatIdx]?.items?.[itemIdx];
      if (!itemToMove) return d;
      return d.map((c, ci) => {
        if (ci === sourceCatIdx) {
          return { ...c, items: c.items.filter((_, ii) => ii !== itemIdx) };
        }
        if (ci === targetCatIdx) {
          return { ...c, items: [...c.items, itemToMove] };
        }
        return c;
      });
    });
    setDirty(true);
  };

  const addCategory = () => {
    const existingNames = new Set((draft || []).map((c) => (c.category || "").toLowerCase()));
    const firstAvailable = ICON_OPTIONS.find((opt) => !existingNames.has(opt.label.toLowerCase())) || { key: "generico", label: "Nueva categoría" };
    setDraft((d) => [...d, { category: firstAvailable.label, icon: firstAvailable.key, items: [] }]);
    setDirty(true);
  };

  const handleImageUpload = async (catIdx, itemIdx, file) => {
    if (!file) return;
    const itemId = draft[catIdx].items[itemIdx].id;
    setImgLoading(itemId);
    setImgError("");
    try {
      const dataUrl = await compressImage(file);
      updateItemField(catIdx, itemIdx, "image", dataUrl);
    } catch {
      setImgError("No se pudo procesar la imagen del producto. Probá con otra foto.");
    } finally {
      setImgLoading(null);
    }
  };

  // Manejo de portada del comercio
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setBannerUploading(true);
    setBannerUploadError("");
    try {
      const dataUrl = await compressBannerImage(file);
      setDraftBusiness((prev) => ({ ...prev, bannerImage: dataUrl }));
      setDirty(true);
    } catch {
      setBannerUploadError("No se pudo procesar la portada. Asegurate de que sea una imagen válida.");
    } finally {
      setBannerUploading(false);
    }
  };

  /* =========================================================================
     MODALES COMPARTIDOS: COBRO POR CAJA Y REPORTE DE MOVIMIENTOS
     ========================================================================= */
  const renderCashPaymentModal = () => {
    if (!selectedPayOrder) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col" style={{ borderColor: BRAND.paperDark }}>
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2">
              <Receipt size={20} className="text-amber-400" />
              <h3 className="font-bold text-base">Cobro por Caja - {selectedPayOrder.id}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPayOrder(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-stone-500 font-semibold">Cliente / Destino:</span>
                <span className="text-xs font-bold text-stone-800">
                  {selectedPayOrder.mode === "mesa"
                    ? `🍽️ Mesa ${selectedPayOrder.tableNumber || "Salón"}`
                    : selectedPayOrder.mode === "delivery"
                    ? "🛵 Delivery"
                    : "🛍️ Retiro Mostrador"}
                </span>
              </div>
              <div className="font-bold text-stone-900 text-sm">{selectedPayOrder.customerName}</div>
              {selectedPayOrder.address && (
                <div className="text-xs text-stone-500 mt-1">{selectedPayOrder.address}</div>
              )}
              {selectedPayOrder.mapLink && (
                <div className="mt-1.5">
                  <a
                    href={selectedPayOrder.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
                  >
                    <Navigation size={12} className="text-emerald-700" />
                    <span>Ver en Google Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Total a pagar */}
            <div className="text-center py-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide block">
                Monto Total a Cobrar
              </span>
              <span className="text-2xl font-black text-emerald-800 font-mono">
                {formatGs(selectedPayOrder.totalPrice)}
              </span>
            </div>

            {/* Selección del Medio de Pago */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">
                Seleccioná el medio de pago recibido:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "efectivo", label: "Efectivo", icon: "💵" },
                  { key: "pos", label: "Tarjeta / POS", icon: "💳" },
                  { key: "transferencia", label: "Transferencia / SIPAP", icon: "🏦" },
                  { key: "tigo_money", label: "Billetera Móvil", icon: "📱" },
                ].map((method) => (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => setSelectedPayMethod(method.key)}
                    className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition flex items-center gap-2 ${
                      selectedPayMethod === method.key
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="text-base">{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opción de Notificación por WhatsApp */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer select-none transition hover:bg-emerald-100/70">
              <input
                type="checkbox"
                checked={whatsAppNotifyOnPay}
                onChange={(e) => setWhatsAppNotifyOnPay(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer mt-0.5"
              />
              <div className="text-xs text-stone-800 flex-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <MessageCircle size={14} className="text-emerald-700" />
                  Notificar confirmación al cliente por WhatsApp al cobrar
                </span>
                {selectedPayOrder.customerPhone ? (
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    Se abrirá WhatsApp para enviar a: <b>{selectedPayOrder.customerPhone}</b>
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-700 block mt-0.5">
                    (No tiene celular registrado; podrás ingresarlo al confirmar)
                  </span>
                )}
              </div>
            </label>

            <div className="text-[11px] text-stone-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Al confirmar el cobro, este pedido figurará como <b>PAGADO / COMPLETADO</b>, saldrá de pendientes y se archivará en el <b>Historial y Movimiento de Caja</b>.
            </div>
          </div>

          <div className="p-4 bg-stone-50 border-t flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPayOrder(null)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={processingPayment}
              onClick={() => {
                if (whatsAppNotifyOnPay) {
                  handleMarkCompletedAndNotify(selectedPayOrder, null, selectedPayMethod);
                } else {
                  handlePayOrder(selectedPayOrder.id, selectedPayMethod);
                }
              }}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: BRAND.green }}
            >
              {processingPayment ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirmar y Entregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCashReportModal = () => {
    if (!showCashReportPrint) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-6">
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2">
              <Printer size={20} className="text-amber-400" />
              <h3 className="font-bold text-base">Arqueo y Movimiento de Pedidos / Caja</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCashReportPrint(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido imprimible */}
          <div className="p-6 text-stone-900 space-y-5" id="printableCashMovementReport">
            <div className="text-center pb-3 border-b border-stone-200">
              <h2 className="slab text-2xl font-bold text-stone-900">{business.name}</h2>
              <p className="text-xs text-stone-600">{business.address}</p>
              <p className="text-xs text-stone-500">Tel / WhatsApp: {business.phoneDisplay}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider">
                Reporte de Movimiento de Caja • {cashPeriod === "dia" ? "Día (Hoy)" : cashPeriod === "semana" ? "Semana" : cashPeriod === "mes" ? "Mes" : "Histórico"}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">
                Generado el: {formatDateSafe(new Date())} a las {formatTimeSafe(new Date())}
              </div>
            </div>

            {/* Métricas destacadas */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Total Cobrado</span>
                <span className="text-lg font-black text-emerald-800 font-mono">
                  {formatGs(cashMovementStats.totalIncome)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Pedidos Cobrados</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {cashMovementStats.countOrders}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Platos / Unidades</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {cashMovementStats.totalItemsSold}
                </span>
              </div>
            </div>

            {/* Desgloses */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <h4 className="font-bold text-stone-800 border-b pb-1 mb-2">Por Modalidad de Pedido:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🍽️ Mesas ({cashMovementStats.byMode.mesa.count}):</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byMode.mesa.total)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>🛵 Delivery ({cashMovementStats.byMode.delivery.count}):</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byMode.delivery.total)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>🛍️ Retiro Mostrador ({cashMovementStats.byMode.retiro.count}):</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byMode.retiro.total)}</b>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <h4 className="font-bold text-stone-800 border-b pb-1 mb-2">Por Medio de Pago:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>💵 Efectivo:</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.efectivo)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>💳 Tarjeta / POS:</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.pos)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>🏦 Transferencia:</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.transferencia)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>📱 Billetera:</span>
                    <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.tigo_money)}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle de pedidos */}
            <div>
              <h4 className="font-bold text-xs text-stone-700 uppercase tracking-wider mb-2">
                Listado Detallado de Pedidos ({cashMovementStats.periodOrders.length}):
              </h4>
              {cashMovementStats.periodOrders.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay pedidos registrados en este período.</p>
              ) : (
                <table className="w-full text-left text-xs border border-stone-200">
                  <thead className="bg-stone-100 text-stone-700 font-bold">
                    <tr>
                      <th className="p-2 border">Código</th>
                      <th className="p-2 border">Hora</th>
                      <th className="p-2 border">Tipo</th>
                      <th className="p-2 border">Cliente</th>
                      <th className="p-2 border">Medio</th>
                      <th className="p-2 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashMovementStats.periodOrders.map((po) => (
                      <tr key={po.id} className="border-b">
                        <td className="p-2 border font-mono font-bold text-stone-600">{po.id}</td>
                        <td className="p-2 border whitespace-nowrap">
                          {formatTimeSafe(po.paidAt || po.createdAt)}
                        </td>
                        <td className="p-2 border capitalize">
                          {po.mode === "mesa" ? `Mesa ${po.tableNumber}` : po.mode}
                        </td>
                        <td className="p-2 border">{po.customerName}</td>
                        <td className="p-2 border capitalize">{po.paymentMethod || "Efectivo"}</td>
                        <td className="p-2 border text-right font-mono font-bold">{formatGs(po.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Acciones de impresión */}
          <div className="p-4 bg-stone-50 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCashReportPrint(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1.5"
              style={{ background: BRAND.tomato }}
            >
              <Printer size={16} />
              <span>Imprimir Reporte</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     MODAL DE DETALLE COMPLETO DE PEDIDO DEL HISTORIAL
     ========================================================================= */
  const renderHistoryDetailModal = () => {
    if (!selectedHistoryOrder) return null;
    const order = selectedHistoryOrder;
    const isMesa = order.mode === "mesa";
    const isDelivery = order.mode === "delivery";
    const isPaid = (order.paymentStatus || "").toLowerCase() === "pagado" || (order.paymentStatus || "").toLowerCase() === "cobrado";
    const isPending = (order.paymentStatus || "").toLowerCase() === "pendiente";
    const isCancelled = (order.paymentStatus || "").toLowerCase() === "cancelado" || (order.paymentStatus || "").toLowerCase() === "anulado";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden my-6 flex flex-col" style={{ borderColor: BRAND.paperDark }}>
          {/* Cabecera del modal */}
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-stone-800 text-amber-400">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Ticket de Pedido #{order.id}</h3>
                <p className="text-[11px] text-stone-400">
                  {formatDateSafe(order.createdAt || order.paidAt)} • {formatTimeSafe(order.createdAt || order.paidAt)} hs
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHistoryOrder(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Estado del pedido */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border" style={{
              background: isPaid ? "#F0FDF4" : isCancelled ? "#FEF2F2" : "#FFFBEB",
              borderColor: isPaid ? "#86EFAC" : isCancelled ? "#FECACA" : "#FDE68A",
            }}>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold block" style={{
                  color: isPaid ? "#166534" : isCancelled ? "#991B1B" : "#92400E"
                }}>
                  Estado del Pedido:
                </span>
                <span className="text-sm font-black flex items-center gap-1.5 mt-0.5" style={{
                  color: isPaid ? "#15803D" : isCancelled ? "#DC2626" : "#B45309"
                }}>
                  {isPaid ? (
                    <>
                      <CheckCircle2 size={16} /> Cobrado / Pagado
                    </>
                  ) : isCancelled ? (
                    <>
                      <AlertCircle size={16} /> Cancelado / Anulado
                    </>
                  ) : (
                    <>
                      <Clock size={16} /> Pendiente de Cobro
                    </>
                  )}
                </span>
                {isPaid && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Cobrado por <b>{order.paymentMethod ? order.paymentMethod.toUpperCase() : "CAJA"}</b>
                    {order.paidAt && ` el ${formatDateSafe(order.paidAt)} a las ${formatTimeSafe(order.paidAt)}`}
                  </p>
                )}
              </div>

              {/* Botón rápido si está pendiente */}
              {isPending && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayOrder(order);
                    setSelectedHistoryOrder(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-white shadow transition hover:brightness-105"
                  style={{ background: BRAND.green }}
                >
                  Cobrar en Caja
                </button>
              )}
            </div>

            {/* Datos del Cliente y Modalidad */}
            <div className="p-3.5 rounded-xl border bg-stone-50 border-stone-200 text-xs text-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Modalidad:</span>
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[11px]">
                  {isMesa ? `🍽️ Mesa ${order.tableNumber || "Salón"}` : isDelivery ? "🛵 Delivery" : "🛍️ Retiro en Mostrador"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Cliente:</span>
                <span className="font-bold text-stone-900">{order.customerName || "Cliente"}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Teléfono:</span>
                  <a
                    href={`https://wa.me/595${order.customerPhone.replace(/^0+/, '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{order.customerPhone}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {isDelivery && order.address && (
                <div className="pt-1.5 border-t border-stone-200">
                  <span className="text-stone-500 font-medium block mb-0.5">Dirección de Entrega:</span>
                  <p className="font-semibold text-stone-800">{order.address}</p>
                  {order.mapLink && (
                    <a
                      href={order.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      <MapPin size={13} />
                      <span>Abrir ubicación en Google Maps</span>
                    </a>
                  )}
                </div>
              )}
              {order.notes && (
                <div className="pt-1.5 border-t border-stone-200 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  <span className="text-amber-900 font-bold block text-[11px]">Aclaraciones del cliente:</span>
                  <p className="italic text-stone-700 mt-0.5 text-xs">"{order.notes}"</p>
                </div>
              )}
            </div>

            {/* Desglose de Platos y Productos */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Detalle de Productos:
              </span>
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Cant.</th>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-right">Unitario</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(order.items || []).map((it, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-900">{it.qty}x</td>
                        <td className="p-2.5 font-medium text-stone-800">{it.name}</td>
                        <td className="p-2.5 text-right font-mono text-stone-500">{formatGs(it.price)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                          {formatGs((it.qty || 1) * (it.price || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t-2 border-stone-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-bold text-stone-700 text-sm">
                        Total del Pedido:
                      </td>
                      <td className="p-3 text-right font-mono font-black text-stone-900 text-base">
                        {formatGs(order.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Botón de acción rápida: Notificar por WhatsApp y marcar como Completado / Entregado */}
            <button
              type="button"
              onClick={() => handleMarkCompletedAndNotify(order)}
              className="w-full py-2.5 px-3 rounded-xl font-black text-xs text-white shadow hover:brightness-105 transition flex items-center justify-center gap-2"
              style={{ background: "#059669" }}
            >
              <MessageCircle size={16} className="text-amber-200" />
              <span>Marcar como Completado / Entregado y Notificar por WhatsApp</span>
            </button>

            {/* Cambio Manual de Estado del Pedido */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
              <span className="text-[11px] font-bold text-stone-600 block mb-2 uppercase tracking-wider">
                Cambiar Estado del Pedido:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkCompletedAndNotify(order)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    order.orderStatus === "completado" || order.deliveryStatus === "entregado"
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                  }`}
                  title="Marcar como entregado y abrir confirmación de WhatsApp"
                >
                  <MessageCircle size={13} />
                  <span>Entregado</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(order.id, "pagado", order.paymentMethod || "efectivo")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isPaid ? "bg-emerald-700 text-white shadow" : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Pagado</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(order.id, "pendiente")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isPending ? "bg-amber-600 text-white shadow" : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <Clock size={13} />
                  <span>Pendiente</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(order.id, "cancelado")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isCancelled ? "bg-red-700 text-white shadow" : "bg-red-50 text-red-900 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  <AlertCircle size={13} />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Botones inferiores del modal */}
          <div className="p-4 border-t bg-stone-50 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                handleDeleteOrder(order.id);
                setSelectedHistoryOrder(null);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-100 transition flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Eliminar pedido</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-200 transition flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedHistoryOrder(null)}
                className="px-5 py-2 rounded-xl text-xs font-black text-white shadow transition hover:brightness-105"
                style={{ background: BRAND.charcoalDark }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     MODAL DE CONFIRMACIÓN DE PEDIDO COMPLETADO / ENTREGADO POR WHATSAPP
     ========================================================================= */
  const renderWhatsAppConfirmationModal = () => {
    if (!whatsAppModalOrder) return null;
    const order = whatsAppModalOrder;
    const cleanPhone = normalizePhoneForWhatsApp(whatsAppModalPhone);
    const message = buildOrderCompletedWhatsAppMessage({
      ...order,
      customerPhone: whatsAppModalPhone,
    });
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : "";

    const handleSendNow = () => {
      if (!cleanPhone) {
        addToast("cart_add", "Teléfono Requerido", "Por favor ingresá el número de celular del cliente.");
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, customerPhone: whatsAppModalPhone } : o))
      );
      window.open(waUrl, "_blank");
      addToast("order_success", "WhatsApp Abierto", "Se abrió WhatsApp con el mensaje de confirmación.");
    };

    const handleCopy = () => {
      try {
        navigator.clipboard.writeText(message);
        setCopiedWhatsAppMsg(true);
        setTimeout(() => setCopiedWhatsAppMsg(false), 2500);
      } catch (e) {
        console.warn("Error copiando texto:", e);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col my-4" style={{ borderColor: BRAND.paperDark }}>
          {/* Cabecera */}
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: "#065F46" }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Confirmación de Pedido por WhatsApp</h3>
                <p className="text-[11px] text-emerald-200">
                  Pedido #{order.id} • Marcado como Completado y Entregado
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWhatsAppModalOrder(null)}
              className="text-emerald-200 hover:text-white p-1 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Banner de Estado */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  ¡Pedido marcado como Completado y Entregado!
                </span>
                <span className="text-[11px] text-emerald-800">
                  {cleanPhone
                    ? "Se preparó la actualización oficial de estado con el detalle y ticket de compra para el cliente."
                    : "Ingresá el número de WhatsApp del cliente para enviarle la confirmación oficial."}
                </span>
              </div>
            </div>

            {/* Input de Número de Teléfono del Cliente */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Número de WhatsApp del Cliente:</span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {cleanPhone ? `Destino: +${cleanPhone}` : "Requerido para enviar"}
                </span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  placeholder="Ej: 0981 123 456 o +595981123456"
                  value={whatsAppModalPhone}
                  onChange={(e) => setWhatsAppModalPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  style={{ borderColor: BRAND.paperDark }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Se autocompleta con el prefijo de Paraguay (+595) si ingresás un número con 09...
              </p>
            </div>

            {/* Vista Previa del Mensaje Oficial */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">
                  Vista Previa del Mensaje Oficial:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                >
                  <Copy size={12} />
                  <span>{copiedWhatsAppMsg ? "¡Copiado!" : "Copiar texto"}</span>
                </button>
              </div>
              <div className="bg-[#EFEAE2] p-3.5 rounded-xl border border-stone-300 font-sans text-xs text-stone-900 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                {message}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="p-4 bg-stone-50 border-t flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setWhatsAppModalOrder(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition"
            >
              Cerrar
            </button>

            <div className="flex items-center gap-2">
              {cleanPhone ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    addToast("order_success", "WhatsApp Abierto", "Mensaje de confirmación listo en WhatsApp.");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:brightness-105 transition flex items-center gap-1.5"
                  style={{ background: "#25D366" }}
                >
                  <MessageCircle size={15} />
                  <span>Abrir WhatsApp Ahora</span>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleSendNow}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1.5"
                  style={{ background: "#25D366" }}
                >
                  <MessageCircle size={15} />
                  <span>Enviar por WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     MODAL DE REPORTE CONTABLE Y EXPORTACIÓN A PDF DEL HISTORIAL
     ========================================================================= */
  const renderHistoryPdfModal = () => {
    if (!showHistoryPdfModal) return null;

    const dateLabel = historyDatePreset === "personalizado" && historyCustomDate 
      ? `Fecha específica: ${formatDateSafe(historyCustomDate)}` 
      : historyDatePreset === "hoy" ? "Hoy" 
      : historyDatePreset === "ayer" ? "Ayer" 
      : historyDatePreset === "ultimos7" ? "Últimos 7 días" 
      : historyDatePreset === "mes" ? "Este Mes" : "Histórico Completo";
      
    const statusLabel = historyStatusFilter === "pagado" ? "Solo Cobrados / Pagados"
      : historyStatusFilter === "pendiente" ? "Solo Pendientes de Cobro"
      : historyStatusFilter === "cancelado" ? "Solo Cancelados / Anulados" : "Todos los Estados";

    const modeLabel = historyModeFilter === "mesa" ? "Solo Mesas"
      : historyModeFilter === "delivery" ? "Solo Delivery"
      : historyModeFilter === "retiro" ? "Solo Retiro en Local" : "Todas las Modalidades";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden my-4 flex flex-col border-stone-300">
          
          {/* Barra Superior de Herramientas (Oculta al imprimir) */}
          <div className="no-print p-4 border-b flex items-center justify-between gap-3 text-white flex-wrap" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-amber-400" />
              <div>
                <h3 className="font-bold text-sm md:text-base leading-tight">
                  Reporte Contable y Auditoría de Pedidos (PDF / CSV)
                </h3>
                <p className="text-[11px] text-stone-300">
                  {filteredHistoryOrders.length} pedidos según criterios ({dateLabel} • {statusLabel})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportHistoryCsv}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow"
                title="Descargar datos en formato CSV para Excel o sistemas contables"
              >
                <Download size={14} />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 text-white hover:brightness-105"
                style={{ background: BRAND.tomato }}
                title="Abrir diálogo de impresión o Guardar como PDF"
              >
                <Printer size={15} />
                <span>Descargar / Imprimir PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryPdfModal(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* DOCUMENTO IMPRIMIBLE (.printable-area) */}
          <div className="p-6 md:p-8 text-stone-900 space-y-6 printable-area bg-white overflow-y-auto max-h-[80vh]">
            
            {/* Cabecera Formal del Reporte */}
            <div className="border-b-2 border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-block mb-1">
                  Documento Contable Oficial
                </span>
                <h1 className="slab text-2xl md:text-3xl font-bold text-stone-950 leading-tight">
                  {business.name}
                </h1>
                <p className="text-xs text-stone-600 font-medium">{business.address}</p>
                <p className="text-xs text-stone-500">
                  Teléfono / WhatsApp: <span className="font-bold text-stone-700">{business.phoneDisplay}</span>
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-stone-200">
                <div className="text-xs font-mono font-bold text-stone-600 uppercase">
                  INFORME DE CAJA Y VENTAS
                </div>
                <div className="text-xs text-stone-700 font-semibold">
                  Emisión: <b>{formatDateSafe(new Date())}</b> - {formatTimeSafe(new Date())} hs
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Auditoría N°: REP-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, "0")}{String(new Date().getDate()).padStart(2, "0")}-{filteredHistoryOrders.length}
                </div>
              </div>
            </div>

            {/* Banner Informativo de Criterios y Filtros Aplicados */}
            <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl print-avoid-break">
              <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block mb-1.5">
                Criterios del Filtro Contable:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">Período / Fecha: </span>
                  <b className="text-stone-900">{dateLabel}</b>
                </div>
                <div>
                  <span className="text-stone-500">Estado de Pedidos: </span>
                  <b className="text-stone-900">{statusLabel}</b>
                </div>
                <div>
                  <span className="text-stone-500">Modalidad: </span>
                  <b className="text-stone-900">{modeLabel}</b>
                </div>
              </div>
            </div>

            {/* Tarjetas de Resumen Financiero y Contable */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print-avoid-break">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Pedidos Auditados</span>
                <div className="text-xl font-black text-stone-900 mt-1">{historyStats.totalCount}</div>
                <span className="text-[10px] text-stone-400">órdenes procesadas</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Facturación Total</span>
                <div className="text-xl font-black text-emerald-950 font-mono mt-1">{formatGs(historyStats.totalAmount)}</div>
                <span className="text-[10px] text-emerald-600">volumen acumulado</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block">Total Cobrado ({historyStats.paidCount})</span>
                <div className="text-xl font-black text-emerald-900 font-mono mt-1">{formatGs(historyStats.paidAmount)}</div>
                <span className="text-[10px] text-emerald-700">ingresos registrados</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-300 bg-amber-50">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">Por Cobrar ({historyStats.pendingCount})</span>
                <div className="text-xl font-black text-amber-900 font-mono mt-1">{formatGs(historyStats.pendingAmount)}</div>
                <span className="text-[10px] text-amber-700">cuentas pendientes</span>
              </div>
            </div>

            {/* Desglose Contable por Métodos de Pago y Modalidades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print-avoid-break">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-1 mb-2 uppercase text-[11px] tracking-wider">
                  Ingresos Cobrados por Medio de Pago:
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">💵 Efectivo en Caja:</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMethod?.efectivo || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">💳 Tarjeta / POS:</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMethod?.pos || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">🏦 Transferencia Bancaria:</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMethod?.transferencia || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">📱 Billetera / Tigo Money:</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMethod?.tigo_money || 0)}</b>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                <h4 className="font-bold text-stone-800 border-b border-stone-200 pb-1 mb-2 uppercase text-[11px] tracking-wider">
                  Rendimiento por Modalidad:
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">🍽️ Salón / Mesas ({historyStats.byMode?.mesa?.count || 0}):</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMode?.mesa?.total || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">🛵 Envíos / Delivery ({historyStats.byMode?.delivery?.count || 0}):</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMode?.delivery?.total || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">🛍️ Retiro en Local ({historyStats.byMode?.retiro?.count || 0}):</span>
                    <b className="font-mono text-stone-900">{formatGs(historyStats.byMode?.retiro?.total || 0)}</b>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                    <span className="text-stone-500 font-semibold">Promedio por Pedido Cobrado:</span>
                    <b className="font-mono text-emerald-800">{formatGs(historyStats.averageTicket || 0)}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla Detallada de Asientos de Pedidos */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
                Detalle Cronológico de Pedidos ({filteredHistoryOrders.length}):
              </h4>
              <div className="border border-stone-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300 text-[10px] uppercase">
                    <tr>
                      <th className="p-2 border-r border-stone-200">Código</th>
                      <th className="p-2 border-r border-stone-200">Fecha / Hora</th>
                      <th className="p-2 border-r border-stone-200">Tipo</th>
                      <th className="p-2 border-r border-stone-200">Cliente</th>
                      <th className="p-2 border-r border-stone-200">Detalle</th>
                      <th className="p-2 border-r border-stone-200">Medio</th>
                      <th className="p-2 border-r border-stone-200 text-center">Estado</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredHistoryOrders.map((o) => {
                      const isPaid = (o.paymentStatus || "").toLowerCase() === "pagado" || (o.paymentStatus || "").toLowerCase() === "cobrado";
                      const isPending = (o.paymentStatus || "").toLowerCase() === "pendiente";
                      return (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="p-2 font-mono font-bold text-stone-900 border-r border-stone-200 whitespace-nowrap">
                            {o.id}
                          </td>
                          <td className="p-2 border-r border-stone-200 whitespace-nowrap">
                            <div>{formatDateSafe(o.createdAt || o.paidAt)}</div>
                            <div className="text-[10px] text-stone-500">{formatTimeSafe(o.createdAt || o.paidAt)} hs</div>
                          </td>
                          <td className="p-2 border-r border-stone-200 whitespace-nowrap capitalize">
                            {o.mode === "mesa" ? `Mesa ${o.tableNumber || "Salón"}` : o.mode}
                          </td>
                          <td className="p-2 border-r border-stone-200">
                            <div className="font-semibold text-stone-900">{o.customerName || "Cliente"}</div>
                            {o.customerPhone && <div className="text-[10px] text-stone-500">{o.customerPhone}</div>}
                          </td>
                          <td className="p-2 border-r border-stone-200">
                            <div className="text-[11px] text-stone-700">
                              {(o.items || []).map((it) => `${it.qty}x ${it.name}`).join(", ")}
                            </div>
                          </td>
                          <td className="p-2 border-r border-stone-200 capitalize whitespace-nowrap">
                            {o.paymentMethod || "Efectivo"}
                          </td>
                          <td className="p-2 border-r border-stone-200 text-center whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isPaid ? "bg-emerald-100 text-emerald-800" : isPending ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                            }`}>
                              {isPaid ? "Cobrado" : isPending ? "Pendiente" : "Cancelado"}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                            {formatGs(o.totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-stone-100 border-t-2 border-stone-300 font-bold">
                    <tr>
                      <td colSpan={7} className="p-2.5 text-right text-stone-800 uppercase text-[11px]">
                        Total Facturación Auditada:
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-stone-950 text-sm">
                        {formatGs(historyStats.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Sección de Firmas Contables y Responsables */}
            <div className="pt-8 border-t border-stone-300 grid grid-cols-2 gap-8 text-center text-xs print-avoid-break">
              <div>
                <div className="border-b border-stone-400 w-3/4 mx-auto mb-2" />
                <span className="font-bold text-stone-800 block">Firma del Responsable de Caja</span>
                <span className="text-[10px] text-stone-500">Operador / Recepción</span>
              </div>
              <div>
                <div className="border-b border-stone-400 w-3/4 mx-auto mb-2" />
                <span className="font-bold text-stone-800 block">Firma de Administración / Contador</span>
                <span className="text-[10px] text-stone-500">Control y Auditoría Contable</span>
              </div>
            </div>

            {/* Pie del Documento Contable */}
            <div className="pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400 space-y-0.5 print-avoid-break">
              <p>Documento generado digitalmente por el Sistema de Gestión de {business.name}.</p>
              <p>Desarrollado por CyM Software • Contacto: +595975635770 • Todos los derechos reservados 2026</p>
            </div>

          </div>

          {/* Barra Inferior de Cierre (Oculta al imprimir) */}
          <div className="no-print p-4 border-t bg-stone-50 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-stone-500">
              💡 Para guardar como archivo PDF, elija la opción <b>"Guardar como PDF"</b> en la ventana de impresión del navegador.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistoryPdfModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-200 transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1.5"
                style={{ background: BRAND.tomato }}
              >
                <Printer size={15} />
                <span>Imprimir / Guardar como PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderCreateCodeModal = () => {
    if (!showCreateCodeModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden my-6">
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2">
              <KeyRound size={20} className="text-amber-400" />
              <h3 className="font-bold text-base">Crear Código de Activación para Comercio</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateCodeModal(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-stone-600">
              Generá una clave de activación para entregarle al cliente que compró la app. El comercio la ingresará en su pantalla de inicio para habilitarla.
            </p>

            {/* Código generado */}
            <div className="p-3.5 rounded-xl border-2 bg-stone-50" style={{ borderColor: BRAND.mustard }}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <KeyRound size={14} style={{ color: BRAND.tomato }} /> Código de Activación Generado:
                </label>
                <button
                  type="button"
                  onClick={() => setNewCodeForm((prev) => ({ ...prev, code: generateRandomActivationCode() }))}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline"
                >
                  <RefreshCw size={11} /> ↺ Generar otro código
                </button>
              </div>
              <input
                type="text"
                value={newCodeForm.code}
                onChange={(e) => setNewCodeForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full text-center font-mono text-xl font-black tracking-widest p-2.5 rounded-xl border bg-white text-stone-900 border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="CAS-XXXX-YYYY"
              />
            </div>

            {/* Selector de Comercios Registrados si existen */}
            {registeredClients.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  💡 Autocompletar con comercio registrado recientemente:
                </label>
                <select
                  onChange={(e) => {
                    const sel = registeredClients.find((c) => c.id === e.target.value);
                    if (sel) {
                      setNewCodeForm((prev) => ({
                        ...prev,
                        businessName: sel.businessName,
                        ownerName: sel.ownerName,
                        whatsapp: sel.whatsapp,
                        plan: sel.planTitle || "Plan Anual PRO (Ahorrá 3 meses)",
                      }));
                    }
                  }}
                  className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium"
                >
                  <option value="">-- Seleccionar de solicitudes de compra --</option>
                  {registeredClients.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.businessName} • {rc.ownerName} ({rc.planTitle || rc.plan})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nombre del Comercio */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Nombre del Comercio / Local que compró la app:
              </label>
              <input
                type="text"
                value={newCodeForm.businessName}
                onChange={(e) => setNewCodeForm((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Ej: Pizzería Donatello, Lomitería Central..."
                className="w-full p-2.5 rounded-xl border text-sm font-semibold border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Dueño y WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Responsable / Dueño:
                </label>
                <input
                  type="text"
                  value={newCodeForm.ownerName}
                  onChange={(e) => setNewCodeForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="Ej: Roberto Benítez"
                  className="w-full p-2.5 rounded-xl border text-xs font-semibold border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  WhatsApp del Cliente:
                </label>
                <input
                  type="text"
                  value={newCodeForm.whatsapp}
                  onChange={(e) => setNewCodeForm((prev) => ({ ...prev, whatsapp: e.target.value.replace(/[^\d]/g, "") }))}
                  placeholder="Ej: 595981456789"
                  className="w-full p-2.5 rounded-xl border text-xs font-mono border-stone-300"
                />
              </div>
            </div>

            {/* Plan de la Licencia */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Plan Adquirido:
              </label>
              <select
                value={newCodeForm.plan}
                onChange={(e) => setNewCodeForm((prev) => ({ ...prev, plan: e.target.value }))}
                className="w-full p-2.5 rounded-xl border text-xs font-bold border-stone-300 bg-white"
              >
                <option value="Plan Mensual">Plan Mensual (150.000 Gs./mes)</option>
                <option value="Plan Semestral">Plan Semestral (750.000 Gs.)</option>
                <option value="Plan Anual PRO">Plan Anual PRO (1.350.000 Gs. - Ahorro 3 meses)</option>
                <option value="Plan Vitalicio / Completo">Plan Vitalicio / Licencia Permanente</option>
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Notas / Referencia de Pago (opcional):
              </label>
              <input
                type="text"
                value={newCodeForm.notes}
                onChange={(e) => setNewCodeForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ej: Pagado por transferencia banco Itaú, comprobante #4582"
                className="w-full p-2 rounded-xl border text-xs text-stone-700 border-stone-300"
              />
            </div>
          </div>

          <div className="p-4 bg-stone-50 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateCodeModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleCreateActivationCode()}
              disabled={creatingCode}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1.5"
              style={{ background: BRAND.tomato }}
            >
              {creatingCode ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <KeyRound size={15} /> Guardar y Emitir Código
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActivateAppModal = () => {
    if (!showActivateModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden my-6">
          <div className="p-4 border-b flex items-center justify-between text-white" style={{ background: BRAND.charcoalDark }}>
            <div className="flex items-center gap-2">
              <KeyRound size={20} className="text-amber-400" />
              <h3 className="font-bold text-base">Habilitación de App para Comercio</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowActivateModal(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Si ya se activó exitosamente */}
          {activationSuccess ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={38} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Licencia Verificada y Habilitada
                </span>
                <h3 className="slab text-xl text-stone-900 mt-2">
                  ¡Comercio Habilitado con Éxito!
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Tu negocio ya tiene la app completamente desbloqueada y lista para recibir pedidos por WhatsApp y gestionar el menú.
                </p>
              </div>

              <div className="p-4 rounded-xl border-2 bg-stone-50 text-left space-y-2 text-xs" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-stone-500 font-medium">Comercio:</span>
                  <span className="font-bold text-stone-900">{activationSuccess.businessName}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-stone-500 font-medium">Plan de Licencia:</span>
                  <span className="font-bold text-emerald-700">{activationSuccess.plan}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-stone-500 font-medium">Código Activado:</span>
                  <span className="font-mono font-bold text-stone-800">{activationSuccess.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Fecha de Habilitación:</span>
                  <span className="font-semibold text-stone-700">
                    {formatDateSafe(activationSuccess.activatedAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowActivateModal(false);
                  setActivationSuccess(null);
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white shadow hover:brightness-105 transition"
                style={{ background: BRAND.green }}
              >
                Comenzar a Usar la App
              </button>
            </div>
          ) : (
            /* Formulario de ingreso de código */
            <form onSubmit={handleValidateAndActivateApp} className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h4 className="slab text-lg text-stone-900">Ingresá tu Código de Activación</h4>
                <p className="text-xs text-stone-600">
                  Pegá el código que recibiste por WhatsApp o correo luego de comprar la app para habilitar este local.
                </p>
              </div>

              {/* Input grande para el código */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 ml-1 text-center">
                  Código de Licencia (formato CAS-XXXX-YYYY):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={inputActivationCode}
                    onChange={(e) => {
                      setInputActivationCode(e.target.value.toUpperCase());
                      setActivationError("");
                    }}
                    placeholder="CAS-7K9B-X2M4"
                    className="w-full py-3 px-4 text-center font-mono font-black text-xl tracking-widest rounded-xl border-2 border-stone-300 focus:outline-none focus:border-[#C1392B] focus:ring-2 focus:ring-red-100 uppercase"
                  />
                </div>
              </div>

              {/* Nombre de negocio personalizado */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                  Nombre de tu Comercio (opcional):
                </label>
                <input
                  type="text"
                  value={inputActivationBusiness}
                  onChange={(e) => setInputActivationBusiness(e.target.value)}
                  placeholder={business.name || "Ej: Mi Rotisería"}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Si el código tiene un nombre asignado, se usará automáticamente.
                </span>
              </div>

              {activationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 text-red-600" />
                  <span>{activationError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={activatingApp || !inputActivationCode.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1.5 disabled:opacity-50"
                  style={{ background: BRAND.tomato }}
                >
                  {activatingApp ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      <KeyRound size={15} /> Validar y Habilitar Comercio
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  /* =========================================================================
     MODAL: SELECTOR DE UBICACIÓN GOOGLE MAPS (MODO GRATUITO MÓVIL)
     ========================================================================= */
  const renderMapSelectorModal = () => {
    if (!showMapSelectorModal) return null;

    const nudgeLocation = (dLat, dLng) => {
      setMapPickerLat((prev) => Number((prev + dLat).toFixed(6)));
      setMapPickerLng((prev) => Number((prev + dLng).toFixed(6)));
    };

    const handleConfirmMapLocation = () => {
      const finalLat = Number(mapPickerLat.toFixed(6));
      const finalLng = Number(mapPickerLng.toFixed(6));
      setDeliveryCoords({ lat: finalLat, lng: finalLng });
      setMapLink(`https://www.google.com/maps?q=${finalLat},${finalLng}`);
      setLocStatus("done");
      setShowMapSelectorModal(false);
      addToast(
        "loc_success",
        "Ubicación confirmada ✓",
        `Punto marcado en Google Maps: ${finalLat}, ${finalLng}`,
        "El repartidor podrá iniciar la navegación GPS directamente a este punto.",
        null
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border-2 border-stone-800">
          {/* Cabecera del Modal */}
          <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ background: BRAND.charcoal, color: BRAND.cream }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl" style={{ background: BRAND.tomato }}>
                <MapPin size={20} color={BRAND.cream} />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base leading-tight">
                  Selector de Ubicación Google Maps
                </h3>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  Modo gratuito para celular • Marcá tu dirección exacta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMapSelectorModal(false)}
              className="p-2 rounded-full hover:bg-white/10 transition text-stone-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Aviso explicativo */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info size={15} className="text-amber-700 flex-shrink-0" />
                ¿Cómo marcar tu casa con precisión?
              </p>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Podés usar el botón <b>GPS de mi celular</b> para centrarte automáticamente, o usar los <b>botones de ajuste fino (flechas)</b> para posicionar el pin rojo exactamente sobre el techo o portón de tu domicilio.
              </p>
            </div>

            {/* Visor interactivo de Google Maps Gratuito */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-stone-400 bg-stone-100 shadow-inner">
              <iframe
                title="Google Maps"
                src={`https://maps.google.com/maps?q=${mapPickerLat},${mapPickerLng}&z=17&output=embed`}
                className="w-full h-64 sm:h-72 border-0"
                loading="lazy"
              />

              {/* Pin central de Google Maps */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-7">
                <div className="flex flex-col items-center">
                  <span className="bg-stone-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-1 shadow">
                    Tu Entrega Aquí
                  </span>
                  <MapPin size={36} className="text-[#C1392B] drop-shadow-lg" fill="#C1392B" />
                </div>
              </div>

              {/* Botón flotante para abrir en la app de Maps del celular */}
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps?q=${mapPickerLat},${mapPickerLng}`, "_blank")}
                className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-white text-stone-900 text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-md border border-stone-300 flex items-center gap-1.5 active:scale-95 transition"
                title="Abrir en la aplicación Google Maps del celular"
              >
                <Navigation size={13} className="text-[#C1392B]" />
                <span className="hidden sm:inline">Ver en App</span> Google Maps ↗
              </button>
            </div>

            {/* Controles: GPS del Celular y D-Pad de ajuste milimétrico */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => getGPSLocation(true)}
                  disabled={geoLocating}
                  className="py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                  style={{ background: BRAND.tomato, color: BRAND.cream }}
                >
                  {geoLocating ? (
                    <><LoaderCircle className="animate-spin" size={15} /> Obteniendo GPS...</>
                  ) : (
                    <><Crosshair size={15} /> GPS de mi celular</>
                  )}
                </button>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Coordenadas exactas:
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800">
                    {mapPickerLat.toFixed(5)}, {mapPickerLng.toFixed(5)}
                  </span>
                </div>
              </div>

              {geoInfoMsg && (
                <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {geoInfoMsg}
                </p>
              )}

              {/* Botones de ajuste milimétrico (flechas para calibrar a 15 metros) */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-600 block mb-2 text-center">
                  🎯 Ajuste fino de posición (toques de ~15m para centrar en tu portón):
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => nudgeLocation(0, -0.00018)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-100 active:scale-95 transition flex items-center gap-1 shadow-sm"
                    title="Mover al Oeste"
                  >
                    <ChevronLeft size={16} /> <span className="hidden sm:inline">Oeste</span>
                  </button>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => nudgeLocation(0.00018, 0)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-100 active:scale-95 transition flex items-center justify-center gap-1 shadow-sm"
                      title="Mover al Norte"
                    >
                      <ChevronUp size={16} /> <span className="hidden sm:inline">Norte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgeLocation(-0.00018, 0)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-100 active:scale-95 transition flex items-center justify-center gap-1 shadow-sm"
                      title="Mover al Sur"
                    >
                      <ChevronDown size={16} /> <span className="hidden sm:inline">Sur</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => nudgeLocation(0, 0.00018)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-100 active:scale-95 transition flex items-center gap-1 shadow-sm"
                    title="Mover al Este"
                  >
                    <span className="hidden sm:inline">Este</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dirección / Referencias escritas */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Dirección escrita / Referencia de tu casa:
              </label>
              <input
                type="text"
                placeholder="Ej: Calle Boquerón e/ Villarrica, portón negro, casa de dos pisos"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Pie del Modal con Acción de Confirmación */}
          <div className="p-4 sm:p-5 border-t bg-stone-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowMapSelectorModal(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmMapLocation}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-black shadow-lg transition hover:brightness-105 active:scale-95 flex items-center justify-center gap-2"
              style={{ background: BRAND.green, color: BRAND.cream }}
            >
              <Check size={16} />
              <span>Confirmar esta ubicación</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ background: BRAND.paper, minHeight: "100vh" }} className="flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin" color={BRAND.tomato} size={36} />
        <p className="font-bold text-sm tracking-wide" style={{ color: BRAND.charcoal }}>Cargando La Caserita...</p>
      </div>
    );
  }

  /* =========================================================================
     PANTALLA: LOGIN ADMINISTRADOR (Con Bloqueo de IP de 3 Intentos)
     ========================================================================= */
  if (view === "adminLogin") {
    return (
      <div style={{ background: BRAND.charcoal, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif" }} className="flex items-center justify-center px-4 py-8">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;600;700;800&display=swap'); .slab{font-family:'Alfa Slab One',serif;}`}</style>
        <div className="w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl" style={{ background: BRAND.paper }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setView("menu")} className="flex items-center gap-1.5 text-sm font-bold hover:opacity-80 transition" style={{ color: BRAND.charcoal }}>
              <ArrowLeft size={18} /> Volver al menú
            </button>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-300 text-stone-700">
              IP: {clientIp || "Detectando..."}
            </span>
          </div>

          <div className="flex justify-center mb-3">
            <div className={`p-4 rounded-full shadow-inner ${ipLocked ? "bg-red-600 animate-pulse" : ""}`} style={!ipLocked ? { background: BRAND.tomato } : undefined}>
              {ipLocked ? <ShieldAlert size={28} color={BRAND.cream} /> : <Lock size={26} color={BRAND.cream} />}
            </div>
          </div>

          <h2 className="slab text-2xl text-center mb-1" style={{ color: BRAND.charcoal }}>
            {ipLocked ? "Acceso Bloqueado" : "Panel de Control"}
          </h2>
          <p className="text-center text-xs text-stone-700 mb-4 font-medium">
            Acceso exclusivo para el único administrador del comercio ({business.adminUser || "Usuario"})
          </p>

          {/* BANNER DE BLOQUEO DE IP POR 3 INTENTOS FALLIDOS */}
          {ipLocked ? (
            <div className="p-4 rounded-2xl border-2 border-red-500 bg-red-50 text-red-900 mb-5 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm mb-1 text-red-700">
                <ShieldAlert size={18} />
                <span>DIRECCIÓN IP BLOQUEADA TEMPORALMENTE</span>
              </div>
              <p className="text-xs leading-relaxed mb-3">
                Se superó el límite de <b>3 intentos fallidos consecutivos</b> de PIN desde tu dirección IP. El acceso fue bloqueado automáticamente durante 15 minutos para proteger el comercio contra accesos no autorizados.
              </p>
              <div className="p-3 rounded-xl bg-white border border-red-200 text-center shadow-inner">
                <span className="text-[11px] uppercase tracking-wider block font-bold text-stone-500">
                  Tiempo de espera restante
                </span>
                <span className="text-2xl font-black font-mono text-red-600 block my-1">
                  ⏱️ {formatLockTime(ipRemainingSeconds)}
                </span>
                <button
                  type="button"
                  onClick={resetIpLock}
                  className="mt-2 py-1.5 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition border border-red-300"
                >
                  ↺ Desbloquear IP ahora
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1 text-stone-800">
                  <ShieldCheck size={14} className="text-emerald-700" /> Seguridad por IP activa
                </span>
                <span className="font-bold font-mono px-2 py-0.5 rounded text-[11px] bg-stone-200 text-stone-800">
                  {attemptsLeft} de 3 intentos
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-600 leading-tight">
                <span>Tras 3 fallos consecutivos, la IP se bloquea 15 min.</span>
                {attemptsLeft < 3 && (
                  <button
                    type="button"
                    onClick={resetIpLock}
                    className="font-bold text-amber-800 hover:text-amber-950 underline ml-2 flex-shrink-0"
                  >
                    ↺ Restablecer a 3
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selector de Perfil de Acceso */}
          <div className="mb-4 bg-stone-200/80 p-1 rounded-xl flex gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode("owner");
                setUserInput("");
                setPinInput("");
                setPinError("");
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                loginMode === "owner"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Store size={15} className={loginMode === "owner" ? "text-[#C1392B]" : ""} />
              <span>Propietario Comercio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("superadmin");
                setUserInput("");
                setPinInput("");
                setPinError("");
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                loginMode === "superadmin"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldCheck size={15} className={loginMode === "superadmin" ? "text-amber-600" : ""} />
              <span>Administrador Único</span>
            </button>
          </div>

          {/* Explicación del perfil seleccionado */}
          {loginMode === "owner" ? (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-stone-700">
              <span className="font-bold block text-stone-900 mb-0.5">🏪 Panel de Propietario / Gerente</span>
              <span>Gestioná los pedidos en tiempo real, cobro por caja, tu menú, precios y datos comerciales de <b>{business.name}</b>.</span>
            </div>
          ) : (
            <div className="mb-4 p-2.5 rounded-xl bg-stone-100 border border-stone-300 text-xs text-stone-700">
              <span className="font-bold block text-stone-900 mb-0.5">👑 Administrador Único de la Plataforma</span>
              <span>Acceso total para el desarrollador: activación de clientes, licencias SaaS, códigos y seguridad de IP.</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: BRAND.charcoal }}>
                {loginMode === "owner" ? "Usuario de Comercio o Gerente" : "Usuario Administrador Maestro"}
              </label>
              <input
                type="text"
                autoComplete="username"
                disabled={ipLocked || verifying}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={loginMode === "owner" ? "Ingresar usuario (gerente)" : "Ingresar usuario"}
                className="w-full rounded-xl p-3 text-base border-2 font-medium disabled:opacity-60 placeholder:text-stone-400 placeholder:font-normal placeholder:opacity-90"
                style={{ borderColor: BRAND.paperDark, background: BRAND.cream, color: BRAND.charcoal }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: BRAND.charcoal }}>
                {loginMode === "owner" ? "Clave / PIN del Comercio" : "PIN Maestro de Seguridad"}
              </label>
              <div className="relative">
                <input
                  type={showLoginPin ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={ipLocked || verifying}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ingresar PIN"
                  className="w-full rounded-xl p-3 pr-12 text-base border-2 tracking-wider font-mono disabled:opacity-60 placeholder:text-stone-400 placeholder:font-normal placeholder:opacity-90"
                  style={{ borderColor: BRAND.paperDark, background: BRAND.cream, color: BRAND.charcoal }}
                />
                <button
                  type="button"
                  disabled={ipLocked}
                  onClick={() => setShowLoginPin((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-stone-500 hover:text-stone-800 transition disabled:opacity-40"
                  title={showLoginPin ? "Ocultar clave" : "Ver clave"}
                >
                  {showLoginPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-600 px-1 pt-1.5">
                <span>
                  {loginMode === "owner" ? (
                    <>💡 Demo Comercio: <b>gerente</b> / <b>comercio123</b></>
                  ) : (
                    <span className="font-semibold text-stone-700">🔒 Ingresar PIN de seguridad</span>
                  )}
                </span>
                {loginMode === "owner" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserInput("gerente");
                      setPinInput("comercio123");
                      setPinError("");
                    }}
                    className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Autocompletar demo
                  </button>
                )}
              </div>
            </div>
          </div>

          {pinError && (
            <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <button
            onClick={checkPinAndEnter}
            disabled={verifying || ipLocked}
            className="w-full mt-5 rounded-xl p-3.5 font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition disabled:opacity-60 text-base"
            style={{ background: BRAND.tomato, color: BRAND.cream }}
          >
            {verifying ? (
              <><LoaderCircle className="animate-spin" size={18} /> Verificando acceso...</>
            ) : ipLocked ? (
              `Bloqueado (${formatLockTime(ipRemainingSeconds)})`
            ) : loginMode === "owner" ? (
              "Ingresar al Panel del Comercio"
            ) : (
              "Ingresar como Administrador Único"
            )}
          </button>

          {/* Enlace para adquirir la app y activación de licencia (solo visible para propietarios de comercio) */}
          {loginMode === "owner" && (
            <>
              <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: BRAND.paperDark }}>
                <p className="text-xs text-stone-600 mb-2">¿Querés una App con pedidos para tu propio negocio?</p>
                <button
                  onClick={() => { setView("register"); setRegSuccessVoucher(null); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-400 hover:bg-stone-200 transition inline-flex items-center gap-1.5"
                  style={{ color: BRAND.charcoal }}
                >
                  <Briefcase size={14} /> Adquirir App para mi Comercio (Planes y Precios)
                </button>
              </div>

              <div className="mt-4 pt-4 border-t text-center space-y-2" style={{ borderColor: BRAND.paperDark }}>
                <p className="text-xs text-stone-700 font-semibold">
                  ¿Ya compraste esta app y tenés tu Código de Activación?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivateModal(true);
                    setActivationError("");
                    setActivationSuccess(null);
                    setInputActivationCode("");
                    setInputActivationBusiness(business.name);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-black transition border-2 flex items-center justify-center gap-1.5 shadow-sm hover:brightness-95 bg-white text-stone-900 border-amber-400"
                >
                  <KeyRound size={15} style={{ color: BRAND.tomato }} />
                  <span>Habilitar Comercio con Código de Activación</span>
                </button>
                {appLicense.isActivated && (
                  <p className="text-[11px] font-bold text-emerald-800">
                    ✓ Local Habilitado: {appLicense.businessName} ({appLicense.plan})
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal para ingresar código de activación desde Login */}
        {renderActivateAppModal()}
      </div>
    );
  }

  /* =========================================================================
     PANTALLA: REGISTRO DE USUARIOS Y CONTRATO PARA COMERCIOS (SAAS)
     ========================================================================= */
  if (view === "register") {
    return (
      <div style={{ background: BRAND.charcoal, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif" }} className="py-8 px-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;600;700;800&display=swap'); .slab{font-family:'Alfa Slab One',serif;}`}</style>
        
        <div className="max-w-4xl mx-auto">
          {/* Botón Volver */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => { setView("menu"); setRegSuccessVoucher(null); }}
              className="flex items-center gap-2 text-sm font-bold text-stone-300 hover:text-white transition bg-stone-900/60 px-4 py-2 rounded-full"
            >
              <ArrowLeft size={16} /> Volver a {business.name}
            </button>
            <button
              onClick={() => setView("adminLogin")}
              className="text-xs font-bold text-stone-300 hover:text-white transition flex items-center gap-1"
            >
              <Lock size={14} /> Ya tengo cuenta (Iniciar sesión)
            </button>
          </div>

          {/* Si ya se completó el registro con éxito: VOUCHER DIGITAL */}
          {regSuccessVoucher ? (
            <div className="rounded-3xl p-6 md:p-10 shadow-2xl border-2 text-center" style={{ background: BRAND.paper, borderColor: BRAND.mustard }}>
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 size={36} />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-200 text-stone-900">
                Solicitud Recibida con Éxito
              </span>
              <h2 className="slab text-2xl md:text-3xl mt-3 mb-2" style={{ color: BRAND.charcoal }}>
                ¡Bienvenido a la Red de Apps Gastronómicas!
              </h2>
              <p className="text-sm text-stone-700 max-w-lg mx-auto mb-6">
                Tu solicitud fue registrada y se generaron tus datos para el panel de administración. A continuación podés enviar tu comprobante a WhatsApp para la activación inmediata.
              </p>

              {/* Ficha Resumen */}
              <div className="rounded-2xl p-5 border text-left max-w-lg mx-auto mb-6 space-y-2.5 text-xs md:text-sm bg-white shadow-inner" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-stone-500 font-medium">N° de Solicitud:</span>
                  <span className="font-mono font-bold text-stone-900">#{regSuccessVoucher.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Comercio:</span>
                  <span className="font-bold text-stone-900">{regSuccessVoucher.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Rubro y Ciudad:</span>
                  <span className="font-semibold text-stone-800">{regSuccessVoucher.rubro} • {regSuccessVoucher.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Responsable:</span>
                  <span className="font-semibold text-stone-800">{regSuccessVoucher.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">WhatsApp de Pedidos:</span>
                  <span className="font-bold text-emerald-800 font-mono">{regSuccessVoucher.whatsapp}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-stone-500 font-medium">Usuario asignado:</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{regSuccessVoucher.requestedUser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Plan Seleccionado:</span>
                  <span className="font-bold text-stone-900">{regSuccessVoucher.planTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Total a Abonar:</span>
                  <span className="font-black text-base text-red-600">{formatGs(regSuccessVoucher.amountGs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Forma de Pago:</span>
                  <span className="font-semibold capitalize text-stone-800">{regSuccessVoucher.paymentMethod}</span>
                </div>
                {regSuccessVoucher.paymentRef && (
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Comprobante / Ref:</span>
                    <span className="font-mono font-semibold text-stone-800">{regSuccessVoucher.paymentRef}</span>
                  </div>
                )}

                {regSuccessVoucher.paymentMethod === "transferencia" && (
                  <div className="pt-2 border-t mt-2 text-stone-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <p className="font-bold text-xs text-stone-900 mb-1">🏦 Datos para Transferencia o Alias:</p>
                    <p className="text-xs"><b>Banco:</b> {PAYMENT_INFO.transferencia.bank} • <b>Caja de Ahorro:</b> {PAYMENT_INFO.transferencia.accountNumber}</p>
                    <p className="text-xs"><b>Titular:</b> {PAYMENT_INFO.transferencia.accountHolder} • <b>CI:</b> 7.226.273</p>
                    <p className="text-xs"><b>Alias SIPAP:</b> <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">{PAYMENT_INFO.transferencia.sipapAlias}</span> (o {PAYMENT_INFO.transferencia.aliasAlt})</p>
                    <p className="text-[11px] text-emerald-800 font-bold mt-1">WhatsApp de activación: {PAYMENT_INFO.transferencia.whatsappDisplay}</p>
                  </div>
                )}
              </div>

              {/* Botón Enviar Comprobante por WhatsApp */}
              <div className="max-w-md mx-auto space-y-3">
                <a
                  href={`https://wa.me/${PAYMENT_INFO.transferencia.whatsappIntl}?text=${encodeURIComponent(
                    `¡Hola Camila! Acabo de registrar mi comercio *${regSuccessVoucher.businessName}* para la App Gastronómica.\n\n` +
                    `📋 *Solicitud N°:* #${regSuccessVoucher.id}\n` +
                    `👤 *Propietario:* ${regSuccessVoucher.ownerName}\n` +
                    `📱 *WhatsApp del Local:* ${regSuccessVoucher.whatsapp}\n` +
                    `🔑 *Usuario Solicitado:* ${regSuccessVoucher.requestedUser}\n` +
                    `📦 *Plan:* ${regSuccessVoucher.planTitle}\n` +
                    `💰 *Monto a Abonar:* Gs. ${Number(regSuccessVoucher.amountGs).toLocaleString("es-PY")}\n` +
                    `💳 *Forma de Pago:* ${regSuccessVoucher.paymentMethod}\n` +
                    (regSuccessVoucher.paymentRef ? `🧾 *Comprobante/Ref:* ${regSuccessVoucher.paymentRef}\n\n` : "\n") +
                    `Banco Itaú - Caja de Ahorro: 620011158 - Alias: 7226273 (Camila Ayelen Torres)\n\n` +
                    `Adjunto mi comprobante para la activación de mi panel de administración.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-98 transition text-white"
                  style={{ background: "#25D366" }}
                >
                  <Send size={20} />
                  <span>Enviar Comprobante al WhatsApp ({PAYMENT_INFO.transferencia.whatsappDisplay})</span>
                </a>

                <button
                  onClick={() => { setRegSuccessVoucher(null); setView("menu"); }}
                  className="w-full py-3 rounded-xl font-bold text-xs border-2 transition"
                  style={{ borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                >
                  Volver a la tienda
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-6 md:p-10 shadow-2xl border-2" style={{ background: BRAND.paper, borderColor: BRAND.paperDark }}>
              
              {/* Cabecera del Registro */}
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5" style={{ background: BRAND.mustard, color: BRAND.charcoal }}>
                  <Sparkles size={14} /> Solución Digital para Gastronomía
                </span>
                <h1 className="slab text-3xl md:text-4xl mt-3 mb-2" style={{ color: BRAND.charcoal }}>
                  Adquirí tu propia App de Pedidos
                </h1>
                <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                  Menú interactivo con fotos, pedidos directos a tu WhatsApp (Mesa, Delivery con GPS y Retiro) y tu propio panel de administración protegido para 1 usuario administrador.
                </p>
              </div>

              <form onSubmit={submitBusinessRegistration} className="space-y-8">
                
                {/* 1. SELECCIÓN DE PLAN Y PRECIOS */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ background: BRAND.tomato }}>1</span>
                    <h2 className="slab text-lg md:text-xl" style={{ color: BRAND.charcoal }}>Elegí tu Plan y Precios</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appPricingPlans.map((plan) => {
                      const isSelected = regForm.plan === plan.id;
                      const displayPrice = plan.priceFormatted || `${Number(plan.priceGs).toLocaleString("es-PY")} Gs.`;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setRegForm((prev) => ({
                            ...prev,
                            plan: plan.id,
                            planTitle: `${plan.title} (${displayPrice})`,
                            amountGs: plan.priceGs,
                          }))}
                          className={`relative rounded-2xl p-5 cursor-pointer border-2 transition-all flex flex-col justify-between ${
                            isSelected
                              ? "shadow-xl scale-[1.02] bg-white border-[#C1392B]"
                              : "bg-[#FFF8E7] hover:bg-white border-amber-200"
                          }`}
                        >
                          {plan.badge && (
                            <span
                              className={`absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-black shadow-sm ${
                                plan.highlighted
                                    ? "bg-amber-400 text-stone-900"
                                    : "bg-stone-800 text-amber-300"
                              }`}
                            >
                              {plan.badge}
                            </span>
                          )}

                          <div>
                            <h3 className="font-bold text-base mb-1" style={{ color: BRAND.charcoal }}>
                              {plan.title}
                            </h3>
                            <div className="my-2">
                              <span className="text-2xl md:text-3xl font-black font-mono" style={{ color: BRAND.tomato }}>
                                {displayPrice}
                              </span>
                              <span className="text-xs text-stone-500 block">{plan.period}</span>
                            </div>

                            {plan.savings && (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                                {plan.savings}
                              </span>
                            )}

                            <p className="text-xs text-stone-600 mb-4">{plan.description}</p>

                            <ul className="space-y-2 text-xs border-t pt-3 mb-4" style={{ borderColor: BRAND.paperDark }}>
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-stone-700">
                                  <Check size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                              isSelected
                                ? "bg-[#C1392B] text-white shadow"
                                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                            }`}
                          >
                            {isSelected ? "✓ Plan Seleccionado" : "Elegir este Plan"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DATOS DEL COMERCIO Y CONTACTO */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ background: BRAND.tomato }}>2</span>
                    <h2 className="slab text-lg md:text-xl" style={{ color: BRAND.charcoal }}>Datos del Comercio</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Nombre de Fantasía del Comercio *</label>
                      <input
                        required
                        type="text"
                        value={regForm.businessName}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Ej: Pizzería Di Napoli, Burger Club, etc."
                        className="w-full p-3 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Rubro Comercial *</label>
                      <select
                        value={regForm.rubro}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, rubro: e.target.value }))}
                        className="w-full p-3 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      >
                        <option value="Rotisería y Minutas">Rotisería y Minutas</option>
                        <option value="Pizzería">Pizzería</option>
                        <option value="Hamburguesería & Lomitos">Hamburguesería & Lomitos</option>
                        <option value="Restaurante">Restaurante</option>
                        <option value="Cafetería y Pastelería">Cafetería y Pastelería</option>
                        <option value="Bar y Cervecería">Bar y Cervecería</option>
                        <option value="Heladería">Heladería</option>
                        <option value="Otro Comercio Gastronómico">Otro Comercio Gastronómico</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Ciudad / Ubicación *</label>
                      <input
                        required
                        type="text"
                        value={regForm.city}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Ej: Encarnación, Asunción, CDE, etc."
                        className="w-full p-3 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Nombre del Responsable / Dueño *</label>
                      <input
                        required
                        type="text"
                        value={regForm.ownerName}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className="w-full p-3 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>
                        WhatsApp de Pedidos (donde llegarán las compras) *
                      </label>
                      <input
                        required
                        type="text"
                        value={regForm.whatsapp}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="Ej: 0981 123 456 o 595981123456"
                        className="w-full p-3 rounded-xl border text-sm font-mono font-bold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                      <span className="text-[11px] text-stone-500 mt-1 block">Los clientes enviarán los pedidos por WhatsApp a este número.</span>
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Email de Contacto (opcional)</label>
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="ejemplo@comercio.com"
                        className="w-full p-3 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. REGISTRO DE USUARIO Y CONTRASEÑA PARA EL ADMINISTRADOR */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ background: BRAND.tomato }}>3</span>
                    <h2 className="slab text-lg md:text-xl" style={{ color: BRAND.charcoal }}>
                      Usuario y Contraseña para tu Panel de Administración
                    </h2>
                  </div>
                  <p className="text-xs text-stone-600 mb-3">
                    Definí el usuario y contraseña con el que ingresarás a tu panel privado para gestionar tus platos, precios y portada.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Usuario Deseado *</label>
                      <input
                        required
                        type="text"
                        value={regForm.requestedUser}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, requestedUser: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                        placeholder="Ej: dinapoli, admin, etc."
                        className="w-full p-3 rounded-xl border text-sm font-mono font-bold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                      <span className="text-[11px] text-stone-500 mt-1 block">Solo letras minúsculas, números o guiones.</span>
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Contraseña de Administrador *</label>
                      <div className="relative">
                        <input
                          required
                          type={showRegPassword ? "text" : "password"}
                          value={regForm.requestedPassword}
                          onChange={(e) => setRegForm((prev) => ({ ...prev, requestedPassword: e.target.value }))}
                          placeholder="Tu contraseña o PIN"
                          className="w-full p-3 pr-10 rounded-xl border text-sm font-mono"
                          style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 p-1"
                        >
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Confirmar Contraseña *</label>
                      <input
                        required
                        type={showRegPassword ? "text" : "password"}
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repetir contraseña"
                        className="w-full p-3 rounded-xl border text-sm font-mono"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. FORMAS DE PAGO DISPONIBLES */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ background: BRAND.tomato }}>4</span>
                    <h2 className="slab text-lg md:text-xl" style={{ color: BRAND.charcoal }}>Forma de Pago</h2>
                  </div>

                  {/* Selector de Métodos de Pago */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { id: "transferencia", label: "Transferencia / SIPAP", icon: Building2 },
                      { id: "billetera", label: "Giros Tigo / Billeteras", icon: Phone },
                      { id: "qr_card", label: "Tarjeta / QR Bancard", icon: CreditCard },
                      { id: "efectivo", label: "Efectivo / A Coordinar", icon: Store },
                    ].map((m) => {
                      const IconComp = m.icon;
                      const isSel = regForm.paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setRegForm((prev) => ({ ...prev, paymentMethod: m.id }))}
                          className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                            isSel
                              ? "bg-white border-[#C1392B] text-stone-900 shadow-sm"
                              : "bg-[#FFF8E7] border-amber-200 text-stone-600 hover:bg-white"
                          }`}
                        >
                          <IconComp size={18} className={isSel ? "text-red-700" : "text-stone-500"} />
                          <span className="text-center">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cuadro de Información según el Método Seleccionado */}
                  <div className="p-4 rounded-2xl bg-white border-2 shadow-sm text-xs" style={{ borderColor: BRAND.paperDark }}>
                    {regForm.paymentMethod === "transferencia" && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                            🏦 Transferencia Bancaria SIPAP / Alias
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(
                                `Banco: ${PAYMENT_INFO.transferencia.bank}\nTipo: ${PAYMENT_INFO.transferencia.accountType}\nCuenta: ${PAYMENT_INFO.transferencia.accountNumber}\nTitular: ${PAYMENT_INFO.transferencia.accountHolder}\n${PAYMENT_INFO.transferencia.documentId}\nAlias: ${PAYMENT_INFO.transferencia.sipapAlias}\nWhatsApp: ${PAYMENT_INFO.transferencia.whatsappDisplay}`,
                                "banco"
                              )}
                              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Copy size={12} /> {copiedText === "banco" ? "¡Datos Copiados!" : "Copiar todos los datos"}
                            </button>
                            <a
                              href={`https://wa.me/${PAYMENT_INFO.transferencia.whatsappIntl}?text=${encodeURIComponent(
                                "¡Hola Camila! Me contacto para consultar sobre los datos de transferencia para la App Gastronómica (Banco Itaú, Caja de Ahorro 620011158, Alias CI: 7226273)."
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded bg-[#25D366] text-white font-bold text-[11px] flex items-center gap-1 hover:brightness-105"
                            >
                              <Phone size={11} /> WhatsApp
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-800 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
                          <div>
                            <span className="text-stone-500 font-medium block">Entidad Bancaria:</span>
                            <span className="font-bold text-stone-900 text-sm">{PAYMENT_INFO.transferencia.bank}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 font-medium block">Tipo y N° de Cuenta:</span>
                            <span className="font-mono font-bold text-stone-900 text-sm">
                              {PAYMENT_INFO.transferencia.accountType} N° {PAYMENT_INFO.transferencia.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(PAYMENT_INFO.transferencia.accountNumber, "cta")}
                              className="ml-1.5 text-[10px] text-stone-600 underline hover:text-stone-900"
                            >
                              {copiedText === "cta" ? "✓ Copiado" : "(Copiar cuenta)"}
                            </button>
                          </div>
                          <div>
                            <span className="text-stone-500 font-medium block">Titular de la Cuenta:</span>
                            <span className="font-bold text-stone-900">{PAYMENT_INFO.transferencia.accountHolder}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 font-medium block">Cédula de Identidad (CI):</span>
                            <span className="font-mono font-bold text-stone-900">{PAYMENT_INFO.transferencia.documentId}</span>
                          </div>
                          <div className="sm:col-span-2 pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <span className="text-stone-500 font-medium block">Alias SIPAP:</span>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-stone-900">
                                  {PAYMENT_INFO.transferencia.sipapAlias}
                                </span>
                                <span className="text-xs text-stone-600 font-medium">o simplemente:</span>
                                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-stone-900">
                                  {PAYMENT_INFO.transferencia.aliasAlt}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(PAYMENT_INFO.transferencia.aliasAlt, "alias")}
                              className="self-start sm:self-center px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Copy size={11} /> {copiedText === "alias" ? "¡Alias Copiado!" : "Copiar Alias (7226273)"}
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-600">
                          📲 Podés enviar el comprobante o comunicarte por WhatsApp directamente al <a href={`https://wa.me/${PAYMENT_INFO.transferencia.whatsappIntl}`} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-800 underline">{PAYMENT_INFO.transferencia.whatsappDisplay}</a>.
                        </p>
                      </div>
                    )}

                    {regForm.paymentMethod === "billetera" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-stone-800">📱 Giros Tigo / Billeteras Móviles</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(PAYMENT_INFO.billetera.number, "giro")}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1"
                          >
                            <Copy size={12} /> {copiedText === "giro" ? "¡Copiado!" : "Copiar número"}
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-700">
                          <p className="font-bold text-base font-mono text-emerald-800 mb-1">
                            Número para Giros: {PAYMENT_INFO.billetera.number}
                          </p>
                          <p className="text-stone-600">Titular: {PAYMENT_INFO.billetera.holder}</p>
                          <p className="text-[11px] text-stone-500 mt-1">{PAYMENT_INFO.billetera.note}</p>
                        </div>
                      </div>
                    )}

                    {regForm.paymentMethod === "qr_card" && (
                      <div className="space-y-2">
                        <span className="font-bold text-sm text-stone-800">💳 Pago con Tarjeta de Débito/Crédito o QR Bancard</span>
                        <p className="text-stone-600 leading-relaxed">
                          Al registrar tu solicitud, recibirás automáticamente el enlace de pago web seguro y el código QR de Bancard / Pago Móvil a tu WhatsApp para abonar en el acto.
                        </p>
                      </div>
                    )}

                    {regForm.paymentMethod === "efectivo" && (
                      <div className="space-y-2">
                        <span className="font-bold text-sm text-stone-800">💵 Pago en Efectivo</span>
                        <p className="text-stone-600 leading-relaxed">
                          Coordinaremos contigo por WhatsApp para el cobro presencial en tu local o con nuestro asesor comercial de la zona.
                        </p>
                      </div>
                    )}

                    {/* Referencia o N° de Comprobante */}
                    <div className="mt-4 pt-3 border-t">
                      <label className="font-bold block mb-1 text-stone-700">
                        N° de Comprobante / Referencia de Pago (opcional):
                      </label>
                      <input
                        type="text"
                        value={regForm.paymentRef}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, paymentRef: e.target.value }))}
                        placeholder="Ej: Transferencia N° 849202 o Foto del ticket"
                        className="w-full p-2.5 rounded-xl border text-xs"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                  </div>
                </div>

                {/* MENSAJES DE ERROR */}
                {regError && (
                  <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* RESUMEN Y BOTÓN FINAL DE REGISTRO */}
                <div className="pt-4 border-t" style={{ borderColor: BRAND.paperDark }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs text-stone-600 block">Total a pagar por {regForm.planTitle}:</span>
                      <span className="text-3xl font-black font-mono" style={{ color: BRAND.tomato }}>
                        {formatGs(regForm.amountGs)}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-98 transition disabled:opacity-60 text-white"
                      style={{ background: BRAND.tomato }}
                    >
                      {regSubmitting ? (
                        <><LoaderCircle className="animate-spin" size={20} /> Registrando comercio...</>
                      ) : (
                        <><Briefcase size={20} /> Registrar mi Comercio y Adquirir la App</>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-stone-500">
                    Al enviar el formulario, recibirás tus credenciales y el comprobante para la activación inmediata por WhatsApp.
                  </p>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     PANTALLA: PANEL DE ADMINISTRACIÓN (Menú + Datos del Comercio y Portada)
     ========================================================================= */
  if (view === "admin") {
    return (
      <AdminErrorBoundary onGoBack={() => setView("menu")}>
        <div style={{ background: BRAND.paper, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif" }} className="pb-32">
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;500;600;700;800&display=swap'); .slab{font-family:'Alfa Slab One',serif;}`}</style>
          
          {/* Barra superior de administración */}
          <div style={{ background: BRAND.charcoal }} className="px-4 py-3.5 sticky top-0 z-30 shadow-md">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <button
                onClick={() => (dirty ? setShowExitConfirm(true) : setView("menu"))}
                className="flex items-center gap-1.5 text-sm font-bold hover:opacity-80 transition py-1 px-2 rounded-lg"
                style={{ color: BRAND.cream }}
              >
                <ArrowLeft size={18} /> Volver a la tienda
              </button>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5"
                  style={{
                    background: adminRole === "superadmin" ? "#FEF08A" : "#D1FAE5",
                    color: adminRole === "superadmin" ? "#854D0E" : "#065F46",
                  }}
                >
                  {adminRole === "superadmin" ? "👑 Superadmin App" : "🏪 Propietario Comercio"}
                </span>
                <span className="hidden sm:inline text-xs font-bold" style={{ color: BRAND.mustardLight }}>
                  {business.name}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold shadow-sm" style={dirty ? { background: BRAND.mustard, color: BRAND.charcoal } : { background: BRAND.green, color: BRAND.cream }}>
                  {dirty ? "Cambios sin guardar" : "Todo guardado"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (dirty) {
                      setShowExitConfirm(true);
                    } else {
                      setView("adminLogin");
                      setPinInput("");
                    }
                  }}
                  className="text-xs font-bold text-stone-300 hover:text-white transition px-2 py-1 rounded bg-stone-800/80 hover:bg-stone-700 ml-1"
                  title="Cerrar sesión de administración"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>

          {/* Navegación por pestañas del panel */}
          <div style={{ background: BRAND.charcoalDark }} className="border-b border-stone-800 overflow-x-auto">
            <div className="max-w-5xl mx-auto px-4 flex gap-1 sm:gap-2 min-w-max">
              <button
                onClick={() => { setAdminTab("orders"); loadOrders(); }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold transition border-b-4 ${
                  adminTab === "orders"
                    ? "border-[#C1392B] text-[#FBF2DD] bg-stone-900/50"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Receipt size={17} />
                <span>Panel de Pedidos y Caja</span>
                {pendingOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-900 animate-pulse">
                    {pendingOrders.length} pendientes
                  </span>
                )}
              </button>
              <button
                onClick={() => { setAdminTab("history"); loadOrders(); }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold transition border-b-4 ${
                  adminTab === "history"
                    ? "border-[#C1392B] text-[#FBF2DD] bg-stone-900/50"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <History size={17} />
                <span>Historial de Pedidos</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-stone-800 text-amber-300">
                  {orders.length}
                </span>
              </button>
              <button
                onClick={() => setAdminTab("menu")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold transition border-b-4 ${
                  adminTab === "menu"
                    ? "border-[#C1392B] text-[#FBF2DD] bg-stone-900/50"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Utensils size={17} />
                <span>Menú y Platos</span>
              </button>
              <button
                onClick={() => setAdminTab("business")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold transition border-b-4 ${
                  adminTab === "business"
                    ? "border-[#C1392B] text-[#FBF2DD] bg-stone-900/50"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Store size={17} />
                <span>Datos del Comercio y Portada</span>
              </button>
              {adminRole === "superadmin" && (
                <button
                  onClick={() => { setAdminTab("clients"); loadRegisteredClients(); }}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition border-b-4 ${
                    adminTab === "clients"
                      ? "border-[#C1392B] text-[#FBF2DD] bg-stone-900/50"
                      : "border-transparent text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <Briefcase size={17} />
                  <span>Comercios y Seguridad IP</span>
                  {(Array.isArray(registeredClients) ? registeredClients.length : 0) > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-900">
                      {registeredClients.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

        {/* Modal de confirmación al salir con cambios sin guardar */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.65)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: BRAND.cream }}>
              <p className="font-bold text-lg mb-1" style={{ color: BRAND.charcoal }}>¿Deseás salir sin guardar?</p>
              <p className="text-sm text-stone-600 mb-5">Tenés cambios pendientes. Si salís ahora se perderán las modificaciones no guardadas.</p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => { setShowExitConfirm(false); saveAllAdminChanges(); setView("menu"); }}
                  className="w-full rounded-xl p-3 text-sm font-bold shadow transition hover:brightness-105"
                  style={{ background: BRAND.green, color: BRAND.cream }}
                >
                  Guardar cambios y salir
                </button>
                <button
                  onClick={() => { setShowExitConfirm(false); setView("menu"); }}
                  className="w-full rounded-xl p-3 text-sm font-bold transition hover:brightness-105"
                  style={{ background: BRAND.tomato, color: BRAND.cream }}
                >
                  Salir sin guardar
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full rounded-xl p-3 text-sm font-bold border-2 transition"
                  style={{ borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                >
                  Continuar editando
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de pestañas */}
        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* =============================================================
              PESTAÑA: PANEL DE PEDIDOS Y CONTROL DE COBRO POR CAJA
              ============================================================= */}
          {adminTab === "orders" && (
            <div className="space-y-6">

              {/* Cabecera del Panel de Pedidos con Métricas en Vivo */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-4" style={{ borderColor: BRAND.paperDark }}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl text-white shadow-inner flex items-center justify-center" style={{ background: BRAND.tomato }}>
                      <Receipt size={28} />
                    </div>
                    <div>
                      <h2 className="slab text-xl md:text-2xl text-stone-900 leading-tight">
                        Panel de Pedidos y Cobro por Caja
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Atención de pedidos solicitados por Mesa, Delivery o Retiro en Mostrador.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={loadOrders}
                      disabled={loadingOrders}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition bg-stone-100 hover:bg-stone-200 text-stone-800"
                    >
                      <RefreshCw size={14} className={loadingOrders ? "animate-spin" : ""} />
                      <span>{loadingOrders ? "Actualizando..." : "Actualizar pedidos"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab("history")}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                    >
                      <History size={14} />
                      <span>Historial Completo ({orders.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCashReportPrint(true)}
                      className="px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 text-white hover:brightness-105"
                      style={{ background: BRAND.green }}
                    >
                      <Printer size={15} />
                      <span>Imprimir Movimiento de Caja</span>
                    </button>
                  </div>
                </div>

                {/* Tarjetas resumen de estado rápido de pedidos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border bg-amber-50/60 border-amber-200">
                    <span className="text-xs font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                      <Clock size={13} className="text-amber-700" /> Pendientes de Cobro
                    </span>
                    <span className="text-2xl font-black text-amber-800 font-mono">
                      {pendingOrders.length}
                    </span>
                    <span className="text-[11px] block text-stone-600 mt-0.5">
                      Por cobrar: <b>{formatGs(pendingOrders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0))}</b>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-emerald-50/60 border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 block mb-0.5 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-700" /> Cobrados / Pagados
                    </span>
                    <span className="text-2xl font-black text-emerald-800 font-mono">
                      {paidOrders.length}
                    </span>
                    <span className="text-[11px] block text-stone-600 mt-0.5">
                      En caja: <b>{formatGs(paidOrders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0))}</b>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-stone-50 border-stone-200">
                    <span className="text-xs font-bold text-stone-700 block mb-0.5 flex items-center gap-1">
                      <Utensils size={13} className="text-stone-500" /> Mesas en Salón
                    </span>
                    <span className="text-2xl font-black text-stone-900 font-mono">
                      {pendingOrders.filter((o) => o.mode === "mesa").length}
                    </span>
                    <span className="text-[11px] block text-stone-500 mt-0.5">
                      En atención
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-stone-50 border-stone-200">
                    <span className="text-xs font-bold text-stone-700 block mb-0.5 flex items-center gap-1">
                      <Bike size={13} className="text-stone-500" /> Delivery y Retiro
                    </span>
                    <span className="text-2xl font-black text-stone-900 font-mono">
                      {pendingOrders.filter((o) => o.mode === "delivery" || o.mode === "retiro").length}
                    </span>
                    <span className="text-[11px] block text-stone-500 mt-0.5">
                      Para despacho
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Filtros de Modalidad y Buscador */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 shadow-sm" style={{ borderColor: BRAND.paperDark }}>
                {/* Botones de Modalidad */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-bold text-stone-500 mr-1 hidden sm:inline">Filtrar por:</span>
                  <button
                    type="button"
                    onClick={() => setOrdersFilterMode("todos")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      ordersFilterMode === "todos"
                        ? "bg-stone-900 text-white shadow"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <span>Todos ({pendingOrders.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdersFilterMode("mesa")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      ordersFilterMode === "mesa"
                        ? "bg-amber-600 text-white shadow"
                        : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <Utensils size={13} />
                    <span>Mesas ({pendingOrders.filter((o) => o.mode === "mesa").length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdersFilterMode("delivery")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      ordersFilterMode === "delivery"
                        ? "bg-emerald-700 text-white shadow"
                        : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    <Bike size={13} />
                    <span>Delivery ({pendingOrders.filter((o) => o.mode === "delivery").length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrdersFilterMode("retiro")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      ordersFilterMode === "retiro"
                        ? "bg-orange-700 text-white shadow"
                        : "bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200"
                    }`}
                  >
                    <ShoppingBag size={13} />
                    <span>Retiro Mostrador ({pendingOrders.filter((o) => o.mode === "retiro").length})</span>
                  </button>
                </div>

                {/* Buscador de pedidos */}
                <div className="relative flex-1 max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    placeholder="Buscar mesa, cliente, plato o código..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ borderColor: BRAND.paperDark }}
                  />
                  {ordersSearch && (
                    <button
                      type="button"
                      onClick={() => setOrdersSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* LISTA DE PEDIDOS PENDIENTES DE COBRO */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                    <Clock size={18} className="text-amber-600" />
                    <span>Pedidos Pendientes de Cobro ({filteredActiveOrders.length})</span>
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Una vez cobrado, el pedido se archiva para el arqueo de caja
                  </span>
                </div>

                {filteredActiveOrders.length === 0 ? (
                  <div className="rounded-2xl p-10 border-2 bg-white text-center shadow-sm" style={{ borderColor: BRAND.paperDark }}>
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="font-bold text-stone-800 text-base mb-1">
                      {ordersSearch ? "No se encontraron pedidos con ese criterio" : "¡No hay pedidos pendientes de cobro!"}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
                      {ordersSearch
                        ? "Probá limpiando el buscador para ver todos los pedidos activos."
                        : "Todos los pedidos generados por mesa, delivery o mostrador han sido cobrados o aún no se han recibido nuevos pedidos."}
                    </p>
                    {ordersSearch && (
                      <button
                        type="button"
                        onClick={() => setOrdersSearch("")}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-800"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActiveOrders.map((order) => {
                      const isMesa = order.mode === "mesa";
                      const isDelivery = order.mode === "delivery";
                      const isRetiro = order.mode === "retiro";

                      const modeBadgeBg = isMesa
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : isDelivery
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-orange-100 text-orange-900 border-orange-300";

                      const modeIcon = isMesa ? (
                        <Utensils size={14} className="text-amber-800" />
                      ) : isDelivery ? (
                        <Bike size={14} className="text-emerald-800" />
                      ) : (
                        <ShoppingBag size={14} className="text-orange-800" />
                      );

                      const modeTitle = isMesa
                        ? `Mesa ${order.tableNumber || "en salón"}`
                        : isDelivery
                        ? "Envío Delivery"
                        : "Retiro en Mostrador";

                      const orderDate = formatTimeSafe(order.createdAt);

                      return (
                        <div
                          key={order.id}
                          className="rounded-2xl bg-white border-2 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                          style={{ borderColor: BRAND.paperDark }}
                        >
                          <div>
                            {/* Cabecera de la comanda */}
                            <div className="flex items-start justify-between gap-2 pb-3 border-b mb-3" style={{ borderColor: BRAND.paperDark }}>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                    {order.id}
                                  </span>
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${modeBadgeBg}`}>
                                    {modeIcon}
                                    <span>{modeTitle}</span>
                                  </span>
                                  <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                                    <Clock size={12} /> {orderDate}
                                  </span>
                                </div>

                                <h4 className="font-black text-stone-900 text-base">
                                  {order.customerName || (isMesa ? `Mesa ${order.tableNumber}` : "Cliente")}
                                </h4>
                                {order.customerPhone && (
                                  <p className="text-xs text-stone-500 flex items-center gap-1">
                                    <Phone size={11} /> {order.customerPhone}
                                  </p>
                                )}
                                {order.address && isDelivery && (
                                  <p className="text-xs text-stone-600 mt-0.5 flex items-start gap-1">
                                    <MapPin size={12} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <span>{order.address}</span>
                                  </p>
                                )}
                                {order.mapLink && isDelivery && (
                                  <div className="mt-1.5">
                                    <a
                                      href={order.mapLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
                                    >
                                      <Navigation size={12} className="text-emerald-700" />
                                      <span>Ver en Google Maps</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Badge Estado Pendiente de Cobro */}
                              <div className="text-right flex-shrink-0">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                  <Clock size={12} /> Pendiente de pago
                                </span>
                              </div>
                            </div>

                            {/* Desglose de Platos del Pedido */}
                            <div className="bg-stone-50 rounded-xl p-3 mb-3 border border-stone-200">
                              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                                Detalle de platos y productos:
                              </span>
                              <div className="space-y-1.5 text-xs text-stone-800">
                                {(order.items || []).map((it, itIdx) => (
                                  <div key={itIdx} className="flex items-center justify-between">
                                    <span className="font-medium">
                                      <b className="font-bold text-stone-900">{it.qty}x</b> {it.name}
                                    </span>
                                    <span className="font-mono text-stone-600">
                                      {formatGs((it.qty || 1) * (it.price || 0))}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {order.notes && (
                                <div className="mt-2.5 pt-2 border-t border-stone-200 text-xs text-stone-600 italic">
                                  <b>Aclaraciones:</b> "{order.notes}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pie de pedido: Total y Botón de Cobro en Caja */}
                          <div>
                            <div className="flex items-center justify-between pb-3 pt-1">
                              <span className="text-xs font-bold text-stone-500">Total a cobrar:</span>
                              <span className="font-mono text-xl font-black text-stone-900">
                                {formatGs(order.totalPrice)}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: BRAND.paperDark }}>
                              {/* Botón destacado: Marcar como Completado o Entregado y notificar WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleMarkCompletedAndNotify(order)}
                                className="w-full py-2.5 px-3 rounded-xl font-black text-xs md:text-sm text-white flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.99] transition"
                                style={{ background: "#059669" }}
                                title="Marcar pedido como completado o entregado y enviar actualización por WhatsApp al cliente"
                              >
                                <MessageCircle size={16} className="text-amber-200" />
                                <span>Completado / Entregado (WhatsApp)</span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPayOrder(order);
                                    setSelectedPayMethod("efectivo");
                                  }}
                                  className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow hover:brightness-105 transition"
                                  style={{ background: BRAND.green }}
                                >
                                  <CheckSquare size={15} />
                                  <span>Cobrar por Caja</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-2 rounded-xl border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="Anular o descartar pedido"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =============================================================
                  SECCIÓN: HISTORIAL DE PEDIDOS COBRADOS & ARQUEO DE CAJA
                  ============================================================= */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b mb-5" style={{ borderColor: BRAND.paperDark }}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-800">
                      <History size={22} className="text-stone-700" />
                    </div>
                    <div>
                      <h3 className="slab text-lg md:text-xl text-stone-900 leading-tight">
                        Historial Guardado y Movimiento de Caja
                      </h3>
                      <p className="text-xs text-stone-600">
                        Registro de todos los pedidos cobrados con filtro por Día, Semana o Mes.
                      </p>
                    </div>
                  </div>

                  {/* Selector de Período (Día / Semana / Mes) */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCashPeriod("dia")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        cashPeriod === "dia" ? "bg-stone-900 text-white shadow" : "text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Hoy (Día)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashPeriod("semana")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        cashPeriod === "semana" ? "bg-stone-900 text-white shadow" : "text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Esta Semana
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashPeriod("mes")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        cashPeriod === "mes" ? "bg-stone-900 text-white shadow" : "text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Este Mes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashPeriod("todos")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        cashPeriod === "todos" ? "bg-stone-900 text-white shadow" : "text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Histórico
                    </button>
                  </div>
                </div>

                {/* Resumen contable del período seleccionado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 block mb-0.5">
                      Ingreso Total en Caja ({cashPeriod === "dia" ? "Hoy" : cashPeriod === "semana" ? "Semana" : cashPeriod === "mes" ? "Mes" : "Total"})
                    </span>
                    <span className="text-2xl font-black text-emerald-800 font-mono">
                      {formatGs(cashMovementStats.totalIncome)}
                    </span>
                    <span className="text-xs text-stone-600 block mt-1">
                      {cashMovementStats.countOrders} {cashMovementStats.countOrders === 1 ? "pedido cobrado" : "pedidos cobrados"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-xs font-bold text-stone-700 block mb-0.5">
                      Desglose por Modalidad
                    </span>
                    <div className="space-y-1 text-xs text-stone-700 mt-1.5">
                      <div className="flex justify-between">
                        <span>🍽️ Mesas ({cashMovementStats.byMode.mesa.count}):</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byMode.mesa.total)}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>🛵 Delivery ({cashMovementStats.byMode.delivery.count}):</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byMode.delivery.total)}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>🛍️ Retiro ({cashMovementStats.byMode.retiro.count}):</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byMode.retiro.total)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-xs font-bold text-stone-700 block mb-0.5">
                      Desglose por Medio de Pago
                    </span>
                    <div className="space-y-1 text-xs text-stone-700 mt-1.5">
                      <div className="flex justify-between">
                        <span>💵 Efectivo:</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.efectivo)}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>💳 POS / Tarjeta:</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.pos)}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>🏦 Transferencia / SIPAP:</span>
                        <b className="font-mono">{formatGs(cashMovementStats.byPaymentMethod.transferencia)}</b>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla / Listado de pedidos cobrados en este período */}
                {cashMovementStats.periodOrders.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs bg-stone-50 rounded-xl border border-dashed border-stone-300">
                    No hay pedidos cobrados registrados en este período seleccionado ({cashPeriod}).
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-stone-200">
                    <table className="w-full text-left text-xs text-stone-800">
                      <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Código</th>
                          <th className="p-3">Fecha / Hora</th>
                          <th className="p-3">Modalidad</th>
                          <th className="p-3">Cliente / Detalle</th>
                          <th className="p-3">Medio de Pago</th>
                          <th className="p-3 text-right">Monto</th>
                          <th className="p-3 text-center">Estado</th>
                          <th className="p-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {cashMovementStats.periodOrders.map((po) => {
                          const isMesa = po.mode === "mesa";
                          const isDelivery = po.mode === "delivery";

                          return (
                            <tr key={po.id} className="hover:bg-stone-50/80 transition">
                              <td className="p-3 font-mono font-bold text-stone-600">{po.id}</td>
                              <td className="p-3 whitespace-nowrap text-stone-500">
                                {formatDateSafe(po.paidAt || po.createdAt)} {formatTimeSafe(po.paidAt || po.createdAt)}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700">
                                  {isMesa ? `🍽️ Mesa ${po.tableNumber || "Salón"}` : isDelivery ? "🛵 Delivery" : "🛍️ Retiro"}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold block text-stone-900">{po.customerName}</span>
                                <span className="text-[11px] text-stone-500 line-clamp-1">
                                  {(po.items || []).map((i) => `${i.qty}x ${i.name}`).join(", ")}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap font-medium capitalize text-stone-700">
                                {po.paymentMethod === "pos" ? "💳 Tarjeta / POS" : po.paymentMethod === "transferencia" ? "🏦 Transferencia" : po.paymentMethod === "tigo_money" ? "📱 Billetera" : "💵 Efectivo"}
                              </td>
                              <td className="p-3 text-right font-mono font-black text-stone-900 whitespace-nowrap">
                                {formatGs(po.totalPrice)}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                  ✓ Pagado
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleResetOrderPayment(po.id)}
                                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline mr-2"
                                  title="Devolver a pendientes de pago"
                                >
                                  Reabrir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(po.id)}
                                  className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                                  title="Eliminar de caja"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =============================================================
              PESTAÑA: HISTORIAL DE PEDIDOS RECIBIDOS (FILTROS POR FECHA Y ESTADO)
              ============================================================= */}
          {adminTab === "history" && (
            <div className="space-y-6">

              {/* Cabecera Principal del Historial */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-4" style={{ borderColor: BRAND.paperDark }}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl text-white shadow-inner flex items-center justify-center" style={{ background: BRAND.tomato }}>
                      <History size={28} />
                    </div>
                    <div>
                      <h2 className="slab text-xl md:text-2xl text-stone-900 leading-tight">
                        Historial de Pedidos Recibidos
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Auditoría y control de pedidos. Filtrá por fecha exacta, período y estado del pedido.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={loadOrders}
                      disabled={loadingOrders}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition bg-stone-100 hover:bg-stone-200 text-stone-800"
                    >
                      <RefreshCw size={14} className={loadingOrders ? "animate-spin" : ""} />
                      <span>{loadingOrders ? "Actualizando..." : "Actualizar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportHistoryCsv}
                      disabled={filteredHistoryOrders.length === 0}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 disabled:opacity-50 shadow-sm"
                      title="Exportar datos contables filtrados a archivo CSV compatible con Excel"
                    >
                      <Download size={14} />
                      <span>Exportar CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHistoryPdfModal(true)}
                      disabled={filteredHistoryOrders.length === 0}
                      className="px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 text-white hover:brightness-105 disabled:opacity-50"
                      style={{ background: BRAND.charcoalDark }}
                      title="Exportar datos contables filtrados a formato PDF / Imprimir"
                    >
                      <FileText size={15} className="text-amber-300" />
                      <span>Exportar PDF / Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* FILTROS INTERACTIVOS: FECHA, ESTADO, MODALIDAD Y BUSCADOR */}
                <div className="p-4 rounded-xl border bg-stone-50/80 border-stone-200 space-y-4">
                  {/* 1. FILTRO POR FECHA */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-black text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar size={15} className="text-amber-600" />
                        <span>Filtrar por Fecha:</span>
                      </span>
                      {historyCustomDate && historyDatePreset === "personalizado" && (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          Día seleccionado: {formatDateSafe(historyCustomDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { id: "todos", label: "Todos los días" },
                        { id: "hoy", label: "Hoy" },
                        { id: "ayer", label: "Ayer" },
                        { id: "ultimos7", label: "Últimos 7 días" },
                        { id: "mes", label: "Este Mes" },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setHistoryDatePreset(preset.id);
                            if (preset.id !== "personalizado") setHistoryCustomDate("");
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            historyDatePreset === preset.id
                              ? "bg-stone-900 text-white shadow-sm"
                              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          <span>{preset.label}</span>
                        </button>
                      ))}

                      {/* Selector de fecha específica */}
                      <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-xl px-2.5 py-1">
                        <span className="text-xs text-stone-500 font-semibold">Fecha exacta:</span>
                        <input
                          type="date"
                          value={historyCustomDate}
                          onChange={(e) => {
                            setHistoryCustomDate(e.target.value);
                            setHistoryDatePreset(e.target.value ? "personalizado" : "todos");
                          }}
                          className="text-xs font-bold text-stone-800 outline-none bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. FILTRO POR ESTADO DEL PEDIDO */}
                  <div className="pt-3 border-t border-stone-200">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                      <Filter size={15} className="text-emerald-700" />
                      <span>Filtrar por Estado del Pedido:</span>
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { id: "todos", label: "Todos los Estados", count: orders.length },
                        {
                          id: "pendiente",
                          label: "⏳ Pendientes de Cobro",
                          count: orders.filter((o) => (o?.paymentStatus || "").toLowerCase() === "pendiente").length,
                        },
                        {
                          id: "pagado",
                          label: "✅ Cobrados / Pagados",
                          count: orders.filter((o) => {
                            const s = (o?.paymentStatus || "").toLowerCase();
                            return s === "pagado" || s === "cobrado";
                          }).length,
                        },
                        {
                          id: "cancelado",
                          label: "❌ Cancelados / Anulados",
                          count: orders.filter((o) => {
                            const s = (o?.paymentStatus || "").toLowerCase();
                            return s === "cancelado" || s === "anulado";
                          }).length,
                        },
                      ].map((item) => {
                        const isSelected = historyStatusFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setHistoryStatusFilter(item.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                              isSelected
                                ? "bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/20"
                                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                              isSelected ? "bg-stone-700 text-white" : "bg-stone-100 text-stone-600"
                            }`}>
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. FILTRO POR MODALIDAD Y BÚSQUEDA POR TEXTO */}
                  <div className="pt-3 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-stone-600 block mb-1">
                        Modalidad de Pedido:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: "todos", label: "Todas" },
                          { id: "mesa", label: "🍽️ Mesa" },
                          { id: "delivery", label: "🛵 Delivery" },
                          { id: "retiro", label: "🛍️ Retiro" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setHistoryModeFilter(m.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              historyModeFilter === m.id
                                ? "bg-stone-800 text-white"
                                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-stone-600 block mb-1">
                        Buscar en el historial:
                      </span>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          placeholder="Buscar por código, cliente, plato, teléfono o mesa..."
                          className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium"
                        />
                        {historySearch && (
                          <button
                            type="button"
                            onClick={() => setHistorySearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resumen de filtros activos y botón de restablecer */}
                  {(historyDatePreset !== "todos" || historyCustomDate || historyStatusFilter !== "todos" || historyModeFilter !== "todos" || historySearch) && (
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <span className="text-stone-500 font-medium">
                        Mostrando <b>{filteredHistoryOrders.length}</b> de <b>{orders.length}</b> pedidos registrados con los filtros aplicados.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryDatePreset("todos");
                          setHistoryCustomDate("");
                          setHistoryStatusFilter("todos");
                          setHistoryModeFilter("todos");
                          setHistorySearch("");
                        }}
                        className="text-xs font-bold text-stone-700 hover:text-red-700 underline flex items-center gap-1"
                      >
                        <X size={13} />
                        <span>Restablecer todos los filtros</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* TARJETAS DE MÉTRICAS Y RESUMEN CONTABLE */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3.5 rounded-xl border bg-stone-50 border-stone-200">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Pedidos Filtrados
                    </span>
                    <div className="text-xl font-black text-stone-900 mt-1">
                      {historyStats.totalCount}
                    </div>
                    <span className="text-[10px] text-stone-500">según criterios activos</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Facturación Total
                    </span>
                    <div className="text-xl font-black text-emerald-950 font-mono mt-1">
                      {formatGs(historyStats.totalAmount)}
                    </div>
                    <span className="text-[10px] text-emerald-700">monto total acumulado</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Cobrados en Caja ({historyStats.paidCount})
                    </span>
                    <div className="text-xl font-black text-emerald-900 font-mono mt-1">
                      {formatGs(historyStats.paidAmount)}
                    </div>
                    <span className="text-[10px] text-emerald-700">pagos ya registrados</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Por Cobrar ({historyStats.pendingCount})
                    </span>
                    <div className="text-xl font-black text-amber-900 font-mono mt-1">
                      {formatGs(historyStats.pendingAmount)}
                    </div>
                    <span className="text-[10px] text-amber-700">pendientes de pago</span>
                  </div>
                </div>

                {/* BANNER DE ACCIÓN RÁPIDA: GESTIÓN CONTABLE Y EXPORTACIÓN */}
                {filteredHistoryOrders.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-sky-700 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-sky-950 block">
                          Gestión Contable y Auditoría ({filteredHistoryOrders.length} pedidos filtrados)
                        </span>
                        <span className="text-[11px] text-sky-700">
                          Exportá este lote con fecha y estado a planilla Excel o reporte formal en PDF
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={exportHistoryCsv}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm transition flex items-center gap-1.5"
                        title="Descargar archivo .CSV con filtros y fórmulas de totales"
                      >
                        <Download size={13} />
                        <span>Descargar CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHistoryPdfModal(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-sm transition flex items-center gap-1.5"
                        title="Ver e imprimir informe contable en PDF"
                      >
                        <Printer size={13} />
                        <span>Exportar PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* LISTADO / TABLA DE PEDIDOS */}
                <div className="mt-5">
                  {filteredHistoryOrders.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 my-2">
                      <History size={40} className="mx-auto text-stone-300 mb-2" />
                      <h4 className="font-bold text-stone-700 text-sm">No se encontraron pedidos</h4>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        No hay pedidos recibidos que coincidan con la fecha o estado seleccionado.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryDatePreset("todos");
                          setHistoryCustomDate("");
                          setHistoryStatusFilter("todos");
                          setHistoryModeFilter("todos");
                          setHistorySearch("");
                        }}
                        className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white shadow"
                        style={{ background: BRAND.tomato }}
                      >
                        Ver todos los pedidos
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                      <table className="w-full text-left text-xs text-stone-800">
                        <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Código / Modalidad</th>
                            <th className="p-3">Fecha & Hora</th>
                            <th className="p-3">Cliente / Destino</th>
                            <th className="p-3">Productos Solicitados</th>
                            <th className="p-3 text-right">Total Gs.</th>
                            <th className="p-3 text-center">Estado</th>
                            <th className="p-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 bg-white">
                          {filteredHistoryOrders.map((order) => {
                            const isPaid = (order.paymentStatus || "").toLowerCase() === "pagado" || (order.paymentStatus || "").toLowerCase() === "cobrado";
                            const isPending = (order.paymentStatus || "").toLowerCase() === "pendiente";
                            const isCancelled = (order.paymentStatus || "").toLowerCase() === "cancelado" || (order.paymentStatus || "").toLowerCase() === "anulado";
                            const isMesa = order.mode === "mesa";
                            const isDelivery = order.mode === "delivery";

                            return (
                              <tr key={order.id} className="hover:bg-amber-50/40 transition">
                                {/* Código y Modalidad */}
                                <td className="p-3 align-top whitespace-nowrap">
                                  <div className="font-mono font-black text-stone-900 text-sm">
                                    {order.id}
                                  </div>
                                  <div className="mt-1">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 bg-stone-100 text-stone-800 border border-stone-200">
                                      {isMesa ? `🍽️ Mesa ${order.tableNumber || "Salón"}` : isDelivery ? "🛵 Delivery" : "🛍️ Retiro"}
                                    </span>
                                  </div>
                                </td>

                                {/* Fecha y Hora */}
                                <td className="p-3 align-top whitespace-nowrap">
                                  <div className="font-bold text-stone-900">
                                    {formatDateSafe(order.createdAt || order.paidAt)}
                                  </div>
                                  <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                                    <Clock size={11} />
                                    <span>{formatTimeSafe(order.createdAt || order.paidAt)} hs</span>
                                  </div>
                                </td>

                                {/* Cliente y Contacto */}
                                <td className="p-3 align-top min-w-[170px]">
                                  <div className="font-bold text-stone-900">
                                    {order.customerName || "Cliente sin nombre"}
                                  </div>
                                  {order.customerPhone && (
                                    <a
                                      href={`https://wa.me/595${order.customerPhone.replace(/^0+/, '').replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                                    >
                                      <Phone size={10} />
                                      <span>{order.customerPhone}</span>
                                    </a>
                                  )}
                                  {order.address && (
                                    <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1" title={order.address}>
                                      {order.address}
                                    </div>
                                  )}
                                </td>

                                {/* Productos */}
                                <td className="p-3 align-top min-w-[200px]">
                                  <div className="space-y-0.5">
                                    {(order.items || []).slice(0, 3).map((item, idx) => (
                                      <div key={idx} className="text-xs text-stone-700">
                                        <span className="font-bold text-stone-900">{item.qty}x</span> {item.name}
                                      </div>
                                    ))}
                                    {(order.items || []).length > 3 && (
                                      <div className="text-[10px] text-stone-500 italic">
                                        + {(order.items || []).length - 3} producto(s) más...
                                      </div>
                                    )}
                                  </div>
                                  {order.notes && (
                                    <div className="mt-1 text-[11px] text-amber-900 italic line-clamp-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title={order.notes}>
                                      "{order.notes}"
                                    </div>
                                  )}
                                </td>

                                {/* Total Gs */}
                                <td className="p-3 align-top text-right whitespace-nowrap">
                                  <div className="font-mono font-black text-stone-900 text-sm">
                                    {formatGs(order.totalPrice)}
                                  </div>
                                  {isPaid && order.paymentMethod && (
                                    <div className="text-[10px] text-stone-500 uppercase mt-0.5 font-bold">
                                      {order.paymentMethod}
                                    </div>
                                  )}
                                </td>

                                {/* Estado del Pedido */}
                                <td className="p-3 align-top text-center whitespace-nowrap">
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1 border shadow-xs ${
                                        isPaid
                                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                          : isCancelled
                                          ? "bg-red-100 text-red-900 border-red-300"
                                          : "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                                      }`}
                                    >
                                      {isPaid ? (
                                        <>
                                          <CheckCircle2 size={12} className="text-emerald-700" />
                                          <span>Cobrado</span>
                                        </>
                                      ) : isCancelled ? (
                                        <>
                                          <AlertCircle size={12} className="text-red-700" />
                                          <span>Cancelado</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock size={12} className="text-amber-700" />
                                          <span>Pendiente</span>
                                        </>
                                      )}
                                    </span>

                                    {/* Selector rápido para cambiar estado */}
                                    <select
                                      value={order.paymentStatus || "pendiente"}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                      className="text-[10px] font-bold bg-stone-50 border border-stone-300 rounded px-1.5 py-0.5 text-stone-700 cursor-pointer focus:outline-none"
                                      title="Cambiar estado del pedido"
                                    >
                                      <option value="pendiente">⏳ Pendiente</option>
                                      <option value="pagado">✅ Pagado</option>
                                      <option value="cancelado">❌ Cancelado</option>
                                    </select>
                                  </div>
                                </td>

                                {/* Acciones */}
                                <td className="p-3 align-top text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isPending && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPayOrder(order)}
                                        className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow hover:brightness-105 transition flex items-center gap-1"
                                        style={{ background: BRAND.green }}
                                        title="Cobrar en caja"
                                      >
                                        <Receipt size={12} />
                                        <span>Cobrar</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedHistoryOrder(order)}
                                      className="px-2.5 py-1 rounded-xl text-xs font-bold border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1"
                                      title="Ver detalle completo del ticket"
                                    >
                                      <Eye size={12} />
                                      <span>Detalle</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                                      title="Eliminar pedido"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* =============================================================
              PESTAÑA: DATOS DEL COMERCIO Y PORTADA
              ============================================================= */}
          {adminTab === "business" && (
            <div className="space-y-6">

              {/* SECCIÓN PORTADA DEL COMERCIO */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl" style={{ background: BRAND.tomato }}>
                    <ImageIcon size={20} color={BRAND.cream} />
                  </div>
                  <div>
                    <h2 className="slab text-lg md:text-xl" style={{ color: BRAND.charcoal }}>Portada del Comercio (Banner Principal)</h2>
                    <p className="text-xs text-stone-600">Esta imagen se muestra en la cabecera de la tienda para PC y celulares.</p>
                  </div>
                </div>

                {/* Tarjeta de Especificaciones de Imagen Requeridas */}
                <div className="my-4 rounded-xl p-4 border" style={{ background: "#FFF8E7", borderColor: BRAND.mustard }}>
                  <p className="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: BRAND.charcoal }}>
                    <Info size={15} color={BRAND.tomato} /> Especificaciones técnicas de la portada:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs" style={{ color: BRAND.charcoal }}>
                    <div className="bg-white/70 p-2.5 rounded-lg border border-amber-200">
                      <span className="font-bold block text-stone-800">📐 Medidas recomendadas</span>
                      <span className="text-stone-600">1200 x 400 px (Proporción 3:1 panorámica) o hasta 1920 x 640 px para alta definición.</span>
                    </div>
                    <div className="bg-white/70 p-2.5 rounded-lg border border-amber-200">
                      <span className="font-bold block text-stone-800">🖼️ Formatos permitidos</span>
                      <span className="text-stone-600">JPG, PNG, o WebP (con fondo o transparencias).</span>
                    </div>
                    <div className="bg-white/70 p-2.5 rounded-lg border border-amber-200">
                      <span className="font-bold block text-stone-800">⚖️ Tamaño de archivo</span>
                      <span className="text-stone-600">Hasta 5 MB (el optimizador integrado la comprime automáticamente para carga veloz).</span>
                    </div>
                  </div>
                </div>

                {/* Vista previa de la portada actual */}
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2 ml-1" style={{ color: BRAND.charcoal }}>Vista previa actual:</p>
                  <div className="relative rounded-2xl overflow-hidden border-2 shadow-inner bg-stone-900 aspect-[3/1] max-h-60 flex items-center justify-center" style={{ borderColor: BRAND.paperDark }}>
                    {draftBusiness.bannerImage ? (
                      <img
                        src={draftBusiness.bannerImage}
                        alt="Portada"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/banner.jpg"; }}
                      />
                    ) : (
                      <div className="text-stone-400 text-sm flex flex-col items-center gap-1">
                        <ImageIcon size={32} />
                        <span>Sin imagen asignada</span>
                      </div>
                    )}
                    {bannerUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white font-bold text-sm">
                        <LoaderCircle className="animate-spin" size={24} />
                        Optimizando y procesando imagen...
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción para subir imagen */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleBannerUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={bannerUploading}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow transition hover:brightness-105 disabled:opacity-50"
                    style={{ background: BRAND.tomato, color: BRAND.cream }}
                  >
                    <Upload size={16} /> Subir nueva foto desde mi dispositivo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDraftBusiness((prev) => ({ ...prev, bannerImage: "/banner.jpg" }));
                      setDirty(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 border-2 transition hover:bg-stone-200/50"
                    style={{ borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                  >
                    <RefreshCw size={15} /> Usar portada predeterminada
                  </button>
                </div>

                {/* Input opcional para pegar enlace directo */}
                <div className="mt-4 pt-3 border-t" style={{ borderColor: BRAND.paperDark }}>
                  <label className="block text-xs font-bold mb-1" style={{ color: BRAND.charcoal }}>
                    O pegá un enlace directo de imagen (URL pública):
                  </label>
                  <input
                    type="url"
                    value={(draftBusiness?.bannerImage || "").startsWith("data:") ? "" : (draftBusiness?.bannerImage || "")}
                    onChange={(e) => {
                      setDraftBusiness((prev) => ({ ...prev, bannerImage: e.target.value }));
                      setDirty(true);
                    }}
                    placeholder={(draftBusiness?.bannerImage || "").startsWith("data:") ? "Imagen personalizada cargada en la memoria ✓ (o pegá una URL para reemplazarla)" : "https://ejemplo.com/mi-portada.jpg"}
                    className="w-full rounded-xl p-2.5 text-xs border"
                    style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                  />
                </div>

                {bannerUploadError && (
                  <p className="text-xs mt-2 font-bold" style={{ color: BRAND.tomato }}>⚠️ {bannerUploadError}</p>
                )}
              </div>

              {/* SECCIÓN: INFORMACIÓN DEL LOCAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5 border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Store size={18} color={BRAND.tomato} />
                    <h3 className="slab text-base" style={{ color: BRAND.charcoal }}>Identidad del Comercio</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Nombre del Comercio</label>
                      <input
                        value={draftBusiness.name}
                        onChange={(e) => {
                          setDraftBusiness((prev) => ({ ...prev, name: e.target.value }));
                          setDirty(true);
                        }}
                        placeholder="Ej: La Caserita Rotisería"
                        className="w-full p-2.5 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Slogan / Subtítulo</label>
                      <input
                        value={draftBusiness.slogan}
                        onChange={(e) => {
                          setDraftBusiness((prev) => ({ ...prev, slogan: e.target.value }));
                          setDirty(true);
                        }}
                        placeholder="Ej: Pedí online - Comidas caseras y minutas"
                        className="w-full p-2.5 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Dirección del Local</label>
                      <input
                        value={draftBusiness.address}
                        onChange={(e) => {
                          setDraftBusiness((prev) => ({ ...prev, address: e.target.value }));
                          setDirty(true);
                        }}
                        placeholder="Ej: Santa María III, Ruta 6ta km 3.5, Encarnación"
                        className="w-full p-2.5 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Aclaración sobre el envío (Delivery)</label>
                      <input
                        value={draftBusiness.deliveryNote}
                        onChange={(e) => {
                          setDraftBusiness((prev) => ({ ...prev, deliveryNote: e.target.value }));
                          setDirty(true);
                        }}
                        placeholder="Ej: El costo de envío se coordina según la zona"
                        className="w-full p-2.5 rounded-xl border text-sm"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: WHATSAPP Y SEGURIDAD */}
                <div className="space-y-5">
                  <div className="rounded-2xl p-5 border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Phone size={18} color={BRAND.green} />
                      <h3 className="slab text-base" style={{ color: BRAND.charcoal }}>WhatsApp para Pedidos</h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>
                          Número internacional (sin +, sin espacios ni guiones)
                        </label>
                        <input
                          value={draftBusiness.phoneIntl}
                          onChange={(e) => {
                            setDraftBusiness((prev) => ({ ...prev, phoneIntl: e.target.value.replace(/[^\d]/g, "") }));
                            setDirty(true);
                          }}
                          placeholder="Ej: 595985913400"
                          className="w-full p-2.5 rounded-xl border text-sm font-mono"
                          style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                        />
                        <span className="text-[11px] text-stone-500 mt-0.5 block">
                          Los clientes enviarán sus pedidos directamente a este número por WhatsApp.
                        </span>
                      </div>

                      <div>
                        <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>
                          Número visible en pantalla (formato legible)
                        </label>
                        <input
                          value={draftBusiness.phoneDisplay}
                          onChange={(e) => {
                            setDraftBusiness((prev) => ({ ...prev, phoneDisplay: e.target.value }));
                            setDirty(true);
                          }}
                          placeholder="Ej: 0985 913 400"
                          className="w-full p-2.5 rounded-xl border text-sm font-semibold"
                          style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CAMBIO DE PIN Y USUARIO DE ADMINISTRADOR */}
                  <div className="rounded-2xl p-5 border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                    <div className="flex items-center gap-2 mb-2">
                      <KeyRound size={18} color={BRAND.charcoal} />
                      <h3 className="slab text-base" style={{ color: BRAND.charcoal }}>Seguridad (Usuario y PIN)</h3>
                    </div>
                    <p className="text-[11px] text-stone-600 mb-3">Podés modificar tu usuario o PIN de acceso al administrador.</p>

                    <div className="mb-3 text-xs">
                      <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Usuario Administrador</label>
                      <input
                        type="text"
                        value={draftBusiness.adminUser || "Usuario"}
                        onChange={(e) => {
                          setDraftBusiness((prev) => ({ ...prev, adminUser: e.target.value }));
                          setDirty(true);
                        }}
                        placeholder="Usuario"
                        className="w-full p-2.5 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Nuevo PIN (opcional)</label>
                        <div className="relative">
                          <input
                            type={showNewPin ? "text" : "password"}
                            value={draftNewPin}
                            onChange={(e) => { setDraftNewPin(e.target.value); setDirty(true); }}
                            placeholder="Nuevo PIN"
                            className="w-full p-2 pr-9 rounded-xl border font-mono text-sm"
                            style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPin((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-800 transition"
                            title={showNewPin ? "Ocultar clave" : "Ver clave"}
                          >
                            {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold block mb-1" style={{ color: BRAND.charcoal }}>Confirmar nuevo PIN</label>
                        <div className="relative">
                          <input
                            type={showConfirmPin ? "text" : "password"}
                            value={draftPinConfirm}
                            onChange={(e) => { setDraftPinConfirm(e.target.value); setDirty(true); }}
                            placeholder="Repetir PIN"
                            className="w-full p-2 pr-9 rounded-xl border font-mono text-sm"
                            style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPin((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-800 transition"
                            title={showConfirmPin ? "Ocultar clave" : "Ver clave"}
                          >
                            {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =============================================================
              PESTAÑA: MENÚ Y PLATOS
              ============================================================= */}
          {adminTab === "menu" && (
            <div className="space-y-6">
              <div className="rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm" style={{ background: "#FFF3C4", border: `1px solid ${BRAND.mustard}` }}>
                <span className="text-xl">💡</span>
                <p className="text-xs md:text-sm" style={{ color: BRAND.charcoal }}>
                  Podés editar precios, agregar categorías, subir fotos de cada plato o eliminarlos. Recordá presionar <b>"Guardar cambios"</b> abajo cuando termines.
                </p>
              </div>

              {draft.map((c, catIdx) => (
                <div key={catIdx} className="rounded-2xl p-4 md:p-6 border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                  {/* Cabecera de Categoría */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: BRAND.paperDark }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl shadow-sm flex-shrink-0" style={{ background: BRAND.tomato }}>
                        <CategoryIcon icon={c.icon} name={c.category} size={22} color={BRAND.cream} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[11px] font-bold block mb-1" style={{ color: BRAND.charcoal }}>
                          Nombre de la categoría:
                        </label>
                        <input
                          value={c.category}
                          onChange={(e) => renameCategory(catIdx, e.target.value)}
                          placeholder="Ej: Ensaladas, Pizzas, Bebidas..."
                          className="slab w-full text-base md:text-xl rounded-xl px-3 py-1.5 font-bold border-2 bg-white shadow-inner focus:outline-none"
                          style={{ color: BRAND.tomato, borderColor: BRAND.paperDark }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCategory(catIdx)}
                      className="self-end sm:self-center px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-90 transition shadow-sm text-white"
                      style={{ background: BRAND.tomato }}
                      title="Eliminar categoría completa"
                    >
                      <Trash2 size={15} />
                      <span>Eliminar categoría</span>
                    </button>
                  </div>

                  {/* Selector de Tipo de Categoría e Ícono */}
                  <div className="mb-5 bg-white/60 p-3.5 rounded-xl border" style={{ borderColor: BRAND.paperDark }}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                      <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: BRAND.charcoal }}>
                        <span>✨ Elegí el tipo de categoría o ícono:</span>
                      </p>
                      <span className="text-[11px] text-stone-500">
                        (Al hacer clic cambia el nombre y el ícono automáticamente)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ICON_OPTIONS.map((opt) => {
                        const isSelectedIcon = (c.icon || guessIconKey(c.category)) === opt.key;
                        const isSelectedName = (c.category || "").trim().toLowerCase() === opt.label.toLowerCase();
                        const selected = isSelectedIcon || isSelectedName;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => updateCategoryOption(catIdx, opt, true)}
                            title={`Seleccionar categoría ${opt.label}`}
                            className="p-2 rounded-lg border-2 flex items-center gap-1.5 text-xs font-bold transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            style={selected ? { background: BRAND.tomato, borderColor: BRAND.tomatoDark, color: BRAND.cream } : { background: "#FFF", borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                          >
                            <CategoryIcon icon={opt.key} name="" size={16} color={selected ? BRAND.cream : BRAND.charcoal} />
                            <span>{opt.label}</span>
                            {selected && <CheckCircle2 size={13} className="ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lista de productos de la categoría (adaptada a grid en PC) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {c.items.map((item, itemIdx) => (
                      <div key={item.id} className="rounded-xl p-3.5 flex gap-3 border shadow-sm" style={{ background: BRAND.paper, borderColor: BRAND.paperDark }}>
                        {/* Subida de foto del plato */}
                        <label
                          className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 flex items-center justify-center cursor-pointer shadow-inner hover:opacity-90 transition"
                          style={{ borderColor: BRAND.paperDark, background: BRAND.cream }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(catIdx, itemIdx, e.target.files?.[0])}
                          />
                          {imgLoading === item.id ? (
                            <LoaderCircle className="animate-spin" size={20} color={BRAND.tomato} />
                          ) : item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-stone-500">
                              <ImageIcon size={20} color={BRAND.tomatoDark} />
                              <span className="text-[10px] font-bold">Foto</span>
                            </div>
                          )}
                          {item.image && imgLoading !== item.id && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); updateItemField(catIdx, itemIdx, "image", ""); }}
                              className="absolute top-1 right-1 rounded-full p-1 shadow"
                              style={{ background: BRAND.tomato }}
                              title="Quitar foto"
                            >
                              <X size={11} color={BRAND.cream} />
                            </button>
                          )}
                        </label>

                        {/* Campos de texto del plato */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            {/* Selector de categoría por si se quiere mover este producto */}
                            <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b" style={{ borderColor: BRAND.paperDark }}>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-stone-500 uppercase">Categoría:</span>
                                <select
                                  value={catIdx}
                                  onChange={(e) => moveItemToCategory(catIdx, itemIdx, Number(e.target.value))}
                                  className="bg-white border rounded-md px-1.5 py-0.5 text-[11px] font-bold text-stone-800 focus:outline-none"
                                  style={{ borderColor: BRAND.paperDark }}
                                  title="Mover este producto a otra categoría"
                                >
                                  {draft.map((cat, idx) => (
                                    <option key={idx} value={idx}>
                                      {cat.category || `Categoría ${idx + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteItem(catIdx, itemIdx)}
                                className="p-1 rounded-lg hover:brightness-90 transition text-white"
                                style={{ background: BRAND.tomato }}
                                title="Eliminar plato"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="flex gap-2 items-center mb-1.5">
                              <input
                                value={item.name}
                                onChange={(e) => updateItemField(catIdx, itemIdx, "name", e.target.value)}
                                placeholder="Nombre del plato"
                                className="flex-1 rounded-lg p-1.5 text-xs md:text-sm font-bold border"
                                style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                              />
                            </div>

                            <input
                              value={item.desc}
                              onChange={(e) => updateItemField(catIdx, itemIdx, "desc", e.target.value)}
                              placeholder="Descripción o ingredientes"
                              className="w-full rounded-lg p-1.5 text-xs border mb-1.5"
                              style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                            />
                          </div>

                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatPriceInput(item.price)}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/[^\d]/g, "");
                                updateItemField(catIdx, itemIdx, "price", digits === "" ? "" : Number(digits));
                              }}
                              placeholder="0 Gs."
                              className="w-32 rounded-lg p-1.5 text-xs font-bold border text-right"
                              style={{ borderColor: BRAND.paperDark, background: "#FFF", color: BRAND.tomato }}
                            />
                            <span className="text-[11px] text-stone-500 truncate">Precio en Guaraníes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {imgError && (
                    <p className="text-xs mt-2 font-bold" style={{ color: BRAND.tomato }}>⚠️ {imgError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => addItem2(catIdx)}
                    className="w-full mt-4 rounded-xl p-2.5 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition"
                    style={{ background: BRAND.mustard, color: BRAND.charcoal }}
                  >
                    <Plus size={16} /> Agregar nuevo producto en {c.category || "esta categoría"}
                  </button>
                </div>
              ))}

              <div className="bg-white/70 p-3.5 rounded-2xl border space-y-2" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <span>⚡ Sugerencias rápidas de sección:</span>
                  </span>
                  <span className="text-[11px] text-stone-500">Un clic para agregar</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Platos Principales", icon: "almuerzo" },
                    { label: "Bebidas", icon: "bebida" },
                    { label: "Postres", icon: "postre" },
                    { label: "Minutas y Papas", icon: "minuta" },
                    { label: "Sandwiches & Lomitos", icon: "sandwich" },
                    { label: "Pizzas", icon: "pizza" },
                    { label: "Ensaladas", icon: "ensalada" },
                  ].map((sug) => {
                    const exists = (draft || []).some((c) => (c.category || "").toLowerCase() === sug.label.toLowerCase());
                    return (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => {
                          setDraft((d) => [...(d || []), { category: sug.label, icon: sug.icon, items: [] }]);
                          setDirty(true);
                        }}
                        disabled={exists}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          exists
                            ? "opacity-50 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200"
                            : "bg-white text-stone-800 hover:bg-stone-50 border-stone-300 shadow-sm active:scale-95"
                        }`}
                        title={exists ? "Esta categoría ya existe" : `Agregar sección ${sug.label}`}
                      >
                        <CategoryIcon icon={sug.icon} name="" size={13} color={exists ? "#999" : BRAND.tomato} />
                        <span>+ {sug.label}</span>
                        {exists && <span className="text-[10px] text-stone-400 font-normal">(Ya existe)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={addCategory}
                className="w-full rounded-2xl p-4 font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition"
                style={{ background: BRAND.green, color: BRAND.cream }}
              >
                <Plus size={18} /> Crear nueva categoría de comida personalizada
              </button>
            </div>
          )}

          {/* =================================================================
              PESTAÑA: COMERCIOS REGISTRADOS & SEGURIDAD IP (SUPERADMIN)
              ================================================================= */}
          {adminTab === "clients" && adminRole === "superadmin" && (
            <div className="space-y-6">
              {/* Tarjeta de Seguridad IP y Administración Única */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-stone-900 shadow-inner">
                      <ShieldCheck size={26} className="text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="slab text-lg md:text-xl text-stone-900 leading-tight">
                        Seguridad de Acceso: Bloqueo a 3 Intentos Fallidos
                      </h3>
                      <p className="text-xs text-stone-600 font-medium">
                        Protección contra accesos no autorizados al panel de administración para 1 solo usuario.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetAllBlockedIps}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-stone-300 hover:bg-stone-100 transition text-stone-800 flex items-center gap-1.5 self-start sm:self-auto"
                    title="Desbloquear inmediatamente cualquier IP que haya superado los 3 intentos"
                  >
                    <ShieldOff size={15} /> Desbloquear Todas las IPs
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Usuario Administrador Único</span>
                    <span className="text-base font-bold font-mono text-stone-900">{business.adminUser || "Usuario"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Regla de Bloqueo por IP</span>
                    <span className="text-sm font-bold text-red-700">3 fallos seguidos = 15 min.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Tu IP Actual</span>
                    <span className="text-sm font-bold font-mono text-stone-800">{clientIp || "Detectando..."}</span>
                  </div>
                </div>
              </div>

              {/* =================================================================
                  CONFIGURACIÓN DE PRECIOS DE LA APP EN GUARANÍES (Gs.)
                  ================================================================= */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-stone-900 shadow-inner flex-shrink-0">
                      <DollarSign size={26} className="text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="slab text-lg md:text-xl text-stone-900 leading-tight flex items-center gap-2 flex-wrap">
                        <span>Precios de la App en Guaraníes (Gs.)</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Planes de Venta SaaS
                        </span>
                      </h3>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        Establecé y modificá los precios de adquisición de tu app en Guaraníes. Se actualizan en vivo en la pantalla de registro para nuevos comercios clientes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={handleResetPlanPrices}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-stone-300 hover:bg-stone-100 transition text-stone-700 flex items-center gap-1.5"
                      title="Volver a los precios iniciales de fábrica (150.000 / 750.000 / 1.350.000 Gs.)"
                    >
                      <RefreshCw size={13} />
                      <span>Restablecer</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePlanPrices}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition text-white shadow-sm flex items-center gap-1.5 hover:brightness-105 active:scale-95"
                      style={{ background: BRAND.green }}
                    >
                      <Save size={14} />
                      <span>Guardar Precios Gs.</span>
                    </button>
                  </div>
                </div>

                {pricingSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{pricingSuccessMsg}</span>
                  </div>
                )}

                {/* Grilla de edición de precios para cada plan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {appPricingPlans.map((plan) => {
                    const priceNum = Number(plan.priceGs) || 0;
                    const monthlyEquiv =
                      plan.id === "mensual"
                        ? priceNum
                        : plan.id === "semestral"
                        ? Math.round(priceNum / 6)
                        : Math.round(priceNum / 12);

                    return (
                      <div
                        key={plan.id}
                        className="p-4 rounded-2xl border-2 transition-all flex flex-col justify-between bg-stone-50/70 hover:bg-white"
                        style={{
                          borderColor: plan.highlighted ? "#C1392B" : BRAND.paperDark,
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                              {plan.id === "mensual" ? "Plan Básico" : plan.id === "semestral" ? "Plan 6 Meses" : "Plan Anual 12 Meses"}
                            </span>
                            {plan.highlighted && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Más Popular
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-base text-stone-900 mb-2">
                            {plan.title}
                          </h4>

                          {/* Edición del Precio en Guaraníes */}
                          <div className="p-3 rounded-xl bg-white border border-stone-200 mb-3 shadow-inner">
                            <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                              <span>Precio en Guaraníes:</span>
                              <span className="font-mono text-emerald-800 font-black text-xs">
                                {formatGs(priceNum)}
                              </span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400">
                                Gs.
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={priceNum ? priceNum.toLocaleString("es-PY") : ""}
                                onChange={(e) => handleUpdatePlanPrice(plan.id, e.target.value)}
                                placeholder="0"
                                className="w-full pl-10 pr-3 py-2 text-base font-mono font-black rounded-xl border-2 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                style={{ borderColor: BRAND.paperDark }}
                              />
                            </div>

                            {/* Ajustadores rápidos +/- */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <button
                                type="button"
                                onClick={() => handleUpdatePlanPrice(plan.id, Math.max(0, priceNum - 50000))}
                                className="flex-1 py-1 text-[10px] font-bold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border transition"
                              >
                                - 50.000 Gs.
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlanPrice(plan.id, priceNum + 50000)}
                                className="flex-1 py-1 text-[10px] font-bold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border transition"
                              >
                                + 50.000 Gs.
                              </button>
                            </div>

                            <span className="text-[11px] text-stone-500 block mt-2 pt-1 border-t border-stone-100">
                              Cálculo mensual: <b className="text-stone-800 font-mono font-bold">{formatGs(monthlyEquiv)}/mes</b>
                            </span>
                          </div>

                          {/* Periodo de cobro */}
                          <div className="mb-2">
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Texto de periodo:
                            </label>
                            <input
                              type="text"
                              value={plan.period || ""}
                              onChange={(e) => handleUpdatePlanField(plan.id, "period", e.target.value)}
                              placeholder="ej. por mes, por 6 meses"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white text-stone-800"
                              style={{ borderColor: BRAND.paperDark }}
                            />
                          </div>

                          {/* Badge de promoción */}
                          <div className="mb-2">
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Insignia / Promoción:
                            </label>
                            <input
                              type="text"
                              value={plan.badge || ""}
                              onChange={(e) => handleUpdatePlanField(plan.id, "badge", e.target.value)}
                              placeholder="ej. ⭐ ¡3 Meses Gratis!"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white text-stone-800"
                              style={{ borderColor: BRAND.paperDark }}
                            />
                          </div>

                          {/* Ahorro destacado */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Texto de ahorro:
                            </label>
                            <input
                              type="text"
                              value={plan.savings || ""}
                              onChange={(e) => handleUpdatePlanField(plan.id, "savings", e.target.value)}
                              placeholder="ej. Ahorrás 450.000 Gs."
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white text-stone-800"
                              style={{ borderColor: BRAND.paperDark }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t text-[11px] text-stone-500 flex items-center justify-between">
                          <span>Identificador:</span>
                          <code className="font-mono text-stone-700 font-bold bg-stone-200 px-1.5 py-0.5 rounded text-[10px]">
                            {plan.id}
                          </code>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Acceso directo a la página de registro/venta */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <span className="text-amber-950 font-medium">
                    💡 Los precios que guardes aquí se aplican automáticamente en la pantalla de adquisición para nuevos clientes.
                  </span>
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 transition flex items-center gap-1 flex-shrink-0 shadow-sm"
                  >
                    <ExternalLink size={13} /> Ver Pantalla de Ventas y Planes
                  </button>
                </div>
              </div>

              {/* Encabezado de la lista de comercios */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="slab text-xl text-stone-900 leading-tight flex items-center gap-2">
                    <Store size={22} className="text-[#C1392B]" />
                    <span>Comercios que Solicitaron la App</span>
                  </h3>
                  <p className="text-xs text-stone-600">
                    Nuevos clientes registrados, planes solicitados, credenciales y comprobantes de pago.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadRegisteredClients}
                    disabled={loadingClients}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-300 hover:bg-stone-100 transition text-stone-800 flex items-center gap-1.5 bg-white shadow-sm"
                  >
                    <RefreshCw size={13} className={loadingClients ? "animate-spin" : ""} />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition text-stone-900 shadow-sm flex items-center gap-1.5"
                    style={{ background: BRAND.mustard }}
                  >
                    <Plus size={14} />
                    <span>Formulario de Registro</span>
                  </button>
                </div>
              </div>

              {/* Lista de Clientes Registrados */}
              {loadingClients ? (
                <div className="p-12 text-center bg-white rounded-2xl border shadow-sm flex flex-col items-center gap-3">
                  <LoaderCircle className="animate-spin text-stone-400" size={32} />
                  <p className="text-xs font-bold text-stone-500">Cargando solicitudes de comercios...</p>
                </div>
              ) : registeredClients.length === 0 ? (
                <div className="p-8 md:p-12 text-center bg-white rounded-2xl border-2 shadow-sm" style={{ borderColor: BRAND.paperDark }}>
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-stone-700">
                    <Briefcase size={26} />
                  </div>
                  <h4 className="font-bold text-base text-stone-900 mb-1">Aún no hay comercios registrados</h4>
                  <p className="text-xs text-stone-600 max-w-md mx-auto mb-5">
                    Cuando otros restaurantes o comercios completen el formulario para adquirir la app con su respectivo plan y método de pago, aparecerán aquí para su activación.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="px-4 py-2 rounded-xl text-xs font-bold shadow transition text-white"
                    style={{ background: BRAND.tomato }}
                  >
                    Ver o Probar Formulario de Registro de Comercios
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {registeredClients.map((client) => {
                    const bName = client.businessName || client.business_name || "Comercio";
                    const oName = client.ownerName || client.owner_name || "Responsable";
                    const pTitle = client.planTitle || client.plan_title || "Plan Estándar";
                    const amount = client.amountGs !== undefined ? client.amountGs : (client.amount_gs || 0);
                    const rUser = client.requestedUser || client.requested_user || "admin";
                    const rPass = client.requestedPassword || client.requested_password || "••••••••";
                    const payMethod = client.paymentMethod || client.payment_method || "transferencia";
                    const payRef = client.paymentRef || client.payment_ref || "";
                    const cDate = client.createdAt || client.created_at || Date.now();
                    const statusStr = String(client.status || "").toLowerCase();

                    const isPending = statusStr === "pending" || statusStr === "pendiente";
                    const isActive = statusStr === "active" || statusStr === "activo";
                    const isRejected = statusStr === "rejected" || statusStr === "rechazado" || statusStr === "vencido";

                    return (
                      <div
                        key={client.id}
                        className="p-5 rounded-2xl bg-white border-2 shadow-sm flex flex-col justify-between gap-4 transition hover:shadow-md"
                        style={{
                          borderColor: isActive ? "#22C55E" : isPending ? BRAND.mustard : "#EF4444",
                        }}
                      >
                        {/* Cabecera de la ficha */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: BRAND.paperDark }}>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-xs font-black text-stone-400">#{client.id}</span>
                              <h4 className="font-black text-base md:text-lg text-stone-900">{bName}</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 font-semibold text-stone-700">
                                {client.rubro || "Gastronomía"}
                              </span>
                              <span className="text-xs text-stone-500 font-medium">📍 {client.city || "Encarnación"}</span>
                            </div>
                            <p className="text-xs text-stone-600">
                              Responsable: <b>{oName}</b> • Solicitado: {formatDateSafe(cDate)}
                            </p>
                          </div>

                          {/* Badge de Estado */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : isPending
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {isActive ? "✓ Activo / En Producción" : isPending ? "⏳ Pendiente de Pago" : "✕ Rechazado"}
                            </span>
                          </div>
                        </div>

                        {/* Detalles: Plan, Credenciales y Pago */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                          <div>
                            <span className="text-stone-500 font-semibold block mb-0.5">Plan y Precio:</span>
                            <span className="font-bold text-stone-900 block">{pTitle}</span>
                            <span className="font-black text-sm text-red-600 font-mono">{formatGs(amount)}</span>
                          </div>

                          <div>
                            <span className="text-stone-500 font-semibold block mb-0.5">Credenciales Solicitadas:</span>
                            <span className="font-mono font-bold text-stone-900 block">Usuario: {rUser}</span>
                            <span className="font-mono text-stone-700 block">Clave: {rPass}</span>
                          </div>

                          <div>
                            <span className="text-stone-500 font-semibold block mb-0.5">Pago y Comprobante:</span>
                            <span className="font-bold capitalize text-stone-900 block">{payMethod}</span>
                            <span className="text-stone-600 truncate block">Ref: {payRef || "Sin referencia escrita"}</span>
                          </div>
                        </div>

                        {/* Barra de Acciones y Código de Activación */}
                        {(() => {
                          const existingCode = activationCodes.find(
                            (ac) =>
                              (ac.businessName && bName && ac.businessName.toLowerCase() === bName.toLowerCase()) ||
                              (ac.whatsapp && client.whatsapp && ac.whatsapp === String(client.whatsapp).replace(/[^\d]/g, ""))
                          );

                          return (
                            <>
                              {existingCode && (
                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <KeyRound size={14} className="text-amber-700" />
                                    <span className="font-medium text-stone-700">Código de Activación Asignado:</span>
                                    <span className="font-mono font-black text-stone-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                                      {existingCode.code}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      existingCode.status === "disponible" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                                    }`}>
                                      {existingCode.status === "disponible" ? "Listo para entregar" : "Ya activado"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCodeToClipboard(existingCode.code)}
                                      className="px-2 py-1 rounded bg-white border border-stone-300 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition"
                                    >
                                      {copiedCodeText === existingCode.code ? "¡Copiado!" : "Copiar"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSendCodeWhatsApp(existingCode)}
                                      className="px-2 py-1 rounded bg-[#25D366] text-white text-[11px] font-bold hover:brightness-105 transition flex items-center gap-1"
                                    >
                                      <Send size={11} /> Enviar WhatsApp
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: BRAND.paperDark }}>
                                <div className="flex items-center gap-2">
                                  {/* Enlace directo a WhatsApp */}
                                  <a
                                    href={`https://wa.me/${String(client.whatsapp).replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                                      `¡Hola ${oName}! Nos comunicamos sobre tu solicitud para la App de Pedidos de *${bName}* (Plan: ${pTitle}).`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] text-white flex items-center gap-1.5 shadow-sm hover:brightness-105 transition"
                                  >
                                    <Phone size={13} />
                                    <span>WhatsApp ({client.whatsapp})</span>
                                  </a>
                                  {client.email && (
                                    <span className="text-xs text-stone-500 hidden md:inline">✉️ {client.email}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!existingCode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewCodeForm({
                                          code: generateRandomActivationCode(),
                                          businessName: bName,
                                          ownerName: oName,
                                          whatsapp: String(client.whatsapp).replace(/[^\d]/g, ""),
                                          plan: pTitle || "Plan Mensual",
                                          notes: `Generado para solicitud #${client.id} - ${payMethod}`,
                                        });
                                        setShowCreateCodeModal(true);
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-stone-900 border border-amber-300 hover:bg-amber-200 transition flex items-center gap-1 shadow-sm"
                                      title="Crear código de activación exclusivo para este cliente"
                                    >
                                      <KeyRound size={13} className="text-amber-800" />
                                      <span>Generar Código</span>
                                    </button>
                                  )}

                                  {isPending && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => updateClientStatus(client.id, "activo")}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm flex items-center gap-1"
                                      >
                                        <span>✓ Activar</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateClientStatus(client.id, "rechazado")}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-300 text-red-700 hover:bg-red-50 transition"
                                      >
                                        Rechazar
                                      </button>
                                    </>
                                  )}

                                  {isActive && (
                                    <button
                                      type="button"
                                      onClick={() => updateClientStatus(client.id, "pendiente")}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 text-amber-800 hover:bg-amber-50 transition"
                                    >
                                      Pasar a Pendiente
                                    </button>
                                  )}

                                  {isRejected && (
                                    <button
                                      type="button"
                                      onClick={() => updateClientStatus(client.id, "activo")}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                                    >
                                      Reactivar
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => deleteRegisteredClient(client.id)}
                                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                    title="Eliminar registro permanentemente"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =========================================================================
                  SECCIÓN: CÓDIGOS DE ACTIVACIÓN Y LICENCIAS PARA HABILITAR COMERCIOS
                  ========================================================================= */}
              <div className="rounded-2xl p-5 md:p-6 border-2 shadow-sm bg-white mt-8" style={{ borderColor: BRAND.mustard }}>
                {/* Encabezado del Sistema de Códigos */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b mb-5" style={{ borderColor: BRAND.paperDark }}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-stone-900 shadow-inner flex-shrink-0">
                      <KeyRound size={26} style={{ color: BRAND.tomato }} />
                    </div>
                    <div>
                      <h3 className="slab text-lg md:text-xl text-stone-900 leading-tight flex items-center gap-2 flex-wrap">
                        <span>Códigos de Activación y Licencias para Comercios</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-stone-900 px-2 py-0.5 rounded-full">
                          Habilitación de App
                        </span>
                      </h3>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        Creá y gestioná los códigos que los comercios que compren la app ingresan para desbloquear y habilitar sus funciones.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={loadActivationCodes}
                      disabled={loadingCodes}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-stone-300 hover:bg-stone-100 transition text-stone-800 flex items-center gap-1.5 bg-white shadow-sm"
                      title="Recargar lista de códigos"
                    >
                      <RefreshCw size={13} className={loadingCodes ? "animate-spin" : ""} />
                      <span>Actualizar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCodeForm({
                          code: generateRandomActivationCode(),
                          businessName: "",
                          ownerName: "",
                          whatsapp: "",
                          plan: "Plan Mensual",
                          notes: "",
                        });
                        setShowCreateCodeModal(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:brightness-105 transition flex items-center gap-1.5"
                      style={{ background: BRAND.tomato }}
                    >
                      <Plus size={15} />
                      <span>Crear Código de Activación</span>
                    </button>
                  </div>
                </div>

                {/* Métricas de Códigos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 font-semibold block">Total Códigos Generados</span>
                      <span className="text-2xl font-black font-mono text-stone-900">{activationCodes.length}</span>
                    </div>
                    <KeyRound size={24} className="text-stone-400" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 font-semibold block">Disponibles para Entregar</span>
                      <span className="text-2xl font-black font-mono text-emerald-800">
                        {activationCodes.filter((c) => c.status === "disponible").length}
                      </span>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-amber-900 font-semibold block">Activados / En Uso</span>
                      <span className="text-2xl font-black font-mono text-amber-900">
                        {activationCodes.filter((c) => c.status === "activado").length}
                      </span>
                    </div>
                    <Store size={24} className="text-amber-600" />
                  </div>
                </div>

                {/* Filtros y Buscador de Códigos */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setCodeFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeFilter === "all" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Todos ({activationCodes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeFilter("disponible")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeFilter === "disponible" ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Disponibles ({activationCodes.filter((c) => c.status === "disponible").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeFilter("activado")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        codeFilter === "activado" ? "bg-white text-amber-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Activados ({activationCodes.filter((c) => c.status === "activado").length})
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      placeholder="Buscar por código o comercio..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    {codeSearch && (
                      <button
                        type="button"
                        onClick={() => setCodeSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Listado de Códigos */}
                {(() => {
                  const filtered = activationCodes.filter((c) => {
                    if (codeFilter !== "all" && c.status !== codeFilter) return false;
                    if (!codeSearch.trim()) return true;
                    const q = codeSearch.toLowerCase();
                    return (
                      (c.code || "").toLowerCase().includes(q) ||
                      (c.businessName || "").toLowerCase().includes(q) ||
                      (c.ownerName || "").toLowerCase().includes(q) ||
                      (c.plan || "").toLowerCase().includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
                        <KeyRound size={28} className="mx-auto text-stone-400 mb-2" />
                        <p className="text-xs font-bold text-stone-600">No hay códigos en este filtro.</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">Creá un nuevo código con el botón superior.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filtered.map((item) => {
                        const isDispo = item.status === "disponible";
                        const isActi = item.status === "activado";

                        return (
                          <div
                            key={item.id || item.code}
                            className={`p-4 rounded-xl border-2 transition bg-white flex flex-col justify-between gap-3 shadow-sm hover:shadow ${
                              isDispo ? "border-emerald-300" : isActi ? "border-amber-300" : "border-red-300"
                            }`}
                          >
                            <div>
                              {/* Fila Superior: Código y Badge */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800">
                                    <KeyRound size={15} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-base font-black tracking-wider text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 select-all">
                                        {item.code}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCodeToClipboard(item.code)}
                                        className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition"
                                        title="Copiar código"
                                      >
                                        {copiedCodeText === item.code ? (
                                          <span className="text-[10px] font-bold text-emerald-700">¡Copiado!</span>
                                        ) : (
                                          <Copy size={13} />
                                        )}
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-stone-500 font-medium">
                                      Creado: {formatDateSafe(item.createdAt || Date.now())}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                    isDispo
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : isActi
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : "bg-red-100 text-red-800 border-red-300"
                                  }`}
                                >
                                  {isDispo ? "✓ Disponible" : isActi ? "★ Activado" : "✕ Revocado"}
                                </span>
                              </div>

                              {/* Datos del Comercio Asignado */}
                              <div className="space-y-1 text-xs">
                                <p className="font-bold text-stone-900 flex items-center gap-1">
                                  <Store size={13} className="text-stone-500" />
                                  <span>{item.businessName || "Licencia Libre / Venta Directa"}</span>
                                </p>
                                <p className="text-stone-600 text-[11px]">
                                  Responsable: <b>{item.ownerName || "No especificado"}</b>
                                  {item.whatsapp && <span> • WA: {item.whatsapp}</span>}
                                </p>
                                <div className="inline-block mt-1">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                    📋 {item.plan || "Plan Mensual"}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-[11px] text-stone-500 italic mt-1 bg-stone-50 p-1.5 rounded border border-stone-200">
                                    Nota: {item.notes}
                                  </p>
                                )}
                                {isActi && item.activatedAt && (
                                  <p className="text-[10px] font-semibold text-amber-800 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                                    Habilitado el: {formatDateSafe(item.activatedAt)}{" "}
                                    {item.activatedBy && `por ${item.activatedBy}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Acciones de la Tarjeta */}
                            <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: BRAND.paperDark }}>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSendCodeWhatsApp(item)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] text-white flex items-center gap-1 hover:brightness-105 transition shadow-sm"
                                  title="Enviar código de activación por WhatsApp al comercio"
                                >
                                  <Send size={12} />
                                  <span>Enviar WhatsApp</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCodeToClipboard(item.code)}
                                  className="px-2 py-1.5 rounded-lg text-xs font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition flex items-center gap-1"
                                  title="Copiar código para enviar manualmente"
                                >
                                  <Copy size={12} />
                                  <span>Copiar</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {isDispo ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCodeStatus(item.id, "activado")}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold border border-amber-300 text-amber-800 hover:bg-amber-50"
                                    title="Marcar como ya entregado y activado"
                                  >
                                    Marcar Activado
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCodeStatus(item.id, "disponible")}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                    title="Volver a poner disponible"
                                  >
                                    Hacer Disponible
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCode(item.id)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="Eliminar código permanentemente"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Barra fija inferior para Guardar Cambios */}
        <div className="fixed bottom-0 left-0 right-0 p-4 shadow-2xl z-40 border-t" style={{ background: BRAND.charcoal, borderColor: "#3D3025" }}>
          {saveError && (
            <p className="text-xs mb-2 text-center max-w-5xl mx-auto font-bold flex items-center justify-center gap-1" style={{ color: BRAND.mustardLight }}>
              <AlertCircle size={14} /> {saveError}
            </p>
          )}
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <span className="hidden sm:block text-xs font-semibold" style={{ color: BRAND.paper }}>
              {dirty ? "Hay modificaciones listas para publicar" : "Todos los datos están sincronizados"}
            </span>
            <button
              type="button"
              onClick={saveAllAdminChanges}
              disabled={!dirty || saving}
              className="w-full sm:w-auto sm:min-w-[280px] flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm md:text-base shadow-lg transition disabled:opacity-40 hover:brightness-105"
              style={{ background: savedFlash ? BRAND.green : BRAND.tomato, color: BRAND.cream }}
            >
              {saving ? (<><LoaderCircle className="animate-spin" size={18} /> Guardando cambios...</>) :
                savedFlash ? (<><CheckCircle2 size={18} /> ¡Cambios guardados con éxito!</>) :
                (<><Save size={18} /> Guardar cambios</>)}
            </button>
          </div>
        </div>

        {/* Notificaciones Toast en el Panel de Administración */}
        <ToastContainer
          toasts={toasts}
          onDismiss={removeToast}
          onAction={handleToastAction}
        />

        {/* Modales Compartidos: Cobro por Caja y Reporte de Movimientos */}
        {renderCashPaymentModal()}
        {renderCashReportModal()}
        {renderHistoryDetailModal()}
        {renderHistoryPdfModal()}
        {renderWhatsAppConfirmationModal()}

        {/* Modales de Códigos de Activación y Licencias para Comercios */}
        {renderCreateCodeModal()}
        {renderActivateAppModal()}
      </div>
    </AdminErrorBoundary>
    );
  }

  /* =========================================================================
     PANTALLA: TIENDA PÚBLICA (ADAPTADA A PC Y CELULAR)
     ========================================================================= */
  return (
    <div style={pageBackgroundStyle} className="min-h-screen flex flex-col font-sans selection:bg-amber-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Caveat:wght@600;700&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .slab { font-family: 'Alfa Slab One', serif; }
        .hand { font-family: 'Caveat', cursive; }
      `}</style>

      {/* Barra de aviso de error si ocurre */}
      {loadError && (
        <div className="text-xs text-center py-2 px-4 flex items-center justify-center gap-1 shadow-sm" style={{ background: BRAND.mustard, color: BRAND.charcoal }}>
          <AlertCircle size={14} /> {loadError}
        </div>
      )}

      {/* Banner para comercio comprador: Habilitación de App con Código */}
      {!appLicense.isActivated && (
        <div className="bg-amber-100 border-b border-amber-300 text-stone-900 px-4 py-2 text-xs">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#C1392B] flex-shrink-0" />
              <span>
                <b>¿Compraste esta app para tu negocio?</b> Ingresá el código de activación para habilitarlo.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowActivateModal(true);
                setActivationError("");
                setActivationSuccess(null);
                setInputActivationCode("");
                setInputActivationBusiness(business.name);
              }}
              className="px-3 py-1 rounded-full text-xs font-black text-white shadow hover:brightness-105 transition self-start sm:self-auto flex items-center gap-1"
              style={{ background: BRAND.tomato }}
            >
              <KeyRound size={12} />
              <span>Ingresar Código</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Contacto y Datos del Comercio (visible en PC y tablets) */}
      <div style={{ background: BRAND.charcoalDark }} className="w-full text-stone-300 text-xs py-1.5 px-4 hidden md:block border-b border-stone-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin size={13} color={BRAND.mustardLight} /> {business.address}
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Phone size={13} color={BRAND.green} /> WhatsApp: <b className="text-white">{business.phoneDisplay}</b>
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            Delivery y retiro en el local
          </span>
        </div>
      </div>

      {/* Portada Principal del Comercio (Banner Adaptado para PC y Celular) */}
      <div style={{ background: BRAND.charcoal }} className="w-full flex justify-center shadow-inner">
        <div className="w-full max-w-5xl md:px-6 md:pt-4">
          <div className="relative w-full overflow-hidden md:rounded-2xl md:shadow-xl aspect-[3/1] max-h-80 sm:max-h-96 bg-stone-900 flex items-center justify-center">
            <img 
              src={business.bannerImage || "/banner.jpg"} 
              alt={business.name || "La Caserita"} 
              className="w-full h-full object-cover block"
              onError={(e) => { e.currentTarget.src = "/banner.jpg"; }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none md:rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Barra Superior Sticky con Nombre, Carrito y Acceso a Admin */}
      <div style={{ background: BRAND.charcoal }} className="sticky top-0 z-20 shadow-lg border-b border-stone-800/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="slab text-lg md:text-2xl text-white tracking-wide leading-none">
              {business.name}
            </h1>
            <p className="hand text-lg md:text-xl leading-none mt-0.5" style={{ color: BRAND.mustard }}>
              {business.slogan || "Pedí online"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mensaje de ayuda para seleccionar productos */}
            <div className="hidden lg:flex items-center gap-1.5 text-right leading-tight">
              <span className="hand text-xl" style={{ color: "#FFD600", maxWidth: 170 }}>
                Elegí tus platos y confirmá en el carrito
              </span>
              <span className="text-2xl">👉</span>
            </div>

            {/* Botón del Carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative py-2.5 px-4 rounded-full flex items-center gap-2.5 shadow-md hover:brightness-105 active:scale-95 transition"
              style={{ background: BRAND.tomato }}
              title="Ver tu pedido"
            >
              <ShoppingCart size={20} color={BRAND.cream} />
              <span className="font-bold text-sm hidden sm:inline" style={{ color: BRAND.cream }}>
                {totalPrice > 0 ? formatGs(totalPrice) : "Carrito"}
              </span>
              {totalQty > 0 && (
                <span className="rounded-full text-xs font-black flex items-center justify-center shadow" style={{ background: BRAND.mustard, color: BRAND.charcoal, width: 22, height: 22 }}>
                  {totalQty}
                </span>
              )}
            </button>

            {/* Botón Adquirir la App para Comercios */}
            <button
              onClick={() => { setView("register"); setRegSuccessVoucher(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition shadow-sm hover:brightness-105 active:scale-95"
              style={{ background: BRAND.mustard, color: BRAND.charcoal }}
              title="Adquirir esta App para tu propio comercio o restaurante"
            >
              <Briefcase size={15} />
              <span className="hidden sm:inline">Adquirir App</span>
            </button>

            {/* Botón Habilitar Comercio con Código de Activación */}
            <button
              onClick={() => {
                setShowActivateModal(true);
                setActivationError("");
                setActivationSuccess(null);
                setInputActivationCode("");
                setInputActivationBusiness(business.name);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition shadow-sm hover:brightness-105 active:scale-95 bg-white text-stone-900 border border-stone-300"
              title="Habilitar este comercio con tu código de activación"
            >
              <KeyRound size={15} style={{ color: BRAND.tomato }} />
              <span className="hidden md:inline">Habilitar</span>
            </button>

            {/* Botón de configuración / administrador */}
            <button
              onClick={() => { setUserInput(""); setPinInput(""); setPinError(""); setShowLoginPin(false); setView("adminLogin"); }}
              className="p-2.5 rounded-full flex-shrink-0 hover:brightness-105 transition shadow"
              style={{ background: BRAND.paperDark }}
              title="Administrar menú y comercio"
            >
              <Settings size={19} color={BRAND.charcoal} />
            </button>
          </div>
        </div>

        {/* Guía en móviles */}
        <p className="hand text-base text-center pb-2 lg:hidden flex items-center justify-center gap-1" style={{ color: "#FFD600" }}>
          Seleccioná tus productos y confirmá en el carrito <span className="text-xl">👇</span>
        </p>
      </div>

      {/* Barra de Búsqueda y Navegación de Secciones (Sticky para fácil acceso) */}
      <div style={{ background: BRAND.paperDark }} className="shadow-md sticky top-[69px] sm:top-[77px] z-10 border-b border-stone-400/30">
        <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col gap-2">
          {/* Buscador en Tiempo Real */}
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar plato, bebida o postre... (ej: milanesa, coca, flan)"
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs md:text-sm font-semibold bg-white border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C1392B]"
              style={{ borderColor: BRAND.paperDark, color: BRAND.charcoal }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Selector de Secciones con Scroll Horizontal Suave */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start md:justify-center">
            {/* Pestaña: Todas las secciones */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("TODOS");
                setOpenCat(menu[0]?.category || "");
              }}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold border-2 flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02] flex-shrink-0"
              style={activeSection === "TODOS"
                ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                : { background: BRAND.paper, color: BRAND.charcoal, borderColor: BRAND.charcoal }}
            >
              <span>🍽️</span>
              <span>Todas las secciones</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeSection === "TODOS" ? "bg-white/20 text-white" : "bg-stone-300 text-stone-800"
              }`}>
                {allItems.length}
              </span>
            </button>

            {/* Pestañas por cada categoría (Platos Principales, Bebidas, Postres, etc.) */}
            {categoryStats.map((c) => {
              const isSelected = activeSection === c.category;
              return (
                <button
                  key={c.category}
                  type="button"
                  onClick={() => {
                    setActiveSection(c.category);
                    setOpenCat(c.category);
                  }}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold border-2 flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02] flex-shrink-0"
                  style={isSelected
                    ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                    : { background: BRAND.paper, color: BRAND.charcoal, borderColor: BRAND.charcoal }}
                >
                  <CategoryIcon name={c.category} icon={c.icon} size={15} color={isSelected ? BRAND.cream : BRAND.charcoal} />
                  <span>{c.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isSelected ? "bg-white/20 text-white" : "bg-stone-300 text-stone-800"
                  }`}>
                    {c.totalItems}
                  </span>
                  {c.inCartCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-900 font-black shadow-sm" title={`${c.inCartCount} en el carrito`}>
                      {c.inCartCount} 🛒
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selector Principal de Modalidad de Pedido */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-1 w-full">
        <div
          className="rounded-2xl p-3 md:p-4 border-2 shadow-sm"
          style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b" style={{ borderColor: BRAND.paperDark }}>
            <div className="flex items-center gap-2">
              <span className="text-base md:text-xl">🛎️</span>
              <div>
                <p className="font-black text-xs md:text-sm" style={{ color: BRAND.charcoal }}>
                  ¿Cómo querés hacer tu pedido?
                </p>
                <p className="text-[11px] text-stone-600">
                  Elegí si es para consumir en una mesa del salón, delivery o pasar a buscar
                </p>
              </div>
            </div>

            {/* Badge de estado actual */}
            <div className="self-start sm:self-auto">
              {mode === "mesa" && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm" style={{ background: BRAND.mustard, color: BRAND.charcoal }}>
                  <Utensils size={13} /> {tableNumber.trim() ? `Mesa N° ${tableNumber.trim()}` : "Mesa (a indicar)"}
                </span>
              )}
              {mode === "delivery" && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm" style={{ background: BRAND.tomato, color: BRAND.cream }}>
                  <Bike size={13} /> Envío por Delivery
                </span>
              )}
              {mode === "retiro" && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm" style={{ background: BRAND.green, color: BRAND.cream }}>
                  <ShoppingBag size={13} /> Pasar a buscar (Retiro)
                </span>
              )}
            </div>
          </div>

          {/* 3 Botones de selección de modalidad */}
          <div className="grid grid-cols-3 gap-2 pt-2.5">
            <button
              type="button"
              onClick={() => setMode("mesa")}
              className="p-2 md:p-2.5 rounded-xl text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 border-2 transition shadow-sm"
              style={mode === "mesa"
                ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                : { background: "#FFF", color: BRAND.charcoal, borderColor: BRAND.paperDark }}
            >
              <Utensils size={16} />
              <span>Pedir en Mesa</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("delivery")}
              className="p-2 md:p-2.5 rounded-xl text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 border-2 transition shadow-sm"
              style={mode === "delivery"
                ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                : { background: "#FFF", color: BRAND.charcoal, borderColor: BRAND.paperDark }}
            >
              <Bike size={16} />
              <span>Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("retiro")}
              className="p-2 md:p-2.5 rounded-xl text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 border-2 transition shadow-sm"
              style={mode === "retiro"
                ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark }
                : { background: "#FFF", color: BRAND.charcoal, borderColor: BRAND.paperDark }}
            >
              <ShoppingBag size={16} />
              <span>Pasar a buscar</span>
            </button>
          </div>

          {/* Panel interactivo de Número de Mesa */}
          {mode === "mesa" && (
            <div className="mt-3 p-2.5 rounded-xl bg-white border flex flex-col md:flex-row md:items-center justify-between gap-2.5" style={{ borderColor: tableError ? BRAND.tomato : BRAND.paperDark }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: BRAND.mustardLight }}>
                  <Utensils size={15} color={BRAND.charcoal} />
                </div>
                <label className="text-xs font-bold whitespace-nowrap" style={{ color: BRAND.charcoal }}>
                  Número de mesa:
                </label>
                <div className="relative w-36">
                  <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      setTableError("");
                    }}
                    placeholder="Ej: 4, 12, Barra..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold rounded-lg border focus:outline-none"
                    style={{ borderColor: tableError ? BRAND.tomato : BRAND.paperDark }}
                  />
                </div>
              </div>

              {/* Botones rápidos de mesas habituales (1 al 10) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <span className="text-[10px] text-stone-500 font-bold mr-1 hidden sm:inline">Mesas:</span>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setTableNumber(n);
                      setTableError("");
                    }}
                    className={`px-2 py-0.5 text-xs rounded-md font-bold border transition ${
                      tableNumber === n
                        ? "bg-[#C1392B] text-white border-[#9E2C20]"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode === "mesa" && tableError && (
            <p className="text-[11px] font-bold text-red-600 mt-1.5">⚠️ {tableError}</p>
          )}

          {/* Información rápida para Delivery */}
          {mode === "delivery" && (
            <div className="mt-2.5 p-2 rounded-xl bg-white/80 border text-xs text-stone-600 flex items-center justify-between" style={{ borderColor: BRAND.paperDark }}>
              <span>🛵 Te enviamos el pedido a tu domicilio. En el carrito podrás indicar tu dirección o adjuntar ubicación GPS.</span>
            </div>
          )}

          {/* Información rápida para Retiro */}
          {mode === "retiro" && (
            <div className="mt-2.5 p-2 rounded-xl bg-white/80 border text-xs text-stone-600 flex items-center justify-between" style={{ borderColor: BRAND.paperDark }}>
              <span>🛍️ Lo prepararemos para que pases a retirarlo por nuestro local: <b>{business.address}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Contenedor Principal de Productos (Organizado por Secciones y Filtros) */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 pb-28">
        {/* Banner de Búsqueda Activa */}
        {searchQuery.trim() && (
          <div className="mb-5 p-3 px-4 rounded-2xl bg-amber-100/95 border border-amber-300 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-950 text-xs md:text-sm">
              <Search size={16} className="text-amber-700 flex-shrink-0" />
              <span>
                Resultados para <b>"{searchQuery}"</b>: <b>{totalFilteredItems}</b> {totalFilteredItems === 1 ? "opción encontrada" : "opciones encontradas"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-2.5 py-1 rounded-xl bg-white text-stone-800 border border-amber-300 hover:bg-stone-50 text-xs font-bold transition shadow-sm flex-shrink-0"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Indicador de Sección Filtrada (cuando no es TODOS y no hay búsqueda) */}
        {!searchQuery.trim() && activeSection !== "TODOS" && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-white/70 p-2.5 px-3.5 rounded-2xl border" style={{ borderColor: BRAND.paperDark }}>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Sección activa:</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white flex items-center gap-1.5 shadow-sm" style={{ background: BRAND.tomato }}>
                <CategoryIcon name={activeSection} size={14} color="#FFF" />
                {activeSection}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection("TODOS")}
              className="text-xs font-bold text-[#C1392B] hover:underline flex items-center gap-1"
            >
              <span>Ver todo el menú por secciones →</span>
            </button>
          </div>
        )}

        {/* Estado Vacío si no hay resultados */}
        {filteredMenu.length === 0 ? (
          <div className="rounded-3xl p-8 md:p-12 text-center bg-white/80 border-2 border-dashed border-stone-300 my-6 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
              🍽️
            </div>
            <h3 className="slab text-xl md:text-2xl text-stone-800 mb-1">
              No encontramos platos ni bebidas
            </h3>
            <p className="text-xs md:text-sm text-stone-600 max-w-md mx-auto mb-4">
              {searchQuery.trim()
                ? `No hay coincidencias para "${searchQuery}" en ${activeSection === "TODOS" ? "el menú" : `la sección ${activeSection}`}.`
                : `Por el momento no hay productos registrados en la sección "${activeSection}".`}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveSection("TODOS");
              }}
              className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white shadow hover:brightness-105 transition"
              style={{ background: BRAND.tomato }}
            >
              Restablecer filtros y ver todo el menú
            </button>
          </div>
        ) : (
          filteredMenu.map((c) => (
            <section
              key={c.category}
              id={`seccion-${encodeURIComponent(c.category)}`}
              className="mb-10 scroll-mt-36"
            >
              {/* Cabecera de la Sección */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2" style={{ borderColor: BRAND.paperDark }}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl shadow-sm" style={{ background: BRAND.tomato }}>
                    <CategoryIcon name={c.category} icon={c.icon} size={20} color={BRAND.cream} />
                  </div>
                  <div>
                    <h2 className="slab text-xl md:text-2xl leading-tight" style={{ color: BRAND.charcoal }}>
                      {c.category}
                    </h2>
                    <span className="text-[11px] font-bold text-stone-500">
                      {c.items.length} {c.items.length === 1 ? "opción disponible" : "opciones disponibles"}
                    </span>
                  </div>
                </div>

                {activeSection === "TODOS" && filteredMenu.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(c.category)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-300 transition shadow-sm flex items-center gap-1"
                    title={`Ver únicamente la sección ${c.category}`}
                  >
                    <span>Filtrar solo {c.category}</span>
                  </button>
                )}
              </div>

              {/* Grid Responsivo: 1 col en celular, 2 en tablet, 3 en PC */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {c.items.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl p-3.5 flex flex-col justify-between shadow-md border hover:shadow-lg transition-all"
                      style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}
                    >
                      <div>
                        {/* Foto del plato (si existe) */}
                        {item.image && (
                          <div className="w-full h-40 mb-3 rounded-xl overflow-hidden bg-stone-200">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base md:text-lg leading-snug" style={{ color: BRAND.charcoal }}>
                            {item.name}
                          </h3>
                        </div>

                        {item.desc && (
                          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                      </div>

                      {/* Selector directo de modalidad en cada cuadro de menú */}
                      <div className="my-2.5 pt-2 border-t flex items-center justify-between gap-1" style={{ borderColor: BRAND.paperDark }}>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          Pedir para:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setMode("mesa")}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
                              mode === "mesa"
                                ? "bg-[#C1392B] text-white border-[#9E2C20] shadow-sm"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                            title="Pedir para mesa en el salón"
                          >
                            <Utensils size={11} />
                            <span>Mesa {tableNumber ? `N° ${tableNumber}` : "X"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode("delivery")}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
                              mode === "delivery"
                                ? "bg-[#C1392B] text-white border-[#9E2C20] shadow-sm"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                            title="Pedir para delivery"
                          >
                            <Bike size={11} />
                            <span>Delivery</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode("retiro")}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
                              mode === "retiro"
                                ? "bg-[#C1392B] text-white border-[#9E2C20] shadow-sm"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                            title="Pedir para pasar a buscar"
                          >
                            <ShoppingBag size={11} />
                            <span>Retiro</span>
                          </button>
                        </div>
                      </div>

                      {/* Precio y controles de cantidad */}
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BRAND.paperDark }}>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Precio</span>
                          <span className="font-black text-base md:text-lg" style={{ color: BRAND.tomato }}>
                            {formatGs(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {qty > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setCart((prev) => {
                                    const next = { ...prev };
                                    delete next[item.id];
                                    return next;
                                  });
                                }}
                                className="p-1 px-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-red-200 mr-0.5"
                                title="Eliminar este plato del pedido"
                              >
                                <Trash2 size={13} />
                                <span className="text-[11px] font-bold">Eliminar</span>
                              </button>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 rounded-full hover:brightness-95 active:scale-90 transition"
                                style={{ background: BRAND.paperDark, color: BRAND.charcoal }}
                                title="Quitar uno"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-black text-sm min-w-[20px] text-center" style={{ color: BRAND.charcoal }}>
                                {qty}
                              </span>
                            </>
                          )}
                          <button
                            onClick={() => addItem(item.id)}
                            className="p-1.5 px-3 rounded-full flex items-center gap-1 font-bold text-xs shadow hover:brightness-105 active:scale-95 transition"
                            style={{ background: BRAND.tomato, color: BRAND.cream }}
                            title="Agregar al pedido"
                          >
                            <Plus size={16} />
                            {qty === 0 && <span>Agregar</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Barra Flotante de Previsualización y Carrito Rápido (accesible en celular y PC) */}
      {totalQty > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto flex flex-col gap-1.5">
          {/* Previsualización rápida con el nombre exacto de cada plato cargado */}
          <div className="bg-stone-900/95 text-white p-2.5 px-3.5 rounded-2xl shadow-xl backdrop-blur border border-stone-700/60 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-[11px] uppercase font-black tracking-wider text-amber-400 flex-shrink-0">
                Plato(s):
              </span>
              {cartLines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-2 bg-stone-800 px-3 py-1 rounded-xl border border-stone-700 flex-shrink-0 text-xs shadow-sm"
                >
                  <span className="font-black text-amber-300">{line.qty}x</span>
                  <span className="font-bold text-white text-xs max-w-[140px] sm:max-w-[180px] truncate">
                    {line.name}
                  </span>
                  <span className="text-[11px] text-amber-200/90 font-mono font-semibold">
                    {formatGs(line.price * line.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearItem(line.id);
                    }}
                    className="p-1 -mr-1 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition flex items-center gap-0.5"
                    title={`Eliminar ${line.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCart({})}
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex-shrink-0 flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-white/10 transition"
              title="Eliminar todos los platos cargados"
            >
              <Trash2 size={13} />
              <span>Vaciar</span>
            </button>
          </div>

          {/* Barra de acción principal: Resumen con Nombre del Menú, Eliminar y Ver pedido */}
          <div
            className="w-full p-3 px-4 rounded-2xl font-bold flex items-center justify-between shadow-2xl text-white border-2 transition"
            style={{ background: BRAND.tomato, borderColor: BRAND.tomatoDark }}
          >
            {/* Lado izquierdo: nombre del menú solicitado, precio y modalidad */}
            <div
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 mr-2"
              title="Abrir carrito para ver detalle del pedido"
            >
              <span className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                <ShoppingCart size={20} />
              </span>
              <div className="text-left min-w-0 flex-1">
                {/* Nombre visible y destacado del plato o menú solicitado */}
                <div className="text-sm md:text-base font-black leading-snug truncate text-white">
                  {cartLines.length === 1 ? (
                    <span>
                      <span className="text-amber-300 font-extrabold mr-1">{cartLines[0].qty}x</span>
                      {cartLines[0].name}
                    </span>
                  ) : cartLines.length > 1 ? (
                    <span>
                      <span className="text-amber-300 font-extrabold mr-1">{cartLines[0].qty}x</span>
                      {cartLines[0].name}
                      <span className="text-xs font-semibold text-amber-200 ml-1.5">
                        (+{cartLines.length - 1} más)
                      </span>
                    </span>
                  ) : (
                    <span>Menú seleccionado</span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-amber-100 flex items-center gap-1.5 truncate mt-0.5">
                  <span className="font-black text-amber-300 text-xs">{formatGs(totalPrice)}</span>
                  <span>•</span>
                  {mode === "mesa" ? (
                    <>
                      <Utensils size={11} /> {tableNumber.trim() ? `Mesa ${tableNumber.trim()}` : "Mesa (a indicar)"}
                    </>
                  ) : mode === "delivery" ? (
                    <>
                      <Bike size={11} /> Delivery
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={11} /> Retiro
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Lado derecho: Botón Eliminar y Botón Ver pedido */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCart({});
                }}
                className="p-2 px-3 rounded-xl bg-white/20 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-white/30 shadow-sm"
                title="Eliminar platos cargados para cambiar de menú"
              >
                <Trash2 size={14} className="text-white" />
                <span className="text-xs">Eliminar</span>
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="p-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <span>Ver pedido</span>
                <span>👉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Carrito de Compras (adaptado a Bottom Sheet en móvil y Diálogo Centrado en PC) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 md:p-6 max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl" style={{ background: BRAND.paper }}>
            {/* Cabecera del Carrito */}
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: BRAND.paperDark }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ background: BRAND.tomato }}>
                  <ShoppingCart size={20} color={BRAND.cream} />
                </div>
                <div>
                  <h2 className="slab text-xl" style={{ color: BRAND.charcoal }}>Tu Pedido</h2>
                  <p className="text-xs text-stone-600 font-medium">Revisá tus platos antes de enviar a WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-stone-300 transition"
                style={{ background: BRAND.paperDark }}
              >
                <X size={18} color={BRAND.charcoal} />
              </button>
            </div>

            {cartLines.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <ShoppingCart size={40} className="text-stone-400" />
                <p className="text-stone-600 font-bold text-base">El carrito está vacío</p>
                <p className="text-xs text-stone-500 max-w-xs">Agregá platos del menú para armar tu pedido.</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: BRAND.tomato, color: BRAND.cream }}
                >
                  Explorar menú
                </button>
              </div>
            ) : (
              <>
                {/* Lista de productos seleccionados */}
                <div className="flex-shrink-0 mb-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: BRAND.paperDark }}>
                    <span className="font-extrabold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Utensils size={14} className="text-amber-700" />
                      <span>Platos en tu pedido ({totalQty} {totalQty === 1 ? "unidad" : "unidades"}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCart({})}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                      title="Eliminar todos los platos del pedido"
                    >
                      <Trash2 size={13} />
                      <span>Vaciar lista</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {cartLines.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border-2 shadow-sm gap-2.5 flex-shrink-0"
                        style={{ borderColor: BRAND.paperDark }}
                      >
                        {l.image ? (
                          <img
                            src={l.image}
                            alt={l.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-stone-400 border border-stone-200"
                            style={{ background: BRAND.cream }}
                          >
                            <Utensils size={18} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-1">
                          <p className="font-black text-sm sm:text-base leading-snug" style={{ color: BRAND.charcoal }}>
                            <span className="text-amber-700 font-black mr-1.5">{l.qty}x</span>
                            {l.name}
                          </p>
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            {formatGs(l.price)} c/u • Subtotal: <b className="font-black" style={{ color: BRAND.tomato }}>{formatGs(l.price * l.qty)}</b>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => removeItem(l.id)}
                            className="p-1.5 rounded-full hover:bg-stone-300 transition"
                            style={{ background: BRAND.paperDark }}
                            title="Quitar uno"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-sm min-w-[20px] text-center" style={{ color: BRAND.charcoal }}>{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => addItem(l.id)}
                            className="p-1.5 rounded-full hover:brightness-110 transition"
                            style={{ background: BRAND.tomato, color: BRAND.cream }}
                            title="Agregar uno"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => clearItem(l.id)}
                            className="p-1.5 ml-1 rounded-lg text-red-600 hover:text-white hover:bg-red-600 transition"
                            title="Eliminar este plato del pedido"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selección de Modalidad: Mesa, Delivery o Retiro */}
                <div className="mb-4">
                  <p className="font-bold text-xs uppercase tracking-wider mb-2" style={{ color: BRAND.charcoal }}>
                    ¿Cómo vas a recibir tu pedido?
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("mesa")}
                      className="p-2 sm:p-2.5 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 border-2 transition"
                      style={mode === "mesa" ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark } : { background: BRAND.cream, borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                    >
                      <Utensils size={16} />
                      <span className="text-center text-[11px] sm:text-xs">En Mesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("delivery")}
                      className="p-2 sm:p-2.5 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 border-2 transition"
                      style={mode === "delivery" ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark } : { background: BRAND.cream, borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                    >
                      <Bike size={16} />
                      <span className="text-center text-[11px] sm:text-xs">Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("retiro")}
                      className="p-2 sm:p-2.5 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 border-2 transition"
                      style={mode === "retiro" ? { background: BRAND.tomato, color: BRAND.cream, borderColor: BRAND.tomatoDark } : { background: BRAND.cream, borderColor: BRAND.paperDark, color: BRAND.charcoal }}
                    >
                      <ShoppingBag size={16} />
                      <span className="text-center text-[11px] sm:text-xs">Pasar a buscar</span>
                    </button>
                  </div>
                </div>

                {/* Campos para Mesa */}
                {mode === "mesa" && (
                  <div className="mb-4 flex flex-col gap-2.5 p-3.5 rounded-xl border-2" style={{ background: BRAND.cream, borderColor: tableError ? BRAND.tomato : BRAND.paperDark }}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: BRAND.charcoal }}>
                        <Utensils size={14} style={{ color: BRAND.tomato }} /> Número de mesa en el salón:
                      </label>
                      {tableNumber && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-stone-800">
                          Mesa {tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Escribí el número de tu mesa (ej: 4, 12, Barra...)"
                        value={tableNumber}
                        onChange={(e) => {
                          setTableNumber(e.target.value);
                          setTableError("");
                        }}
                        className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl border"
                        style={{ borderColor: tableError ? BRAND.tomato : BRAND.paperDark, background: "#FFF" }}
                        autoFocus
                      />
                    </div>
                    {tableError && (
                      <p className="text-[11px] font-bold text-red-600">⚠️ {tableError}</p>
                    )}
                    {/* Botones de acceso rápido para mesas 1 a 10 */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[10px] text-stone-500 font-bold mr-1 whitespace-nowrap">Mesas directas:</span>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setTableNumber(n);
                            setTableError("");
                          }}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                            tableNumber === n
                              ? "bg-[#C1392B] text-white border-[#9E2C20] shadow-sm"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-stone-600">
                      🍽️ Te llevaremos tu pedido listo directamente a tu mesa.
                    </p>
                  </div>
                )}

                {/* Campos para Retiro / Pasar a buscar */}
                {mode === "retiro" && (
                  <div className="mb-4 p-3 rounded-xl border-2 bg-white/70 text-xs text-stone-700" style={{ borderColor: BRAND.paperDark }}>
                    <p className="font-bold mb-0.5 flex items-center gap-1.5" style={{ color: BRAND.charcoal }}>
                      <Store size={14} style={{ color: BRAND.green }} /> Retiro por el local
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Prepararemos tu pedido para retirar en: <b>{business.address}</b>.
                    </p>
                  </div>
                )}

                {/* Campos para Delivery con Selector de Google Maps Gratuito */}
                {mode === "delivery" && (
                  <div className="mb-4 flex flex-col gap-3 p-3.5 rounded-2xl border-2 shadow-sm" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-1.5" style={{ color: BRAND.charcoal }}>
                        <MapPin size={16} className="text-[#C1392B]" /> Ubicación para Entrega (Google Maps)
                      </span>
                      {mapLink && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ Marcada
                        </span>
                      )}
                    </div>

                    {/* Si la ubicación ya está establecida */}
                    {mapLink ? (
                      <div className="p-3 rounded-xl bg-white border-2 border-emerald-400 text-xs space-y-2 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 size={15} className="text-emerald-700" /> Ubicación en Google Maps lista
                            </p>
                            {deliveryCoords ? (
                              <p className="text-[11px] font-mono text-stone-600 mt-0.5">
                                Coordenadas: {deliveryCoords.lat}, {deliveryCoords.lng}
                                {locAccuracy ? ` (±${locAccuracy}m)` : ""}
                              </p>
                            ) : (
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Enlace de Google Maps verificado
                              </p>
                            )}
                          </div>
                          <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 transition flex-shrink-0"
                            title="Verificar en Google Maps"
                          >
                            <ExternalLink size={12} /> Probar link
                          </a>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => {
                              if (deliveryCoords) {
                                setMapPickerLat(deliveryCoords.lat);
                                setMapPickerLng(deliveryCoords.lng);
                              }
                              setShowMapSelectorModal(true);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition text-center flex items-center justify-center gap-1"
                          >
                            <Map size={13} /> Ajustar en el mapa
                          </button>
                          <button
                            type="button"
                            onClick={() => getGPSLocation(false)}
                            className="py-1.5 px-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition flex items-center gap-1"
                            title="Actualizar GPS del celular"
                          >
                            <Crosshair size={13} /> Recalibrar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMapLink("");
                              setDeliveryCoords(null);
                              setLocStatus("idle");
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition"
                            title="Quitar ubicación"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Si aún no ha marcado ubicación */
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => getGPSLocation(false)}
                            disabled={geoLocating}
                            className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                            style={{ background: BRAND.mustard, color: BRAND.charcoal }}
                          >
                            {geoLocating ? (
                              <><LoaderCircle className="animate-spin" size={15} /> Obteniendo GPS...</>
                            ) : (
                              <><Crosshair size={15} /> GPS de mi celular</>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (deliveryCoords) {
                                setMapPickerLat(deliveryCoords.lat);
                                setMapPickerLng(deliveryCoords.lng);
                              }
                              setShowMapSelectorModal(true);
                            }}
                            className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition hover:brightness-105 active:scale-95 border-2 bg-white text-stone-900 border-stone-800"
                          >
                            <Map size={15} className="text-[#C1392B]" /> Marcar en el mapa
                          </button>
                        </div>

                        {/* Opción para pegar link copiado de Google Maps */}
                        {!showManualPasteLink ? (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setShowManualPasteLink(true)}
                              className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium"
                            >
                              ¿Tenés un link copiado de Google Maps? Pegalo acá
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white border border-stone-300 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-stone-700">
                                Pegá tu enlace de Google Maps:
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowManualPasteLink(false)}
                                className="text-stone-400 hover:text-stone-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                placeholder="https://maps.app.goo.gl/... o maps.google.com"
                                value={manualLinkInput}
                                onChange={(e) => setManualLinkInput(e.target.value)}
                                className="flex-1 p-2 text-xs rounded-lg border border-stone-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = manualLinkInput.trim();
                                  if (trimmed.startsWith("http")) {
                                    setMapLink(trimmed);
                                    setLocStatus("done");
                                    setShowManualPasteLink(false);
                                    setManualLinkInput("");
                                  } else {
                                    alert("Por favor ingresá un enlace válido que empiece con https://");
                                  }
                                }}
                                className="px-3 py-2 bg-stone-800 text-white rounded-lg text-xs font-bold"
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        )}

                        {geoInfoMsg && (
                          <p className="text-[11px] text-stone-600 italic bg-white/70 p-2 rounded-lg border border-stone-200">
                            {geoInfoMsg}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Dirección escrita / referencias */}
                    <div>
                      <input
                        type="text"
                        placeholder="Dirección o referencia exacta (Ej: Calle Boquerón c/ Villarrica, portón verde)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border"
                        style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                      />
                    </div>

                    <p className="text-[11px] text-stone-600 italic">
                      * {business.deliveryNote || deliveryNote}
                    </p>
                  </div>
                )}

                {/* Nombre del Cliente / Identificación del Pedido */}
                <div className="mb-4 flex flex-col gap-1.5 p-3.5 rounded-xl border-2" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                  <label className="text-xs font-bold flex items-center justify-between" style={{ color: BRAND.charcoal }}>
                    <span className="flex items-center gap-1.5">
                      <User size={14} style={{ color: BRAND.tomato }} /> ¿A nombre de quién hacemos el pedido?
                    </span>
                    {customerName.trim() && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Identificado ✓
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Escribí tu nombre (ej: Juan Pérez, María, Familia Gómez...)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Tu nombre nos permite llamarte, preparar tu comanda y entregarte tu pedido sin confusiones.
                  </p>
                </div>

                {/* Número de WhatsApp / Teléfono para notificaciones automáticas */}
                <div className="mb-4 flex flex-col gap-1.5 p-3.5 rounded-xl border-2" style={{ background: BRAND.cream, borderColor: BRAND.paperDark }}>
                  <label className="text-xs font-bold flex items-center justify-between" style={{ color: BRAND.charcoal }}>
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} style={{ color: BRAND.green }} /> Tu número de WhatsApp / Celular
                    </span>
                    {customerPhone.trim() && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Registrado ✓
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="Ej: 0981 123 456 (para recibir aviso cuando esté entregado)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Te enviaremos una notificación automática por WhatsApp una vez que tu pedido sea completado o entregado.
                  </p>
                </div>

                {/* Aclaraciones / Notas especiales */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Aclaraciones o notas (ej: sin cebolla, con cubiertos descartables)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border"
                    style={{ borderColor: BRAND.paperDark, background: "#FFF" }}
                  />
                </div>

                {/* Subtotal y Total */}
                <div className="pt-3 border-t flex items-center justify-between mb-4" style={{ borderColor: BRAND.paperDark }}>
                  <span className="font-bold text-base" style={{ color: BRAND.charcoal }}>Total a pagar:</span>
                  <span className="font-black text-xl" style={{ color: BRAND.tomato }}>{formatGs(totalPrice)}</span>
                </div>

                {/* Botón Enviar Pedido por WhatsApp */}
                <button
                  onClick={sendOrder}
                  className="w-full p-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition"
                  style={{ background: BRAND.green, color: BRAND.cream }}
                >
                  <Send size={18} /> Enviar pedido por WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Banner Promocional para Comercios que quieran la App */}
      <section className="max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="rounded-3xl p-6 md:p-8 border-2 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: BRAND.paper, borderColor: BRAND.mustard }}>
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-200 text-stone-900">
              <Sparkles size={13} /> Para Bares, Restaurantes y Rotiserías
            </span>
            <h3 className="slab text-xl md:text-2xl text-stone-900">
              ¿Querés una App con pedidos para tu propio negocio?
            </h3>
            <p className="text-xs md:text-sm text-stone-700 max-w-xl">
              Menú interactivo con fotos, pedidos directos a tu WhatsApp con selección de Mesa, Delivery con GPS y Retiro, más tu propio panel de administración protegido para 1 solo usuario.
            </p>
          </div>
          <button
            onClick={() => { setView("register"); setRegSuccessVoucher(null); }}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition text-white flex-shrink-0"
            style={{ background: BRAND.tomato }}
          >
            <Briefcase size={18} />
            <span>Ver Planes y Adquirir App</span>
          </button>
        </div>
      </section>

      {/* Pie de Página */}
      <footer
        className="w-full py-10 px-4 text-center text-xs mt-auto border-t relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0e2a4d 0%, #0a1f3a 50%, #06162a 100%)",
          borderColor: "rgba(56, 189, 248, 0.28)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 -8px 24px rgba(2, 132, 199, 0.18)",
        }}
      >
        {/* Resplandor ambiental de fondo acorde a la paleta azul del logo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.28) 0%, rgba(2, 132, 199, 0.12) 45%, transparent 75%)",
          }}
        />

        <div className="max-w-5xl mx-auto space-y-2 relative z-10">
          <p className="font-bold text-white text-sm tracking-wide">{business.name}</p>
          <p className="text-slate-300">{business.address}</p>
          <p className="text-sky-200/80">Pedidos vía WhatsApp al {business.phoneDisplay}</p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setShowActivateModal(true);
                setActivationError("");
                setActivationSuccess(null);
                setInputActivationCode("");
                setInputActivationBusiness(business.name);
              }}
              className="text-[11px] text-slate-300 hover:text-sky-200 underline transition inline-flex items-center gap-1"
            >
              <KeyRound size={11} /> ¿Compraste esta app? Habilitar comercio con código de activación
            </button>
          </div>

          {/* Sección de Autoría y Contacto de CyM Software */}
          <div
            className="pt-6 mt-6 flex flex-col items-center justify-center gap-3 border-t"
            style={{ borderColor: "rgba(56, 189, 248, 0.25)" }}
          >
            <div className="flex items-center justify-center">
              {/* Logo sin fondo integrado directamente sobre el fondo azul */}
              <img
                src="/cym-software-logo-darkbg.svg"
                alt="CyM Software"
                className="w-24 h-24 md:w-28 md:h-28 object-contain transition-transform duration-300 hover:scale-105 select-none drop-shadow-[0_4px_16px_rgba(14,165,233,0.35)]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-slate-100 font-medium tracking-wide">
                Todos los derechos reservados 2026 - Contacto -{" "}
                <a
                  href="https://wa.me/595975635770"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-sky-400 hover:text-sky-300 underline transition inline-flex items-center gap-1 drop-shadow-sm"
                  title="Contactar a CyM Software vía WhatsApp"
                >
                  <Phone size={13} className="inline text-sky-400" />
                  <span>+595975635770</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Notificaciones Toast (Agregado al Carrito / Pedido Completado) */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        onAction={handleToastAction}
      />


      {/* Modales Compartidos: Cobro por Caja y Reporte de Movimientos */}
      {renderCashPaymentModal()}
      {renderCashReportModal()}
      {renderHistoryDetailModal()}
      {renderHistoryPdfModal()}
      {renderWhatsAppConfirmationModal()}

      {/* Selector de Ubicación Google Maps para Delivery (Modo Gratuito Móvil) */}
      {renderMapSelectorModal()}

      {/* Modales de Códigos de Activación y Licencias para Comercios */}
      {renderCreateCodeModal()}
      {renderActivateAppModal()}
    </div>
  );
}
