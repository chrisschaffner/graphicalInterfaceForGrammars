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
    var copyButton = document.getElementById("copy");
    var pasteButton = document.getElementById("paste");
    var canvas = document.getElementById("drawingArea");
    var canvasRect = canvas.getBoundingClientRect();
    var drawingAreaWidth = canvas.clientWidth;
    var drawingAreaHeight = canvas.clientHeight;
    var two = new Two({type: Two.Types.svg, width: drawingAreaWidth, height: drawingAreaHeight});
    var grammar;
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
        productionsInput.value = ["A->ε|aB|bB|cB|aC\nB->aB|bB|cB|aC\nC->aD|bD|cD\nD->a|b|c"];
        startingInput.value = "A";

    });

    clearButton.addEventListener("click", function(){
            
        variablesInput.value = [];
        terminalsInput.value = [];
        productionsInput.value = [];
        startingInput.value = [];
        two.clear();

        two.scene.translation.x = 0;
        two.scene.translation.y = 0;
        two.scene.scale = 1;

        two.update();
   

    });

    submitButton.addEventListener("click", function(event){
        event.preventDefault();
        
        try{

            grammar = userInputToGrammar(variablesInput.value, terminalsInput.value, productionsInput.value, startingInput.value);

            console.log(grammar)

            typeDisplay.textContent = "Type: " + calculateGrammarType(grammar);

            var automatonFromGrammar = createNFAFromGrammar(grammar);

            two.clear()

            createGraph(two, automatonFromGrammar);

            //console.log(calculateOneStepDerivations("A", 3, grammar.productions));

            console.log(decideWordProblem(grammar, "aaaa"));

            two.update();
        }

        catch(error){
            console.error(error);
        }
        
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

});
