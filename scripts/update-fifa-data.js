import { mkdir, writeFile, readFile } from "node:fs/promises";

const FIFA_FANTASY_URL =
  process.env.FIFA_FANTASY_URL || "https://play.fifa.com/fantasy/es/team";
const dataDir = new URL("../public/data/", import.meta.url);

const monthMap = new Map([
  ["january", "01"], ["february", "02"], ["march", "03"], ["april", "04"],
  ["may", "05"], ["june", "06"], ["july", "07"], ["august", "08"],
  ["september", "09"], ["october", "10"], ["november", "11"], ["december", "12"],
  ["enero", "01"], ["febrero", "02"], ["marzo", "03"], ["abril", "04"],
  ["mayo", "05"], ["junio", "06"], ["julio", "07"], ["agosto", "08"],
  ["septiembre", "09"], ["octubre", "10"], ["noviembre", "11"], ["diciembre", "12"],
]);

const positionMap = new Map([
  ["GK", "GK"], ["GKP", "GK"], ["POR", "GK"], ["ARQ", "GK"],
  ["DEF", "DEF"], ["DF", "DEF"],
  ["MID", "MID"], ["CEN", "MID"], ["MED", "MID"],
  ["FWD", "FWD"], ["DEL", "FWD"], ["ATT", "FWD"],
]);

const teamNamesByCode = {
  ALG: "Algeria", ARG: "Argentina", AUS: "Australia", AUT: "Austria",
  BEL: "Belgium", BIH: "Bosnia and Herzegovina", BRA: "Brazil",
  CAN: "Canada", CIV: "Cote d'Ivoire", CMR: "Cameroon", COD: "Congo DR",
  COL: "Colombia", CPV: "Cape Verde", CRO: "Croatia", CUW: "Curacao",
  CZE: "Czechia", ECU: "Ecuador", EGY: "Egypt", ENG: "England",
  ESP: "Spain", FRA: "France", GER: "Germany", GHA: "Ghana",
  HAI: "Haiti", IRN: "IR Iran", IRQ: "Iraq", JOR: "Jordan",
  JPN: "Japan", KOR: "Korea Republic", MAR: "Morocco", MEX: "Mexico",
  NED: "Netherlands", NOR: "Norway", NZL: "New Zealand", PAN: "Panama",
  PAR: "Paraguay", POR: "Portugal", QAT: "Qatar", KSA: "Saudi Arabia",
  SCO: "Scotland", SEN: "Senegal", RSA: "South Africa", SUI: "Switzerland",
  SWE: "Sweden", TUN: "Tunisia", TUR: "Turkiye", URU: "Uruguay",
  USA: "USA", UZB: "Uzbekistan",
};

const codeByTeamName = new Map(
  Object.entries(teamNamesByCode).map(([code, name]) => [normalizeName(name), code])
);

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function makeId(name, teamCode) {
  return `${normalizeName(name).replace(/\s+/g, "-")}-${String(teamCode || "unk").toLowerCase()}`;
}

function parsePrice(value) {
  const match = String(value || "").match(/\$?\s*([0-9]+(?:[.,][0-9]+)?)\s*m/i);
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function parseDate(line) {
  const match = String(line || "")
    .toLowerCase()
    .match(/(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{4})/i);

  if (!match) return null;

  const day = match[1].padStart(2, "0");
  const cleanMonth = match[2].normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const month = monthMap.get(cleanMonth);

  return month ? `${match[3]}-${month}-${day}` : null;
}

function normalizeTeamCode(code) {
  return String(code || "").toUpperCase();
}

function codeFromTeamName(name) {
  return codeByTeamName.get(normalizeName(name)) || "";
}

function teamNameFromCode(code) {
  return teamNamesByCode[code] || code || "Unknown";
}

async function renderFifaPage() {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  });

  await page.goto(FIFA_FANTASY_URL, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });

  await clickIfVisible(page, /accept|agree|aceptar|allow all|confirm|confirmar/i);
  await page.waitForTimeout(10_000);

  const allTexts = [];

  const positionTabs = [
    /^(GK|GKP|POR|ARQ|Goalkeepers?|Porteros?|Arqueros?)$/i,
    /^(DEF|DF|Defenders?|Defensas?)$/i,
    /^(MID|MED|CEN|Midfielders?|Centrocampistas?|Mediocampistas?)$/i,
    /^(FWD|DEL|ATT|Forwards?|Delanteros?|Atacantes?)$/i,
  ];

  for (const tabPattern of positionTabs) {
    await clickMatchingButton(page, tabPattern);
    await page.waitForTimeout(3_000);
    await autoScroll(page);

    const text = await page.locator("body").innerText({ timeout: 30_000 });
    allTexts.push(text);
  }

  if (allTexts.length === 0) {
    allTexts.push(await page.locator("body").innerText({ timeout: 30_000 }));
  }

  await browser.close();

  return allTexts.join("\n\n--- POSITION BREAK ---\n\n");
}

async function clickIfVisible(page, labelPattern) {
  const buttons = page.getByRole("button");
  const count = await buttons.count().catch(() => 0);

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const text = await button.innerText().catch(() => "");
    if (labelPattern.test(text)) {
      await button.click().catch(() => {});
      return true;
    }
  }

  return false;
}

async function clickMatchingButton(page, labelPattern) {
  const buttons = page.getByRole("button");
  const count = await buttons.count().catch(() => 0);

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const text = (await button.innerText().catch(() => "")).trim();

    if (labelPattern.test(text)) {
      await button.click().catch(() => {});
      return true;
    }
  }

  return false;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let rounds = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 700);

        document.querySelectorAll("*").forEach((el) => {
          if (el.scrollHeight > el.clientHeight + 200) {
            el.scrollTop += 700;
          }
        });

        rounds += 1;

        if (rounds >= 16) {
          clearInterval(timer);
          resolve();
        }
      }, 250);
    });
  });
}

function parsePlayers(text) {
  const lines = usefulLines(text);
  const players = [];
  const seen = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const name = lines[index];
    const detail = lines[index + 1] || "";
    const priceLine = lines[index + 2] || "";

    const detailMatch = detail.match(
      /^([A-ZÁÉÍÓÚÑ]{2,4})\s*\|\s*([A-Z]{2,4})\s+v\s+([A-Z]{2,4})\s*\|\s*\$?([0-9]+(?:[.,][0-9]+)?)m$/i
    );

    if (!detailMatch || !/\$?[0-9]+(?:[.,][0-9]+)?m/i.test(priceLine)) {
      continue;
    }

    const position = positionMap.get(detailMatch[1].toUpperCase()) || "MID";
    const homeCode = normalizeTeamCode(detailMatch[2]);
    const awayCode = normalizeTeamCode(detailMatch[3]);
    const price = parsePrice(priceLine);
    const teamCode = inferPlayerTeamCode(name, homeCode, awayCode);
    const id = makeId(name, teamCode);

    if (seen.has(id)) continue;
    seen.add(id);

    players.push({
      id,
      name,
      fullName: name,
      team: teamNameFromCode(teamCode),
      teamCode,
      position,
      price,
      points: 0,
      jerseyNumber: "",
      nextFixture: `${homeCode} v ${awayCode}`,
    });
  }

  return players;
}

function inferPlayerTeamCode(name, homeCode, awayCode) {
  const normalizedName = normalizeName(name);
  const homeName = normalizeName(teamNameFromCode(homeCode));
  const awayName = normalizeName(teamNameFromCode(awayCode));

  if (normalizedName.includes(homeName)) return homeCode;
  if (normalizedName.includes(awayName)) return awayCode;

  return [homeCode, awayCode].find((code) => teamNamesByCode[code]) || homeCode || awayCode || "UNK";
}

function parseFixtures(text) {
  const lines = usefulLines(text);
  const fixtures = [];
  let currentDate = "";
  let currentGroup = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const parsedDate = parseDate(line);

    if (parsedDate) {
      currentDate = parsedDate;
      continue;
    }

    const groupMatch = line.match(/^(?:group|grupo)\s+([A-L])$/i);
    if (groupMatch) {
      currentGroup = groupMatch[1].toUpperCase();
      continue;
    }

    const timeMatch = lines[index + 1]?.match(/^([0-2]?\d:[0-5]\d)$/);
    if (!currentDate || !timeMatch) continue;

    const homeTeam = line;
    const awayTeam = lines[index + 2];

    if (!awayTeam || isIgnoredLine(homeTeam) || isIgnoredLine(awayTeam)) continue;
    if (/^(group|grupo)\s+[A-L]$/i.test(homeTeam)) continue;
    if (/^\*+$/.test(awayTeam)) continue;

    fixtures.push({
      id: `m${String(fixtures.length + 1).padStart(3, "0")}`,
      stage: "Group Stage",
      group: currentGroup,
      date: currentDate,
      time: timeMatch[1],
      homeTeam,
      awayTeam,
      homeTeamCode: codeFromTeamName(homeTeam),
      awayTeamCode: codeFromTeamName(awayTeam),
      venue: "TBD",
      status: "scheduled",
    });

    index += 2;
  }

  return fixtures;
}

function buildGroups(fixtures) {
  const groups = new Map();

  for (const fixture of fixtures) {
    if (!fixture.group) continue;
    if (!groups.has(fixture.group)) groups.set(fixture.group, new Map());

    const group = groups.get(fixture.group);

    for (const [name, code] of [
      [fixture.homeTeam, fixture.homeTeamCode],
      [fixture.awayTeam, fixture.awayTeamCode],
    ]) {
      if (!group.has(code || name)) {
        group.set(code || name, {
          name,
          code,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          pts: 0,
        });
      }
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teams]) => ({
      group,
      teams: [...teams.values()],
    }));
}

function usefulLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !isIgnoredLine(line));
}

function isIgnoredLine(line) {
  return /^(image|powered by|sponsored by|budget|presupuesto|selected|seleccionado|acción|action|jugador|player|precio|price|play now|jugar|ver tutorial|download|copyright|privacy|terms|\* \* \*)$/i.test(
    line
  );
}

async function readExistingJson(fileName, fallbackValue) {
  try {
    const text = await readFile(new URL(fileName, dataDir), "utf8");
    return JSON.parse(text);
  } catch {
    return fallbackValue;
  }
}

async function writeJson(fileName, value) {
  await writeFile(new URL(fileName, dataDir), `${JSON.stringify(value, null, 2)}\n`);
}

await mkdir(dataDir, { recursive: true });

const renderedText = await renderFifaPage();
await writeFile(new URL("fifa-debug.txt", dataDir), renderedText);

const parsedPlayers = parsePlayers(renderedText);
const parsedFixtures = parseFixtures(renderedText);

const oldPlayers = await readExistingJson("fifa-players.json", []);
const oldFixtures = await readExistingJson("fifa-fixtures.json", []);

const players = parsedPlayers.length >= 20 ? parsedPlayers : oldPlayers;
const fixtures = parsedFixtures.length >= 20 ? parsedFixtures : oldFixtures;
const groups = buildGroups(fixtures);
const teams = groups.flatMap((group) =>
  group.teams.map((team) => ({ ...team, group: group.group }))
);

if (parsedPlayers.length < 20 || parsedFixtures.length < 20) {
  console.warn(
    `Parse warning: players=${parsedPlayers.length}, fixtures=${parsedFixtures.length}. Kept previous JSON where parsing was incomplete. Check public/data/fifa-debug.txt`
  );
}

const lastUpdated = {
  source: FIFA_FANTASY_URL,
  updatedAt: new Date().toISOString(),
  parsedPlayers: parsedPlayers.length,
  parsedFixtures: parsedFixtures.length,
  totalPlayers: players.length,
  totalFixtures: fixtures.length,
  totalGroups: groups.length,
  note: "Official FIFA Fantasy page rendered with Playwright. Debug text is saved to fifa-debug.txt.",
};

await writeJson("fifa-players.json", players);
await writeJson("fifa-fixtures.json", fixtures);
await writeJson("fifa-teams.json", teams);
await writeJson("fifa-groups.json", groups);
await writeJson("last-updated.json", lastUpdated);

console.log(`Updated FIFA fantasy cache at ${lastUpdated.updatedAt}`);
console.log(`Parsed players : ${parsedPlayers.length}`);
console.log(`Parsed fixtures: ${parsedFixtures.length}`);
console.log(`Saved players  : ${players.length}`);
console.log(`Saved fixtures : ${fixtures.length}`);
console.log("Debug text written to public/data/fifa-debug.txt");
