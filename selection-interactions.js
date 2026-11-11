/* Selection behavior: preview on hover/focus, commit only after click/keyboard activation. */
(function () {
  const originalSelectAircraft = window.selectAircraft;
  const originalResetAll = window.resetAll;
  const grid = document.getElementById("aircraftGrid");
  const summary = document.getElementById("selectedAircraftSummary");
  const selectedName = document.getElementById("selectedName");
  const paramHint = document.getElementById("paramHint");
  const messageBox = document.getElementById("messageBox");
  const resultsPanel = document.getElementById("resultsPanel");
  const csvBtn = document.getElementById("csvBtn");
  const paramIds = ["mass", "area", "rho", "cd0", "k", "clmax"];

  function setPreview(card) {
    if (!card) return;
    const id = card.id.replace("card-", "");
    const profile = window.aircraftVideoProfiles && window.aircraftVideoProfiles[id];
    if (!profile) return;
    const frame = document.getElementById("aircraftVideo");
    const caption = document.getElementById("videoCaption");
    const src = "https://www.youtube-nocookie.com/embed/" + profile.id +
      "?autoplay=1&mute=1&loop=1&playlist=" + profile.id + "&controls=0&playsinline=1&rel=0";
    if (frame && frame.src !== src) frame.src = src;
    if (caption) caption.textContent = profile.caption + " · Preview";
  }

  function clearSelection() {
    window.selectedId = null;
    if (selectedName) selectedName.textContent = "None";
    if (grid) {
      grid.querySelectorAll(".card").forEach(function (card) {
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
      });
    }
    if (summary) {
      summary.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "profile-empty";
      empty.innerHTML = "<div><strong>No aircraft selected</strong><span>Hover or focus a card to preview its flight film. Select an aircraft to view its profile and calculate the demonstration report.</span></div>";
      summary.appendChild(empty);
    }
    paramIds.forEach(function (id) {
      const input = document.getElementById(id);
      if (input) {
        input.value = "";
        input.disabled = true;
      }
    });
    if (paramHint) paramHint.textContent = "Choose an aircraft card to load its demonstration values.";
    if (resultsPanel) resultsPanel.hidden = true;
    if (csvBtn) csvBtn.disabled = true;
    if (messageBox) {
      messageBox.hidden = true;
      messageBox.textContent = "";
    }
  }

  if (typeof originalSelectAircraft === "function") {
    window.selectAircraft = function (id) {
      originalSelectAircraft(id);
      if (typeof window.updateSelectedAircraftSummary === "function") {
        window.updateSelectedAircraftSummary();
      }
      const card = document.getElementById("card-" + id);
      if (card) setPreview(card);
    };
  }

  if (grid) {
    grid.addEventListener("pointerover", function (event) {
      const card = event.target.closest(".card");
      if (card && grid.contains(card)) setPreview(card);
    });
    grid.addEventListener("focusin", function (event) {
      const card = event.target.closest(".card");
      if (card && grid.contains(card)) setPreview(card);
    });
  }

  // Existing Reset listener was registered by script.js; capture this click so reset
  // restores default speed values without silently selecting an aircraft.
  const resetButton = document.getElementById("resetBtn");
  if (resetButton) {
    resetButton.addEventListener("click", function (event) {
      event.stopImmediatePropagation();
      if (typeof originalResetAll === "function") originalResetAll();
      document.getElementById("startSpeed").value = "60";
      document.getElementById("endSpeed").value = "120";
      document.getElementById("stepSpeed").value = "10";
      clearSelection();
    }, true);
  }

  // The legacy initializer selects the first aircraft. Clear that selection after
  // the app's initial setup while preserving the original default speed range.
  clearSelection();
})();
