let allCategoryPool = [];
let puzzle;
let tiles = [];
let selected = [];
let mistakes = 4;
let solvedGroups = [];

const shuffleArr = arr => [...arr].sort(() => Math.random() - 0.5);

// Colors for the solved rows based on difficulty level (1-4)
const difficultyColors = {
  0: "#f9df6d", // Yellow (Easiest)
  1: "#a0c35a", // Green
  2: "#b0c4ef", // Blue
  3: "#ba81c5"  // Purple (Hardest)
};

async function initGame() {
  if (allCategoryPool.length === 0) {
    try {
      const r = await fetch("connections.json");
      const data = await r.json();
      allCategoryPool = data.flatMap(day => day.groups);
    } catch (e) {
      console.error("Failed to load connections:", e);
    }
  }
  
  const shuffledGroups = shuffleArr(allCategoryPool);
  puzzle = { groups: shuffledGroups.slice(0, 4) };
  
  start();
}

function start() {
  mistakes = 4;
  selected = [];
  solvedGroups = [];
  document.getElementById("solved-container").innerHTML = "";
  updateDots();

  tiles = shuffleArr(
    puzzle.groups.flatMap(g =>
      g.words.map(w => ({ word: w, group: g.label }))
    )
  );

  render();
}

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  tiles.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "tile flip-in";
    div.textContent = item.word;

    if (item.word.length > 12) div.classList.add("tiny-text");
    else if (item.word.length > 8) div.classList.add("small-text");

    div.style.animationDelay = `${index * 0.03}s`;

    div.onclick = () => select(div, item);
    grid.appendChild(div);
  });
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("lost", i >= mistakes);
  });
}

function select(el, item) {
  if (el.classList.contains("flip-out") || el.classList.contains("wiggle")) return;

  if (el.classList.contains("selected")) {
    el.classList.remove("selected");
    selected = selected.filter(s => s.word !== item.word);
    return;
  }

  if (selected.length === 4) return;

  el.classList.add("selected");
  selected.push(item);

  if (selected.length === 4) {
    setTimeout(check, 400);
  }
}

function check() {
  const groups = selected.map(s => s.group);
  const unique = new Set(groups);
  const selectedEls = [...document.querySelectorAll(".tile.selected")];
  const dotsContainer = document.getElementById("dots");

  if (unique.size === 1) {
    // CORRECT MATCH
    selectedEls.forEach(el => {
      el.classList.remove("selected");
      el.classList.add("solved");
    });
    
    const matchedGroup = groups[0];
    tiles = tiles.filter(t => t.group !== matchedGroup);

    // Create the solved row (using the logic from previous steps)
    setTimeout(() => {
      createSolvedRow(matchedGroup, selected.map(s => s.word).join(", "));
      render();
      if (tiles.length === 0) setTimeout(() => handleEndState(true), 800);
    }, 200);

  } else {
    // WRONG MATCH
    const counts = {};
    groups.forEach(g => counts[g] = (counts[g] || 0) + 1);
    const oneAway = Object.values(counts).includes(3);

    if (oneAway && mistakes > 1) {
      // Show "One Away" alert in place of dots
      const originalContent = dotsContainer.innerHTML;
      dotsContainer.innerHTML = '<span class="one-away-text">One away...</span>';
      
      setTimeout(() => {
        dotsContainer.innerHTML = originalContent;
        updateDots(); // Restore the dots
      }, 1500);
    }

    // Trigger wiggle animation
    selectedEls.forEach(el => {
      el.classList.add("wiggle");
      setTimeout(() => {
        el.classList.remove("selected", "wiggle");
      }, 450);
    });

    mistakes--;
    updateDots();

    if (mistakes <= 0) {
      setTimeout(() => handleEndState(false), 800);
    }
  }
  selected = [];
}

function createSolvedRow(label, words) {
  const container = document.getElementById("solved-container");
  const row = document.createElement("div");
  row.className = "solved-row";
  
  // Assign color based on how many have already been solved
  const colorIndex = solvedGroups.length;
  row.style.backgroundColor = difficultyColors[colorIndex];
  solvedGroups.push(label);
  
  row.innerHTML = `
    <h3>${label}</h3>
    <p>${words}</p>
  `;
  container.appendChild(row);
}

function handleEndState(isWin) {
  const allTiles = document.querySelectorAll(".tile");
  const flashClass = isWin ? "success-flash" : "error-flash";

  // Flash cards color
  allTiles.forEach(tile => tile.classList.add(flashClass));

  setTimeout(() => {
    // Flip out all remaining cards
    allTiles.forEach((tile, i) => {
      tile.classList.remove("flip-in");
      tile.classList.add("flip-out");
      tile.style.animationDelay = `${i * 0.02}s`;
    });

    // Reset game after flip
    setTimeout(initGame, 1200);
  }, 1000);
}

// ---------- CONTROLS ----------
document.getElementById("shuffle").onclick = () => {
  const grid = document.getElementById("grid");
  grid.style.opacity = "0";
  
  setTimeout(() => {
    tiles = shuffleArr(tiles);
    render();
    grid.style.opacity = "1";
  }, 250);
};

document.getElementById("restart").onclick = () => {
  initGame();
};

initGame();