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
let score = 0;
let levelScore = 0; // Tracks progress toward next level
let foundWords = [];
const XP_PER_LEVEL = 20;

let currentInput = "";
let centerLetter = levelData[currentLevelIndex].center;
let outerLetters = levelData[currentLevelIndex].outer;
let allowedLetters = [centerLetter, ...outerLetters];

/**
 * Initialization
 */
function init() {
  updateHive();
  updateUI();
  setupEventListeners();
}

function setupEventListeners() {
  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      addLetter(e.key.toUpperCase());
    } else if (e.key === "Backspace") {
      deleteLetter();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  });

  // Button support
  document.getElementById("submit").onclick = handleSubmit;
  document.getElementById("delete").onclick = deleteLetter;
  document.getElementById("shuffle-hive").onclick = shuffleHive;
}

/**
 * Game Logic
 */
function updateHive() {
  centerLetter = levelData[currentLevelIndex].center;
  outerLetters = [...levelData[currentLevelIndex].outer];
  allowedLetters = [centerLetter, ...outerLetters];

  const centerEl = document.getElementById("cell-center");
  centerEl.textContent = centerLetter;
  centerEl.onclick = () => addLetter(centerLetter);

  outerLetters.forEach((l, i) => {
    const el = document.getElementById(`cell-${i}`);
    el.textContent = l;
    el.onclick = () => addLetter(l);
  });
}

function addLetter(l) {
  currentInput += l;
  updateDisplay();
}

function deleteLetter() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function updateDisplay() {
  const display = document.getElementById("input-display");
  display.classList.remove("shake");
  
  display.innerHTML = currentInput.split('').map(char => {
    const upperChar = char.toUpperCase();
    if (upperChar === centerLetter) return `<span class="center-letter-highlight">${upperChar}</span>`;
    return `<span>${upperChar}</span>`;
  }).join('');
}

async function handleSubmit() {
  const word = currentInput.toUpperCase();

  // 1. Basic Rules Check
  if (word.length < 4) return triggerError("Too short");
  if (!word.includes(centerLetter)) return triggerError("Missing center letter");
  if (foundWords.includes(word)) return triggerError("Already found");
  
  // 2. Dictionary Check (Actual Word Validation)
  const isValid = await checkIsRealWord(word);
  if (!isValid) return triggerError("Not in word list");

  // 3. Success
  const points = (word.length === 4) ? 1 : word.length;
  processSuccess(word, points);
}

async function checkIsRealWord(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return response.ok; // If 200 OK, word exists. If 404, it doesn't.
  } catch (err) {
    // Fallback if API fails: allow words but log it (for offline development)
    console.warn("Dictionary API unavailable, allowing word.");
    return true; 
  }
}

function processSuccess(word, points) {
  foundWords.push(word);
  score += points;
  levelScore += points;
  
  renderFoundWords();
  showToast(`+${points} points!`);
  currentInput = "";
  updateDisplay();
  
  if (levelScore >= XP_PER_LEVEL) {
    levelUp();
  } else {
    updateUI();
  }
}

function levelUp() {
  if (currentLevelIndex < levelData.length - 1) {
    currentLevelIndex++;
    levelScore = 0;
    foundWords = []; // Clear for new level
    renderFoundWords();
    updateHive();
    showToast("LEVEL UP! NEW LETTERS!");
    updateUI();
  } else {
    showToast("Master! All levels complete!");
    updateUI();
  }
}

function updateUI() {
  document.getElementById("rank-name").textContent = `Level ${currentLevelIndex + 1}`;
  document.getElementById("current-score").textContent = score;
  
  const progress = Math.min((levelScore / XP_PER_LEVEL) * 100, 100);
  document.getElementById("progress-fill").style.width = `${progress}%`;
  
  const remaining = XP_PER_LEVEL - levelScore;
  document.getElementById("points-to-next").textContent = 
    remaining > 0 ? `${remaining} pts to Level ${currentLevelIndex + 2}` : "Max Level!";
}

function renderFoundWords() {
  const list = document.getElementById("found-words-list");
  const count = document.getElementById("word-count");
  
  list.innerHTML = foundWords.map(word => `<div class="word-card">${word}</div>`).join('');
  count.textContent = foundWords.length;
}

function triggerError(msg) {
  const display = document.getElementById("input-display");
  display.classList.add("shake");
  showToast(msg);
  setTimeout(() => {
    currentInput = "";
    updateDisplay();
  }, 500);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function shuffleHive() {
  outerLetters.sort(() => Math.random() - 0.5);
  updateHive();
}

init();