import { useEffect, useMemo, useState } from "react";

const FORMATIONS = {
  "3-4-3":{ DEF:3,MID:4,FWD:3 }, "3-5-2":{ DEF:3,MID:5,FWD:2 },
  "4-3-3":{ DEF:4,MID:3,FWD:3 }, "4-4-2":{ DEF:4,MID:4,FWD:2 },
  "4-5-1":{ DEF:4,MID:5,FWD:1 }, "5-3-2":{ DEF:5,MID:3,FWD:2 },
  "5-4-1":{ DEF:5,MID:4,FWD:1 },
};
const POS_LIMITS  = { GK:2, DEF:5, MID:5, FWD:3 };
const POS_ORDER   = ["FWD","MID","DEF","GK"];
const TABS        = ["My Team","Players","Fixtures","Vlog Mode"];
const STORAGE_KEY = "wc26-squad-v4";

const TEAM_COLORS = {
  ALG:["#006233","#fff"], ARG:["#75aadb","#fff"], AUS:["#00843d","#ffd700"],
  AUT:["#ed2939","#fff"], BEL:["#1a1a1a","#ef3340"], BIH:["#002395","#fecb00"],
  BRA:["#f7e017","#009c3b"], CAN:["#ff0000","#fff"], CIV:["#f77f00","#009a44"],
  CMR:["#007a5e","#ce1126"], COD:["#007fff","#f7d618"], COL:["#fcd116","#003087"],
  CPV:["#003893","#cf2027"], CRO:["#ff0000","#fff"], CUW:["#002b7f","#f9e814"],
  ECU:["#ffd100","#034ea2"], EGY:["#ce1126","#fff"], ENG:["#fff","#cf142b"],
  ESP:["#c60b1e","#ffc400"], FRA:["#003189","#fff"], GER:["#fff","#1a1a1a"],
  GHA:["#006b3f","#fcd116"], HAI:["#00209f","#d21034"], IRN:["#239f40","#fff"],
  IRQ:["#ce1126","#fff"], JOR:["#007a3d","#fff"], JPN:["#bc002d","#fff"],
  KOR:["#cd2e3a","#fff"], KSA:["#006c35","#fff"], MAR:["#c1272d","#006233"],
  MEX:["#006847","#fff"], NED:["#f36c21","#fff"], NGA:["#008751","#fff"],
  NOR:["#ef2b2d","#fff"], NZL:["#00247d","#cc142b"], PAN:["#da121a","#fff"],
  PAR:["#d52b1e","#fff"], POL:["#dc143c","#fff"], POR:["#006600","#ff0000"],
  QAT:["#8d1b3d","#fff"], RSA:["#007a4d","#fff"], SCO:["#003da5","#fff"],
  SEN:["#00853f","#fdef42"], SUI:["#ff0000","#fff"], SWE:["#006aa7","#fecc02"],
  TUN:["#e70013","#fff"], TUR:["#e30a17","#fff"], URU:["#75aadb","#fff"],
  USA:["#002868","#bf0a30"], UZB:["#1eb53a","#fff"], DEFAULT:["#334155","#cbd5e1"],
};
const getColors = code => TEAM_COLORS[code] || TEAM_COLORS.DEFAULT;

const POS_BG = { GK:"#d97706", DEF:"#1d4ed8", MID:"#15803d", FWD:"#b91c1c" };

const defaultTeam = () => ({
  teamName:"My WC26 Vlog XI", formation:"4-3-3", budget:100,
  captain:"", viceCaptain:"", starters:[], bench:[],
});
const loadTeam = () => {
  try { const s=localStorage.getItem(STORAGE_KEY); return s?{...defaultTeam(),...JSON.parse(s)}:defaultTeam(); }
  catch { return defaultTeam(); }
};
const saveTeam = t => { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(t)); } catch {} };

function playerPoints(player, captainId) {
  const base = Number(player?.points || 0);
  if (player?.id === captainId) return base * 2;
  return base;
}
function totalSquadPoints(starters, bench, captainId) {
  return [...starters,...bench].reduce((s,p)=>s+playerPoints(p,captainId),0);
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]               = useState("My Team");
  const [allPlayers, setAllPlayers] = useState([]);
  const [fixtures, setFixtures]     = useState([]);
  const [team, setTeam]             = useState(loadTeam);
  const [loading, setLoading]       = useState(true);
  const [posFilter, setPosFilter]   = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [search, setSearch]         = useState("");
  const [sortPrice, setSortPrice]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("./data/fifa-players.json").then(r=>r.json()),
      fetch("./data/fifa-fixtures.json").then(r=>r.json()),
    ]).then(([p,f])=>{ setAllPlayers(p); setFixtures(f); })
      .finally(()=>setLoading(false));
  }, []);

  useEffect(()=>saveTeam(team),[team]);

  const starterPlayers = useMemo(()=>
    team.starters.map(id=>allPlayers.find(p=>p.id===id)).filter(Boolean),
    [team.starters,allPlayers]);
  const benchPlayers = useMemo(()=>
    team.bench.map(id=>allPlayers.find(p=>p.id===id)).filter(Boolean),
    [team.bench,allPlayers]);
  const allSelected = useMemo(()=>[...team.starters,...team.bench],[team.starters,team.bench]);
  const totalCost   = useMemo(()=>
    [...starterPlayers,...benchPlayers].reduce((s,p)=>s+Number(p.price||0),0),
    [starterPlayers,benchPlayers]);
  const budgetLeft  = Number(team.budget||100) - totalCost;
  const totalPoints = useMemo(()=>
    totalSquadPoints(starterPlayers,benchPlayers,team.captain),
    [starterPlayers,benchPlayers,team.captain]);

  const countStarter = pos => starterPlayers.filter(p=>p.position===pos).length;
  const countTotal   = pos => countStarter(pos)+benchPlayers.filter(p=>p.position===pos).length;

  const addPlayer = pid => {
    const player = allPlayers.find(p=>p.id===pid);
    if (!player||allSelected.includes(pid)) return;
    const pos = player.position;
    if (countTotal(pos)>=POS_LIMITS[pos]) return;
    if (allSelected.length>=15) return;
    setTeam(prev=>{
      const shape   = FORMATIONS[prev.formation]||FORMATIONS["4-3-3"];
      const slotMax = pos==="GK"?1:(shape[pos]||0);
      const curStar = prev.starters.map(id=>allPlayers.find(p=>p.id===id)).filter(p=>p&&p.position===pos).length;
      const goStar  = curStar<slotMax&&prev.starters.length<11;
      const goBench = prev.bench.length<4;
      if (goStar)  return {...prev,starters:[...prev.starters,pid]};
      if (goBench) return {...prev,bench:[...prev.bench,pid]};
      return prev;
    });
  };
  const removePlayer = pid => setTeam(prev=>({
    ...prev,
    starters:prev.starters.filter(id=>id!==pid),
    bench:prev.bench.filter(id=>id!==pid),
    captain:prev.captain===pid?"":prev.captain,
    viceCaptain:prev.viceCaptain===pid?"":prev.viceCaptain,
  }));
  const swapPlayers = (sId,bId) => setTeam(prev=>({
    ...prev,
    starters:prev.starters.map(id=>id===sId?bId:id),
    bench:prev.bench.map(id=>id===bId?sId:id),
  }));
  const setCaptain  = pid=>setTeam(prev=>({...prev,captain:prev.captain===pid?"":pid,viceCaptain:prev.viceCaptain===pid?"":prev.viceCaptain}));
  const setViceCap  = pid=>setTeam(prev=>({...prev,viceCaptain:prev.viceCaptain===pid?"":pid,captain:prev.captain===pid?"":prev.captain}));
  const setFormation= f=>setTeam(prev=>({...prev,formation:f}));
  const setTeamName = n=>setTeam(prev=>({...prev,teamName:n}));
  const setBudget   = b=>setTeam(prev=>({...prev,budget:b}));

  const allSquad  = [...starterPlayers,...benchPlayers];
  const capPlayer = allSquad.find(p=>p.id===team.captain);
  const vcPlayer  = allSquad.find(p=>p.id===team.viceCaptain);

  if (loading) return <div style={S.loading}>Loading FIFA WC2026 data…</div>;

  return (
    <main style={S.shell}>
      <Header team={team} budgetLeft={budgetLeft} totalCost={totalCost}
        squadCount={allSelected.length} totalPoints={totalPoints}
        captain={capPlayer} vc={vcPlayer}
        onFormation={setFormation} onName={setTeamName} onBudget={setBudget}/>
      <nav style={S.tabBar}>
        {TABS.map(t=>(
          <button key={t} style={{...S.tab,...(tab===t?S.tabOn:{})}} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </nav>
      <div style={S.content}>
        {tab==="My Team"&&<MyTeamView starterPlayers={starterPlayers} benchPlayers={benchPlayers}
          formation={team.formation} captainId={team.captain} vcId={team.viceCaptain}
          onSwap={swapPlayers} onRemove={removePlayer} onCaptain={setCaptain} onVC={setViceCap}/>}
        {tab==="Players"&&<PlayersView allPlayers={allPlayers} allSelected={allSelected}
          starterPlayers={starterPlayers} benchPlayers={benchPlayers}
          captainId={team.captain} vcId={team.viceCaptain} formation={team.formation}
          posFilter={posFilter} setPosFilter={setPosFilter}
          teamFilter={teamFilter} setTeamFilter={setTeamFilter}
          search={search} setSearch={setSearch} sortPrice={sortPrice} setSortPrice={setSortPrice}
          countTotal={countTotal} onAdd={addPlayer} onRemove={removePlayer}
          onCaptain={setCaptain} onVC={setViceCap}/>}
        {tab==="Fixtures"&&<FixturesView fixtures={fixtures}/>}
        {tab==="Vlog Mode"&&<VlogView starterPlayers={starterPlayers} benchPlayers={benchPlayers}
          formation={team.formation} teamName={team.teamName}
          captainId={team.captain} vcId={team.viceCaptain}
          totalCost={totalCost} budget={team.budget} totalPoints={totalPoints}/>}
      </div>
    </main>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
function Header({team,budgetLeft,totalCost,squadCount,totalPoints,captain,vc,onFormation,onName,onBudget}) {
  const [editName,setEditName]=useState(false);
  const [editBudget,setEditBudget]=useState(false);
  return (
    <header style={S.header}>
      <div style={{flex:1,minWidth:0}}>
        <div style={S.kicker}>World Cup 2026 Fantasy</div>
        {editName
          ?<input style={S.nameInput} value={team.teamName} autoFocus
              onChange={e=>onName(e.target.value)} onBlur={()=>setEditName(false)}
              onKeyDown={e=>e.key==="Enter"&&setEditName(false)}/>
          :<h1 style={S.hTitle} onClick={()=>setEditName(true)}>{team.teamName} <span style={{opacity:.4,fontSize:14}}>✏</span></h1>
        }
        <div style={S.hSub}>
          <select style={S.fSel} value={team.formation} onChange={e=>onFormation(e.target.value)}>
            {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          {captain&&<span style={S.cPill}>C: {captain.name}</span>}
          {vc&&<span style={{...S.cPill,background:"#1d4ed8"}}>VC: {vc.name}</span>}
        </div>
      </div>
      <div style={S.hBox}>
        <div style={S.hBoxRow}><span style={S.muted}>Squad</span><strong style={{color:squadCount===15?"#4ade80":"#facc15"}}>{squadCount}/15</strong></div>
        <div style={S.hBoxRow}><span style={S.muted}>Pts</span><strong style={{color:"#a78bfa"}}>{totalPoints}</strong></div>
        <div style={S.hBoxRow}>
          <span style={S.muted}>Budget</span>
          {editBudget
            ?<input type="number" style={S.budgetInput} value={team.budget} autoFocus
                onChange={e=>onBudget(Number(e.target.value))} onBlur={()=>setEditBudget(false)}
                onKeyDown={e=>e.key==="Enter"&&setEditBudget(false)}/>
            :<strong style={{color:budgetLeft<0?"#fb7185":"#4ade80",cursor:"pointer"}} onClick={()=>setEditBudget(true)}>
              ${budgetLeft.toFixed(1)}m
            </strong>
          }
        </div>
        <div style={{...S.muted,fontSize:10,textAlign:"right"}}>Used ${totalCost.toFixed(1)}m</div>
      </div>
    </header>
  );
}

// ── MY TEAM ───────────────────────────────────────────────────────────────────
function MyTeamView({starterPlayers,benchPlayers,formation,captainId,vcId,onSwap,onRemove,onCaptain,onVC}) {
  const [swapSrc,setSwapSrc]=useState(null);
  const [activeMenu,setActiveMenu]=useState(null); // track which player's menu is open
  const [swapError,setSwapError]=useState(""); // Fix: feedback for invalid swaps
  const shape=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const rows=POS_ORDER.map(pos=>({
    pos,players:starterPlayers.filter(p=>p.position===pos),slots:pos==="GK"?1:shape[pos],
  }));

  // Fix 1: close any open menu before entering swap mode; show error for same-type swaps
  const handleClick=(pid,isStarter)=>{
    if (!swapSrc){
      setActiveMenu(null); // close menu before entering swap mode
      setSwapSrc({id:pid,isStarter});
      setSwapError("");
      return;
    }
    if (swapSrc.id===pid){setSwapSrc(null);setSwapError("");return;}
    if (swapSrc.isStarter===isStarter){
      // same type — show helpful error instead of silently failing
      setSwapError(isStarter?"Can only swap a starter with a bench player.":"Can only swap a bench player with a starter.");
      setSwapSrc(null);
      return;
    }
    if (swapSrc.isStarter&&!isStarter) onSwap(swapSrc.id,pid);
    else onSwap(pid,swapSrc.id);
    setSwapSrc(null);
    setSwapError("");
  };

  const starterPts=starterPlayers.reduce((s,p)=>s+playerPoints(p,captainId),0);
  const benchPts=benchPlayers.reduce((s,p)=>s+playerPoints(p,captainId),0);

  return (
    <div style={S.pitchWrap}>
      {/* Points bar */}
      <div style={S.ptBar}>
        <div style={S.ptCell}><span style={S.muted}>Starters</span><strong style={{color:"#a78bfa"}}>{starterPts} pts</strong></div>
        <div style={{...S.ptCell,...S.ptDivider}}><span style={S.muted}>Bench</span><strong style={{color:"#64748b"}}>{benchPts} pts</strong></div>
        <div style={S.ptCell}><span style={S.muted}>Total</span><strong style={{color:"#4ade80"}}>{starterPts+benchPts} pts</strong></div>
      </div>

      {swapSrc&&(
        <div style={S.swapBanner}>
          ↔ Swap mode — tap a {swapSrc.isStarter?"bench":"starter"} player
          <button style={S.cancelBtn} onClick={()=>{setSwapSrc(null);setSwapError("");}}>Cancel</button>
        </div>
      )}
      {swapError&&!swapSrc&&(
        <div style={{...S.swapBanner,background:"#3b1a1a",borderColor:"#ef4444",color:"#fca5a5",justifyContent:"space-between"}}>
          ⚠ {swapError}
          <button style={{...S.cancelBtn,background:"#7f1d1d"}} onClick={()=>setSwapError("")}>OK</button>
        </div>
      )}

      {/* PITCH */}
      <div style={S.pitch}>
        <PitchLines/>
        {rows.map(({pos,players,slots})=>(
          <div key={pos} style={S.pitchRow}>
            {Array.from({length:slots},(_,i)=>{
              const p=players[i];
              return p
                ?<PlayerCard key={p.id} player={p} isStarter
                    isCap={p.id===captainId} isVC={p.id===vcId}
                    pts={playerPoints(p,captainId)}
                    isSwapSrc={swapSrc?.id===p.id}
                    isSwapTarget={!!swapSrc&&swapSrc.id!==p.id}
                    menuOpen={activeMenu===p.id}
                    onMenuToggle={(id)=>setActiveMenu(activeMenu===id?null:id)}
                    onClick={()=>handleClick(p.id,true)}
                    onCaptain={()=>{onCaptain(p.id);setActiveMenu(null);}}
                    onVC={()=>{onVC(p.id);setActiveMenu(null);}}
                    onRemove={()=>{onRemove(p.id);setActiveMenu(null);}}/>
                :<EmptyCard key={`${pos}-${i}`} pos={pos}/>;
            })}
          </div>
        ))}
      </div>

      {/* BENCH */}
      <div style={S.benchHead}>
        <span style={S.kicker}>🪑 SUBSTITUTES BENCH</span>
        <span style={S.muted}>{benchPlayers.length}/4</span>
      </div>
      <div style={S.benchRow}>
        {Array.from({length:4},(_,i)=>{
          const p=benchPlayers[i];
          return p
            ?<PlayerCard key={p.id} player={p} isStarter={false}
                isCap={p.id===captainId} isVC={p.id===vcId}
                pts={playerPoints(p,captainId)}
                isSwapSrc={swapSrc?.id===p.id}
                isSwapTarget={!!swapSrc&&swapSrc.id!==p.id}
                menuOpen={activeMenu===p.id}
                onMenuToggle={(id)=>setActiveMenu(activeMenu===id?null:id)}
                onClick={()=>handleClick(p.id,false)}
                onCaptain={()=>{onCaptain(p.id);setActiveMenu(null);}}
                onVC={()=>{onVC(p.id);setActiveMenu(null);}}
                onRemove={()=>{onRemove(p.id);setActiveMenu(null);}}/>
            :<EmptyBenchCard key={`bench-${i}`} num={i+1}/>;
        })}
      </div>
      <div style={S.legend}>
        <span style={S.legItem}><span style={{...S.badge,background:"#f59e0b",color:"#000"}}>C</span>Captain ×2</span>
        <span style={S.legItem}><span style={{...S.badge,background:"#3b82f6"}}>VC</span>Vice-Captain</span>
        <span style={{...S.muted,fontSize:10}}>Tap card → menu</span>
      </div>
    </div>
  );
}

// ── PLAYER CARD (pitch + bench) ───────────────────────────────────────────────
function PlayerCard({player,isStarter,isCap,isVC,pts,isSwapSrc,isSwapTarget,menuOpen,onMenuToggle,onClick,onCaptain,onVC,onRemove}) {
  const [pri,sec]=getColors(player.teamCode);
  const basePts=Number(player.points||0);

  return (
    <div style={{
      ...S.card,
      ...(isStarter?S.cardStarter:S.cardBench),
      ...(isSwapSrc?{boxShadow:"0 0 0 2px #60a5fa, 0 4px 20px rgba(96,165,250,.4)"}:{}),
      ...(isSwapTarget?{boxShadow:"0 0 0 2px #fbbf24",opacity:.8}:{}),
      // Fix: elevate card when menu is open so popup renders above all sibling cards
      ...(menuOpen?{zIndex:100,position:"relative"}:{}),
    }}>
      {/* C / VC badge */}
      {isCap&&<div style={S.capBadge}>C</div>}
      {isVC &&<div style={S.vcBadge}>VC</div>}

      {/* Jersey - tap target */}
      <button style={{...S.cardTapBtn}} onClick={(e)=>{
        e.stopPropagation();
        if(isSwapTarget){onClick();return;}
        onMenuToggle(player.id);
      }}>
        <Jersey primary={pri} secondary={sec} number={player.jerseyNumber||"?"} size={isStarter?52:44}/>
      </button>

      {/* Info */}
      <div style={S.cardInfo}>
        <div style={S.cardName}>{player.name}</div>
        <div style={S.cardMeta}>
          <span style={{...S.posBadge,background:POS_BG[player.position]||"#374151"}}>{player.position}</span>
          <span style={S.cardTeam}>{player.teamCode}</span>
        </div>
        <div style={S.cardBottom}>
          <span style={S.cardPrice}>${Number(player.price||0).toFixed(1)}m</span>
          <span style={{...S.cardPts,color:pts>0?"#4ade80":basePts===0?"#475569":"#fb7185"}}>
            {pts}pts{isCap&&basePts>0&&<span style={S.x2}>×2</span>}
          </span>
        </div>
        <div style={S.cardFix}>{player.nextFixture||""}</div>
      </div>

      {/* Context menu - controlled by parent */}
      {menuOpen&&(
        <div style={S.ctxMenu}>
          {/* Fix: close menu first, then enter swap mode so state is clean */}
          <button style={S.ctxBtn} onClick={(e)=>{e.stopPropagation();onMenuToggle(null);setTimeout(()=>onClick(),0);}}>
            ↔ Swap
          </button>
          {/* Fix: use onPointerDown for reliable touch response before menu can dismiss */}
          <button style={S.ctxBtn}
            onPointerDown={(e)=>{e.stopPropagation();onCaptain();}}
            onClick={(e)=>e.stopPropagation()}>
            {isCap?"✕ Remove Captain":"⭐ Captain (×2)"}
          </button>
          <button style={S.ctxBtn}
            onPointerDown={(e)=>{e.stopPropagation();onVC();}}
            onClick={(e)=>e.stopPropagation()}>
            {isVC?"✕ Remove Vice-Cap":"🔵 Vice-Captain"}
          </button>
          <button style={{...S.ctxBtn,color:"#fb7185"}}
            onPointerDown={(e)=>{e.stopPropagation();onRemove();}}
            onClick={(e)=>e.stopPropagation()}>
            ✕ Remove
          </button>
          <button style={{...S.ctxBtn,opacity:.6}} onClick={(e)=>{e.stopPropagation();onMenuToggle(null);}}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyCard({pos}) {
  return (
    <div style={{...S.card,...S.cardStarter,...S.cardEmpty}}>
      <div style={S.emptyJersey}>
        <svg width={52} height={52} viewBox="0 0 100 96" fill="none">
          <path d="M28 18 10 32l9 11 7-6v45h48V37l7 6 9-11-18-14c-6 6-13 9-22 9s-16-3-22-9Z"
            fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.2)" strokeWidth="2" strokeDasharray="5 4"/>
          <text x="50" y="62" textAnchor="middle" fontSize="28" fill="rgba(255,255,255,.25)" fontFamily="Arial">+</text>
        </svg>
      </div>
      <div style={S.cardInfo}>
        <div style={{...S.cardName,opacity:.35}}>{pos}</div>
        <div style={{...S.cardMeta}}><span style={{...S.posBadge,background:POS_BG[pos]||"#374151",opacity:.4}}>{pos}</span></div>
        <div style={S.cardBottom}><span style={{...S.cardPrice,opacity:.3}}>Empty</span></div>
      </div>
    </div>
  );
}

function EmptyBenchCard({num}) {
  return (
    <div style={{...S.card,...S.cardBench,...S.cardEmpty}}>
      <div style={S.emptyJersey}>
        <svg width={44} height={44} viewBox="0 0 100 96" fill="none">
          <path d="M28 18 10 32l9 11 7-6v45h48V37l7 6 9-11-18-14c-6 6-13 9-22 9s-16-3-22-9Z"
            fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.15)" strokeWidth="2" strokeDasharray="5 4"/>
          <text x="50" y="62" textAnchor="middle" fontSize="28" fill="rgba(255,255,255,.2)" fontFamily="Arial">+</text>
        </svg>
      </div>
      <div style={S.cardInfo}>
        <div style={{...S.cardName,opacity:.3}}>Sub {num}</div>
        <div style={{...S.cardBottom,opacity:.3}}><span style={S.cardPrice}>Add player</span></div>
      </div>
    </div>
  );
}

// ── PLAYERS VIEW ──────────────────────────────────────────────────────────────
function PlayersView({allPlayers,allSelected,starterPlayers,benchPlayers,captainId,vcId,
  formation,posFilter,setPosFilter,teamFilter,setTeamFilter,
  search,setSearch,sortPrice,setSortPrice,countTotal,onAdd,onRemove,onCaptain,onVC}) {

  const teamList=useMemo(()=>
    [...new Set(allPlayers.map(p=>p.teamCode).filter(Boolean))].sort(),[allPlayers]);

  const filtered=useMemo(()=>{
    let list=allPlayers.filter(p=>{
      if (posFilter!=="All"&&p.position!==posFilter) return false;
      if (teamFilter!=="All"&&p.teamCode!==teamFilter) return false;
      const q=search.trim().toLowerCase();
      if (q&&!p.name?.toLowerCase().includes(q)&&!p.fullName?.toLowerCase().includes(q)&&
           !p.teamCode?.toLowerCase().includes(q)&&!p.team?.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortPrice) list=[...list].sort((a,b)=>b.price-a.price);
    return list;
  },[allPlayers,posFilter,teamFilter,search,sortPrice]);

  const canAdd=p=>{
    if (allSelected.includes(p.id)) return false;
    if (countTotal(p.position)>=POS_LIMITS[p.position]) return false;
    if (allSelected.length>=15) return false;
    return true;
  };

  return (
    <div style={S.page}>
      <div style={S.filterRow}>
        {["All","GK","DEF","MID","FWD"].map(pos=>(
          <button key={pos} style={{...S.fBtn,...(posFilter===pos?S.fBtnOn:{})}} onClick={()=>setPosFilter(pos)}>
            {pos}{pos!=="All"?` (${countTotal(pos)}/${POS_LIMITS[pos]})`:""}
          </button>
        ))}
      </div>
      <div style={S.filterRow}>
        <select style={S.teamSel} value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}>
          <option value="All">🌍 All Teams</option>
          {teamList.map(code=><option key={code} value={code}>{code}</option>)}
        </select>
        <button style={{...S.fBtn,...(sortPrice?S.fBtnOn:{})}} onClick={()=>setSortPrice(v=>!v)}>
          💰 {sortPrice?"Price ↓":"Default"}
        </button>
      </div>
      <input style={S.searchBox} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player, team…"/>
      <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>
        {filtered.length} players{teamFilter!=="All"?` · ${teamFilter}`:""}
      </div>
      <div style={S.playerList}>
        {filtered.map(p=>{
          const selected=allSelected.includes(p.id);
          const isStarter=starterPlayers.some(s=>s.id===p.id);
          const isBench=benchPlayers.some(b=>b.id===p.id);
          const isCap=p.id===captainId, isVC=p.id===vcId;
          const ok=canAdd(p);
          const [pri,sec]=getColors(p.teamCode);
          const pts=playerPoints(p,captainId);
          return (
            <article key={p.id} style={{...S.pRow,...(selected?S.pRowSel:{})}}>
              <Jersey primary={pri} secondary={sec} number={p.jerseyNumber||"?"} size={44}/>
              <div style={S.pInfo}>
                <strong style={{fontSize:13,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                  {p.fullName||p.name}
                  {isCap&&<span style={{...S.badge,background:"#f59e0b",color:"#000"}}>C</span>}
                  {isVC &&<span style={{...S.badge,background:"#3b82f6"}}>VC</span>}
                  {isStarter&&<span style={{...S.badge,background:"#166534"}}>Starter</span>}
                  {isBench  &&<span style={{...S.badge,background:"#374151"}}>Bench</span>}
                </strong>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                  <span style={{...S.posBadge,background:POS_BG[p.position]||"#374151"}}>{p.position}</span>
                  <span style={{fontSize:11,color:"#64748b"}}>{p.team} · {p.nextFixture}</span>
                </div>
              </div>
              <div style={{textAlign:"right",minWidth:60}}>
                <div style={{fontWeight:900,color:"#facc15",fontSize:13}}>${Number(p.price||0).toFixed(1)}m</div>
                <div style={{fontSize:11,fontWeight:700,color:pts>0?"#a78bfa":"#475569",marginTop:2}}>
                  {pts}pts{isCap&&Number(p.points||0)>0&&<span style={{...S.x2,fontSize:9}}> ×2</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                {!selected
                  ?<button style={{...S.btn,...(ok?{background:"#15803d",color:"#fff"}:{background:"#1f2937",color:"#4b5563",cursor:"not-allowed"})}}
                      disabled={!ok} onClick={()=>onAdd(p.id)}>{ok?"+ Add":"Full"}</button>
                  :<>
                    <button style={{...S.btn,background:"#7f1d1d",color:"#fca5a5"}} onClick={()=>onRemove(p.id)}>✕</button>
                    <button style={{...S.btn,...(isCap?{background:"#f59e0b",color:"#000"}:{background:"#1f2937",color:"#9ca3af"})}} onClick={()=>onCaptain(p.id)}>C</button>
                    <button style={{...S.btn,...(isVC?{background:"#3b82f6",color:"#fff"}:{background:"#1f2937",color:"#9ca3af"})}} onClick={()=>onVC(p.id)}>VC</button>
                  </>
                }
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── FIXTURES VIEW ─────────────────────────────────────────────────────────────
function FixturesView({fixtures}) {
  const [groupFilter,setGroupFilter]=useState("All");
  const stages=[...new Set(fixtures.map(f=>f.stage))];
  const groups=[...new Set(fixtures.map(f=>f.group).filter(Boolean))].sort();
  const filtered=groupFilter==="All"?fixtures:fixtures.filter(f=>f.group===groupFilter);
  return (
    <div style={S.page}>
      <div style={S.filterRow}>
        <button style={{...S.fBtn,...(groupFilter==="All"?S.fBtnOn:{})}} onClick={()=>setGroupFilter("All")}>All</button>
        {groups.map(g=>(
          <button key={g} style={{...S.fBtn,...(groupFilter===g?S.fBtnOn:{})}} onClick={()=>setGroupFilter(g)}>Grp {g}</button>
        ))}
      </div>
      {stages.map(stage=>{
        const list=filtered.filter(f=>f.stage===stage);
        if (!list.length) return null;
        return (
          <div key={stage} style={{marginBottom:20}}>
            <div style={{...S.kicker,marginBottom:8}}>{stage}</div>
            {list.map(f=>(
              <div key={f.id} style={S.fixCard}>
                <div style={{minWidth:80}}>
                  <div style={{fontSize:12,fontWeight:700}}>{f.date}</div>
                  <div style={S.muted}>{f.time}</div>
                </div>
                <div style={{flex:1,display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13}}>
                  <span>{f.homeTeam}</span><span style={S.vs}>VS</span><span>{f.awayTeam}</span>
                </div>
                {f.group&&<span style={{...S.badge,background:"#1e3a5f"}}>Grp {f.group}</span>}
                <span style={{...S.badge,background:f.status==="scheduled"?"#14532d":"#374151"}}>{f.status}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── VLOG VIEW ─────────────────────────────────────────────────────────────────
function VlogView({starterPlayers,benchPlayers,formation,teamName,captainId,vcId,totalCost,budget,totalPoints}) {
  const shape=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const rows=POS_ORDER.map(pos=>({
    pos,players:starterPlayers.filter(p=>p.position===pos),slots:pos==="GK"?1:shape[pos],
  }));
  const allSquad=[...starterPlayers,...benchPlayers];
  const cap=allSquad.find(p=>p.id===captainId);
  const vc =allSquad.find(p=>p.id===vcId);

  return (
    <div style={{...S.pitchWrap,paddingBottom:20}}>
      {/* Vlog header */}
      <div style={S.vlogHeader}>
        <div style={S.recDot}>● REC</div>
        <h2 style={S.vlogTitle}>{teamName}</h2>
        <div style={S.vlogMeta}>
          <span style={{color:"#facc15",fontWeight:900}}>{formation}</span>
          <span style={{color:"#4ade80",fontWeight:900}}>{totalPoints} pts</span>
          <span style={S.muted}>${totalCost.toFixed(1)}m / ${budget}m</span>
        </div>
        {/* Captain / VC row */}
        <div style={S.vlogCapRow}>
          {cap&&(
            <div style={S.vlogCapCard}>
              <span style={{...S.badge,background:"#f59e0b",color:"#000",fontSize:11,padding:"2px 8px"}}>C</span>
              <Jersey primary={getColors(cap.teamCode)[0]} secondary={getColors(cap.teamCode)[1]} number={cap.jerseyNumber||"?"} size={40}/>
              <div style={{fontWeight:700,fontSize:12}}>{cap.name}</div>
              <div style={{color:"#a78bfa",fontWeight:900,fontSize:14}}>{playerPoints(cap,captainId)} pts</div>
              <div style={S.muted}>${Number(cap.price||0).toFixed(1)}m</div>
            </div>
          )}
          {vc&&(
            <div style={S.vlogCapCard}>
              <span style={{...S.badge,background:"#3b82f6",fontSize:11,padding:"2px 8px"}}>VC</span>
              <Jersey primary={getColors(vc.teamCode)[0]} secondary={getColors(vc.teamCode)[1]} number={vc.jerseyNumber||"?"} size={40}/>
              <div style={{fontWeight:700,fontSize:12}}>{vc.name}</div>
              <div style={{color:"#a78bfa",fontWeight:900,fontSize:14}}>{playerPoints(vc,captainId)} pts</div>
              <div style={S.muted}>${Number(vc.price||0).toFixed(1)}m</div>
            </div>
          )}
        </div>
      </div>

      {/* Pitch */}
      <div style={S.pitch}>
        <PitchLines/>
        {rows.map(({pos,players,slots})=>(
          <div key={pos} style={S.pitchRow}>
            {Array.from({length:slots},(_,i)=>{
              const p=players[i];
              return p
                ?<PlayerCard key={p.id} player={p} isStarter
                    isCap={p.id===captainId} isVC={p.id===vcId}
                    pts={playerPoints(p,captainId)}
                    isSwapSrc={false} isSwapTarget={false}
                    menuOpen={false} onMenuToggle={()=>{}}
                    onClick={()=>{}} onCaptain={()=>{}} onVC={()=>{}} onRemove={()=>{}}/>
                :<EmptyCard key={`${pos}-${i}`} pos={pos}/>;
            })}
          </div>
        ))}
      </div>

      {/* Bench */}
      <div style={S.benchHead}><span style={S.kicker}>🪑 BENCH</span></div>
      <div style={S.benchRow}>
        {Array.from({length:4},(_,i)=>{
          const p=benchPlayers[i];
          return p
            ?<PlayerCard key={p.id} player={p} isStarter={false}
                isCap={p.id===captainId} isVC={p.id===vcId}
                pts={playerPoints(p,captainId)}
                isSwapSrc={false} isSwapTarget={false}
                menuOpen={false} onMenuToggle={()=>{}}
                onClick={()=>{}} onCaptain={()=>{}} onVC={()=>{}} onRemove={()=>{}}/>
            :<EmptyBenchCard key={`bench-${i}`} num={i+1}/>;
        })}
      </div>
    </div>
  );
}

// ── JERSEY + PITCH SVG ────────────────────────────────────────────────────────
function Jersey({primary,secondary,number,size=66}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 96" fill="none">
      <path d="M28 18 10 32l9 11 7-6v45h48V37l7 6 9-11-18-14c-6 6-13 9-22 9s-16-3-22-9Z"
        fill={primary} stroke="rgba(0,0,0,.3)" strokeWidth="2"/>
      <path d="M38 18c3 8 21 8 24 0-3-5-8-8-12-8s-9 3-12 8Z" fill={secondary} opacity=".95"/>
      <path d="m10 32 9 11 7-6v13L12 45Z" fill={secondary} opacity=".45"/>
      <path d="m90 32-9 11-7-6v13l14-5Z" fill={secondary} opacity=".45"/>
      <text x="50" y="64" textAnchor="middle" fontSize="26" fontWeight="900"
        fill={secondary} fontFamily="Arial,sans-serif">{number}</text>
    </svg>
  );
}
function PitchLines() {
  return (
    <svg style={S.pitchSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="4" y1="50" x2="96" y2="50"/>
      <circle cx="50" cy="50" r="11" fill="none"/>
      <rect x="28" y="4" width="44" height="14" fill="none"/>
      <rect x="28" y="82" width="44" height="14" fill="none"/>
    </svg>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  // ── Shell & Loading ──
  shell:    {minHeight:"100vh",background:"linear-gradient(160deg,#020c1b 0%,#050e20 60%,#020c1b 100%)",color:"#e8f4ff",fontFamily:"Inter,system-ui,sans-serif"},
  loading:  {display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontSize:20,color:"#00d4ff"},

  // ── Header ──
  header:   {display:"flex",gap:14,padding:"14px 18px",background:"linear-gradient(90deg,#020c1b 0%,#061830 50%,#020c1b 100%)",borderBottom:"2px solid #00d4ff",boxShadow:"0 0 28px rgba(0,212,255,0.18)",alignItems:"flex-start"},
  kicker:   {color:"#00d4ff",fontSize:12,textTransform:"uppercase",letterSpacing:2,fontWeight:900,marginBottom:3,textShadow:"0 0 8px rgba(0,212,255,0.6)"},
  hTitle:   {margin:"2px 0",color:"#fff",fontSize:22,fontWeight:900,cursor:"pointer",letterSpacing:"-0.5px"},
  nameInput:{background:"#061830",border:"1px solid #00d4ff",color:"#fff",borderRadius:8,padding:"4px 12px",fontSize:20,fontWeight:900,outline:"none",width:"100%",boxSizing:"border-box"},
  hSub:     {display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginTop:5},
  fSel:     {background:"#061830",border:"1px solid rgba(0,212,255,0.35)",color:"#00d4ff",borderRadius:8,padding:"5px 10px",fontWeight:800,outline:"none",fontSize:13},
  cPill:    {background:"rgba(245,158,11,0.2)",color:"#fbbf24",border:"1px solid #f59e0b",fontSize:11,fontWeight:800,borderRadius:6,padding:"2px 9px"},
  hBox:     {minWidth:108,display:"flex",flexDirection:"column",gap:4,background:"#061830",border:"1px solid rgba(0,212,255,0.2)",borderRadius:12,padding:"10px 14px",boxShadow:"0 0 16px rgba(0,212,255,0.08)"},
  hBoxRow:  {display:"flex",justifyContent:"space-between",alignItems:"center",gap:10},
  budgetInput:{background:"transparent",border:"none",color:"#00ff88",width:72,fontWeight:900,fontSize:15,outline:"none",textAlign:"right"},
  muted:    {color:"#4a7a9b",fontSize:12},

  // ── Tab Bar ──
  tabBar:   {display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#020c1b",borderBottom:"1px solid rgba(0,212,255,0.15)"},
  tab:      {border:0,borderBottom:"3px solid transparent",background:"transparent",color:"#4a7a9b",padding:"14px 4px",fontWeight:800,cursor:"pointer",fontSize:14,transition:"all 0.2s",letterSpacing:"0.3px"},
  tabOn:    {color:"#00d4ff",borderBottomColor:"#00d4ff",background:"rgba(0,212,255,0.06)",textShadow:"0 0 12px rgba(0,212,255,0.6)"},
  content:  {padding:"12px 12px 40px"},

  // ── Pitch ──
  pitchWrap:{maxWidth:900,margin:"0 auto"},
  ptBar:    {display:"flex",background:"#061830",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,marginBottom:12,overflow:"hidden"},
  ptCell:   {flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px",gap:3},
  ptDivider:{borderLeft:"1px solid rgba(0,212,255,0.12)",borderRight:"1px solid rgba(0,212,255,0.12)"},
  swapBanner:{background:"#061e3a",border:"1px solid #00d4ff",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#7dd3fc",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 0 16px rgba(0,212,255,0.15)"},
  cancelBtn:{background:"#1d4ed8",border:"none",color:"#fff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:13,fontWeight:700},

  pitch:    {position:"relative",overflow:"visible",minHeight:520,padding:"20px 6px",borderRadius:16,background:"linear-gradient(180deg,#0a3d1a 0%,#0d5220 45%,#0d5220 55%,#0a3d1a 100%)",boxShadow:"inset 0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,136,0.05)",marginBottom:16,border:"1px solid rgba(0,255,136,0.1)"},
  pitchSvg: {position:"absolute",inset:0,width:"100%",height:"100%",stroke:"rgba(255,255,255,.15)",strokeWidth:".7",pointerEvents:"none"},
  pitchRow: {display:"flex",justifyContent:"center",gap:10,marginBottom:6,position:"relative",flexWrap:"wrap"},

  // ── Player Card — BIGGER for video ──
  card:     {display:"flex",flexDirection:"column",alignItems:"center",position:"relative",cursor:"pointer",borderRadius:12,overflow:"visible",touchAction:"manipulation"},
  cardStarter:{width:108,padding:"8px 6px 6px",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",border:"1px solid rgba(0,212,255,0.25)",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"},
  cardBench:{width:"100%",padding:"10px 8px 8px",background:"#061830",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12},
  cardEmpty:{cursor:"default",opacity:.4},
  emptyJersey:{display:"flex",justifyContent:"center"},
  cardInfo: {width:"100%",textAlign:"center",marginTop:5},
  cardName: {fontSize:13,fontWeight:800,color:"#fff",textShadow:"0 1px 6px rgba(0,0,0,1)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"},
  cardMeta: {display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:3},
  posBadge: {fontSize:10,fontWeight:900,borderRadius:4,padding:"1px 5px",color:"#fff"},
  cardTeam: {fontSize:10,color:"rgba(255,255,255,.55)",fontWeight:600},
  cardBottom:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,paddingTop:4,borderTop:"1px solid rgba(255,255,255,.1)"},
  cardPrice:{fontSize:11,fontWeight:800,color:"#ffd700"},
  cardPts:  {fontSize:11,fontWeight:800,display:"flex",alignItems:"center",gap:2},
  cardFix:  {fontSize:9,color:"rgba(255,255,255,.4)",marginTop:2,textAlign:"center"},
  x2:       {background:"#92400e",color:"#fef3c7",fontSize:9,fontWeight:900,borderRadius:3,padding:"0 4px",marginLeft:2},
  capBadge: {position:"absolute",top:-8,right:-5,background:"#f59e0b",color:"#000",fontSize:10,fontWeight:900,borderRadius:99,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,boxShadow:"0 0 12px rgba(245,158,11,0.7)"},
  vcBadge:  {position:"absolute",top:-8,right:-5,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:900,borderRadius:99,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,boxShadow:"0 0 12px rgba(59,130,246,0.7)"},
  cardTapBtn:{background:"none",border:"none",padding:0,margin:0,cursor:"pointer",display:"flex",justifyContent:"center",width:"100%",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"},
  ctxMenu:  {position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",background:"#061830",border:"1px solid rgba(0,212,255,0.3)",borderRadius:12,overflow:"hidden",zIndex:999,boxShadow:"0 16px 48px rgba(0,0,0,0.95)",minWidth:170,marginTop:6},
  ctxBtn:   {display:"block",width:"100%",background:"none",border:"none",padding:"14px 16px",fontSize:14,fontWeight:700,color:"#e8f4ff",cursor:"pointer",borderBottom:"1px solid rgba(0,212,255,0.08)",whiteSpace:"nowrap",textAlign:"left",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"},

  benchHead:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"10px 0 8px"},
  benchRow: {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12},
  legend:   {display:"flex",gap:10,justifyContent:"center",alignItems:"center",opacity:.6,marginTop:6,flexWrap:"wrap"},
  legItem:  {display:"flex",alignItems:"center",gap:4,fontSize:12},
  badge:    {fontSize:10,fontWeight:700,borderRadius:4,padding:"2px 6px",color:"#fff"},

  // ── Players Tab ──
  page:     {maxWidth:900,margin:"0 auto"},
  filterRow:{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10},
  fBtn:     {background:"#061830",border:"1px solid rgba(0,212,255,0.2)",color:"#4a7a9b",borderRadius:9,padding:"7px 13px",fontSize:13,fontWeight:800,cursor:"pointer",transition:"all 0.15s"},
  fBtnOn:   {background:"rgba(0,212,255,0.12)",color:"#00d4ff",borderColor:"#00d4ff",textShadow:"0 0 8px rgba(0,212,255,0.5)"},
  teamSel:  {background:"#061830",border:"1px solid rgba(0,212,255,0.2)",color:"#e8f4ff",borderRadius:9,padding:"7px 12px",fontSize:13,fontWeight:700,outline:"none",cursor:"pointer"},
  searchBox:{background:"#061830",border:"1px solid rgba(0,212,255,0.2)",color:"#e8f4ff",borderRadius:9,padding:"10px 14px",fontSize:15,outline:"none",width:"100%",boxSizing:"border-box",marginBottom:8},
  playerList:{display:"flex",flexDirection:"column",gap:8},
  pRow:     {display:"flex",alignItems:"center",gap:12,background:"#061830",border:"1px solid rgba(0,212,255,0.1)",borderRadius:12,padding:"10px 14px"},
  pRowSel:  {border:"1px solid rgba(0,255,136,0.4)",background:"rgba(0,255,136,0.05)"},
  pInfo:    {flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:3},
  btn:      {border:"none",borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:800,cursor:"pointer"},

  // ── Fixtures ──
  fixCard:  {display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:"#061830",border:"1px solid rgba(0,212,255,0.1)",borderRadius:11,padding:"12px 14px",marginBottom:8},
  vs:       {fontSize:10,background:"#0a2040",borderRadius:5,padding:"3px 8px",color:"#4a7a9b",fontWeight:700},

  // ── Vlog Mode ──
  vlogHeader:{textAlign:"center",marginBottom:14,background:"linear-gradient(135deg,#061830,#0a2a5e)",borderRadius:16,padding:"18px",border:"1px solid rgba(0,212,255,0.25)",boxShadow:"0 0 30px rgba(0,212,255,0.12)"},
  recDot:   {color:"#ff2d78",fontSize:13,fontWeight:900,letterSpacing:4,marginBottom:6,textShadow:"0 0 10px rgba(255,45,120,0.7)"},
  vlogTitle:{color:"#fff",fontSize:26,fontWeight:900,margin:"2px 0 8px",textShadow:"0 0 20px rgba(0,212,255,0.3)"},
  vlogMeta: {display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:10},
  vlogCapRow:{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginTop:10},
  vlogCapCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"rgba(0,212,255,0.06)",borderRadius:12,padding:"12px 16px",minWidth:100,border:"1px solid rgba(0,212,255,0.2)",boxShadow:"0 0 16px rgba(0,212,255,0.08)"},
};
