const names = [];

const input = document.getElementById("name-input");
const pool = document.getElementById("names-pool");
const drawBtn = document.getElementById("draw-btn");
const loadingRing = document.getElementById("loading-ring");
const winnerSection = document.getElementById("winner-section");
const winnerNameEl = document.getElementById("winner-name");
const winnerSubEl = document.getElementById("winner-sub");
const emptyHint = document.getElementById("empty-hint");
const loadingNames = document.getElementById("loading-names");
const errorMsg = document.getElementById("error-msg");
const countBar = document.getElementById("count-bar");
const shuffleList = document.getElementById("shuffle-list");

function setError(message) {
  errorMsg.textContent = message;
  input.classList.add("error");
  clearTimeout(input._t);
  input._t = setTimeout(() => {
    input.classList.remove("error");
    errorMsg.textContent = "";
  }, 2200);
}

function updateUI() {
  pool.innerHTML = "";
  names.forEach((name, index) => {
    const pill = document.createElement("div");
    pill.className = "name-pill";
    pill.innerHTML = `<span>${name}</span><button aria-label="Remove ${name}" onclick="removeName(${index})">×</button>`;
    pool.appendChild(pill);
  });

  const count = names.length;
  countBar.textContent = count === 0 ? "" : `${count} name${count !== 1 ? "s" : ""} added`;

  if (count < 2) {
    emptyHint.style.display = "block";
    emptyHint.textContent = count === 0
      ? "Add at least 2 names to start drawing."
      : "Add one more name to enable the draw.";
  } else {
    emptyHint.style.display = "none";
  }

  drawBtn.disabled = count < 2;
}

function addName() {
  const rawValue = input.value.trim();
  if (!rawValue) return;

  // Split by newlines (handles pasted multi-line lists)
  const lines = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  console.log({lines, rawValue})

  let addedCount = 0;
  let duplicates = [];

  lines.forEach((line) => {
    const isDuplicate = names.some(
      (name) => name.toLowerCase() === line.toLowerCase()
    ) || lines.filter((l) => l.toLowerCase() === line.toLowerCase()).indexOf(line) !==
       lines.findIndex((l) => l.toLowerCase() === line.toLowerCase());

    const alreadyExists = names.some((name) => name.toLowerCase() === line.toLowerCase());

    if (alreadyExists) {
      duplicates.push(line);
    } else {
      names.push(line);
      addedCount++;
    }
  });

  input.value = "";
  input.focus();
  winnerSection.style.display = "none";

  if (duplicates.length > 0) {
    setError(
      duplicates.length === 1
        ? `"${duplicates[0]}" is already in the list.`
        : `${duplicates.length} duplicate names were skipped.`
    );
  }

  updateUI();
}

function removeName(index) {
  names.splice(index, 1);
  winnerSection.style.display = "none";
  updateUI();
}

function shuffle(list) {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startDraw() {
  if (names.length < 2) return;

  drawBtn.disabled = true;
  winnerSection.style.display = "none";
  emptyHint.style.display = "none";
  loadingRing.style.display = "flex";

  const shuffled = shuffle(names);
  let index = 0;
  const interval = setInterval(() => {
    loadingNames.textContent = shuffled[index % shuffled.length];
    index += 1;
  }, 140);

  setTimeout(() => {
    clearInterval(interval);
    loadingRing.style.display = "none";

    const finalShuffled = shuffle(names);
    const winner = finalShuffled[0];

    winnerNameEl.textContent = winner;
    winnerSubEl.textContent = `Picked from ${names.length} names`;

    shuffleList.innerHTML = "";
    finalShuffled.forEach((name, position) => {
      const row = document.createElement("div");
      row.className = `shuffle-row${position === 0 ? " picked" : ""}`;
      row.innerHTML = `<span class="shuffle-num">${position + 1}</span><span class="shuffle-name">${name}</span>${position === 0 ? '<span class="winner-badge">Selected</span>' : ""}`;
      shuffleList.appendChild(row);
    });

    winnerSection.style.display = "block";
    drawBtn.disabled = false;
  }, 3000);
}

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addName();
});

// Auto-resize as user types/pastes
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

// Submit on Enter, but allow Shift+Enter for new line
input.addEventListener("keydown", (e) => {
  console.log('yesss')
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addName();
    input.style.height = "auto"; // reset height after clearing
  }
});

window.addName = addName;
window.removeName = removeName;
window.startDraw = startDraw;

updateUI();
