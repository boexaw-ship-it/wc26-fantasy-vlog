import { mkdir, writeFile, readFile } from "node:fs/promises";

const FIFA_FANTASY_URL =
  process.env.FIFA_FANTASY_URL || "https://play.fifa.com/fantasy/es/fixtures";
const dataDir = new URL("../public/data/", import.meta.url);

// ─── FALLBACK PLAYERS (official WC2026 fantasy prices) ───────────────────────
// Update points field manually after each match week from FIFA Fantasy app
const FALLBACK_PLAYERS = [
  // GK
  { id:"courtois",    name:"Courtois",      fullName:"Thibaut Courtois",        team:"Belgium",     teamCode:"BEL", position:"GK",  price:6.5,  points:0, jerseyNumber:1,  nextFixture:"BEL v MAR" },
  { id:"alisson",     name:"Alisson",       fullName:"Alisson Becker",          team:"Brazil",      teamCode:"BRA", position:"GK",  price:6.0,  points:0, jerseyNumber:1,  nextFixture:"BRA v MEX" },
  { id:"ederson",     name:"Ederson",       fullName:"Ederson",                 team:"Brazil",      teamCode:"BRA", position:"GK",  price:5.5,  points:0, jerseyNumber:31, nextFixture:"BRA v MEX" },
  { id:"pickford",    name:"Pickford",      fullName:"Jordan Pickford",         team:"England",     teamCode:"ENG", position:"GK",  price:5.0,  points:0, jerseyNumber:1,  nextFixture:"ENG v CRO" },
  { id:"maignan",     name:"Maignan",       fullName:"Mike Maignan",            team:"France",      teamCode:"FRA", position:"GK",  price:5.5,  points:0, jerseyNumber:16, nextFixture:"FRA v SEN" },
  { id:"martinez_e",  name:"E. Martínez",   fullName:"Emiliano Martínez",       team:"Argentina",   teamCode:"ARG", position:"GK",  price:5.5,  points:0, jerseyNumber:23, nextFixture:"ARG v ALG" },
  { id:"ter_stegen",  name:"ter Stegen",    fullName:"Marc-André ter Stegen",   team:"Germany",     teamCode:"GER", position:"GK",  price:5.5,  points:0, jerseyNumber:1,  nextFixture:"GER v ITA" },
  { id:"diogo_costa", name:"D. Costa",      fullName:"Diogo Costa",             team:"Portugal",    teamCode:"POR", position:"GK",  price:5.5,  points:0, jerseyNumber:1,  nextFixture:"POR v COD" },
  { id:"unai_simon",  name:"Unai Simón",    fullName:"Unai Simón",              team:"Spain",       teamCode:"ESP", position:"GK",  price:5.0,  points:0, jerseyNumber:23, nextFixture:"ESP v CPV" },
  { id:"neuer",       name:"Neuer",         fullName:"Manuel Neuer",            team:"Germany",     teamCode:"GER", position:"GK",  price:5.0,  points:0, jerseyNumber:1,  nextFixture:"GER v ITA" },
  // DEF
  { id:"hakimi",      name:"Hakimi",        fullName:"Achraf Hakimi",           team:"Morocco",     teamCode:"MAR", position:"DEF", price:7.5,  points:0, jerseyNumber:2,  nextFixture:"MAR v BEL" },
  { id:"trent",       name:"Alexander-A.",  fullName:"Trent Alexander-Arnold",  team:"England",     teamCode:"ENG", position:"DEF", price:7.5,  points:0, jerseyNumber:66, nextFixture:"ENG v CRO" },
  { id:"ruben",       name:"R. Dias",       fullName:"Rúben Dias",              team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0,  points:0, jerseyNumber:4,  nextFixture:"POR v COD" },
  { id:"theo",        name:"Theo H.",       fullName:"Theo Hernández",          team:"France",      teamCode:"FRA", position:"DEF", price:7.0,  points:0, jerseyNumber:22, nextFixture:"FRA v SEN" },
  { id:"cancelo",     name:"Cancelo",       fullName:"João Cancelo",            team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0,  points:0, jerseyNumber:20, nextFixture:"POR v COD" },
  { id:"nuno_mendes", name:"Nuno M.",       fullName:"Nuno Mendes",             team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0,  points:0, jerseyNumber:19, nextFixture:"POR v COD" },
  { id:"kounde",      name:"Koundé",        fullName:"Jules Koundé",            team:"France",      teamCode:"FRA", position:"DEF", price:6.5,  points:0, jerseyNumber:5,  nextFixture:"FRA v SEN" },
  { id:"carvajal",    name:"Carvajal",      fullName:"Dani Carvajal",           team:"Spain",       teamCode:"ESP", position:"DEF", price:6.5,  points:0, jerseyNumber:2,  nextFixture:"ESP v CPV" },
  { id:"militao",     name:"Militão",       fullName:"Éder Militão",            team:"Brazil",      teamCode:"BRA", position:"DEF", price:6.5,  points:0, jerseyNumber:3,  nextFixture:"BRA v MEX" },
  { id:"romero",      name:"C. Romero",     fullName:"Cristian Romero",         team:"Argentina",   teamCode:"ARG", position:"DEF", price:6.5,  points:0, jerseyNumber:13, nextFixture:"ARG v ALG" },
  { id:"saliba",      name:"Saliba",        fullName:"William Saliba",          team:"France",      teamCode:"FRA", position:"DEF", price:6.5,  points:0, jerseyNumber:17, nextFixture:"FRA v SEN" },
  { id:"tah",         name:"Tah",           fullName:"Jonathan Tah",            team:"Germany",     teamCode:"GER", position:"DEF", price:6.0,  points:0, jerseyNumber:4,  nextFixture:"GER v ITA" },
  { id:"mazraoui",    name:"Mazraoui",      fullName:"Noussair Mazraoui",       team:"Morocco",     teamCode:"MAR", position:"DEF", price:6.0,  points:0, jerseyNumber:6,  nextFixture:"MAR v BEL" },
  { id:"laporte",     name:"Laporte",       fullName:"Aymeric Laporte",         team:"Spain",       teamCode:"ESP", position:"DEF", price:6.0,  points:0, jerseyNumber:14, nextFixture:"ESP v CPV" },
  { id:"guehi",       name:"Guehi",         fullName:"Marc Guéhi",              team:"England",     teamCode:"ENG", position:"DEF", price:5.5,  points:0, jerseyNumber:6,  nextFixture:"ENG v CRO" },
  { id:"wan_bissaka", name:"Wan-Bissaka",   fullName:"Aaron Wan-Bissaka",       team:"England",     teamCode:"ENG", position:"DEF", price:5.5,  points:0, jerseyNumber:2,  nextFixture:"ENG v CRO" },
  { id:"dani_alves",  name:"Doan",          fullName:"Doan",                    team:"Japan",       teamCode:"JPN", position:"DEF", price:5.5,  points:0, jerseyNumber:8,  nextFixture:"JPN v KOR" },
  // MID
  { id:"bellingham",  name:"Bellingham",    fullName:"Jude Bellingham",         team:"England",     teamCode:"ENG", position:"MID", price:9.5,  points:0, jerseyNumber:10, nextFixture:"ENG v CRO" },
  { id:"lamine",      name:"Lamine Y.",     fullName:"Lamine Yamal",            team:"Spain",       teamCode:"ESP", position:"MID", price:9.0,  points:0, jerseyNumber:19, nextFixture:"ESP v CPV" },
  { id:"debruyne",    name:"De Bruyne",     fullName:"Kevin De Bruyne",         team:"Belgium",     teamCode:"BEL", position:"MID", price:9.0,  points:0, jerseyNumber:7,  nextFixture:"BEL v MAR" },
  { id:"saka",        name:"Saka",          fullName:"Bukayo Saka",             team:"England",     teamCode:"ENG", position:"MID", price:8.5,  points:0, jerseyNumber:7,  nextFixture:"ENG v CRO" },
  { id:"musiala",     name:"Musiala",       fullName:"Jamal Musiala",           team:"Germany",     teamCode:"GER", position:"MID", price:8.5,  points:0, jerseyNumber:10, nextFixture:"GER v ITA" },
  { id:"pedri",       name:"Pedri",         fullName:"Pedri",                   team:"Spain",       teamCode:"ESP", position:"MID", price:8.5,  points:0, jerseyNumber:8,  nextFixture:"ESP v CPV" },
  { id:"rice",        name:"Rice",          fullName:"Declan Rice",             team:"England",     teamCode:"ENG", position:"MID", price:8.0,  points:0, jerseyNumber:4,  nextFixture:"ENG v CRO" },
  { id:"gavi",        name:"Gavi",          fullName:"Gavi",                    team:"Spain",       teamCode:"ESP", position:"MID", price:8.0,  points:0, jerseyNumber:9,  nextFixture:"ESP v CPV" },
  { id:"kroos",       name:"Kroos",         fullName:"Toni Kroos",              team:"Germany",     teamCode:"GER", position:"MID", price:8.0,  points:0, jerseyNumber:8,  nextFixture:"GER v ITA" },
  { id:"dejong",      name:"De Jong",       fullName:"Frenkie de Jong",         team:"Netherlands", teamCode:"NED", position:"MID", price:8.0,  points:0, jerseyNumber:7,  nextFixture:"NED v SEN" },
  { id:"valverde",    name:"Valverde",      fullName:"Federico Valverde",       team:"Uruguay",     teamCode:"URU", position:"MID", price:7.5,  points:0, jerseyNumber:8,  nextFixture:"URU v ECU" },
  { id:"tchouameni",  name:"Tchouaméni",    fullName:"Aurélien Tchouaméni",     team:"France",      teamCode:"FRA", position:"MID", price:7.5,  points:0, jerseyNumber:8,  nextFixture:"FRA v SEN" },
  { id:"mac_allister",name:"Mac Allister",  fullName:"Alexis Mac Allister",     team:"Argentina",   teamCode:"ARG", position:"MID", price:7.5,  points:0, jerseyNumber:20, nextFixture:"ARG v ALG" },
  { id:"camavinga",   name:"Camavinga",     fullName:"Eduardo Camavinga",       team:"France",      teamCode:"FRA", position:"MID", price:7.0,  points:0, jerseyNumber:29, nextFixture:"FRA v SEN" },
  { id:"modric",      name:"Modrić",        fullName:"Luka Modrić",             team:"Croatia",     teamCode:"CRO", position:"MID", price:7.0,  points:0, jerseyNumber:10, nextFixture:"CRO v ENG" },
  { id:"amrabat",     name:"Amrabat",       fullName:"Sofyan Amrabat",          team:"Morocco",     teamCode:"MAR", position:"MID", price:6.5,  points:0, jerseyNumber:4,  nextFixture:"MAR v BEL" },
  { id:"enzo",        name:"Enzo F.",       fullName:"Enzo Fernández",          team:"Argentina",   teamCode:"ARG", position:"MID", price:7.5,  points:0, jerseyNumber:24, nextFixture:"ARG v ALG" },
  { id:"caicedo",     name:"Caicedo",       fullName:"Moisés Caicedo",          team:"Ecuador",     teamCode:"ECU", position:"MID", price:7.0,  points:0, jerseyNumber:10, nextFixture:"ECU v URU" },
  { id:"ruben_neves", name:"R. Neves",      fullName:"Rúben Neves",             team:"Portugal",    teamCode:"POR", position:"MID", price:6.5,  points:0, jerseyNumber:15, nextFixture:"POR v COD" },
  // FWD
  { id:"mbappe",      name:"Mbappé",        fullName:"Kylian Mbappé",           team:"France",      teamCode:"FRA", position:"FWD", price:11.5, points:0, jerseyNumber:10, nextFixture:"FRA v SEN" },
  { id:"messi",       name:"Messi",         fullName:"Lionel Messi",            team:"Argentina",   teamCode:"ARG", position:"FWD", price:10.5, points:0, jerseyNumber:10, nextFixture:"ARG v ALG" },
  { id:"haaland",     name:"Haaland",       fullName:"Erling Haaland",          team:"Norway",      teamCode:"NOR", position:"FWD", price:11.0, points:0, jerseyNumber:9,  nextFixture:"NOR v IRQ" },
  { id:"vinicius",    name:"Vinícius Jr.",  fullName:"Vinicius Jr.",            team:"Brazil",      teamCode:"BRA", position:"FWD", price:10.0, points:0, jerseyNumber:7,  nextFixture:"BRA v MEX" },
  { id:"lautaro",     name:"L. Martínez",   fullName:"Lautaro Martínez",        team:"Argentina",   teamCode:"ARG", position:"FWD", price:9.0,  points:0, jerseyNumber:22, nextFixture:"ARG v ALG" },
  { id:"salah",       name:"Salah",         fullName:"Mohamed Salah",           team:"Egypt",       teamCode:"EGY", position:"FWD", price:9.0,  points:0, jerseyNumber:11, nextFixture:"EGY v TBD" },
  { id:"lewandowski", name:"Lewandowski",   fullName:"Robert Lewandowski",      team:"Poland",      teamCode:"POL", position:"FWD", price:9.0,  points:0, jerseyNumber:9,  nextFixture:"POL v NGA" },
  { id:"osimhen",     name:"Osimhen",       fullName:"Victor Osimhen",          team:"Nigeria",     teamCode:"NGA", position:"FWD", price:8.5,  points:0, jerseyNumber:9,  nextFixture:"NGA v POL" },
  { id:"alvarez",     name:"J. Álvarez",    fullName:"Julián Álvarez",          team:"Argentina",   teamCode:"ARG", position:"FWD", price:8.5,  points:0, jerseyNumber:9,  nextFixture:"ARG v ALG" },
  { id:"neymar",      name:"Neymar",        fullName:"Neymar Jr.",              team:"Brazil",      teamCode:"BRA", position:"FWD", price:8.5,  points:0, jerseyNumber:10, nextFixture:"BRA v MEX" },
  { id:"lukaku",      name:"Lukaku",        fullName:"Romelu Lukaku",           team:"Belgium",     teamCode:"BEL", position:"FWD", price:8.5,  points:0, jerseyNumber:9,  nextFixture:"BEL v MAR" },
  { id:"darwin",      name:"Núñez",         fullName:"Darwin Núñez",            team:"Uruguay",     teamCode:"URU", position:"FWD", price:8.5,  points:0, jerseyNumber:9,  nextFixture:"URU v ECU" },
  { id:"raphinha",    name:"Raphinha",      fullName:"Raphinha",                team:"Brazil",      teamCode:"BRA", position:"FWD", price:8.5,  points:0, jerseyNumber:11, nextFixture:"BRA v MEX" },
  { id:"havertz",     name:"Havertz",       fullName:"Kai Havertz",             team:"Germany",     teamCode:"GER", position:"FWD", price:8.0,  points:0, jerseyNumber:7,  nextFixture:"GER v ITA" },
  { id:"rafael_leao", name:"R. Leão",       fullName:"Rafael Leão",             team:"Portugal",    teamCode:"POR", position:"FWD", price:8.0,  points:0, jerseyNumber:11, nextFixture:"POR v COD" },
  { id:"felix",       name:"J. Félix",      fullName:"João Félix",              team:"Portugal",    teamCode:"POR", position:"FWD", price:8.0,  points:0, jerseyNumber:11, nextFixture:"POR v COD" },
  { id:"en_nesyri",   name:"En-Nesyri",     fullName:"Youssef En-Nesyri",       team:"Morocco",     teamCode:"MAR", position:"FWD", price:7.5,  points:0, jerseyNumber:19, nextFixture:"MAR v BEL" },
  { id:"diaz_col",    name:"L. Díaz",       fullName:"Luis Díaz",               team:"Colombia",    teamCode:"COL", position:"FWD", price:8.0,  points:0, jerseyNumber:7,  nextFixture:"COL v UZB" },
];

// ─── MONTH MAP ────────────────────────────────────────────────────────────────
const monthMap = new Map([
  ["january","01"],["february","02"],["march","03"],["april","04"],
  ["may","05"],["june","06"],["july","07"],["august","08"],
  ["september","09"],["october","10"],["november","11"],["december","12"],
  ["enero","01"],["febrero","02"],["marzo","03"],["abril","04"],
  ["mayo","05"],["junio","06"],["julio","07"],["agosto","08"],
  ["septiembre","09"],["octubre","10"],["noviembre","11"],["diciembre","12"],
]);

const teamNamesByCode = {
  ALG:"Algeria", ARG:"Argentina", AUS:"Australia", AUT:"Austria",
  BEL:"Belgium", BIH:"Bosnia and Herzegovina", BRA:"Brazil",
  CAN:"Canada", CIV:"Cote d'Ivoire", CMR:"Cameroon", COD:"Congo DR",
  COL:"Colombia", CPV:"Cape Verde", CRO:"Croatia", CUW:"Curacao",
  CZE:"Czechia", ECU:"Ecuador", EGY:"Egypt", ENG:"England",
  ESP:"Spain", FRA:"France", GER:"Germany", GHA:"Ghana",
  HAI:"Haiti", ITA:"Italy", IRN:"IR Iran", IRQ:"Iraq", JOR:"Jordan",
  JPN:"Japan", KOR:"Korea Republic", MAR:"Morocco", MEX:"Mexico",
  NED:"Netherlands", NOR:"Norway", NZL:"New Zealand", PAN:"Panama",
  PAR:"Paraguay", POR:"Portugal", QAT:"Qatar", KSA:"Saudi Arabia",
  SCO:"Scotland", SEN:"Senegal", RSA:"South Africa", SUI:"Switzerland",
  SWE:"Sweden", TUN:"Tunisia", TUR:"Turkiye", URU:"Uruguay",
  USA:"USA", UZB:"Uzbekistan", POL:"Poland", NGA:"Nigeria",
};

const codeByTeamName = new Map(
  Object.entries(teamNamesByCode).map(([code, name]) => [normalizeName(name), code])
);

function normalizeName(value) {
  return String(value||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function teamNameFromCode(code) {
  return teamNamesByCode[code] || code || "Unknown";
}

function codeFromTeamName(name) {
  return codeByTeamName.get(normalizeName(name)) || "";
}

function parseDate(line) {
  const match = String(line||"").toLowerCase().match(
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s+(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{4})/i
  );
  if (!match) return null;
  const day = match[1].padStart(2,"0");
  const cleanMonth = match[2].normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
  const month = monthMap.get(cleanMonth);
  return month ? `${match[3]}-${month}-${day}` : null;
}

function usefulLines(text) {
  return String(text||"").split(/\r?\n/).map(l=>l.replace(/\s+/g," ").trim()).filter(Boolean);
}

// ─── PARSE FIXTURES from scraped text ─────────────────────────────────────────
function parseFixtures(text) {
  const lines = usefulLines(text);
  const fixtures = [];
  let currentDate = "";
  let currentGroup = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsedDate = parseDate(line);
    if (parsedDate) { currentDate = parsedDate; continue; }

    const groupMatch = line.match(/^(?:group|grupo)\s+([A-L])$/i);
    if (groupMatch) { currentGroup = groupMatch[1].toUpperCase(); continue; }

    const timeMatch = lines[i+1]?.match(/^([0-2]?\d:[0-5]\d)$/);
    if (!currentDate || !timeMatch) continue;

    const homeTeam = line;
    const awayTeam = lines[i+2];
    if (!awayTeam) continue;
    if (/^(group|grupo)\s+[A-L]$/i.test(homeTeam)) continue;

    fixtures.push({
      id: `m${String(fixtures.length+1).padStart(3,"0")}`,
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
    i += 2;
  }

  // Add KO stages (static — FIFA site doesn't show them yet)
  const koStages = [
    { id:"r32a", stage:"Round of 32",  date:"2026-06-27", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r32b", stage:"Round of 32",  date:"2026-06-28", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r32c", stage:"Round of 32",  date:"2026-06-29", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r32d", stage:"Round of 32",  date:"2026-06-30", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r16a", stage:"Round of 16",  date:"2026-07-04", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r16b", stage:"Round of 16",  date:"2026-07-05", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r16c", stage:"Round of 16",  date:"2026-07-06", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"r16d", stage:"Round of 16",  date:"2026-07-07", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
    { id:"qf1",  stage:"Quarter-Final",date:"2026-07-10", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium",  status:"tbd" },
    { id:"qf2",  stage:"Quarter-Final",date:"2026-07-11", homeTeam:"TBD", awayTeam:"TBD", venue:"Rose Bowl",        status:"tbd" },
    { id:"qf3",  stage:"Quarter-Final",date:"2026-07-12", homeTeam:"TBD", awayTeam:"TBD", venue:"AT&T Stadium",     status:"tbd" },
    { id:"qf4",  stage:"Quarter-Final",date:"2026-07-13", homeTeam:"TBD", awayTeam:"TBD", venue:"SoFi Stadium",     status:"tbd" },
    { id:"sf1",  stage:"Semi-Final",   date:"2026-07-14", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium",  status:"tbd" },
    { id:"sf2",  stage:"Semi-Final",   date:"2026-07-15", homeTeam:"TBD", awayTeam:"TBD", venue:"Rose Bowl",        status:"tbd" },
    { id:"3rd",  stage:"3rd Place",    date:"2026-07-18", homeTeam:"TBD", awayTeam:"TBD", venue:"SoFi Stadium",     status:"tbd" },
    { id:"fin",  stage:"Final",        date:"2026-07-19", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium, New York", status:"tbd" },
  ];

  return [...fixtures, ...koStages];
}

function buildGroups(fixtures) {
  const groups = new Map();
  for (const fx of fixtures) {
    if (!fx.group) continue;
    if (!groups.has(fx.group)) groups.set(fx.group, new Map());
    const g = groups.get(fx.group);
    for (const [name, code] of [[fx.homeTeam, fx.homeTeamCode],[fx.awayTeam, fx.awayTeamCode]]) {
      if (!g.has(code||name)) g.set(code||name, { name, code, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 });
    }
  }
  return [...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([group,teams])=>({ group, teams:[...teams.values()] }));
}

// ─── MERGE scraped players with fallback (preserve points) ────────────────────
function mergePlayers(scraped, fallback, existing) {
  // Build points map from existing data
  const pointsMap = new Map(existing.map(p => [p.id, p.points || 0]));

  // Use fallback as base (has correct positions & prices for stars)
  const result = fallback.map(p => ({
    ...p,
    points: pointsMap.get(p.id) ?? p.points,
  }));

  // Add any scraped players NOT in fallback (new/unknown players)
  const fallbackIds = new Set(result.map(p => p.id));
  for (const sp of scraped) {
    if (!fallbackIds.has(sp.id)) {
      result.push({ ...sp, points: pointsMap.get(sp.id) ?? 0 });
    }
  }

  return result;
}

// ─── SCRAPE FIFA FIXTURES PAGE ─────────────────────────────────────────────────
async function renderFifaPage() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless:true, args:["--no-sandbox","--disable-setuid-sandbox"] });
  const page = await browser.newPage({
    viewport: { width:1440, height:2200 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  });

  await page.goto(FIFA_FANTASY_URL, { waitUntil:"domcontentloaded", timeout:120_000 });

  // Accept cookies if visible
  const buttons = page.getByRole("button");
  const count = await buttons.count().catch(()=>0);
  for (let i=0; i<count; i++) {
    const text = await buttons.nth(i).innerText().catch(()=>"");
    if (/accept|agree|aceptar|allow all|confirm/i.test(text)) {
      await buttons.nth(i).click().catch(()=>{});
      break;
    }
  }

  await page.waitForTimeout(8_000);

  // Scroll to load all fixtures
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let rounds = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 800);
        rounds++;
        if (rounds >= 20) { clearInterval(timer); resolve(); }
      }, 300);
    });
  });

  const text = await page.locator("body").innerText({ timeout:30_000 });
  await browser.close();
  return text;
}

async function readExistingJson(fileName, fallback) {
  try { return JSON.parse(await readFile(new URL(fileName, dataDir), "utf8")); }
  catch { return fallback; }
}

async function writeJson(fileName, value) {
  await writeFile(new URL(fileName, dataDir), `${JSON.stringify(value, null, 2)}\n`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
await mkdir(dataDir, { recursive:true });

const existingPlayers  = await readExistingJson("fifa-players.json",  []);
const existingFixtures = await readExistingJson("fifa-fixtures.json", []);

let renderedText = "";
let parsedFixtures = [];

try {
  renderedText = await renderFifaPage();
  await writeFile(new URL("fifa-debug.txt", dataDir), renderedText);
  parsedFixtures = parseFixtures(renderedText);
  console.log(`Scraped fixtures: ${parsedFixtures.filter(f=>f.stage==="Group Stage").length} group stage`);
} catch (err) {
  console.warn("Scrape failed, using existing fixtures:", err.message);
  parsedFixtures = existingFixtures.length >= 20 ? existingFixtures : [];
}

// Players: always use fallback + merge (scrape can't get full player list reliably)
const players  = mergePlayers([], FALLBACK_PLAYERS, existingPlayers);
const fixtures = parsedFixtures.length >= 20 ? parsedFixtures : existingFixtures;
const groups   = buildGroups(fixtures);
const teams    = groups.flatMap(g => g.teams.map(t => ({ ...t, group:g.group })));

const lastUpdated = {
  source: FIFA_FANTASY_URL,
  updatedAt: new Date().toISOString(),
  totalPlayers: players.length,
  totalFixtures: fixtures.length,
  totalGroups: groups.length,
  note: "Players: official WC2026 fantasy fallback list (update points manually after each match week). Fixtures: scraped from FIFA Fantasy site.",
};

await writeJson("fifa-players.json",  players);
await writeJson("fifa-fixtures.json", fixtures);
await writeJson("fifa-teams.json",    teams);
await writeJson("fifa-groups.json",   groups);
await writeJson("last-updated.json",  lastUpdated);

console.log(`✅ Done at ${lastUpdated.updatedAt}`);
console.log(`   Players : ${players.length} (GK:${players.filter(p=>p.position==="GK").length} DEF:${players.filter(p=>p.position==="DEF").length} MID:${players.filter(p=>p.position==="MID").length} FWD:${players.filter(p=>p.position==="FWD").length})`);
console.log(`   Fixtures: ${fixtures.length} (Group Stage: ${fixtures.filter(f=>f.stage==="Group Stage").length})`);
console.log(`   Groups  : ${groups.length}`);
