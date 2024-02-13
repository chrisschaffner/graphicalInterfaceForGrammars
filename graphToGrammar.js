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
    var makeScreenshotButton = document.getElementById("screenshot");
    var copyButton = document.getElementById("copy");
    var variablesOutput = document.getElementById("variablesOutput");
    var terminalsOutput = document.getElementById("terminalsOutput");
    var productionsOutput = document.getElementById("productionsOutput");
    var startingOutput = document.getElementById("startingOutput");
    var stateCount = 0;
    var createdStates = [];
    var createdTransitions = [];
    var createdInputAlphabet = [];
    var createdAutomaton = new FiniteAutomaton(createdStates, createdInputAlphabet, createdTransitions);
    var userSelectedStateFrom;
    var userSelectedStateTo;
    var stateCreationActive = false;
    var transitionCreationActive = false;
    var endMarkingActive = false;

  
    
    markEndButton.addEventListener("click", function(){
        
        endMarkingActive = !endMarkingActive;

        markEndButton.style.backgroundColor = (endMarkingActive) ? "green" : "transparent";
        markEndButton.style.color = (endMarkingActive) ? "white" : "black";

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
        grammarformToSessionStorage(variablesOutput.textContent, terminalsOutput.textContent, productionsOutput.textContent, startingOutput.textContent);
        console.log(variablesOutput.textContent)
    })


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
            var createdState = new State("Z" + numberToSubscript(stateCount), stateCount==0, false)
            createdState.setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale);
            createdState.createVisuals(two);
            createdAutomaton.states.push(createdState);

            console.log(createGrammarFromDFA(createdAutomaton));
            
            stateCount += 1;      
            two.update();      

            createdState.stateCircle._renderer.elem.addEventListener('mousedown', function() {
                
                if(transitionCreationActive){
                    console.log(createdState.name + ' from');
                    userSelectedStateFrom = createdState;
                }

                if(endMarkingActive){
                    createdState.isEnd = true;
                    createdState.setEnd(two, true);
                    console.log(createGrammarFromDFA(createdAutomaton));
                }
            });

            createdState.stateCircle._renderer.elem.addEventListener('mouseup', function() {
            
                if(transitionCreationActive){

                    console.log(createdState.name + ' to');
                    userSelectedStateTo = createdState;

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
                    createdAutomaton.transitions.push(createdTransition);
                    createdTransition.createVisuals(two, createdAutomaton.states);
                    console.log(createGrammarFromDFA(createdAutomaton));
                    
                    two.update();
                }
            });

            createdState.stateCircle._renderer.elem.addEventListener("mouseover", function(){
            createdState.stateCircle.stroke = 'green';
            createdState.endCircle.stroke = 'green';
            createdState.textLabel.fill = 'green';
            two.update();
            });

            createdState.stateCircle._renderer.elem.addEventListener("mouseout", function(){
            createdState.stateCircle.stroke = 'black'
            createdState.endCircle.stroke = 'black';
            createdState.textLabel.fill = 'black';
                        two.update();
            });
                    
        }

    });

    document.addEventListener("mousemove", function(event){

        var pageScrollX = window.pageXOffset;
        var pageScrollY = window.pageYOffset;
        var mousePositionX = event.clientX - canvasRect.left + pageScrollX;
        var mousePositionY = event.clientY - canvasRect.top + pageScrollY;

        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);

        if(event.buttons === 1 && isMouseInsideCanvas && !stateCreationActive && !transitionCreationActive && !endMarkingActive){
            console.log("Drag")
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
});