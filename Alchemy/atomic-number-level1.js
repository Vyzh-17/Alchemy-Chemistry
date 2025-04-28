const elements = [
  { name: "Hydrogen", atomicNumber: 1 },
  { name: "Helium", atomicNumber: 2 },
  { name: "Lithium", atomicNumber: 3 },
  { name: "Beryllium", atomicNumber: 4 },
  { name: "Boron", atomicNumber: 5 },
  { name: "Carbon", atomicNumber: 6 },
  { name: "Nitrogen", atomicNumber: 7 },
  { name: "Oxygen", atomicNumber: 8 }
];

const reactions = [
  { question: "H₂ + O₂ → ?", choices: ["H₂O", "CO₂", "NaCl", "NH₃"], correctAnswer: "H₂O" },
  { question: "Na + Cl₂ → ?", choices: ["NaCl", "KCl", "MgO", "CO₂"], correctAnswer: "NaCl" },
  { question: "C + O₂ → ?", choices: ["CO₂", "CH₄", "NH₃", "NO₂"], correctAnswer: "CO₂" }
];

const board = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const pointsEl = document.getElementById('points');
const movesLeftEl = document.getElementById('moves-left');
const hintButton = document.getElementById('hintButton');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const backButton = document.getElementById('backButton');
const hintModal = document.getElementById('hintModal');
const questionContainer = document.getElementById('question-container');
const answerButtons = document.querySelectorAll('.answer-btn');
const infoPanel = document.getElementById('info');

let tiles = [], flipped = [], matched = 0, points = 0, timeLeft = 60;
let timer, hintUsed = 0, currentQuestion = null, movesLeft = 20;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function startGame() {
  tiles = [];
  flipped = [];
  matched = 0;
  points = 0;
  timeLeft = 60;
  hintUsed = 0;
  movesLeft = 20;

  pointsEl.textContent = "Points: 0";
  timerEl.textContent = "Time Left: 60s";
  movesLeftEl.textContent = `Moves Left: ${movesLeft}`;
  hintButton.textContent = `Use Hint (2 left)`;

  const pairTiles = [];
  elements.forEach(el => {
    pairTiles.push({ text: el.name, element: el.name, flipped: false, matched: false });
    pairTiles.push({ text: el.atomicNumber.toString(), element: el.name, flipped: false, matched: false });
  });

  tiles = shuffle(pairTiles).map((tile, index) => ({ ...tile, id: index }));

  drawBoard();
  infoPanel.classList.remove('hidden');
  board.classList.remove('hidden');
  startButton.classList.add('hidden');
  restartButton.classList.remove('hidden');
  startTimer();
}

function drawBoard() {
  board.innerHTML = "";

  tiles.forEach((tile, i) => {
    const btn = document.createElement("button");
    btn.className = "tile";

    if (tile.flipped || tile.matched) {
      btn.textContent = tile.text;
    } else {
      btn.textContent = "";
    }

    if (tile.flipped) {
      btn.classList.add("flipped");
    }
    if (tile.matched) {
      btn.classList.add("matched");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => handleFlip(i));
    }

    board.appendChild(btn);
  });
}

function handleFlip(i) {
  const tile = tiles[i];
  if (tile.flipped || tile.matched || flipped.length === 2) return;

  tile.flipped = true;
  flipped.push(i);
  movesLeft--;
  movesLeftEl.textContent = `Moves Left: ${movesLeft}`;
  drawBoard();

  if (movesLeft <= 0) {
    revealAllUnmatched();
    clearInterval(timer);
    alert("No moves left! Game over.");
    return;
  }

  if (flipped.length === 2) {
    const [a, b] = flipped.map(index => tiles[index]);
    if (a.element === b.element && a.text !== b.text) {
      setTimeout(() => {
        tiles[a.id].matched = true;
        tiles[b.id].matched = true;
        points += 10;
        matched += 2;
        flipped = [];
        pointsEl.textContent = `Points: ${points}`;
        drawBoard();
        if (matched === tiles.length) {
          clearInterval(timer);
          alert("You win!");
        }
      }, 500);
    } else {
      setTimeout(() => {
        tiles[flipped[0]].flipped = false;
        tiles[flipped[1]].flipped = false;
        flipped = [];
        drawBoard();
      }, 1000);
    }
  }
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      revealAllUnmatched();
      alert("Time's up! Game over.");
    }
  }, 1000);
}

function revealAllUnmatched() {
  tiles.forEach(tile => {
    if (!tile.matched) tile.flipped = true;
  });
  drawBoard();
}

function useHint() {
  if (hintUsed >= 2) return alert("No hints left!");

  currentQuestion = shuffle(reactions)[0];
  questionContainer.textContent = currentQuestion.question;
  answerButtons.forEach((btn, i) => {
    btn.textContent = currentQuestion.choices[i];
    btn.dataset.answer = currentQuestion.choices[i];
  });
  hintModal.classList.remove("hidden");
}

function checkAnswer(e) {
  const selected = e.target.dataset.answer;
  if (selected === currentQuestion.correctAnswer) {
    hintUsed++;
    hintButton.textContent = `Use Hint (${2 - hintUsed} left)`;
    hintModal.classList.add("hidden");
    revealUnflippedTile();
  } else {
    alert("Incorrect. Try again!");
  }
}

function revealUnflippedTile() {
  const hiddenTiles = tiles.filter(t => !t.flipped && !t.matched);
  if (hiddenTiles.length > 0) {
    const rand = hiddenTiles[Math.floor(Math.random() * hiddenTiles.length)];
    rand.flipped = true;
    drawBoard();
    setTimeout(() => {
      rand.flipped = false;
      drawBoard();
    }, 1500);
  }
}

// Event Listeners
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
hintButton.addEventListener("click", useHint);
answerButtons.forEach(btn => btn.addEventListener("click", checkAnswer));
backButton.addEventListener("click", () => window.location.href = "atomicNumbers.html");

