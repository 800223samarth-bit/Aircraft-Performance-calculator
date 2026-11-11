// =====================================================
// Aircraft Performance Calculator - script.js
// Educational demonstration only.
// =====================================================

// ---------- Constants ----------
const GRAVITY = 9.81;      // m/s²
const CL_FIXED = 0.5;      // fixed lift coefficient for the lift/drag table
const MAX_ROWS = 200;      // maximum table rows (protects the page from freezing)
const GROUND_PX = 31;      // height of the runway surface in the animation (pixels)
const FLIGHT_MS = 6000;    // how long the flight animation lasts (milliseconds)

// Default speed range
const DEFAULT_SPEEDS = { start: "60", end: "120", step: "10" };

// Text shown in the credits until you write the real author and licence
const DEFAULT_CREDIT = "Photo credit: write the author, licence and file link here once you have chosen your picture.";

// ---------- Aircraft data ----------
// id        = also the picture file name: images/<id>.jpg (or .jpeg, .png, .webp)
// photoFile = backup photo name on Wikimedia Commons (may need correcting)
// color     = neon colour used for the drawn illustration
// credit    = your own credit text (author, licence, link) for the picture
const AIRCRAFT = [
  { id: "a380",   name: "Airbus A380-800",  mass_kg: 575000, wing_area_m2: 845,   rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#00f0ff", photoFile: "Airbus A380 blue sky.jpg",                    search: "Airbus A380-800",  credit: "" },
  { id: "a350k",  name: "Airbus A350-1000", mass_kg: 322000, wing_area_m2: 443,   rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#39ff88", photoFile: "Airbus A350-1000 first flight.jpg",           search: "Airbus A350-1000", credit: "" },
  { id: "a350f",  name: "Airbus A350F",     mass_kg: 319000, wing_area_m2: 443,   rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#ffb800", photoFile: "Airbus A350F.jpg",                            search: "Airbus A350F",     credit: "" },
  { id: "a320",   name: "Airbus A320",      mass_kg: 78000,  wing_area_m2: 122.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#ff2bd6", photoFile: "Airbus A320-200 in flight.jpg",               search: "Airbus A320",      credit: "" },
  { id: "a321",   name: "Airbus A321",      mass_kg: 93500,  wing_area_m2: 122.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#8c9bff", photoFile: "Airbus A321-200 in flight.jpg",               search: "Airbus A321",      credit: "" },
  { id: "b787",   name: "Boeing 787-9",     mass_kg: 254000, wing_area_m2: 325,   rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#4dd2ff", photoFile: "Boeing 787-9 Dreamliner in flight.jpg",       search: "Boeing 787-9",     credit: "" },
  { id: "b747",   name: "Boeing 747-8",     mass_kg: 447700, wing_area_m2: 554,   rho: 1.225, cd0: 0.020, k: 0.045, clmax: 1.5,
    color: "#ff6a3d", photoFile: "Boeing 747-8 Intercontinental in flight.jpg", search: "Boeing 747-8",     credit: "" },
  { id: "b737",   name: "Boeing 737-800",   mass_kg: 79000,  wing_area_m2: 124.6, rho: 1.225, cd0: 0.025, k: 0.045, clmax: 1.5,
    color: "#39ff88", photoFile: "Boeing 737-800 in flight.jpg",                search: "Boeing 737-800",   credit: "" },
  { id: "beluga", name: "Airbus BelugaXL",  mass_kg: 227000, wing_area_m2: 361.6, rho: 1.225, cd0: 0.030, k: 0.050, clmax: 1.5,
    color: "#00f0ff", photoFile: "Airbus BelugaXL in flight.jpg",               search: "Airbus BelugaXL",  credit: "" },
  { id: "custom", name: "Custom aircraft",  mass_kg: 1100,   wing_area_m2: 16.2,  rho: 1.225, cd0: 0.030, k: 0.045, clmax: 1.5,
    color: "#ff2bd6", photoFile: "",                                            search: "",                 credit: "" }
];

// ---------- Page elements ----------
const grid         = document.getElementById("aircraftGrid");
const selectedName = document.getElementById("selectedName");
const paramHint    = document.getElementById("paramHint");
const form         = document.getElementById("calcForm");
const csvBtn       = document.getElementById("csvBtn");
const resetBtn     = document.getElementById("resetBtn");
const messageBox   = document.getElementById("messageBox");
const resultsPanel = document.getElementById("resultsPanel");
const resultsBody  = document.getElementById("resultsBody");

// Flight animation elements
const stageEl         = document.getElementById("stage");
const planeEl         = document.getElementById("plane");
const liveSpeedEl     = document.getElementById("liveSpeed");
const statusEl        = document.getElementById("flightStatus");
const modeTakeoffBtn  = document.getElementById("modeTakeoff");
const modeLandingBtn  = document.getElementById("modeLanding");
const replayBtn       = document.getElementById("replayBtn");

// Parameter inputs (matched to the keys in the data)
const paramInputs = {
  mass_kg:      document.getElementById("mass"),
  wing_area_m2: document.getElementById("area"),
  rho:          document.getElementById("rho"),
  cd0:          document.getElementById("cd0"),
  k:            document.getElementById("k"),
  clmax:        document.getElementById("clmax")
};

// Speed inputs
const startInput = document.getElementById("startSpeed");
const endInput   = document.getElementById("endSpeed");
const stepInput  = document.getElementById("stepSpeed");

// ---------- State ----------
let selectedId = null;     // which aircraft is selected
let customSaved = null;    // remembers what the user typed for Custom aircraft
let lastResults = null;    // data used for the CSV download
let flightMode = "takeoff"; // "takeoff" or "landing"
let flightInfo = null;     // { start, end, stall } used by the animation
let animFrame = null;      // id of the running animation frame

// ---------- Drawings (made in code, no image file needed) ----------
// Side view of a passenger jet, facing right (drawing box is 140 x 50)
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

// The plane used in the flight animation (with wheels)
function animatedPlaneSvg() {
  return '<svg viewBox="0 0 140 50" aria-hidden="true">' +
    planeGroup("#00f0ff") +
    '<circle cx="36" cy="40" r="3.5" fill="#00f0ff"/>' +
    '<circle cx="104" cy="40" r="3.5" fill="#00f0ff"/>' +
    '</svg>';
}

// Neon illustration shown on a card when no picture can be loaded
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

// ---------- Picture loading ----------
// Order tried: your own file in the images folder, then Wikimedia, then the drawing
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

function loadPicture(plane, imgBox) {
  const sources = imageSources(plane);
  let index = 0;

  const img = document.createElement("img");
  img.alt = plane.name;

  // If this source fails, try the next one. If all fail, show the drawing.
  img.onerror = function () {
    index++;
    if (index < sources.length) {
      img.src = sources[index];
    } else {
      imgBox.innerHTML = cardIllustration(plane);
    }
  };

  img.src = sources[0];
  imgBox.appendChild(img);
}

// ---------- Build the aircraft picture cards ----------
function buildCards() {
  AIRCRAFT.forEach(function (plane) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.id = "card-" + plane.id;
    card.setAttribute("aria-pressed", "false");

    const imgBox = document.createElement("div");
    imgBox.className = "card-img";
    loadPicture(plane, imgBox);

    const label = document.createElement("span");
    label.className = "card-name";
    label.textContent = plane.name;

    card.appendChild(imgBox);
    card.appendChild(label);
    card.addEventListener("click", function () { selectAircraft(plane.id); });
    grid.appendChild(card);
  });
}

// ---------- Build the credits list ----------
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

// ---------- Helpers ----------
function findAircraft(id) {
  return AIRCRAFT.find(function (p) { return p.id === id; });
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
  cancelAnimationFrame(animFrame);      // stop any running animation
  stageEl.classList.remove("running");
  flightInfo = null;
  resultsPanel.hidden = true;
  resultsBody.innerHTML = "";
  csvBtn.disabled = true;
  lastResults = null;
}

// Put the six aircraft values into the input boxes
function fillParams(values) {
  Object.keys(paramInputs).forEach(function (key) {
    paramInputs[key].value = String(values[key]);
  });
}

// Read the six boxes as plain text (used to remember Custom values)
function readParamText() {
  const copy = {};
  Object.keys(paramInputs).forEach(function (key) {
    copy[key] = paramInputs[key].value;
  });
  return copy;
}

// ---------- Select an aircraft ----------
function selectAircraft(id) {
  // If we are leaving "custom", remember what the user typed
  if (selectedId === "custom") {
    customSaved = readParamText();
  }

  selectedId = id;
  const plane = findAircraft(id);

  // Highlight the chosen card
  AIRCRAFT.forEach(function (p) {
    const card = document.getElementById("card-" + p.id);
    const isSelected = (p.id === id);
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  selectedName.textContent = plane.name;

  // Custom aircraft can be edited, the others are locked
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

  hideMessage();
  clearResults();   // old results belong to the previous aircraft
}

// ---------- Read and validate one number ----------
// Returns { value: number } or { error: "message" }
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

// ---------- Main calculation ----------
function calculate() {
  hideMessage();
  clearResults();

  if (!selectedId) {
    showMessage("Please click an aircraft picture first.");
    return;
  }

  const plane = findAircraft(selectedId);
  const errors = [];

  // Helper: read a number and collect any error
  function get(inputEl, label) {
    const result = readNumber(inputEl, label);
    if (result.error) { errors.push(result.error); return NaN; }
    return result.value;
  }

  const mass  = get(paramInputs.mass_kg,      "Mass (kg)");
  const area  = get(paramInputs.wing_area_m2, "Wing area (m²)");
  const rho   = get(paramInputs.rho,          "Air density (kg/m³)");
  const cd0   = get(paramInputs.cd0,          "CD0");
  const k     = get(paramInputs.k,            "k");
  const clmax = get(paramInputs.clmax,        "CLmax");
  const start = get(startInput,               "Starting speed (m/s)");
  const end   = get(endInput,                 "Ending speed (m/s)");
  const step  = get(stepInput,                "Speed interval (m/s)");

  if (errors.length > 0) {
    showMessage("Please fix the following:<ul><li>" + errors.join("</li><li>") + "</li></ul>");
    return;
  }

  if (end <= start) {
    showMessage("The ending speed must be larger than the starting speed.");
    return;
  }

  // How many rows would this create?
  const rowCount = Math.floor((end - start) / step + 1e-9) + 1;
  if (rowCount > MAX_ROWS) {
    showMessage("That range would make " + rowCount + " rows. The maximum is " + MAX_ROWS +
                ". Please use a larger interval or a smaller speed range.");
    return;
  }

  // ----- Basic aircraft numbers -----
  const weight = mass * GRAVITY;                                  // N
  const stallMs = Math.sqrt((2 * weight) / (rho * area * clmax)); // m/s
  const stallKmh = stallMs * 3.6;                                 // km/h
  const cdFixed = cd0 + k * CL_FIXED * CL_FIXED;
  const ldFixed = cdFixed > 0 ? CL_FIXED / cdFixed : 0;

  // ----- Table rows -----
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const speed = Math.round((start + i * step) * 1e6) / 1e6;
    const q = 0.5 * rho * speed * speed;           // dynamic pressure (Pa)
    const qS = q * area;                           // q × wing area

    const lift = qS * CL_FIXED;
    const drag = qS * cdFixed;
    const ld = drag > 0 ? lift / drag : 0;         // avoid dividing by zero
    const requiredCL = qS > 0 ? weight / qS : 0;   // avoid dividing by zero

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

  // Information the flight animation needs
  flightInfo = { start: start, end: end, stall: stallMs };

  showResults(plane.name, weight, stallMs, stallKmh, cdFixed, ldFixed, rows);
}

// ---------- Show results on the page ----------
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
  document.getElementById("outFixed").textContent =
    CL_FIXED + " / " + formatNum(cdFixed, 4) + " / " + formatNum(ldFixed, 2);

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

  resultsPanel.hidden = false;   // must be visible before the animation measures sizes
  csvBtn.disabled = false;
  playFlight();
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Flight animation ----------
// Take-off: speed rises from the starting to the ending speed.
//           The plane lifts off only once the speed passes the stall speed.
// Landing:  speed falls from the ending to the starting speed and the plane touches down.
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
    // t goes from 0 (start) to 1 (finish)
    const t = reduceMotion ? 1 : Math.min(1, (now - startTime) / FLIGHT_MS);
    let speed, height, angle, status;

    if (flightMode === "takeoff") {
      speed = start + (end - start) * t;

      // "a" is how far into the climb we are (0 = on the runway, 1 = highest point)
      const liftStart = Math.max(stall, start);
      let a = 0;
      if (end > liftStart) {
        a = (speed - liftStart) / (end - liftStart);
      }
      a = Math.min(1, Math.max(0, a));

      height = a * climbHeight;
      angle = -Math.min(1, a * 5) * 14;      // nose up when climbing

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
      const touchdown = 0.6;                 // plane lands 60% of the way through

      height = t < touchdown ? climbHeight * (1 - t / touchdown) : 0;
      if (t < touchdown - 0.1) {
        angle = 6;                           // nose slightly down on approach
      } else if (t < touchdown) {
        angle = -4;                          // nose up just before touchdown
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

    // Move the plane across the stage
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

// Switch between take-off and landing (play = true starts the animation)
function setMode(mode, play) {
  flightMode = mode;
  modeTakeoffBtn.classList.toggle("active", mode === "takeoff");
  modeLandingBtn.classList.toggle("active", mode === "landing");
  modeTakeoffBtn.setAttribute("aria-pressed", mode === "takeoff" ? "true" : "false");
  modeLandingBtn.setAttribute("aria-pressed", mode === "landing" ? "true" : "false");
  if (play) { playFlight(); }
}

// ---------- Download CSV ----------
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

// ---------- Reset ----------
function resetAll() {
  customSaved = null;               // forget edited custom values
  selectedId = null;                // so selectAircraft does not save them again
  selectAircraft(AIRCRAFT[0].id);   // back to the first aircraft with default values

  startInput.value = DEFAULT_SPEEDS.start;
  endInput.value = DEFAULT_SPEEDS.end;
  stepInput.value = DEFAULT_SPEEDS.step;

  setMode("takeoff", false);
  hideMessage();
  clearResults();
}

// ---------- Start the page ----------
planeEl.innerHTML = animatedPlaneSvg();
buildCards();
buildCredits();
resetAll();

form.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading
  calculate();
});
csvBtn.addEventListener("click", downloadCsv);
resetBtn.addEventListener("click", resetAll);
modeTakeoffBtn.addEventListener("click", function () { setMode("takeoff", true); });
modeLandingBtn.addEventListener("click", function () { setMode("landing", true); });
replayBtn.addEventListener("click", playFlight);