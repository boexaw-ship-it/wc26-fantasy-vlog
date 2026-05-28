import { mkdir, writeFile } from "node:fs/promises";

const dataDir = new URL("../public/data/", import.meta.url);

const players = [
  {
    id: "mbappe",
    name: "Kylian Mbappe",
    team: "France",
    teamCode: "FRA",
    position: "FWD",
    price: 11.5,
    points: 0,
    jerseyNumber: 10,
    nextFixture: "FRA vs TBD",
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    team: "England",
    teamCode: "ENG",
    position: "MID",
    price: 9.5,
    points: 0,
    jerseyNumber: 10,
    nextFixture: "ENG vs TBD",
  },
  {
    id: "vinicius",
    name: "Vinicius Junior",
    team: "Brazil",
    teamCode: "BRA",
    position: "FWD",
    price: 10,
    points: 0,
    jerseyNumber: 7,
    nextFixture: "BRA vs TBD",
  },
];

const fixtures = [
  {
    id: "match-001",
    stage: "Group Stage",
    date: "2026-06-11",
    time: "TBD",
    homeTeam: "TBD",
    awayTeam: "TBD",
    venue: "TBD",
    status: "scheduled",
  },
];

const teams = [
  { id: "france", name: "France", code: "FRA", group: "TBD" },
  { id: "england", name: "England", code: "ENG", group: "TBD" },
  { id: "brazil", name: "Brazil", code: "BRA", group: "TBD" },
];

const groups = [
  {
    group: "A",
    teams: [],
  },
];

const lastUpdated = {
  source: "FIFA Fantasy read-only cache",
  updatedAt: new Date().toISOString(),
  note: "Replace the mock data in scripts/update-fifa-data.js when a stable public FIFA data endpoint is available.",
};

async function writeJson(fileName, value) {
  await writeFile(new URL(fileName, dataDir), `${JSON.stringify(value, null, 2)}\n`);
}

await mkdir(dataDir, { recursive: true });
await writeJson("fifa-players.json", players);
await writeJson("fifa-fixtures.json", fixtures);
await writeJson("fifa-teams.json", teams);
await writeJson("fifa-groups.json", groups);
await writeJson("last-updated.json", lastUpdated);

console.log(`Updated fantasy cache at ${lastUpdated.updatedAt}`);