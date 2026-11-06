
// FIND THE HTML ELEMENTS

const stepList = document.getElementById("stepList");
const checkButton = document.getElementById("checkAnswer");
const hintButton = document.getElementById("hintButton");
const feedback = document.getElementById("feedback");
const hintMessage = document.getElementById("hintMessage");
const progress1 = document.getElementById("progress1");
const progress2 = document.getElementById("progress2");
const nextPuzzleButton = document.getElementById("nextPuzzle");


// DRAG AND DROP FUNCTIONALITY

let draggedItem = null;

stepList.addEventListener("dragstart", function(event) {

  draggedItem = event.target;

  if (draggedItem.tagName !== "LI") {
    draggedItem = null;
    return;
  }

  draggedItem.classList.add("dragging");

});

stepList.addEventListener("dragover", function(event) {

  event.preventDefault();

  if (!draggedItem) return;

  const otherItems = [
    ...stepList.querySelectorAll("li:not(.dragging)")
  ];

  const nextItem = otherItems.find(function(item) {

    const box = item.getBoundingClientRect();

    return event.clientY < box.top + box.height / 2;

  });

  if (nextItem) {
    stepList.insertBefore(draggedItem, nextItem);
  } else {
    stepList.appendChild(draggedItem);
  }

});

stepList.addEventListener("dragend", function() {

  if (draggedItem) {
    draggedItem.classList.remove("dragging");
  }

  draggedItem = null;

});


// CHECK THE ANSWER

checkButton.addEventListener("click", function() {

  const currentOrder = [
    ...stepList.children
  ].map(function(item) {

    return Number(item.dataset.step);

  });

  const correctOrder = [1, 2, 3, 4, 5];

  const isCorrect = currentOrder.every(function(step, index) {

    return step === correctOrder[index];

  });

  if (isCorrect) {
  feedback.textContent = "✓ Excellent! You completed Puzzle 1!";
  feedback.className = "feedback correct";
  hintMessage.textContent = "";

  progress1.classList.remove("active");
  progress1.classList.add("completed");

  progress2.classList.remove("locked");
  progress2.classList.add("active");

  progress2.querySelector("span").textContent = "2";

  nextPuzzleButton.hidden = false;

} else {
  feedback.textContent = "✗ Not quite! Check the order and try again.";
  feedback.className = "feedback incorrect";
}

});


// HINT BUTTON

hintButton.addEventListener("click", function() {

  hintMessage.textContent =
    "💡 Hint: Before you can log in, the computer needs to be powered on and ready.";

});

nextPuzzleButton.addEventListener("click", function() {
  document.getElementById("puzzle1").hidden = true;
  document.getElementById("puzzle2").hidden = false;
  scrollToPuzzle(2);
});

// randomize puzzle 2 steps
const piecesContainer = document.querySelector(".draggable-pieces");

function shufflePieces() {
  const pieces = [...piecesContainer.children];

  pieces.sort(() => Math.random() - 0.5);

  pieces.forEach(function(piece) {
    piecesContainer.appendChild(piece);
  });
}

shufflePieces();


// PUZZLE 2: DRAG AND DROP

const flowPieces = document.querySelectorAll("#puzzle2 .flow-piece");
const flowSlots = document.querySelectorAll("#puzzle2 .flow-slot");
const decisionBranches = document.getElementById("decisionBranches");
const decisionSlot = document.querySelector(
  '#puzzle2 .flow-slot[data-answer="decision"]'
);
const shapePalette = document.querySelector("#puzzle2 .draggable-pieces");

// Make each shape draggable
flowPieces.forEach(function(piece) {
  piece.addEventListener("dragstart", function(event) {
    event.dataTransfer.setData("text/plain", piece.dataset.piece);
  });
});

// Allow shapes to be dropped into flowchart boxes
flowSlots.forEach(function(slot) {

  slot.addEventListener("dragover", function(event) {
    event.preventDefault();
    slot.classList.add("drag-over");
  });

  slot.addEventListener("dragleave", function() {
    slot.classList.remove("drag-over");
  });

  slot.addEventListener("drop", function(event) {
    event.preventDefault();
    slot.classList.remove("drag-over");

    const pieceName = event.dataTransfer.getData("text/plain");
    const piece = document.querySelector('#puzzle2 .flow-piece[data-piece="' + pieceName + '"]');

    if (piece && slot.children.length === 0) {
      const oldSlot = piece.parentElement;

      if (oldSlot.classList.contains("flow-slot")) {
        oldSlot.classList.remove("has-piece");
      }
      if (oldSlot === decisionSlot) {
  decisionBranches.hidden = true;
}

      slot.appendChild(piece);
      slot.classList.add("has-piece");
      if (slot === decisionSlot && piece.dataset.piece === "decision") {
  decisionBranches.hidden = false;
}
    }
  });

});

// Allow students to return shapes to the palette
shapePalette.addEventListener("dragover", function(event) {
  event.preventDefault();
});

shapePalette.addEventListener("drop", function(event) {
  event.preventDefault();

  const pieceName = event.dataTransfer.getData("text/plain");
  const piece = document.querySelector('#puzzle2 .flow-piece[data-piece="' + pieceName + '"]');

  if (piece) {
    const oldSlot = piece.parentElement;

    if (oldSlot.classList.contains("flow-slot")) {
      oldSlot.classList.remove("has-piece");
    }

    if (oldSlot === decisionSlot) {
      decisionBranches.hidden = true;
    }

    shapePalette.appendChild(piece);
  }
});

// PUZZLE 2: CHECK THE ANSWER

const checkFlowchart = document.getElementById("checkFlowchart");
const flowFeedback = document.getElementById("flowFeedback");
const hintFlowchart = document.getElementById("hintFlowchart");
const flowHint = document.getElementById("flowHint");
const progress3 = document.getElementById("progress3");
const progress4 = document.getElementById("progress4");
const nextPuzzle3 = document.getElementById("nextPuzzle3");

checkFlowchart.addEventListener("click", function() {

  const allSlots = document.querySelectorAll(
    "#puzzle2 .flow-slot"
  );

  let isCorrect = true;

  allSlots.forEach(function(slot) {

    const placedPiece = slot.querySelector(".flow-piece");

    if (!placedPiece || placedPiece.dataset.piece !== slot.dataset.answer) {
      isCorrect = false;
    }

  });

if (isCorrect) {
  flowFeedback.textContent = "✓ Excellent! You completed Puzzle 2!";
  flowFeedback.className = "feedback correct";

  progress2.classList.remove("active");
  progress2.classList.add("completed");
  progress2.querySelector("span").textContent = "2";

  progress3.classList.remove("locked");
  progress3.classList.add("active");
  progress3.querySelector("span").textContent = "3";

  nextPuzzle3.hidden = false;
} else {
    flowFeedback.textContent = "✗ Not quite! Check your shapes and their positions.";
    flowFeedback.className = "feedback incorrect";
  }

});

// PUZZLE 2: HINT BUTTON

hintFlowchart.addEventListener("click", function() {

  flowHint.textContent =
    "💡 Hint: First, enter your combination. If the locker does not open, think about what you would do next. If it opens, think about why you are at your locker and what you need to be prepared.";

});

// NAVIGATE TO PUZZLE 3

nextPuzzle3.addEventListener("click", function() {
  document.getElementById("puzzle2").hidden = true;
  shufflePieces3();
  document.getElementById("puzzle3").hidden = false;
  scrollToPuzzle(3);
});


// PUZZLE 3: DRAG AND DROP

const palette3 = document.getElementById("pieces3");
const pieces3 = document.querySelectorAll("#pieces3 .flow-piece");
const slots3 = document.querySelectorAll("#puzzle3 .flow-slot");

// Randomize Puzzle 3 pieces
function shufflePieces3() {
  const pieces = [...palette3.children];

  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }

  pieces.forEach(function(piece) {
    palette3.appendChild(piece);
  });
}

shufflePieces3();

const compareBranches = document.getElementById("compareBranches");
const moreBranches = document.getElementById("moreBranches");

// Make each Puzzle 3 piece draggable
pieces3.forEach(function(piece) {
  piece.addEventListener("dragstart", function(event) {
    event.dataTransfer.setData("text/plain", piece.dataset.piece);
  });
});

// Allow pieces to be dropped into Puzzle 3 boxes
slots3.forEach(function(slot) {

  slot.addEventListener("dragover", function(event) {
    event.preventDefault();
    slot.classList.add("drag-over");
  });

  slot.addEventListener("dragleave", function() {
    slot.classList.remove("drag-over");
  });

  slot.addEventListener("drop", function(event) {
    event.preventDefault();
    slot.classList.remove("drag-over");

    const pieceName = event.dataTransfer.getData("text/plain");
    const piece = document.querySelector(
  '#puzzle3 .flow-piece[data-piece="' + pieceName + '"]'
);

    if (piece && slot.children.length === 0) {

      const oldSlot = piece.parentElement;

      if (oldSlot.classList.contains("flow-slot")) {
        oldSlot.classList.remove("has-piece");
      }

      if (oldSlot.dataset.answer === "compare") {
        compareBranches.hidden = true;
      }

      if (oldSlot.dataset.answer === "more") {
        moreBranches.hidden = true;
      }

      slot.appendChild(piece);
      slot.classList.add("has-piece");

      if (slot.dataset.answer === "compare" && piece.dataset.piece === "compare") {
        compareBranches.hidden = false;
      }

      if (slot.dataset.answer === "more" && piece.dataset.piece === "more") {
        moreBranches.hidden = false;
      }
    }
  });
});

// Allow students to return Puzzle 3 pieces to the palette
palette3.addEventListener("dragover", function(event) {
  event.preventDefault();
});

palette3.addEventListener("drop", function(event) {
  event.preventDefault();

  const pieceName = event.dataTransfer.getData("text/plain");
  const piece = document.querySelector(
  '#puzzle3 .flow-piece[data-piece="' + pieceName + '"]'
);

  if (piece) {
    const oldSlot = piece.parentElement;

    if (oldSlot.classList.contains("flow-slot")) {
      oldSlot.classList.remove("has-piece");
    }

    if (oldSlot.dataset.answer === "compare") {
      compareBranches.hidden = true;
    }

    if (oldSlot.dataset.answer === "more") {
      moreBranches.hidden = true;
    }

    palette3.appendChild(piece);
  }
});

// PUZZLE 3: CHECK THE ANSWER

const checkPuzzle3 = document.getElementById("checkPuzzle3");
const hintPuzzle3 = document.getElementById("hintPuzzle3");
const puzzle3Feedback = document.getElementById("puzzle3Feedback");
const puzzle3Hint = document.getElementById("puzzle3Hint");

checkPuzzle3.addEventListener("click", function() {

  const allSlots = document.querySelectorAll("#puzzle3 .flow-slot");

  let isCorrect = true;

  allSlots.forEach(function(slot) {

    const placedPiece = slot.querySelector(".flow-piece");

    if (!placedPiece || placedPiece.dataset.piece !== slot.dataset.answer) {
      isCorrect = false;
    }

  });

  if (isCorrect) {

    puzzle3Feedback.textContent =
      "✓ Excellent! You completed Puzzle 3! You built an algorithm that can find the largest number in a list.";

    puzzle3Feedback.className = "feedback correct";

    puzzle3Hint.textContent = "";

    progress3.classList.remove("active");
    progress3.classList.add("completed");

    progress4.classList.remove("locked");
    progress4.classList.add("active");

    progress4.querySelector("span").textContent = "4";

    checkPuzzle3.disabled = true;
    hintPuzzle3.disabled = true;

  } else {

    puzzle3Feedback.textContent =
      "✗ Not quite! Check the order of your steps and the YES and NO paths. Try again!";

    puzzle3Feedback.className = "feedback incorrect";

  }

});


// PUZZLE 3: HINT BUTTON

hintPuzzle3.addEventListener("click", function() {

  puzzle3Hint.textContent =
    "💡 Hint: Start by saving the first number as the largest. Compare each new number to it. If the new number is larger, update your saved number. Keep checking until there are no more numbers.";

});



// PUZZLE 4: ALGORITHM DEBUGGER

const debugRounds = [
  {
    title: "Round 1: Put It in Order",
    scenario: "A family wants to buy tickets for Friday night's performance of Moana. The ticket system follows these steps:",
    steps: [
      "Receive the family's ticket request.",
      "Check whether seats are available.",
      "Ask the family to choose a performance.",
      "Let the family select their seats.",
      "Complete the order.",
      "Send a confirmation."
    ],
    question: "What change would help this algorithm work better?",
    choices: [
      "Ask the family to choose a performance before checking for available seats.",
      "Send the confirmation before the family selects seats.",
      "Remove the step where the family selects seats."
    ],
    answer: 0,
    explanation: "That's right! The system needs to know which performance the family wants before it can check whether seats are available for that show."
  },
  {
    title: "Round 2: Wrong Way!",
    scenario: "The ticket system checks whether seats are available. But customers are getting the wrong message!",
    steps: [
      "Check whether seats are available.",
      "IF seats are available, display: \"Sorry, this show is sold out!\"",
      "IF no seats are available, allow the customer to select seats."
    ],
    question: "What should be changed in this algorithm?",
    choices: [
      "Remove the step that checks for available seats.",
      "Switch what the system does when seats are available and when they are sold out.",
      "Send a confirmation before checking for seats."
    ],
    answer: 1,
    explanation: "Correct! If seats are available, customers should be able to select them. If no seats are available, the system should tell them the show is sold out."
  },
  {
    title: "Round 3: Not So Fast!",
    scenario: "A family chooses a performance and selects two seats. The ticket system then reserves the seats, even though the family hasn't finished placing the order.",
    steps: [
      "Choose a performance.",
      "Select two seats.",
      "Reserve the selected seats.",
      "Show the order summary.",
      "Ask the customer to click \"Place Order\"."
    ],
    question: "What is the best way to fix this algorithm?",
    choices: [
      "Reserve the seats before the customer chooses them.",
      "Remove the order summary.",
      "Move the seat reservation until after the customer clicks \"Place Order\"."
    ],
    answer: 2,
    explanation: "Exactly! The system should wait until the customer places the order before reserving the seats."
  },
  {
    title: "Round 4: What's Missing?",
    scenario: "A family tries to order tickets for Saturday's performance. The show is sold out, and the ticket system stops the order.",
    steps: [
      "Choose a performance.",
      "Check whether seats are available.",
      "IF no seats are available, stop the order.",
      "End the algorithm."
    ],
    question: "What important step should be added?",
    choices: [
      "Let the family select seats anyway.",
      "Tell the family that the performance is sold out.",
      "Send a confirmation for the tickets."
    ],
    answer: 1,
    explanation: "That's right! The system should let the family know why they can't continue with the order. Good algorithms should give users helpful information."
  }
];


let debugRoundIndex = 0;
let debugCorrect = 0;

const debugTitle = document.getElementById("debugTitle");
const debugScenario = document.getElementById("debugScenario");
const debugSteps = document.getElementById("debugSteps");
const debugQuestion = document.getElementById("debugQuestion");
const debugChoices = document.getElementById("debugChoices");
const debugFeedback = document.getElementById("debugFeedback");
const debugRoundLabel = document.getElementById("debugRound");
const debugScore = document.getElementById("debugScore");
const checkDebugAnswer = document.getElementById("checkDebugAnswer");
const nextDebugRound = document.getElementById("nextDebugRound");
const vaultComplete = document.getElementById("vaultComplete");

function showDebugRound() {
  const round = debugRounds[debugRoundIndex];

  debugTitle.textContent = round.title;
  debugScenario.textContent = round.scenario;
  debugQuestion.textContent = round.question;
  debugRoundLabel.textContent = "ROUND " + (debugRoundIndex + 1) + " OF 4";
  debugScore.textContent = debugCorrect + " correct";

  debugSteps.innerHTML = "";
  round.steps.forEach(function(step) {
    const li = document.createElement("li");
    li.textContent = step;
    debugSteps.appendChild(li);
  });

  debugChoices.innerHTML = "";

  round.choices.forEach(function(choice, index) {
    const label = document.createElement("label");
    label.className = "debug-choice";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "debugChoice";
    radio.value = index;

    const text = document.createElement("span");
    text.textContent = choice;

    label.appendChild(radio);
    label.appendChild(text);
    debugChoices.appendChild(label);
  });

  debugFeedback.textContent = "";
  debugFeedback.className = "feedback";
  checkDebugAnswer.hidden = false;
  checkDebugAnswer.disabled = false;
  nextDebugRound.hidden = true;
}

checkDebugAnswer.addEventListener("click", function() {
  const selected = document.querySelector(
    '#debugChoices input[name="debugChoice"]:checked'
  );

  if (!selected) {
    debugFeedback.textContent = "Choose an answer before checking.";
    debugFeedback.className = "feedback incorrect";
    return;
  }

  const round = debugRounds[debugRoundIndex];
  const isCorrect = Number(selected.value) === round.answer;

  if (isCorrect) {
    debugCorrect++;
    debugFeedback.textContent = "✓ " + round.explanation;
    debugFeedback.className = "feedback correct";
  } else {
    debugFeedback.textContent = "✗ Not quite! " + round.explanation;
    debugFeedback.className = "feedback incorrect";
  }

  debugScore.textContent = debugCorrect + " correct";

  document.querySelectorAll(
    '#debugChoices input[name="debugChoice"]'
  ).forEach(function(input) {
    input.disabled = true;
  });

  checkDebugAnswer.hidden = true;

  if (debugRoundIndex < debugRounds.length - 1) {
    nextDebugRound.hidden = false;
  } else {
    nextDebugRound.textContent = "Finish Challenge →";
    nextDebugRound.hidden = false;
  }
});

nextDebugRound.addEventListener("click", function() {
  debugRoundIndex++;

  if (debugRoundIndex<debugRounds.length) {
  nextDebugRound.textContent="Next Round →";
  showDebugRound();
  document.getElementById("puzzle4").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
} else {
    document.querySelector(".debugger-activity").hidden = true;
    vaultComplete.hidden = false;

    progress4.classList.remove("active");
    progress4.classList.add("completed");
    progress4.querySelector("span").textContent = "4";
  }
});

// Show Puzzle 4 after Puzzle 3 is completed
document.getElementById("checkPuzzle3").addEventListener("click", function() {
  if (puzzle3Feedback.classList.contains("correct")) {
    document.getElementById("nextPuzzle4").hidden = false;
  }
});

document.getElementById("nextPuzzle4").addEventListener("click", function() {
  document.getElementById("puzzle3").hidden = true;
  document.getElementById("puzzle4").hidden = false;
  showDebugRound();
  scrollToPuzzle(4);
});


function scrollToPuzzle(puzzleNumber) {
  document.getElementById("puzzle" + puzzleNumber).scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}