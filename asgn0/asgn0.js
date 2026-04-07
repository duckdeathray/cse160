// HelloCanvas.js (c) 2012 matsuda
let canvas, ctx;

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Failed to get the 2d context');
    return;
  }

  clear(ctx);

  /*2
  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(ctx, v1, 'red');
  */

  //3
  const button1 = document.getElementById('vector_draw_button');
  button1.addEventListener('click', handleDrawEvent);

  //5
  const button2 = document.getElementById('operation_draw_button');
  button2.addEventListener('click', handleDrawOperationEvent);

}

function handleDrawOperationEvent() {
  clear(ctx);
  const x1 = parseFloat(document.getElementById('x1_input').value);
  const y1 = parseFloat(document.getElementById('y1_input').value);
  const x2 = parseFloat(document.getElementById('x2_input').value);
  const y2 = parseFloat(document.getElementById('y2_input').value);
  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar_input').value);

  const v1 = new Vector3([x1, y1, 0]);
  const v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (operation === 'add') {
    const result = v1.add(v2);
    drawVector(result, 'green');
  }
  else if (operation === 'sub') {
    const result = v1.sub(v2);
    drawVector(result, 'green');
  }
  else if (operation === 'mul') {
    const result = v1.mul(scalar);
    drawVector(result, 'green');
  }
  else if (operation === 'div') {
    const result = v1.div(scalar);
    drawVector(result, 'green');
  }
  else if (operation === 'magnitude') {
    const m1 = v1.magnitude();
    const m2 = v2.magnitude();
    console.log("Magnitude v1: " + m1);
    console.log("Magnitude v2: " + m2);
  }
  else if (operation === 'normalize') {
    v1.normalize();
    v2.normalize();
    drawVector(v1, 'green');
    drawVector(v2, 'green');
  }
  else if (operation === 'angle_between') {
    let angle = Vector3.dot(v1, v2);
    const m1 = v1.magnitude();
    const m2 = v2.magnitude();
    angle = angle / m1 / m2;
    angle = Math.acos(angle);
    angle = angle * (180 / Math.PI);
    console.log("Angle: " + angle);
  }
  else if (operation === 'area') {
    const cross = Vector3.cross(v1, v2);
    const area = cross.magnitude() / 2;
    console.log("Area: " + area);
  }

}