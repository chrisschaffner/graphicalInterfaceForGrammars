document.addEventListener("DOMContentLoaded", function(){

    document.body.style.height = window.innerHeight + "px";

    var variablesInput = document.getElementById("variablesInput");
    var terminalsInput = document.getElementById("terminalsInput");
    var productionsInput = document.getElementById("productionsInput");
    var startingInput = document.getElementById("startingInput");
    var wordInput = document.getElementById("wordInput");
    var typeDisplay = document.getElementById("type");
    var clearButton = document.getElementById("clear");
    var exampleButton = document.getElementById("exampleButton");
    var checkButton = document.getElementById("check");
    var copyButton = document.getElementById("copy");
    var pasteButton = document.getElementById("paste");
    var wordContainmentDisplay = document.getElementById("wordContainmentOutput");
    var derivationDisplay = document.getElementById("derivationOutput");
    var generateExampleWordsButton = document.getElementById("generateWordsButton");
    var exampleWordsDisplay = document.getElementById("exampleWords");
    var grammar;

    exampleButton.addEventListener("click", function(event){

        event.preventDefault();
    
        variablesInput.value = ["A", "B", "C", "D"];
        terminalsInput.value = ["a", "b", "c"];
        productionsInput.value = ["A->ε|aB|bB|cB|aC\nB->aB|bB|cB|aC\nC->aD|bD|cD\nD->a|b|c"];
        startingInput.value = "A";
        wordInput.value = "aaaa";

        console.log(numberToSubscript(2345))
    });

    checkButton.addEventListener("click", function(event){
        
        event.preventDefault();

        var word = wordInput.value.replace(/\s/g, '');

        try{
            grammar = userInputToGrammar(variablesInput.value, terminalsInput.value, productionsInput.value, startingInput.value)

            grammar.calculateGrammarType();
        
            typeDisplay.textContent = "Type: " + grammar.type;

            console.log(decideWordProblem(grammar, word));

            var wordProblemResult = decideWordProblem(grammar, word);

            if(wordProblemResult != undefined){
                wordContainmentDisplay.textContent = "Word is in the language";
                wordContainmentDisplay.style.color = 'green';
                derivationDisplay.textContent = "Derivation: " + sentenceFormPredecessorsToString(wordProblemResult);
            }
            else{
                wordContainmentDisplay.textContent = "Word is not in the language";
                wordContainmentDisplay.style.color = 'red';

            }

            generateExampleWordsButton.style.display = "block";
        
        }
        catch(error){
            console.error(error);
        }        
        
    });

    clearButton.addEventListener("click", () => {
        variablesInput.value = '';
        terminalsInput.value = '';
        productionsInput.value = '';
        startingInput.value = '';
        wordInput.value = '';
        typeDisplay.textContent = "Type: ";
        wordContainmentDisplay.textContent = "";
        derivationDisplay.textContent = "";
        generateExampleWordsButton.style.display = "none";
        exampleWordsDisplay.textContent = "";

    });

    generateExampleWordsButton.addEventListener("click", function(){

        var terminalsForms = generateTerminalsForms(grammar, 100);

        exampleWordsDisplay.textContent = terminalsForms ? generateTerminalsForms(grammar, 100) : "Grammar doesn't create any words";
        
    });

    copyButton.addEventListener("click", function(event){
        event.preventDefault();
        grammarformToSessionStorage(variablesInput.value, terminalsInput.value, productionsInput.value, startingInput.value);
        console.log("Saved Input in session storage");
    });

    pasteButton.addEventListener("click", function(event){

        event.preventDefault();
        variablesInput.value = sessionStorage.getItem("variables");
        terminalsInput.value = sessionStorage.getItem("terminals");
        productionsInput.value  = sessionStorage.getItem("productions");
        startingInput.value = sessionStorage.getItem("starting");
        console.log("Pasted Input from session storage");

    });

    window.addEventListener("resize", function(){

        document.body.style.height = window.innerHeight + "px";

    });

});