

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
    var editButtons = document.getElementById("editButtons");
    var deleteButton = document.getElementById("delete");
    var deleteEndButton = document.getElementById("deleteEnd");
    var makeScreenshotButton = document.getElementById("screenshot");
    var determinizeButton = document.getElementById("determinize");
    var copyButton = document.getElementById("copy");
    var moveButton = document.getElementById("move");
    var pasteButton = document.getElementById("paste");
    var editButton = document.getElementById("editButton");
    var autoConvertInput = document.getElementById("auto");
    var leftArrowButton = document.getElementById("leftarrow");
    var rightArrowButton = document.getElementById("rightarrow");
    rightArrowButton.style.backgroundImage = "url('arrow_right_selected.svg')";
    var InfoConsole = document.getElementById("console");
    var pieDelete = document.getElementById("pieDelete");
    var pieMove = document.getElementById("pieMove");
    var pieMarkStart = document.getElementById("pieMarkStart");
    var pieMarkEnd = document.getElementById("pieMarkEnd");
    var pieRemoveEnd = document.getElementById("pieRemoveEnd");
    var pieStartTransition = document.getElementById("pieStartTransition");


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
    var endDeletionActive = false;
    var endMarkingActive = false;
    var startMarkingActive = false;
    var deleteActive = false;
    var editActive = false;
    var moveActive = false;
    var movingState;
    var variablesOutput = document.getElementById("variablesInput");
    var terminalsOutput = document.getElementById("terminalsInput");
    var productionsOutput = document.getElementById("productionsInput");
    var startingOutput = document.getElementById("startingInput");

    var grammar = new Grammar([],[],[], null);
    var automatonObserver = new AutomatonObserver(createdAutomaton, grammar, 0);
    createdAutomaton.addObserver(automatonObserver);    

    var pieMenu = new PieMenu(document.getElementById("pieMenu"), document.getElementById("test"), canvasRect);   


    markEndButton.addEventListener("click", function(){
        
        stateCreationActive = false;
        transitionCreationActive = false;
        deleteActive = false;
        endMarkingActive = !endMarkingActive;
        endDeletionActive = false;
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
        endDeletionActive = false;
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
        endDeletionActive = false;
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
        endDeletionActive = false;
        startMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();
        stateCreationActive ? messageToConsole("To create a state, click in the drawing area where you want to place the state", "black") : clearConsole();

    });

    makeScreenshotButton.addEventListener("click", function(){
    });

    editButton.addEventListener("click", () => {

        editActive = !editActive;

        editButtons.style.scale = editActive ? 1 : 0;

        if(!editActive){
            stateCreationActive = false;
            transitionCreationActive = false;
            endMarkingActive = false;
            endDeletionActive = false;
            startMarkingActive = false;
            deleteActive = false;
            moveActive = false;
        }

        updateEditButtons();
    });

    deleteEndButton.addEventListener("click", function(){
        stateCreationActive = false;
        transitionCreationActive = false;
        endMarkingActive = false;
        endDeletionActive = !endDeletionActive;
        startMarkingActive = false;
        deleteActive = false;
        moveActive = false;
        updateEditButtons();
        endDeletionActive ? messageToConsole("To unmark a state as end state, click on that state", "black") : clearConsole();
    });
    
    createTransitionButton.addEventListener("click", function(){

        stateCreationActive = false;
        transitionCreationActive = !transitionCreationActive;
        endMarkingActive = false;
        endDeletionActive = false;
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
        

        console.log(createdAutomaton);
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
        endDeletionActive = false;
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
            var xAmount = event.movementX / 1;
            var yAmount = event.movementY / 1;

            two.scene.translation.x += xAmount;
            two.scene.translation.y += yAmount;
            two.update();
        }

        if(movingState != undefined && moveActive){

            var newPosition = {x:(mousePositionX - drawingAreaShiftX)/drawingAreaScale, y:(mousePositionY - drawingAreaShiftY)/drawingAreaScale};

            createdAutomaton.moveState(movingState, newPosition, two);


        }
    });

    document.addEventListener('mouseup', () => {
        if(moveActive){
            movingState = undefined;
            moveActive = false;
        }
    })

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
        
        var state = event.detail.state;
        
        if(transitionCreationActive){
            console.log(state.name + ' from');
            userSelectedStateFrom = state;
        }

        else if(endMarkingActive){
            createdAutomaton.markEnd(state, two);
            
        }
        else if(startMarkingActive){
            
            if(createdAutomaton.states.filter(state => state.isStart == true).length > 0){

                messageToConsole("More than one start state, auto grammar conversion is disabled!", "red");
                if(autoConvertInput.checked){
                    autoConvertInput.checked = false;
                    autoConvertInput.dispatchEvent(new Event('change'));
                }
            }

            createdAutomaton.markStart(state, two);
        }

        else if(deleteActive){
            
            createdAutomaton.removeState(state, two);
        
        }

        else if(endDeletionActive){
            createdAutomaton.unmarkEnd(state, two);
        }

        else if(moveActive){
            movingState = state;

        }
        else {

            pieMenu.enable(state, event.detail.mouseX + window.pageXOffset, event.detail.mouseY + window.pageYOffset, canvasRect);
        }
    });

    document.addEventListener('pieMenuMouseDown', function(event){

        var mousePositionX = event.detail.mouseX - canvasRect.left + window.pageXOffset;
        var mousePositionY = event.detail.mouseY - canvasRect.top + window.pageYOffset;

        var pieMenuPosX = parseFloat(pieMenu.domElement.style.left) + 200;
        var pieMenuPosY = parseFloat(pieMenu.domElement.style.top) + 200;

        var angle = Math.atan2(mousePositionY - pieMenuPosY, mousePositionX - pieMenuPosX);

        angle = angle * (180/ Math.PI);

        if(angle < 0){
            angle = angle + 360;
        }

        handlePieMenuClick(angle, mousePositionX, mousePositionY);


    });

    document.addEventListener('pieMenuMouseMove', function(event){

        var mousePositionX = event.detail.mouseX - canvasRect.left + window.pageXOffset;
        var mousePositionY = event.detail.mouseY - canvasRect.top + window.pageYOffset;

        var pieMenuPosX = parseFloat(pieMenu.domElement.style.left) + 200;
        var pieMenuPosY = parseFloat(pieMenu.domElement.style.top) + 200;

        var angle = Math.atan2(mousePositionY - pieMenuPosY, mousePositionX - pieMenuPosX);

        angle = angle * (180/ Math.PI);

        if(angle < 0){
            angle = angle + 360;
        }

        handlePieMenuSelection(angle);


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
                    createdAutomaton.addTerminal(userViaInput[i]);
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
            
            createdAutomaton.removeTranstion(transition, two);
        }
    });

    document.addEventListener('startArrowMouseDown', function(event){
        
        if(deleteActive){
            var state = event.detail;
            createdAutomaton.removeStart(state, two);
        }
    });

    leftArrowButton.addEventListener("click", function(event){
        
        event.preventDefault();

        grammar = userInputToGrammar(variablesOutput.value, terminalsOutput.value, productionsOutput.value, startingOutput.value);
        grammar.calculateGrammarType();
        console.log(createdAutomaton);

        if(grammar.type === 3){
            nfaFromGrammar = createNFAFromGrammar(grammar, two);
            createdAutomaton.states = nfaFromGrammar.states;
            createdAutomaton.transitions = nfaFromGrammar.transitions;
            createdAutomaton.inputAlphabet = nfaFromGrammar.inputAlphabet;
            createdAutomaton.arrangeGraph(two);
            console.log(createdAutomaton);

        }

        else {
            grammar.updateOutput();
            messageToConsole("Grammar type is not 3, an equivalent NFA can not be constructed!", 'red');
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
        deleteEndButton.style.backgroundColor = (endDeletionActive) ? "green" : "transparent";     
        deleteEndButton.style.color = (endDeletionActive) ? "white" : "black";
        editButton.style.backgroundColor = (editActive) ? "green" : "transparent";
        editButton.style.color = (editActive) ? "white" : "black";
        
    }

    function messageToConsole(message, color){
        InfoConsole.textContent = message;
        InfoConsole.style.color = color;
    }

    function clearConsole(){
        InfoConsole.textContent = "";
    } 

    function handlePieMenuSelection(angle){

        pieMove.style.backgroundColor = 'white';
        pieMarkEnd.style.backgroundColor = 'white';
        pieMarkStart.style.backgroundColor = 'white';
        pieRemoveEnd.style.backgroundColor = 'white';
        pieDelete.style.backgroundColor = 'white';
        pieStartTransition.style.backgroundColor = 'white';



        if(30 <= angle && angle <= 90){
            pieMove.style.backgroundColor = 'red';
        }
        else if(90 <= angle && angle <= 150){
            pieMarkStart.style.backgroundColor = 'red';
        }
        else if(150 <= angle && angle <= 210){
            pieMarkEnd.style.backgroundColor = 'red';

        }
        else if(210 <= angle && angle <= 270){
            pieRemoveEnd.style.backgroundColor = 'red';

        }
        else if(270 <= angle && angle <= 330){
            pieStartTransition.style.backgroundColor = 'red';

        }
        else{
            pieDelete.style.backgroundColor = 'red';
        }


    }

    function handlePieMenuClick(angle, mouseX, mouseY){
        if(30 <= angle && angle <= 90){
            /* console.log("move")
            var drawingAreaScale = two.scene.scale;
            var drawingAreaShiftX = two.scene.translation.x;
            var drawingAreaShiftY = two.scene.translation.y;

            var newPosition = {x:(mouseX - drawingAreaShiftX)/drawingAreaScale, y:(mouseY - drawingAreaShiftY)/drawingAreaScale};

            createdAutomaton.moveState(pieMenu.currentState, newPosition, two); */

            movingState = pieMenu.currentState;
            moveActive = true;



        }
        else if(90 <= angle && angle <= 150){
            console.log("markStart")
            createdAutomaton.markStart(pieMenu.currentState, two);
        }
        else if(150 <= angle && angle <= 210){
            console.log("MarkEnd")
            createdAutomaton.markEnd(pieMenu.currentState, two);

        }
        else if(210 <= angle && angle <= 270){

            console.log("RemoveEnd")
            createdAutomaton.unmarkEnd(pieMenu.currentState, two)


        }
        else if(270 <= angle && angle <= 330){
            console.log("StartTransition")
        }
        else{
            console.log("Delete")
            createdAutomaton.removeState(pieMenu.currentState, two);
        }

        pieMenu.disable();
    }
});