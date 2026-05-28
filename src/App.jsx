import { useState, useMemo } from "react";

const FORMATIONS = {
  "4-3-3":  { DEF:4, MID:3, FWD:3 },
  "4-4-2":  { DEF:4, MID:4, FWD:2 },
  "4-5-1":  { DEF:4, MID:5, FWD:1 },
  "3-4-3":  { DEF:3, MID:4, FWD:3 },
  "3-5-2":  { DEF:3, MID:5, FWD:2 },
  "5-3-2":  { DEF:5, MID:3, FWD:2 },
  "5-4-1":  { DEF:5, MID:4, FWD:1 },
  "4-2-3-1":{ DEF:4, MID:5, FWD:2 },
};

const POS_ORDER = ["FWD","MID","DEF","GK"];
const SUB_SLOTS = ["SUB-0","SUB-1","SUB-2","SUB-3"];

// Team jersey colors [primary, secondary]
const TEAM_COLORS = {
  FRA:["#003189","#fff"], ARG:["#75aadb","#fff"], BRA:["#f7e000","#009c3b"],
  ENG:["#fff","#cf081f"], NOR:["#ef2b2d","#fff"], EGY:["#c8102e","#fff"],
  NGA:["#008751","#fff"], ESP:["#c60b1e","#ffc400"], NED:["#f36c21","#fff"],
  URU:["#75aadb","#fff"], CRO:["#ff0000","#fff"], MAR:["#c1272d","#006233"],
  POR:["#006600","#ff0000"], BEL:["#000","#f50000"], GER:["#fff","#000"],
  DEFAULT:["#374151","#9ca3af"],
};

const getTeamColors = code => TEAM_COLORS[code] || TEAM_COLORS.DEFAULT;

const SAMPLE_PLAYERS = [
  { id:"mbappe",     name:"Mbappé",        fullName:"Kylian Mbappé",        teamCode:"FRA", position:"FWD", price:11.5, jerseyNumber:10, nextFixture:"v ARG" },
  { id:"messi",      name:"Messi",         fullName:"Lionel Messi",          teamCode:"ARG", position:"FWD", price:10.5, jerseyNumber:10, nextFixture:"v FRA" },
  { id:"vinicius",   name:"Vinícius",      fullName:"Vinicius Jr.",           teamCode:"BRA", position:"FWD", price:10.0, jerseyNumber:7,  nextFixture:"v ENG" },
  { id:"haaland",    name:"Haaland",       fullName:"Erling Haaland",         teamCode:"NOR", position:"FWD", price:11.0, jerseyNumber:9,  nextFixture:"v EGY" },
  { id:"salah",      name:"Salah",         fullName:"Mohamed Salah",          teamCode:"EGY", position:"FWD", price:9.0,  jerseyNumber:11, nextFixture:"v NOR" },
  { id:"osimhen",    name:"Osimhen",       fullName:"Victor Osimhen",         teamCode:"NGA", position:"FWD", price:8.5,  jerseyNumber:9,  nextFixture:"v MAR" },
  { id:"bellingham", name:"Bellingham",    fullName:"Jude Bellingham",        teamCode:"ENG", position:"MID", price:9.5,  jerseyNumber:10, nextFixture:"v BRA" },
  { id:"pedri",      name:"Pedri",         fullName:"Pedri",                  teamCode:"ESP", position:"MID", price:8.5,  jerseyNumber:8,  nextFixture:"v GER" },
  { id:"dejong",     name:"De Jong",       fullName:"Frenkie de Jong",        teamCode:"NED", position:"MID", price:8.0,  jerseyNumber:7,  nextFixture:"v URU" },
  { id:"valverde",   name:"Valverde",      fullName:"Fed. Valverde",          teamCode:"URU", position:"MID", price:7.5,  jerseyNumber:8,  nextFixture:"v NED" },
  { id:"modric",     name:"Modrić",        fullName:"Luka Modrić",            teamCode:"CRO", position:"MID", price:7.0,  jerseyNumber:10, nextFixture:"v BEL" },
  { id:"camavinga",  name:"Camavinga",     fullName:"E. Camavinga",           teamCode:"FRA", position:"MID", price:7.0,  jerseyNumber:29, nextFixture:"v ARG" },
  { id:"ruben",      name:"R. Dias",       fullName:"Rúben Dias",              teamCode:"POR", position:"DEF", price:7.0,  jerseyNumber:4,  nextFixture:"v MAR" },
  { id:"hakimi",     name:"Hakimi",        fullName:"Achraf Hakimi",           teamCode:"MAR", position:"DEF", price:7.5,  jerseyNumber:2,  nextFixture:"v POR" },
  { id:"cancelo",    name:"Cancelo",       fullName:"João Cancelo",            teamCode:"POR", position:"DEF", price:7.0,  jerseyNumber:20, nextFixture:"v MAR" },
  { id:"militao",    name:"Militão",       fullName:"Éder Militão",            teamCode:"BRA", position:"DEF", price:6.5,  jerseyNumber:3,  nextFixture:"v ENG" },
  { id:"kounde",     name:"Koundé",        fullName:"Jules Koundé",            teamCode:"FRA", position:"DEF", price:6.5,  jerseyNumber:5,  nextFixture:"v ARG" },
  { id:"trent",      name:"Alexander-A.", fullName:"Trent A-Arnold",          teamCode:"ENG", position:"DEF", price:7.5,  jerseyNumber:66, nextFixture:"v BRA" },
  { id:"alisson",    name:"Alisson",       fullName:"Alisson Becker",          teamCode:"BRA", position:"GK",  price:6.0,  jerseyNumber:1,  nextFixture:"v ENG" },
  { id:"ederson",    name:"Ederson",       fullName:"Ederson",                 teamCode:"BRA", position:"GK",  price:5.5,  jerseyNumber:31, nextFixture:"v ENG" },
  { id:"courtois",   name:"Courtois",      fullName:"T. Courtois",             teamCode:"BEL", position:"GK",  price:6.0,  jerseyNumber:1,  nextFixture:"v CRO" },
  { id:"pickford",   name:"Pickford",      fullName:"Jordan Pickford",         teamCode:"ENG", position:"GK",  price:5.0,  jerseyNumber:1,  nextFixture:"v BRA" },
];

const SAMPLE_FIXTURES = [
  { id:"m1", stage:"Group Stage",   date:"2026-06-11", homeTeam:"Mexico",  awayTeam:"USA",       venue:"SoFi Stadium", status:"scheduled" },
  { id:"m2", stage:"Group Stage",   date:"2026-06-12", homeTeam:"France",  awayTeam:"Argentina", venue:"MetLife",      status:"scheduled" },
  { id:"m3", stage:"Group Stage",   date:"2026-06-13", homeTeam:"Brazil",  awayTeam:"England",   venue:"AT&T Stadium", status:"scheduled" },
  { id:"m4", stage:"Group Stage",   date:"2026-06-14", homeTeam:"Spain",   awayTeam:"Germany",   venue:"Rose Bowl",    status:"scheduled" },
  { id:"m5", stage:"Group Stage",   date:"2026-06-15", homeTeam:"Morocco", awayTeam:"Portugal",  venue:"Lincoln FR",   status:"scheduled" },
  { id:"m6", stage:"Quarter-Final", date:"2026-07-03", homeTeam:"TBD",     awayTeam:"TBD",       venue:"TBD",          status:"tbd" },
  { id:"m7", stage:"Semi-Final",    date:"2026-07-14", homeTeam:"TBD",     awayTeam:"TBD",       venue:"TBD",          status:"tbd" },
  { id:"m8", stage:"Final",         date:"2026-07-19", homeTeam:"TBD",     awayTeam:"TBD",       venue:"MetLife",      status:"tbd" },
];

const TABS = ["My Team","Players","Fixtures","Vlog Mode"];

// ── Jersey SVG component ──────────────────────────────────────────────────────
function Jersey({ primary, secondary, number, size = 52 }) {
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 100 95" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* shirt body */}
      <path d="M28 18 L10 32 L18 40 L22 36 L22 85 L78 85 L78 36 L82 40 L90 32 L72 18 C68 22 58 26 50 26 C42 26 32 22 28 18Z" fill={primary} stroke="rgba(0,0,0,0.25)" strokeWidth="2"/>
      {/* collar */}
      <path d="M38 18 Q50 28 62 18 Q56 12 50 12 Q44 12 38 18Z" fill={secondary} opacity="0.9"/>
      {/* sleeve stripe */}
      <path d="M10 32 L18 40 L22 36 L22 46 L10 42Z" fill={secondary} opacity="0.5"/>
      <path d="M90 32 L82 40 L78 36 L78 46 L90 42Z" fill={secondary} opacity="0.5"/>
      {/* number */}
      <text x="50" y="62" textAnchor="middle" fontSize="24" fontWeight="900"
        fill={secondary} fontFamily="Arial,sans-serif" style={{userSelect:"none"}}>
        {number}
      </text>
    </svg>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]               = useState("My Team");
  const [formation, setFormation]   = useState("4-3-3");
  const [squad, setSquad]           = useState({});
  const [captain, setCaptain]       = useState(null);
  const [viceCap, setViceCap]       = useState(null);
  const [teamName, setTeamName]     = useState("My WC26 Vlog XI");
  const [editName, setEditName]     = useState(false);
  const [budget, setBudget]         = useState(100);
  const [editBudget, setEditBudget] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [swapSlot, setSwapSlot]     = useState(null);
  const [posFilter, setPosFilter]   = useState("All");
  const [search, setSearch]         = useState("");

  const startSlots = useMemo(() => {
    const { DEF, MID, FWD } = FORMATIONS[formation];
    const list = [{ key:"GK-0", pos:"GK" }];
    for (let i=0;i<DEF;i++) list.push({ key:`DEF-${i}`, pos:"DEF" });
    for (let i=0;i<MID;i++) list.push({ key:`MID-${i}`, pos:"MID" });
    for (let i=0;i<FWD;i++) list.push({ key:`FWD-${i}`, pos:"FWD" });
    return list;
  }, [formation]);

  const selectedIds     = Object.values(squad).filter(Boolean);
  const selectedPlayers = selectedIds.map(id => SAMPLE_PLAYERS.find(p=>p.id===id)).filter(Boolean);
  const totalCost       = selectedPlayers.reduce((s,p)=>s+p.price,0);
  const budgetLeft      = budget - totalCost;

  const handleFormationChange = f => {
    setFormation(f);
    const { DEF, MID, FWD } = FORMATIONS[f];
    const valid = new Set(["GK-0",
      ...[...Array(DEF)].map((_,i)=>`DEF-${i}`),
      ...[...Array(MID)].map((_,i)=>`MID-${i}`),
      ...[...Array(FWD)].map((_,i)=>`FWD-${i}`),
      ...SUB_SLOTS]);
    setSquad(prev=>{ const n={}; for(const k of Object.keys(prev)) if(valid.has(k)) n[k]=prev[k]; return n; });
  };

  const assignPlayer = pid => {
    if (!pickerSlot) return;
    const n = { ...squad };
    for (const k of Object.keys(n)) if (n[k]===pid) delete n[k];
    n[pickerSlot] = pid;
    setSquad(n);
    setPickerSlot(null);
    setSearch("");
  };

  const removeFromSlot = key => {
    const pid = squad[key];
    if (pid===captain) setCaptain(null);
    if (pid===viceCap) setViceCap(null);
    setSquad(prev=>{ const n={...prev}; delete n[key]; return n; });
  };

  const doSwap = (a,b) => {
    setSquad(prev=>{
      const n={...prev};
      const va=n[a], vb=n[b];
      if(vb) n[a]=vb; else delete n[a];
      if(va) n[b]=va; else delete n[b];
      return n;
    });
    setSwapSlot(null);
  };

  const pickerPos = pickerSlot ? (pickerSlot.startsWith("SUB")?"ANY":pickerSlot.split("-")[0]) : null;
  const availablePlayers = useMemo(()=>{
    if (!pickerPos) return [];
    return SAMPLE_PLAYERS.filter(p=>
      (pickerPos==="ANY"||p.position===pickerPos) &&
      !selectedIds.includes(p.id) &&
      (p.fullName.toLowerCase().includes(search.toLowerCase())||p.teamCode.toLowerCase().includes(search.toLowerCase()))
    );
  }, [pickerPos, selectedIds, search]);

  const handleSlotClick = key => {
    if (swapSlot) {
      if (swapSlot===key) { setSwapSlot(null); return; }
      doSwap(swapSlot, key);
    } else {
      if (!squad[key]) setPickerSlot(key);
    }
  };

  return (
    <div style={S.shell}>
      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.hLogo}>WC<span style={{color:"#ffe600"}}>26</span></div>
        <div style={S.hMid}>
          {editName
            ? <input style={S.nameIn} value={teamName} autoFocus
                onChange={e=>setTeamName(e.target.value)}
                onBlur={()=>setEditName(false)}
                onKeyDown={e=>e.key==="Enter"&&setEditName(false)}/>
            : <div style={S.hTeamName} onClick={()=>setEditName(true)}>{teamName}</div>
          }
          <div style={S.hSub}>
            Transfers deadline: <span style={{color:"#ffe600",fontWeight:700}}> 12 June, 01:30</span>
          </div>
        </div>
        <div style={S.hRight}>
          <div style={{fontSize:11,opacity:.5}}>Budget</div>
          {editBudget
            ? <input type="number" style={S.budgetIn} value={budget} autoFocus
                onChange={e=>setBudget(Number(e.target.value))}
                onBlur={()=>setEditBudget(false)}
                onKeyDown={e=>e.key==="Enter"&&setEditBudget(false)}/>
            : <div style={{fontWeight:800,fontSize:13,color:budgetLeft<0?"#ef4444":"#10b981",cursor:"pointer"}}
                onClick={()=>setEditBudget(true)}>${budgetLeft.toFixed(1)}m left</div>
          }
        </div>
      </header>

      {/* ── TABS ── */}
      <div style={S.tabBar}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{...S.tabBtn,...(tab===t?S.tabOn:{})}}>
            {t}
            {tab===t && <div style={S.tabUnderline}/>}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={S.content}>
        {tab==="My Team"   && <TeamView startSlots={startSlots} squad={squad} formation={formation}
          captain={captain} viceCap={viceCap} swapSlot={swapSlot} setSwapSlot={setSwapSlot}
          onFormationChange={handleFormationChange} onSlotClick={handleSlotClick}
          onRemove={removeFromSlot} onSetCaptain={setCaptain} onSetVC={setViceCap}
          totalCost={totalCost} budgetLeft={budgetLeft} budget={budget} selectedIds={selectedIds}/>}
        {tab==="Players"   && <PlayersView posFilter={posFilter} setPosFilter={setPosFilter}
          squad={squad} captain={captain} viceCap={viceCap}/>}
        {tab==="Fixtures"  && <FixturesView/>}
        {tab==="Vlog Mode" && <VlogView startSlots={startSlots} squad={squad} formation={formation}
          captain={captain} viceCap={viceCap} teamName={teamName} totalCost={totalCost} budget={budget}/>}
      </div>

      {/* ── PICKER MODAL ── */}
      {pickerSlot && (
        <div style={S.overlay} onClick={()=>{setPickerSlot(null);setSearch("");}}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <div style={{fontWeight:800,fontSize:15}}>
                Select {pickerPos==="ANY"?"Sub":pickerPos} Player
              </div>
              <button style={S.mClose} onClick={()=>{setPickerSlot(null);setSearch("");}}>✕</button>
            </div>
            <input style={S.mSearch} placeholder="Search name / country..." value={search}
              onChange={e=>setSearch(e.target.value)} autoFocus/>
            <div style={S.mList}>
              {availablePlayers.length===0
                ? <div style={{padding:24,textAlign:"center",opacity:.4,fontSize:13}}>No players found</div>
                : availablePlayers.map(p=>{
                  const [pri,sec]=getTeamColors(p.teamCode);
                  return (
                    <div key={p.id} style={S.mRow} onClick={()=>assignPlayer(p.id)}>
                      <div style={{flexShrink:0}}>
                        <Jersey primary={pri} secondary={sec} number={p.jerseyNumber} size={40}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{p.fullName}</div>
                        <div style={{fontSize:11,opacity:.5}}>{p.teamCode} · {p.position} · {p.nextFixture}</div>
                      </div>
                      <div style={{fontWeight:800,color:"#10b981",fontSize:13}}>${p.price}m</div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TEAM VIEW ─────────────────────────────────────────────────────────────────
function TeamView({ startSlots, squad, formation, captain, viceCap, swapSlot, setSwapSlot,
  onFormationChange, onSlotClick, onRemove, onSetCaptain, onSetVC,
  totalCost, budgetLeft, budget, selectedIds }) {

  const rows = POS_ORDER.map(pos => startSlots.filter(s=>s.key.startsWith(pos)));
  const pct  = Math.min((totalCost/budget)*100,100);

  return (
    <div style={S.teamWrap}>
      {/* Formation + budget bar */}
      <div style={S.controlRow}>
        <div style={S.formRow}>
          <span style={{fontSize:11,opacity:.45,textTransform:"uppercase",letterSpacing:.8}}>Formation</span>
          <select style={S.fSel} value={formation} onChange={e=>onFormationChange(e.target.value)}>
            {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
            <span style={{opacity:.4}}>Squad {selectedIds.length}/15</span>
            <span style={{fontWeight:700,color:budgetLeft<0?"#ef4444":"#e2e8f0"}}>${totalCost.toFixed(1)}m / ${budget}m</span>
          </div>
          <div style={S.bTrack}><div style={{...S.bFill,width:`${pct}%`,background:pct>90?"#ef4444":pct>70?"#f59e0b":"#22c55e"}}/></div>
        </div>
      </div>

      {swapSlot && (
        <div style={S.swapBar}>
          ↔ Swap mode · tap another player &nbsp;
          <span style={{color:"#fbbf24",cursor:"pointer"}} onClick={()=>setSwapSlot(null)}>Cancel</span>
        </div>
      )}

      {/* PITCH */}
      <div style={S.pitch}>
        <PitchMarkings/>
        {rows.map((rowSlots,ri)=>(
          <div key={ri} style={S.pitchRow}>
            {rowSlots.map(slot=>{
              const pid=squad[slot.key];
              const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
              return (
                <JerseyToken key={slot.key} slot={slot} player={player}
                  isCap={pid===captain} isVC={pid===viceCap}
                  isSwapSrc={swapSlot===slot.key}
                  isSwapTarget={!!swapSlot&&swapSlot!==slot.key&&!!pid}
                  onClick={()=>onSlotClick(slot.key)}
                  onMenu={(action)=>{
                    if(action==="remove")  onRemove(slot.key);
                    if(action==="captain") onSetCaptain(pid===captain?null:pid);
                    if(action==="vc")      onSetVC(pid===viceCap?null:pid);
                    if(action==="swap")    setSwapSlot(slot.key);
                  }}/>
              );
            })}
          </div>
        ))}
      </div>

      {/* BENCH */}
      <div style={S.benchHead}>
        <span style={S.benchTitle}>🪑 SUBSTITUTES BENCH</span>
        <span style={{fontSize:11,opacity:.35}}>4 players</span>
      </div>
      <div style={S.bench}>
        {SUB_SLOTS.map((key,i)=>{
          const pid=squad[key];
          const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
          return (
            <SubCard key={key} subNum={i+1} player={player}
              isCap={pid===captain} isVC={pid===viceCap}
              isSwapSrc={swapSlot===key}
              isSwapTarget={!!swapSlot&&swapSlot!==key&&!!pid}
              onClick={()=>onSlotClick(key)}
              onMenu={(action)=>{
                if(action==="remove")  onRemove(key);
                if(action==="captain") onSetCaptain(pid===captain?null:pid);
                if(action==="vc")      onSetVC(pid===viceCap?null:pid);
                if(action==="swap")    setSwapSlot(key);
              }}/>
          );
        })}
      </div>

      {/* LEGEND */}
      <div style={S.legend}>
        <span style={S.legItem}><span style={{...S.legDot,background:"#f59e0b"}}>C</span> Captain</span>
        <span style={S.legItem}><span style={{...S.legDot,background:"#3b82f6"}}>VC</span> Vice-Captain</span>
      </div>
    </div>
  );
}

// ── PITCH MARKINGS ────────────────────────────────────────────────────────────
function PitchMarkings() {
  return (
    <>
      <div style={{position:"absolute",left:"50%",top:"50%",width:70,height:70,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.13)",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"rgba(255,255,255,.1)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:"20%",right:"20%",top:0,height:50,border:"1.5px solid rgba(255,255,255,.1)",borderTop:"none",pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:"20%",right:"20%",bottom:0,height:50,border:"1.5px solid rgba(255,255,255,.1)",borderBottom:"none",pointerEvents:"none"}}/>
    </>
  );
}

// ── JERSEY TOKEN (on pitch) ───────────────────────────────────────────────────
function JerseyToken({ slot, player, isCap, isVC, isSwapSrc, isSwapTarget, onClick, onMenu }) {
  const [menu,setMenu]=useState(false);
  const pos = slot.key.split("-")[0];

  if (!player) {
    return (
      <div style={S.emptySlot} onClick={onClick}>
        <div style={S.emptyJerseyWrap}>
          <svg width={46} height={44} viewBox="0 0 100 95" fill="none">
            <path d="M28 18 L10 32 L18 40 L22 36 L22 85 L78 85 L78 36 L82 40 L90 32 L72 18 C68 22 58 26 50 26 C42 26 32 22 28 18Z"
              fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 3"/>
            <path d="M38 18 Q50 28 62 18 Q56 12 50 12 Q44 12 38 18Z" fill="rgba(255,255,255,0.05)"/>
            <text x="50" y="62" textAnchor="middle" fontSize="28" fill="rgba(255,255,255,0.3)" fontFamily="Arial">+</text>
          </svg>
        </div>
        <div style={{fontSize:9,opacity:.35,marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{pos}</div>
      </div>
    );
  }

  const [pri,sec] = getTeamColors(player.teamCode);

  return (
    <div style={{...S.jerseySlot,...(isSwapSrc?{filter:"drop-shadow(0 0 8px #60a5fa)"}:{}),...(isSwapTarget?{filter:"drop-shadow(0 0 8px #fbbf24)",opacity:.8}:{})}}>
      {/* C/VC badges */}
      {isCap && <div style={S.cBadge}>C</div>}
      {isVC  && <div style={S.vcBadge}>VC</div>}

      {/* Jersey - tap opens menu */}
      <div style={{position:"relative",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setMenu(!menu);}}>
        <Jersey primary={pri} secondary={sec} number={player.jerseyNumber} size={50}/>
      </div>

      {/* Name label */}
      <div style={S.jName}>{player.name}</div>

      {/* Opponent tag */}
      <div style={S.jFixture}>{player.nextFixture}</div>

      {/* Context Menu */}
      {menu && (
        <div style={S.ctxMenu} onClick={e=>e.stopPropagation()}>
          <div style={S.ctxRow} onClick={()=>{onMenu("captain");setMenu(false);}}>
            {isCap?"Remove C":"⭐ Set Captain"}
          </div>
          <div style={S.ctxRow} onClick={()=>{onMenu("vc");setMenu(false);}}>
            {isVC?"Remove VC":"🔵 Set Vice-Cap"}
          </div>
          <div style={S.ctxRow} onClick={()=>{onMenu("swap");setMenu(false);}}>
            ↔ Swap
          </div>
          <div style={{...S.ctxRow,color:"#ef4444"}} onClick={()=>{onMenu("remove");setMenu(false);}}>
            ✕ Remove
          </div>
          <div style={{...S.ctxRow,opacity:.35,fontSize:11}} onClick={()=>setMenu(false)}>Cancel</div>
        </div>
      )}
    </div>
  );
}

// ── SUB CARD ──────────────────────────────────────────────────────────────────
function SubCard({ subNum, player, isCap, isVC, isSwapSrc, isSwapTarget, onClick, onMenu }) {
  const [menu,setMenu]=useState(false);

  if (!player) {
    return (
      <div style={S.subEmpty} onClick={onClick}>
        <div style={{fontSize:9,opacity:.3,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>SUB {subNum}</div>
        <svg width={36} height={34} viewBox="0 0 100 95" fill="none">
          <path d="M28 18 L10 32 L18 40 L22 36 L22 85 L78 85 L78 36 L82 40 L90 32 L72 18 C68 22 58 26 50 26 C42 26 32 22 28 18Z"
            fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5 4"/>
          <path d="M38 18 Q50 28 62 18 Q56 12 50 12 Q44 12 38 18Z" fill="rgba(255,255,255,0.03)"/>
          <text x="50" y="62" textAnchor="middle" fontSize="28" fill="rgba(255,255,255,0.2)" fontFamily="Arial">+</text>
        </svg>
      </div>
    );
  }

  const [pri,sec] = getTeamColors(player.teamCode);
  const POS_BG = { GK:"#f59e0b", DEF:"#3b82f6", MID:"#10b981", FWD:"#ef4444" };

  return (
    <div style={{...S.subCard,...(isSwapSrc?{boxShadow:"0 0 0 2px #60a5fa"}:{}),...(isSwapTarget?{boxShadow:"0 0 0 2px #fbbf24",opacity:.8}:{})}}
      onClick={()=>{if(!menu)onClick();}}>
      {isCap && <div style={{...S.cBadge,top:2,right:2,fontSize:7}}>C</div>}
      {isVC  && <div style={{...S.vcBadge,top:2,right:2,fontSize:7}}>VC</div>}

      <div style={{flexShrink:0,cursor:"pointer"}} onClick={e=>{e.stopPropagation();setMenu(!menu);}}>
        <Jersey primary={pri} secondary={sec} number={player.jerseyNumber} size={44}/>
      </div>

      {/* pos tag */}
      <div style={{position:"absolute",bottom:6,left:6,background:POS_BG[player.position]||"#374151",
        color:"#000",fontSize:8,fontWeight:900,borderRadius:4,padding:"1px 5px"}}>
        {player.position}
      </div>

      <div style={S.subInfo}>
        <div style={{fontWeight:700,fontSize:11,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{player.name}</div>
        <div style={{fontSize:10,opacity:.45}}>{player.nextFixture}</div>
        <div style={{fontWeight:800,fontSize:11,color:"#10b981"}}>${player.price}m</div>
      </div>

      {menu && (
        <div style={{...S.ctxMenu,top:42,left:4,minWidth:140}} onClick={e=>e.stopPropagation()}>
          <div style={S.ctxRow} onClick={()=>{onMenu("captain");setMenu(false);}}>
            {isCap?"Remove C":"⭐ Captain"}
          </div>
          <div style={S.ctxRow} onClick={()=>{onMenu("vc");setMenu(false);}}>
            {isVC?"Remove VC":"🔵 Vice-Cap"}
          </div>
          <div style={S.ctxRow} onClick={()=>{onMenu("swap");setMenu(false);}}>↔ Swap</div>
          <div style={{...S.ctxRow,color:"#ef4444"}} onClick={()=>{onMenu("remove");setMenu(false);}}>✕ Remove</div>
          <div style={{...S.ctxRow,opacity:.35,fontSize:11}} onClick={()=>setMenu(false)}>Cancel</div>
        </div>
      )}
    </div>
  );
}

// ── PLAYERS VIEW ──────────────────────────────────────────────────────────────
function PlayersView({ posFilter, setPosFilter, squad, captain, viceCap }) {
  const positions=["All","GK","DEF","MID","FWD"];
  const selectedIds=Object.values(squad).filter(Boolean);
  const POS_BG={ GK:"#f59e0b", DEF:"#3b82f6", MID:"#10b981", FWD:"#ef4444", All:"#6366f1" };
  const filtered=posFilter==="All"?SAMPLE_PLAYERS:SAMPLE_PLAYERS.filter(p=>p.position===posFilter);
  return (
    <div style={S.pageWrap}>
      <div style={S.filterRow}>
        {positions.map(pos=>(
          <button key={pos} onClick={()=>setPosFilter(pos)}
            style={{...S.fBtn,...(posFilter===pos?{background:POS_BG[pos],color:"#000",borderColor:"transparent"}:{})}}>
            {pos}
          </button>
        ))}
      </div>
      {filtered.map(p=>{
        const inSquad=selectedIds.includes(p.id);
        const [pri,sec]=getTeamColors(p.teamCode);
        return (
          <div key={p.id} style={{...S.pRow,...(inSquad?{border:"1px solid #22c55e44",background:"#14532d22"}:{})}}>
            <Jersey primary={pri} secondary={sec} number={p.jerseyNumber} size={44}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:13}}>
                {p.fullName}
                {p.id===captain&&<span style={{background:"#f59e0b",color:"#000",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:900,marginLeft:6}}>C</span>}
                {p.id===viceCap&&<span style={{background:"#3b82f6",color:"#fff",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:900,marginLeft:6}}>VC</span>}
              </div>
              <div style={{fontSize:11,opacity:.45,marginTop:1}}>{p.teamCode} · {p.nextFixture}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,color:inSquad?"#22c55e":"#e2e8f0",fontSize:13}}>${p.price}m</div>
              <div style={{fontSize:9,opacity:.35,marginTop:1}}>{p.position}</div>
            </div>
            {inSquad&&<div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── FIXTURES VIEW ─────────────────────────────────────────────────────────────
function FixturesView() {
  const stages=[...new Set(SAMPLE_FIXTURES.map(f=>f.stage))];
  return (
    <div style={S.pageWrap}>
      {stages.map(stage=>(
        <div key={stage} style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#a78bfa",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:8}}>{stage}</div>
          {SAMPLE_FIXTURES.filter(f=>f.stage===stage).map(f=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:"#111827",border:"1px solid #1f2937",borderRadius:10,padding:"12px 14px",marginBottom:6}}>
              <div style={{fontSize:11,color:"#6b7280",minWidth:82}}>{f.date}</div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13}}>
                {f.homeTeam}
                <span style={{fontSize:9,background:"#1f2937",borderRadius:4,padding:"2px 6px",color:"#6b7280",fontWeight:400}}>VS</span>
                {f.awayTeam}
              </div>
              <div style={{fontSize:11,color:"#6b7280"}}>{f.venue}</div>
              <div style={{fontSize:10,borderRadius:5,padding:"3px 8px",fontWeight:600,
                background:f.status==="scheduled"?"#14532d":"#1f2937",
                color:f.status==="scheduled"?"#22c55e":"#6b7280"}}>{f.status}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── VLOG VIEW ─────────────────────────────────────────────────────────────────
function VlogView({ startSlots, squad, formation, captain, viceCap, teamName, totalCost, budget }) {
  const rows = POS_ORDER.map(pos=>startSlots.filter(s=>s.key.startsWith(pos)));
  const cap  = SAMPLE_PLAYERS.find(p=>p.id===captain);
  const vc   = SAMPLE_PLAYERS.find(p=>p.id===viceCap);
  return (
    <div style={{...S.teamWrap,background:"#060810"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,color:"#ef4444",letterSpacing:3,fontWeight:700,marginBottom:4}}>● REC · VLOG MODE</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:3}}>{teamName}</div>
        <div style={{fontSize:12,opacity:.4}}>
          {formation}{cap?` · C: ${cap.name}`:""}{vc?` · VC: ${vc.name}`:""}
        </div>
        <div style={{fontSize:11,color:"#22c55e",marginTop:2}}>${totalCost.toFixed(1)}m of ${budget}m</div>
      </div>
      <div style={S.pitch}>
        <PitchMarkings/>
        {rows.map((rowSlots,ri)=>(
          <div key={ri} style={S.pitchRow}>
            {rowSlots.map(slot=>{
              const pid=squad[slot.key];
              const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
              return <JerseyToken key={slot.key} slot={slot} player={player}
                isCap={pid===captain} isVC={pid===viceCap}
                isSwapSrc={false} isSwapTarget={false}
                onClick={()=>{}} onMenu={()=>{}}/>;
            })}
          </div>
        ))}
      </div>
      <div style={S.benchHead}><span style={S.benchTitle}>🪑 BENCH</span></div>
      <div style={S.bench}>
        {SUB_SLOTS.map((key,i)=>{
          const pid=squad[key];
          const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
          return <SubCard key={key} subNum={i+1} player={player}
            isCap={pid===captain} isVC={pid===viceCap}
            isSwapSrc={false} isSwapTarget={false}
            onClick={()=>{}} onMenu={()=>{}}/>;
        })}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  shell:{ minHeight:"100vh", background:"#0b0f19", color:"#e2e8f0", fontFamily:"'DM Sans',system-ui,sans-serif", display:"flex", flexDirection:"column" },

  header:{ background:"#111827", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 },
  hLogo:{ fontWeight:900, fontSize:18, letterSpacing:-1, flexShrink:0 },
  hMid:{ flex:1, minWidth:0 },
  hTeamName:{ fontWeight:800, fontSize:14, cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  hSub:{ fontSize:11, opacity:.5, marginTop:1 },
  hRight:{ flexShrink:0, textAlign:"right" },
  nameIn:{ background:"#1f2937", border:"1px solid #3b82f6", color:"#fff", borderRadius:6, padding:"3px 8px", fontSize:13, outline:"none", width:150 },
  budgetIn:{ background:"transparent", border:"none", color:"#10b981", width:60, fontWeight:800, fontSize:13, outline:"none", textAlign:"right" },

  tabBar:{ display:"flex", background:"#0d1117", borderBottom:"1px solid #1f2937" },
  tabBtn:{ flex:1, background:"none", border:"none", color:"#6b7280", fontSize:13, fontWeight:600, padding:"12px 4px", cursor:"pointer", position:"relative" },
  tabOn:{ color:"#fff" },
  tabUnderline:{ position:"absolute", bottom:0, left:"15%", right:"15%", height:2, background:"#ffe600", borderRadius:2 },
  content:{ flex:1 },

  teamWrap:{ padding:"12px 10px", maxWidth:600, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  controlRow:{ display:"flex", alignItems:"center", gap:10, marginBottom:10, background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:"10px 12px" },
  formRow:{ display:"flex", alignItems:"center", gap:6, flexShrink:0 },
  fSel:{ background:"#1f2937", border:"1px solid #374151", color:"#fff", borderRadius:7, padding:"5px 8px", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none" },
  bTrack:{ height:5, background:"#1f2937", borderRadius:99, overflow:"hidden" },
  bFill:{ height:"100%", borderRadius:99, transition:"width .3s, background .3s" },
  swapBar:{ background:"#1e3a5f", border:"1px solid #3b82f6", borderRadius:8, padding:"7px 12px", fontSize:12, color:"#93c5fd", marginBottom:8, textAlign:"center" },

  pitch:{ background:"linear-gradient(180deg,#0d4e1c 0%,#105e20 40%,#105e20 60%,#0d4e1c 100%)", borderRadius:12, border:"2px solid #145e22", padding:"14px 6px", display:"flex", flexDirection:"column", gap:10, position:"relative", overflow:"hidden", minHeight:380, boxShadow:"inset 0 0 40px rgba(0,0,0,.4)" },
  pitchRow:{ display:"flex", justifyContent:"center", gap:4, position:"relative", zIndex:1 },

  emptySlot:{ display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", width:58 },
  emptyJerseyWrap:{ display:"flex", alignItems:"center", justifyContent:"center" },

  jerseySlot:{ display:"flex", flexDirection:"column", alignItems:"center", width:58, position:"relative", cursor:"pointer" },
  jName:{ fontSize:9, fontWeight:700, color:"#fff", textAlign:"center", marginTop:1, textShadow:"0 1px 4px rgba(0,0,0,.9)", maxWidth:58, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  jFixture:{ fontSize:8, background:"rgba(0,0,0,.65)", color:"#e2e8f0", borderRadius:4, padding:"1px 5px", marginTop:2, textAlign:"center", fontWeight:600 },

  cBadge:{ position:"absolute", top:-4, right:0, background:"#f59e0b", color:"#000", fontSize:8, fontWeight:900, borderRadius:99, width:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", zIndex:3, boxShadow:"0 1px 4px rgba(0,0,0,.6)" },
  vcBadge:{ position:"absolute", top:-4, right:0, background:"#3b82f6", color:"#fff", fontSize:8, fontWeight:900, borderRadius:99, width:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", zIndex:3, boxShadow:"0 1px 4px rgba(0,0,0,.6)" },

  ctxMenu:{ position:"absolute", top:58, left:"50%", transform:"translateX(-50%)", background:"#111827", border:"1px solid #374151", borderRadius:10, overflow:"hidden", zIndex:99, boxShadow:"0 12px 40px rgba(0,0,0,.9)", minWidth:148 },
  ctxRow:{ padding:"9px 14px", fontSize:12, fontWeight:600, cursor:"pointer", borderBottom:"1px solid #1f2937", whiteSpace:"nowrap" },

  benchHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"12px 0 6px" },
  benchTitle:{ fontSize:11, fontWeight:800, opacity:.6, textTransform:"uppercase", letterSpacing:1 },
  bench:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 },
  subEmpty:{ background:"#0d1117", border:"2px dashed #1f2937", borderRadius:9, padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", minHeight:80 },
  subCard:{ background:"#111827", border:"1px solid #1f2937", borderRadius:9, padding:"8px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, position:"relative", cursor:"pointer", minHeight:80 },
  subInfo:{ width:"100%", textAlign:"center" },

  legend:{ display:"flex", gap:14, justifyContent:"center", marginTop:10, opacity:.55 },
  legItem:{ display:"flex", alignItems:"center", gap:5, fontSize:11 },
  legDot:{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:16, height:16, borderRadius:"50%", fontSize:8, fontWeight:900, color:"#000" },

  overlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 },
  modal:{ background:"#0d1117", border:"1px solid #1f2937", borderRadius:"14px 14px 0 0", width:"100%", maxWidth:480, maxHeight:"78vh", display:"flex", flexDirection:"column" },
  mHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #1f2937" },
  mClose:{ background:"#1f2937", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontWeight:700 },
  mSearch:{ background:"#080d14", border:"none", borderBottom:"1px solid #1f2937", color:"#fff", padding:"11px 16px", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
  mList:{ overflow:"auto", flex:1 },
  mRow:{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", cursor:"pointer", borderBottom:"1px solid #080d14" },

  pageWrap:{ padding:"12px 12px", maxWidth:600, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  filterRow:{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" },
  fBtn:{ background:"#111827", border:"1px solid #1f2937", color:"#6b7280", borderRadius:7, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" },
  pRow:{ display:"flex", alignItems:"center", gap:10, background:"#111827", border:"1px solid #1f2937", borderRadius:9, padding:"8px 12px", marginBottom:6 },
};
