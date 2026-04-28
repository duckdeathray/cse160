// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
let canvas, gl;
let a_Position, u_FragColor;
let u_ModelMatrix, u_GlobalRotation;

//rotation
let g_mouseClick = false
let g_lastX = 0;
let g_lastY = 0;

let gAnimal_Rotation = 0;

let gBody_Angle = 0;
//front legs
let fRThigh_Angle = 0;
let fLThigh_Angle = 0;
let fRCalfAngle = 0;
let fLCalfAngle = 0;
let fRFootAngle = 0;
let fLFootAngle = 0;
//back legs
let bRThigh_Angle = 0;
let bLThigh_Angle = 0;
let bRCalfAngle = 0;
let bLCalfAngle = 0;
let bRFootAngle = 0;
let bLFootAngle = 0;
// neck + mane
let gNeck_Angle = 0;
//head
let gHead_Angle = 0;
//snout
let gSnout_Angle = 90;
// tail
let gTail_Angle = 0;

let base_Body_Angle = 0;
//front legs
let base_fRThigh_Angle = 0;
let base_fLThigh_Angle = 0;
let base_fRCalfAngle = 0;
let base_fLCalfAngle = 0;
let base_fRFootAngle = 0;
let base_fLFootAngle = 0;
//back legs
let base_bRThigh_Angle = 0;
let base_bLThigh_Angle = 0;
let base_bRCalfAngle = 0;
let base_bLCalfAngle = 0;
let base_bRFootAngle = 0;
let base_bLFootAngle = 0;
// neck + mane
let base_Neck_Angle = 0;
//head
let base_Head_Angle = 0;
//snout
let base_Snout_Angle = 90;
// tail
let base_Tail_Angle = 0;

let g_animate = false;
let g_seconds = 0;
let cubeBuffer;

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

let g_animation = 0;
let g_pokeTime = 0;

var VSHADER_SOURCE = 
  `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
  }`;

var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

const cubeVertices = new Float32Array
    ([-0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,
        -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
        -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,
        -0.5,-0.5,-0.5,   0.5, 0.5,-0.5,   0.5,-0.5,-0.5,
        -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,
        -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,
        0.5,-0.5,-0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,
        0.5,-0.5,-0.5,   0.5, 0.5, 0.5,   0.5,-0.5, 0.5,
        -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,
        -0.5, 0.5,-0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,
        -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,
        -0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5]);
  
function initCubeBuffer() {
    cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
}

class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render(){
    var rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

class Cylinder {
  constructor(segments = 12) {
    this.type = "cylinder";
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
    this.segments = segments;
  }

  render() {
    let rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let angleStep = 360 / this.segments;
    let radius = 0.5;

    let topY = 0.5;
    let bottomY = -0.5;

    for (let i = 0; i < 360; i += angleStep) {
      let a1 = i * Math.PI / 180;
      let a2 = (i + angleStep) * Math.PI / 180;

      let x1 = Math.cos(a1) * radius;
      let z1 = Math.sin(a1) * radius;
      let x2 = Math.cos(a2) * radius;
      let z2 = Math.sin(a2) * radius;

      // side wall (2 triangles)
      drawTriangles3D([
        x1, bottomY, z1,
        x2, bottomY, z2,
        x2, topY, z2
      ]);

      drawTriangles3D([
        x1, bottomY, z1,
        x2, topY, z2,
        x1, topY, z1
      ]);

      // top cap
      drawTriangles3D([
        0, topY, 0,
        x1, topY, z1,
        x2, topY, z2
      ]);

      // bottom cap
      drawTriangles3D([
        0, bottomY, 0,
        x2, bottomY, z2,
        x1, bottomY, z1
      ]);
    }
  }
}

function drawTriangles3D(vertices) {

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

function initMouseControls(){
    canvas.onmousedown = function(ev){
        if (ev.shiftKey){
            g_animation = 2;
            g_animate = true;
            g_pokeTime = 0;
            return;
        }
        g_mouseClick = true;
        g_lastX = ev.clientX
        g_lastY = ev.clientY;
    };

    canvas.onmouseup = function(){
        g_mouseClick = false;
    };

    canvas.onmousemove = function(ev){
        if (!g_mouseClick) return;
        let dx = ev.clientX - g_lastX;
        gAnimal_Rotation += dx * 0.5;
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
        renderScene();
    };
}

function setupWebGL() {
  canvas = document.getElementById('webgl2');
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('Failed to get context');
    return;
  }
  gl.viewport(0, 0, canvas.clientWidth, canvas.height);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let globalRotation = new Matrix4()
    globalRotation.rotate(gAnimal_Rotation, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotation.elements);

    //body
    let body = new Cube();
    body.color = [0.9, 0.75, 0.4, 1.0];
    body.matrix.translate(0, -0.1, 0);
    body.matrix.rotate(gBody_Angle, 0, 1, 0)
    body.matrix.scale(0.2, 0.3, 0.35);
    body.render();

    // front legs

        //front right thigh
    let fRThigh = new Cube();
    fRThigh.color = body.color;
    fRThigh.matrix = new Matrix4(body.matrix);
    fRThigh.matrix.translate(0.3, -.1, .3);
    fRThigh.matrix.rotate(fRThigh_Angle, 1, 0, 0);
    fRThigh.matrix.translate(0, -.9, 0);
    fRThigh.matrix.scale(0.4, 0.9, 0.3);
    fRThigh.render();

            //front right calf
    let fRCalf = new Cube();
    fRCalf.color = body.color;
    fRCalf.matrix = new Matrix4(fRThigh.matrix);
    fRCalf.matrix.translate(0, -1, 0);
    fRCalf.matrix.rotate(fRCalfAngle, 1, 0, 0);
    fRCalf.matrix.scale(1, 0.9, 0.9)
    fRCalf.render();
        //front right foot

    let fRFoot = new Cylinder(16);
    fRFoot.color = [0.5, 0.3, 0.2, 1.0];
    fRFoot.matrix = new Matrix4(fRCalf.matrix);
    fRFoot.matrix.translate(0, -.7, .1);
    fRFoot.matrix.rotate(fRFootAngle, 1, 0, 0);
    fRFoot.matrix.scale(1, .3, 1.2);
    fRFoot.render();
    
        //front left thigh
    let fLThigh = new Cube();
    fLThigh.color = body.color;
    fLThigh.matrix = new Matrix4(body.matrix);
    fLThigh.matrix.translate(-0.3, -1, 0.3);
    fLThigh.matrix.rotate(fLThigh_Angle, 1, 0, 0);
    fLThigh.matrix.scale(.4, 0.9, 0.3);
    fLThigh.render();

        //front left calf
    let fLCalf = new Cube();
    fLCalf.color = body.color;
    fLCalf.matrix = new Matrix4(fLThigh.matrix);
    fLCalf.matrix.translate(0, -1, 0);
    fLCalf.matrix.rotate(fLCalfAngle, 1, 0, 0);
    fLCalf.matrix.scale(1, 0.9, 0.9);
    fLCalf.render();

        //front left foot

    let fLFoot = new Cylinder(16);
    fLFoot.color = [0.5, 0.3, 0.2, 1.0];
    fLFoot.matrix = new Matrix4(fLCalf.matrix);
    fLFoot.matrix.translate(0, -.7, .1);
    fLFoot.matrix.rotate(fLFootAngle, 1, 0, 0);
    fLFoot.matrix.scale(1, .3, 1.2);
    fLFoot.render();

    // back legs

        //back right thigh
    let bRThigh = new Cube();
    bRThigh.color = body.color;
    bRThigh.matrix = new Matrix4(body.matrix);
    bRThigh.matrix.translate(0.3, -1, -0.3);
    bRThigh.matrix.rotate(bRThigh_Angle, 1, 0, 0);
    bRThigh.matrix.scale(0.4, 0.9, 0.3);
    bRThigh.render();

        //back right calf
    let bRCalf = new Cube();
    bRCalf.color = body.color;
    bRCalf.matrix = new Matrix4(bRThigh.matrix);
    bRCalf.matrix.translate(0, -1, 0);
    bRCalf.matrix.rotate(bRCalfAngle, 1, 0, 0);
    bRCalf.matrix.scale(1, 0.9, 0.9);
    bRCalf.render();
        //back right foot

    let bRFoot = new Cylinder(16);
    bRFoot.color = [0.5, 0.3, 0.2, 1.0];
    bRFoot.matrix = new Matrix4(bRCalf.matrix);
    bRFoot.matrix.translate(0, -.7, .1);
    bRFoot.matrix.rotate(bRFootAngle, 1, 0, 0);
    bRFoot.matrix.scale(1, .3, 1.2);
    bRFoot.render();

        //back left thigh
    let bLThigh = new Cube();
    bLThigh.color = body.color;
    bLThigh.matrix = new Matrix4(body.matrix);
    bLThigh.matrix.translate(-0.3, -1, -0.3);
    bLThigh.matrix.rotate(bLThigh_Angle, 1, 0, 0);
    bLThigh.matrix.scale(.4, 0.9, 0.3);
    bLThigh.render();

            //back left calf
    let bLCalf = new Cube();
    bLCalf.color = body.color;
    bLCalf.matrix = new Matrix4(bLThigh.matrix);
    bLCalf.matrix.translate(0, -1, 0);
    bLCalf.matrix.rotate(bLCalfAngle, 1, 0, 0);
    bLCalf.matrix.scale(1, 0.9, 0.9);
    bLCalf.render();

        //back left foot

    let bLFoot = new Cylinder(16);
    bLFoot.color = [0.5, 0.3, 0.2, 1.0];
    bLFoot.matrix = new Matrix4(bLCalf.matrix);
    bLFoot.matrix.translate(0, -.7, .1);
    bLFoot.matrix.rotate(bLFootAngle, 1, 0, 0);
    bLFoot.matrix.scale(1, .3, 1.2);
    bLFoot.render();

    // neck joint
    let neckJoint = new Matrix4(body.matrix);
    neckJoint.translate(0, -0.1, -.3);
    neckJoint.rotate(gNeck_Angle, 1, 0, 0);

    // neck (cylinder)
    let neck = new Cylinder(16);
    neck.color = body.color;
    neck.matrix = new Matrix4(neckJoint);
    neck.matrix.translate(0, 1.1, .5);
    neck.matrix.scale(.7, 1.3, .5);
    neck.render();

    // mane

    for (let i = 0; i < 4; i++) {
      let mane = new Cube();
      mane.color = [0.5, 0.3, 0.2, 1.0];

      mane.matrix = new Matrix4(neck.matrix);
      mane.matrix.translate(0, -0.1 + i * 0.2, -0.65);
      mane.matrix.scale(0.2, 0.16, 0.15);

      mane.render();
    }

    // head joint
    let headJoint = new Matrix4(neck.matrix);
    headJoint.translate(0, 0, 0);
    headJoint.rotate(gHead_Angle, 0, 1, 0);

    // head (cylinder)
    let head = new Cylinder(16);
    head.color = body.color;
    head.matrix = new Matrix4(headJoint);
    head.matrix.translate(0, .75, 0);
    head.matrix.scale(1, .5, 1);
    head.render();

    //snout (cylinder)
    let snout = new Cylinder(16);
    snout.color = body.color
    snout.matrix = new Matrix4(head.matrix);
    snout.matrix.translate(0, -0.2, 0.8);
    snout.matrix.scale(.8, 0.6, .4);
    snout.matrix.rotate(gSnout_Angle, 1, 0, 0);
    snout.render();

    //eyes
    let eyeL = new Cube();
    eyeL.color = [0.0, 0.0, 0.0, 1.0];
    eyeL.matrix = new Matrix4(head.matrix);
    eyeL.matrix.translate(-0.2, 0.2, 0.5);
    eyeL.matrix.scale(0.1, 0.1, 0.1);
    eyeL.render();

    let eyeR = new Cube();
    eyeR.color = [0.0, 0.0, 0.0, 1.0];
    eyeR.matrix = new Matrix4(head.matrix);
    eyeR.matrix.translate(0.2, .2, 0.5);
    eyeR.matrix.scale(0.1, 0.1, 0.1);
    eyeR.render();

    // tail joint
    let tailJoint = new Matrix4(body.matrix);
    tailJoint.translate(0, .05, -.35);
    tailJoint.rotate(gTail_Angle, 1, 0, 0);

    // tail
    let tail = new Cube();
    tail.color = [0.5, 0.3, 0.2, 1.0];
    tail.matrix = new Matrix4(tailJoint);
    tail.matrix.translate(0, -.1, -.15);
    tail.matrix.scale(0.2, 0.5, 0.1);
    tail.render();
}

function tick(){
    const now = performance.now();
    frameCount ++;

    if (now - lastFrameTime > 500){
        fps = (frameCount * 1000) / (now - lastFrameTime);
        document.getElementById("fps").innerText = fps.toFixed(1);
        frameCount = 0;
        lastFrameTime = now;
    }
    if (g_animate){
        g_seconds += 0.1;
        updateAnimationAngles(g_animation);
    }
    if (g_animation == 2){
        g_pokeTime += .1;
    }
    renderScene();
    requestAnimationFrame(tick);
}


function toggleAnimation(){
    g_animate = !g_animate;
}

function setBaseAngles(){
    gBody_Angle = 0;
    fRThigh_Angle = 0;
    fLThigh_Angle = 0;
    fRCalfAngle = 0;
    fLCalfAngle = 0;
    fRFootAngle = 0;
    fLFootAngle = 0;
    bRThigh_Angle = 0;
    bLThigh_Angle = 0;
    bRCalfAngle = 0;
    bLCalfAngle = 0;
    bRFootAngle = 0;
    bLFootAngle = 0;
    gNeck_Angle = 0;
    gHead_Angle = 0;
    gSnout_Angle = 90;
    gTail_Angle = 0;
}

function updateAnimationAngles(g_animation){
    if (!g_animate){
        return;
    }

    switch(g_animation){
        case 0: // walking
            let speed = 0.6;

            // base wave
            let t = g_seconds * speed;

            // triangle wave (smooth but with clearer "steps")
            function tri(x){
                return Math.asin(Math.sin(x)) * (2 / Math.PI);
            }

            let wave = tri(t);

            let amp = 10;
            let amp2 = 30

            // diagonal gait
            fRThigh_Angle = wave * amp;
            bLThigh_Angle = wave * amp;

            fLThigh_Angle = -wave * amp;
            bRThigh_Angle = -wave * amp;

            // calves lag behind thighs (key for realism)
            let calfWave = tri(t - 1);

            fRCalfAngle = Math.max(0, -calfWave * amp2 * 0.6);
            fLCalfAngle = Math.max(0, calfWave * amp2 * 0.6);
            bRCalfAngle = Math.max(0, calfWave * amp2 * 0.6);
            bLCalfAngle = Math.max(0, -calfWave * amp2 * 0.6);

            let footWave = tri(t - 1);

            fRFootAngle = Math.max(-5, -100 +footWave * amp * 0.6);
            fLFootAngle = Math.max(-5, -100 +footWave * amp * 0.6);
            bRFootAngle = Math.max(-5, -100 +footWave * amp * 0.6);
            bLFootAngle = Math.max(-5, -100 +footWave * amp * 0.6);

            // body bob (small!)
            gBody_Angle = Math.sin(t) * 2;

            gTail_Angle = 30 + 15 * Math.sin(g_seconds * .6);
            break;

        case 1: // awkward dancing
            gNeck_Angle = 5 * Math.sin(g_seconds * 1.2);
            gHead_Angle = 5 * Math.sin(g_seconds * 1.2);

            gBody_Angle = 5 * Math.sin(g_seconds * 1.2);
            gTail_Angle = 30 + 15 * Math.sin(g_seconds * 1.2);
            
            break;

        case 2: // poke animation
            gHead_Angle = 5 * Math.sin(g_seconds * 1.2);
            if (g_pokeTime > 15.0){
                g_animate = false;
                setBaseAngles();
            }
            break;
        }
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();

  initCubeBuffer();
  triangleBuffer = gl.createBuffer();

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.5, 0.8, 0.9, 1.0);
  initMouseControls();
  renderScene();

  tick();
}