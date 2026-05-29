import { mkdir, writeFile } from "node:fs/promises";

const dataDir = new URL("../public/data/", import.meta.url);

// ─── WC 2026 PLAYERS ──────────────────────────────────────────────────────────
const players = [
  // ── GOALKEEPERS ──
  { id:"courtois",   name:"T. Courtois",      fullName:"Thibaut Courtois",       team:"Belgium",     teamCode:"BEL", position:"GK",  price:6.0, points:0, jerseyNumber:1,  nextFixture:"BEL vs MAR" },
  { id:"alisson",    name:"Alisson",           fullName:"Alisson Becker",          team:"Brazil",      teamCode:"BRA", position:"GK",  price:6.0, points:0, jerseyNumber:1,  nextFixture:"BRA vs MEX" },
  { id:"ederson",    name:"Ederson",           fullName:"Ederson",                 team:"Brazil",      teamCode:"BRA", position:"GK",  price:5.5, points:0, jerseyNumber:31, nextFixture:"BRA vs MEX" },
  { id:"pickford",   name:"Pickford",          fullName:"Jordan Pickford",         team:"England",     teamCode:"ENG", position:"GK",  price:5.0, points:0, jerseyNumber:1,  nextFixture:"ENG vs TUN" },
  { id:"maignan",    name:"Maignan",           fullName:"Mike Maignan",            team:"France",      teamCode:"FRA", position:"GK",  price:5.5, points:0, jerseyNumber:16, nextFixture:"FRA vs ARG" },
  { id:"oblak",      name:"Oblak",             fullName:"Jan Oblak",               team:"Slovenia",    teamCode:"SVN", position:"GK",  price:5.0, points:0, jerseyNumber:1,  nextFixture:"SVN vs TBD" },
  { id:"martinez_e", name:"E. Martínez",       fullName:"Emiliano Martínez",       team:"Argentina",   teamCode:"ARG", position:"GK",  price:5.5, points:0, jerseyNumber:23, nextFixture:"ARG vs FRA" },
  { id:"ter_stegen", name:"ter Stegen",        fullName:"Marc-André ter Stegen",   team:"Germany",     teamCode:"GER", position:"GK",  price:5.5, points:0, jerseyNumber:1,  nextFixture:"GER vs ESP" },
  { id:"diogo_costa",name:"D. Costa",          fullName:"Diogo Costa",             team:"Portugal",    teamCode:"POR", position:"GK",  price:5.5, points:0, jerseyNumber:1,  nextFixture:"POR vs MAR" },
  { id:"lloris",     name:"Lloris",            fullName:"Hugo Lloris",             team:"France",      teamCode:"FRA", position:"GK",  price:5.0, points:0, jerseyNumber:1,  nextFixture:"FRA vs ARG" },

  // ── DEFENDERS ──
  { id:"ruben",      name:"R. Dias",           fullName:"Rúben Dias",              team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0, points:0, jerseyNumber:4,  nextFixture:"POR vs MAR" },
  { id:"hakimi",     name:"Hakimi",            fullName:"Achraf Hakimi",           team:"Morocco",     teamCode:"MAR", position:"DEF", price:7.5, points:0, jerseyNumber:2,  nextFixture:"MAR vs POR" },
  { id:"cancelo",    name:"Cancelo",           fullName:"João Cancelo",            team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0, points:0, jerseyNumber:20, nextFixture:"POR vs MAR" },
  { id:"militao",    name:"Militão",           fullName:"Éder Militão",            team:"Brazil",      teamCode:"BRA", position:"DEF", price:6.5, points:0, jerseyNumber:3,  nextFixture:"BRA vs MEX" },
  { id:"kounde",     name:"Koundé",            fullName:"Jules Koundé",            team:"France",      teamCode:"FRA", position:"DEF", price:6.5, points:0, jerseyNumber:5,  nextFixture:"FRA vs ARG" },
  { id:"trent",      name:"Alexander-A.",      fullName:"Trent Alexander-Arnold",  team:"England",     teamCode:"ENG", position:"DEF", price:7.5, points:0, jerseyNumber:66, nextFixture:"ENG vs TUN" },
  { id:"dani_carvajal",name:"Carvajal",        fullName:"Dani Carvajal",           team:"Spain",       teamCode:"ESP", position:"DEF", price:6.5, points:0, jerseyNumber:2,  nextFixture:"ESP vs GER" },
  { id:"theo",       name:"Theo H.",           fullName:"Theo Hernández",          team:"France",      teamCode:"FRA", position:"DEF", price:7.0, points:0, jerseyNumber:22, nextFixture:"FRA vs ARG" },
  { id:"tah",        name:"Tah",               fullName:"Jonathan Tah",            team:"Germany",     teamCode:"GER", position:"DEF", price:6.0, points:0, jerseyNumber:4,  nextFixture:"GER vs ESP" },
  { id:"acuna",      name:"Acuña",             fullName:"Marcos Acuña",            team:"Argentina",   teamCode:"ARG", position:"DEF", price:6.0, points:0, jerseyNumber:8,  nextFixture:"ARG vs FRA" },
  { id:"romero",     name:"C. Romero",         fullName:"Cristian Romero",         team:"Argentina",   teamCode:"ARG", position:"DEF", price:6.5, points:0, jerseyNumber:13, nextFixture:"ARG vs FRA" },
  { id:"saliba",     name:"Saliba",            fullName:"William Saliba",          team:"France",      teamCode:"FRA", position:"DEF", price:6.5, points:0, jerseyNumber:17, nextFixture:"FRA vs ARG" },
  { id:"guehi",      name:"Guehi",             fullName:"Marc Guéhi",              team:"England",     teamCode:"ENG", position:"DEF", price:5.5, points:0, jerseyNumber:6,  nextFixture:"ENG vs TUN" },
  { id:"mendy",      name:"Mendy",             fullName:"Ferland Mendy",           team:"France",      teamCode:"FRA", position:"DEF", price:6.0, points:0, jerseyNumber:23, nextFixture:"FRA vs ARG" },
  { id:"laporte",    name:"Laporte",           fullName:"Aymeric Laporte",         team:"Spain",       teamCode:"ESP", position:"DEF", price:6.0, points:0, jerseyNumber:14, nextFixture:"ESP vs GER" },
  { id:"nuno_mendes",name:"Nuno M.",           fullName:"Nuno Mendes",             team:"Portugal",    teamCode:"POR", position:"DEF", price:7.0, points:0, jerseyNumber:19, nextFixture:"POR vs MAR" },
  { id:"mazraoui",   name:"Mazraoui",          fullName:"Noussair Mazraoui",       team:"Morocco",     teamCode:"MAR", position:"DEF", price:6.0, points:0, jerseyNumber:6,  nextFixture:"MAR vs POR" },
  { id:"jesus_vallejo",name:"Vallejo",         fullName:"Jesús Vallejo",           team:"Spain",       teamCode:"ESP", position:"DEF", price:5.0, points:0, jerseyNumber:16, nextFixture:"ESP vs GER" },
  { id:"wan_bissaka",name:"Wan-Bissaka",       fullName:"Aaron Wan-Bissaka",       team:"England",     teamCode:"ENG", position:"DEF", price:5.5, points:0, jerseyNumber:2,  nextFixture:"ENG vs TUN" },
  { id:"ogwuche",    name:"Troost-Ekong",      fullName:"William Troost-Ekong",    team:"Nigeria",     teamCode:"NGA", position:"DEF", price:5.5, points:0, jerseyNumber:5,  nextFixture:"NGA vs TBD" },

  // ── MIDFIELDERS ──
  { id:"bellingham", name:"Bellingham",        fullName:"Jude Bellingham",         team:"England",     teamCode:"ENG", position:"MID", price:9.5, points:0, jerseyNumber:10, nextFixture:"ENG vs TUN" },
  { id:"pedri",      name:"Pedri",             fullName:"Pedri",                   team:"Spain",       teamCode:"ESP", position:"MID", price:8.5, points:0, jerseyNumber:8,  nextFixture:"ESP vs GER" },
  { id:"dejong",     name:"De Jong",           fullName:"Frenkie de Jong",         team:"Netherlands", teamCode:"NED", position:"MID", price:8.0, points:0, jerseyNumber:7,  nextFixture:"NED vs SEN" },
  { id:"valverde",   name:"Valverde",          fullName:"Federico Valverde",       team:"Uruguay",     teamCode:"URU", position:"MID", price:7.5, points:0, jerseyNumber:8,  nextFixture:"URU vs TBD" },
  { id:"modric",     name:"Modrić",            fullName:"Luka Modrić",             teamCode:"CRO",     team:"Croatia", position:"MID", price:7.0, points:0, jerseyNumber:10, nextFixture:"CRO vs TBD" },
  { id:"camavinga",  name:"Camavinga",         fullName:"Eduardo Camavinga",       team:"France",      teamCode:"FRA", position:"MID", price:7.0, points:0, jerseyNumber:29, nextFixture:"FRA vs ARG" },
  { id:"tchouameni", name:"Tchouaméni",        fullName:"Aurélien Tchouaméni",     team:"France",      teamCode:"FRA", position:"MID", price:7.5, points:0, jerseyNumber:8,  nextFixture:"FRA vs ARG" },
  { id:"gavi",       name:"Gavi",              fullName:"Gavi",                    team:"Spain",       teamCode:"ESP", position:"MID", price:8.0, points:0, jerseyNumber:9,  nextFixture:"ESP vs GER" },
  { id:"kroos",      name:"Kroos",             fullName:"Toni Kroos",              team:"Germany",     teamCode:"GER", position:"MID", price:8.0, points:0, jerseyNumber:8,  nextFixture:"GER vs ESP" },
  { id:"musiala",    name:"Musiala",           fullName:"Jamal Musiala",           team:"Germany",     teamCode:"GER", position:"MID", price:8.5, points:0, jerseyNumber:10, nextFixture:"GER vs ESP" },
  { id:"lamine",     name:"Lamine Y.",         fullName:"Lamine Yamal",            team:"Spain",       teamCode:"ESP", position:"MID", price:9.0, points:0, jerseyNumber:19, nextFixture:"ESP vs GER" },
  { id:"rice",       name:"Rice",              fullName:"Declan Rice",             team:"England",     teamCode:"ENG", position:"MID", price:8.0, points:0, jerseyNumber:4,  nextFixture:"ENG vs TUN" },
  { id:"mac_allister",name:"Mac Allister",     fullName:"Alexis Mac Allister",     team:"Argentina",   teamCode:"ARG", position:"MID", price:7.5, points:0, jerseyNumber:20, nextFixture:"ARG vs FRA" },
  { id:"debruyne",   name:"De Bruyne",         fullName:"Kevin De Bruyne",         team:"Belgium",     teamCode:"BEL", position:"MID", price:9.0, points:0, jerseyNumber:7,  nextFixture:"BEL vs MAR" },
  { id:"saka",       name:"Saka",              fullName:"Bukayo Saka",             team:"England",     teamCode:"ENG", position:"MID", price:8.5, points:0, jerseyNumber:7,  nextFixture:"ENG vs TUN" },
  { id:"enzo",       name:"Enzo F.",           fullName:"Enzo Fernández",          team:"Argentina",   teamCode:"ARG", position:"MID", price:7.5, points:0, jerseyNumber:24, nextFixture:"ARG vs FRA" },
  { id:"zielinski",  name:"Zieliński",         fullName:"Piotr Zieliński",         team:"Poland",      teamCode:"POL", position:"MID", price:6.5, points:0, jerseyNumber:10, nextFixture:"POL vs TBD" },
  { id:"caicedo",    name:"Caicedo",           fullName:"Moisés Caicedo",          team:"Ecuador",     teamCode:"ECU", position:"MID", price:7.0, points:0, jerseyNumber:10, nextFixture:"ECU vs TBD" },
  { id:"amrabat",    name:"Amrabat",           fullName:"Sofyan Amrabat",          team:"Morocco",     teamCode:"MAR", position:"MID", price:6.5, points:0, jerseyNumber:4,  nextFixture:"MAR vs POR" },
  { id:"sabitzer",   name:"Sabitzer",          fullName:"Marcel Sabitzer",         team:"Austria",     teamCode:"AUT", position:"MID", price:6.5, points:0, jerseyNumber:8,  nextFixture:"AUT vs TBD" },

  // ── FORWARDS ──
  { id:"mbappe",     name:"Mbappé",            fullName:"Kylian Mbappé",           team:"France",      teamCode:"FRA", position:"FWD", price:11.5,points:0, jerseyNumber:10, nextFixture:"FRA vs ARG" },
  { id:"messi",      name:"Messi",             fullName:"Lionel Messi",            team:"Argentina",   teamCode:"ARG", position:"FWD", price:10.5,points:0, jerseyNumber:10, nextFixture:"ARG vs FRA" },
  { id:"vinicius",   name:"Vinícius Jr.",      fullName:"Vinicius Jr.",            team:"Brazil",      teamCode:"BRA", position:"FWD", price:10.0,points:0, jerseyNumber:7,  nextFixture:"BRA vs MEX" },
  { id:"haaland",    name:"Haaland",           fullName:"Erling Haaland",          team:"Norway",      teamCode:"NOR", position:"FWD", price:11.0,points:0, jerseyNumber:9,  nextFixture:"NOR vs TBD" },
  { id:"salah",      name:"Salah",             fullName:"Mohamed Salah",           team:"Egypt",       teamCode:"EGY", position:"FWD", price:9.0, points:0, jerseyNumber:11, nextFixture:"EGY vs TBD" },
  { id:"osimhen",    name:"Osimhen",           fullName:"Victor Osimhen",          team:"Nigeria",     teamCode:"NGA", position:"FWD", price:8.5, points:0, jerseyNumber:9,  nextFixture:"NGA vs TBD" },
  { id:"lewandowski",name:"Lewandowski",       fullName:"Robert Lewandowski",      team:"Poland",      teamCode:"POL", position:"FWD", price:9.0, points:0, jerseyNumber:9,  nextFixture:"POL vs TBD" },
  { id:"alvarez",    name:"J. Álvarez",        fullName:"Julián Álvarez",          team:"Argentina",   teamCode:"ARG", position:"FWD", price:8.5, points:0, jerseyNumber:9,  nextFixture:"ARG vs FRA" },
  { id:"raphinha",   name:"Raphinha",          fullName:"Raphinha",                team:"Brazil",      teamCode:"BRA", position:"FWD", price:8.5, points:0, jerseyNumber:11, nextFixture:"BRA vs MEX" },
  { id:"neymar",     name:"Neymar",            fullName:"Neymar Jr.",              team:"Brazil",      teamCode:"BRA", position:"FWD", price:9.0, points:0, jerseyNumber:10, nextFixture:"BRA vs MEX" },
  { id:"firmino",    name:"Firmino",           fullName:"Roberto Firmino",         team:"Brazil",      teamCode:"BRA", position:"FWD", price:7.5, points:0, jerseyNumber:20, nextFixture:"BRA vs MEX" },
  { id:"lukaku",     name:"Lukaku",            fullName:"Romelu Lukaku",           team:"Belgium",     teamCode:"BEL", position:"FWD", price:8.5, points:0, jerseyNumber:9,  nextFixture:"BEL vs MAR" },
  { id:"rafael_leao",name:"R. Leão",           fullName:"Rafael Leão",             team:"Portugal",    teamCode:"POR", position:"FWD", price:8.0, points:0, jerseyNumber:11, nextFixture:"POR vs MAR" },
  { id:"havertz",    name:"Havertz",           fullName:"Kai Havertz",             team:"Germany",     teamCode:"GER", position:"FWD", price:8.0, points:0, jerseyNumber:7,  nextFixture:"GER vs ESP" },
  { id:"en_nesyri",  name:"En-Nesyri",         fullName:"Youssef En-Nesyri",       team:"Morocco",     teamCode:"MAR", position:"FWD", price:7.5, points:0, jerseyNumber:19, nextFixture:"MAR vs POR" },
  { id:"felix",      name:"J. Félix",          fullName:"João Félix",              team:"Portugal",    teamCode:"POR", position:"FWD", price:8.0, points:0, jerseyNumber:11, nextFixture:"POR vs MAR" },
  { id:"darwin",     name:"Núñez",             fullName:"Darwin Núñez",            team:"Uruguay",     teamCode:"URU", position:"FWD", price:8.5, points:0, jerseyNumber:9,  nextFixture:"URU vs TBD" },
  { id:"diallo",     name:"Diallo",            fullName:"Lamine Diallo",           team:"Senegal",     teamCode:"SEN", position:"FWD", price:7.0, points:0, jerseyNumber:11, nextFixture:"SEN vs NED" },
  { id:"lautaro",    name:"L. Martínez",       fullName:"Lautaro Martínez",        team:"Argentina",   teamCode:"ARG", position:"FWD", price:9.0, points:0, jerseyNumber:22, nextFixture:"ARG vs FRA" },
  { id:"diaz_col",   name:"L. Díaz",           fullName:"Luis Díaz",               team:"Colombia",    teamCode:"COL", position:"FWD", price:8.0, points:0, jerseyNumber:7,  nextFixture:"COL vs TBD" },
];

// ─── WC 2026 FIXTURES ─────────────────────────────────────────────────────────
const fixtures = [
  // Group Stage - June
  { id:"m001", stage:"Group Stage", group:"A", date:"2026-06-11", time:"19:00", homeTeam:"Mexico",      awayTeam:"USA",         venue:"SoFi Stadium, Los Angeles",      status:"scheduled" },
  { id:"m002", stage:"Group Stage", group:"A", date:"2026-06-12", time:"13:00", homeTeam:"Canada",      awayTeam:"Morocco",     venue:"BMO Field, Toronto",             status:"scheduled" },
  { id:"m003", stage:"Group Stage", group:"B", date:"2026-06-12", time:"16:00", homeTeam:"France",      awayTeam:"Argentina",   venue:"MetLife Stadium, New York",      status:"scheduled" },
  { id:"m004", stage:"Group Stage", group:"B", date:"2026-06-13", time:"13:00", homeTeam:"England",     awayTeam:"Tunisia",     venue:"AT&T Stadium, Dallas",           status:"scheduled" },
  { id:"m005", stage:"Group Stage", group:"C", date:"2026-06-13", time:"16:00", homeTeam:"Brazil",      awayTeam:"Mexico",      venue:"Estadio Azteca, Mexico City",    status:"scheduled" },
  { id:"m006", stage:"Group Stage", group:"C", date:"2026-06-14", time:"13:00", homeTeam:"Spain",       awayTeam:"Germany",     venue:"Rose Bowl, Los Angeles",         status:"scheduled" },
  { id:"m007", stage:"Group Stage", group:"D", date:"2026-06-14", time:"16:00", homeTeam:"Portugal",    awayTeam:"Morocco",     venue:"Lincoln Financial, Philadelphia", status:"scheduled" },
  { id:"m008", stage:"Group Stage", group:"D", date:"2026-06-15", time:"13:00", homeTeam:"Belgium",     awayTeam:"Croatia",     venue:"Lumen Field, Seattle",           status:"scheduled" },
  { id:"m009", stage:"Group Stage", group:"E", date:"2026-06-15", time:"16:00", homeTeam:"Netherlands", awayTeam:"Senegal",     venue:"Gillette Stadium, Boston",       status:"scheduled" },
  { id:"m010", stage:"Group Stage", group:"E", date:"2026-06-16", time:"13:00", homeTeam:"Uruguay",     awayTeam:"Ecuador",     venue:"Hard Rock Stadium, Miami",       status:"scheduled" },
  { id:"m011", stage:"Group Stage", group:"F", date:"2026-06-16", time:"16:00", homeTeam:"Nigeria",     awayTeam:"Poland",      venue:"Estadio BBVA, Monterrey",        status:"scheduled" },
  { id:"m012", stage:"Group Stage", group:"F", date:"2026-06-17", time:"13:00", homeTeam:"Japan",       awayTeam:"South Korea", venue:"Empower Field, Denver",          status:"scheduled" },
  { id:"m013", stage:"Group Stage", group:"G", date:"2026-06-17", time:"16:00", homeTeam:"Colombia",    awayTeam:"Saudi Arabia",venue:"NRG Stadium, Houston",           status:"scheduled" },
  { id:"m014", stage:"Group Stage", group:"H", date:"2026-06-18", time:"13:00", homeTeam:"Australia",   awayTeam:"Iran",        venue:"BC Place, Vancouver",            status:"scheduled" },
  { id:"m015", stage:"Group Stage", group:"A", date:"2026-06-19", time:"16:00", homeTeam:"USA",         awayTeam:"Morocco",     venue:"MetLife Stadium, New York",      status:"scheduled" },
  { id:"m016", stage:"Group Stage", group:"A", date:"2026-06-20", time:"13:00", homeTeam:"Canada",      awayTeam:"Mexico",      venue:"Rogers Centre, Toronto",         status:"scheduled" },
  { id:"m017", stage:"Group Stage", group:"B", date:"2026-06-20", time:"16:00", homeTeam:"Argentina",   awayTeam:"Tunisia",     venue:"SoFi Stadium, Los Angeles",      status:"scheduled" },
  { id:"m018", stage:"Group Stage", group:"B", date:"2026-06-21", time:"13:00", homeTeam:"France",      awayTeam:"England",     venue:"AT&T Stadium, Dallas",           status:"scheduled" },
  { id:"m019", stage:"Group Stage", group:"C", date:"2026-06-21", time:"16:00", homeTeam:"Germany",     awayTeam:"Brazil",      venue:"MetLife Stadium, New York",      status:"scheduled" },
  { id:"m020", stage:"Group Stage", group:"C", date:"2026-06-22", time:"13:00", homeTeam:"Spain",       awayTeam:"Mexico",      venue:"Rose Bowl, Los Angeles",         status:"scheduled" },
  // Round of 32
  { id:"r32a", stage:"Round of 32", date:"2026-06-27", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
  { id:"r32b", stage:"Round of 32", date:"2026-06-28", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
  { id:"r32c", stage:"Round of 32", date:"2026-06-29", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
  // Round of 16
  { id:"r16a", stage:"Round of 16", date:"2026-07-04", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
  { id:"r16b", stage:"Round of 16", date:"2026-07-05", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"TBD", status:"tbd" },
  // Quarter Finals
  { id:"qf1",  stage:"Quarter-Final", date:"2026-07-10", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium", status:"tbd" },
  { id:"qf2",  stage:"Quarter-Final", date:"2026-07-11", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"Rose Bowl",       status:"tbd" },
  { id:"qf3",  stage:"Quarter-Final", date:"2026-07-12", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"AT&T Stadium",    status:"tbd" },
  { id:"qf4",  stage:"Quarter-Final", date:"2026-07-13", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"SoFi Stadium",    status:"tbd" },
  // Semi Finals
  { id:"sf1",  stage:"Semi-Final", date:"2026-07-14", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium",   status:"tbd" },
  { id:"sf2",  stage:"Semi-Final", date:"2026-07-15", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"Rose Bowl",         status:"tbd" },
  // 3rd Place + Final
  { id:"3rd",  stage:"3rd Place",  date:"2026-07-18", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"SoFi Stadium",      status:"tbd" },
  { id:"fin",  stage:"Final",      date:"2026-07-19", time:"TBD", homeTeam:"TBD", awayTeam:"TBD", venue:"MetLife Stadium, New York", status:"tbd" },
];

// ─── WC 2026 GROUPS (48 teams, 12 groups of 4) ────────────────────────────────
const groups = [
  { group:"A", teams:[
    { name:"USA",     code:"USA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Canada",  code:"CAN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Mexico",  code:"MEX", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Morocco", code:"MAR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"B", teams:[
    { name:"France",    code:"FRA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Argentina", code:"ARG", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"England",   code:"ENG", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Tunisia",   code:"TUN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"C", teams:[
    { name:"Brazil",  code:"BRA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Spain",   code:"ESP", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Germany", code:"GER", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Mexico",  code:"MEX", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"D", teams:[
    { name:"Portugal", code:"POR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Belgium",  code:"BEL", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Morocco",  code:"MAR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Croatia",  code:"CRO", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"E", teams:[
    { name:"Netherlands", code:"NED", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Uruguay",     code:"URU", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Senegal",     code:"SEN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Ecuador",     code:"ECU", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"F", teams:[
    { name:"Nigeria",     code:"NGA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Poland",      code:"POL", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Japan",       code:"JPN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"South Korea", code:"KOR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"G", teams:[
    { name:"Colombia",     code:"COL", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Saudi Arabia", code:"KSA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Cameroon",     code:"CMR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Switzerland",  code:"SUI", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"H", teams:[
    { name:"Australia", code:"AUS", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Iran",      code:"IRN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Ghana",     code:"GHA", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Serbia",    code:"SRB", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"I", teams:[
    { name:"Denmark",   code:"DEN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Austria",   code:"AUT", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Algeria",   code:"ALG", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Chile",     code:"CHI", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"J", teams:[
    { name:"Turkey",  code:"TUR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Hungary", code:"HUN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Sudan",   code:"SDN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Qatar",   code:"QAT", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"K", teams:[
    { name:"Mexico",   code:"MEX", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Paraguay", code:"PAR", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Ivory Coast",code:"CIV",played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Slovenia", code:"SVN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
  { group:"L", teams:[
    { name:"Peru",      code:"PER", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Venezuela", code:"VEN", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"Bolivia",   code:"BOL", played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
    { name:"New Zealand",code:"NZL",played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 },
  ]},
];

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const teams = groups.flatMap(g =>
  g.teams.map(t => ({ ...t, group: g.group }))
);

const lastUpdated = {
  source: "WC2026 Static Data (manually curated)",
  updatedAt: new Date().toISOString(),
  totalPlayers: players.length,
  totalFixtures: fixtures.length,
  totalGroups: groups.length,
  note: "Data manually curated from official WC2026 announcements. Update when official API becomes available.",
};

async function writeJson(fileName, value) {
  await writeFile(new URL(fileName, dataDir), `${JSON.stringify(value, null, 2)}\n`);
}

await mkdir(dataDir, { recursive: true });
await writeJson("fifa-players.json",  players);
await writeJson("fifa-fixtures.json", fixtures);
await writeJson("fifa-teams.json",    teams);
await writeJson("fifa-groups.json",   groups);
await writeJson("last-updated.json",  lastUpdated);

console.log(`✅ Updated WC2026 data at ${lastUpdated.updatedAt}`);
console.log(`   Players: ${players.length}`);
console.log(`   Fixtures: ${fixtures.length}`);
console.log(`   Groups: ${groups.length} (${teams.length} teams)`);
