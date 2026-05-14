let texture0;
let texture1;
let u_Sampler0;
let u_BaseColor;
let u_texColorWeight;
let u_ViewMatrix;
let u_ProjectionMatrix;
let camera;
let walls = [];
const PLAYER_RADIUS = .2;
const MAP_SIZE = 32;
let player = {x: 1.5, z: 1.5, angle: 0};
let mouuseDown = false;
let lastMousex = 0;
let startTime = performance.now();
let gameOver = false;
let u_useExitTexture;
let exitCube = false;
let finalTime = 0;

let exit = null;

function resizeCanvas(canvas){
    const dpr = window.devicePixelRatio || 1;
    const width  = canvas.clientWidth  * dpr | 0;
    const height = canvas.clientHeight * dpr | 0;

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function setupWebGL() {
  canvas = document.getElementById('webgl3');
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('Failed to get context');
    return;
  }
  resizeCanvas(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(.2, .2, .2, 1.0);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  u_BaseColor = gl.getUniformLocation(gl.program, 'u_BaseColor');
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_useExitTexture = gl.getUniformLocation(gl.program, 'u_useExitTexture');
}

function initTextures(){
    gl.uniform1i(u_Sampler0, 0);
    texture0 = gl.createTexture();
    texture1 = gl.createTexture();

    let image = new Image();
    image.onload = function(){
        loadTexture(texture0, u_Sampler0, image);
    };
    image.src = 'textures/wall.jpg';

    let exitImg = new Image();
    exitImg.onload = function(){
        loadTexture(texture1, u_Sampler0, exitImg);
    };
    exitImg.src = "textures/door.jpg"
    renderScene();
}

function loadTexture(texture, sampler, image){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(sampler, 0);
}

const cubeUVs = new Float32Array([
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
    0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
]);

function initUVBuffer(){
    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeUVs, gl.STATIC_DRAW);
}

function updateTimer(){
    let now = performance.now();
    let elapsed;
    if (gameOver){
        elapsed = finalTime;
    }
    else {
        elapsed = (now - startTime) / 1000;
    }
    let timerE1 =  document.getElementById("timer");
    timerE1.innerText = "Time: " + elapsed.toFixed(2) + "s";
}

function tick(){
    updateTimer();
    checkWin();
    renderScene();
    requestAnimationFrame(tick);
}

function isWall(x, z){
    let i = Math.floor(x);
    let j = Math.floor(z);

    // DEBUG (IMPORTANT)
    console.log("checking:", i, j);

    if (i < 0 || i >= map.length || j < 0 || j >= map[0].length) {
        return false;
    }

    return map[i][j] === 1;
}

function collides(x, z){
    return(
        isWall(x + PLAYER_RADIUS, z) ||
        isWall(x - PLAYER_RADIUS, z) ||
        isWall(x, z + PLAYER_RADIUS) ||
        isWall(x, z - PLAYER_RADIUS)
    );
}


function initMaze() {
  map = [];
  for (let i = 0; i < MAP_SIZE; i++) {
    map[i] = [];
    for (let j = 0; j < MAP_SIZE; j++) {
      map[i][j] = 1;
    }
  }
}

function generateMaze() {
    initMaze();

    let stack = [];
    let startX = 1;
    let startZ = 1;

    map[startX][startZ] = 0;
    stack.push([startX, startZ]);

    const directions = [
        [2, 0],   // east
        [-2, 0],  // west
        [0, 2],   // south
        [0, -2]   // north
    ];

    while (stack.length > 0) {
        let [x, z] = stack[stack.length - 1];

        let neighbors = [];

        for (let [dx, dz] of directions) {
            let nx = x + dx;
            let nz = z + dz;

            if (
                nx > 0 && nx < MAP_SIZE - 1 &&
                nz > 0 && nz < MAP_SIZE - 1 &&
                map[nx][nz] === 1
            ) {
                neighbors.push([nx, nz, dx, dz]);
            }
        }

        if (neighbors.length === 0) {
            stack.pop();
        } 
        else {
            let [nx, nz, dx, dz] =
                neighbors[Math.floor(Math.random() * neighbors.length)];

            map[x + dx / 2][z + dz / 2] = 0;
            map[nx][nz] = 0;

            stack.push([nx, nz]);
        }
    }
    exit = findFarthestCell(1, 1);
    console.log("exit at", exit.x, exit.z);
}

function findFarthestCell(startX, startZ) {
    let visited = Array.from({ length: MAP_SIZE }, () =>
        Array(MAP_SIZE).fill(false)
    );

    let queue = [];
    queue.push({ x: startX, z: startZ, dist: 0 });
    visited[startX][startZ] = true;

    let farthest = { x: startX, z: startZ, dist: 0 };

    const dirs = [
        [1, 0], [-1, 0],
        [0, 1], [0, -1]
    ];

    while (queue.length > 0) {
        let cur = queue.shift();

        if (cur.dist > farthest.dist) {
            farthest = cur;
        }

        for (let [dx, dz] of dirs) {
            let nx = cur.x + dx;
            let nz = cur.z + dz;

            if (
                nx >= 0 && nx < MAP_SIZE &&
                nz >= 0 && nz < MAP_SIZE &&
                !visited[nx][nz] &&
                map[nx][nz] === 0
            ) {
                visited[nx][nz] = true;
                queue.push({ x: nx, z: nz, dist: cur.dist + 1 });
            }
        }
    }

    return { x: farthest.x, z: farthest.z };
}

function buildWorld(){
    console.log("EXIT POSITION:", exit.x, exit.z);
    walls = [];

    for (let x = 0; x < map.length; x++){
        for (let z = 0; z < map[x].length; z++){

            if (map[x][z] === 1){

                let height = (Math.random() < .5) ? 1 : 2;

                for (let y = 0; y < height; y++){
                    let w = new Cube();
                    w.useTexture = true;
                    w.isExit = false;
                    w.matrix.translate(x + .5, y, z + .5); 
                    walls.push(w);
                }
            }
        }
    }
    exitCube = new Cube();
    exitCube.useTexture = true;
    exitCube.isExit = true;
    exitCube.matrix.scale(2,2,2);
    exitCube.matrix.translate(exit.x + .5, 0, exit.z + .5); 
    console.log("exit created");
}

function checkWin(){
    if (gameOver){
        return;
    }
    if (Math.floor(player.x) === exit.x && Math.floor(player.z) === exit.z){
        gameOver = true;

        let timeTaken = (performance.now() - startTime) / 1000;
        console.log("YOU WIN!");
        console.log("Time:", timeTaken.toFixed(2), "seconds");
    }
}

function renderScene(){
    camera.updateView()
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMatrix.elements);
    
    // sky
    let sky = new Cube();
    sky.useTexture = false;
    sky.color = [0.2, 0.6, 1.0, 1.0];
    sky.matrix.scale(100, 100, 1000);
    sky.matrix.translate(0, 0, 0);
    sky.render();

    //ground
    let ground = new Cube();
    ground.useTexture = false;
    ground.color = [0.2, 0.8, 0.2, 1.0];
    ground.matrix.scale(100, 0.01, 100);
    ground.matrix.translate(0, -50, 0);
    ground.render();

    // walls
    for (let i = 0; i < walls.length; i++){
        walls[i].render();
    }
    exitCube.render();

}


function main() {
    setupWebGL();
    connectVariablesToGLSL();
    let identity = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotation, false, identity.elements);

    camera = new Camera();
    generateMaze();
    buildWorld();
    gl.uniform4f(u_BaseColor, 1, 1, 1, 1);
    gl.uniform1f(u_texColorWeight, 1.0);

    initCubeBuffer();
    initUVBuffer();
    initTextures();

    renderScene();
    tick ();

    document.onkeydown = function(ev){
        const speed = 0.1;
        const sin = Math.sin(player.angle);
        const cos = Math.cos(player.angle);
        switch(ev.key){
            case 'w':
            case 'W':
                camera.moveWithCollisions(cos * speed, sin * speed);
                renderScene();
                break;

            case 's':
            case 'S':
                camera.moveWithCollisions(-cos * speed, -sin * speed);
                renderScene();
                break;

            case 'a':
            case 'A':
                camera.moveWithCollisions(sin * speed, -cos * speed);
                renderScene();
                break;

            case 'd':
            case 'D':
                camera.moveWithCollisions(-sin * speed, cos * speed);
                renderScene();
                break;
        }
    };

    canvas.onmousedown = function(ev){
        mouseDown = true;
        lastMouseX = ev.clientX;
    };

    canvas.onmouseup = function(){
        mouseDown = false;
    };

    canvas.onmousemove = function(ev){
        if (!mouseDown) return;

        let dx = ev.clientX - lastMouseX;
        lastMouseX = ev.clientX;

        const sensitivity = 0.005;

        player.angle += dx * sensitivity;
    };
}