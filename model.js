function scriptLoaded(){
    console.log("The specific script has finished loading.");
}


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

    clear(){
        this.states = [];
        this.inputAlphabet = []; 
        this.transitions = [];
        this.generationsArray = [];
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

class SentenceForm{
    form;
    previousForm;

    constructor(form, previousForm){
        this.form = form;
        this.previousForm = previousForm;
    }

    toString(){
        return this.form;
    }
}


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

       /*  if (!checkUpperCaseLetter(variables[i][0])){
            console.log("Invalid variables, please enter only letters/numbers")
            return false
        } */
    }

    if(terminals.length == 0){
        console.log("Invalid terminals")
        return false
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
            var subscriptLength=0;
            
            for(let j=i; j<leftSide.length-i; j++){
                if(leftSide.charCodeAt(j) >= 8320 && leftSide.charCodeAt(j) <= 8329){
                    subscriptLength++;
                    i=j+subscriptLength+2;
                    continue;
                }
                else{
                    break;
                }
            }

            if(subscriptLength == 0){
                break;
            }

            if(!variables.includes(leftSide.slice(i, i+subscriptLength+2)) && !terminals.includes(leftSide.slice(i, i+subscriptLength+2))){
                return false
            }
            
        }
    }

    console.log("N")

    for(let i=0; i<rightSide.length;i++){

        if (!variables.includes(rightSide[i]) && !terminals.includes(rightSide[i]) && rightSide[i] !== 'ε'){
            var subscriptLength=0;
            
            for(let j=i; j<rightSide.length-i; j++){
                if(rightSide.charCodeAt(j) >= 8320 && rightSide.charCodeAt(j) <= 8329){
                    subscriptLength++;
                    i=j+subscriptLength+2;
                    continue;
                }
                else{
                    break;
                }
            }

            if(subscriptLength == 0){
                break;
            }

            if(!variables.includes(rightSide.slice(i, i+subscriptLength+2) && !terminals.includes(rightSide.slice(i, i+subscriptLength+2)))){
                return false
            }
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
        return 1
    }

    return 0

}

function createGrammarFromDFA(automaton){
    console.log(automaton)
    var variables = [];
    var terminals;
    var productions = [];
    var starting;

    for(i=0; i<automaton.states.length; i++){
        variables.push(automaton.states[i].name);
    }

    var startState = automaton.states.find(element => element.isStart === true);

    console.log(startState.isEnd)

    starting = startState.name;

    if(startState.isEnd){
        console.log("FFF")
        productions.push(new Production(startState.name, "ε"));
    }

    terminals = automaton.inputAlphabet;

    for(let i=0; i<automaton.states.length; i++){
        for(let j=0; j<automaton.inputAlphabet.length; j++){
            console.log("AAA")
            var successor = calculateStateSuccessorVia(automaton.transitions, automaton.states[i], automaton.inputAlphabet[j]);
            if(successor != undefined){

                productions.push(new Production(automaton.states[i].name, automaton.inputAlphabet[j] + successor.name));
            
                if(successor.isEnd){
                    productions.push(new Production(automaton.states[i].name, automaton.inputAlphabet[j]));
                }
            }
        }
    }

    return new Grammar(variables, terminals, productions, starting);
}

function calculateStateSuccessorVia(transitions, state, via){

    var successorTransition = transitions.find(element => element.from === state && element.via.includes(via));

    if(successorTransition != undefined){
        return successorTransition.to
    }

}

function formatProductions(productions) {
    var groupedProductions = {};

    productions.forEach(production => {
        if (!groupedProductions[production.left]) {
            groupedProductions[production.left] = [];
        }
        groupedProductions[production.left].push(production.right);
    });

    var formattedProductions = [];
    for (var left in groupedProductions) {
        formattedProductions.push(left + " -> " + groupedProductions[left].join(" | "));
    }

    return formattedProductions;
}

function makeDrawingAreaScreenshot(){
}

function checkWordAlphabet(terminals, word){
    
    var wordIsOverAlphabet = true;
    
    for(let i=0; i<word.length; i++){
        wordIsOverAlphabet &= (terminals.includes(word[i]));
    }

    return wordIsOverAlphabet;
}

function decideWordProblem(grammar, word){



    if(!checkWordAlphabet(grammar.terminals, word)){
        return undefined;
    }

    var n = word.length;
    var l = [new SentenceForm(grammar.starting, null)];
    var lOld;
    var i=0;

    do {
        lOld = l;
        l = next(lOld, n, grammar.productions);
        console.log(l.length);
        i++;

    }
    while(i<50 && !(l.some(element => element.form === word) || checkArrayEuquality(l, lOld)));

    
    
    return (l.find(element => element.form === word));
}

function next(l, n, productions){

    var successorDerivations = l.slice();

    for(let i=0; i<l.length; i++){

        var successorDerivation = calculateOneStepDerivations(l[i], n, productions);
        
        successorDerivations = successorDerivations.concat(successorDerivation)
            
    }

    return successorDerivations.filter(filterOutUniqueForms);
    
}
    
function calculateOneStepDerivations(sentenceForm, maxLenght, productions){
    
    var derivations = [];
    
    for(let i=0; i<sentenceForm.form.length; i++){
        for(let j=0; j<sentenceForm.form.length; j++){

            var firstPortion = sentenceForm.form.slice(0, i);

            var currentPortion = sentenceForm.form.slice(i, j+1);

            var lastPortion = sentenceForm.form.slice(j+1, sentenceForm.length);

            var matchingProductions = productions.filter(element => element.left === currentPortion);


            if(matchingProductions != undefined){
                for(let k=0; k<matchingProductions.length; k++){

                    resultingSentenceForm = new SentenceForm((firstPortion + matchingProductions[k].right + lastPortion).replace(/ε/g, ''), sentenceForm);

                    if(resultingSentenceForm.form.length <= maxLenght && resultingSentenceForm.form.length > 0){
                        derivations.push(resultingSentenceForm)
                    }
                }
            }
        }
    }

    return derivations;
}

function checkArrayEuquality(array1, array2){
    if(array1.length !== array2.length){
        return false;
    }
    for(let i=0; i<array1.length; i++){
        if(array1[i] !== array2[i]){
            return false;
        }
    }
    return true;
}

function sentenceFormPredecessorsToString(sentenceForm){
    
    var predecessors = [];
    var temp = sentenceForm;
    var outputString;
    
    while(temp != null){
        predecessors.push(temp.form);
        temp = temp.previousForm;
    }

    predecessors.reverse();
    outputString = predecessors.join(" -> ");

    return outputString;
}

const filterOutUniqueForms = (value, index, self) => {
    return self.findIndex(obj => obj.form === value.form) === index;
};

function generateTerminalsForms(grammar, maxCount){
    
    var n = 7;
    var l = [new SentenceForm(grammar.starting, null)];
    var lOld;
    var i=0;

    do {
        lOld = l;
        l = next(lOld, n, grammar.productions);
        i++;

    }
    while(i<50 && !checkArrayEuquality(l, lOld));

    l = l.filter(element => checkWordAlphabet(grammar.terminals, element.form))

    l = l.slice(0, maxCount);

    console.log(l.length)

    var stringOutput = l.join(", ");
    
    return stringOutput;


}

function grammarformToSessionStorage(variables, terminals, productions, starting){
    sessionStorage.setItem("variables", variables);
    sessionStorage.setItem("terminals", terminals);
    sessionStorage.setItem("productions", productions);
    sessionStorage.setItem("starting", starting);
}

function numberToSubscript(number){
    var input = number.toString();
    var output = "";

    for(let i=0; i<input.length; i++){
        output += String.fromCharCode(input.charCodeAt(i) + 8272);
    }

    return output
}