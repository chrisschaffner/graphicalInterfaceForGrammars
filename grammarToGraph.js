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
  var copyButton = document.getElementById("copyButton");
  var pasteButton = document.getElementById("pasteButton");
  var rightArrowButton = document.getElementById("rightArrowButton");
  var infoConsole = document.getElementById("console");
  var variablesIO = document.getElementById("variablesIO");
  var terminalsIO = document.getElementById("terminalsIO");
  var productionsIO = document.getElementById("productionsIO");
  var startingIO = document.getElementById("startingIO");

  var grammar = new Grammar([], [], [], null);

  clearButton.addEventListener("click", function (event) {
    event.preventDefault();
    two.clear();
    two.update();
    variablesIO.value = "";
    terminalsIO.value = "";
    productionsIO.value = "";
    startingIO.value = "";
    console.log("Grammar cleared!");
    messageToConsole("Grammar cleared!", "black");
  });

  copyButton.addEventListener("click", function (event) {
    event.preventDefault();
    grammarformToSessionStorage(
      variablesIO.value,
      terminalsIO.value,
      productionsIO.value,
      startingIO.value
    );
    console.log("Copied Input to session storage");
    messageToConsole("Grammar copied to clipboard!", "black");
  });

  canvas.addEventListener("wheel", function (event) {
    event.preventDefault();
  });

  document.addEventListener("mousemove", function (event) {
    var pageScrollX = window.pageXOffset;
    var pageScrollY = window.pageYOffset;
    var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
    var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

    var isMouseInsideCanvas =
      mousePositionX >= 0 &&
      mousePositionX <= canvas.clientWidth &&
      mousePositionY >= 0 &&
      mousePositionY <= canvas.clientHeight;

    if (event.buttons === 1 && isMouseInsideCanvas) {
      var xAmount = event.movementX / 1;
      var yAmount = event.movementY / 1;

      two.scene.translation.x += xAmount;
      two.scene.translation.y += yAmount;
      two.update();
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

  rightArrowButton.addEventListener("click", function (event) {
    event.preventDefault();

    try {
      grammar = userInputToGrammar(
        variablesIO.value,
        terminalsIO.value,
        productionsIO.value,
        startingIO.value
      );
    } catch (error) {
      messageToConsole(error.message, "red");
      console.error(error.message);
      return;
    }
    grammar.calculateGrammarType();
    grammar.updateOutput();

    if (grammar.type === 3) {
      var automaton = createNFAFromGrammar(grammar, two);

      automaton.arrangeGraph(two);
      automaton.createAutomatonVisuals(two);
      messageToConsole("Equivalent automaton created!", "green");
    } else {
      messageToConsole(
        "Grammar type is not 3, an equivalent NFA can not be constructed!",
        "red"
      );
    }
  });

  pasteButton.addEventListener("click", function (event) {
    event.preventDefault();
    variablesIO.value = sessionStorage.getItem("variables");
    terminalsIO.value = sessionStorage.getItem("terminals");
    productionsIO.value = sessionStorage.getItem("productions");
    startingIO.value = sessionStorage.getItem("starting");
    console.log("Pasted Input from session storage");
    messageToConsole("Pasted grammar from clipboard!", "black");
  });

  /**
   * Prints a message to the info console in a specified color
   * @param {String} message the message text
   * @param {String} color the color, e.g. 'white'
   */
  function messageToConsole(message, color) {
    infoConsole.textContent = message;
    infoConsole.style.color = color;
  }
});
