import { useState, useEffect } from "react";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    appSub: "Business Manager",
    nav: { dashboard:"Dashboard", schedule:"Schedule", checklist:"Checklists", clients:"Clients", invoices:"Invoices", supplies:"Supplies", mileage:"Mileage", messages:"Messages" },
    user: { role: "Independent Cleaner" },
    dashboard: { earned:"Earned This Month", pending:"Pending Payments", todayJobs:"Today's Jobs", miles:"Miles This Week", deductible:"deductible", next:"Next", invoices:"invoices", todaySchedule:"Today's Schedule", quickInvoice:"Quick Invoice", totalToday:"Total Today", lowSupplies:"Low Supplies" },
    schedule: { addJob:"+ Add Job", addNewJob:"Add New Job", clientName:"Client Name", address:"Address", time:"Time", duration:"Duration (e.g. 2h)", cancel:"Cancel" },
    checklist: { tasksDone:"tasks done", client:"Cleaning Checklist" },
    clients: { clients:"Clients", addClient:"+ Add Client", addNew:"Add New Client", name:"Name", address:"Address", phone:"Phone", rate:"Rate ($)", freq:"Frequency", notes:"Notes", notesPlaceholder:"Special instructions…", cancel:"Cancel", freqs:["Weekly","Bi-weekly","Monthly","One-time"] },
    invoices: { paid:"Paid", pending:"Pending", overdue:"Overdue", allInvoices:"All Invoices", newInvoice:"+ New Invoice", invoice:"Invoice #", client:"Client", date:"Date", amount:"Amount", status:"Status", markPaid:"Mark Paid", clientName:"Client Name", cancel:"Cancel", create:"Create Invoice" },
    supplies: { inventory:"Supply Inventory", needsRestock:"items need restocking", allSupplies:"All Supplies", shoppingList:"🛒 Shopping List", toRestock:"Items to restock:", outOfStock:"🚨 Out of stock", runningLow:"⚠️ Running low", gotIt:"✓ Got it", allStocked:"✅ All stocked up!", ok:"OK", low:"Low", out:"Out" },
    mileage: { title:"Mileage & Expenses", logTrip:"+ Log Trip", totalMiles:"Total Miles", taxDeduction:"Tax Deduction", irsRate:"@ $0.67/mile IRS rate", tripLog:"Trip Log", from:"From", to:"To (Client)", miles:"Miles", cancel:"Cancel", log:"Log Trip", deduct:"deduct." },
    messages: { messages:"Messages", active:"Active now", send:"Send", placeholder:"Type a message…" },
    status: { completed:"Completed", inProgress:"In Progress", upcoming:"Upcoming" },
    common: { cancel:"Cancel", add:"Add" },
  },
  es: {
    appSub: "Gestión de Negocios",
    nav: { dashboard:"Panel", schedule:"Agenda", checklist:"Listas", clients:"Clientes", invoices:"Facturas", supplies:"Suministros", mileage:"Millaje", messages:"Mensajes" },
    user: { role: "Limpiadora Independiente" },
    dashboard: { earned:"Ganado Este Mes", pending:"Pagos Pendientes", todayJobs:"Trabajos Hoy", miles:"Millas Esta Semana", deductible:"deducible", next:"Próximo", invoices:"facturas", todaySchedule:"Agenda de Hoy", quickInvoice:"Factura Rápida", totalToday:"Total Hoy", lowSupplies:"Suministros Bajos" },
    schedule: { addJob:"+ Agregar Trabajo", addNewJob:"Agregar Nuevo Trabajo", clientName:"Nombre del Cliente", address:"Dirección", time:"Hora", duration:"Duración (ej. 2h)", cancel:"Cancelar" },
    checklist: { tasksDone:"tareas completadas", client:"Lista de Limpieza" },
    clients: { clients:"Clientes", addClient:"+ Agregar Cliente", addNew:"Agregar Nuevo Cliente", name:"Nombre", address:"Dirección", phone:"Teléfono", rate:"Tarifa ($)", freq:"Frecuencia", notes:"Notas", notesPlaceholder:"Instrucciones especiales…", cancel:"Cancelar", freqs:["Semanal","Quincenal","Mensual","Una vez"] },
    invoices: { paid:"Pagado", pending:"Pendiente", overdue:"Vencido", allInvoices:"Todas las Facturas", newInvoice:"+ Nueva Factura", invoice:"Factura #", client:"Cliente", date:"Fecha", amount:"Monto", status:"Estado", markPaid:"Marcar Pagado", clientName:"Nombre del Cliente", cancel:"Cancelar", create:"Crear Factura" },
    supplies: { inventory:"Inventario de Suministros", needsRestock:"artículos necesitan reposición", allSupplies:"Todos los Suministros", shoppingList:"🛒 Lista de Compras", toRestock:"Artículos a reponer:", outOfStock:"🚨 Sin stock", runningLow:"⚠️ Stock bajo", gotIt:"✓ Listo", allStocked:"✅ ¡Todo abastecido!", ok:"OK", low:"Bajo", out:"Agotado" },
    mileage: { title:"Millaje y Gastos", logTrip:"+ Registrar Viaje", totalMiles:"Millas Totales", taxDeduction:"Deducción Fiscal", irsRate:"@ $0.67/milla tasa IRS", tripLog:"Registro de Viajes", from:"Desde", to:"Hasta (Cliente)", miles:"Millas", cancel:"Cancelar", log:"Registrar Viaje", deduct:"deducible" },
    messages: { messages:"Mensajes", active:"Activo ahora", send:"Enviar", placeholder:"Escribe un mensaje…" },
    status: { completed:"Completado", inProgress:"En Progreso", upcoming:"Próximo" },
    common: { cancel:"Cancelar", add:"Agregar" },
  }
};

const styles = `
  ${GOOGLE_FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f2ee; }
  :root { --sage:#7a9e87; --sage-light:#b8d4c0; --sage-dark:#4a7060; --cream:#faf8f4; --warm:#f5f2ee; --coral:#e07a5f; --gold:#c9a84c; --text:#2c2c2c; --text-muted:#888; --border:#e8e4de; --shadow:0 4px 24px rgba(0,0,0,0.08); --shadow-sm:0 2px 8px rgba(0,0,0,0.06); }
  .app { display:flex; height:100vh; overflow:hidden; background:var(--warm); }
  .sidebar { width:240px; background:var(--sage-dark); display:flex; flex-direction:column; flex-shrink:0; position:relative; overflow:hidden; }
  .sidebar::before { content:''; position:absolute; bottom:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.04); pointer-events:none; }
  .sidebar-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(255,255,255,0.1); }
  .logo-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:white; letter-spacing:-0.5px; }
  .logo-sub { font-size:11px; color:var(--sage-light); letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
  .sidebar-nav { padding:16px 12px; flex:1; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; margin-bottom:2px; transition:all 0.2s; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; }
  .nav-item:hover { background:rgba(255,255,255,0.08); color:white; }
  .nav-item.active { background:rgba(255,255,255,0.15); color:white; }
  .nav-icon { font-size:18px; width:22px; text-align:center; }
  .sidebar-footer { padding:20px 24px; border-top:1px solid rgba(255,255,255,0.1); }
  .user-badge { display:flex; align-items:center; gap:10px; }
  .avatar { width:36px; height:36px; border-radius:50%; background:var(--sage-light); display:flex; align-items:center; justify-content:center; font-size:16px; }
  .user-name { font-size:13px; color:white; font-weight:500; }
  .user-role { font-size:11px; color:var(--sage-light); }
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .topbar { padding:20px 32px; display:flex; align-items:center; justify-content:space-between; background:var(--cream); border-bottom:1px solid var(--border); flex-shrink:0; }
  .page-title { font-family:'Playfair Display',serif; font-size:24px; color:var(--text); font-weight:600; }
  .page-date { font-size:13px; color:var(--text-muted); }
  .lang-toggle { display:flex; background:var(--warm); border:1px solid var(--border); border-radius:20px; overflow:hidden; }
  .lang-btn { padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--text-muted); font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .lang-btn.active { background:var(--sage-dark); color:white; border-radius:20px; }
  .btn { padding:9px 18px; border-radius:10px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; transition:all 0.2s; }
  .btn-primary { background:var(--sage-dark); color:white; }
  .btn-primary:hover { background:var(--sage); transform:translateY(-1px); }
  .btn-outline { background:white; color:var(--text); border:1px solid var(--border); }
  .btn-outline:hover { border-color:var(--sage); color:var(--sage-dark); }
  .btn-sm { padding:6px 12px; font-size:12px; }
  .content { flex:1; overflow-y:auto; padding:28px 32px; }
  .card { background:white; border-radius:16px; padding:22px; box-shadow:var(--shadow-sm); border:1px solid var(--border); }
  .card-title { font-family:'Playfair Display',serif; font-size:16px; color:var(--text); font-weight:600; margin-bottom:16px; }
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .stat-card { background:white; border-radius:16px; padding:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm); position:relative; overflow:hidden; }
  .stat-card::after { content:attr(data-icon); position:absolute; right:16px; top:16px; font-size:28px; opacity:0.15; }
  .stat-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .stat-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--text); }
  .stat-sub { font-size:12px; color:var(--sage); margin-top:4px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .job-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); transition:all 0.15s; }
  .job-item:last-child { border-bottom:none; }
  .job-item:hover { transform:translateX(4px); }
  .job-time { font-size:12px; color:var(--text-muted); width:52px; flex-shrink:0; font-weight:500; }
  .job-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .job-info { flex:1; }
  .job-client { font-size:14px; font-weight:600; color:var(--text); }
  .job-address { font-size:12px; color:var(--text-muted); margin-top:1px; }
  .job-badge { font-size:11px; padding:3px 10px; border-radius:20px; font-weight:500; flex-shrink:0; }
  .badge-green { background:#e8f5ed; color:#2d7a4f; } .badge-blue { background:#e8f0fb; color:#3b5bdb; } .badge-orange { background:#fff3e8; color:#d4620a; } .badge-red { background:#fde8e8; color:#c0392b; }
  .checklist-area { display:flex; flex-direction:column; gap:20px; }
  .room-card { background:white; border-radius:14px; border:1px solid var(--border); overflow:hidden; }
  .room-header { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; background:var(--warm); border-bottom:1px solid var(--border); cursor:pointer; }
  .room-name { font-weight:600; font-size:14px; color:var(--text); display:flex; align-items:center; gap:8px; }
  .check-item { display:flex; align-items:center; gap:12px; padding:11px 18px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
  .check-item:last-child { border-bottom:none; }
  .check-item:hover { background:#fafaf9; }
  .check-item.done { opacity:0.5; }
  .check-box { width:20px; height:20px; border-radius:6px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .check-box.checked { background:var(--sage); border-color:var(--sage); color:white; font-size:12px; }
  .check-label { font-size:14px; color:var(--text); }
  .check-item.done .check-label { text-decoration:line-through; color:var(--text-muted); }
  .progress-bar { height:4px; background:var(--border); border-radius:2px; }
  .progress-fill { height:100%; background:var(--sage); border-radius:2px; transition:width 0.3s; }
  .client-card { background:white; border-radius:14px; border:1px solid var(--border); padding:18px; display:flex; flex-direction:column; gap:10px; cursor:pointer; transition:all 0.2s; }
  .client-card:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
  .client-avatar { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; }
  .client-name { font-weight:600; font-size:15px; color:var(--text); }
  .client-detail { font-size:12px; color:var(--text-muted); }
  .client-tags { display:flex; gap:6px; flex-wrap:wrap; }
  .tag { font-size:11px; padding:3px 9px; border-radius:20px; background:var(--warm); color:var(--text-muted); border:1px solid var(--border); }
  .invoice-row { display:grid; grid-template-columns:1fr 1fr auto auto auto; gap:12px; align-items:center; padding:14px 0; border-bottom:1px solid var(--border); font-size:14px; }
  .invoice-row:last-child { border-bottom:none; }
  .invoice-header { display:grid; grid-template-columns:1fr 1fr auto auto auto; gap:12px; padding-bottom:10px; border-bottom:2px solid var(--border); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); font-weight:600; }
  .supply-item { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
  .supply-item:last-child { border-bottom:none; }
  .supply-info { display:flex; align-items:center; gap:12px; }
  .supply-icon { font-size:22px; width:36px; text-align:center; }
  .supply-name { font-size:14px; font-weight:500; color:var(--text); }
  .supply-qty { font-size:12px; color:var(--text-muted); }
  .supply-level { display:flex; align-items:center; gap:8px; }
  .level-bar { width:80px; height:6px; background:var(--border); border-radius:3px; }
  .level-fill { height:100%; border-radius:3px; }
  .level-ok { background:var(--sage); } .level-low { background:var(--gold); } .level-critical { background:var(--coral); }
  .trip-item { display:grid; grid-template-columns:auto 1fr auto; gap:16px; align-items:center; padding:12px 0; border-bottom:1px solid var(--border); font-size:14px; }
  .trip-item:last-child { border-bottom:none; }
  .trip-date { font-size:12px; color:var(--text-muted); font-weight:500; }
  .trip-route { font-weight:500; color:var(--text); }
  .trip-sub { font-size:12px; color:var(--text-muted); }
  .trip-miles { font-weight:700; color:var(--sage-dark); font-family:'Playfair Display',serif; }
  .trip-deduction { font-size:12px; color:var(--sage); }
  .convo-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; cursor:pointer; transition:background 0.15s; }
  .convo-item:hover, .convo-item.active { background:var(--warm); }
  .convo-preview { flex:1; min-width:0; }
  .convo-name { font-size:14px; font-weight:600; color:var(--text); }
  .convo-last { font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .convo-time { font-size:11px; color:var(--text-muted); }
  .unread-dot { width:8px; height:8px; border-radius:50%; background:var(--sage); }
  .chat-area { display:flex; flex-direction:column; height:100%; }
  .chat-header { padding:16px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; }
  .chat-messages { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; }
  .msg { display:flex; gap:10px; max-width:80%; }
  .msg.sent { align-self:flex-end; flex-direction:row-reverse; }
  .msg-bubble { padding:10px 14px; border-radius:16px; font-size:14px; line-height:1.5; }
  .msg.received .msg-bubble { background:var(--warm); color:var(--text); border-bottom-left-radius:4px; }
  .msg.sent .msg-bubble { background:var(--sage-dark); color:white; border-bottom-right-radius:4px; }
  .msg-time { font-size:11px; color:var(--text-muted); align-self:flex-end; padding-bottom:4px; }
  .chat-input { padding:16px 20px; border-top:1px solid var(--border); display:flex; gap:10px; }
  .chat-input input { flex:1; padding:10px 16px; border-radius:24px; border:1px solid var(--border); font-family:'DM Sans',sans-serif; font-size:14px; outline:none; background:var(--warm); }
  .chat-input input:focus { border-color:var(--sage); }
  .form-group { margin-bottom:14px; }
  .form-label { display:block; font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .form-input { width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; background:white; outline:none; color:var(--text); }
  .form-input:focus { border-color:var(--sage); box-shadow:0 0 0 3px rgba(122,158,135,0.1); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:100; backdrop-filter:blur(4px); }
  .modal { background:white; border-radius:20px; padding:28px; width:480px; max-height:80vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
  .modal-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:var(--text); margin-bottom:20px; }
  .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .section-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:600; color:var(--text); }
  .summary-box { background:var(--warm); border-radius:12px; padding:16px; border:1px solid var(--border); }
  .summary-row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; }
  .summary-row.total { font-weight:700; border-top:1px solid var(--border); padding-top:12px; margin-top:4px; }
`;

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const defaultClients = [
  { id:1, name:"Sarah Johnson", address:"123 Maple St, Apt 4B", phone:"(555) 234-5678", freq:"Weekly", rate:120, notes:"Allergic to bleach. Has 2 cats.", emoji:"🏡", color:"#e8f5ed", tags:["Weekly","No bleach"] },
  { id:2, name:"Mike & Trish Davis", address:"45 Elm Ave", phone:"(555) 345-6789", freq:"Bi-weekly", rate:180, notes:"Prefer eco-friendly products.", emoji:"🏠", color:"#e8f0fb", tags:["Bi-weekly","Eco-friendly"] },
  { id:3, name:"The Garcias", address:"78 Oak Blvd", phone:"(555) 456-7890", freq:"Weekly", rate:150, notes:"Deep clean kitchen every visit.", emoji:"🏘️", color:"#fff3e8", tags:["Weekly","Deep clean"] },
  { id:4, name:"Dr. Patel", address:"200 Pine Dr", phone:"(555) 567-8901", freq:"Monthly", rate:220, notes:"Particular about window streaks.", emoji:"🏢", color:"#fde8f0", tags:["Monthly","Premium"] },
];
const defaultJobs = [
  { id:1, client:"Sarah Johnson", address:"123 Maple St", time:"8:00 AM", duration:"2h", status:"Completed", color:"#4a7060" },
  { id:2, client:"The Garcias", address:"78 Oak Blvd", time:"11:00 AM", duration:"3h", status:"In Progress", color:"#c9a84c" },
  { id:3, client:"Mike & Trish Davis", address:"45 Elm Ave", time:"2:30 PM", duration:"2.5h", status:"Upcoming", color:"#3b5bdb" },
  { id:4, client:"Dr. Patel", address:"200 Pine Dr", time:"5:00 PM", duration:"3h", status:"Upcoming", color:"#3b5bdb" },
];
const defaultInvoices = [
  { id:"INV-042", client:"Sarah Johnson", date:"Mar 18", amount:120, status:"Paid" },
  { id:"INV-043", client:"The Garcias", date:"Mar 18", amount:150, status:"Paid" },
  { id:"INV-044", client:"Mike & Trish Davis", date:"Mar 15", amount:180, status:"Pending" },
  { id:"INV-045", client:"Dr. Patel", date:"Mar 10", amount:220, status:"Overdue" },
  { id:"INV-041", client:"Sarah Johnson", date:"Mar 11", amount:120, status:"Paid" },
];
const defaultSupplies = [
  { id:1, icon:"🧴", name:"All-Purpose Cleaner", qty:"2 bottles", level:0.7, status:"ok" },
  { id:2, icon:"🧻", name:"Paper Towels", qty:"1 roll", level:0.15, status:"critical" },
  { id:3, icon:"🧹", name:"Microfiber Cloths", qty:"4 cloths", level:0.5, status:"ok" },
  { id:4, icon:"🫧", name:"Dish Soap", qty:"Half bottle", level:0.4, status:"low" },
  { id:5, icon:"🪣", name:"Mop Pads", qty:"2 pads", level:0.3, status:"low" },
  { id:6, icon:"✨", name:"Glass Cleaner", qty:"1 bottle", level:0.6, status:"ok" },
  { id:7, icon:"🧽", name:"Scrub Sponges", qty:"0 sponges", level:0, status:"critical" },
];
const defaultTrips = [
  { id:1, date:"Mar 19", from:"Home", to:"Sarah Johnson", client:"Sarah Johnson", miles:4.2, deduction:2.52 },
  { id:2, date:"Mar 19", from:"Sarah Johnson", to:"The Garcias", client:"The Garcias", miles:6.8, deduction:4.08 },
  { id:3, date:"Mar 18", from:"Home", to:"Davis Residence", client:"Davis", miles:3.1, deduction:1.86 },
  { id:4, date:"Mar 17", from:"Home", to:"Dr. Patel", client:"Dr. Patel", miles:8.5, deduction:5.10 },
];
const defaultRooms = [
  { id:1, name:"Kitchen", icon:"🍳", tasks:[{id:1,label:"Wipe countertops",done:true},{id:2,label:"Clean stovetop & burners",done:true},{id:3,label:"Wipe microwave inside/out",done:false},{id:4,label:"Clean sink & faucet",done:false},{id:5,label:"Mop floor",done:false}] },
  { id:2, name:"Living Room", icon:"🛋️", tasks:[{id:1,label:"Dust all surfaces",done:true},{id:2,label:"Vacuum sofa & cushions",done:true},{id:3,label:"Clean glass surfaces",done:true},{id:4,label:"Vacuum carpet/floors",done:false}] },
  { id:3, name:"Bathrooms", icon:"🚿", tasks:[{id:1,label:"Scrub toilet inside & out",done:false},{id:2,label:"Clean sink & mirror",done:false},{id:3,label:"Scrub shower/tub",done:false},{id:4,label:"Mop floor",done:false},{id:5,label:"Replace towels",done:false}] },
  { id:4, name:"Bedrooms", icon:"🛏️", tasks:[{id:1,label:"Make beds / change sheets",done:false},{id:2,label:"Dust furniture & shelves",done:false},{id:3,label:"Vacuum floor",done:false}] },
];
const defaultMessages = [
  { id:1, client:"Sarah Johnson", emoji:"👩", unread:true, messages:[{sent:false,text:"Hi! Just wanted to confirm for tomorrow morning 😊",time:"9:02 AM"},{sent:true,text:"Hi Sarah! Yes, I'll be there at 8 AM sharp.",time:"9:15 AM"},{sent:false,text:"Perfect, thank you! 🙏",time:"9:16 AM"}] },
  { id:2, client:"The Garcias", emoji:"👨‍👩‍👧", unread:false, messages:[{sent:false,text:"Can you do a deep clean of the oven this week?",time:"Yesterday"},{sent:true,text:"Absolutely! I'll bring the oven cleaner.",time:"Yesterday"}] },
  { id:3, client:"Dr. Patel", emoji:"👨‍⚕️", unread:true, messages:[{sent:false,text:"Is it possible to reschedule to next Friday?",time:"Mar 17"},{sent:true,text:"Let me check my schedule and get back to you!",time:"Mar 17"}] },
];

// ─── PERSISTENCE HOOK ─────────────────────────────────────────────────────────
function usePersisted(key, defaultValue) {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultValue; }
    catch { return defaultValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

const navItems = [
  {id:"dashboard",icon:"📊"},{id:"schedule",icon:"📅"},{id:"checklist",icon:"✅"},
  {id:"clients",icon:"👥"},{id:"invoices",icon:"💰"},{id:"supplies",icon:"🧴"},
  {id:"mileage",icon:"🚗"},{id:"messages",icon:"💬"},
];

const today = new Date();
const fmtDate = (d, lang) => d.toLocaleDateString(lang==="es"?"es-ES":"en-US",{weekday:"long",month:"long",day:"numeric"});
const statusColor = s => s==="Completed"?"green":s==="In Progress"?"orange":"blue";

// ─── PAGE COMPONENTS ──────────────────────────────────────────────────────────
function Dashboard({ jobs, invoices, trips, t }) {
  const earned = invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);
  const pending = invoices.filter(i=>i.status!=="Paid").reduce((s,i)=>s+i.amount,0);
  const totalMiles = trips.reduce((s,x)=>s+x.miles,0);
  const sKey = s => s==="Completed"?"completed":s==="In Progress"?"inProgress":"upcoming";
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
          {jobs.map(j=>(
            <div className="job-item" key={j.id}>
              <div className="job-time">{j.time}</div>
              <div className="job-dot" style={{background:j.color}}></div>
              <div className="job-info"><div className="job-client">{j.client}</div><div className="job-address">{j.address} · {j.duration}</div></div>
              <div className={`job-badge badge-${statusColor(j.status)}`}>{t.status[sKey(j.status)]}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card" style={{flex:1}}>
            <div className="card-title">{t.dashboard.quickInvoice}</div>
            <div className="summary-box">
              {[["Sarah Johnson",120],["The Garcias",150]].map(([n,a])=>(
                <div key={n} className="summary-row"><span>{n}</span><span style={{fontWeight:600}}>${a}</span></div>
              ))}
              <div className="summary-row total"><span>{t.dashboard.totalToday}</span><span style={{color:"var(--sage-dark)"}}>$270</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">⚠️ {t.dashboard.lowSupplies}</div>
            {["🧻 Paper Towels","🧽 Scrub Sponges","🫧 Dish Soap"].map(s=>(
              <div key={s} style={{padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:14}}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Schedule({ jobs, setJobs, t }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({client:"",address:"",time:"",duration:""});
  const sKey = s => s==="Completed"?"completed":s==="In Progress"?"inProgress":"upcoming";
  const addJob = () => {
    if (!form.client) return;
    setJobs([...jobs,{id:Date.now(),...form,status:"Upcoming",color:"#3b5bdb"}]);
    setForm({client:"",address:"",time:"",duration:""});
    setShowModal(false);
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.nav.schedule}</div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>{t.schedule.addJob}</button>
      </div>
      <div className="card">
        {jobs.map(j=>(
          <div className="job-item" key={j.id}>
            <div className="job-time">{j.time}</div>
            <div className="job-dot" style={{background:j.color}}></div>
            <div className="job-info"><div className="job-client">{j.client}</div><div className="job-address">{j.address} · {j.duration}</div></div>
            <div className={`job-badge badge-${statusColor(j.status)}`}>{t.status[sKey(j.status)]}</div>
            <select style={{fontSize:12,border:"1px solid var(--border)",borderRadius:6,padding:"4px 6px",background:"white",color:"var(--text)"}}
              value={j.status} onChange={e=>setJobs(jobs.map(x=>x.id===j.id?{...x,status:e.target.value,color:e.target.value==="Completed"?"#4a7060":e.target.value==="In Progress"?"#c9a84c":"#3b5bdb"}:x))}>
              <option value="Upcoming">{t.status.upcoming}</option>
              <option value="In Progress">{t.status.inProgress}</option>
              <option value="Completed">{t.status.completed}</option>
            </select>
          </div>
        ))}
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.schedule.addNewJob}</div>
            {[[t.schedule.clientName,"client","text"],[t.schedule.address,"address","text"],[t.schedule.time,"time","time"],[t.schedule.duration,"duration","text"]].map(([l,k,tp])=>(
              <div className="form-group" key={k}><label className="form-label">{l}</label><input type={tp} className="form-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>{t.schedule.cancel}</button>
              <button className="btn btn-primary" onClick={addJob}>{t.common.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Checklist({ rooms, setRooms, t }) {
  const [active, setActive] = useState(null);
  const toggle = (rid,tid) => setRooms(rooms.map(r=>r.id===rid?{...r,tasks:r.tasks.map(tk=>tk.id===tid?{...tk,done:!tk.done}:tk)}:r));
  const pct = r => Math.round((r.tasks.filter(x=>x.done).length/r.tasks.length)*100);
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.checklist.client} · The Garcias</div>
        <span style={{fontSize:13,color:"var(--text-muted)"}}>{rooms.reduce((s,r)=>s+r.tasks.filter(x=>x.done).length,0)} / {rooms.reduce((s,r)=>s+r.tasks.length,0)} {t.checklist.tasksDone}</span>
      </div>
      <div className="checklist-area">
        {rooms.map(r=>(
          <div className="room-card" key={r.id}>
            <div className="room-header" onClick={()=>setActive(active===r.id?null:r.id)}>
              <div className="room-name">{r.icon} {r.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="progress-bar" style={{width:80}}><div className="progress-fill" style={{width:`${pct(r)}%`}}></div></div>
                <span style={{fontSize:12,color:"var(--text-muted)"}}>{pct(r)}% {active===r.id?"▲":"▼"}</span>
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

function Clients({ clients, setClients, t }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({name:"",address:"",phone:"",freq:t.clients.freqs[0],rate:"",notes:""});
  const emojis=["🏡","🏠","🏘️","🏢","🏬"];
  const colors=["#e8f5ed","#e8f0fb","#fff3e8","#fde8f0","#e8f8ff"];
  const add = () => {
    if (!form.name) return;
    const idx=clients.length%5;
    setClients([...clients,{id:Date.now(),...form,rate:Number(form.rate),emoji:emojis[idx],color:colors[idx],tags:[form.freq]}]);
    setForm({name:"",address:"",phone:"",freq:t.clients.freqs[0],rate:"",notes:""});
    setShowModal(false);
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{clients.length} {t.clients.clients}</div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>{t.clients.addClient}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {clients.map(c=>(
          <div className="client-card" key={c.id}>
            <div className="client-avatar" style={{background:c.color}}>{c.emoji}</div>
            <div className="client-name">{c.name}</div>
            <div className="client-detail">📍 {c.address}</div>
            <div className="client-detail">📞 {c.phone}</div>
            <div className="client-detail">💰 ${c.rate}/visit · {c.freq}</div>
            {c.notes&&<div className="client-detail" style={{fontStyle:"italic"}}>💬 {c.notes}</div>}
            <div className="client-tags">{c.tags.map(tag=><span key={tag} className="tag">{tag}</span>)}</div>
          </div>
        ))}
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
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
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>{t.clients.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.common.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Invoices({ invoices, setInvoices, t }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({client:"",amount:"",date:""});
  const paid=invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);
  const pending=invoices.filter(i=>i.status==="Pending").reduce((s,i)=>s+i.amount,0);
  const overdue=invoices.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.amount,0);
  const add = () => {
    if (!form.client||!form.amount) return;
    setInvoices([{id:`INV-${String(invoices.length+46).padStart(3,"0")}`,client:form.client,date:form.date||"Mar 19",amount:Number(form.amount),status:"Pending"},...invoices]);
    setForm({client:"",amount:"",date:""});
    setShowModal(false);
  };
  const bClass = s => s==="Paid"?"badge-green":s==="Pending"?"badge-blue":"badge-red";
  const sLabel = s => t.invoices[s==="Paid"?"paid":s==="Pending"?"pending":"overdue"];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[[t.invoices.paid,"$"+paid,"#4a7060"],[t.invoices.pending,"$"+pending,"#3b5bdb"],[t.invoices.overdue,"$"+overdue,"#c0392b"]].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-header">
          <div className="card-title" style={{marginBottom:0}}>{t.invoices.allInvoices}</div>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>{t.invoices.newInvoice}</button>
        </div>
        <div className="invoice-header"><span>{t.invoices.invoice}</span><span>{t.invoices.client}</span><span>{t.invoices.date}</span><span>{t.invoices.amount}</span><span>{t.invoices.status}</span></div>
        {invoices.map(inv=>(
          <div className="invoice-row" key={inv.id}>
            <div style={{fontWeight:600}}>{inv.id}</div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>{inv.client}</div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>{inv.date}</div>
            <div style={{fontWeight:700,fontFamily:"Playfair Display,serif"}}>${inv.amount}</div>
            <span className={`job-badge ${bClass(inv.status)}`}>{sLabel(inv.status)}</span>
            {inv.status!=="Paid"&&<button className="btn btn-sm" style={{background:"#e8f5ed",color:"#2d7a4f",border:"none",cursor:"pointer"}} onClick={()=>setInvoices(invoices.map(i=>i.id===inv.id?{...i,status:"Paid"}:i))}>{t.invoices.markPaid}</button>}
          </div>
        ))}
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.invoices.newInvoice}</div>
            <div className="form-group"><label className="form-label">{t.invoices.clientName}</label><input className="form-input" value={form.client} onChange={e=>setForm({...form,client:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">{t.invoices.amount} ($)</label><input type="number" className="form-input" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.invoices.date}</label><input className="form-input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>{t.invoices.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.invoices.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Supplies({ supplies, setSupplies, t }) {
  const sLabel = s => t.supplies[s==="ok"?"ok":s==="low"?"low":"out"];
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.supplies.inventory}</div>
        <span style={{fontSize:13,color:"var(--coral)"}}>⚠️ {supplies.filter(s=>s.status!=="ok").length} {t.supplies.needsRestock}</span>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">{t.supplies.allSupplies}</div>
          {supplies.map(s=>(
            <div className="supply-item" key={s.id}>
              <div className="supply-info"><div className="supply-icon">{s.icon}</div><div><div className="supply-name">{s.name}</div><div className="supply-qty">{s.qty}</div></div></div>
              <div className="supply-level">
                <div className="level-bar"><div className={`level-fill level-${s.status}`} style={{width:`${s.level*100}%`}}></div></div>
                <span className={`job-badge badge-${s.status==="ok"?"green":s.status==="low"?"orange":"red"}`}>{sLabel(s.status)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">{t.supplies.shoppingList}</div>
          <div style={{fontSize:13,color:"var(--text-muted)",marginBottom:12}}>{t.supplies.toRestock}</div>
          {supplies.filter(s=>s.status!=="ok").map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <span>{s.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{s.name}</div><div style={{fontSize:12,color:"var(--coral)"}}>{s.status==="critical"?t.supplies.outOfStock:t.supplies.runningLow}</div></div>
              <button className="btn btn-sm btn-outline" onClick={()=>setSupplies(supplies.map(x=>x.id===s.id?{...x,level:1,status:"ok",qty:"Full stock"}:x))}>{t.supplies.gotIt}</button>
            </div>
          ))}
          {supplies.filter(s=>s.status!=="ok").length===0&&<div style={{color:"var(--sage)",fontWeight:500,textAlign:"center",padding:20}}>{t.supplies.allStocked}</div>}
        </div>
      </div>
    </div>
  );
}

function Mileage({ trips, setTrips, t }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({from:"",to:"",miles:"",client:""});
  const totalMiles=trips.reduce((s,x)=>s+x.miles,0);
  const totalDeduction=trips.reduce((s,x)=>s+x.deduction,0);
  const add = () => {
    if (!form.from||!form.miles) return;
    const m=Number(form.miles);
    setTrips([{id:Date.now(),date:"Mar 19",...form,miles:m,deduction:+(m*0.67).toFixed(2)},...trips]);
    setForm({from:"",to:"",miles:"",client:""});
    setShowModal(false);
  };
  return (
    <div>
      <div className="section-header">
        <div className="section-title">{t.mileage.title}</div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>{t.mileage.logTrip}</button>
      </div>
      <div className="grid-2" style={{marginBottom:20}}>
        {[[t.mileage.totalMiles,totalMiles.toFixed(1)+"mi","🚗"],[t.mileage.taxDeduction,"$"+totalDeduction.toFixed(2),"💵"]].map(([l,v,i])=>(
          <div key={l} className="card" style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontSize:32}}>{i}</div>
            <div><div style={{fontSize:12,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1}}>{l}</div><div style={{fontFamily:"Playfair Display,serif",fontSize:26,fontWeight:700}}>{v}</div><div style={{fontSize:12,color:"var(--sage)"}}>{t.mileage.irsRate}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">{t.mileage.tripLog}</div>
        {trips.map(trip=>(
          <div className="trip-item" key={trip.id}>
            <div className="trip-date">{trip.date}</div>
            <div><div className="trip-route">{trip.from} → {trip.to}</div><div className="trip-sub">{trip.client}</div></div>
            <div><div className="trip-miles">{trip.miles} mi</div><div className="trip-deduction">${trip.deduction.toFixed(2)} {t.mileage.deduct}</div></div>
          </div>
        ))}
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{t.mileage.logTrip}</div>
            <div className="form-group"><label className="form-label">{t.mileage.from}</label><input className="form-input" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">{t.mileage.to}</label><input className="form-input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">{t.mileage.miles}</label><input type="number" className="form-input" value={form.miles} onChange={e=>setForm({...form,miles:e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>{t.mileage.cancel}</button>
              <button className="btn btn-primary" onClick={add}>{t.mileage.log}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Messages({ messages, setMessages, t }) {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState("");
  const convo = messages[active];
  const send = () => {
    if (!input.trim()) return;
    setMessages(messages.map((m,i)=>i===active?{...m,messages:[...m.messages,{sent:true,text:input,time:"Now"}],unread:false}:m));
    setInput("");
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",background:"white",borderRadius:16,border:"1px solid var(--border)",overflow:"hidden",height:"calc(100vh - 160px)"}}>
      <div style={{borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}><div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:600}}>{t.messages.messages}</div></div>
        <div style={{flex:1,overflowY:"auto",padding:8}}>
          {messages.map((m,i)=>(
            <div key={m.id} className={`convo-item ${i===active?"active":""}`} onClick={()=>setActive(i)}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{m.emoji}</div>
              <div className="convo-preview"><div className="convo-name">{m.client}</div><div className="convo-last">{m.messages[m.messages.length-1].text}</div></div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div className="convo-time">{m.messages[m.messages.length-1].time}</div>
                {m.unread&&<div className="unread-dot"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        <div className="chat-header">
          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{convo.emoji}</div>
          <div><div style={{fontWeight:600,fontSize:14}}>{convo.client}</div><div style={{fontSize:12,color:"var(--sage)"}}>{t.messages.active}</div></div>
        </div>
        <div className="chat-messages">
          {convo.messages.map((m,i)=>(
            <div key={i} className={`msg ${m.sent?"sent":"received"}`}>
              {!m.sent&&<div style={{width:28,height:28,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{convo.emoji}</div>}
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
  const [lang, setLang] = usePersisted("mm_lang", "en");
  const [page, setPage] = usePersisted("mm_page", "dashboard");
  const [clients, setClients] = usePersisted("mm_clients", defaultClients);
  const [jobs, setJobs] = usePersisted("mm_jobs", defaultJobs);
  const [invoices, setInvoices] = usePersisted("mm_invoices", defaultInvoices);
  const [supplies, setSupplies] = usePersisted("mm_supplies", defaultSupplies);
  const [trips, setTrips] = usePersisted("mm_trips", defaultTrips);
  const [rooms, setRooms] = usePersisted("mm_rooms", defaultRooms);
  const [messages, setMessages] = usePersisted("mm_messages", defaultMessages);

  const t = T[lang];
  const unread = messages.filter(m=>m.unread).length;

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard jobs={jobs} invoices={invoices} trips={trips} t={t} />;
      case "schedule": return <Schedule jobs={jobs} setJobs={setJobs} t={t} />;
      case "checklist": return <Checklist rooms={rooms} setRooms={setRooms} t={t} />;
      case "clients": return <Clients clients={clients} setClients={setClients} t={t} />;
      case "invoices": return <Invoices invoices={invoices} setInvoices={setInvoices} t={t} />;
      case "supplies": return <Supplies supplies={supplies} setSupplies={setSupplies} t={t} />;
      case "mileage": return <Mileage trips={trips} setTrips={setTrips} t={t} />;
      case "messages": return <Messages messages={messages} setMessages={setMessages} t={t} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-title">🧹 MaidMate</div>
            <div className="logo-sub">{t.appSub}</div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{t.nav[n.id]}</span>
                {n.id==="messages"&&unread>0&&(
                  <span style={{marginLeft:"auto",background:"var(--coral)",color:"white",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:600}}>{unread}</span>
                )}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="avatar">👩</div>
              <div><div className="user-name">Maria Santos</div><div className="user-role">{t.user.role}</div></div>
            </div>
          </div>
        </div>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">{t.nav[page]}</div>
              <div className="page-date">{fmtDate(today, lang)}</div>
            </div>
            <div className="lang-toggle">
              <button className={`lang-btn ${lang==="en"?"active":""}`} onClick={()=>setLang("en")}>EN</button>
              <button className={`lang-btn ${lang==="es"?"active":""}`} onClick={()=>setLang("es")}>ES</button>
            </div>
          </div>
          <div className="content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}
