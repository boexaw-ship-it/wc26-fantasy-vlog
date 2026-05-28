import { useState, useMemo } from "react";

// ─── FORMATIONS ───────────────────────────────────────────────────────────────
const FORMATIONS = {
  "4-3-3": { DEF:4, MID:3, FWD:3 },
  "4-4-2": { DEF:4, MID:4, FWD:2 },
  "4-5-1": { DEF:4, MID:5, FWD:1 },
  "3-4-3": { DEF:3, MID:4, FWD:3 },
  "3-5-2": { DEF:3, MID:5, FWD:2 },
  "5-3-2": { DEF:5, MID:3, FWD:2 },
  "5-4-1": { DEF:5, MID:4, FWD:1 },
  "4-2-3-1": { DEF:4, MID:5, FWD:2 },
};

const POS_ORDER = ["FWD","MID","DEF","GK"];
const POS_COLOR = { GK:"#f59e0b", DEF:"#3b82f6", MID:"#10b981", FWD:"#ef4444" };
const TABS = ["Pitch","Players","Fixtures","Vlog Mode"];
const SUB_SLOTS = ["SUB-0","SUB-1","SUB-2","SUB-3"];

const SAMPLE_PLAYERS = [
  { id:"mbappe",     name:"Kylian Mbappé",       teamCode:"FRA", position:"FWD", price:11.5, jerseyNumber:10 },
  { id:"messi",      name:"Lionel Messi",         teamCode:"ARG", position:"FWD", price:10.5, jerseyNumber:10 },
  { id:"vinicius",   name:"Vinicius Jr.",          teamCode:"BRA", position:"FWD", price:10.0, jerseyNumber:7  },
  { id:"haaland",    name:"Erling Haaland",        teamCode:"NOR", position:"FWD", price:11.0, jerseyNumber:9  },
  { id:"salah",      name:"Mohamed Salah",         teamCode:"EGY", position:"FWD", price:9.0,  jerseyNumber:11 },
  { id:"osimhen",    name:"Victor Osimhen",        teamCode:"NGA", position:"FWD", price:8.5,  jerseyNumber:9  },
  { id:"bellingham", name:"Jude Bellingham",       teamCode:"ENG", position:"MID", price:9.5,  jerseyNumber:10 },
  { id:"pedri",      name:"Pedri",                 teamCode:"ESP", position:"MID", price:8.5,  jerseyNumber:8  },
  { id:"dejong",     name:"Frenkie de Jong",       teamCode:"NED", position:"MID", price:8.0,  jerseyNumber:7  },
  { id:"valverde",   name:"Federico Valverde",     teamCode:"URU", position:"MID", price:7.5,  jerseyNumber:8  },
  { id:"modric",     name:"Luka Modrić",           teamCode:"CRO", position:"MID", price:7.0,  jerseyNumber:10 },
  { id:"camavinga",  name:"Eduardo Camavinga",     teamCode:"FRA", position:"MID", price:7.0,  jerseyNumber:29 },
  { id:"ruben",      name:"Rúben Dias",             teamCode:"POR", position:"DEF", price:7.0,  jerseyNumber:4  },
  { id:"hakimi",     name:"Achraf Hakimi",          teamCode:"MAR", position:"DEF", price:7.5,  jerseyNumber:2  },
  { id:"cancelo",    name:"João Cancelo",           teamCode:"POR", position:"DEF", price:7.0,  jerseyNumber:20 },
  { id:"militao",    name:"Éder Militão",           teamCode:"BRA", position:"DEF", price:6.5,  jerseyNumber:3  },
  { id:"kounde",     name:"Jules Koundé",           teamCode:"FRA", position:"DEF", price:6.5,  jerseyNumber:5  },
  { id:"trent",      name:"Trent Alexander-Arnold", teamCode:"ENG", position:"DEF", price:7.5,  jerseyNumber:66 },
  { id:"alisson",    name:"Alisson Becker",         teamCode:"BRA", position:"GK",  price:6.0,  jerseyNumber:1  },
  { id:"ederson",    name:"Ederson",                teamCode:"BRA", position:"GK",  price:5.5,  jerseyNumber:31 },
  { id:"courtois",   name:"Thibaut Courtois",       teamCode:"BEL", position:"GK",  price:6.0,  jerseyNumber:1  },
  { id:"pickford",   name:"Jordan Pickford",        teamCode:"ENG", position:"GK",  price:5.0,  jerseyNumber:1  },
];

const SAMPLE_FIXTURES = [
  { id:"m1", stage:"Group Stage",   date:"2026-06-11", homeTeam:"Mexico",   awayTeam:"USA",       venue:"SoFi Stadium",  status:"scheduled" },
  { id:"m2", stage:"Group Stage",   date:"2026-06-12", homeTeam:"France",   awayTeam:"Argentina", venue:"MetLife",        status:"scheduled" },
  { id:"m3", stage:"Group Stage",   date:"2026-06-13", homeTeam:"Brazil",   awayTeam:"England",   venue:"AT&T Stadium",  status:"scheduled" },
  { id:"m4", stage:"Group Stage",   date:"2026-06-14", homeTeam:"Spain",    awayTeam:"Germany",   venue:"Rose Bowl",     status:"scheduled" },
  { id:"m5", stage:"Group Stage",   date:"2026-06-15", homeTeam:"Morocco",  awayTeam:"Portugal",  venue:"Lincoln FR",    status:"scheduled" },
  { id:"m6", stage:"Quarter-Final", date:"2026-07-03", homeTeam:"TBD",      awayTeam:"TBD",       venue:"TBD",           status:"tbd" },
  { id:"m7", stage:"Semi-Final",    date:"2026-07-14", homeTeam:"TBD",      awayTeam:"TBD",       venue:"TBD",           status:"tbd" },
  { id:"m8", stage:"Final",         date:"2026-07-19", homeTeam:"TBD",      awayTeam:"TBD",       venue:"MetLife",       status:"tbd" },
];

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("Pitch");
  const [formation, setFormation] = useState("4-3-3");
  const [squad, setSquad]         = useState({});      // { slotKey: playerId }
  const [captain, setCaptain]     = useState(null);
  const [viceCap, setViceCap]     = useState(null);
  const [teamName, setTeamName]   = useState("My WC26 Vlog XI");
  const [editName, setEditName]   = useState(false);
  const [budget, setBudget]       = useState(100);
  const [editBudget, setEditBudget] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [swapSlot, setSwapSlot]   = useState(null);    // slot being swapped
  const [posFilter, setPosFilter] = useState("All");
  const [search, setSearch]       = useState("");

  // Build starting 11 slots
  const startSlots = useMemo(() => {
    const { DEF, MID, FWD } = FORMATIONS[formation];
    const list = [{ key:"GK-0", pos:"GK" }];
    for (let i=0;i<DEF;i++) list.push({ key:`DEF-${i}`, pos:"DEF" });
    for (let i=0;i<MID;i++) list.push({ key:`MID-${i}`, pos:"MID" });
    for (let i=0;i<FWD;i++) list.push({ key:`FWD-${i}`, pos:"FWD" });
    return list;
  }, [formation]);

  const allSlots = [...startSlots, ...SUB_SLOTS.map(k => ({ key:k, pos:"SUB" }))];
  const selectedIds = Object.values(squad).filter(Boolean);

  const getPlayer = id => SAMPLE_PLAYERS.find(p => p.id === id);
  const selectedPlayers = selectedIds.map(getPlayer).filter(Boolean);
  const totalCost = selectedPlayers.reduce((s,p) => s + p.price, 0);
  const budgetLeft = budget - totalCost;

  // Formation change — remove slots that no longer exist
  const handleFormationChange = f => {
    setFormation(f);
    const { DEF, MID, FWD } = FORMATIONS[f];
    const valid = new Set([
      "GK-0",
      ...[...Array(DEF)].map((_,i)=>`DEF-${i}`),
      ...[...Array(MID)].map((_,i)=>`MID-${i}`),
      ...[...Array(FWD)].map((_,i)=>`FWD-${i}`),
      ...SUB_SLOTS,
    ]);
    setSquad(prev => {
      const n={};
      for(const k of Object.keys(prev)) if(valid.has(k)) n[k]=prev[k];
      return n;
    });
  };

  // Assign player to slot
  const assignPlayer = pid => {
    if (!pickerSlot) return;
    const newSquad = { ...squad };
    // Remove from old slot
    for (const k of Object.keys(newSquad)) if (newSquad[k]===pid) delete newSquad[k];
    newSquad[pickerSlot] = pid;
    setSquad(newSquad);
    setPickerSlot(null);
    setSearch("");
  };

  // Remove player from slot
  const removeFromSlot = slotKey => {
    const pid = squad[slotKey];
    if (pid===captain) setCaptain(null);
    if (pid===viceCap) setViceCap(null);
    setSquad(prev => { const n={...prev}; delete n[slotKey]; return n; });
  };

  // Swap two slots
  const doSwap = (slotA, slotB) => {
    setSquad(prev => {
      const n = { ...prev };
      const a = n[slotA], b = n[slotB];
      if (b) n[slotA]=b; else delete n[slotA];
      if (a) n[slotB]=a; else delete n[slotB];
      return n;
    });
    setSwapSlot(null);
  };

  // Picker available players
  const pickerPos = pickerSlot ? (pickerSlot.startsWith("SUB") ? "ANY" : pickerSlot.split("-")[0]) : null;
  const availablePlayers = useMemo(() => {
    if (!pickerPos) return [];
    return SAMPLE_PLAYERS.filter(p =>
      (pickerPos==="ANY" || p.position===pickerPos) &&
      !selectedIds.includes(p.id) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [pickerPos, selectedIds, search]);

  return (
    <div style={S.shell}>
      {/* HEADER */}
      <header style={S.header}>
        <div style={S.hLeft}>
          <div style={S.logo}>WC<span style={{color:"#10b981"}}>26</span></div>
          {editName
            ? <input style={S.nameInput} value={teamName}
                onChange={e=>setTeamName(e.target.value)}
                onBlur={()=>setEditName(false)}
                onKeyDown={e=>e.key==="Enter"&&setEditName(false)} autoFocus />
            : <div style={S.teamName} onClick={()=>setEditName(true)}>{teamName} <span style={{opacity:.4,fontSize:11}}>✏️</span></div>
          }
        </div>

        <div style={S.hCenter}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)}
              style={{...S.tabBtn,...(tab===t?S.tabOn:{})}}>
              {t}
            </button>
          ))}
        </div>

        <div style={S.hRight}>
          <div style={S.budgetBox}>
            <span style={{opacity:.5,fontSize:11}}>Budget</span>
            {editBudget
              ? <input style={S.budgetInput} type="number"
                  value={budget}
                  onChange={e=>setBudget(Number(e.target.value))}
                  onBlur={()=>setEditBudget(false)}
                  onKeyDown={e=>e.key==="Enter"&&setEditBudget(false)} autoFocus />
              : <span style={{fontWeight:800,color:budgetLeft<0?"#ef4444":"#10b981",cursor:"pointer"}}
                  onClick={()=>setEditBudget(true)}>
                  ${budgetLeft.toFixed(1)}m left
                </span>
            }
            <span style={{opacity:.3,fontSize:11}}>of ${budget}m</span>
          </div>
          <div style={S.squadPill}>
            <span style={{color: selectedIds.length===15?"#10b981":"#f59e0b"}}>{selectedIds.length}</span>
            <span style={{opacity:.4}}>/15</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={S.content}>
        {tab==="Pitch" && (
          <PitchView
            startSlots={startSlots} squad={squad} formation={formation}
            captain={captain} viceCap={viceCap}
            swapSlot={swapSlot} setSwapSlot={setSwapSlot}
            onFormationChange={handleFormationChange}
            onSlotClick={setPickerSlot}
            onRemove={removeFromSlot}
            onSetCaptain={setCaptain}
            onSetVC={setViceCap}
            onSwap={doSwap}
            totalCost={totalCost} budgetLeft={budgetLeft} budget={budget}
          />
        )}
        {tab==="Players" && (
          <PlayersView posFilter={posFilter} setPosFilter={setPosFilter}
            squad={squad} captain={captain} viceCap={viceCap} />
        )}
        {tab==="Fixtures" && <FixturesView />}
        {tab==="Vlog Mode" && (
          <VlogView startSlots={startSlots} squad={squad} formation={formation}
            captain={captain} viceCap={viceCap} teamName={teamName}
            totalCost={totalCost} budget={budget} />
        )}
      </div>

      {/* PLAYER PICKER MODAL */}
      {pickerSlot && (
        <div style={S.overlay} onClick={()=>{setPickerSlot(null);setSearch("");}}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <div style={{fontSize:10,opacity:.4,textTransform:"uppercase",letterSpacing:1}}>Pick Player</div>
                <div style={{fontWeight:800,fontSize:15,display:"flex",alignItems:"center",gap:6}}>
                  {pickerPos!=="ANY"
                    ? <span style={{...S.posPill,background:POS_COLOR[pickerPos]}}>{pickerPos}</span>
                    : <span style={{...S.posPill,background:"#6366f1"}}>SUB</span>
                  }
                  Slot
                </div>
              </div>
              <button style={S.closeBtn} onClick={()=>{setPickerSlot(null);setSearch("");}}>✕</button>
            </div>
            <input style={S.searchBox} placeholder="Search..." value={search}
              onChange={e=>setSearch(e.target.value)} autoFocus />
            <div style={S.pickerList}>
              {availablePlayers.length===0
                ? <div style={{padding:20,textAlign:"center",opacity:.4,fontSize:13}}>No players found</div>
                : availablePlayers.map(p => (
                  <div key={p.id} style={S.pickerRow} onClick={()=>assignPlayer(p.id)}>
                    <div style={{...S.miniJersey,background:POS_COLOR[p.position]}}>{p.jerseyNumber}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                      <div style={{fontSize:11,opacity:.5}}>{p.teamCode} · {p.position}</div>
                    </div>
                    <div style={{fontWeight:800,color:"#10b981",fontSize:13}}>${p.price}m</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PITCH VIEW ───────────────────────────────────────────────────────────────
function PitchView({ startSlots, squad, formation, captain, viceCap, swapSlot, setSwapSlot,
  onFormationChange, onSlotClick, onRemove, onSetCaptain, onSetVC, onSwap, totalCost, budgetLeft, budget }) {

  const rows = POS_ORDER.map(pos => startSlots.filter(s=>s.key.startsWith(pos)));
  const pct  = Math.min((totalCost/budget)*100,100);

  const handleTokenClick = (slotKey) => {
    const pid = squad[slotKey];
    if (swapSlot) {
      if (swapSlot===slotKey) { setSwapSlot(null); return; }
      onSwap(swapSlot, slotKey);
    } else {
      if (!pid) onSlotClick(slotKey);
    }
  };

  return (
    <div style={S.pitchWrap}>
      {/* Controls */}
      <div style={S.controls}>
        <div style={S.controlGroup}>
          <span style={S.controlLabel}>Formation</span>
          <select style={S.fSelect} value={formation} onChange={e=>onFormationChange(e.target.value)}>
            {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={S.budgetBar}>
          <div style={{...S.budgetFill, width:`${pct}%`, background: pct>90?"#ef4444":pct>70?"#f59e0b":"#10b981"}} />
        </div>
        <div style={{fontSize:12,fontWeight:700,color:budgetLeft<0?"#ef4444":"#e2e8f0"}}>
          ${totalCost.toFixed(1)}m <span style={{opacity:.4,fontWeight:400}}>/ ${budget}m</span>
        </div>
      </div>

      {swapSlot && (
        <div style={S.swapBanner}>
          ↔ Swap mode — tap another player to swap · <span style={{opacity:.6,cursor:"pointer"}} onClick={()=>setSwapSlot(null)}>Cancel</span>
        </div>
      )}

      {/* PITCH */}
      <div style={S.pitch}>
        <div style={S.cCircle}/><div style={S.hLine}/><div style={S.pBoxTop}/><div style={S.pBoxBot}/>

        {rows.map((rowSlots,ri)=>(
          <div key={ri} style={S.pitchRow}>
            {rowSlots.map(slot=>{
              const pid=squad[slot.key];
              const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
              const isSwapSrc=swapSlot===slot.key;
              const isSwapTarget=!!swapSlot&&swapSlot!==slot.key;
              return (
                <Token key={slot.key} slot={slot} player={player}
                  isCap={pid===captain} isVC={pid===viceCap}
                  isSwapSrc={isSwapSrc} isSwapTarget={isSwapTarget&&!!pid}
                  onClick={()=>handleTokenClick(slot.key)}
                  onPickEmpty={()=>onSlotClick(slot.key)}
                  onRemove={()=>onRemove(slot.key)}
                  onSetCaptain={()=>onSetCaptain(pid===captain?null:pid)}
                  onSetVC={()=>onSetVC(pid===viceCap?null:pid)}
                  onSwap={()=>setSwapSlot(slot.key)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* BENCH */}
      <div style={S.benchLabel}>
        <span style={S.benchTitle}>🪑 Substitutes Bench</span>
        <span style={{opacity:.4,fontSize:11}}>4 players</span>
      </div>
      <div style={S.bench}>
        {SUB_SLOTS.map((key,i)=>{
          const pid=squad[key];
          const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
          const isSwapSrc=swapSlot===key;
          const isSwapTarget=!!swapSlot&&swapSlot!==key;
          return (
            <SubToken key={key} slotKey={key} subNum={i+1} player={player}
              isCap={pid===captain} isVC={pid===viceCap}
              isSwapSrc={isSwapSrc} isSwapTarget={isSwapTarget&&!!pid}
              onClick={()=>{
                if(swapSlot){
                  if(swapSlot===key){setSwapSlot(null);return;}
                  onSwap(swapSlot,key);
                } else if(!player) onSlotClick(key);
              }}
              onRemove={()=>onRemove(key)}
              onSetCaptain={()=>onSetCaptain(pid===captain?null:pid)}
              onSetVC={()=>onSetVC(pid===viceCap?null:pid)}
              onSwap={()=>setSwapSlot(key)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── STARTING TOKEN (on pitch) ───────────────────────────────────────────────
function Token({ slot, player, isCap, isVC, isSwapSrc, isSwapTarget,
  onClick, onPickEmpty, onRemove, onSetCaptain, onSetVC, onSwap }) {
  const [menu,setMenu]=useState(false);
  const pos=slot.key.split("-")[0];

  if (!player) {
    return (
      <div style={S.emptyToken} onClick={onPickEmpty}>
        <div style={{...S.emptyCircle,borderColor:POS_COLOR[pos]}}>
          <span style={{fontSize:20,opacity:.4}}>+</span>
        </div>
        <div style={{fontSize:9,opacity:.35,marginTop:3,textTransform:"uppercase",letterSpacing:.5}}>{pos}</div>
      </div>
    );
  }

  return (
    <div style={{...S.tokenWrap,...(isSwapSrc?S.tokenSwapSrc:{}),...(isSwapTarget?S.tokenSwapTarget:{})}}
      onClick={()=>{ if(!menu) onClick(); }}>
      {isCap && <div style={S.capBadge}>C</div>}
      {isVC  && <div style={S.vcBadge}>VC</div>}
      <div style={{...S.tokenCircle,background:POS_COLOR[player.position]}}
        onClick={e=>{e.stopPropagation();setMenu(!menu);}}>
        <span style={{fontWeight:900,fontSize:13}}>{player.jerseyNumber}</span>
      </div>
      <div style={S.tokenName}>{player.name.split(" ").slice(-1)[0]}</div>
      <div style={S.tokenPrice}>${player.price}m</div>

      {menu && (
        <div style={S.ctxMenu} onClick={e=>e.stopPropagation()}>
          <div style={S.ctxItem} onClick={()=>{onSetCaptain();setMenu(false);}}>
            {isCap?"Remove Captain ©":"⭐ Set Captain"}
          </div>
          <div style={S.ctxItem} onClick={()=>{onSetVC();setMenu(false);}}>
            {isVC?"Remove Vice-Cap":"🔵 Set Vice-Captain"}
          </div>
          <div style={S.ctxItem} onClick={()=>{onSwap();setMenu(false);}}>
            ↔ Swap Position
          </div>
          <div style={{...S.ctxItem,color:"#ef4444"}} onClick={()=>{onRemove();setMenu(false);}}>
            ✕ Remove
          </div>
          <div style={{...S.ctxItem,opacity:.4,fontSize:11}} onClick={()=>setMenu(false)}>Cancel</div>
        </div>
      )}
    </div>
  );
}

// ─── SUB TOKEN (bench) ───────────────────────────────────────────────────────
function SubToken({ slotKey, subNum, player, isCap, isVC, isSwapSrc, isSwapTarget,
  onClick, onRemove, onSetCaptain, onSetVC, onSwap }) {
  const [menu,setMenu]=useState(false);

  if (!player) {
    return (
      <div style={S.subEmpty} onClick={onClick}>
        <div style={{fontSize:11,opacity:.3}}>SUB {subNum}</div>
        <div style={{fontSize:20,opacity:.2}}>+</div>
      </div>
    );
  }

  return (
    <div style={{...S.subCard,...(isSwapSrc?S.tokenSwapSrc:{}),...(isSwapTarget?S.tokenSwapTarget:{})}}
      onClick={()=>{if(!menu)onClick();}}>
      {isCap && <div style={S.capBadgeSub}>C</div>}
      {isVC  && <div style={S.vcBadgeSub}>VC</div>}
      <div style={{...S.subJersey,background:POS_COLOR[player.position]}}
        onClick={e=>{e.stopPropagation();setMenu(!menu);}}>
        {player.jerseyNumber}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {player.name}
        </div>
        <div style={{fontSize:10,opacity:.5}}>{player.teamCode} · {player.position}</div>
      </div>
      <div style={{fontWeight:800,fontSize:12,color:"#10b981"}}>${player.price}m</div>

      {menu && (
        <div style={{...S.ctxMenu,top:44,minWidth:150}} onClick={e=>e.stopPropagation()}>
          <div style={S.ctxItem} onClick={()=>{onSetCaptain();setMenu(false);}}>
            {isCap?"Remove Captain":"⭐ Set Captain"}
          </div>
          <div style={S.ctxItem} onClick={()=>{onSetVC();setMenu(false);}}>
            {isVC?"Remove Vice-Cap":"🔵 Set Vice-Captain"}
          </div>
          <div style={S.ctxItem} onClick={()=>{onSwap();setMenu(false);}}>
            ↔ Swap with Starter
          </div>
          <div style={{...S.ctxItem,color:"#ef4444"}} onClick={()=>{onRemove();setMenu(false);}}>
            ✕ Remove
          </div>
          <div style={{...S.ctxItem,opacity:.4,fontSize:11}} onClick={()=>setMenu(false)}>Cancel</div>
        </div>
      )}
    </div>
  );
}

// ─── PLAYERS VIEW ─────────────────────────────────────────────────────────────
function PlayersView({ posFilter, setPosFilter, squad, captain, viceCap }) {
  const positions=["All","GK","DEF","MID","FWD"];
  const selectedIds=Object.values(squad).filter(Boolean);
  const filtered=posFilter==="All"?SAMPLE_PLAYERS:SAMPLE_PLAYERS.filter(p=>p.position===posFilter);
  return (
    <div style={S.playersWrap}>
      <div style={S.filterRow}>
        {positions.map(pos=>(
          <button key={pos} onClick={()=>setPosFilter(pos)}
            style={{...S.filterBtn,...(posFilter===pos?{background:POS_COLOR[pos]||"#6366f1",color:"#fff",borderColor:"transparent"}:{})}}>
            {pos}
          </button>
        ))}
      </div>
      <div style={S.playerList}>
        {filtered.map(p=>{
          const inSquad=selectedIds.includes(p.id);
          const isCap=p.id===captain, isVC=p.id===viceCap;
          return (
            <div key={p.id} style={{...S.playerRow,...(inSquad?S.playerRowActive:{})}}>
              <div style={{...S.cardJersey,background:POS_COLOR[p.position]}}>{p.jerseyNumber}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>
                  {p.name}
                  {isCap&&<span style={S.inlineCap}> C</span>}
                  {isVC&&<span style={S.inlineVC}> VC</span>}
                </div>
                <div style={{fontSize:11,opacity:.5,marginTop:1}}>{p.teamCode} · {p.position}</div>
              </div>
              <div style={{fontWeight:800,color:inSquad?"#10b981":"#e2e8f0",fontSize:13}}>${p.price}m</div>
              {inSquad&&<div style={S.inSquadDot}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FIXTURES VIEW ────────────────────────────────────────────────────────────
function FixturesView() {
  const stages=[...new Set(SAMPLE_FIXTURES.map(f=>f.stage))];
  return (
    <div style={S.fixWrap}>
      {stages.map(stage=>(
        <div key={stage} style={{marginBottom:24}}>
          <div style={S.stageHead}>{stage}</div>
          {SAMPLE_FIXTURES.filter(f=>f.stage===stage).map(f=>(
            <div key={f.id} style={S.fixCard}>
              <div style={S.fixDate}>{f.date}</div>
              <div style={S.fixTeams}>
                <span style={{fontWeight:800}}>{f.homeTeam}</span>
                <span style={S.vs}>VS</span>
                <span style={{fontWeight:800}}>{f.awayTeam}</span>
              </div>
              <div style={S.fixVenue}>{f.venue}</div>
              <div style={{...S.statusTag,background:f.status==="scheduled"?"#10b98120":"#6b728020",color:f.status==="scheduled"?"#10b981":"#6b7280"}}>
                {f.status}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── VLOG VIEW ────────────────────────────────────────────────────────────────
function VlogView({ startSlots, squad, formation, captain, viceCap, teamName, totalCost, budget }) {
  const rows=POS_ORDER.map(pos=>startSlots.filter(s=>s.key.startsWith(pos)));
  const capPlayer=SAMPLE_PLAYERS.find(p=>p.id===captain);
  const vcPlayer=SAMPLE_PLAYERS.find(p=>p.id===viceCap);
  return (
    <div style={S.vlogWrap}>
      <div style={S.vlogHead}>
        <div style={S.vlogRec}>● REC</div>
        <div style={S.vlogTitle}>{teamName}</div>
        <div style={S.vlogMeta}>
          {formation}
          {capPlayer?` · C: ${capPlayer.name}`:""}
          {vcPlayer?` · VC: ${vcPlayer.name}`:""}
        </div>
        <div style={S.vlogBudget}>${totalCost.toFixed(1)}m spent of ${budget}m</div>
      </div>

      <div style={S.pitch}>
        <div style={S.cCircle}/><div style={S.hLine}/><div style={S.pBoxTop}/><div style={S.pBoxBot}/>
        {rows.map((rowSlots,ri)=>(
          <div key={ri} style={S.pitchRow}>
            {rowSlots.map(slot=>{
              const pid=squad[slot.key];
              const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
              return <Token key={slot.key} slot={slot} player={player}
                isCap={pid===captain} isVC={pid===viceCap}
                isSwapSrc={false} isSwapTarget={false}
                onClick={()=>{}} onPickEmpty={()=>{}}
                onRemove={()=>{}} onSetCaptain={()=>{}} onSetVC={()=>{}} onSwap={()=>{}} />;
            })}
          </div>
        ))}
      </div>

      <div style={S.benchLabel}>
        <span style={S.benchTitle}>🪑 Bench</span>
      </div>
      <div style={S.bench}>
        {SUB_SLOTS.map((key,i)=>{
          const pid=squad[key];
          const player=pid?SAMPLE_PLAYERS.find(p=>p.id===pid):null;
          return <SubToken key={key} slotKey={key} subNum={i+1} player={player}
            isCap={pid===captain} isVC={pid===viceCap}
            isSwapSrc={false} isSwapTarget={false}
            onClick={()=>{}} onRemove={()=>{}} onSetCaptain={()=>{}} onSetVC={()=>{}} onSwap={()=>{}} />;
        })}
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  shell:{ minHeight:"100vh", background:"#070a0e", color:"#e2e8f0", fontFamily:"'DM Sans',system-ui,sans-serif", display:"flex", flexDirection:"column" },

  // Header
  header:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"#0b0f16", borderBottom:"1px solid #1a2030", flexWrap:"wrap", gap:8 },
  hLeft:{ display:"flex", alignItems:"center", gap:10 },
  hCenter:{ display:"flex", gap:4 },
  hRight:{ display:"flex", alignItems:"center", gap:12 },
  logo:{ fontWeight:900, fontSize:20, letterSpacing:-1 },
  teamName:{ fontWeight:700, fontSize:13, cursor:"pointer", opacity:.85 },
  nameInput:{ background:"#1a2030", border:"1px solid #3b82f6", color:"#fff", borderRadius:6, padding:"3px 8px", fontSize:13, outline:"none" },
  tabBtn:{ background:"none", border:"none", cursor:"pointer", color:"#4b5563", fontSize:12, fontWeight:600, padding:"6px 11px", borderRadius:7 },
  tabOn:{ background:"#1a2030", color:"#fff" },
  budgetBox:{ display:"flex", gap:6, alignItems:"center", background:"#0f1520", border:"1px solid #1a2030", borderRadius:8, padding:"5px 12px", fontSize:12 },
  budgetInput:{ background:"transparent", border:"none", color:"#10b981", width:60, fontWeight:800, fontSize:13, outline:"none" },
  squadPill:{ fontWeight:800, fontSize:15 },
  content:{ flex:1 },

  // Pitch wrap
  pitchWrap:{ padding:"14px 12px", maxWidth:640, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  controls:{ display:"flex", alignItems:"center", gap:10, marginBottom:12, background:"#0b0f16", border:"1px solid #1a2030", borderRadius:10, padding:"10px 14px" },
  controlGroup:{ display:"flex", alignItems:"center", gap:8 },
  controlLabel:{ fontSize:10, opacity:.4, textTransform:"uppercase", letterSpacing:1 },
  fSelect:{ background:"#1a2030", border:"1px solid #2d3d55", color:"#fff", borderRadius:7, padding:"5px 10px", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none" },
  budgetBar:{ flex:1, height:4, background:"#1a2030", borderRadius:99, overflow:"hidden" },
  budgetFill:{ height:"100%", borderRadius:99, transition:"width .3s,background .3s" },
  swapBanner:{ background:"#1a2030", border:"1px solid #3b82f6", borderRadius:8, padding:"8px 14px", fontSize:12, color:"#93c5fd", marginBottom:10, textAlign:"center" },

  // Pitch
  pitch:{ background:"linear-gradient(180deg,#0a4d1a 0%,#0c6320 45%,#0c6320 55%,#0a4d1a 100%)", borderRadius:14, border:"3px solid #145220", padding:"16px 8px", display:"flex", flexDirection:"column", gap:12, position:"relative", overflow:"hidden", minHeight:420, boxShadow:"0 20px 60px rgba(0,0,0,.7)" },
  cCircle:{ position:"absolute", left:"50%", top:"50%", width:72, height:72, borderRadius:"50%", border:"2px solid rgba(255,255,255,.12)", transform:"translate(-50%,-50%)", pointerEvents:"none" },
  hLine:{ position:"absolute", left:0, right:0, top:"50%", height:2, background:"rgba(255,255,255,.1)", pointerEvents:"none" },
  pBoxTop:{ position:"absolute", left:"22%", right:"22%", top:0, height:55, border:"2px solid rgba(255,255,255,.1)", borderTop:"none", pointerEvents:"none" },
  pBoxBot:{ position:"absolute", left:"22%", right:"22%", bottom:0, height:55, border:"2px solid rgba(255,255,255,.1)", borderBottom:"none", pointerEvents:"none" },
  pitchRow:{ display:"flex", justifyContent:"center", gap:6, position:"relative", zIndex:1 },

  // Empty token
  emptyToken:{ display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", width:62 },
  emptyCircle:{ width:44, height:44, borderRadius:"50%", border:"2px dashed", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.3)" },

  // Player token
  tokenWrap:{ display:"flex", flexDirection:"column", alignItems:"center", width:62, position:"relative", cursor:"pointer" },
  tokenSwapSrc:{ filter:"drop-shadow(0 0 8px #3b82f6)" },
  tokenSwapTarget:{ filter:"drop-shadow(0 0 8px #f59e0b)", opacity:.8 },
  tokenCircle:{ width:44, height:44, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(0,0,0,.6)", border:"2px solid rgba(255,255,255,.2)" },
  tokenName:{ fontSize:9, fontWeight:700, marginTop:3, textAlign:"center", textShadow:"0 1px 4px rgba(0,0,0,.9)", maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  tokenPrice:{ fontSize:8, opacity:.65, textShadow:"0 1px 4px rgba(0,0,0,.9)" },
  capBadge:{ position:"absolute", top:-5, right:2, background:"#f59e0b", color:"#000", fontSize:8, fontWeight:900, borderRadius:4, padding:"1px 4px", zIndex:2 },
  vcBadge:{ position:"absolute", top:-5, right:2, background:"#3b82f6", color:"#fff", fontSize:8, fontWeight:900, borderRadius:4, padding:"1px 4px", zIndex:2 },

  // Context menu
  ctxMenu:{ position:"absolute", top:52, left:"50%", transform:"translateX(-50%)", background:"#131926", border:"1px solid #2d3d55", borderRadius:10, overflow:"hidden", zIndex:99, boxShadow:"0 12px 40px rgba(0,0,0,.8)", minWidth:150 },
  ctxItem:{ padding:"9px 14px", fontSize:12, fontWeight:600, cursor:"pointer", borderBottom:"1px solid #1a2030", whiteSpace:"nowrap" },

  // Bench
  benchLabel:{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"14px 0 8px" },
  benchTitle:{ fontSize:12, fontWeight:700, opacity:.7, textTransform:"uppercase", letterSpacing:1 },
  bench:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 },
  subEmpty:{ background:"#0b0f16", border:"2px dashed #1a2030", borderRadius:10, padding:"12px 8px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", minHeight:70 },
  subCard:{ background:"#0b0f16", border:"1px solid #1a2030", borderRadius:10, padding:"10px 10px", display:"flex", alignItems:"center", gap:8, position:"relative", cursor:"pointer", minHeight:60 },
  subJersey:{ width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, flexShrink:0 },
  capBadgeSub:{ position:"absolute", top:2, right:4, background:"#f59e0b", color:"#000", fontSize:8, fontWeight:900, borderRadius:3, padding:"1px 4px" },
  vcBadgeSub:{ position:"absolute", top:2, right:4, background:"#3b82f6", color:"#fff", fontSize:8, fontWeight:900, borderRadius:3, padding:"1px 4px" },

  // Modal
  overlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 },
  modal:{ background:"#0b0f16", border:"1px solid #1a2030", borderRadius:"14px 14px 0 0", width:"100%", maxWidth:480, maxHeight:"75vh", display:"flex", flexDirection:"column" },
  modalHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #1a2030" },
  closeBtn:{ background:"#1a2030", border:"none", color:"#fff", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontWeight:700, fontSize:13 },
  searchBox:{ background:"#0f1520", border:"none", borderBottom:"1px solid #1a2030", color:"#fff", padding:"12px 18px", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
  pickerList:{ overflow:"auto", flex:1 },
  pickerRow:{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", cursor:"pointer", borderBottom:"1px solid #0f1520" },
  miniJersey:{ width:32, height:32, borderRadius:7, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12 },
  posPill:{ display:"inline-block", padding:"2px 7px", borderRadius:5, fontSize:11, fontWeight:700 },

  // Players tab
  playersWrap:{ padding:"16px 14px", maxWidth:640, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  filterRow:{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" },
  filterBtn:{ background:"#0b0f16", border:"1px solid #1a2030", color:"#64748b", borderRadius:7, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" },
  playerList:{ display:"flex", flexDirection:"column", gap:6 },
  playerRow:{ display:"flex", alignItems:"center", gap:10, background:"#0b0f16", border:"1px solid #1a2030", borderRadius:9, padding:"10px 14px", position:"relative" },
  playerRowActive:{ border:"1px solid #10b98145", background:"#10b98108" },
  cardJersey:{ width:34, height:34, borderRadius:7, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12 },
  inlineCap:{ background:"#f59e0b", color:"#000", borderRadius:4, padding:"1px 5px", fontSize:9, fontWeight:900, marginLeft:4 },
  inlineVC:{ background:"#3b82f6", color:"#fff", borderRadius:4, padding:"1px 5px", fontSize:9, fontWeight:900, marginLeft:4 },
  inSquadDot:{ width:7, height:7, borderRadius:"50%", background:"#10b981", position:"absolute", top:8, right:8 },

  // Fixtures
  fixWrap:{ padding:"16px 14px", maxWidth:640, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  stageHead:{ fontSize:10, color:"#6366f1", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:8 },
  fixCard:{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", background:"#0b0f16", border:"1px solid #1a2030", borderRadius:9, padding:"12px 14px", marginBottom:6 },
  fixDate:{ fontSize:11, color:"#4b5563", minWidth:80 },
  fixTeams:{ flex:1, display:"flex", alignItems:"center", gap:8, minWidth:150 },
  vs:{ fontSize:9, background:"#1a2030", borderRadius:4, padding:"2px 6px", color:"#4b5563" },
  fixVenue:{ fontSize:11, color:"#4b5563" },
  statusTag:{ fontSize:10, borderRadius:5, padding:"3px 8px", fontWeight:600 },

  // Vlog
  vlogWrap:{ padding:"16px 12px", maxWidth:640, margin:"0 auto", width:"100%", boxSizing:"border-box" },
  vlogHead:{ textAlign:"center", marginBottom:16 },
  vlogRec:{ fontSize:11, color:"#ef4444", letterSpacing:3, fontWeight:700, marginBottom:6 },
  vlogTitle:{ fontSize:24, fontWeight:900, marginBottom:4 },
  vlogMeta:{ fontSize:12, opacity:.5, marginBottom:4 },
  vlogBudget:{ fontSize:11, color:"#10b981" },
};
