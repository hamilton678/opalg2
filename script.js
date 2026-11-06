
/* =========================================================
   OPERATION: ALGORITHM
   Main JavaScript File

   This file makes the six puzzles interactive.

   It controls:
   1. The Chromebook login sequence
   2. The troubleshooting flowchart
   3. The file-location questions
   4. The filename challenge
   5. The simulated Google Drive search
   6. The simulated Classroom submission

   It also manages the progress tracker and secret word.

   NOTE: This is a practice activity. It does not connect
   to a student's real Chromebook, Google Drive, or Classroom.
   ========================================================= */


/* ---------------------------------------------------------
   1. GENERAL PAGE SETUP
   --------------------------------------------------------- */

// A shortcut function for finding an HTML element by its ID.
// Example: getElement("puzzle1") finds the element with id="puzzle1".

function getElement(id) {
  return document.getElementById(id);
}


// The six puzzles are displayed in this order.

const puzzleIds = [
  "puzzle1",
  "puzzle2",
  "puzzle3",
  "puzzle4",
  "puzzle5",
  "puzzle6"
];


// The secret letters are awarded in order.

const secretLetters = ["A", "T", "T", "A", "C", "H"];


// Keep track of which puzzles have been completed.

const completedPuzzles = [false, false, false, false, false, false];


// Keep track of the currently selected item for tap-to-move.

let selectedItem = null;


// Start by showing only the first puzzle.

function showPuzzle(puzzleNumber) {
  puzzleIds.forEach((id, index) => {
    const puzzle = getElement(id);

    if (puzzle) {
      puzzle.hidden = index !== puzzleNumber - 1;
    }
  });

  // Scroll to the top of the puzzle card when moving forward.
  const puzzleCard = document.querySelector(".puzzle-card");

  if (puzzleCard) {
    puzzleCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


// Award a letter and update the progress tracker.

function completePuzzle(puzzleNumber) {
  const index = puzzleNumber - 1;

  // Do not award the same letter more than once.
  if (completedPuzzles[index]) {
    return;
  }

  completedPuzzles[index] = true;

  const progressStep = getElement("progress" + puzzleNumber);
  const letter = getElement("letter" + puzzleNumber);

  if (progressStep) {
    progressStep.classList.remove("locked", "active");
    progressStep.classList.add("completed");
  }

  if (letter) {
    letter.textContent = secretLetters[index];
  }

  // Reveal the matching letter in the secret word.
  const secretWord = getElement("secretWord");

  if (secretWord) {
    const letters = secretWord.querySelectorAll("span");

    if (letters[index]) {
      letters[index].textContent = secretLetters[index];
      letters[index].classList.add("revealed");
    }
  }

  // Unlock the next progress step.
  const nextStep = getElement("progress" + (puzzleNumber + 1));

  if (nextStep) {
    nextStep.classList.remove("locked");
    nextStep.classList.add("active");
  }
}


// Display feedback messages consistently.

function showFeedback(elementId, message, type) {
  const element = getElement(elementId);

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("success", "error");

  if (type) {
    element.classList.add(type);
  }
}


// Remove feedback styling and text.

function clearFeedback(elementId) {
  const element = getElement(elementId);

  if (element) {
    element.textContent = "";
    element.classList.remove("success", "error");
  }
}


/* ---------------------------------------------------------
   2. POINTER-BASED MOVEMENT AND TAP-TO-MOVE

   These functions allow students to move items with:
   - A mouse
   - A Chromebook trackpad
   - A touchscreen

   Pointer events work across these types of devices.

   Students can also tap an item and then tap its destination.
   --------------------------------------------------------- */


// Make an item visibly selected.

function selectItem(item) {
  // Remove the selected appearance from the previous item.
  if (selectedItem) {
    selectedItem.classList.remove("selected");
  }

  selectedItem = item;

  if (selectedItem) {
    selectedItem.classList.add("selected");
  }
}


// Clear the current selection.

function clearSelection() {
  if (selectedItem) {
    selectedItem.classList.remove("selected");
  }

  selectedItem = null;
}


// Set up pointer dragging for the ordered list in Puzzle 1.

function setupSequenceMovement() {
  const list = getElement("stepList");

  if (!list) {
    return;
  }

  let draggedItem = null;
  let startY = 0;
  let pointerMoved = false;

  list.querySelectorAll("li").forEach(item => {

    // Prevent the browser's older HTML drag-and-drop behavior.
    item.draggable = false;

    item.addEventListener("pointerdown", event => {
      draggedItem = item;
      startY = event.clientY;
      pointerMoved = false;

      item.setPointerCapture(event.pointerId);
      item.classList.add("dragging");
    });

    item.addEventListener("pointermove", event => {
      if (!draggedItem) {
        return;
      }

      if (Math.abs(event.clientY - startY) > 5) {
        pointerMoved = true;
      }

      if (!pointerMoved) {
        return;
      }

      // Find the list item directly under the pointer.
      const otherItem = document.elementFromPoint(
        event.clientX,
        event.clientY
      )?.closest("#stepList li");

      if (!otherItem || otherItem === draggedItem) {
        return;
      }

      const box = otherItem.getBoundingClientRect();
      const insertAfter = event.clientY > box.top + box.height / 2;

      if (insertAfter) {
        otherItem.after(draggedItem);
      } else {
        otherItem.before(draggedItem);
      }
    });

    item.addEventListener("pointerup", () => {
      if (!draggedItem) {
        return;
      }

      draggedItem.classList.remove("dragging");

      // If the student only tapped, select the item.
      if (!pointerMoved) {
        selectItem(draggedItem);
      } else {
        clearSelection();
      }

      draggedItem = null;
      pointerMoved = false;
    });

    item.addEventListener("pointercancel", () => {
      if (draggedItem) {
        draggedItem.classList.remove("dragging");
      }

      draggedItem = null;
      pointerMoved = false;
    });
  });
}


// Allow students to tap two list items to swap their positions.

function setupSequenceTapMovement() {
  const list = getElement("stepList");

  if (!list) {
    return;
  }

  list.addEventListener("click", event => {
    const item = event.target.closest("li");

    if (!item) {
      return;
    }

    if (!selectedItem) {
      selectItem(item);
      return;
    }

    if (selectedItem === item) {
      clearSelection();
      return;
    }

    // Swap the positions of the two selected list items.
    const first = selectedItem;
    const second = item;

    const firstNext = first.nextSibling;
    const secondNext = second.nextSibling;

    if (firstNext === second) {
      list.insertBefore(second, first);
    } else if (secondNext === first) {
      list.insertBefore(first, second);
    } else {
      const placeholder = document.createElement("li");

      list.insertBefore(placeholder, first);
      list.insertBefore(first, second);
      list.insertBefore(second, placeholder);

      placeholder.remove();
    }

    clearSelection();
  });
}


/* ---------------------------------------------------------
   3. PUZZLE 1: LOG IN AND GET READY

   Students arrange the five steps in the correct order.

   The expected order is:
   1. Press the power button.
   2. Connect the charger if the Chromebook will not turn on.
   3. Enter username and password.
   4. Check the login information if login does not work.
   5. Reach the Chromebook desktop.

   This is a simplified sequence activity. The two
   troubleshooting steps describe what to do IF a problem
   happens; they are not steps every student must perform.
   --------------------------------------------------------- */


function setupPuzzle1() {
  const checkButton = getElement("checkAnswer");
  const hintButton = getElement("hintButton");
  const nextButton = getElement("nextPuzzle");

  setupSequenceMovement();
  setupSequenceTapMovement();

  if (checkButton) {
    checkButton.addEventListener("click", () => {
      const items = document.querySelectorAll("#stepList li");

      const currentOrder = Array.from(items).map(item =>
        Number(item.dataset.step)
      );

      const correctOrder = [1, 2, 3, 4, 5];

      const isCorrect = currentOrder.every(
        (step, index) => step === correctOrder[index]
      );

      if (isCorrect) {
        showFeedback(
          "feedback",
          "Correct! You put the login steps in the right order. Remember, the charger and login checks are only needed if a problem happens.",
          "success"
        );

        completePuzzle(1);
        nextButton.hidden = false;

        // Highlight each correctly placed step.
        items.forEach(item => item.classList.add("correct-position"));

        checkButton.disabled = true;
      } else {
        showFeedback(
          "feedback",
          "Not quite. Think about what must happen before you can enter your username and password. Try again!",
          "error"
        );
      }
    });
  }

  if (hintButton) {
    hintButton.addEventListener("click", () => {
      getElement("hintMessage").textContent =
        "Hint: You must turn on the Chromebook before you can sign in. Reaching the desktop is the last step.";
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showPuzzle(2));
  }
}


/* ---------------------------------------------------------
   4. PUZZLE 2: BUILD A TROUBLESHOOTING FLOWCHART

   Students place five pieces into five matching slots.

   START → Refresh webpage → Did the page load?
   YES → END
   NO → Check internet connection

   The activity represents a simple troubleshooting plan.
   --------------------------------------------------------- */


function setupFlowchartMovement() {
  const pieces = document.querySelectorAll(".flow-piece");
  const slots = document.querySelectorAll(".flow-slot");

  let draggedPiece = null;
  let startX = 0;
  let startY = 0;
  let pointerMoved = false;

  // Make every flowchart piece selectable and draggable.
  pieces.forEach(piece => {
    piece.draggable = false;

    piece.addEventListener("pointerdown", event => {
      draggedPiece = piece;
      startX = event.clientX;
      startY = event.clientY;
      pointerMoved = false;

      piece.setPointerCapture(event.pointerId);
      piece.classList.add("dragging");
    });

    piece.addEventListener("pointermove", event => {
      if (!draggedPiece) {
        return;
      }

      if (
        Math.abs(event.clientX - startX) > 6 ||
        Math.abs(event.clientY - startY) > 6
      ) {
        pointerMoved = true;
      }
    });

    piece.addEventListener("pointerup", event => {
      if (!draggedPiece) {
        return;
      }

      piece.classList.remove("dragging");

      if (pointerMoved) {
        const target = document.elementFromPoint(
          event.clientX,
          event.clientY
        );

        const slot = target?.closest(".flow-slot");

        if (slot) {
          placeFlowPiece(piece, slot);
        }
      } else {
        selectItem(piece);
      }

      draggedPiece = null;
      pointerMoved = false;
    });

    piece.addEventListener("pointercancel", () => {
      piece.classList.remove("dragging");
      draggedPiece = null;
      pointerMoved = false;
    });
  });

  // Tapping a piece and then tapping a slot also moves it.
  slots.forEach(slot => {
    slot.addEventListener("click", () => {
      if (selectedItem && selectedItem.classList.contains("flow-piece")) {
        placeFlowPiece(selectedItem, slot);
        clearSelection();
      }
    });
  });
}


// Move a flowchart piece into a slot.
// If another piece is already there, return it to the palette.

function placeFlowPiece(piece, slot) {
  const oldPiece = slot.querySelector(".flow-piece");

  if (oldPiece && oldPiece !== piece) {
    getElement("decisionBranches")
      .previousElementSibling
      ?.querySelector(".draggable-pieces")
      ?.appendChild(oldPiece);

    // A more direct fallback: find the palette and return the piece.
    const palette = document.querySelector(".draggable-pieces");

    if (palette) {
      palette.appendChild(oldPiece);
    }
  }

  slot.textContent = "";
  slot.appendChild(piece);

  // Show the YES and NO branches when the decision is placed.
  if (piece.dataset.piece === "loaded") {
    getElement("decisionBranches").hidden = false;
  }

  // If the decision is removed from its slot, hide the branches.
  const decisionSlot = document.querySelector(
    '.flow-slot[data-answer="loaded"]'
  );

  if (
    decisionSlot &&
    !decisionSlot.querySelector('.flow-piece[data-piece="loaded"]')
  ) {
    getElement("decisionBranches").hidden = true;
  }

  clearFeedback("flowFeedback");
}


// Check whether every flowchart piece is in the correct slot.

function setupPuzzle2() {
  setupFlowchartMovement();

  const checkButton = getElement("checkFlowchart");
  const hintButton = getElement("hintFlowchart");
  const nextButton = getElement("nextPuzzle3");

  if (checkButton) {
    checkButton.addEventListener("click", () => {
      const slots = document.querySelectorAll(".flow-slot[data-answer]");
      let correctCount = 0;

      slots.forEach(slot => {
        const piece = slot.querySelector(".flow-piece");

        if (piece && piece.dataset.piece === slot.dataset.answer) {
          correctCount++;
        }
      });

      if (correctCount === 5) {
        showFeedback(
          "flowFeedback",
          "Great work! Your flowchart shows the steps and the YES/NO decision paths.",
          "success"
        );

        completePuzzle(2);
        nextButton.hidden = false;
        checkButton.disabled = true;
      } else {
        showFeedback(
          "flowFeedback",
          "Not quite yet. Check the START, process, decision, and END pieces. Make sure each one is in the matching spot.",
          "error"
        );
      }
    });
  }

  if (hintButton) {
    hintButton.addEventListener("click", () => {
      getElement("flowHint").textContent =
        "Hint: START comes first. Refresh the webpage, then ask whether the page loaded. YES leads to END. NO leads to checking the internet connection.";
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showPuzzle(3));
  }
}


/* ---------------------------------------------------------
   5. PUZZLE 3: WHERE DID IT GO?

   Correct answers:
   Question 1: Google Drive (choice 1)
   Question 2: Downloads (choice 0)
   Question 3: Files app (choice 1)
   --------------------------------------------------------- */


function setupPuzzle3() {
  const questionArea = getElement("locationQuestions");
  const checkButton = getElement("checkLocations");
  const nextButton = getElement("nextPuzzle4");

  // Store the student's selected answers.
  const selectedAnswers = [null, null, null];

  const correctAnswers = [1, 0, 1];

  if (questionArea) {
    questionArea.querySelectorAll(".location-question").forEach(question => {
      const questionNumber = Number(question.dataset.question);

      question.querySelectorAll(".location-choice").forEach(button => {
        button.addEventListener("click", () => {
          if (completedPuzzles[2]) {
            return;
          }

          // Save the selected answer.
          selectedAnswers[questionNumber] = Number(button.dataset.choice);

          // Show which answer is selected.
          question.querySelectorAll(".location-choice").forEach(choice => {
            choice.classList.remove("selected");
          });

          button.classList.add("selected");

          // Clear old feedback for this question.
          const feedback = question.querySelector(".question-feedback");

          if (feedback) {
            feedback.textContent = "";
            feedback.classList.remove("success", "error");
          }
        });
      });
    });
  }

  if (checkButton) {
    checkButton.addEventListener("click", () => {
      let correctCount = 0;

      questionArea.querySelectorAll(".location-question").forEach(question => {
        const questionNumber = Number(question.dataset.question);
        const feedback = question.querySelector(".question-feedback");
        const isCorrect =
          selectedAnswers[questionNumber] === correctAnswers[questionNumber];

        if (isCorrect) {
          correctCount++;

          feedback.textContent = "Correct!";
          feedback.classList.add("success");
          feedback.classList.remove("error");
        } else {
          feedback.textContent = "Try again.";
          feedback.classList.add("error");
          feedback.classList.remove("success");
        }
      });

      if (correctCount === 3) {
        showFeedback(
          "locationFeedback",
          "All three are correct! Google Drive stores your online files, Downloads holds downloaded files, and the Files app lets you browse both.",
          "success"
        );

        completePuzzle(3);
        nextButton.hidden = false;
        checkButton.disabled = true;
      } else {
        showFeedback(
          "locationFeedback",
          correctCount + " out of 3 correct. Review the explanations above and try again.",
          "error"
        );
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showPuzzle(4));
  }
}


/* ---------------------------------------------------------
   6. PUZZLE 4: NAME THAT FILE!

   The best filename is choice 2:
   Science Ecosystems Research
   --------------------------------------------------------- */


function setupPuzzle4() {
  const choicesArea = getElement("filenameChoices");
  const feedback = getElement("filenameFeedback");
  const nextButton = getElement("nextPuzzle5");

  let selectedChoice = null;

  if (choicesArea) {
    choicesArea.querySelectorAll(".filename-choice").forEach(button => {
      button.addEventListener("click", () => {
        if (completedPuzzles[3]) {
          return;
        }

        selectedChoice = Number(button.dataset.choice);

        choicesArea.querySelectorAll(".filename-choice").forEach(choice => {
          choice.classList.remove("selected");
        });

        button.classList.add("selected");

        clearFeedback("filenameFeedback");
      });
    });
  }

  if (choicesArea) {
    choicesArea.addEventListener("click", event => {
      const button = event.target.closest(".filename-choice");

      if (!button || selectedChoice === null) {
        return;
      }

      // Check the answer after a student selects an option.
      if (selectedChoice === 2) {
        button.classList.add("correct");

        showFeedback(
          "filenameFeedback",
          "Exactly! Science Ecosystems Research tells you what the document is about. A useful filename makes it easier to recognize and find later.",
          "success"
        );

        completePuzzle(4);
        nextButton.hidden = false;
      } else {
        showFeedback(
          "filenameFeedback",
          "That name is still too general. Choose a filename that tells you the subject and topic.",
          "error"
        );
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showPuzzle(5));
  }
}


/* ---------------------------------------------------------
   7. PUZZLE 5: SEARCH AND FIND

   Students search the simulated file list.

   They need to find and select:
   Science Ecosystems Research

   The search works with partial keywords, such as:
   Science, Ecosystems, or Research.
   --------------------------------------------------------- */


function setupPuzzle5() {
  const searchInput = getElement("driveSearch");
  const searchButton = getElement("searchDrive");
  const fileList = getElement("driveFileList");
  const status = getElement("searchStatus");
  const nextButton = getElement("nextPuzzle6");

  const targetFile = "Science Ecosystems Research";

  function searchFiles() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    if (searchTerm === "") {
      status.textContent = "Type a word from the filename to search.";
      return;
    }

    fileList.querySelectorAll(".drive-file").forEach(file => {
      const filename = file.dataset.filename.toLowerCase();
      const matches = filename.includes(searchTerm);

      file.hidden = !matches;

      if (matches) {
        visibleCount++;
      }
    });

    if (visibleCount === 0) {
      status.textContent = "No matching files. Try another search word.";
    } else {
      status.textContent =
        visibleCount + (visibleCount === 1 ? " file found." : " files found.") +
        " Select the correct assignment.";
    }

    clearFeedback("searchFeedback");
  }

  if (searchButton) {
    searchButton.addEventListener("click", searchFiles);
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        searchFiles();
      }
    });
  }

  // Students must click the correct result, not just type a word.
  if (fileList) {
    fileList.querySelectorAll(".drive-file").forEach(file => {
      file.addEventListener("click", () => {
        if (completedPuzzles[4] || file.hidden) {
          return;
        }

        if (file.dataset.filename === targetFile) {
          showFeedback(
            "searchFeedback",
            "You found it! A descriptive filename makes searching much easier.",
            "success"
          );

          file.classList.add("selected");
          completePuzzle(5);
          nextButton.hidden = false;
        } else {
          showFeedback(
            "searchFeedback",
            "That's not the assignment. Look for Science Ecosystems Research.",
            "error"
          );
        }
      });
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showPuzzle(6));
  }
}


/* ---------------------------------------------------------
   8. PUZZLE 6: ATTACH AND TURN IN

   Students practice attaching the correct file to a
   simulated Classroom assignment.

   Correct file:
   Science Ecosystems Research

   The Turn In button becomes available only after the
   correct file is attached.
   --------------------------------------------------------- */


function setupPuzzle6() {
  const addButton = getElement("addFileButton");
  const picker = getElement("filePicker");
  const closePicker = getElement("closeFilePicker");
  const insertButton = getElement("insertFile");
  const turnInButton = getElement("turnInButton");

  const noAttachment = getElement("noAttachment");
  const attachedFile = getElement("attachedFile");
  const attachedFileName = getElement("attachedFileName");
  const removeButton = getElement("removeAttachment");

  const feedback = getElement("submissionFeedback");
  const missionComplete = getElement("missionComplete");

  let selectedFile = null;
  let attachedFileNameValue = null;

  const correctFile = "Science Ecosystems Research";


  // Open the simulated file picker.
  if (addButton) {
    addButton.addEventListener("click", () => {
      picker.hidden = false;
      clearFeedback("submissionFeedback");
    });
  }


  // Close the file picker.
  if (closePicker) {
    closePicker.addEventListener("click", () => {
      picker.hidden = true;
      selectedFile = null;

      picker.querySelectorAll(".picker-file").forEach(file => {
        file.classList.remove("selected");
      });

      insertButton.disabled = true;
    });
  }


  // Select a file from the simulated Google Drive list.
  picker.querySelectorAll(".picker-file").forEach(button => {
    button.addEventListener("click", () => {
      selectedFile = button.dataset.file;

      picker.querySelectorAll(".picker-file").forEach(file => {
        file.classList.remove("selected");
      });

      button.classList.add("selected");
      insertButton.disabled = false;
    });
  });


  // Insert the selected file into the assignment.
  if (insertButton) {
    insertButton.addEventListener("click", () => {
      if (!selectedFile) {
        return;
      }

      attachedFileNameValue = selectedFile;

      attachedFileName.textContent = selectedFile;
      attachedFile.hidden = false;
      noAttachment.hidden = true;

      picker.hidden = true;
      turnInButton.disabled = false;

      // Clear the selected file in the picker.
      selectedFile = null;

      picker.querySelectorAll(".picker-file").forEach(file => {
        file.classList.remove("selected");
      });

      insertButton.disabled = true;

      if (attachedFileNameValue === correctFile) {
        showFeedback(
          "submissionFeedback",
          "Correct file attached! You're ready to turn in your assignment.",
          "success"
        );
      } else {
        showFeedback(
          "submissionFeedback",
          "A file is attached, but double-check that it is the correct assignment before turning it in.",
          "error"
        );
      }
    });
  }


  // Remove an attached file so the student can choose another.
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      attachedFileNameValue = null;

      attachedFile.hidden = true;
      noAttachment.hidden = false;
      turnInButton.disabled = true;

      clearFeedback("submissionFeedback");
    });
  }


  // Turn in the assignment only when the correct file is attached.
  if (turnInButton) {
    turnInButton.addEventListener("click", () => {
      if (attachedFileNameValue !== correctFile) {
        showFeedback(
          "submissionFeedback",
          "That isn't the correct assignment. Remove the file and attach Science Ecosystems Research.",
          "error"
        );

        return;
      }

      showFeedback(
        "submissionFeedback",
        "Assignment turned in successfully!",
        "success"
      );

      completePuzzle(6);

      // Reveal the final mission-complete message.
      missionComplete.hidden = false;

      // Prevent additional changes after submission.
      turnInButton.disabled = true;
      addButton.disabled = true;
      removeButton.disabled = true;

      // Move the student down to the completion message.
      missionComplete.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  }
}


/* ---------------------------------------------------------
   9. START THE ACTIVITY

   Wait until the HTML is ready, then connect all six puzzles.
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  setupPuzzle1();
  setupPuzzle2();
  setupPuzzle3();
  setupPuzzle4();
  setupPuzzle5();
  setupPuzzle6();

  showPuzzle(1);
});
