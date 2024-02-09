document.addEventListener("DOMContentLoaded", function(){


    var grammarForm = document.getElementById("grammarInputForm");
    var variablesInput = document.getElementById("variablesInput");
    var terminalsInput = document.getElementById("terminalsInput");
    var productionsInput = document.getElementById("productionsInput");
    var startingInput = document.getElementById("startingInput");
    var typeDisplay = document.getElementById("type");
    var clearButton = document.getElementById("clear");
    var submitButton = document.getElementById("submit");
    var exampleButton = document.getElementById("exampleButton");
    var canvas = document.getElementById("drawingArea");
    var canvasRect = canvas.getBoundingClientRect();
    var drawingAreaWidth = canvas.clientWidth;
    var drawingAreaHeight = canvas.clientHeight;
    var two = new Two({type: Two.Types.svg, width: drawingAreaWidth, height: drawingAreaHeight});
    two.appendTo(canvas);

    

    
    canvas.addEventListener("wheel", function(event){
        event.preventDefault();
    });
    
    document.addEventListener("mousemove", function(event){

        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);

        if(event.buttons === 1 && isMouseInsideCanvas && !stateCreationActive && !transitionCreationActive && !endMarkingActive){
            
            var xAmount = event.movementX / 1;
            var yAmount = event.movementY / 1;

            two.scene.translation.x += xAmount;
            two.scene.translation.y += yAmount;
            two.update();
        }
    });

    document.addEventListener("wheel", function(event){
        
        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;
        
        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);
        console.log(isMouseInsideCanvas)
        if(isMouseInsideCanvas){
            var sceneMouse = new Two.Vector(mousePositionX - two.scene.translation.x, mousePositionY - two.scene.translation.y);
            var zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
            two.scene.scale *= zoomFactor;
            two.scene.translation.x -= (sceneMouse.x * (zoomFactor - 1));
            two.scene.translation.y -= (sceneMouse.y * (zoomFactor - 1));
            two.update();
        }
        
        
    });

    window.addEventListener("resize", function(){
    var drawingAreaWidth = document.getElementById("drawingArea").clientWidth;
    var drawingAreaHeight = this.document.getElementById("drawingArea").clientHeight;

    two.width = drawingAreaWidth;
    two.height = drawingAreaHeight;
    two.update();

    });

    exampleButton.addEventListener("click", function(){
    
        variablesInput.value = ["A", "B", "C", "D"];
        terminalsInput.value = ["a", "b", "c"];
        productionsInput.value = ["A->ε|aB|bB|cB|aC","B->aB|bB|cB|aC","C->aD|bD|cD","D->a|b|c"];
        startingInput.value = "A";

    });

    clearButton.addEventListener("click", function(){
            
        variablesInput.value = [];
        terminalsInput.value = [];
        productionsInput.value = [];
        startingInput.value = [];
        two.clear();
   

    });

    submitButton.addEventListener("click", function(event){
        event.preventDefault();

        var variables = variablesInput.value.replace(/\s/g, '').split(",");
        var terminals = terminalsInput.value.replace(/\s/g, '').split(",");
        var starting = startingInput.value.replace(/\s/g, '');
        var productions = [];
        var splittedProductionsInput = productionsInput.value.replace(/\s/g, '').split(",");
        

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

            var automatonFromGrammar = createNFAFromGrammar(grammar);

            two.clear()

            createGraph(two, automatonFromGrammar);

            //console.log(calculateOneStepDerivations("A", 3, grammar.productions));

            console.log(decideWordProblem(grammar, "aaaa"));

            two.update();

        }
        else{
            console.log("Couldnt create grammar!")
        }
        
    });

});
