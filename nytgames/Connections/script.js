let puzzle;
let tiles = [];
let selected = [];

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

// ---------- LOAD PUZZLE ----------
fetch("connections.json")
  .then(r => r.json())
  .then(data => {
    puzzle = shuffle(data)[0];
    start();
  });

function start() {
  selected = [];
  document.getElementById("feedback").textContent = "";

  tiles = shuffle(
    puzzle.groups.flatMap(g =>
      g.words.map(w => ({ word: w, group: g.label }))
    )
  );

  render();
}

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  tiles.forEach(item => {
    const div = document.createElement("div");
    div.className = "tile";
    div.textContent = item.word;

    div.onclick = () => select(div, item);
    grid.appendChild(div);
  });
}

function select(el, item) {
  if (el.classList.contains("solved")) return;

  if (el.classList.contains("selected")) {
    el.classList.remove("selected");
    selected = selected.filter(s => s.word !== item.word);
    return;
  }

  if (selected.length === 4) return;

  el.classList.add("selected");
  selected.push(item);

  if (selected.length === 4) check();
}

function check() {
  const groups = selected.map(s => s.group);
  const unique = new Set(groups);

  const tilesEls = [...document.querySelectorAll(".tile.selected")];

  if (unique.size === 1) {
    tilesEls.forEach(el => {
      el.classList.remove("selected");
      el.classList.add("solved");
    });

    tiles = tiles.filter(t => t.group !== groups[0]);
    document.getElementById("feedback").textContent = "✔ " + groups[0];
  } else {
    const counts = {};
    groups.forEach(g => counts[g] = (counts[g] || 0) + 1);

    const oneAway = Object.values(counts).includes(3);

    document.getElementById("feedback").textContent =
      oneAway ? "One away…" : "Not a group";

    tilesEls.forEach(el => el.classList.remove("selected"));
  }

  selected = [];
}

// ---------- CONTROLS ----------
document.getElementById("shuffle").onclick = () => {
  tiles = shuffle(tiles);
  render();
};

document.getElementById("restart").onclick = () => {
  start();
};
