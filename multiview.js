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
    var submitButton = document.getElementById("submit");
    var typeDisplay = document.getElementById("type");
    var variablesOutput = document.getElementById("variablesInput");
    var terminalsOutput = document.getElementById("terminalsInput");
    var productionsOutput = document.getElementById("productionsInput");
    var startingOutput = document.getElementById("startingInput");
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
        
        stateCreationActive = false;
        transitionCreationActive = false;
        deleteActive = false;
        endMarkingActive = !endMarkingActive;
        updateEditButtons();
        two.update();
    });

    deleteButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = false;
        endMarkingActive = false;
        deleteActive = !deleteActive;
        moveActive = false;
        updateEditButtons();
        two.update();
    });

    createStateButton.addEventListener("click", function(){
        
        
        stateCreationActive = !stateCreationActive;
        transitionCreationActive = false;
        endMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();
    });
    
    createTransitionButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = !transitionCreationActive;
        endMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();

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
        console.log(NFAToDFA(createdAutomaton))
    })    

    copyButton.addEventListener("click", function(event){
        event.preventDefault();
        grammarformToSessionStorage(grammar.variables, grammar.terminals, formatProductions(grammar.productions).join("\n"), grammar.starting);
        console.log(variablesOutput.textContent)
    });

    moveButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = false;
        endMarkingActive = false;
        deleteActive = false;
        moveActive = !moveActive;
        updateEditButtons();

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
            var zoomFactor = event.deltaY > 0 ? 0.99 : 1.01;
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

    submitButton.addEventListener("click", function(event){
        event.preventDefault();
        
        try{

            grammar = userInputToGrammar(variablesOutput.value, terminalsOutput.value, productionsOutput.value, startingOutput.value);

            console.log(grammar)

            typeDisplay.textContent = "Type: " + calculateGrammarType(grammar);

            createdAutomaton = createNFAFromGrammar(grammar);


            two.clear()

            createGraph(two, createdAutomaton);

            //console.log(calculateOneStepDerivations("A", 3, grammar.productions));

            console.log(decideWordProblem(grammar, "aaaa"));

            two.update();
        }

        catch(error){
            console.error(error);
        }
        
    });

    function updateEditButtons(){
        createStateButton.style.backgroundColor = (stateCreationActive) ? "green" : "transparent";      
        createStateButton.style.color = (stateCreationActive) ? "white" : "black";
        createTransitionButton.style.backgroundColor = (transitionCreationActive) ? "green" : "transparent";     
        createTransitionButton.style.color = (transitionCreationActive) ? "white" : "black";
        markEndButton.style.backgroundColor = (endMarkingActive) ? "green" : "transparent";     
        markEndButton.style.color = (endMarkingActive) ? "white" : "black";
        deleteButton.style.backgroundColor = (deleteActive) ? "green" : "transparent";      
        deleteButton.style.color = (deleteActive) ? "white" : "black";
        moveButton.style.backgroundColor = (moveActive) ? "green" : "transparent";     
        moveButton.style.color = (moveActive) ? "white" : "black";
    }

    function grammarOutput(grammar){

        variablesOutput.value = "";
        terminalsOutput.value = "";
        productionsOutput.value = "";
        startingOutput.value = "";
    
        variablesOutput.value = grammar.variables.join(", ");
        terminalsOutput.value = grammar.terminals.join(", ");
        productionsOutput.value = formatProductions(grammar.productions).join("\n");
        startingOutput.value = grammar.starting;

        typeDisplay.textContent = "Type: " + calculateGrammarType(grammar);
    }


});



