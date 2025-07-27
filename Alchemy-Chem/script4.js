const elements = [
  { name: "Cobalt", atomicNumber: 27 },
  { name: "Nickel", atomicNumber: 28 },
  { name: "Copper", atomicNumber: 29 },
  { name: "Zinc", atomicNumber: 30 },
  { name: "Gallium", atomicNumber: 31 },
  { name: "Germanium", atomicNumber: 32 },
  { name: "Arsenic", atomicNumber: 33 },
  { name: "Selenium", atomicNumber: 34 }
];

const reactions = [
  { question: "Co + Cl₂ → ?", choices: ["CoCl₂", "NiCl₂", "ZnCl₂", "CuCl₂"], correctAnswer: "CoCl₂" },
  { question: "Ni + O₂ → ?", choices: ["NiO", "CuO", "ZnO", "Ga₂O₃"], correctAnswer: "NiO" },
  { question: "As + O₂ → ?", choices: ["As₂O₃", "As₂O₅", "SeO₂", "GeO₂"], correctAnswer: "As₂O₃" }
];

const board = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const pointsEl = document.getElementById('points');
const movesLeftEl = document.getElementById('moves-left');
const hintButton = document.getElementById('hintButton');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const hintModal = document.getElementById('hintModal');
const questionContainer = document.getElementById('question-container');
const answerButtons = document.querySelectorAll('.answer-btn');
const infoPanel = document.getElementById('info');
const backButton = document.getElementById('backButton');

let tiles = [];
let flipped = [];
let matched = 0;
let points = 0;
let timeLeft = 60;
let timer;
let hintUsed = 0;
let movesLeft = 20;
const maxHints = 2;
let currentQuestion = null;

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
  hintButton.textContent = `Use Hint (${maxHints - hintUsed} left)`;

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
    if (tile.flipped) {
      btn.textContent = tile.text;
      btn.classList.add("flipped");
    } else {
      btn.textContent = "";
    }
    if (tile.matched) {
      btn.classList.add("matched");
      btn.disabled = true;
      btn.textContent = "";
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
    setTimeout(() => alert("No moves left! Game over."), 300);
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
      setTimeout(() => alert("Time's up! Game over."), 300);
    }
  }, 1000);
}

function useHint() {
  if (hintUsed >= maxHints) {
    alert("No hints left!");
    return;
  }

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
    alert("Correct! Revealing a tile.");
    hintUsed++;
    hintModal.classList.add("hidden");
    hintButton.textContent = `Use Hint (${maxHints - hintUsed} left)`;
    revealUnflippedTile();
  } else {
    alert("Incorrect! Try again.");
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

// Events
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
hintButton.addEventListener("click", useHint);
answerButtons.forEach(btn => btn.addEventListener("click", checkAnswer));
backButton.addEventListener("click", () => {
  window.location.href = "atomicNumbers.html"; // Update if your levels page is named differently
});
