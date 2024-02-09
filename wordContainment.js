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
    var wordContainmentDisplay = document.getElementById("wordContainmentOutput");
    var derivationDisplay = document.getElementById("derivationOutput");
    var generateExampleWordsButton = document.getElementById("generateWordsButton");
    var exampleWordsDisplay = document.getElementById("exampleWords");
    var grammar;



    exampleButton.addEventListener("click", function(event){

        event.preventDefault();
    
        variablesInput.value = ["A", "B", "C", "D"];
        terminalsInput.value = ["a", "b", "c"];
        productionsInput.value = ["A->ε|aB|bB|cB|aC","B->aB|bB|cB|aC","C->aD|bD|cD","D->a|b|c"];
        startingInput.value = "A";
        wordInput.value = "aaaa";
    });

    checkButton.addEventListener("click", function(event){
        
        event.preventDefault();

        var variables = variablesInput.value.replace(/\s/g, '').split(",");
        var terminals = terminalsInput.value.replace(/\s/g, '').split(",");
        var starting = startingInput.value.replace(/\s/g, '');
        var productions = [];
        var splittedProductionsInput = productionsInput.value.replace(/\s/g, '').split(",");
        var word = wordInput.value;

        wordContainmentDisplay.textContent = "";
        derivationDisplay.textContent = "";
        

        for(let i=0; i<splittedProductionsInput.length; i++){
            var splittedProductionInput = splittedProductionsInput[i].split("->");
            if (splittedProductionInput.length > 2){
                return
            }
            var rightSides = splittedProductionInput[1].split("|");
            for(let j=0; j<rightSides.length; j++){
                productions.push(new Production(splittedProductionInput[0], rightSides[j]));
            }
            
        }
        

        if(checkCorrectGrammarForm(variables, terminals, productions, starting)){

            var grammar = new Grammar(variables, terminals, productions, starting);

            typeDisplay.textContent = "Type: " + calculateGrammarType(grammar);

            console.log(decideWordProblem(grammar, word));

            var wordProblemResult = decideWordProblem(grammar, word);

            if(wordProblemResult != undefined){
                wordContainmentDisplay.textContent = "Word is in the language";
                wordContainmentDisplay.style.color = 'green';
                derivationDisplay.textContent = "Derivation: " + sentenceFormPredecessorsToString(wordProblemResult);
                //exampleWordsDisplay.textContent = "Random Example Words: "

               

            }
            else{
                wordContainmentDisplay.textContent = "Word is not in the language";
                wordContainmentDisplay.style.color = 'red';

            }
        }
        else{
            console.log("Couldnt create grammar!")
        }

        generateExampleWordsButton.style.display = "block";
        
    });

    generateExampleWordsButton.addEventListener("click", function(){
        ///do
    })

});