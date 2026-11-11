// =====================================================
// Aircraft Performance Calculator - script.js
// Educational demonstration only.
// =====================================================

const GRAVITY = 9.81;
const CL_FIXED = 0.5;
const MAX_ROWS = 200;
const GROUND_PX = 31;
const FLIGHT_MS = 6000;
const DEFAULT_SPEEDS = { start: "60", end: "120", step: "10" };
const DEFAULT_CREDIT = "Photo credit: write the author, licence and file link here once you have chosen your picture.";

const CONDITION_ORDER = [
  { key: "zeroVisibility", label: "Zero visibility" },
  { key: "highWindshear", label: "High windshear" },
  { key: "rain", label: "Rain" },
  { key: "heavyCrosswind", label: "Heavy crosswind" },
  { key: "turbulence", label: "Turbulence" }
];

const WEATHER_SCORE = {
  Preferred: 4,
  Resilient: 3,
  Usable: 2,
  Caution: 1,
  Limited: 0
};

const AIRCRAFT = [
  {
    id: "a350k", name: "Airbus A350-1000", mass_kg: 322000, wing_area_m2: 443, rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#39ff88", photoFile: "Airbus A350-1000 first flight.jpg", search: "Airbus A350-1000", credit: "",
    maxRangeKm: 16500,
    weather: {
      zeroVisibility: "Preferred",
      highWindshear: "Preferred",
      rain: "Preferred",
      heavyCrosswind: "Usable",
      turbulence: "Preferred"
    },
    override: {
      roguePilot: "Auto-stabilization and flight-envelope protection",
      technicalGlitch: "Switch to backup flight-control logic and safe diversion"
    },
    note: "Strong long-range performance with balanced weather resilience."
  },
  {
    id: "a380", name: "Airbus A380-800", mass_kg: 575000, wing_area_m2: 845, rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#00f0ff", photoFile: "Airbus A380 blue sky.jpg", search: "Airbus A380-800", credit: "",
    maxRangeKm: 14800,
    weather: {
      zeroVisibility: "Usable",
      highWindshear: "Resilient",
      rain: "Preferred",
      heavyCrosswind: "Caution",
      turbulence: "Usable"
    },
    override: {
      roguePilot: "Envelope protection and automatic trim correction",
      technicalGlitch: "Load shedding and alternate guidance path"
    },
    note: "Very large payload range, but less agile in strong crosswinds."
  },
  {
    id: "b787", name: "Boeing 787-9", mass_kg: 254000, wing_area_m2: 325, rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#4dd2ff", photoFile: "Boeing 787-9 Dreamliner in flight.jpg", search: "Boeing 787-9", credit: "",
    maxRangeKm: 14200,
    weather: {
      zeroVisibility: "Preferred",
      highWindshear: "Preferred",
      rain: "Preferred",
      heavyCrosswind: "Usable",
      turbulence: "Preferred"
    },
    override: {
      roguePilot: "Autopilot handoff and envelope safeguard",
      technicalGlitch: "Dual-channel system fallback with reroute logic"
    },
    note: "Excellent all-weather balance and efficient cruise range."
  },
  {
    id: "a321", name: "Airbus A321", mass_kg: 93500, wing_area_m2: 122.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#8c9bff", photoFile: "Airbus A321-200 in flight.jpg", search: "Airbus A321", credit: "",
    maxRangeKm: 7400,
    weather: {
      zeroVisibility: "Usable",
      highWindshear: "Usable",
      rain: "Resilient",
      heavyCrosswind: "Caution",
      turbulence: "Resilient"
    },
    override: {
      roguePilot: "Manual intervention lockout and auto-return to safe mode",
      technicalGlitch: "Secondary avionics path and reduced-speed fallback"
    },
    note: "Reliable short-to-medium route aircraft with manageable risk exposure."
  },
  {
    id: "b737", name: "Boeing 737-800", mass_kg: 79000, wing_area_m2: 124.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#39ff88", photoFile: "Boeing 737-800 in flight.jpg", search: "Boeing 737-800", credit: "",
    maxRangeKm: 6200,
    weather: {
      zeroVisibility: "Usable",
      highWindshear: "Resilient",
      rain: "Resilient",
      heavyCrosswind: "Caution",
      turbulence: "Usable"
    },
    override: {
      roguePilot: "Controlled disengagement and flight envelope limit enforcement",
      technicalGlitch: "Fails to alternative navigation and monitored descent"
    },
    note: "Good operational flexibility but needs more caution in gust-heavy conditions."
  },
  {
    id: "a320", name: "Airbus A320", mass_kg: 78000, wing_area_m2: 122.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#ff2bd6", photoFile: "Airbus A320-200 in flight.jpg", search: "Airbus A320", credit: "",
    maxRangeKm: 6800,
    weather: {
      zeroVisibility: "Usable",
      highWindshear: "Usable",
      rain: "Resilient",
      heavyCrosswind: "Caution",
      turbulence: "Resilient"
    },
    override: {
      roguePilot: "Pilot override mitigation and stability corrections",
      technicalGlitch: "Backup flight computer with route-recovery logic"
    },
    note: "Versatile and common, but not the first choice in severe wind events."
  },
  {
    id: "b747", name: "Boeing 747-8", mass_kg: 447700, wing_area_m2: 554, rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#ff6a3d", photoFile: "Boeing 747-8 Intercontinental in flight.jpg", search: "Boeing 747-8", credit: "",
    maxRangeKm: 13800,
    weather: {
      zeroVisibility: "Resilient",
      highWindshear: "Usable",
      rain: "Preferred",
      heavyCrosswind: "Caution",
      turbulence: "Usable"
    },
    override: {
      roguePilot: "Protection mode and rapid flight-control correction",
      technicalGlitch: "Reduced-load fallback and alternate navigation lane"
    },
    note: "Long haul reliability with strong range, though it is less comfortable in severe crosswind conditions."
  },
  {
    id: "a350f", name: "Airbus A350F", mass_kg: 319000, wing_area_m2: 443, rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#ffb800", photoFile: "Airbus A350F.jpg", search: "Airbus A350F", credit: "",
    maxRangeKm: 15700,
    weather: {
      zeroVisibility: "Preferred",
      highWindshear: "Resilient",
      rain: "Preferred",
      heavyCrosswind: "Usable",
      turbulence: "Preferred"
    },
    override: {
      roguePilot: "Flight envelope filtering and stabilized control handoff",
      technicalGlitch: "Redundant bus switching and contingency route selection"
    },
    note: "Exceptional range and stable control logic, suitable for demanding operations."
  },
  {
    id: "beluga", name: "Airbus BelugaXL", mass_kg: 227000, wing_area_m2: 361.6, rho: 1.225, cd0: 0.030, k: 0.050, clmax: 1.5,
    color: "#00f0ff", photoFile: "Airbus BelugaXL in flight.jpg", search: "Airbus BelugaXL", credit: "",
    maxRangeKm: 4400,
    weather: {
      zeroVisibility: "Caution",
      highWindshear: "Usable",
      rain: "Usable",
      heavyCrosswind: "Caution",
      turbulence: "Resilient"
    },
    override: {
      roguePilot: "Controlled trim lock and safe deceleration",
      technicalGlitch: "Cargo-route fallback with conservative speed reduction"
    },
    note: "Highly specialized aircraft with lower range and more caution in degraded weather."
  },
  {
    id: "custom", name: "Custom aircraft", mass_kg: 1100, wing_area_m2: 16.2, rho: 1.225, cd0: 0.030, k: 0.045, clmax: 1.5,
    color: "#ff2bd6", photoFile: "", search: "", credit: "",
    maxRangeKm: 0,
    weather: {
      zeroVisibility: "Limited",
      highWindshear: "Limited",
      rain: "Limited",
      heavyCrosswind: "Limited",
      turbulence: "Limited"
    },
    override: {
      roguePilot: "User-configured emergency logic",
      technicalGlitch: "Manual review required"
    },
    note: "Custom configuration. user-defined assumptions apply."
  }
];

const grid = document.getElementById("aircraftGrid");
const selectedName = document.getElementById("selectedName");
const paramHint = document.getElementById("paramHint");
const form = document.getElementById("calcForm");
const csvBtn = document.getElementById("csvBtn");
const resetBtn = document.getElementById("resetBtn");
const messageBox = document.getElementById("messageBox");
const resultsPanel = document.getElementById("resultsPanel");
const resultsBody = document.getElementById("resultsBody");
const stageEl = document.getElementById("stage");
const planeEl = document.getElementById("plane");
const liveSpeedEl = document.getElementById("liveSpeed");
const statusEl = document.getElementById("flightStatus");
const modeTakeoffBtn = document.getElementById("modeTakeoff");
const modeLandingBtn = document.getElementById("modeLanding");
const replayBtn = document.getElementById("replayBtn");
const rankingGrid = document.getElementById("rankingGrid");
const selectedAircraftSummary = document.getElementById("selectedAircraftSummary");

const paramInputs = {
  mass_kg: document.getElementById("mass"),
  wing_area_m2: document.getElementById("area"),
  rho: document.getElementById("rho"),
  cd0: document.getElementById("cd0"),
  k: document.getElementById("k"),
  clmax: document.getElementById("clmax")
};

const startInput = document.getElementById("startSpeed");
const endInput = document.getElementById("endSpeed");
const stepInput = document.getElementById("stepSpeed");

let selectedId = null;
let customSaved = null;
let lastResults = null;
let flightMode = "takeoff";
let flightInfo = null;
let animFrame = null;

const PLANE_SHAPE =
  '<path d="M8 28 Q6 21 16 20 L108 20 Q132 22 137 28 Q132 34 108 34 L18 34 Q8 34 8 28 Z"/>' +
  '<path d="M14 21 L4 3 L20 3 L38 20 Z"/>' +
  '<path d="M58 30 L80 42 L92 42 L84 30 Z"/>' +
  '<ellipse cx="78" cy="40" rx="9" ry="4"/>' +
  '<path d="M30 26 H100" stroke-dasharray="3 4"/>';

function planeGroup(color) {
  return '<g fill="#0b1633" stroke="' + color + '" stroke-width="2" stroke-linejoin="round">' +
    PLANE_SHAPE + '</g>';
}

function animatedPlaneSvg() {
  return '<svg viewBox="0 0 140 50" aria-hidden="true">' +
    planeGroup("#00f0ff") +
    '<circle cx="36" cy="40" r="3.5" fill="#00f0ff"/>' +
    '<circle cx="104" cy="40" r="3.5" fill="#00f0ff"/>' +
    '</svg>';
}

function cardIllustration(plane) {
  let gridLines = "";
  for (let x = 0; x <= 200; x += 20) {
    gridLines += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="120"/>';
  }
  for (let y = 0; y <= 120; y += 20) {
    gridLines += '<line x1="0" y1="' + y + '" x2="200" y2="' + y + '"/>';
  }
  return '<svg viewBox="0 0 200 120" role="img" aria-label="' + plane.name + ' illustration">' +
    '<rect width="200" height="120" fill="#070d1f"/>' +
    '<g stroke="#12306a" stroke-width="1">' + gridLines + '</g>' +
    '<g transform="translate(22 34) scale(1.1)" style="filter: drop-shadow(0 0 4px ' + plane.color + ')">' +
    planeGroup(plane.color) + '</g>' +
    '</svg>';
}

function imageSources(plane) {
  const list = [];
  ["jpg", "jpeg", "png", "webp"].forEach(function (ext) {
    list.push("images/" + plane.id + "." + ext);
  });
  if (plane.photoFile) {
    list.push("https://commons.wikimedia.org/wiki/Special:FilePath/" +
      encodeURIComponent(plane.photoFile) + "?width=500");
  }
  return list;
}

function createAircraftImage(plane, className) {
  const wrapper = document.createElement("div");
  wrapper.className = className || "card-img";
  const sources = imageSources(plane);
  let index = 0;
  const img = document.createElement("img");
  img.alt = plane.name;
  img.onerror = function () {
    index++;
    if (index < sources.length) {
      img.src = sources[index];
    } else {
      wrapper.innerHTML = cardIllustration(plane);
    }
  };
  img.src = sources[0];
  wrapper.appendChild(img);
  return wrapper;
}

function findAircraft(id) {
  return AIRCRAFT.find(function (p) { return p.id === id; });
}

function getAircraftPriority(plane) {
  const score = CONDITION_ORDER.reduce(function (total, condition) {
    return total + WEATHER_SCORE[plane.weather[condition.key]];
  }, 0);
  const rangeBoost = Math.min(15, Math.round(plane.maxRangeKm / 1000));
  return score * 10 + rangeBoost;
}

function getSuitabilityLabel(score) {
  if (score >= 90) return "Preferred";
  if (score >= 70) return "Usable";
  return "Caution";
}

function buildRanking() {
  const list = AIRCRAFT.filter(function (plane) { return plane.id !== "custom"; })
    .map(function (plane) {
      const score = getAircraftPriority(plane);
      return { plane, score, label: getSuitabilityLabel(score) };
    })
    .sort(function (a, b) { return b.score - a.score; });

  rankingGrid.innerHTML = "";

  list.forEach(function (entry, index) {
    const card = document.createElement("article");
    card.className = "rank-card " + entry.label.toLowerCase();
    const badge = document.createElement("div");
    badge.className = "rank-badge";
    badge.textContent = "#" + (index + 1);

    const imageWrap = createAircraftImage(entry.plane, "rank-card-image");

    const content = document.createElement("div");
    content.className = "rank-content";

    const header = document.createElement("div");
    header.className = "rank-header";
    const title = document.createElement("h3");
    title.textContent = entry.plane.name;
    const tag = document.createElement("span");
    tag.className = "rank-tag";
    tag.textContent = entry.label;
    header.appendChild(title);
    header.appendChild(tag);

    const meta = document.createElement("div");
    meta.className = "rank-meta";
    meta.innerHTML = "<span>Max range: " + entry.plane.maxRangeKm.toLocaleString() + " km</span>" +
      "<span>Overall score: " + entry.score + "/100</span>";

    const listWrap = document.createElement("div");
    listWrap.className = "condition-list";
    CONDITION_ORDER.forEach(function (condition) {
      const row = document.createElement("div");
      row.className = "condition-row";
      const name = document.createElement("span");
      name.textContent = condition.label;
      const value = document.createElement("span");
      value.className = "cond-" + entry.plane.weather[condition.key].toLowerCase().replace(/\s+/g, "-");
      value.textContent = entry.plane.weather[condition.key];
      row.appendChild(name);
      row.appendChild(value);
      listWrap.appendChild(row);
    });

    const note = document.createElement("p");
    note.className = "rank-note";
    note.textContent = entry.plane.note;

    content.appendChild(header);
    content.appendChild(meta);
    content.appendChild(listWrap);
    content.appendChild(note);

    card.appendChild(badge);
    card.appendChild(imageWrap);
    card.appendChild(content);
    rankingGrid.appendChild(card);
  });
}

function updateSelectedAircraftSummary() {
  const plane = findAircraft(selectedId) || AIRCRAFT[0];
  const summary = selectedAircraftSummary;
  summary.innerHTML = "";

  const summaryTop = document.createElement("div");
  summaryTop.className = "summary-hero";

  const image = createAircraftImage(plane, "summary-image");

  const body = document.createElement("div");
  body.className = "summary-body";

  const title = document.createElement("h3");
  title.textContent = plane.name;

  const metrics = document.createElement("div");
  metrics.className = "summary-metrics";
  metrics.innerHTML = "<span><strong>Max range:</strong> " + plane.maxRangeKm.toLocaleString() + " km</span>" +
    "<span><strong>Best use:</strong> " + plane.note + "</span>";

  const weatherWrap = document.createElement("div");
  weatherWrap.className = "summary-weather";
  CONDITION_ORDER.forEach(function (condition) {
    const row = document.createElement("div");
    row.className = "weather-row";
    row.innerHTML = "<span>" + condition.label + "</span><strong>" + plane.weather[condition.key] + "</strong>";
    weatherWrap.appendChild(row);
  });

  const overrideBox = document.createElement("div");
  overrideBox.className = "override-box";
  overrideBox.innerHTML = "<h4>Forced override / failure response</h4>" +
    "<p><strong>Rogue pilot:</strong> " + plane.override.roguePilot + "</p>" +
    "<p><strong>Technical glitch:</strong> " + plane.override.technicalGlitch + "</p>";

  body.appendChild(title);
  body.appendChild(metrics);
  body.appendChild(weatherWrap);
  body.appendChild(overrideBox);
  summaryTop.appendChild(image);
  summaryTop.appendChild(body);
  summary.appendChild(summaryTop);
}

function showMessage(html, isInfo) {
  messageBox.innerHTML = html;
  messageBox.className = isInfo ? "message info" : "message";
  messageBox.hidden = false;
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.innerHTML = "";
}

function clearResults() {
  cancelAnimationFrame(animFrame);
  stageEl.classList.remove("running");
  flightInfo = null;
  resultsPanel.hidden = true;
  resultsBody.innerHTML = "";
  csvBtn.disabled = true;
  lastResults = null;
}

function fillParams(values) {
  Object.keys(paramInputs).forEach(function (key) {
    paramInputs[key].value = String(values[key]);
  });
}

function readParamText() {
  const copy = {};
  Object.keys(paramInputs).forEach(function (key) {
    copy[key] = paramInputs[key].value;
  });
  return copy;
}

function selectAircraft(id) {
  if (selectedId === "custom") {
    customSaved = readParamText();
  }

  selectedId = id;
  const plane = findAircraft(id);

  AIRCRAFT.forEach(function (p) {
    const card = document.getElementById("card-" + p.id);
    const isSelected = (p.id === id);
    if (card) {
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    }
  });

  selectedName.textContent = plane.name;

  const isCustom = (id === "custom");
  Object.keys(paramInputs).forEach(function (key) {
    paramInputs[key].disabled = !isCustom;
  });

  if (isCustom) {
    fillParams(customSaved || plane);
    paramHint.textContent = "You can edit these values for your Custom aircraft.";
  } else {
    fillParams(plane);
    paramHint.textContent = 'These values are fixed for this aircraft. Select "Custom aircraft" to edit them.';
  }

  updateSelectedAircraftSummary();
  hideMessage();
  clearResults();
}

function readNumber(inputEl, label) {
  const text = inputEl.value.trim();

  if (text === "") {
    return { error: label + " is blank. Please type a number." };
  }
  const value = Number(text);
  if (!Number.isFinite(value)) {
    return { error: label + ' ("' + text + '") is not a valid number.' };
  }
  if (value < 0) {
    return { error: label + " cannot be negative." };
  }
  if (value === 0) {
    return { error: label + " cannot be zero." };
  }
  return { value: value };
}

function calculate() {
  hideMessage();
  clearResults();

  if (!selectedId) {
    showMessage("Please click an aircraft picture first.");
    return;
  }

  const plane = findAircraft(selectedId);
  const errors = [];

  function get(inputEl, label) {
    const result = readNumber(inputEl, label);
    if (result.error) { errors.push(result.error); return NaN; }
    return result.value;
  }

  const mass = get(paramInputs.mass_kg, "Mass (kg)");
  const area = get(paramInputs.wing_area_m2, "Wing area (m²)");
  const rho = get(paramInputs.rho, "Air density (kg/m³)");
  const cd0 = get(paramInputs.cd0, "CD0");
  const k = get(paramInputs.k, "k");
  const clmax = get(paramInputs.clmax, "CLmax");
  const start = get(startInput, "Starting speed (m/s)");
  const end = get(endInput, "Ending speed (m/s)");
  const step = get(stepInput, "Speed interval (m/s)");

  if (errors.length > 0) {
    showMessage("Please fix the following:<ul><li>" + errors.join("</li><li>") + "</li></ul>");
    return;
  }

  if (end <= start) {
    showMessage("The ending speed must be larger than the starting speed.");
    return;
  }

  const rowCount = Math.floor((end - start) / step + 1e-9) + 1;
  if (rowCount > MAX_ROWS) {
    showMessage("That range would make " + rowCount + " rows. The maximum is " + MAX_ROWS + ". Please use a larger interval or a smaller speed range.");
    return;
  }

  const weight = mass * GRAVITY;
  const stallMs = Math.sqrt((2 * weight) / (rho * area * clmax));
  const stallKmh = stallMs * 3.6;
  const cdFixed = cd0 + k * CL_FIXED * CL_FIXED;
  const ldFixed = cdFixed > 0 ? CL_FIXED / cdFixed : 0;

  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const speed = Math.round((start + i * step) * 1e6) / 1e6;
    const q = 0.5 * rho * speed * speed;
    const qS = q * area;
    const lift = qS * CL_FIXED;
    const drag = qS * cdFixed;
    const ld = drag > 0 ? lift / drag : 0;
    const requiredCL = qS > 0 ? weight / qS : 0;

    rows.push({
      speed: speed,
      lift: lift,
      drag: drag,
      ld: ld,
      requiredCL: requiredCL,
      note: requiredCL > clmax ? "Below stall speed" : "OK"
    });
  }

  lastResults = { name: plane.name, rows: rows };
  flightInfo = { start: start, end: end, stall: stallMs };
  showResults(plane.name, weight, stallMs, stallKmh, cdFixed, ldFixed, rows);
}

function formatNum(value, decimals) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function showResults(name, weight, stallMs, stallKmh, cdFixed, ldFixed, rows) {
  document.getElementById("resultsName").textContent = name;
  document.getElementById("outWeight").textContent = formatNum(weight, 0) + " N";
  document.getElementById("outStallMs").textContent = formatNum(stallMs, 1) + " m/s";
  document.getElementById("outStallKmh").textContent = formatNum(stallKmh, 1) + " km/h";
  document.getElementById("outFixed").textContent = CL_FIXED + " / " + formatNum(cdFixed, 4) + " / " + formatNum(ldFixed, 2);

  resultsBody.innerHTML = "";
  rows.forEach(function (row) {
    const tr = document.createElement("tr");
    if (row.note !== "OK") { tr.className = "below-stall"; }
    tr.innerHTML =
      "<td>" + formatNum(row.speed, 2) + "</td>" +
      "<td>" + formatNum(row.lift, 0) + "</td>" +
      "<td>" + formatNum(row.drag, 0) + "</td>" +
      "<td>" + formatNum(row.ld, 2) + "</td>" +
      "<td>" + formatNum(row.requiredCL, 3) + "</td>" +
      "<td>" + row.note + "</td>";
    resultsBody.appendChild(tr);
  });

  resultsPanel.hidden = false;
  csvBtn.disabled = false;
  playFlight();
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function playFlight() {
  if (!flightInfo) { return; }
  cancelAnimationFrame(animFrame);

  const start = flightInfo.start;
  const end = flightInfo.end;
  const stall = flightInfo.stall;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const climbHeight = Math.max(40, stageEl.clientHeight - GROUND_PX - planeEl.offsetHeight - 14);
  const startTime = performance.now();
  stageEl.classList.add("running");

  function frame(now) {
    const t = reduceMotion ? 1 : Math.min(1, (now - startTime) / FLIGHT_MS);
    let speed, height, angle, status;

    if (flightMode === "takeoff") {
      speed = start + (end - start) * t;
      const liftStart = Math.max(stall, start);
      let a = 0;
      if (end > liftStart) {
        a = (speed - liftStart) / (end - liftStart);
      }
      a = Math.min(1, Math.max(0, a));

      height = a * climbHeight;
      angle = -Math.min(1, a * 5) * 14;

      if (end <= stall) {
        status = "Too slow: below stall speed, cannot lift off";
      } else if (a === 0) {
        status = "Accelerating down the runway";
      } else if (a < 0.2) {
        status = "LIFT-OFF!";
      } else {
        status = "Climbing";
      }
    } else {
      speed = end - (end - start) * t;
      const touchdown = 0.6;

      height = t < touchdown ? climbHeight * (1 - t / touchdown) : 0;
      if (t < touchdown - 0.1) {
        angle = 6;
      } else if (t < touchdown) {
        angle = -4;
      } else {
        angle = 0;
      }

      if (t < touchdown) {
        status = "Descending to the runway";
      } else if (t < touchdown + 0.08) {
        status = "TOUCHDOWN!";
      } else {
        status = "Braking on the runway";
      }
    }

    const maxLeft = Math.max(10, stageEl.clientWidth - planeEl.offsetWidth - 10);
    planeEl.style.left = (10 + t * (maxLeft - 10)) + "px";
    planeEl.style.bottom = (GROUND_PX + height) + "px";
    planeEl.style.transform = "rotate(" + angle + "deg)";

    liveSpeedEl.textContent = speed.toFixed(1);
    if (statusEl.textContent !== status) { statusEl.textContent = status; }

    if (t < 1) {
      animFrame = requestAnimationFrame(frame);
    } else {
      stageEl.classList.remove("running");
    }
  }

  animFrame = requestAnimationFrame(frame);
}

function setMode(mode, play) {
  flightMode = mode;
  modeTakeoffBtn.classList.toggle("active", mode === "takeoff");
  modeLandingBtn.classList.toggle("active", mode === "landing");
  modeTakeoffBtn.setAttribute("aria-pressed", mode === "takeoff" ? "true" : "false");
  modeLandingBtn.setAttribute("aria-pressed", mode === "landing" ? "true" : "false");
  if (play) { playFlight(); }
}

function downloadCsv() {
  if (!lastResults) {
    showMessage("Please press Calculate Performance first.");
    return;
  }

  const lines = [];
  lines.push("Aircraft," + '"' + lastResults.name.replace(/"/g, '""') + '"');
  lines.push("Speed (m/s),Lift (N),Drag (N),L/D,Required CL,Note");

  lastResults.rows.forEach(function (row) {
    lines.push([
      row.speed.toFixed(2),
      row.lift.toFixed(2),
      row.drag.toFixed(2),
      row.ld.toFixed(3),
      row.requiredCL.toFixed(4),
      row.note
    ].join(","));
  });

  const csvText = lines.join("\r\n");
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "aircraft_performance.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resetAll() {
  customSaved = null;
  selectedId = null;
  selectAircraft(AIRCRAFT[0].id);

  startInput.value = DEFAULT_SPEEDS.start;
  endInput.value = DEFAULT_SPEEDS.end;
  stepInput.value = DEFAULT_SPEEDS.step;

  setMode("takeoff", false);
  hideMessage();
  clearResults();
}

function buildCards() {
  AIRCRAFT.forEach(function (plane) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.id = "card-" + plane.id;
    card.setAttribute("aria-pressed", "false");

    const imgBox = createAircraftImage(plane, "card-img");
    const label = document.createElement("span");
    label.className = "card-name";
    label.textContent = plane.name;

    card.appendChild(imgBox);
    card.appendChild(label);
    card.addEventListener("click", function () { selectAircraft(plane.id); });
    grid.appendChild(card);
  });
}

function buildCredits() {
  const list = document.getElementById("creditsList");
  AIRCRAFT.forEach(function (plane) {
    const li = document.createElement("li");

    if (plane.search) {
      const strong = document.createElement("strong");
      strong.textContent = plane.name + ": ";

      const link = document.createElement("a");
      link.href = "https://commons.wikimedia.org/w/index.php?search=" +
        encodeURIComponent(plane.search) + "&ns6=1";
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Wikimedia Commons photos";

      const note = document.createElement("span");
      note.textContent = " - " + (plane.credit || DEFAULT_CREDIT);

      li.appendChild(strong);
      li.appendChild(link);
      li.appendChild(note);
    } else {
      li.textContent = plane.name + ": illustration drawn for this project.";
    }
    list.appendChild(li);
  });
}

planeEl.innerHTML = animatedPlaneSvg();
buildCards();
buildCredits();
buildRanking();
resetAll();

form.addEventListener("submit", function (event) {
  event.preventDefault();
  calculate();
});
csvBtn.addEventListener("click", downloadCsv);
resetBtn.addEventListener("click", resetAll);
modeTakeoffBtn.addEventListener("click", function () { setMode("takeoff", true); });
modeLandingBtn.addEventListener("click", function () { setMode("landing", true); });
replayBtn.addEventListener("click", playFlight);
