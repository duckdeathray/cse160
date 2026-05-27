let normalBuffer;

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
  
const cubeNormals = new Float32Array([
    // +Z (front)
    0,0,1,  0,0,1,  0,0,1,
    0,0,1,  0,0,1,  0,0,1,

    // -Z (back)
    0,0,-1,  0,0,-1,  0,0,-1,
    0,0,-1,  0,0,-1,  0,0,-1,

    // -X (left)
    -1,0,0,  -1,0,0,  -1,0,0,
    -1,0,0,  -1,0,0,  -1,0,0,

    // +X (right)
    1,0,0,  1,0,0,  1,0,0,
    1,0,0,  1,0,0,  1,0,0,

    // +Y (top)
    0,1,0,  0,1,0,  0,1,0,
    0,1,0,  0,1,0,  0,1,0,

    // -Y (bottom)
    0,-1,0,  0,-1,0,  0,-1,0,
    0,-1,0,  0,-1,0,  0,-1,0
]);

function initNormalBuffer(){
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);
}

function initCubeBuffer() {
    cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
}

class Cube {
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.useTexture = false;
    this.isExit = false;
  }

    render(){
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_BaseColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        if (this.useTexture) {
            gl.uniform1f(u_texColorWeight, 1.0);

            gl.activeTexture(gl.TEXTURE0);

            if (this.isExit) {
                gl.bindTexture(gl.TEXTURE_2D, texture1);
                gl.uniform1i(u_useExitTexture, 1);
            } 
            else {
                gl.bindTexture(gl.TEXTURE_2D, texture0);
                gl.uniform1i(u_useExitTexture, 0);
            }

        } 
        else {
            gl.uniform1f(u_texColorWeight, 0.0); // force solid color
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
}