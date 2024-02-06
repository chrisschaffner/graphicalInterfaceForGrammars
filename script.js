
class Grammar {
    variables
    terminals
    productions
    starting

    constructor(variables, terminals, productions, starting){
        this.variables = variables;
        this.terminals = terminals;
        this.starting = starting;
        this.productions = productions;
    }

    toString(){
        return `Variables: ${this.variables} \n Terminals: ${this.terminals} \n Starting: ${this.starting} \n Productions: ${this.productions}`;
    }

    get variables(){
        return this.variables
    }
    
    get terminals(){
        return this.terminals
    }

    get productions(){
        return this.productions
    }
    get starting(){
        return this.starting
    }
    
}

class Production {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    toString() {
        return `${this.left} -> ${this.right}`; 
    }
}

class FiniteAutomaton{
    states;
    inputAlphabet;
    transitions = [];
    generationsArray;

    constructor(states, inputAlphabet, transitions){
        this.states = states
        this.inputAlphabet = inputAlphabet;

        for(let i=0; i<states.length;i++){
            for(let j=0; j<states.length; j++){
                var viaArray = transitions .filter(element => element.from === states[i] && element.to === states[j])
                                                    .map(element => element.via)
                                                    .filter(onlyUnique);
                              
                if(viaArray.length > 0){
                    this.transitions.push(new FaTranisition(states[i], states[j], viaArray));
                }
            }
        }
    }

    

}

class State{
    name;
    posX;
    posY;
    isStart;
    isEnd;
    generation;
    stateCircle;
    endCircle;
    textLabel;
    startArrow;

    constructor(name, isStart, isEnd){
        this.name = name;
        this.isStart = isStart;
        this.isEnd = isEnd;
    }

    toString(){
        return this.name;
    }

    setPosition(posX, posY){
        this.posX = posX;
        this.posY = posY;
    }

    setGeneration(generation){
        this.generation = generation;
    }

    createVisuals(two){

        this.stateCircle = new Two.Circle(this.posX, this.posY, 100);
        this.stateCircle.fill = 'transparent';
        this.stateCircle.stroke = 'black';
        this.stateCircle.linewidth = 8;
        
        this.textLabel = new Two.Text(this.name, this.posX, this.posY);
        this.textLabel.size = 60;    

        this.endCircle = new Two.Circle(this.posX, this.posY, 85);
        this.endCircle.fill = 'transparent';
        this.endCircle.linewidth = 0;

        if(this.isEnd){
            this.endCircle.linewidth = 8;
        }

        if(this.isStart){
            this.startArrow = two.makeArrow(this.posX-200, this.posY, this.posX-100, this.posY, 40);
            this.startArrow.linewidth = 8;
        }

        two.add(this.textLabel);
        two.add(this.endCircle);
        two.add(this.stateCircle);
        two.update();
        
    }

    setEnd(two, bool){
        
        two.remove(this.textLabel);
        two.remove(this.stateCircle);
        
        if(bool){

            this.endCircle.linewidth = 8;

            two.add(this.textLabel);
            two.add(this.endCircle);
            two.add(this.stateCircle);
            two.update();
        }
        
    }

}

class FaTranisition{
    from;
    to;
    via = [];
    startVector;
    endVector;
    transitionLine;

    constructor(from, to, via){
        this.from = from;
        this.to = to;
        this.via = via;
    }

    toString(){
        return "(" + this.from.name + ", " + this.to.name + ")";
    }

    createVisuals(two, states){

        console.log(this);
    
        if (this.from == this.to){
    
            var x1 = this.from.posX + Math.cos(-Math.PI/2)*100;
            var y1 = this.from.posY + Math.sin(-Math.PI/2)*100; 
            var x2 = this.from.posX + Math.cos(-1*Math.PI/3)*200;
            var y2 = this.from.posY + Math.sin(-1*Math.PI/3)*200;
            var x3 = this.from.posX + Math.cos(-1*Math.PI/6) * 100;
            var y3 = this.from.posY + Math.sin(-1*Math.PI/6) * 100;
    
            
            this.transitionLine = two.makePath(x1, y1, x2, y2, x3, y3);
            this.transitionLine.opacity = .3;
    
            var label = two.makeText(this.via, x2+30, y2-30);
            label.size = 30;
            label.opacity = .3    
        }
    
        else{
    
            
            var angle = Math.atan2(this.to.posY - this.from.posY, this.to.posX - this.from.posX);
    
            var x1 = this.from.posX + Math.cos(angle)*100;
            var y1 = this.from.posY + Math.sin(angle)*100;
            var x2 = this.to.posX - Math.cos(angle)*100;
            var y2 = this.to.posY - Math.sin(angle)*100;
    
            this.startVector = {x: x1,y: y1};
            this.endVector = {x: x2, y: y2};

    
            this.transitionLine = two.makePath(x1, y1, x2, y2);
     
            var label = two.makeText(this.via, Math.floor((x2+x1)/2), Math.floor((y2+y1)/2)-30);
            label.size = 30;
    
            var amount = 40;
    
            var deformationFactor = 1;
    
    
            for(let i=0; i<states.length; i++){
                var circleCenter = {x: states[i].posX, y: states[i].posY};
            
                if(checkLineCircleIntersection(this.startVector, this.endVector, circleCenter, 99)){
                
                    var pointToInsert = calculateMedianVertex(this.startVector, this.endVector);
                    const oldMedian = calculateMedianVertex(this.startVector, this.endVector);
                    two.remove(this.transitionLine);
    
                    while(amount < 500 && (checkLineCircleIntersection(this.startVector, pointToInsert, circleCenter, 100) || checkLineCircleIntersection(pointToInsert, this.endVector, circleCenter, 100))){
                    
                    two.remove(this.transitionLine)
                    
                    var slope = calculateLineSlope(this.startVector, this.endVector);
                    console.log(slope)
                    if(slope == Infinity){
                        pointToInsert.x += amount;
                    }
                    if(Math.abs(slope) < 0.05){
                        pointToInsert.y += amount
                    }
                    else{
                        pointToInsert.x += amount * slope;
                        pointToInsert.y += amount*(1/slope);
                    }
                    
                    this.transitionLine = two.makePath(x1,y1, pointToInsert.x, pointToInsert.y, x2, y2);
    
                    label.translation.x += (pointToInsert.x - oldMedian.x) * 0.55;
                    label.translation.y += (pointToInsert.y - oldMedian.y) * .55;
    
                    deformationFactor += Math.sqrt((pointToInsert.x - oldMedian.x)^2 + (pointToInsert.y - oldMedian.y)^2);
                    
                    angle = Math.atan2(this.endVector.y - pointToInsert.y, this.endVector.x - pointToInsert.x);
                    
                    amount += .1;
                    }
              
                }
    
            }
    
            var v1 = {x:100, y:150}
            var v2 = {x:150, y:10}
            var v3 = {x:200, y:150}
    
            var arrowhead = two.makePath(v1.x, v1.y, v2.x, v2.y ,v3.x, v3.y);
    
            var xOffset = Math.cos(angle) * -18; 
            var yOffset = Math.sin(angle) * -18;
        
            arrowhead.fill = "black"
            arrowhead.scale = .3
            arrowhead.translation.x = this.endVector.x + xOffset
            arrowhead.translation.y = this.endVector.y + yOffset
            arrowhead.rotation = angle + (Math.PI/2);
            console.log(deformationFactor)
        
        }
    
        
        this.transitionLine.closed = false;
        this.transitionLine.fill = "transparent"
        this.transitionLine.curved = true;
        this.transitionLine.stroke = "black"
        this.transitionLine.linewidth = 8;
    }


}

document.addEventListener("DOMContentLoaded", function(){


    var canvas = document.getElementById("drawingArea");
    var canvasRect = canvas.getBoundingClientRect();
    var drawingAreaWidth = canvas.clientWidth;
    var drawingAreaHeight = canvas.clientHeight;



    var two = new Two({type: Two.Types.svg, width: drawingAreaWidth, height: drawingAreaHeight});
    two.appendTo(canvas);


    var grammarForm = document.getElementById("grammarInputForm");
    var variablesInput = document.getElementById("variablesInput");
    var terminalsInput = document.getElementById("terminalsInput");
    var productionsInput = document.getElementById("productionsInput");
    var startingInput = document.getElementById("startingInput");
    var typeDisplay = document.getElementById("type");
    var exampleButton = document.getElementById("exampleButton");
    var clearButton = document.getElementById("clear");
    var submitButton = document.getElementById("submit");
    var createStateButton = document.getElementById("createState");
    var createTransitionButton = document.getElementById("createTransition");
    var markEndButton = document.getElementById("markEnd");


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

    if(exampleButton != undefined){
        exampleButton.addEventListener("click", function(){
            variablesInput.value = ["A", "B", "C", "D"];
            terminalsInput.value = ["a", "b", "c"];
            productionsInput.value = ["A->ε|aB|bB|cB|aC","B->aB|bB|cB|aC","C->aD|bD|cD","D->a|b|c"];
            startingInput.value = "A";
        });
    }

    if(createStateButton != undefined){
        createStateButton.addEventListener("click", function(){
            
            stateCreationActive = !stateCreationActive;

            createStateButton.style.backgroundColor = (stateCreationActive) ? "green" : "transparent";
            createStateButton.style.color = (stateCreationActive) ? "white" : "black";
        });
    }

    if(createTransitionButton != undefined){
        createTransitionButton.addEventListener("click", function(){
                
            transitionCreationActive = !transitionCreationActive;
            createTransitionButton.style.backgroundColor = (transitionCreationActive) ? "green" : "transparent";
            createTransitionButton.style.color = (transitionCreationActive) ? "white" : "black";
        });
    }    

    if(clearButton != undefined){
        clearButton.addEventListener("click", function(){
            variablesInput.value = [];
            terminalsInput.value = [];
            productionsInput.value = [];
            startingInput.value = [];
            two.clear();
        })
    }

    if(submitButton != undefined){
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
    
                two.update();
    
            }
            else{
                console.log("Couldnt create grammar!")
            }
            
        });
    }

    if(markEndButton != undefined){
        markEndButton.addEventListener("click", function(){
            
            endMarkingActive = !endMarkingActive;

            markEndButton.style.backgroundColor = (endMarkingActive) ? "green" : "transparent";
            markEndButton.style.color = (endMarkingActive) ? "white" : "black";

            two.update();
        });
    }
            
    document.addEventListener("mousedown", function(event){

        var mousePositionX = event.clientX - canvasRect.left;
        var mousePositionY = event.clientY - canvasRect.top;

        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);
        console.log(isMouseInsideCanvas)

        if(stateCreationActive && isMouseInsideCanvas){

            var drawingAreaScale = two.scene.scale;
            var drawingAreaShiftX = two.scene.translation.x;
            var drawingAreaShiftY = two.scene.translation.y;
            var createdState = new State("z" + stateCount.toString(), stateCount==0, false)
            createdState.setPosition((mousePositionX - drawingAreaShiftX)/drawingAreaScale, (mousePositionY - drawingAreaShiftY)/drawingAreaScale);
            createdState.createVisuals(two);
            createdAutomaton.states.push(createdState);
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
                    console.log(createdAutomaton)
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

        var mousePositionX = event.clientX - canvasRect.left;
        var mousePositionY = event.clientY - canvasRect.top;

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
        
        var mousePositionX = event.clientX - canvasRect.left;
        var mousePositionY = event.clientY - canvasRect.top;
        var isMouseInsideCanvas = (mousePositionX >= 0 && mousePositionX <= canvas.clientWidth && mousePositionY >= 0 && mousePositionY <= canvas.clientHeight);
        
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
    
    two.update();
    });

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

function computeLineLength(point1, point2) {
    const x1 = point1.x;
    const y1 = point1.y;
    const x2 = point2.x;
    const y2 = point2.y;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function checkCorrectGrammarForm(variables, terminals, productions, starting){

    for (let i=0; i<variables.length; i++){
        var charAtI = variables[i];

        if (!checkUpperCaseLetter(charAtI)){
            return false
        }
    }

    console.log("Passed variables check");

    for (let i=0; i<terminals.length; i++){
        
        var charAtI = terminals[i];

        if (!checkLowerCaseLetter(charAtI)){
            return false
        }
    }

    console.log("Passed terminals check");

    for(let i=0; i<productions.length; i++){
        if(!checkProduction(productions[i], variables, terminals)){
            return false
        }  
    }

    console.log("Passed productions check");

    if (!variables.includes(starting)){
        console.log("FFF");
        return false
    }


    return true;    

}

function checkUpperCaseLetter(char){
    return (65 <= char.charCodeAt(0) && char.charCodeAt(0) <= 90)
}

function checkLowerCaseLetter(char){
    console.log(char.charCodeAt(0));
    return ((97 <= char.charCodeAt(0) && char.charCodeAt(0) <= 122) || char.charCodeAt(0) == 949)
}

function checkProduction(production, variables, terminals){
    var leftSide = production.left;
    var rightSide = production.right;

    for(let i=0; i<leftSide.length;i++){

        if (!variables.includes(leftSide[i]) && !terminals.includes(leftSide[i])){
            return false
          
        }
    }

    for(let i=0; i<rightSide.length;i++){
        if (!(variables.includes(rightSide[i]) || terminals.includes(rightSide[i]) || rightSide[i] == "ε")){
            return false
        }
    }

    return true;
}

function checkFiniteAutomaton(states, inputAlphabet, startStates, endStates, faTransitions){
    if (startState.length < 1){
        console.log("Missing start state!");
        return false;
    }
    for(let i=0; i<startStates.length; i++){
        if (!states.includes(startStates[i])){
            return false;
        }
    }
    for(let i=0; i<endStates.length; i++){
        if (!states.includes(endStates[i])){
            return false;
        }
    }

    const alphabetStatesIntersects = inputAlphabet.filter(value => states.includes(value));

    if(alphabetStatesIntersects.length > 0){
        console.log("Input alphabet and states can not intersect!");
        return false;
    }

    for(let i=0; i<faTransitions; i++){
        if(!checkFaTransition(faTransitions[i, inputAlphabet, states])){
            return false;
        }
    }

}

function checkFaTransition(transition, alphabet, states){
    var from = transition.from;
    var to = transition.to;
    var via = transition.via;


    if(!states.includes(from) && !states.includes(to)){
        console.log("Transition invalid!");
        return false;
    }

    for(let i=0; i<via.length; i++){
        if(!alphabet.includes(via[i])){
            console.log("Invalid transition!");
            return false;
        }
    }

    

}



function calculateMedianVertex(point1, point2){
    return {x: (point2.x+point1.x)/2, y: (point2.y+point1.y)/2}

    
}

function calculateLineSlope(point1, point2){
    return ((point2.y-point1.y)/(point1.x-point2.x))
}

function createGraph(two, automaton){
    var states = automaton.states
    var transitions = automaton.transitions;

    calculateStatesGenerations(states, transitions);
    calculateGenerationsArray(automaton);
    calculateStatePositions(automaton);

    for(let i=0; i<states.length; i++){
        states[i].createVisuals(two);
    }


    for (let i = 0; i < transitions.length; i++) {
            //createTwoTransition(two, transitions[i], states);
            transitions[i].createVisuals(two, states);
        }
}

function calculateStateSuccessors(faTransitions, state){
    var successors = [];
    for(let i=0; i<faTransitions.length; i++){
        if(faTransitions[i].from == state && faTransitions[i].to != state){
            successors.push(faTransitions[i].to);
        }

    }
    return successors;
}

function calculateStatePredecessor(faTransitions, state){
    var predecessor;
    for(let i=0; i<faTransitions.length; i++){
        if(faTransitions[i].to == state && faTransitions[i].from != state){
            predecessor = faTransitions[i].from;
        }

    }
    return predecessor;
}

function calculateStatesGenerations(states, faTransitions){

    

    for(let i=0; i<states.length; i++){

        states[i].setGeneration(calculateStateGeneration(states[i], faTransitions));
    }
}

function calculateStateGeneration(state, faTransitions){

    if(state.isStart){
        return 0
    }
    else{

        if(calculateStatePredecessor(faTransitions, state) == undefined){
            return 0;
        }

        return calculateStateGeneration(calculateStatePredecessor(faTransitions, state), faTransitions) + 1;
    }
}

function calculateStatePositions(automaton){
    
    for(let i=0; i<automaton.generationsArray.length; i++){
        
        for(let j=0; j<automaton.generationsArray[i].length; j++){
            automaton.generationsArray[i][j].posY = 400 + (300 * j) 
            automaton.generationsArray[i][j].posX = 200 + 300 * i;
        }
    }

}

function calculateGenerationsArray(automaton){
    var states = automaton.states;

    let maxGeneration = 0;

    states.forEach(state => {
        if (state.generation > maxGeneration) {
            maxGeneration = state.generation;
        }
    });
    
    automaton.generationsArray = [];

    for(let i=0; i<=maxGeneration; i++){
        automaton.generationsArray[i] = [];
    }


    for(let i=0; i<states.length; i++){
        var stateGeneration = states[i].generation;
        automaton.generationsArray[stateGeneration].push(states[i]);
    }

    console.log(automaton.generationsArray);

}

function checkTransitionStatesIntersection(two, transition, states) {

    
    var arrowStartCoords = transition.startVector;
    var arrowEndCoords = transition.endVector;


    
    var transitionLength = computeLineLength(arrowStartCoords, arrowEndCoords);
    var fromVector = {x: transition.from.posX, y: transition.from.posY};
    var toVector = {x: transition.to.posX, y: transition.to.posY};

    var distanceBetweenStates = computeLineLength(fromVector, toVector); 


    if(transitionLength + 200 < distanceBetweenStates){
        
        return false;
    }




    
    for(let i=0; i<states.length; i++){
        var circleCenterCoords = {x: states[i].posX, y: states[i].posY};
        var circleRadius = 100;
        if(checkLineAndCircleIntersection(arrowStartCoords, arrowEndCoords, circleCenterCoords, circleRadius)){
            console.log("Intersecting: ");
            console.log(transition.toString());
            return true;
        }
        else{
            return false;
        }
    }

}

function checkLineCircleIntersection(lineStart, lineEnd, circleCenter, circleRadius){
    const startToCenterVector = { x: circleCenter.x - lineStart.x, y: circleCenter.y - lineStart.y };

    // Calculate vector from line start to line end
    const startToEndVector = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };

    // Calculate squared length of line segment
    const lineLengthSquared = startToEndVector.x * startToEndVector.x + startToEndVector.y * startToEndVector.y;

    // Calculate dot product of startToCenterVector and startToEndVector
    const dotProduct = startToCenterVector.x * startToEndVector.x + startToCenterVector.y * startToEndVector.y;

    let closestPointOnLine;

    // Check if the line segment is degenerate (length is zero)
    if (lineLengthSquared === 0) {
        // If the line segment is a single point, use that point as the closest point
        closestPointOnLine = lineStart;
    } else {
        // Calculate the parameter t for the closest point on the line
        const t = Math.max(0, Math.min(1, dotProduct / lineLengthSquared));

        // Calculate the coordinates of the closest point on the line segment
        closestPointOnLine = {
            x: lineStart.x + t * startToEndVector.x,
            y: lineStart.y + t * startToEndVector.y
        };
    }

    // Calculate the distance between the closest point and the circle center
    const distanceToClosestPointSquared = Math.pow(circleCenter.x - closestPointOnLine.x, 2) + Math.pow(circleCenter.y - closestPointOnLine.y, 2);

    // Check if the distance is less than or equal to the square of the circle radius
    return distanceToClosestPointSquared <= circleRadius * circleRadius;
}

function createNFAFromGrammar(grammar){
    
    var variables = grammar.variables;
    var starting = grammar.starting;
    var inputAlphabet = grammar.terminals;
    var productions = grammar.productions;

    var states = []
    var transitions = []


    for(let i=0; i<variables.length; i++){
        states.push(new State(variables[i], false, false));
    }

    console.log(starting)

    var startingState = states.find(element => element.name === starting);
    if (startingState) {
        startingState.isStart = true;
    }

    states.push(new State("Ze", false, true));

    for(let i=0; i<variables.length; i++){
        for(let j=0; j<inputAlphabet.length; j++){
    
            for(let k=0; k<productions.length; k++){
                if(productions[k].right.length === 2 &&
                   productions[k].left === variables[i] &&
                   productions[k].right[0] === inputAlphabet[j]){

                    let b = productions[k].right[1];
                    let stateB = states.find(element => element.name === b);
                    let stateI = states.find(element => element.name === variables[i]);
                    transitions.push(new FaTranisition(stateI, stateB, inputAlphabet[j]));
                }
            }
    
            let productionToCheck = productions.find(element => (element.left === variables[i] && element.right === inputAlphabet[j]));
            if(productionToCheck != undefined){
                let stateI = states.find(element => element.name === variables[i]);
                let zeState = states.find(element => element.name === "Ze");
                transitions.push(new FaTranisition(stateI, zeState, inputAlphabet[j]));
            }
        }
    }
    

    if(productions.some(element => (element.left === starting && element.right === "ε"))){

        states.find(element => element.name === starting).isEnd = true;
    
    }

    console.log(states);

    var automaton = new FiniteAutomaton(states, inputAlphabet, transitions);
    

    return automaton;
}

function calculateGrammarType(grammar){
    
    var productions = grammar.productions;
    var variables = grammar.variables;
    var terminals = grammar.terminals.slice();
    terminals.push("ε");

    var isType1 = true;
    var isType2 = true;
    var isType3 = true;

    for(let i=0; i<productions.length; i++){
        
        isType1 &= (productions[i].left.length <= productions[i].right.length);
        isType2 &= (isType1 && variables.includes(productions[i].left));
        isType3 &= (isType2 && productions[i].right.length <= 2 && (terminals.includes(productions[i].right[0]) && (terminals.includes(productions[i].right.slice(-1)) ||variables.includes(productions[i].right.slice(-1)))));
    }

    if(isType3){
        return 3
    }
    if(isType2){
        return 2
    }
    if(isType1){
        return 0
    }

    return 0

}