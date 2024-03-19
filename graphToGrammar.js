document.addEventListener("DOMContentLoaded", function () {
  document.body.style.height = window.innerHeight + "px";

  var canvas = document.getElementById("drawingArea");
  var canvasRect = canvas.getBoundingClientRect();
  var drawingAreaWidth = canvas.clientWidth;
  var drawingAreaHeight = canvas.clientHeight;
  var two = new Two({
    type: Two.Types.svg,
    width: drawingAreaWidth,
    height: drawingAreaHeight,
  });
  two.appendTo(canvas);
  var clearButton = document.getElementById("clearButton");
  var createStateButton = document.getElementById("createStateButton");
  var createTransitionButton = document.getElementById("createTransitionButton");
  var markEndButton = document.getElementById("markEndButton");
  var markStartButton = document.getElementById("markStartButton");
  var deleteButton = document.getElementById("deleteButton");
  var deleteEndButton = document.getElementById("deleteEndButton");
  var makeScreenshotButton = document.getElementById("screenshotButton");
  var determinizeButton = document.getElementById("determinizeButton");
  var determinizePartButton = document.getElementById("determinizePartialButton");
  var removeEpsilonButton = document.getElementById("removeEpsilonButton");
  var copyButton = document.getElementById("copyButton");
  var autoConvertInput = document.getElementById("autoConvert");
  var infoConsole = document.getElementById("console");
  var dfaDisplay = document.getElementById("isDFADisplay");
  var moveButton = document.getElementById("moveButton");
  var editButton = document.getElementById("editButton");
  var rightArrowButton = document.getElementById("rightArrowButton");
  rightArrowButton.style.backgroundImage = "url('arrow_right_selected.svg')";
  var pieDelete = document.getElementById("pieDelete");
  var pieMove = document.getElementById("pieMove");
  var pieMarkStart = document.getElementById("pieMarkStart");
  var pieMarkEnd = document.getElementById("pieMarkEnd");
  var pieRemoveEnd = document.getElementById("pieRemoveEnd");
  var pieStartTransition = document.getElementById("pieStartTransition");

  var stateCount = 0;
  var transitionsCount = 0;
  var createdStates = [];
  var createdTransitions = [];
  var createdInputAlphabet = [];
  var automaton = new FiniteAutomaton(
    createdStates,
    createdInputAlphabet,
    createdTransitions,
    two
  );
  var userSelectedStateFrom;
  var userSelectedStateTo;
  var stateCreationActive = false;
  var transitionCreationActive = false;
  var endDeletionActive = false;
  var endMarkingActive = false;
  var startMarkingActive = false;
  var deleteActive = false;
  var editActive = false;
  var moveActive = false;
  var pieMoveActive = false;
  var movingState;


  var grammar = new Grammar([], [], [], null);
  var automatonObserver = new AutomatonObserver(automaton, grammar, 0);
  automaton.addObserver(automatonObserver);

  var pieMenu = new PieMenu(
    document.getElementById("pieMenu"),
    document.getElementById("canvas"),
    canvasRect
  );

  markEndButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = false;
    deleteActive = false;
    endMarkingActive = !endMarkingActive;
    endDeletionActive = false;
    startMarkingActive = false;
    moveActive = false;
    updateEditButtons();
    two.update();
    endMarkingActive
      ? messageToConsole("Click a state to mark it as end state", "black")
      : clearConsole();
  });

  markStartButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = false;
    deleteActive = false;
    endMarkingActive = false;
    endDeletionActive = false;
    startMarkingActive = !startMarkingActive;
    moveActive = false;
    updateEditButtons();
    two.update();
    startMarkingActive
      ? messageToConsole("Click a state to mark it as start state", "black")
      : clearConsole();
  });

  deleteButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = false;
    endMarkingActive = false;
    endDeletionActive = false;
    startMarkingActive = false;
    deleteActive = !deleteActive;
    moveActive = false;
    updateEditButtons();
    two.update();
    deleteActive
      ? messageToConsole("Click a state or transition to delete", "black")
      : clearConsole();
  });

  createStateButton.addEventListener("click", function () {
    stateCreationActive = !stateCreationActive;
    transitionCreationActive = false;
    endMarkingActive = false;
    endDeletionActive = false;
    startMarkingActive = false;
    deleteActive = false;
    moveActive = false;
    updateEditButtons();
    stateCreationActive
      ? messageToConsole(
          "To create a state, click in the drawing area where you want to place the state",
          "black"
        )
      : clearConsole();
  });

  makeScreenshotButton.addEventListener("click", async function () {
    createSVGScreenshot(two.renderer.domElement);
    messageToConsole("Screenshot created", "green");
  });

  removeEpsilonButton.addEventListener("click", () => {
    messageToConsole(
      "Removing ε-transitions, auto grammar conversion is disabled!",
      "red"
    );
    if (autoConvertInput.checked) {
      autoConvertInput.checked = false;
      autoConvertInput.dispatchEvent(new Event("change"));
    }

    automaton.resolveEpsilonTransitions(two);
  });

  editButton.addEventListener("click", () => {
    editActive = !editActive;

    if (!editActive) {
      stateCreationActive = false;
      transitionCreationActive = false;
      endMarkingActive = false;
      endDeletionActive = false;
      startMarkingActive = false;
      deleteActive = false;
      moveActive = false;

      clearButton.style.scale = 1;
      makeScreenshotButton.style.scale = 1;
      determinizeButton.style.scale = 1;
      determinizePartButton.style.scale = 1;
      removeEpsilonButton.style.scale = 1;
      clearButton.style.display = "flex";
      makeScreenshotButton.style.display = "flex";
      clearButton.style.display = "flex";
      dfaDisplay.style.display = "flex";
      determinizeButton.style.display = "flex";
      determinizePartButton.style.display = "flex";
      removeEpsilonButton.style.display = "flex";
      dfaDisplay.style.scale = 1;

      createStateButton.style.display = "none";
      createStateButton.style.scale = 0;
      createTransitionButton.style.display = "none";
      createTransitionButton.style.scale = 0;
      markEndButton.style.display = "none";
      markEndButton.style.scale = 0;
      markStartButton.style.display = "none";
      markStartButton.style.scale = 0;
      deleteEndButton.style.display = "none";
      deleteEndButton.style.scale = 0;
      moveButton.style.display = "none";
      moveButton.style.scale = 0;
      deleteButton.style.display = "none";
      deleteButton.style.scale = 0;
    } else {
      clearButton.style.scale = 0;
      makeScreenshotButton.style.scale = 0;
      determinizeButton.style.scale = 0;
      determinizePartButton.style.scale = 0;
      removeEpsilonButton.style.scale = 0;
      dfaDisplay.style.scale = 0;

      clearButton.style.display = "none";
      makeScreenshotButton.style.display = "none";
      clearButton.style.display = "none";
      dfaDisplay.style.display = "none";
      determinizeButton.style.display = "none";
      determinizePartButton.style.display = "none";
      removeEpsilonButton.style.display = "none";

      createStateButton.style.display = "flex";
      createStateButton.style.scale = 1;
      createTransitionButton.style.display = "flex";
      createTransitionButton.style.scale = 1;
      markEndButton.style.display = "flex";
      markEndButton.style.scale = 1;
      markStartButton.style.display = "flex";
      markStartButton.style.scale = 1;
      deleteEndButton.style.display = "flex";
      deleteEndButton.style.scale = 1;
      moveButton.style.display = "flex";
      moveButton.style.scale = 1;
      deleteButton.style.display = "flex";
      deleteButton.style.scale = 1;
    }

    updateEditButtons();
  });

  deleteEndButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = false;
    endMarkingActive = false;
    endDeletionActive = !endDeletionActive;
    startMarkingActive = false;
    deleteActive = false;
    moveActive = false;
    updateEditButtons();
    endDeletionActive
      ? messageToConsole(
          "To unmark a state as end state, click on that state",
          "black"
        )
      : clearConsole();
  });

  createTransitionButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = !transitionCreationActive;
    endMarkingActive = false;
    endDeletionActive = false;
    startMarkingActive = false;
    deleteActive = false;
    moveActive = false;
    updateEditButtons();
    transitionCreationActive
      ? messageToConsole(
          "To make a transition, click a state and drag the mouse to the other state and release the mouse",
          "black"
        )
      : clearConsole();
  });

  clearButton.addEventListener("click", function () {
    automaton.clear(two);
    stateCount = 0;
    grammar.clear();
    grammar.updateOutput();
  });

  autoConvertInput.addEventListener("change", function () {
    console.log("trigger");

    automatonObserver.updateGrammar = this.checked;
    if (this.checked) {
      rightArrowButton.style.backgroundImage =
        "url('arrow_right_selected.svg')";
      rightArrowButton.click();
    } else {
      rightArrowButton.style.backgroundImage = "url('arrow_right.svg')";
    }
    updateEditButtons();
  });

  determinizeButton.addEventListener("click", function () {
    var hasEpsilonTransitions = automaton.transitions.some((t) =>
      t.via.includes("ε")
    );

    if (!hasEpsilonTransitions) {
      console.log(automaton);
      nfaToDfa = NFAToDFA(automaton, two, true);

      automaton.states = nfaToDfa.states;
      automaton.transitions = nfaToDfa.transitions;
      automaton.inputAlphabet = nfaToDfa.inputAlphabet;

      automaton.arrangeGraph(two);
    } else {
      messageToConsole("Please remove ε-transitions first!", "red");
      console.warn("Detected ε-transition");
    }
  });

  determinizePartButton.addEventListener("click", function () {
    var hasEpsilonTransitions = automaton.transitions.some((t) =>
      t.via.includes("ε")
    );

    if (!hasEpsilonTransitions) {
      console.log(automaton);
      nfaToDfa = NFAToDFA(automaton, two, false);

      automaton.states = nfaToDfa.states;
      automaton.transitions = nfaToDfa.transitions;
      automaton.inputAlphabet = nfaToDfa.inputAlphabet;

      automaton.arrangeGraph(two);
    } else {
      messageToConsole("Please remove ε-transitions first!", "red");
      console.warn("Detected ε-transition");
    }
  });

  copyButton.addEventListener("click", function (event) {
    event.preventDefault();
    grammarformToSessionStorage(
      grammar.variables,
      grammar.terminals,
      formatProductions(grammar.productions).join("\n"),
      grammar.starting
    );
    messageToConsole("Grammar copied to clipboard", "green");
    var startState = automaton.states.find((s) => s.isStart === true);
    console.log(
      calculateEpsilonClosure(startState, automaton.transitions)
    );
  });

  moveButton.addEventListener("click", function () {
    stateCreationActive = false;
    transitionCreationActive = false;
    endMarkingActive = false;
    endDeletionActive = false;
    startMarkingActive = false;
    deleteActive = false;
    moveActive = !moveActive;
    updateEditButtons();
    moveActive
      ? messageToConsole(
          "To move a state, drag and drop it to its new position",
          "black"
        )
      : clearConsole();
  });

  canvas.addEventListener("wheel", function (event) {
    event.preventDefault();
  });

  document.addEventListener("mousedown", function (event) {
    var pageScrollX = window.pageXOffset;
    var pageScrollY = window.pageYOffset;
    var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
    var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

    var isMouseInsideCanvas =
      mousePositionX >= 0 &&
      mousePositionX <= canvas.clientWidth &&
      mousePositionY >= 0 &&
      mousePositionY <= canvas.clientHeight;

    if (stateCreationActive && isMouseInsideCanvas) {
      var drawingAreaScale = two.scene.scale;
      var drawingAreaShiftX = two.scene.translation.x;
      var drawingAreaShiftY = two.scene.translation.y;

      for (let i = 0; i < automaton.states.length + 1; i++) {
        if (!automaton.states.some((element) => element.index === i)) {
          stateCount = i;
        }
      }

      var createdState = new State(
        "Z" + numberToSubscript(stateCount),
        stateCount == 0,
        false,
        stateCount
      );
      createdState.setPosition(
        (mousePositionX - drawingAreaShiftX) / drawingAreaScale,
        (mousePositionY - drawingAreaShiftY) / drawingAreaScale,
        two
      );
      automaton.addState(createdState, two);

      stateCount += 1;
    }
  });

  document.addEventListener("mousemove", function (event) {
    var pageScrollX = window.pageXOffset;
    var pageScrollY = window.pageYOffset;
    var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
    var mousePositionY = event.clientY - canvasRect.top + pageScrollY;
    var drawingAreaScale = two.scene.scale;
    var drawingAreaShiftX = two.scene.translation.x;
    var drawingAreaShiftY = two.scene.translation.y;

    var isMouseInsideCanvas =
      mousePositionX >= 0 &&
      mousePositionX <= canvas.clientWidth &&
      mousePositionY >= 0 &&
      mousePositionY <= canvas.clientHeight;

    if (
      event.buttons === 1 &&
      isMouseInsideCanvas &&
      !stateCreationActive &&
      !moveActive &&
      !transitionCreationActive &&
      !endMarkingActive
    ) {
      var xAmount = event.movementX / 1;
      var yAmount = event.movementY / 1;

      two.scene.translation.x += xAmount;
      two.scene.translation.y += yAmount;
      two.update();
    }

    if (movingState != undefined && moveActive) {
      var newPosition = {
        x: (mousePositionX - drawingAreaShiftX) / drawingAreaScale,
        y: (mousePositionY - drawingAreaShiftY) / drawingAreaScale,
      };

      automaton.moveState(movingState, newPosition, two);
    }
  });

  document.addEventListener("mouseup", () => {
    if (pieMoveActive) {
      movingState = undefined;
      pieMoveActive = false;
      moveActive = false;
    }
  });

  document.addEventListener("wheel", function (event) {
    var pageScrollX = window.pageXOffset;
    var pageScrollY = window.pageYOffset;
    var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
    var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

    var isMouseInsideCanvas =
      mousePositionX >= 0 &&
      mousePositionX <= canvas.clientWidth &&
      mousePositionY >= 0 &&
      mousePositionY <= canvas.clientHeight;
    console.log(isMouseInsideCanvas);
    if (isMouseInsideCanvas) {
      var sceneMouse = new Two.Vector(
        mousePositionX - two.scene.translation.x,
        mousePositionY - two.scene.translation.y
      );
      var zoomFactor = event.deltaY > 0 ? 0.99 : 1.01;
      two.scene.scale *= zoomFactor;
      two.scene.translation.x -= sceneMouse.x * (zoomFactor - 1);
      two.scene.translation.y -= sceneMouse.y * (zoomFactor - 1);
      two.update();
    }
  });

  window.addEventListener("resize", function () {
    document.body.style.height = window.innerHeight + "px";

    var drawingAreaWidth = document.getElementById("drawingArea").clientWidth;
    var drawingAreaHeight = document.getElementById("drawingArea").clientHeight;

    two.width = drawingAreaWidth;
    two.height = drawingAreaHeight;
    two.update();
  });

  document.addEventListener("stateMouseDown", function (event) {
    var state = event.detail.state;

    if (transitionCreationActive) {
      console.log(state.name + " from");
      userSelectedStateFrom = state;
    } else if (endMarkingActive) {
      automaton.markEnd(state, two);
    } else if (startMarkingActive) {
      if (
        automaton.states.filter((state) => state.isStart == true)
          .length > 0
      ) {
        messageToConsole(
          "More than one start state, auto grammar conversion is disabled!",
          "red"
        );
        if (autoConvertInput.checked) {
          autoConvertInput.checked = false;
          autoConvertInput.dispatchEvent(new Event("change"));
        }
      }

      automaton.markStart(state, two);
    } else if (deleteActive) {
      automaton.removeState(state, two);
    } else if (endDeletionActive) {
      automaton.unmarkEnd(state, two);
    } else if (moveActive) {
      movingState = state;
    } else {
      pieMenu.enable(
        state,
        event.detail.mouseX + window.pageXOffset,
        event.detail.mouseY + window.pageYOffset,
        canvasRect
      );
    }
  });

  document.addEventListener("pieMenuMouseDown", function (event) {
    var mousePositionX =
      event.detail.mouseX - canvasRect.left + window.pageXOffset;
    var mousePositionY =
      event.detail.mouseY - canvasRect.top + window.pageYOffset;

    var pieMenuPosX = parseFloat(pieMenu.domElement.style.left) + 200;
    var pieMenuPosY = parseFloat(pieMenu.domElement.style.top) + 200;

    var angle = Math.atan2(
      mousePositionY - pieMenuPosY,
      mousePositionX - pieMenuPosX
    );

    angle = angle * (180 / Math.PI);

    if (angle < 0) {
      angle = angle + 360;
    }

    handlePieMenuClick(angle, mousePositionX, mousePositionY);
  });

  document.addEventListener("pieMenuMouseMove", function (event) {
    var mousePositionX =
      event.detail.mouseX - canvasRect.left + window.pageXOffset;
    var mousePositionY =
      event.detail.mouseY - canvasRect.top + window.pageYOffset;

    var pieMenuPosX = parseFloat(pieMenu.domElement.style.left) + 200;
    var pieMenuPosY = parseFloat(pieMenu.domElement.style.top) + 200;

    var angle = Math.atan2(
      mousePositionY - pieMenuPosY,
      mousePositionX - pieMenuPosX
    );

    angle = angle * (180 / Math.PI);

    if (angle < 0) {
      angle = angle + 360;
    }

    handlePieMenuSelection(angle);
  });

  document.addEventListener("stateMouseUp", function (event) {
    var state = event.detail;

    if (transitionCreationActive) {
      console.log(state.name + " to");
      userSelectedStateTo = state;

      var userViaInput = prompt("Insert terminal for transition:")
        .replace(/\s/g, "")
        .split(",");

      if (userViaInput != null) {
        console.log(userViaInput);
      }

      for (let i = 0; i < userViaInput.length; i++) {
        if (
          !automaton.inputAlphabet.includes(userViaInput[i]) &&
          userViaInput[i] !== "ε"
        ) {
          automaton.addTerminal(userViaInput[i]);
        }
      }

      var createdTransition = new FaTranisition(
        userSelectedStateFrom,
        userSelectedStateTo,
        userViaInput
      );
      createdTransition.index = transitionsCount;
      transitionsCount += 1;
      automaton.addTransition(createdTransition, two);
    }

    movingState = undefined;
  });

  document.addEventListener("transitionMouseDown", function (event) {
    var transition = event.detail;

    if (deleteActive) {
      automaton.removeTranstion(transition, two);
    }
  });

  document.addEventListener("startArrowMouseDown", function (event) {
    if (deleteActive) {
      var state = event.detail;
      automaton.removeStart(state, two);
    }
  });

  rightArrowButton.addEventListener("click", function () {
    grammar = createGrammarFromNFA(automaton);
    grammar.updateOutput();
  });

  function updateEditButtons() {
    createStateButton.style.backgroundColor = stateCreationActive
      ? "green"
      : "white";
    createStateButton.style.color = stateCreationActive ? "white" : "black";
    createTransitionButton.style.backgroundColor = transitionCreationActive
      ? "green"
      : "white";
    createTransitionButton.style.color = transitionCreationActive
      ? "white"
      : "black";
    markEndButton.style.backgroundColor = endMarkingActive ? "green" : "white";
    markEndButton.style.color = endMarkingActive ? "white" : "black";
    markStartButton.style.backgroundColor = startMarkingActive
      ? "green"
      : "white";
    markStartButton.style.color = startMarkingActive ? "white" : "black";
    deleteButton.style.backgroundColor = deleteActive ? "green" : "white";
    deleteButton.style.color = deleteActive ? "white" : "black";
    moveButton.style.backgroundColor = moveActive ? "green" : "white";
    moveButton.style.color = moveActive ? "white" : "black";
    deleteEndButton.style.backgroundColor = endDeletionActive
      ? "green"
      : "white";
    deleteEndButton.style.color = endDeletionActive ? "white" : "black";
    editButton.style.backgroundColor = editActive ? "green" : "white";
    editButton.style.color = editActive ? "white" : "black";
  }

  function messageToConsole(message, color) {
    infoConsole.textContent = message;
    infoConsole.style.color = color;
  }

  function clearConsole() {
    infoConsole.textContent = "";
  }

  function handlePieMenuSelection(angle) {
    pieMove.style.backgroundColor = "white";
    pieMarkEnd.style.backgroundColor = "white";
    pieMarkStart.style.backgroundColor = "white";
    pieRemoveEnd.style.backgroundColor = "white";
    pieDelete.style.backgroundColor = "white";
    pieStartTransition.style.backgroundColor = "white";

    if (30 <= angle && angle <= 90) {
      pieMove.style.backgroundColor = "green";
    } else if (90 <= angle && angle <= 150) {
      pieMarkStart.style.backgroundColor = "green";
    } else if (150 <= angle && angle <= 210) {
      pieMarkEnd.style.backgroundColor = "green";
    } else if (210 <= angle && angle <= 270) {
      pieRemoveEnd.style.backgroundColor = "green";
    } else if (270 <= angle && angle <= 330) {
      pieStartTransition.style.backgroundColor = "green";
    } else {
      pieDelete.style.backgroundColor = "green";
    }
  }

  function handlePieMenuClick(angle, mouseX, mouseY) {
    if (30 <= angle && angle <= 90) {
      movingState = pieMenu.currentState;
      pieMoveActive = true;
      moveActive = true;
    } else if (90 <= angle && angle <= 150) {
      console.log("markStart");
      automaton.markStart(pieMenu.currentState, two);
    } else if (150 <= angle && angle <= 210) {
      console.log("MarkEnd");
      automaton.markEnd(pieMenu.currentState, two);
    } else if (210 <= angle && angle <= 270) {
      console.log("RemoveEnd");
      automaton.unmarkEnd(pieMenu.currentState, two);
    } else if (270 <= angle && angle <= 330) {
      console.log("StartTransition");
    } else {
      console.log("Delete");
      automaton.removeState(pieMenu.currentState, two);
    }

    pieMenu.disable();
  }
});
