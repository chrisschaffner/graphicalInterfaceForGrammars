document.addEventListener("DOMContentLoaded", function(){
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
        
            typeDisplay.textContent = "Type: " + calculateGrammarType(grammar);

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

    generateExampleWordsButton.addEventListener("click", function(){

        console.log("LOG")

        exampleWordsDisplay.textContent = generateTerminalsForms(grammar, 100);

    })

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

});