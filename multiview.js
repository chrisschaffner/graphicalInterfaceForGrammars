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
    var markStartButton = document.getElementById("markStart");
    var deleteButton = document.getElementById("delete");
    var makeScreenshotButton = document.getElementById("screenshot");
    var determinizeButton = document.getElementById("determinize");
    var copyButton = document.getElementById("copy");
    var moveButton = document.getElementById("move");
    var pasteButton = document.getElementById("paste");
    var autoConvertInput = document.getElementById("auto");
    var leftArrowButton = document.getElementById("leftarrow");
    var rightArrowButton = document.getElementById("rightarrow");
    rightArrowButton.style.backgroundImage = "url('arrow_right_selected.svg')";
    var InfoConsole = document.getElementById("console");
    var stateCount = 0;
    var transitionsCount = 0;
    var createdStates = [];
    var createdTransitions = [];
    var createdInputAlphabet = [];
    var createdAutomaton = new FiniteAutomaton(createdStates, createdInputAlphabet, createdTransitions, two);
    var userSelectedStateFrom;
    var userSelectedStateTo;
    var stateCreationActive = false;
    var transitionCreationActive = false;
    var endMarkingActive = false;
    var startMarkingActive = false;
    var deleteActive = false;
    var moveActive = false;
    var movingState;
    var variablesOutput = document.getElementById("variablesInput");
    var terminalsOutput = document.getElementById("terminalsInput");
    var productionsOutput = document.getElementById("productionsInput");
    var startingOutput = document.getElementById("startingInput");

    var grammar = new Grammar([],[],[], null);
    var automatonObserver = new AutomatonObserver(createdAutomaton, grammar, 0);
    createdAutomaton.addObserver(automatonObserver);    


    markEndButton.addEventListener("click", function(){
        
        stateCreationActive = false;
        transitionCreationActive = false;
        deleteActive = false;
        endMarkingActive = !endMarkingActive;
        startMarkingActive = false;
        moveActive = false;
        updateEditButtons();
        two.update();
        endMarkingActive ? messageToConsole("Click a state to mark it as end state", "black") : clearConsole();

    });

    markStartButton.addEventListener("click", function(){
        stateCreationActive = false;
        transitionCreationActive = false;
        deleteActive = false;
        endMarkingActive = false;
        startMarkingActive = !startMarkingActive;
        moveActive = false;
        updateEditButtons();
        two.update();
        startMarkingActive ? messageToConsole("Click a state to mark it as start state", "black") : clearConsole();

        
    })

    deleteButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = false;
        endMarkingActive = false;
        startMarkingActive = false;
        deleteActive = !deleteActive;
        moveActive = false;
        updateEditButtons();
        two.update();
        deleteActive ? messageToConsole("Click a state or transition to delete", "black") : clearConsole();
    });

    createStateButton.addEventListener("click", function(){
        
        stateCreationActive = !stateCreationActive;
        transitionCreationActive = false;
        endMarkingActive = false;
        startMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();
        stateCreationActive ? messageToConsole("To create a state, click in the drawing area where you want to place the state", "black") : clearConsole();

    });
    
    createTransitionButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = !transitionCreationActive;
        endMarkingActive = false;
        startMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();
        transitionCreationActive ? messageToConsole("To make a transition, click a state and drag the mouse to the other state and release the mouse", "black") : clearConsole();
        

    });
      
    clearButton.addEventListener("click", function(){
        
        createdAutomaton.clear(two);
        stateCount = 0;
                    

    });
    
    determinizeButton.addEventListener("click", function(){
        
        nfaToDfa = NFAToDFA(createdAutomaton, two);

        createdAutomaton.states = nfaToDfa.states;
        createdAutomaton.transitions = nfaToDfa.transitions;
        createdAutomaton.inputAlphabet = nfaToDfa.inputAlphabet;

        createdAutomaton.arrangeGraph(two);

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
        startMarkingActive = false;
        deleteActive = false;
        moveActive = !moveActive;
        updateEditButtons();
        moveActive ? messageToConsole("To move a state, drag and drop it to its new position", "black") : clearConsole();


    });

    autoConvertInput.addEventListener("change", function(){
        console.log("trigger")

        automatonObserver.updateGrammar = this.checked;
        if(this.checked){
            rightArrowButton.style.backgroundImage = "url('arrow_right_selected.svg')";
        }
        else{
            rightArrowButton.style.backgroundImage = "url('arrow_right.svg')";

        }
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
            createdAutomaton.addState(createdState, two);
            
            stateCount += 1;        
                
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

            /* movingState.setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale, two);
            movingState.deleteVisuals(two);
            movingState.createVisuals(two); */

            var newPosition = {x:(mousePositionX - drawingAreaShiftX)/drawingAreaScale, y:(mousePositionY - drawingAreaShiftY)/drawingAreaScale};

            createdAutomaton.moveState(movingState, newPosition, two);


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

    document.addEventListener('stateMouseDown', function(event){
        
        var state = event.detail;
        
        if(transitionCreationActive){
            console.log(state.name + ' from');
            userSelectedStateFrom = state;
        }

        if(endMarkingActive){
            createdAutomaton.markEnd(state, two);
            
        }
        console.log(startMarkingActive)
        if(startMarkingActive){
            console.log("D")
            createdAutomaton.markStart(state, two);
            console.log("FFFFs")
            

            if(createdAutomaton.states.filter(state => state.isStart == true).length > 1){
                console.log("D")
                messageToConsole("More than one start state, auto grammar conversion is disabled!", "red");
                if(autoConvertInput.checked){
                    autoConvertInput.checked = false;
                    autoConvertInput.dispatchEvent(new Event('change'));
                }
            }

        }

        if(deleteActive){
            
            createdAutomaton.removeState(state, two);
        
        }

        if(moveActive){
            var state = event.detail;
            movingState = state;

        }
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
            createdAutomaton.addTransition(createdTransition, two);

        }

        movingState = undefined;

    });

    document.addEventListener('transitionMouseDown', function(event){

        var transition = event.detail;

        if(deleteActive){
            
            transition.deleteVisuals(two);
            createdAutomaton.removeTranstion(transition, two);

            for(let i=0; i<transition.via.length; i++){

                var via = transition.via[i];

                if(createdAutomaton.transitions.some(element => element.via.includes(via)) == false){
                    var indexToDelete = createdAutomaton.inputAlphabet.indexOf(via);
                    createdAutomaton.inputAlphabet.splice(indexToDelete, 1);
                }
            }
        }
    });

    leftArrowButton.addEventListener("click", function(){
        try{

            grammar = userInputToGrammar(variablesOutput.value, terminalsOutput.value, productionsOutput.value, startingOutput.value);
            nfaFromGrammar = createNFAFromGrammar(grammar, two);
            createdAutomaton.states = nfaFromGrammar.states;
            createdAutomaton.transitions = nfaFromGrammar.transitions;
            createdAutomaton.inputAlphabet = nfaFromGrammar.inputAlphabet;
            createdAutomaton.arrangeGraph(two);
        }

        catch(error){
            console.error(error);
        }
        
    });

    rightArrowButton.addEventListener("click", function(){
        grammar = createGrammarFromNFA(createdAutomaton);
        grammar.updateOutput();
        
        
    });

    pasteButton.addEventListener("click", function(event){

        event.preventDefault();
        variablesOutput.value = sessionStorage.getItem("variables");
        terminalsOutput.value = sessionStorage.getItem("terminals");
        productionsOutput.value  = sessionStorage.getItem("productions");
        startingOutput.value = sessionStorage.getItem("starting");
        console.log("Pasted Input from session storage");

    });

    function updateEditButtons(){

        createStateButton.style.backgroundColor = (stateCreationActive) ? "green" : "transparent";      
        createStateButton.style.color = (stateCreationActive) ? "white" : "black";
        createTransitionButton.style.backgroundColor = (transitionCreationActive) ? "green" : "transparent";     
        createTransitionButton.style.color = (transitionCreationActive) ? "white" : "black";
        markEndButton.style.backgroundColor = (endMarkingActive) ? "green" : "transparent";     
        markEndButton.style.color = (endMarkingActive) ? "white" : "black";
        markStartButton.style.backgroundColor = (startMarkingActive) ? "green" : "transparent";     
        markStartButton.style.color = (startMarkingActive) ? "white" : "black";
        deleteButton.style.backgroundColor = (deleteActive) ? "green" : "transparent";      
        deleteButton.style.color = (deleteActive) ? "white" : "black";
        moveButton.style.backgroundColor = (moveActive) ? "green" : "transparent";     
        moveButton.style.color = (moveActive) ? "white" : "black";
        
    }

    function messageToConsole(message, color){
        InfoConsole.textContent = message;
        InfoConsole.style.color = color;
    }

    function clearConsole(){
        InfoConsole.textContent = "";
    }
});