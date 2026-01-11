// Game Content: Each level provides a new set of letters
const levelData = [
  { center: "A", outer: ["B", "L", "I", "N", "G", "S"] },
  { center: "E", outer: ["P", "R", "O", "D", "U", "C"] },
  { center: "T", outer: ["M", "I", "N", "D", "F", "U"] },
  { center: "O", outer: ["W", "R", "I", "T", "E", "S"] }
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