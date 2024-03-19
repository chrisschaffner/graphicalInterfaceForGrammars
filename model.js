function scriptLoaded() {
  console.log("The specific script has finished loading.");
}

class Grammar {
  variables;
  terminals;
  productions;
  starting;
  variablesIO;
  terminalsIO;
  productionsIO;
  startingIO;
  typeDisplay;
  type;

  constructor(variables, terminals, productions, starting) {
    this.variables = variables;
    this.terminals = terminals;
    this.starting = starting;
    this.productions = productions;
    this.variablesIO = document.getElementById("variablesIO");
    this.terminalsIO = document.getElementById("terminalsIO");
    this.productionsIO = document.getElementById("productionsIO");
    this.startingIO = document.getElementById("startingIO");
    this.typeDisplay = document.getElementById("typeDisplay");
  }

  toString() {
    return `Variables: ${this.variables} \n Terminals: ${this.terminals} \n Starting: ${this.starting} \n Productions: ${this.productions}`;
  }

  get variables() {
    return this.variables;
  }

  get terminals() {
    return this.terminals;
  }

  get productions() {
    return this.productions;
  }
  get starting() {
    return this.starting;
  }

  updateOutput() {
    this.variablesIO.value = "";
    this.terminalsIO.value = "";
    this.productionsIO.value = "";
    this.startingIO.value = "";

    this.variablesIO.value = this.variables.join(", ");
    this.terminalsIO.value = this.terminals.join(", ");
    this.productionsIO.value = formatProductions(this.productions).join("\n");
    this.startingIO.value = this.starting;

    this.calculateGrammarType();

    this.typeDisplay.textContent = "Type: " + (this.type ? this.type : "");
  }

  calculateGrammarType() {
    var productions = this.productions;
    var variables = this.variables;
    var terminals = this.terminals.slice();
    terminals.push("ε");

    var isType1 = true;
    var isType2 = true;
    var isType3 = true;

    for (let i = 0; i < productions.length; i++) {
      isType1 &= productions[i].left.length <= productions[i].right.length;
      isType2 &= isType1 && variables.includes(productions[i].left.join(""));
      isType3 &=
        isType2 &&
        ((productions[i].right.length === 1 &&
          (terminals.includes(productions[i].right[0]) ||
            variables.includes(productions[i].right[0]))) ||
          (productions[i].right.length === 2 &&
            terminals.includes(productions[i].right[0]) &&
            variables.includes(productions[i].right[1])));
    }

    if (isType3) {
      this.type = 3;
      return;
    }
    if (isType2) {
      this.type = 2;
      return;
    }
    if (isType1) {
      this.type = 1;
      return;
    }

    this.type = 0;
    return;
  }

  clear() {
    this.variables = [];
    this.terminals = [];
    this.productions = [];
    this.starting = "";
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

class FiniteAutomaton {
  states;
  inputAlphabet;
  transitions = [];
  generationsArray;
  observers = [];
  dfaDisplay;

  constructor(states, inputAlphabet, transitions, two) {
    this.states = states;
    this.inputAlphabet = inputAlphabet;

    for (let i = 0; i < transitions.length; i++) {
      var sameFromAndToTransition = this.transitions.find(
        (t) => t.from === transitions[i].from && t.to === transitions[i].to
      );

      if (!sameFromAndToTransition) {
        this.transitions.push(transitions[i]);
      } else {
        sameFromAndToTransition.via = sameFromAndToTransition.via.concat(
          transitions[i].via
        );
        sameFromAndToTransition.via =
          sameFromAndToTransition.via.filter(onlyUnique);
      }
    }

    this.dfaDisplay = document.getElementById("isDFA");

    this.notfiyObservers(two);
  }

  arrangeGraph(two) {
    console.log(this.states);
    this.createStatesGenerations();

    this.states = this.states.filter((state) => state.generation != undefined);
    this.calculateGenerationsArray();
    this.calculateStatePositions();
    this.transitions = this.transitions.filter(
      (t) => this.states.includes(t.from) && this.states.includes(t.to)
    );

    this.notfiyObservers(two);
  }

  clear(two) {
    this.states.forEach((s) => s.deleteVisuals(two));
    this.transitions.forEach((t) => t.deleteVisuals(two));
    this.states = [];
    this.inputAlphabet = [];
    this.transitions = [];
    this.generationsArray = [];
    this.notfiyObservers(two);
  }

  addState(state, two) {
    this.states.push(state);
    this.notfiyObservers(two);
  }

  removeState(state, two) {
    state.deleteVisuals(two);
    this.states = this.states.filter((s) => s.name !== state.name);
    this.notfiyObservers(two);
  }

  moveState(state, position, two) {
    state.setPosition(position.x, position.y);
    this.notfiyObservers(two);
  }

  addTransition(transition, two) {
    var sameFromAndToTransition = this.transitions.find(
      (t) => t.from === transition.from && t.to === transition.to
    );

    if (sameFromAndToTransition) {
      sameFromAndToTransition.via = sameFromAndToTransition.via.concat(
        transition.via
      );
      sameFromAndToTransition.via =
        sameFromAndToTransition.via.filter(onlyUnique);
    } else {
      this.transitions.push(transition);
    }

    this.notfiyObservers(two);
  }

  markStart(state, two) {
    state.isStart = true;
    this.notfiyObservers(two);
  }

  removeStart(state, two) {
    state.isStart = false;
    this.notfiyObservers(two);
  }

  markEnd(state, two) {
    state.isEnd = true;
    this.notfiyObservers(two);
  }

  unmarkEnd(state, two) {
    state.isEnd = false;
    this.notfiyObservers(two);
  }

  removeTranstion(transition, two) {
    transition.deleteVisuals(two);

    this.transitions = this.transitions.filter(
      (t) => t.index !== transition.index
    );

    this.inputAlphabet = this.inputAlphabet.filter((element) => {
      return this.transitions.some((t) => t.via.includes(element));
    });

    this.notfiyObservers(two);
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(
      (obs) => obs.index !== observer.index
    );
  }

  notfiyObservers(two) {
    this.observers.forEach((obs) => obs.update(two));
  }

  updateDFADisplay(bool) {
    if (this.dfaDisplay) {
      this.dfaDisplay.textContent = bool ? "DFA" : "NFA";
    }
  }

  createAutomatonVisuals(two) {
    two.clear();
    this.states.forEach((state) => state.createVisuals(two));
    this.states.forEach((state) => (state.angles = []));
    this.transitions.forEach((transition) => transition.calculateAngles());

    this.transitions.forEach((trans) => {
      trans.from.addAngle(trans.startStateAngle);
      trans.to.addAngle(trans.endStateAngle);
    });

    var oppositeTransitions = this.transitions.filter((transition) =>
      this.transitions.some(
        (t) => t.from === transition.to && t.to === transition.from
      )
    );

    oppositeTransitions.forEach((t) => t.createVisuals(two, this.states, 50));

    this.transitions
      .filter((t) => !oppositeTransitions.includes(t))
      .forEach((trans) => trans.createVisuals(two, this.states));

    this.states
      .filter((s) => s.isStart)
      .forEach((state) => state.createStartArrow(two));
  }
  createStatesGenerations() {
    var visited = new Set();
    var statesToVisit = [];
    var startStates = this.states.filter((state) => state.isStart);

    for (const startState of startStates) {
      startState.generation = 0;
      statesToVisit.push(startState);
      visited.add(startState);

      while (statesToVisit.length != 0) {
        var currentState = statesToVisit.shift();
        var successors = calculateStateSuccessors(
          this.transitions,
          currentState
        );
        for (let i = 0; i < successors.length; i++) {
          if (!visited.has(successors[i])) {
            successors[i].generation = currentState.generation + 1;
            statesToVisit.push(successors[i]);
            visited.add(successors[i]);
          } else {
            continue;
          }
        }
      }
    }
  }
  calculateStatePositions() {
    for (let i = 0; i < this.generationsArray.length; i++) {
      for (let j = 0; j < this.generationsArray[i].length; j++) {
        this.generationsArray[i][j].posY = 400 + 300 * j;
        this.generationsArray[i][j].posX = 200 + 300 * i;
      }
    }
  }

  calculateGenerationsArray() {
    var states = this.states;

    let maxGeneration = 0;

    states.forEach((state) => {
      if (state.generation != undefined && state.generation > maxGeneration) {
        maxGeneration = state.generation;
      }
    });

    this.generationsArray = [];

    for (let i = 0; i <= maxGeneration; i++) {
      this.generationsArray[i] = [];
    }

    for (let i = 0; i < states.length; i++) {
      var stateGeneration = states[i].generation;
      if (stateGeneration != undefined) {
        this.generationsArray[stateGeneration].push(states[i]);
      }
    }
  }

  addTerminal(terminal) {
    this.inputAlphabet.push(terminal);
  }

  resolveEpsilonTransitions(two) {
    var startState = this.states.find((s) => s.isStart);
    startState.isStart = false;
    var startEpsilonClosure = calculateEpsilonClosure(
      startState,
      this.transitions
    );
    startEpsilonClosure.forEach((s) => (s.isStart = true));
    var newTransitions = [];

    this.transitions.forEach((trans) => {
      trans.via.forEach((v) => {
        if (!v.includes("ε")) {
          var epsilonClosure = calculateEpsilonClosure(
            trans.to,
            this.transitions
          );
          epsilonClosure.forEach((s) =>
            newTransitions.push(
              new FaTranisition(trans.from, s, v, trans.index)
            )
          );
        }
      });
    });

    this.transitions = newTransitions;

    this.arrangeGraph(two);
  }

  /**
   * Checks if the given automaton is DFA or NFA
   * @returns whether the automaton is DFA or NFA
   */
  checkAutomatonDeterminism() {
    if (this.states.filter((state) => state.isStart).length > 1) {
      return false;
    }
    for (let i = 0; i < this.states.length; i++) {
      for (let j = 0; j < this.inputAlphabet.length; j++) {
        var successors = calculateStateSuccessorsVia(
          this.transitions,
          this.states[i],
          this.inputAlphabet[j],
          true
        );
        if (successors.length > 1 || successors.length == 0) {
          return false;
        }
      }
    }
    return true;
  }
}

class State {
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
  startArrowBoundingBox;
  index;
  subsetStates = [];
  angles = [];

  constructor(name, isStart, isEnd, index) {
    this.name = name;
    this.isStart = isStart;
    this.isEnd = isEnd;
    this.index = index;
  }

  setPosition(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }

  addAngle(angle) {
    this.angles.push(angle);
  }

  removeAngle(angle) {
    this.angles = this.angles.filter((a) => a !== angle);
  }

  setGeneration(generation) {
    this.generation = generation;
  }

  createVisuals(two) {
    two.remove(this.stateCircle);
    two.remove(this.endCircle);
    two.remove(this.textLabel);
    two.remove(this.startArrow);

    this.stateCircle = new Two.Circle(this.posX, this.posY, 100);
    this.stateCircle.fill = "transparent";
    this.stateCircle.stroke = "black";
    this.stateCircle.linewidth = 8;

    this.textLabel = new Two.Text(this.name, this.posX, this.posY);
    this.textLabel.size = 60;

    this.endCircle = new Two.Circle(this.posX, this.posY, 85);
    this.endCircle.fill = "transparent";
    this.endCircle.linewidth = 0;

    if (this.isEnd) {
      this.endCircle.linewidth = 8;
    }

    two.add(this.textLabel);
    two.add(this.endCircle);
    two.add(this.stateCircle);

    two.update();

    this.stateCircle._renderer.elem.addEventListener("mousedown", (event) => {
      document.dispatchEvent(
        new CustomEvent("stateMouseDown", {
          detail: { state: this, mouseX: event.clientX, mouseY: event.clientY },
        })
      );
    });

    this.stateCircle._renderer.elem.addEventListener("mouseover", () => {
      this.stateCircle.stroke = "green";
      this.endCircle.stroke = "green";
      this.textLabel.fill = "green";
      two.update();
    });

    this.stateCircle._renderer.elem.addEventListener("mouseout", () => {
      this.stateCircle.stroke = "black";
      this.endCircle.stroke = "black";
      this.textLabel.fill = "black";
      two.update();
    });

    this.stateCircle._renderer.elem.addEventListener("mouseup", () => {
      document.dispatchEvent(new CustomEvent("stateMouseUp", { detail: this }));
    });

    two.update();
  }

  deleteVisuals(two) {
    two.remove(this.stateCircle);
    two.remove(this.endCircle);
    two.remove(this.textLabel);
    two.remove(this.startArrow);
    two.update();
  }

  createStartArrow(two) {
    two.remove(this.startArrow);
    two.remove(this.startArrowBoundingBox);

    var startArrowAngle = 180;
    var counter = 0;

    while (
      counter < 50 &&
      this.angles.some((angle) =>
        inRange(angle, startArrowAngle - 20, startArrowAngle + 20, 0)
      )
    ) {
      startArrowAngle = (startArrowAngle + 45) % 360;
      counter++;
    }

    var startPosition = {
      x: this.posX + Math.cos((startArrowAngle * Math.PI) / 180) * 200,
      y: this.posY + Math.sin((startArrowAngle * Math.PI) / 180) * 200,
    };
    var endPosition = {
      x: this.posX + Math.cos((startArrowAngle * Math.PI) / 180) * 100,
      y: this.posY + Math.sin((startArrowAngle * Math.PI) / 180) * 100,
    };

    this.startArrow = two.makeArrow(
      startPosition.x,
      startPosition.y,
      endPosition.x,
      endPosition.y,
      40
    );
    this.startArrow.linewidth = 8;
    this.startArrowBoundingBox = two.makePath(
      startPosition.x,
      startPosition.y,
      endPosition.x,
      endPosition.y
    );
    this.startArrowBoundingBox.linewidth = 50;
    this.startArrowBoundingBox.stroke = "transparent";

    two.update();

    this.startArrowBoundingBox._renderer.elem.addEventListener(
      "mouseover",
      () => {
        this.startArrow.stroke = "green";
        two.update();
      }
    );

    this.startArrowBoundingBox._renderer.elem.addEventListener(
      "mouseout",
      () => {
        this.startArrow.stroke = "black";
        two.update();
      }
    );

    this.startArrowBoundingBox._renderer.elem.addEventListener(
      "mousedown",
      () => {
        document.dispatchEvent(
          new CustomEvent("startArrowMouseDown", { detail: this })
        );
      }
    );
  }
}

class FaTranisition {
  from;
  to;
  via = [];
  index;
  startVector;
  endVector;
  transitionLine;
  boundingBox;
  arrowhead;
  label;
  startStateAngle;
  endStateAngle;

  constructor(from, to, via, index) {
    this.from = from;
    this.to = to;
    this.via = via;
    this.index = index;
  }

  toString() {
    return "(" + this.from.name + ", " + this.to.name + ")";
  }

  createVisuals(two, states, curveFactor) {
    two.remove(this.transitionLine);
    two.remove(this.boundingBox);
    two.remove(this.arrowhead);
    two.remove(this.label);

    if (this.from == this.to) {
      var selfEndAngle = 330;
      var selfStartAngle = 300;

      var counter = 0;
      while (
        counter <= 100 &&
        this.from.angles
          .filter((angle) => angle !== selfStartAngle && angle !== selfEndAngle)
          .some((a) => inRange(a, selfStartAngle, selfEndAngle, 10))
      ) {
        selfEndAngle = (selfEndAngle + 30) % 360;
        selfStartAngle = (selfStartAngle + 30) % 360;
        counter++;
      }

      this.startStateAngle = selfStartAngle;
      this.endStateAngle = selfEndAngle;

      this.startVector = {
        x: this.from.posX + Math.cos((selfStartAngle * Math.PI) / 180) * 100,
        y: this.from.posY + Math.sin((selfStartAngle * Math.PI) / 180) * 100,
      };
      this.endVector = {
        x: this.from.posX + Math.cos((selfEndAngle * Math.PI) / 180) * 100,
        y: this.from.posY + Math.sin((selfEndAngle * Math.PI) / 180) * 100,
      };
      var pointToInsert = calculateMedianVertex(
        this.startVector,
        this.endVector
      );
      var normalVecor = calculateNormalVector(this.endVector, this.startVector);
      pointToInsert = movePointAlongVector(pointToInsert, normalVecor, 75);

      angle = Math.atan2(
        pointToInsert.y - this.startVector.y,
        pointToInsert.x - this.startVector.x
      );
      endAngle = Math.atan2(
        this.endVector.y - pointToInsert.y,
        this.endVector.x - pointToInsert.x
      );

      this.transitionLine = two.makePath(
        this.startVector.x,
        this.startVector.y,
        pointToInsert.x,
        pointToInsert.y,
        this.endVector.x,
        this.endVector.y
      );
      this.transitionLine.opacity = 1;

      this.arrowhead = two.makePath(100, 150, 150, 10, 200, 150);
      this.arrowhead.translation.x =
        this.endVector.x + Math.cos(endAngle) * -15;
      this.arrowhead.translation.y =
        this.endVector.y + Math.sin(endAngle) * -15;
    } else {
      var angle = Math.atan2(
        this.to.posY - this.from.posY,
        this.to.posX - this.from.posX
      );
      var endAngle = angle;

      this.startVector = {
        x: this.from.posX + Math.cos(angle) * 100,
        y: this.from.posY + Math.sin(angle) * 100,
      };
      this.endVector = {
        x: this.to.posX - Math.cos(angle) * 100,
        y: this.to.posY - Math.sin(angle) * 100,
      };

      var amount = 0;

      var pointToInsert = calculateMedianVertex(
        this.startVector,
        this.endVector
      );

      var normalVecor = calculateNormalVector(this.startVector, this.endVector);

      if (curveFactor) {
        pointToInsert = movePointAlongVector(
          pointToInsert,
          normalVecor,
          curveFactor
        );

        angle = Math.atan2(
          pointToInsert.y - this.from.posY,
          pointToInsert.x - this.from.posX
        );
        endAngle = Math.atan2(
          this.to.posY - pointToInsert.y,
          this.to.posX - pointToInsert.x
        );

        this.startVector = {
          x: this.from.posX + Math.cos(angle) * 100,
          y: this.from.posY + Math.sin(angle) * 100,
        };
        this.endVector = {
          x: this.to.posX - Math.cos(endAngle) * 100,
          y: this.to.posY - Math.sin(endAngle) * 100,
        };
      }

      for (let i = 0; i < states.length; i++) {
        if (
          states[i].name === this.from.name ||
          states[i].name === this.to.name
        ) {
          continue;
        }

        var circleCenter = { x: states[i].posX, y: states[i].posY };

        while (
          amount < 500 &&
          (checkLineCircleIntersection(
            this.startVector,
            pointToInsert,
            circleCenter,
            120
          ) ||
            checkLineCircleIntersection(
              pointToInsert,
              this.endVector,
              circleCenter,
              120
            ))
        ) {
          pointToInsert = movePointAlongVector(pointToInsert, normalVecor, 10);

          angle = Math.atan2(
            pointToInsert.y - this.startVector.y,
            pointToInsert.x - this.startVector.x
          );
          endAngle = Math.atan2(
            this.endVector.y - pointToInsert.y,
            this.endVector.x - pointToInsert.x
          );

          this.startVector = {
            x: this.from.posX + Math.cos(angle) * 100,
            y: this.from.posY + Math.sin(angle) * 100,
          };
          this.endVector = {
            x: this.to.posX - Math.cos(endAngle) * 100,
            y: this.to.posY - Math.sin(endAngle) * 100,
          };

          amount += 1;
        }
      }

      this.transitionLine = two.makePath(
        this.startVector.x,
        this.startVector.y,
        pointToInsert.x,
        pointToInsert.y,
        this.endVector.x,
        this.endVector.y
      );

      this.arrowhead = two.makePath(100, 150, 150, 10, 200, 150);
      this.arrowhead.translation.x =
        this.endVector.x + Math.cos(endAngle) * -15;
      this.arrowhead.translation.y =
        this.endVector.y + Math.sin(endAngle) * -15;

      this.startStateAngle = Math.floor(
        (Math.atan2(
          this.startVector.y - this.from.posY,
          this.startVector.x - this.from.posX
        ) *
          (180 / Math.PI) +
          360) %
          360
      );
      this.endStateAngle = Math.floor(
        (Math.atan2(
          this.endVector.y - this.to.posY,
          this.endVector.x - this.to.posX
        ) *
          (180 / Math.PI) +
          360) %
          360
      );
    }

    this.arrowhead.fill = "black";
    this.arrowhead.scale = 0.3;
    this.arrowhead.rotation = endAngle + Math.PI / 2;

    this.transitionLine.closed = false;
    this.transitionLine.fill = "transparent";
    this.transitionLine.curved = true;
    this.transitionLine.stroke = "black";
    this.transitionLine.linewidth = 8;

    this.boundingBox = this.transitionLine.clone();
    this.boundingBox.linewidth = 40;
    this.boundingBox.noFill();
    this.boundingBox.stroke = "transparent";

    var labelPosition = movePointAlongVector(pointToInsert, normalVecor, 30);
    this.label = two.makeText(this.via, labelPosition.x, labelPosition.y);
    this.label.size = 30;

    two.add(this.boundingBox);

    for (let i = 0; i < states.length; i++) {
      states[i].deleteVisuals(two);
      states[i].createVisuals(two);
    }

    two.update();

    this.boundingBox._renderer.elem.addEventListener("mousedown", () => {
      document.dispatchEvent(
        new CustomEvent("transitionMouseDown", { detail: this })
      );
    });

    this.boundingBox._renderer.elem.addEventListener("mouseover", () => {
      this.arrowhead.fill = "green";
      this.label.stroke = "green";
      this.transitionLine.stroke = "green";
      two.update();
    });

    this.boundingBox._renderer.elem.addEventListener("mouseout", () => {
      this.arrowhead.fill = "black";
      this.label.stroke = "black";
      this.transitionLine.stroke = "black";
      two.update();
    });
  }

  calculateAngles() {
    if (this.from == this.to) {
      return;
    }

    var angle = Math.atan2(
      this.to.posY - this.from.posY,
      this.to.posX - this.from.posX
    );
    this.startVector = {
      x: this.from.posX + Math.cos(angle) * 100,
      y: this.from.posY + Math.sin(angle) * 100,
    };
    this.endVector = {
      x: this.to.posX - Math.cos(angle) * 100,
      y: this.to.posY - Math.sin(angle) * 100,
    };
    this.startStateAngle = Math.floor(
      (Math.atan2(
        this.startVector.y - this.from.posY,
        this.startVector.x - this.from.posX
      ) *
        (180 / Math.PI) +
        360) %
        360
    );
    this.endStateAngle = Math.floor(
      (Math.atan2(
        this.endVector.y - this.to.posY,
        this.endVector.x - this.to.posX
      ) *
        (180 / Math.PI) +
        360) %
        360
    );
  }

  deleteVisuals(two) {
    two.remove(this.transitionLine);
    two.remove(this.boundingBox);
    two.remove(this.arrowhead);
    two.remove(this.label);
    two.update();
  }
}

class SentenceForm {
  form;
  previousForm;

  constructor(form, previousForm) {
    this.form = form;
    this.previousForm = previousForm;
  }

  toString() {
    return this.form;
  }
}

class AutomatonObserver {
  index;
  updateGrammar = true;

  constructor(dfa, grammar, index) {
    this.dfa = dfa;
    this.grammar = grammar || {};
    this.index = index;
  }

  update(two) {
    this.dfa.createAutomatonVisuals(two);
    var isDFA = this.dfa.checkAutomatonDeterminism();
    this.dfa.updateDFADisplay(isDFA);
    this.grammar.calculateGrammarType();

    if (this.updateGrammar) {
      Object.assign(this.grammar, createGrammarFromNFA(this.dfa));

      this.grammar.updateOutput();
    }
  }
}

class PieMenu {
  isActive = false;
  domElement;
  deleteButton;
  currentState;
  background;

  pieMenuMouseDownHandler = (event) => {
    document.dispatchEvent(
      new CustomEvent("pieMenuMouseDown", {
        detail: { mouseX: event.clientX, mouseY: event.clientY },
      })
    );
  };
  pieMenuMouseMoveHandler = (event) => {
    document.dispatchEvent(
      new CustomEvent("pieMenuMouseMove", {
        detail: { mouseX: event.clientX, mouseY: event.clientY },
      })
    );
  };

  constructor(domElement, background) {
    this.domElement = domElement;
    this.background = background;
    this.background.style.backgroundColor = "transparent";
    this.background.style.display = "none";
  }

  enable(currentState, posX, posY, canvasRect) {
    this.background.style.top = canvasRect.top + "px";
    this.background.style.left = canvasRect.left + "px";
    this.background.style.width = canvasRect.width + "px";
    this.background.style.height = canvasRect.height + "px";

    this.background.style.display = "flex";

    this.currentState = currentState;

    this.domElement.style.display = "flex";
    this.domElement.style.left = posX - 200 - canvasRect.left + "px";
    this.domElement.style.top = posY - 200 - canvasRect.top + "px";

    this.isActive = true;

    this.background.addEventListener("mousedown", this.pieMenuMouseDownHandler);

    this.background.addEventListener("mousemove", this.pieMenuMouseMoveHandler);
  }

  disable() {
    this.domElement.style.display = "none";
    this.background.style.display = "none";
    this.isLoaded = false;
    this.isActive = false;

    this.background.removeEventListener(
      "mousedown",
      this.pieMenuMouseDownHandler
    );

    this.background.removeEventListener(
      "mousemove",
      this.pieMenuMouseMoveHandler
    );
  }
}

function calculateEpsilonClosure(state, transitions) {
  var closure = [state];
  var oldClosure = [];
  var maxIterations = 0;
  while (maxIterations < 50 && !checkArrayEuquality(oldClosure, closure)) {
    oldClosure = closure;
    for (let i = 0; i < closure.length; i++) {
      var successors = calculateStateSuccessorsVia(
        transitions,
        closure[i],
        "ε",
        false
      );
      successors.forEach((s) => closure.push(s));
      closure = closure.filter(onlyUnique);
    }
    maxIterations++;
  }
  return closure;
}

/**
 * Callback function to filter out only unique items in an array
 * @param {Int} value
 * @param {Int} index
 * @param {Array} array
 * @returns whether the element is unique or not
 */
function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}
/**
 * Calculates the lenght of a path definded by two points
 * @param {Point} point1
 * @param {Point} point2
 * @returns the lenght of the paht
 */
function computeLineLength(point1, point2) {
  const x1 = point1.x;
  const y1 = point1.y;
  const x2 = point2.x;
  const y2 = point2.y;

  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
/**
 * Checks if user input values represent a valid grammar
 * @param {Array} variables
 * @param {Array} terminals
 * @param {Array} productions
 * @param {Array} starting
 * @returns whether the user input is a valid grammar
 */
function checkCorrectGrammarForm(
  variablesInputValue,
  terminalsInputValue,
  startingInputValue
) {
  var variables = variablesInputValue.replace(/\s/g, "").split(",");
  var terminals = terminalsInputValue.replace(/\s/g, "").split(",");
  var starting = startingInputValue.replace(/\s/g, "");

  if (terminals.length == 0) {
    return false;
  }

  if (!variables.includes(starting)) {
    return false;
  }

  return true;
}

/**
 * Check if a production is valid, i.e. contains only terminals or variables
 * @param {Production} production
 * @param {Variable} variables
 * @param {Array} terminals
 * @returns whether the production is valid
 */
function checkProduction(production, variables, terminals) {
  var leftSide = production.left;
  var rightSide = production.right;

  for (let i = 0; i < leftSide.length; i++) {
    if (
      !variables.some((element) => element.name === leftSide[i].name) &&
      !terminals.some((element) => element.name === leftSide[i])
    ) {
      return false;
    }
  }

  for (let i = 0; i < rightSide.length; i++) {
    if (
      !variables.includes(rightSide[i]) &&
      !terminals.includes(rightSide[i]) &&
      rightSide[i] !== "ε"
    ) {
      return false;
    }
  }

  return true;
}
/**
 * Transforms valid user input into a grammar
 * @param {String} variablesInputValue
 * @param {String} terminalsInputValue
 * @param {String} productionsInputValue
 * @param {String} startingInputValue
 * @returns a new grammar based on user input
 */
function userInputToGrammar(
  variablesInputValue,
  terminalsInputValue,
  productionsInputValue,
  startingInputValue
) {
  var variables = variablesInputValue.replace(/\s/g, "").split(",");
  var terminals = terminalsInputValue.replace(/\s/g, "").split(",");
  var starting = startingInputValue.replace(/\s/g, "");
  var productions = [];
  productionsInputValue = productionsInputValue.replace(/,/g, "");
  productionsInputValue = productionsInputValue.replace(/[ \t]/g, "");
  var splittedProductionsInput = productionsInputValue.split("\n");

  if (terminals.length == 0) {
    throw new Error("Empty terminals!");
  }

  if (!variables.includes(starting)) {
    throw new Error("Invalid starting variable!");
  }

  for (let i = 0; i < splittedProductionsInput.length; i++) {
    if (splittedProductionsInput[i] === "") {
      continue;
    }

    var splittedProductionInput = splittedProductionsInput[i].split("->");
    if (splittedProductionInput.length > 2) {
      return;
    }
    var leftSide = splittedProductionInput[0];
    var processedLeftSide = [];

    for (let i = leftSide.length - 1; i >= 0; i--) {
      for (let j = 0; j < leftSide.length; j++) {
        var slice = leftSide.slice(i - j, i + 1);
        if (variables.some((element) => element === slice)) {
          processedLeftSide = [slice].concat(processedLeftSide);

          i = i - j;
          break;
        } else if (terminals.includes(slice)) {
          processedLeftSide = [slice].concat(processedLeftSide);
          i = i - j;
          break;
        } else {
          console.log("Not found");
        }
      }
    }

    var rightSides = splittedProductionInput[1].split("|");

    for (let j = 0; j < rightSides.length; j++) {
      var rightSide = rightSides[j];
      var processedRightSide = [];

      for (let i = rightSide.length - 1; i >= 0; i--) {
        for (let j = 0; j < rightSide.length; j++) {
          var slice = rightSide.slice(i - j, i + 1);

          if (variables.some((element) => element === slice)) {
            processedRightSide = [slice].concat(processedRightSide);

            i = i - j;
            break;
          } else if (terminals.includes(slice) || slice === "ε") {
            processedRightSide = [slice].concat(processedRightSide);
            i = i - j;
            break;
          } else {
            console.log("Not found");
          }
        }
      }

      productions.push(new Production(processedLeftSide, processedRightSide));
    }
  }
  return new Grammar(variables, terminals, productions, starting);
}
/**
 * Calculates the middle point of a path defined by two points
 * @param {Point} point1
 * @param {Point} point2
 * @returns the middle point
 */
function calculateMedianVertex(point1, point2) {
  return { x: (point2.x + point1.x) / 2, y: (point2.y + point1.y) / 2 };
}

/**
 * Finds the successor state(s) for a given state
 * @param {Array[]} faTransitions
 * @param {State} state
 * @returns the successor states
 */
function calculateStateSuccessors(faTransitions, state) {
  var successors = [];
  for (let i = 0; i < faTransitions.length; i++) {
    if (faTransitions[i].from === state && faTransitions[i].to !== state) {
      successors.push(faTransitions[i].to);
    }
  }
  return successors;
}
/**
 * Finds the predecessor state(s) for a given state
 * @param {Array} faTransitions
 * @param {State} state
 * @returns the predecessor states
 */
function calculateStatePredecessors(faTransitions, state) {
  return Array.from(
    new Set(
      faTransitions
        .filter((trans) => trans.to === state && trans.from !== state)
        .map((t) => t.from)
    )
  );
}

/**
 * Checks if the path of transition intersects with the circle of any state
 * @param {Two} two
 * @param {FaTranisition} transition
 * @param {Array} states
 * @returns whether path and state circles intersect
 */
function checkTransitionStatesIntersection(two, transition, states) {
  var arrowStartCoords = transition.startVector;
  var arrowEndCoords = transition.endVector;

  var transitionLength = computeLineLength(arrowStartCoords, arrowEndCoords);
  var fromVector = { x: transition.from.posX, y: transition.from.posY };
  var toVector = { x: transition.to.posX, y: transition.to.posY };

  var distanceBetweenStates = computeLineLength(fromVector, toVector);

  if (transitionLength + 200 < distanceBetweenStates) {
    return false;
  }

  for (let i = 0; i < states.length; i++) {
    var circleCenterCoords = { x: states[i].posX, y: states[i].posY };
    var circleRadius = 100;
    if (
      checkLineAndCircleIntersection(
        arrowStartCoords,
        arrowEndCoords,
        circleCenterCoords,
        circleRadius
      )
    ) {
      return true;
    } else {
      return false;
    }
  }
}
/**
 * Checks if a path given by two points intersects with a circle given by center and radius
 * @param {Point} lineStart
 * @param {Point} lineEnd
 * @param {Point} circleCenter
 * @param {Int} circleRadius
 * @returns whether path and circle intersect
 */
function checkLineCircleIntersection(
  lineStart,
  lineEnd,
  circleCenter,
  circleRadius
) {
  const startToCenterVector = {
    x: circleCenter.x - lineStart.x,
    y: circleCenter.y - lineStart.y,
  };

  const startToEndVector = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y,
  };

  const lineLengthSquared =
    startToEndVector.x * startToEndVector.x +
    startToEndVector.y * startToEndVector.y;

  const dotProduct =
    startToCenterVector.x * startToEndVector.x +
    startToCenterVector.y * startToEndVector.y;

  let closestPointOnLine;

  if (lineLengthSquared === 0) {
    closestPointOnLine = lineStart;
  } else {
    const t = Math.max(0, Math.min(1, dotProduct / lineLengthSquared));
    closestPointOnLine = {
      x: lineStart.x + t * startToEndVector.x,
      y: lineStart.y + t * startToEndVector.y,
    };
  }
  const distanceToClosestPointSquared =
    Math.pow(circleCenter.x - closestPointOnLine.x, 2) +
    Math.pow(circleCenter.y - closestPointOnLine.y, 2);

  return distanceToClosestPointSquared <= circleRadius * circleRadius;
}
/**
 * Converts a grammar into a NFA
 * @param {Grammar} grammar
 * @param {Two} two
 * @returns a NFA
 */
function createNFAFromGrammar(grammar, two) {
  var variables = grammar.variables;
  var starting = grammar.starting;
  var inputAlphabet = grammar.terminals;
  var productions = grammar.productions;

  var states = [];
  var transitions = [];

  var transitionIndex = 0;

  var zeStateCount = variables.filter((variable) =>
    variable.startsWith("Ze")
  ).length;
  states.push(new State("Ze" + numberToSubscript(zeStateCount), false, true));

  for (let i = 0; i < variables.length; i++) {
    states.push(new State(variables[i], false, false, i));
  }

  var startingState = states.find((element) => element.name === starting);
  if (startingState) {
    startingState.isStart = true;
  }

  for (let i = 0; i < variables.length; i++) {
    for (let j = 0; j < inputAlphabet.length; j++) {
      for (let k = 0; k < productions.length; k++) {
        if (
          productions[k].right.length === 2 &&
          productions[k].left.join("") === variables[i] &&
          productions[k].right[0] === inputAlphabet[j]
        ) {
          let b = productions[k].right[1];
          let stateB = states.find((element) => element.name === b);
          let stateI = states.find((element) => element.name === variables[i]);
          transitions.push(
            new FaTranisition(
              stateI,
              stateB,
              [inputAlphabet[j]],
              transitionIndex
            )
          );
          transitionIndex++;
        } else if (
          productions[k].left.length === 1 &&
          productions[k].right[0] === variables[i]
        ) {
          let stateLeft = states.find(
            (state) => state.name === productions[k].left[0]
          );
          let stateRight = states.find(
            (element) => element.name === variables[i]
          );

          transitions.push(
            new FaTranisition(stateLeft, stateRight, ["ε"], transitionIndex)
          );
          transitionIndex++;
        }
      }

      let productionToCheck = productions.find(
        (element) =>
          element.left.join("") === variables[i] &&
          element.right.join("") === inputAlphabet[j]
      );
      if (productionToCheck != undefined) {
        let stateI = states.find((element) => element.name === variables[i]);
        let zeState = states.find(
          (element) => element.name === "Ze" + numberToSubscript(zeStateCount)
        );
        transitions.push(
          new FaTranisition(
            stateI,
            zeState,
            [inputAlphabet[j]],
            transitionIndex
          )
        );
        transitionIndex++;
      }
    }
  }

  if (
    productions.some(
      (element) =>
        element.left.join("") === starting && element.right.join("") === "ε"
    )
  ) {
    states.find((element) => element.name === starting).isEnd = true;
  }

  var automaton = new FiniteAutomaton(states, inputAlphabet, transitions, two);

  return automaton;
}

/**
 * Converts a DFA into a grammar
 * @param {FiniteAutomaton} automaton
 * @returns a Grammar
 */
function createGrammarFromDFA(automaton) {
  var variables = [];
  var terminals;
  var productions = [];
  var starting;

  for (i = 0; i < automaton.states.length; i++) {
    variables.push(automaton.states[i].name);
  }

  var startState = automaton.states.find((element) => element.isStart === true);

  if (startState != undefined) {
    starting = startState.name;

    if (startState.isEnd) {
      productions.push(new Production(startState.name, "ε"));
    }
  }

  terminals = automaton.inputAlphabet;

  for (let i = 0; i < automaton.states.length; i++) {
    for (let j = 0; j < automaton.inputAlphabet.length; j++) {
      var successor = calculateStateSuccessorVia(
        automaton.transitions,
        automaton.states[i],
        automaton.inputAlphabet[j]
      );
      if (successor != undefined) {
        productions.push(
          new Production(
            automaton.states[i].name,
            automaton.inputAlphabet[j] + successor.name
          )
        );

        if (successor.isEnd) {
          productions.push(
            new Production(automaton.states[i].name, automaton.inputAlphabet[j])
          );
        }
      }
    }
  }

  return new Grammar(variables, terminals, productions, starting);
}

function createGrammarFromNFA(automaton) {
  var variables = [];
  var terminals;
  var productions = [];
  var starting;

  for (i = 0; i < automaton.states.length; i++) {
    variables.push(automaton.states[i].name);
  }

  var startStates = automaton.states.filter(
    (element) => element.isStart === true
  );

  if (startStates.length == 1) {
    starting = startStates[0].name;

    if (startStates[0].isEnd) {
      productions.push(new Production([startStates[0].name], ["ε"]));
    }
  } else {
    var n = 0;

    while (variables.includes("H" + numberToSubscript(n))) {
      n++;
    }
    variables.push("H" + numberToSubscript(n));
    startStates.forEach((state) =>
      productions.push(
        new Production(["H" + numberToSubscript(n)], [state.name])
      )
    );
    starting = "H" + numberToSubscript(n);
  }

  terminals = automaton.inputAlphabet;

  for (let i = 0; i < automaton.states.length; i++) {
    for (let j = 0; j < automaton.inputAlphabet.length; j++) {
      var successors = calculateStateSuccessorsVia(
        automaton.transitions,
        automaton.states[i],
        automaton.inputAlphabet[j],
        true
      );
      if (successors) {
        successors.forEach((succ) =>
          productions.push(
            new Production(
              [automaton.states[i].name],
              [automaton.inputAlphabet[j], succ.name]
            )
          )
        );
        successors
          .filter((succ) => succ.isEnd)
          .forEach((s) =>
            productions.push(
              new Production(
                [automaton.states[i].name],
                [automaton.inputAlphabet[j]]
              )
            )
          );
      }
    }

    var epsilonSuccessors = calculateStateSuccessorsVia(
      automaton.transitions,
      automaton.states[i],
      "ε",
      true
    );
    if (epsilonSuccessors) {
      epsilonSuccessors.forEach((succ) =>
        productions.push(
          new Production([automaton.states[i].name], [succ.name])
        )
      );
    }
  }

  return new Grammar(variables, terminals, productions, starting);
}
/**
 * Finds one successor of a given state using the given terminal symbol
 * @param {Array} transitions
 * @param {State} state
 * @param {String} via
 * @returns the successor
 */
function calculateStateSuccessorVia(transitions, state, via) {
  var successorTransition = transitions.find(
    (element) => element.from === state && element.via.includes(via)
  );

  if (successorTransition != undefined) {
    return successorTransition.to;
  }
}
/**
 * Finds the successors of a given state using the given terminal symbol either with or without self-transitions
 * @param {Array} transitions
 * @param {State} state
 * @param {String} via
 * @param {Boolean} withSelf whether self transitions are respected
 * @returns the successors
 */
function calculateStateSuccessorsVia(transitions, state, via, withSelf) {
  if (withSelf) {
    return transitions
      .filter((element) => element.from === state && element.via.includes(via))
      .map((e) => e.to);
  } else {
    return transitions
      .filter(
        (element) =>
          element.from === state &&
          element.to !== state &&
          element.via.includes(via)
      )
      .map((e) => e.to);
  }
}
/**
 * Formats an array of productions in a readable way
 * @param {Array} productions
 * @returns the formatted productions
 */
function formatProductions(productions) {
  var groupedProductions = {};

  productions.forEach((production) => {
    if (!groupedProductions[production.left.join("")]) {
      groupedProductions[production.left.join("")] = [];
    }
    groupedProductions[production.left.join("")].push(
      production.right.join("")
    );
  });

  var formattedProductions = [];
  for (var left in groupedProductions) {
    formattedProductions.push(
      left + " -> " + groupedProductions[left].join(" | ")
    );
  }

  return formattedProductions;
}
/**
 * Makes a screenshot of the graph and saves it locally
 */
function makeDrawingAreaScreenshot() {}
/**
 * Checks if the given word contains only the given terminals
 * @param {Array} terminals
 * @param {String} word
 * @returns
 */
function checkWordAlphabet(terminals, word) {
  var wordIsOverAlphabet = true;

  for (let i = 0; i < word.length; i++) {
    wordIsOverAlphabet &= terminals.includes(word[i]);
  }

  return wordIsOverAlphabet;
}
/**
 * Checks if the grammar can create the given word
 * @param {Grammar} grammar
 * @param {String} word
 * @returns
 */
function decideWordProblem(grammar, word) {
  if (!checkWordAlphabet(grammar.terminals, word)) {
    return undefined;
  }

  var n = word.length;
  var l = [new SentenceForm(grammar.starting, null)];
  var lOld;
  var i = 0;

  do {
    lOld = l;
    l = next(lOld, n, grammar.productions);
    i++;
  } while (
    i < 50 &&
    !(
      l.some((element) => element.form === word) || checkArrayEuquality(l, lOld)
    )
  );

  return l.find((element) => element.form === word);
}
/**
 * Helper function that calculate the derivations of all current sentence forms
 * @param {SentenceForm} l the set of sentence forms
 * @param {SentenceForm} n the max lenght of sentence forms allowed
 * @param {Array} productions
 * @returns
 */
function next(l, n, productions) {
  var successorDerivations = l.slice();

  for (let i = 0; i < l.length; i++) {
    var successorDerivation = calculateOneStepDerivations(l[i], n, productions);

    successorDerivations = successorDerivations.concat(successorDerivation);
  }

  return successorDerivations.filter(filterOutUniqueForms);
}
/**
 * Calculates the successor sentence forms by applying all valid productions to the given sentence form
 * @param {SentenceForm} sentenceForm
 * @param {Int} maxLenght
 * @param {Array} productions
 * @returns the successor sentence forms
 */
function calculateOneStepDerivations(sentenceForm, maxLenght, productions) {
  var derivations = [];

  for (let i = 0; i < sentenceForm.form.length; i++) {
    for (let j = 0; j < sentenceForm.form.length; j++) {
      var firstPortion = sentenceForm.form.slice(0, i);

      var currentPortion = sentenceForm.form.slice(i, j + 1);

      var lastPortion = sentenceForm.form.slice(j + 1, sentenceForm.length); //possible error

      var matchingProductions = productions.filter(
        (element) => element.left.join("") === currentPortion
      );

      if (matchingProductions != undefined) {
        for (let k = 0; k < matchingProductions.length; k++) {
          resultingSentenceForm =
            firstPortion +
            matchingProductions[k].right +
            lastPortion.replace(/ε/g, "");

          if (
            resultingSentenceForm.split(",").length <= maxLenght &&
            resultingSentenceForm.split(",").length > 0
          ) {
            derivations.push(
              new SentenceForm(
                firstPortion +
                  matchingProductions[k].right.join("") +
                  lastPortion.replace(/ε/g, ""),
                sentenceForm
              )
            );
          }
        }
      }
    }
  }

  return derivations;
}
/**
 * Checks if two arrays contains exactly the same elements
 * @param {Array} array1
 * @param {Array2} array2
 * @returns whether two arrays elements are equal
 */
function checkArrayEuquality(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  var array1Sorted = array1.slice().sort();
  var array2Sorted = array2.slice().sort();

  for (let i = 0; i < array1Sorted.length; i++) {
    if (array1Sorted[i] !== array2Sorted[i]) {
      return false;
    }
  }
  return true;
}
/**
 * Checks if two arrays share at least one element
 * @param {Array} array1
 * @param {Array} array2
 * @returns
 */
function checkArrayIntersection(array1, array2) {
  var size = Math.min(array1.length, array2.length);
  for (let i = 0; i < size; i++) {
    if (array1.includes(array2[i])) {
      return true;
    }
  }
  return false;
}
/**
 * Converts the trace of predecessor forms into a string
 * @param {SentenceForm} sentenceForm
 * @returns the string representation of the trace
 */
function sentenceFormPredecessorsToString(sentenceForm) {
  var predecessors = [];
  var temp = sentenceForm;
  var outputString;

  while (temp != null) {
    predecessors.push(temp.form);
    temp = temp.previousForm;
  }

  predecessors.reverse();
  outputString = predecessors.join(" -> ");

  return outputString;
}
/**
 * Filters out the unique sentence forms (by value, not reference)
 * @param {any} value
 * @param {Int} index
 * @param {any} self
 * @returns the filtered array
 */
const filterOutUniqueForms = (value, index, self) => {
  return self.findIndex((obj) => obj.form === value.form) === index;
};
/**
 * Generates example words that can be created by the grammar
 * @param {Grammar} grammar
 * @param {Int} maxCount
 * @returns example words
 */
function generateTerminalsForms(grammar, maxCount) {
  var n = 7;
  var l = [new SentenceForm(grammar.starting, null)];
  var lOld;
  var i = 0;

  do {
    lOld = l;
    l = next(lOld, n, grammar.productions);
    i++;
  } while (i < 6 && !checkArrayEuquality(l, lOld));

  l = l.filter((element) => checkWordAlphabet(grammar.terminals, element.form));

  l = l.slice(0, maxCount);

  var stringOutput = l.join(", ");

  return stringOutput;
}
/**
 * Saves the user input in the browser's session storage
 * @param {Array} variables
 * @param {Array} terminals
 * @param {Array} productions
 * @param {Array} starting
 */
function grammarformToSessionStorage(
  variables,
  terminals,
  productions,
  starting
) {
  sessionStorage.setItem("variables", variables);
  sessionStorage.setItem("terminals", terminals);
  sessionStorage.setItem("productions", productions);
  sessionStorage.setItem("starting", starting);
}
/**
 * Creates a number in subscript
 * @param {Int} number
 * @returns the number in subscript
 */
function numberToSubscript(number) {
  var input = number.toString();
  var output = "";

  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) + 8272);
  }

  return output;
}
/**
 * Converts a NFA into a DFA
 * @param {FiniteAutomaton} automaton
 * @param {Two} two
 * @returns a deterministic automaton
 */
function NFAToDFA(automaton, two, total) {
  var alphabet = automaton.inputAlphabet.slice();

  var dfaStates = createPowerSetOfStates(automaton.states);

  dfaStates.find((element) =>
    checkArrayEuquality(
      element.subsetStates,
      automaton.states.filter((state) => state.isStart)
    )
  ).isStart = true;

  dfaStates
    .filter((element) =>
      checkArrayIntersection(
        element.subsetStates.map((state) => state.name),
        automaton.states
          .filter((state) => state.isEnd == true)
          .map((e) => e.name)
      )
    )
    .forEach((state) => (state.isEnd = true));

  var dfaTransitions = [];

  var transitionIndex = 0;

  if (total) {
    var emptyState = new State("Ø", false, false, -1);
    dfaStates.push(emptyState);
  }

  for (let i = 0; i < dfaStates.length; i++) {
    var state = dfaStates[i];
    for (let j = 0; j < alphabet.length; j++) {
      var successorStates = new Set();
      for (let k = 0; k < state.subsetStates.length; k++) {
        var subsetSuccessors = calculateStateSuccessorsVia(
          automaton.transitions,
          state.subsetStates[k],
          alphabet[j],
          true
        );

        subsetSuccessors.forEach((successor) => successorStates.add(successor));
      }

      console.log("State: " + state.name + " " + successorStates.size);

      if (total && successorStates.size == 0) {
        dfaTransitions.push(
          new FaTranisition(state, emptyState, [alphabet[j]], transitionIndex)
        );
        transitionIndex++;
      }

      var matchingSubsetState = dfaStates.find((s) =>
        checkArrayEuquality(
          s.subsetStates.map((e) => e.name),
          Array.from(successorStates).map((t) => t.name)
        )
      );
      if (matchingSubsetState != undefined) {
        dfaTransitions.push(
          new FaTranisition(
            state,
            matchingSubsetState,
            [alphabet[j]],
            transitionIndex
          )
        );
        transitionIndex++;
      }
    }
  }

  return new FiniteAutomaton(
    dfaStates,
    automaton.inputAlphabet,
    dfaTransitions,
    two
  );
}
/**
 * Calculates the normalized normal vector of a path given by two points
 * @param {Point} point1
 * @param {Point} point2
 * @returns the normalized normal vector
 */
function calculateNormalVector(point1, point2) {
  var dx = point2.x - point1.x;
  var dy = point2.y - point1.y;
  var normalVecor = { x: -dy, y: dx };
  var length = Math.sqrt(
    normalVecor.x * normalVecor.x + normalVecor.y * normalVecor.y
  );

  return { x: normalVecor.x / length, y: normalVecor.y / length };
}
/**
 * Moves a point along the given vector by the given distance
 * @param {Point} point
 * @param {Point} vector
 * @param {Int} distance
 * @returns the moved point
 */
function movePointAlongVector(point, vector, distance) {
  return { x: point.x + vector.x * distance, y: point.y + vector.y * distance };
}
/**
 * Creates the power set of states (excluding the empty set)
 * @param {Array} states
 * @returns the power set of states
 */
function createPowerSetOfStates(states, includeEmptySet) {
  var subsets = [];
  var currentSubset = [];
  var outputStates = [];
  function depthFirstSearch(index) {
    if (index === states.length) {
      subsets.push([...currentSubset]);
      return;
    }
    currentSubset.push(states[index]);
    depthFirstSearch(index + 1);
    currentSubset.pop();
    depthFirstSearch(index + 1);
  }
  depthFirstSearch(0);
  subsets.pop();
  for (let i = 0; i < subsets.length; i++) {
    var subsetStates = [];
    for (let j = 0; j < subsets[i].length; j++) {
      subsetStates.push(subsets[i][j]);
    }
    var state = new State(
      "{" + subsetStates.map((state) => state.name).join("") + "}",
      false,
      false,
      i
    );
    state.subsetStates = subsetStates;
    outputStates.push(state);
  }

  if (includeEmptySet) {
    outputStates.push(new State(String.fromCharCode(157), false, false, -1));
  }

  return outputStates;
}

function inRange(value, start, end, tolerance) {
  value = (value + 360) % 360;
  start = (start + 360) % 360;
  end = (end + 360) % 360;

  if (start <= end) {
    return value >= start - tolerance && value <= end + tolerance;
  } else {
    return (
      (value >= start - tolerance && value <= 360) ||
      (value >= 0 && value <= end + tolerance)
    );
  }
}

function nTimesZ(n) {
  var string = "";

  for (let i = 0; i < n; i++) {
    string += "Z";
  }
  return string;
}

async function createSVGScreenshot(svg) {
  var serializedSVG =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(new XMLSerializer().serializeToString(svg));
  var image = await loadSVGToImage(serializedSVG);
  var screenshotCanvas = document.createElement("canvas");

  screenshotCanvas.width = 2 * svg.clientWidth;
  screenshotCanvas.height = 2 * svg.clientHeight;

  var context = screenshotCanvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);

  context.drawImage(image, 0, 0, 2 * svg.clientWidth, 2 * svg.clientHeight);

  var dataUrl = screenshotCanvas.toDataURL("image/png", 1.0);

  downloadImage(dataUrl, "screenshot.png");
}

function downloadImage(dataUrl, filename) {
  var helperElement = document.createElement("a");
  helperElement.href = dataUrl;
  helperElement.download = filename;
  document.body.appendChild(helperElement);
  helperElement.click();
  document.body.removeChild(helperElement);
}

async function loadSVGToImage(svg) {
  return new Promise((resolve, reject) => {
    var img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = svg;
  });
}
