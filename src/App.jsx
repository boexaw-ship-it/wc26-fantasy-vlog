import { useEffect, useMemo, useState } from "react";

const FORMATIONS = {
  "3-4-3": { DEF: 3, MID: 4, FWD: 3 },
  "3-5-2": { DEF: 3, MID: 5, FWD: 2 },
  "4-3-3": { DEF: 4, MID: 3, FWD: 3 },
  "4-4-2": { DEF: 4, MID: 4, FWD: 2 },
  "4-5-1": { DEF: 4, MID: 5, FWD: 1 },
  "5-3-2": { DEF: 5, MID: 3, FWD: 2 },
  "5-4-1": { DEF: 5, MID: 4, FWD: 1 },
};

const TABS = ["My Team", "Players", "Fixtures", "Vlog Mode"];
const POSITION_ROWS = ["FWD", "MID", "DEF", "GK"];

const TEAM_COLORS = {
  ARG: ["#75aadb", "#ffffff"],
  BEL: ["#111111", "#ef3340"],
  BRA: ["#f7e017", "#009c3b"],
  ENG: ["#ffffff", "#cf142b"],
  ESP: ["#c60b1e", "#ffc400"],
  FRA: ["#003189", "#ffffff"],
  GER: ["#ffffff", "#111111"],
  MAR: ["#c1272d", "#006233"],
  NED: ["#f36c21", "#ffffff"],
  POR: ["#006600", "#ff0000"],
  URU: ["#75aadb", "#ffffff"],
  DEFAULT: ["#334155", "#cbd5e1"],
};

function getTeamColors(code) {
  return TEAM_COLORS[code] || TEAM_COLORS.DEFAULT;
}

function emptyTeam() {
  return {
    teamName: "My WC26 Vlog XI",
    formation: "3-4-3",
    budget: 100,
    captain: "",
    viceCaptain: "",
    players: [],
  };
}

export default function App() {
  const [tab, setTab] = useState("My Team");
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [myTeam, setMyTeam] = useState(emptyTeam());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [playersRes, fixturesRes, teamRes] = await Promise.all([
          fetch("./data/fifa-players.json"),
          fetch("./data/fifa-fixtures.json"),
          fetch("./data/my-team.json"),
        ]);

        if (!playersRes.ok || !fixturesRes.ok || !teamRes.ok) {
          throw new Error("Data files could not be loaded.");
        }

        setPlayers(await playersRes.json());
        setFixtures(await fixturesRes.json());
        setMyTeam({ ...emptyTeam(), ...(await teamRes.json()) });
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedPlayers = useMemo(() => {
    const ids = myTeam.players || [];
    return ids
      .map((id) => players.find((player) => player.id === id))
      .filter(Boolean);
  }, [myTeam.players, players]);

  const totalCost = selectedPlayers.reduce(
    (sum, player) => sum + Number(player.price || 0),
    0
  );
  const budgetLeft = Number(myTeam.budget || 100) - totalCost;
  const captain = players.find((player) => player.id === myTeam.captain);
  const viceCaptain = players.find((player) => player.id === myTeam.viceCaptain);

  if (loading) {
    return <StatusScreen title="Loading fantasy data..." />;
  }

  if (error) {
    return <StatusScreen title="Data load failed" message={error} />;
  }

  return (
    <main style={S.shell}>
      <header style={S.header}>
        <div>
          <div style={S.kicker}>World Cup 2026 Fantasy</div>
          <h1 style={S.title}>{myTeam.teamName}</h1>
          <div style={S.subTitle}>
            {myTeam.formation} formation
            {captain ? ` | C: ${captain.name}` : ""}
            {viceCaptain ? ` | VC: ${viceCaptain.name}` : ""}
          </div>
        </div>

        <div style={S.budgetBox}>
          <span style={S.smallMuted}>Budget left</span>
          <strong style={{ color: budgetLeft < 0 ? "#fb7185" : "#4ade80" }}>
            ${budgetLeft.toFixed(1)}m
          </strong>
          <span style={S.smallMuted}>Used ${totalCost.toFixed(1)}m</span>
        </div>
      </header>

      <nav style={S.tabs}>
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            style={{ ...S.tab, ...(tab === item ? S.activeTab : {}) }}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <section style={S.content}>
        {tab === "My Team" && (
          <MyTeam
            players={selectedPlayers}
            formation={myTeam.formation}
            captainId={myTeam.captain}
            viceCaptainId={myTeam.viceCaptain}
          />
        )}

        {tab === "Players" && (
          <Players
            players={players}
            selectedIds={myTeam.players || []}
            positionFilter={positionFilter}
            setPositionFilter={setPositionFilter}
            search={search}
            setSearch={setSearch}
          />
        )}

        {tab === "Fixtures" && <Fixtures fixtures={fixtures} />}

        {tab === "Vlog Mode" && (
          <VlogMode
            players={selectedPlayers}
            formation={myTeam.formation}
            teamName={myTeam.teamName}
            captain={captain}
            viceCaptain={viceCaptain}
          />
        )}
      </section>
    </main>
  );
}

function StatusScreen({ title, message }) {
  return (
    <main style={{ ...S.shell, ...S.centerScreen }}>
      <h1 style={S.title}>{title}</h1>
      {message && <p style={S.subTitle}>{message}</p>}
    </main>
  );
}

function MyTeam({ players, formation, captainId, viceCaptainId }) {
  const rows = buildFormationRows(players, formation);

  return (
    <div style={S.pitchWrap}>
      <div style={S.pitchHeader}>
        <div>
          <div style={S.kicker}>Formation</div>
          <h2 style={S.sectionTitle}>{formation}</h2>
        </div>
        <div style={S.legend}>
          <span>Price and next fixture are shown on every card.</span>
        </div>
      </div>

      <div style={S.pitch}>
        <PitchLines />
        {POSITION_ROWS.map((position) => (
          <div key={position} style={S.pitchRow}>
            {rows[position].map((player, index) =>
              player ? (
                <PlayerToken
                  key={player.id}
                  player={player}
                  captain={player.id === captainId}
                  viceCaptain={player.id === viceCaptainId}
                />
              ) : (
                <EmptyToken key={`${position}-${index}`} position={position} />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Players({
  players,
  selectedIds,
  positionFilter,
  setPositionFilter,
  search,
  setSearch,
}) {
  const filteredPlayers = players.filter((player) => {
    const matchesPosition =
      positionFilter === "All" || player.position === positionFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      player.name?.toLowerCase().includes(query) ||
      player.fullName?.toLowerCase().includes(query) ||
      player.team?.toLowerCase().includes(query) ||
      player.teamCode?.toLowerCase().includes(query);

    return matchesPosition && matchesSearch;
  });

  return (
    <div style={S.page}>
      <div style={S.toolbar}>
        <div style={S.filterGroup}>
          {["All", "GK", "DEF", "MID", "FWD"].map((position) => (
            <button
              key={position}
              type="button"
              style={{
                ...S.filterButton,
                ...(positionFilter === position ? S.filterButtonActive : {}),
              }}
              onClick={() => setPositionFilter(position)}
            >
              {position}
            </button>
          ))}
        </div>
        <input
          style={S.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search player, country, code..."
        />
      </div>

      <div style={S.playerList}>
        {filteredPlayers.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            selected={selectedIds.includes(player.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Fixtures({ fixtures }) {
  const stages = [...new Set(fixtures.map((fixture) => fixture.stage))];

  return (
    <div style={S.page}>
      {stages.map((stage) => (
        <section key={stage} style={S.stageBlock}>
          <h2 style={S.stageTitle}>{stage}</h2>
          <div style={S.fixtureList}>
            {fixtures
              .filter((fixture) => fixture.stage === stage)
              .map((fixture) => (
                <article key={fixture.id} style={S.fixtureCard}>
                  <div style={S.fixtureDate}>
                    <strong>{fixture.date}</strong>
                    <span>{fixture.time || "TBD"}</span>
                  </div>
                  <div style={S.fixtureTeams}>
                    <span>{fixture.homeTeam}</span>
                    <b>VS</b>
                    <span>{fixture.awayTeam}</span>
                  </div>
                  <div style={S.fixtureVenue}>{fixture.venue}</div>
                  <div style={S.status}>{fixture.status}</div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function VlogMode({ players, formation, teamName, captain, viceCaptain }) {
  return (
    <div style={S.vlog}>
      <div style={S.rec}>REC | VLOG MODE</div>
      <h2 style={S.vlogTitle}>{teamName}</h2>
      <p style={S.vlogMeta}>
        {formation}
        {captain ? ` | Captain: ${captain.name}` : ""}
        {viceCaptain ? ` | Vice: ${viceCaptain.name}` : ""}
      </p>
      <MyTeam
        players={players}
        formation={formation}
        captainId={captain?.id}
        viceCaptainId={viceCaptain?.id}
      />
    </div>
  );
}

function buildFormationRows(players, formation) {
  const shape = FORMATIONS[formation] || FORMATIONS["3-4-3"];
  const byPosition = {
    GK: players.filter((player) => player.position === "GK"),
    DEF: players.filter((player) => player.position === "DEF"),
    MID: players.filter((player) => player.position === "MID"),
    FWD: players.filter((player) => player.position === "FWD"),
  };

  return {
    FWD: fillSlots(byPosition.FWD, shape.FWD),
    MID: fillSlots(byPosition.MID, shape.MID),
    DEF: fillSlots(byPosition.DEF, shape.DEF),
    GK: fillSlots(byPosition.GK, 1),
  };
}

function fillSlots(items, length) {
  return Array.from({ length }, (_, index) => items[index] || null);
}

function PlayerToken({ player, captain, viceCaptain }) {
  const [primary, secondary] = getTeamColors(player.teamCode);

  return (
    <article style={S.playerToken}>
      {captain && <span style={S.captainBadge}>C</span>}
      {viceCaptain && <span style={S.viceBadge}>VC</span>}
      <Jersey
        primary={primary}
        secondary={secondary}
        number={player.jerseyNumber || "-"}
      />
      <strong style={S.tokenName}>{player.name}</strong>
      <span style={S.tokenMeta}>
        {player.teamCode} | ${Number(player.price || 0).toFixed(1)}m
      </span>
      <span style={S.tokenFixture}>{player.nextFixture || "Fixture TBD"}</span>
    </article>
  );
}

function EmptyToken({ position }) {
  return (
    <article style={{ ...S.playerToken, ...S.emptyToken }}>
      <div style={S.emptyJersey}>+</div>
      <strong style={S.tokenName}>{position}</strong>
      <span style={S.tokenMeta}>Empty slot</span>
      <span style={S.tokenFixture}>Add player</span>
    </article>
  );
}

function PlayerRow({ player, selected }) {
  const [primary, secondary] = getTeamColors(player.teamCode);

  return (
    <article style={{ ...S.playerRow, ...(selected ? S.selectedRow : {}) }}>
      <Jersey
        primary={primary}
        secondary={secondary}
        number={player.jerseyNumber || "-"}
        size={46}
      />
      <div style={S.rowMain}>
        <strong>{player.fullName || player.name}</strong>
        <span>
          {player.team || player.teamCode} | {player.position} |{" "}
          {player.nextFixture || "Fixture TBD"}
        </span>
      </div>
      <div style={S.rowPrice}>${Number(player.price || 0).toFixed(1)}m</div>
    </article>
  );
}

function Jersey({ primary, secondary, number, size = 58 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 18 10 32l9 11 7-6v45h48V37l7 6 9-11-18-14c-6 6-13 9-22 9s-16-3-22-9Z"
        fill={primary}
        stroke="rgba(0,0,0,.3)"
        strokeWidth="2"
      />
      <path
        d="M38 18c3 8 21 8 24 0-3-5-8-8-12-8s-9 3-12 8Z"
        fill={secondary}
        opacity=".95"
      />
      <path d="m10 32 9 11 7-6v13L12 45Z" fill={secondary} opacity=".48" />
      <path d="m90 32-9 11-7-6v13l14-5Z" fill={secondary} opacity=".48" />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontSize="26"
        fontWeight="900"
        fill={secondary}
        fontFamily="Arial, sans-serif"
      >
        {number}
      </text>
    </svg>
  );
}

function PitchLines() {
  return (
    <svg style={S.pitchLines} viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="4" y="4" width="92" height="92" rx="3" fill="none" />
      <line x1="4" y1="50" x2="96" y2="50" />
      <circle cx="50" cy="50" r="11" fill="none" />
      <rect x="28" y="4" width="44" height="14" fill="none" />
      <rect x="28" y="82" width="44" height="14" fill="none" />
    </svg>
  );
}

const S = {
  shell: {
    minHeight: "100vh",
    background: "#07111f",
    color: "#e5edf7",
    fontFamily: "Inter, system-ui, Segoe UI, sans-serif",
    textAlign: "left",
  },
  centerScreen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "18px 18px 14px",
    background: "#0b1626",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  kicker: {
    color: "#facc15",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.7,
    fontWeight: 800,
  },
  title: {
    margin: "3px 0",
    color: "#ffffff",
    fontSize: 26,
    lineHeight: 1.05,
    fontWeight: 900,
  },
  subTitle: {
    color: "#94a3b8",
    fontSize: 13,
  },
  budgetBox: {
    minWidth: 116,
    padding: "10px 12px",
    background: "#111c2e",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 1,
  },
  smallMuted: {
    color: "#94a3b8",
    fontSize: 11,
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    background: "#0a1322",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  tab: {
    border: 0,
    background: "transparent",
    color: "#94a3b8",
    padding: "12px 6px",
    fontWeight: 800,
    cursor: "pointer",
  },
  activeTab: {
    color: "#07111f",
    background: "#facc15",
  },
  content: {
    padding: 12,
  },
  pitchWrap: {
    maxWidth: 820,
    margin: "0 auto",
  },
  pitchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#ffffff",
    margin: "2px 0 0",
    fontSize: 22,
    fontWeight: 900,
  },
  legend: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "right",
  },
  pitch: {
    position: "relative",
    overflow: "hidden",
    minHeight: 560,
    padding: "24px 8px",
    borderRadius: 14,
    border: "2px solid rgba(255,255,255,.12)",
    background:
      "repeating-linear-gradient(90deg, #0b6b32 0 58px, #0f7a3a 58px 116px)",
    boxShadow: "inset 0 0 60px rgba(0,0,0,.35)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 14,
  },
  pitchLines: {
    position: "absolute",
    inset: 8,
    width: "calc(100% - 16px)",
    height: "calc(100% - 16px)",
    stroke: "rgba(255,255,255,.25)",
    strokeWidth: 0.7,
    pointerEvents: "none",
  },
  pitchRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  playerToken: {
    width: 94,
    minHeight: 126,
    padding: "7px 6px",
    borderRadius: 10,
    background: "rgba(2,6,23,.74)",
    border: "1px solid rgba(255,255,255,.12)",
    boxShadow: "0 8px 22px rgba(0,0,0,.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    boxSizing: "border-box",
  },
  emptyToken: {
    opacity: 0.72,
    borderStyle: "dashed",
  },
  emptyJersey: {
    width: 50,
    height: 50,
    borderRadius: 12,
    border: "1px dashed rgba(255,255,255,.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbd5e1",
    fontWeight: 900,
    fontSize: 24,
    marginBottom: 5,
  },
  tokenName: {
    maxWidth: "100%",
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 1.15,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tokenMeta: {
    marginTop: 3,
    color: "#86efac",
    fontSize: 10,
    fontWeight: 800,
    textAlign: "center",
  },
  tokenFixture: {
    marginTop: 3,
    padding: "2px 5px",
    borderRadius: 5,
    background: "rgba(15,23,42,.9)",
    color: "#cbd5e1",
    fontSize: 10,
    lineHeight: 1.1,
    textAlign: "center",
    maxWidth: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  captainBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#facc15",
    color: "#111827",
    fontSize: 10,
    fontWeight: 900,
    display: "grid",
    placeItems: "center",
  },
  viceBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 20,
    borderRadius: 999,
    background: "#38bdf8",
    color: "#082f49",
    fontSize: 9,
    fontWeight: 900,
    display: "grid",
    placeItems: "center",
  },
  page: {
    maxWidth: 880,
    margin: "0 auto",
  },
  toolbar: {
    display: "flex",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  filterButton: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "#101b2d",
    color: "#cbd5e1",
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  filterButtonActive: {
    background: "#facc15",
    color: "#07111f",
  },
  search: {
    minWidth: 230,
    flex: 1,
    border: "1px solid rgba(255,255,255,.12)",
    background: "#101b2d",
    color: "#ffffff",
    borderRadius: 999,
    padding: "9px 14px",
    outline: "none",
  },
  playerList: {
    display: "grid",
    gap: 8,
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#0f1a2b",
    border: "1px solid rgba(255,255,255,.08)",
  },
  selectedRow: {
    borderColor: "rgba(74,222,128,.55)",
    background: "rgba(22,101,52,.28)",
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    color: "#ffffff",
  },
  rowPrice: {
    color: "#86efac",
    fontWeight: 900,
    fontSize: 13,
  },
  stageBlock: {
    marginBottom: 18,
  },
  stageTitle: {
    margin: "0 0 8px",
    color: "#facc15",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  fixtureList: {
    display: "grid",
    gap: 8,
  },
  fixtureCard: {
    display: "grid",
    gridTemplateColumns: "96px 1fr 180px 88px",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#0f1a2b",
    border: "1px solid rgba(255,255,255,.08)",
  },
  fixtureDate: {
    display: "flex",
    flexDirection: "column",
    color: "#cbd5e1",
    fontSize: 12,
  },
  fixtureTeams: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    color: "#ffffff",
    fontWeight: 900,
  },
  fixtureVenue: {
    color: "#94a3b8",
    fontSize: 12,
  },
  status: {
    justifySelf: "end",
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(34,197,94,.14)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  vlog: {
    maxWidth: 920,
    margin: "0 auto",
    padding: 14,
    borderRadius: 16,
    background: "#030712",
  },
  rec: {
    color: "#fb7185",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 900,
  },
  vlogTitle: {
    margin: "4px 0",
    textAlign: "center",
    color: "#ffffff",
    fontSize: 30,
    fontWeight: 900,
  },
  vlogMeta: {
    marginBottom: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
};
