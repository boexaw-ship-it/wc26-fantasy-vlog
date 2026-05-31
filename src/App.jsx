import { useEffect, useMemo, useState } from "react";

// ── FORMATIONS ────────────────────────────────────────────────────────────────
const FORMATIONS = {
  "3-4-3": { DEF:3, MID:4, FWD:3 },
  "3-5-2": { DEF:3, MID:5, FWD:2 },
  "4-3-3": { DEF:4, MID:3, FWD:3 },
  "4-4-2": { DEF:4, MID:4, FWD:2 },
  "4-5-1": { DEF:4, MID:5, FWD:1 },
  "5-3-2": { DEF:5, MID:3, FWD:2 },
  "5-4-1": { DEF:5, MID:4, FWD:1 },
};

// Squad limits per position (GK2 DEF5 MID5 FWD3)
const POS_LIMITS = { GK:2, DEF:5, MID:5, FWD:3 };
const POS_ROWS   = ["FWD","MID","DEF","GK"];
const TABS       = ["My Team","Players","Fixtures","Vlog Mode"];
const STORAGE_KEY = "wc26-vlog-team-v2";

const TEAM_COLORS = {
  ALG:["#006233","#ffffff"], ARG:["#75aadb","#ffffff"],
  AUS:["#00843d","#ffd700"], AUT:["#ed2939","#ffffff"],
  BEL:["#111111","#ef3340"], BIH:["#002395","#fecb00"],
  BRA:["#f7e017","#009c3b"], CAN:["#ff0000","#ffffff"],
  CIV:["#f77f00","#009a44"], CMR:["#007a5e","#ce1126"],
  COD:["#007fff","#f7d618"], COL:["#fcd116","#003087"],
  CPV:["#003893","#cf2027"], CRO:["#ff0000","#ffffff"],
  CUW:["#002b7f","#f9e814"], CZE:["#d7141a","#ffffff"],
  ECU:["#ffd100","#034ea2"], EGY:["#ce1126","#ffffff"],
  ENG:["#ffffff","#cf142b"], ESP:["#c60b1e","#ffc400"],
  FRA:["#003189","#ffffff"], GER:["#ffffff","#111111"],
  GHA:["#006b3f","#fcd116"], HAI:["#00209f","#d21034"],
  IRN:["#239f40","#ffffff"], IRQ:["#ce1126","#ffffff"],
  JOR:["#007a3d","#ffffff"], JPN:["#bc002d","#ffffff"],
  KOR:["#cd2e3a","#ffffff"], KSA:["#006c35","#ffffff"],
  MAR:["#c1272d","#006233"], MEX:["#006847","#ffffff"],
  NED:["#f36c21","#ffffff"], NGA:["#008751","#ffffff"],
  NOR:["#ef2b2d","#ffffff"], NZL:["#00247d","#cc142b"],
  PAN:["#da121a","#ffffff"], PAR:["#d52b1e","#ffffff"],
  POL:["#dc143c","#ffffff"], POR:["#006600","#ff0000"],
  QAT:["#8d1b3d","#ffffff"], RSA:["#007a4d","#ffffff"],
  SCO:["#003da5","#ffffff"], SEN:["#00853f","#fdef42"],
  SUI:["#ff0000","#ffffff"], SWE:["#006aa7","#fecc02"],
  TUN:["#e70013","#ffffff"], TUR:["#e30a17","#ffffff"],
  URU:["#75aadb","#ffffff"], USA:["#002868","#bf0a30"],
  UZB:["#1eb53a","#ffffff"],
  DEFAULT:["#334155","#cbd5e1"],
};

function getColors(code) { return TEAM_COLORS[code] || TEAM_COLORS.DEFAULT; }

function defaultTeam() {
  return { teamName:"My WC26 Vlog XI", formation:"4-3-3", budget:100, captain:"", viceCaptain:"", starters:[], bench:[] };
}

function loadTeam() {
  try { const s=localStorage.getItem(STORAGE_KEY); return s?{...defaultTeam(),...JSON.parse(s)}:defaultTeam(); }
  catch { return defaultTeam(); }
}

function saveTeam(t) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch {}
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState("My Team");
  const [allPlayers, setAllPlayers] = useState([]);
  const [fixtures, setFixtures]     = useState([]);
  const [team, setTeam]       = useState(loadTeam);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [posFilter, setPosFilter]   = useState("All");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    Promise.all([
      fetch("./data/fifa-players.json").then(r=>r.json()),
      fetch("./data/fifa-fixtures.json").then(r=>r.json()),
    ]).then(([p,f])=>{ setAllPlayers(p); setFixtures(f); })
     .catch(e=>setError(e.message))
     .finally(()=>setLoading(false));
  }, []);

  useEffect(()=>saveTeam(team), [team]);

  const starterPlayers = useMemo(()=>
    team.starters.map(id=>allPlayers.find(p=>p.id===id)).filter(Boolean),
    [team.starters, allPlayers]);

  const benchPlayers = useMemo(()=>
    team.bench.map(id=>allPlayers.find(p=>p.id===id)).filter(Boolean),
    [team.bench, allPlayers]);

  const allSelected  = [...team.starters, ...team.bench];
  const totalCost    = [...starterPlayers,...benchPlayers].reduce((s,p)=>s+Number(p.price||0),0);
  const budgetLeft   = Number(team.budget||100) - totalCost;

  // Position count in starters
  function starterCount(pos) { return starterPlayers.filter(p=>p.position===pos).length; }
  function benchCount(pos)   { return benchPlayers.filter(p=>p.position===pos).length; }
  function totalCount(pos)   { return starterCount(pos)+benchCount(pos); }

  // Add player — starter first, bench if starter slot full
  // Squad limits: GK×2, DEF×5, MID×5, FWD×3 (total 15 = 11 starters + 4 bench)
  function addPlayer(pid) {
    const player = allPlayers.find(p=>p.id===pid);
    if (!player || allSelected.includes(pid)) return;

    const pos = player.position;

    // Hard position squad limit (e.g. max 5 DEF total)
    if (totalCount(pos) >= POS_LIMITS[pos]) return;

    // Hard total squad limit
    if (allSelected.length >= 15) return;

    const shape      = FORMATIONS[team.formation] || FORMATIONS["4-3-3"];
    const starterMax = pos === "GK" ? 1 : (shape[pos] || 0);
    const canStarter = starterCount(pos) < starterMax && team.starters.length < 11;
    const canBench   = team.bench.length < 4;

    setTeam(prev => {
      if (canStarter) return { ...prev, starters: [...prev.starters, pid] };
      if (canBench)   return { ...prev, bench:    [...prev.bench,    pid] };
      return prev;
    });
  }

  function removePlayer(pid) {
    setTeam(prev=>({
      ...prev,
      starters: prev.starters.filter(id=>id!==pid),
      bench:    prev.bench.filter(id=>id!==pid),
      captain:     prev.captain===pid?"":prev.captain,
      viceCaptain: prev.viceCaptain===pid?"":prev.viceCaptain,
    }));
  }

  // Swap starter ↔ bench
  function swapPlayers(starterId, benchId) {
    setTeam(prev=>{
      const newStarters = prev.starters.map(id=>id===starterId?benchId:id);
      const newBench    = prev.bench.map(id=>id===benchId?starterId:id);
      return {...prev, starters:newStarters, bench:newBench};
    });
  }

  function setCaptain(pid)    { setTeam(prev=>({...prev, captain:prev.captain===pid?"":pid, viceCaptain:prev.viceCaptain===pid?"":prev.viceCaptain})); }
  function setViceCaptain(pid){ setTeam(prev=>({...prev, viceCaptain:prev.viceCaptain===pid?"":pid, captain:prev.captain===pid?"":prev.captain})); }
  function setFormation(f)    { setTeam(prev=>({...prev, formation:f})); }
  function setTeamName(n)     { setTeam(prev=>({...prev, teamName:n})); }

  if (loading) return <Screen title="Loading…"/>;
  if (error)   return <Screen title="Load failed" msg={error}/>;

  return (
    <main style={S.shell}>
      <Header team={team} budgetLeft={budgetLeft} totalCost={totalCost}
        onFormation={setFormation} onName={setTeamName}
        starterPlayers={starterPlayers} benchPlayers={benchPlayers}/>
      <nav style={S.tabs}>
        {TABS.map(t=>(
          <button key={t} style={{...S.tab,...(tab===t?S.tabOn:{})}} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </nav>
      <section style={S.content}>
        {tab==="My Team" && (
          <MyTeamView
            starterPlayers={starterPlayers} benchPlayers={benchPlayers}
            formation={team.formation} captainId={team.captain} vcId={team.viceCaptain}
            onSwap={swapPlayers} onRemove={removePlayer}
            onCaptain={setCaptain} onVC={setViceCaptain}
          />
        )}
        {tab==="Players" && (
          <PlayersView
            allPlayers={allPlayers} allSelected={allSelected}
            starterPlayers={starterPlayers} benchPlayers={benchPlayers}
            captainId={team.captain} vcId={team.viceCaptain}
            posFilter={posFilter} setPosFilter={setPosFilter}
            search={search} setSearch={setSearch}
            onAdd={addPlayer} onRemove={removePlayer}
            onCaptain={setCaptain} onVC={setViceCaptain}
            posLimits={POS_LIMITS} totalCount={totalCount}
            formation={team.formation}
          />
        )}
        {tab==="Fixtures" && <FixturesView fixtures={fixtures}/>}
        {tab==="Vlog Mode" && (
          <VlogView starterPlayers={starterPlayers} benchPlayers={benchPlayers}
            formation={team.formation} teamName={team.teamName}
            captainId={team.captain} vcId={team.viceCaptain}/>
        )}
      </section>
    </main>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
function Header({team,budgetLeft,totalCost,onFormation,onName,starterPlayers,benchPlayers}) {
  const [editName,setEditName]=useState(false);
  const total = starterPlayers.length+benchPlayers.length;
  const cap   = [...starterPlayers,...benchPlayers].find(p=>p.id===team.captain);
  const vc    = [...starterPlayers,...benchPlayers].find(p=>p.id===team.viceCaptain);

  return (
    <header style={S.header}>
      <div style={{flex:1,minWidth:0}}>
        <div style={S.kicker}>World Cup 2026 Fantasy</div>
        {editName
          ? <input style={S.nameInput} value={team.teamName} autoFocus
              onChange={e=>onName(e.target.value)}
              onBlur={()=>setEditName(false)}
              onKeyDown={e=>e.key==="Enter"&&setEditName(false)}/>
          : <h1 style={S.title} onClick={()=>setEditName(true)}>{team.teamName} <span style={{fontSize:14,opacity:.4}}>✏</span></h1>
        }
        <div style={S.subTitle}>
          <select style={S.fSel} value={team.formation} onChange={e=>onFormation(e.target.value)}>
            {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          {cap  && <span style={S.pill}>C: {cap.name}</span>}
          {vc   && <span style={{...S.pill,background:"#1e40af"}}>VC: {vc.name}</span>}
        </div>
      </div>
      <div style={S.budgetBox}>
        <span style={S.muted}>Squad</span>
        <strong style={{color:total===15?"#4ade80":"#facc15"}}>{total}/15</strong>
        <span style={S.muted}>Budget</span>
        <strong style={{color:budgetLeft<0?"#fb7185":"#4ade80"}}>${budgetLeft.toFixed(1)}m</strong>
        <span style={{...S.muted,fontSize:10}}>Used ${totalCost.toFixed(1)}m</span>
      </div>
    </header>
  );
}

// ── MY TEAM VIEW ──────────────────────────────────────────────────────────────
function MyTeamView({starterPlayers,benchPlayers,formation,captainId,vcId,onSwap,onRemove,onCaptain,onVC}) {
  const [swapSource,setSwapSource]=useState(null); // {id, isStarter}
  const shape = FORMATIONS[formation]||FORMATIONS["4-3-3"];

  // Build rows
  const rows = POS_ROWS.map(pos=>{
    const posPlayers = starterPlayers.filter(p=>p.position===pos);
    const slots = pos==="GK"?1:shape[pos];
    return { pos, players:posPlayers, slots };
  });

  function handleTokenClick(pid, isStarter) {
    if (!swapSource) {
      setSwapSource({id:pid, isStarter});
      return;
    }
    if (swapSource.id===pid) { setSwapSource(null); return; }

    // Do swap if one is starter one is bench
    const srcIsStarter = swapSource.isStarter;
    if (srcIsStarter && !isStarter) {
      onSwap(swapSource.id, pid);
    } else if (!srcIsStarter && isStarter) {
      onSwap(pid, swapSource.id);
    }
    setSwapSource(null);
  }

  return (
    <div style={S.pitchWrap}>
      {swapSource && (
        <div style={S.swapBanner}>
          ↔ Swap mode — tap another player to swap
          <button style={S.cancelBtn} onClick={()=>setSwapSource(null)}>Cancel</button>
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
                ? <PlayerToken key={p.id} player={p} isStarter
                    isCap={p.id===captainId} isVC={p.id===vcId}
                    isSwapSrc={swapSource?.id===p.id}
                    isSwapTarget={!!swapSource&&swapSource.id!==p.id}
                    onClick={()=>handleTokenClick(p.id,true)}
                    onCaptain={()=>onCaptain(p.id)}
                    onVC={()=>onVC(p.id)}
                    onRemove={()=>onRemove(p.id)}/>
                : <EmptyToken key={`${pos}-${i}`} pos={pos}/>;
            })}
          </div>
        ))}
      </div>

      {/* BENCH */}
      <div style={S.benchHead}>
        <span style={S.kicker}>🪑 Substitutes Bench</span>
        <span style={S.muted}>{benchPlayers.length}/4</span>
      </div>
      <div style={S.benchRow}>
        {Array.from({length:4},(_,i)=>{
          const p=benchPlayers[i];
          return p
            ? <PlayerToken key={p.id} player={p} isStarter={false}
                isCap={p.id===captainId} isVC={p.id===vcId}
                isSwapSrc={swapSource?.id===p.id}
                isSwapTarget={!!swapSource&&swapSource.id!==p.id}
                onClick={()=>handleTokenClick(p.id,false)}
                onCaptain={()=>onCaptain(p.id)}
                onVC={()=>onVC(p.id)}
                onRemove={()=>onRemove(p.id)}/>
            : <EmptyBench key={`bench-${i}`} num={i+1}/>;
        })}
      </div>
    </div>
  );
}

// ── PLAYER TOKEN (pitch + bench) ──────────────────────────────────────────────
function PlayerToken({player,isStarter,isCap,isVC,isSwapSrc,isSwapTarget,onClick,onCaptain,onVC,onRemove}) {
  const [menu,setMenu]=useState(false);
  const [pri,sec]=getColors(player.teamCode);

  return (
    <article style={{
      ...S.token,
      ...(!isStarter?S.tokenBench:{}),
      ...(isSwapSrc?S.tokenSwapSrc:{}),
      ...(isSwapTarget&&!isSwapSrc?S.tokenSwapTarget:{}),
    }}>
      {isCap && <span style={S.capBadge}>C</span>}
      {isVC  && <span style={S.vcBadge}>VC</span>}

      <div style={{cursor:"pointer"}} onClick={()=>{setMenu(!menu);}}>
        <Jersey primary={pri} secondary={sec} number={player.jerseyNumber||"?"} size={isStarter?54:46}/>
      </div>

      <strong style={S.tokenName}>{player.name}</strong>
      <span style={S.tokenMeta}>${Number(player.price||0).toFixed(1)}m</span>
      <span style={S.tokenFix}>{player.nextFixture||"TBD"}</span>

      {menu && (
        <div style={S.ctxMenu} onClick={e=>e.stopPropagation()}>
          <div style={S.ctxItem} onClick={()=>{onClick();setMenu(false);}}>↔ Swap</div>
          <div style={S.ctxItem} onClick={()=>{onCaptain();setMenu(false);}}>
            {isCap?"Remove C":"⭐ Captain"}
          </div>
          <div style={S.ctxItem} onClick={()=>{onVC();setMenu(false);}}>
            {isVC?"Remove VC":"🔵 Vice-Cap"}
          </div>
          <div style={{...S.ctxItem,color:"#fb7185"}} onClick={()=>{onRemove();setMenu(false);}}>✕ Remove</div>
          <div style={{...S.ctxItem,opacity:.4}} onClick={()=>setMenu(false)}>Cancel</div>
        </div>
      )}
    </article>
  );
}

function EmptyToken({pos}) {
  return (
    <article style={{...S.token,...S.emptyToken}}>
      <div style={S.emptyJersey}>+</div>
      <strong style={S.tokenName}>{pos}</strong>
      <span style={S.tokenMeta}>Empty</span>
    </article>
  );
}

function EmptyBench({num}) {
  return (
    <article style={{...S.token,...S.tokenBench,...S.emptyToken}}>
      <div style={S.emptyJersey}>+</div>
      <strong style={S.tokenName}>Sub {num}</strong>
      <span style={S.tokenMeta}>Add player</span>
    </article>
  );
}

// ── PLAYERS VIEW ──────────────────────────────────────────────────────────────
function PlayersView({allPlayers,allSelected,starterPlayers,benchPlayers,captainId,vcId,
  posFilter,setPosFilter,search,setSearch,onAdd,onRemove,onCaptain,onVC,posLimits,totalCount,formation}) {

  const [teamFilter,setTeamFilter] = useState("All");
  const [sortPrice,setSortPrice]   = useState(true);

  const teamList = useMemo(()=>{
    const teams = [...new Set(allPlayers.map(p=>p.teamCode).filter(Boolean))].sort();
    return teams;
  },[allPlayers]);

  const filtered = useMemo(()=>{
    let list = allPlayers.filter(p=>{
      const mPos  = posFilter==="All"||p.position===posFilter;
      const mTeam = teamFilter==="All"||p.teamCode===teamFilter;
      const q     = search.trim().toLowerCase();
      const mSearch = !q||p.name?.toLowerCase().includes(q)||p.fullName?.toLowerCase().includes(q)||p.teamCode?.toLowerCase().includes(q)||p.team?.toLowerCase().includes(q);
      return mPos&&mTeam&&mSearch;
    });
    if (sortPrice) list = [...list].sort((a,b)=>b.price-a.price);
    return list;
  },[allPlayers,posFilter,teamFilter,search,sortPrice]);

  return (
    <div style={S.page}>
      <div style={S.toolbar}>
        <div style={S.filterGroup}>
          {["All","GK","DEF","MID","FWD"].map(pos=>(
            <button key={pos} style={{...S.fBtn,...(posFilter===pos?S.fBtnOn:{})}}
              onClick={()=>setPosFilter(pos)}>
              {pos}{pos!=="All"?` (${totalCount(pos)}/${posLimits[pos]})`:""}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <select style={S.teamSelect} value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}>
            <option value="All">🌍 All Teams</option>
            {teamList.map(code=>(
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <button style={{...S.fBtn,...(sortPrice?S.fBtnOn:{})}} onClick={()=>setSortPrice(v=>!v)}>
            💰 {sortPrice?"Price ↓":"Default"}
          </button>
        </div>
        <input style={S.search} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player…"/>
        <div style={{fontSize:11,color:"#64748b"}}>
          {filtered.length} players{teamFilter!=="All"?` · ${teamFilter}`:""}
          {posFilter!=="All"?` · ${posFilter}`:""}
        </div>
      </div>

      <div style={S.playerList}>
        {filtered.map(p=>{
          const selected  = allSelected.includes(p.id);
          const isStarter = starterPlayers.some(s=>s.id===p.id);
          const isBench   = benchPlayers.some(b=>b.id===p.id);
          const isCap     = p.id===captainId;
          const isVC      = p.id===vcId;
          const posFull    = totalCount(p.position) >= posLimits[p.position];
          const squadFull  = allSelected.length >= 15;
          const canAdd     = !selected && !posFull && !squadFull;

          return (
            <PlayerRowItem key={p.id} player={p}
              selected={selected} isStarter={isStarter} isBench={isBench}
              isCap={isCap} isVC={isVC} canAdd={canAdd}
              onAdd={()=>onAdd(p.id)} onRemove={()=>onRemove(p.id)}
              onCaptain={()=>onCaptain(p.id)} onVC={()=>onVC(p.id)}/>
          );
        })}
      </div>
    </div>
  );
}

function PlayerRowItem({player,selected,isStarter,isBench,isCap,isVC,canAdd,onAdd,onRemove,onCaptain,onVC}) {
  const [pri,sec]=getColors(player.teamCode);
  return (
    <article style={{...S.playerRow,...(selected?S.rowSelected:{})}}>
      <Jersey primary={pri} secondary={sec} number={player.jerseyNumber||"?"} size={44}/>
      <div style={S.rowMain}>
        <strong style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          {player.fullName||player.name}
          {isCap&&<span style={S.capBadge}>C</span>}
          {isVC &&<span style={S.vcBadge}>VC</span>}
          {isStarter&&<span style={{...S.pill,background:"#166534",fontSize:9}}>Starter</span>}
          {isBench  &&<span style={{...S.pill,background:"#374151",fontSize:9}}>Bench</span>}
        </strong>
        <span>{player.team||player.teamCode} | {player.position} | {player.nextFixture||"TBD"}</span>
      </div>
      <div style={S.rowPrice}>${Number(player.price||0).toFixed(1)}m</div>
      <div style={S.rowActions} onClick={e=>e.stopPropagation()}>
        {!selected
          ? <button style={{...S.btn,...(canAdd?S.btnAdd:S.btnDisabled)}} disabled={!canAdd} onClick={onAdd}>
              {canAdd?"+ Add":"Full"}
            </button>
          : <>
              <button style={{...S.btn,S:S.btnRemove,background:"#7f1d1d",color:"#fca5a5"}} onClick={onRemove}>Remove</button>
              <button style={{...S.btn,...(isCap?S.btnCapOn:S.btnGhost)}} onClick={onCaptain}>{isCap?"C ✓":"Set C"}</button>
              <button style={{...S.btn,...(isVC?S.btnVCOn:S.btnGhost)}} onClick={onVC}>{isVC?"VC ✓":"Set VC"}</button>
            </>
        }
      </div>
    </article>
  );
}

// ── FIXTURES ──────────────────────────────────────────────────────────────────
function FixturesView({fixtures}) {
  const stages=[...new Set(fixtures.map(f=>f.stage))];
  return (
    <div style={S.page}>
      {stages.map(stage=>(
        <section key={stage} style={{marginBottom:20}}>
          <h2 style={{...S.kicker,fontSize:12,marginBottom:8}}>{stage}</h2>
          {fixtures.filter(f=>f.stage===stage).map(f=>(
            <article key={f.id} style={S.fixCard}>
              <div style={S.fixDate}><strong>{f.date}</strong><span style={S.muted}>{f.time||"TBD"}</span></div>
              <div style={S.fixTeams}>
                <span>{f.homeTeam}</span><b style={S.vs}>VS</b><span>{f.awayTeam}</span>
              </div>
              {f.group&&<span style={{...S.pill,background:"#1e3a5f"}}>{f.group}</span>}
              <span style={{...S.pill,background:f.status==="scheduled"?"#14532d":"#374151"}}>{f.status}</span>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

// ── VLOG VIEW ─────────────────────────────────────────────────────────────────
function VlogView({starterPlayers,benchPlayers,formation,teamName,captainId,vcId}) {
  const cap=starterPlayers.find(p=>p.id===captainId)||benchPlayers.find(p=>p.id===captainId);
  const vc =starterPlayers.find(p=>p.id===vcId)||benchPlayers.find(p=>p.id===vcId);
  const shape=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const rows=POS_ROWS.map(pos=>{
    const pp=starterPlayers.filter(p=>p.position===pos);
    return {pos, players:pp, slots:pos==="GK"?1:shape[pos]};
  });

  return (
    <div style={S.vlog}>
      <div style={S.rec}>● REC · VLOG MODE</div>
      <h2 style={S.vlogTitle}>{teamName}</h2>
      <div style={S.vlogCapRow}>
        <VlogCapCard label="Captain" player={cap} type="c"/>
        <div style={S.vlogForm}>{formation}</div>
        <VlogCapCard label="Vice Captain" player={vc} type="vc"/>
      </div>
      <div style={S.pitch}>
        <PitchLines/>
        {rows.map(({pos,players,slots})=>(
          <div key={pos} style={S.pitchRow}>
            {Array.from({length:slots},(_,i)=>{
              const p=players[i];
              return p
                ? <PlayerToken key={p.id} player={p} isStarter
                    isCap={p.id===captainId} isVC={p.id===vcId}
                    isSwapSrc={false} isSwapTarget={false}
                    onClick={()=>{}} onCaptain={()=>{}} onVC={()=>{}} onRemove={()=>{}}/>
                : <EmptyToken key={`${pos}-${i}`} pos={pos}/>;
            })}
          </div>
        ))}
      </div>
      <div style={S.benchHead}><span style={S.kicker}>🪑 Bench</span></div>
      <div style={S.benchRow}>
        {benchPlayers.slice(0,4).map(p=>(
          <PlayerToken key={p.id} player={p} isStarter={false}
            isCap={p.id===captainId} isVC={p.id===vcId}
            isSwapSrc={false} isSwapTarget={false}
            onClick={()=>{}} onCaptain={()=>{}} onVC={()=>{}} onRemove={()=>{}}/>
        ))}
      </div>
    </div>
  );
}

function VlogCapCard({label,player,type}) {
  if (!player) return <div style={S.capCard}><span style={S.muted}>{label}: —</span></div>;
  const [pri,sec]=getColors(player.teamCode);
  return (
    <div style={S.capCard}>
      <span style={type==="c"?S.capBadge:S.vcBadge}>{type==="c"?"C":"VC"}</span>
      <Jersey primary={pri} secondary={sec} number={player.jerseyNumber||"?"} size={44}/>
      <strong style={{fontSize:12}}>{player.name}</strong>
      <span style={{...S.muted,fontSize:10}}>{player.teamCode} | ${Number(player.price||0).toFixed(1)}m</span>
    </div>
  );
}

// ── JERSEY SVG ────────────────────────────────────────────────────────────────
function Jersey({primary,secondary,number,size=58}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 96" fill="none" aria-hidden="true">
      <path d="M28 18 10 32l9 11 7-6v45h48V37l7 6 9-11-18-14c-6 6-13 9-22 9s-16-3-22-9Z"
        fill={primary} stroke="rgba(0,0,0,.3)" strokeWidth="2"/>
      <path d="M38 18c3 8 21 8 24 0-3-5-8-8-12-8s-9 3-12 8Z" fill={secondary} opacity=".95"/>
      <path d="m10 32 9 11 7-6v13L12 45Z" fill={secondary} opacity=".48"/>
      <path d="m90 32-9 11-7-6v13l14-5Z" fill={secondary} opacity=".48"/>
      <text x="50" y="64" textAnchor="middle" fontSize="26" fontWeight="900"
        fill={secondary} fontFamily="Arial,sans-serif">{number}</text>
    </svg>
  );
}

function PitchLines() {
  return (
    <svg style={S.pitchLines} viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="4" y="4" width="92" height="92" rx="3" fill="none"/>
      <line x1="4" y1="50" x2="96" y2="50"/>
      <circle cx="50" cy="50" r="11" fill="none"/>
      <rect x="28" y="4" width="44" height="14" fill="none"/>
      <rect x="28" y="82" width="44" height="14" fill="none"/>
    </svg>
  );
}

function Screen({title,msg}) {
  return (
    <main style={{...S.shell,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <h1 style={S.title}>{title}</h1>
      {msg&&<p style={{color:"#94a3b8"}}>{msg}</p>}
    </main>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  shell:{minHeight:"100vh",background:"#07111f",color:"#e5edf7",fontFamily:"Inter,system-ui,sans-serif"},
  header:{display:"flex",justifyContent:"space-between",gap:12,padding:"14px 16px",background:"#0b1626",borderBottom:"1px solid rgba(255,255,255,.08)"},
  kicker:{color:"#facc15",fontSize:11,textTransform:"uppercase",letterSpacing:1.5,fontWeight:800},
  title:{margin:"3px 0",color:"#fff",fontSize:22,fontWeight:900,cursor:"pointer"},
  nameInput:{background:"#101b2d",border:"1px solid #facc15",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:18,fontWeight:900,outline:"none",width:"100%"},
  subTitle:{color:"#94a3b8",fontSize:13,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginTop:4},
  fSel:{border:"1px solid rgba(255,255,255,.16)",background:"#101b2d",color:"#fff",borderRadius:8,padding:"4px 8px",fontWeight:900,outline:"none"},
  pill:{background:"#1e40af",color:"#bfdbfe",fontSize:10,fontWeight:700,borderRadius:5,padding:"2px 7px"},
  budgetBox:{minWidth:90,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1,background:"#111c2e",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"8px 12px"},
  muted:{color:"#94a3b8",fontSize:11},
  tabs:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#0a1322",borderBottom:"1px solid rgba(255,255,255,.08)"},
  tab:{border:0,background:"transparent",color:"#94a3b8",padding:"12px 4px",fontWeight:800,cursor:"pointer",fontSize:12},
  tabOn:{color:"#07111f",background:"#facc15"},
  content:{padding:10},

  // Pitch
  pitchWrap:{maxWidth:820,margin:"0 auto"},
  swapBanner:{background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#93c5fd",display:"flex",justifyContent:"space-between",alignItems:"center"},
  cancelBtn:{background:"#1e40af",border:"none",color:"#fff",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12},
  pitch:{position:"relative",overflow:"hidden",minHeight:480,padding:"20px 6px",borderRadius:14,background:"linear-gradient(180deg,#0d4e1c 0%,#0f6024 45%,#0f6024 55%,#0d4e1c 100%)",boxShadow:"inset 0 0 40px rgba(0,0,0,.4)",marginBottom:16},
  pitchLines:{position:"absolute",inset:0,width:"100%",height:"100%",stroke:"rgba(255,255,255,.12)",strokeWidth:".6",pointerEvents:"none"},
  pitchRow:{display:"flex",justifyContent:"center",gap:4,marginBottom:8,position:"relative",zIndex:1},

  // Token
  token:{display:"flex",flexDirection:"column",alignItems:"center",width:66,position:"relative",cursor:"pointer"},
  tokenBench:{width:72,background:"rgba(0,0,0,.3)",borderRadius:10,padding:"6px 4px"},
  tokenSwapSrc:{filter:"drop-shadow(0 0 8px #60a5fa)"},
  tokenSwapTarget:{filter:"drop-shadow(0 0 6px #fbbf24)",opacity:.8},
  emptyToken:{opacity:.4},
  emptyJersey:{width:46,height:46,borderRadius:"50%",border:"2px dashed rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"rgba(255,255,255,.4)"},
  tokenName:{fontSize:9,fontWeight:700,color:"#fff",textAlign:"center",marginTop:2,textShadow:"0 1px 4px rgba(0,0,0,.9)",maxWidth:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  tokenMeta:{fontSize:8,color:"#facc15",textShadow:"0 1px 4px rgba(0,0,0,.9)"},
  tokenFix:{fontSize:7,color:"rgba(255,255,255,.5)",textShadow:"0 1px 4px rgba(0,0,0,.9)"},
  capBadge:{position:"absolute",top:-4,right:2,background:"#f59e0b",color:"#000",fontSize:8,fontWeight:900,borderRadius:99,width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:3},
  vcBadge:{position:"absolute",top:-4,right:2,background:"#3b82f6",color:"#fff",fontSize:8,fontWeight:900,borderRadius:99,width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:3},
  ctxMenu:{position:"absolute",top:60,left:"50%",transform:"translateX(-50%)",background:"#111827",border:"1px solid #374151",borderRadius:10,overflow:"hidden",zIndex:99,boxShadow:"0 12px 40px rgba(0,0,0,.9)",minWidth:140},
  ctxItem:{padding:"9px 14px",fontSize:12,fontWeight:600,cursor:"pointer",borderBottom:"1px solid #1f2937",whiteSpace:"nowrap"},

  // Bench
  benchHead:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 8px"},
  benchRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12},

  // Players tab
  page:{maxWidth:820,margin:"0 auto"},
  toolbar:{display:"flex",flexDirection:"column",gap:8,marginBottom:12},
  filterGroup:{display:"flex",gap:6,flexWrap:"wrap"},
  fBtn:{background:"#111c2e",border:"1px solid rgba(255,255,255,.1)",color:"#94a3b8",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"},
  fBtnOn:{background:"#facc15",color:"#07111f",borderColor:"#facc15"},
  teamSelect:{background:"#111c2e",border:"1px solid rgba(255,255,255,.1)",color:"#fff",borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,outline:"none",cursor:"pointer"},
  search:{background:"#111c2e",border:"1px solid rgba(255,255,255,.1)",color:"#fff",borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"},
  playerList:{display:"flex",flexDirection:"column",gap:6},
  playerRow:{display:"flex",alignItems:"center",gap:10,background:"#0d1f35",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"8px 10px"},
  rowSelected:{border:"1px solid #22c55e44",background:"#14532d22"},
  rowMain:{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2,fontSize:12,color:"#94a3b8"},
  rowPrice:{fontWeight:900,color:"#facc15",fontSize:13,whiteSpace:"nowrap"},
  rowActions:{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap"},
  btn:{border:"none",borderRadius:6,padding:"5px 8px",fontSize:11,fontWeight:700,cursor:"pointer"},
  btnAdd:{background:"#15803d",color:"#fff"},
  btnDisabled:{background:"#1f2937",color:"#6b7280",cursor:"not-allowed"},
  btnGhost:{background:"#1f2937",color:"#9ca3af"},
  btnCapOn:{background:"#f59e0b",color:"#000"},
  btnVCOn:{background:"#3b82f6",color:"#fff"},

  // Fixtures
  fixCard:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:"#0d1f35",border:"1px solid rgba(255,255,255,.06)",borderRadius:9,padding:"10px 12px",marginBottom:6},
  fixDate:{display:"flex",flexDirection:"column",minWidth:80,fontSize:11},
  fixTeams:{flex:1,display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,minWidth:150},
  vs:{fontSize:9,background:"#1f2937",borderRadius:4,padding:"2px 6px",color:"#6b7280",fontWeight:400},

  // Vlog
  vlog:{maxWidth:820,margin:"0 auto"},
  rec:{color:"#ef4444",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6},
  vlogTitle:{color:"#fff",fontSize:24,fontWeight:900,margin:"0 0 12px"},
  vlogCapRow:{display:"flex",gap:12,marginBottom:16,alignItems:"center"},
  vlogForm:{fontWeight:900,fontSize:20,color:"#facc15",flex:1,textAlign:"center"},
  capCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"#0d1f35",borderRadius:10,padding:"10px 12px",flex:1,position:"relative"},
};
