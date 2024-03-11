

document.addEventListener("DOMContentLoaded", function(){

    var canvas = document.getElementById("drawingArea");
    document.getElementById("graphArea").style.marginRight = "50px";
    document.getElementById("grammarInputForm").style.marginLeft = "20px";
    document.getElementById("grammarInputForm").style.marginRight = "20px";

    var canvasRect = canvas.getBoundingClientRect();
    var drawingAreaWidth = canvas.clientWidth;
    var drawingAreaHeight = canvas.clientHeight;
    var two = new Two({type: Two.Types.svg, width: drawingAreaWidth, height: drawingAreaHeight});
    two.appendTo(canvas);  
    var clearButton = document.getElementById("clear");
    var copyButton = document.getElementById("copy");
    var pasteButton = document.getElementById("paste");
    var rightArrowButton = document.getElementById("rightarrow");
    var InfoConsole = document.getElementById("console");

    var variablesOutput = document.getElementById("variablesInput");
    var terminalsOutput = document.getElementById("terminalsInput");
    var productionsOutput = document.getElementById("productionsInput");
    var startingOutput = document.getElementById("startingInput");

    var grammar = new Grammar([],[],[], null); 
      
    clearButton.addEventListener("click", function(event){
        
        console.log("Clear");
        event.preventDefault();
        two.clear();
        two.update();
        variablesOutput.value = "";
        terminalsOutput.value = "";
        productionsOutput.value = "";
        startingOutput.value = "";
                    

    });
    

    copyButton.addEventListener("click", function(event){
        event.preventDefault();
        grammarformToSessionStorage(grammar.variables, grammar.terminals, formatProductions(grammar.productions).join("\n"), grammar.starting);
        console.log(variablesOutput.textContent)
    });


    canvas.addEventListener("wheel", function(event){
        event.preventDefault();
    });
    
    document.addEventListener("mousemove", function(event){

        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;


        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);

        if(event.buttons === 1 && isMouseInsideCanvas){
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
            var zoomFactor = event.deltaY > 0 ? 0.99 : 1.01;
            two.scene.scale *= zoomFactor;
            two.scene.translation.x -= (sceneMouse.x * (zoomFactor - 1));
            two.scene.translation.y -= (sceneMouse.y * (zoomFactor - 1));
            two.update();
        }
        
        
    });

    window.addEventListener("resize", function(){
    
        var drawingAreaWidth = document.getElementById("drawingArea").clientWidth;
        var drawingAreaHeight = document.getElementById("drawingArea").clientHeight;

        two.width = drawingAreaWidth;
        two.height = drawingAreaHeight;
        two.update();

    });


    rightArrowButton.addEventListener("click", function(event){
        
        event.preventDefault();

        grammar = userInputToGrammar(variablesOutput.value, terminalsOutput.value, productionsOutput.value, startingOutput.value);
        grammar.calculateGrammarType();

        if(grammar.type === 3){
            var createdAutomaton = createNFAFromGrammar(grammar, two);
            
            createdAutomaton.arrangeGraph(two);
            createdAutomaton.createAutomatonVisuals(two);
            console.log(createdAutomaton);

        }

        else {
            grammar.updateOutput();
            messageToConsole("Grammar type is not 3, an equivalent NFA can not be constructed!", 'red');
        }
    });

    pasteButton.addEventListener("click", function(event){

        event.preventDefault();
        variablesOutput.value = sessionStorage.getItem("variables");
        terminalsOutput.value = sessionStorage.getItem("terminals");
        productionsOutput.value  = sessionStorage.getItem("productions");
        startingOutput.value = sessionStorage.getItem("starting");
        console.log("Pasted Input from session storage");

    });

    function messageToConsole(message, color){
        InfoConsole.textContent = message;
        InfoConsole.style.color = color;
    }

    function clearConsole(){
        InfoConsole.textContent = "";
    } 

});