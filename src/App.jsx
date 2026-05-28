import { useEffect, useMemo, useState } from "react";
import "./App.css";

const tabs = ["Dashboard", "My Team", "Fixtures", "Players", "Vlog Mode"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [myTeam, setMyTeam] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [playersRes, fixturesRes, teamRes] = await Promise.all([
        fetch("./data/fifa-players.json"),
        fetch("./data/fifa-fixtures.json"),
        fetch("./data/my-team.json"),
      ]);

      setPlayers(await playersRes.json());
      setFixtures(await fixturesRes.json());
      setMyTeam(await teamRes.json());
    }

    loadData().catch(console.error);
  }, []);

  const selectedPlayers = useMemo(() => {
    if (!myTeam) return [];
    return myTeam.players
      .map((id) => players.find((player) => player.id === id))
      .filter(Boolean);
  }, [myTeam, players]);

  const totalCost = selectedPlayers.reduce(
    (sum, player) => sum + Number(player.price || 0),
    0
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">World Cup 2026</p>
          <h1>Fantasy Vlog</h1>
        </div>

        <nav>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeTab}</p>
            <h2>{myTeam?.teamName || "My WC26 Vlog XI"}</h2>
          </div>
          <div className="budget">
            <span>Budget</span>
            <strong>${totalCost.toFixed(1)}m / ${myTeam?.budget || 100}m</strong>
          </div>
        </header>

        {activeTab === "Dashboard" && (
          <Dashboard
            players={selectedPlayers}
            fixtures={fixtures}
            myTeam={myTeam}
            totalCost={totalCost}
          />
        )}

        {activeTab === "My Team" && (
          <MyTeam players={selectedPlayers} myTeam={myTeam} />
        )}

        {activeTab === "Fixtures" && <Fixtures fixtures={fixtures} />}

        {activeTab === "Players" && <Players players={players} />}

        {activeTab === "Vlog Mode" && (
          <VlogMode players={selectedPlayers} myTeam={myTeam} />
        )}
      </section>
    </main>
  );
}

function Dashboard({ players, fixtures, myTeam, totalCost }) {
  return (
    <div className="grid">
      <article className="panel highlight">
        <p className="eyebrow">Squad</p>
        <h3>{players.length} Players Selected</h3>
        <p>
          Formation {myTeam?.formation || "3-4-3"} with captain{" "}
          {myTeam?.captain || "not selected"}.
        </p>
      </article>

      <article className="panel">
        <p className="eyebrow">Budget Used</p>
        <h3>${totalCost.toFixed(1)}m</h3>
        <p>Cached FIFA Fantasy data will update from workflow later.</p>
      </article>

      <article className="panel">
        <p className="eyebrow">Fixtures</p>
        <h3>{fixtures.length} Matches</h3>
        <p>Fixture table is ready for YouTube screen recording.</p>
      </article>
    </div>
  );
}

function MyTeam({ players, myTeam }) {
  const positions = ["GK", "DEF", "MID", "FWD"];

  return (
    <div className="pitch">
      {positions.map((position) => {
        const rowPlayers = players.filter((player) => player.position === position);

        return (
          <div className="pitch-row" key={position}>
            <span className="position-label">{position}</span>
            <div className="player-row">
              {rowPlayers.length ? (
                rowPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    captain={myTeam?.captain === player.id}
                    viceCaptain={myTeam?.viceCaptain === player.id}
                  />
                ))
              ) : (
                <div className="empty-slot">No {position} selected</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Fixtures({ fixtures }) {
  return (
    <div className="table-panel">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Stage</th>
            <th>Match</th>
            <th>Venue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((fixture) => (
            <tr key={fixture.id}>
              <td>{fixture.date}</td>
              <td>{fixture.stage}</td>
              <td>
                {fixture.homeTeam} vs {fixture.awayTeam}
              </td>
              <td>{fixture.venue}</td>
              <td>{fixture.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Players({ players }) {
  return (
    <div className="cards">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}

function VlogMode({ players, myTeam }) {
  return (
    <div className="vlog-mode">
      <p className="eyebrow">Recording View</p>
      <h2>{myTeam?.teamName || "My WC26 Vlog XI"}</h2>
      <MyTeam players={players} myTeam={myTeam} />
    </div>
  );
}

function PlayerCard({ player, captain, viceCaptain }) {
  return (
    <article className="player-card">
      <div className="jersey">
        <span>{player.jerseyNumber || "-"}</span>
      </div>
      <div>
        <h4>
          {player.name}
          {captain && <b className="badge"> C</b>}
          {viceCaptain && <b className="badge"> VC</b>}
        </h4>
        <p>
          {player.teamCode} · {player.position} · ${player.price}m
        </p>
        <small>{player.nextFixture}</small>
      </div>
    </article>
  );
}
