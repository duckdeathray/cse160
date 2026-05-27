const SPHERE_LAT = 20;
const SPHERE_LON = 20;

let sphereVertexBuffer;
let sphereNormalBuffer;
let sphereVertexCount;

function initSphereBuffers() {
    let vertices = [];
    let normals = [];

    for (let lat = 0; lat < SPHERE_LAT; lat++) {
        let theta1 = lat * Math.PI / SPHERE_LAT;
        let theta2 = (lat + 1) * Math.PI / SPHERE_LAT;

        for (let lon = 0; lon < SPHERE_LON; lon++) {
            let phi1 = lon * 2 * Math.PI / SPHERE_LON;
            let phi2 = (lon + 1) * 2 * Math.PI / SPHERE_LON;

            // 4 points
            let p1 = spherePoint(theta1, phi1);
            let p2 = spherePoint(theta2, phi1);
            let p3 = spherePoint(theta2, phi2);
            let p4 = spherePoint(theta1, phi2);

            // Triangle 1
            vertices.push(...p1, ...p2, ...p3);
            normals.push(...p1, ...p2, ...p3);

            // Triangle 2
            vertices.push(...p1, ...p3, ...p4);
            normals.push(...p1, ...p3, ...p4);
        }
    }

    sphereVertexCount = vertices.length / 3;

    sphereVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    sphereNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

function spherePoint(theta, phi) {
    let x = Math.sin(theta) * Math.cos(phi);
    let y = Math.cos(theta);
    let z = Math.sin(theta) * Math.sin(phi);
    return [x, y, z];
}

class Sphere {
    constructor() {
        this.matrix = new Matrix4();
        this.color = [1, 1, 1, 1];
        this.useTexture = false;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_BaseColor, ...this.color);
        gl.uniform1f(u_texColorWeight, 0.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, sphereVertexCount);
    }
}