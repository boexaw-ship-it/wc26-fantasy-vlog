import { useState, useMemo } from "react";

// ── DATA (from your JSON files) ──────────────────────────────────────────────
const ALL_PLAYERS = [
  { id: "mbappe",    name: "Kylian Mbappé",   team: "France",   teamCode: "FRA", position: "FWD", price: 11.5, points: 0, jerseyNumber: 10, nextFixture: "FRA vs TBD" },
  { id: "bellingham",name: "Jude Bellingham", team: "England",  teamCode: "ENG", position: "MID", price: 9.5,  points: 0, jerseyNumber: 10, nextFixture: "ENG vs TBD" },
  { id: "vinicius",  name: "Vinicius Jr.",     team: "Brazil",   teamCode: "BRA", position: "FWD", price: 10.0, points: 0, jerseyNumber:  7, nextFixture: "BRA vs TBD" },
  { id: "messi",     name: "Lionel Messi",    team: "Argentina",teamCode: "ARG", position: "FWD", price: 10.5, points: 0, jerseyNumber: 10, nextFixture: "ARG vs TBD" },
  { id: "haaland",   name: "Erling Haaland",  team: "Norway",   teamCode: "NOR", position: "FWD", price: 11.0, points: 0, jerseyNumber:  9, nextFixture: "NOR vs TBD" },
  { id: "dejong",    name: "Frenkie de Jong", team: "Netherlands",teamCode:"NED", position: "MID", price: 8.0,  points: 0, jerseyNumber:  7, nextFixture: "NED vs TBD" },
  { id: "salah",     name: "Mohamed Salah",   team: "Egypt",    teamCode: "EGY", position: "MID", price: 9.0,  points: 0, jerseyNumber: 11, nextFixture: "EGY vs TBD" },
  { id: "alisson",   name: "Alisson Becker",  team: "Brazil",   teamCode: "BRA", position: "GK",  price: 6.0,  points: 0, jerseyNumber:  1, nextFixture: "BRA vs TBD" },
  { id: "ruben",     name: "Rúben Dias",       team: "Portugal", teamCode: "POR", position: "DEF", price: 7.0,  points: 0, jerseyNumber:  4, nextFixture: "POR vs TBD" },
  { id: "hakimi",    name: "Achraf Hakimi",    team: "Morocco",  teamCode: "MAR", position: "DEF", price: 7.5,  points: 0, jerseyNumber:  2, nextFixture: "MAR vs TBD" },
];

const MY_TEAM = {
  teamName: "My WC26 Vlog XI",
  formation: "3-4-3",
  budget: 100,
  captain: "mbappe",
  viceCaptain: "bellingham",
  players: ["mbappe", "messi", "bellingham"],
};

const FIXTURES = [
  { id: "m1",  stage: "Group Stage",  date: "2026-06-11", homeTeam: "Mexico",    awayTeam: "USA",       venue: "SoFi Stadium",  status: "Scheduled" },
  { id: "m2",  stage: "Group Stage",  date: "2026-06-12", homeTeam: "France",    awayTeam: "Argentina", venue: "MetLife",       status: "Scheduled" },
  { id: "m3",  stage: "Group Stage",  date: "2026-06-13", homeTeam: "Brazil",    awayTeam: "England",   venue: "AT&T Stadium",  status: "Scheduled" },
  { id: "m4",  stage: "Group Stage",  date: "2026-06-14", homeTeam: "Spain",     awayTeam: "Germany",   venue: "Rose Bowl",     status: "Scheduled" },
  { id: "m5",  stage: "Quarter-Final",date: "2026-07-03", homeTeam: "TBD",       awayTeam: "TBD",       venue: "TBD",           status: "TBD" },
];

const TABS = ["Dashboard", "My Team", "Fixtures", "Players", "Vlog Mode"];

// ── POSITION COLORS ──────────────────────────────────────────────────────────
const POS_COLOR = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444" };

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");

  const selected = useMemo(
    () => MY_TEAM.players.map((id) => ALL_PLAYERS.find((p) => p.id === id)).filter(Boolean),
    []
  );
  const totalCost = selected.reduce((s, p) => s + p.price, 0);
  const budgetLeft = MY_TEAM.budget - totalCost;

  return (
    <div style={styles.shell}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandBadge}>WC</div>
          <div>
            <div style={styles.brandSub}>World Cup 2026</div>
            <div style={styles.brandTitle}>Fantasy<br/>Vlog</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.navBtn, ...(tab === t ? styles.navActive : {}) }}>
              <span style={styles.navIcon}>{NAV_ICON[t]}</span>
              {t}
            </button>
          ))}
        </nav>

        <div style={styles.sideFooter}>
          <div style={styles.budgetBar}>
            <div style={styles.budgetLabel}>
              <span>Budget</span>
              <span style={{ color: budgetLeft < 0 ? "#ef4444" : "#10b981" }}>
                ${budgetLeft.toFixed(1)}m left
              </span>
            </div>
            <div style={styles.budgetTrack}>
              <div style={{ ...styles.budgetFill, width: `${Math.min((totalCost / MY_TEAM.budget) * 100, 100)}%` }} />
            </div>
            <div style={styles.budgetSub}>${totalCost.toFixed(1)}m / ${MY_TEAM.budget}m used</div>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main style={styles.content}>
        {/* TOPBAR */}
        <header style={styles.topbar}>
          <div>
            <div style={styles.eyebrow}>{tab}</div>
            <div style={styles.topbarTitle}>{MY_TEAM.teamName}</div>
          </div>
          <div style={styles.topbarMeta}>
            <div style={styles.badge}>⚽ {selected.length} Players</div>
            <div style={styles.badge}>🏆 Formation: {MY_TEAM.formation}</div>
          </div>
        </header>

        {/* VIEWS */}
        <div style={styles.view}>
          {tab === "Dashboard"  && <Dashboard selected={selected} totalCost={totalCost} budgetLeft={budgetLeft} />}
          {tab === "My Team"    && <MyTeam selected={selected} />}
          {tab === "Fixtures"   && <Fixtures />}
          {tab === "Players"    && <Players />}
          {tab === "Vlog Mode"  && <VlogMode selected={selected} />}
        </div>
      </main>
    </div>
  );
}

// ── NAV ICONS ────────────────────────────────────────────────────────────────
const NAV_ICON = {
  Dashboard: "◈", "My Team": "⚽", Fixtures: "📅", Players: "👥", "Vlog Mode": "🎬",
};

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ selected, totalCost, budgetLeft }) {
  const stats = [
    { label: "Players Selected", value: selected.length + " / 11",  sub: "Squad incomplete", color: "#f59e0b" },
    { label: "Budget Used",      value: "$" + totalCost.toFixed(1) + "m", sub: `$${budgetLeft.toFixed(1)}m remaining`, color: "#10b981" },
    { label: "Total Fixtures",   value: FIXTURES.length,             sub: "Group stage + KO",  color: "#3b82f6" },
    { label: "Formation",        value: MY_TEAM.formation,           sub: "Current setup",      color: "#ef4444" },
  ];
  return (
    <div>
      <div style={styles.statGrid}>
        {stats.map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ ...styles.statAccent, background: s.color }} />
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.sectionTitle}>Your Selected Players</div>
      <div style={styles.playerCards}>
        {selected.map((p) => <SmallCard key={p.id} player={p} />)}
        {selected.length === 0 && <div style={styles.empty}>No players selected yet.</div>}
      </div>

      <div style={styles.sectionTitle}>Upcoming Fixtures</div>
      <div style={styles.fixtureList}>
        {FIXTURES.slice(0, 3).map((f) => <FixtureRow key={f.id} f={f} />)}
      </div>
    </div>
  );
}

// ── MY TEAM ──────────────────────────────────────────────────────────────────
function MyTeam({ selected }) {
  const rows = ["GK", "DEF", "MID", "FWD"];
  return (
    <div style={styles.pitch}>
      {rows.map((pos) => {
        const row = selected.filter((p) => p.position === pos);
        return (
          <div key={pos} style={styles.pitchRow}>
            <div style={{ ...styles.posTag, background: POS_COLOR[pos] }}>{pos}</div>
            <div style={styles.pitchPlayers}>
              {row.length > 0
                ? row.map((p) => <PitchCard key={p.id} player={p} />)
                : <div style={styles.emptySlot}>Empty slot</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── FIXTURES ─────────────────────────────────────────────────────────────────
function Fixtures() {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {["Date", "Stage", "Match", "Venue", "Status"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FIXTURES.map((f, i) => (
            <tr key={f.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td style={styles.td}>{f.date}</td>
              <td style={styles.td}><span style={styles.stageBadge}>{f.stage}</span></td>
              <td style={{ ...styles.td, fontWeight: 700, color: "#fff" }}>{f.homeTeam} vs {f.awayTeam}</td>
              <td style={styles.td}>{f.venue}</td>
              <td style={styles.td}><span style={{ ...styles.statusBadge, background: f.status === "Scheduled" ? "#10b98133" : "#6b728033", color: f.status === "Scheduled" ? "#10b981" : "#9ca3af" }}>{f.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── PLAYERS ──────────────────────────────────────────────────────────────────
function Players() {
  const [filter, setFilter] = useState("All");
  const positions = ["All", "GK", "DEF", "MID", "FWD"];
  const filtered = filter === "All" ? ALL_PLAYERS : ALL_PLAYERS.filter((p) => p.position === filter);

  return (
    <div>
      <div style={styles.filterRow}>
        {positions.map((pos) => (
          <button key={pos} onClick={() => setFilter(pos)}
            style={{ ...styles.filterBtn, ...(filter === pos ? { background: POS_COLOR[pos] || "#6366f1", color: "#fff", borderColor: "transparent" } : {}) }}>
            {pos}
          </button>
        ))}
      </div>
      <div style={styles.playerCards}>
        {filtered.map((p) => <SmallCard key={p.id} player={p} />)}
      </div>
    </div>
  );
}

// ── VLOG MODE ────────────────────────────────────────────────────────────────
function VlogMode({ selected }) {
  return (
    <div style={styles.vlogWrap}>
      <div style={styles.vlogHeader}>
        <div style={styles.vlogBadge}>🎬 RECORDING VIEW</div>
        <div style={styles.vlogTitle}>{MY_TEAM.teamName}</div>
        <div style={styles.vlogSub}>
          {MY_TEAM.formation} · Captain: {selected.find((p) => p.id === MY_TEAM.captain)?.name || "—"} · VC: {selected.find((p) => p.id === MY_TEAM.viceCaptain)?.name || "—"}
        </div>
      </div>
      <MyTeam selected={selected} />
    </div>
  );
}

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────
function SmallCard({ player }) {
  const isCap = player.id === MY_TEAM.captain;
  const isVC  = player.id === MY_TEAM.viceCaptain;
  return (
    <div style={styles.smallCard}>
      <div style={{ ...styles.jersey, background: POS_COLOR[player.position] }}>
        {player.jerseyNumber}
      </div>
      <div>
        <div style={styles.playerName}>
          {player.name}
          {isCap && <span style={styles.capBadge}> C</span>}
          {isVC  && <span style={styles.vcBadge}> VC</span>}
        </div>
        <div style={styles.playerMeta}>{player.teamCode} · {player.position} · ${player.price}m</div>
        <div style={styles.playerFixture}>{player.nextFixture}</div>
      </div>
    </div>
  );
}

function PitchCard({ player }) {
  const isCap = player.id === MY_TEAM.captain;
  const isVC  = player.id === MY_TEAM.viceCaptain;
  return (
    <div style={styles.pitchCard}>
      <div style={{ ...styles.pitchJersey, background: POS_COLOR[player.position] }}>
        {player.jerseyNumber}
      </div>
      <div style={styles.pitchName}>
        {player.name.split(" ").slice(-1)[0]}
        {isCap && <span style={styles.capBadge}> C</span>}
        {isVC  && <span style={styles.vcBadge}> VC</span>}
      </div>
      <div style={styles.pitchPrice}>${player.price}m</div>
    </div>
  );
}

function FixtureRow({ f }) {
  return (
    <div style={styles.fixtureRow}>
      <div style={styles.fixtureDate}>{f.date}</div>
      <div style={styles.fixtureMatch}>{f.homeTeam} <span style={{ color: "#6b7280" }}>vs</span> {f.awayTeam}</div>
      <div style={styles.fixtureVenue}>{f.venue}</div>
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0b0f",
  sidebar: "#0f1117",
  card:    "#13151e",
  border:  "#1e2130",
  text:    "#e2e8f0",
  muted:   "#64748b",
  accent:  "#6366f1",
  green:   "#10b981",
};

const styles = {
  shell: {
    display: "flex", height: "100vh", background: C.bg,
    fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif",
    color: C.text, overflow: "hidden",
  },
  sidebar: {
    width: 220, minWidth: 220, background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column", padding: "24px 0",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "0 20px 24px", borderBottom: `1px solid ${C.border}`,
  },
  brandBadge: {
    width: 40, height: 40, borderRadius: 10,
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 13, flexShrink: 0,
  },
  brandSub:   { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 },
  brandTitle: { fontSize: 15, fontWeight: 800, lineHeight: 1.2, color: C.text },
  nav:        { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 },
  navBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "none", border: "none", cursor: "pointer",
    color: C.muted, fontSize: 13, fontWeight: 500,
    padding: "10px 12px", borderRadius: 8, textAlign: "left",
    transition: "all .15s",
  },
  navActive: { background: `${C.accent}22`, color: C.text },
  navIcon:   { fontSize: 15, width: 18, textAlign: "center" },
  sideFooter: { padding: "16px 20px", borderTop: `1px solid ${C.border}` },
  budgetBar: { display: "flex", flexDirection: "column", gap: 6 },
  budgetLabel:{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted },
  budgetTrack:{ height: 4, background: C.border, borderRadius: 99 },
  budgetFill: { height: "100%", background: `linear-gradient(90deg,${C.accent},#8b5cf6)`, borderRadius: 99 },
  budgetSub:  { fontSize: 10, color: C.muted },

  content: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    padding: "20px 28px", borderBottom: `1px solid ${C.border}`,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: C.sidebar,
  },
  eyebrow:     { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  topbarTitle: { fontSize: 20, fontWeight: 800 },
  topbarMeta:  { display: "flex", gap: 8 },
  badge: {
    background: C.card, border: `1px solid ${C.border}`,
    padding: "6px 12px", borderRadius: 8, fontSize: 12, color: C.muted,
  },
  view: { flex: 1, overflow: "auto", padding: 28 },

  // Dashboard
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
  statCard: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "20px 20px 16px", position: "relative", overflow: "hidden",
  },
  statAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  statLabel: { fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  statSub:   { fontSize: 11, color: C.muted },
  sectionTitle: { fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 4 },

  // Player cards
  playerCards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12, marginBottom: 24 },
  smallCard: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
  },
  jersey: {
    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 14,
  },
  playerName:    { fontSize: 13, fontWeight: 700 },
  playerMeta:    { fontSize: 11, color: C.muted, marginTop: 2 },
  playerFixture: { fontSize: 10, color: "#6366f1", marginTop: 3 },
  capBadge: { background: "#f59e0b", color: "#000", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 900, marginLeft: 4 },
  vcBadge:  { background: "#3b82f6", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 900, marginLeft: 4 },
  empty:    { color: C.muted, fontSize: 13, padding: 20 },

  // Fixtures list
  fixtureList:   { display: "flex", flexDirection: "column", gap: 8 },
  fixtureRow: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 16,
  },
  fixtureDate:  { fontSize: 11, color: C.muted, width: 90, flexShrink: 0 },
  fixtureMatch: { flex: 1, fontWeight: 700, fontSize: 13 },
  fixtureVenue: { fontSize: 11, color: C.muted },

  // Pitch
  pitch: { display: "flex", flexDirection: "column", gap: 24 },
  pitchRow: { display: "flex", alignItems: "center", gap: 16 },
  posTag: { width: 36, textAlign: "center", borderRadius: 6, padding: "4px 0", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  pitchPlayers: { display: "flex", gap: 12, flexWrap: "wrap" },
  pitchCard: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "12px 14px", minWidth: 110,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
  },
  pitchJersey: {
    width: 44, height: 44, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 16,
  },
  pitchName:  { fontSize: 12, fontWeight: 700, textAlign: "center" },
  pitchPrice: { fontSize: 11, color: C.muted },
  emptySlot:  { fontSize: 12, color: C.muted, padding: "12px 16px", border: `1px dashed ${C.border}`, borderRadius: 10 },

  // Table
  tableWrap: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "12px 16px", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, textAlign: "left", borderBottom: `1px solid ${C.border}` },
  td:        { padding: "12px 16px", fontSize: 13, color: "#cbd5e1", borderBottom: `1px solid ${C.border}` },
  trEven:    { background: "transparent" },
  trOdd:     { background: "#ffffff04" },
  stageBadge:{ fontSize: 10, background: `${C.accent}22`, color: C.accent, padding: "3px 8px", borderRadius: 6 },
  statusBadge:{ fontSize: 10, padding: "3px 8px", borderRadius: 6 },

  // Filter
  filterRow: { display: "flex", gap: 8, marginBottom: 16 },
  filterBtn: {
    background: C.card, border: `1px solid ${C.border}`,
    color: C.muted, borderRadius: 8, padding: "7px 14px", fontSize: 12,
    fontWeight: 600, cursor: "pointer",
  },

  // Vlog
  vlogWrap:   { background: "#0a0e1a", minHeight: "100%", padding: 8 },
  vlogHeader: { textAlign: "center", marginBottom: 32 },
  vlogBadge:  { fontSize: 11, color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  vlogTitle:  { fontSize: 32, fontWeight: 900, marginBottom: 6 },
  vlogSub:    { fontSize: 13, color: C.muted },
};
