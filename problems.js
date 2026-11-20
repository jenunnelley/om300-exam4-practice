/* OM 300 Exam 4 Practice Lab: problem bank.
   Every problem is a template. build(r) gets a seeded random generator and returns the story,
   the question, and the right answer, so "New numbers" gives a fresh version every time.
   All businesses, people, and numbers are made up for practice. */
(function (root) {
"use strict";

// ================================================================== random helpers
function rand(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    sample: (arr, n) => r.shuffle(arr).slice(0, n),
    money: (lo, hi) => Math.round((lo + next() * (hi - lo)) * 100) / 100,
    chance: (p) => next() < p,
    step: (lo, hi, st) => { const a0 = Math.ceil(lo / st), b0 = Math.floor(hi / st); return st * (a0 + Math.floor(next() * (b0 - a0 + 1))); },
  };
  return r;
}

// ================================================================== formatting
function fmt(n, d) { d = d === undefined ? 2 : d; return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
const n0 = (n) => fmt(n, 0);
const n2 = (n) => fmt(n, 2);
const isWhole = (n) => Math.abs(n - Math.round(n)) < 1e-9;
const nn = (n) => (isWhole(n) ? n0(n) : n2(n));            // whole numbers without .00
const usd = (n) => "$" + (isWhole(n) ? n0(n) : fmt(n, 2));
const usd2 = (n) => "$" + fmt(n, 2);
const usd4 = (n) => "$" + fmt(n, 4);
const r2 = (x) => Math.round(x * 100) / 100;
const R2 = "Round your answer to 2 decimal places.";
const R4 = "Round your answer to 4 decimal places.";
const plural = (k, one, many) => (k === 1 ? one : many);

// ================================================================== inventory math
const eoq = (D, S, H) => Math.sqrt((2 * D * S) / H);
const epq = (D, S, H, d, p) => Math.sqrt((2 * D * S) / (H * (1 - d / p)));
function nice(x) {
  if (x <= 0) return 1;
  const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
  return Math.max(m, Math.round(x / m) * m);
}

// ================================================================== made-up people and businesses
const FIRST = ["Maya", "Andre", "Priya", "Marcus", "Elena", "Darius", "Tessa", "Omar", "Quinn", "Rosa", "Malik", "Harper", "Jonah", "Keisha", "Wes", "Nina", "Grant", "Lucia", "Reggie", "Sloane", "Dev", "Carmen", "Beau", "Imani", "Felix", "June", "Tariq", "Allie", "Mateo", "Celeste"];

// Businesses that BUY what they stock (EOQ). M = monthly demand range [lo, hi, step], P = unit price, S = order cost.
const BUY = [
  { name: "Grind & Gather Coffee", role: "store manager", item: "12-oz paper cups", unit: "cup", units: "cups", M: [5000, 15000, 250], P: [0.06, 0.18], S: [18, 60], resell: false },
  { name: "Paws Up Veterinary Clinic", role: "practice manager", item: "doses of flea medicine", unit: "dose", units: "doses", M: [150, 750, 10], P: [6, 14], S: [30, 90], resell: true },
  { name: "Spokes & Pedals Bike Shop", role: "owner", item: "inner tubes", unit: "tube", units: "tubes", M: [120, 500, 10], P: [3.5, 9], S: [20, 60], resell: true },
  { name: "Riverside Inn", role: "housekeeping manager", item: "mini shampoo bottles", unit: "bottle", units: "bottles", M: [1500, 7500, 100], P: [0.3, 0.9], S: [25, 80], resell: false },
  { name: "Northside Urgent Care", role: "supply coordinator", item: "boxes of exam gloves", unit: "box", units: "boxes", M: [200, 1000, 10], P: [5, 12], S: [35, 110], resell: false },
  { name: "Crimson Corner Books", role: "buyer", item: "spiral notebooks", unit: "notebook", units: "notebooks", M: [300, 1700, 25], P: [1.5, 4], S: [20, 70], resell: true },
  { name: "Lakeside Tire & Lube", role: "service manager", item: "oil filters", unit: "filter", units: "filters", M: [200, 850, 10], P: [3, 8], S: [25, 75], resell: true },
  { name: "Happy Tails Pet Supply", role: "store manager", item: "bags of cat litter", unit: "bag", units: "bags", M: [150, 700, 10], P: [6, 13], S: [30, 90], resell: true },
  { name: "Smokestack BBQ", role: "kitchen manager", item: "to-go containers", unit: "container", units: "containers", M: [2000, 7500, 100], P: [0.15, 0.45], S: [20, 55], resell: false },
  { name: "Ironworks Gym", role: "operations manager", item: "bottles of disinfectant spray", unit: "bottle", units: "bottles", M: [100, 420, 5], P: [3, 7], S: [15, 50], resell: false },
  { name: "Bright Smile Dental", role: "office manager", item: "take-home toothbrush kits", unit: "kit", units: "kits", M: [400, 1500, 25], P: [0.6, 1.6], S: [20, 60], resell: false },
  { name: "Petal & Stem Florist", role: "owner", item: "glass vases", unit: "vase", units: "vases", M: [250, 1000, 10], P: [1.5, 4.5], S: [25, 70], resell: true },
  { name: "Fairway Golf Shop", role: "buyer", item: "sleeves of golf balls", unit: "sleeve", units: "sleeves", M: [150, 700, 10], P: [6, 14], S: [30, 90], resell: true },
  { name: "Rise & Shine Bakery", role: "manager", item: "pastry boxes", unit: "box", units: "boxes", M: [1200, 5000, 100], P: [0.25, 0.8], S: [20, 60], resell: false },
];

// Businesses that MAKE what they sell (EPQ). d = daily demand range [lo, hi, step], P = cost to make one, S = setup cost.
const MAKE = [
  { name: "Black Warrior Candle Co.", role: "production manager", item: "soy candles", unit: "candle", units: "candles", d: [80, 400, 5], P: [4, 12], S: [60, 250] },
  { name: "Cotton State Apparel", role: "plant manager", item: "t-shirts", unit: "shirt", units: "shirts", d: [300, 1500, 25], P: [3, 8], S: [100, 400] },
  { name: "Magic City Brewing", role: "brewmaster", item: "cases of lager", unit: "case", units: "cases", d: [150, 700, 10], P: [8, 18], S: [300, 1200] },
  { name: "Gulf Coast Hot Sauce Co.", role: "operations manager", item: "bottles of hot sauce", unit: "bottle", units: "bottles", d: [500, 2500, 25], P: [1.2, 3.5], S: [80, 300] },
  { name: "Southern Pine Pallets", role: "plant supervisor", item: "wooden pallets", unit: "pallet", units: "pallets", d: [200, 900, 10], P: [6, 14], S: [150, 500] },
  { name: "Cahaba Soap Works", role: "owner", item: "bars of soap", unit: "bar", units: "bars", d: [400, 2000, 25], P: [0.8, 2.5], S: [40, 150] },
  { name: "Iron Bowl Bat Co.", role: "production lead", item: "wooden baseball bats", unit: "bat", units: "bats", d: [40, 200, 5], P: [15, 40], S: [200, 600] },
  { name: "Mountain Brook Pet Treats", role: "production manager", item: "bags of dog treats", unit: "bag", units: "bags", d: [300, 1400, 25], P: [2, 6], S: [60, 250] },
  { name: "Tuscaloosa Tile Works", role: "plant manager", item: "boxes of floor tile", unit: "box", units: "boxes", d: [100, 500, 10], P: [10, 25], S: [200, 700] },
  { name: "Sweet Home Salsa", role: "kitchen manager", item: "jars of salsa", unit: "jar", units: "jars", d: [400, 1800, 25], P: [1.5, 4], S: [50, 200] },
  { name: "Northport Furniture", role: "shop foreman", item: "dining chairs", unit: "chair", units: "chairs", d: [20, 90, 2], P: [25, 60], S: [150, 500] },
  { name: "Delta Cold Brew", role: "production manager", item: "cans of cold brew", unit: "can", units: "cans", d: [1500, 6000, 50], P: [0.6, 1.5], S: [100, 350] },
];

// Service jobs that use up supplies (for "find D" stories)
const JOBS = [
  { name: "Sparkle Auto Spa", job: "deluxe wash", jobs: "deluxe washes", unit: "towel", units: "microfiber towels", k: [3, 5], j: [20, 60] },
  { name: "Lakeside Tire & Lube", job: "oil change", jobs: "oil changes", unit: "quart", units: "quarts of motor oil", k: [4, 6], j: [15, 45] },
  { name: "Bright Smile Dental", job: "cleaning", jobs: "cleanings", unit: "pair", units: "pairs of gloves", k: [2, 4], j: [18, 40] },
  { name: "Shear Genius Salon", job: "color appointment", jobs: "color appointments", unit: "foil sheet", units: "foil sheets", k: [30, 60], j: [6, 15] },
  { name: "Riverside Inn", job: "room cleaning", jobs: "room cleanings", unit: "bottle", units: "mini shampoo bottles", k: [2, 3], j: [40, 120] },
  { name: "Hillcrest Physical Therapy", job: "therapy session", jobs: "therapy sessions", unit: "pack", units: "single-use cold packs", k: [1, 2], j: [25, 70] },
];

// Customer-based demand (for "% of customers" stories)
const CUSTS = [
  { name: "Hillcrest Physical Therapy", who: "patients", buy: "leave with a resistance band", unit: "band", units: "resistance bands" },
  { name: "Paws Up Veterinary Clinic", who: "pet visits", buy: "end with a dose of flea medicine", unit: "dose", units: "doses" },
  { name: "Spokes & Pedals Bike Shop", who: "repair customers", buy: "need a new inner tube", unit: "tube", units: "inner tubes" },
  { name: "Grind & Gather Coffee", who: "customers", buy: "add a pastry bag to their order", unit: "bag", units: "pastry bags" },
  { name: "Lakeside Tire & Lube", who: "drivers", buy: "need a new cabin air filter", unit: "filter", units: "cabin air filters" },
  { name: "Ironworks Gym", who: "members check in", buy: "grab a rental towel", unit: "towel", units: "towels" },
];

const DAYS = [240, 250, 255, 260, 280, 300, 310, 320, 350];

// ================================================================== scenario builders
function buy(r, o) {
  o = o || {};
  const c = o.c || r.pick(BUY), who = r.pick(FIRST);
  const M = r.step(c.M[0], c.M[1], c.M[2]);
  const D = M * 12;
  const S = r.chance(0.5) ? r.int(c.S[0], c.S[1]) : r.money(c.S[0], c.S[1]);
  const P = r.money(c.P[0], c.P[1]);
  const I = r.pick([12, 15, 18, 20, 22, 25, 28, 30, 35, 40]);
  const hm = o.hm || r.pick(["pct", "dollar"]);
  const dm = o.dm || r.pick(["month", "year"]);
  let H = (P * I) / 100;
  if (hm === "dollar") H = Math.max(0.01, r2(H));
  const days = r.pick(DAYS);
  const L = r.int(3, 12);
  const Qs = eoq(D, S, H);
  const Q0 = nice(Qs * r.pick([0.4, 0.5, 0.6, 1.6, 2, 2.5]));
  return { c, who, M, D, S, P, I, H, hm, dm, days, L, Qs, Q0 };
}

function buyText(r, x, keys) {
  const c = x.c, s = [];
  const has = (k) => keys.indexOf(k) >= 0;
  s.push(r.pick([
    `${x.who}, the ${c.role} at ${c.name}, wants to get smarter about ordering ${c.item}.`,
    `${c.name} keeps ${c.item} in stock, and ${x.who} (the ${c.role}) handles the ordering.`,
    `${x.who} runs purchasing for ${c.name} and is reviewing how the business buys ${c.item}.`,
  ]));
  if (has("demand")) {
    if (x.dm === "month") s.push(r.pick([`${c.name} goes through about ${n0(x.M)} ${c.units} a month.`, `On average, ${n0(x.M)} ${c.units} are used every month.`, `Monthly demand runs about ${n0(x.M)} ${c.units}.`]));
    else s.push(r.pick([`Annual demand is ${n0(x.D)} ${c.units}.`, `Over a full year, ${c.name} uses about ${n0(x.D)} ${c.units}.`, `Demand is steady at ${n0(x.D)} ${c.units} per year.`]));
  }
  if (has("price")) s.push(r.pick([`Each ${c.unit} costs ${usd2(x.P)}.`, `The supplier charges ${usd2(x.P)} per ${c.unit}.`]));
  if (has("hold")) {
    if (x.hm === "pct") s.push(r.pick([`Holding a ${c.unit} in inventory for a year costs about ${x.I}% of its price.`, `The annual carrying cost is ${x.I}% of the unit cost.`, `Storage, insurance, and spoilage add up to ${x.I}% of each ${c.unit}'s cost per year.`]));
    else s.push(r.pick([`It costs ${usd2(x.H)} to hold one ${c.unit} for a year.`, `The annual holding cost is ${usd2(x.H)} per ${c.unit}.`]));
  }
  if (has("order")) s.push(r.pick([`Placing an order costs ${usd(x.S)}.`, `Every order comes with a ${usd(x.S)} processing fee.`, `It costs ${usd(x.S)} each time an order is placed.`]));
  if (has("days")) s.push(r.pick([`${c.name} is open ${x.days} days a year.`, `There are ${x.days} working days in the year.`]));
  if (has("lead")) s.push(r.pick([`Orders take ${x.L} working days to arrive.`, `The lead time is ${x.L} working days.`]));
  if (has("current")) s.push(r.pick([`Right now, ${x.who} orders ${n0(x.Q0)} ${c.units} at a time.`, `The current policy is to order ${n0(x.Q0)} ${c.units} per order.`]));
  return s.join(" ");
}

function make(r, o) {
  o = o || {};
  const c = o.c || r.pick(MAKE), who = r.pick(FIRST);
  const days = r.pick(DAYS);
  const d = r.step(c.d[0], c.d[1], c.d[2]);
  let p = Math.round((d * (1.4 + r.next() * 1.8)) / 5) * 5;
  if (p <= d + 5) p = d + 10;
  const D = d * days;
  const S = r.int(c.S[0], c.S[1]);
  const P = r.money(c.P[0], c.P[1]);
  const I = r.pick([10, 12, 15, 18, 20, 25, 30]);
  const hm = o.hm || r.pick(["pct", "dollar"]);
  const dm = o.dm || r.pick(["day", "year"]);
  let H = (P * I) / 100;
  if (hm === "dollar") H = Math.max(0.01, r2(H));
  const Qs = epq(D, S, H, d, p);
  const Q0 = nice(Qs * r.pick([0.5, 0.6, 1.7, 2, 2.5]));
  return { c, who, days, d, p, D, S, P, I, H, hm, dm, Qs, Q0 };
}

function makeText(r, x, keys) {
  const c = x.c, s = [];
  const has = (k) => keys.indexOf(k) >= 0;
  s.push(r.pick([
    `${x.who} is the ${c.role} at ${c.name}, which makes its own ${c.item}.`,
    `${c.name} produces ${c.item} in batches, and ${x.who} (the ${c.role}) plans the production runs.`,
    `${x.who} schedules production at ${c.name}, a company that makes and sells ${c.item}.`,
  ]));
  if (has("demand")) {
    if (x.dm === "day") s.push(r.pick([`Customers buy about ${n0(x.d)} ${c.units} per day.`, `Daily demand is ${n0(x.d)} ${c.units}.`]));
    else s.push(r.pick([`Annual demand is ${n0(x.D)} ${c.units}.`, `Customers buy ${n0(x.D)} ${c.units} a year.`]));
  }
  if (has("prod")) s.push(r.pick([`The line can make ${n0(x.p)} ${c.units} per day.`, `When it's running, the equipment produces ${n0(x.p)} ${c.units} a day.`]));
  if (has("days")) s.push(r.pick([`The plant operates ${x.days} days a year.`, `${c.name} is open ${x.days} days a year.`]));
  if (has("setup")) s.push(r.pick([`Each production run costs ${usd(x.S)} to set up.`, `Changing over the equipment for a new run costs ${usd(x.S)}.`]));
  if (has("hold")) {
    if (x.hm === "pct") s.push(r.pick([`Holding cost is ${x.I}% of the ${usd2(x.P)} it costs to make each ${c.unit}.`, `It costs ${usd2(x.P)} to make a ${c.unit}, and holding one for a year costs ${x.I}% of that.`]));
    else s.push(r.pick([`It costs ${usd2(x.H)} to hold one ${c.unit} for a year.`, `The annual holding cost is ${usd2(x.H)} per ${c.unit}.`]));
  }
  if (has("current")) s.push(r.pick([`Right now, they make ${n0(x.Q0)} ${c.units} per run.`, `The current batch size is ${n0(x.Q0)} ${c.units}.`]));
  return s.join(" ");
}

// Steps that explain where D, H, and d came from
function stepD(x) { return x.dm === "month" ? `D = ${n0(x.M)} per month × 12 = ${n0(x.D)} ${x.c.units} per year` : `D = ${n0(x.D)} ${x.c.units} per year (given)`; }
function stepH(x) { return x.hm === "pct" ? `H = I × P = ${x.I / 100} × ${usd2(x.P)} = ${usd4(x.H)} per ${x.c.unit} per year` : `H = ${usd2(x.H)} per ${x.c.unit} per year (given)`; }
function stepDp(x) { return x.dm === "day" ? `D = d × days = ${n0(x.d)} × ${x.days} = ${n0(x.D)} ${x.c.units} per year` : `d = D ÷ days = ${n0(x.D)} ÷ ${x.days} = ${n0(x.d)} ${x.c.units} per day`; }
function hintH(x) { return x.hm === "pct" ? "H is given as a percent of the price. Turn the percent into a decimal and multiply by the price: H = I × P." : "H is already given in dollars per unit per year."; }
function hintD(x) { return x.dm === "month" ? "D must be ANNUAL demand. The demand here is monthly, so multiply by 12." : "D is given as an annual number already."; }

// ================================================================== problem constructors
const BANK = [];
const LEVEL_INFO = {};
let CUR = { part: 0, title: "", level: "" };
const counters = {};
function part(num, title, blurb) { CUR = { part: num, title, level: "", blurb }; }
function level(name, info) { CUR.level = name; LEVEL_INFO[CUR.part + "|" + name] = info || {}; }
function add(build, opts) {
  opts = opts || {};
  counters[CUR.part] = (counters[CUR.part] || 0) + 1;
  BANK.push({ id: "p" + CUR.part + "-" + counters[CUR.part], part: CUR.part, partTitle: CUR.title, partBlurb: CUR.blurb, level: CUR.level, build, caseKey: opts.caseKey || null, step: opts.step || null });
}
function N(o) { o.kind = "num"; if (o.dec === undefined) o.dec = 2; o.mistakes = o.mistakes || []; o.hints = o.hints || []; o.steps = o.steps || []; return o; }
function C(o) { o.kind = "mc"; return o; }

// Multiple-choice from data. it = { q, a, w, why } or { v: [{q, a, why}], pool, notes, why }
function concept(it) {
  return function (r) {
    let q, a, why = it.why, wrongs;
    if (it.v) {
      const v = r.pick(it.v);
      q = v.q; a = v.a; if (v.why) why = v.why;
      wrongs = it.pool.filter((x) => x !== a).map((x) => [x, it.notes ? it.notes[x] : null]);
    } else {
      q = Array.isArray(it.q) ? r.pick(it.q) : it.q;
      a = Array.isArray(it.a) ? r.pick(it.a) : it.a;
      wrongs = it.w.map((x) => (Array.isArray(x) ? x : [x, null]));
    }
    const pickW = r.sample(wrongs, Math.min(it.n || 3, wrongs.length));
    const choices = [{ t: a, ok: true }].concat(pickW.map((w) => ({ t: w[0], ok: false, note: w[1] })));
    return C({ story: it.story || null, ask: q, choices, why });
  };
}

// ================================================================== the variable cheat card (also shown in the app)
const VAR_CARD = [
  ["D", "Annual demand", "units per YEAR. If demand is given per month, week, quarter, or day, convert it."],
  ["S", "Setup or ordering cost", "dollars per ORDER (or per production run). Also called acquisition cost: the cost of \"getting.\""],
  ["H", "Holding cost", "dollars per UNIT per YEAR. Also called carrying or possession cost: the cost of \"having.\" Can be given as H = I × P."],
  ["I", "Holding cost rate", "H as a percent of the price. Turn the % into a decimal, then H = I × P."],
  ["P", "Price", "what the business pays per unit (not what it sells for)."],
  ["Q", "Order quantity", "units per order or per production run (lot). Q* is the best (optimal) amount."],
  ["d", "Daily demand", "units per working DAY. d = D ÷ working days per year."],
  ["p", "Daily production rate", "units the business can MAKE per day (EPQ only)."],
  ["L", "Lead time", "days between placing an order and receiving it."],
  ["ss", "Safety stock", "extra units kept on hand as a cushion against running out."],
];

// ================================================================== EXAM 4 shared helpers
const n3 = (n) => fmt(n, 3);
const n4 = (n) => fmt(n, 4);
const R3 = "Round your answer to 3 decimal places.";
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function grid(head, rows, numFrom) {
  numFrom = numFrom === undefined ? 1 : numFrom;
  return `<table class="data"><tr>${head.map((x) => `<th>${x}</th>`).join("")}</tr>${rows.map((row) => `<tr>${row.map((c, i) => `<td${i >= numFrom ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</table>`;
}
// One right answer from a list, three wrong ones from another list.
function oneOf(it) {
  return function (r) {
    const a = r.pick(it.right);
    const ws = r.sample(it.wrong, Math.min(it.n || 3, it.wrong.length)).map((w) => (Array.isArray(w) ? w : [w, it.wnote || null]));
    return C({ story: it.story || null, ask: Array.isArray(it.q) ? r.pick(it.q) : it.q, choices: [{ t: a, ok: true }].concat(ws.map((w) => ({ t: w[0], ok: false, note: w[1] }))), why: it.why });
  };
}

// ================================================================== PART 1: PRODUCTIVITY (Ch. 1)
part(1, "Productivity (Ch. 1)", "Single-factor (labor) productivity, multifactor productivity, percent change, and the new productivity after an increase.");

const SHOPS = [
  { name: "Riverbend Valve Works", units: "brass valves", unit: "valve" },
  { name: "Cahaba Cabinet Co.", units: "cabinet doors", unit: "door" },
  { name: "Northport Print Shop", units: "custom banners", unit: "banner" },
  { name: "Sweet Home Salsa", units: "jars of salsa", unit: "jar" },
  { name: "Black Warrior Brewing", units: "cases of ale", unit: "case" },
  { name: "Lakeview Dental Lab", units: "dental crowns", unit: "crown" },
  { name: "Iron Bowl Bat Co.", units: "baseball bats", unit: "bat" },
  { name: "Shelby Street Bakery", units: "loaves of bread", unit: "loaf" },
  { name: "Druid City Title Co.", units: "title searches", unit: "search" },
  { name: "Gulf Coast Tile", units: "boxes of tile", unit: "box" },
  { name: "Magnolia Mattress Co.", units: "mattresses", unit: "mattress" },
  { name: "Tuscaloosa Truss Works", units: "roof trusses", unit: "truss" },
];
function shop(r) { return Object.assign({ who: r.pick(FIRST) }, r.pick(SHOPS)); }

level("Labor Productivity", { intro: "<b>Single-factor productivity = units produced ÷ labor-hours used.</b> Labor-hours = number of workers × hours each one works. Watch for extra numbers (payroll, material cost) that a labor-productivity question doesn't need." });
add(function (r) {
  const x = shop(r), k = r.int(2, 9), hrs = r.pick([8, 8, 10, 12]), X = r.int(k * hrs * 3, k * hrs * 40), pay = r.int(15, 32);
  const ans = X / (k * hrs);
  return N({
    story: `${x.name} makes ${x.units}. A crew of ${k} employees works a ${hrs}-hour shift and produces ${n0(X)} ${x.units}. Each employee earns ${usd2(pay)} per hour.`,
    ask: `What is the labor productivity in ${x.units} per labor-hour? ${R2}`, answer: ans, unit: "per labor-hour",
    hints: ["Labor-hours = employees × hours per shift.", "Productivity = units produced ÷ labor-hours. The wage isn't needed."],
    steps: [`Labor-hours = ${k} × ${hrs} = ${k * hrs}.`, `Productivity = ${n0(X)} ÷ ${k * hrs} = <b>${n2(ans)}</b> ${x.units} per labor-hour.`],
    mistakes: [[X / hrs, "That's units per shift-hour for the whole crew. Divide by LABOR-hours: employees × hours."], [X / k, "That's units per employee per shift. Multiply employees × hours to get labor-hours."], [(k * hrs) / X, "Flip it: output goes on top, input on the bottom."], [X / (k * hrs * pay), "That's units per labor DOLLAR. The question asks per labor-hour."]],
  });
});
add(function (r) {
  const x = shop(r), k = r.int(3, 12), hrs = r.pick([7, 8, 9, 10]), dd = r.pick([4, 5, 6]), X = r.int(k * hrs * dd * 2, k * hrs * dd * 25);
  const ans = X / (k * hrs * dd);
  return N({
    story: `Last week, ${x.who}'s team at ${x.name} turned out ${n0(X)} ${x.units}. The team has ${k} people, and each worked ${hrs} hours a day, ${dd} days that week.`,
    ask: `What was the team's labor productivity (${x.units} per labor-hour)? ${R2}`, answer: ans, unit: "per labor-hour",
    hints: ["Find the total labor-hours for the WEEK: people × hours per day × days.", "Then divide the week's output by that."],
    steps: [`Labor-hours = ${k} × ${hrs} × ${dd} = ${n0(k * hrs * dd)}.`, `Productivity = ${n0(X)} ÷ ${n0(k * hrs * dd)} = <b>${n2(ans)}</b>.`],
    mistakes: [[X / (k * hrs), "You used one day's labor-hours with a whole week's output. Multiply by the days worked too."], [X / (hrs * dd), "Include the number of people: labor-hours = people × hours × days."], [X / (k * dd), "That's per person-day. The question asks per labor-HOUR."]],
  });
});
add(function (r) {
  const x = shop(r), lh = r.int(80, 900), X = Math.round(lh * (1 + r.next() * 15)), mat = r.int(800, 9000), en = r.int(100, 1500);
  const ans = X / lh;
  return N({
    story: `${x.name}'s monthly report shows:${tableRows(r.shuffle([["Units produced", n0(X) + " " + x.units], ["Labor-hours used", n0(lh)], ["Materials cost", "$" + n0(mat)], ["Energy cost", "$" + n0(en)]]))}`,
    ask: `What is the single-factor LABOR productivity? ${R2}`, answer: ans, unit: "per labor-hour",
    hints: ["Single-factor means ONE input. For labor productivity, that input is labor-hours.", "Materials and energy belong in multifactor productivity, not here."],
    steps: [`Labor productivity = ${n0(X)} ÷ ${n0(lh)} = <b>${n2(ans)}</b> ${x.units} per labor-hour.`],
    mistakes: [[X / mat, "That's materials productivity. Use labor-hours."], [lh / X, "Flip it: units ÷ labor-hours."], [X / (mat + en), "That's a multifactor measure. Labor productivity uses only labor-hours."]],
  });
});

level("Percent Change in Productivity", { intro: "<b>% change = (new − original) ÷ original × 100.</b> Find each productivity first, then compare. Always divide by the ORIGINAL (old) value." });
add(function (r) {
  const x = shop(r), k = r.int(3, 8), hrs = 8, X1 = r.int(k * hrs, k * hrs * 12), X2 = Math.round(X1 * (1.08 + r.next() * 0.7));
  const p1 = X1 / (k * hrs), p2 = X2 / (k * hrs), ans = ((p2 - p1) / p1) * 100;
  return N({
    story: `${x.name} has ${k} employees who each work ${hrs} hours a day. Under the old process they made ${n0(X1)} ${x.units} a day. After ${x.who} redesigned the workflow, the same team makes ${n0(X2)} ${x.units} a day.`,
    ask: `By what percent did labor productivity increase? Enter it as a percent (for example, 25.5 for 25.5%). ${R2}`, answer: ans, unit: "%",
    hints: ["Old productivity = old output ÷ labor-hours. New productivity = new output ÷ labor-hours.", "% increase = (new − old) ÷ old × 100."],
    steps: [`Labor-hours per day = ${k} × ${hrs} = ${k * hrs}.`, `Old = ${n0(X1)} ÷ ${k * hrs} = ${n4(p1)}; new = ${n0(X2)} ÷ ${k * hrs} = ${n4(p2)}.`, `% increase = (${n4(p2)} − ${n4(p1)}) ÷ ${n4(p1)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[((p2 - p1) / p2) * 100, "Divide by the ORIGINAL (old) productivity, not the new one."], [(p2 / p1) * 100, "That's new as a percent of old. Subtract 100 (or use new − old on top)."], [p2 - p1, "That's the change in units per labor-hour. Divide by the old value and multiply by 100."]],
  });
});
add(function (r) {
  const x = shop(r), k1 = r.int(5, 10), k2 = k1 - r.int(1, 3), hrs = r.pick([8, 10]), X1 = r.int(k1 * hrs * 2, k1 * hrs * 12), X2 = Math.round(X1 * (0.95 + r.next() * 0.3));
  const p1 = X1 / (k1 * hrs), p2 = X2 / (k2 * hrs), ans = ((p2 - p1) / p1) * 100;
  return N({
    story: `${x.name} used to run a line with ${k1} workers on a ${hrs}-hour shift, producing ${n0(X1)} ${x.units} per shift. After adding a new machine, the line runs with only ${k2} workers on the same shift and produces ${n0(X2)} ${x.units}.`,
    ask: `What is the percent change in labor productivity? Enter it as a percent. ${R2}`, answer: ans, unit: "%",
    hints: ["Use each crew size with its own output.", "% change = (new − old) ÷ old × 100."],
    steps: [`Old = ${n0(X1)} ÷ (${k1} × ${hrs}) = ${n4(p1)} per labor-hour.`, `New = ${n0(X2)} ÷ (${k2} × ${hrs}) = ${n4(p2)} per labor-hour.`, `% change = (${n4(p2)} − ${n4(p1)}) ÷ ${n4(p1)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[((X2 - X1) / X1) * 100, "That's the change in OUTPUT. Productivity also depends on the crew size."], [((p2 - p1) / p2) * 100, "Divide by the old productivity."], [((X2 / (k1 * hrs) - p1) / p1) * 100, `The new line has ${k2} workers, not ${k1}.`]],
  });
});
add(function (r) {
  const x = shop(r), k = r.int(3, 9), h1 = r.pick([10, 9, 12]), h2 = h1 - r.pick([1, 2]), X = r.int(k * h1 * 3, k * h1 * 20);
  const p1 = X / (k * h1), p2 = X / (k * h2), ans = ((p2 - p1) / p1) * 100;
  return N({
    story: `${x.name}'s ${k}-person crew used to need ${h1}-hour days to make ${n0(X)} ${x.units}. With a better layout, the same crew now makes the same ${n0(X)} ${x.units} in ${h2}-hour days.`,
    ask: `By what percent did labor productivity increase? ${R2}`, answer: ans, unit: "%",
    hints: ["Same output, fewer labor-hours, so productivity went up.", "Find old and new productivity, then (new − old) ÷ old × 100."],
    steps: [`Old = ${n0(X)} ÷ (${k} × ${h1}) = ${n4(p1)}.`, `New = ${n0(X)} ÷ (${k} × ${h2}) = ${n4(p2)}.`, `% increase = <b>${n2(ans)}%</b>.`],
    mistakes: [[((h1 - h2) / h1) * 100, "That's the percent drop in HOURS. Productivity rises by more than that: compare the two productivities."], [((p2 - p1) / p2) * 100, "Divide by the old productivity."]],
  });
});

level("Productivity After an Increase", { intro: "When productivity rises by g%, multiply by (1 + g). If output rises by g% with the same labor, productivity rises by g% too." });
add(function (r) {
  const x = shop(r), k = r.int(2, 6), hrs = r.pick([8, 8, 10]), X = r.int(k * hrs * 10, k * hrs * 60), g = r.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60]);
  const ans = (X * (1 + g / 100)) / (k * hrs);
  return N({
    story: `${x.name} currently makes ${n0(X)} ${x.units} during each ${hrs}-hour shift with ${k} employees. ${x.who} expects a new fixture to raise output by ${g}% with the same crew and shift length.`,
    ask: `What will the NEW labor productivity be (${x.units} per labor-hour)? ${R2}`, answer: ans, unit: "per labor-hour",
    hints: [`New output = current output × (1 + ${g / 100}).`, "Then divide by labor-hours (employees × hours)."],
    steps: [`New output = ${n0(X)} × ${1 + g / 100} = ${n2(X * (1 + g / 100))}.`, `Labor-hours = ${k} × ${hrs} = ${k * hrs}.`, `New productivity = ${n2(X * (1 + g / 100))} ÷ ${k * hrs} = <b>${n2(ans)}</b>.`],
    mistakes: [[X / (k * hrs), "That's the CURRENT productivity. Increase the output first."], [(X * (g / 100)) / (k * hrs), "That's only the increase. Multiply by (1 + g), not g."], [(X * (1 + g / 100)) / hrs, "Divide by labor-hours: employees × hours."], [(X * (1 + g / 100)) / k, "Divide by labor-hours: employees × hours."]],
  });
});
add(function (r) {
  const x = shop(r), k = r.int(2, 8), hrs = r.pick([8, 10]), X = r.int(k * hrs * 5, k * hrs * 40), g = r.pick([12, 15, 18, 20, 25, 30]);
  const ans = X * (1 + g / 100);
  return N({
    story: `${x.who} manages ${k} workers at ${x.name}. Each ${hrs}-hour shift they produce ${n0(X)} ${x.units}. The plant manager wants labor productivity ${g}% higher, without adding workers or hours.`,
    ask: `How many ${x.units} per shift must the crew produce to hit that goal? ${R2}`, answer: ans, unit: x.units,
    hints: ["With the same labor-hours, productivity rises only if output rises by the same percent.", `Target output = ${n0(X)} × (1 + ${g / 100}).`],
    steps: [`Current productivity = ${n0(X)} ÷ ${k * hrs} = ${n4(X / (k * hrs))}. Target = that × ${1 + g / 100} = ${n4((X * (1 + g / 100)) / (k * hrs))}.`, `Target output = target productivity × ${k * hrs} labor-hours = <b>${n2(ans)}</b> ${x.units}.`],
    mistakes: [[X * (g / 100), "That's just the increase. Add it to the current output."], [(X * (1 + g / 100)) / (k * hrs), "That's the target productivity. The question asks for output per shift."]],
  });
});

level("Multifactor Productivity", { intro: "<b>Multifactor productivity = output ÷ (labor + materials + energy + capital + miscellaneous).</b> Put every input in dollars and add them ALL. These answers are often small numbers, so keep 4 decimals." });
add(function (r) {
  const x = shop(r), X = r.int(150, 3000), L = r.int(400, 4000), M = r.int(300, 5000), E = r.int(50, 800), K = r.int(100, 2000), Mi = r.int(20, 400);
  const tot = L + M + E + K + Mi, ans = X / tot;
  return N({
    story: `${x.name} produced ${n0(X)} ${x.units} last week. The inputs cost:${tableRows(r.shuffle([["Labor", "$" + n0(L)], ["Materials", "$" + n0(M)], ["Energy", "$" + n0(E)], ["Capital", "$" + n0(K)], ["Miscellaneous", "$" + n0(Mi)]]))}`,
    ask: `What is the multifactor productivity in ${x.units} per dollar? ${R4}`, answer: ans, dec: 4, unit: "per $",
    hints: ["Add up ALL the inputs: labor + materials + energy + capital + miscellaneous.", "Divide output by that total."],
    steps: [`Total input = ${n0(L)} + ${n0(M)} + ${n0(E)} + ${n0(K)} + ${n0(Mi)} = $${n0(tot)}.`, `Multifactor productivity = ${n0(X)} ÷ ${n0(tot)} = <b>${n4(ans)}</b> ${x.units} per dollar.`],
    mistakes: [[X / L, "That's labor-dollar productivity only. Multifactor uses ALL the inputs."], [X / (L + M), "Include energy, capital, and miscellaneous too."], [X / (tot - Mi), "Don't leave out miscellaneous."], [tot / X, "Flip it: output ÷ total input."]],
  });
});
add(function (r) {
  const x = shop(r), k = r.int(3, 10), hrs = 8, w = r.money(14, 30), X = r.int(60, 1200), M = r.int(200, 3000), O = r.int(150, 1500), price = r.int(8, 90);
  const L = k * hrs * w, tot = L + M + O, ans = X / tot;
  return N({
    story: `Each day at ${x.name}, ${k} employees work ${hrs} hours at ${usd2(w)} an hour. Daily materials cost $${n0(M)} and overhead (energy, capital, and other costs) runs $${n0(O)} a day. They make ${n0(X)} ${x.units} a day and sell each one for ${usd(price)}.`,
    ask: `What is the daily multifactor productivity (${x.units} per dollar of input)? ${R4}`, answer: ans, dec: 4, unit: "per $",
    hints: ["Labor cost = employees × hours × wage.", "Total input = labor + materials + overhead. The selling price isn't an input."],
    steps: [`Labor = ${k} × ${hrs} × ${usd2(w)} = ${usd2(L)}.`, `Total input = ${usd2(L)} + $${n0(M)} + $${n0(O)} = ${usd2(tot)}.`, `Multifactor = ${n0(X)} ÷ ${usd2(tot)} = <b>${n4(ans)}</b>.`],
    mistakes: [[X / (M + O), "Labor is an input too: employees × hours × wage."], [X / (k * hrs), "That's labor productivity (per labor-hour). Multifactor uses dollars of every input."], [X / (k * w + M + O), "Labor cost needs the hours too: employees × hours × wage."], [(X * price) / tot, "Output is in units here, not sales dollars."]],
  });
});
add(function (r) {
  const biz = r.pick([["Shoals Insurance", "claims processed"], ["Druid City Title Co.", "titles closed"], ["Crimson Tax Service", "returns filed"], ["Mobile Bay Mortgage", "loans processed"], ["Riverside Clinic", "patient visits"]]);
  const k = r.int(3, 8), pay = k * 8 * r.int(18, 30), oh1 = r.int(200, 600), X1 = r.int(6, 30), oh2 = oh1 + r.int(100, 500);
  const X2 = Math.max(X1 + 1, Math.ceil((X1 * (pay + oh2) / (pay + oh1)) * (1.05 + r.next() * 0.5)));
  const m1 = X1 / (pay + oh1), m2 = X2 / (pay + oh2), ans = ((m2 - m1) / m1) * 100;
  return N({
    story: `${biz[0]} has a staff of ${k} who each work 8 hours a day. Payroll is $${n0(pay)} per day. Under the old system, overhead was $${n0(oh1)} a day and the office handled ${X1} ${biz[1]} a day. A new software system raised overhead to $${n0(oh2)} a day, and the same staff now handles ${X2} ${biz[1]} a day.`,
    ask: `What is the percent change in MULTIFACTOR productivity? Enter it as a percent. ${R2}`, answer: ans, unit: "%",
    hints: ["Old multifactor = old output ÷ (payroll + old overhead). New = new output ÷ (payroll + new overhead).", "Then (new − old) ÷ old × 100. Don't round the productivities too early."],
    steps: [`Old = ${X1} ÷ (${n0(pay)} + ${n0(oh1)}) = ${fmt(m1, 6)} per dollar.`, `New = ${X2} ÷ (${n0(pay)} + ${n0(oh2)}) = ${fmt(m2, 6)} per dollar.`, `% change = (new − old) ÷ old × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[((X2 - X1) / X1) * 100, "That's the percent change in LABOR productivity (same staff). Multifactor includes overhead, which went up."], [((m2 - m1) / m2) * 100, "Divide by the OLD productivity."], [((X2 / (pay + oh1) - m1) / m1) * 100, "Use the NEW overhead for the new system."]],
  });
});

// ================================================================== PART 2: STRATEGY, PROCESS & CAPACITY (Ch. 1, 2, 7)
part(2, "OM, Strategy, Process & Capacity (Ch. 1, 2, 7)", "What OM is, the 10 strategic decisions, goods vs. services, mission and strategy, competitive advantage, the product life cycle, outsourcing, process strategies, capacity, and bottlenecks.");

level("OM Basics (Ch. 1)");
add(concept({
  q: ["Which is the BEST definition of operations management?", "Operations management (OM) is:"],
  a: "The set of activities that creates value in the form of goods and services by transforming inputs into outputs",
  w: [["The creation of goods and services", "That's the definition of PRODUCTION. OM is the set of activities that create value by transforming inputs into outputs."], ["The function that generates demand for a firm's products", "That's marketing."], ["Tracking how well the organization is doing, paying the bills, and collecting the money", "That's finance/accounting."], ["Managing the people who work in a factory", "OM covers far more than people and factories: it transforms inputs into outputs in goods AND services."]],
  why: "OM = the set of activities that create value in the form of goods and services by transforming inputs into outputs. Production is simply the creation of goods and services.",
}));
add(concept({
  v: [
    { q: "Which business function GENERATES DEMAND (or at least takes the order)?", a: "Marketing" },
    { q: "Which business function tracks how well the organization is doing, pays the bills, and collects the money?", a: "Finance/accounting" },
    { q: "Which business function CREATES the product (good or service)?", a: "Production/operations" },
  ],
  pool: ["Marketing", "Finance/accounting", "Production/operations", "Human resources", "Information technology"],
  notes: { "Marketing": "Marketing generates demand.", "Finance/accounting": "Finance/accounting tracks performance, pays bills, and collects money.", "Production/operations": "Production/operations creates the product.", "Human resources": "HR is important, but it isn't one of the three essential functions from Chapter 1.", "Information technology": "IT isn't one of the three essential functions from Chapter 1." },
  why: "The three essential business functions: marketing (generates demand), finance/accounting (tracks performance, pays bills, collects money), and production/operations (creates the product).",
}));
add(concept({
  q: "Every organization, from a bank to a factory, performs which three essential functions?",
  a: "Marketing, production/operations, and finance/accounting",
  w: [["Marketing, human resources, and finance/accounting", "HR isn't one of the three. The product has to be created: production/operations."], ["Production/operations, purchasing, and quality control", "Purchasing and quality control are parts of operations. The three are marketing, operations, and finance/accounting."], ["Research and development, sales, and logistics", "The three essential functions are marketing, production/operations, and finance/accounting."], ["Production/operations, marketing, and human resources", "Someone has to pay the bills and collect the money: finance/accounting, not HR."]],
  why: "Marketing generates demand, production/operations creates the product, and finance/accounting tracks how well the organization is doing.",
}));
add(concept({
  q: ["A farmer, a syrup producer, a bottler, a distributor, and a retailer all work together to get a soft drink to you. This global network of organizations and activities is called a:", "What do we call the global network of organizations and activities that supply a firm with goods and services?"],
  a: "Supply chain",
  w: [["Value stream map", "A value-stream map is a Chapter 7 tool for analyzing a process, not the network itself."], ["Product life cycle", "The product life cycle is introduction, growth, maturity, decline."], ["Work breakdown structure", "A WBS breaks a project into tasks (Chapter 3)."], ["Distribution center", "A distribution center is one facility. The whole network is the supply chain."]],
  why: "A supply chain is a global network of organizations and activities that supply a firm with goods and services. Members collaborate to achieve high customer satisfaction, efficiency, and competitive advantage.",
}));
const TEN = ["Product", "Process", "Location", "Layout", "People", "Quality management", "Inventory management", "Supply chain management", "Scheduling", "Maintenance"];
add(concept({
  v: [
    { q: "A hospital system is deciding which city should get its new outpatient clinic. Which of the 10 strategic OM decisions is this?", a: "Location" },
    { q: "A warehouse manager rearranges aisles and workstations so pickers walk less. Which strategic OM decision is this?", a: "Layout" },
    { q: "A restaurant decides how often to service its fryers and ovens so they don't break down mid-shift. Which strategic OM decision is this?", a: "Maintenance" },
    { q: "A plant decides how many units of each part to keep on hand and when to reorder. Which strategic OM decision is this?", a: "Inventory management" },
    { q: "A clinic decides which nurses work which shifts next week. Which strategic OM decision is this?", a: "Scheduling" },
    { q: "A company decides which suppliers to buy from and how to work with them. Which strategic OM decision is this?", a: "Supply chain management" },
    { q: "A bakery decides what its customers expect from a loaf and how it will check that every loaf meets that standard. Which strategic OM decision is this?", a: "Quality management" },
    { q: "A firm decides how to hire, train, and motivate its workers. Which strategic OM decision is this?", a: "People" },
    { q: "A coffee chain decides whether to brew by hand or with automated machines. Which strategic OM decision is this?", a: "Process" },
    { q: "A phone maker decides which features its next model will have. Which strategic OM decision is this?", a: "Product" },
  ],
  pool: TEN,
  why: "The 10 strategic OM decisions: product, process, people (the base); location, layout (the place); quality, inventory, supply chain management (the stuff); scheduling, maintenance (the face).",
}));
add(oneOf({
  q: "Which of the following is NOT one of the 10 strategic decisions of operations management?",
  right: ["Pricing", "Advertising", "Dividend policy", "Stock issuance", "Sales commissions", "Brand logo design"],
  wrong: TEN.map((t) => [t, `${t} IS one of the 10 strategic OM decisions.`]),
  why: "The 10 decisions: product, process, people, location, layout, quality management, inventory management, supply chain management, scheduling, and maintenance. Pricing, advertising, and finance choices belong to other functions.",
}));
const SVC = ["Intangible (for example, a ride in an airline seat)", "Produced and consumed at the same time", "Unique to each customer (for example, your medical care)", "High customer interaction", "Inconsistent product definition", "Often knowledge-based and hard to automate", "Dispersed: can happen at a store, an office, a house call, or online", "Quality may be hard to evaluate", "Reselling is unusual"];
const GDS = ["Tangible (for example, the airline seat itself)", "Can usually be kept in inventory", "Similar products are produced", "Limited customer involvement in production", "Product is standardized", "Standard product makes automation feasible", "Typically produced at a fixed facility", "Many aspects of quality are easy to evaluate", "Often has some residual value"];
add(oneOf({ q: "Which is a characteristic of SERVICES rather than goods?", right: SVC, wrong: GDS.map((g) => [g, "That describes GOODS."]), why: "Services: intangible, produced and consumed simultaneously, unique, high customer interaction, inconsistent definition, knowledge-based, dispersed, quality hard to evaluate, reselling unusual (Table 1.3)." }));
add(oneOf({ q: "Which is a characteristic of GOODS rather than services?", right: GDS, wrong: SVC.map((g) => [g, "That describes SERVICES."]), why: "Goods: tangible, can be inventoried, similar products, limited customer involvement, standardized, automation feasible, made at a fixed facility, quality easy to evaluate, some residual value (Table 1.3)." }));
add(concept({
  q: "Which statement about production and productivity is TRUE?",
  a: "Productivity is the ratio of outputs to inputs; production measures output only, not efficiency",
  w: [["Production and productivity mean the same thing", "Production is output only. Productivity is output ÷ input."], ["Productivity measures output only", "That's production. Productivity divides output by input."], ["Making more units always means productivity went up", "Not if it took even more input. Productivity = output ÷ input."]],
  why: "Production is the creation of goods and services (output only). Productivity = outputs ÷ inputs, a measure of efficiency. The objective is to improve productivity.",
}));
add(oneOf({
  q: ["Which is NOT a reason productivity improvement is harder in the service sector?", "Productivity tends to be lower in services than in manufacturing. Which of the following is NOT a reason?"],
  right: ["Services are typically capital intensive", "Services are easy to automate", "Service quality is easy to evaluate", "Services are highly standardized"],
  wrong: [["Services are typically labor intensive", "That IS a reason."], ["Services are often focused on unique individual attributes or desires", "That IS a reason."], ["Services are often an intellectual task performed by professionals", "That IS a reason."], ["Services are often difficult to mechanize and automate", "That IS a reason."], ["Services are often difficult to evaluate for quality", "That IS a reason."]],
  why: "Service productivity is hard to improve because services are typically labor intensive, focused on unique desires, intellectual tasks by professionals, hard to automate, and hard to evaluate for quality.",
}));
add(concept({
  v: [
    { q: "Which variable contributes the LARGEST share (about 52%) of the annual increase in productivity?", a: "Management" },
    { q: "Which variable contributes about 38% of the annual increase in productivity?", a: "Capital" },
    { q: "Which variable contributes the SMALLEST share (about 10%) of the annual increase in productivity?", a: "Labor" },
  ],
  pool: ["Management", "Capital", "Labor", "Energy"],
  notes: { Management: "Management contributes about 52%.", Capital: "Capital contributes about 38%.", Labor: "Labor contributes about 10%.", Energy: "Energy isn't one of the three productivity variables." },
  why: "The three productivity variables: labor (~10% of the annual increase), capital (~38%), and management (~52%).",
}));
add(oneOf({
  q: "Which is a productivity MEASUREMENT problem?",
  right: ["Quality may change while the quantity of inputs and outputs stays the same", "External elements may cause productivity to rise or fall", "Precise units of measure may be lacking"],
  wrong: [["Productivity can only be measured in dollars", "Productivity can use units (per labor-hour) or dollars."], ["Single-factor productivity can't be calculated for services", "It can: titles per labor-hour, patients per nurse-hour, and so on."], ["Production and productivity always move together", "That isn't a measurement problem, and it isn't true."], ["Multifactor productivity ignores labor", "Multifactor includes labor along with every other input."]],
  why: "Measurement problems: quality can change while quantities stay constant, outside factors can move productivity, and precise units of measure may be lacking.",
}));

level("Mission & Strategy (Ch. 2)");
add(concept({
  v: [
    { q: "The purpose or rationale for an organization's existence, answering \"What do we contribute to society?\", is its:", a: "Mission" },
    { q: "An organization's action plan to achieve its mission is its:", a: "Strategy" },
    { q: "Which tells an organization WHERE it is going?", a: "Mission" },
    { q: "Which tells an organization HOW to get there?", a: "Strategy" },
  ],
  pool: ["Mission", "Strategy", "Core competency", "Key success factor"],
  notes: { Mission: "The mission is the purpose for being: where the organization is going.", Strategy: "Strategy is the action plan: how to get there.", "Core competency": "A core competency is something a firm does especially well, not its purpose or plan.", "Key success factor": "Key success factors support core competencies; they aren't the mission or the plan itself." },
  why: "Mission statements tell an organization where it is going (its purpose). Strategies tell it how to get there (the action plan).",
}));
add(concept({
  v: [
    { q: "A theme park uses music, scents, and hands-on rides so guests \"experience\" the product with all five senses. This is competing on:", a: "Differentiation" },
    { q: "A furniture maker offers custom fabrics and hand-finished details that customers see as adding value. This is competing on:", a: "Differentiation" },
    { q: "A restaurant with an open kitchen, live music, and table-side cooking stands out from the chains. This is competing on:", a: "Differentiation" },
    { q: "A discount retailer uses huge scale, cross-docking, and pressure on suppliers to keep prices the lowest in town. This is competing on:", a: "Cost leadership" },
    { q: "An airline flies one type of plane, has no assigned seats, and turns planes around quickly to keep costs down. This is competing on:", a: "Cost leadership" },
    { q: "A store-brand grocery line gives shoppers the maximum value they perceive for the lowest price. This is competing on:", a: "Cost leadership" },
    { q: "A printer company quickly adjusts its designs and volumes as the market shifts. This is competing on:", a: "Response" },
    { q: "A machine builder is known for meeting every delivery schedule it promises. This is competing on:", a: "Response" },
    { q: "A clothing retailer moves new designs from sketch to store shelf in two weeks. This is competing on:", a: "Response" },
  ],
  pool: ["Differentiation", "Cost leadership", "Response", "Outsourcing"],
  notes: { Differentiation: "Differentiation = better, or at least different, in a way the customer values.", "Cost leadership": "Cost leadership = cheaper: maximum perceived value at low cost.", Response: "Response = rapid response: flexibility, reliability, and timeliness.", Outsourcing: "Outsourcing moves work to outside suppliers. It isn't one of the three competitive strategies." },
  why: "Three strategies for competitive advantage: differentiation (better or different), cost leadership (cheaper), and response (flexible, reliable, quick).",
}));
add(concept({
  v: [
    { q: "Competing on response includes FLEXIBILITY, which means:", a: "Matching market changes in design innovation and volumes" },
    { q: "Competing on response includes RELIABILITY, which means:", a: "Meeting schedules" },
    { q: "Competing on response includes TIMELINESS, which means:", a: "Quickness in design, production, and delivery" },
  ],
  pool: ["Matching market changes in design innovation and volumes", "Meeting schedules", "Quickness in design, production, and delivery", "Offering the lowest price in the market"],
  notes: { "Matching market changes in design innovation and volumes": "That's flexibility.", "Meeting schedules": "That's reliability.", "Quickness in design, production, and delivery": "That's timeliness.", "Offering the lowest price in the market": "That's cost leadership, not response." },
  why: "Response has three parts: flexibility (matching changes in design and volume), reliability (meeting schedules), and timeliness (quick design, production, and delivery).",
}));
add(concept({
  q: ["Which statement about competing on cost is TRUE?", "Cost leadership means:"],
  a: "Providing the maximum value as perceived by the customer; it does not imply low quality",
  w: [["Selling the lowest-quality product on the market", "Competing on cost does NOT imply low quality."], ["Charging premium prices for unique features", "That's differentiation."], ["Delivering faster than any competitor", "That's response."]],
  why: "Competing on cost means providing the maximum value as perceived by the customer. It does not imply low quality.",
}));
add(concept({
  q: "Engaging a customer through imaginative use of the five senses, so the customer \"experiences\" the product, is called:",
  a: "Experience differentiation",
  w: [["Mass customization", "Mass customization is rapid, low-cost production for unique customer wants (Ch. 7)."], ["Cost leadership", "Cost leadership competes on price and value, not sensory experience."], ["Timeliness", "Timeliness is quickness, part of response."]],
  why: "Experience differentiation engages the five senses: theme parks, movie theaters with moving seats, restaurants with open kitchens.",
}));

level("Product Life Cycle");
const PLC = {
  Introduction: ["Product design and development are critical", "Frequent product and process design changes", "Short production runs and high production costs", "Only a limited number of models", "Research and development engineering is critical"],
  Growth: ["The best period to increase market share", "The most practical time to change price or quality image", "Forecasting is critical", "Increase capacity and enhance distribution", "Shift toward a product focus"],
  Maturity: ["A poor time to change image, price, or quality", "Competitive costs become critical; defend market position", "Standardization and long production runs", "Fewer product changes, more minor changes", "Optimum capacity and increasing stability of the process"],
  Decline: ["Cost control is critical", "Little product differentiation and cost minimization", "Overcapacity in the industry", "Prune the line to eliminate items not returning a good margin", "Reduce capacity"],
};
add(concept({
  v: Object.keys(PLC).flatMap((st) => PLC[st].map((s) => ({ q: `Which stage of the product life cycle best fits this strategy or issue? <b>"${s}"</b>`, a: st }))),
  pool: ["Introduction", "Growth", "Maturity", "Decline"],
  notes: { Introduction: "Introduction: design and development are critical, frequent changes, short runs, high costs, limited models.", Growth: "Growth: best time to gain market share, practical to change price or quality image, forecasting critical, add capacity.", Maturity: "Maturity: poor time to change image, competitive costs critical, standardization, long runs.", Decline: "Decline: cost control critical, overcapacity, prune the line, reduce capacity." },
  why: "Introduction → design is critical; Growth → grow share, add capacity, forecasting critical; Maturity → defend position, standardize, control costs; Decline → cost control, prune, reduce capacity.",
}));
add(concept({
  q: "As a product moves through its life cycle, which statement about forecasting is TRUE?",
  a: "Introduction and growth require longer forecasts than maturity and decline",
  w: [["Maturity requires the longest forecasts", "Introduction and growth need longer forecasts."], ["Forecasts aren't useful once a product is introduced", "Forecasts help project staffing, inventory, and capacity through the whole life cycle."], ["Every stage uses the same forecast length", "Introduction and growth require longer forecasts than maturity and decline."]],
  why: "Introduction and growth require longer forecasts than maturity and decline. Through the life cycle, forecasts help project staffing, inventory levels, and factory capacity.",
}));

level("Outsourcing");
add(concept({
  q: ["Outsourcing is:", "Which is the best definition of outsourcing?"],
  a: "Transferring activities that have traditionally been internal to external suppliers",
  w: [["Buying a supplier so you can make the parts yourself", "That's vertical integration (backward), the opposite direction."], ["Moving production to a company-owned plant overseas", "If the company still owns it, the work isn't outsourced."], ["Hiring more full-time employees", "Outsourcing moves work OUT of the company."]],
  why: "Outsourcing transfers activities that have traditionally been internal to external suppliers (for example, IT, payroll, legal services, production).",
}));
add(concept({
  q: "\"If an external provider can perform an activity more productively than the purchasing firm, the external provider should do the work.\" This is the:",
  a: "Theory of comparative advantage",
  w: [["Bullwhip effect", "The bullwhip effect is about growing order swings up the supply chain."], ["Theory of constraints", "That's about bottlenecks."], ["Product life cycle", "The product life cycle describes stages of a product's sales."]],
  why: "The theory of comparative advantage drives outsourcing: let the more productive provider do the work so the firm can focus on its core competencies.",
}));
add(oneOf({
  q: "Outsourcing is accelerating. Which is NOT one of the reasons?",
  right: ["Rising transportation costs", "Less reliable shipping", "Slower telecommunications", "Shrinking technological expertise among suppliers"],
  wrong: [["Increased technological expertise", "That IS a reason."], ["More reliable and cheaper transportation", "That IS a reason."], ["Rapid development and deployment of advances in telecommunications and computers", "That IS a reason."]],
  why: "Outsourcing is accelerating because of increased technological expertise, more reliable and cheaper transportation, and rapid advances in telecommunications and computers.",
}));
add(concept({
  q: "By outsourcing activities an outside provider does more productively, a firm can focus on its:",
  a: "Core competencies",
  w: [["Bottlenecks", "Bottlenecks are capacity constraints, not what a firm should focus on."], ["Safety stock", "Safety stock is an inventory buffer."], ["Product life cycle", "Outsourcing frees a firm to focus on what it does best: core competencies."]],
  why: "Outsourcing lets the purchasing firm focus on its core competencies. Insufficient analysis is the most common reason outsourcing fails.",
}));

level("Process Strategy (Ch. 7)");
add(concept({
  v: [
    { q: "A hospital where each patient follows a different route through many departments uses which process strategy?", a: "Process focus" },
    { q: "A machine shop makes small batches of custom parts with general-purpose equipment and highly skilled workers. Which process strategy?", a: "Process focus" },
    { q: "A print shop does a different custom job for nearly every customer. Which process strategy?", a: "Process focus" },
    { q: "A fast-food kitchen assembles burgers from modules (patties, buns, toppings) that were prepared earlier. Which process strategy?", a: "Repetitive focus" },
    { q: "A motorcycle plant combines pre-built modules on an assembly line to offer many options. Which process strategy?", a: "Repetitive focus" },
    { q: "A potato chip plant runs the same few products continuously in very high volume. Which process strategy?", a: "Product focus" },
    { q: "A soft drink bottler runs long, continuous production runs with high fixed costs and low variable costs. Which process strategy?", a: "Product focus" },
    { q: "An online shoe company lets each customer design a pair, then builds it quickly at low cost. Which process strategy?", a: "Mass customization" },
    { q: "A laptop maker builds each computer to the buyer's exact specs and ships it within days. Which process strategy?", a: "Mass customization" },
  ],
  pool: ["Process focus", "Repetitive focus", "Product focus", "Mass customization"],
  notes: { "Process focus": "Process focus: low volume, high variety, organized around processes, general-purpose equipment.", "Repetitive focus": "Repetitive focus: assembly lines combining previously made modules.", "Product focus": "Product focus: high volume, low variety, long continuous runs.", "Mass customization": "Mass customization: rapid, low-cost production of unique customer wants." },
  why: "Process focus = low volume, high variety. Repetitive focus = modules on an assembly line. Product focus = high volume, low variety. Mass customization = flexibility of process focus with efficiency of product focus.",
}));
add(concept({
  v: [
    { q: "Facilities organized around specific activities, with general-purpose equipment, skilled personnel, high flexibility, high costs, and low equipment utilization, describes:", a: "Process focus" },
    { q: "Facilities organized as assembly lines that combine previously made modules, less flexible than process focus but more efficient, describes:", a: "Repetitive focus" },
    { q: "Facilities organized by product, with high volume, low variety, long continuous runs, high fixed cost, low variable cost, and generally less skilled labor, describes:", a: "Product focus" },
    { q: "Which strategy combines the flexibility of a process focus with the efficiency of a product focus?", a: "Mass customization" },
  ],
  pool: ["Process focus", "Repetitive focus", "Product focus", "Mass customization"],
  why: "Four process strategies: process focus, repetitive focus, product focus, and mass customization.",
}));
add(concept({
  q: "An organization's approach to transforming resources into goods and services is its:",
  a: "Process strategy",
  w: [["Mission", "The mission is the organization's purpose."], ["Capacity", "Capacity is the throughput a facility can handle."], ["Supply chain", "The supply chain is the network of organizations that supply the firm."]],
  why: "Process strategy is an organization's approach to transforming resources into goods and services, meeting customer requirements within cost and other constraints.",
}));

level("Capacity & Bottlenecks");
add(concept({
  v: [
    { q: "The maximum theoretical output of a system under ideal conditions is:", a: "Design capacity" },
    { q: "The capacity a firm expects to achieve given current operating constraints, such as planned maintenance, setups, and scheduled breaks, is:", a: "Effective capacity" },
    { q: "Output that accounts for UNPLANNED idleness (like a breakdown) in addition to planned unavailability is:", a: "Actual output" },
    { q: "The throughput, or number of units a facility can hold, receive, store, or produce in a period of time, is:", a: "Capacity" },
  ],
  pool: ["Design capacity", "Effective capacity", "Actual output", "Capacity", "Utilization"],
  notes: { "Design capacity": "Design capacity = maximum theoretical output under ideal conditions.", "Effective capacity": "Effective capacity = what you expect given planned constraints (maintenance, setups, breaks).", "Actual output": "Actual output = reality, including unplanned idleness.", Capacity: "Capacity = throughput a facility can hold, receive, store, or produce in a period.", Utilization: "Utilization = actual output ÷ design capacity, a percentage." },
  why: "Design capacity ≥ effective capacity ≥ actual output. Effective removes PLANNED downtime; actual output also reflects UNPLANNED downtime.",
}));
add(function (r) {
  const biz = r.pick([["Shelby Street Bakery", "loaves", "oven line"], ["Crimson Car Wash", "cars", "wash tunnel"], ["Riverbend Valve Works", "valves", "casting line"], ["Magnolia Mattress Co.", "mattresses", "sewing line"], ["Cahaba Cannery", "cans", "filling line"]]);
  const dc = r.step(500, 3000, 50), ec = Math.round(dc * (0.78 + r.next() * 0.14) / 10) * 10, ao = Math.round(ec * (0.82 + r.next() * 0.14) / 10) * 10;
  const target = r.pick(["dc", "ec", "ao"]);
  const val = { dc, ec, ao }[target], ans = { dc: "Design capacity", ec: "Effective capacity", ao: "Actual output" }[target];
  return C({
    story: `${biz[0]}'s ${biz[2]} could make ${n0(dc)} ${biz[1]} a day if everything ran perfectly. After scheduled cleaning, changeovers, and breaks, the manager plans on ${n0(ec)} ${biz[1]} a day. Yesterday a motor failed unexpectedly, and the line made ${n0(ao)} ${biz[1]}.`,
    ask: `The ${n0(val)} ${biz[1]} a day is the line's:`,
    choices: [{ t: ans, ok: true }].concat(["Design capacity", "Effective capacity", "Actual output", "Utilization"].filter((t) => t !== ans).map((t) => ({ t, ok: false, note: { "Design capacity": `Design capacity is the ideal maximum: ${n0(dc)}.`, "Effective capacity": `Effective capacity removes PLANNED downtime: ${n0(ec)}.`, "Actual output": `Actual output is what really happened: ${n0(ao)}.`, Utilization: "Utilization is a percentage (actual ÷ design), not a number of units." }[t] }))),
    why: `Design = ${n0(dc)} (ideal). Effective = ${n0(ec)} (after planned downtime). Actual output = ${n0(ao)} (after the unplanned breakdown, too).`,
  });
});
add(concept({
  v: [
    { q: "Utilization is:", a: "Actual output ÷ design capacity" },
    { q: "Efficiency is:", a: "Actual output ÷ effective capacity" },
  ],
  pool: ["Actual output ÷ design capacity", "Actual output ÷ effective capacity", "Effective capacity ÷ design capacity", "Design capacity ÷ actual output"],
  why: "Utilization = actual output ÷ design capacity. Efficiency = actual output ÷ effective capacity.",
}));
add(concept({
  v: [
    { q: "A limiting factor or constraint in a system, the work area with the LOWEST effective capacity, is the:", a: "Bottleneck" },
    { q: "The time of the slowest workstation (the one that takes the longest) in a production system is the:", a: "Bottleneck time" },
    { q: "The time it takes a unit to go through production from start to end, with no waiting, is the:", a: "Throughput time" },
    { q: "The time to produce one unit or a specified batch at a workstation is the:", a: "Process time" },
  ],
  pool: ["Bottleneck", "Bottleneck time", "Throughput time", "Process time", "Lead time"],
  notes: { Bottleneck: "The bottleneck is the constraint with the lowest effective capacity.", "Bottleneck time": "Bottleneck time = time of the slowest station.", "Throughput time": "Throughput time = start to finish with no waiting.", "Process time": "Process time = time to produce a unit or batch at a station.", "Lead time": "Lead time is the time between placing and receiving an order (Ch. 12)." },
  why: "The bottleneck has the lowest effective capacity. Bottleneck time is the slowest station's time. Throughput time is start-to-finish with no waiting.",
}));
add(function (r) {
  const names = r.pick([["Cut", "Sand", "Stain", "Assemble", "Inspect"], ["Mix", "Bake", "Cool", "Ice", "Box"], ["Intake", "Triage", "Exam", "Lab", "Checkout"], ["Wash", "Rinse", "Wax", "Dry", "Vacuum"]]);
  const k = r.int(4, 5), st = names.slice(0, k);
  let t; do { t = st.map(() => r.int(2, 14)); } while (new Set(t).size !== t.length);
  const imax = t.indexOf(Math.max(...t)), imin = t.indexOf(Math.min(...t));
  const ask = r.chance(0.5);
  return C({
    story: `Each unit passes through these stations in order (minutes per unit):${grid(["Station", "Minutes per unit"], st.map((s, i) => [s, t[i]]))}`,
    ask: ask ? "Which station is the bottleneck?" : "What is the bottleneck time?",
    choices: ask
      ? [{ t: st[imax], ok: true }].concat(r.sample(st.filter((_, i) => i !== imax), 3).map((s) => ({ t: s, ok: false, note: st.indexOf(s) === imin ? "That's the FASTEST station. The bottleneck is the slowest one: it takes the longest." : "The bottleneck is the station that takes the LONGEST per unit." })))
      : [{ t: t[imax] + " minutes per unit", ok: true }, { t: t[imin] + " minutes per unit", ok: false, note: "That's the fastest station. Bottleneck time is the SLOWEST station's time." }, { t: sum(t) + " minutes per unit", ok: false, note: "That's the throughput time (all stations added, no waiting)." }, { t: n2(mean(t)) + " minutes per unit", ok: false, note: "Don't average. Bottleneck time is the slowest station's time." }],
    why: `${st[imax]} takes the longest (${t[imax]} minutes), so it limits the whole line. Throughput time with no waiting would be ${sum(t)} minutes.`,
  });
});

// ================================================================== PART 3: PROJECT MANAGEMENT (Ch. 3)
part(3, "Project Management (Ch. 3)", "Planning, scheduling, and controlling; the project manager; ethics; the six CPM steps; ES, EF, LS, LF, and slack; the critical path; and crashing.");

level("Managing Projects");
add(concept({
  v: [
    { q: "Goal setting, defining the project, and organizing the team happen during project:", a: "Planning" },
    { q: "Creating the work breakdown structure happens during project:", a: "Planning" },
    { q: "Relating people, money, and supplies to specific activities, and activities to each other, is project:", a: "Scheduling" },
    { q: "Building Gantt charts and CPM/PERT networks happens during project:", a: "Scheduling" },
    { q: "Monitoring resources, costs, quality, and budgets, then revising plans and shifting resources, is project:", a: "Controlling" },
    { q: "Producing variance reports, time analysis reports, and work status reports is part of project:", a: "Controlling" },
  ],
  pool: ["Planning", "Scheduling", "Controlling", "Crashing"],
  notes: { Planning: "Planning = objectives, defining the project, WBS, resources, organization.", Scheduling: "Scheduling = activities, start/end times, the network, Gantt charts.", Controlling: "Controlling = monitor, compare, revise, act.", Crashing: "Crashing shortens a project; it isn't one of the three phases of managing a project." },
  why: "Managing a project has three phases: planning (goals, WBS, team), scheduling (relating people, money, and supplies to activities), and controlling (monitoring and revising).",
}));
add(oneOf({
  q: "Which is NOT one of the project manager's responsibilities?",
  right: ["Negotiating the company's annual union contract", "Setting the company's stock dividend", "Approving the firm's annual marketing budget", "Choosing the company's board of directors"],
  wrong: [["Making sure all necessary activities are finished in order and on time", "That IS a project manager responsibility."], ["Making sure the project comes in within budget", "That IS a project manager responsibility."], ["Making sure the project meets its quality goals", "That IS a project manager responsibility."], ["Making sure the people on the project receive motivation, direction, and information", "That IS a project manager responsibility."]],
  why: "The project manager makes sure activities finish in order and on time, the project is within budget, it meets quality goals, and people get motivation, direction, and information. PMs should be good coaches and communicators who can organize many disciplines.",
}));
add(oneOf({
  q: "Which is an ETHICAL issue a project manager may face?",
  right: ["Offers of gifts from contractors", "Pressure to alter status reports to mask delays", "False reports of charges for time and expenses", "Pressure to compromise quality to meet a schedule"],
  wrong: [["Choosing between a Gantt chart and a CPM network", "That's a scheduling-tool choice, not an ethical issue."], ["Computing slack for each activity", "That's a calculation, not an ethical issue."], ["Breaking the project into a work breakdown structure", "That's planning, not an ethical issue."], ["Picking the activity with the lowest crash cost per week", "That's a crashing decision, not an ethical issue."]],
  why: "The Project Management Institute's code addresses gifts from contractors, altering status reports to hide delays, false time and expense reports, and compromising quality to meet schedules.",
}));
add(oneOf({
  q: "A project organization is MOST helpful when:",
  right: ["The work can be defined with a specific goal and deadline", "The job is unique or somewhat unfamiliar to the existing organization", "The work has complex, interrelated tasks requiring specialized skills", "The project is temporary but critical to the organization", "The project cuts across organizational lines"],
  wrong: [["The work is routine and ongoing with no end date", "Projects are temporary with a specific goal and deadline."], ["Only one department is involved and the task is familiar", "Project organizations help when work cuts across departments and is unfamiliar."], ["The work is a simple, repetitive task", "Project organizations fit complex, interrelated tasks."]],
  why: "Project organization helps when work has a specific goal and deadline, is unique or unfamiliar, has complex interrelated tasks, is temporary but critical, and cuts across organizational lines.",
}));
const SIX = ["Define the project and prepare the work breakdown structure", "Develop relationships among the activities (decide which must precede and which must follow others)", "Draw the network connecting all the activities", "Assign time and/or cost estimates to each activity", "Compute the longest time path through the network (the critical path)", "Use the network to help plan, schedule, monitor, and control the project"];
add(concept({
  v: [
    { q: "What is the FIRST of the six steps in PERT and CPM?", a: SIX[0] },
    { q: "In PERT and CPM, which step comes right after defining the project and preparing the WBS?", a: SIX[1] },
    { q: "In PERT and CPM, which step comes right after developing the relationships among activities?", a: SIX[2] },
    { q: "In PERT and CPM, which step comes right after drawing the network?", a: SIX[3] },
    { q: "Which PERT/CPM step identifies the critical path?", a: SIX[4] },
    { q: "What is the LAST of the six steps in PERT and CPM?", a: SIX[5] },
  ],
  pool: SIX,
  why: "The six steps: (1) define the project and prepare the WBS, (2) develop relationships among activities, (3) draw the network, (4) assign time and/or cost estimates, (5) compute the longest path (critical path), (6) use the network to plan, schedule, monitor, and control.",
}));
add(concept({
  v: [
    { q: "The earliest time at which an activity can start, assuming all predecessors are complete, is its:", a: "Earliest start (ES)" },
    { q: "The earliest time at which an activity can be finished is its:", a: "Earliest finish (EF)" },
    { q: "The latest time an activity can START without delaying the entire project is its:", a: "Latest start (LS)" },
    { q: "The latest time by which an activity must be FINISHED so the project isn't delayed is its:", a: "Latest finish (LF)" },
    { q: "The length of time an activity can be delayed without delaying the entire project is its:", a: "Slack time" },
  ],
  pool: ["Earliest start (ES)", "Earliest finish (EF)", "Latest start (LS)", "Latest finish (LF)", "Slack time"],
  why: "ES and EF come from the forward pass; LS and LF come from the backward pass. Slack = LS − ES = LF − EF.",
}));
add(oneOf({
  q: "Which statement about the critical path is FALSE?",
  right: ["It is the shortest path through the network", "Critical activities have the most slack", "A delay on a critical activity never delays the project", "It is always the path with the most activities"],
  wrong: [["It is the longest path through the network", "That's TRUE."], ["It is the shortest time in which the project can be completed", "That's TRUE."], ["Any delay in a critical path activity delays the project", "That's TRUE."], ["Critical path activities have no slack time", "That's TRUE."]],
  why: "The critical path is the LONGEST path through the network, which is the SHORTEST time the project can be completed. Critical activities have zero slack, so any delay on them delays the project.",
}));
add(concept({
  v: [
    { q: "In the forward pass, when an activity has SEVERAL immediate predecessors, its ES equals:", a: "The largest EF among its immediate predecessors" },
    { q: "In the backward pass, when an activity is an immediate predecessor to SEVERAL activities, its LF equals:", a: "The smallest LS among the activities that immediately follow it" },
    { q: "Which formula gives an activity's earliest finish?", a: "EF = ES + activity time" },
    { q: "Which formula gives an activity's latest start?", a: "LS = LF − activity time" },
  ],
  pool: ["The largest EF among its immediate predecessors", "The smallest LS among the activities that immediately follow it", "EF = ES + activity time", "LS = LF − activity time", "The smallest EF among its immediate predecessors", "The largest LS among the activities that immediately follow it"],
  why: "Forward pass: ES = max(EF of predecessors), EF = ES + time. Backward pass: LF = min(LS of followers), LS = LF − time. The last activity's LF = the project's EF.",
}));
add(concept({
  v: [
    { q: "Shortening the duration of a project is called:", a: "Project crashing" },
    { q: "When crashing a project with ONE critical path, which activity should you shorten first?", a: "The critical activity that can still be crashed and has the smallest crash cost per period" },
    { q: "If crash costs are linear, the crash cost per period equals:", a: "(Crash cost − Normal cost) ÷ (Normal time − Crash time)" },
  ],
  pool: ["Project crashing", "The critical activity that can still be crashed and has the smallest crash cost per period", "(Crash cost − Normal cost) ÷ (Normal time − Crash time)", "The activity with the most slack", "Crash cost ÷ Crash time", "Project controlling"],
  why: "Crashing shortens a project. Compute crash cost per period = (crash cost − normal cost) ÷ (normal time − crash time), then shorten the cheapest critical activity that can still be crashed. Recheck the critical path after each step.",
}));
add(oneOf({
  q: "Which is a purpose or advantage of CPM and project scheduling?",
  right: ["It shows the precedence relationships among activities", "It helps pinpoint activities that need to be watched closely (critical path and slack)", "It encourages realistic time and cost estimates for each activity", "It is especially useful for scheduling and controlling large projects", "It helps make better use of people, money, and materials by identifying critical bottlenecks"],
  wrong: [["It guarantees the project will finish under budget", "No tool guarantees that."], ["It removes the need for a project manager", "CPM is a tool FOR the project manager."], ["It only works for one-person projects", "CPM is especially useful for large projects."], ["It ignores the order activities must happen in", "CPM is built on precedence relationships."]],
  why: "CPM and PERT consider precedence relationships and interdependencies, highlight critical activities, encourage realistic estimates, and help with large projects.",
}));
add(concept({
  q: "In an activity-on-node (AON) network:",
  a: "Nodes designate activities",
  w: [["Arrows designate activities", "That's activity-on-arrow (AOA)."], ["Nodes designate costs", "In AON, nodes are activities and arrows show precedence."], ["There are no precedence relationships", "Arrows between nodes show precedence."]],
  why: "AON: nodes designate activities and arrows show precedence. AOA: arrows designate activities.",
}));

// --- CPM network generator
function network(r, o) {
  o = o || {};
  const unit = o.unit || r.pick(["days", "weeks"]);
  for (let tries = 0; tries < 400; tries++) {
    const n = r.int(o.min || 5, o.max || 7);
    const ids = "ABCDEFGHIJ".slice(0, n).split("");
    const acts = ids.map((id, i) => {
      let pre = [];
      if (i === 1) pre = r.chance(0.55) ? [] : ["A"];
      else if (i > 1) pre = r.sample(ids.slice(Math.max(0, i - 4), i), r.chance(0.35) ? 2 : 1).sort();
      return { id, pre, t: r.int(o.tlo || 2, o.thi || 10) };
    });
    const hasSucc = new Set(acts.flatMap((a) => a.pre));
    const last = acts[n - 1];
    last.pre = [...new Set(last.pre.concat(acts.slice(0, n - 1).filter((a) => !hasSucc.has(a.id)).map((a) => a.id)))].sort();
    if (last.pre.length > 3 || last.pre.length === 0) continue;
    const by = {}; acts.forEach((a) => (by[a.id] = a));
    acts.forEach((a) => { a.ES = a.pre.length ? Math.max(...a.pre.map((p) => by[p].EF)) : 0; a.EF = a.ES + a.t; });
    const T = last.EF;
    for (let i = n - 1; i >= 0; i--) { const a = acts[i]; const succ = acts.filter((b) => b.pre.includes(a.id)); a.LF = succ.length ? Math.min(...succ.map((b) => b.LS)) : T; a.LS = a.LF - a.t; a.slack = a.LS - a.ES; }
    const paths = [];
    const walk = (id, tail) => { const a = by[id]; const path = [id].concat(tail); if (!a.pre.length) paths.push(path); else a.pre.forEach((p) => walk(p, path)); };
    walk(last.id, []);
    const lens = paths.map((p) => sum(p.map((id) => by[id].t)));
    const maxL = Math.max(...lens);
    if (lens.filter((l) => l === maxL).length !== 1) continue;
    if (o.minPaths && paths.length < o.minPaths) continue;
    const slackers = acts.filter((a) => a.slack > 0);
    if (slackers.length < (o.minSlack || 1)) continue;
    const cp = paths[lens.indexOf(maxL)];
    const sorted = lens.slice().sort((a, b) => b - a);
    return { acts, by, T, paths, lens, cp, unit, second: sorted[1], minPath: Math.min(...lens), slackers };
  }
  throw new Error("network generation failed");
}
function netTable(x, extra) {
  const head = ["Activity", "Immediate predecessor(s)", `Duration (${x.unit})`].concat(extra ? extra.head : []);
  return grid(head, x.acts.map((a, i) => [a.id, a.pre.length ? a.pre.join(", ") : "—", a.t].concat(extra ? extra.row(a, i) : [])), 2);
}
function passSteps(x) {
  return [`Forward pass (ES = largest EF of predecessors; EF = ES + time): ${x.acts.map((a) => `${a.id} ${a.ES}–${a.EF}`).join(", ")}.`, `Backward pass (LF = smallest LS of followers; LS = LF − time): ${x.acts.map((a) => `${a.id} ${a.LS}–${a.LF}`).join(", ")}.`, `Slack = LS − ES: ${x.acts.map((a) => `${a.id} ${a.slack}`).join(", ")}.`];
}
const PROJ = ["a new campus food truck launch", "a clinic's software upgrade", "a warehouse expansion", "a homecoming parade float", "a new product website", "a restaurant remodel", "a plant's new packaging line", "a charity 5K race"];

level("Critical Path & Duration", { intro: "Work the <b>forward pass</b> (ES = largest EF of the predecessors, EF = ES + time). The project's duration is the largest EF. The critical path is the LONGEST path from start to finish." });
add(function (r) {
  const x = network(r);
  return N({
    story: `${r.pick(FIRST)} is managing ${r.pick(PROJ)}. The activities are:${netTable(x)}`,
    ask: `What is the critical path project duration (in ${x.unit})? Enter a whole number.`, answer: x.T, dec: 0, unit: x.unit,
    hints: ["Draw the AON network: each activity points to the activities that list it as a predecessor.", "Forward pass: an activity can't start until ALL its predecessors finish, so ES = the LARGEST EF among its predecessors.", "The project duration is the EF of the last activity."],
    steps: passSteps(x).slice(0, 1).concat([`Critical path: ${x.cp.join(" → ")} = ${x.cp.map((id) => x.by[id].t).join(" + ")} = <b>${x.T}</b> ${x.unit}.`]),
    mistakes: [[sum(x.acts.map((a) => a.t)), "That adds EVERY activity. Activities on different paths happen at the same time, so take the longest path instead."], [x.minPath, "That's the SHORTEST path. The project can't finish until the LONGEST path is done."], [x.second, "That's a path, but not the longest one. Check every path from start to finish."]],
  });
});
add(function (r) {
  const x = network(r, { minPaths: 3 });
  const right = x.cp.join(" → ");
  const others = x.paths.filter((p) => p.join() !== x.cp.join()).map((p) => p.join(" → "));
  const ws = r.sample(others, 3).map((p) => [p, "That's a path, but not the longest one. Add up each path's durations."]);
  return C({
    story: `The activities for ${r.pick(PROJ)} are:${netTable(x)}`,
    ask: "Which path is the critical path?",
    choices: [{ t: right, ok: true }].concat(ws.map((w) => ({ t: w[0], ok: false, note: w[1] }))),
    why: `Path lengths: ${x.paths.map((p, i) => `${p.join("→")} = ${x.lens[i]}`).join("; ")}. The longest is ${right} (${x.T} ${x.unit}).`,
  });
});
add(function (r) {
  const x = network(r);
  const crit = r.chance(0.5), a = crit ? x.by[r.pick(x.cp)] : r.pick(x.slackers);
  const d = crit ? r.int(1, 4) : r.int(1, a.slack + 3);
  const newT = crit ? x.T + d : x.T + Math.max(0, d - a.slack);
  return N({
    story: `Here is the schedule for ${r.pick(PROJ)}:${netTable(x)}`,
    ask: `Activity ${a.id} runs ${d} ${d === 1 ? x.unit.slice(0, -1) : x.unit} longer than planned. Nothing else changes. What is the new project duration (in ${x.unit})?`, answer: newT, dec: 0, unit: x.unit,
    hints: ["First find the critical path and each activity's slack.", "A delay on a critical activity delays the whole project. A delay on a non-critical activity only delays the project by however much it exceeds that activity's slack."],
    steps: passSteps(x).concat([`Original duration = ${x.T}. Activity ${a.id} has ${a.slack} ${x.unit} of slack.`, `New duration = ${x.T} + max(0, ${d} − ${a.slack}) = <b>${newT}</b> ${x.unit}.`]),
    mistakes: [[x.T + d === newT ? -1 : x.T + d, `Activity ${a.id} has ${a.slack} ${x.unit} of slack, so only the part of the delay beyond that slack pushes the project back.`], [x.T === newT ? -1 : x.T, "That activity is on the critical path (no slack), so the whole delay pushes the project back."]],
  });
});

level("ES, EF, LS, LF & Slack", { intro: "<b>Forward pass:</b> ES = largest EF of predecessors; EF = ES + time. <b>Backward pass:</b> the last activity's LF = project duration; LF = smallest LS of the activities that follow; LS = LF − time. <b>Slack = LS − ES = LF − EF.</b>" });
for (const what of ["ES", "EF", "LS", "LF"]) {
  add(function (r) {
    const x = network(r);
    const pool = x.acts.filter((a) => (what === "ES" ? a.ES > 0 : what === "LF" ? a.LF < x.T : true));
    const a = r.pick(pool.length ? pool : x.acts);
    const ans = a[what], oth = { ES: [[a.EF, "That's the EF. ES is when it can START."], [a.LS, "That's the LATEST start (backward pass). ES comes from the forward pass."]], EF: [[a.ES, "That's the ES. EF = ES + activity time."], [a.LF, "That's the LATEST finish. EF comes from the forward pass."]], LS: [[a.ES, "That's the earliest start. LS comes from the backward pass: LS = LF − time."], [a.LF, "That's the LF. LS = LF − activity time."]], LF: [[a.EF, "That's the earliest finish. LF comes from the backward pass."], [a.LS, "That's the LS. LF = LS + time, or the smallest LS of the activities that follow."]] }[what];
    const names = { ES: "earliest start (ES)", EF: "earliest finish (EF)", LS: "latest start (LS)", LF: "latest finish (LF)" };
    return N({
      story: `The project team for ${r.pick(PROJ)} listed these activities:${netTable(x)}`,
      ask: `What is the <b>${names[what]}</b> of activity ${a.id}? Enter a whole number.`, answer: ans, dec: 0, unit: x.unit, zeroOK: true,
      hints: what === "ES" || what === "EF" ? ["Do the forward pass from the start. Activities with no predecessor start at 0.", "With several predecessors, ES = the LARGEST of their EFs. EF = ES + time."] : ["First do the forward pass to get the project duration (the last EF).", "Then go backward: the last activity's LF = project duration. LF = the SMALLEST LS of the activities that follow. LS = LF − time."],
      steps: passSteps(x).slice(0, what === "ES" || what === "EF" ? 1 : 2).concat([`Activity ${a.id}: ES ${a.ES}, EF ${a.EF}, LS ${a.LS}, LF ${a.LF}. ${what} = <b>${ans}</b>.`]),
      mistakes: oth.filter((m) => m[0] !== ans),
    });
  });
}
add(function (r) {
  const x = network(r), a = r.pick(x.slackers);
  return N({
    story: `Here are the activities for ${r.pick(PROJ)}:${netTable(x)}`,
    ask: `How much slack does activity ${a.id} have (in ${x.unit})? Enter a whole number.`, answer: a.slack, dec: 0, unit: x.unit,
    hints: ["Do the forward pass (ES, EF) and the backward pass (LS, LF).", "Slack = LS − ES (or LF − EF)."],
    steps: passSteps(x).concat([`Slack for ${a.id} = ${a.LS} − ${a.ES} = <b>${a.slack}</b> ${x.unit}.`]),
    mistakes: [[a.LF - a.ES, "Slack = LS − ES (or LF − EF). Don't mix a start with a finish."], [x.T - a.EF === a.slack ? -1 : x.T - a.EF, "Compare the activity's own latest and earliest times, not the project's end."]],
  });
});
add(function (r) {
  const x = network(r, { minSlack: 2 });
  const zero = x.acts.filter((a) => a.slack === 0).map((a) => a.id).join(", ");
  const most = x.acts.slice().sort((a, b) => b.slack - a.slack);
  if (most[0].slack === most[1].slack) {
    return C({
      story: `Activities for ${r.pick(PROJ)}:${netTable(x)}`,
      ask: "Which set lists exactly the activities with ZERO slack?",
      choices: [{ t: zero, ok: true }].concat(r.sample([x.acts.map((a) => a.id).join(", "), x.acts.filter((a) => a.slack > 0).map((a) => a.id).join(", "), x.cp.slice(0, -1).join(", ") || "None", x.acts.filter((a) => a.slack <= 1 && a.slack > 0).concat(x.acts.filter((a) => a.slack === 0)).map((a) => a.id).sort().join(", ")].filter((t, i, arr) => t !== zero && arr.indexOf(t) === i), 3).map((t) => ({ t, ok: false, note: "Do both passes and compute LS − ES for every activity. Zero-slack activities are the critical ones." }))).slice(0, 4),
      why: `Slack: ${x.acts.map((a) => `${a.id} ${a.slack}`).join(", ")}. Zero slack (critical): ${zero}.`,
    });
  }
  return C({
    story: `Activities for ${r.pick(PROJ)}:${netTable(x)}`,
    ask: "Which activity has the MOST slack?",
    choices: [{ t: "Activity " + most[0].id, ok: true }].concat(r.sample(x.acts.filter((a) => a.id !== most[0].id), 3).map((a) => ({ t: "Activity " + a.id, ok: false, note: a.slack === 0 ? `${a.id} is on the critical path: zero slack.` : `${a.id} has ${a.slack} ${x.unit} of slack. Another activity has more.` }))),
    why: `Slack: ${x.acts.map((a) => `${a.id} ${a.slack}`).join(", ")}.`,
  });
});

level("Project Crashing", { intro: "<b>Crash cost per period = (crash cost − normal cost) ÷ (normal time − crash time).</b> Only crashing a CRITICAL activity shortens the project. Pick the cheapest critical activity that can still be crashed." });
add(function (r) {
  const tn = r.int(3, 9), tc = tn - r.int(1, Math.min(3, tn - 1)), cn = r.step(4000, 60000, 500), cc = cn + (tn - tc) * r.step(250, 6000, 250);
  const unit = r.pick(["week", "day"]), ans = (cc - cn) / (tn - tc);
  return N({
    story: `Activity ${r.pick("BCDEFG".split(""))} on ${r.pick(PROJ)} normally takes ${tn} ${unit}s and costs $${n0(cn)}. Crashed, it takes ${tc} ${unit}s and costs $${n0(cc)}. Crash costs are linear.`,
    ask: `What is the crash cost per ${unit}? ${R2}`, answer: ans, unit: "$",
    hints: [`Extra cost = crash cost − normal cost. Time saved = normal time − crash time.`, `Crash cost per ${unit} = extra cost ÷ time saved.`],
    steps: [`Crash cost per ${unit} = ($${n0(cc)} − $${n0(cn)}) ÷ (${tn} − ${tc}) = $${n0(cc - cn)} ÷ ${tn - tc} = <b>${usd2(ans)}</b>.`],
    mistakes: [[cc - cn, `That's the total extra cost. Divide by the ${unit}s saved.`], [cc / tc, "Use the DIFFERENCES: (crash cost − normal cost) ÷ (normal time − crash time)."], [(cc - cn) / tn, `Divide by the ${unit}s SAVED (normal − crash), not the normal time.`], [(cc - cn) / tc, `Divide by the ${unit}s SAVED (normal − crash), not the crash time.`]],
  });
});
function crashNet(r) {
  const x = network(r, { min: 5, max: 6 });
  x.acts.forEach((a) => {
    a.can = r.chance(0.82) && a.t > 2 ? r.int(1, Math.min(3, a.t - 1)) : 0;
    a.cn = r.step(2000, 40000, 500); a.cpw = r.step(500, 5000, 250); a.cc = a.cn + a.can * a.cpw; a.tc = a.t - a.can;
  });
  return x;
}
function crashTable(x) {
  return grid(["Activity", "Predecessor(s)", "Normal time", "Crash time", "Normal cost", "Crash cost"], x.acts.map((a) => [a.id, a.pre.length ? a.pre.join(", ") : "—", a.t, a.tc, "$" + n0(a.cn), "$" + n0(a.cc)]), 2);
}
add(function (r) {
  let x, crit;
  for (let k = 0; k < 50; k++) { x = crashNet(r); crit = x.cp.map((id) => x.by[id]).filter((a) => a.can > 0); const cps = crit.map((a) => a.cpw); if (crit.length && cps.filter((c) => c === Math.min(...cps)).length === 1) break; }
  const best = crit.slice().sort((a, b) => a.cpw - b.cpw)[0];
  const nonCrit = x.acts.filter((a) => !x.cp.includes(a.id) && a.can > 0);
  const opts = [{ t: "Activity " + best.id, ok: true }];
  const seen = new Set([best.id]);
  const pushW = (a, note) => { if (a && !seen.has(a.id)) { seen.add(a.id); opts.push({ t: "Activity " + a.id, ok: false, note }); } };
  pushW(nonCrit.sort((a, b) => a.cpw - b.cpw)[0], "That activity is cheap to crash, but it isn't on the critical path, so shortening it won't shorten the project.");
  pushW(x.cp.map((id) => x.by[id]).find((a) => a.can === 0), "That activity is critical, but its crash time equals its normal time: it can't be shortened.");
  crit.sort((a, b) => b.cpw - a.cpw).forEach((a) => pushW(a, `That one is critical, but its crash cost per ${x.unit.slice(0, -1)} is $${n0(a.cpw)}. Another critical activity is cheaper.`));
  x.acts.forEach((a) => pushW(a, "Compute each critical activity's crash cost per period and pick the cheapest one that can still be crashed."));
  return C({
    story: `The team wants to finish ${r.pick(PROJ)} one ${x.unit.slice(0, -1)} early. Times are in ${x.unit}.${crashTable(x)}`,
    ask: "Which activity should be crashed FIRST?",
    choices: opts.slice(0, 4),
    why: `Critical path: ${x.cp.join(" → ")} (${x.T} ${x.unit}). Crash cost per ${x.unit.slice(0, -1)} for critical activities that can be crashed: ${crit.sort((a, b) => a.cpw - b.cpw).map((a) => `${a.id} $${n0(a.cpw)}`).join(", ")}. Cheapest: ${best.id}.`,
  });
});
add(function (r) {
  let x, crit;
  for (let k = 0; k < 50; k++) { x = crashNet(r); crit = x.cp.map((id) => x.by[id]).filter((a) => a.can > 0); if (crit.length && x.second <= x.T - 1) break; }
  const best = crit.slice().sort((a, b) => a.cpw - b.cpw)[0];
  const cheapest = x.acts.filter((a) => a.can > 0).sort((a, b) => a.cpw - b.cpw)[0];
  return N({
    story: `The team wants to finish ${r.pick(PROJ)} one ${x.unit.slice(0, -1)} early. Times are in ${x.unit}.${crashTable(x)}`,
    ask: `What is the least it will cost to shorten the project by one ${x.unit.slice(0, -1)}? ${R2}`, answer: best.cpw, unit: "$",
    hints: ["Find the critical path first (forward pass). Only critical activities shorten the project.", "For each critical activity that can be crashed: (crash cost − normal cost) ÷ (normal time − crash time). Pick the smallest."],
    steps: [`Critical path: ${x.cp.join(" → ")} = ${x.T} ${x.unit}.`, `Crash cost per ${x.unit.slice(0, -1)} (critical, crashable): ${crit.map((a) => `${a.id}: ($${n0(a.cc)} − $${n0(a.cn)}) ÷ ${a.can} = $${n0(a.cpw)}`).join("; ")}.`, `Cheapest = <b>${usd2(best.cpw)}</b> (activity ${best.id}).`],
    mistakes: [[cheapest.cpw === best.cpw ? -1 : cheapest.cpw, "That activity isn't on the critical path, so crashing it doesn't shorten the project."], [best.cc - best.cn === best.cpw ? -1 : best.cc - best.cn, "That's the cost to crash the activity ALL the way. You only need one period: use the cost per period."], [best.cc, "Use the EXTRA cost per period: (crash cost − normal cost) ÷ (normal time − crash time)."]],
  });
});

// ================================================================== PART 4: FORECASTING CONCEPTS (Ch. 4)
part(4, "Forecasting Concepts (Ch. 4)", "Time horizons, types of forecasts, the four qualitative methods, the quantitative methods, the four time-series components, and error measures.");

level("Time Horizons & Types");
const SHORT = ["Purchasing", "Job scheduling", "Workforce levels", "Job assignments", "Production levels"];
const MED = ["Sales planning", "Production planning", "Budgeting"];
const LONG = ["New product planning", "Facility location", "Expansion", "Capital expenditures", "Research and development"];
add(oneOf({ q: "Which is a typical use of a SHORT-range forecast (less than 3 months)?", right: SHORT, wrong: MED.map((m) => [m, "That's a medium-range use (3 months to 3 years)."]).concat(LONG.map((m) => [m, "That's a long-range use (3+ years)."])), why: "Short-range (under 3 months): purchasing, job scheduling, workforce levels, job assignments, production levels." }));
add(oneOf({ q: "Which is a typical use of a MEDIUM-range forecast (3 months to 3 years)?", right: MED, wrong: SHORT.map((m) => [m, "That's a short-range use (under 3 months)."]).concat(LONG.map((m) => [m, "That's a long-range use (3+ years)."])), why: "Medium-range (3 months to 3 years): sales planning, production planning, budgeting." }));
add(oneOf({ q: "Which is a typical use of a LONG-range forecast (3 years or more)?", right: LONG, wrong: SHORT.map((m) => [m, "That's a short-range use (under 3 months)."]).concat(MED.map((m) => [m, "That's a medium-range use (3 months to 3 years)."])), why: "Long-range (3+ years): new product planning, facility location, expansion, capital expenditures, research and development." }));
add(concept({
  v: [
    { q: "A short-range forecast typically covers:", a: "Less than 3 months" },
    { q: "A medium-range forecast typically covers:", a: "3 months to 3 years" },
    { q: "A long-range forecast typically covers:", a: "3 years or more" },
  ],
  pool: ["Less than 3 months", "3 months to 3 years", "3 years or more", "Exactly 1 year"],
  why: "Short-range: under 3 months. Medium-range: 3 months to 3 years. Long-range: 3+ years.",
}));
add(oneOf({
  q: "Which statement about forecast time horizons is TRUE?",
  right: ["Short-term forecasts tend to be more accurate than longer-term forecasts", "Short-term forecasting usually uses different methods than longer-term forecasting", "Medium- and long-range forecasts deal with more comprehensive issues, like plants and products"],
  wrong: [["Long-term forecasts tend to be more accurate than short-term forecasts", "It's the reverse: short-term forecasts tend to be more accurate."], ["All time horizons use exactly the same methods", "Short-term forecasting usually uses different methods."], ["Short-range forecasts support facility location decisions", "Facility location is a long-range decision."]],
  why: "Short-term forecasts are usually more accurate and use different methods. Medium/long-range forecasts support broader decisions about products, plants, and processes.",
}));
add(concept({
  v: [
    { q: "A forecast of the inflation rate, money supply, and housing starts is a(n):", a: "Economic forecast" },
    { q: "A forecast of the rate of technological progress, which affects new product development, is a(n):", a: "Technological forecast" },
    { q: "A forecast of sales of a company's existing products and services is a(n):", a: "Demand forecast" },
  ],
  pool: ["Economic forecast", "Technological forecast", "Demand forecast", "Qualitative forecast"],
  notes: { "Economic forecast": "Economic forecasts address the business cycle: inflation, money supply, housing starts.", "Technological forecast": "Technological forecasts predict the rate of technological progress.", "Demand forecast": "Demand forecasts predict sales of existing products and services.", "Qualitative forecast": "Qualitative is a METHOD (judgment-based), not one of the three types." },
  why: "Three types of forecasts: economic (business cycle), technological (rate of progress), and demand (sales of existing products).",
}));
add(concept({
  q: "Forecasting is best defined as:",
  a: "The art and science of predicting future events",
  w: [["Guaranteeing what demand will be", "Forecasts are seldom perfect."], ["Recording last period's actual sales", "That's historical data, not a forecast."], ["Setting control limits for a process", "That's SPC (Ch. 6s)."]],
  why: "Forecasting is the art and science of predicting future events: the underlying basis of all business decisions (production, inventory, personnel, facilities).",
}));

level("Qualitative Methods");
add(concept({
  v: [
    { q: "A small group of high-level managers pools their opinions, sometimes with statistical models, to estimate demand. Which method?", a: "Jury of executive opinion" },
    { q: "Which method's main disadvantage is \"group-think\"?", a: "Jury of executive opinion" },
    { q: "A panel of experts is queried iteratively until a consensus is reached. Which method?", a: "Delphi method" },
    { q: "Which method uses three types of participants: decision makers, staff personnel, and respondents?", a: "Delphi method" },
    { q: "Each salesperson projects his or her own sales, and the estimates are combined at the district and national levels. Which method?", a: "Sales force composite" },
    { q: "Which method uses people who know what customers want but tends to be overly optimistic about their own territories?", a: "Sales force composite" },
    { q: "A company simply asks customers about their purchasing plans. Which method?", a: "Consumer market survey" },
    { q: "Which method is useful for new product planning, though what people SAY they'll buy and what they DO often differ?", a: "Consumer market survey" },
  ],
  pool: ["Jury of executive opinion", "Delphi method", "Sales force composite", "Consumer market survey", "Exponential smoothing"],
  notes: { "Jury of executive opinion": "Jury of executive opinion: high-level experts and managers estimate demand together (risk: group-think).", "Delphi method": "Delphi: iterative expert panel until consensus; three participant types (decision makers, staff, respondents).", "Sales force composite": "Sales force composite: each salesperson projects sales; combined upward; tends to be optimistic.", "Consumer market survey": "Consumer market survey: ask the customer.", "Exponential smoothing": "Exponential smoothing is a QUANTITATIVE method." },
  why: "Four qualitative methods: jury of executive opinion, Delphi method, sales force composite, and consumer market survey.",
}));
add(concept({
  v: [
    { q: "A company is launching a brand-new product with no sales history. Which approach fits best?", a: "Qualitative methods" },
    { q: "Which approach relies on intuition, emotions, personal experience, and value systems?", a: "Qualitative methods" },
    { q: "A grocery chain has 5 years of stable weekly sales for an existing product. Which approach fits best?", a: "Quantitative methods" },
    { q: "Which approach uses mathematical techniques on historical data when the situation is stable?", a: "Quantitative methods" },
  ],
  pool: ["Qualitative methods", "Quantitative methods", "Statistical process control"],
  notes: { "Statistical process control": "SPC monitors a process for quality (Ch. 6s); it isn't a forecasting approach." },
  why: "Qualitative: vague situation, little data (new products, new technology). Quantitative: stable situation with historical data (existing products, current technology).",
}));

level("Quantitative Methods & Components");
add(concept({
  v: [
    { q: "Which method assumes demand next period will equal demand in the most recent period?", a: "Naive approach" },
    { q: "Which method is a series of arithmetic means, used when there is little or no trend?", a: "Moving average" },
    { q: "Which method uses an average where older data are given less importance, with weights based on experience and intuition?", a: "Weighted moving average" },
    { q: "Which method is a form of weighted moving average where weights decline exponentially and a smoothing constant α is chosen?", a: "Exponential smoothing" },
    { q: "Which method fits a line to historical data with the least squares technique to project into the medium to long range?", a: "Trend projection" },
    { q: "Which method predicts the dependent variable from one or more OTHER independent variables (an associative model)?", a: "Linear regression" },
  ],
  pool: ["Naive approach", "Moving average", "Weighted moving average", "Exponential smoothing", "Trend projection", "Linear regression"],
  why: "Time-series methods: naive, moving average, weighted moving average, exponential smoothing, trend projection. Associative model: linear regression.",
}));
add(concept({
  v: [
    { q: "Which quantitative method is an ASSOCIATIVE model rather than a time-series model?", a: "Linear regression" },
    { q: "A time-series forecast is based on:", a: "Only past values of the variable being forecast" },
  ],
  pool: ["Linear regression", "Only past values of the variable being forecast", "Exponential smoothing", "Moving average", "The opinions of a panel of experts"],
  why: "Time-series forecasts use only past values of the variable. Associative models (linear regression) use other variables to predict it.",
}));
add(oneOf({
  q: "Which statement about exponential smoothing is TRUE?",
  right: ["Choose a HIGH α when the underlying average is likely to change", "Choose a LOW α when the underlying average is stable", "The most recent data are weighted the most", "It requires very little record keeping of past data"],
  wrong: [["A higher α gives MORE weight to older data", "Higher α weights RECENT data more."], ["α can be any number, including negative numbers", "α is between 0 and 1."], ["Exponential smoothing weights every past period equally", "That's a simple moving average."], ["Choose a high α when demand is very stable", "Use a low α for stable demand; a high α reacts quickly to change."]],
  why: "F(t) = F(t−1) + α(A(t−1) − F(t−1)), with 0 ≤ α ≤ 1. High α reacts quickly (use when the average is changing); low α smooths (use when stable).",
}));
add(oneOf({
  q: "Which statement about moving averages is TRUE?",
  right: ["Increasing n smooths the forecast but makes it less sensitive to change", "Moving averages don't forecast trends well", "Moving averages require extensive historical data", "A moving average is used when there is little or no trend"],
  wrong: [["Increasing n makes the forecast MORE sensitive to change", "A larger n smooths more and reacts LESS."], ["Moving averages are the best method for strong trends", "Moving averages don't forecast trends well."], ["Moving averages need no historical data", "They require historical data."]],
  why: "Moving averages smooth the data. Larger n = smoother but slower to react. They don't handle trends well and need historical data.",
}));
add(concept({
  v: [
    { q: "A persistent, overall upward or downward pattern lasting several years is the:", a: "Trend component" },
    { q: "A regular pattern of up-and-down fluctuations due to weather or customs, occurring within a single year (or week, or day), is the:", a: "Seasonal component" },
    { q: "Repeating up-and-down movements over MULTIPLE years, tied to the business cycle and political or economic factors, is the:", a: "Cyclical component" },
    { q: "\"Blips\" caused by chance and unusual situations that follow no pattern and cannot be predicted are the:", a: "Random component" },
    { q: "Ice cream sales rise every summer and fall every winter. Which time-series component is this?", a: "Seasonal component" },
    { q: "A city's water demand has grown steadily for 15 years as the population increased. Which component is this?", a: "Trend component" },
    { q: "New-home sales rise and fall over 6–8 year stretches along with the economy. Which component is this?", a: "Cyclical component" },
    { q: "A restaurant's sales spike one Tuesday because a tour bus stopped unexpectedly. Which component is this?", a: "Random component" },
  ],
  pool: ["Trend component", "Seasonal component", "Cyclical component", "Random component"],
  why: "Four time-series components: trend (long-run direction), seasonal (regular pattern within a year/week/day), cyclical (multi-year business-cycle swings), random (unpredictable blips).",
}));
add(concept({
  v: [
    { q: "Which error measure tells you, on average, how much the forecast missed the target (in units)?", a: "Mean absolute deviation (MAD)" },
    { q: "Which error measure averages the SQUARED differences between forecast and actual values?", a: "Mean squared error (MSE)" },
    { q: "Which error measure expresses the average error as a percentage of actual values?", a: "Mean absolute percent error (MAPE)" },
    { q: "The ratio of cumulative forecast errors to MAD, used to monitor a forecast for bias, is the:", a: "Tracking signal" },
  ],
  pool: ["Mean absolute deviation (MAD)", "Mean squared error (MSE)", "Mean absolute percent error (MAPE)", "Tracking signal"],
  why: "MAD = how much the forecast missed. MSE = the square of how much it missed. MAPE = the average percent error. Tracking signal = cumulative error ÷ MAD. Pick the model with the LOWEST error.",
}));
add(oneOf({
  q: "Which is one of the seven steps in forecasting?",
  right: ["Determine the use of the forecast", "Select the items to be forecasted", "Determine the time horizon of the forecast", "Select the forecasting model(s)", "Gather the data", "Make the forecast", "Validate and implement the results"],
  wrong: [["Guarantee the forecast is perfect", "Forecasts are seldom perfect."], ["Crash the critical path", "That's project management."], ["Compute the reorder point", "That's inventory management."], ["Set the control limits", "That's SPC."]],
  why: "Seven steps: determine the use, select items, determine the time horizon, select model(s), gather data, make the forecast, validate and implement.",
}));

// ================================================================== PART 5: FORECASTING MATH (Ch. 4)
part(5, "Forecasting Math (Ch. 4)", "Naive, moving averages, weighted moving averages, exponential smoothing, MAD/MSE/MAPE, trend projection, linear regression, and seasonal indices.");

const FCB = [
  { name: "Hillcrest Grocery", item: "rotisserie chickens sold" },
  { name: "Riverbend Cycles", item: "bikes sold" },
  { name: "Crimson Ride", item: "rides given (hundreds)" },
  { name: "Druid City Pizza", item: "large pizzas sold" },
  { name: "Lakeside Marina", item: "boat rentals" },
  { name: "Campus Bookstore", item: "hoodies sold" },
  { name: "Northport Animal Clinic", item: "patient visits" },
  { name: "Gulf Coast Kayaks", item: "kayak rentals" },
  { name: "Shelby Street Bakery", item: "dozen cookies sold" },
  { name: "Magnolia Streaming", item: "new subscribers (thousands)" },
];
function series(r, k, lo, hi, drift) {
  let v = r.int(lo, hi); const out = [];
  for (let i = 0; i < k; i++) { out.push(Math.max(5, Math.round(v))); v += (drift || 0) + (r.next() - 0.5) * (hi - lo) * 0.35; }
  return out;
}
function monthsData(r, k) {
  const b = r.pick(FCB), start = r.int(0, 11 - k), ms = MONTHS.slice(start, start + k + 1);
  const lo = r.int(20, 400), d = series(r, k, lo, Math.round(lo * 1.4), r.int(-3, 6));
  return { b, ms, d, k };
}
const mTable = (x, label, upto) => grid(["Month", "Actual " + label], x.ms.slice(0, upto).map((m, i) => [m, i < x.d.length ? n0(x.d[i]) : ""]));

level("Naive & Moving Averages", { intro: "<b>Naive:</b> next period = the most recent actual. <b>n-period moving average:</b> add the n most recent actuals BEFORE the period you're forecasting, then divide by n." });
add(function (r) {
  const x = monthsData(r, r.int(4, 6)), nxt = x.ms[x.k];
  return N({
    story: `${x.b.name} tracks ${x.b.item}:${mTable(x, x.b.item, x.k)}`,
    ask: `Using the <b>naive</b> approach, what is the forecast for ${nxt}?`, answer: x.d[x.k - 1], unit: "",
    hints: ["The naive approach assumes next period = the most recent period."],
    steps: [`Naive forecast for ${nxt} = ${x.ms[x.k - 1]}'s actual = <b>${n0(x.d[x.k - 1])}</b>.`],
    mistakes: [[mean(x.d), "That's the average of all months. Naive just repeats the most recent actual."], [x.d[0], "Use the MOST RECENT month, not the first one."]],
  });
});
add(function (r) {
  const k = r.int(5, 7), n = r.pick([2, 3, 3, 4]), x = monthsData(r, k), nxt = x.ms[k];
  const w = x.d.slice(k - n), ans = mean(w);
  return N({
    story: `${x.b.name}'s manager wants a forecast for ${nxt}.${mTable(x, x.b.item, k)}`,
    ask: `Using a <b>${n}-month moving average</b>, what is the forecast for ${nxt}? ${R2}`, answer: ans, unit: "",
    hints: [`Take the ${n} most recent months before ${nxt}.`, `Add them and divide by ${n}.`],
    steps: [`(${w.map(n0).join(" + ")}) ÷ ${n} = ${n0(sum(w))} ÷ ${n} = <b>${n2(ans)}</b>.`],
    mistakes: [[mean(x.d), `Average only the ${n} most recent months, not all of them.`], [sum(w), `Divide by ${n}.`], [mean(x.d.slice(k - n - 1, k - 1)), "Your window is one month too early. Use the months right before the forecast month."], [n === 3 ? mean(x.d.slice(k - 2)) : mean(x.d.slice(k - 3)), `Use exactly ${n} months.`]],
  });
});
add(function (r) {
  const k = r.int(6, 7), n = r.pick([2, 3]), x = monthsData(r, k), j = r.int(n + 1, k - 1), tgt = x.ms[j];
  const w = x.d.slice(j - n, j), ans = mean(w);
  return N({
    story: `${x.b.name} wants to check how a moving average WOULD have done last year.${mTable(x, x.b.item, k)}`,
    ask: `What is the ${n}-month moving average forecast for <b>${tgt}</b>? ${R2}`, answer: ans, unit: "",
    hints: [`A forecast for ${tgt} can only use months BEFORE ${tgt}.`, `Average the ${n} months right before ${tgt}.`],
    steps: [`Months before ${tgt}: ${x.ms.slice(j - n, j).join(", ")}.`, `(${w.map(n0).join(" + ")}) ÷ ${n} = <b>${n2(ans)}</b>.`],
    mistakes: [[mean(x.d.slice(j - n + 1, j + 1)), `Don't include ${tgt}'s own actual. A forecast for ${tgt} uses only earlier months.`], [mean(x.d.slice(k - n)), `That's the forecast for ${x.ms[k]}. You need ${tgt}.`]],
  });
});

level("Weighted Moving Average", { intro: "<b>WMA = Σ(weight × demand) ÷ Σ(weights).</b> The biggest weight goes on the MOST RECENT period. If the weights already add to 1, dividing by Σweights changes nothing; if they're whole numbers (like 3, 2, 1), you must divide." });
add(function (r) {
  const k = r.int(4, 6), x = monthsData(r, k), nxt = x.ms[k];
  const W = r.pick([[0.5, 0.3, 0.2], [0.6, 0.3, 0.1], [0.5, 0.4, 0.1], [0.4, 0.35, 0.25], [0.7, 0.2, 0.1], [0.45, 0.35, 0.2], [0.4, 0.3, 0.3]]);
  const rec = x.d.slice(k - 3).reverse(), ans = sum(W.map((w, i) => w * rec[i]));
  return N({
    story: `${x.b.name} uses a 3-month weighted moving average with weights ${W.join(", ")} (apply ${W[0]} to the most recent month).${mTable(x, x.b.item, k)}`,
    ask: `What is the forecast for ${nxt}? ${R2}`, answer: ans, unit: "",
    hints: [`${W[0]} × ${x.ms[k - 1]} + ${W[1]} × ${x.ms[k - 2]} + ${W[2]} × ${x.ms[k - 3]}.`, "These weights add to 1, so no extra division is needed."],
    steps: [`${W[0]}(${n0(rec[0])}) + ${W[1]}(${n0(rec[1])}) + ${W[2]}(${n0(rec[2])}) = <b>${n2(ans)}</b>.`],
    mistakes: [[sum(W.map((w, i) => w * rec[2 - i])), "Weights are backward. The biggest weight goes on the MOST RECENT month."], [mean(rec), "That's a simple average. Apply the weights."], [sum(W.map((w, i) => w * x.d.slice(k - 4, k - 1).reverse()[i])) || -1, "Your window is one month too early."]],
  });
});
add(function (r) {
  const k = r.int(5, 6), x = monthsData(r, k), j = r.int(3, k - 1), tgt = x.ms[j];
  const W = r.pick([[0.5, 0.4, 0.1], [0.6, 0.3, 0.1], [0.5, 0.3, 0.2], [0.55, 0.3, 0.15]]);
  const rec = x.d.slice(j - 3, j).reverse(), ans = sum(W.map((w, i) => w * rec[i]));
  return N({
    story: `Your manager at ${x.b.name} asks you to test a 3-period weighted moving average with weights ${W.join(", ")} (${W[0]} on the most recent period).${mTable(x, x.b.item, k)}`,
    ask: `What would the 3-period weighted moving average forecast have been for <b>${tgt}</b>? ${R2}`, answer: ans, unit: "",
    hints: [`A forecast for ${tgt} uses the three months BEFORE ${tgt}: ${x.ms.slice(j - 3, j).join(", ")}.`, `${W[0]} goes on ${x.ms[j - 1]}.`],
    steps: [`${W[0]}(${n0(rec[0])}) + ${W[1]}(${n0(rec[1])}) + ${W[2]}(${n0(rec[2])}) = <b>${n2(ans)}</b>.`],
    mistakes: [[sum(W.map((w, i) => w * x.d.slice(j - 2, j + 1).reverse()[i])), `Don't use ${tgt}'s own actual. Use the three months before it.`], [sum(W.map((w, i) => w * rec[2 - i])), "Weights are backward."], [mean(rec), "Apply the weights."]],
  });
});
add(function (r) {
  const k = r.int(4, 6), x = monthsData(r, k), nxt = x.ms[k];
  const W = r.pick([[3, 2, 1], [4, 2, 1], [5, 3, 2], [4, 3, 2, 1], [3, 2, 1, 1]]);
  const m = W.length, rec = x.d.slice(k - m).reverse(), top = sum(W.map((w, i) => w * rec[i])), ans = top / sum(W);
  return N({
    story: `${x.b.name} weights recent months more heavily: ${W.map((w, i) => `${w} for ${i === 0 ? "last month" : i === 1 ? "two months ago" : i === 2 ? "three months ago" : "four months ago"}`).join(", ")}.${mTable(x, x.b.item, k)}`,
    ask: `What is the weighted moving average forecast for ${nxt}? ${R2}`, answer: ans, unit: "",
    hints: ["Multiply each month by its weight and add them up.", `These weights are whole numbers, so divide by the sum of the weights (${sum(W)}).`],
    steps: [`Σ(weight × demand) = ${W.map((w, i) => `${w}(${n0(rec[i])})`).join(" + ")} = ${n0(top)}.`, `÷ Σweights ${sum(W)} = <b>${n2(ans)}</b>.`],
    mistakes: [[top, `Divide by the sum of the weights (${sum(W)}).`], [top / m, `Divide by the sum of the WEIGHTS (${sum(W)}), not the number of months.`], [sum(W.map((w, i) => w * rec[m - 1 - i])) / sum(W), "Weights are backward: the biggest weight goes on last month."]],
  });
});

level("Exponential Smoothing", { intro: "<b>F(t) = F(t−1) + α × (A(t−1) − F(t−1))</b>: new forecast = last forecast + α × (last actual − last forecast). α is between 0 and 1." });
add(function (r) {
  const A = r.int(80, 900), F = Math.round(A * (0.85 + r.next() * 0.3)), al = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7]);
  const ans = F + al * (A - F), b = r.pick(FCB);
  return N({
    story: `${b.name} forecast ${n0(F)} ${b.item} for this period. Actual demand turned out to be ${n0(A)}. They use exponential smoothing with α = ${al}.`,
    ask: `What is the forecast for NEXT period? ${R2}`, answer: ans, unit: "",
    hints: ["New forecast = last forecast + α × (last actual − last forecast).", `Error = ${n0(A)} − ${n0(F)} = ${A - F}.`],
    steps: [`F = ${n0(F)} + ${al} × (${n0(A)} − ${n0(F)}) = ${n0(F)} + ${al} × ${A - F} = <b>${n2(ans)}</b>.`],
    mistakes: [[A + al * (F - A), "You swapped the roles. Start from last period's FORECAST and adjust toward the actual."], [al * (A - F), "That's only the adjustment. Add it to last period's forecast."], [F - al * (A - F), "Add α × (actual − forecast); don't subtract it."], [al * A, "Use the full formula: F + α(A − F)."]].filter((m) => Math.abs(m[0] - ans) > 0.01),
  });
});
add(function (r) {
  const b = r.pick(FCB), k = r.int(3, 4), al = r.pick([0.1, 0.2, 0.3, 0.4, 0.5]), lo = r.int(40, 400), d = series(r, k, lo, Math.round(lo * 1.3), 2), F0 = Math.round(d[0] * (0.9 + r.next() * 0.2));
  const st = r.int(0, 12 - k - 1), ms = MONTHS.slice(st, st + k + 1);
  const F = [F0]; for (let i = 0; i < k; i++) F.push(F[i] + al * (d[i] - F[i]));
  return N({
    story: `${b.name} uses exponential smoothing with α = ${al}. The forecast for ${ms[0]} was ${n0(F0)}.${grid(["Month", "Actual"], ms.slice(0, k).map((m, i) => [m, n0(d[i])]))}`,
    ask: `What is the forecast for <b>${ms[k]}</b>? Keep full decimals along the way. ${R2}`, answer: F[k], unit: "",
    hints: [`Go one month at a time: F(${ms[1]}) = F(${ms[0]}) + ${al}(A(${ms[0]}) − F(${ms[0]})).`, `Keep going until you reach ${ms[k]}.`],
    steps: ms.slice(1, k + 1).map((m, i) => `F(${m}) = ${n2(F[i])} + ${al}(${n0(d[i])} − ${n2(F[i])}) = ${n2(F[i + 1])}`).concat([`Forecast for ${ms[k]} = <b>${n2(F[k])}</b>.`]),
    mistakes: [[F[k - 1], `That's the forecast for ${ms[k - 1]}. One more step.`], [F0 + al * (d[k - 1] - F0), "Each step starts from the PREVIOUS forecast, not the original one."]],
  });
});
add(function (r) {
  const F = r.int(100, 600), A = F + r.pick([-1, 1]) * r.int(10, 80), al = r.pick([0.2, 0.3, 0.4, 0.5, 0.6]), Fn = F + al * (A - F), b = r.pick(FCB);
  return C({
    story: `${b.name} forecast ${F} last period. Actual demand was ${A}. Using α = ${al}, the new forecast is ${n2(Fn)}.`,
    ask: "If the manager raised α to 0.9, the new forecast would:",
    choices: [{ t: `Move closer to the actual demand of ${A}`, ok: true }, { t: `Move closer to the old forecast of ${F}`, ok: false, note: "A bigger α puts MORE weight on the latest actual." }, { t: "Stay exactly the same", ok: false, note: "α controls how far the forecast moves toward the actual." }, { t: "Equal the average of all past demand", ok: false, note: "That's not what α does." }],
    why: "A higher α reacts more to the latest actual (use it when the underlying average is changing). A lower α smooths more (use it when demand is stable).",
  });
});

level("Forecast Error: MAD, MSE, MAPE", { intro: "Error = actual − forecast. <b>MAD</b> = average of |errors|. <b>MSE</b> = average of errors². <b>MAPE</b> = average of (|error| ÷ actual) × 100." });
function errData(r) {
  const b = r.pick(FCB), k = r.int(4, 6), lo = r.int(20, 300), A = series(r, k, lo, Math.round(lo * 1.4), 1);
  const F = A.map((a) => Math.max(1, Math.round(a + (r.next() - 0.5) * a * 0.35)));
  if (F.every((f, i) => f === A[i])) F[0] += 3;
  const per = r.pick(["Week", "Month", "Quarter"]);
  const e = A.map((a, i) => a - F[i]);
  return { b, k, A, F, per, e, mad: mean(e.map(Math.abs)), mse: mean(e.map((v) => v * v)), mape: mean(e.map((v, i) => (Math.abs(v) / A[i]) * 100)), table: grid([per, "Actual", "Forecast"], A.map((a, i) => [i + 1, n0(a), n0(F[i])])) };
}
add(function (r) {
  const x = errData(r);
  return N({
    story: `${x.b.name} is checking how accurate its forecasts of ${x.b.item} have been.${x.table}`,
    ask: `What is the mean absolute deviation (MAD)? ${R2}`, answer: x.mad, unit: "",
    hints: ["Error = actual − forecast for each period. Take the absolute value (drop the minus signs).", `Add the absolute errors and divide by the number of periods (${x.k}).`],
    steps: [`|Errors|: ${x.e.map((v) => Math.abs(v)).join(", ")}.`, `MAD = ${sum(x.e.map(Math.abs))} ÷ ${x.k} = <b>${n2(x.mad)}</b>.`],
    mistakes: [[Math.abs(mean(x.e)), "The positive and negative errors canceled out. Take the ABSOLUTE value of each error first."], [sum(x.e.map(Math.abs)), `Divide by the number of periods (${x.k}).`], [x.mse, "That's MSE (squared errors). MAD uses absolute errors."], [x.mape, "That's MAPE (a percent). MAD is in units."]],
  });
});
add(function (r) {
  const x = errData(r);
  return N({
    story: `${x.b.name} wants the mean squared error of its forecasts.${x.table}`,
    ask: `What is the mean squared error (MSE)? ${R2}`, answer: x.mse, unit: "",
    hints: ["Error = actual − forecast. Square each error.", `Add the squares and divide by ${x.k}.`],
    steps: [`Errors²: ${x.e.map((v) => v * v).join(", ")}.`, `MSE = ${sum(x.e.map((v) => v * v))} ÷ ${x.k} = <b>${n2(x.mse)}</b>.`],
    mistakes: [[x.mad * x.mad, "That's MAD squared. Square EACH error first, then average."], [sum(x.e.map((v) => v * v)), `Divide by the number of periods (${x.k}).`], [x.mad, "That's MAD. MSE squares the errors."], [Math.sqrt(x.mse), "Don't take the square root. MSE is the average of the squared errors."]],
  });
});
add(function (r) {
  const x = errData(r);
  return N({
    story: `${x.b.name} wants its forecast error as a percent.${x.table}`,
    ask: `What is the mean absolute percent error (MAPE)? Enter it as a percent (for example, 8.25 for 8.25%). ${R2}`, answer: x.mape, unit: "%",
    hints: ["For each period: |actual − forecast| ÷ ACTUAL × 100.", `Average those percents over ${x.k} periods.`],
    steps: [`Percent errors: ${x.e.map((v, i) => n2((Math.abs(v) / x.A[i]) * 100) + "%").join(", ")}.`, `MAPE = <b>${n2(x.mape)}%</b>.`],
    mistakes: [[mean(x.e.map((v, i) => (Math.abs(v) / x.F[i]) * 100)), "Divide each error by the ACTUAL value, not the forecast."], [x.mad, "That's MAD. MAPE divides each error by the actual and multiplies by 100."], [x.mape * x.k, `Divide by the number of periods (${x.k}).`]],
  });
});
add(function (r) {
  const b = r.pick(FCB), k = 4, al = r.pick([0.2, 0.3, 0.4, 0.5]), lo = r.int(30, 250), A = series(r, k, lo, Math.round(lo * 1.35), 2), F0 = Math.round(A[0] * (0.88 + r.next() * 0.2));
  const F = [F0]; for (let i = 0; i < k - 1; i++) F.push(F[i] + al * (A[i] - F[i]));
  const e = A.map((a, i) => a - F[i]), mad = mean(e.map(Math.abs));
  return N({
    story: `${b.name} used exponential smoothing with α = ${al}, starting with a forecast of ${F0} for Period 1.${grid(["Period", "Actual"], A.map((a, i) => [i + 1, n0(a)]))}`,
    ask: `Find the forecasts for Periods 2–4, then compute the MAD for Periods 1–4. ${R2}`, answer: mad, unit: "",
    hints: ["F2 = F1 + α(A1 − F1), and so on through F4. Keep the decimals.", "MAD = average of |actual − forecast| over the 4 periods."],
    steps: [`Forecasts: ${F.map((f, i) => `F${i + 1} = ${n2(f)}`).join(", ")}.`, `|Errors|: ${e.map((v) => n2(Math.abs(v))).join(", ")}.`, `MAD = <b>${n2(mad)}</b>.`],
    mistakes: [[Math.abs(mean(e)), "Take absolute values before averaging."], [mean(e.slice(1).map(Math.abs)), "Include Period 1's error too."]],
  });
});
add(function (r) {
  const b = r.pick(FCB), k = 5, lo = r.int(40, 300), A = series(r, k, lo, Math.round(lo * 1.3), 1);
  let F1, F2, m1, m2;
  do {
    F1 = A.map((a) => Math.round(a + (r.next() - 0.5) * a * 0.3)); F2 = A.map((a) => Math.round(a + (r.next() - 0.5) * a * 0.3));
    m1 = mean(A.map((a, i) => Math.abs(a - F1[i]))); m2 = mean(A.map((a, i) => Math.abs(a - F2[i])));
  } while (Math.abs(m1 - m2) < 0.5);
  const better = m1 < m2 ? "Method 1" : "Method 2";
  return C({
    story: `${b.name} compared two forecasting methods.${grid(["Period", "Actual", "Method 1", "Method 2"], A.map((a, i) => [i + 1, a, F1[i], F2[i]]))}`,
    ask: "Based on MAD, which method is more accurate?",
    choices: [{ t: `${better} (MAD = ${n2(Math.min(m1, m2))})`, ok: true }, { t: `${better === "Method 1" ? "Method 2" : "Method 1"} (MAD = ${n2(Math.max(m1, m2))})`, ok: false, note: "The more accurate method has the LOWER error." }, { t: "They are equally accurate", ok: false, note: `MAD: Method 1 = ${n2(m1)}, Method 2 = ${n2(m2)}.` }, { t: "MAD can't compare forecasting methods", ok: false, note: "We pick the model with the lowest MAD, MSE, or MAPE." }],
    why: `Method 1 MAD = ${n2(m1)}; Method 2 MAD = ${n2(m2)}. Lower error = more accurate.`,
  });
});

level("Trend Projection", { intro: "ŷ = a + bt. <b>b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²)</b>, <b>a = ȳ − b·x̄</b>. Number the periods x = 1, 2, 3, … (not the calendar year). To forecast period t, plug t into a + bt." });
function trend(r) {
  const b0 = r.pick(FCB), n = r.int(5, 8), a0 = r.int(40, 400), sl = (r.next() - 0.25) * a0 * 0.12;
  const y = []; for (let i = 1; i <= n; i++) y.push(Math.max(5, Math.round(a0 + sl * i + (r.next() - 0.5) * a0 * 0.15)));
  const x = y.map((_, i) => i + 1), xb = mean(x), yb = mean(y), sxy = sum(x.map((v, i) => v * y[i])), sxx = sum(x.map((v) => v * v));
  const b = (sxy - n * xb * yb) / (sxx - n * xb * xb), a = yb - b * xb;
  if (Math.abs(b) < 0.05) return trend(r);
  return { b0, n, x, y, xb, yb, sxy, sxx, a, b };
}
function trendSteps(t) { return [`n = ${t.n}; Σx = ${sum(t.x)}, Σy = ${n0(sum(t.y))}, Σxy = ${n0(t.sxy)}, Σx² = ${t.sxx}; x̄ = ${n2(t.xb)}, ȳ = ${n4(t.yb)}.`, `b = (${n0(t.sxy)} − ${t.n}(${n2(t.xb)})(${n4(t.yb)})) ÷ (${t.sxx} − ${t.n}(${n2(t.xb)})²) = ${n4(t.b)}.`, `a = ${n4(t.yb)} − ${n4(t.b)}(${n2(t.xb)}) = ${n4(t.a)}.`]; }
const tTable = (t, lab) => grid(["Period (x)", lab], t.y.map((v, i) => [i + 1, n0(v)]));
add(function (r) {
  const t = trend(r);
  return N({
    story: `${t.b0.name} recorded ${t.b0.item} for ${t.n} periods.${tTable(t, t.b0.item)}`,
    ask: `Using the least squares method, what is the slope <b>b</b> of the trend line? ${R2}`, answer: t.b, unit: "", signed: true,
    hints: ["Build columns for x, y, xy, and x². Add each column.", "b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²)."],
    steps: trendSteps(t).slice(0, 2),
    mistakes: [[t.sxy / t.sxx, "Subtract n·x̄·ȳ on top and n·x̄² on the bottom."], [(t.sxy - t.n * t.xb * t.yb) / (t.sxx - t.xb * t.xb), "The bottom is Σx² − n·x̄² (don't forget the n)."]],
  });
});
add(function (r) {
  const t = trend(r);
  return N({
    story: `${t.b0.name}'s ${t.b0.item} for the past ${t.n} periods:${tTable(t, t.b0.item)}`,
    ask: `Using the least squares method, what is the y-intercept <b>a</b> of the trend line? ${R2}`, answer: t.a, unit: "",
    hints: ["Find b first: b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²).", "Then a = ȳ − b·x̄. Keep b's decimals."],
    steps: trendSteps(t),
    mistakes: [[t.yb, "That's ȳ. Subtract b·x̄."], [t.yb + t.b * t.xb, "a = ȳ − b·x̄ (subtract)."]],
  });
});
add(function (r) {
  const t = trend(r), ahead = r.pick([1, 1, 2]), T = t.n + ahead, ans = t.a + t.b * T;
  return N({
    story: `${t.b0.name} wants to project ${t.b0.item} forward with a linear trend.${tTable(t, t.b0.item)}`,
    ask: `Using the least squares (trend projection) method, what is the forecast for <b>period ${T}</b>? ${R2}`, answer: ans, unit: "",
    hints: ["Find b, then a = ȳ − b·x̄.", `Forecast = a + b × ${T}. Don't round b in the middle.`],
    steps: trendSteps(t).concat([`ŷ(${T}) = ${n4(t.a)} + ${n4(t.b)} × ${T} = <b>${n2(ans)}</b>.`]),
    mistakes: [[t.a + t.b * t.n, `That's the trend value for period ${t.n}. Plug in ${T}.`], [t.a + t.b * (T - 1) === t.a + t.b * t.n ? -1 : t.a + t.b * (T - 1), `Plug in period ${T}.`], [Math.round(t.a * 100) / 100 + (Math.round(t.b * 100) / 100) * T, "You're close but rounded a and b first. Keep full decimals."]],
  });
});
add(function (r) {
  const t = trend(r), y0 = r.int(2016, 2019), T = t.n + 1, ans = t.a + t.b * T;
  return N({
    story: `${t.b0.name}'s annual ${t.b0.item}:${grid(["Year", t.b0.item], t.y.map((v, i) => [y0 + i, n0(v)]))}`,
    ask: `Using trend projection (least squares), what is the forecast for <b>${y0 + t.n}</b>? ${R2}`, answer: ans, unit: "",
    hints: [`Number the years x = 1 (${y0}), 2 (${y0 + 1}), … Don't use the calendar year as x.`, `${y0 + t.n} is period ${T}. Forecast = a + b × ${T}.`],
    steps: [`x = 1 for ${y0}, …, ${t.n} for ${y0 + t.n - 1}; ${y0 + t.n} is x = ${T}.`].concat(trendSteps(t), [`ŷ = ${n4(t.a)} + ${n4(t.b)} × ${T} = <b>${n2(ans)}</b>.`]),
    mistakes: [[t.a + t.b * t.n, `That's the trend value for ${y0 + t.n - 1}. ${y0 + t.n} is period ${T}.`]],
  });
});

level("Linear Regression (Associative)", { intro: "Same formulas as trend projection, but x is another variable (advertising, temperature, events) instead of the time period. <b>b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²)</b>, <b>a = ȳ − b·x̄</b>, ŷ = a + bx." });
function reg(r) {
  const c = r.pick([
    { who: "Lakeside Marina", x: "Weekend high temp (°F)", y: "Boat rentals", xl: 70, xh: 98, xs: 1, unitx: "°F" },
    { who: "Druid City Pizza", x: "Ad spending ($ hundreds)", y: "Pizzas sold", xl: 2, xh: 12, xs: 1, unitx: "($ hundreds)" },
    { who: "Campus Bookstore", x: "Home games that month", y: "Hoodies sold", xl: 0, xh: 5, xs: 1, unitx: "home games" },
    { who: "Riverbend Cycles", x: "Rainy days that month", y: "Bike repairs", xl: 2, xh: 14, xs: 1, unitx: "rainy days" },
    { who: "Northport Contractors", x: "Local building permits", y: "Roofing jobs", xl: 10, xh: 60, xs: 1, unitx: "permits" },
  ]);
  const n = r.int(5, 7); let xs;
  do { xs = []; for (let i = 0; i < n; i++) xs.push(r.int(c.xl, c.xh)); } while (new Set(xs).size < 3);
  const a0 = r.int(10, 120), b0 = 1 + r.next() * 8;
  const ys = xs.map((v) => Math.max(1, Math.round(a0 + b0 * v + (r.next() - 0.5) * a0 * 0.3)));
  const xb = mean(xs), yb = mean(ys), sxy = sum(xs.map((v, i) => v * ys[i])), sxx = sum(xs.map((v) => v * v));
  const b = (sxy - n * xb * yb) / (sxx - n * xb * xb), a = yb - b * xb;
  if (b <= 0.1 || a + b * c.xl <= 0) return reg(r);
  return { c, n, xs, ys, xb, yb, sxy, sxx, a, b, table: grid([c.x, c.y], xs.map((v, i) => [v, ys[i]]), 0) };
}
add(function (r) {
  const t = reg(r);
  return N({
    story: `${t.c.who} thinks "${t.c.y}" depends on "${t.c.x}." Recent data:${t.table}`,
    ask: `Using linear regression, what is the slope <b>b</b>? ${R2}`, answer: t.b, unit: "",
    hints: ["x is the independent variable (the first column); y is what you're predicting.", "b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²)."],
    steps: [`Σx = ${sum(t.xs)}, Σy = ${sum(t.ys)}, Σxy = ${t.sxy}, Σx² = ${t.sxx}, n = ${t.n}; x̄ = ${n4(t.xb)}, ȳ = ${n4(t.yb)}.`, `b = <b>${n2(t.b)}</b>.`],
    mistakes: [[t.sxy / t.sxx, "Subtract n·x̄·ȳ on top and n·x̄² on the bottom."]],
  });
});
add(function (r) {
  const t = reg(r), xn = r.int(t.c.xl, t.c.xh + 1), ans = t.a + t.b * xn;
  return N({
    story: `${t.c.who} thinks "${t.c.y}" depends on "${t.c.x}." Recent data:${t.table}`,
    ask: `Using linear regression, predict ${t.c.y.toLowerCase()} when the ${t.c.x.toLowerCase().replace(/ \(.*\)/, "")} is <b>${xn}</b>. ${R2}`, answer: ans, unit: "",
    hints: ["Find b = (Σxy − n·x̄·ȳ) ÷ (Σx² − n·x̄²), then a = ȳ − b·x̄.", `ŷ = a + b × ${xn}.`],
    steps: [`Σx = ${sum(t.xs)}, Σy = ${sum(t.ys)}, Σxy = ${t.sxy}, Σx² = ${t.sxx}, n = ${t.n}.`, `b = ${n4(t.b)}; a = ${n4(t.yb)} − ${n4(t.b)}(${n4(t.xb)}) = ${n4(t.a)}.`, `ŷ = ${n4(t.a)} + ${n4(t.b)}(${xn}) = <b>${n2(ans)}</b>.`],
    mistakes: [[t.a + t.b * (t.n + 1), `Plug in the x VALUE (${xn}), not the next period number.`], [t.yb, "That's just the average y. Use the regression line."]],
  });
});

level("Seasonal Indices", { intro: "<b>Seasonal index = average demand for that season ÷ average demand across all seasons.</b> <b>Seasonal forecast = (next year's total ÷ number of seasons) × index.</b> With a trend line: F = (a + bt) × S." });
function seas(r) {
  const b = r.pick(FCB), yrs = r.int(2, 3), base = r.int(80, 600), sh = r.shuffle([0.75, 0.95, 1.1, 1.25]).map((v) => v + (r.next() - 0.5) * 0.1);
  const d = []; for (let y = 0; y < yrs; y++) d.push(sh.map((s) => Math.round(base * s * (1 + 0.05 * y) * (0.95 + r.next() * 0.1))));
  const qa = [0, 1, 2, 3].map((q) => mean(d.map((row) => row[q]))), all = mean(qa), idx = qa.map((v) => v / all);
  return { b, yrs, d, qa, all, idx, table: grid(["Quarter"].concat(d.map((_, y) => "Year " + (y + 1))), [0, 1, 2, 3].map((q) => ["Q" + (q + 1)].concat(d.map((row) => n0(row[q]))))) };
}
add(function (r) {
  const s = seas(r), q = r.int(0, 3);
  return N({
    story: `${s.b.name}'s quarterly ${s.b.item}:${s.table}`,
    ask: `What is the seasonal index for <b>Q${q + 1}</b>? ${R3}`, answer: s.idx[q], dec: 3, unit: "",
    hints: [`Average Q${q + 1} across the ${s.yrs} years.`, "Average demand per quarter = average of the four quarterly averages (or total ÷ number of quarters).", "Index = Q's average ÷ overall average quarterly demand."],
    steps: [`Q${q + 1} average = ${n2(s.qa[q])}.`, `Average quarterly demand = ${n4(s.all)}.`, `Index = ${n2(s.qa[q])} ÷ ${n4(s.all)} = <b>${n3(s.idx[q])}</b>.`],
    mistakes: [[s.all / s.qa[q], "Flip it: the quarter's average goes on top."], [s.qa[q] / (s.all * 4), "Divide by the average QUARTERLY demand, not the annual total."], [s.d[s.yrs - 1][q] / mean(s.d[s.yrs - 1]), "Use ALL the years, not just the last one."]],
  });
});
add(function (r) {
  const s = seas(r), q = r.int(0, 3), T = Math.round(sum(s.d[s.yrs - 1]) * (1.03 + r.next() * 0.1) / 10) * 10, ans = (T / 4) * s.idx[q];
  return N({
    story: `${s.b.name}'s quarterly ${s.b.item}:${s.table}Next year, ${s.b.name} expects total demand of ${n0(T)}.`,
    ask: `What is the forecast for <b>Q${q + 1}</b> of next year? ${R2}`, answer: ans, unit: "", tol: Math.max(0.15, ans * 0.002),
    hints: ["Find Q's seasonal index: Q's average ÷ average quarterly demand.", `Divide next year's total by 4, then multiply by the index.`],
    steps: [`Index for Q${q + 1} = ${n2(s.qa[q])} ÷ ${n4(s.all)} = ${n4(s.idx[q])}.`, `Forecast = (${n0(T)} ÷ 4) × ${n4(s.idx[q])} = <b>${n2(ans)}</b>.`],
    mistakes: [[T * s.idx[q], "Divide the annual total by 4 first (one quarter's worth), then multiply by the index."], [T / 4, "Multiply by the seasonal index."], [(T / 4) / s.idx[q], "MULTIPLY by the index, don't divide."]],
  });
});
add(function (r) {
  const a = r.int(80, 900) + r.int(0, 99) / 100, b = r.int(2, 40) + r.int(0, 99) / 100, t = r.int(9, 24), S = r.pick([0.72, 0.81, 0.86, 0.93, 1.07, 1.12, 1.18, 1.25, 1.31]), bz = r.pick(FCB);
  const ans = (a + b * t) * S;
  return N({
    story: `${bz.name}'s trend line for ${bz.item} is ŷ = ${n2(a)} + ${n2(b)}t, where t is the quarter number. The seasonal index for the quarter being forecast is ${S}.`,
    ask: `What is the seasonally adjusted forecast for quarter t = ${t}? ${R2}`, answer: ans, unit: "",
    hints: ["F = (a + bt) × S.", `Trend value first: ${n2(a)} + ${n2(b)} × ${t}.`],
    steps: [`Trend value = ${n2(a)} + ${n2(b)}(${t}) = ${n2(a + b * t)}.`, `F = ${n2(a + b * t)} × ${S} = <b>${n2(ans)}</b>.`],
    mistakes: [[a + b * t, "That's the trend value only. Multiply by the seasonal index."], [(a + b * t) / S, "MULTIPLY by the index."], [a + b * t * S, "Multiply the WHOLE trend value (a + bt) by S."]],
  });
});

// ================================================================== PART 6: QUALITY CONCEPTS (Ch. 6 & 6s)
part(6, "Quality & SPC Concepts (Ch. 6, 6s)", "Defining quality, the three views, costs of quality, TQM and its concepts, natural vs. assignable variation, sample size, choosing a control chart, and process capability.");

level("Defining Quality");
add(concept({
  q: ["The American Society for Quality defines quality as:", "Which is the ASQ definition of quality?"],
  a: "The totality of features and characteristics of a product or service that bears on its ability to satisfy stated or implied needs",
  w: [["Zero defects in every unit produced", "Zero defects is a goal of continuous improvement, not the ASQ definition."], ["Meeting the engineering specifications, nothing more", "That's only the manufacturing-based view."], ["The most expensive version of a product", "Quality isn't the same as price."]],
  why: "ASQ: quality is the totality of features and characteristics of a product or service that bears on its ability to satisfy stated or implied needs.",
}));
add(concept({
  v: [
    { q: "\"Quality lies in the eyes of the beholder\": better performance and more features. Which view of quality is this?", a: "User-based" },
    { q: "Quality as conformance to standards, making it right the first time. Which view of quality is this?", a: "Manufacturing-based" },
    { q: "Quality as specific and measurable product attributes. Which view of quality is this?", a: "Product-based" },
    { q: "A coffee drinker says a latte is high quality because it tastes the way SHE likes it. Which view?", a: "User-based" },
    { q: "A plant judges a bolt by whether it falls within its diameter specification. Which view?", a: "Manufacturing-based" },
    { q: "A shopper compares TVs by resolution, refresh rate, and screen size. Which view?", a: "Product-based" },
  ],
  pool: ["User-based", "Manufacturing-based", "Product-based", "Value-based"],
  notes: { "User-based": "User-based: quality lies in the eyes of the beholder.", "Manufacturing-based": "Manufacturing-based: conformance to standards, right the first time.", "Product-based": "Product-based: specific, measurable attributes.", "Value-based": "The three views from class are user-based, manufacturing-based, and product-based." },
  why: "Three views: user-based (eyes of the beholder), manufacturing-based (conformance to standards), product-based (measurable attributes).",
}));
add(oneOf({
  q: "Improved quality increases profits through REDUCED COSTS. Which is one way?",
  right: ["Increased productivity", "Lower rework and scrap costs", "Lower warranty costs"],
  wrong: [["Flexible pricing", "That's a SALES GAIN, not a cost reduction."], ["Improved reputation", "That's a SALES GAIN."], ["Improved response", "That's a SALES GAIN."]],
  why: "Quality raises profits two ways: sales gains (improved response, flexible pricing, improved reputation) and reduced costs (higher productivity, lower rework/scrap, lower warranty costs).",
}));

level("Costs of Quality");
add(concept({
  v: [
    { q: "Training employees and running quality improvement programs to reduce the potential for defects are:", a: "Prevention costs" },
    { q: "A restaurant pays for food-safety training for every new cook. This is a(n):", a: "Prevention costs" },
    { q: "Costs of evaluating products, parts, and services (inspection and testing) are:", a: "Appraisal costs" },
    { q: "A bottler pays technicians to test samples from every batch before shipping. This is a(n):", a: "Appraisal costs" },
    { q: "Scrap and rework from defects found BEFORE delivery to the customer are:", a: "Internal failure costs" },
    { q: "A bakery throws out a batch of burnt loaves before they leave the kitchen. This is a(n):", a: "Internal failure costs" },
    { q: "Lost goodwill, returned goods, and costs to society from defects discovered AFTER delivery are:", a: "External failure costs" },
    { q: "A car maker pays for a recall after customers report faulty brakes. This is a(n):", a: "External failure costs" },
  ],
  pool: ["Prevention costs", "Appraisal costs", "Internal failure costs", "External failure costs"],
  notes: { "Prevention costs": "Prevention: reducing the potential for defects (training, improvement programs).", "Appraisal costs": "Appraisal: evaluating products, parts, and services.", "Internal failure costs": "Internal failure: defects caught before delivery (scrap, rework).", "External failure costs": "External failure: defects found after delivery (returns, lost goodwill)." },
  why: "Four costs of quality: prevention, appraisal, internal failure (before delivery), external failure (after delivery).",
}));

level("TQM & Its Tools");
add(concept({
  q: "Total quality management (TQM) refers to:",
  a: "A management commitment to a continuing, companywide drive toward excellence in all aspects of products and services important to the customer",
  w: [["Inspecting every finished unit before it ships", "Deming: stop depending on inspection; build quality into the product."], ["A quality program run only by the quality control department", "TQM encompasses the entire organization, from supplier to customer."], ["Awarding business to the lowest-price supplier", "Deming said to build long-term relationships based on performance instead."]],
  why: "TQM encompasses the entire organization from supplier to customer and stresses management's commitment to a continuing, companywide drive toward excellence.",
}));
add(concept({
  v: [
    { q: "A never-ending process covering people, equipment, suppliers, materials, and procedures, whose end goal (perfection) is never reached but always sought, is:", a: "Continuous improvement" },
    { q: "A program with a statistical goal of 3.4 defects per million opportunities, using the DMAIC discipline, is:", a: "Six Sigma" },
    { q: "Getting employees involved in product and process improvements (for example, through quality circles) is:", a: "Employee empowerment" },
    { q: "Selecting best practices to use as a standard for performance is:", a: "Benchmarking" },
    { q: "A \"pull\" system of production scheduling, producing only when signaled, which lowers inventory and exposes quality problems, is:", a: "Just-in-time (JIT)" },
    { q: "Engineering and experimental design methods emphasizing quality robustness, target-oriented quality, and the quality loss function are:", a: "Taguchi concepts" },
    { q: "Kaizen and Shewhart's Plan-Do-Check-Act cycle describe:", a: "Continuous improvement" },
    { q: "A large hospital compares its emergency room wait times across its own campuses to find the best practice. This is:", a: "Benchmarking" },
    { q: "A group of employees meets regularly, led by a facilitator, to solve work problems. This supports:", a: "Employee empowerment" },
  ],
  pool: ["Continuous improvement", "Six Sigma", "Employee empowerment", "Benchmarking", "Just-in-time (JIT)", "Taguchi concepts"],
  why: "Seven concepts of TQM: continuous improvement, Six Sigma, employee empowerment, benchmarking, JIT, Taguchi concepts, and knowledge of TQM tools.",
}));
add(oneOf({
  q: "Which statement about Six Sigma is TRUE?",
  right: ["Statistically, it means a process is 99.9997% capable: 3.4 defects per million opportunities", "It uses the DMAIC discipline", "It requires a big commitment from top management", "It is a management-directed, team-based, expert-led approach"],
  wrong: [["It allows 6 defects per hundred units", "Six Sigma = 3.4 defects per million opportunities."], ["It is a one-time inspection program", "Six Sigma is a comprehensive, ongoing system for improvement."], ["It works best without top management involvement", "It needs a big commitment from top management."]],
  why: "Six Sigma has two meanings: a statistical standard (3.4 DPMO, 99.9997% capable) and a program (DMAIC, 7 tools) to reduce defects, lower costs, save time, and improve customer satisfaction.",
}));
add(oneOf({
  q: "How is JIT related to quality?",
  right: ["JIT cuts the cost of quality", "JIT improves quality by exposing problems that inventory hides", "Better quality means less inventory and an easier JIT system"],
  wrong: [["JIT hides quality problems behind extra inventory", "Big inventory HIDES problems; JIT removes that cushion so problems surface."], ["JIT requires large safety stocks", "JIT lowers inventory levels."], ["JIT and quality have nothing to do with each other", "JIT cuts the cost of quality and improves quality."]],
  why: "Inventory costs money and hides process and material problems. JIT lowers inventory, cuts the cost of quality, and improves quality.",
}));
add(concept({
  v: [
    { q: "Which TQM tool is an organized method of recording data?", a: "Check sheet" },
    { q: "Which TQM tool graphs the value of one variable against another variable?", a: "Scatter diagram" },
    { q: "Which TQM tool (also called a fishbone diagram) identifies process elements, like materials, methods, manpower, and machinery, that might affect an outcome?", a: "Cause-and-effect diagram" },
    { q: "Which TQM tool plots problems or defects in descending order of frequency?", a: "Pareto chart" },
    { q: "Which TQM tool describes the steps in a process?", a: "Flowchart" },
    { q: "Which TQM tool shows the frequency distribution of a variable?", a: "Histogram" },
    { q: "Which TQM tool plots a statistic over time with upper and lower control limits?", a: "Statistical process control chart" },
  ],
  pool: ["Check sheet", "Scatter diagram", "Cause-and-effect diagram", "Pareto chart", "Flowchart", "Histogram", "Statistical process control chart"],
  why: "The seven TQM tools: check sheet, scatter diagram, cause-and-effect diagram, Pareto chart, flowchart, histogram, and SPC chart.",
}));
add(concept({
  v: [
    { q: "Statistical process control (SPC) is:", a: "Using statistics and control charts to tell when to take corrective action" },
    { q: "Poka-yoke is:", a: "Foolproof devices or techniques designed to pass only acceptable product" },
    { q: "Inspecting items as good or bad, without addressing the degree of failure, is inspection by:", a: "Attributes" },
    { q: "Measuring dimensions like weight, speed, height, or strength is inspection by:", a: "Variables" },
  ],
  pool: ["Using statistics and control charts to tell when to take corrective action", "Foolproof devices or techniques designed to pass only acceptable product", "Attributes", "Variables", "Inspecting every unit after it is shipped"],
  why: "SPC uses statistics and control charts to signal when to act. Poka-yoke = foolproofing. Attributes = good/bad; variables = measured values.",
}));
add(concept({
  v: [
    { q: "Consistency of performance and dependability, performing the service right the first time, is which determinant of service quality?", a: "Reliability" },
    { q: "The willingness or readiness of employees to provide service is:", a: "Responsiveness" },
    { q: "Possessing the required skills and knowledge to perform the service is:", a: "Competence" },
    { q: "Approachability and ease of contact is:", a: "Access" },
    { q: "The physical evidence of the service is:", a: "Tangibles" },
    { q: "Trustworthiness, believability, and honesty are:", a: "Credibility" },
  ],
  pool: ["Reliability", "Responsiveness", "Competence", "Access", "Tangibles", "Credibility", "Courtesy"],
  why: "Determinants of service quality (Table 6.6): reliability, responsiveness, competence, access, courtesy, communication, credibility, security, understanding the customer, tangibles.",
}));

level("Variation & Samples (Ch. 6s)");
add(concept({
  v: [
    { q: "Variation that affects virtually all processes, is expected, and is also called common causes, is:", a: "Natural variation" },
    { q: "Variation that can be traced to a specific reason, also called special causes, is:", a: "Assignable variation" },
    { q: "A bakery's oven temperature drifts slightly up and down all day. This is:", a: "Natural variation" },
    { q: "A bakery's thermostat breaks and the oven overheats. This is:", a: "Assignable variation" },
    { q: "Drive-thru wait times vary a bit with how complicated each order is. This is:", a: "Natural variation" },
    { q: "The phone system crashes during the lunch rush, and call wait times spike. This is:", a: "Assignable variation" },
    { q: "A gym is busier at 5 p.m. than at 2 p.m. every weekday. This is:", a: "Natural variation" },
    { q: "A machine operator loads the wrong raw material and every part comes out undersized. This is:", a: "Assignable variation" },
  ],
  pool: ["Natural variation", "Assignable variation", "Process capability"],
  notes: { "Process capability": "Process capability compares natural variation with the design specifications; it isn't a type of variation.", "Natural variation": "Natural (common) variation is expected and affects every process.", "Assignable variation": "Assignable (special) variation can be traced to a specific reason, usually a change in the process." },
  why: "Natural (common cause) variation is expected. Assignable (special cause) variation has a specific, traceable reason; SPC's job is to signal when it's present so you can eliminate the bad causes and keep the good ones.",
}));
add(function (r) {
  const c = r.pick([["cereal boxes", "boxes"], ["iced coffees", "drinks"], ["customer calls", "calls"], ["loaves of bread", "loaves"], ["bottles of water", "bottles"], ["oil changes", "oil changes"]]);
  const n = r.int(3, 10); let k; do { k = r.int(4, 25); } while (k === n);
  const per = r.pick(["hour", "day", "shift"]);
  const ask = r.chance(0.6);
  return C({
    story: `A quality analyst pulls ${n} ${c[0]} every ${per} and measures each one. So far, she has done this for ${k} ${per}s.`,
    ask: ask ? "What is the SAMPLE SIZE (n)?" : "How many SAMPLES have been taken?",
    choices: ask
      ? [{ t: `${n} ${c[1]}`, ok: true }, { t: `${k} ${c[1]}`, ok: false, note: `${k} is the NUMBER of samples. Sample size is how many items are in each sample.` }, { t: `${n * k} ${c[1]}`, ok: false, note: "That's the total items measured. Sample size is the number of items in ONE sample." }, { t: `${n + k} ${c[1]}`, ok: false, note: "Sample size is the number of items in each sample." }]
      : [{ t: `${k} samples`, ok: true }, { t: `${n} samples`, ok: false, note: `${n} is the sample SIZE (items per sample).` }, { t: `${n * k} samples`, ok: false, note: "That's the total number of items, not samples." }, { t: "1 sample", ok: false, note: `Each ${per}'s group of ${n} is one sample.` }],
    why: `Sample size (n) = items in each sample = ${n}. Number of samples (k) = how many times you took a sample = ${k}. Look up A2, D3, and D4 with n, not k.`,
  });
});
add(concept({
  v: [
    { q: "The weight of each bag of chips (in grams) is what kind of data?", a: "Variable data" },
    { q: "Whether each phone screen is cracked or not cracked is what kind of data?", a: "Attribute data" },
    { q: "The wait time (in minutes) for each customer is what kind of data?", a: "Variable data" },
    { q: "Pass/fail results for each part inspected are what kind of data?", a: "Attribute data" },
    { q: "The number of complaints a help desk receives each day is what kind of data?", a: "Attribute data" },
    { q: "The internal temperature of each cookie coming out of the oven is what kind of data?", a: "Variable data" },
  ],
  pool: ["Variable data", "Attribute data", "Natural data"],
  notes: { "Variable data": "Variable data is MEASURED: length, weight, time, temperature.", "Attribute data": "Attribute data is a discrete choice (good/bad, yes/no) or a count of defects.", "Natural data": "The two types are variable data and attribute data." },
  why: "Variable data can be measured (weight, time, length). Attribute data is good/bad, yes/no, or a count of defects.",
}));

level("Choosing & Reading Control Charts");
add(concept({
  v: [
    { q: "A cereal plant measures the weight of 5 boxes every hour and wants to track whether the AVERAGE weight shifts. Which chart?", a: "x̄-chart" },
    { q: "Which chart tracks changes in the central tendency of a process?", a: "x̄-chart" },
    { q: "A plant wants to know whether the SPREAD (dispersion) of fill weights within each sample is growing. Which chart?", a: "R-chart" },
    { q: "Which chart indicates a gain or loss of dispersion?", a: "R-chart" },
    { q: "A pharmacy checks 200 prescriptions a day and records the FRACTION filled incorrectly. Which chart?", a: "p-chart" },
    { q: "An IT office tracks the percent of upload attempts that fail out of 150 checked each day. Which chart?", a: "p-chart" },
    { q: "A cab company counts the number of complaints it receives each day. Which chart?", a: "c-chart" },
    { q: "An auto plant counts the paint flaws on each car door. Which chart?", a: "c-chart" },
  ],
  pool: ["x̄-chart", "R-chart", "p-chart", "c-chart"],
  notes: { "x̄-chart": "x̄-chart: variable data, tracks the process AVERAGE (central tendency).", "R-chart": "R-chart: variable data, tracks the RANGE (dispersion).", "p-chart": "p-chart: attribute data, fraction/percent DEFECTIVE in samples.", "c-chart": "c-chart: attribute data, COUNT of defects per unit or period." },
  why: "Variables: x̄-chart (central tendency) and R-chart (dispersion), used together. Attributes: p-chart (fraction defective) and c-chart (number of defects per unit).",
}));
add(oneOf({
  q: "Which statement about x̄-charts and R-charts is TRUE?",
  right: ["The two charts should be used together", "An x̄-chart can detect a shift in the mean that an R-chart misses", "An R-chart can detect an increase in dispersion that an x̄-chart misses", "The R-chart monitors variability independent of the process mean"],
  wrong: [["An R-chart detects shifts in the process mean", "The R-chart tracks dispersion, not the mean."], ["Once you have an x̄-chart, the R-chart is unnecessary", "They must be used together: each catches problems the other misses."], ["Both charts are used for attribute data", "x̄ and R charts are for VARIABLE (measured) data."]],
  why: "x̄-chart tracks central tendency; R-chart tracks dispersion. A mean shift with constant spread shows on the x̄-chart only; growing spread with a constant mean shows on the R-chart only.",
}));
add(oneOf({
  q: "Which is a sign the process may be OUT of statistical control?",
  right: ["One point plots above the upper control limit", "A run of 5 points in a row above the center line", "A trend of 5 points steadily rising", "Two points very near the lower control limit", "Erratic, jumpy behavior"],
  wrong: [["All points fall randomly between the control limits", "That's normal behavior: the process is in control."], ["Points bounce randomly above and below the center line", "Random scatter within the limits is normal."]],
  why: "Investigate: a point outside the limits, runs of 5+ on one side of the center line, trends of 5, points hugging a limit, or erratic behavior.",
}));
add(oneOf({
  q: "Which statement about process capability is TRUE?",
  right: ["Cp and Cpk use SPECIFICATION limits, not control limits", "A capable process needs a Cp of at least 1.0", "A process can be in statistical control and still not be capable", "Six Sigma quality requires a Cp of 2.0", "Cp and Cpk are equal when the process is centered"],
  wrong: [["Cp and Cpk are computed from control limits", "Capability uses SPECIFICATION (design) limits."], ["A process in control is always capable", "In control ≠ capable. The natural variation must fit inside the specs."], ["A Cp of 0.5 means the process is capable", "Cp must be at least 1.0 (1.33 is a common target)."]],
  why: "Process capability compares natural variation with design specifications. A process in control may still not meet the specs. Cp ≥ 1.0 is capable; 1.33 is a common target; Six Sigma needs Cp = 2.0.",
}));
add(oneOf({
  q: "Which statement about the central limit theorem is TRUE?",
  right: ["Sample means tend to follow a normal distribution regardless of the population's distribution", "The standard deviation of the sample means equals σ ÷ √n", "As sample size increases, the sampling distribution narrows"],
  wrong: [["The standard deviation of the sample means equals σ × n", "It's σ ÷ √n."], ["Sample means only follow a normal curve if the population is normal", "Regardless of the population's shape, sample means tend toward normal."], ["Larger samples make the sampling distribution wider", "Larger n NARROWS the sampling distribution."]],
  why: "Central limit theorem: sample means tend to be normal no matter the population's shape, centered on μ, with standard deviation σ ÷ √n. Bigger n → narrower distribution.",
}));
add(concept({
  q: "Acceptance sampling:",
  a: "Inspects a random sample from a lot and decides whether to accept or reject the whole lot",
  w: [["Drives continuous improvement on the production line", "Acceptance sampling only screens lots; it doesn't drive quality improvement."], ["Inspects 100% of every lot", "It inspects a random SAMPLE."], ["Sets the upper and lower control limits", "That's building control charts."]],
  why: "Acceptance sampling inspects a random sample from a lot to accept or reject it. It only screens lots; rejected lots can be returned, 100% inspected, or regraded.",
}));

// ================================================================== PART 7: SPC MATH (Ch. 6s)
part(7, "SPC Math (Ch. 6s)", "Control chart factors, σ of the sample means, x̄-charts (σ known and using R̄), R-charts, p-charts, and c-charts.");

const FACT = { 2: [1.88, 3.268, 0], 3: [1.023, 2.574, 0], 4: [0.729, 2.282, 0], 5: [0.577, 2.115, 0], 6: [0.483, 2.004, 0], 7: [0.419, 1.924, 0.076], 8: [0.373, 1.864, 0.136], 9: [0.337, 1.816, 0.184], 10: [0.308, 1.777, 0.223], 11: [0.285, 1.744, 0.256], 12: [0.266, 1.716, 0.284], 13: [0.249, 1.692, 0.308], 14: [0.235, 1.671, 0.329], 15: [0.223, 1.652, 0.348], 16: [0.212, 1.636, 0.364], 17: [0.203, 1.621, 0.379], 18: [0.194, 1.608, 0.392], 19: [0.187, 1.596, 0.404], 20: [0.180, 1.586, 0.414], 21: [0.173, 1.575, 0.425], 22: [0.167, 1.566, 0.434], 23: [0.162, 1.557, 0.443], 24: [0.157, 1.548, 0.452], 25: [0.153, 1.541, 0.459] };
const ZS = [["99.73%", 3], ["95.45%", 2], ["99%", 2.58], ["95%", 1.96], ["90%", 1.65]];
function zPick(r) {
  const k = r.int(0, 6);
  if (k <= 2) return { text: "3-sigma", z: 3 };
  if (k === 3) return { text: "2-sigma", z: 2 };
  const p = r.pick(ZS.slice(1));
  return { text: `${p[0]}`, z: p[1], pct: true };
}
const zLabel = (zz) => (zz.pct ? `control limits that include ${zz.text} of the natural variation` : `${zz.text} control limits`);
const VARC = [
  { who: "Druid City Coffee", what: "ounces in each iced latte", u: "oz", mu: [12, 20], sd: [0.2, 1.2] },
  { who: "Bama Bottling", what: "fill weight of each sports drink", u: "oz", mu: [16, 32], sd: [0.1, 0.8] },
  { who: "Crimson Clinic", what: "patient wait time", u: "minutes", mu: [12, 35], sd: [2, 7] },
  { who: "Shelby Street Bakery", what: "weight of each loaf", u: "grams", mu: [450, 800], sd: [5, 20] },
  { who: "Southern Pine Mill", what: "length of each board", u: "inches", mu: [72, 96], sd: [0.1, 0.6] },
  { who: "QuickFix Auto", what: "time for each oil change", u: "minutes", mu: [18, 35], sd: [1.5, 5] },
  { who: "Northport Pharmacy", what: "time to fill each prescription", u: "minutes", mu: [8, 20], sd: [1, 4] },
  { who: "Campus Print Center", what: "time to finish each print order", u: "minutes", mu: [10, 25], sd: [1, 4] },
];

level("Sample Size & Chart Factors", { intro: "A2, D3, and D4 come from the factor table on the formula sheet, looked up by <b>sample size n</b> (items in each sample), NOT by the number of samples." });
for (const col of [0, 1, 2]) {
  add(function (r) {
    const c = r.pick(VARC); let n, k;
    do { n = col === 2 ? r.int(7, 25) : r.int(2, 25); k = r.int(4, 25); } while (k === n || (col === 2 && FACT[k] && FACT[k][2] === FACT[n][2]));
    const nm = ["A2", "D4", "D3"][col], use = ["the x̄-chart limits", "the R-chart UCL", "the R-chart LCL"][col];
    const ans = FACT[n][col];
    const ms = [];
    if (FACT[k]) ms.push([FACT[k][col], `That's the ${nm} for ${k}, the NUMBER of samples. Look it up by sample size n = ${n}.`]);
    FACT[n].forEach((v, j) => { if (j !== col) ms.push([v, `That's the ${["A2", "D4", "D3"][j]} value. You need ${nm}.`]); });
    return N({
      story: `${c.who} measures the ${c.what}. Each day for ${k} days, a supervisor takes a sample of ${n} and records the sample mean and range.`,
      ask: `What ${nm} value is used to calculate ${use}? ${R3}`, answer: ans, dec: 3, unit: "", zeroOK: true,
      hints: [`Sample size n = items in each sample = ${n}. The ${k} days is the number of samples.`, `Find row n = ${n} in the factor table and read the ${nm} column.`],
      steps: [`n = ${n} (the ${k} is the number of samples).`, `From the table, row ${n}: A2 = ${FACT[n][0]}, D4 = ${FACT[n][1]}, D3 = ${FACT[n][2]}. ${nm} = <b>${ans}</b>.`],
      mistakes: ms,
    });
  });
}

level("σ of the Sample Means & x̄-Charts (σ known)", { intro: "<b>σx̄ = σ ÷ √n.</b> <b>UCL/LCL = x̄̄ ± z·σx̄.</b> z = 3 for 3-sigma (99.73%), 2 for 95.45%, 2.58 for 99%, 1.96 for 95%, 1.65 for 90%." });
add(function (r) {
  const c = r.pick(VARC), mu = r.int(c.mu[0], c.mu[1]), sd = r.money(c.sd[0], c.sd[1]) || 1, n = r.int(4, 100), ans = sd / Math.sqrt(n);
  return N({
    story: `The ${c.what} at ${c.who} has a process mean of ${mu} ${c.u} and a process standard deviation of ${n2(sd)} ${c.u}. For the control chart, samples of ${n} will be taken.`,
    ask: `What is the standard deviation of the sampling distribution (σx̄)? ${R2}`, answer: ans, unit: c.u,
    hints: ["σx̄ = σ ÷ √n.", "The process mean isn't needed for this one."],
    steps: [`σx̄ = ${n2(sd)} ÷ √${n} = ${n2(sd)} ÷ ${n4(Math.sqrt(n))} = <b>${n2(ans)}</b>.`],
    mistakes: [[sd / n, "Divide by the SQUARE ROOT of n."], [sd, "That's the process σ. Divide by √n."], [sd * Math.sqrt(n), "Divide by √n, don't multiply."]],
  });
});
for (const side of ["UCL", "LCL"]) {
  add(function (r) {
    const c = r.pick(VARC), mu = r.int(c.mu[0], c.mu[1]), sd = r.money(c.sd[0], c.sd[1]), n = r.int(2, 16), zz = zPick(r);
    const sx = sd / Math.sqrt(n), ans = side === "UCL" ? mu + zz.z * sx : mu - zz.z * sx, sg = side === "UCL" ? 1 : -1;
    return N({
      story: `${c.who} tracks the ${c.what}. The target mean is ${mu} ${c.u}, and the process standard deviation is known to be ${n2(sd)} ${c.u}. Every hour, ${n} are sampled and averaged.`,
      ask: `Using ${zLabel(zz)}, what is the <b>${side}</b> of the x̄-chart? ${R2}`, answer: ans, unit: c.u,
      hints: [`σx̄ = σ ÷ √n = ${n2(sd)} ÷ √${n}.`, zz.pct ? `${zz.text} → z = ${zz.z} (Table S6.2).` : `${zz.text} → z = ${zz.z}.`, `${side} = x̄̄ ${sg > 0 ? "+" : "−"} z·σx̄.`],
      steps: [`σx̄ = ${n2(sd)} ÷ √${n} = ${n4(sx)}.`, `z = ${zz.z}.`, `${side} = ${mu} ${sg > 0 ? "+" : "−"} ${zz.z}(${n4(sx)}) = <b>${n2(ans)}</b>.`],
      mistakes: [[mu + sg * zz.z * sd, "Use σx̄ = σ ÷ √n, not σ itself."], [mu + sg * zz.z * (sd / n), "Divide σ by the SQUARE ROOT of n."], [zz.z !== 3 ? mu + sg * 3 * sx : -1, `Use z = ${zz.z} for ${zz.text}, not 3.`], [mu - sg * zz.z * sx, `That's the ${side === "UCL" ? "LCL" : "UCL"}.`]],
    });
  });
}
add(function (r) {
  const c = r.pick(VARC), mu = r.int(c.mu[0], c.mu[1]), sd = r.money(c.sd[0], c.sd[1]), n = r.int(3, 9), k = r.int(5, 7);
  const sx = sd / Math.sqrt(n), ucl = mu + 3 * sx, lcl = mu - 3 * sx;
  const means = []; for (let i = 0; i < k; i++) means.push(Math.round((mu + (r.next() - 0.5) * 3.6 * sx) * 100) / 100);
  const bad = r.chance(0.65) ? r.int(0, k - 1) : -1;
  if (bad >= 0) means[bad] = Math.round((r.chance(0.5) ? ucl + sx * (0.3 + r.next()) : lcl - sx * (0.3 + r.next())) * 100) / 100;
  const out = means.map((m, i) => (m > ucl || m < lcl ? i : -1)).filter((i) => i >= 0);
  const right = out.length ? `Out of control: sample ${out.map((i) => i + 1).join(" and ")} ${out.length > 1 ? "fall" : "falls"} outside the limits` : "In control: every sample mean is within the limits";
  const wr = [];
  if (out.length) wr.push(["In control: every sample mean is within the limits", `Compute the limits: ${n2(lcl)} to ${n2(ucl)}. Check each mean.`]);
  r.sample(means.map((_, i) => i).filter((i) => !out.includes(i)), 3).forEach((i) => wr.push([`Out of control: sample ${i + 1} falls outside the limits`, `Sample ${i + 1} (${n2(means[i])}) is inside ${n2(lcl)} to ${n2(ucl)}.`]));
  return C({
    story: `${c.who}'s ${c.what} has a target of ${mu} ${c.u} with a known process σ of ${n2(sd)}. Samples of ${n} gave these means:${grid(["Sample", "Mean"], means.map((m, i) => [i + 1, n2(m)]))}`,
    ask: "Using 3-sigma x̄-chart limits, is the process in control?",
    choices: [{ t: right, ok: true }].concat(wr.slice(0, 3).map((w) => ({ t: w[0], ok: false, note: w[1] }))),
    why: `σx̄ = ${n2(sd)} ÷ √${n} = ${n4(sx)}. UCL = ${n2(ucl)}, LCL = ${n2(lcl)}. ${out.length ? `Sample ${out.map((i) => i + 1).join(", ")} is outside: investigate for an assignable cause.` : "All means are inside the limits."}`,
  });
});

level("x̄-Charts Using R̄", { intro: "When σ is unknown: <b>x̄̄</b> = average of the sample means, <b>R̄</b> = average of the ranges, <b>UCL/LCL = x̄̄ ± A2·R̄</b>. A2 comes from the table using the sample size n." });
function xr(r, raw) {
  const c = r.pick(VARC), n = raw ? r.int(3, 4) : r.int(2, 12), k = raw ? r.int(4, 5) : r.int(5, 8), mu = r.int(c.mu[0], c.mu[1]), sd = r.money(c.sd[0], c.sd[1]);
  const dp = sd < 1 ? 2 : 1, rd = (v) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);
  let obs = null, means, ranges;
  if (raw) {
    obs = []; for (let i = 0; i < k; i++) { const row = []; for (let j = 0; j < n; j++) row.push(rd(mu + (r.next() - 0.5) * 3 * sd)); obs.push(row); }
    means = obs.map(mean); ranges = obs.map((row) => Math.max(...row) - Math.min(...row));
    if (ranges.some((v) => v <= 0)) return xr(r, raw);
  } else {
    means = []; ranges = [];
    for (let i = 0; i < k; i++) { means.push(rd(mu + (r.next() - 0.5) * 2 * sd)); ranges.push(Math.max(rd(sd * 0.3), rd(sd * (1 + r.next() * 2.5)))); }
  }
  const xbb = mean(means), rbar = mean(ranges), A2 = FACT[n][0], D4 = FACT[n][1], D3 = FACT[n][2];
  const table = raw
    ? grid(["Sample"].concat(obs[0].map((_, j) => "Obs. " + (j + 1))), obs.map((row, i) => [i + 1].concat(row.map((v) => fmt(v, dp)))))
    : grid(["Sample", "Mean", "Range"], means.map((m, i) => [i + 1, fmt(m, dp), fmt(ranges[i], dp)]));
  return { c, n, k, means, ranges, xbb, rbar, A2, D4, D3, table, raw, dp };
}
function xrStory(x) { return x.raw ? `${x.c.who} sampled the ${x.c.what} (${x.c.u}) ${x.k} times, ${x.n} at a time:${x.table}` : `${x.c.who} took ${x.k} samples of ${x.n} to study the ${x.c.what} (${x.c.u}). The table shows each sample's mean and range.${x.table}`; }
function xrSteps(x) {
  return (x.raw ? [`Sample means: ${x.means.map(n2).join(", ")}. Ranges (largest − smallest): ${x.ranges.map(n2).join(", ")}.`] : []).concat([`x̄̄ = ${n2(sum(x.means))} ÷ ${x.k} = ${n4(x.xbb)}; R̄ = ${n2(sum(x.ranges))} ÷ ${x.k} = ${n4(x.rbar)}.`, `n = ${x.n} → A2 = ${x.A2}, D4 = ${x.D4}, D3 = ${x.D3}.`]);
}
add(function (r) {
  const x = xr(r, r.chance(0.4)), which = r.chance(0.5) ? "x̄̄ (the mean of the sample means)" : "R̄ (the average range)", ans = which[0] === "x" ? x.xbb : x.rbar;
  return N({
    story: xrStory(x), ask: `What is ${which}? ${R2}`, answer: ans, unit: x.c.u,
    hints: x.raw ? ["For each sample: mean = average of its observations; range = largest − smallest.", `Then average across the ${x.k} samples.`] : [`Average the ${x.k} values in the right column.`],
    steps: xrSteps(x).slice(0, x.raw ? 2 : 1),
    mistakes: [[ans === x.xbb ? x.rbar : x.xbb, ans === x.xbb ? "That's R̄ (average range). You need the average of the MEANS." : "That's x̄̄ (average of means). You need the average RANGE."], [ans === x.xbb ? sum(x.means) / x.n : sum(x.ranges) / x.n, `Divide by the number of samples (${x.k}), not the sample size.`]],
  });
});
for (const side of ["UCL", "LCL"]) {
  add(function (r) {
    const x = xr(r, r.chance(0.3)), sg = side === "UCL" ? 1 : -1, ans = x.xbb + sg * x.A2 * x.rbar;
    const Ak = FACT[x.k] ? FACT[x.k][0] : null;
    return N({
      story: xrStory(x), ask: `What is the 3-sigma <b>${side}</b> for the x̄-chart? ${R2}`, answer: ans, unit: x.c.u,
      hints: ["Find x̄̄ (average of the means) and R̄ (average of the ranges).", `Look up A2 for sample size n = ${x.n}.`, `${side} = x̄̄ ${sg > 0 ? "+" : "−"} A2 × R̄.`],
      steps: xrSteps(x).concat([`${side} = ${n4(x.xbb)} ${sg > 0 ? "+" : "−"} ${x.A2}(${n4(x.rbar)}) = <b>${n2(ans)}</b>.`]),
      mistakes: [[Ak && Ak !== x.A2 ? x.xbb + sg * Ak * x.rbar : -1, `That A2 is for ${x.k} (the number of samples). Use sample size n = ${x.n}.`], [x.xbb + sg * x.D4 * x.rbar, "That uses D4. The x̄-chart uses A2."], [x.xbb + sg * x.rbar, "Multiply R̄ by A2."], [x.xbb - sg * x.A2 * x.rbar, `That's the ${side === "UCL" ? "LCL" : "UCL"}.`]],
    });
  });
}

level("R-Charts", { intro: "<b>UCL(R) = D4 × R̄</b>, <b>LCL(R) = D3 × R̄</b>. For n ≤ 6, D3 = 0, so the LCL is 0." });
for (const side of ["UCL", "LCL"]) {
  add(function (r) {
    let x; do { x = xr(r, r.chance(0.3)); } while (side === "LCL" && x.n < 7 && r.chance(0.6));
    const ans = side === "UCL" ? x.D4 * x.rbar : x.D3 * x.rbar, Fk = FACT[x.k];
    return N({
      story: xrStory(x), ask: `What is the 3-sigma <b>${side}</b> for the R-chart? ${R2}`, answer: ans, unit: x.c.u, zeroOK: true,
      hints: ["R̄ = average of the sample ranges.", `Look up ${side === "UCL" ? "D4" : "D3"} for sample size n = ${x.n}.`, `${side} = ${side === "UCL" ? "D4" : "D3"} × R̄.`],
      steps: xrSteps(x).concat([`${side} = ${side === "UCL" ? x.D4 : x.D3} × ${n4(x.rbar)} = <b>${n2(ans)}</b>.`]),
      mistakes: [[Fk ? Fk[side === "UCL" ? 1 : 2] * x.rbar : -1, `That factor is for ${x.k} (the number of samples). Use n = ${x.n}.`], [side === "UCL" ? x.D3 * x.rbar : x.D4 * x.rbar, `That's the ${side === "UCL" ? "LCL (D3)" : "UCL (D4)"}.`], [x.xbb + (side === "UCL" ? 1 : -1) * x.A2 * x.rbar, "That's an x̄-chart limit. The R-chart uses D4 and D3 times R̄."], [side === "UCL" ? x.D4 * x.xbb : -1, "Multiply D4 by R̄ (average RANGE), not x̄̄."]],
    });
  });
}

level("p-Charts", { intro: "<b>σp = √(p̄(1 − p̄) ÷ n)</b>, <b>UCL/LCL = p̄ ± z·σp</b>. Write p̄ as a DECIMAL (2% = 0.02). n is the number of items in each sample. A negative LCL is set to 0: you can't have a negative fraction defective." });
const PC = [
  { who: "Magnolia Insurance", what: "claims entered with a data-entry error", per: "claims" },
  { who: "Northport Pharmacy", what: "prescriptions filled incorrectly", per: "prescriptions" },
  { who: "Campus IT", what: "assignment uploads that fail", per: "upload attempts" },
  { who: "Druid City Coffee", what: "mobile orders made wrong", per: "orders" },
  { who: "Gulf Coast Shipping", what: "packages mislabeled", per: "packages" },
  { who: "Crimson Call Center", what: "calls dropped", per: "calls" },
  { who: "Riverbend Valve Works", what: "valves that fail the pressure test", per: "valves" },
];
add(function (r) {
  const c = r.pick(PC), p = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 28]) / 100, n = r.step(50, 500, 10), ans = Math.sqrt((p * (1 - p)) / n);
  return N({
    story: `Historically, about ${n2(p * 100).replace(/\.00$/, "")}% of ${c.who}'s ${c.per} are ${c.what}. Each day, ${n} ${c.per} are checked.`,
    ask: `What is the standard deviation of the sampling distribution, σp? ${R4}`, answer: ans, dec: 4, unit: "",
    hints: [`Write the rate as a decimal: p̄ = ${p}.`, "σp = √(p̄(1 − p̄) ÷ n)."],
    steps: [`σp = √(${p} × ${n4(1 - p)} ÷ ${n}) = √${fmt((p * (1 - p)) / n, 6)} = <b>${n4(ans)}</b>.`],
    mistakes: [[(p * (1 - p)) / n, "Take the square root."], [Math.sqrt(p * (1 - p)), "Divide by n inside the square root."], [Math.sqrt(p / n), "Use p̄(1 − p̄) on top."]],
  });
});
for (const side of ["UCL", "LCL"]) {
  add(function (r) {
    const c = r.pick(PC), p = r.pick([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]) / 100, n = r.step(50, 500, 10), zz = r.chance(0.25) ? { text: "4-sigma", z: 4 } : zPick(r);
    const sp = Math.sqrt((p * (1 - p)) / n), raw = side === "UCL" ? p + zz.z * sp : p - zz.z * sp, ans = Math.max(0, raw), sg = side === "UCL" ? 1 : -1;
    return N({
      story: `About ${n2(p * 100).replace(/\.00$/, "")}% of ${c.who}'s ${c.per} have historically been ${c.what}. A sample of ${n} ${c.per} is checked every day.`,
      ask: `What is the ${zz.pct ? "" : zz.text + " "}<b>${side}</b> of the p-chart${zz.pct ? ` (limits that include ${zz.text} of the natural variation)` : ""}? Enter it as a decimal (for example, 0.0425). ${R4}`, answer: ans, dec: 4, unit: "", zeroOK: true,
      hints: [`p̄ = ${p}. σp = √(p̄(1 − p̄) ÷ n).`, `z = ${zz.z}. ${side} = p̄ ${sg > 0 ? "+" : "−"} z·σp.`, side === "LCL" ? "If the LCL comes out negative, it's set to 0." : "Keep it as a decimal."],
      steps: [`σp = √(${p} × ${n4(1 - p)} ÷ ${n}) = ${fmt(sp, 6)}.`, `${side} = ${p} ${sg > 0 ? "+" : "−"} ${zz.z}(${fmt(sp, 6)}) = ${fmt(raw, 6)}${raw < 0 ? " → negative, so the LCL is set to 0" : ""}.`, `${side} = <b>${n4(ans)}</b>.`],
      mistakes: [[raw < 0 ? raw : -1, "A fraction defective can't be negative. Set the LCL to 0."], [Math.max(0, p + sg * zz.z * Math.sqrt(p * (1 - p))), "Divide by n inside the square root."], [zz.z !== 3 ? Math.max(0, p + sg * 3 * sp) : -1, `Use z = ${zz.z}.`], [Math.max(0, p + sg * zz.z * ((p * (1 - p)) / n)), "Take the square root for σp."], [ans * 100 > 1 ? ans * 100 : -1, "Enter it as a decimal, not a percent."]],
    });
  });
}
add(function (r) {
  const c = r.pick(PC), k = r.int(5, 10), n = r.step(50, 300, 10), p0 = r.pick([2, 3, 4, 5, 6, 8, 10]) / 100;
  const d = []; for (let i = 0; i < k; i++) d.push(Math.max(0, Math.round(n * p0 * (0.4 + r.next() * 1.2))));
  if (sum(d) === 0) d[0] = 2;
  const pb = sum(d) / (k * n), zz = r.chance(0.5) ? { text: "3-sigma", z: 3 } : zPick(r), sp = Math.sqrt((pb * (1 - pb)) / n), ucl = pb + zz.z * sp;
  const target = r.pick(["pbar", "ucl"]);
  return N({
    story: `${c.who} checked ${n} ${c.per} on each of ${k} days and counted the ${c.what}:${grid(["Day", "Number defective"], d.map((v, i) => [i + 1, v]))}`,
    ask: target === "pbar" ? `What is p̄, the average fraction defective? Enter it as a decimal. ${R4}` : `What is the ${zz.pct ? "" : zz.text + " "}UCL of the p-chart${zz.pct ? ` (limits that include ${zz.text} of the variation)` : ""}? Enter it as a decimal. ${R4}`,
    answer: target === "pbar" ? pb : ucl, dec: 4, unit: "",
    hints: [`p̄ = total defectives ÷ total items inspected = ${sum(d)} ÷ (${k} × ${n}).`].concat(target === "ucl" ? [`σp = √(p̄(1 − p̄) ÷ ${n}). Use n = ${n} (items per sample), not ${k}.`, `UCL = p̄ + ${zz.z}σp.`] : []),
    steps: [`p̄ = ${sum(d)} ÷ ${k * n} = ${fmt(pb, 6)}.`].concat(target === "ucl" ? [`σp = √(${fmt(pb, 6)} × ${fmt(1 - pb, 6)} ÷ ${n}) = ${fmt(sp, 6)}.`, `UCL = ${fmt(pb, 6)} + ${zz.z}(${fmt(sp, 6)}) = <b>${n4(ucl)}</b>.`] : [`p̄ = <b>${n4(pb)}</b>.`]),
    mistakes: target === "pbar" ? [[sum(d) / n, `Divide by ALL items inspected: ${k} days × ${n}.`], [sum(d) / k, "That's the average NUMBER defective per day. Divide by the items per day too."], [pb * 100, "Enter it as a decimal."]] : [[pb + zz.z * Math.sqrt((pb * (1 - pb)) / k), `n is the number of items in each sample (${n}), not the number of days.`], [pb + zz.z * Math.sqrt((pb * (1 - pb)) / (k * n)), `Use n = ${n} (one sample), not the total inspected.`], [pb, "That's p̄. Add z·σp."]],
  });
});

level("c-Charts", { intro: "<b>c̄ = total defects ÷ number of units (or periods).</b> <b>UCL/LCL = c̄ ± z√c̄.</b> A negative LCL is set to 0." });
const CC = [
  { who: "The Crimson Ride", what: "complaints about drivers", per: "day" },
  { who: "Campus Help Desk", what: "password-reset tickets", per: "day" },
  { who: "Northport Auto Body", what: "paint flaws per car door", per: "door" },
  { who: "Shelby Street Bakery", what: "customer complaints", per: "week" },
  { who: "Gulf Coast Textiles", what: "flaws per bolt of cloth", per: "bolt" },
  { who: "City Transit", what: "bus delays", per: "day" },
];
for (const which of ["cbar", "UCL", "LCL"]) {
  add(function (r) {
    const c = r.pick(CC), k = r.int(6, 12), lam = r.int(2, 14), d = []; for (let i = 0; i < k; i++) d.push(Math.max(0, Math.round(lam + (r.next() - 0.5) * lam * 1.2)));
    if (sum(d) === 0) d[0] = 3;
    const cb = sum(d) / k, zz = r.chance(0.6) ? { text: "3-sigma", z: 3 } : zPick(r);
    const ucl = cb + zz.z * Math.sqrt(cb), lraw = cb - zz.z * Math.sqrt(cb), lcl = Math.max(0, lraw);
    const ans = which === "cbar" ? cb : which === "UCL" ? ucl : lcl;
    return N({
      story: `${c.who} counted ${c.what} over ${k} ${c.per}s:${grid([c.per[0].toUpperCase() + c.per.slice(1), "Count"], d.map((v, i) => [i + 1, v]))}`,
      ask: which === "cbar" ? `What is c̄, the average number of defects per ${c.per}? ${R2}` : `What is the ${zz.pct ? "" : zz.text + " "}<b>${which}</b> of the c-chart${zz.pct ? ` (limits that include ${zz.text} of the variation)` : ""}? ${R2}`,
      answer: ans, unit: "", zeroOK: true,
      hints: [`c̄ = total ÷ number of ${c.per}s = ${sum(d)} ÷ ${k}.`].concat(which === "cbar" ? [] : [`${which} = c̄ ${which === "UCL" ? "+" : "−"} ${zz.z}√c̄.`, which === "LCL" ? "A negative LCL is set to 0." : "Take the square root of c̄, not of the total."]),
      steps: [`c̄ = ${sum(d)} ÷ ${k} = ${n4(cb)}.`].concat(which === "cbar" ? [`c̄ = <b>${n2(cb)}</b>.`] : [`√c̄ = ${n4(Math.sqrt(cb))}.`, `${which} = ${n4(cb)} ${which === "UCL" ? "+" : "−"} ${zz.z}(${n4(Math.sqrt(cb))}) = ${n4(which === "UCL" ? ucl : lraw)}${which === "LCL" && lraw < 0 ? " → negative, so 0" : ""}.`, `${which} = <b>${n2(ans)}</b>.`]),
      mistakes: which === "cbar" ? [[sum(d), `Divide by the number of ${c.per}s (${k}).`]] : [[cb + (which === "UCL" ? 1 : -1) * zz.z * cb, "Use the SQUARE ROOT of c̄."], [Math.max(0, cb + (which === "UCL" ? 1 : -1) * Math.sqrt(cb)), `Multiply √c̄ by z = ${zz.z}.`], [which === "LCL" && lraw < 0 ? lraw : -1, "The count of defects can't be negative. Set the LCL to 0."], [zz.z !== 3 ? Math.max(0, cb + (which === "UCL" ? 1 : -1) * 3 * Math.sqrt(cb)) : -1, `Use z = ${zz.z}.`]],
    });
  });
}

// ================================================================== PART 2: SUPPLY CHAIN CONCEPTS (Ch. 11)
part(8, "Supply Chain Concepts (Ch. 11)", "Strategy, the six sourcing strategies, risk, the bullwhip effect, integration tools, suppliers, logistics, and sustainability.");

const SOURCING = ["Many suppliers", "Few suppliers", "Vertical integration", "Joint venture", "Keiretsu network", "Virtual company"];
const SOURCING_NOTES = {
  "Many suppliers": "Many suppliers: buy mostly on price from suppliers who compete, common for commodities.",
  "Few suppliers": "Few suppliers: long-term relationships with a small group, gaining economies of scale and learning, but switching is very costly.",
  "Vertical integration": "Vertical integration: making a good or service you used to buy, moving forward (toward customers) or backward (toward suppliers).",
  "Joint venture": "Joint venture: a formal collaboration where firms pool resources but stay separate companies.",
  "Keiretsu network": "Keiretsu: a Japanese middle ground between few suppliers and vertical integration; the buyer often supports suppliers with ownership or loans.",
  "Virtual company": "Virtual company: relies on many supplier relationships to provide services on demand, with fluid boundaries and low capital investment.",
};

level("Strategy & Sourcing");
add(concept({
  v: [
    { q: "A discount grocery chain competes by having the lowest prices in town. What is its PRIMARY supplier selection criterion?", a: "Cost" },
    { q: "A same-day delivery company wins customers by being faster than anyone. What matters most when it picks suppliers?", a: "Capacity, speed, and flexibility" },
    { q: "A tech company wins on unique, cutting-edge products. What matters most when it picks suppliers?", a: "Product development skills and willingness to share information" },
  ],
  pool: ["Cost", "Capacity, speed, and flexibility", "Product development skills and willingness to share information", "Selling through discount distributors"],
  notes: { "Cost": "Cost is the top criterion for a LOW-COST strategy.", "Capacity, speed, and flexibility": "Those are the criteria for a RESPONSE strategy.", "Product development skills and willingness to share information": "Those are the criteria for a DIFFERENTIATION strategy.", "Selling through discount distributors": "That's a distribution choice for low-cost firms, not a supplier selection criterion." },
  why: "Table 11.2: low-cost strategy → pick suppliers on cost. Response → capacity, speed, flexibility. Differentiation → product development skills, sharing information, jointly developing products.",
}));
add(concept({
  q: "A fashion retailer's strategy is RESPONSE: get new styles into stores faster than competitors. Which supply chain choice fits?",
  a: "Use buffer stocks and fast transportation to ensure speedy supply",
  w: [["Minimize inventory to hold down costs and ship by the cheapest method", "That fits a low-cost strategy."], ["Choose suppliers mainly for their product development skills", "That's the differentiation criterion."], ["Sell mainly through discount distributors", "That fits a low-cost strategy."]],
  why: "Response strategies use buffer stocks to ensure speedy supply, fast transportation, and suppliers chosen for capacity, speed, and flexibility.",
}));
add(concept({
  v: [
    { q: "A coffee roaster buys the farms that grow its beans. What is this?", a: "Backward integration" },
    { q: "A furniture maker buys the lumber mill that supplies its wood. What is this?", a: "Backward integration" },
    { q: "A paint manufacturer opens its own chain of retail paint stores. What is this?", a: "Forward integration" },
    { q: "A tire company buys a chain of auto service centers that sells its tires to drivers. What is this?", a: "Forward integration" },
  ],
  pool: ["Backward integration", "Forward integration", "Joint venture", "Keiretsu network"],
  notes: { "Backward integration": "Backward = moving toward your SUPPLIERS (upstream).", "Forward integration": "Forward = moving toward your CUSTOMERS (downstream).", "Joint venture": "A joint venture is a collaboration between separate firms, not owning another stage of the chain.", "Keiretsu network": "A keiretsu is a supplier coalition, not owning the next stage outright." },
  why: "Vertical integration means producing what you used to buy. Toward suppliers (raw materials) = backward. Toward the end customer = forward.",
}));
add(concept({
  v: [
    { q: "A company sits in the middle ground between using a few suppliers and full vertical integration. Its suppliers are part of a coalition, and the company often supports them with loans or partial ownership. Which sourcing strategy is this?", a: "Keiretsu network" },
    { q: "A startup has no factories or warehouses. It relies on a web of outside partners for design, manufacturing, and shipping as needed, with very low capital investment. Which sourcing strategy is this?", a: "Virtual company" },
    { q: "Two hospital systems form a jointly owned company to run a shared laundry facility, but stay separate organizations. Which sourcing strategy is this?", a: "Joint venture" },
    { q: "A restaurant chain signs long-term deals with a small group of produce suppliers, who then help with menu testing and join its JIT program. Which sourcing strategy is this?", a: "Few suppliers" },
    { q: "A university buys plain copy paper from whichever vendor bids lowest each semester. Which sourcing strategy is this?", a: "Many suppliers" },
  ],
  pool: SOURCING, notes: SOURCING_NOTES,
  why: "The six sourcing strategies: many suppliers, few suppliers, vertical integration, joint ventures, keiretsu networks, and virtual companies.",
}));
add(concept({
  q: ["Which of these is NOT one of the six sourcing strategies?", "A classmate lists sourcing strategies. Which one doesn't belong?"],
  a: ["Postponement", "Blanket ordering", "Cross-docking"],
  w: ["Keiretsu networks", "Virtual companies", "Vertical integration", "Few suppliers", "Joint ventures"],
  why: "The six sourcing strategies are many suppliers, few suppliers, vertical integration, joint ventures, keiretsu networks, and virtual companies. Postponement and blanket ordering are supply chain integration tools; cross-docking is a warehouse function.",
}));
add(concept({
  q: "When is vertical integration especially risky?",
  a: "In industries with rapid technological change",
  w: [["When demand is stable and predictable", "Stable demand actually helps vertical integration pay off."], ["When the firm has plenty of capital and managerial skill", "Those are things vertical integration requires, so having them lowers risk."], ["When the product is a simple commodity", "That's when 'many suppliers' is common."]],
  why: "Vertical integration can improve cost, quality, and inventory, but it requires capital, managerial skill, and demand, and it's risky when technology changes fast.",
}));
add(concept({
  q: "What is the main downside of the FEW suppliers strategy?",
  a: "The cost of changing suppliers is huge",
  w: [["Suppliers compete only on price", "That describes many suppliers."], ["Suppliers won't share design expertise", "Few-supplier partners are MORE willing to share expertise and join JIT programs."], ["It requires buying the suppliers", "That's vertical integration."]],
  why: "Few suppliers create value through long-term relationships, economies of scale, and learning curves, but switching suppliers becomes very costly.",
}));

level("Risk & the Bullwhip");
add(concept({
  q: "How does relying on FEWER suppliers affect supply chain risk?",
  a: "It increases dependence on each supplier, which increases risk",
  w: [["It removes political and currency risk", "Those risks come from globalization, not the number of suppliers."], ["It always lowers risk because relationships are closer", "Closer relationships help, but fewer suppliers still means more dependence."], ["It has no effect on risk", "Fewer suppliers means more dependence."]],
  why: "More reliance on supply chains means more risk. Fewer suppliers increase dependence, and globalization and logistics complexity add to it.",
}));
add(concept({
  q: "Which of these is a supply chain risk mitigation tactic?",
  a: ["Diversify the supplier base", "Prepare responses to negative events ahead of time", "Research and assess possible risks"],
  w: [["Move all purchasing to one low-cost overseas supplier", "That increases dependence and risk."], ["Eliminate all tracking to cut costs", "Tracking helps security and expediting."], ["Ignore suppliers' financial health", "Assessing risk is part of mitigation."]],
  why: "Mitigation tactics include researching and assessing risks, innovative planning, preparing responses to negative events, and flexible, secure supply chains with a diversified supplier base.",
}));
add(concept({
  story: "A small bump in toothpaste sales leads stores to order 10% more than usual. The distributor, seeing bigger orders, orders 25% more. The manufacturer schedules 50% more production.",
  ask: "What is happening?",
  q: "What is happening?",
  a: "The bullwhip effect",
  w: [["Postponement", "Postponement delays customization as long as possible."], ["Drop shipping", "Drop shipping sends goods directly from the supplier to the customer."], ["Channel assembly", "Channel assembly is a warehouse assembling products from components."]],
  why: "The bullwhip effect: order fluctuations get bigger at each step as orders are relayed from retailers to distributors to wholesalers to manufacturers, caused by distorted information.",
}));
add(concept({
  q: ["Which is a RESULT of the bullwhip effect?", "What does the bullwhip effect do to a supply chain?"],
  a: ["Unstable production schedules and higher inventory costs", "Expensive capacity changes and longer lead times"],
  w: [["Lower inventory costs at every stage", "It increases inventory costs."], ["More accurate forecasts upstream", "It distorts information upstream."], ["Shorter lead times for everyone", "It creates longer lead times."]],
  why: "The bullwhip effect creates unstable production schedules, expensive capacity changes, underutilization, longer lead times, obsolescence, and higher inventory costs. Coordination and planning with suppliers minimize the damage.",
}));
add(concept({
  v: [
    { q: "Each store manager orders whatever makes their own store's numbers look best, without thinking about the rest of the chain. Which integration ISSUE is this?", a: "Local optimization" },
    { q: "A manufacturer offers end-of-quarter discounts, so distributors stock up on product customers haven't bought yet. Which integration ISSUE is this?", a: "Incentives" },
    { q: "A distributor orders a full truckload every time to save on shipping, even though actual sales are much smaller and steadier. Which integration ISSUE is this?", a: "Large lots" },
  ],
  pool: ["Local optimization", "Incentives", "Large lots", "Vendor managed inventory"],
  notes: { "Local optimization": "Local optimization: each part optimizes for itself, which can magnify fluctuations.", "Incentives": "Incentives push merchandise into the chain for sales that haven't happened.", "Large lots": "Large lots cut shipping and production costs but raise holding costs and don't reflect actual sales.", "Vendor managed inventory": "VMI is an OPPORTUNITY (a fix), not an issue." },
  why: "Three issues in managing an integrated supply chain: local optimization, incentives, and large lots. All of them can feed the bullwhip effect.",
}));
add(concept({
  q: "What mainly CAUSES the bullwhip effect?",
  a: "Distorted information as orders move up the supply chain",
  w: [["Customers suddenly buying far less", "It can start with a SMALL change; the problem is how it gets amplified."], ["Suppliers using trucks instead of rail", "Shipping mode isn't the cause."], ["Too much information sharing", "Sharing accurate information reduces it."]],
  why: "The bullwhip effect occurs because of distortions in information as orders are relayed through the supply chain. Sharing accurate pull data helps reduce it.",
}));
add(concept({
  q: "Sensors that report a shipment's location, motion, broken seals, and temperature mainly help with:",
  a: "Security and tracking shipments, so problems can be expedited",
  w: [["Setting the EOQ", "Sensors don't set order sizes."], ["Eliminating the need for warehouses", "They improve monitoring, not storage needs."], ["Choosing a sourcing strategy", "That's a strategic decision, not a tracking tool."]],
  why: "Shipments get misrouted, stolen, damaged, or delayed. Technology like location, motion, seal, and temperature sensors improves security and helps expedite shipments.",
}));

level("Integration Tools");
const OPPS = ["Vendor managed inventory (VMI)", "CPFR", "Blanket order", "Postponement", "Drop shipping", "Standardization", "Blockchain", "Omnichannel strategy"];
const OPP_NOTES = {
  "Vendor managed inventory (VMI)": "VMI: the supplier monitors and replenishes the buyer's inventory.",
  "CPFR": "CPFR: collaborative planning, forecasting, and replenishment across the supply chain.",
  "Blanket order": "Blanket order: a long-term contract with actual orders released against it over time.",
  "Postponement": "Postponement: withhold modification or customization as long as possible.",
  "Drop shipping": "Drop shipping: the supplier ships directly to the end customer, bypassing the seller.",
  "Standardization": "Standardization: reducing the variety of parts or products.",
  "Blockchain": "Blockchain: a shared, tamper-resistant record that aids tracking and verification.",
  "Omnichannel strategy": "Omnichannel: multiple integrated channels of communication and shipping.",
};
add(concept({
  v: [
    { q: "A snack company's rep checks the store's shelves and decides when and how much to restock. The store never places orders itself. Which tool is this?", a: "Vendor managed inventory (VMI)" },
    { q: "A retailer and a manufacturer share sales forecasts and plan replenishment together all year. Which tool is this?", a: "CPFR" },
    { q: "A hospital signs a one-year agreement for 12,000 IV bags, then calls in about 1,000 each month as needed. Which tool is this?", a: "Blanket order" },
    { q: "A paint store keeps only white base paint and mixes in color after the customer chooses. Which tool is this?", a: "Postponement" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Integration opportunities include accurate pull data, lot size reduction, blanket orders, VMI, CPFR, standardization, postponement, electronic ordering, omnichannel, drop shipping, blockchain, and IoT.",
}));
add(concept({
  v: [
    { q: "An online store forwards each order to the manufacturer, which ships straight to the customer's door. Which tool is this?", a: "Drop shipping" },
    { q: "A phone maker uses the same charging port and battery across every model to cut parts variety. Which tool is this?", a: "Standardization" },
    { q: "A grocery chain records each step of a mango's trip from farm to shelf in a shared, tamper-resistant digital ledger. Which tool is this?", a: "Blockchain" },
    { q: "Customers can order online, pick up in store, or get home delivery, all from one connected system. Which tool is this?", a: "Omnichannel strategy" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Each of these is an opportunity for managing the integrated supply chain.",
}));
add(concept({
  v: [
    { q: "A laptop maker ships the same base model to regional warehouses and adds the country's keyboard and power cord only after orders come in. Which tool is this?", a: "Postponement" },
    { q: "A distributor gives its supplier access to its warehouse inventory data so the supplier can keep it stocked. Which tool is this?", a: "Vendor managed inventory (VMI)" },
    { q: "A car plant agrees to buy 50,000 seat belts this year at a set price and releases weekly shipments against that contract. Which tool is this?", a: "Blanket order" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Postponement reduces the risk of making the wrong version. VMI moves replenishment to the supplier. Blanket orders lock in a long-term agreement with releases over time.",
}));
add(concept({
  q: "How does using accurate \"pull\" data (actual point-of-sale data) help a supply chain?",
  a: "It shares real demand information, reducing the distortion that causes the bullwhip effect",
  w: [["It lets each stage ignore the others", "That's local optimization."], ["It increases lot sizes", "Lot size reduction is a separate opportunity."], ["It eliminates the need for suppliers", "It improves coordination with suppliers."]],
  why: "Accurate pull data and shared information are opportunities that reduce the bullwhip effect.",
}));
add(concept({
  q: "Electronic ordering and electronic funds transfer mainly:",
  a: "Speed transactions and reduce paperwork",
  w: [["Increase lead times", "They shorten transaction time."], ["Replace the need for inventory", "They speed transactions; inventory is still needed."], ["Are a type of sourcing strategy", "They're an integration opportunity."]],
  why: "Electronic ordering and funds transfer speed transactions and reduce paperwork.",
}));

level("Suppliers & Logistics");
add(concept({
  v: [
    { q: "A company searches for potential suppliers and judges how likely each is to become a good supplier. Which step of building the supply base is this?", a: "Supplier evaluation" },
    { q: "A company trains a new supplier on its quality requirements, schedules, and information transfer procedures. Which step is this?", a: "Supplier development" },
    { q: "A company works out contract terms that share risks and benefits and create incentives. Which step is this?", a: "Negotiation" },
  ],
  pool: ["Supplier evaluation", "Supplier development", "Negotiation", "Third-party logistics"],
  notes: { "Supplier evaluation": "Evaluation: finding potential suppliers and judging if they'll be good ones (including certification).", "Supplier development": "Development: integrating the supplier into your system (quality, specs, schedules, training).", "Negotiation": "Negotiation: contracting, centralized purchasing, and e-procurement.", "Third-party logistics": "3PL is outsourcing logistics, not a step in building the supply base." },
  why: "Building the supply base: supplier evaluation, supplier development, and negotiation.",
}));
add(concept({
  q: "Which is NOT one of the four critical points in the logistics process?",
  a: ["Production scheduling", "Product design"],
  w: ["Point of origin", "Warehousing", "Transit", "Destination"],
  why: "The four critical points in logistics are point of origin, warehousing, transit, and destination.",
}));
const MODES = ["Trucking", "Railroads", "Airfreight", "Waterways", "Pipelines", "Multimodal"];
const MODE_NOTES = { Trucking: "Trucking: moves most manufactured goods; chief advantage is flexibility; most vulnerable to accidents.", Railroads: "Rail: carries large loads; containers and piggybacking improved flexibility.", Airfreight: "Air: fast and flexible for light loads, but can be expensive.", Waterways: "Waterways: bulky, low-value cargo when cost matters more than speed.", Pipelines: "Pipelines: oil, gas, and other chemical products.", Multimodal: "Multimodal: combines methods, common internationally, aided by standard containers." };
add(concept({
  v: [
    { q: "Which shipping system moves the vast majority of manufactured goods, with flexibility as its chief advantage?", a: "Trucking" },
    { q: "A gravel company needs to move huge amounts of cheap, bulky rock, and cost matters far more than speed. Which shipping system fits best?", a: "Waterways" },
    { q: "A company needs small, light, high-value phone parts across the country overnight. Which shipping system fits best?", a: "Airfreight" },
    { q: "Which shipping system is used for natural gas and crude oil?", a: "Pipelines" },
    { q: "A container leaves China by ship, rides a train to Kansas City, then goes by truck to a store. What is this called?", a: "Multimodal" },
    { q: "A grain company sends 100 cars of wheat across the Midwest at once. Which system is built for very large loads like this?", a: "Railroads" },
  ],
  pool: MODES, notes: MODE_NOTES,
  why: "Shipping systems: trucking, railroads, airfreight, waterways, pipelines, and multimodal.",
}));
add(concept({
  v: [
    { q: "Which shipping system is the MOST vulnerable to accidents?", a: "Trucking" },
    { q: "Which shipping system is fast and flexible for light loads but may be expensive?", a: "Airfreight" },
    { q: "Standardized containers have especially helped which kind of shipping?", a: "Multimodal" },
  ],
  pool: MODES, notes: MODE_NOTES,
  why: "Know each mode's strength: trucking (flexibility), rail (large loads), air (speed for light loads), water (cheap for bulky cargo), pipelines (oil and gas), multimodal (combinations).",
}));
const WH = ["Cross-docking", "Break-bulk", "Consolidation", "Channel assembly", "Postponement"];
add(concept({
  v: [
    { q: "Pallets come off inbound trucks and go straight onto outbound trucks without ever being stored. Which warehouse function is this?", a: "Cross-docking" },
    { q: "A warehouse receives one huge shipment and splits it into many small shipments for local stores. Which warehouse function is this?", a: "Break-bulk" },
    { q: "A warehouse combines many small shipments from different suppliers into one full truckload. Which warehouse function is this?", a: "Consolidation" },
    { q: "A warehouse receives computer parts from several suppliers and assembles finished computers before shipping. Which warehouse function is this?", a: "Channel assembly" },
  ],
  pool: WH,
  notes: { "Cross-docking": "Cross-docking: unload and reload right away, with no storage.", "Break-bulk": "Break-bulk: split large shipments into smaller ones.", Consolidation: "Consolidation: combine small shipments into larger ones.", "Channel assembly": "Channel assembly: assemble products from components in the distribution channel.", Postponement: "Postponement: delay final customization." },
  why: "The fundamental purpose of a warehouse is to store goods, but it may also provide consolidation, break-bulk, cross-docking, postponement, and channel assembly.",
}));
add(concept({
  q: ["A company stops running its own trucks and warehouses and hires a specialist firm to handle warehousing, shipping, and customs. What is this?", "Outsourcing the logistics function to a specialist provider is called:"],
  a: "Third-party logistics (3PL)",
  w: [["Vertical integration", "That's taking on more of the chain yourself, the opposite of outsourcing."], ["Keiretsu", "A keiretsu is a supplier coalition."], ["Drop shipping", "Drop shipping is about who ships to the customer, not outsourcing all logistics."]],
  why: "3PL: outsourcing logistics can reduce inventory and costs and improve delivery reliability and speed. 3PLs may provide warehousing, assembly, testing, shipping, and customs.",
}));

level("Sustainability & Benchmarking");
add(concept({
  v: [
    { q: "Customers return old phones, which are sent back up the supply chain to be repaired, resold, or recycled. What is this?", a: "Reverse logistics" },
    { q: "Before a product launches, a company designs its supply chain to handle both shipping products out AND bringing them back for reuse. What is this?", a: "Closed-loop supply chain" },
    { q: "A company compares its order fill rate and inventory days of supply with top-performing firms in its industry. What is this?", a: "Benchmarking" },
  ],
  pool: ["Reverse logistics", "Closed-loop supply chain", "Benchmarking", "Postponement"],
  notes: { "Reverse logistics": "Reverse logistics: sending returned products back up the chain for resale, repair, reuse, remanufacture, recycling, or disposal.", "Closed-loop supply chain": "Closed-loop: proactively designing for all forward AND reverse flows, preparing for returns before launch.", Benchmarking: "Benchmarking: comparing your metrics with benchmark firms.", Postponement: "Postponement delays customization." },
  why: "Sustainability in supply chains includes reverse logistics and closed-loop supply chains. Benchmarking compares performance against the best firms.",
}));
add(concept({
  q: "Compared with typical firms, BENCHMARK firms in consumer packaged goods have:",
  a: "Higher order fill rates and fewer inventory days of supply",
  w: [["Lower fill rates and more inventory", "That's backwards."], ["Longer order fulfillment lead times", "Benchmark firms are faster."], ["Longer cash-to-cash cycle times", "Benchmark firms have shorter cash-to-cash cycles."]],
  why: "Table 11.7: benchmark firms have higher order fill rates (98% vs 71%), shorter fulfillment lead times, shorter cash-to-cash cycles, and fewer inventory days of supply.",
}));
add(concept({
  q: "A HIGHER inventory turnover generally means:",
  a: "Inventory moves faster, so less money is tied up in inventory",
  w: [["The company holds more inventory relative to sales", "That would LOWER turnover."], ["The company has more weeks of supply", "Higher turnover means fewer weeks of supply."], ["Sales are falling", "Turnover compares COGS to inventory; higher usually means inventory is moving faster."]],
  why: "Inventory turnover = COGS ÷ inventory investment. Higher turnover means inventory is used and replaced more often.",
}));
add(concept({
  q: "The objective of supply chain management is to:",
  a: "Coordinate activities within the supply chain to maximize its competitive advantage and benefits to the ultimate consumer",
  w: [["Minimize the number of suppliers no matter what", "Fewer suppliers is one strategy, not the objective."], ["Make each company in the chain as profitable as possible on its own", "That's local optimization."], ["Eliminate all inventory", "That's not the objective of SCM."]],
  why: "SCM coordinates activities in the supply chain to maximize competitive advantage and benefits to the ultimate consumer.",
}));
add(concept({
  q: "What does the SCOR model provide?",
  a: "Metrics that help firms benchmark supply chain performance against the industry",
  w: [["A formula for the EOQ", "SCOR is about supply chain metrics."], ["A list of the seven wastes", "That's Ohno's list (lean)."], ["A sourcing strategy for Japanese firms", "That's keiretsu."]],
  why: "The SCOR (Supply Chain Operations Reference) model provides metrics to benchmark performance against the industry.",
}));

// ================================================================== PART 3: SUPPLY CHAIN MATH (Ch. 11)
part(9, "Supply Chain Math (Ch. 11)", "Percent invested in inventory, inventory turnover, and weeks of supply.");

function scBiz(r) {
  const c = r.pick([
    { name: "Tide & Table Seafood Restaurants", kind: "restaurant group", locs: ["Gulf Shores", "Orange Beach", "Mobile", "Fairhope"] },
    { name: "Crimson Corner Books", kind: "bookstore chain", locs: ["Tuscaloosa", "Northport", "Birmingham", "Huntsville"] },
    { name: "Black Warrior Outfitters", kind: "outdoor retailer", locs: ["Tuscaloosa", "Auburn", "Hoover", "Montgomery"] },
    { name: "Magic City Brewing", kind: "brewery", locs: ["Avondale", "Southside", "Homewood", "Vestavia"] },
    { name: "Cotton State Apparel", kind: "clothing manufacturer", locs: ["Plant 1", "Plant 2", "Plant 3", "Plant 4"] },
    { name: "Yellowhammer Hardware", kind: "hardware chain", locs: ["Dothan", "Enterprise", "Ozark", "Troy"] },
  ]);
  const assets = r.step(1500000, 9000000, 1000);
  const inv = Math.round(assets * (0.04 + r.next() * 0.3));
  const turn = 3 + r.next() * 12;
  const cogs = Math.round(inv * turn);
  const rev = Math.round(cogs * (1.15 + r.next() * 0.5));
  return { c, who: r.pick(FIRST), assets, inv, cogs, rev };
}
const money0 = (n) => "$" + n0(n);
function tableRows(rows) { return `<table class="data">${rows.map((x) => `<tr><td>${x[0]}</td><td class="num">${x[1]}</td></tr>`).join("")}</table>`; }

level("% Invested in Inventory");
add(function (r) {
  const x = scBiz(r), ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.who} wants to know how much of ${x.c.name}'s money is tied up in inventory. From last year's financials:${tableRows(r.shuffle([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Average inventory", money0(x.inv)], ["Total assets", money0(x.assets)]]))}`,
    ask: `What percent of total assets is invested in inventory? Enter it as a percent (for example, 12.34 for 12.34%). ${R2}`, answer: ans, unit: "%",
    hints: ["% invested = average inventory ÷ total assets × 100.", "Revenue and COGS aren't needed here."],
    steps: [`% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[ans / 100, "That's the decimal. Multiply by 100 to show it as a percent."], [(x.cogs / x.assets) * 100, "Use average inventory, not COGS."], [(x.inv / x.rev) * 100, "Divide by total assets, not revenue."], [(x.assets / x.inv) * 100, "Flip it: inventory goes on top."]],
  });
});
add(function (r) {
  const x = scBiz(r), rm = Math.round(x.inv * (0.25 + r.next() * 0.25)), wip = Math.round(x.inv * (0.05 + r.next() * 0.15)), fg = x.inv - rm - wip;
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.c.name} reports its inventory in three pieces:${tableRows([["Raw materials", money0(rm)], ["Work-in-process", money0(wip)], ["Finished goods", money0(fg)], ["Total assets", money0(x.assets)], ["Cost of goods sold", money0(x.cogs)]])}`,
    ask: `What percent of total assets is invested in inventory? Enter it as a percent. ${R2}`, answer: ans, unit: "%",
    hints: ["Total inventory investment = raw materials + WIP + finished goods.", "Then divide by total assets and multiply by 100."],
    steps: [`Total inventory = ${money0(rm)} + ${money0(wip)} + ${money0(fg)} = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(fg / x.assets) * 100, "Include ALL inventory: raw materials, WIP, and finished goods."], [ans / 100, "Multiply by 100 to show a percent."], [((rm + fg) / x.assets) * 100, "Don't forget work-in-process."]],
  });
});
add(function (r) {
  const x = scBiz(r), beg = Math.round(x.inv * (0.8 + r.next() * 0.3)), end = 2 * x.inv - beg;
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.c.name} started the year with ${money0(beg)} in inventory and ended the year with ${money0(end)}. Total assets are ${money0(x.assets)}. Net revenue was ${money0(x.rev)}.`,
    ask: `Using AVERAGE inventory, what percent of total assets is invested in inventory? ${R2}`, answer: ans, unit: "%",
    hints: ["Average inventory = (beginning + ending) ÷ 2."],
    steps: [`Average inventory = (${money0(beg)} + ${money0(end)}) ÷ 2 = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(end / x.assets) * 100, "Use the AVERAGE of beginning and ending inventory."], [(beg / x.assets) * 100, "Use the AVERAGE of beginning and ending inventory."], [((beg + end) / x.assets) * 100, "Divide beginning + ending by 2 first."]],
  });
});

level("Inventory Turnover");
add(function (r) {
  const x = scBiz(r), ans = x.cogs / x.inv;
  return N({
    story: `${x.c.name}'s annual report shows:${tableRows(r.shuffle([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Average inventory", money0(x.inv)], ["Total assets", money0(x.assets)]]))}`,
    ask: `What is ${x.c.name}'s inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Inventory turnover = COGS ÷ average inventory.", "Use cost of goods sold, not revenue."],
    steps: [`Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b> times per year.`],
    mistakes: [[x.rev / x.inv, "Use cost of goods sold, not revenue."], [x.inv / x.cogs, "Flip it: COGS goes on top."], [(x.inv / x.assets) * 100, "That's % invested. Turnover uses COGS."]],
  });
});
add(function (r) {
  const x = scBiz(r), rm = Math.round(x.inv * 0.4), wip = Math.round(x.inv * 0.15), fg = x.inv - rm - wip, ans = x.cogs / x.inv;
  return N({
    story: `A ${x.c.kind}, ${x.c.name}, lists:${tableRows([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Raw material inventory", money0(rm)], ["Work-in-process inventory", money0(wip)], ["Finished goods inventory", money0(fg)]])}`,
    ask: `What is the inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Add all three kinds of inventory to get the total inventory investment.", "Turnover = COGS ÷ inventory investment."],
    steps: [`Inventory = ${money0(rm)} + ${money0(wip)} + ${money0(fg)} = ${money0(x.inv)}.`, `Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.cogs / fg, "Include raw materials and WIP, not just finished goods."], [x.rev / x.inv, "Use COGS, not revenue."]],
  });
});
add(function (r) {
  const x = scBiz(r), beg = Math.round(x.inv * (0.75 + r.next() * 0.4)), end = 2 * x.inv - beg, ans = x.cogs / x.inv;
  return N({
    story: `${x.c.name} had ${money0(beg)} of inventory on January 1 and ${money0(end)} on December 31. Cost of goods sold for the year was ${money0(x.cogs)}, on revenue of ${money0(x.rev)}.`,
    ask: `Using average inventory, what is the inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Average inventory = (beginning + ending) ÷ 2.", "Turnover = COGS ÷ average inventory."],
    steps: [`Average = (${money0(beg)} + ${money0(end)}) ÷ 2 = ${money0(x.inv)}.`, `Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.cogs / end, "Use the average of beginning and ending inventory."], [x.rev / x.inv, "Use COGS, not revenue."], [x.cogs / (beg + end), "Divide beginning + ending by 2 first."]],
  });
});

level("Weeks of Supply");
add(function (r) {
  const x = scBiz(r), wk = x.cogs / 52, ans = x.inv / wk;
  return N({
    story: `${x.c.name} has average inventory of ${money0(x.inv)}. Annual cost of goods sold is ${money0(x.cogs)}, and annual revenue is ${money0(x.rev)}.`,
    ask: `How many weeks of supply does ${x.c.name} hold? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Weeks of supply = average inventory ÷ average WEEKLY COGS.", "Weekly COGS = annual COGS ÷ 52."],
    steps: [`Weekly COGS = ${money0(x.cogs)} ÷ 52 = ${usd2(wk)}.`, `Weeks of supply = ${money0(x.inv)} ÷ ${usd2(wk)} = <b>${n2(ans)}</b> weeks.`],
    mistakes: [[x.inv / x.cogs, "Divide by WEEKLY COGS (annual ÷ 52), not annual COGS."], [x.inv / (x.rev / 52), "Use COGS, not revenue."], [x.cogs / x.inv, "That's turnover. Weeks of supply puts inventory on top."]],
  });
});
add(function (r) {
  const x = scBiz(r), mo = Math.round(x.cogs / 12), annual = mo * 12, ans = x.inv / (annual / 52);
  return N({
    story: `${x.c.name}'s cost of goods sold averages ${money0(mo)} per month. Inventory on hand averages ${money0(x.inv)}.`,
    ask: `How many weeks of supply is that? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Turn monthly COGS into annual COGS (× 12), then into weekly COGS (÷ 52)."],
    steps: [`Annual COGS = ${money0(mo)} × 12 = ${money0(annual)}.`, `Weekly COGS = ${money0(annual)} ÷ 52 = ${usd2(annual / 52)}.`, `Weeks of supply = ${money0(x.inv)} ÷ ${usd2(annual / 52)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.inv / mo, "That's months of supply. Convert to weekly COGS."], [x.inv / (mo / 4), "A month isn't exactly 4 weeks. Go monthly → annual (× 12) → weekly (÷ 52)."]],
  });
});
add(function (r) {
  const x = scBiz(r), wk = Math.round(x.cogs / 52), ans = x.inv / wk;
  return N({
    story: `Average weekly cost of goods sold at ${x.c.name} is ${money0(wk)}. Average inventory is ${money0(x.inv)}, and total assets are ${money0(x.assets)}.`,
    ask: `How many weeks of supply does ${x.c.name} have? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Weekly COGS is already given."],
    steps: [`Weeks of supply = ${money0(x.inv)} ÷ ${money0(wk)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.inv / (wk / 52), "Weekly COGS is already given, so don't divide by 52 again."], [wk / x.inv, "Inventory goes on top."]],
  });
});

level("Mixed Metrics");
add(function (r) {
  const x = scBiz(r), parts = [0.2 + r.next() * 0.1, 0.25 + r.next() * 0.1, 0.2 + r.next() * 0.1];
  const invs = parts.map((f) => Math.round(x.inv * f)); invs.push(x.inv - invs[0] - invs[1] - invs[2]);
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.who} oversees all four locations of ${x.c.name}. Average inventory at each location:${tableRows(x.c.locs.map((l, i) => [l, money0(invs[i])]))}Company-wide total assets are ${money0(x.assets)}, and company-wide COGS is ${money0(x.cogs)}.`,
    ask: `What percent of total assets does the whole company have invested in inventory? ${R2}`, answer: ans, unit: "%",
    hints: ["Add up inventory at all four locations first."],
    steps: [`Total inventory = ${invs.map(money0).join(" + ")} = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(invs[0] / x.assets) * 100, "Include all four locations."], [ans / 100, "Multiply by 100."]],
  });
});
add(function (r) {
  const x = scBiz(r), t = r2(4 + r.next() * 10), ans = x.cogs / t;
  return N({
    story: `${x.c.name}'s inventory turnover last year was ${t} times. Cost of goods sold was ${money0(x.cogs)}.`,
    ask: `What was the average inventory investment? ${R2}`, answer: ans, unit: "$",
    hints: ["Turnover = COGS ÷ inventory. Rearrange to solve for inventory."],
    steps: [`Inventory = COGS ÷ turnover = ${money0(x.cogs)} ÷ ${t} = <b>${usd2(ans)}</b>.`],
    mistakes: [[x.cogs * t, "Divide COGS by turnover."]],
  });
});
add(function (r) {
  const t = r2(3 + r.next() * 15), ans = 52 / t;
  const c = r.pick(BUY);
  return N({
    story: `${c.name} turns its inventory over ${t} times a year.`,
    ask: `About how many weeks of supply does it hold on average? ${R2}`, answer: ans, unit: "weeks",
    hints: ["If inventory turns over T times in 52 weeks, each turn takes 52 ÷ T weeks."],
    steps: [`Weeks of supply = inventory ÷ (COGS ÷ 52) = 52 ÷ (COGS ÷ inventory) = 52 ÷ turnover.`, `52 ÷ ${t} = <b>${n2(ans)}</b> weeks.`],
    mistakes: [[t / 52, "Flip it: 52 ÷ turnover."], [365 / t, "That would be days of supply. Use 52 weeks."]],
  });
});

// ================================================================== PART 4: INVENTORY BASICS (Ch. 12)
part(10, "Inventory Basics (Ch. 12)", "Why companies hold inventory, the four types, ABC analysis, cycle counting, inventory costs, and model assumptions.");

level("Functions & Types");
const TYPES = ["Raw material", "Work-in-process (WIP)", "Finished goods", "MRO (maintenance/repair/operating)"];
const TYPE_NOTES = { "Raw material": "Raw material: purchased but not yet processed.", "Work-in-process (WIP)": "WIP: has undergone some change but isn't finished.", "Finished goods": "Finished goods: completed product awaiting shipment.", "MRO (maintenance/repair/operating)": "MRO: supplies needed to keep machinery and processes productive." };
add(concept({
  v: [
    { q: "At a bakery: sacks of flour sitting in the storeroom. Which type of inventory?", a: "Raw material" },
    { q: "At a bakery: dough that's been mixed and shaped but not baked yet. Which type of inventory?", a: "Work-in-process (WIP)" },
    { q: "At a bakery: boxed cakes waiting for customers to pick them up. Which type of inventory?", a: "Finished goods" },
    { q: "At a bakery: spare oven belts and cleaning supplies for the mixers. Which type of inventory?", a: "MRO (maintenance/repair/operating)" },
  ],
  pool: TYPES, notes: TYPE_NOTES,
  why: "The four types of inventory: raw material, work-in-process, finished goods, and MRO.",
}));
add(concept({
  v: [
    { q: "At a furniture plant: chairs that are assembled but not yet stained. Which type?", a: "Work-in-process (WIP)" },
    { q: "At a furniture plant: lubricant, saw blades, and replacement drill bits for the machines. Which type?", a: "MRO (maintenance/repair/operating)" },
    { q: "At a furniture plant: lumber delivered last week that hasn't been cut. Which type?", a: "Raw material" },
    { q: "At a furniture plant: wrapped tables on the loading dock waiting for the truck. Which type?", a: "Finished goods" },
  ],
  pool: TYPES, notes: TYPE_NOTES,
  why: "Where is it in the process? Not started = raw material. Partly done = WIP. Done and waiting = finished goods. Keeps the machines running = MRO.",
}));
add(concept({
  v: [
    { q: "A bottling plant keeps a stack of filled bottles between the filler and the labeler so the labeler keeps running when the filler jams. Which function of inventory is this?", a: "To decouple parts of the production process" },
    { q: "A builder stocks up on copper wire now because prices are expected to jump next quarter. Which function of inventory is this?", a: "To hedge against inflation" },
    { q: "A store buys a full pallet of batteries because the supplier gives a lower price per unit for pallet orders. Which function of inventory is this?", a: "To take advantage of quantity discounts" },
    { q: "A toy store stocks a wide selection ahead of the holidays to meet expected demand. Which function of inventory is this?", a: "To provide a selection of goods for anticipated demand" },
  ],
  pool: ["To decouple parts of the production process", "To hedge against inflation", "To take advantage of quantity discounts", "To provide a selection of goods for anticipated demand"],
  why: "Functions of inventory: provide a selection for anticipated demand (and separate the firm from demand fluctuations), decouple parts of the process, take advantage of quantity discounts, and hedge against inflation.",
}));
add(concept({
  q: "The objective of inventory management is to strike a balance between:",
  a: "Inventory investment and customer service",
  w: [["Raw materials and finished goods", "The balance is about cost vs. service."], ["Revenue and total assets", "Those are financial numbers, not the inventory balance."], ["Suppliers and distributors", "It's about investment vs. service."]],
  why: "Less inventory lowers costs but raises the chance of shortages; more inventory raises costs but improves service. Inventory management balances investment and customer service.",
}));
add(concept({
  q: "A pharmacy keeps extra insulin above what its average forecast says it needs. What is the main reason?",
  a: "To protect against stockouts when demand or delivery time is higher than expected",
  w: [["To prepare for a drop in demand", "Extra stock doesn't help if demand drops; it's for spikes and delays."], ["To lower its holding costs", "Extra stock RAISES holding costs."], ["To reduce the number of orders per year", "That depends on order size (Q), not the cushion."]],
  why: "Safety stock is extra inventory that helps achieve a desired service level and avoid stockouts when demand or lead time varies: ROP = d × L + ss.",
}));
add(concept({
  v: [
    { q: "A system that updates the count every time an item is received or sold is called:", a: "A perpetual inventory system" },
    { q: "A store keeps two bins of screws. When the first bin is empty, it reorders and uses the second bin while waiting. This is:", a: "A two-bin system" },
    { q: "In service businesses, inventory lost to theft is called:", a: "Shrinkage or pilferage" },
  ],
  pool: ["A perpetual inventory system", "A two-bin system", "Shrinkage or pilferage", "Cycle counting"],
  notes: { "A perpetual inventory system": "Perpetual: tracks receipts and subtractions continuously.", "A two-bin system": "Two-bin: a simple periodic system; an empty bin triggers an order.", "Shrinkage or pilferage": "Shrinkage/pilferage: losses (often theft) in service inventories.", "Cycle counting": "Cycle counting: counting items on a periodic schedule, often by ABC class." },
  why: "Record accuracy depends on periodic systems (like two-bin), perpetual systems, and cycle counting. Services control shrinkage with good hiring, training, and tight control of goods coming in and going out.",
}));

level("ABC Analysis");
add(concept({
  q: ["ABC analysis ranks inventory items by:", "What measure does ABC analysis use to divide items into classes?"],
  a: "Annual dollar volume (annual units × unit cost)",
  w: [["Unit price alone", "An expensive item that rarely sells can still be a C item."], ["Number of units on hand", "It's a dollar measure, not a count."], ["How often the item is ordered", "Order frequency isn't the ABC measure."]],
  why: "ABC divides inventory into classes by annual dollar volume. A items are the few critical ones with high dollar volume; C items are the many trivial ones.",
}));
add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), u = r.step(200, 8000, 50), cost = r.money(0.5, 90);
  const ans = u * cost;
  return N({
    story: `${c.name} uses ${n0(u)} units of part #${r.int(10000, 19999)} per year. Each unit costs ${usd2(cost)}. The part is stored on shelf ${r.int(1, 40)} and reordered ${r.int(4, 12)} times a year.`,
    ask: `What is this item's annual dollar volume? ${R2}`, answer: ans, unit: "$",
    hints: ["Annual dollar volume = annual units × unit cost."],
    steps: [`${n0(u)} × ${usd2(cost)} = <b>${usd2(ans)}</b>.`],
    mistakes: [[cost, "Multiply the unit cost by annual units."], [u, "Multiply annual units by the unit cost."]],
  });
});
function abcTable(r) {
  const items = [];
  for (let i = 0; i < 6; i++) items.push({ id: "#" + r.int(10000, 19999), u: r.step(50, 5000, 50), c: r.money(0.4, 120) });
  // make sure the most expensive item is not the top dollar-volume item
  items.sort((a, b) => b.c - a.c);
  items[0].u = r.step(20, 120, 10);
  items.forEach((it) => (it.v = it.u * it.c));
  return r.shuffle(items);
}
add(function (r) {
  const items = abcTable(r), tot = items.reduce((t, i) => t + i.v, 0), target = r.pick(items);
  const ans = (target.v / tot) * 100;
  return N({
    story: `An ABC worksheet for a small stockroom:<table class="data"><tr><th>Item</th><th>Annual units</th><th>Unit cost</th></tr>${items.map((i) => `<tr><td>${i.id}</td><td class="num">${n0(i.u)}</td><td class="num">${usd2(i.c)}</td></tr>`).join("")}</table>`,
    ask: `What percent of the stockroom's total annual dollar volume comes from item ${target.id}? ${R2}`, answer: ans, unit: "%",
    hints: ["Find each item's annual dollar volume (units × cost) and add them up.", `Then divide ${target.id}'s dollar volume by the total and × 100.`],
    steps: [`Dollar volumes: ${items.map((i) => `${i.id} ${usd2(i.v)}`).join("; ")}.`, `Total = ${usd2(tot)}.`, `${target.id}: ${usd2(target.v)} ÷ ${usd2(tot)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[ans / 100, "Multiply by 100 to show a percent."], [(target.u / items.reduce((t, i) => t + i.u, 0)) * 100, "That's the percent of UNITS. ABC uses dollar volume."]],
  });
});
add(function (r) {
  const items = abcTable(r), top = items.slice().sort((a, b) => b.v - a.v)[0], priciest = items.slice().sort((a, b) => b.c - a.c)[0], mostU = items.slice().sort((a, b) => b.u - a.u)[0];
  const others = items.filter((i) => i !== top);
  const wrongs = [priciest, mostU].filter((i) => i !== top).concat(r.shuffle(others)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  const note = (i) => (i === priciest ? "That item has the highest unit price, but it sells very few units. ABC uses annual DOLLAR volume." : i === mostU ? "That item has the most units, but its dollar volume isn't the highest." : "Compute units × cost for each item and compare.");
  return C({
    story: `<table class="data"><tr><th>Item</th><th>Annual units</th><th>Unit cost</th></tr>${items.map((i) => `<tr><td>${i.id}</td><td class="num">${n0(i.u)}</td><td class="num">${usd2(i.c)}</td></tr>`).join("")}</table>`,
    ask: "Which item is MOST likely to be classified as an A item?",
    choices: [{ t: top.id, ok: true }].concat(wrongs.map((i) => ({ t: i.id, ok: false, note: note(i) }))),
    why: `A items have the highest annual dollar volume. ${top.id}: ${n0(top.u)} × ${usd2(top.c)} = ${usd2(top.v)}, the largest in the table.`,
  });
});
add(concept({
  q: ["Which policy fits A items?", "Compared with C items, a company should give A items:"],
  a: ["Tighter physical inventory control and more care in forecasting", "More emphasis on supplier development"],
  w: [["Less frequent counting", "A items get counted MORE often."], ["The loosest controls, since there are so few of them", "Few items, but they're the critical ones."], ["The same treatment as every other item", "The point of ABC is that items don't all deserve the same attention."]],
  why: "ABC policies: more supplier development, tighter physical control, and more care in forecasting for A items. Focus on the few critical items, not the many trivial ones.",
}));

level("Cycle Counting");
function ccSetup(r) {
  const tot = r.step(2000, 9000, 100), pa = r.pick([10, 15, 20]), pb = r.pick([25, 30, 35]), pc = 100 - pa - pb;
  const fa = r.pick([10, 15, 20, 30]), fb = r.pick([40, 50, 60]), fc = r.pick([90, 100, 120]);
  const A = (tot * pa) / 100, B = (tot * pb) / 100, Cc = (tot * pc) / 100;
  return { tot, pa, pb, pc, fa, fb, fc, A, B, C: Cc, perA: A / fa, perB: B / fb, perC: Cc / fc, name: r.pick(["Black Warrior Supply", "Gulf South Distribution", "Iron City Parts", "Crimson Hardware Warehouse"]) };
}
function ccStory(x) {
  return `${x.name} stocks ${n0(x.tot)} different items. After an ABC analysis:<table class="data"><tr><th>Class</th><th>% of items</th><th>Count every</th></tr><tr><td>A</td><td class="num">${x.pa}%</td><td class="num">${x.fa} working days</td></tr><tr><td>B</td><td class="num">${x.pb}%</td><td class="num">${x.fb} working days</td></tr><tr><td>C</td><td class="num">${x.pc}%</td><td class="num">${x.fc} working days</td></tr></table>`;
}
add(function (r) {
  const x = ccSetup(r);
  return N({
    story: ccStory(x), ask: `How many A items must be counted each working day? ${R2}`, answer: x.perA, unit: "items/day",
    hints: ["Number of A items = total × % A.", "Items per day = number of A items ÷ days in the counting cycle."],
    steps: [`A items = ${n0(x.tot)} × ${x.pa / 100} = ${n0(x.A)}.`, `Per day = ${n0(x.A)} ÷ ${x.fa} = <b>${n2(x.perA)}</b>.`],
    mistakes: [[x.A, "That's how many A items there are. Divide by the counting cycle."], [x.tot / x.fa, `Only ${x.pa}% are A items.`]],
  });
});
add(function (r) {
  const x = ccSetup(r), tot = x.perA + x.perB + x.perC;
  return N({
    story: ccStory(x), ask: `How many items in total must be counted each working day? ${R2}`, answer: tot, unit: "items/day",
    hints: ["Find items per day for each class, then add them."],
    steps: [`A: ${n0(x.A)} ÷ ${x.fa} = ${n2(x.perA)}.`, `B: ${n0(x.B)} ÷ ${x.fb} = ${n2(x.perB)}.`, `C: ${n0(x.C)} ÷ ${x.fc} = ${n2(x.perC)}.`, `Total = <b>${n2(tot)}</b> items per day.`],
    mistakes: [[x.perA, "That's only A items. Add B and C."], [x.tot / x.fa, "Each class has its own cycle."]],
  });
});
add(function (r) {
  const x = ccSetup(r), tot = x.perA + x.perB + x.perC, rate = r.pick([10, 12, 15, 20, 25]), hrs = r.pick([4, 6, 8]);
  const ans = tot / (rate * hrs);
  return N({
    story: ccStory(x) + ` One counter can count ${rate} items per hour during a ${hrs}-hour shift.`,
    ask: `How many counters are needed to keep up with the schedule? (Give the exact number, not rounded up.) ${R2}`, answer: ans, unit: "counters",
    hints: ["Find the total items to count per day first.", `One counter handles ${rate} × ${hrs} = ${rate * hrs} items per day.`],
    steps: [`Items per day = ${n2(x.perA)} + ${n2(x.perB)} + ${n2(x.perC)} = ${n2(tot)}.`, `One counter: ${rate} × ${hrs} = ${rate * hrs} per day.`, `Counters = ${n2(tot)} ÷ ${rate * hrs} = <b>${n2(ans)}</b>.`],
    mistakes: [[tot / rate, `That's hours of counting needed. Divide by the ${hrs}-hour shift too.`], [tot, "That's items per day. Divide by what one counter can do."]],
  });
});
add(concept({
  q: "Which is NOT an advantage of cycle counting?",
  a: "It requires shutting down for a full annual physical inventory",
  w: ["It eliminates shutdowns and interruptions", "It allows causes of errors to be identified and corrected", "It maintains accurate inventory records", "It eliminates the annual inventory adjustment"],
  why: "Cycle counting eliminates shutdowns and the annual inventory adjustment, uses trained personnel, lets errors be found and fixed, and keeps records accurate.",
}));

level("Costs, Models & Assumptions");
add(concept({
  v: [
    { q: "Insurance and taxes on the inventory sitting in a warehouse are part of which cost?", a: "Holding cost" },
    { q: "Staff time spent preparing and processing a purchase order is part of which cost?", a: "Ordering cost" },
    { q: "Cleaning and recalibrating a machine before a new production batch is part of which cost?", a: "Setup cost" },
    { q: "Losses because inventory becomes obsolete before it's sold are part of which cost?", a: "Holding cost" },
  ],
  pool: ["Holding cost", "Ordering cost", "Setup cost", "Product (purchase) cost"],
  notes: { "Holding cost": "Holding cost: the cost of keeping (carrying) inventory over time.", "Ordering cost": "Ordering cost: the cost of placing an order and receiving goods.", "Setup cost": "Setup cost: the cost to prepare a machine or process to make an order.", "Product (purchase) cost": "Product cost is P × D, the price of the items themselves." },
  why: "Holding costs include housing, material handling, labor, investment costs (borrowing, taxes, insurance), and pilferage, space, and obsolescence.",
}));
add(concept({
  v: [
    { q: "Demand for wheels at a bicycle factory depends on how many bikes are scheduled to be built. This is:", a: "Dependent demand" },
    { q: "Demand for bicycles at a bike shop doesn't depend on demand for any other item. This is:", a: "Independent demand" },
  ],
  pool: ["Dependent demand", "Independent demand", "Seasonal demand", "Safety stock"],
  why: "Independent demand doesn't depend on other items. Dependent demand comes from the demand for something else (a part of a product). EOQ and EPQ are models for independent demand.",
}));
add(concept({
  q: "Which is NOT an assumption of the basic EOQ model?",
  a: ["Quantity discounts are available", "Demand changes from month to month"],
  w: ["Demand is known, constant, and independent", "Lead time is known and constant", "Receipt of inventory is instantaneous and complete", "The only variable costs are setup and holding", "Stockouts can be completely avoided"],
  why: "EOQ assumptions: demand known, constant, independent; lead time known and constant; receipt instantaneous and complete; no quantity discounts; only variable costs are setup and holding; stockouts completely avoided.",
}));
add(concept({
  q: "Why is the EOQ model called \"robust\"?",
  a: "The total cost curve is fairly flat near the EOQ, so ordering a bit more or less barely changes total cost",
  w: [["It always gives the exact best answer even if demand changes", "It still works, but because the cost curve is flat, not because it's exact."], ["It includes quantity discounts", "Basic EOQ assumes no discounts."], ["It works for dependent demand", "It's for independent demand."]],
  why: "EOQ is robust: it works even if parameters and assumptions aren't perfectly met, because the total cost curve is relatively flat around Q*.",
}));
add(concept({
  v: [
    { q: "A manager asks, \"How many should I order each time?\" Which tool answers that?", a: "EOQ" },
    { q: "A manager asks, \"When should I place my next order?\" Which tool answers that?", a: "Reorder point (ROP)" },
  ],
  pool: ["EOQ", "Reorder point (ROP)", "ABC analysis", "Cycle counting"],
  why: "Inventory models answer two questions: how much to order (EOQ) and when to order (reorder point).",
}));
add(concept({
  v: [
    { q: "A supplier cuts the price on EVERY unit when you buy 1,000 or more. What kind of discount is this?", a: "All-units discount" },
    { q: "A supplier's lower price applies only to the units you buy BEYOND 1,000. What kind of discount is this?", a: "Incremental quantity discount" },
  ],
  pool: ["All-units discount", "Incremental quantity discount", "Blanket order", "Fixed fee"],
  why: "All-units discounts (the most popular) apply to every unit; incremental discounts apply only to units beyond the price break. The trade-off is lower product cost vs. higher holding cost.",
}));
add(concept({
  q: ["At the EOQ, how does annual setup (ordering) cost compare to annual holding cost?", "Where is the optimal order quantity found on the cost graph?"],
  a: "They are equal",
  w: [["Setup cost is twice holding cost", "At Q*, they're exactly equal."], ["Holding cost is zero", "Holding cost is Q/2 × H, not zero."], ["Setup cost is always larger", "At Q*, they're equal."]],
  why: "Q* is where annual setup cost equals annual holding cost. That's how the EOQ formula is derived, and why total cost at Q* = 2 × setup cost.",
}));
add(concept({
  q: "In the production order quantity (EPQ) model, why does maximum inventory never reach Q?",
  a: "Units are being used or sold while the batch is being produced",
  w: [["Some units are always defective", "The model doesn't assume defects."], ["Holding cost is higher in EPQ", "That's not why."], ["Orders arrive all at once", "That's the EOQ assumption, which is the opposite."]],
  why: "In EPQ, inventory builds up gradually because demand (d) uses units while production (p) makes them. Max inventory = Q(1 − d/p), which is less than Q, so annual holding cost = H × Q/2 × (1 − d/p).",
}));

// ================================================================== PART 5: EOQ & REORDER POINT MATH
part(11, "EOQ & Reorder Point", "Economic order quantity for items a business BUYS, the costs around it, and the reorder point.");

function eoqMistakes(x, Qs) {
  const ms = [[Math.sqrt((x.D * x.S) / x.H), "You left out the 2. Q* = √(2DS ÷ H)."], [(2 * x.D * x.S) / x.H, "Don't forget the square root."]];
  if (x.dm === "month") ms.push([eoq(x.M, x.S, x.H), "You used monthly demand. D must be ANNUAL (× 12)."]);
  if (x.hm === "pct") ms.push([eoq(x.D, x.S, x.I), `You used ${x.I} as H. H in dollars = ${x.I / 100} × ${usd2(x.P)}.`]);
  if (x.hm === "pct") ms.push([eoq(x.D, x.S, x.P), "You used the price as H. H = I × P."]);
  return ms;
}

level("Q*, N, and T");
add(function (r) {
  const x = buy(r), Qs = x.Qs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `What is the economic order quantity, <b>Q*</b>? ${R2}`, answer: Qs, unit: x.c.units,
    hints: [hintD(x), hintH(x), "Q* = √(2DS ÷ H)."],
    steps: [stepD(x), stepH(x), `S = ${usd(x.S)} per order`, `Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = <b>${n2(Qs)}</b> ${x.c.units}.`],
    mistakes: eoqMistakes(x, Qs),
  });
});
add(function (r) {
  const x = buy(r), Nn = x.D / x.Qs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `If ${x.c.name} orders the EOQ each time, how many orders will it place per year (<b>N</b>)? ${R2}`, answer: Nn, unit: "orders",
    hints: ["Find Q* first.", "N = D ÷ Q*."],
    steps: [stepD(x), stepH(x), `Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = ${n2(x.Qs)}.`, `N = ${n0(x.D)} ÷ ${n2(x.Qs)} = <b>${n2(Nn)}</b> orders per year.`],
    mistakes: [[x.Qs / x.D, "Flip it: N = D ÷ Q*."], [x.dm === "month" ? x.M / x.Qs : -1, "Use annual demand."], [x.Qs, "That's Q*. N = D ÷ Q*."]],
  });
});
add(function (r) {
  const x = buy(r), Nn = x.D / x.Qs, T = x.days / Nn;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `Using the EOQ, what is the expected time between orders (<b>T</b>) in working days? ${R2}`, answer: T, unit: "days",
    hints: ["Find Q* and then N = D ÷ Q*.", "T = working days per year ÷ N."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `N = ${n0(x.D)} ÷ ${n2(x.Qs)} = ${n2(Nn)}.`, `T = ${x.days} ÷ ${n2(Nn)} = <b>${n2(T)}</b> days.`],
    mistakes: [[365 / Nn, `Use ${x.days} working days, not 365.`], [Nn, "That's N. T = days ÷ N."], [Nn / x.days, "Flip it: T = days ÷ N."]],
  });
});
add(function (r) {
  const x = buy(r), avg = x.Qs / 2;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `If ${x.c.name} orders the EOQ, what is its AVERAGE inventory? ${R2}`, answer: avg, unit: x.c.units,
    hints: ["Find Q* first.", "With EOQ, inventory goes from Q* down to 0, so the average is Q* ÷ 2."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Average inventory = ${n2(x.Qs)} ÷ 2 = <b>${n2(avg)}</b>.`],
    mistakes: [[x.Qs, "That's the MAXIMUM. Average is Q* ÷ 2."]],
  });
});
add(function (r) {
  const x = buy(r);
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `If ${x.c.name} orders the EOQ, what is the MAXIMUM inventory it will ever have on hand? ${R2}`, answer: x.Qs, unit: x.c.units,
    hints: ["Under EOQ, the whole order arrives at once when inventory hits zero.", "So the maximum is the full order quantity, Q*."],
    steps: [stepD(x), stepH(x), `Maximum inventory = Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = <b>${n2(x.Qs)}</b>.`],
    mistakes: [[x.Qs / 2, "That's the AVERAGE. The maximum is the whole order, Q*."]],
  });
});

level("Annual Costs at Q*");
add(function (r) {
  const x = buy(r), sc = (x.D / x.Qs) * x.S;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Ordering the EOQ, what is the ANNUAL ordering (setup) cost? ${R2}`, answer: sc, unit: "$",
    hints: ["Find Q* first.", "Annual setup cost = (D ÷ Q*) × S."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Annual setup = (${n0(x.D)} ÷ ${n2(x.Qs)}) × ${usd(x.S)} = <b>${usd2(sc)}</b>.`],
    mistakes: [[x.S, "That's the cost of ONE order. Multiply by the number of orders."], [2 * sc, "That's total cost (setup + holding). Just the setup part, please."]],
  });
});
add(function (r) {
  const x = buy(r), hc = (x.Qs / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Ordering the EOQ, what is the ANNUAL holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Find Q* first.", "Annual holding cost = (Q* ÷ 2) × H."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Annual holding = (${n2(x.Qs)} ÷ 2) × ${usd4(x.H)} = <b>${usd2(hc)}</b>.`],
    mistakes: [[x.Qs * x.H, "Use AVERAGE inventory (Q* ÷ 2), not Q*."], [x.hm === "pct" ? (x.Qs / 2) * x.I : -1, "H must be in dollars: I × P."]],
  });
});
add(function (r) {
  const x = buy(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "lead"]),
    ask: `What is the total annual inventory cost (setup + holding) when ordering the EOQ? ${R2}`, answer: tc, unit: "$",
    hints: ["Find Q*.", "TC = (D ÷ Q*) × S + (Q* ÷ 2) × H.", "Shortcut: at Q*, setup = holding, so TC = 2 × either one."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`, "The lead time isn't needed."],
    mistakes: [[tc / 2, "That's only one of the two costs. Add setup AND holding."], [tc + x.P * x.D, "This question doesn't include the cost of the items themselves (P × D)."]],
  });
});
add(function (r) {
  const x = buy(r, { hm: "pct" }), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, full = tc + x.P * x.D;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Including the cost of the ${x.c.units} themselves, what is the total annual cost when ordering the EOQ? ${R2}`, answer: full, unit: "$",
    hints: ["Total cost including material = setup + holding + P × D.", "Find Q* first."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Setup + holding = ${usd2(tc)}.`, `P × D = ${usd2(x.P)} × ${n0(x.D)} = ${usd2(x.P * x.D)}.`, `Total = <b>${usd2(full)}</b>.`],
    mistakes: [[tc, "Add the product cost, P × D."], [x.P * x.D, "Add the setup and holding costs too."]],
  });
});
add(function (r) {
  const c = r.pick(BUY), hc = r.money(80, 1500), P = r.money(c.P[0], c.P[1]), L = r.int(3, 10);
  return N({
    story: `${c.name} orders the economic order quantity of ${c.item} every time. Its annual holding cost has been calculated as ${usd2(hc)}. Each ${c.unit} costs ${usd2(P)}, and the lead time is ${L} days.`,
    ask: `What is the total annual inventory cost (setup + holding)? ${R2}`, answer: 2 * hc, unit: "$",
    hints: ["At the EOQ, how does annual setup cost compare to annual holding cost?"],
    steps: [`At Q*, annual setup cost = annual holding cost = ${usd2(hc)}.`, `TC = ${usd2(hc)} + ${usd2(hc)} = <b>${usd2(2 * hc)}</b>.`],
    mistakes: [[hc, "That's just holding cost. At Q*, setup cost equals holding cost, so add them."]],
  });
});

level("Current Policy vs. EOQ");
add(function (r) {
  const x = buy(r), oc = (x.D / x.Q0) * x.S;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `Under the CURRENT ordering policy, what is the annual ordering cost? ${R2}`, answer: oc, unit: "$",
    hints: ["Use the current order quantity, not Q*.", "Annual ordering cost = (D ÷ Q) × S."],
    steps: [stepD(x), `Orders per year = ${n0(x.D)} ÷ ${n0(x.Q0)} = ${n2(x.D / x.Q0)}.`, `Annual ordering cost = ${n2(x.D / x.Q0)} × ${usd(x.S)} = <b>${usd2(oc)}</b>.`],
    mistakes: [[(x.D / x.Qs) * x.S, "That uses Q*. The question asks about the CURRENT quantity."], [x.dm === "month" ? (x.M / x.Q0) * x.S : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), hc = (x.Q0 / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `Under the CURRENT policy, what is the annual holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Use the current Q.", "Annual holding = (Q ÷ 2) × H."],
    steps: [stepH(x), `Annual holding = (${n0(x.Q0)} ÷ 2) × ${usd4(x.H)} = <b>${usd2(hc)}</b>.`],
    mistakes: [[x.Q0 * x.H, "Use average inventory (Q ÷ 2)."], [(x.Qs / 2) * x.H, "That uses Q*. Use the current quantity."]],
  });
});
add(function (r) {
  const x = buy(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current", "days"]),
    ask: `What is the total annual inventory cost (ordering + holding) under the CURRENT policy? ${R2}`, answer: tc0, unit: "$",
    hints: ["Plug the current Q into TC = (D ÷ Q) × S + (Q ÷ 2) × H."],
    steps: [stepD(x), stepH(x), `Ordering = (${n0(x.D)} ÷ ${n0(x.Q0)}) × ${usd(x.S)} = ${usd2((x.D / x.Q0) * x.S)}.`, `Holding = (${n0(x.Q0)} ÷ 2) × ${usd4(x.H)} = ${usd2((x.Q0 / 2) * x.H)}.`, `TC = <b>${usd2(tc0)}</b>.`],
    mistakes: [[(x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, "That's the cost at Q*. Use the current quantity."], [(x.D / x.Q0) * x.S + x.Q0 * x.H, "Holding uses Q ÷ 2."]],
  });
});
add(function (r) {
  const x = buy(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H, tcs = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, sav = tc0 - tcs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `How much would ${x.c.name} save per year by switching from its current order size to the EOQ? ${R2}`, answer: sav, unit: "$",
    hints: ["Find TC at the current Q.", "Find Q* and TC at Q*.", "Savings = TC(current) − TC(Q*)."],
    steps: [stepD(x), stepH(x), `TC at current Q (${n0(x.Q0)}) = ${usd2(tc0)}.`, `Q* = ${n2(x.Qs)}; TC at Q* = ${usd2(tcs)}.`, `Savings = <b>${usd2(sav)}</b>.`],
    mistakes: [[tc0, "That's the current cost. Subtract the cost at Q*."], [tcs, "That's the cost at Q*. Subtract it from the current cost."], [-sav, "Savings should be positive: current minus EOQ."]],
  });
});
add(function (r) {
  const x = buy(r, { hm: "dollar" }), m = r.pick([25, 50, 100]);
  const lo = Math.max(m, Math.floor(x.Qs / m) * m), hi = lo + m;
  const tc = (q) => (x.D / q) * x.S + (q / 2) * x.H, best = tc(lo) <= tc(hi) ? lo : hi;
  return N({
    story: buyText(r, x, ["demand", "hold", "order"]) + ` The supplier only ships ${x.c.units} in multiples of ${m}.`,
    ask: `Which order quantity (a multiple of ${m}) gives the lowest annual ordering + holding cost?`, answer: best, dec: 0, unit: x.c.units,
    hints: ["Find Q* first. It probably isn't a multiple of " + m + ".", "Check the multiples just below and just above Q*, and compute TC for each.", "Pick the one with the lower total cost."],
    steps: [stepD(x), `Q* = ${n2(x.Qs)}.`, `TC(${n0(lo)}) = ${usd2(tc(lo))}; TC(${n0(hi)}) = ${usd2(tc(hi))}.`, `Lowest cost: <b>${n0(best)}</b> ${x.c.units}.`],
    mistakes: [[best === lo ? hi : lo, "Compute total cost for both nearby multiples. That one costs more."]],
  });
});

level("Reorder Point");
add(function (r) {
  const x = buy(r), d = x.D / x.days;
  return N({
    story: buyText(r, x, ["demand", "days", "lead", "order"]),
    ask: `What is the daily demand, <b>d</b>? ${R2}`, answer: d, unit: x.c.units + "/day",
    hints: [hintD(x), "d = D ÷ working days per year."],
    steps: [stepD(x), `d = ${n0(x.D)} ÷ ${x.days} = <b>${n2(d)}</b>.`],
    mistakes: [[x.D / 365, `Use ${x.days} working days.`], [x.dm === "month" ? x.M / x.days : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, rop = d * x.L;
  return N({
    story: buyText(r, x, ["demand", "days", "lead", "order", "hold"]),
    ask: `Demand is stable and there's no safety stock. What is the reorder point (<b>ROP</b>)? ${R2}`, answer: rop, unit: x.c.units,
    hints: ["ROP = d × L.", "d = D ÷ working days per year."],
    steps: [stepD(x), `d = ${n0(x.D)} ÷ ${x.days} = ${n2(d)}.`, `ROP = ${n2(d)} × ${x.L} = <b>${n2(rop)}</b> ${x.c.units}.`, "Order cost and holding cost aren't needed for the ROP."],
    mistakes: [[(x.D / 365) * x.L, `Use ${x.days} working days.`], [d, `Multiply by the ${x.L}-day lead time.`], [x.dm === "month" ? (x.M / x.days) * x.L : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, ss = Math.round(d * r.int(1, 4)), rop = d * x.L + ss;
  return N({
    story: buyText(r, x, ["demand", "days", "lead"]) + ` Because demand varies, ${x.who} keeps ${n0(ss)} ${x.c.units} of safety stock.`,
    ask: `What is the reorder point including safety stock? ${R2}`, answer: rop, unit: x.c.units,
    hints: ["ROP = d × L + ss."],
    steps: [stepD(x), `d = ${n2(d)}.`, `ROP = ${n2(d)} × ${x.L} + ${n0(ss)} = <b>${n2(rop)}</b>.`],
    mistakes: [[d * x.L, "Add the safety stock."], [ss, "Add demand during lead time (d × L)."]],
  });
});
add(function (r) {
  const c = r.pick(BUY), D = r.step(5000, 80000, 100), dpw = r.pick([5, 6]), W = r.pick([50, 51, 52]), wks = r.int(1, 3);
  const days = dpw * W, d = D / days, L = wks * dpw, rop = d * L;
  return N({
    story: `${c.name} uses ${n0(D)} ${c.item} a year. It's open ${dpw} days a week, ${W} weeks a year. Orders take ${wks} ${plural(wks, "week", "weeks")} to arrive.`,
    ask: `What is the reorder point (no safety stock)? ${R2}`, answer: rop, unit: c.units,
    hints: [`Working days per year = ${dpw} × ${W}.`, `Lead time in working days = ${wks} × ${dpw}.`, "ROP = d × L."],
    steps: [`Working days = ${days}; d = ${n0(D)} ÷ ${days} = ${n2(d)}.`, `L = ${wks} × ${dpw} = ${L} working days.`, `ROP = ${n2(d)} × ${L} = <b>${n2(rop)}</b>.`],
    mistakes: [[d * wks, "Lead time must be in working days, not weeks."], [d * wks * 7, `Count working days: ${dpw} per week.`], [(D / 365) * wks * 7, "Use working days for both d and L."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, L2 = x.L + r.int(2, 5), rop2 = d * L2;
  return N({
    story: buyText(r, x, ["demand", "days", "lead"]) + ` The supplier just announced that lead time is increasing to ${L2} working days.`,
    ask: `What is the NEW reorder point (no safety stock)? ${R2}`, answer: rop2, unit: x.c.units,
    hints: ["Use the new lead time in ROP = d × L."],
    steps: [stepD(x), `d = ${n2(d)}.`, `New ROP = ${n2(d)} × ${L2} = <b>${n2(rop2)}</b>. A longer lead time means ordering earlier (at a higher inventory level).`],
    mistakes: [[d * x.L, "That's the old lead time."], [d * (L2 - x.L), "That's only the increase. Use the full new lead time."]],
  });
});

// ================================================================== PART 6: EPQ MATH
part(12, "EPQ (Production Order Quantity)", "For items a business MAKES while selling them: Q*p, maximum and average inventory, runs per year, and costs.");

function epqMistakes(x) {
  const ms = [[eoq(x.D, x.S, x.H), "That's the EOQ formula. For production, multiply H by (1 − d/p) too."], [Math.sqrt((2 * x.D * x.S) / (x.H * (1 - x.p / x.d))) || -1, "Flip the ratio: it's d/p (demand ÷ production), not p/d."], [(2 * x.D * x.S) / (x.H * (1 - x.d / x.p)), "Don't forget the square root."]];
  if (x.hm === "pct") ms.push([epq(x.D, x.S, x.I, x.d, x.p), `H in dollars = ${x.I / 100} × ${usd2(x.P)}.`]);
  if (x.dm === "day") ms.push([epq(x.d, x.S, x.H, x.d, x.p), "D must be annual: d × days."]);
  return ms;
}

level("EPQ Basics");
add(function (r) {
  const x = make(r, { dm: "year" });
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `What is the daily demand, <b>d</b>? ${R2}`, answer: x.d, unit: x.c.units + "/day",
    hints: ["d = D ÷ operating days per year."],
    steps: [stepDp(x)],
    mistakes: [[x.D / 365, `Use ${x.days} operating days.`], [x.p, "That's the production rate p, not demand."]],
  });
});
add(function (r) {
  const x = make(r);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `What is the optimal production quantity, <b>Q*p</b>? ${R2}`, answer: x.Qs, unit: x.c.units,
    hints: [x.dm === "day" ? "Find annual demand D = d × days." : "Find daily demand d = D ÷ days.", hintH(x), "Q*p = √(2DS ÷ [H(1 − d/p)])."],
    steps: [stepDp(x), stepH(x), `1 − d/p = 1 − ${n0(x.d)}/${n0(x.p)} = ${fmt(1 - x.d / x.p, 4)}.`, `Q*p = √(2 × ${n0(x.D)} × ${n0(x.S)} ÷ (${fmt(x.H, 4)} × ${fmt(1 - x.d / x.p, 4)})) = <b>${n2(x.Qs)}</b>.`],
    mistakes: epqMistakes(x),
  });
});
add(function (r) {
  const x = make(r), mx = x.Qs * (1 - x.d / x.p);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, what is the MAXIMUM inventory level? ${R2}`, answer: mx, unit: x.c.units,
    hints: ["Find Q*p first.", "Max inventory = Q(1 − d/p): units made minus units used during the run."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Max = ${n2(x.Qs)} × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${n2(mx)}</b>.`],
    mistakes: [[x.Qs, "That's Q*p. In EPQ, units are sold during production, so max inventory is Q(1 − d/p)."], [mx / 2, "That's the average. Max = Q(1 − d/p)."]],
  });
});
add(function (r) {
  const x = make(r), avg = (x.Qs * (1 - x.d / x.p)) / 2;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, what is the AVERAGE inventory level? ${R2}`, answer: avg, unit: x.c.units,
    hints: ["Average = maximum inventory ÷ 2.", "Max = Q*p(1 − d/p)."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}; max = ${n2(x.Qs * (1 - x.d / x.p))}.`, `Average = <b>${n2(avg)}</b>.`],
    mistakes: [[x.Qs / 2, "In EPQ, average = MAX ÷ 2, and max is Q(1 − d/p), not Q."], [avg * 2, "That's the max. Divide by 2."]],
  });
});
add(function (r) {
  const x = make(r), runs = x.D / x.Qs;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, how many production runs will there be per year? ${R2}`, answer: runs, unit: "runs",
    hints: ["Runs per year = D ÷ Q*p."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Runs = ${n0(x.D)} ÷ ${n2(x.Qs)} = <b>${n2(runs)}</b>.`],
    mistakes: [[x.D / eoq(x.D, x.S, x.H), "That uses the EOQ formula. Use Q*p."], [x.Qs / x.D, "Flip it: D ÷ Q*p."]],
  });
});
add(function (r) {
  const x = make(r), t = x.Qs / x.p;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `How many days does each production run of Q*p take (<b>t</b>)? ${R2}`, answer: t, unit: "days",
    hints: ["Find Q*p.", "t = Q ÷ p: the batch size divided by how fast it's made."],
    steps: [stepDp(x), `Q*p = ${n2(x.Qs)}.`, `t = ${n2(x.Qs)} ÷ ${n0(x.p)} = <b>${n2(t)}</b> days.`],
    mistakes: [[x.Qs / x.d, "Production runs at p per day, not d."], [x.days / (x.D / x.Qs), "That's the time between runs, not the length of a run."]],
  });
});

level("EPQ Costs");
add(function (r) {
  const x = make(r), sc = (x.D / x.Qs) * x.S;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the annual setup cost? ${R2}`, answer: sc, unit: "$",
    hints: ["Annual setup cost = (D ÷ Q*p) × S."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Setup = (${n0(x.D)} ÷ ${n2(x.Qs)}) × ${usd(x.S)} = <b>${usd2(sc)}</b>.`],
    mistakes: [[x.S, "That's one setup. Multiply by runs per year."], [2 * sc, "That's total cost."]],
  });
});
add(function (r) {
  const x = make(r), hc = (x.Qs / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the annual holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Annual holding (production) = H × (Q ÷ 2) × (1 − d/p).", "That's H × average inventory."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Holding = ${fmt(x.H, 4)} × (${n2(x.Qs)} ÷ 2) × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${usd2(hc)}</b>.`],
    mistakes: [[(x.Qs / 2) * x.H, "That's the EOQ holding formula. For EPQ, multiply by (1 − d/p)."], [x.Qs * (1 - x.d / x.p) * x.H, "Use AVERAGE inventory: divide max by 2."]],
  });
});
add(function (r) {
  const x = make(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the total annual cost (setup + holding)? ${R2}`, answer: tc, unit: "$",
    hints: ["Find setup and holding at Q*p and add.", "At Q*p, setup = holding, so TC = 2 × setup."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * (1 - x.d / x.p) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`],
    mistakes: [[tc / 2, "Add both setup and holding."], [(x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, "Holding cost for EPQ includes (1 − d/p)."]],
  });
});

level("Current Batch vs. EPQ");
add(function (r) {
  const x = make(r), mx = x.Q0 * (1 - x.d / x.p);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `Using the CURRENT batch size, what is the maximum inventory level? ${R2}`, answer: mx, unit: x.c.units,
    hints: ["Use the current Q, not Q*p.", "Max = Q(1 − d/p)."],
    steps: [stepDp(x), `Max = ${n0(x.Q0)} × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${n2(mx)}</b>.`],
    mistakes: [[x.Q0, "Units sell during the run, so max = Q(1 − d/p)."], [x.Qs * (1 - x.d / x.p), "That uses Q*p. Use the current batch."]],
  });
});
add(function (r) {
  const x = make(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `What is the total annual cost (setup + holding) with the CURRENT batch size? ${R2}`, answer: tc0, unit: "$",
    hints: ["Setup = (D ÷ Q) × S.", "Holding = H × (Q ÷ 2) × (1 − d/p).", "Use the current Q."],
    steps: [stepDp(x), stepH(x), `Setup = (${n0(x.D)} ÷ ${n0(x.Q0)}) × ${usd(x.S)} = ${usd2((x.D / x.Q0) * x.S)}.`, `Holding = ${fmt(x.H, 4)} × (${n0(x.Q0)} ÷ 2) × (1 − ${n0(x.d)}/${n0(x.p)}) = ${usd2((x.Q0 / 2) * (1 - x.d / x.p) * x.H)}.`, `TC = <b>${usd2(tc0)}</b>.`],
    mistakes: [[(x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H, "EPQ holding includes (1 − d/p)."], [(x.D / x.Qs) * x.S + (x.Qs / 2) * (1 - x.d / x.p) * x.H, "That's the cost at Q*p. Use the current batch."]],
  });
});
add(function (r) {
  const x = make(r), tc = (q) => (x.D / q) * x.S + (q / 2) * (1 - x.d / x.p) * x.H, sav = tc(x.Q0) - tc(x.Qs);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `How much would ${x.c.name} save per year by switching from its current batch size to Q*p? ${R2}`, answer: sav, unit: "$",
    hints: ["TC at current Q, then TC at Q*p.", "Savings = TC(current) − TC(Q*p)."],
    steps: [stepDp(x), stepH(x), `TC(current ${n0(x.Q0)}) = ${usd2(tc(x.Q0))}.`, `Q*p = ${n2(x.Qs)}; TC(Q*p) = ${usd2(tc(x.Qs))}.`, `Savings = <b>${usd2(sav)}</b>.`],
    mistakes: [[tc(x.Q0), "Subtract the cost at Q*p."], [tc(x.Qs), "That's the cost at Q*p. Subtract it from the current cost."], [-sav, "Current minus EPQ should be positive."]],
  });
});

// ================================================================== PART 7: LEAN OPERATIONS (Ch. 16)
part(13, "Lean Operations (Ch. 16)", "Lean, JIT, and TPS; waste and the 5 Ss; variability and throughput; suppliers, layout, and inventory; kanban, scheduling, and quality.");

level("Lean, JIT & TPS");
add(concept({
  q: "Which is NOT one of the three fundamental issues that lean operations address?",
  a: ["Increase batch sizes", "Add inventory buffers"],
  w: ["Eliminate waste", "Remove variability", "Improve throughput"],
  why: "Lean addresses three fundamental issues: eliminate waste, remove variability, and improve throughput.",
}));
add(concept({
  v: [
    { q: "Which approach focuses on continuous FORCED problem solving through a focus on throughput and reduced inventory?", a: "Just-in-time (JIT)" },
    { q: "Which term is the broad approach that includes both JIT and TPS?", a: "Lean operations" },
    { q: "Which system, developed at a car company, emphasizes kaizen, respect for people, and specifying work as to content, sequence, timing, and outcome?", a: "Toyota Production System (TPS)" },
  ],
  pool: ["Just-in-time (JIT)", "Toyota Production System (TPS)", "Lean operations", "Material requirements planning"],
  notes: { "Just-in-time (JIT)": "JIT: forced problem solving through throughput and reduced inventory.", "Toyota Production System (TPS)": "TPS: continuous improvement, respect for people, standard work practices.", "Lean operations": "Lean encompasses both JIT and TPS.", "Material requirements planning": "MRP isn't part of this chapter's lean family." },
  why: "JIT = forced problem solving via throughput and reduced inventory. TPS = continuous improvement, respect for people, standard work. Lean encompasses both.",
}));
const TPS_TERMS = ["Jidoka", "Kaizen", "Gemba walk", "Poka-yoke", "Kanban"];
add(concept({
  v: [
    { q: "A worker spots a defect and stops the production line until it's fixed. What is this called?", a: "Jidoka" },
    { q: "A company builds a culture where improving every process is part of everyone's job. What is this called?", a: "Kaizen" },
    { q: "Managers walk the factory floor to see the work being done firsthand. What is this called?", a: "Gemba walk" },
  ],
  pool: TPS_TERMS,
  notes: { Jidoka: "Jidoka: stopping production because of a defect.", Kaizen: "Kaizen: continuous improvement of all processes.", "Gemba walk": "Gemba walk: going to see work being performed.", "Poka-yoke": "Poka-yoke: a foolproof device or method that prevents mistakes.", Kanban: "Kanban: a signal that authorizes production or movement." },
  why: "TPS and lean vocabulary: jidoka (stop for defects), kaizen (continuous improvement), gemba walks (go see the work), poka-yoke (foolproofing), kanban (pull signals).",
}));
add(concept({
  q: "In TPS, \"respect for people\" means:",
  a: "Treating employees as knowledge workers and engaging their mental and physical capabilities",
  w: [["Never asking employees to change how they work", "TPS expects constant improvement."], ["Giving all decisions to top management", "TPS empowers employees and improves at the lowest possible level."], ["Paying higher wages than competitors", "That's not what the term means here."]],
  why: "TPS treats people as knowledge workers, engages their mental and physical capabilities, and empowers them.",
}));
add(concept({
  q: "In TPS standard work practice, work is completely specified as to:",
  a: "Content, sequence, timing, and outcome",
  w: [["Price, quantity, and supplier", "That's purchasing, not standard work."], ["Only the final outcome", "TPS specifies content, sequence, timing, AND outcome."], ["Whatever each worker prefers that day", "Standard work removes that variation."]],
  why: "TPS standard work: work is specified as to content, sequence, timing, and outcome, and improvement follows the scientific method at the lowest possible level.",
}));
add(concept({
  q: "Lean and sustainability are described as \"two sides of the same coin.\" What is their common ground?",
  a: "Driving out waste",
  w: [["Increasing inventory buffers", "Both try to reduce excess."], ["Using more suppliers", "Not the common ground."], ["Larger production batches", "Lean prefers small lots."]],
  why: "Lean and sustainability both maximize resource use and economic efficiency; driving out waste is the common ground.",
}));

level("Waste & the 5 Ss");
const WASTES = ["Transportation", "Queues (waiting)", "Defective products", "Overprocessing", "Motion", "Overproduction", "Inventory"];
const WASTE_NOTES = { Transportation: "Transportation: moving materials more than needed.", "Queues (waiting)": "Queues: work sitting idle, waiting.", "Defective products": "Defects: scrap and rework.", Overprocessing: "Overprocessing: doing more work than the customer values.", Motion: "Motion: unnecessary movement of PEOPLE (reaching, walking, searching).", Overproduction: "Overproduction: making more, or sooner, than needed.", Inventory: "Inventory: excess stock that hides problems." };
add(concept({
  v: [
    { q: "Workers walk 200 feet across the shop several times an hour to get the same tools. Which of Ohno's seven wastes?", a: "Motion" },
    { q: "Parts are forklifted between three buildings before final assembly. Which waste?", a: "Transportation" },
    { q: "A plant makes 500 units because the machine is already set up, even though customers ordered 300. Which waste?", a: "Overproduction" },
    { q: "A shop polishes the inside of a bracket that no customer will ever see. Which waste?", a: "Overprocessing" },
    { q: "Jobs sit stacked in front of a slow machine for two days. Which waste?", a: "Queues (waiting)" },
    { q: "One in ten units has to be scrapped or reworked. Which waste?", a: "Defective products" },
  ],
  pool: WASTES, notes: WASTE_NOTES,
  why: "Ohno's seven wastes: transportation, queues, defective products, overprocessing, motion, overproduction, and inventory.",
}));
add(concept({
  q: "Which of these is NOT one of Ohno's seven wastes?",
  a: ["Training employees", "Preventive maintenance", "Customer service"],
  w: WASTES.slice(),
  why: "The seven wastes are transportation, queues, defective products, overprocessing, motion, overproduction, and inventory.",
}));
add(concept({
  q: "In lean, waste is defined as:",
  a: "Anything that does not add value from the customer's point of view",
  w: [["Anything that costs more than $100", "Waste is about value, not dollar size."], ["Only scrap and defects", "Defects are one of seven wastes."], ["Anything management didn't approve", "Waste is judged from the customer's view."]],
  why: "Waste is anything that does not add value from the customer's point of view. Storage, inspection, delay, waiting in queues, and defects are 100% non-value-added.",
}));
const FIVE_S = ["Sort/segregate", "Simplify/straighten", "Shine/sweep", "Standardize", "Sustain/self-discipline"];
add(concept({
  v: [
    { q: "A team removes everything from a work cell that isn't needed: \"When in doubt, throw it out.\" Which S?", a: "Sort/segregate" },
    { q: "A team outlines each tool's spot on a shadow board so every tool has a home. Which S?", a: "Simplify/straighten" },
    { q: "Each shift ends with a quick cleaning of the work area. Which S?", a: "Shine/sweep" },
    { q: "A team writes one procedure so every shift does the job the same way, removing variation. Which S?", a: "Standardize" },
    { q: "Managers review work regularly and recognize progress so the improvements stick. Which S?", a: "Sustain/self-discipline" },
  ],
  pool: FIVE_S,
  notes: { "Sort/segregate": "Sort: when in doubt, throw it out.", "Simplify/straighten": "Simplify/straighten: methods analysis tools; a place for everything.", "Shine/sweep": "Shine: clean daily.", Standardize: "Standardize: remove variations from processes.", "Sustain/self-discipline": "Sustain: review work and recognize progress." },
  why: "The 5 Ss: sort, simplify/straighten, shine/sweep, standardize, sustain. Many firms add two more: safety and support/maintenance.",
}));
add(concept({
  q: "Some firms add two more Ss to the 5 Ss. Which two?",
  a: "Safety and support/maintenance",
  w: [["Speed and savings", "Not the added Ss."], ["Sales and service", "Not the added Ss."], ["Scheduling and suppliers", "Not the added Ss."]],
  why: "Two additional Ss: safety (build in good practices) and support/maintenance (reduce variability and unplanned downtime).",
}));

level("Variability, Throughput & Setup");
add(concept({
  q: ["In lean, variability is:", "Lean defines variability as:"],
  a: "Any deviation from the optimum process",
  w: [["A healthy sign of flexibility", "Lean works to REDUCE variability."], ["Only changes in customer demand", "Variability can be internal or external."], ["The difference between price and cost", "That's margin."]],
  why: "Variability is any deviation from the optimum process. Inventory hides variability, and less variability means less waste.",
}));
add(concept({
  q: "Which is a source of variability?",
  a: ["Inadequate maintenance", "Incomplete or inaccurate drawings, specifications, or bills of material", "Poor processes that make improper quantities or late units", "Unknown and changing customer demands"],
  w: [["Level schedules", "Level schedules REDUCE variability."], ["Cross-trained workers", "Cross-training adds flexibility."], ["Standardized containers", "Standardization reduces variability."]],
  why: "Sources of variability: poor processes, inadequate maintenance, unknown and changing customer demand, and incomplete or inaccurate drawings, specs, and bills of material.",
}));
add(concept({
  v: [
    { q: "The time from when raw materials arrive until the finished order ships is called:", a: "Manufacturing cycle time" },
    { q: "Each station makes more only when the station after it signals that it needs more. This is a:", a: "Pull system" },
    { q: "Each station keeps producing and sends work downstream whether or not the next station needs it. This is a:", a: "Push system" },
  ],
  pool: ["Manufacturing cycle time", "Pull system", "Push system", "Lead time"],
  why: "Throughput improves with a pull system, which moves small lots, removes inventory cushions, exposes problems, and reduces manufacturing cycle time. Push systems dump orders downstream regardless of need.",
}));
add(concept({
  q: "Lean compares inventory to water hiding rocks in a river. Lowering inventory:",
  a: "Exposes problems (the \"rocks\") so they can be fixed",
  w: [["Creates new problems that weren't there before", "The problems were already there, just hidden."], ["Makes the process less efficient forever", "Fixing exposed problems improves the process."], ["Increases holding cost", "Less inventory lowers holding cost."]],
  why: "Reducing inventory uncovers the \"rocks\" (problems) so they're exposed and fixed. Shingo said, \"Inventory is evil.\"",
}));
add(concept({
  q: "What happens when setup costs are reduced?",
  a: "Lot sizes get smaller and average inventory goes down",
  w: [["Lot sizes get larger", "High setup costs encourage LARGE lots."], ["Holding cost per unit goes up", "Setup cost doesn't change H."], ["The EOQ gets bigger", "Lower S means smaller Q*."]],
  why: "High setup costs encourage large lots. Reducing setup costs reduces lot size and average inventory. Setup time can be cut by preparing before shutdown and changeover.",
}));
add(concept({
  q: "How can setup time be reduced?",
  a: "Do as much preparation as possible before the machine is shut down for changeover",
  w: [["Make bigger batches so setups happen less often", "That avoids setups instead of shortening them, and adds inventory."], ["Wait until the machine stops to gather tools", "That ADDS idle time."], ["Add inspection after each setup", "That doesn't shorten the setup."]],
  why: "Setup time can be reduced through preparation prior to shutdown and changeover.",
}));

level("Suppliers, Layout & Inventory");
add(concept({
  q: "Which is NOT a goal of JIT supplier partnerships?",
  a: "Increase in-transit inventory",
  w: ["Remove unnecessary activities", "Remove in-plant inventory", "Improve quality and reliability", "Remove in-transit inventory"],
  why: "Four goals of supplier partnerships: removal of unnecessary activities, removal of in-plant inventory, removal of in-transit inventory, and improved quality and reliability.",
}));
add(concept({
  v: [
    { q: "A supplier worries that tying itself to one big JIT customer puts all its eggs in one basket. Which supplier concern is this?", a: "Diversification" },
    { q: "A supplier worries that delivering small lots several times a day will shift costs onto it. Which concern?", a: "Lot sizes" },
    { q: "A supplier doubts the customer can create a smooth, steady schedule. Which concern?", a: "Scheduling" },
    { q: "A supplier worries that with very short lead times, any engineering change will cause problems. Which concern?", a: "Lead time" },
    { q: "A supplier worries its processes and capital budget limit how much it can improve its quality. Which concern?", a: "Quality" },
  ],
  pool: ["Diversification", "Scheduling", "Lead time", "Quality", "Lot sizes"],
  why: "Supplier concerns with JIT partnerships: diversification, scheduling, lead time, quality, and lot sizes.",
}));
add(concept({
  q: ["Which is a lean LAYOUT tactic?", "A plant is redesigning its floor for lean. Which tactic fits?"],
  a: ["Build work cells for families of products", "Design little space for inventory", "Minimize distance between operations", "Cross-train workers to add flexibility", "Build flexible or movable equipment"],
  w: [["Add large storage areas between every station", "Lean layouts design little space for inventory."], ["Spread operations out across a large area", "Lean includes many operations in a small area."], ["Keep each worker on one task only", "Lean cross-trains for flexibility."]],
  why: "Table 16.1 lean layout tactics: work cells for product families, many operations in a small area, minimize distance, little space for inventory, better communication, poka-yoke, flexible equipment, cross-trained workers.",
}));
add(concept({
  q: ["A connector that physically only fits into the correct port, so it can't be installed wrong, is an example of:", "A fixture that won't let a part be loaded backward is an example of:"],
  a: "Poka-yoke",
  w: [["Kanban", "Kanban is a signal for production."], ["Jidoka", "Jidoka is stopping production for a defect."], ["Kaizen", "Kaizen is continuous improvement."]],
  why: "Poka-yoke devices are foolproof (fail-safe) methods that prevent mistakes. They appear in lean layout and lean quality tactics.",
}));
add(concept({
  q: "Which is a lean INVENTORY tactic?",
  a: ["Deliver directly to the point of use", "Use a pull system to move inventory", "Reduce lot sizes", "Develop just-in-time delivery systems with suppliers", "Reduce setup time"],
  w: [["Order in the largest lots possible to cut ordering costs", "Lean reduces lot sizes."], ["Keep big buffers between every operation", "Lean keeps inventory at the minimum needed."], ["Push inventory to downstream stations", "Lean uses PULL."]],
  why: "Table 16.2 lean inventory tactics: pull system, reduce lot sizes, JIT delivery with suppliers, deliver to point of use, perform to schedule, reduce setup time, use group technology.",
}));
add(concept({
  q: "With little or no inventory buffer in a lean system, what becomes critical for employees?",
  a: "Getting it right the first time",
  w: [["Working as fast as possible regardless of quality", "With no buffer, mistakes stop the line."], ["Staying on one narrow task", "Lean cross-trains for flexibility."], ["Building extra units just in case", "That's overproduction."]],
  why: "Lean cross-trains employees, improves communication, and with little or no inventory buffer, getting it right the first time is critical.",
}));

level("Kanban, Scheduling & Quality");
add(concept({
  q: ["In a kanban system, the card (or other signal) is:", "What does a kanban signal mean?"],
  a: "An authorization to produce or move the next container of material",
  w: [["A record of defects found", "That's quality tracking."], ["A bill sent to the customer", "Kanban is an internal production signal."], ["A forecast of next month's demand", "Kanban responds to actual use; it pulls."]],
  why: "Kanban is the Japanese word for card. The signal authorizes the next container to be produced. A sequence of kanbans pulls material through the process.",
}));
add(concept({
  q: "When the producer and user can SEE each other, what can serve as a kanban signal instead of a card?",
  a: "A light, a flag, or an empty spot on the floor",
  w: [["An email to the purchasing department", "Kanban signals are simple and visual."], ["The monthly forecast", "Kanban is triggered by use, not forecasts."], ["Nothing: kanban only works with cards", "Many kinds of signals work."]],
  why: "When producer and user aren't in visual contact, a card is used. Otherwise a light, flag, or empty spot on the floor may be enough; it's still called kanban.",
}));
add(concept({
  q: "Kanban cards provide direct control over, and a limit on:",
  a: "The amount of work-in-process between cells",
  w: [["The price paid to suppliers", "Not what kanban controls."], ["The number of employees", "Not what kanban controls."], ["Annual demand", "Kanban responds to demand; it doesn't limit it."]],
  why: "Kanban cards directly control and limit work-in-process between cells. Small containers require tight schedules and smooth operations, and shortages show up immediately.",
}));
add(concept({
  q: ["A level schedule means:", "Which describes lean (level) scheduling?"],
  a: ["Processing frequent small batches rather than a few large batches", "Seeking one-piece-make and one-piece-move"],
  w: [["Running one product all month, then switching", "That's large-batch scheduling."], ["Changing the schedule constantly right up to the due date", "Lean FREEZES the part of the schedule closest to due dates."], ["Hiding the schedule from suppliers", "Lean communicates schedules to suppliers."]],
  why: "Lean scheduling: level schedules (frequent small batches), kanbans, communicate schedules to suppliers, freeze part of the schedule, perform to schedule, one-piece-make/move, small lots, a perfect part every time.",
}));
add(concept({
  q: "Why does lean (JIT) make it cheaper to get good quality?",
  a: "JIT exposes poor quality, and shorter lead times expose problems sooner",
  w: [["Lean adds more final inspection", "Lean builds quality in instead of inspecting it in."], ["Lean uses bigger batches to average out defects", "Small lots expose problems."], ["Lean ignores quality to cut cost", "Lean and quality are strongly related."]],
  why: "Lean cuts the cost of good quality because JIT exposes poor quality, shorter lead times expose problems sooner, and better quality means fewer buffers.",
}));
add(concept({
  q: "Which is NOT a lean quality tactic?",
  a: "Inspect only at the end of the line, in large lots",
  w: ["Use statistical process control", "Empower employees", "Build fail-safe methods (poka-yoke, checklists)", "Expose poor quality with small lots", "Provide immediate feedback"],
  why: "Table 16.4 lean quality tactics: SPC, empower employees, fail-safe methods, expose poor quality with small lots, provide immediate feedback.",
}));


// ================================================================== export
const Bank = { BANK, LEVEL_INFO, VAR_CARD, rand, fmt, eoq, epq, FACT };
if (typeof module !== "undefined" && module.exports) module.exports = Bank;
root.Bank = Bank;
})(typeof window !== "undefined" ? window : globalThis);
