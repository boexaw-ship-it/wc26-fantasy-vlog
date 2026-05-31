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
const STORAGE_KEY = "wc26-vlog-team";

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

function defaultTeam() {
  return {
    teamName: "My WC26 Vlog XI",
    formation: "3-4-3",
    budget: 100,
    captain: "",
    viceCaptain: "",
    players: [],
  };
}

function getSavedTeam() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultTeam(), ...JSON.parse(saved) } : defaultTeam();
  } catch {
    return defaultTeam();
  }
}

export default function App() {
  const [tab, setTab] = useState("My Team");
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [myTeam, setMyTeam] = useState(getSavedTeam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [playersRes, fixturesRes] = await Promise.all([
          fetch("./data/fifa-players.json"),
          fetch("./data/fifa-fixtures.json"),
        ]);

        if (!playersRes.ok || !fixturesRes.ok) {
          throw new Error("Data files could not be loaded.");
        }

        setPlayers(await playersRes.json());
        setFixtures(await fixturesRes.json());
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(myTeam));
  }, [myTeam]);

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

  function togglePlayer(playerId) {
    setMyTeam((current) => {
      const selected = current.players || [];
      const alreadySelected = selected.includes(playerId);
      const nextPlayers = alreadySelected
        ? selected.filter((id) => id !== playerId)
        : selected.length < 15
          ? [...selected, playerId]
          : selected;

      return {
        ...current,
        players: nextPlayers,
        captain: nextPlayers.includes(current.captain) ? current.captain : "",
        viceCaptain: nextPlayers.includes(current.viceCaptain)
          ? current.viceCaptain
          : "",
      };
    });
  }

  function setCaptain(playerId) {
    setMyTeam((current) => ({
      ...current,
      captain: current.captain === playerId ? "" : playerId,
      viceCaptain: current.viceCaptain === playerId ? "" : current.viceCaptain,
    }));
  }

  function setViceCaptain(playerId) {
    setMyTeam((current) => ({
      ...current,
      viceCaptain: current.viceCaptain === playerId ? "" : playerId,
      captain: current.captain === playerId ? "" : current.captain,
    }));
  }

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
            <select
              style={S.formationSelect}
              value={myTeam.formation}
              onChange={(event) =>
                setMyTeam((current) => ({
                  ...current,
                  formation: event.target.value,
                }))
              }
            >
              {Object.keys(FORMATIONS).map((formation) => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>
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
            captainId={myTeam.captain}
            viceCaptainId={myTeam.viceCaptain}
            onTogglePlayer={togglePlayer}
            onSetCaptain={setCaptain}
            onSetViceCaptain={setViceCaptain}
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
  const layout = buildTeamLayout(players, formation);

  return (
    <div style={S.pitchWrap}>
      <div style={S.pitchHeader}>
        <div>
          <div style={S.kicker}>Formation</div>
          <h2 style={S.sectionTitle}>{formation}</h2>
        </div>
        <div style={S.legend}>
          <span>Starters, bench, price and next fixture are ready for vlog.</span>
        </div>
      </div>

      <div style={S.pitch}>
        <PitchLines />
        {POSITION_ROWS.map((position) => (
          <div key={position} style={S.pitchRow}>
            {layout.rows[position].map((player, index) =>
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

      <BenchSection
        bench={layout.bench}
        starters={layout.starters}
        captainId={captainId}
        viceCaptainId={viceCaptainId}
      />

      <SwitchPanel bench={layout.bench} starters={layout.starters} />
    </div>
  );
}

function Players({
  players,
  selectedIds,
  captainId,
  viceCaptainId,
  onTogglePlayer,
  onSetCaptain,
  onSetViceCaptain,
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
            captain={player.id === captainId}
            viceCaptain={player.id === viceCaptainId}
            squadFull={selectedIds.length >= 15}
            onToggle={() => onTogglePlayer(player.id)}
            onSetCaptain={() => onSetCaptain(player.id)}
            onSetViceCaptain={() => onSetViceCaptain(player.id)}
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
  const layout = buildTeamLayout(players, formation);

  return (
    <div style={S.vlog}>
      <div style={S.rec}>REC | VLOG MODE</div>
      <h2 style={S.vlogTitle}>{teamName}</h2>
      <div style={S.vlogCaptainRow}>
        <CaptainCard label="Captain" player={captain} type="captain" />
        <div style={S.vlogFormation}>{formation}</div>
        <CaptainCard label="Vice Captain" player={viceCaptain} type="vice" />
      </div>
      <MyTeam
        players={players}
        formation={formation}
        captainId={captain?.id}
        viceCaptainId={viceCaptain?.id}
      />
      <SquadStrip players={layout.allPlayers} captainId={captain?.id} viceCaptainId={viceCaptain?.id} />
    </div>
  );
}

function buildTeamLayout(players, formation) {
  const shape = FORMATIONS[formation] || FORMATIONS["3-4-3"];
  const byPosition = {
    GK: players.filter((player) => player.position === "GK"),
    DEF: players.filter((player) => player.position === "DEF"),
    MID: players.filter((player) => player.position === "MID"),
    FWD: players.filter((player) => player.position === "FWD"),
  };

  const starters = [
    ...byPosition.GK.slice(0, 1),
    ...byPosition.DEF.slice(0, shape.DEF),
    ...byPosition.MID.slice(0, shape.MID),
    ...byPosition.FWD.slice(0, shape.FWD),
  ];
  const starterIds = new Set(starters.map((player) => player.id));
  const bench = players.filter((player) => !starterIds.has(player.id)).slice(0, 4);

  return {
    rows: {
      FWD: fillSlots(byPosition.FWD.slice(0, shape.FWD), shape.FWD),
      MID: fillSlots(byPosition.MID.slice(0, shape.MID), shape.MID),
      DEF: fillSlots(byPosition.DEF.slice(0, shape.DEF), shape.DEF),
      GK: fillSlots(byPosition.GK.slice(0, 1), 1),
    },
    starters,
    bench: fillSlots(bench, 4),
    allPlayers: [...starters, ...bench],
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

function BenchSection({ bench, starters, captainId, viceCaptainId }) {
  return (
    <section style={S.benchSection}>
      <div style={S.benchHeader}>
        <div>
          <div style={S.kicker}>Bench</div>
          <h2 style={S.benchTitle}>Substitutes 4</h2>
        </div>
        <span style={S.benchHint}>Switch options are shown below.</span>
      </div>
      <div style={S.benchGrid}>
        {bench.map((player, index) =>
          player ? (
            <BenchCard
              key={player.id}
              player={player}
              index={index}
              captain={player.id === captainId}
              viceCaptain={player.id === viceCaptainId}
              switchTargets={getSwitchTargets(player, starters)}
            />
          ) : (
            <EmptyBenchCard key={`bench-empty-${index}`} index={index} />
          )
        )}
      </div>
    </section>
  );
}

function BenchCard({ player, index, captain, viceCaptain, switchTargets }) {
  const [primary, secondary] = getTeamColors(player.teamCode);

  return (
    <article style={S.benchCard}>
      <span style={S.benchNumber}>B{index + 1}</span>
      {captain && <span style={S.captainBadge}>C</span>}
      {viceCaptain && <span style={S.viceBadge}>VC</span>}
      <Jersey
        primary={primary}
        secondary={secondary}
        number={player.jerseyNumber || "-"}
        size={52}
      />
      <strong style={S.tokenName}>{player.name}</strong>
      <span style={S.tokenMeta}>
        {player.position} | ${Number(player.price || 0).toFixed(1)}m
      </span>
      <span style={S.tokenFixture}>{player.nextFixture || "Fixture TBD"}</span>
      <span style={S.switchText}>
        Switch: {switchTargets.length ? switchTargets.join(", ") : "No same-position starter"}
      </span>
    </article>
  );
}

function EmptyBenchCard({ index }) {
  return (
    <article style={{ ...S.benchCard, ...S.emptyToken }}>
      <span style={S.benchNumber}>B{index + 1}</span>
      <div style={S.emptyJersey}>+</div>
      <strong style={S.tokenName}>Bench</strong>
      <span style={S.tokenMeta}>Empty slot</span>
      <span style={S.tokenFixture}>Add substitute</span>
    </article>
  );
}

function SwitchPanel({ bench, starters }) {
  const availableBench = bench.filter(Boolean);

  return (
    <section style={S.switchPanel}>
      <div style={S.switchTitle}>Player Switch Preview</div>
      {availableBench.length ? (
        <div style={S.switchGrid}>
          {availableBench.map((player) => {
            const targets = getSwitchTargets(player, starters);
            return (
              <div key={player.id} style={S.switchItem}>
                <strong>{player.name}</strong>
                <span>
                  {player.position} bench can switch with{" "}
                  {targets.length ? targets.join(", ") : "no current starter"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={S.vlogMeta}>
          Pick up to 15 players from the Players tab to show switch options.
        </p>
      )}
    </section>
  );
}

function CaptainCard({ label, player, type }) {
  return (
    <div style={S.captainCard}>
      <span style={type === "captain" ? S.captainPill : S.vicePill}>
        {type === "captain" ? "C" : "VC"}
      </span>
      <div>
        <div style={S.captainLabel}>{label}</div>
        <strong>{player?.name || "Not selected"}</strong>
        {player && (
          <span style={S.captainFixture}>
            {player.teamCode} | ${Number(player.price || 0).toFixed(1)}m |{" "}
            {player.nextFixture || "Fixture TBD"}
          </span>
        )}
      </div>
    </div>
  );
}

function SquadStrip({ players, captainId, viceCaptainId }) {
  return (
    <section style={S.squadStrip}>
      <div style={S.switchTitle}>Full Vlog Squad</div>
      <div style={S.squadGrid}>
        {players.filter(Boolean).map((player) => (
          <div key={player.id} style={S.squadChip}>
            <strong>
              {player.name}
              {player.id === captainId ? " (C)" : ""}
              {player.id === viceCaptainId ? " (VC)" : ""}
            </strong>
            <span>
              {player.position} | {player.teamCode} | ${Number(player.price || 0).toFixed(1)}m |{" "}
              {player.nextFixture || "Fixture TBD"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getSwitchTargets(player, starters) {
  return starters
    .filter((starter) => starter.position === player.position)
    .map((starter) => starter.name)
    .slice(0, 3);
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

function PlayerRow({
  player,
  selected,
  captain,
  viceCaptain,
  squadFull,
  onToggle,
  onSetCaptain,
  onSetViceCaptain,
}) {
  const [primary, secondary] = getTeamColors(player.teamCode);
  const addDisabled = !selected && squadFull;

  return (
    <article
      style={{
        ...S.playerRow,
        ...(selected ? S.selectedRow : {}),
        ...(!selected && squadFull ? S.playerRowDisabled : {}),
      }}
      onClick={() => {
        if (!addDisabled) onToggle();
      }}
      title={
        selected
          ? "Click to remove from squad"
          : addDisabled
            ? "Squad is full"
            : "Click to add to squad"
      }
    >
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
      <div style={S.rowActions} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          style={{
            ...S.actionButton,
            ...(selected ? S.removeButton : {}),
            ...(addDisabled ? S.disabledButton : {}),
          }}
          disabled={addDisabled}
          onClick={onToggle}
        >
          {selected ? "Remove" : addDisabled ? "Full" : "Add"}
        </button>
        {selected && (
          <>
            <button
              type="button"
              style={{
                ...S.actionButton,
                ...(captain ? S.captainButtonActive : {}),
              }}
              onClick={onSetCaptain}
            >
              {captain ? "Captain" : "Set C"}
            </button>
            <button
              type="button"
              style={{
                ...S.actionButton,
                ...(viceCaptain ? S.viceButtonActive : {}),
              }}
              onClick={onSetViceCaptain}
            >
              {viceCaptain ? "Vice" : "Set VC"}
            </button>
          </>
        )}
      </div>
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
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  formationSelect: {
    border: "1px solid rgba(255,255,255,.16)",
    background: "#101b2d",
    color: "#ffffff",
    borderRadius: 8,
    padding: "5px 8px",
    fontWeight: 900,
    outline: "none",
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
  benchSection: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#0b1626",
    border: "1px solid rgba(255,255,255,.08)",
  },
  benchHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  benchTitle: {
    margin: "2px 0 0",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
  },
  benchHint: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "right",
  },
  benchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
  },
  benchCard: {
    minHeight: 156,
    padding: "10px 7px",
    borderRadius: 12,
    background: "#0f1a2b",
    border: "1px solid rgba(255,255,255,.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    boxSizing: "border-box",
  },
  benchNumber: {
    position: "absolute",
    top: 6,
    left: 6,
    padding: "2px 5px",
    borderRadius: 999,
    background: "rgba(250,204,21,.16)",
    color: "#fde68a",
    fontSize: 10,
    fontWeight: 900,
  },
  switchText: {
    marginTop: 6,
    width: "100%",
    color: "#93c5fd",
    fontSize: 9,
    lineHeight: 1.25,
    textAlign: "center",
  },
  switchPanel: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#101b2d",
    border: "1px solid rgba(56,189,248,.18)",
  },
  switchTitle: {
    marginBottom: 8,
    color: "#facc15",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  switchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
  },
  switchItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "9px 10px",
    borderRadius: 10,
    background: "rgba(15,23,42,.72)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#cbd5e1",
    fontSize: 12,
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
    cursor: "pointer",
    transition: "border-color .18s, background .18s, transform .18s",
  },
  selectedRow: {
    borderColor: "rgba(74,222,128,.55)",
    background: "rgba(22,101,52,.28)",
  },
  playerRowDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
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
    minWidth: 66,
    textAlign: "right",
  },
  rowActions: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    minWidth: 190,
  },
  actionButton: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "#17233a",
    color: "#e5edf7",
    borderRadius: 8,
    padding: "7px 9px",
    fontSize: 11,
    fontWeight: 900,
    cursor: "pointer",
  },
  removeButton: {
    background: "rgba(251,113,133,.16)",
    color: "#fecdd3",
  },
  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  captainButtonActive: {
    background: "#facc15",
    color: "#111827",
  },
  viceButtonActive: {
    background: "#38bdf8",
    color: "#082f49",
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
  vlogCaptainRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 10,
    alignItems: "stretch",
    margin: "12px 0 14px",
  },
  vlogFormation: {
    minWidth: 96,
    padding: "12px 14px",
    borderRadius: 14,
    background: "#facc15",
    color: "#07111f",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 18,
  },
  captainCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#0f1a2b",
    border: "1px solid rgba(255,255,255,.1)",
    color: "#ffffff",
    minWidth: 0,
  },
  captainPill: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#facc15",
    color: "#111827",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flexShrink: 0,
  },
  vicePill: {
    width: 42,
    height: 34,
    borderRadius: 999,
    background: "#38bdf8",
    color: "#082f49",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flexShrink: 0,
  },
  captainLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  captainFixture: {
    display: "block",
    marginTop: 2,
    color: "#cbd5e1",
    fontSize: 11,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  squadStrip: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "#0b1626",
    border: "1px solid rgba(255,255,255,.08)",
  },
  squadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  squadChip: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "8px 10px",
    borderRadius: 10,
    background: "#101b2d",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#ffffff",
    fontSize: 12,
  },
};
