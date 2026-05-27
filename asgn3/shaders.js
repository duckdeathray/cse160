var VSHADER_SOURCE = 
  `attribute vec4 a_Position;
  attribute vec2 a_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  varying vec2 v_UV;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    }`;

var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;

  uniform vec4 u_BaseColor;
  uniform float u_texColorWeight;
  uniform float u_useExitTexture;

  void main() {
    vec4 texColor;
    if (u_useExitTexture > .5){
        texColor = texture2D(u_Sampler1, v_UV);
    }
    else {
        texColor = texture2D(u_Sampler0, v_UV);
    }
    gl_FragColor = (1.0 - u_texColorWeight) * u_BaseColor + u_texColorWeight * texColor;
    }`;