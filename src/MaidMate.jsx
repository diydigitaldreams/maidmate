import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "./useAuth";
import Auth from "./Auth";
import TaxPR from "./TaxPR";
import SuppliesOrder from "./SuppliesOrder";

const supabase = createClient(
  "https://zfxmztccpyrepbmchvig.supabase.co",
  "sb_publishable_FOpwk8eKErGMVcDxR3nJlg__-iXm0fm"
);

// ─── CALENDAR & MAPS UTILS ────────────────────────────────────────────────────
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function parseJobDateTime(timeStr, durationStr) {
  const m = timeStr?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  const base = new Date();
  base.setHours(h, min, 0, 0);
  const dur = parseFloat(durationStr?.match(/([\d.]+)h/)?.[1] || 1);
  const end = new Date(base.getTime() + dur * 3600000);
  return { start: base, end };
}

function toGCalDate(d) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0];
}

function googleCalendarLink(job) {
  const dt = parseJobDateTime(job.time, job.duration);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🧹 Cleaning · ${job.client}`,
    details: `MaidMate job · Duration: ${job.duration}`,
    location: job.address || "",
    ...(dt ? { dates: `${toGCalDate(dt.start)}/${toGCalDate(dt.end)}` } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function generateICS(job) {
  const dt = parseJobDateTime(job.time, job.duration);
  const stamp = toGCalDate(new Date()) + "Z";
  const start = dt ? toGCalDate(dt.start) : stamp;
  const end   = dt ? toGCalDate(dt.end)   : stamp;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MaidMate//EN",
    "BEGIN:VEVENT",
    `UID:${job.id}@maidmate.app`,
    `DTSTAMP:${stamp}`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:🧹 Cleaning · ${job.client}`,
    `DESCRIPTION:Duration: ${job.duration}`,
    `LOCATION:${job.address || ""}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function addToCalendar(job) {
  if (isIOS()) {
    const blob = new Blob([generateICS(job)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `maidmate-${job.client.replace(/\s+/g, "-")}.ics`;
    a.click();
  } else {
    window.open(googleCalendarLink(job), "_blank");
  }
}

function openMaps(from, to) {
  const enc = encodeURIComponent;
  const url = isIOS()
    ? `https://maps.apple.com/?saddr=${enc(from)}&daddr=${enc(to)}&dirflg=d`
    : `https://www.google.com/maps/dir/${enc(from)}/${enc(to)}`;
  window.open(url, "_blank");
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    appSub: "Business Manager",
    nav: { dashboard:"Dashboard", schedule:"Schedule", checklist:"Checklists", clients:"Clients", invoices:"Invoices", supplies:"Supplies", order:"Order", mileage:"Mileage", messages:"Messages", taxes:"PR Taxes" },
    user: { role: "Independent Cleaner" },
    dashboard: { earned:"Earned This Month", pending:"Pending", todayJobs:"Today's Jobs", miles:"Miles This Week", deductible:"deductible", next:"Next", invoices:"invoices", todaySchedule:"Today's Schedule", quickInvoice:"Quick Invoice", totalToday:"Total Today", lowSupplies:"⚠️ Low Supplies" },
    schedule: { addJob:"+ Add Job", addNewJob:"Add New Job", clientName:"Client Name", address:"Address", time:"Time", duration:"Duration (e.g. 2h)", cancel:"Cancel", addCalendar:"📅 Calendar", openMaps:"🗺️ Maps" },
    checklist: { tasksDone:"tasks done", client:"Cleaning Checklist" },
    clients: { clients:"Clients", addClient:"+ Add Client", addNew:"Add New Client", name:"Name", address:"Address", phone:"Phone", rate:"Rate ($)", freq:"Frequency", notes:"Notes", notesPlaceholder:"Special instructions…", cancel:"Cancel", freqs:["Weekly","Bi-weekly","Monthly","One-time"] },
    invoices: { paid:"Paid", pending:"Pending", overdue:"Overdue", allInvoices:"All Invoices", newInvoice:"+ New Invoice", invoice:"Invoice #", client:"Client", date:"Date", amount:"Amount", status:"Status", markPaid:"Mark Paid", clientName:"Client Name", cancel:"Cancel", create:"Create Invoice" },
    supplies: { inventory:"Supply Inventory", needsRestock:"items need restocking", allSupplies:"All Supplies", shoppingList:"🛒 Order Now", toRestock:"Items to restock:", outOfStock:"🚨 Out of stock", runningLow:"⚠️ Running low", gotIt:"✓ Got it", allStocked:"✅ All stocked up!", ok:"OK", low:"Low", out:"Out" },
    mileage: { title:"Mileage & Expenses", logTrip:"+ Log Trip", totalMiles:"Total Miles", taxDeduction:"Tax Deduction", irsRate:"@ $0.67/mile IRS rate", tripLog:"Trip Log", from:"From", to:"To (Client)", miles:"Miles", cancel:"Cancel", log:"Log Trip", deduct:"deduct.", openMaps:"🗺️ Navigate" },
    messages: { messages:"Messages", active:"Active now", send:"Send", placeholder:"Type a message…" },
    status: { completed:"Completed", inProgress:"In Progress", upcoming:"Upcoming" },
    common: { cancel:"Cancel", add:"Add", signOut:"Sign Out" },
  },
  es: {
    appSub: "Gestión de Negocios",
    nav: { dashboard:"Panel", schedule:"Agenda", checklist:"Listas", clients:"Clientes", invoices:"Facturas", supplies:"Suministros", order:"Ordenar", mileage:"Millaje", messages:"Mensajes", taxes:"Contribuciones" },
    user: { role: "Limpiadora Independiente" },
    dashboard: { earned:"Ganado Este Mes", pending:"Pendiente", todayJobs:"Trabajos Hoy", miles:"Millas Esta Semana", deductible:"deducible", next:"Próximo", invoices:"facturas", todaySchedule:"Agenda de Hoy", quickInvoice:"Factura Rápida", totalToday:"Total Hoy", lowSupplies:"⚠️ Suministros Bajos" },
    schedule: { addJob:"+ Agregar", addNewJob:"Agregar Trabajo", clientName:"Cliente", address:"Dirección", time:"Hora", duration:"Duración (ej. 2h)", cancel:"Cancelar", addCalendar:"📅 Calendario", openMaps:"🗺️ Mapa" },
    checklist: { tasksDone:"tareas completadas", client:"Lista de Limpieza" },
    clients: { clients:"Clientes", addClient:"+ Agregar", addNew:"Nuevo Cliente", name:"Nombre", address:"Dirección", phone:"Teléfono", rate:"Tarifa ($)", freq:"Frecuencia", notes:"Notas", notesPlaceholder:"Instrucciones…", cancel:"Cancelar", freqs:["Semanal","Quincenal","Mensual","Una vez"] },
    invoices: { paid:"Pagado", pending:"Pendiente", overdue:"Vencido", allInvoices:"Facturas", newInvoice:"+ Nueva", invoice:"#", client:"Cliente", date:"Fecha", amount:"Monto", status:"Estado", markPaid:"Marcar Pagado", clientName:"Cliente", cancel:"Cancelar", create:"Crear Factura" },
    supplies: { inventory:"Inventario", needsRestock:"artículos bajos", allSupplies:"Suministros", shoppingList:"🛒 Ordenar", toRestock:"Reponer:", outOfStock:"🚨 Sin stock", runningLow:"⚠️ Bajo", gotIt:"✓ Listo", allStocked:"✅ ¡Todo abastecido!", ok:"OK", low:"Bajo", out:"Agotado" },
    mileage: { title:"Millaje y Gastos", logTrip:"+ Registrar", totalMiles:"Millas Totales", taxDeduction:"Deducción Fiscal", irsRate:"@ $0.67/milla IRS", tripLog:"Registro", from:"Desde", to:"Hasta", miles:"Millas", cancel:"Cancelar", log:"Registrar", deduct:"deducible", openMaps:"🗺️ Navegar" },
    messages: { messages:"Mensajes", active:"Activo ahora", send:"Enviar", placeholder:"Escribe un mensaje…" },
    status: { completed:"Completado", inProgress:"En Progreso", upcoming:"Próximo" },
    common: { cancel:"Cancelar", add:"Agregar", signOut:"Cerrar Sesión" },
  },
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const styles = `
  ${GOOGLE_FONTS}
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  body { font-family:'DM Sans',sans-serif; background:#f5f2ee; }
  :root { --sage:#7a9e87; --sage-light:#b8d4c0; --sage-dark:#4a7060; --cream:#faf8f4; --warm:#f5f2ee; --coral:#e07a5f; --gold:#c9a84c; --text:#2c2c2c; --text-muted:#888; --border:#e8e4de; --shadow:0 4px 24px rgba(0,0,0,0.08); --shadow-sm:0 2px 8px rgba(0,0,0,0.06); }

  /* ── Layout ── */
  .app { display:flex; height:100vh; overflow:hidden; background:var(--warm); }
  .sidebar { width:230px; background:var(--sage-dark); display:flex; flex-direction:column; flex-shrink:0; position:relative; overflow:hidden; transition:transform 0.3s; z-index:50; }
  .sidebar::before { content:''; position:absolute; bottom:-60px; right:-60px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.04); pointer-events:none; }
  .sidebar-logo { padding:24px 20px 18px; border-bottom:1px solid rgba(255,255,255,0.1); }
  .logo-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:white; letter-spacing:-0.5px; }
  .logo-sub { font-size:10px; color:var(--sage-light); letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
  .sidebar-nav { padding:12px 10px; flex:1; overflow-y:auto; }
  .nav-section { font-size:9px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:2px; padding:0 10px; margin:12px 0 4px; }
  .nav-item { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:10px; cursor:pointer; margin-bottom:2px; transition:all 0.2s; color:rgba(255,255,255,0.7); font-size:13px; font-weight:500; user-select:none; }
  .nav-item:hover { background:rgba(255,255,255,0.08); color:white; }
  .nav-item.active { background:rgba(255,255,255,0.15); color:white; }
  .nav-icon { font-size:15px; width:20px; text-align:center; }
  .sidebar-footer { padding:14px 18px; border-top:1px solid rgba(255,255,255,0.1); }
  .user-badge { display:flex; align-items:center; gap:9px; }
  .avatar { width:32px; height:32px; border-radius:50%; background:var(--sage-light); display:flex; align-items:center; justify-content:center; font-size:14px; overflow:hidden; flex-shrink:0; }
  .avatar img { width:100%; height:100%; object-fit:cover; }
  .user-name { font-size:12px; color:white; font-weight:500; }
  .user-role { font-size:10px; color:var(--sage-light); }
  .sign-out-btn { display:flex; align-items:center; gap:6px; margin-top:8px; background:rgba(255,255,255,0.08); border:none; color:rgba(255,255,255,0.6); padding:7px 10px; border-radius:8px; cursor:pointer; font-size:11px; font-family:'DM Sans',sans-serif; width:100%; transition:all 0.2s; }
  .sign-out-btn:hover { background:rgba(255,255,255,0.15); color:white; }

  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .topbar { padding:14px 20px; display:flex; align-items:center; justify-content:space-between; background:var(--cream); border-bottom:1px solid var(--border); flex-shrink:0; gap:10px; }
  .topbar-left { display:flex; align-items:center; gap:10px; min-width:0; }
  .menu-btn { display:none; background:none; border:none; cursor:pointer; font-size:20px; padding:4px; color:var(--text); flex-shrink:0; }
  .page-title { font-family:'Playfair Display',serif; font-size:20px; color:var(--text); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .page-date { font-size:11px; color:var(--text-muted); white-space:nowrap; }
  .topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .db-badge { font-size:10px; padding:3px 8px; border-radius:20px; font-weight:600; white-space:nowrap; }
  .db-online { background:#e8f5ed; color:#2d7a4f; }
  .db-offline { background:#fff3e8; color:#d4620a; }
  .lang-toggle { display:flex; background:var(--warm); border:1px solid var(--border); border-radius:20px; overflow:hidden; }
  .lang-btn { padding:4px 10px; font-size:11px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--text-muted); font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .lang-btn.active { background:var(--sage-dark); color:white; border-radius:20px; }

  .content { flex:1; overflow-y:auto; padding:20px; -webkit-overflow-scrolling:touch; }

  /* ── Mobile bottom nav ── */
  .mobile-nav { display:none; position:fixed; bottom:0; left:0; right:0; background:white; border-top:1px solid var(--border); padding:6px 0 env(safe-area-inset-bottom,6px); z-index:100; }
  .mobile-nav-items { display:flex; justify-content:space-around; }
  .mobile-nav-item { display:flex; flex-direction:column; align-items:center; gap:2px; padding:6px 12px; cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; color:var(--text-muted); font-size:10px; font-weight:500; border-radius:10px; transition:all 0.2s; position:relative; min-width:52px; }
  .mobile-nav-item.active { color:var(--sage-dark); }
  .mobile-nav-icon { font-size:20px; }
  .mobile-badge { position:absolute; top:4px; right:8px; background:var(--coral); color:white; border-radius:10px; padding:0 5px; font-size:9px; font-weight:700; min-width:14px; text-align:center; }

  /* ── Drawer overlay ── */
  .drawer-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:40; }

  /* ── Mobile responsive ── */
  @media (max-width: 768px) {
    .sidebar { position:fixed; top:0; bottom:0; left:0; transform:translateX(-100%); }
    .sidebar.open { transform:translateX(0); box-shadow:4px 0 24px rgba(0,0,0,0.2); }
    .menu-btn { display:flex; }
    .mobile-nav { display:block; }
    .content { padding:16px 12px; padding-bottom:80px; }
    .topbar { padding:12px 14px; }
    .page-title { font-size:17px; }
    .db-badge { display:none; }
    .stats-grid { grid-template-columns:1fr 1fr !important; }
    .grid-2 { grid-template-columns:1fr !important; }
    .form-row { grid-template-columns:1fr !important; }
    .invoice-header, .invoice-row { grid-template-columns:auto 1fr auto auto !important; }
    .invoice-header span:nth-child(3), .invoice-row span:nth-child(3) { display:none; }
    .drawer-overlay.open { display:block; }
    .client-grid { grid-template-columns:1fr !important; }
    .messages-layout { grid-template-columns:1fr !important; height:auto !important; }
    .convo-list-panel { max-height:200px; overflow-y:auto; border-right:none !important; border-bottom:1px solid var(--border); }
    .chat-panel { min-height:300px; }
  }

  @media (min-width: 769px) {
    .mobile-nav { display:none !important; }
  }

  /* ── Cards & common ── */
  .btn { padding:8px 16px; border-radius:10px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; transition:all 0.2s; }
  .btn-primary { background:var(--sage-dark); color:white; }
  .btn-primary:hover { background:var(--sage); }
  .btn-outline { background:white; color:var(--text); border:1px solid var(--border); }
  .btn-outline:hover { border-color:var(--sage); color:var(--sage-dark); }
  .btn-sm { padding:5px 11px; font-size:11px; border-radius:8px; }
  .btn-icon { padding:7px 11px; border-radius:9px; background:var(--warm); border:1px solid var(--border); cursor:pointer; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; white-space:nowrap; }
  .btn-icon:hover { border-color:var(--sage); background:white; }

  .card { background:white; border-radius:14px; padding:18px; box-shadow:var(--shadow-sm); border:1px solid var(--border); }
  .card-title { font-family:'Playfair Display',serif; font-size:15px; color:var(--text); font-weight:600; margin-bottom:12px; }
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
  .stat-card { background:white; border-radius:14px; padding:16px; border:1px solid var(--border); box-shadow:var(--shadow-sm); position:relative; overflow:hidden; }
  .stat-card::after { content:attr(data-icon); position:absolute; right:12px; top:12px; font-size:24px; opacity:0.1; }
  .stat-label { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .stat-value { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:var(--text); }
  .stat-sub { font-size:10px; color:var(--sage); margin-top:2px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px; }
  .section-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:600; color:var(--text); }
  .summary-box { background:var(--warm); border-radius:10px; padding:12px; border:1px solid var(--border); }
  .summary-row { display:flex; justify-content:space-between; padding:4px 0; font-size:13px; }
  .summary-row.total { font-weight:700; border-top:1px solid var(--border); padding-top:8px; margin-top:2px; }

  /* ── Jobs / Schedule ── */
  .job-item { display:flex; align-items:flex-start; gap:10px; padding:12px 0; border-bottom:1px solid var(--border); }
  .job-item:last-child { border-bottom:none; }
  .job-time { font-size:11px; color:var(--text-muted); width:46px; flex-shrink:0; font-weight:500; padding-top:2px; }
  .job-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .job-info { flex:1; min-width:0; }
  .job-client { font-size:13px; font-weight:600; color:var(--text); }
  .job-address { font-size:11px; color:var(--text-muted); margin-top:1px; }
  .job-actions { display:flex; gap:5px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end; }
  .job-badge { font-size:10px; padding:2px 8px; border-radius:20px; font-weight:500; flex-shrink:0; }
  .badge-green { background:#e8f5ed; color:#2d7a4f; }
  .badge-blue { background:#e8f0fb; color:#3b5bdb; }
  .badge-orange { background:#fff3e8; color:#d4620a; }
  .badge-red { background:#fde8e8; color:#c0392b; }

  /* ── Checklist ── */
  .checklist-area { display:flex; flex-direction:column; gap:14px; }
  .room-card { background:white; border-radius:12px; border:1px solid var(--border); overflow:hidden; }
  .room-header { padding:12px 14px; display:flex; align-items:center; justify-content:space-between; background:var(--warm); border-bottom:1px solid var(--border); cursor:pointer; }
  .room-name { font-weight:600; font-size:13px; color:var(--text); display:flex; align-items:center; gap:8px; }
  .check-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
  .check-item:last-child { border-bottom:none; }
  .check-item:active { background:#fafaf9; }
  .check-item.done { opacity:0.5; }
  .check-box { width:20px; height:20px; border-radius:6px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .check-box.checked { background:var(--sage); border-color:var(--sage); color:white; font-size:12px; }
  .check-label { font-size:13px; color:var(--text); }
  .check-item.done .check-label { text-decoration:line-through; color:var(--text-muted); }
  .progress-bar { height:4px; background:var(--border); border-radius:2px; }
  .progress-fill { height:100%; background:var(--sage); border-radius:2px; transition:width 0.3s; }

  /* ── Clients ── */
  .client-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  .client-card { background:white; border-radius:12px; border:1px solid var(--border); padding:14px; display:flex; flex-direction:column; gap:7px; cursor:pointer; transition:all 0.2s; }
  .client-card:active { transform:scale(0.98); }
  .client-avatar { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .client-name { font-weight:600; font-size:14px; color:var(--text); }
  .client-detail { font-size:11px; color:var(--text-muted); }
  .client-tags { display:flex; gap:4px; flex-wrap:wrap; }
  .tag { font-size:10px; padding:2px 7px; border-radius:20px; background:var(--warm); color:var(--text-muted); border:1px solid var(--border); }

  /* ── Invoices ── */
  .invoice-header { display:grid; grid-template-columns:auto 1fr auto auto auto auto; gap:8px; padding-bottom:8px; border-bottom:2px solid var(--border); font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); font-weight:600; align-items:center; }
  .invoice-row { display:grid; grid-template-columns:auto 1fr auto auto auto auto; gap:8px; align-items:center; padding:11px 0; border-bottom:1px solid var(--border); font-size:12px; }
  .invoice-row:last-child { border-bottom:none; }

  /* ── Supplies ── */
  .supply-item { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
  .supply-item:last-child { border-bottom:none; }
  .supply-info { display:flex; align-items:center; gap:9px; }
  .supply-icon { font-size:20px; width:30px; text-align:center; }
  .supply-name { font-size:13px; font-weight:500; color:var(--text); }
  .supply-qty { font-size:11px; color:var(--text-muted); }
  .supply-level { display:flex; align-items:center; gap:6px; }
  .level-bar { width:60px; height:4px; background:var(--border); border-radius:2px; }
  .level-fill { height:100%; border-radius:2px; }
  .level-ok { background:var(--sage); } .level-low { background:var(--gold); } .level-critical { background:var(--coral); }

  /* ── Mileage ── */
  .trip-item { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--border); }
  .trip-item:last-child { border-bottom:none; }
  .trip-date { font-size:10px; color:var(--text-muted); font-weight:500; width:42px; flex-shrink:0; }
  .trip-main { flex:1; min-width:0; }
  .trip-route { font-weight:500; color:var(--text); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .trip-sub { font-size:11px; color:var(--text-muted); }
  .trip-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .trip-miles { font-weight:700; color:var(--sage-dark); font-family:'Playfair Display',serif; font-size:15px; }
  .trip-deduction { font-size:10px; color:var(--sage); }

  /* ── Messages ── */
  .messages-layout { display:grid; grid-template-columns:250px 1fr; background:white; border-radius:14px; border:1px solid var(--border); overflow:hidden; height:calc(100vh - 140px); }
  .convo-list-panel { border-right:1px solid var(--border); display:flex; flex-direction:column; }
  .convo-item { display:flex; align-items:center; gap:9px; padding:10px 12px; cursor:pointer; transition:background 0.15s; }
  .convo-item:hover, .convo-item.active { background:var(--warm); }
  .convo-preview { flex:1; min-width:0; }
  .convo-name { font-size:13px; font-weight:600; color:var(--text); }
  .convo-last { font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .convo-time { font-size:10px; color:var(--text-muted); }
  .unread-dot { width:7px; height:7px; border-radius:50%; background:var(--sage); flex-shrink:0; }
  .chat-panel { display:flex; flex-direction:column; }
  .chat-header { padding:12px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:9px; }
  .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:9px; -webkit-overflow-scrolling:touch; }
  .msg { display:flex; gap:7px; max-width:80%; }
  .msg.sent { align-self:flex-end; flex-direction:row-reverse; }
  .msg-bubble { padding:8px 12px; border-radius:14px; font-size:13px; line-height:1.5; }
  .msg.received .msg-bubble { background:var(--warm); color:var(--text); border-bottom-left-radius:3px; }
  .msg.sent .msg-bubble { background:var(--sage-dark); color:white; border-bottom-right-radius:3px; }
  .msg-time { font-size:10px; color:var(--text-muted); align-self:flex-end; padding-bottom:2px; }
  .chat-input { padding:12px 14px; border-top:1px solid var(--border); display:flex; gap:7px; }
  .chat-input input { flex:1; padding:9px 13px; border-radius:22px; border:1px solid var(--border); font-family:'DM Sans',sans-serif; font-size:13px; outline:none; background:var(--warm); }
  .chat-input input:focus { border-color:var(--sage); }

  /* ── Forms / Modals ── */
  .form-group { margin-bottom:12px; }
  .form-label { display:block; font-size:10px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .form-input { width:100%; padding:10px 12px; border:1.5px solid var(--border); border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; background:white; outline:none; color:var(--text); -webkit-appearance:none; }
  .form-input:focus { border-color:var(--sage); box-shadow:0 0 0 3px rgba(122,158,135,0.1); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:flex-end; justify-content:center; z-index:200; backdrop-filter:blur(3px); }
  @media (min-width:769px) { .modal-overlay { align-items:center; } }
  .modal { background:white; border-radius:20px 20px 0 0; padding:24px 20px; width:100%; max-width:460px; max-height:90vh; overflow-y:auto; }
  @media (min-width:769px) { .modal { border-radius:20px; } }
  .modal-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:var(--text); margin-bottom:16px; }
  .modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
`;

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const defaultClients = [
  {id:"c1",name:"Sarah Johnson",address:"123 Maple St",phone:"(555) 234-5678",freq:"Weekly",rate:120,notes:"No bleach. Has 2 cats.",emoji:"🏡",color:"#e8f5ed",tags:["Weekly"]},
  {id:"c2",name:"The Garcias",address:"78 Oak Blvd",phone:"(555) 456-7890",freq:"Weekly",rate:150,notes:"Deep clean kitchen.",emoji:"🏘️",color:"#fff3e8",tags:["Weekly"]},
  {id:"c3",name:"Mike & Trish Davis",address:"45 Elm Ave",phone:"(555) 345-6789",freq:"Bi-weekly",rate:180,notes:"Eco-friendly products.",emoji:"🏠",color:"#e8f0fb",tags:["Bi-weekly"]},
  {id:"c4",name:"Dr. Patel",address:"200 Pine Dr",phone:"(555) 567-8901",freq:"Monthly",rate:220,notes:"Strict about windows.",emoji:"🏢",color:"#fde8f0",tags:["Monthly"]},
];
const defaultJobs = [
  {id:"j1",client:"Sarah Johnson",address:"123 Maple St",time:"8:00 AM",duration:"2h",status:"Completed",color:"#4a7060"},
  {id:"j2",client:"The Garcias",address:"78 Oak Blvd",time:"11:00 AM",duration:"3h",status:"In Progress",color:"#c9a84c"},
  {id:"j3",client:"Mike & Trish Davis",address:"45 Elm Ave",time:"2:30 PM",duration:"2.5h",status:"Upcoming",color:"#3b5bdb"},
  {id:"j4",client:"Dr. Patel",address:"200 Pine Dr",time:"5:00 PM",duration:"3h",status:"Upcoming",color:"#3b5bdb"},
];
const defaultInvoices = [
  {id:"INV-042",client:"Sarah Johnson",date:"Mar 18",amount:120,status:"Paid"},
  {id:"INV-043",client:"The Garcias",date:"Mar 18",amount:150,status:"Paid"},
  {id:"INV-044",client:"Mike & Trish Davis",date:"Mar 15",amount:180,status:"Pending"},
  {id:"INV-045",client:"Dr. Patel",date:"Mar 10",amount:220,status:"Overdue"},
];
const defaultSupplies = [
  {id:"s1",icon:"🧴",name:"All-Purpose Cleaner",qty:"2 bottles",level:0.7,status:"ok"},
  {id:"s2",icon:"🧻",name:"Paper Towels",qty:"1 roll",level:0.15,status:"critical"},
  {id:"s3",icon:"🧹",name:"Microfiber Cloths",qty:"4 cloths",level:0.5,status:"ok"},
  {id:"s4",icon:"🫧",name:"Dish Soap",qty:"Half bottle",level:0.4,status:"low"},
  {id:"s5",icon:"🪣",name:"Mop Pads",qty:"2 pads",level:0.3,status:"low"},
  {id:"s6",icon:"✨",name:"Glass Cleaner",qty:"1 bottle",level:0.6,status:"ok"},
  {id:"s7",icon:"🧽",name:"Scrub Sponges",qty:"0",level:0,status:"critical"},
];
const defaultTrips = [
  {id:"t1",date:"Mar 19",from:"Home",to:"Sarah Johnson",client:"Sarah Johnson",miles:4.2,deduction:2.52},
  {id:"t2",date:"Mar 19",from:"Sarah Johnson",to:"The Garcias",client:"The Garcias",miles:6.8,deduction:4.08},
  {id:"t3",date:"Mar 18",from:"Home",to:"Dr. Patel",client:"Dr. Patel",miles:8.5,deduction:5.10},
];
const defaultRooms = [
  {id:"r1",name:"Kitchen",icon:"🍳",tasks:[{id:1,label:"Wipe countertops",done:true},{id:2,label:"Clean stovetop",done:true},{id:3,label:"Wipe microwave",done:false},{id:4,label:"Clean sink",done:false},{id:5,label:"Mop floor",done:false}]},
  {id:"r2",name:"Living Room",icon:"🛋️",tasks:[{id:1,label:"Dust surfaces",done:true},{id:2,label:"Vacuum sofa",done:false},{id:3,label:"Clean glass",done:false},{id:4,label:"Vacuum floor",done:false}]},
  {id:"r3",name:"Bathrooms",icon:"🚿",tasks:[{id:1,label:"Scrub toilet",done:false},{id:2,label:"Clean sink & mirror",done:false},{id:3,label:"Scrub shower",done:false},{id:4,label:"Mop floor",done:false}]},
  {id:"r4",name:"Bedrooms",icon:"🛏️",tasks:[{id:1,label:"Make beds",done:false},{id:2,label:"Dust furniture",done:false},{id:3,label:"Vacuum floor",done:false}]},
];
const defaultMessages = [
  {id:"m1",client:"Sarah Johnson",emoji:"👩",unread:true,messages:[{sent:false,text:"Hi! Confirming tomorrow 8AM 😊",time:"9:02 AM"},{sent:true,text:"Yes, I'll be there sharp!",time:"9:15 AM"}]},
  {id:"m2",client:"The Garcias",emoji:"👨‍👩‍👧",unread:false,messages:[{sent:false,text:"Can you deep clean the oven?",time:"Yesterday"},{sent:true,text:"Absolutely, will do!",time:"Yesterday"}]},
  {id:"m3",client:"Dr. Patel",emoji:"👨‍⚕️",unread:true,messages:[{sent:false,text:"Can we reschedule to Friday?",time:"Mar 17"},{sent:true,text:"Let me check and get back to you!",time:"Mar 17"}]},
];

function usePersisted(key, def) {
  const [s, setS] = useState(() => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):def; } catch { return def; } });
  useEffect(() => { try { localStorage.setItem(key,JSON.stringify(s)); } catch {} }, [key,s]);
  return [s,setS];
}

const navItems = [
  {id:"dashboard",icon:"📊",group:"main"},
  {id:"schedule",icon:"📅",group:"main"},
  {id:"checklist",icon:"✅",group:"main"},
  {id:"clients",icon:"👥",group:"main"},
  {id:"invoices",icon:"💰",group:"main"},
  {id:"supplies",icon:"🧴",group:"supplies"},
  {id:"order",icon:"🛒",group:"supplies"},
  {id:"mileage",icon:"🚗",group:"finance"},
  {id:"taxes",icon:"🇵🇷",group:"finance"},
  {id:"messages",icon:"💬",group:"comm"},
];
const mobileNavItems = [
  {id:"dashboard",icon:"📊",label:"Home"},
  {id:"schedule",icon:"📅",label:"Schedule"},
  {id:"invoices",icon:"💰",label:"Invoices"},
  {id:"supplies",icon:"🧴",label:"Supplies"},
  {id:"messages",icon:"💬",label:"Messages"},
];

const today = new Date();
const fmtDate = (d,l) => d.toLocaleDateString(l==="es"?"es-ES":"en-US",{weekday:"short",month:"short",day:"numeric"});
const sc = s => s==="Completed"?"green":s==="In Progress"?"orange":"blue";
const sk = s => s==="Completed"?"completed":s==="In Progress"?"inProgress":"upcoming";

// ─── PAGE COMPONENTS ──────────────────────────────────────────────────────────
function Dashboard({jobs,invoices,trips,supplies,t,setPage}) {
  const earned = invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);
  const pending = invoices.filter(i=>i.status!=="Paid").reduce((s,i)=>s+i.amount,0);
  const totalMiles = trips.reduce((s,x)=>s+x.miles,0);
  const low = supplies.filter(s=>s.status!=="ok").length;
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card" data-icon="💰"><div className="stat-label">{t.dashboard.earned}</div><div className="stat-value">${earned}</div><div className="stat-sub">↑ 12%</div></div>
        <div className="stat-card" data-icon="⏳"><div className="stat-label">{t.dashboard.pending}</div><div className="stat-value">${pending}</div><div className="stat-sub">{invoices.filter(i=>i.status!=="Paid").length} {t.dashboard.invoices}</div></div>
        <div className="stat-card" data-icon="🏠"><div className="stat-label">{t.dashboard.todayJobs}</div><div className="stat-value">{jobs.length}</div><div className="stat-sub">{t.dashboard.next}: {jobs[1]?.time}</div></div>
        <div className="stat-card" data-icon="🚗"><div className="stat-label">{t.dashboard.miles}</div><div className="stat-value">{totalMiles.toFixed(1)}</div><div className="stat-sub">${(totalMiles*0.67).toFixed(2)} {t.dashboard.deductible}</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="section-header"><div className="card-title" style={{marginBottom:0}}>{t.dashboard.todaySchedule}</div></div>
          {jobs.slice(0,4).map(j=>(
            <div className="job-item" key={j.id}>
              <div className="job-time">{j.time}</div>
              <div className="job-dot" style={{background:j.color}}></div>
              <div className="job-info"><div className="job-client">{j.client}</div><div className="job-address">{j.address}</div></div>
              <div className={`job-badge badge-${sc(j.status)}`}>{t.status[sk(j.status)]}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="card">
            <div className="card-title">{t.dashboard.quickInvoice}</div>
            <div className="summary-box">
              {invoices.filter(i=>i.status==="Paid").slice(0,2).map(i=>(
                <div key={i.id} className="summary-row"><span>{i.client}</span><span style={{fontWeight:600}}>${i.amount}</span></div>
              ))}
              <div className="summary-row total"><span>{t.dashboard.totalToday}</span><span style={{color:"var(--sage-dark)"}}>${invoices.filter(i=>i.status==="Paid").slice(0,2).reduce((s,i)=>s+i.amount,0)}</span></div>
            </div>
          </div>
          {low>0&&(
            <div className="card" style={{cursor:"pointer"}} onClick={()=>setPage("order")}>
              <div className="card-title">{t.dashboard.lowSupplies}</div>
              {supplies.filter(s=>s.status!=="ok").slice(0,3).map(s=>(
                <div key={s.id} style={{padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:13,display:"flex",gap:8,alignItems:"center"}}>
                  {s.icon} {s.name}
                  <span className={`job-badge badge-${s.status==="critical"?"red":"orange"}`} style={{marginLeft:"auto",fontSize:10}}>{s.status==="critical"?"Out":"Low"}</span>
                </div>
              ))}
              <div style={{marginTop:8,fontSize:12,color:"var(--sage-dark)",fontWeight:600}}>🛒 Tap to order →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Schedule({jobs,setJobs,t}) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState({client:"",address:"",time:"",duration:""});
  const add = async () => {
    if(!form.client) return;
    const j={id:Date.now().toString(),...form,status:"Upcoming",color:"#3b5bdb"};
    setJobs([...jobs,j]);
    try{await supabase.from("jobs").insert([{client:j.client,address:j.address,time:j.time,duration:j.duration,status:"Upcoming",color:"#3b5bdb"}]);}catch{}
    setForm({client:"",address:"",time:"",duration:""});setShow(false);
  };
  const upd = async(id,status)=>{
    const c=status==="Completed"?"#4a7060":status==="In Progress"?"#c9a84c":"#3b5bdb";
    setJobs(jobs.map(j=>j.id===id?{...j,status,color:c}:j));
    try{await supabase.from("jobs").update({status,color:c}).eq("id",id);}catch{}
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.nav.schedule}</div>
        <button className="btn btn-primary" onClick={()=>setShow(true)}>{t.schedule.addJob}</button>
      </div>
      <div className="card">
        {jobs.map(j=>(
          <div className="job-item" key={j.id}>
            <div className="job-time">{j.time}</div>
            <div className="job-dot" style={{background:j.color,marginTop:4}}></div>
            <div className="job-info">
              <div className="job-client">{j.client}</div>
              <div className="job-address">{j.address} · {j.duration}</div>
            </div>
            <div className="job-actions">
              <div className={`job-badge badge-${sc(j.status)}`}>{t.status[sk(j.status)]}</div>
              <button className="btn-icon" onClick={()=>addToCalendar(j)} title="Add to Calendar">{t.schedule.addCalendar}</button>
              {j.address&&<button className="btn-icon" onClick={()=>openMaps("Home",j.address)} title="Open in Maps">{t.schedule.openMaps}</button>}
              <select style={{fontSize:11,border:"1px solid var(--border)",borderRadius:7,padding:"4px 5px",background:"white",color:"var(--text)",maxWidth:90}} value={j.status} onChange={e=>upd(j.id,e.target.value)}>
                <option value="Upcoming">{t.status.upcoming}</option>
                <option value="In Progress">{t.status.inProgress}</option>
                <option value="Completed">{t.status.completed}</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      {show&&(
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.schedule.addNewJob}</div>
            {[[t.schedule.clientName,"client","text"],[t.schedule.address,"address","text"],[t.schedule.time,"time","time"],[t.schedule.duration,"duration","text"]].map(([l,k,tp])=>(
              <div className="form-group" key={k}><label className="form-label">{l}</label><input type={tp} className="form-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShow(false)}>{t.schedule.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.common.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Checklist({rooms,setRooms,t}) {
  const [active,setActive] = useState(null);
  const toggle=(rid,tid)=>setRooms(rooms.map(r=>r.id===rid?{...r,tasks:r.tasks.map(tk=>tk.id===tid?{...tk,done:!tk.done}:tk)}:r));
  const pct=r=>Math.round((r.tasks.filter(x=>x.done).length/r.tasks.length)*100);
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.checklist.client}</div>
        <span style={{fontSize:12,color:"var(--text-muted)"}}>{rooms.reduce((s,r)=>s+r.tasks.filter(x=>x.done).length,0)}/{rooms.reduce((s,r)=>s+r.tasks.length,0)} {t.checklist.tasksDone}</span>
      </div>
      <div className="checklist-area">
        {rooms.map(r=>(
          <div className="room-card" key={r.id}>
            <div className="room-header" onClick={()=>setActive(active===r.id?null:r.id)}>
              <div className="room-name">{r.icon} {r.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div className="progress-bar" style={{width:60}}><div className="progress-fill" style={{width:`${pct(r)}%`}}></div></div>
                <span style={{fontSize:11,color:"var(--text-muted)"}}>{pct(r)}% {active===r.id?"▲":"▼"}</span>
              </div>
            </div>
            {(active===r.id||active===null)&&r.tasks.map(tk=>(
              <div key={tk.id} className={`check-item ${tk.done?"done":""}`} onClick={()=>toggle(r.id,tk.id)}>
                <div className={`check-box ${tk.done?"checked":""}`}>{tk.done?"✓":""}</div>
                <div className="check-label">{tk.label}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Clients({clients,setClients,t}) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState({name:"",address:"",phone:"",freq:t.clients.freqs[0],rate:"",notes:""});
  const emojis=["🏡","🏠","🏘️","🏢","🏬"]; const colors=["#e8f5ed","#e8f0fb","#fff3e8","#fde8f0","#e8f8ff"];
  const add=async()=>{
    if(!form.name) return;
    const idx=clients.length%5;
    const c={id:Date.now().toString(),...form,rate:Number(form.rate),emoji:emojis[idx],color:colors[idx],tags:[form.freq]};
    setClients([...clients,c]);
    try{await supabase.from("clients").insert([{name:c.name,address:c.address,phone:c.phone,freq:c.freq,rate:c.rate,notes:c.notes,emoji:c.emoji,color:c.color,tags:c.tags}]);}catch{}
    setForm({name:"",address:"",phone:"",freq:t.clients.freqs[0],rate:"",notes:""});setShow(false);
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{clients.length} {t.clients.clients}</div>
        <button className="btn btn-primary" onClick={()=>setShow(true)}>{t.clients.addClient}</button>
      </div>
      <div className="client-grid">
        {clients.map(c=>(
          <div className="client-card" key={c.id}>
            <div className="client-avatar" style={{background:c.color}}>{c.emoji}</div>
            <div className="client-name">{c.name}</div>
            <div className="client-detail">📍 {c.address}</div>
            <div className="client-detail">📞 {c.phone}</div>
            <div className="client-detail">💰 ${c.rate}/visit · {c.freq}</div>
            {c.notes&&<div className="client-detail" style={{fontStyle:"italic",fontSize:11}}>💬 {c.notes}</div>}
            <div className="client-tags">{(c.tags||[]).map(tag=><span key={tag} className="tag">{tag}</span>)}</div>
          </div>
        ))}
      </div>
      {show&&(
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.clients.addNew}</div>
            <div className="form-group"><label className="form-label">{t.clients.name}</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">{t.clients.address}</label><input className="form-input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">{t.clients.phone}</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.clients.rate}</label><input type="number" className="form-input" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">{t.clients.freq}</label>
              <select className="form-input" value={form.freq} onChange={e=>setForm({...form,freq:e.target.value})}>
                {t.clients.freqs.map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">{t.clients.notes}</label><input className="form-input" placeholder={t.clients.notesPlaceholder} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShow(false)}>{t.clients.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.common.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Invoices({invoices,setInvoices,t}) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState({client:"",amount:"",date:""});
  const paid=invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);
  const pend=invoices.filter(i=>i.status==="Pending").reduce((s,i)=>s+i.amount,0);
  const over=invoices.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.amount,0);
  const add=async()=>{
    if(!form.client||!form.amount) return;
    const inv={id:`INV-${String(invoices.length+46).padStart(3,"0")}`,client:form.client,date:form.date||"Mar 19",amount:Number(form.amount),status:"Pending"};
    setInvoices([inv,...invoices]);
    try{await supabase.from("invoices").insert([inv]);}catch{}
    setForm({client:"",amount:"",date:""});setShow(false);
  };
  const markPaid=async(id)=>{
    setInvoices(invoices.map(i=>i.id===id?{...i,status:"Paid"}:i));
    try{await supabase.from("invoices").update({status:"Paid"}).eq("id",id);}catch{}
  };
  const bc=s=>s==="Paid"?"badge-green":s==="Pending"?"badge-blue":"badge-red";
  const sl=s=>t.invoices[s==="Paid"?"paid":s==="Pending"?"pending":"overdue"];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {[[t.invoices.paid,"$"+paid,"#4a7060"],[t.invoices.pending,"$"+pend,"#3b5bdb"],[t.invoices.overdue,"$"+over,"#c0392b"]].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:"center",padding:14}}>
            <div style={{fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-header">
          <div className="card-title" style={{marginBottom:0}}>{t.invoices.allInvoices}</div>
          <button className="btn btn-primary btn-sm" onClick={()=>setShow(true)}>{t.invoices.newInvoice}</button>
        </div>
        <div className="invoice-header"><span>#</span><span>{t.invoices.client}</span><span>{t.invoices.date}</span><span>{t.invoices.amount}</span><span>{t.invoices.status}</span><span></span></div>
        {invoices.map(inv=>(
          <div className="invoice-row" key={inv.id}>
            <span style={{fontWeight:600,fontSize:11}}>{inv.id}</span>
            <span style={{fontSize:12,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.client}</span>
            <span style={{fontSize:11,color:"var(--text-muted)"}}>{inv.date}</span>
            <span style={{fontWeight:700,fontFamily:"Playfair Display,serif",fontSize:13}}>${inv.amount}</span>
            <span className={`job-badge ${bc(inv.status)}`}>{sl(inv.status)}</span>
            {inv.status!=="Paid"&&<button className="btn btn-sm" style={{background:"#e8f5ed",color:"#2d7a4f",border:"none",cursor:"pointer",fontSize:10}} onClick={()=>markPaid(inv.id)}>{t.invoices.markPaid}</button>}
          </div>
        ))}
      </div>
      {show&&(
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.invoices.newInvoice}</div>
            <div className="form-group"><label className="form-label">{t.invoices.clientName}</label><input className="form-input" value={form.client} onChange={e=>setForm({...form,client:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">{t.invoices.amount} ($)</label><input type="number" className="form-input" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.invoices.date}</label><input className="form-input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShow(false)}>{t.invoices.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.invoices.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Supplies({supplies,setSupplies,t,setPage}) {
  const sl=s=>t.supplies[s==="ok"?"ok":s==="low"?"low":"out"];
  const restock=async(id)=>{
    setSupplies(supplies.map(s=>s.id===id?{...s,level:1,status:"ok",qty:"Full stock"}:s));
    try{await supabase.from("supplies").update({level:1,status:"ok",qty:"Full stock"}).eq("id",id);}catch{}
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.supplies.inventory}</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setPage("order")}>🛒 {t.supplies.shoppingList}</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">{t.supplies.allSupplies}</div>
          {supplies.map(s=>(
            <div className="supply-item" key={s.id}>
              <div className="supply-info"><div className="supply-icon">{s.icon}</div><div><div className="supply-name">{s.name}</div><div className="supply-qty">{s.qty}</div></div></div>
              <div className="supply-level">
                <div className="level-bar"><div className={`level-fill level-${s.status}`} style={{width:`${s.level*100}%`}}></div></div>
                <span className={`job-badge badge-${s.status==="ok"?"green":s.status==="low"?"orange":"red"}`} style={{fontSize:10}}>{sl(s.status)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">{t.supplies.shoppingList}</div>
          {supplies.filter(s=>s.status!=="ok").map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <span>{s.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{s.name}</div><div style={{fontSize:11,color:"var(--coral)"}}>{s.status==="critical"?t.supplies.outOfStock:t.supplies.runningLow}</div></div>
              <button className="btn btn-sm btn-outline" style={{fontSize:11}} onClick={()=>restock(s.id)}>{t.supplies.gotIt}</button>
              <button className="btn btn-sm" style={{background:"#FF9900",color:"white",border:"none",cursor:"pointer",fontSize:11,borderRadius:8,padding:"5px 9px"}} onClick={()=>setPage("order")}>🛒</button>
            </div>
          ))}
          {supplies.filter(s=>s.status!=="ok").length===0&&<div style={{color:"var(--sage)",fontWeight:500,textAlign:"center",padding:20,fontSize:13}}>{t.supplies.allStocked}</div>}
        </div>
      </div>
    </div>
  );
}

function Mileage({trips,setTrips,t}) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState({from:"",to:"",miles:""});
  const total=trips.reduce((s,x)=>s+x.miles,0);
  const totalDed=trips.reduce((s,x)=>s+x.deduction,0);
  const add=async()=>{
    if(!form.from||!form.miles) return;
    const m=Number(form.miles);
    const trip={id:Date.now().toString(),date:"Mar 19",from:form.from,to:form.to,client:form.to,miles:m,deduction:+(m*0.67).toFixed(2)};
    setTrips([trip,...trips]);
    try{await supabase.from("trips").insert([{from_location:form.from,to_location:form.to,client:form.to,miles:m,deduction:trip.deduction}]);}catch{}
    setForm({from:"",to:"",miles:""});setShow(false);
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.mileage.title}</div>
        <button className="btn btn-primary" onClick={()=>setShow(true)}>{t.mileage.logTrip}</button>
      </div>
      <div className="grid-2" style={{marginBottom:16}}>
        {[[t.mileage.totalMiles,total.toFixed(1)+" mi","🚗"],[t.mileage.taxDeduction,"$"+totalDed.toFixed(2),"💵"]].map(([l,v,i])=>(
          <div key={l} className="card" style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>{i}</div>
            <div><div style={{fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1}}>{l}</div><div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700}}>{v}</div><div style={{fontSize:10,color:"var(--sage)"}}>{t.mileage.irsRate}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">{t.mileage.tripLog}</div>
        {trips.map(trip=>(
          <div className="trip-item" key={trip.id}>
            <div className="trip-date">{trip.date}</div>
            <div className="trip-main">
              <div className="trip-route">{trip.from} → {trip.to}</div>
              <div className="trip-sub">{trip.client}</div>
            </div>
            <div className="trip-right">
              <div style={{textAlign:"right"}}>
                <div className="trip-miles">{trip.miles} mi</div>
                <div className="trip-deduction">${trip.deduction.toFixed(2)} {t.mileage.deduct}</div>
              </div>
              <button className="btn-icon" onClick={()=>openMaps(trip.from,trip.to)} title="Open in Maps" style={{fontSize:16,padding:"6px 10px"}}>{t.mileage.openMaps}</button>
            </div>
          </div>
        ))}
      </div>
      {show&&(
        <div className="modal-overlay" onClick={()=>setShow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.mileage.logTrip}</div>
            <div className="form-group"><label className="form-label">{t.mileage.from}</label><input className="form-input" placeholder="Home" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">{t.mileage.to}</label><input className="form-input" placeholder="Client address" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">{t.mileage.miles}</label><input type="number" className="form-input" value={form.miles} onChange={e=>setForm({...form,miles:e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShow(false)}>{t.mileage.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.mileage.log}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Messages({messages,setMessages,t}) {
  const [active,setActive] = useState(0);
  const [input,setInput] = useState("");
  const convo=messages[active];
  const send=()=>{
    if(!input.trim()) return;
    setMessages(messages.map((m,i)=>i===active?{...m,messages:[...m.messages,{sent:true,text:input,time:"Now"}],unread:false}:m));
    setInput("");
  };
  return (
    <div className="messages-layout">
      <div className="convo-list-panel">
        <div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)"}}><div style={{fontFamily:"Playfair Display,serif",fontSize:14,fontWeight:600}}>{t.messages.messages}</div></div>
        <div style={{flex:1,overflowY:"auto",padding:6}}>
          {messages.map((m,i)=>(
            <div key={m.id} className={`convo-item ${i===active?"active":""}`} onClick={()=>setActive(i)}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{m.emoji}</div>
              <div className="convo-preview"><div className="convo-name">{m.client}</div><div className="convo-last">{m.messages[m.messages.length-1].text}</div></div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <div className="convo-time">{m.messages[m.messages.length-1].time}</div>
                {m.unread&&<div className="unread-dot"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-panel">
        <div className="chat-header">
          <div style={{width:32,height:32,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{convo.emoji}</div>
          <div><div style={{fontWeight:600,fontSize:13}}>{convo.client}</div><div style={{fontSize:11,color:"var(--sage)"}}>{t.messages.active}</div></div>
        </div>
        <div className="chat-messages">
          {convo.messages.map((m,i)=>(
            <div key={i} className={`msg ${m.sent?"sent":"received"}`}>
              {!m.sent&&<div style={{width:24,height:24,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{convo.emoji}</div>}
              <div><div className="msg-bubble">{m.text}</div><div className="msg-time">{m.time}</div></div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder={t.messages.placeholder} onKeyDown={e=>e.key==="Enter"&&send()} />
          <button className="btn btn-primary" onClick={send}>{t.messages.send}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MaidMate() {
  const { user, loading, displayName, avatarUrl, signOut } = useAuth();
  const [lang,setLang]         = usePersisted("mm_lang","en");
  const [page,setPage]         = usePersisted("mm_page","dashboard");
  const [clients,setClients]   = usePersisted("mm_clients",defaultClients);
  const [jobs,setJobs]         = usePersisted("mm_jobs",defaultJobs);
  const [invoices,setInvoices] = usePersisted("mm_invoices",defaultInvoices);
  const [supplies,setSupplies] = usePersisted("mm_supplies",defaultSupplies);
  const [trips,setTrips]       = usePersisted("mm_trips",defaultTrips);
  const [rooms,setRooms]       = usePersisted("mm_rooms",defaultRooms);
  const [messages,setMessages] = usePersisted("mm_messages",defaultMessages);
  const [dbOnline,setDbOnline] = useState(false);
  const [drawerOpen,setDrawer] = useState(false);

  useEffect(()=>{
    supabase.from("clients").select("id").limit(1).then(({error})=>{ if(!error) setDbOnline(true); });
  },[]);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5f2ee",fontFamily:"DM Sans,sans-serif",color:"#888",gap:10}}>
      <span style={{fontSize:28}}>🧹</span> Loading MaidMate…
    </div>
  );

  if (!user) return <Auth />;

  const t = T[lang];
  const unread = messages.filter(m=>m.unread).length;
  const lowCount = supplies.filter(s=>s.status!=="ok").length;

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard jobs={jobs} invoices={invoices} trips={trips} supplies={supplies} t={t} setPage={setPage} />;
      case "schedule":  return <Schedule jobs={jobs} setJobs={setJobs} t={t} />;
      case "checklist": return <Checklist rooms={rooms} setRooms={setRooms} t={t} />;
      case "clients":   return <Clients clients={clients} setClients={setClients} t={t} />;
      case "invoices":  return <Invoices invoices={invoices} setInvoices={setInvoices} t={t} />;
      case "supplies":  return <Supplies supplies={supplies} setSupplies={setSupplies} t={t} setPage={setPage} />;
      case "order":     return <SuppliesOrder supplies={supplies} lang={lang} />;
      case "mileage":   return <Mileage trips={trips} setTrips={setTrips} t={t} />;
      case "taxes":     return <TaxPR invoices={invoices} trips={trips} supplies={supplies} lang={lang} />;
      case "messages":  return <Messages messages={messages} setMessages={setMessages} t={t} />;
      default: return null;
    }
  };

  const groupLabels = {
    main:"",
    supplies:lang==="es"?"Suministros":"Supplies",
    finance:lang==="es"?"Finanzas":"Finance",
    comm:lang==="es"?"Comunicación":"Communication",
  };

  const navigate = (id) => { setPage(id); setDrawer(false); };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Drawer overlay (mobile) */}
        <div className={`drawer-overlay ${drawerOpen?"open":""}`} onClick={()=>setDrawer(false)} />

        {/* Sidebar */}
        <div className={`sidebar ${drawerOpen?"open":""}`}>
          <div className="sidebar-logo">
            <div className="logo-title">🧹 MaidMate</div>
            <div className="logo-sub">{t.appSub}</div>
          </div>
          <nav className="sidebar-nav">
            {["main","supplies","finance","comm"].map(group=>(
              <div key={group}>
                {groupLabels[group]&&<div className="nav-section">{groupLabels[group]}</div>}
                {navItems.filter(n=>n.group===group).map(n=>(
                  <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>navigate(n.id)}>
                    <span className="nav-icon">{n.icon}</span>
                    <span>{t.nav[n.id]}</span>
                    {n.id==="messages"&&unread>0&&<span style={{marginLeft:"auto",background:"var(--coral)",color:"white",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:600}}>{unread}</span>}
                    {n.id==="order"&&lowCount>0&&<span style={{marginLeft:"auto",background:"var(--gold)",color:"white",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:600}}>{lowCount}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : "👩"}
              </div>
              <div>
                <div className="user-name">{displayName}</div>
                <div className="user-role">{t.user.role}</div>
              </div>
            </div>
            <button className="sign-out-btn" onClick={signOut}>
              <span>🚪</span> {t.common.signOut}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={()=>setDrawer(o=>!o)}>☰</button>
              <div>
                <div className="page-title">{t.nav[page]}</div>
                <div className="page-date">{fmtDate(today,lang)}</div>
              </div>
            </div>
            <div className="topbar-right">
              <span className={`db-badge ${dbOnline?"db-online":"db-offline"}`}>
                {dbOnline?"🟢 DB":"🟡 Local"}
              </span>
              <div className="lang-toggle">
                <button className={`lang-btn ${lang==="en"?"active":""}`} onClick={()=>setLang("en")}>EN</button>
                <button className={`lang-btn ${lang==="es"?"active":""}`} onClick={()=>setLang("es")}>ES</button>
              </div>
            </div>
          </div>

          <div className="content">{renderPage()}</div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="mobile-nav">
          <div className="mobile-nav-items">
            {mobileNavItems.map(n=>(
              <button key={n.id} className={`mobile-nav-item ${page===n.id?"active":""}`} onClick={()=>navigate(n.id)}>
                {n.id==="messages"&&unread>0&&<span className="mobile-badge">{unread}</span>}
                {n.id==="supplies"&&lowCount>0&&<span className="mobile-badge">{lowCount}</span>}
                <span className="mobile-nav-icon">{n.icon}</span>
                <span>{t.nav[n.id]}</span>
              </button>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}
