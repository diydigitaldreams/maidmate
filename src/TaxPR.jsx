// TaxPR.jsx - Puerto Rico Tax Calculator Module for MaidMate
// Integrates with MaidMate's invoices, trips, and supplies data
// PR Tax law: Código de Rentas Internas de Puerto Rico 2011 (as amended)

import { useState, useEffect } from "react";

// ─── PR TAX BRACKETS (Regular Net Income Method) ─────────────────────────────
// Source: PR Internal Revenue Code, effective 2018+
const PR_BRACKETS = [
  { min: 0,      max: 9000,   rate: 0.00, base: 0 },
  { min: 9001,   max: 25000,  rate: 0.07, base: 0 },
  { min: 25001,  max: 41500,  rate: 0.14, base: 1120 },
  { min: 41501,  max: 61500,  rate: 0.25, base: 3430 },
  { min: 61501,  max: Infinity,rate: 0.33, base: 8430 },
];

// ─── OPTIONAL GROSS INCOME TAX (Self-Employed Services) ──────────────────────
// Available if 80%+ of income is from services
const PR_OPTIONAL_BRACKETS = [
  { min: 0,       max: 100000,  rate: 0.06 },
  { min: 100001,  max: 200000,  rate: 0.08 },
  { min: 200001,  max: 300000,  rate: 0.10 },
  { min: 300001,  max: 400000,  rate: 0.15 },
  { min: 400001,  max: Infinity, rate: 0.20 },
];

// ─── PERSONAL EXEMPTIONS ─────────────────────────────────────────────────────
const EXEMPTIONS = {
  single: 3500,
  married: 7000,
  head_of_household: 7000,
};

// ─── CALCULATE REGULAR NET INCOME TAX ────────────────────────────────────────
function calcRegularTax(netTaxableIncome) {
  if (netTaxableIncome <= 0) return 0;
  for (const b of PR_BRACKETS) {
    if (netTaxableIncome <= b.max) {
      return b.base + (netTaxableIncome - b.min) * b.rate;
    }
  }
  return 0;
}

// ─── CALCULATE OPTIONAL GROSS INCOME TAX ─────────────────────────────────────
function calcOptionalTax(grossIncome) {
  if (grossIncome <= 0) return 0;
  for (const b of PR_OPTIONAL_BRACKETS) {
    if (grossIncome <= b.max) {
      return grossIncome * b.rate;
    }
  }
  return 0;
}

// ─── ALTERNATIVE BASIC TAX (ABT) ─────────────────────────────────────────────
// Applied when regular tax < ABT. Simplified calculation.
function calcABT(netIncome) {
  if (netIncome <= 25000) return 0;
  if (netIncome <= 50000) return (netIncome - 25000) * 0.01;
  if (netIncome <= 75000) return 250 + (netIncome - 50000) * 0.03;
  if (netIncome <= 150000) return 1000 + (netIncome - 75000) * 0.05;
  if (netIncome <= 250000) return 4750 + (netIncome - 150000) * 0.10;
  return 14750 + (netIncome - 250000) * 0.24;
}

const taxStyles = `
  .tax-container { max-width: 900px; }
  .tax-hero { background: linear-gradient(135deg, #4a7060 0%, #2d4a3e 100%); border-radius: 16px; padding: 28px; color: white; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
  .tax-hero-left h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .tax-hero-left p { font-size: 13px; opacity: 0.8; }
  .tax-hero-badge { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 18px; text-align: center; }
  .tax-hero-badge .amount { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; }
  .tax-hero-badge .label { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
  .tax-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .tax-section { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border); }
  .tax-section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .tax-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
  .tax-row:last-child { border-bottom: none; }
  .tax-row-label { color: var(--text-muted); }
  .tax-row-value { font-weight: 600; color: var(--text); }
  .tax-row-value.positive { color: #2d7a4f; }
  .tax-row-value.negative { color: var(--coral); }
  .tax-row-value.highlight { color: var(--sage-dark); font-size: 16px; font-family: 'Playfair Display', serif; }
  .tax-total-row { display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 8px; border-top: 2px solid var(--border); font-size: 16px; font-weight: 700; }
  .method-toggle { display: flex; background: var(--warm); border-radius: 12px; padding: 4px; margin-bottom: 16px; border: 1px solid var(--border); }
  .method-btn { flex: 1; padding: 8px; text-align: center; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; border: none; background: transparent; color: var(--text-muted); font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .method-btn.active { background: var(--sage-dark); color: white; }
  .filing-select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; background: white; color: var(--text); outline: none; margin-bottom: 16px; }
  .tax-input-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .tax-input-row:last-child { border-bottom: none; }
  .tax-input-label { font-size: 13px; color: var(--text); }
  .tax-input-sub { font-size: 11px; color: var(--text-muted); }
  .tax-number-input { width: 110px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; text-align: right; outline: none; }
  .tax-number-input:focus { border-color: var(--sage); }
  .bracket-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .bracket-table th { text-align: left; padding: 8px 10px; background: var(--warm); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  .bracket-table td { padding: 9px 10px; border-bottom: 1px solid var(--border); }
  .bracket-table tr.active-bracket { background: #e8f5ed; }
  .bracket-table tr.active-bracket td { color: #2d7a4f; font-weight: 600; }
  .info-box { background: #e8f0fb; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #3b5bdb; margin-top: 12px; line-height: 1.5; }
  .warning-box { background: #fff3e8; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #d4620a; margin-top: 12px; }
  .export-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--sage-dark); color: white; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .export-btn:hover { background: var(--sage); transform: translateY(-1px); }
  .deduction-pill { display: inline-flex; align-items: center; gap: 6px; background: #e8f5ed; color: #2d7a4f; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin: 4px; }
  .progress-track { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; margin-top: 6px; }
  .progress-fill-tax { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #4a7060, #7a9e87); transition: width 0.5s ease; }
`;

export default function TaxPR({ invoices = [], trips = [], supplies = [], lang = "en" }) {
  const currentYear = new Date().getFullYear() - 1; // Tax year = last year
  const [filingStatus, setFilingStatus] = useState("single");
  const [taxMethod, setTaxMethod] = useState("net"); // net or optional
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [homeOffice, setHomeOffice] = useState(0);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [suppliesExpense, setSuppliesExpense] = useState(0);

  // ─── AUTO-PULL FROM APP DATA ──────────────────────────────────────────────
  const grossIncome = invoices
    .filter(i => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0) + Number(otherIncome);

  const mileageDeduction = trips.reduce((s, t) => s + t.deduction, 0);

  const suppliesDeduction = Number(suppliesExpense);

  const totalDeductions =
    mileageDeduction +
    suppliesDeduction +
    Number(homeOffice) +
    Number(healthInsurance) +
    Number(otherDeductions);

  const personalExemption = EXEMPTIONS[filingStatus] || 3500;
  const dependentExemption = dependents * 1000; // $1,000 per dependent in PR

  const netTaxableIncome = Math.max(
    0,
    grossIncome - totalDeductions - personalExemption - dependentExemption
  );

  // Calculate both methods
  const regularTax = calcRegularTax(netTaxableIncome);
  const abt = calcABT(netTaxableIncome);
  const regularTaxFinal = Math.max(regularTax, abt);
  const optionalTax = calcOptionalTax(grossIncome);

  const estimatedTax = taxMethod === "net" ? regularTaxFinal : optionalTax;
  const effectiveRate = grossIncome > 0 ? ((estimatedTax / grossIncome) * 100).toFixed(1) : 0;

  // Which bracket is the user in?
  const activeBracket = PR_BRACKETS.findIndex(
    b => netTaxableIncome >= b.min && netTaxableIncome <= b.max
  );

  const quarterlyPayment = (estimatedTax / 4).toFixed(2);

  // Quarterly due dates in PR
  const quarterlyDates = ["April 15", "June 15", "September 15", "January 15"];

  const t = {
    en: {
      title: "Puerto Rico Tax Estimator",
      subtitle: `Tax Year ${currentYear} · Hacienda PR`,
      estTax: "Estimated Tax",
      filingStatus: "Filing Status",
      method: "Calculation Method",
      netMethod: "Net Income (Standard)",
      optionalMethod: "Optional Gross (Self-Employed)",
      income: "Income",
      deductions: "Deductions",
      summary: "Tax Summary",
      brackets: "PR Tax Brackets",
      quarterly: "Quarterly Payments",
      grossIncome: "Gross Income (from invoices)",
      otherIncome: "Other Income",
      mileage: "Mileage Deduction (auto)",
      supplies: "Supplies Deduction",
      homeOffice: "Home Office",
      healthIns: "Health Insurance Premiums",
      otherDed: "Other Deductions",
      personalEx: "Personal Exemption",
      dependentEx: "Dependent Exemption",
      dependents: "Number of Dependents",
      netTaxable: "Net Taxable Income",
      regularTax: "Regular Income Tax",
      abt: "Alternative Basic Tax",
      finalTax: "Final Estimated Tax",
      effectiveRate: "Effective Rate",
      quarterly_lbl: "Quarterly Payment (estimate)",
      exportPDF: "Export Tax Summary",
      infoNet: "Standard method: taxed on NET income after all deductions. Best for cleaners with high expenses.",
      infoOptional: "Optional method: taxed on GROSS income at lower rates. Available if 80%+ of income is from services. No deductions apply.",
      warning: "This is an ESTIMATE for planning purposes only. Consult a licensed CPA or accountant in Puerto Rico before filing your Planilla.",
      filingOptions: { single: "Single", married: "Married Filing Jointly", head_of_household: "Head of Household" },
      q1: "Q1 Payment", q2: "Q2 Payment", q3: "Q3 Payment", q4: "Q4 Payment",
    },
    es: {
      title: "Estimado de Contribuciones PR",
      subtitle: `Año Contributivo ${currentYear} · Hacienda PR`,
      estTax: "Contribución Estimada",
      filingStatus: "Estado Civil",
      method: "Método de Cálculo",
      netMethod: "Ingreso Neto (Estándar)",
      optionalMethod: "Ingreso Bruto Opcional (Autónomo)",
      income: "Ingresos",
      deductions: "Deducciones",
      summary: "Resumen Contributivo",
      brackets: "Tablas de Contribución PR",
      quarterly: "Pagos Trimestrales",
      grossIncome: "Ingreso Bruto (de facturas)",
      otherIncome: "Otros Ingresos",
      mileage: "Deducción de Millaje (auto)",
      supplies: "Deducción de Suministros",
      homeOffice: "Oficina en Casa",
      healthIns: "Primas de Seguro Médico",
      otherDed: "Otras Deducciones",
      personalEx: "Exención Personal",
      dependentEx: "Exención por Dependientes",
      dependents: "Número de Dependientes",
      netTaxable: "Ingreso Neto Tributable",
      regularTax: "Contribución Regular",
      abt: "Contribución Básica Alterna",
      finalTax: "Contribución Estimada Final",
      effectiveRate: "Tasa Efectiva",
      quarterly_lbl: "Pago Trimestral (estimado)",
      exportPDF: "Exportar Resumen",
      infoNet: "Método estándar: contribuye sobre el ingreso NETO después de deducciones. Mejor para limpiadoras con muchos gastos.",
      infoOptional: "Método opcional: contribuye sobre el ingreso BRUTO a tasas menores. Disponible si 80%+ del ingreso es por servicios. No aplican deducciones.",
      warning: "Este es un ESTIMADO para planificación solamente. Consulte un CPA o contador autorizado en Puerto Rico antes de rendir su Planilla.",
      filingOptions: { single: "Soltero/a", married: "Casado/a Conjunta", head_of_household: "Jefe/a de Familia" },
      q1: "Pago 1er Trimestre", q2: "Pago 2do Trimestre", q3: "Pago 3er Trimestre", q4: "Pago 4to Trimestre",
    }
  };

  const tx = t[lang] || t.en;

  const fmt = (n) => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <>
      <style>{taxStyles}</style>
      <div className="tax-container">
        {/* Hero */}
        <div className="tax-hero">
          <div className="tax-hero-left">
            <h2>🇵🇷 {tx.title}</h2>
            <p>{tx.subtitle}</p>
            <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <span className="deduction-pill">🚗 {fmt(mileageDeduction)} mileage</span>
              <span className="deduction-pill">🧴 {fmt(suppliesDeduction)} supplies</span>
              <span className="deduction-pill">📋 {invoices.filter(i=>i.status==="Paid").length} paid invoices</span>
            </div>
          </div>
          <div style={{display:"flex",gap:16}}>
            <div className="tax-hero-badge">
              <div className="amount">{fmt(estimatedTax)}</div>
              <div className="label">{tx.estTax}</div>
            </div>
            <div className="tax-hero-badge" style={{marginLeft:12}}>
              <div className="amount">{effectiveRate}%</div>
              <div className="label">{tx.effectiveRate}</div>
            </div>
          </div>
        </div>

        <div className="tax-grid">
          {/* LEFT: Inputs */}
          <div>
            {/* Filing Status */}
            <div className="tax-section" style={{marginBottom:16}}>
              <div className="tax-section-title">⚙️ {tx.filingStatus}</div>
              <select className="filing-select" value={filingStatus} onChange={e=>setFilingStatus(e.target.value)}>
                {Object.entries(tx.filingOptions).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>

              <div className="tax-section-title" style={{marginTop:8}}>📊 {tx.method}</div>
              <div className="method-toggle">
                <button className={`method-btn ${taxMethod==="net"?"active":""}`} onClick={()=>setTaxMethod("net")}>{tx.netMethod}</button>
                <button className={`method-btn ${taxMethod==="optional"?"active":""}`} onClick={()=>setTaxMethod("optional")}>{tx.optionalMethod}</button>
              </div>
              <div className="info-box">{taxMethod==="net"?tx.infoNet:tx.infoOptional}</div>
            </div>

            {/* Income */}
            <div className="tax-section" style={{marginBottom:16}}>
              <div className="tax-section-title">💰 {tx.income}</div>
              <div className="tax-input-row">
                <div><div className="tax-input-label">{tx.grossIncome}</div><div className="tax-input-sub">Auto-pulled from paid invoices</div></div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--sage-dark)"}}>{fmt(grossIncome - Number(otherIncome))}</div>
              </div>
              <div className="tax-input-row">
                <div><div className="tax-input-label">{tx.otherIncome}</div><div className="tax-input-sub">Tips, other sources</div></div>
                <input type="number" className="tax-number-input" value={otherIncome} onChange={e=>setOtherIncome(e.target.value)} placeholder="0" />
              </div>
              <div className="tax-row" style={{paddingTop:12,marginTop:4,borderTop:"2px solid var(--border)",borderBottom:"none"}}>
                <span style={{fontWeight:700}}>Total Gross Income</span>
                <span style={{fontWeight:700,color:"var(--sage-dark)",fontFamily:"Playfair Display,serif",fontSize:16}}>{fmt(grossIncome)}</span>
              </div>
            </div>

            {/* Deductions */}
            {taxMethod === "net" && (
              <div className="tax-section">
                <div className="tax-section-title">📉 {tx.deductions}</div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.mileage}</div><div className="tax-input-sub">{trips.length} trips @ $0.70/mi</div></div>
                  <div style={{fontSize:14,fontWeight:600,color:"#2d7a4f"}}>{fmt(mileageDeduction)}</div>
                </div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.supplies}</div><div className="tax-input-sub">Business supplies purchased</div></div>
                  <input type="number" className="tax-number-input" value={suppliesExpense} onChange={e=>setSuppliesExpense(e.target.value)} placeholder="0" />
                </div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.homeOffice}</div><div className="tax-input-sub">Portion of home used for work</div></div>
                  <input type="number" className="tax-number-input" value={homeOffice} onChange={e=>setHomeOffice(e.target.value)} placeholder="0" />
                </div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.healthIns}</div><div className="tax-input-sub">Self-employed health premiums</div></div>
                  <input type="number" className="tax-number-input" value={healthInsurance} onChange={e=>setHealthInsurance(e.target.value)} placeholder="0" />
                </div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.otherDed}</div></div>
                  <input type="number" className="tax-number-input" value={otherDeductions} onChange={e=>setOtherDeductions(e.target.value)} placeholder="0" />
                </div>
                <div className="tax-input-row">
                  <div><div className="tax-input-label">{tx.dependents}</div></div>
                  <input type="number" className="tax-number-input" value={dependents} onChange={e=>setDependents(Number(e.target.value))} placeholder="0" min="0" max="10" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Summary + Brackets */}
          <div>
            {/* Tax Summary */}
            <div className="tax-section" style={{marginBottom:16}}>
              <div className="tax-section-title">🧾 {tx.summary}</div>

              {taxMethod === "net" ? (
                <>
                  <div className="tax-row"><span className="tax-row-label">Gross Income</span><span className="tax-row-value">{fmt(grossIncome)}</span></div>
                  <div className="tax-row"><span className="tax-row-label">Total Deductions</span><span className="tax-row-value positive">- {fmt(totalDeductions)}</span></div>
                  <div className="tax-row"><span className="tax-row-label">{tx.personalEx} ({tx.filingOptions[filingStatus]})</span><span className="tax-row-value positive">- {fmt(personalExemption)}</span></div>
                  {dependents > 0 && <div className="tax-row"><span className="tax-row-label">{tx.dependentEx} ({dependents}x)</span><span className="tax-row-value positive">- {fmt(dependentExemption)}</span></div>}
                  <div className="tax-row"><span className="tax-row-label">{tx.netTaxable}</span><span className="tax-row-value highlight">{fmt(netTaxableIncome)}</span></div>
                  <div className="tax-row"><span className="tax-row-label">{tx.regularTax}</span><span className="tax-row-value">{fmt(regularTax)}</span></div>
                  <div className="tax-row"><span className="tax-row-label">{tx.abt}</span><span className="tax-row-value">{fmt(abt)}</span></div>
                  <div className="tax-total-row"><span>{tx.finalTax}</span><span style={{color:"var(--coral)",fontFamily:"Playfair Display,serif",fontSize:20}}>{fmt(regularTaxFinal)}</span></div>
                </>
              ) : (
                <>
                  <div className="tax-row"><span className="tax-row-label">Gross Income</span><span className="tax-row-value">{fmt(grossIncome)}</span></div>
                  <div className="tax-row"><span className="tax-row-label">Optional Rate Applied</span><span className="tax-row-value">{PR_OPTIONAL_BRACKETS.find(b=>grossIncome<=b.max)?.rate*100 || 20}%</span></div>
                  <div className="tax-row"><span className="tax-row-label">No deductions (optional method)</span><span className="tax-row-value">—</span></div>
                  <div className="tax-total-row"><span>{tx.finalTax}</span><span style={{color:"var(--coral)",fontFamily:"Playfair Display,serif",fontSize:20}}>{fmt(optionalTax)}</span></div>
                </>
              )}

              {taxMethod === "net" && regularTaxFinal > optionalTax && optionalTax > 0 && (
                <div className="warning-box">💡 Optional method would save you {fmt(regularTaxFinal - optionalTax)}! Consider switching.</div>
              )}
            </div>

            {/* Quarterly Payments */}
            <div className="tax-section" style={{marginBottom:16}}>
              <div className="tax-section-title">📅 {tx.quarterly}</div>
              {[tx.q1,tx.q2,tx.q3,tx.q4].map((q,i)=>(
                <div className="tax-row" key={i}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{q}</div>
                    <div style={{fontSize:12,color:"var(--text-muted)"}}>{quarterlyDates[i]}</div>
                  </div>
                  <span className="tax-row-value">{fmt(quarterlyPayment)}</span>
                </div>
              ))}
              <div style={{marginTop:12,fontSize:12,color:"var(--text-muted)"}}>Pay at: <a href="https://hacienda.pr.gov" target="_blank" style={{color:"var(--sage-dark)"}}>hacienda.pr.gov</a></div>
            </div>

            {/* Brackets Table */}
            <div className="tax-section">
              <div className="tax-section-title">📊 {tx.brackets}</div>
              <table className="bracket-table">
                <thead>
                  <tr><th>Income Range</th><th>Rate</th><th>You're Here</th></tr>
                </thead>
                <tbody>
                  {PR_BRACKETS.map((b,i)=>(
                    <tr key={i} className={i===activeBracket&&taxMethod==="net"?"active-bracket":""}>
                      <td>${b.min.toLocaleString()} – {b.max===Infinity?"+":`$${b.max.toLocaleString()}`}</td>
                      <td>{(b.rate*100).toFixed(0)}%</td>
                      <td>{i===activeBracket&&taxMethod==="net"?"✅":""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="tax-section" style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
            <span style={{color:"var(--text-muted)"}}>Tax as % of gross income</span>
            <span style={{fontWeight:600}}>{effectiveRate}% effective rate</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill-tax" style={{width:`${Math.min(effectiveRate,100)}%`}}></div>
          </div>
        </div>

        {/* Warning */}
        <div style={{background:"#fff3e8",borderRadius:12,padding:"14px 18px",fontSize:13,color:"#d4620a",display:"flex",gap:10,alignItems:"flex-start",marginBottom:20}}>
          <span style={{fontSize:18}}>⚠️</span>
          <span>{tx.warning}</span>
        </div>

        {/* Export button */}
        <div style={{display:"flex",gap:12}}>
          <button className="export-btn" onClick={()=>{
            const summary = `MAIDMATE - PR TAX ESTIMATE ${currentYear}\n${"=".repeat(40)}\nGross Income: ${fmt(grossIncome)}\nTotal Deductions: ${fmt(totalDeductions)}\nNet Taxable Income: ${fmt(netTaxableIncome)}\nEstimated Tax: ${fmt(estimatedTax)}\nEffective Rate: ${effectiveRate}%\nQuarterly Payment: ${fmt(quarterlyPayment)}\n\nGenerated: ${new Date().toLocaleDateString()}`;
            const blob = new Blob([summary], {type:"text/plain"});
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `maidmate-tax-${currentYear}.txt`;
            a.click();
          }}>
            📄 {tx.exportPDF}
          </button>
          <a href="https://hacienda.pr.gov" target="_blank" style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",background:"white",color:"var(--sage-dark)",border:"1px solid var(--sage-dark)",borderRadius:12,fontSize:14,fontWeight:600,textDecoration:"none"}}>
            🏛️ Hacienda PR
          </a>
        </div>
      </div>
    </>
  );
}
