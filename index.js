'use strict';

function valueExists(value) {
  const exists = value ?? 'value_does_not_exist';
  return exists !== 'value_does_not_exist';
}

/**
 * Iterates over object name:value pairs and throws
 * meaningful error if a value doesn't exist.
 */
function required(o) {
  const entries = Object.entries(o);

  entries.forEach(([name, value]) => {
    if (!valueExists(value)) {
      throw new Error(`${name} is required, received ${value}`);
    }
  });
}

function RotationManager(angle) {
  required({ angle });

  this.angle = angle % 360;
  this.convertToRadAndSetCosSin();
}

RotationManager.prototype.convertToRadAndSetCosSin = function () {
  const angleToRadians = this.angle * (Math.PI / 180);
  this.cosTheta = Math.cos(angleToRadians);
  this.sinTheta = Math.sin(angleToRadians);
};

RotationManager.prototype.setAngle = function (angle) {
  required({ angle });

  this.angle = angle % 360;
  this.convertToRadAndSetCosSin();
};

function Rule(charToConvert, conversion) {
  required({ charToConvert, conversion });

  this.charToConvert = charToConvert;
  this.conversion = conversion;
}

const lSystemsPlaceholder = document.querySelector('.l_systems-placeholder');
const canvas = document.querySelector('#l_systems');
function setCanvasSize() {
  canvas.setAttribute('width', `${lSystemsPlaceholder.clientWidth}`);
  canvas.setAttribute('height', `${lSystemsPlaceholder.clientHeight}`);
}
// here we initialize canvas size
setCanvasSize();
const ctx = canvas.getContext('2d');

const LSystem = {
  canvas,
  ctx,
  startingX: 0,
  startingY: 0,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  xMax: 0,
  yMax: 0,
  xMin: 0,
  yMin: 0,
  length: 0,
  lengthDivisor: 0,
  rotAngle: 0,
  rules: [],
  rotationManager: null,
  lSystem: '',
  generationCount: 0,
  run(generationCount, generator) {
    required({ generationCount, generator });

    this.initAndDraw(generationCount, generator);
  },
  initAndDraw(generationCount, generator) {
    this.initializeLSystem(generationCount, generator);
    this.convertLSystemByRuleWithGenerations();

    this.drawLSystem();
  },
  initializeLSystem(generationCount, generator) {
    this.startingX = 0;
    this.startingY = 0;
    this.xMin = this.startingX;
    this.yMin = this.startingY;
    this.xMax = this.startingX;
    this.yMax = this.startingY;
    this.length = generator.length;
    this.lengthDivisor = generator.lengthDivisor;
    this.rules = generator.rules;
    this.rotAngle = generator.rotAngle;
    this.generationCount = generationCount;

    this.rotationManager = new RotationManager(generator.angle);

    this.lSystem = generator.axiom;
  },
  convertLSystemByRuleWithGenerations() {
    let i = 0;
    for (i; i < this.generationCount; i++) {
      this.convertLSystemByRule();
    }
  },
  convertLSystemByRule() {
    let newLSystem = '';

    let i = 0;
    for (i; i < this.lSystem.length; i++) {
      let j = 0;
      for (j; j < this.rules.length; j++) {
        if (this.lSystem.charAt(i) === this.rules[j].charToConvert) {
          newLSystem = newLSystem.concat(this.rules[j].conversion);
          break;
        } else if (j === this.rules.length - 1) {
          newLSystem = newLSystem.concat(this.lSystem.charAt(i));
        }
      }
    }

    this.lSystem = newLSystem;
    this.length /= this.lengthDivisor;
  },
  drawLSystem() {
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.drawDeterministicLSystem();
  },
  drawDeterministicLSystem() {
    for (let i = 0; i < this.lSystem.length; i++) {
      const c = this.lSystem.charAt(i);
      if (c === 'F') {
        this.stepAndDrawLine();
      } else if (c === 'f') {
        this.step();
      } else if (c === '+') {
        this.rotateLeft(this.rotAngle);
      } else if (c === '-') {
        this.rotateRight(this.rotAngle);
      }
    }
  },
  stepAndDrawLine() {
    this.step();
    this.drawLine();
  },
  step() {
    this.x1 = this.startingX;
    this.y1 = this.startingY;
    this.x2 = this.x1 + this.rotationManager.cosTheta * this.length;
    this.y2 = this.y1 + this.rotationManager.sinTheta * this.length;

    this.startingX = this.x2;
    this.startingY = this.y2;

    this.setMaxCoordinates();
    this.setMinCoordinates();
  },
  drawLine() {
    const x1 = this.viewportTransformX(this.x1);
    const y1 = this.viewportTransformY(this.y1);
    const x2 = this.viewportTransformX(this.x2);
    const y2 = this.viewportTransformY(this.y2);

    this.ctx.strokeStyle = '#d9d9d9';
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  },
  viewportTransformX(x) {
    return (1 / 2) * (this.canvas.clientWidth - 1) * (x + 1);
  },
  viewportTransformY(y) {
    return (1 / 2) * (this.canvas.clientHeight - 1) * (1 - y);
  },
  setMaxCoordinates() {
    if (this.x1 > this.xMax) this.xMax = this.x1;
    if (this.y1 > this.yMax) this.yMax = this.y1;
    if (this.x2 > this.xMax) this.xMax = this.x2;
    if (this.y2 > this.yMax) this.yMax = this.y2;
  },
  setMinCoordinates() {
    if (this.x1 < this.xMin) this.xMin = this.x1;
    if (this.y1 < this.yMin) this.yMin = this.y1;
    if (this.x2 < this.xMin) this.xMin = this.x2;
    if (this.y2 < this.yMin) this.yMin = this.y2;
  },
  rotateLeft(angle) {
    this.rotationManager.setAngle(this.rotationManager.angle + angle);
  },
  rotateRight(angle) {
    this.rotationManager.setAngle(this.rotationManager.angle - angle);
  },
};

const generator = {
  angle: 270,
  rotAngle: 90,
  length: 1,
  lengthDivisor: 5,
  axiom: 'F+F+F+F',
  rules: [new Rule('F', 'F+F-F-FF+F+F-F')],
  maxGen: 3,
};

function atEndOfWindowResize(callback) {
  // debounce callback function until the event is over
  function debounce(func) {
    var timer;
    return function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, 1000);
    };
  }

  window.addEventListener('resize', debounce(callback));
}

const generation = {
  valueContainer: document.querySelector('#value'),
  maxContainer: document.querySelector('#max'),
  value: 1,
  max: 3,
  min: 1,
  updateContainer: function () {
    this.valueContainer.innerHTML = this.value;
    this.maxContainer.innerHTML = this.max;
  },
  draw: function () {
    LSystem.run(this.value, generator);
  },
  previous: function previous() {
    if (this.value > this.min) {
      this.value -= 1;
      this.updateContainer();
      this.draw();
    }
  },
  next: function next() {
    if (this.value < this.max) {
      this.value += 1;
      this.updateContainer();
      this.draw();
    }
  },
  attachControlsDrawLSystem: function () {
    this.draw();

    const previous = document.querySelector('#previous');
    previous.addEventListener('click', function () {
      // can't use 'this' here because event bound it
      generation.previous();
    });

    const next = document.querySelector('#next');
    next.addEventListener('click', function () {
      // can't use 'this' here because event bound it
      generation.next();
    });
  },
};

generation.attachControlsDrawLSystem();

// update the canvas size and redraw because the size has changed
atEndOfWindowResize(function () {
  setCanvasSize();
  generation.draw();
});
