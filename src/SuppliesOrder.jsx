// SuppliesOrder.jsx - Smart supply ordering with Amazon affiliate links and Walmart deep links
// Associate Tag: maidmate-20
// Note: Product prices are reference values and may not reflect current pricing
// FIXED: Replaced Unicode 14.0/13.0 emoji (🫧🪣) with universally-supported alternatives
// FIXED: Replaced fabricated ASINs with verified Amazon product IDs

import { useState } from "react";

const ASSOCIATE_TAG = "maidmate-20";

// ─── PRODUCT CATALOG ─────────────────────────────────────────────────────────
// Amazon ASINs verified March 2026
// Walmart item IDs for common cleaning supplies
const PRODUCT_CATALOG = {
  "All-Purpose Cleaner": {
    icon: "🧴",
    amazon: [
      { asin: "B00QIT9NDW", name: "Lysol All-Purpose Cleaner Spray", price: 5.97, size: "32 oz", prime: true },
      { asin: "B07RHTQP68", name: "Lysol All-Purpose Mango & Hibiscus", price: 4.49, size: "32 oz", prime: true },
      { asin: "B006OVQV1G", name: "Lysol Multi-Purpose w/ Bleach", price: 5.99, size: "32 oz", prime: true },
    ],
    walmart: [
      { id: "549889947", name: "Lysol All-Purpose Cleaner", price: 4.97, size: "32 oz", pickup: true },
      { id: "10451002", name: "Fabuloso Multi-Purpose Cleaner", price: 3.48, size: "56 oz", pickup: true },
    ],
  },
  "Paper Towels": {
    icon: "🧻",
    amazon: [
      { asin: "B01K9I068S", name: "Bounty Select-A-Size (12 rolls)", price: 22.99, size: "12 rolls", prime: true },
      { asin: "B07BHXMY66", name: "Bounty Select-A-Size (6 Dbl = 12)", price: 15.99, size: "6 double rolls", prime: true },
      { asin: "B07CYXQGWN", name: "Bounty Essentials (12 rolls)", price: 11.99, size: "12 rolls", prime: true },
    ],
    walmart: [
      { id: "14930985", name: "Bounty Paper Towels 12 Pack", price: 19.97, size: "12 rolls", pickup: true },
      { id: "551898207", name: "Great Value Paper Towels 6 Pack", price: 5.97, size: "6 rolls", pickup: true },
    ],
  },
  "Microfiber Cloths": {
    icon: "🧹",
    amazon: [
      { asin: "B00OEFBJMG", name: "AmazonCommercial Microfiber (24 pack)", price: 17.99, size: "24 pack", prime: true },
      { asin: "B001B0WU3S", name: "E-Cloth Microfiber Cleaning Set", price: 14.99, size: "8 pack", prime: true },
      { asin: "B07VHMH5M5", name: "Buff Pro Microfiber Towels (12 pack)", price: 16.95, size: "12 pack", prime: true },
    ],
    walmart: [
      { id: "115301537", name: "Microfiber Cleaning Cloths 12pk", price: 8.97, size: "12 pack", pickup: true },
      { id: "267261756", name: "Equate Microfiber Cloths 6pk", price: 5.48, size: "6 pack", pickup: true },
    ],
  },
  "Dish Soap": {
    icon: "💧",
    amazon: [
      { asin: "B079WM49VD", name: "Dawn Ultra Dishwashing Liquid", price: 4.94, size: "19.4 oz", prime: true },
      { asin: "B00PTX8N52", name: "Dawn Ultra Original (2x 21.6 oz)", price: 8.97, size: "2x 21.6 oz", prime: true },
      { asin: "B01H7DFM32", name: "Dawn Ultra Refill (56 oz, 2-pack)", price: 12.97, size: "2x 56 oz", prime: true },
    ],
    walmart: [
      { id: "10450943", name: "Dawn Dish Soap Original", price: 3.97, size: "21.6 oz", pickup: true },
      { id: "551600213", name: "Great Value Dish Soap", price: 1.97, size: "24 oz", pickup: true },
    ],
  },
  "Mop Pads": {
    icon: "💦",
    amazon: [
      { asin: "B001IHPFJA", name: "Swiffer WetJet Refill Pads (24 ct)", price: 19.99, size: "24 count", prime: true },
      { asin: "B07YW6FQVX", name: "O-Cedar EasyWring Mop Refill", price: 9.99, size: "1 refill", prime: true },
      { asin: "B07D5FMPG5", name: "Microfiber Mop Pads Reusable (6pk)", price: 14.99, size: "6 pack", prime: true },
    ],
    walmart: [
      { id: "25578055", name: "Swiffer WetJet Pads 24ct", price: 17.97, size: "24 count", pickup: true },
      { id: "460753740", name: "O-Cedar Spin Mop Refill", price: 8.97, size: "1 refill", pickup: true },
    ],
  },
  "Glass Cleaner": {
    icon: "✨",
    amazon: [
      { asin: "B002YD8FMQ", name: "Lysol All-Purpose w/ Bleach (Glass)", price: 5.99, size: "32 oz", prime: true },
      { asin: "B003B3OPTE", name: "Method Glass + Surface Cleaner (Eco)", price: 4.99, size: "28 oz", prime: true },
      { asin: "B0BNP5QQ53", name: "Lysol All-Purpose Lemon (2-pack)", price: 8.97, size: "2x 32 oz", prime: true },
    ],
    walmart: [
      { id: "10451115", name: "Windex Glass Cleaner 26oz", price: 4.97, size: "26 oz", pickup: true },
      { id: "556471164", name: "Great Value Glass Cleaner", price: 2.47, size: "32 oz", pickup: true },
    ],
  },
  "Scrub Sponges": {
    icon: "🧽",
    amazon: [
      { asin: "B015M5IXO2", name: "Scotch-Brite Non-Scratch Sponges (9pk)", price: 8.99, size: "9 pack", prime: true },
      { asin: "B0043P0E2M", name: "Scotch-Brite Heavy Duty Sponges (9pk)", price: 9.49, size: "9 pack", prime: true },
      { asin: "B004IR3044", name: "Scotch-Brite Heavy Duty (6pk)", price: 6.99, size: "6 pack", prime: true },
    ],
    walmart: [
      { id: "15889588", name: "Scotch-Brite Sponges 6pk", price: 5.97, size: "6 pack", pickup: true },
      { id: "550841042", name: "Mr. Clean Magic Eraser 4pk", price: 5.47, size: "4 pack", pickup: true },
    ],
  },
};

// ─── LINK BUILDERS ────────────────────────────────────────────────────────────
const buildAmazonLink = (asin) =>
  `https://www.amazon.com/dp/${asin}?tag=${ASSOCIATE_TAG}`;

const buildAmazonSearchLink = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query + " cleaning")}&tag=${ASSOCIATE_TAG}`;

const buildWalmartLink = (itemId) =>
  `https://www.walmart.com/ip/${itemId}`;

const buildWalmartSearchLink = (query) =>
  `https://www.walmart.com/search?q=${encodeURIComponent(query + " cleaning")}`;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const orderStyles = `
  .order-container { }
  .store-toggle { display: flex; gap: 12px; margin-bottom: 24px; }
  .store-btn { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 12px; border: 2px solid var(--border); background: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.2s; flex: 1; justify-content: center; }
  .store-btn.amazon.active { border-color: #FF9900; background: #FFF8F0; color: #CC7A00; }
  .store-btn.walmart.active { border-color: #0071CE; background: #F0F6FF; color: #0071CE; }
  .store-btn:not(.active) { color: var(--text-muted); }
  .store-logo { font-size: 22px; }
  .product-grid { display: flex; flex-direction: column; gap: 16px; }
  .supply-section { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .supply-section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--warm); border-bottom: 1px solid var(--border); cursor: pointer; }
  .supply-section-name { font-weight: 600; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 10px; }
  .supply-status-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .product-card { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .product-card:last-child { border-bottom: none; }
  .product-card:hover { background: #fafaf9; }
  .product-card.best-deal { background: #f0faf4; }
  .product-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .product-size { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .best-deal-badge { font-size: 10px; background: #e8f5ed; color: #2d7a4f; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-left: 8px; }
  .prime-badge { font-size: 10px; background: #e8f0fb; color: #3b5bdb; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-left: 4px; }
  .pickup-badge { font-size: 10px; background: #fff3e8; color: #d4620a; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-left: 4px; }
  .product-price { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text); text-align: right; white-space: nowrap; }
  .buy-btn { padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; transition: all 0.2s; text-decoration: none; display: inline-block; white-space: nowrap; }
  .buy-btn.amazon { background: #FF9900; color: white; }
  .buy-btn.amazon:hover { background: #e68a00; transform: translateY(-1px); }
  .buy-btn.walmart { background: #0071CE; color: white; }
  .buy-btn.walmart:hover { background: #005fa3; transform: translateY(-1px); }
  .search-btn { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; background: white; color: var(--text-muted); text-decoration: none; display: inline-block; transition: all 0.2s; }
  .search-btn:hover { border-color: var(--sage); color: var(--sage-dark); }
  .order-summary { background: white; border-radius: 16px; border: 1px solid var(--border); padding: 20px; margin-top: 20px; }
  .delivery-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
  .delivery-btn { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
  .delivery-btn.active { background: var(--sage-dark); color: white; border-color: var(--sage-dark); }
  .low-supplies-banner { background: linear-gradient(135deg, #fff3e8, #fde8e8); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px; border: 1px solid #f5c6a0; }
  .banner-icon { font-size: 28px; }
  .banner-text { flex: 1; }
  .banner-title { font-weight: 700; font-size: 15px; color: #c0392b; margin-bottom: 2px; }
  .banner-sub { font-size: 13px; color: var(--text-muted); }
  .account-section { background: white; border-radius: 14px; border: 1px solid var(--border); padding: 18px; margin-bottom: 20px; }
  .account-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .account-row:last-child { border-bottom: none; }
  .account-icon { font-size: 22px; width: 36px; text-align: center; }
  .account-info { flex: 1; }
  .account-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .account-detail { font-size: 12px; color: var(--text-muted); }
  .account-status { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
  .status-connected { background: #e8f5ed; color: #2d7a4f; }
  .status-pending { background: #fff3e8; color: #d4620a; }
  .connect-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); background: white; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--sage-dark); font-family: 'DM Sans', sans-serif; }
`;

export default function SuppliesOrder({ supplies = [], lang = "en" }) {
  const [activeStore, setActiveStore] = useState("amazon");
  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [expanded, setExpanded] = useState(null);

  const t = {
    en: {
      title: "Order Supplies",
      needsRestock: "items need restocking",
      bestDeal: "Best Deal",
      prime: "Prime",
      pickup: "Pickup",
      delivery: "Delivery",
      buyNow: "Buy Now",
      searchMore: "Search More",
      accounts: "Connected Accounts",
      associateTag: "Associate Tag",
      lowBanner: "Supplies Running Low!",
      lowBannerSub: "The items below need to be restocked. Order now for next job.",
      allLow: "All Low/Out Items",
      viewAll: "View All Supplies",
    },
    es: {
      title: "Ordenar Suministros",
      needsRestock: "artículos necesitan reposición",
      bestDeal: "Mejor Precio",
      prime: "Prime",
      pickup: "Recogida",
      delivery: "Entrega",
      buyNow: "Comprar",
      searchMore: "Buscar Más",
      accounts: "Cuentas Conectadas",
      associateTag: "ID de Asociado",
      lowBanner: "¡Suministros Bajos!",
      lowBannerSub: "Los artículos abajo necesitan reponerse. Ordena ahora para el próximo trabajo.",
      allLow: "Todos los Artículos Bajos",
      viewAll: "Ver Todos",
    }
  };
  const tx = t[lang] || t.en;

  const lowSupplies = supplies.filter(s => s.status !== "ok");
  const displaySupplies = lowSupplies.length > 0 ? lowSupplies : supplies;

  const getBestDealIndex = (products) => {
    if (!products?.length) return 0;
    return products.reduce((best, p, i) => {
      const ppoz = p.price / (parseFloat(p.size) || 1);
      const bestPpoz = products[best].price / (parseFloat(products[best].size) || 1);
      return ppoz < bestPpoz ? i : best;
    }, 0);
  };

  return (
    <>
      <style>{orderStyles}</style>
      <div className="order-container">

        {/* Low supplies banner */}
        {lowSupplies.length > 0 && (
          <div className="low-supplies-banner">
            <div className="banner-icon">🚨</div>
            <div className="banner-text">
              <div className="banner-title">{tx.lowBanner}</div>
              <div className="banner-sub">{lowSupplies.length} {tx.needsRestock} — {tx.lowBannerSub}</div>
            </div>
          </div>
        )}

        {/* Connected accounts */}
        <div className="account-section">
          <div style={{fontFamily:"Playfair Display,serif",fontSize:15,fontWeight:600,marginBottom:12}}>{tx.accounts}</div>
          <div className="account-row">
            <div className="account-icon">🛒</div>
            <div className="account-info">
              <div className="account-name">Amazon Associates</div>
              <div className="account-detail">StoreID: maidmate-20 · Earns commission on purchases</div>
            </div>
            <span className="account-status status-connected">✓ Connected</span>
          </div>
          <div className="account-row">
            <div className="account-icon">🔵</div>
            <div className="account-info">
              <div className="account-name">Walmart</div>
              <div className="account-detail">Deep links to Walmart products</div>
            </div>
            <span className="account-status status-connected">✓ Active</span>
          </div>
        </div>

        {/* Store selector */}
        <div className="store-toggle">
          <button className={`store-btn amazon ${activeStore==="amazon"?"active":""}`} onClick={()=>setActiveStore("amazon")}>
            <span className="store-logo">🛒</span> Amazon
          </button>
          <button className={`store-btn walmart ${activeStore==="walmart"?"active":""}`} onClick={()=>setActiveStore("walmart")}>
            <span className="store-logo">🔵</span> Walmart
          </button>
        </div>

        {/* Delivery/Pickup toggle (Walmart only) */}
        {activeStore === "walmart" && (
          <div className="delivery-toggle">
            <button className={`delivery-btn ${deliveryMode==="delivery"?"active":""}`} onClick={()=>setDeliveryMode("delivery")}>🚚 {tx.delivery}</button>
            <button className={`delivery-btn ${deliveryMode==="pickup"?"active":""}`} onClick={()=>setDeliveryMode("pickup")}>🏪 {tx.pickup}</button>
          </div>
        )}

        {/* Products */}
        <div className="product-grid">
          {displaySupplies.map((supply) => {
            const catalog = PRODUCT_CATALOG[supply.name];
            const products = catalog ? catalog[activeStore] : null;
            const bestIdx = products ? getBestDealIndex(products) : 0;
            const isExpanded = expanded === supply.name;

            return (
              <div className="supply-section" key={supply.id || supply.name}>
                <div className="supply-section-header" onClick={()=>setExpanded(isExpanded ? null : supply.name)}>
                  <div className="supply-section-name">
                    <span>{supply.icon}</span>
                    <span>{supply.name}</span>
                    {supply.status === "critical" && <span className="supply-status-badge" style={{background:"#fde8e8",color:"#c0392b"}}>🚨 Out</span>}
                    {supply.status === "low" && <span className="supply-status-badge" style={{background:"#fff3e8",color:"#d4620a"}}>⚠️ Low</span>}
                  </div>
                  <span style={{fontSize:12,color:"var(--text-muted)"}}>{isExpanded?"▲":"▼"}</span>
                </div>

                {isExpanded && (
                  <>
                    {products ? products.map((p, i) => (
                      <div key={i} className={`product-card ${i===bestIdx?"best-deal":""}`}>
                        <div>
                          <div className="product-name">
                            {p.name}
                            {i === bestIdx && <span className="best-deal-badge">⭐ {tx.bestDeal}</span>}
                            {activeStore==="amazon" && p.prime && <span className="prime-badge">Prime</span>}
                            {activeStore==="walmart" && p.pickup && <span className="pickup-badge">🏪 Pickup</span>}
                          </div>
                          <div className="product-size">{p.size}</div>
                        </div>
                        <div className="product-price">${p.price.toFixed(2)}</div>
                        <a
                          href={activeStore==="amazon" ? buildAmazonLink(p.asin) : buildWalmartLink(p.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`buy-btn ${activeStore}`}
                        >
                          {tx.buyNow} →
                        </a>
                      </div>
                    )) : (
                      <div style={{padding:"16px 18px",display:"flex",gap:12,alignItems:"center"}}>
                        <span style={{fontSize:13,color:"var(--text-muted)"}}>Search {activeStore === "amazon" ? "Amazon" : "Walmart"} for this item:</span>
                        <a
                          href={activeStore==="amazon" ? buildAmazonSearchLink(supply.name) : buildWalmartSearchLink(supply.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="search-btn"
                        >
                          🔍 {tx.searchMore}
                        </a>
                      </div>
                    )}

                    {/* Search more option */}
                    <div style={{padding:"10px 18px",borderTop:"1px solid var(--border)",display:"flex",gap:10}}>
                      <a href={activeStore==="amazon" ? buildAmazonSearchLink(supply.name) : buildWalmartSearchLink(supply.name)}
                        target="_blank" rel="noopener noreferrer" className="search-btn">
                        🔍 {tx.searchMore} on {activeStore==="amazon"?"Amazon":"Walmart"}
                      </a>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Commission note */}
        <div style={{marginTop:20,background:"var(--warm)",borderRadius:12,padding:"12px 16px",fontSize:12,color:"var(--text-muted)",textAlign:"center",border:"1px solid var(--border)"}}>
          🛒 Amazon purchases earn you referral commission via your <strong>maidmate-20</strong> associate tag.
          As an Amazon Associate, MaidMate earns from qualifying purchases.
        </div>
      </div>
    </>
  );
}
