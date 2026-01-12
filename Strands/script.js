const puzzle = {
  theme: "IN THE KITCHEN",
  grid: [
    'S','P','A','T','U','L',
    'A','C','O','O','K','W',
    'U','C','E','P','A','A',
    'C','E','P','A','N','R',
    'E','P','O','T','S','E',
    'P','A','N','K','N','I',
    'B','O','A','R','D','F',
    'O','V','E','N','E','E'
  ],
  words: ["SPATULA", "SAUCEPAN", "POTS", "PAN", "KNIFE", "OVEN", "BOARD"],
  spangram: "COOKWARE",
  wordPaths: {
    "SPATULA": [0, 1, 2, 3, 4, 5],
    "COOKWARE": [7, 8, 9, 10, 11, 17, 23, 29],
    "SAUCEPAN": [6, 12, 18, 19, 13, 14, 20, 26],
    "POTS": [25, 31, 27, 21],
    "PAN": [30, 24, 15],
    "KNIFE": [33, 34, 35, 41, 47],
    "OVEN": [42, 43, 44, 45],
    "BOARD": [36, 37, 38, 39, 40]
  }
};

let selectedIndices = [];
let foundWords = [];
let isDragging = false;
let hintPoints = 0;

function init() {
  const gridEl = document.getElementById("grid");
  document.getElementById("theme-hint").textContent = puzzle.theme;
  
  gridEl.innerHTML = "";
  puzzle.grid.forEach((letter, i) => {
    const div = document.createElement("div");
    div.className = "letter-tile";
    div.innerHTML = `<span>${letter}</span>`;
    div.dataset.index = i;
    gridEl.appendChild(div);
  });

  window.addEventListener("pointerdown", e => {
    const tile = e.target.closest(".letter-tile");
    if (tile && !isTileUsed(tile)) {
      isDragging = true;
      selectedIndices = [parseInt(tile.dataset.index)];
      updateUI();
    }
  });

  window.addEventListener("pointermove", e => {
    if (!isDragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const tile = target?.closest(".letter-tile");
    if (!tile) return;

    const idx = parseInt(tile.dataset.index);
    if (selectedIndices.includes(idx) || isTileUsed(tile)) return;

    const lastIdx = selectedIndices[selectedIndices.length - 1];
    if (isNeighbor(lastIdx, idx)) {
      selectedIndices.push(idx);
      updateUI();
    }
  });

  window.addEventListener("pointerup", endSelection);
}

function isTileUsed(tile) {
  return tile.classList.contains("found") || tile.classList.contains("spangram");
}

function isNeighbor(i1, i2) {
  const r1 = Math.floor(i1 / 6), c1 = i1 % 6;
  const r2 = Math.floor(i2 / 6), c2 = i2 % 6;
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}

async function endSelection() {
  if (!isDragging) return;
  isDragging = false;
  
  const word = selectedIndices.map(i => puzzle.grid[i]).join("");

  // 1. Check if it's the Spangram or a Theme Word
  if (word === puzzle.spangram && !foundWords.includes(word)) {
    markFound("spangram");
    foundWords.push(word);
    showToast("SPANGRAM!");
  } else if (puzzle.words.includes(word) && !foundWords.includes(word)) {
    markFound("found");
    foundWords.push(word);
  } else if (word.length >= 4) {
    // 2. Not a theme word: Check if it's a REAL dictionary word for the hint meter
    const isValid = await checkDictionary(word);
    if (isValid) {
      hintPoints++;
      showToast(`Hint Meter: ${hintPoints}/3`);
      if (hintPoints >= 3) {
        hintPoints = 0;
        useHint();
      }
    } else {
      showToast("Not in word list");
    }
  }

  selectedIndices = [];
  updateUI();
}

async function checkDictionary(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return response.ok;
  } catch { return false; }
}

function useHint() {
  const remaining = puzzle.words.filter(w => !foundWords.includes(w));
  if (remaining.length === 0) return;

  const targetWord = remaining[0]; // Reveal the next unfound word
  const path = puzzle.wordPaths[targetWord];
  
  path.forEach(idx => {
    const tile = document.querySelector(`[data-index="${idx}"]`);
    tile.classList.add("hint-highlight");
    setTimeout(() => tile.classList.remove("hint-highlight"), 3000);
  });
  showToast("Hint revealed!");
}

function markFound(className) {
  selectedIndices.forEach(i => {
    const tile = document.querySelector(`[data-index="${i}"]`);
    tile.classList.add(className);
  });
}

function updateUI() {
  const tiles = document.querySelectorAll(".letter-tile");
  document.getElementById("active-word").textContent = selectedIndices.map(i => puzzle.grid[i]).join("");
  tiles.forEach((tile, i) => {
    tile.classList.toggle("selected", selectedIndices.includes(i));
  });
  document.getElementById("hint-fill").style.width = `${(hintPoints / 3) * 100}%`;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2000);
}

init();