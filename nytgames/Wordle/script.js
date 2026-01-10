
document.addEventListener('DOMContentLoaded', () => {
    const inputs = Array.from(document.querySelectorAll('.row input'));
    const mainRow = document.querySelector('.row');
    if (mainRow) {
      const parent = mainRow.parentNode;
      if (!parent.classList || !parent.classList.contains('game')) {
        const gameWrap = document.createElement('div');
        gameWrap.className = 'game';
        parent.insertBefore(gameWrap, mainRow);
        gameWrap.appendChild(mainRow);

        // create history container above the main row
          const history = document.createElement('div');
          history.className = 'history';
          gameWrap.insertBefore(history, mainRow);
        // create separate gradient overlay element (higher than history)
        // initialize overflow state and game positioning
        updateHistoryOverflow(history);
        updateGameHistoryState();
      } else {
        // ensure history exists when .game already present
        if (!parent.querySelector('.history')) {
          const history = document.createElement('div');
          history.className = 'history';
          parent.insertBefore(history, mainRow);
          // ensure gradient exists
          updateHistoryOverflow(history);
          updateGameHistoryState();
        }
      }
    }
	if (!inputs.length) return;

	inputs.forEach((input, idx) => {
		input.maxLength = 1;
		input.autocomplete = 'off';
		input.inputMode = 'text';

		input.addEventListener('input', (e) => {
			const value = input.value || '';
			// keep only first character
			input.value = value.charAt(0);

			if (input.value.length) {
				const next = inputs[idx + 1];
				if (next) next.focus();
			}
		});

		input.addEventListener('keydown', (e) => {
			const key = e.key;
			if (key === 'Backspace') {
				if (!input.value) {
					const prev = inputs[idx - 1];
					if (prev) {
						e.preventDefault();
						prev.focus();
						prev.value = '';
					}
				}
			} else if (key === 'ArrowLeft') {
				const prev = inputs[idx - 1];
				if (prev) {
					e.preventDefault();
					prev.focus();
				}
			} else if (key === 'ArrowRight') {
				const next = inputs[idx + 1];
				if (next) {
					e.preventDefault();
					next.focus();
				}
			}
		});

		input.addEventListener('paste', (e) => {
			e.preventDefault();
			const paste = (e.clipboardData || window.clipboardData).getData('text');
			if (!paste) return;
			// distribute pasted text across inputs starting at current
			for (let i = 0; i < paste.length && idx + i < inputs.length; i++) {
				inputs[idx + i].value = paste.charAt(i);
			}
			const focusIndex = Math.min(inputs.length - 1, idx + paste.length);
			inputs[focusIndex] && inputs[focusIndex].focus();
		});
	});

  // focus first input for convenience
  inputs[0].focus();

  // --- Wordle logic ---
  const WORD_LIST = [
  "abide","about","above","abuse","actor","acute","admit","adopt","adult",
  "after","again","agent","agree","ahead","alarm","album","alert","alike",
  "alive","allow","alone","along","alter","among","anger","angle","angry",
  "apart","apply","arena","argue","arise","array","aside","asset","audio",
  "avoid","award","aware",

  "bacon","badge","badly","baker","bases","basic","beach","began","begin",
  "begun","being","below","bench","billy","birth","black","blame","blind",
  "block","blood","board","boost","booth","bound","brain","brand","bread",
  "break","breed","brief","bring","broad","brown","build","built","buyer",

  "cable","calif","carry","catch","cause","chain","chair","chart","chase",
  "cheap","check","chest","chief","child","china","chose","civil","claim",
  "class","clean","clear","click","clock","close","coach","coast","could",
  "count","court","cover","craft","crash","cream","crime","cross","crowd",

  "daily","dance","dated","dealt","death","debut","delay","depth","doing",
  "doubt","dozen","draft","drama","drawn","dream","dress","drill","drink",
  "drive","drove","dying",

  "eager","early","earth","eight","elite","empty","enemy","enjoy","enter",
  "equal","error","event","every","exact","exist","extra",

  "faith","false","fault","fiber","field","fifth","fifty","fight","final",
  "first","fixed","flash","fleet","floor","fluid","focus","force","forth",
  "forty","forum","found","frame","fresh","front","fruit","fully","funny",

  "giant","given","glass","globe","going","grace","grade","grand","grant",
  "grass","great","green","gross","group","grown","guard","guess","guest",

  "happy","harry","heart","heavy","hence","honor","horse","hotel","house",
  "human","humor","ideal","image","index","inner","input","issue",

  "joint","judge","known",

  "label","labor","large","laser","later","laugh","layer","learn","least",
  "leave","legal","level","light","limit","local","logic","loose","lower",
  "lucky","lunch",

  "magic","major","maker","march","match","maybe","mayor","media","metal",
  "might","minor","model","money","month","moral","motor","mount","mouse",
  "mouth","movie","music",

  "never","night","noise","north","novel","nurse",

  "occur","ocean","offer","often","order","other","ought",

  "paint","panel","paper","party","peace","phase","phone","photo","piece",
  "pilot","pitch","place","plain","plane","plant","plate","point","pound",
  "power","press","price","pride","prime","print","prior","prize","proof",
  "proud","prove",

  "queen","quick","quiet","quite",

  "radio","raise","range","rapid","ratio","reach","ready","refer","right",
  "rival","river","rough","round","route","royal","rural",

  "scale","scene","scope","score","serve","seven","shall","shape","share",
  "sharp","sheet","shelf","shell","shift","shirt","shock","shoot","short",
  "shown","sight","since","sixth","sixty","sized","skill","sleep","slide",
  "small","smart","smile","solid","solve","sorry","sound","south","space",
  "spare","speak","speed","spend","spent","split","spoke","sport","staff",
  "stage","stand","start","state","steam","steel","stick","still","stock",
  "stone","stood","store","storm","story","strip","stuck","study","stuff",
  "style","sugar","suite","super","sweet",

  "table","taken","taste","teach","teeth","thank","their","theme","there",
  "these","thick","thing","think","third","those","three","throw","tight",
  "times","tired","title","today","topic","total","touch","tough","tower",
  "track","trade","train","treat","trend","trial","tried","trust","truth",

  "under","union","unity","until","upper","upset","urban","usage","usual",

  "valid","value","video","virus","visit","vital","voice",

  "waste","watch","water","wheel","where","which","while","white","whole",
  "whose","woman","women","world","worry","worse","worst","worth","would",
  "wound","write","wrong",

  "yield","young","youth"
];


  let target = pickWord();
  let guessCount = 0;

  function pickWord() {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toLowerCase();
  }

  function evaluateGuess(guess, answer) {
    guess = guess.toLowerCase();
    answer = answer.toLowerCase();
    const result = Array(guess.length).fill('absent');
    const remaining = {};

    for (let i = 0; i < answer.length; i++) {
      const ch = answer[i];
      remaining[ch] = (remaining[ch] || 0) + 1;
    }

    // first pass: correct
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === answer[i]) {
        result[i] = 'correct';
        remaining[guess[i]] -= 1;
      }
    }

    // second pass: present
    for (let i = 0; i < guess.length; i++) {
      if (result[i] === 'correct') continue;
      const ch = guess[i];
      if (remaining[ch] > 0) {
        result[i] = 'present';
        remaining[ch] -= 1;
      }
    }

    return result;
  }

  function colorInputs(statuses) {
    statuses.forEach((s, i) => {
      const inp = inputs[i];
      inp.classList.remove('correct', 'present', 'absent');
      inp.classList.add(s);
      // trigger reveal animation
      inp.classList.add('reveal');
      // remove reveal after animation
      setTimeout(() => inp.classList.remove('reveal'), 650);
    });
  }

  function clearInputs() {
    inputs.forEach(i => {
      i.value = '';
      i.classList.remove('correct', 'present', 'absent');
    });
  }

  // append a new previous-guess row into the history container (stacked above input row)
  function createPreviousRow(guess, statuses) {
    const row = document.createElement('div');
    row.className = 'previous-row';

    for (let i = 0; i < guess.length; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile ' + statuses[i];
      tile.textContent = guess[i].toUpperCase();
      // stagger pop animation per tile
      tile.style.animationDelay = (i * 90) + 'ms';
      tile.classList.add('pop');
      row.appendChild(tile);
    }

    const history = document.querySelector('.history');
    if (history) {
      // append so newest guesses are at the bottom (closest to the input)
      history.appendChild(row);
      // animate row entrance
      requestAnimationFrame(() => row.classList.add('enter'));
      // keep view scrolled to bottom to show most recent guess
      history.scrollTop = history.scrollHeight;
      updateHistoryOverflow(history);
      updateGameHistoryState();
    } else {
      const mainRow = document.querySelector('.row');
      const container = mainRow && mainRow.parentNode ? mainRow.parentNode : document.body;
      container.insertBefore(row, mainRow);
    }
  }

  function updateGameHistoryState() {
    const game = document.querySelector('.game');
    const history = document.querySelector('.history');
    if (!game || !history) return;
    if (history.children.length > 0) {
      game.classList.add('has-history');
    } else {
      game.classList.remove('has-history');
    }
  }

  // create restart button under the game if missing
  function createRestartButton() {
    const existing = document.querySelector('.restart-container');
    if (existing) {
      attachRestartHandler(existing);
      return;
    }
    const game = document.querySelector('.game') || document.body;
    const container = document.createElement('div');
    container.className = 'restart-container';

    const btn = document.createElement('button');
    btn.className = 'restart-button';
    btn.setAttribute('aria-label', 'Restart game');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 12a9 9 0 10-2.37 5.75" stroke="#123" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 3v6h-6" stroke="#123" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Restart</span>
    `;

    btn.addEventListener('click', (e) => {
      // spin icon briefly
      const svg = btn.querySelector('svg');
      if (svg) svg.classList.add('spin');
      // call reset
      resetGame();
      // remove spin after animation
      setTimeout(() => { if (svg) svg.classList.remove('spin'); }, 650);
    });

    container.appendChild(btn);
    // insert after the .game element
    const parent = game.parentNode || document.body;
    if (game.nextSibling) parent.insertBefore(container, game.nextSibling);
    else parent.appendChild(container);
  }

  // attach click handler to restart button inside a container or existing HTML
  function attachRestartHandler(containerEl) {
    const container = containerEl || document.querySelector('.restart-container');
    if (!container) return;
    const btn = container.querySelector('.restart-button');
    if (!btn) return;
    // avoid double-binding
    if (btn._hasRestartHandler) return;
    btn._hasRestartHandler = true;
    btn.addEventListener('click', (e) => {
      const svg = btn.querySelector('svg');
      if (svg) svg.classList.add('spin');
      resetGame();
      setTimeout(() => { if (svg) svg.classList.remove('spin'); }, 650);
    });
  }

  function updateHistoryOverflow(historyEl) {
    if (!historyEl) return;
    if (historyEl.scrollHeight > historyEl.clientHeight) {
      historyEl.classList.add('has-overflow');
      // gradient overlay removed; no action required
    } else {
      historyEl.classList.remove('has-overflow');
      // gradient overlay removed; no action required
    }
  }

  // reset the game state and clear history
  function resetGame() {
    target = pickWord();
    clearInputs();
    inputs[0].focus();
    const history = document.querySelector('.history');
    if (history) {
      history.innerHTML = '';
      history.classList.remove('has-overflow');
    }
    guessCount = 0;
    updateGameHistoryState();
  }

  function showCongrats(count) {
    const overlay = document.createElement('div');
    overlay.className = 'congrats-overlay';

    const box = document.createElement('div');
    box.className = 'congrats';
    const title = document.createElement('h2');
    title.textContent = 'Congrats!';
    const msg = document.createElement('p');
    msg.textContent = `You guessed the word in ${count} ${count === 1 ? 'guess' : 'guesses'}.`;
    const btn = document.createElement('button');
    btn.textContent = 'Continue';

    btn.addEventListener('click', () => {
      overlay.remove();
      resetGame();
    });

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // spawn confetti
    spawnConfetti(box);

    // auto-dismiss after 2.5s
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
        resetGame();
      }
    }, 2500);
  }

  function spawnConfetti(targetEl, count = 24) {
    const colors = ['#ff6b6b','#ffd166','#8fe587','#6ec6ff','#c77dff'];
    const rect = targetEl.getBoundingClientRect();
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '0';
    container.style.height = '0';
    targetEl.appendChild(container);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti';
      const color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.background = color;
      // randomize start position inside box
      const startX = Math.round(Math.random() * rect.width);
      piece.style.left = startX + 'px';
      piece.style.top = '0px';
      // random size
      const w = 6 + Math.round(Math.random() * 8);
      piece.style.width = w + 'px';
      piece.style.height = (w + 4) + 'px';
      // animation duration and delay
      const dur = 1200 + Math.round(Math.random() * 1000);
      const delay = Math.round(Math.random() * 300);
      piece.style.animation = `confettiFall ${dur}ms cubic-bezier(.2,.8,.2,1) ${delay}ms forwards`;
      // horizontal drift via transform
      const drift = (Math.random() - 0.5) * 200;
      piece.style.transform = `translateX(${drift}px)`;
      container.appendChild(piece);
    }

    // remove container after animations
    setTimeout(() => { try { container.remove(); } catch (e) {} }, 4000);
  }

  function submitIfReady() {
    const guess = inputs.map(i => i.value || '').join('');
    if (guess.length < inputs.length) return;
    guessCount += 1;
    const statuses = evaluateGuess(guess, target);
    colorInputs(statuses);

    // show previous guess above the input row
    createPreviousRow(guess, statuses);

    const isWin = statuses.every(s => s === 'correct');
    if (isWin) {
      // show congrats and reset
      setTimeout(() => {
        showCongrats(guessCount);
      }, 250);
    } else {
      setTimeout(() => {
        clearInputs();
        inputs[0].focus();
      }, 800);
    }
  }

  // trigger submit when all filled
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      const allFilled = inputs.every(i => (i.value || '').length === 1);
      if (allFilled) submitIfReady();
    });
  });

  // also trigger submit on Enter
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitIfReady();
    }
  });

  // ensure restart button in HTML (if present) has a handler, or create one
  createRestartButton();
  attachRestartHandler();
});
