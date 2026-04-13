// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
let canvas, gl;
let a_Position, u_FragColor;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let u_PointSize;
let shapesList = [];
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let triangleBuffer;

let currentShape = POINT;

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

class Point {
  constructor(position, size, color) {
    this.position = position;
    this.size = size;
    this.color = color;
  }
  
  render() {
    gl.disableVertexAttribArray(a_Position);
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle {
  constructor(position, size, color) {
    this.position = position;
    this.color = color;
    this.size = size;
  }

  render() {
    let d = this.size / 200;
    let x = this.position[0];
    let y = this.position[1];

    let vertices = [x, y + d, x - d, y - d, x + d, y - d];

    gl.uniform1f(u_PointSize, 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    drawTriangles(vertices);
  }
}

class Circle {
  constructor(position, size, color, segments) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.segments = segments;
  }
  
  render() {
    let x = this.position[0];
    let y = this.position[1];
    let d = this.size / 200;

    let angleStep = 360 / this.segments;
    let vertices = [];

    for(let i = 0; i < 360; i+=angleStep) {
      let rad1 = i * Math.PI / 180;
      let rad2 = (i + angleStep) * Math.PI / 180;

      vertices.push(x, y);

      vertices.push(x + d * Math.cos(rad1), y + d * Math.sin(rad1));
      vertices.push(x + d * Math.cos(rad2), y + d * Math.sin(rad2));

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, 0.0);

    drawTriangles(vertices);
    }
  }
}

function drawTriangles(vertices) {
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  if (!triangleBuffer) {
    console.log('Failed to create buffer');
    return;
  } 

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}

function main() {
  setupWebGL();
  triangleBuffer = gl.createBuffer();
  connectVariablesToGLSL();

  canvas.onmousedown = function(ev){ click(ev) };
  canvas.onmousemove = function(ev){ drag(ev) };
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
}

function setupWebGL() {
  canvas = document.getElementById('webgl1');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get context');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }

  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get u_PointSize');
    return;
  }
}

function click(ev) {
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  let r = document.getElementById('RedSlider').value / 255;
  let g = document.getElementById('GreenSlider').value / 255;
  let b = document.getElementById('BlueSlider').value / 255;

  let size = document.getElementById('SizeSlider').value;

  if (currentShape === POINT) {
    let point = new Point([x, y], size, [r, g, b, 1.0]);
    shapesList.push(point);
  }

  else if (currentShape === TRIANGLE) {
    let triangle = new Triangle([x, y], size, [r, g, b, 1.0]);
    shapesList.push(triangle);
  }

  else if (currentShape === CIRCLE) {
    let segments = document.getElementById('SegmentSlider').value;
    let circle = new Circle([x, y], size, [r, g, b, 1.0], segments);
    shapesList.push(circle);
  }

  renderAllShapes();
}

function renderAllShapes() {

  for(let i = 0; i < shapesList.length; i++) {
    shapesList[i].render();
  }
}

function clearCanvas() {
  shapesList = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function drag(ev) {
  if(ev.buttons != 1) return;
  click(ev);
}

function setShapeSquare() {
  currentShape = POINT
}

function setShapeTriangle() {
  currentShape = TRIANGLE;
}

function setShapeCircle() {
  currentShape = CIRCLE;
}

// helper function for picture
function drawCircle(x, y, size, segments) {
  let angleStep = 360 / segments;
  let vertices = [];

  for (let i = 0; i < 360; i+=angleStep) {
    let rad1 = i * Math.PI / 180;
    let rad2 = (i + angleStep) * Math.PI / 180;

    vertices.push(x, y);

    vertices.push(x + size * Math.cos(rad1), y + size * Math.sin(rad1));
    vertices.push(x + size * Math.cos(rad2), y + size * Math.sin(rad2));
  } 

  gl.uniform1f(u_PointSize, 0.0);
  drawTriangles(vertices);
}

// ice cream picture
function picture() {

  //background
  gl.uniform4f(u_FragColor, 0.5, 0.8, 0.9, 1.0);
  drawCircle(0, 0, 1.5, 20)

  // sun
  gl.uniform4f(u_FragColor, .239, .141, .047, 1.0);
  for (let x = -1; x <= 1; x+=.4) {
    for (let y = -1; y <= 1; y+=.4) {
      drawTriangles([x, y, x+.4, y, x, y+.4])
    }
  }

  // scoop 1
  gl.uniform4f(u_FragColor, 1.0, .5, .5, 1.0);
  drawCircle(0, -.1, .4, 8);

  // scoop 2
  gl.uniform4f(u_FragColor, 1.0, .8, .9, 1.0);
  drawCircle(0.0, .4, .33, 8);

  //cherry
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawCircle(0.0, .7, 0.1, 8);

  // cone
  gl.uniform4f(u_FragColor, .765, .486, 0.0, 1.0);
  drawTriangles([-.4, -.2, .4, -.2, 0, -.9])

  // wrap
  gl.uniform4f(u_FragColor, 0.95, 0.9, 1.7, 1.0);
  drawTriangles(
    [-.32, -.35, .32, -.35, .17, -.6, 
    -.32, -.35, .17, -.6, -.17, -.6]
  )

  // R
  gl.uniform4f(u_FragColor, 0.941, 0.004, 0.02, 1.0);
  drawTriangles(
    [-.1, -.4, -.14, -.4, -.14, -.55, //vertical
    -.1, -.4, -.14, -.55, -.1, -.55,  //vertical
    -.1, -.4, -.1, -.43, -.01, -.46,  //top triangle
    -.01, -.46, -.1, -.47, -.1, -.5,  //middle bar
    -.1, -.46, -.07, -.55, -.03, -.55] //bottom leg
  )

  // A
  drawTriangles(
    [.12, -.4, .15, -.4, .15, -.55, //vertical 1
    .12, -.4, .15, -.55, .12, -.55,
    .04, -.4, .07, -.4, .07, -.55, //vertical 2
    .04, -.4, .07, -.55, .04, -.55,
    .04, -.4, .15, -.4, .04, -.43,  // horizontal top
    .15, -.4, .04, -.43, .15, -.43,
    .04, -.49, .15, -.49, .04, -.46,  // horizontal bottom
    .15, -.49, .04, -.46, .15, -.46
  ]
  )
}