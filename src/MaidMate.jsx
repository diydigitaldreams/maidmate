import { useState, useEffect } from "react";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const styles = `
  ${GOOGLE_FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f2ee; }

  :root {
    --sage: #7a9e87;
    --sage-light: #b8d4c0;
    --sage-dark: #4a7060;
    --cream: #faf8f4;
    --warm: #f5f2ee;
    --coral: #e07a5f;
    --gold: #c9a84c;
    --text: #2c2c2c;
    --text-muted: #888;
    --border: #e8e4de;
    --white: #ffffff;
    --shadow: 0 4px 24px rgba(0,0,0,0.08);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  }

  .app { display: flex; height: 100vh; overflow: hidden; background: var(--warm); }

  /* Sidebar */
  .sidebar {
    width: 240px; background: var(--sage-dark); display: flex; flex-direction: column;
    padding: 0; flex-shrink: 0; position: relative; overflow: hidden;
  }
  .sidebar::before {
    content: ''; position: absolute; bottom: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,0.04); pointer-events: none;
  }
  .sidebar-logo {
    padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .logo-title {
    font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
    color: white; letter-spacing: -0.5px;
  }
  .logo-sub { font-size: 11px; color: var(--sage-light); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .sidebar-nav { padding: 16px 12px; flex: 1; }
  .nav-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; padding: 0 12px; margin: 16px 0 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
    cursor: pointer; margin-bottom: 2px; transition: all 0.2s; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-item.active { background: rgba(255,255,255,0.15); color: white; }
  .nav-icon { font-size: 18px; width: 22px; text-align: center; }
  .sidebar-footer { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.1); }
  .user-badge { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--sage-light); display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .user-name { font-size: 13px; color: white; font-weight: 500; }
  .user-role { font-size: 11px; color: var(--sage-light); }

  /* Main */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    padding: 20px 32px; display: flex; align-items: center; justify-content: space-between;
    background: var(--cream); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .page-title { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--text); font-weight: 600; }
  .page-date { font-size: 13px; color: var(--text-muted); }
  .topbar-actions { display: flex; gap: 10px; }
  .btn {
    padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s;
  }
  .btn-primary { background: var(--sage-dark); color: white; }
  .btn-primary:hover { background: var(--sage); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .btn-outline { background: white; color: var(--text); border: 1px solid var(--border); }
  .btn-outline:hover { border-color: var(--sage); color: var(--sage-dark); }
  .btn-coral { background: var(--coral); color: white; }
  .btn-coral:hover { opacity: 0.9; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-icon { padding: 8px; border-radius: 8px; background: var(--warm); border: 1px solid var(--border); cursor: pointer; font-size: 16px; }

  .content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  /* Cards */
  .card { background: white; border-radius: 16px; padding: 22px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
  .card-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--text); font-weight: 600; margin-bottom: 16px; }

  /* Stats row */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: white; border-radius: 16px; padding: 20px; border: 1px solid var(--border);
    box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: attr(data-icon); position: absolute; right: 16px; top: 16px;
    font-size: 28px; opacity: 0.15;
  }
  .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--text); }
  .stat-sub { font-size: 12px; color: var(--sage); margin-top: 4px; }

  /* Grid layouts */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  /* Schedule */
  .job-item {
    display: flex; align-items: center; gap: 14px; padding: 14px 0;
    border-bottom: 1px solid var(--border); cursor: pointer; transition: all 0.15s;
  }
  .job-item:last-child { border-bottom: none; }
  .job-item:hover { transform: translateX(4px); }
  .job-time { font-size: 12px; color: var(--text-muted); width: 52px; flex-shrink: 0; font-weight: 500; }
  .job-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .job-info { flex: 1; }
  .job-client { font-size: 14px; font-weight: 600; color: var(--text); }
  .job-address { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
  .job-badge {
    font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; flex-shrink: 0;
  }
  .badge-green { background: #e8f5ed; color: #2d7a4f; }
  .badge-blue { background: #e8f0fb; color: #3b5bdb; }
  .badge-orange { background: #fff3e8; color: #d4620a; }
  .badge-red { background: #fde8e8; color: #c0392b; }
  .badge-gray { background: var(--warm); color: var(--text-muted); }

  /* Checklist */
  .checklist-area { display: flex; flex-direction: column; gap: 20px; }
  .room-card { background: white; border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
  .room-header {
    padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
    background: var(--warm); border-bottom: 1px solid var(--border); cursor: pointer;
  }
  .room-name { font-weight: 600; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .room-progress { font-size: 12px; color: var(--text-muted); }
  .check-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 18px;
    border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s;
  }
  .check-item:last-child { border-bottom: none; }
  .check-item:hover { background: #fafaf9; }
  .check-item.done { opacity: 0.5; }
  .check-box {
    width: 20px; height: 20px; border-radius: 6px; border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;
  }
  .check-box.checked { background: var(--sage); border-color: var(--sage); color: white; font-size: 12px; }
  .check-label { font-size: 14px; color: var(--text); }
  .check-item.done .check-label { text-decoration: line-through; color: var(--text-muted); }
  .progress-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 8px; }
  .progress-fill { height: 100%; background: var(--sage); border-radius: 2px; transition: width 0.3s; }

  /* Clients */
  .client-card {
    background: white; border-radius: 14px; border: 1px solid var(--border); padding: 18px;
    display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: all 0.2s;
  }
  .client-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .client-avatar {
    width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
    justify-content: center; font-size: 20px; margin-bottom: 4px;
  }
  .client-name { font-weight: 600; font-size: 15px; color: var(--text); }
  .client-detail { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
  .client-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
  .tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; background: var(--warm); color: var(--text-muted); border: 1px solid var(--border); }

  /* Invoices */
  .invoice-row {
    display: grid; grid-template-columns: 1fr 1fr auto auto auto; gap: 12px; align-items: center;
    padding: 14px 0; border-bottom: 1px solid var(--border); font-size: 14px;
  }
  .invoice-row:last-child { border-bottom: none; }
  .invoice-id { font-weight: 600; color: var(--text); }
  .invoice-client { color: var(--text-muted); }
  .invoice-amount { font-weight: 700; color: var(--text); font-family: 'Playfair Display', serif; }
  .invoice-header {
    display: grid; grid-template-columns: 1fr 1fr auto auto auto; gap: 12px;
    padding-bottom: 10px; border-bottom: 2px solid var(--border);
    font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600;
  }

  /* Supplies */
  .supply-item {
    display: flex; align-items: center; justify-content: space-between; padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .supply-item:last-child { border-bottom: none; }
  .supply-info { display: flex; align-items: center; gap: 12px; }
  .supply-icon { font-size: 22px; width: 36px; text-align: center; }
  .supply-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .supply-qty { font-size: 12px; color: var(--text-muted); }
  .supply-level { display: flex; align-items: center; gap: 8px; }
  .level-bar { width: 80px; height: 6px; background: var(--border); border-radius: 3px; }
  .level-fill { height: 100%; border-radius: 3px; }
  .level-ok { background: var(--sage); }
  .level-low { background: var(--gold); }
  .level-critical { background: var(--coral); }

  /* Mileage */
  .trip-item {
    display: grid; grid-template-columns: auto 1fr auto auto; gap: 16px; align-items: center;
    padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px;
  }
  .trip-item:last-child { border-bottom: none; }
  .trip-date { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .trip-route { font-weight: 500; color: var(--text); }
  .trip-sub { font-size: 12px; color: var(--text-muted); }
  .trip-miles { font-weight: 700; color: var(--sage-dark); font-family: 'Playfair Display', serif; }
  .trip-deduction { font-size: 12px; color: var(--sage); }

  /* Messages */
  .convo-list { display: flex; flex-direction: column; gap: 2px; }
  .convo-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px;
    cursor: pointer; transition: background 0.15s;
  }
  .convo-item:hover, .convo-item.active { background: var(--warm); }
  .convo-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .convo-preview { flex: 1; min-width: 0; }
  .convo-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .convo-last { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .convo-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .convo-time { font-size: 11px; color: var(--text-muted); }
  .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sage); }
  .chat-area { display: flex; flex-direction: column; height: 100%; }
  .chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .msg { display: flex; gap: 10px; max-width: 80%; }
  .msg.sent { align-self: flex-end; flex-direction: row-reverse; }
  .msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
  .msg.received .msg-bubble { background: var(--warm); color: var(--text); border-bottom-left-radius: 4px; }
  .msg.sent .msg-bubble { background: var(--sage-dark); color: white; border-bottom-right-radius: 4px; }
  .msg-time { font-size: 11px; color: var(--text-muted); align-self: flex-end; padding-bottom: 4px; }
  .chat-input { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }
  .chat-input input {
    flex: 1; padding: 10px 16px; border-radius: 24px; border: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; background: var(--warm);
  }
  .chat-input input:focus { border-color: var(--sage); }

  /* Form */
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; background: white; outline: none; color: var(--text);
  }
  .form-input:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(122,158,135,0.1); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex;
    align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px);
  }
  .modal {
    background: white; border-radius: 20px; padding: 28px; width: 480px;
    max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

  /* Misc */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--text); }
  .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .flex { display: flex; }
  .gap-2 { gap: 8px; }
  .mt-1 { margin-top: 4px; }
  .summary-box { background: var(--warm); border-radius: 12px; padding: 16px; border: 1px solid var(--border); }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .summary-row.total { font-weight: 700; border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px; }
`;

// ─── DATA ───────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const initClients = [
  { id: 1, name: "Sarah Johnson", address: "123 Maple St, Apt 4B", phone: "(555) 234-5678", email: "sarah@email.com", freq: "Weekly", rate: 120, notes: "Allergic to bleach. Has 2 cats.", emoji: "🏡", color: "#e8f5ed", tags: ["Weekly", "Cats", "No bleach"] },
  { id: 2, name: "Mike & Trish Davis", address: "45 Elm Ave", phone: "(555) 345-6789", email: "davis@email.com", freq: "Bi-weekly", rate: 180, notes: "Prefer eco-friendly products.", emoji: "🏠", color: "#e8f0fb", tags: ["Bi-weekly", "Eco-friendly"] },
  { id: 3, name: "The Garcias", address: "78 Oak Blvd", phone: "(555) 456-7890", email: "garcia@email.com", freq: "Weekly", rate: 150, notes: "Deep clean kitchen every visit.", emoji: "🏘️", color: "#fff3e8", tags: ["Weekly", "Deep clean"] },
  { id: 4, name: "Dr. Patel", address: "200 Pine Dr, Suite 1", phone: "(555) 567-8901", email: "patel@email.com", freq: "Monthly", rate: 220, notes: "Very particular about window streaks.", emoji: "🏢", color: "#fde8f0", tags: ["Monthly", "Premium", "Windows"] },
];

const initJobs = [
  { id: 1, client: "Sarah Johnson", address: "123 Maple St", time: "8:00 AM", duration: "2h", status: "Completed", color: "#4a7060" },
  { id: 2, client: "The Garcias", address: "78 Oak Blvd", time: "11:00 AM", duration: "3h", status: "In Progress", color: "#c9a84c" },
  { id: 3, client: "Mike & Trish Davis", address: "45 Elm Ave", time: "2:30 PM", duration: "2.5h", status: "Upcoming", color: "#3b5bdb" },
  { id: 4, client: "Dr. Patel", address: "200 Pine Dr", time: "5:00 PM", duration: "3h", status: "Upcoming", color: "#3b5bdb" },
];

const initInvoices = [
  { id: "INV-042", client: "Sarah Johnson", date: "Mar 18", amount: 120, status: "Paid" },
  { id: "INV-043", client: "The Garcias", date: "Mar 18", amount: 150, status: "Paid" },
  { id: "INV-044", client: "Mike & Trish Davis", date: "Mar 15", amount: 180, status: "Pending" },
  { id: "INV-045", client: "Dr. Patel", date: "Mar 10", amount: 220, status: "Overdue" },
  { id: "INV-041", client: "Sarah Johnson", date: "Mar 11", amount: 120, status: "Paid" },
];

const initSupplies = [
  { id: 1, icon: "🧴", name: "All-Purpose Cleaner", qty: "2 bottles", level: 0.7, status: "ok" },
  { id: 2, icon: "🧻", name: "Paper Towels", qty: "1 roll", level: 0.15, status: "critical" },
  { id: 3, icon: "🧹", name: "Microfiber Cloths", qty: "4 cloths", level: 0.5, status: "ok" },
  { id: 4, icon: "🫧", name: "Dish Soap", qty: "Half bottle", level: 0.4, status: "low" },
  { id: 5, icon: "🪣", name: "Mop Pads", qty: "2 pads", level: 0.3, status: "low" },
  { id: 6, icon: "✨", name: "Glass Cleaner", qty: "1 bottle", level: 0.6, status: "ok" },
  { id: 7, icon: "🧽", name: "Scrub Sponges", qty: "0 sponges", level: 0, status: "critical" },
];

const initTrips = [
  { id: 1, date: "Mar 19", from: "Home", to: "Sarah Johnson", client: "Sarah Johnson", miles: 4.2, deduction: 2.52 },
  { id: 2, date: "Mar 19", from: "Sarah Johnson", to: "The Garcias", client: "The Garcias", miles: 6.8, deduction: 4.08 },
  { id: 3, date: "Mar 18", from: "Home", to: "Davis Residence", client: "Davis", miles: 3.1, deduction: 1.86 },
  { id: 4, date: "Mar 17", from: "Home", to: "Dr. Patel", client: "Dr. Patel", miles: 8.5, deduction: 5.10 },
];

const initRooms = [
  {
    id: 1, name: "Kitchen", icon: "🍳",
    tasks: [
      { id: 1, label: "Wipe countertops", done: true },
      { id: 2, label: "Clean stovetop & burners", done: true },
      { id: 3, label: "Wipe microwave inside/out", done: false },
      { id: 4, label: "Clean sink & faucet", done: false },
      { id: 5, label: "Mop floor", done: false },
    ]
  },
  {
    id: 2, name: "Living Room", icon: "🛋️",
    tasks: [
      { id: 1, label: "Dust all surfaces", done: true },
      { id: 2, label: "Vacuum sofa & cushions", done: true },
      { id: 3, label: "Clean glass surfaces", done: true },
      { id: 4, label: "Vacuum carpet/floors", done: false },
    ]
  },
  {
    id: 3, name: "Bathrooms", icon: "🚿",
    tasks: [
      { id: 1, label: "Scrub toilet inside & out", done: false },
      { id: 2, label: "Clean sink & mirror", done: false },
      { id: 3, label: "Scrub shower/tub", done: false },
      { id: 4, label: "Mop floor", done: false },
      { id: 5, label: "Replace towels", done: false },
    ]
  },
  {
    id: 4, name: "Bedrooms", icon: "🛏️",
    tasks: [
      { id: 1, label: "Make beds / change sheets", done: false },
      { id: 2, label: "Dust furniture & shelves", done: false },
      { id: 3, label: "Vacuum floor", done: false },
    ]
  },
];

const initMessages = [
  {
    id: 1, client: "Sarah Johnson", emoji: "👩", unread: true,
    messages: [
      { sent: false, text: "Hi! Just wanted to confirm for tomorrow morning 😊", time: "9:02 AM" },
      { sent: true, text: "Hi Sarah! Yes, I'll be there at 8 AM sharp. See you then!", time: "9:15 AM" },
      { sent: false, text: "Perfect, thank you! 🙏", time: "9:16 AM" },
    ]
  },
  {
    id: 2, client: "The Garcias", emoji: "👨‍👩‍👧", unread: false,
    messages: [
      { sent: false, text: "Can you do a deep clean of the oven this week?", time: "Yesterday" },
      { sent: true, text: "Absolutely! I'll bring the oven cleaner. Will add it to the checklist.", time: "Yesterday" },
    ]
  },
  {
    id: 3, client: "Dr. Patel", emoji: "👨‍⚕️", unread: true,
    messages: [
      { sent: false, text: "Is it possible to reschedule to next Friday instead?", time: "Mar 17" },
      { sent: true, text: "Let me check my schedule and get back to you!", time: "Mar 17" },
    ]
  },
];

const navItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "schedule", icon: "📅", label: "Schedule" },
  { id: "checklist", icon: "✅", label: "Checklists" },
  { id: "clients", icon: "👥", label: "Clients" },
  { id: "invoices", icon: "💰", label: "Invoices" },
  { id: "supplies", icon: "🧴", label: "Supplies" },
  { id: "mileage", icon: "🚗", label: "Mileage" },
  { id: "messages", icon: "💬", label: "Messages" },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Dashboard({ clients, jobs, invoices, trips }) {
  const earned = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const totalMiles = trips.reduce((s, t) => s + t.miles, 0);
  const todayJobs = jobs.length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card" data-icon="💰">
          <div className="stat-label">Earned This Month</div>
          <div className="stat-value">${earned}</div>
          <div className="stat-sub">↑ 12% from last month</div>
        </div>
        <div className="stat-card" data-icon="⏳">
          <div className="stat-label">Pending Payments</div>
          <div className="stat-value">${pending}</div>
          <div className="stat-sub">{invoices.filter(i => i.status !== "Paid").length} invoices</div>
        </div>
        <div className="stat-card" data-icon="🏠">
          <div className="stat-label">Today's Jobs</div>
          <div className="stat-value">{todayJobs}</div>
          <div className="stat-sub">Next: {jobs[1]?.time}</div>
        </div>
        <div className="stat-card" data-icon="🚗">
          <div className="stat-label">Miles This Week</div>
          <div className="stat-value">{totalMiles.toFixed(1)}</div>
          <div className="stat-sub">${(totalMiles * 0.67).toFixed(2)} deductible</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="card-title" style={{marginBottom:0}}>Today's Schedule</div>
            <span style={{fontSize:12,color:"var(--text-muted)"}}>Mar 19</span>
          </div>
          {jobs.map(j => (
            <div className="job-item" key={j.id}>
              <div className="job-time">{j.time}</div>
              <div className="job-dot" style={{background: j.color}}></div>
              <div className="job-info">
                <div className="job-client">{j.client}</div>
                <div className="job-address">{j.address} · {j.duration}</div>
              </div>
              <div className={`job-badge badge-${j.status === "Completed" ? "green" : j.status === "In Progress" ? "orange" : "blue"}`}>
                {j.status}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card" style={{flex:1}}>
            <div className="card-title">Quick Invoice</div>
            <div className="summary-box">
              {["Sarah Johnson – $120","The Garcias – $150"].map((s,i) => (
                <div key={i} className="summary-row">
                  <span>{s.split("–")[0]}</span>
                  <span style={{fontWeight:600}}>{s.split("–")[1]}</span>
                </div>
              ))}
              <div className="summary-row total">
                <span>Total Today</span>
                <span style={{color:"var(--sage-dark)"}}>$270</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">⚠️ Low Supplies</div>
            {["🧻 Paper Towels – Critical","🧽 Scrub Sponges – Out","🫧 Dish Soap – Low"].map((s,i)=>(
              <div key={i} style={{padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:14,color:"var(--text)"}}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Schedule({ jobs, setJobs }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: "", address: "", time: "", duration: "" });

  const addJob = () => {
    if (!form.client) return;
    setJobs([...jobs, { id: Date.now(), ...form, status: "Upcoming", color: "#3b5bdb" }]);
    setForm({ client: "", address: "", time: "", duration: "" });
    setShowModal(false);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Today · {fmt(today)}</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Job</button>
      </div>
      <div className="card">
        {jobs.map(j => (
          <div className="job-item" key={j.id}>
            <div className="job-time">{j.time}</div>
            <div className="job-dot" style={{background: j.color}}></div>
            <div className="job-info">
              <div className="job-client">{j.client}</div>
              <div className="job-address">{j.address} · {j.duration}</div>
            </div>
            <div className={`job-badge badge-${j.status === "Completed" ? "green" : j.status === "In Progress" ? "orange" : "blue"}`}>
              {j.status}
            </div>
            <select style={{fontSize:12,border:"1px solid var(--border)",borderRadius:6,padding:"4px 6px",background:"white",color:"var(--text)"}}
              value={j.status} onChange={e => setJobs(jobs.map(x => x.id === j.id ? {...x, status: e.target.value, color: e.target.value === "Completed" ? "#4a7060" : e.target.value === "In Progress" ? "#c9a84c" : "#3b5bdb"} : x))}>
              <option>Upcoming</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New Job</div>
            {[["Client Name","client","text"],["Address","address","text"],["Time","time","time"],["Duration (e.g. 2h)","duration","text"]].map(([l,k,t])=>(
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input type={t} className="form-input" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addJob}>Add Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Checklist({ rooms, setRooms }) {
  const [active, setActive] = useState(null);
  const toggle = (rid, tid) => {
    setRooms(rooms.map(r => r.id === rid ? {...r, tasks: r.tasks.map(t => t.id === tid ? {...t, done: !t.done} : t)} : r));
  };
  const pct = (r) => Math.round((r.tasks.filter(t=>t.done).length / r.tasks.length) * 100);

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Cleaning Checklist · The Garcias</div>
        <span style={{fontSize:13,color:"var(--text-muted)"}}>
          {rooms.reduce((s,r)=>s+r.tasks.filter(t=>t.done).length,0)} / {rooms.reduce((s,r)=>s+r.tasks.length,0)} tasks done
        </span>
      </div>
      <div className="checklist-area">
        {rooms.map(r => (
          <div className="room-card" key={r.id}>
            <div className="room-header" onClick={() => setActive(active === r.id ? null : r.id)}>
              <div className="room-name">{r.icon} {r.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="progress-bar" style={{width:80}}>
                  <div className="progress-fill" style={{width: `${pct(r)}%`}}></div>
                </div>
                <div className="room-progress">{pct(r)}%</div>
                <span style={{fontSize:12,color:"var(--text-muted)"}}>{active===r.id?"▲":"▼"}</span>
              </div>
            </div>
            {(active === r.id || active === null) && r.tasks.map(t => (
              <div key={t.id} className={`check-item ${t.done ? "done" : ""}`} onClick={() => toggle(r.id, t.id)}>
                <div className={`check-box ${t.done ? "checked" : ""}`}>{t.done ? "✓" : ""}</div>
                <div className="check-label">{t.label}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Clients({ clients, setClients }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", freq: "Weekly", rate: "", notes: "" });
  const emojis = ["🏡","🏠","🏘️","🏢","🏬"];
  const colors = ["#e8f5ed","#e8f0fb","#fff3e8","#fde8f0","#e8f8ff"];

  const add = () => {
    if (!form.name) return;
    const idx = clients.length % 5;
    setClients([...clients, { id: Date.now(), ...form, rate: Number(form.rate), emoji: emojis[idx], color: colors[idx], tags: [form.freq] }]);
    setForm({ name:"",address:"",phone:"",freq:"Weekly",rate:"",notes:"" });
    setShowModal(false);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">{clients.length} Clients</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
      </div>
      <div className="grid-3" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
        {clients.map(c => (
          <div className="client-card" key={c.id}>
            <div className="client-avatar" style={{background: c.color}}>{c.emoji}</div>
            <div className="client-name">{c.name}</div>
            <div className="client-detail">📍 {c.address}</div>
            <div className="client-detail">📞 {c.phone}</div>
            <div className="client-detail">💰 ${c.rate}/visit · {c.freq}</div>
            {c.notes && <div className="client-detail" style={{marginTop:4,fontStyle:"italic"}}>💬 {c.notes}</div>}
            <div className="client-tags">{c.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New Client</div>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Rate ($)</label><input type="number" className="form-input" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Frequency</label>
              <select className="form-input" value={form.freq} onChange={e=>setForm({...form,freq:e.target.value})}>
                <option>Weekly</option><option>Bi-weekly</option><option>Monthly</option><option>One-time</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Special instructions…" /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={add}>Add Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Invoices({ invoices, setInvoices }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: "", amount: "", date: "" });
  const paid = invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);
  const pending = invoices.filter(i=>i.status==="Pending").reduce((s,i)=>s+i.amount,0);
  const overdue = invoices.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.amount,0);

  const add = () => {
    if (!form.client||!form.amount) return;
    const num = `INV-${String(invoices.length+46).padStart(3,"0")}`;
    setInvoices([{id:num, client:form.client, date:form.date||"Mar 19", amount:Number(form.amount), status:"Pending"}, ...invoices]);
    setForm({client:"",amount:"",date:""});
    setShowModal(false);
  };

  const badgeClass = (s) => s==="Paid"?"badge-green":s==="Pending"?"badge-blue":"badge-red";

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[["Paid","$"+paid,"#4a7060"],["Pending","$"+pending,"#3b5bdb"],["Overdue","$"+overdue,"#c0392b"]].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-header">
          <div className="card-title" style={{marginBottom:0}}>All Invoices</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Invoice</button>
        </div>
        <div className="invoice-header">
          <span>Invoice #</span><span>Client</span><span>Date</span><span>Amount</span><span>Status</span>
        </div>
        {invoices.map(inv => (
          <div className="invoice-row" key={inv.id}>
            <div className="invoice-id">{inv.id}</div>
            <div className="invoice-client">{inv.client}</div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>{inv.date}</div>
            <div className="invoice-amount">${inv.amount}</div>
            <div>
              <span className={`job-badge ${badgeClass(inv.status)}`}>{inv.status}</span>
            </div>
            {inv.status !== "Paid" && (
              <button className="btn btn-sm" style={{background:"#e8f5ed",color:"#2d7a4f",border:"none",cursor:"pointer"}}
                onClick={() => setInvoices(invoices.map(i => i.id===inv.id ? {...i,status:"Paid"} : i))}>
                Mark Paid
              </button>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">New Invoice</div>
            <div className="form-group"><label className="form-label">Client Name</label><input className="form-input" value={form.client} onChange={e=>setForm({...form,client:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Amount ($)</label><input type="number" className="form-input" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" placeholder="Mar 19" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={add}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Supplies({ supplies, setSupplies }) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Supply Inventory</div>
        <div style={{display:"flex",gap:8}}>
          <span style={{fontSize:13,color:"var(--coral)"}}>⚠️ {supplies.filter(s=>s.status!=="ok").length} items need restocking</span>
        </div>
      </div>
      <div className="grid-2">
        <div className="card" style={{flex:2}}>
          <div className="card-title">All Supplies</div>
          {supplies.map(s => (
            <div className="supply-item" key={s.id}>
              <div className="supply-info">
                <div className="supply-icon">{s.icon}</div>
                <div>
                  <div className="supply-name">{s.name}</div>
                  <div className="supply-qty">{s.qty}</div>
                </div>
              </div>
              <div className="supply-level">
                <div className="level-bar">
                  <div className={`level-fill level-${s.status}`} style={{width:`${s.level*100}%`}}></div>
                </div>
                <span className={`job-badge badge-${s.status==="ok"?"green":s.status==="low"?"orange":"red"}`} style={{fontSize:11}}>
                  {s.status === "ok" ? "OK" : s.status === "low" ? "Low" : "Out"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">🛒 Shopping List</div>
          <div style={{fontSize:13,color:"var(--text-muted)",marginBottom:12}}>Items to restock:</div>
          {supplies.filter(s=>s.status!=="ok").map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <span>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{s.name}</div>
                <div style={{fontSize:12,color:"var(--coral)"}}>{s.status === "critical" ? "🚨 Out of stock" : "⚠️ Running low"}</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setSupplies(supplies.map(x=>x.id===s.id?{...x,level:1,status:"ok",qty:"Full stock"}:x))}>
                ✓ Got it
              </button>
            </div>
          ))}
          {supplies.filter(s=>s.status!=="ok").length===0 && <div style={{color:"var(--sage)",fontWeight:500,textAlign:"center",padding:20}}>✅ All stocked up!</div>}
        </div>
      </div>
    </div>
  );
}

function Mileage({ trips, setTrips }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ from: "", to: "", miles: "", client: "" });
  const totalMiles = trips.reduce((s,t)=>s+t.miles,0);
  const totalDeduction = trips.reduce((s,t)=>s+t.deduction,0);

  const add = () => {
    if (!form.from||!form.miles) return;
    const m = Number(form.miles);
    setTrips([{id:Date.now(), date:"Mar 19", ...form, miles:m, deduction:+(m*0.67).toFixed(2)}, ...trips]);
    setForm({from:"",to:"",miles:"",client:""});
    setShowModal(false);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Mileage & Expenses</div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Log Trip</button>
      </div>
      <div className="grid-2" style={{marginBottom:20}}>
        {[["Total Miles",totalMiles.toFixed(1)+"mi","🚗"],["Tax Deduction","$"+totalDeduction.toFixed(2),"💵"],].map(([l,v,i])=>(
          <div key={l} className="card" style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontSize:32}}>{i}</div>
            <div>
              <div style={{fontSize:12,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:26,fontWeight:700,color:"var(--text)"}}>{v}</div>
              <div style={{fontSize:12,color:"var(--sage)"}}>@ $0.67/mile IRS rate</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Trip Log</div>
        {trips.map(t=>(
          <div className="trip-item" key={t.id}>
            <div className="trip-date">{t.date}</div>
            <div>
              <div className="trip-route">{t.from} → {t.to}</div>
              <div className="trip-sub">{t.client}</div>
            </div>
            <div>
              <div className="trip-miles">{t.miles} mi</div>
              <div className="trip-deduction">${t.deduction.toFixed(2)} deduct.</div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Log a Trip</div>
            <div className="form-group"><label className="form-label">From</label><input className="form-input" placeholder="e.g. Home" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">To (Client)</label><input className="form-input" placeholder="e.g. Sarah Johnson" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Miles</label><input type="number" className="form-input" value={form.miles} onChange={e=>setForm({...form,miles:e.target.value})} /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={add}>Log Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Messages({ messages, setMessages }) {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState("");
  const convo = messages[active];

  const send = () => {
    if (!input.trim()) return;
    const updated = messages.map((m,i) => i===active ? {...m, messages:[...m.messages,{sent:true,text:input,time:"Now"}], unread:false} : m);
    setMessages(updated);
    setInput("");
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:0,background:"white",borderRadius:16,border:"1px solid var(--border)",overflow:"hidden",height:"calc(100vh - 160px)"}}>
      <div style={{borderRight:"1px solid var(--border)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:600,color:"var(--text)"}}>Messages</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {messages.map((m,i)=>(
            <div key={m.id} className={`convo-item ${i===active?"active":""}`} onClick={()=>setActive(i)}>
              <div className="convo-avatar" style={{background:"var(--warm)"}}>{m.emoji}</div>
              <div className="convo-preview">
                <div className="convo-name">{m.client}</div>
                <div className="convo-last">{m.messages[m.messages.length-1].text}</div>
              </div>
              <div className="convo-meta">
                <div className="convo-time">{m.messages[m.messages.length-1].time}</div>
                {m.unread && <div className="unread-dot"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        <div className="chat-header">
          <div className="convo-avatar" style={{background:"var(--warm)",width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{convo.emoji}</div>
          <div>
            <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{convo.client}</div>
            <div style={{fontSize:12,color:"var(--sage)"}}>Active now</div>
          </div>
        </div>
        <div className="chat-messages">
          {convo.messages.map((m,i)=>(
            <div key={i} className={`msg ${m.sent?"sent":"received"}`}>
              {!m.sent && <div style={{width:28,height:28,borderRadius:"50%",background:"var(--warm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{convo.emoji}</div>}
              <div>
                <div className="msg-bubble">{m.text}</div>
                <div className="msg-time">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message…" onKeyDown={e=>e.key==="Enter"&&send()} />
          <button className="btn btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────
export default function MaidMate() {
  const [page, setPage] = useState("dashboard");
  const [clients, setClients] = useState(initClients);
  const [jobs, setJobs] = useState(initJobs);
  const [invoices, setInvoices] = useState(initInvoices);
  const [supplies, setSupplies] = useState(initSupplies);
  const [trips, setTrips] = useState(initTrips);
  const [rooms, setRooms] = useState(initRooms);
  const [messages, setMessages] = useState(initMessages);

  const pageTitle = navItems.find(n=>n.id===page)?.label || "Dashboard";
  const unreadMsgs = messages.filter(m=>m.unread).length;

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard clients={clients} jobs={jobs} invoices={invoices} trips={trips} />;
      case "schedule": return <Schedule jobs={jobs} setJobs={setJobs} />;
      case "checklist": return <Checklist rooms={rooms} setRooms={setRooms} />;
      case "clients": return <Clients clients={clients} setClients={setClients} />;
      case "invoices": return <Invoices invoices={invoices} setInvoices={setInvoices} />;
      case "supplies": return <Supplies supplies={supplies} setSupplies={setSupplies} />;
      case "mileage": return <Mileage trips={trips} setTrips={setTrips} />;
      case "messages": return <Messages messages={messages} setMessages={setMessages} />;
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
            <div className="logo-sub">Business Manager</div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
                {n.id==="messages" && unreadMsgs > 0 && (
                  <span style={{marginLeft:"auto",background:"var(--coral)",color:"white",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:600}}>{unreadMsgs}</span>
                )}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="avatar">👩</div>
              <div>
                <div className="user-name">Maria Santos</div>
                <div className="user-role">Independent Cleaner</div>
              </div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">{pageTitle}</div>
              <div className="page-date">{fmt(today)}</div>
            </div>
          </div>
          <div className="content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}
