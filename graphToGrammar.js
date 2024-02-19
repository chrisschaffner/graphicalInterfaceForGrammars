document.addEventListener("DOMContentLoaded", function(){
    var canvas = document.getElementById("drawingArea");
    var canvasRect = canvas.getBoundingClientRect();
    var drawingAreaWidth = canvas.clientWidth;
    var drawingAreaHeight = canvas.clientHeight;
    var two = new Two({type: Two.Types.svg, width: drawingAreaWidth, height: drawingAreaHeight});
    two.appendTo(canvas);  
    var clearButton = document.getElementById("clear");
    var createStateButton = document.getElementById("createState");
    var createTransitionButton = document.getElementById("createTransition");
    var markEndButton = document.getElementById("markEnd");
    var deleteButton = document.getElementById("delete");
    var makeScreenshotButton = document.getElementById("screenshot");
    var copyButton = document.getElementById("copy");
    var moveButton = document.getElementById("move");
    var variablesOutput = document.getElementById("variablesOutput");
    var terminalsOutput = document.getElementById("terminalsOutput");
    var productionsOutput = document.getElementById("productionsOutput");
    var startingOutput = document.getElementById("startingOutput");
    var stateCount = 0;
    var transitionsCount = 0;
    var createdStates = [];
    var createdTransitions = [];
    var createdInputAlphabet = [];
    var createdAutomaton = new FiniteAutomaton(createdStates, createdInputAlphabet, createdTransitions);
    var userSelectedStateFrom;
    var userSelectedStateTo;
    var stateCreationActive = false;
    var transitionCreationActive = false;
    var endMarkingActive = false;
    var deleteActive = false;
    var moveActive = false;
    var movingState;

    var grammar;


    markEndButton.addEventListener("click", function(){
        
        endMarkingActive = !endMarkingActive;

        markEndButton.style.backgroundColor = (endMarkingActive) ? "green" : "transparent";
        markEndButton.style.color = (endMarkingActive) ? "white" : "black";

        two.update();
    });

    deleteButton.addEventListener("click", function(){
        deleteActive = !deleteActive;

        deleteButton.style.backgroundColor = (deleteActive) ? "green" : "transparent";
        deleteButton.style.color = (deleteActive) ? "white" : "black";

        two.update();
    });

    createStateButton.addEventListener("click", function(){
        
        stateCreationActive = !stateCreationActive;

        createStateButton.style.backgroundColor = (stateCreationActive) ? "green" : "transparent";
        createStateButton.style.color = (stateCreationActive) ? "white" : "black";
    });
    
    createTransitionButton.addEventListener("click", function(){
            
        transitionCreationActive = !transitionCreationActive;
        createTransitionButton.style.backgroundColor = (transitionCreationActive) ? "green" : "transparent";
        createTransitionButton.style.color = (transitionCreationActive) ? "white" : "black";
    });
      
    clearButton.addEventListener("click", function(){
        
        
        console.log("End")
        two.clear();
        two.update();
        createdAutomaton.clear();
        variablesOutput.textContent = "";
        terminalsOutput.textContent = "";
        productionsOutput.textContent = "";
        startingOutput.textContent = "";
        stateCount = 0;
                    

    });
    
    makeScreenshotButton.addEventListener("click", function(){
        makeDrawingAreaScreenshot();
    })    

    copyButton.addEventListener("click", function(event){
        event.preventDefault();
        grammarformToSessionStorage(grammar.variables, grammar.terminals, formatProductions(grammar.productions).join("\n"), grammar.starting);
        console.log(variablesOutput.textContent)
    });

    moveButton.addEventListener("click", function(){
        moveActive = !moveActive;
        moveButton.style.backgroundColor = (moveActive) ? "green" : "transparent";
        moveButton.style.color = (moveActive) ? "white" : "black";
    });

    canvas.addEventListener("wheel", function(event){
        event.preventDefault();
    });
    
    document.addEventListener("mousedown", function(event){

        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);
        console.log(isMouseInsideCanvas)

        if(stateCreationActive && isMouseInsideCanvas){

            var drawingAreaScale = two.scene.scale;
            var drawingAreaShiftX = two.scene.translation.x;
            var drawingAreaShiftY = two.scene.translation.y;

            for(let i=0; i<createdAutomaton.states.length+1; i++){
                if(!createdAutomaton.states.some(element => element.index === i)){
                    stateCount = i;
                }
            }

            var createdState = new State("Z" + numberToSubscript(stateCount), stateCount==0, false, stateCount);
            createdState.setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale, two);
            createdState.createVisuals(two);
            createdAutomaton.states.push(createdState);

            grammar = createGrammarFromDFA(createdAutomaton);
            grammarOutput(grammar);
            
            stateCount += 1;     
            two.update();      
                
        }

    });

    document.addEventListener("mousemove", function(event){

        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;
        var drawingAreaScale = two.scene.scale;
        var drawingAreaShiftX = two.scene.translation.x;
        var drawingAreaShiftY = two.scene.translation.y;

        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);

        if(event.buttons === 1 && isMouseInsideCanvas && !stateCreationActive && !moveActive && !transitionCreationActive && !endMarkingActive){
            console.log("Drag")
            var xAmount = event.movementX / 1;
            var yAmount = event.movementY / 1;

            two.scene.translation.x += xAmount;
            two.scene.translation.y += yAmount;
            two.update();
        }

        if(movingState != undefined && moveActive){

            /* createdAutomaton.states.find(element => element === movingState).setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale, two);
            createdAutomaton.states.find(element => element === movingState).deleteVisuals(two);
            createdAutomaton.states.find(element => element === movingState).createVisuals(two); */

            movingState.setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale, two);
            movingState.deleteVisuals(two);
            movingState.createVisuals(two);


            for(let i=0; i<createdAutomaton.transitions.length; i++){
                createdAutomaton.transitions[i].deleteVisuals(two);
                createdAutomaton.transitions[i].createVisuals(two, createdAutomaton.states);
            }

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

    document.addEventListener('stateMouseDown', function(event){
        
        var state = event.detail;
        
        if(transitionCreationActive){
            console.log(state.name + ' from');
            userSelectedStateFrom = state;
        }

        if(endMarkingActive){
            state.isEnd = true;
            state.setEnd(two, true);
            
        }

        if(deleteActive){
            
            var indexToDelete = createdAutomaton.states.findIndex(element => element.index === state.index);
            console.log(indexToDelete)
            createdAutomaton.states[indexToDelete].deleteVisuals(two);
            createdAutomaton.states.splice(indexToDelete, 1);
        
        }

        if(moveActive){
            var state = event.detail;
            movingState = state;

        }

        grammar = createGrammarFromDFA(createdAutomaton);
        grammarOutput(grammar);
        two.update();
    });

    document.addEventListener('stateMouseUp', function(event){
        var state = event.detail;

        if(transitionCreationActive){

            console.log(state.name + ' to');
            userSelectedStateTo = state;

            var userViaInput = prompt("Insert terminal for transition:").replace(/\s/g, '').split(",");
            
            if(userViaInput != null){
                console.log(userViaInput)
            }

            for(let i=0; i<userViaInput.length; i++){
                if(!createdAutomaton.inputAlphabet.includes(userViaInput[i])){
                    createdAutomaton.inputAlphabet.push(userViaInput[i]);
                }
            }

            var createdTransition = new FaTranisition(userSelectedStateFrom, userSelectedStateTo, userViaInput);
            createdTransition.index = transitionsCount;
            transitionsCount += 1;
            createdAutomaton.transitions.push(createdTransition);
            createdTransition.createVisuals(two, createdAutomaton.states);
            
            
            grammar = createGrammarFromDFA(createdAutomaton);
            grammarOutput(grammar);
            
            two.update();
        }

        movingState = undefined;

    });

    document.addEventListener('transitionMouseDown', function(event){

        var transition = event.detail;

        if(deleteActive){
            var indexToDelete = createdAutomaton.transitions.findIndex(element => element.index === transition.index);
            createdAutomaton.transitions[indexToDelete].deleteVisuals(two);
            createdAutomaton.transitions.splice(indexToDelete, 1);

            for(let i=0; i<transition.via.length; i++){

                var via = transition.via[i];

                if(createdAutomaton.transitions.some(element => element.via.includes(via)) == false){
                    var indexToDelete = createdAutomaton.inputAlphabet.indexOf(via);
                    createdAutomaton.inputAlphabet.splice(indexToDelete, 1);
                }
            }
        }

        grammar = createGrammarFromDFA(createdAutomaton);
        grammarOutput(grammar);
    });


});

function grammarOutput(grammar){

    variablesOutput.textContent = "";
    terminalsOutput.textContent = "";
    productionsOutput.textContent = "";
    startingOutput.textContent = "";

    variablesOutput.textContent = grammar.variables.join(", ");
    terminalsOutput.textContent = grammar.terminals.join(", ");
    productionsOutput.innerHTML = formatProductions(grammar.productions).join("<br>");
    startingOutput.textContent = grammar.starting;
}