const puzzleData = {
  cells: [
    { id: 0, region: 'sum', target: 5 }, { id: 1, region: 'sum', target: 5 },
    { id: 2, region: 'equal', target: '=' }, { id: 3, region: 'equal', target: '=' },
    { id: 4, region: 'diff', target: '≠' }, { id: 5, region: 'diff', target: '≠' },
    { id: 6, region: 'sum', target: 3 }, { id: 7, region: 'sum', target: 3 }
  ],
  dominoes: [[2, 3], [4, 4], [0, 3], [1, 2]]
};

let boardState = Array(8).fill(null);

function init() {
  const grid = document.getElementById('grid-container');
  puzzleData.cells.forEach(cell => {
    const div = document.createElement('div');
    div.className = `cell region-${cell.region}`;
    div.dataset.rule = cell.target;
    div.id = `cell-${cell.id}`;
    grid.appendChild(div);
  });

  const tray = document.getElementById('domino-tray');
  puzzleData.dominoes.forEach((pair, idx) => {
    const domino = document.createElement('div');
    domino.className = 'domino-piece';
    domino.innerHTML = `
      <div class="domino-half">${pair[0]}</div>
      <div class="domino-half">${pair[1]}</div>
    `;
    domino.onclick = () => rotateDomino(domino); // Tap to rotate
    tray.appendChild(domino);
  });
}

function rotateDomino(el) {
  const isVertical = el.style.flexDirection === 'column';
  el.style.flexDirection = isVertical ? 'row' : 'column';
}

function checkPuzzle() {
  // Logic to verify:
  // 1. All cells in 'sum' region add to target
  // 2. All cells in 'equal' region have same value
  // 3. All cells in 'diff' region have unique values
  alert("Validation logic: Ensure all regions satisfy the symbols in the corners!");
}

init();