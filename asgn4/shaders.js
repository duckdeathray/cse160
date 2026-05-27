var VSHADER_SOURCE = 
  `attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform vec3 u_LightPos;
  uniform vec3 u_LightColor;

  varying vec2 v_UV;
  varying vec3 v_LightPos;
  varying vec3 v_NormalDir;
  varying vec3 v_LightDir;
  varying vec3 v_WorldPos;
  
  void main() {
    vec4 worldPos = u_ModelMatrix * a_Position;
    mat3 normalMatrix = mat3(u_ModelMatrix);
    vec3 N = normalize(normalMatrix * a_Normal);
    vec3 L = u_LightPos - worldPos.xyz;
    v_NormalDir = N;
    v_LightDir = L;
    v_WorldPos = worldPos.xyz;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * worldPos;
    v_UV = a_UV;
    }`;

var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_NormalDir;
  varying vec3 v_LightDir;
  varying vec3 v_WorldPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightColor;
  uniform bool u_LightingEnabled;

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
      
    vec4 baseColor = (1.0 - u_texColorWeight) * u_BaseColor + u_texColorWeight * texColor;
    
    vec3 finalColor = baseColor.rgb;
    if (u_LightingEnabled) {
      float ambient = .2;
      
      vec3 N = normalize(v_NormalDir);
      vec3 L = normalize(v_LightDir);
      vec3 V = normalize(u_CameraPos - v_WorldPos);
      
      float diffuse = max(dot(N, L), 0.0);
      vec3 H = normalize(L + V);
      float spectral = pow(max(dot(N, H), 0.0), 16.0);

      vec3 diffuseColor = u_LightColor * diffuse * .7;
      vec3 spectralColor = u_LightColor * spectral * .3;
      vec3 ambientColor = ambient * baseColor.rgb * 1.4;

      finalColor = ambientColor + diffuseColor + spectralColor;
  }
    gl_FragColor = vec4(finalColor, baseColor.a);
    }`;