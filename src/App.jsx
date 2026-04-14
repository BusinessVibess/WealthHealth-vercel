import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const BACKEND_URL = "https://wealthhub-production.up.railway.app";

async function fetchIndexQuote(id) {
  if (!BACKEND_URL) throw new Error("No backend URL");
  const res = await fetch(`${BACKEND_URL}/api/quote/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchIndexHistory(id, period) {
  if (!BACKEND_URL) throw new Error("No backend URL");
  const res = await fetch(`${BACKEND_URL}/api/history/${id}?period=${period}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchAllQuotes() {
  if (!BACKEND_URL) throw new Error("No backend URL");
  const res = await fetch(`${BACKEND_URL}/api/all-quotes`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchAssetFromBackend(ticker) {
  if (!BACKEND_URL) throw new Error("No backend");
  const res = await fetch(`${BACKEND_URL}/api/asset?q=${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchAssetHistoryFromBackend(ticker, period) {
  if (!BACKEND_URL) throw new Error("No backend");
  const res = await fetch(`${BACKEND_URL}/api/asset-history?q=${encodeURIComponent(ticker)}&period=${period}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}


const PLATFORMS = [
  { id:"myinvestor", name:"MyInvestor",         color:"#2563EB", icon:"MI" },
  { id:"ibkr",       name:"Interactive Brokers", color:"#3B82F6", icon:"IB" },
  { id:"binance",    name:"Binance",             color:"#F59E0B", icon:"BN" },
  { id:"revolut",    name:"Revolut / Wise",      color:"#0EA5E9", icon:"RV" },
  { id:"trading212", name:"Trading 212",         color:"#10B981", icon:"T2" },
  { id:"indexa",     name:"Indexa Capital",      color:"#6366F1", icon:"IX" },
];

const ASSETS = [
  { tk:"AAPL",   name:"Apple Inc.",           type:"Acciones",         plat:"Interactive Brokers", units:15,   bp:148.20, cp:189.50, mc: 2.1 },
  { tk:"MSFT",   name:"Microsoft Corp.",      type:"Acciones",         plat:"Interactive Brokers", units:10,   bp:242.00, cp:415.30, mc: 1.4 },
  { tk:"NVDA",   name:"NVIDIA Corp.",         type:"Acciones",         plat:"Interactive Brokers", units:8,    bp:220.00, cp:875.40, mc: 5.2 },
  { tk:"AMZN",   name:"Amazon.com Inc.",      type:"Acciones",         plat:"Trading 212",         units:12,   bp:130.00, cp:182.70, mc: 1.8 },
  { tk:"TSLA",   name:"Tesla Inc.",           type:"Acciones",         plat:"MyInvestor",          units:20,   bp:210.00, cp:175.20, mc:-3.4 },
  { tk:"VWCE",   name:"Vanguard FTSE All-W",  type:"ETFs",             plat:"Interactive Brokers", units:50,   bp:88.00,  cp:118.40, mc: 2.3 },
  { tk:"CSPX",   name:"iShares S&P 500",      type:"ETFs",             plat:"MyInvestor",          units:30,   bp:350.00, cp:512.80, mc: 1.9 },
  { tk:"MEUD",   name:"Lyxor MSCI Europe",    type:"ETFs",             plat:"Trading 212",         units:40,   bp:120.00, cp:138.60, mc: 0.8 },
  { tk:"AMUNDI", name:"Amundi MSCI World",    type:"Fondos indexados", plat:"Indexa Capital",      units:180,  bp:140.00, cp:198.20, mc: 2.0 },
  { tk:"VEM",    name:"Vanguard Em. Mkts",    type:"Fondos indexados", plat:"Indexa Capital",      units:95,   bp:90.00,  cp:102.40, mc: 1.1 },
  { tk:"BTC",    name:"Bitcoin",              type:"Criptomonedas",    plat:"Binance",             units:0.18, bp:28000,  cp:65200,  mc:-4.1 },
  { tk:"ETH",    name:"Ethereum",             type:"Criptomonedas",    plat:"Binance",             units:2.4,  bp:1600,   cp:3450,   mc:-5.8 },
  { tk:"SOL",    name:"Solana",               type:"Criptomonedas",    plat:"Binance",             units:18,   bp:40,     cp:145,    mc:-2.3 },
  { tk:"EUR",    name:"Efectivo EUR",         type:"Liquidez",         plat:"Revolut / Wise",      units:9650, bp:1,      cp:1,      mc: 0.0 },
];

const EVO = {
  "1S": [{t:"L",v:208200},{t:"M",v:209100},{t:"X",v:207800},{t:"J",v:210500},{t:"V",v:211820}],
  "1M": [{t:"20f",v:203000},{t:"24f",v:205200},{t:"28f",v:204100},{t:"4m",v:207300},{t:"8m",v:208900},{t:"12m",v:210100},{t:"17m",v:211820}],
  "3M": [{t:"Dic",v:188500},{t:"Ene",v:197000},{t:"Feb",v:203000},{t:"Mar",v:211820}],
  "6M": [{t:"Oct",v:185000},{t:"Nov",v:192000},{t:"Dic",v:188500},{t:"Ene",v:197000},{t:"Feb",v:203000},{t:"Mar",v:211820}],
  "1A": [{t:"Mar24",v:172000},{t:"Jun24",v:181000},{t:"Sep24",v:178500},{t:"Dic24",v:188500},{t:"Mar25",v:211820}],
  "MAX":[{t:"2022",v:140000},{t:"2023",v:158000},{t:"Q124",v:172000},{t:"Q324",v:178500},{t:"Q424",v:188500},{t:"Q125",v:211820}],
};

const PERIODS = [
  { key:"1S",  label:"1 sem",  pct:  1.74, val:  3620 },
  { key:"1M",  label:"1 mes",  pct:  4.35, val:  8820 },
  { key:"3M",  label:"3 meses",pct: 12.40, val: 23320 },
  { key:"6M",  label:"6 meses",pct: 14.50, val: 26820 },
  { key:"1A",  label:"1 año",  pct: 23.15, val: 39820 },
  { key:"MAX", label:"Total",  pct: 51.30, val: 71820 },
];

const TC = {"Acciones":"#2563EB","ETFs":"#6366F1","Fondos indexados":"#10B981","Criptomonedas":"#F59E0B","Liquidez":"#0EA5E9"};
const TYPES = Object.keys(TC);

const ASSET_COLORS = {
  "AAPL":"#2563EB","MSFT":"#7C3AED","NVDA":"#059669","AMZN":"#DC2626","TSLA":"#EA580C",
  "VWCE":"#0891B2","CSPX":"#4F46E5","MEUD":"#A855F7","AMUNDI":"#10B981","VEM":"#34D399",
  "BTC":"#F59E0B","ETH":"#8B5CF6","SOL":"#EC4899","EUR":"#0EA5E9",
};

const fv  = a => a.units * a.cp;
const fc  = a => a.units * a.bp;
const fg  = a => fv(a) - fc(a);
const ftr = a => ((fv(a)-fc(a))/fc(a))*100;
const eur = (n,d=0) => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:d}).format(n);

const TOTAL      = ASSETS.reduce((s,a)=>s+fv(a),0);
const TOTAL_GAIN = ASSETS.reduce((s,a)=>s+fg(a),0);
const TOTAL_COST = ASSETS.reduce((s,a)=>s+fc(a),0);
const TOTAL_RET  = (TOTAL_GAIN/TOTAL_COST)*100;

function Pill({v,size=11}) {
  const p=v>=0;
  return <span style={{fontSize:size,fontWeight:600,fontFamily:"monospace",color:p?"#10B981":"#EF4444",background:p?"#ECFDF5":"#FEF2F2",padding:"2px 7px",borderRadius:20,whiteSpace:"nowrap"}}>{p?"▲ +":"▼ "}{Math.abs(v).toFixed(2)}%</span>;
}

function AssetTreemap() {
  const items=[...ASSETS].sort((a,b)=>fv(b)-fv(a));
  const total=items.reduce((s,a)=>s+fv(a),0);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:3,width:"100%",height:220,overflow:"hidden"}}>
      {items.map(a=>{
        const pct=fv(a)/total,ret=ftr(a),pos=ret>=0;
        return <div key={a.tk} title={`${a.tk} · ${eur(fv(a))} · ${pos?"+":""}${ret.toFixed(2)}%`}
          style={{flexGrow:pct*100,flexShrink:0,flexBasis:`${Math.max(pct*100,3)}%`,minWidth:pct>0.05?60:28,background:TC[a.type],borderRadius:6,padding:7,display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden",opacity:0.9}}>
          {pct>0.03&&<span style={{fontSize:10,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{a.tk}</span>}
          {pct>0.06&&<span style={{fontSize:8,color:"rgba(255,255,255,.6)"}}>{a.name.length>14?a.name.slice(0,13)+"…":a.name}</span>}
          {pct>0.04&&<span style={{fontSize:9,fontWeight:600,fontFamily:"monospace",color:pos?"#A7F3D0":"#FCA5A5",marginTop:"auto"}}>{pos?"+":""}{ret.toFixed(1)}%</span>}
        </div>;
      })}
    </div>
  );
}

function Dashboard() {
  const [animated, setAnimated] = useState(0);
  const [period, setPeriod]     = useState("1M");

  useEffect(()=>{
    let cur=0;const step=TOTAL/60;
    const t=setInterval(()=>{cur+=step;if(cur>=TOTAL){setAnimated(TOTAL);clearInterval(t);}else setAnimated(Math.floor(cur));},16);
    return()=>clearInterval(t);
  },[]);

  const pr = PERIODS.find(p=>p.key===period);
  const evoData = EVO[period];

  const ChartTip=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    return <div style={{background:"rgba(0,0,0,.75)",borderRadius:8,padding:"7px 11px"}}><p style={{fontSize:9,color:"rgba(255,255,255,.5)",marginBottom:2}}>{label}</p><p style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{eur(payload[0].value)}</p></div>;
  };

  return (
    <div style={{padding:"20px 16px 0"}}>
      <div style={{background:"#0F172A",borderRadius:18,padding:"36px 28px 24px",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle, rgba(52,211,153,.1) 0%, transparent 70%)",pointerEvents:"none"}}/>
        <div style={{textAlign:"center",marginBottom:24,position:"relative"}}>
          <p style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:10}}>Patrimonio Total</p>
          <p style={{fontSize:56,fontWeight:700,color:"#FFFFFF",letterSpacing:"-3.5px",fontFamily:"monospace",lineHeight:1}}>{eur(animated)}</p>
          <p style={{fontSize:11,color:"rgba(255,255,255,.25)",marginTop:8}}>{ASSETS.filter(a=>a.type!=="Liquidez").length} activos · {PLATFORMS.length} plataformas</p>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"16px 0",marginBottom:24}}>
          <div style={{flex:1,textAlign:"center",padding:"0 20px"}}>
            <p style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Rentabilidad total</p>
            <p style={{fontSize:28,fontWeight:700,fontFamily:"monospace",letterSpacing:"-1px",lineHeight:1,color:TOTAL_RET>=0?"#34D399":"#F87171"}}>{TOTAL_RET>=0?"+":""}{TOTAL_RET.toFixed(2)}%</p>
          </div>
          <div style={{width:1,height:44,background:"rgba(255,255,255,.1)"}}/>
          <div style={{flex:1,textAlign:"center",padding:"0 20px"}}>
            <p style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Ganancia total</p>
            <p style={{fontSize:28,fontWeight:700,fontFamily:"monospace",letterSpacing:"-1px",lineHeight:1,color:TOTAL_GAIN>=0?"#34D399":"#F87171"}}>{TOTAL_GAIN>=0?"+":""}{eur(TOTAL_GAIN)}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:14,justifyContent:"center"}}>
          {PERIODS.map(p=>(
            <button key={p.key} onClick={()=>setPeriod(p.key)}
              style={{background:period===p.key?"rgba(255,255,255,.15)":"rgba(255,255,255,.05)",color:period===p.key?"#fff":"rgba(255,255,255,.35)",border:`1px solid ${period===p.key?"rgba(255,255,255,.25)":"rgba(255,255,255,.07)"}`,borderRadius:7,padding:"4px 11px",fontSize:11,fontWeight:500,cursor:"pointer",transition:"all .15s"}}>
              {p.key}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={evoData} margin={{top:4,right:0,bottom:0,left:0}}>
            <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.35}/><stop offset="95%" stopColor="#34D399" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="t" tick={{fontSize:8,fill:"rgba(255,255,255,.25)"}} axisLine={false} tickLine={false}/>
            <YAxis hide domain={["auto","auto"]}/>
            <Tooltip content={<ChartTip/>}/>
            <Area type="monotone" dataKey="v" stroke="#34D399" strokeWidth={1.8} fill="url(#hg)" dot={false} activeDot={{r:3,fill:"#34D399",strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"16px 18px",marginBottom:14}}>
        <p style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:12}}>Rentabilidad por periodo</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {PERIODS.map(p=>{
            const pos=p.pct>=0;const active=period===p.key;
            return (
              <div key={p.key} onClick={()=>setPeriod(p.key)}
                style={{borderRadius:10,padding:"11px 13px",border:`1.5px solid ${active?(pos?"#10B981":"#EF4444"):"#F0F1F5"}`,background:active?(pos?"#F0FDF4":"#FEF2F2"):"#FAFBFC",cursor:"pointer",transition:"all .15s"}}>
                <p style={{fontSize:9,fontWeight:600,color:active?(pos?"#059669":"#DC2626"):"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{p.label}</p>
                <p style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:pos?"#10B981":"#EF4444",letterSpacing:"-0.5px",lineHeight:1}}>{pos?"+":""}{p.pct.toFixed(2)}%</p>
                <p style={{fontSize:11,fontFamily:"monospace",color:pos?"#059669":"#DC2626",marginTop:3}}>{pos?"+":""}{eur(p.val)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <DonutCartera/>
      <AssetGroups/>
    </div>
  );
}

function DonutCartera() {
  const [hovered, setHovered] = useState(null);
  const [activeType, setActiveType] = useState("todos");
  const [tooltip, setTooltip] = useState({ visible:false, x:0, y:0, asset:null });

  const donutAssets = [...ASSETS].sort((a,b) => fv(b)-fv(a));
  const total = donutAssets.reduce((s,a) => s+fv(a), 0);

  const typeGroups = TYPES.map(t => {
    const items = donutAssets.filter(a => a.type === t);
    return { type:t, val:items.reduce((s,a)=>s+fv(a),0), color:TC[t], count:items.length };
  }).filter(g => g.val > 0);

  const displayAssets = activeType === "todos" ? donutAssets : donutAssets.filter(a => a.type === activeType);
  const displayTotal = displayAssets.reduce((s,a)=>s+fv(a),0);

  const CX=120, CY=120, R=95, r=58, GAP=0.018;
  let angle = -Math.PI / 2;
  const segments = displayAssets.map(a => {
    const pct = fv(a) / displayTotal;
    const sweep = pct * Math.PI * 2 - GAP;
    if (sweep <= 0) return null;
    const x1=CX+R*Math.cos(angle), y1=CY+R*Math.sin(angle);
    const x2=CX+R*Math.cos(angle+sweep), y2=CY+R*Math.sin(angle+sweep);
    const x3=CX+r*Math.cos(angle+sweep), y3=CY+r*Math.sin(angle+sweep);
    const x4=CX+r*Math.cos(angle), y4=CY+r*Math.sin(angle);
    const lg = sweep > Math.PI ? 1 : 0;
    const seg = { a, pct, path:`M${x1},${y1} A${R},${R} 0 ${lg},1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${lg},0 ${x4},${y4} Z` };
    angle += sweep + GAP;
    return seg;
  }).filter(Boolean);

  const active = hovered ? donutAssets.find(a=>a.tk===hovered) : null;

  const showTooltip = (e, a) => {
    const rect = e.currentTarget.closest('[data-donut-wrap]').getBoundingClientRect();
    setTooltip({ visible:true, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10, asset:a });
    setHovered(a.tk);
  };
  const moveTooltip = (e) => {
    const rect = e.currentTarget.closest('[data-donut-wrap]').getBoundingClientRect();
    setTooltip(t => ({ ...t, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 }));
  };
  const hideTooltip = () => { setTooltip(t => ({ ...t, visible:false })); setHovered(null); };

  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"18px 20px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <p style={{fontSize:13,fontWeight:600,color:"#111827"}}>Composición de cartera</p>
          <p style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>Pasa el ratón sobre un segmento para ver el detalle</p>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <button onClick={()=>setActiveType("todos")} style={{background:activeType==="todos"?"#111827":"none",color:activeType==="todos"?"#fff":"#6B7280",border:"1px solid "+(activeType==="todos"?"#111827":"#E5E7EB"),borderRadius:20,padding:"3px 10px",fontSize:10,cursor:"pointer"}}>Todos</button>
          {typeGroups.map(g=>(
            <button key={g.type} onClick={()=>setActiveType(activeType===g.type?"todos":g.type)}
              style={{background:activeType===g.type?g.color:"none",color:activeType===g.type?"#fff":"#6B7280",border:`1px solid ${activeType===g.type?g.color:"#E5E7EB"}`,borderRadius:20,padding:"3px 10px",fontSize:10,cursor:"pointer",transition:"all .15s"}}>
              {g.type}
            </button>
          ))}
        </div>
      </div>

      <div data-donut-wrap="" style={{position:"relative",display:"grid",gridTemplateColumns:"240px 1fr",gap:20,alignItems:"center"}}>
        {tooltip.visible && tooltip.asset && (() => {
          const a = tooltip.asset;
          const col = ASSET_COLORS[a.tk] || TC[a.type];
          const pct = (fv(a)/total)*100;
          const ret = ftr(a);
          const gain = fg(a);
          const plat = PLATFORMS.find(p=>p.name===a.plat);
          return (
            <div style={{position:"absolute",left:tooltip.x,top:tooltip.y,zIndex:50,background:"#fff",border:`1.5px solid ${col}40`,borderRadius:12,padding:"12px 14px",minWidth:190,boxShadow:"0 8px 32px rgba(0,0,0,.12)",pointerEvents:"none"}}>
              <style>{`@keyframes tipIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #F3F4F6"}}>
                <div style={{width:32,height:32,borderRadius:8,background:col+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:8,fontWeight:700,color:col,fontFamily:"monospace"}}>{a.tk}</span>
                </div>
                <div><p style={{fontSize:12,fontWeight:700,color:"#111827"}}>{a.tk}</p><p style={{fontSize:9,color:"#9CA3AF"}}>{a.name}</p></div>
                <div style={{marginLeft:"auto"}}><span style={{fontSize:9,color:col,background:col+"15",padding:"2px 7px",borderRadius:20,fontWeight:600}}>{a.type}</span></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{label:"Valor actual",val:eur(fv(a)),color:"#111827"},{label:"Peso cartera",val:pct.toFixed(2)+"%",color:col},{label:"Precio compra",val:eur(a.bp,2),color:"#6B7280"},{label:"Precio actual",val:eur(a.cp,2),color:"#111827"},{label:"Ganancia €",val:(gain>=0?"+":"")+eur(gain),color:gain>=0?"#10B981":"#EF4444"},{label:"Rentab. total",val:(ret>=0?"+":"")+ret.toFixed(2)+"%",color:ret>=0?"#10B981":"#EF4444"},{label:"Rentab. mes",val:(a.mc>=0?"+":"")+a.mc.toFixed(2)+"%",color:a.mc>=0?"#10B981":"#EF4444"},{label:"Unidades",val:a.units,color:"#6B7280"}].map(s=>(
                  <div key={s.label}><p style={{fontSize:8,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{s.label}</p><p style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:s.color}}>{s.val}</p></div>
                ))}
              </div>
              {plat && (<div style={{marginTop:9,paddingTop:9,borderTop:"1px solid #F3F4F6",display:"flex",alignItems:"center",gap:5}}><div style={{width:14,height:14,borderRadius:3,background:plat.color+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:5,fontWeight:700,color:plat.color,fontFamily:"monospace"}}>{plat.icon}</span></div><span style={{fontSize:10,color:"#6B7280"}}>{a.plat}</span></div>)}
            </div>
          );
        })()}

        <div style={{flexShrink:0}}>
          <svg width="240" height="240" viewBox="0 0 240 240">
            {segments.map(seg=>(
              <path key={seg.a.tk} d={seg.path} fill={ASSET_COLORS[seg.a.tk]||TC[seg.a.type]} stroke="#fff" strokeWidth="1.5"
                opacity={hovered && hovered!==seg.a.tk ? 0.3 : 1}
                style={{cursor:"pointer",transition:"opacity .15s"}}
                onMouseEnter={e=>showTooltip(e,seg.a)} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}/>
            ))}
            {active ? (
              <>
                <circle cx={CX} cy={CY} r={r-4} fill="#F8F9FC"/>
                <text x={CX} y={CY-18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827" fontFamily="monospace">{active.tk}</text>
                <text x={CX} y={CY-2} textAnchor="middle" fontSize="15" fontWeight="700" fill={ASSET_COLORS[active.tk]||TC[active.type]} fontFamily="monospace">{((fv(active)/total)*100).toFixed(1)}%</text>
                <text x={CX} y={CY+14} textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="monospace">{eur(fv(active))}</text>
                <text x={CX} y={CY+28} textAnchor="middle" fontSize="9" fill={ftr(active)>=0?"#10B981":"#EF4444"} fontFamily="monospace">{ftr(active)>=0?"+":""}{ftr(active).toFixed(1)}%</text>
              </>
            ) : (
              <>
                <circle cx={CX} cy={CY} r={r-4} fill="#F8F9FC"/>
                <text x={CX} y={CY-6} textAnchor="middle" fontSize="10" fill="#9CA3AF">Cartera</text>
                <text x={CX} y={CY+12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827" fontFamily="monospace">{eur(displayTotal)}</text>
              </>
            )}
          </svg>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto"}}>
          {displayAssets.map(a=>{
            const pct=(fv(a)/displayTotal)*100;const ret=ftr(a);const col=ASSET_COLORS[a.tk]||TC[a.type];const isHov=hovered===a.tk;
            return (
              <div key={a.tk} onMouseEnter={e=>showTooltip(e,a)} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}
                style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:isHov?col+"10":"none",cursor:"pointer",border:isHov?`1px solid ${col}30`:"1px solid transparent"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:600,color:"#111827",width:52,fontFamily:"monospace"}}>{a.tk}</span>
                <div style={{flex:1,height:5,background:"#F3F4F6",borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3}}/></div>
                <span style={{fontSize:10,fontFamily:"monospace",color:"#374151",width:36,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                <span style={{fontSize:10,fontFamily:"monospace",color:ret>=0?"#10B981":"#EF4444",width:44,textAlign:"right"}}>{ret>=0?"+":""}{ret.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AssetGroups() {
  const [open,setOpen]=useState(Object.fromEntries(TYPES.map(t=>[t,true])));
  const [sort,setSort]=useState("valor");
  const getSorted=type=>{
    let items=[...ASSETS].filter(a=>a.type===type);
    if(sort==="valor") items.sort((a,b)=>fv(b)-fv(a));
    if(sort==="rentabilidad") items.sort((a,b)=>ftr(b)-ftr(a));
    if(sort==="ganancia") items.sort((a,b)=>fg(b)-fg(a));
    return items;
  };
  const btn=active=>({background:active?"#111827":"none",border:"1px solid "+(active?"#111827":"#E5E7EB"),borderRadius:6,padding:"4px 9px",fontSize:11,color:active?"#fff":"#6B7280",cursor:"pointer"});
  const cols="2fr 1.1fr 0.8fr 0.9fr 0.9fr 0.9fr 0.9fr";

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:"#111827"}}>Mis activos</p>
          <p style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>{ASSETS.filter(a=>a.type!=="Liquidez").length} posiciones · {PLATFORMS.length} plataformas</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:5}}>{PLATFORMS.map(p=>(<div key={p.id} title={p.name} style={{width:22,height:22,borderRadius:5,background:p.color+"18",border:`1px solid ${p.color}30`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:6,fontWeight:700,color:p.color,fontFamily:"monospace"}}>{p.icon}</span></div>))}</div>
          <div style={{width:1,height:16,background:"#E5E7EB"}}/>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontSize:10,color:"#9CA3AF"}}>Ordenar:</span>
            {[["valor","Valor"],["rentabilidad","Rentab."],["ganancia","Ganancia"]].map(([id,l])=>(<button key={id} style={btn(sort===id)} onClick={()=>setSort(id)}>{l}</button>))}
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {TYPES.map(t=>{
          const items=ASSETS.filter(a=>a.type===t);if(!items.length)return null;
          const tv=items.reduce((s,a)=>s+fv(a),0),tg=items.reduce((s,a)=>s+fg(a),0),tc=items.reduce((s,a)=>s+fc(a),0);
          return(
            <div key={t} onClick={()=>setOpen(o=>({...o,[t]:!o[t]}))}
              style={{display:"flex",alignItems:"center",gap:5,background:"#fff",border:`1.5px solid ${open[t]?TC[t]+"80":"#ECEEF3"}`,borderRadius:8,padding:"5px 10px",cursor:"pointer"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:TC[t]}}/>
              <span style={{fontSize:10,fontWeight:600,color:"#374151"}}>{t}</span>
              <span style={{fontSize:10,fontFamily:"monospace",fontWeight:700}}>{eur(tv)}</span>
              <Pill v={tc>0?(tg/tc)*100:0}/>
            </div>
          );
        })}
      </div>

      {TYPES.map(t=>{
        const items=getSorted(t);if(!items.length)return null;
        const gv=items.reduce((s,a)=>s+fv(a),0),gg=items.reduce((s,a)=>s+fg(a),0),gc=items.reduce((s,a)=>s+fc(a),0),gr=gc>0?(gg/gc)*100:0,isOpen=open[t];
        return(
          <div key={t} style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",marginBottom:10,overflow:"hidden"}}>
            <div onClick={()=>setOpen(o=>({...o,[t]:!o[t]}))} style={{display:"flex",alignItems:"center",padding:"11px 16px",cursor:"pointer"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:TC[t],marginRight:8,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:700,color:"#111827",flex:1}}>{t}</span>
              <span style={{fontSize:10,color:"#9CA3AF",marginRight:12}}>{items.length} activos</span>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{textAlign:"right"}}><p style={{fontSize:12,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{eur(gv)}</p><p style={{fontSize:9,color:"#9CA3AF"}}>{((gv/TOTAL)*100).toFixed(1)}% total</p></div>
                <Pill v={gr}/>
                <span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:gg>=0?"#10B981":"#EF4444",minWidth:60,textAlign:"right"}}>{gg>=0?"+":""}{eur(gg)}</span>
                <span style={{fontSize:12,color:"#C4C9D4",transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
              </div>
            </div>
            {isOpen&&<>
              <div style={{display:"grid",gridTemplateColumns:cols,padding:"5px 16px",background:"#FAFBFC",borderTop:"1px solid #F3F4F6",borderBottom:"1px solid #F3F4F6"}}>
                {["Activo","Plataforma","P.compra","P.actual","Mes","Total","Gan. €"].map(h=>(<span key={h} style={{fontSize:8,fontWeight:600,color:"#B0B7C3",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</span>))}
              </div>
              {items.map((a,i)=>{
                const g2=fg(a),r=ftr(a),p=PLATFORMS.find(p=>p.name===a.plat);
                return(
                  <div key={a.tk} style={{display:"grid",gridTemplateColumns:cols,padding:"10px 16px",borderBottom:i<items.length-1?"1px solid #F8F9FC":"none",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:26,height:26,borderRadius:6,background:TC[t]+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:7,fontWeight:700,color:TC[t],fontFamily:"monospace"}}>{a.tk.slice(0,4)}</span></div>
                      <div><p style={{fontSize:12,fontWeight:600,color:"#111827"}}>{a.tk}</p><p style={{fontSize:9,color:"#9CA3AF"}}>{a.units} ud.</p></div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>{p&&<div style={{width:12,height:12,borderRadius:3,background:p.color+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:5,fontWeight:700,color:p.color,fontFamily:"monospace"}}>{p.icon}</span></div>}<span style={{fontSize:9,color:"#6B7280"}}>{a.plat.split(" ")[0]}</span></div>
                    <span style={{fontSize:10,color:"#9CA3AF",fontFamily:"monospace"}}>{eur(a.bp,0)}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"#111827",fontFamily:"monospace"}}>{eur(a.cp,0)}</span>
                    <Pill v={a.mc}/><Pill v={r}/>
                    <span style={{fontSize:10,fontWeight:700,fontFamily:"monospace",color:g2>=0?"#10B981":"#EF4444"}}>{g2>=0?"+":""}{eur(g2)}</span>
                  </div>
                );
              })}
            </>}
          </div>
        );
      })}
    </div>
  );
}

const CRYPTO_IDS = {
  "bitcoin":"bitcoin","btc":"bitcoin","ethereum":"ethereum","eth":"ethereum",
  "solana":"solana","sol":"solana","bnb":"binancecoin","xrp":"ripple",
  "cardano":"cardano","ada":"cardano","dogecoin":"dogecoin","doge":"dogecoin",
  "avax":"avalanche","avalanche":"avalanche","dot":"polkadot","polkadot":"polkadot",
  "link":"chainlink","chainlink":"chainlink","ltc":"litecoin","litecoin":"litecoin",
  "matic":"matic-network","polygon":"matic-network","uni":"uniswap","uniswap":"uniswap",
};

const CRYPTO_NAMES = Object.keys(CRYPTO_IDS);

function looksLikeCrypto(q) {
  const k = q.toLowerCase().trim();
  return CRYPTO_NAMES.some(n => k === n || k === CRYPTO_IDS[n]);
}

async function fetchCryptoReal(query) {
  const q = query.toLowerCase().trim();
  const id = CRYPTO_IDS[q] || q;
  const url = `https://api.coincap.io/v2/assets/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("not found");
  const { data: d } = await res.json();
  if (!d) throw new Error("no data");
  const price  = parseFloat(d.priceUsd) || 0;
  const chg24h = parseFloat(d.changePercent24Hr) || 0;
  const mktCap = parseFloat(d.marketCapUsd) || 0;
  const vol    = parseFloat(d.volumeUsd24Hr) || 0;
  return {
    ticker: d.symbol, name: d.name, type: "Criptomonedas",
    price, currency: "USD", change1d: chg24h, change1m: chg24h*4, change1y: chg24h*52,
    marketCap: formatBig(mktCap), volume: formatBig(vol),
    high52w: price*1.3, low52w: price*0.5,
    description: `${d.name} (${d.symbol}) es la criptomoneda número ${d.rank} por capitalización de mercado.`,
    sector: "Criptomonedas",
    scores: { rentabilidad: Math.min(100,Math.max(10,50+chg24h*2)), riesgo:78, liquidez: Math.min(100,Math.max(20,100-parseInt(d.rank||50))), dividendos:0, estabilidad: Math.max(10,40-Math.abs(chg24h)*2) },
    pros: ["Mercado 24/7 sin interrupciones","Alta liquidez global","Descentralizado"],
    cons: ["Alta volatilidad de precio","Sin respaldo de activos reales","Riesgo regulatorio"],
    realData: true, source: "CoinCap",
  };
}

function formatBig(n) {
  if (!n || isNaN(n)) return "–";
  if (n >= 1e12) return "$"+(n/1e12).toFixed(2)+"T";
  if (n >= 1e9)  return "$"+(n/1e9).toFixed(1)+"B";
  if (n >= 1e6)  return "$"+(n/1e6).toFixed(1)+"M";
  return "$"+n.toLocaleString();
}

const ASSET_CATALOG = [
  {ticker:"AAPL", name:"Apple Inc.",           type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Empresa tecnológica líder en dispositivos, software y servicios digitales.",sector:"Tecnología",scores:{rentabilidad:82,riesgo:35,liquidez:95,dividendos:42,estabilidad:88},pros:["Ecosistema cerrado y fidelización alta","Márgenes y flujo de caja excepcionales"],cons:["Valoración exigente","Saturación mercado iPhone"]},
  {ticker:"MSFT", name:"Microsoft Corp.",       type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Gigante tecnológico líder en cloud (Azure), software empresarial y IA.",sector:"Tecnología",scores:{rentabilidad:85,riesgo:30,liquidez:92,dividendos:45,estabilidad:90},pros:["Azure creciendo a doble dígito","IA integrada en toda la suite Office"],cons:["Competencia intensa en cloud","Regulación antimonopolio"]},
  {ticker:"NVDA", name:"NVIDIA Corp.",          type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Líder mundial en GPUs para IA, data centers y computación acelerada.",sector:"Semiconductores",scores:{rentabilidad:96,riesgo:65,liquidez:90,dividendos:12,estabilidad:55},pros:["Dominio absoluto en chips para IA","Ecosistema CUDA sin competidor real"],cons:["Valoración muy elevada","Alta volatilidad"]},
  {ticker:"AMZN", name:"Amazon.com Inc.",       type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Líder global en e-commerce y cloud computing (AWS).",sector:"Consumo / Tecnología",scores:{rentabilidad:80,riesgo:40,liquidez:90,dividendos:0,estabilidad:75},pros:["AWS motor de margen y crecimiento","Prime crea fidelización masiva"],cons:["Sin dividendo","Márgenes del retail bajos"]},
  {ticker:"TSLA", name:"Tesla Inc.",            type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Pionero en vehículos eléctricos, energía y conducción autónoma.",sector:"Automoción",scores:{rentabilidad:55,riesgo:75,liquidez:88,dividendos:0,estabilidad:35},pros:["Líder en VE con marca fuerte","Negocio de energía en expansión"],cons:["Alta volatilidad","Competencia creciente en VE"]},
  {ticker:"META", name:"Meta Platforms",        type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Dueño de Facebook, Instagram y WhatsApp.",sector:"Tecnología",scores:{rentabilidad:84,riesgo:45,liquidez:88,dividendos:20,estabilidad:70},pros:["3B+ usuarios activos diarios","Publicidad digital sin rival"],cons:["Inversión masiva en metaverso incierta","Regulación de privacidad"]},
  {ticker:"GOOGL",name:"Alphabet Inc.",         type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Holding de Google, YouTube, DeepMind y otras apuestas tecnológicas.",sector:"Tecnología",scores:{rentabilidad:81,riesgo:32,liquidez:90,dividendos:15,estabilidad:82},pros:["Monopolio en búsquedas y publicidad","YouTube segunda red social"],cons:["Competencia de OpenAI en búsqueda","Regulación antimonopolio global"]},
  {ticker:"NFLX", name:"Netflix Inc.",          type:"Acciones", price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Plataforma líder de streaming con más de 270 millones de suscriptores.",sector:"Entretenimiento",scores:{rentabilidad:78,riesgo:48,liquidez:82,dividendos:0,estabilidad:65},pros:["Crecimiento en publicidad y gaming","Contenido original exclusivo"],cons:["Competencia feroz en streaming","Sin dividendo"]},
  {ticker:"SAN",  name:"Banco Santander",       type:"Acciones", price:0,currency:"EUR",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Mayor banco de España y uno de los mayores de Europa.",sector:"Financiero",scores:{rentabilidad:70,riesgo:50,liquidez:88,dividendos:72,estabilidad:60},pros:["Alto dividendo","Diversificación geográfica"],cons:["Riesgo divisa Latam","Entorno de tipos bajando"]},
  {ticker:"BBVA", name:"BBVA",                  type:"Acciones", price:0,currency:"EUR",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Banco español con fuerte presencia en México, Turquía y España.",sector:"Financiero",scores:{rentabilidad:72,riesgo:52,liquidez:85,dividendos:68,estabilidad:58},pros:["Crecimiento en México","Digitalización avanzada"],cons:["Riesgo Turquía","Oferta hostil Sabadell"]},
  {ticker:"ITX",  name:"Inditex",               type:"Acciones", price:0,currency:"EUR",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Dueño de Zara, el mayor grupo de moda del mundo por facturación.",sector:"Consumo discrecional",scores:{rentabilidad:80,riesgo:30,liquidez:78,dividendos:55,estabilidad:82},pros:["Modelo de negocio único fast fashion","Dividendo generoso"],cons:["Competencia de marcas online","Exposición a costes laborales"]},
  {ticker:"ASML", name:"ASML Holding",          type:"Acciones", price:0,currency:"EUR",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Monopolio mundial en máquinas litografía EUV para semiconductores.",sector:"Semiconductores",scores:{rentabilidad:86,riesgo:42,liquidez:72,dividendos:35,estabilidad:78},pros:["Monopolio absoluto en EUV","Demanda asegurada décadas"],cons:["Alta valoración","Restricciones de exportación a China"]},
  {ticker:"SPY",  name:"SPDR S&P 500 ETF",      type:"ETFs",     price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"El ETF más líquido del mundo, replica el índice S&P 500.",sector:"ETF Renta Variable",scores:{rentabilidad:78,riesgo:28,liquidez:99,dividendos:48,estabilidad:82},pros:["Máxima diversificación USA","Costes mínimos","Liquidez perfecta"],cons:["Concentrado en grandes caps","Sin exposición internacional"]},
  {ticker:"QQQ",  name:"Invesco Nasdaq-100 ETF",type:"ETFs",     price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Réplica del Nasdaq-100, concentrado en las 100 mayores tecnológicas.",sector:"ETF Tecnología",scores:{rentabilidad:84,riesgo:38,liquidez:96,dividendos:22,estabilidad:72},pros:["Exposición directa al crecimiento tech","Alta liquidez"],cons:["Concentrado en tech","Mayor volatilidad que S&P"]},
  {ticker:"VWCE", name:"Vanguard FTSE All-World",type:"ETFs",    price:0,currency:"EUR",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"ETF global que replica más de 3.700 empresas de todo el mundo.",sector:"ETF Global",scores:{rentabilidad:76,riesgo:25,liquidez:82,dividendos:42,estabilidad:85},pros:["Diversificación máxima global","TER muy bajo"],cons:["Sin acumulación (distribución)"]},
  {ticker:"IWDA", name:"iShares MSCI World",    type:"ETFs",     price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"ETF de mercados desarrollados que replica el MSCI World Index.",sector:"ETF Global",scores:{rentabilidad:75,riesgo:26,liquidez:85,dividendos:38,estabilidad:84},pros:["Cobertura de 23 países desarrollados","Acumulación (no paga dividendo)"],cons:["Sin exposición a emergentes"]},
  {ticker:"BTC",  name:"Bitcoin",               type:"Criptomonedas",price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Primera criptomoneda del mundo. Reserva de valor digital descentralizada.",sector:"Crypto",scores:{rentabilidad:88,riesgo:78,liquidez:90,dividendos:0,estabilidad:38},pros:["Oro digital y reserva de valor","Adopción institucional creciente"],cons:["Alta volatilidad","Sin flujos de caja","Riesgo regulatorio"]},
  {ticker:"ETH",  name:"Ethereum",              type:"Criptomonedas",price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Plataforma blockchain líder para contratos inteligentes y DeFi.",sector:"Crypto",scores:{rentabilidad:80,riesgo:72,liquidez:88,dividendos:0,estabilidad:42},pros:["Ecosistema DeFi dominante","Staking genera rendimiento"],cons:["Alta volatilidad","Competencia de Solana"]},
  {ticker:"SOL",  name:"Solana",                type:"Criptomonedas",price:0,currency:"USD",change1d:0,change1m:0,change1y:0,marketCap:"–",volume:"–",high52w:0,low52w:0,description:"Blockchain de alta velocidad y bajo coste, rival directo de Ethereum.",sector:"Crypto",scores:{rentabilidad:86,riesgo:82,liquidez:82,dividendos:0,estabilidad:35},pros:["Velocidad y bajo coste","Ecosistema NFT y DeFi en auge"],cons:["Historial de caídas de red","Menos descentralizado que ETH"]},
];

const CATALOG_INDEX = {};
ASSET_CATALOG.forEach(a => {
  [a.ticker.toLowerCase(), a.name.toLowerCase(), ...(a.name.split(" ").map(w=>w.toLowerCase()))].forEach(k => {
    if (!CATALOG_INDEX[k]) CATALOG_INDEX[k] = [];
    if (!CATALOG_INDEX[k].includes(a)) CATALOG_INDEX[k].push(a);
  });
});

function searchCatalog(q) {
  if (!q || q.length < 1) return [];
  const k = q.toLowerCase().trim();
  const results = new Set();
  ASSET_CATALOG.forEach(a => { if (a.ticker.toLowerCase().startsWith(k)) results.add(a); });
  ASSET_CATALOG.forEach(a => { if (a.name.toLowerCase().includes(k)) results.add(a); });
  return [...results].slice(0, 8);
}

function findInCatalog(q) {
  const k = q.toLowerCase().trim();
  return ASSET_CATALOG.find(a =>
    a.ticker.toLowerCase() === k || a.name.toLowerCase() === k ||
    a.name.toLowerCase().includes(k) || k.includes(a.ticker.toLowerCase())
  );
}

// ── fetchStockWithClaude — model string actualizado a claude-sonnet-4-6 ──
async function fetchStockWithClaude(query) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: `Responde SOLO con JSON válido sin markdown:
{"ticker":"","name":"","type":"Acciones|ETFs|Fondos indexados|Bonos","price":0,"currency":"USD|EUR","change1d":0,"change1m":0,"change1y":0,"marketCap":"","volume":"","high52w":0,"low52w":0,"description":"1 frase.","sector":"","scores":{"rentabilidad":50,"riesgo":50,"liquidez":50,"dividendos":30,"estabilidad":50},"pros":["",""],"cons":[""]}
Usa precios aproximados reales. Responde rápido.`,
      messages: [{ role: "user", content: `Datos del activo: ${query}` }]
    })
  });
  const data = await res.json();
  const text = data.content?.map(i => i.type === "text" ? i.text : "").join("") || "";
  const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
  parsed.realData = false;
  return parsed;
}

async function fetchAsset(query) {
  const q = query.trim();
  const catalogHit = findInCatalog(q);
  const ticker = catalogHit ? catalogHit.ticker : q.split(" ")[0].toUpperCase().replace(/[^A-Z0-9.^]/g,"");

  if (looksLikeCrypto(q)) {
    try {
      const data = await fetchCryptoReal(q);
      if (data && data.price > 0) return catalogHit ? {...catalogHit,...data,realData:true} : data;
    } catch(e) {}
  }

  if (BACKEND_URL) {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/asset?q=${ticker}`);
      const d    = await res.json();
      if (d && d.price > 0) {
        const base = {
          ticker: d.ticker || ticker, name: d.name || ticker, type: d.type || "Acciones",
          price: d.price, currency: d.currency || "USD",
          change1d: d.change1d || 0, change1m: d.change1m || 0, change1y: 0,
          changeAbs: d.changeAbs || 0, marketCap: "–", volume: "–",
          high52w: d.high52w || 0, low52w: d.low52w || 0,
          open: d.open || 0, prevClose: d.prevClose || 0,
          description: d.description || `${d.name||ticker} · Yahoo Finance`,
          sector: "–",
          scores: d.scores || {rentabilidad:55,riesgo:50,liquidez:75,dividendos:30,estabilidad:60},
          pros: d.pros || ["Datos reales de Yahoo Finance"], cons: d.cons || [],
          realData: true, source: "Yahoo Finance",
        };
        return catalogHit ? {...catalogHit, ...base, realData:true} : base;
      }
    } catch(e) {}
  }

  if (catalogHit) return {...catalogHit, realData:false, source:"Catalog"};
  return await fetchStockWithClaude(q);
}

function ScoreBar({label,value,color}) {
  return <div style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:"#6B7280"}}>{label}</span><span style={{fontSize:10,fontWeight:600,color:"#374151",fontFamily:"monospace"}}>{value}/100</span></div><div style={{background:"#F3F4F6",borderRadius:4,height:4,overflow:"hidden"}}><div style={{width:`${value}%`,height:"100%",background:color,borderRadius:4}}/></div></div>;
}

function AssetCard({asset,color,label}) {
  const sym=asset.currency==="USD"?"$":"€";
  return (
    <div style={{background:"#fff",borderRadius:12,border:`1.5px solid ${color}30`,padding:"16px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:9,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,color,fontFamily:"monospace"}}>{asset.ticker?.slice(0,4)}</span></div>
        <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:8,fontWeight:600,color,background:color+"15",padding:"2px 6px",borderRadius:20}}>{label}</span><span style={{fontSize:9,color:"#9CA3AF"}}>{asset.type}</span></div><p style={{fontSize:13,fontWeight:700,color:"#111827",marginTop:1}}>{asset.ticker}</p><p style={{fontSize:9,color:"#9CA3AF"}}>{asset.name}</p></div>
        <div style={{textAlign:"right"}}><p style={{fontSize:16,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{sym}{asset.price?.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}</p><Pill v={asset.change1d||0}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
        {[["1 mes",asset.change1m||0,true],["1 año",asset.change1y||0,true],["Máx 52s",`${sym}${asset.high52w?.toLocaleString("es-ES")}`,false]].map(([l,v,isPct])=>(
          <div key={l} style={{background:"#F8F9FC",borderRadius:7,padding:"7px 9px"}}><p style={{fontSize:8,color:"#9CA3AF",marginBottom:2}}>{l}</p>{isPct?<Pill v={v}/>:<p style={{fontSize:10,fontWeight:600,color:"#374151",fontFamily:"monospace"}}>{v}</p>}</div>
        ))}
      </div>
      {asset.scores&&<div style={{marginBottom:9}}><ScoreBar label="Rentabilidad" value={asset.scores.rentabilidad} color={color}/><ScoreBar label="Estabilidad" value={asset.scores.estabilidad} color={color}/><ScoreBar label="Liquidez" value={asset.scores.liquidez} color={color}/><ScoreBar label="Dividendos" value={asset.scores.dividendos} color={color}/></div>}
      {asset.realData && <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"4px 10px",background:"#ECFDF5",borderRadius:20,width:"fit-content"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:9,fontWeight:600,color:"#059669"}}>Datos en tiempo real</span></div>}
      {asset.description && <p style={{fontSize:11,color:"#6B7280",lineHeight:1.5,marginBottom:7}}>{asset.description.slice(0,200)}{asset.description.length>200?"...":""}</p>}
      {asset.pros?.map((p,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:"#10B981",fontSize:11}}>✓</span><span style={{fontSize:11,color:"#374151"}}>{p}</span></div>)}
      {asset.cons?.map((c,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:"#EF4444",fontSize:11}}>✗</span><span style={{fontSize:11,color:"#374151"}}>{c}</span></div>)}
    </div>
  );
}

function ComparisonView({a,b,onClose}) {
  const scoreA=a.scores?Object.values(a.scores).reduce((s,v)=>s+v,0)/5:0;
  const scoreB=b.scores?Object.values(b.scores).reduce((s,v)=>s+v,0)/5:0;
  const metrics=[{label:"Precio",va:`${a.currency==="USD"?"$":"€"}${a.price?.toLocaleString("es-ES",{minimumFractionDigits:2})}`,vb:`${b.currency==="USD"?"$":"€"}${b.price?.toLocaleString("es-ES",{minimumFractionDigits:2})}`,winner:null},{label:"Var. hoy",va_n:a.change1d||0,vb_n:b.change1d||0,winner:(a.change1d||0)>(b.change1d||0)?"a":"b",isPct:true},{label:"Var. 1 mes",va_n:a.change1m||0,vb_n:b.change1m||0,winner:(a.change1m||0)>(b.change1m||0)?"a":"b",isPct:true},{label:"Var. 1 año",va_n:a.change1y||0,vb_n:b.change1y||0,winner:(a.change1y||0)>(b.change1y||0)?"a":"b",isPct:true},{label:"Cap. mercado",va:a.marketCap||"–",vb:b.marketCap||"–",winner:null}];
  const radarData=a.scores&&b.scores?[{metric:"Rentab.",A:a.scores.rentabilidad,B:b.scores.rentabilidad},{metric:"Estabilidad",A:a.scores.estabilidad,B:b.scores.estabilidad},{metric:"Liquidez",A:a.scores.liquidez,B:b.scores.liquidez},{metric:"Dividendos",A:a.scores.dividendos,B:b.scores.dividendos},{metric:"Riesgo",A:a.scores.riesgo,B:b.scores.riesgo}]:[];
  return (
    <div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"14px 18px",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><p style={{fontSize:13,fontWeight:700,color:"#111827"}}>Comparativa</p><button onClick={onClose} style={{background:"none",border:"1px solid #E5E7EB",borderRadius:7,padding:"4px 10px",fontSize:11,color:"#6B7280",cursor:"pointer"}}>← Volver</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:14}}>
          {[a,b].map((asset,idx)=>(<div key={idx} style={{textAlign:idx===0?"left":"right"}}><div style={{display:"flex",alignItems:"center",gap:7,justifyContent:idx===0?"flex-start":"flex-end"}}><div style={{width:30,height:30,borderRadius:8,background:(idx===0?"#2563EB":"#F59E0B")+"18",display:"flex",alignItems:"center",justifyContent:"center",order:idx===1?1:0}}><span style={{fontSize:8,fontWeight:700,color:idx===0?"#2563EB":"#F59E0B",fontFamily:"monospace"}}>{asset.ticker?.slice(0,4)}</span></div><div style={{order:idx===1?0:1}}><p style={{fontSize:12,fontWeight:700,color:"#111827"}}>{asset.ticker}</p><p style={{fontSize:9,color:"#9CA3AF"}}>{asset.name}</p></div></div></div>))}
          <div style={{textAlign:"center"}}><div style={{width:26,height:26,background:"#F3F4F6",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><span style={{fontSize:9,fontWeight:700,color:"#6B7280"}}>VS</span></div></div>
        </div>
        {metrics.map((m,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,padding:"6px 0",borderBottom:i<metrics.length-1?"1px solid #F8F9FC":"none",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:4}}>{m.winner==="a"&&<span style={{fontSize:7,color:"#10B981",background:"#ECFDF5",padding:"1px 4px",borderRadius:10,fontWeight:600}}>✓</span>}{m.isPct?<Pill v={m.va_n}/>:<span style={{fontSize:10,fontWeight:600,color:"#111827",fontFamily:"monospace"}}>{m.va}</span>}</div><p style={{fontSize:9,color:"#9CA3AF",textAlign:"center"}}>{m.label}</p><div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>{m.isPct?<Pill v={m.vb_n}/>:<span style={{fontSize:10,fontWeight:600,color:"#111827",fontFamily:"monospace"}}>{m.vb}</span>}{m.winner==="b"&&<span style={{fontSize:7,color:"#10B981",background:"#ECFDF5",padding:"1px 4px",borderRadius:10,fontWeight:600}}>✓</span>}</div></div>))}
      </div>
      {radarData.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"14px"}}><p style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>Perfil comparativo</p><div style={{display:"flex",gap:8,marginBottom:4}}>{[{t:a.ticker,c:"#2563EB"},{t:b.ticker,c:"#F59E0B"}].map(x=><div key={x.t} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:2,background:x.c}}/><span style={{fontSize:9,color:"#6B7280"}}>{x.t}</span></div>)}</div><ResponsiveContainer width="100%" height={160}><RadarChart data={radarData}><PolarGrid stroke="#F3F4F6"/><PolarAngleAxis dataKey="metric" tick={{fontSize:7,fill:"#9CA3AF"}}/><Radar name={a.ticker} dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={1.5}/><Radar name={b.ticker} dataKey="B" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={1.5}/></RadarChart></ResponsiveContainer></div>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"14px"}}><p style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:10}}>Puntuación global</p>{[{asset:a,color:"#2563EB",score:scoreA},{asset:b,color:"#F59E0B",score:scoreB}].map(({asset,color,score})=>(<div key={asset.ticker} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:600,color:"#111827"}}>{asset.ticker}</span><span style={{fontSize:12,fontWeight:700,color,fontFamily:"monospace"}}>{score.toFixed(0)}/100</span></div><div style={{background:"#F3F4F6",borderRadius:5,height:6,overflow:"hidden",marginBottom:4}}><div style={{width:`${score}%`,height:"100%",background:color,borderRadius:5}}/></div>{asset.scores&&Object.entries(asset.scores).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{fontSize:8,color:"#9CA3AF",textTransform:"capitalize"}}>{k}</span><span style={{fontSize:8,fontWeight:600,color:"#374151",fontFamily:"monospace"}}>{v}</span></div>)}</div>))}</div>
      </div>}
      <div style={{background:scoreA>scoreB?"#ECFDF5":"#FFF7ED",borderRadius:10,border:`1px solid ${scoreA>scoreB?"#A7F3D0":"#FDE68A"}`,padding:"12px 16px",marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:3}}>{scoreA>scoreB?a.ticker:b.ticker} mejor puntuación</p><p style={{fontSize:10,color:"#6B7280",lineHeight:1.5}}>{scoreA>scoreB?`${a.ticker} (${scoreA.toFixed(0)}/100) supera a ${b.ticker} (${scoreB.toFixed(0)}/100).`:`${b.ticker} (${scoreB.toFixed(0)}/100) supera a ${a.ticker} (${scoreA.toFixed(0)}/100).`}</p></div>
    </div>
  );
}

const TYPE_ICON = {
  "Crypto":   { icon:"₿", color:"#F59E0B", bg:"#FFFBEB" },
  "Acciones": { icon:"📈", color:"#2563EB", bg:"#EFF6FF" },
  "ETF":      { icon:"📊", color:"#6366F1", bg:"#EEF2FF" },
  "Índice":   { icon:"🌍", color:"#0891B2", bg:"#ECFEFF" },
};

function getTypeStyle(type) {
  return TYPE_ICON[type] || { icon:"◆", color:"#6B7280", bg:"#F3F4F6" };
}

async function fetchAllMovers() {
  const results = await Promise.allSettled([
    fetch("https://api.coincap.io/v2/assets?limit=200")
      .then(r=>r.json())
      .then(({data}) => (data||[]).map(d=>({
        ticker: d.symbol, name:d.name, type:"Crypto",
        price: parseFloat(d.priceUsd)||0,
        change1d: parseFloat(d.changePercent24Hr)||0,
        currency: "USD", mktCap: formatBig(parseFloat(d.marketCapUsd)),
      })).filter(d=>d.price>0&&!isNaN(d.change1d))),
    BACKEND_URL
      ? fetch(`${BACKEND_URL}/api/all-quotes`).then(r=>r.json()).then(data=>
          Object.entries(data).map(([id,q])=>({
            ticker: id.toUpperCase(),
            name: INDICES.find(i=>i.id===id)?.name || id.toUpperCase(),
            type: "Índice", price: q.price||0, change1d: q.change1d||0, currency: "USD",
          })).filter(m=>m.price>0&&!isNaN(m.change1d))
        )
      : Promise.resolve([]),
  ]);
  const cryptoMovers = results[0].status==="fulfilled" ? results[0].value : [];
  const indexMovers  = results[1].status==="fulfilled" ? results[1].value : [];
  const all = [...cryptoMovers, ...indexMovers];
  const sorted = [...all].sort((a,b)=>b.change1d-a.change1d);
  return { gainers: sorted.slice(0,10), losers: sorted.slice(-10).reverse(), total: all.length };
}

function useTopMovers() {
  const [movers, setMovers] = useState({ gainers:[], losers:[], loading:true, ts:null, total:0 });
  useEffect(() => {
    const load = async () => {
      try {
        const { gainers, losers, total } = await fetchAllMovers();
        setMovers({ gainers: gainers.length>0?gainers:[], losers: losers.length>0?losers:[], total, loading:false, ts: new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}) });
      } catch(e) { setMovers(m => ({ ...m, loading:false })); }
    };
    load();
    const iv = setInterval(load, 120000);
    return () => clearInterval(iv);
  }, []);
  return movers;
}

function MoverCard({ item, pos, onSearch }) {
  const col = pos ? "#10B981" : "#EF4444";
  const bg  = pos ? "#F0FDF4" : "#FEF2F2";
  const sym = item.currency === "EUR" ? "€" : "$";
  const fmtP = (p) => {
    if (!p) return "–";
    if (p < 0.001) return p.toFixed(5);
    if (p < 1)     return p.toFixed(4);
    if (p < 10000) return p.toFixed(2);
    return p.toLocaleString("es-ES",{maximumFractionDigits:2});
  };
  return (
    <div onClick={() => onSearch(item.ticker+" "+item.name)}
      style={{background:"#fff",borderRadius:10,padding:"12px 14px",cursor:"pointer",minWidth:160,flex:"0 0 auto",border:"1px solid #ECEEF3",transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=col+"60";e.currentTarget.style.boxShadow=`0 4px 16px ${col}18`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="#ECEEF3";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${col}25`}}>
          <span style={{fontSize:8,fontWeight:700,color:col,fontFamily:"monospace"}}>{item.ticker.slice(0,5)}</span>
        </div>
        <div style={{minWidth:0}}>
          <p style={{fontSize:12,fontWeight:700,color:"#111827",lineHeight:1}}>{item.ticker}</p>
          <p style={{fontSize:9,color:"#9CA3AF",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:80}}>{item.name.length>12?item.name.slice(0,11)+"…":item.name}</p>
        </div>
      </div>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",fontFamily:"monospace",letterSpacing:"-0.5px",marginBottom:5}}>{fmtP(item.price)} {sym}</p>
      <div style={{display:"inline-flex",alignItems:"center",gap:4,background:bg,borderRadius:6,padding:"3px 8px"}}>
        <span style={{fontSize:11,fontWeight:700,color:col}}>{pos?"↗":"↘"}</span>
        <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"monospace"}}>{pos?"+":""}{item.change1d.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function MoverSection({ title, items, pos, onSearch }) {
  const col  = pos ? "#10B981" : "#EF4444";
  const bg   = pos ? "#F0FDF4" : "#FEF2F2";
  const bord = pos ? "#A7F3D0" : "#FECACA";
  const icon = pos ? "↗" : "↘";
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:28,height:28,borderRadius:8,background:bg,border:`1px solid ${bord}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:700,color:col}}>{icon}</span></div>
        <p style={{fontSize:13,fontWeight:700,color:"#111827"}}>{title}</p>
        <span style={{fontSize:10,color:"#9CA3AF"}}>· Últimas 24h</span>
      </div>
      <div className="no-scrollbar" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
        {items.map(item=>(<MoverCard key={item.ticker+item.name} item={item} pos={pos} onSearch={onSearch}/>))}
      </div>
    </div>
  );
}

function TopMovers({ onSearch }) {
  const { gainers, losers, loading, ts, total } = useTopMovers();
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <p style={{fontSize:14,fontWeight:700,color:"#111827"}}>Movimientos del mercado</p>
          <p style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>Acciones · ETFs · Crypto · Haz clic para ver detalle</p>
        </div>
        {ts && (<div style={{display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",border:"1px solid #A7F3D0",borderRadius:20,padding:"3px 10px"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:10,color:"#059669",fontWeight:500}}>Live · {ts}{total?` · ${total} activos`:""}</span></div>)}
      </div>
      <MoverSection title="Top Subidas" items={gainers} pos={true}  onSearch={onSearch}/>
      <MoverSection title="Top Bajadas" items={losers}  pos={false} onSearch={onSearch}/>
    </div>
  );
}

function PriceChart({ asset }) {
  const [period, setPeriod] = useState("1D");
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const CHART_PERIODS = [
    { key:"5M",  label:"5m"  },{ key:"15M", label:"15m" },{ key:"1H",  label:"1h"  },
    { key:"4H",  label:"4h"  },{ key:"1D",  label:"1D"  },{ key:"1W",  label:"1S"  },
    { key:"1M",  label:"1M"  },{ key:"3M",  label:"3M"  },{ key:"1Y",  label:"1A"  },{ key:"MAX", label:"MAX" },
  ];

  useEffect(() => {
    setLoadingChart(true);
    setTooltip(null);
    const periodMap = {"5M":"1D","15M":"1D","1H":"1D","4H":"1D","1D":"1D","1W":"5D","1M":"1M","3M":"6M","1Y":"1Y","MAX":"MAX"};
    const backendPeriod = periodMap[period] || "1D";

    if (BACKEND_URL && asset.ticker) {
      fetchAssetHistoryFromBackend(asset.ticker, backendPeriod)
        .then(d => {
          if (d.history?.length > 1) { setChartData(d.history.map((p,i)=>({i,v:p.v}))); setLoadingChart(false); return; }
          throw new Error("empty");
        })
        .catch(() => generateFallback());
    } else { generateFallback(); }

    function generateFallback() {
      const pts = period==="5M"?60:period==="15M"?60:period==="1H"?60:period==="4H"?96:period==="1D"?60:period==="1W"?56:period==="1M"?60:period==="3M"?90:period==="1Y"?52:60;
      const base = asset.price||100;
      const vol = period==="5M"?0.002:period==="15M"?0.004:period==="1H"?0.008:period==="4H"?0.015:period==="1D"?0.025:period==="1W"?0.06:period==="1M"?0.12:period==="3M"?0.2:period==="1Y"?0.4:0.7;
      const trend = (asset.change1d||0)/100/pts;
      let v = base*(1-vol*0.5);
      const data = [];
      for(let i=0;i<pts;i++){v=v*(1+trend+(Math.random()-0.49)*vol*0.3);v=Math.max(base*0.3,v);data.push({i,v:parseFloat(v.toFixed(4))});}
      data[data.length-1].v=base;
      setChartData(data);
      setLoadingChart(false);
    }
  }, [period, asset.ticker]);

  const W=600, H=140;
  if (!chartData.length) return <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"16px 18px",marginBottom:12,height:220}}/>;

  const vals=chartData.map(d=>d.v);
  const min=Math.min(...vals), max=Math.max(...vals);
  const pad=(max-min)*0.1||1;
  const norm=(v)=>H-((v-(min-pad))/((max+pad)-(min-pad)))*H;
  const points=chartData.map((d,i)=>`${(i/(chartData.length-1))*W},${norm(d.v)}`).join(" ");
  const fillPts=`0,${H} `+points+` ${W},${H}`;
  const first=chartData[0].v, last=chartData[chartData.length-1].v;
  const pctChg=((last-first)/first)*100;
  const pos=pctChg>=0;
  const col=pos?"#10B981":"#EF4444";
  const sym=asset.currency==="EUR"?"€":"$";

  const handleMouseMove=(e)=>{
    if(!svgRef.current||!chartData.length)return;
    const rect=svgRef.current.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const idx=Math.round((x/rect.width)*(chartData.length-1));
    const clamped=Math.max(0,Math.min(chartData.length-1,idx));
    setTooltip({idx:clamped,x:e.clientX-rect.left,val:chartData[clamped].v});
  };

  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"16px 18px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <p style={{fontSize:13,fontWeight:700,color:"#111827"}}>{asset.ticker} · {asset.name}</p>
            <span style={{fontSize:11,fontFamily:"monospace",fontWeight:700,color:pos?"#10B981":"#EF4444",background:pos?"#ECFDF5":"#FEF2F2",padding:"2px 8px",borderRadius:6}}>{pos?"▲ +":"▼ "}{Math.abs(pctChg).toFixed(2)}%</span>
          </div>
          <p style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:"#111827",marginTop:4,letterSpacing:"-0.5px"}}>{sym}{(tooltip?.val??last).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:4})}</p>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {CHART_PERIODS.map(p=>(<button key={p.key} onClick={()=>setPeriod(p.key)} style={{background:period===p.key?"#111827":"none",color:period===p.key?"#fff":"#6B7280",border:`1px solid ${period===p.key?"#111827":"#E5E7EB"}`,borderRadius:6,padding:"3px 9px",fontSize:10,fontWeight:500,cursor:"pointer"}}>{p.label}</button>))}
        </div>
      </div>
      {loadingChart ? (
        <div style={{height:H,background:"#F8F9FC",borderRadius:8}}/>
      ) : (
        <div style={{position:"relative"}} onMouseLeave={()=>setTooltip(null)}>
          <svg ref={svgRef} width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",cursor:"crosshair"}} onMouseMove={handleMouseMove}>
            <defs><linearGradient id={`cg-${asset.ticker}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.15"/><stop offset="100%" stopColor={col} stopOpacity="0"/></linearGradient></defs>
            <polygon points={fillPts} fill={`url(#cg-${asset.ticker})`}/>
            <polyline points={points} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
            {tooltip && (()=>{const tx=(tooltip.idx/(chartData.length-1))*W;const ty=norm(tooltip.val);return <><line x1={tx} y1={0} x2={tx} y2={H} stroke={col} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/><circle cx={tx} cy={ty} r="4" fill={col} stroke="#fff" strokeWidth="1.5"/></>;})()}
          </svg>
          {tooltip && (<div style={{position:"absolute",left:Math.min(tooltip.x+10,10000),top:8,background:"#111827",color:"#fff",borderRadius:8,padding:"6px 10px",fontSize:11,fontFamily:"monospace",fontWeight:600,pointerEvents:"none",whiteSpace:"nowrap",transform:tooltip.x>W*0.7?"translateX(-110%)":"none"}}>{sym}{tooltip.val.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:4})}</div>)}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
        <span style={{fontSize:9,color:"#C4C9D4",fontFamily:"monospace"}}>{sym}{min.toLocaleString("es-ES",{maximumFractionDigits:2})} mín</span>
        <span style={{fontSize:9,color:"#C4C9D4",fontFamily:"monospace"}}>{sym}{max.toLocaleString("es-ES",{maximumFractionDigits:2})} máx</span>
      </div>
    </div>
  );
}

function Mercado() {
  const [query,        setQuery]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [assetType,    setAssetType]    = useState("Acciones");
  const [sortCol,      setSortCol]      = useState("varPct");
  const [sortDir,      setSortDir]      = useState(-1);
  const [favs,         setFavs]         = useState({});
  const [divisa,       setDivisa]       = useState("Todas");
  const [mercado,      setMercado]      = useState("Todos");
  const [suggestions,  setSuggestions]  = useState([]);
  const [showSugg,     setShowSugg]     = useState(false);
  const [marketLoading,setMarketLoading]= useState(false);
  const [marketData,   setMarketData]   = useState({
    "Acciones": [{symbol:"AAPL",name:"Apple Inc.",currency:"USD"},{symbol:"MSFT",name:"Microsoft Corp.",currency:"USD"},{symbol:"NVDA",name:"NVIDIA Corp.",currency:"USD"},{symbol:"AMZN",name:"Amazon.com",currency:"USD"},{symbol:"TSLA",name:"Tesla Inc.",currency:"USD"},{symbol:"META",name:"Meta Platforms",currency:"USD"},{symbol:"GOOGL",name:"Alphabet Inc.",currency:"USD"},{symbol:"NFLX",name:"Netflix Inc.",currency:"USD"},{symbol:"SAN",name:"Banco Santander",currency:"EUR"},{symbol:"BBVA",name:"BBVA",currency:"EUR"},{symbol:"ITX",name:"Inditex",currency:"EUR"},{symbol:"ASML",name:"ASML Holding",currency:"EUR"}].map(r=>({...r,price:0,varEur:0,varPct:0,vol:0,volEur:0,w1:0})),
    "ETFs": [{symbol:"SPY",name:"SPDR S&P 500 ETF",currency:"USD"},{symbol:"QQQ",name:"Invesco Nasdaq-100",currency:"USD"},{symbol:"VWCE",name:"Vanguard FTSE All-W",currency:"EUR"},{symbol:"CSPX",name:"iShares Core S&P500",currency:"USD"},{symbol:"IWDA",name:"iShares MSCI World",currency:"USD"},{symbol:"EMIM",name:"iShares Emerg. Mkts",currency:"USD"},{symbol:"ARKK",name:"ARK Innovation ETF",currency:"USD"},{symbol:"GLD",name:"SPDR Gold Shares",currency:"USD"}].map(r=>({...r,price:0,varEur:0,varPct:0,vol:0,volEur:0,w1:0})),
    "Crypto": [{symbol:"BTC",name:"Bitcoin",currency:"USD"},{symbol:"ETH",name:"Ethereum",currency:"USD"},{symbol:"SOL",name:"Solana",currency:"USD"},{symbol:"BNB",name:"BNB",currency:"USD"},{symbol:"XRP",name:"Ripple",currency:"USD"},{symbol:"ADA",name:"Cardano",currency:"USD"},{symbol:"AVAX",name:"Avalanche",currency:"USD"},{symbol:"DOGE",name:"Dogecoin",currency:"USD"},{symbol:"LINK",name:"Chainlink",currency:"USD"},{symbol:"DOT",name:"Polkadot",currency:"USD"}].map(r=>({...r,price:0,varEur:0,varPct:0,vol:0,volEur:0,w1:0})),
    "Fondos": [{symbol:"AMUNDI",name:"Amundi MSCI World",currency:"EUR"},{symbol:"VEM",name:"Vanguard Em. Mkts",currency:"EUR"},{symbol:"BLKWLD",name:"BlackRock World",currency:"EUR"},{symbol:"FIDELW",name:"Fidelity World",currency:"EUR"}].map(r=>({...r,price:0,varEur:0,varPct:0,vol:0,volEur:0,w1:0})),
  });
  const ref       = useRef(null);
  const resultRef = useRef(null);

  const CRYPTO_IDS_MAP = {BTC:"bitcoin",ETH:"ethereum",SOL:"solana",BNB:"binancecoin",XRP:"ripple",ADA:"cardano",AVAX:"avalanche",DOGE:"dogecoin",LINK:"chainlink",DOT:"polkadot"};

  useEffect(() => {
    const rows = marketData[assetType] || [];
    setMarketLoading(true);

    if (assetType === "Crypto") {
      const ids = rows.map(r=>CRYPTO_IDS_MAP[r.symbol]||r.symbol.toLowerCase()).join(",");
      fetch(`https://api.coincap.io/v2/assets?ids=${ids}&limit=20`)
        .then(r=>r.json())
        .then(({data})=>{
          const byId={};(data||[]).forEach(d=>{byId[d.id]=d;});
          setMarketData(prev=>({...prev,"Crypto":(prev["Crypto"]||[]).map(row=>{const id=CRYPTO_IDS_MAP[row.symbol]||row.symbol.toLowerCase();const d=byId[id];if(!d)return row;const price=parseFloat(d.priceUsd)||0;const varPct=parseFloat(d.changePercent24Hr)||0;return{...row,price,varPct,varEur:price*varPct/100,vol:parseFloat(d.volumeUsd24Hr||0)/1e9,w1:0};})}));
          setMarketLoading(false);
        })
        .catch(()=>setMarketLoading(false));
    } else if (BACKEND_URL) {
      Promise.all(rows.map(row=>
        fetch(`${BACKEND_URL}/api/asset?q=${row.symbol}`).then(r=>r.json()).then(d=>d.price>0?{symbol:row.symbol,price:d.price,varPct:d.change1d||0,varEur:d.changeAbs||0,vol:0,volEur:0,w1:d.change1m||0,currency:d.currency||row.currency}:null).catch(()=>null)
      )).then(results=>{
        setMarketData(prev=>({...prev,[assetType]:(prev[assetType]||[]).map(row=>{const live=results.find(r=>r&&r.symbol===row.symbol);return live?{...row,...live}:row;})}));
        setMarketLoading(false);
      }).catch(()=>setMarketLoading(false));
    } else { setMarketLoading(false); }
  }, [assetType]);

  const ASSET_TYPES = ["Acciones","ETFs","Crypto","Fondos"];
  const DIVISA_LIST = ["Todas","USD","EUR","GBP","JPY","CHF","CAD","AUD","CNY","BRL","MXN","INR","KRW","SGD"];
  const SYMS2={USD:"$",EUR:"€",GBP:"£",JPY:"¥",CHF:"Fr",CAD:"C$",AUD:"A$",CNY:"¥",BRL:"R$",MXN:"$",INR:"₹",KRW:"₩",SGD:"S$"};
  const RATES2={USD:1,EUR:0.92,GBP:0.79,JPY:151,CHF:0.89,CAD:1.36,AUD:1.53,CNY:7.24,BRL:5.0,MXN:17.2,INR:83,KRW:1330,SGD:1.34};

  const fmt=(n,d=2)=>{if(n===undefined||n===null||n===0)return"–";const abs=Math.abs(n);if(abs>=1e9)return(n/1e9).toFixed(1)+"B";if(abs>=1e6)return(n/1e6).toFixed(1)+"M";if(abs>=1e3)return(n/1e3).toFixed(1)+"K";return n.toFixed(d);};
  const fmtPrice=(p,cur)=>{if(!p)return"–";const toDiv=divisa==="Todas"||divisa===cur?p:(p/(RATES2[cur]||1))*(RATES2[divisa]||1);const sym=divisa==="Todas"?(SYMS2[cur]||"$"):(SYMS2[divisa]||"$");if(toDiv<0.001)return sym+toDiv.toFixed(5);if(toDiv<1)return sym+toDiv.toFixed(4);if(toDiv>=10000)return sym+toDiv.toLocaleString("es-ES",{maximumFractionDigits:0});return sym+toDiv.toFixed(2);};
  const sortData=(data)=>{let filtered=[...data];if(divisa!=="Todas")filtered=filtered.filter(r=>r.currency===divisa||r.price===0);return filtered.sort((a,b)=>{const va=a[sortCol]??0,vb=b[sortCol]??0;return(va<vb?-1:va>vb?1:0)*sortDir;});};

  const SortHdr=({col,label})=>(<span style={{cursor:"pointer",userSelect:"none",display:"inline-flex",alignItems:"center",gap:3,color:"#6B7280",fontSize:11,fontWeight:500}} onClick={()=>{if(sortCol===col)setSortDir(d=>-d);else{setSortCol(col);setSortDir(-1);}}}>{label}<span style={{fontSize:9,color:sortCol===col?"#111827":"#D1D5DB"}}>{sortCol===col?(sortDir>0?"↑":"↓"):"↕"}</span></span>);

  const search=async(q)=>{
    const sq=q||query;if(!sq.trim())return;
    setLoading(true);setResult(null);
    setTimeout(()=>{if(resultRef.current){const y=resultRef.current.getBoundingClientRect().top+window.scrollY-60;window.scrollTo({top:y,behavior:"smooth"});}},150);
    try{const r=await fetchAsset(sq);setResult(r);setTimeout(()=>{if(resultRef.current){const y=resultRef.current.getBoundingClientRect().top+window.scrollY-60;window.scrollTo({top:y,behavior:"smooth"});}},300);}catch(e){setResult({error:true});}
    setLoading(false);
  };

  const handleSearch=(q)=>{setQuery(q);search(q);};

  const W1Spark=({val})=>{
    const pos=val>=0;const pts=[];let v=50;const seed=Math.abs((val||0)*100);
    for(let i=0;i<12;i++){v+=((seed*(i+3)*7)%11)-5+(pos?1:-1);v=Math.max(10,Math.min(90,v));pts.push(v);}
    pts[pts.length-1]=pos?75:25;
    const mn=Math.min(...pts),mx=Math.max(...pts);
    const px=pts.map((p,i)=>`${(i/11)*56},${28-((p-mn)/(mx-mn||1))*24}`).join(" ");
    return <svg width="56" height="28" style={{display:"block"}}><polyline points={px} fill="none" stroke={pos?"#10B981":"#EF4444"} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>;
  };

  return (
    <div style={{padding:"0 0 48px"}}>
      <div style={{textAlign:"center",padding:"32px 20px 24px",background:"#fff",borderBottom:"1px solid #ECEEF3"}}>
        <h1 style={{fontSize:30,fontWeight:800,color:"#111827",letterSpacing:"-1px",marginBottom:8}}>Buscador Global</h1>
        <p style={{fontSize:13,color:"#9CA3AF",marginBottom:22}}>Encuentra acciones, fondos, ETFs, crypto y más · Búsqueda por nombre, ticker o ISIN</p>
        <div style={{maxWidth:700,margin:"0 auto 16px",position:"relative"}}>
          <svg style={{position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",zIndex:1}} width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#9CA3AF" strokeWidth="1.5"/><path d="M14 14L18 18" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input ref={ref} value={query}
            onChange={e=>{const v=e.target.value;setQuery(v);const sugg=searchCatalog(v);setSuggestions(sugg);setShowSugg(sugg.length>0&&v.length>0);}}
            onKeyDown={e=>{if(e.key==="Enter"){setShowSugg(false);search();}if(e.key==="Escape"){setShowSugg(false);}}}
            placeholder="Nombre, ISIN, Ticker... (AAPL, BTC, SAN, ES0144580Y14)"
            style={{width:"100%",padding:"14px 130px 14px 46px",fontSize:14,border:"1.5px solid #E5E7EB",borderRadius:12,outline:"none",color:"#111827",background:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}
            onFocus={e=>{e.target.style.borderColor="#6366F1";if(suggestions.length>0&&query.length>0)setShowSugg(true);}}
            onBlur={e=>{e.target.style.borderColor="#E5E7EB";setTimeout(()=>setShowSugg(false),150);}}
            autoComplete="off"/>
          {showSugg && (
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:"1.5px solid #6366F1",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,.12)",zIndex:50,overflow:"hidden"}}>
              {suggestions.map((s,i)=>{const typeCol=TC[s.type]||"#6B7280";const pos=s.change1d>=0;return(
                <div key={s.ticker} onMouseDown={()=>{setQuery(s.name);setShowSugg(false);handleSearch(s.ticker+" "+s.name);}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:i<suggestions.length-1?"1px solid #F3F4F6":"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F8F9FC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:30,height:30,borderRadius:7,background:typeCol+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:8,fontWeight:700,color:typeCol,fontFamily:"monospace"}}>{s.ticker.slice(0,4)}</span></div>
                  <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{s.ticker}</span><span style={{fontSize:9,color:typeCol,background:typeCol+"12",padding:"1px 6px",borderRadius:20,fontWeight:600}}>{s.type}</span></div><p style={{fontSize:10,color:"#9CA3AF"}}>{s.name}</p></div>
                  <div style={{textAlign:"right"}}><p style={{fontSize:12,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{s.currency==="EUR"?"€":"$"}{s.price?.toLocaleString("es-ES",{maximumFractionDigits:2})}</p><p style={{fontSize:10,fontWeight:600,fontFamily:"monospace",color:pos?"#10B981":"#EF4444"}}>{pos?"▲ +":"▼ "}{Math.abs(s.change1d).toFixed(2)}%</p></div>
                </div>
              );})}
            </div>
          )}
          <button onClick={()=>search()} style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",background:"#111827",color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Buscar</button>
        </div>

        <div style={{maxWidth:780,margin:"0 auto",background:"#F8F9FC",borderRadius:12,padding:"12px 18px",border:"1px solid #ECEEF3"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:600,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".07em"}}>Tipo de activo</span>
            <div style={{display:"flex",gap:5}}>
              {[{l:"Acciones",i:"↗"},{l:"ETFs",i:"▦"},{l:"Crypto",i:"₿"},{l:"Fondos",i:"◎"}].map(t=>(
                <button key={t.l} onClick={()=>setAssetType(t.l)} style={{display:"flex",alignItems:"center",gap:4,background:assetType===t.l?"#111827":"#fff",color:assetType===t.l?"#fff":"#374151",border:"1px solid "+(assetType===t.l?"#111827":"#E5E7EB"),borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:500,cursor:"pointer"}}>
                  <span style={{fontSize:10}}>{t.i}</span>{t.l}
                </button>
              ))}
            </div>
          </div>
          <div style={{height:1,background:"#ECEEF3",margin:"0 0 10px"}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:10,fontWeight:600,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".07em"}}>Divisa</span>
              <select value={divisa} onChange={e=>setDivisa(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:11,color:"#374151",background:"#fff",cursor:"pointer",outline:"none"}}>
                <option value="Todas">Todas las divisas</option>
                {["USD","EUR","GBP","JPY","CHF","CAD","AUD","CNY","BRL","MXN","INR","KRW","SGD"].map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{width:1,height:20,background:"#E5E7EB"}}/>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:10,fontWeight:600,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".07em"}}>Mercado</span>
              <select value={mercado} onChange={e=>setMercado(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:11,color:"#374151",background:"#fff",cursor:"pointer",outline:"none"}}>
                {["Todos","NYSE","NASDAQ","BME","Euronext Paris","LSE","XETRA","TSE","SSE","HKEX","TSX","ASX","B3","NSE","KRX","Crypto"].map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1040,margin:"0 auto",padding:"20px 16px 0"}}>
        <div ref={resultRef}/>
        {loading && (<div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",padding:"28px",textAlign:"center",marginBottom:16}}><div style={{width:26,height:26,border:"3px solid #E5E7EB",borderTopColor:"#6366F1",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 7px"}}/><p style={{fontSize:11,color:"#6B7280"}}>Buscando en el mercado...</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)}
        {result && !result.error && (<div style={{marginBottom:20,animation:"fadeUp .3s ease"}}><style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style><PriceChart asset={result}/><AssetCard asset={result} color={TC[result.type]||"#6B7280"} label=""/></div>)}
        {result?.error && (<div style={{background:"#FEF2F2",borderRadius:10,border:"1px solid #FECACA",padding:"14px",textAlign:"center",marginBottom:16}}><p style={{fontSize:11,color:"#EF4444"}}>No encontrado. Prueba con el ticker exacto (ej: AAPL, BTC, SAN).</p></div>)}
        <TopMovers onSearch={handleSearch}/>

        <div style={{marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <p style={{fontSize:14,fontWeight:700,color:"#111827"}}>Todo el mercado</p>
              {marketLoading && <div style={{width:12,height:12,border:"2px solid #E5E7EB",borderTopColor:"#6366F1",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>}
              {!marketLoading && BACKEND_URL && <span style={{fontSize:10,color:"#10B981",fontWeight:500}}>● Tiempo real</span>}
            </div>
            <div style={{display:"flex",gap:5}}>
              {ASSET_TYPES.map(t=>(<button key={t} onClick={()=>setAssetType(t)} style={{background:assetType===t?"#111827":"#fff",color:assetType===t?"#fff":"#6B7280",border:"1px solid "+(assetType===t?"#111827":"#E5E7EB"),borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:500,cursor:"pointer"}}>{t}</button>))}
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:12,border:"1px solid #ECEEF3",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.8fr 90px",padding:"9px 14px",background:"#FAFBFC",borderBottom:"1px solid #F3F4F6",gap:8,alignItems:"center"}}>
              <span/><SortHdr col="symbol" label="Símbolo"/><SortHdr col="name" label="Nombre"/><SortHdr col="price" label="Precio"/><SortHdr col="varEur" label="Var. €"/><SortHdr col="varPct" label="Var. %"/><SortHdr col="vol" label="Volumen"/><SortHdr col="volEur" label="Vol. €"/><span style={{fontSize:11,fontWeight:500,color:"#6B7280"}}>1S</span>
            </div>
            {sortData(marketData[assetType]||[]).map((row,i)=>{
              const pos=row.varPct>=0;
              return (
                <div key={row.symbol} onClick={()=>handleSearch(row.symbol+" "+row.name)}
                  style={{display:"grid",gridTemplateColumns:"36px 1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.8fr 90px",padding:"10px 14px",borderBottom:"1px solid #F8F9FC",gap:8,alignItems:"center",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span onClick={ev=>{ev.stopPropagation();setFavs(f=>({...f,[row.symbol]:!f[row.symbol]}));}} style={{fontSize:14,cursor:"pointer",color:favs[row.symbol]?"#F59E0B":"#D1D5DB",textAlign:"center"}}>★</span>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:28,height:28,borderRadius:6,background:(TC[assetType]||"#6366F1")+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:7,fontWeight:700,color:TC[assetType]||"#6366F1",fontFamily:"monospace"}}>{row.symbol.slice(0,4)}</span></div><span style={{fontSize:12,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{row.symbol}</span></div>
                  <span style={{fontSize:11,color:"#6B7280",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#111827",fontFamily:"monospace"}}>{fmtPrice(row.price,row.currency)}</span>
                  <span style={{fontSize:11,fontWeight:600,fontFamily:"monospace",color:pos?"#10B981":"#EF4444"}}>{pos?"+":""}{fmt(row.varEur)} {row.currency==="EUR"?"€":"$"}</span>
                  {row.price===0?(<span style={{fontSize:11,color:"#D1D5DB",fontFamily:"monospace"}}>···</span>):(<span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:row.varPct>=0?"#10B981":"#EF4444",background:row.varPct>=0?"#ECFDF5":"#FEF2F2",padding:"2px 7px",borderRadius:6}}>{row.varPct>=0?"▲ +":"▼ "}{Math.abs(row.varPct).toFixed(2)}%</span>)}
                  <span style={{fontSize:11,color:"#6B7280",fontFamily:"monospace"}}>{fmt(row.vol,1)}M</span>
                  <span style={{fontSize:11,color:"#6B7280",fontFamily:"monospace"}}>{fmt(row.volEur)}K</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><W1Spark val={row.w1}/></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const INDICES = [
  {id:"sp500",    name:"S&P 500",          region:"Norteamérica", country:"🇺🇸", color:"#2563EB", value:5234.18, change1d:+0.92,change1w:+1.84,change1m:+3.21,change1y:+18.4, open:5187.20,high:5248.60,low:5183.40,prevClose:5186.33, high52w:5464,low52w:4103, history:[4820,4910,4780,4850,4920,5010,4980,5050,5120,5080,5160,5200,5185,5210,5234]},
  {id:"nasdaq",   name:"NASDAQ 100",       region:"Norteamérica", country:"🇺🇸", color:"#6366F1", value:18421.54,change1d:+1.40,change1w:+2.80,change1m:+5.20,change1y:+26.4, open:18165.20,high:18480.10,low:18102.30,prevClose:18165.20, history:[17200,17450,17100,17320,17600,17820,17750,17980,18100,18050,18200,18280,18180,18340,18421]},
  {id:"dow",      name:"Dow Jones 30",     region:"Norteamérica", country:"🇺🇸", color:"#0891B2", value:39124.36,change1d:+0.56,change1w:+1.12,change1m:+2.40,change1y:+12.8, open:38906.10,high:39200.40,low:38880.20,prevClose:38906.10, history:[37800,38200,37600,37900,38300,38600,38500,38700,38900,38800,39000,39050,38950,39080,39124]},
  {id:"russell",  name:"Russell 2000",     region:"Norteamérica", country:"🇺🇸", color:"#7C3AED", value:2018.42, change1d:-0.38,change1w:-0.82,change1m:+1.10,change1y:+8.2,  open:2026.10,high:2034.80,low:2010.20,prevClose:2026.10, history:[1860,1920,1840,1880,1950,1980,1960,1990,2010,1995,2020,2025,2005,2015,2018]},
  {id:"tsx",      name:"TSX Composite",    region:"Norteamérica", country:"🇨🇦", color:"#0EA5E9", value:21842.10,change1d:+0.38,change1w:+0.72,change1m:+1.90,change1y:+8.4,  open:21758.20,high:21890.40,low:21720.10,prevClose:21758.20, history:[20800,21100,20600,20900,21200,21400,21350,21500,21600,21580,21700,21750,21680,21790,21842]},
  {id:"mexbol",   name:"IPC México",       region:"Norteamérica", country:"🇲🇽", color:"#10B981", value:52840.18,change1d:+0.24,change1w:+0.48,change1m:+1.20,change1y:+5.8,  open:52714.20,high:52910.40,low:52680.10,prevClose:52714.20, history:[49800,50400,49200,50100,51000,51600,51400,51800,52100,52000,52300,52500,52400,52700,52840]},
  {id:"merval",   name:"MERVAL Argentina", region:"Norteamérica", country:"🇦🇷", color:"#F59E0B", value:1284200, change1d:+1.82,change1w:+4.20,change1m:+12.4,change1y:+182.4, open:1261200,high:1292000,low:1254000,prevClose:1261200, history:[420000,520000,680000,780000,890000,980000,1020000,1100000,1180000,1150000,1220000,1250000,1240000,1270000,1284200]},
  {id:"bovespa",  name:"BOVESPA Brasil",   region:"Norteamérica", country:"🇧🇷", color:"#EC4899", value:128420.18,change1d:-0.42,change1w:-0.84,change1m:+0.80,change1y:+12.4, open:128960.20,high:129200.40,low:128100.10,prevClose:128960.20, history:[112000,116000,110000,114000,118000,121000,120000,122000,124000,123000,126000,127000,126500,128000,128420]},
  {id:"ibex",     name:"IBEX 35",          region:"Europa",       country:"🇪🇸", color:"#EF4444", value:11284.20,change1d:+1.24,change1w:+2.10,change1m:+4.80,change1y:+14.2, open:11145.80,high:11310.40,low:11138.20,prevClose:11145.80, history:[10200,10450,10180,10380,10620,10840,10780,10950,11050,11020,11150,11200,11140,11230,11284]},
  {id:"eurostoxx",name:"Euro Stoxx 50",    region:"Europa",       country:"🇪🇺", color:"#F59E0B", value:4982.14, change1d:+0.78,change1w:+1.42,change1m:+3.60,change1y:+11.8, open:4943.20,high:4998.60,low:4938.40,prevClose:4943.20, history:[4600,4720,4580,4680,4780,4860,4840,4900,4940,4920,4960,4970,4950,4975,4982]},
  {id:"dax",      name:"DAX 40",           region:"Europa",       country:"🇩🇪", color:"#10B981", value:18486.21,change1d:+0.64,change1w:+1.28,change1m:+2.80,change1y:+13.4, open:18368.40,high:18520.10,low:18348.20,prevClose:18368.40, history:[17400,17700,17200,17500,17800,18000,17950,18100,18200,18180,18300,18350,18280,18420,18486]},
  {id:"cac",      name:"CAC 40",           region:"Europa",       country:"🇫🇷", color:"#8B5CF6", value:8040.63, change1d:+0.52,change1w:+1.04,change1m:+2.20,change1y:+9.6,  open:7998.20,high:8068.40,low:7990.10,prevClose:7998.20, history:[7400,7600,7350,7500,7650,7780,7760,7840,7900,7880,7940,7960,7930,8010,8040]},
  {id:"ftse",     name:"FTSE 100",         region:"Europa",       country:"🇬🇧", color:"#DC2626", value:8124.92, change1d:+0.28,change1w:+0.54,change1m:+1.20,change1y:+7.2,  open:8101.40,high:8142.20,low:8092.10,prevClose:8101.40, history:[7600,7750,7580,7680,7780,7860,7840,7900,7960,7940,8000,8040,8010,8090,8124]},
  {id:"mib",      name:"FTSE MIB Italia",  region:"Europa",       country:"🇮🇹", color:"#0EA5E9", value:33842.10,change1d:+0.88,change1w:+1.62,change1m:+3.40,change1y:+15.8, open:33544.20,high:33920.40,low:33500.10,prevClose:33544.20, history:[29200,30400,28800,30000,31000,31800,31600,32200,32800,32600,33200,33400,33200,33600,33842]},
  {id:"aex",      name:"AEX Amsterdam",    region:"Europa",       country:"🇳🇱", color:"#F97316", value:884.20,  change1d:+0.72,change1w:+1.40,change1m:+2.60,change1y:+10.4, open:877.80,high:887.40,low:876.20,prevClose:877.80, history:[800,818,794,808,822,840,836,848,858,854,866,872,866,878,884]},
  {id:"smi",      name:"SMI Suiza",        region:"Europa",       country:"🇨🇭", color:"#6366F1", value:11842.40,change1d:+0.32,change1w:+0.64,change1m:+1.80,change1y:+6.4,  open:11804.20,high:11868.40,low:11794.10,prevClose:11804.20, history:[11100,11280,11040,11160,11280,11400,11360,11440,11520,11500,11600,11640,11600,11780,11842]},
  {id:"omxs",     name:"OMX Stockholm",    region:"Europa",       country:"🇸🇪", color:"#14B8A6", value:2482.18, change1d:+0.44,change1w:+0.82,change1m:+2.10,change1y:+8.8,  open:2471.20,high:2488.40,low:2468.10,prevClose:2471.20, history:[2280,2320,2260,2300,2340,2380,2370,2400,2420,2410,2440,2456,2448,2470,2482]},
  {id:"nikkei",   name:"Nikkei 225",       region:"Asia",         country:"🇯🇵", color:"#EC4899", value:38820.49,change1d:-0.84,change1w:-1.20,change1m:+1.80,change1y:+22.4, open:39148.10,high:39210.20,low:38760.40,prevClose:39148.10, history:[33200,34800,33600,35200,36400,37200,37100,37800,38200,38100,38600,38750,38900,39100,38820]},
  {id:"topix",    name:"TOPIX",            region:"Asia",         country:"🇯🇵", color:"#F97316", value:2724.18, change1d:-0.62,change1w:-0.94,change1m:+1.40,change1y:+18.4, open:2741.20,high:2748.40,low:2718.10,prevClose:2741.20, history:[2280,2400,2320,2380,2460,2520,2500,2560,2600,2580,2640,2660,2680,2700,2724]},
  {id:"hsi",      name:"Hang Seng",        region:"Asia",         country:"🇭🇰", color:"#EF4444", value:17284.17,change1d:-1.42,change1w:-2.10,change1m:-3.20,change1y:-8.4,  open:17534.20,high:17560.10,low:17240.30,prevClose:17534.20, history:[20100,19800,18400,18100,18600,18200,17800,17400,17600,17200,17100,17350,17480,17520,17284]},
  {id:"sse",      name:"Shanghai SSE",     region:"Asia",         country:"🇨🇳", color:"#EAB308", value:3048.22, change1d:+0.18,change1w:-0.42,change1m:-1.40,change1y:-4.8,  open:3042.10,high:3058.40,low:3036.20,prevClose:3042.10, history:[3280,3200,3060,3120,3180,3140,3080,3020,3060,3000,3040,3060,3020,3040,3048]},
  {id:"szse",     name:"Shenzhen SZSE",    region:"Asia",         country:"🇨🇳", color:"#84CC16", value:9284.18, change1d:+0.28,change1w:-0.14,change1m:-0.80,change1y:-6.2,  open:9258.20,high:9310.40,low:9248.10,prevClose:9258.20, history:[10200,9800,9400,9600,9800,9600,9400,9200,9300,9100,9200,9280,9220,9260,9284]},
  {id:"kospi",    name:"KOSPI Corea",      region:"Asia",         country:"🇰🇷", color:"#2563EB", value:2648.18, change1d:+0.56,change1w:+1.02,change1m:+2.40,change1y:+6.8,  open:2633.20,high:2654.40,low:2628.10,prevClose:2633.20, history:[2440,2480,2420,2460,2500,2540,2530,2560,2580,2570,2600,2620,2610,2635,2648]},
  {id:"sensex",   name:"BSE Sensex India", region:"Asia",         country:"🇮🇳", color:"#F59E0B", value:74028.42,change1d:+0.82,change1w:+1.64,change1m:+3.20,change1y:+14.8, open:73420.20,high:74180.40,low:73380.10,prevClose:73420.20, history:[64000,66000,62000,65000,68000,70000,69000,71000,72000,71500,73000,73500,73200,73800,74028]},
  {id:"asx200",   name:"ASX 200 Australia",region:"Asia",         country:"🇦🇺", color:"#06B6D4", value:7842.18, change1d:+0.34,change1w:+0.68,change1m:+1.60,change1y:+8.2,  open:7815.20,high:7856.40,low:7808.10,prevClose:7815.20, history:[7200,7340,7180,7280,7380,7480,7460,7540,7600,7580,7660,7700,7680,7800,7842]},
  {id:"straits",  name:"STI Singapur",     region:"Asia",         country:"🇸🇬", color:"#8B5CF6", value:3248.42, change1d:+0.22,change1w:+0.44,change1m:+1.00,change1y:+4.8,  open:3241.20,high:3254.40,low:3238.10,prevClose:3241.20, history:[3080,3120,3060,3100,3140,3180,3170,3200,3220,3210,3230,3240,3235,3244,3248]},
  {id:"tadawul",  name:"Tadawul Arabia",   region:"Oriente Medio / África", country:"🇸🇦", color:"#10B981", value:11842.18,change1d:+0.48,change1w:+0.92,change1m:+2.20,change1y:+6.4, open:11785.20,high:11868.40,low:11772.10,prevClose:11785.20, history:[11000,11200,10900,11100,11300,11500,11480,11560,11640,11620,11700,11740,11720,11800,11842]},
  {id:"egx30",    name:"EGX 30 Egipto",    region:"Oriente Medio / África", country:"🇪🇬", color:"#F59E0B", value:28420.18,change1d:+1.20,change1w:+2.40,change1m:+5.80,change1y:+28.4, open:28082.20,high:28520.40,low:28040.10,prevClose:28082.20, history:[20000,22000,21000,22500,23500,24500,24000,25000,26000,25500,27000,27500,27200,28000,28420]},
  {id:"jse",      name:"JSE Sudáfrica",    region:"Oriente Medio / África", country:"🇿🇦", color:"#EC4899", value:78420.18,change1d:+0.36,change1w:+0.72,change1m:+1.80,change1y:+10.4, open:78138.20,high:78560.40,low:78080.10,prevClose:78138.20, history:[70000,72000,69000,71000,73000,75000,74500,75800,76500,76200,77200,77600,77400,78000,78420]},
];

const REGIONS = ["Norteamérica","Europa","Asia","Oriente Medio / África"];

function IndexSparkline({ data, color, width=120, height=44 }) {
  if (!data || data.length < 2) return null;
  const mn=Math.min(...data), mx=Math.max(...data);
  const range=mx-mn||1, pad=range*0.1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-mn+pad)/(range+pad*2))*height}`).join(" ");
  const fill=`0,${height} `+pts+` ${width},${height}`;
  const pos=data[data.length-1]>=data[0];
  const c=pos?color:"#EF4444";
  return (
    <svg width={width} height={height} style={{display:"block",flexShrink:0}}>
      <defs><linearGradient id={`ig-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="0.2"/><stop offset="100%" stopColor={c} stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill} fill={`url(#ig-${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function IndexCard({ idx, onClick, selected }) {
  const pos=idx.change1d>=0;const col=idx.color;
  return (
    <div onClick={()=>onClick(idx)}
      style={{background:"#fff",borderRadius:12,padding:"14px 16px",cursor:"pointer",border:`1.5px solid ${selected?col:"#ECEEF3"}`,boxShadow:selected?`0 4px 20px ${col}20`:"0 1px 4px rgba(0,0,0,.04)",transition:"all .2s"}}
      onMouseEnter={e=>{if(!selected){e.currentTarget.style.borderColor=col+"60";}}}
      onMouseLeave={e=>{if(!selected){e.currentTarget.style.borderColor="#ECEEF3";}}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
        <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontSize:14}}>{idx.country}</span><span style={{fontSize:11,fontWeight:700,color:"#111827"}}>{idx.name}</span></div><p style={{fontSize:10,color:"#9CA3AF"}}>{idx.region}</p></div>
        <span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:pos?"#10B981":"#EF4444",background:pos?"#ECFDF5":"#FEF2F2",padding:"2px 7px",borderRadius:6}}>{pos?"▲ +":"▼ "}{Math.abs(idx.change1d).toFixed(2)}%</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <p style={{fontSize:18,fontWeight:700,color:"#111827",fontFamily:"monospace",letterSpacing:"-0.5px"}}>{idx.value.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
        <IndexSparkline data={idx.history} color={col} width={100} height={38}/>
      </div>
    </div>
  );
}

function BigChart({ idx, allIndices, onSelect }) {
  const [period,      setPeriod]      = useState("1D");
  const [tooltip,     setTooltip]     = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loadingHist, setLoadingHist] = useState(false);
  const [backendOk,   setBackendOk]   = useState(!!BACKEND_URL);
  const svgRef = useRef(null);

  const CHART_PERIODS = [{k:"1D",l:"1 D"},{k:"5D",l:"5 D"},{k:"1M",l:"1 M"},{k:"6M",l:"6 M"},{k:"YTD",l:"YTD"},{k:"1Y",l:"1 A"},{k:"5Y",l:"5 A"},{k:"MAX",l:"Máx."}];

  useEffect(() => {
    if (!BACKEND_URL) { setHistoryData(null); return; }
    setLoadingHist(true);
    fetchIndexHistory(idx.id, period)
      .then(d => { if (d.history?.length>1) { setHistoryData(d.history.map(p=>p.v)); setBackendOk(true); } setLoadingHist(false); })
      .catch(() => { setLoadingHist(false); setBackendOk(false); });
  }, [period, idx.id]);

  const getFallbackHistory = () => {
    const last=idx.value;
    const pts=period==="1D"?78:period==="5D"?75:period==="1M"?30:period==="6M"?126:period==="YTD"?60:period==="1Y"?252:period==="5Y"?260:120;
    const vol=period==="1D"?0.002:period==="5D"?0.006:period==="1M"?0.025:period==="6M"?0.06:period==="YTD"?0.05:period==="1Y"?0.18:period==="5Y"?0.45:0.7;
    const chg=period==="1D"?idx.change1d:period==="5D"?idx.change1w||0:period==="1M"?idx.change1m||0:period==="6M"?(idx.change1m||0)*2:period==="YTD"?(idx.change1m||0)*3:period==="1Y"?idx.change1y||0:(idx.change1y||0)*5;
    const trend=(chg/100)/pts;let v=last*(1-vol*0.5);const seed=idx.id.charCodeAt(0)*7+3;const data=[];
    for(let i=0;i<pts;i++){v=v*(1+trend+((seed*(i+11)*17)%19-9)*vol*0.015);v=Math.max(last*0.3,v);data.push(parseFloat(v.toFixed(2)));}
    data[data.length-1]=last;return data;
  };

  const data=(backendOk&&historyData)?historyData:getFallbackHistory();
  const isRealHistory=backendOk&&historyData;
  const W=560, H=220;
  const mn=Math.min(...data), mx=Math.max(...data);
  const pad=(mx-mn)*0.12||(idx.value*0.01);
  const yMin=mn-pad, yMax=mx+pad;
  const normX=i=>(i/(data.length-1))*W;
  const normY=v=>H-((v-yMin)/(yMax-yMin))*H;
  const pts=data.map((v,i)=>`${normX(i)},${normY(v)}`).join(" ");
  const fill=`0,${H} `+pts+` ${W},${H}`;
  const pos=data[data.length-1]>=data[0];
  const pctChg=((data[data.length-1]-data[0])/data[0])*100;
  const absChg=data[data.length-1]-data[0];
  const col=pos?"#1a73e8":"#ea4335";
  const prevCloseLine=normY(idx.prevClose||data[0]);
  const curVal=tooltip?.val??idx.value;

  const yTicks=[];
  for(let i=0;i<=5;i++){yTicks.push(yMin+(yMax-yMin)*(i/5));}

  const getTimeLabels=()=>{
    if(period==="1D")return["10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
    if(period==="5D")return["Lun","Mar","Mié","Jue","Vie"];
    if(period==="1M")return["Sem 1","Sem 2","Sem 3","Sem 4"];
    if(period==="6M")return["Oct","Nov","Dic","Ene","Feb","Mar"];
    if(period==="YTD")return["Ene","Feb","Mar","Abr","May","Jun"];
    if(period==="1Y")return["Abr","Jun","Ago","Oct","Dic","Mar"];
    return["2020","2021","2022","2023","2024","2025"];
  };

  const handleMM=(e)=>{
    if(!svgRef.current)return;
    const rect=svgRef.current.getBoundingClientRect();
    const x=e.clientX-rect.left;const frac=x/rect.width;
    const i=Math.max(0,Math.min(data.length-1,Math.round(frac*(data.length-1))));
    setTooltip({idx:i,x:normX(i)/W*rect.width,val:data[i]});
  };

  const related=allIndices?allIndices.filter(ix=>ix.region===idx.region&&ix.id!==idx.id).slice(0,4):[];
  const fmtNum=n=>(!n||n===0)?"–":n.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2});

  return (
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #ECEEF3",padding:"24px 28px 20px",marginBottom:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:32}}>
        <div>
          <div style={{marginBottom:2}}>
            <h2 style={{fontSize:26,fontWeight:700,color:"#202124",letterSpacing:"-0.5px",lineHeight:1.2}}>{idx.country} {idx.name}</h2>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
              <p style={{fontSize:12,color:"#5f6368"}}>{idx.region}</p>
              {isRealHistory?(<span style={{fontSize:10,color:"#1e8e3e",background:"#e6f4ea",padding:"1px 7px",borderRadius:20,fontWeight:500}}>● Datos reales · Yahoo Finance</span>):(<span style={{fontSize:10,color:"#e37400",background:"#fef3e2",padding:"1px 7px",borderRadius:20,fontWeight:500}}>{BACKEND_URL?"⟳ Cargando...":"⚠ Gráfico ilustrativo"}</span>)}
            </div>
          </div>
          <div style={{marginTop:14,marginBottom:4}}><span style={{fontSize:42,fontWeight:400,color:"#202124",letterSpacing:"-1.5px",lineHeight:1}}>{fmtNum(curVal)}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:14,color:pos?"#1e8e3e":"#d93025",fontWeight:500}}>{pos?"+":""}{fmtNum(absChg)} ({pos?"+":""}{pctChg.toFixed(2)}%)</span><span style={{fontSize:13,color:"#5f6368"}}>hoy</span></div>
          <p style={{fontSize:11,color:"#9aa0a6",marginBottom:16}}>{new Date().toLocaleDateString("es-ES",{day:"numeric",month:"short"})} · GMT+1</p>

          <div style={{display:"flex",gap:0,borderBottom:"1px solid #e0e0e0",marginBottom:0}}>
            {CHART_PERIODS.map(p=>(
              <button key={p.k} onClick={()=>{setPeriod(p.k);setTooltip(null);}} style={{background:"none",border:"none",padding:"6px 14px 8px",fontSize:12,fontWeight:period===p.k?600:400,color:period===p.k?col:"#5f6368",cursor:"pointer",position:"relative"}}>
                {p.l}{period===p.k&&<span style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:col,borderRadius:"2px 2px 0 0"}}/>}
              </button>
            ))}
          </div>

          <div style={{position:"relative",display:"flex",gap:0}} onMouseLeave={()=>setTooltip(null)}>
            <div style={{width:64,flexShrink:0,position:"relative",height:H+8}}>
              {yTicks.map((v,i)=>(<div key={i} style={{position:"absolute",right:6,bottom:`${(i/5)*100}%`,fontSize:10,color:"#80868b",fontFamily:"monospace",whiteSpace:"nowrap",transform:"translateY(50%)"}}>{v.toLocaleString("es-ES",{maximumFractionDigits:0})}</div>))}
            </div>
            <div style={{flex:1,position:"relative"}}>
              <svg ref={svgRef} width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",cursor:"crosshair"}} onMouseMove={handleMM}>
                <defs><linearGradient id={`gc-${idx.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.15"/><stop offset="100%" stopColor={col} stopOpacity="0.01"/></linearGradient></defs>
                {yTicks.map((v,i)=>(<line key={i} x1={0} y1={normY(v)} x2={W} y2={normY(v)} stroke="#e8eaed" strokeWidth="1"/>))}
                {idx.prevClose&&(<><line x1={0} y1={prevCloseLine} x2={W*0.92} y2={prevCloseLine} stroke="#80868b" strokeWidth="1" strokeDasharray="4,4"/><text x={W*0.93} y={prevCloseLine-4} fontSize="9" fill="#80868b">Cierre</text><text x={W*0.93} y={prevCloseLine+8} fontSize="9" fill="#80868b">Anterior</text><text x={W*0.93} y={prevCloseLine+20} fontSize="9" fill="#80868b" fontWeight="600">{fmtNum(idx.prevClose)}</text></>)}
                <polygon points={fill} fill={`url(#gc-${idx.id})`}/>
                <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
                {tooltip&&(()=>{const tx=normX(tooltip.idx);const ty=normY(tooltip.val);return<><line x1={tx} y1={0} x2={tx} y2={H} stroke="#bdc1c6" strokeWidth="1"/><circle cx={tx} cy={ty} r="5" fill={col} stroke="#fff" strokeWidth="2"/></>;})()}
              </svg>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4,paddingLeft:4,paddingRight:4}}>
                {getTimeLabels().map((l,i)=>(<span key={i} style={{fontSize:10,color:"#80868b"}}>{l}</span>))}
              </div>
              {tooltip&&(<div style={{position:"absolute",left:tooltip.x>W*0.65?"auto":tooltip.x+12,right:tooltip.x>W*0.65?(W-tooltip.x)+8:"auto",top:8,background:"#fff",border:"1px solid #dadce0",borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:600,color:"#202124",pointerEvents:"none",boxShadow:"0 2px 8px rgba(0,0,0,.12)",whiteSpace:"nowrap"}}>{fmtNum(tooltip.val)}</div>)}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px 20px",marginTop:18,paddingTop:14,borderTop:"1px solid #f1f3f4"}}>
            {[{l:"Apertura",v:fmtNum(idx.open)},{l:"Mínimo",v:fmtNum(idx.low)},{l:"Alto 52 s.",v:fmtNum(idx.high52w??(idx.value*1.18))},{l:"Máximo",v:fmtNum(idx.high)},{l:"Cierre ant.",v:fmtNum(idx.prevClose)},{l:"Bajo 52 s.",v:fmtNum(idx.low52w??(idx.value*0.78))}].map(s=>(<div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#5f6368"}}>{s.l}</span><span style={{fontSize:12,fontWeight:600,color:"#202124",fontFamily:"monospace"}}>{s.v}</span></div>))}
          </div>
        </div>

        <div>
          <div style={{background:"#f8f9fa",borderRadius:12,padding:"16px 14px"}}>
            <p style={{fontSize:13,fontWeight:600,color:"#202124",marginBottom:12}}>Mercados relacionados</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {related.length>0?related.map((ix,i)=>{const rPos=ix.change1d>=0;return(<div key={ix.id} onClick={()=>onSelect(ix)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",cursor:"pointer",borderBottom:i<related.length-1?"1px solid #e8eaed":"none",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background="#eeeeee"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:28,height:28,borderRadius:6,background:"#e8eaed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10}}>{ix.country}</span></div><div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:500,color:"#202124"}}>{ix.name}</p><p style={{fontSize:11,color:"#5f6368",fontFamily:"monospace"}}>{fmtNum(ix.value)}</p></div><span style={{fontSize:12,fontWeight:600,color:rPos?"#1e8e3e":"#d93025",background:rPos?"#e6f4ea":"#fce8e6",padding:"3px 8px",borderRadius:6,flexShrink:0,fontFamily:"monospace"}}>{rPos?"↑ +":"↓ "}{Math.abs(ix.change1d).toFixed(2)}%</span></div>);}):(<p style={{fontSize:11,color:"#9aa0a6",textAlign:"center",padding:"12px 0"}}>Sin índices relacionados</p>)}
            </div>
          </div>
          <div style={{marginTop:14,background:"#f8f9fa",borderRadius:12,padding:"14px"}}>
            <p style={{fontSize:12,fontWeight:600,color:"#5f6368",marginBottom:10,textTransform:"uppercase",letterSpacing:".06em"}}>Variaciones</p>
            {[{l:"Hoy",v:pctChg,abs:absChg},{l:"1 semana",v:idx.change1w||0,abs:null},{l:"1 mes",v:idx.change1m||0,abs:null},{l:"1 año",v:idx.change1y||0,abs:null}].map(s=>{const sp=s.v>=0;return(<div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:12,color:"#5f6368"}}>{s.l}</span><span style={{fontSize:12,fontWeight:600,color:sp?"#1e8e3e":"#d93025",fontFamily:"monospace"}}>{sp?"+":""}{s.v.toFixed(2)}%</span></div>);})}
          </div>
        </div>
      </div>
    </div>
  );
}

function MercadosGlobales() {
  const [selected,    setSelected]    = useState(INDICES[0]);
  const [liveData,    setLiveData]    = useState({});
  const [loadingIdx,  setLoadingIdx]  = useState(null);
  const [liveIndices, setLiveIndices] = useState(INDICES);
  const chartRef = useRef(null);

  const merge=(base,live)=>live?{...base,...live}:base;

  const loadIndex=async(ix)=>{
    if(liveData[ix.id]){setSelected(prev=>prev.id===ix.id?{...prev,...liveData[ix.id]}:prev);return liveData[ix.id];}
    setLoadingIdx(ix.id);
    try{
      const real=await fetchIndexQuote(ix.id);
      const merged={value:real.price||ix.value,change1d:real.change1d??ix.change1d,changeAbs:real.changeAbs??0,open:real.open||real.prevClose||ix.open,high:real.high||ix.high,low:real.low||ix.low,prevClose:real.prevClose||ix.prevClose,high52w:real.high52w||ix.high52w,low52w:real.low52w||ix.low52w,change1w:real.change1w??ix.change1w,time:real.time};
      setLiveData(prev=>({...prev,[ix.id]:merged}));
      setLiveIndices(prev=>prev.map(i=>i.id===ix.id?{...i,...merged}:i));
      setSelected(prev=>prev.id===ix.id?{...prev,...merged}:prev);
      setLoadingIdx(null);return merged;
    }catch(e){setLoadingIdx(null);return null;}
  };

  const handleSelect=async(idx)=>{
    setSelected(idx);
    setTimeout(()=>{if(chartRef.current){const y=chartRef.current.getBoundingClientRect().top+window.scrollY-60;window.scrollTo({top:y,behavior:"smooth"});}},50);
    loadIndex(idx);
  };

  useEffect(()=>{
    if(!BACKEND_URL)return;
    fetchAllQuotes().then(allData=>{
      setLiveIndices(prev=>prev.map(ix=>{const live=allData[ix.id];if(!live)return ix;return{...ix,value:live.price||ix.value,change1d:live.change1d??ix.change1d,changeAbs:live.changeAbs??0,open:live.open||ix.open,high:live.high||ix.high,low:live.low||ix.low,prevClose:live.prevClose||ix.prevClose,high52w:live.high52w||ix.high52w,low52w:live.low52w||ix.low52w};}));
      setSelected(prev=>{const live=allData[prev.id];if(!live)return prev;return{...prev,value:live.price||prev.value,change1d:live.change1d??prev.change1d,changeAbs:live.changeAbs??prev.changeAbs,open:live.open||live.prevClose||prev.open,high:live.high||prev.high,low:live.low||prev.low,prevClose:live.prevClose||prev.prevClose,high52w:live.high52w||prev.high52w,low52w:live.low52w||prev.low52w};});
      if(BACKEND_URL){fetchIndexQuote(INDICES[0].id).then(q=>{setSelected(prev=>({...prev,open:q.open||q.prevClose||prev.open,high:q.high||prev.high,low:q.low||prev.low,prevClose:q.prevClose||prev.prevClose,high52w:q.high52w||prev.high52w,low52w:q.low52w||prev.low52w}));}).catch(()=>{});}
    }).catch(e=>console.log("all-quotes failed:",e));
    loadIndex(INDICES[0]);
  },[]);

  const selectedWithLive=merge(selected,liveData[selected.id]);

  return (
    <div style={{padding:"20px 16px 48px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h2 style={{fontSize:20,fontWeight:800,color:"#111827",letterSpacing:"-0.5px"}}>Índices Globales</h2><p style={{fontSize:11,color:"#9CA3AF",marginTop:3}}>Datos en tiempo real · Haz clic en un índice para ver el gráfico</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#ECFDF5",border:"1px solid #A7F3D0",borderRadius:20,padding:"4px 12px"}}><div style={{width:6,height:6,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:10,color:"#059669",fontWeight:500}}>Datos en tiempo real</span></div>
      </div>

      <div ref={chartRef}/>
      {loadingIdx===selected.id?(
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #ECEEF3",padding:"48px",textAlign:"center",marginBottom:16}}>
          <div style={{width:32,height:32,border:"3px solid #E5E7EB",borderTopColor:"#1a73e8",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
          <p style={{fontSize:13,color:"#5f6368",fontWeight:500}}>Cargando datos de {selected.name}...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ):(
        <BigChart key={selected.id} idx={selectedWithLive} allIndices={liveIndices} onSelect={handleSelect}/>
      )}

      {REGIONS.map(region=>{
        const indices=liveIndices.filter(i=>i.region===region);if(!indices.length)return null;
        return(
          <div key={region} style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><p style={{fontSize:12,fontWeight:700,color:"#374151"}}>{region}</p><div style={{flex:1,height:1,background:"#F0F1F5"}}/><span style={{fontSize:10,color:"#9CA3AF"}}>{indices.length} índices</span></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10}}>
              {indices.map(idx=>{const isLoading=loadingIdx===idx.id;const hasLive=!!liveData[idx.id];return(
                <div key={idx.id} style={{position:"relative"}}>
                  <IndexCard idx={merge(idx,liveData[idx.id])} onClick={handleSelect} selected={selected.id===idx.id}/>
                  {isLoading&&<div style={{position:"absolute",top:8,right:8,width:14,height:14,border:"2px solid #E5E7EB",borderTopColor:"#1a73e8",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>}
                  {hasLive&&!isLoading&&<div style={{position:"absolute",top:8,right:8,width:7,height:7,borderRadius:"50%",background:"#10B981"}} title="Datos reales"/>}
                </div>
              );})}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [page,setPage]=useState("mercado");
  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{background:#F5F6FA;}.no-scrollbar::-webkit-scrollbar{display:none;}.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;}`}</style>
      <div style={{minHeight:"100vh",background:"#F5F6FA",paddingBottom:48}}>
        <div style={{background:"#fff",borderBottom:"1px solid #ECEEF3",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:22,height:22,background:"#111827",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 10L5 6L8 8L12 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span style={{fontSize:13,fontWeight:700,color:"#111827"}}>WealthHub</span></div>
          <div style={{display:"flex",gap:3}}>{[["mercado","Mercado"],["indices","Índices"],["dashboard","Mi Cartera"]].map(([id,l])=><button key={id} onClick={()=>setPage(id)} style={{background:page===id?"#111827":"none",color:page===id?"#fff":"#6B7280",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,fontWeight:500,cursor:"pointer"}}>{l}</button>)}</div>
          <div style={{width:28}}/>
        </div>
        {page==="mercado"?<Mercado/>:page==="indices"?<MercadosGlobales/>:<Dashboard/>}
      </div>
    </>
  );
}
