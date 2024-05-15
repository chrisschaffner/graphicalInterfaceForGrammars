document.addEventListener("DOMContentLoaded", function () {
  document.body.style.height = window.innerHeight + "px";

  var variablesIO = document.getElementById("variablesIO");
  var terminalsIO = document.getElementById("terminalsIO");
  var productionsIO = document.getElementById("productionsIO");
  var startingIO = document.getElementById("startingIO");
  var wordInput = document.getElementById("wordInput");
  var typeDisplay = document.getElementById("typeDisplay");
  var clearButton = document.getElementById("clearButton");
  var exampleButton = document.getElementById("exampleButton");
  var resolveEpsilonProductionsButton = document.getElementById(
    "resolveEpsilonProductionsButton"
  );
  var checkButton = document.getElementById("checkButton");
  var copyButton = document.getElementById("copyButton");
  var pasteButton = document.getElementById("pasteButton");
  var wordContainmentDisplay = document.getElementById("wordContainmentOutput");
  var derivationDisplay = document.getElementById("derivationOutput");
  var generateExampleWordsButton = document.getElementById(
    "generateWordsButton"
  );
  var exampleWordsDisplay = document.getElementById("exampleWords");
  var grammar;
  var infoConsole = document.getElementById("console");

  exampleButton.addEventListener("click", function (event) {
    event.preventDefault();

    variablesIO.value = ["A", "B", "C", "D"];
    terminalsIO.value = ["a", "b", "c"];
    productionsIO.value = [
      "A->ε|aB|bB|cB|aC\nB->aB|bB|cB|aC\nC->aD|bD|cD\nD->a|b|c",
    ];
    startingIO.value = "A";
    wordInput.value = "aaaa";
  });

  checkButton.addEventListener("click", function (event) {
    event.preventDefault();

    var word = wordInput.value.replace(/\s/g, "");

    try {
      grammar = userInputToGrammar(
        variablesIO.value,
        terminalsIO.value,
        productionsIO.value,
        startingIO.value
      );

      grammar.calculateGrammarType();

      var grammarHasEpsilonProductions = grammar.productions.some(
        (p) =>
          grammar.variables.some(
            (v) => checkArrayEquality([v], p.left) && v !== grammar.starting
          ) && checkArrayEquality(p.right, ["ε"])
      );

      if (grammarHasEpsilonProductions) {
        messageToConsole("Remove ε-productions first!", "red");
        return;
      }

      typeDisplay.textContent = "Type: " + grammar.type;

      var wordProblemResult = decideWordProblem(grammar, word);

      if (wordProblemResult != undefined) {
        wordContainmentDisplay.textContent = "Word is in the language";
        wordContainmentDisplay.style.color = "green";
        derivationDisplay.textContent =
          "Derivation: " +
          sententialFormPredecessorsToString(wordProblemResult);
      } else {
        wordContainmentDisplay.textContent = "Word is not in the language";
        wordContainmentDisplay.style.color = "red";
        derivationDisplay.textContent = "";
      }

      generateExampleWordsButton.style.display = "block";
    } catch (error) {
      console.error(error);
    }
  });

  clearButton.addEventListener("click", () => {
    variablesIO.value = "";
    terminalsIO.value = "";
    productionsIO.value = "";
    startingIO.value = "";
    wordInput.value = "";
    typeDisplay.textContent = "Type: ";
    wordContainmentDisplay.textContent = "";
    derivationDisplay.textContent = "";
    generateExampleWordsButton.style.display = "none";
    exampleWordsDisplay.textContent = "";
    messageToConsole("Cleared grammar!", "red");
  });

  generateExampleWordsButton.addEventListener("click", function () {
    var terminalsForms = generateTerminalsForms(grammar, 100);

    exampleWordsDisplay.textContent = terminalsForms
      ? generateTerminalsForms(grammar, 100)
      : "Grammar doesn't create any words";
    exampleWordsDisplay.style.color = terminalsForms ? "black" : "red";
  });

  copyButton.addEventListener("click", function (event) {
    event.preventDefault();
    grammarformToLocalStorage(
      variablesIO.value,
      terminalsIO.value,
      productionsIO.value,
      startingIO.value
    );
    console.log("Saved Input in local storage");
    messageToConsole("Grammar copied to clipboard", "green");
  });

  pasteButton.addEventListener("click", function (event) {
    event.preventDefault();
    variablesIO.value = localStorage.getItem("variables");
    terminalsIO.value = localStorage.getItem("terminals");
    productionsIO.value = localStorage.getItem("productions");
    startingIO.value = localStorage.getItem("starting");
    console.log("Pasted Input from local storage");
    messageToConsole("Pasted grammar from clipboard!", "black");
  });

  window.addEventListener("resize", function () {
    document.body.style.height = window.innerHeight + "px";
  });

  resolveEpsilonProductionsButton.addEventListener("click", function (event) {
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
    if (grammar.type < 2) {
      messageToConsole(
        "Grammar must be of type 2 or 3 to remove ε-productions!",
        "red"
      );
      return;
    }
    grammar.resolveEpsilonProductions();
    grammar.updateOutput();
    messageToConsole("Removed ε-productions", "black");
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
