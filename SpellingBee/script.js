// Game Content: Each level provides a new set of letters
const levelData = [
  { center: "A", outer: ["B", "L", "I", "N", "G", "S"] },
  { center: "E", outer: ["P", "R", "O", "D", "U", "C"] },
  { center: "T", outer: ["M", "I", "N", "D", "F", "U"] },
  { center: "O", outer: ["W", "R", "I", "T", "E", "S"] },

  { center: "R", outer: ["E", "A", "C", "T", "O", "S"] },
  { center: "S", outer: ["T", "A", "R", "E", "D", "U"] },
  { center: "L", outer: ["E", "V", "E", "R", "S", "A"] },
  { center: "C", outer: ["O", "N", "N", "E", "C", "T"] },
  { center: "D", outer: ["E", "C", "I", "P", "H", "E"] },
  { center: "M", outer: ["E", "T", "A", "P", "H", "O"] },
  { center: "N", outer: ["E", "U", "R", "O", "S", "I"] },
  { center: "P", outer: ["A", "T", "T", "E", "R", "N"] },
  { center: "F", outer: ["L", "O", "W", "E", "R", "S"] },
  { center: "H", outer: ["A", "R", "M", "O", "N", "Y"] },
  { center: "K", outer: ["N", "O", "W", "L", "E", "D"] },
  { center: "B", outer: ["R", "A", "I", "N", "S", "T"] },
  { center: "G", outer: ["R", "I", "D", "S", "E", "T"] },
  { center: "I", outer: ["M", "A", "G", "E", "R", "Y"] },
  { center: "U", outer: ["N", "I", "Q", "U", "E", "S"] },
  { center: "V", outer: ["A", "L", "U", "E", "S", "T"] },
  { center: "Y", outer: ["E", "L", "L", "O", "W", "S"] },
  { center: "J", outer: ["U", "M", "B", "L", "E", "S"] },
  { center: "Q", outer: ["U", "I", "E", "T", "S", "A"] },
  { center: "X", outer: ["E", "N", "O", "N", "E", "R"] },
  { center: "Z", outer: ["E", "R", "O", "E", "S", "D"] },

  { center: "A", outer: ["B", "S", "T", "R", "A", "C"] },
  { center: "E", outer: ["N", "I", "G", "M", "A", "S"] },
  { center: "T", outer: ["H", "R", "E", "A", "D", "S"] },
  { center: "O", outer: ["B", "S", "C", "U", "R", "E"] },
  { center: "R", outer: ["I", "D", "D", "L", "E", "S"] },
  { center: "S", outer: ["Y", "M", "B", "O", "L", "S"] },
  { center: "L", outer: ["A", "Y", "E", "R", "E", "D"] },
  { center: "C", outer: ["O", "M", "P", "L", "E", "X"] },
  { center: "D", outer: ["E", "E", "P", "E", "N", "S"] },
  { center: "M", outer: ["E", "A", "N", "I", "N", "G"] },
  { center: "N", outer: ["E", "X", "U", "S", "E", "S"] },
  { center: "P", outer: ["U", "Z", "Z", "L", "E", "S"] },
  { center: "F", outer: ["O", "C", "U", "S", "E", "D"] },
  { center: "H", outer: ["I", "D", "D", "E", "N", "S"] },
  { center: "K", outer: ["E", "Y", "S", "T", "O", "N"] },
  { center: "B", outer: ["U", "I", "L", "D", "E", "R"] },
  { center: "G", outer: ["A", "M", "E", "P", "L", "A"] },
  { center: "I", outer: ["N", "S", "I", "G", "H", "T"] },
  { center: "U", outer: ["N", "K", "N", "O", "W", "N"] },
  { center: "V", outer: ["E", "I", "L", "E", "D", "S"] },
  { center: "Y", outer: ["E", "A", "R", "N", "E", "D"] },
  { center: "J", outer: ["U", "D", "G", "E", "M", "E"] },
  { center: "Q", outer: ["U", "E", "S", "T", "I", "O"] },
  { center: "X", outer: ["P", "L", "O", "R", "E", "S"] }
];


let currentLevelIndex = 0;
let centerLetter = levelData[currentLevelIndex].center;
let outerLetters = levelData[currentLevelIndex].outer;
let allowedLetters = [centerLetter, ...outerLetters];

let currentInput = "";
let score = 0;
let foundWords = [];
let nextLevelThreshold = 20;

function init() {
  updateHive();
  
  document.addEventListener("keydown", (e) => {
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      addLetter(e.key.toUpperCase());
    } else if (e.key === "Backspace") {
      currentInput = currentInput.slice(0, -1);
      updateDisplay();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  });
}

function updateHive() {
  const centerEl = document.getElementById("cell-center");
  centerEl.textContent = centerLetter;
  centerEl.classList.add("pop-in");
  centerEl.onclick = () => addLetter(centerLetter);

  outerLetters.forEach((l, i) => {
    const el = document.getElementById(`cell-${i}`);
    el.textContent = l;
    el.classList.add("pop-in");
    el.onclick = () => addLetter(l);
    // Remove class so it can be re-added for animation next level
    setTimeout(() => el.classList.remove("pop-in"), 300);
  });
  setTimeout(() => centerEl.classList.remove("pop-in"), 300);
  
  allowedLetters = [centerLetter, ...outerLetters];
}

function addLetter(l) {
  currentInput += l;
  updateDisplay();
}

function updateDisplay() {
  const display = document.getElementById("input-display");
  display.classList.remove("shake");
  
  display.innerHTML = currentInput.split('').map(char => {
    const upperChar = char.toUpperCase();
    if (upperChar === centerLetter) return `<span class="center-letter-highlight">${upperChar}</span>`;
    if (outerLetters.includes(upperChar)) return `<span>${upperChar}</span>`;
    return `<span class="invalid-letter">${upperChar}</span>`;
  }).join('');
}

function handleSubmit() {
  const word = currentInput.toUpperCase();
  const hasInvalid = word.split('').some(l => !allowedLetters.includes(l));

  if (hasInvalid) return triggerError("Bad letter");
  if (word.length < 4) return triggerError("Too short");
  if (!word.includes(centerLetter)) return triggerError("Missing center letter");
  if (foundWords.includes(word)) return triggerError("Already found");

  // Success
  foundWords.push(word);
  score += (word.length === 4) ? 1 : word.length;
  showToast(`+${word.length} points!`);
  
  checkLevelUp();
  updateUI();
  currentInput = "";
  updateDisplay();
}

function checkLevelUp() {
  if (score >= nextLevelThreshold && currentLevelIndex < levelData.length - 1) {
    currentLevelIndex++;
    centerLetter = levelData[currentLevelIndex].center;
    outerLetters = levelData[currentLevelIndex].outer;
    nextLevelThreshold += 20;
    
    showToast("LEVEL UP! NEW LETTERS!");
    updateHive();
    foundWords = []; // Reset words for new level
  }
}

function triggerError(msg) {
  const display = document.getElementById("input-display");
  display.classList.add("shake");
  showToast(msg);
  setTimeout(() => {
    currentInput = "";
    updateDisplay();
  }, 600);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function updateUI() {
  document.getElementById("current-score").textContent = score;
  const progress = (score % 20 / 20) * 100;
  document.getElementById("progress-fill").style.width = `${progress}%`;
}

init();