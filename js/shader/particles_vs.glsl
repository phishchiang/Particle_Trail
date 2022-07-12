float PI = 3.141592653589793238;

uniform float time;
uniform sampler2D texture1;

varying vec2 vUv;
varying vec3 v_position;
varying float v_fade;

attribute float a_angle;
attribute float a_life;
attribute float a_offset;

void main() {
  vUv = uv;
  v_position = position;
  vec3 new_position = position;

  // Offset the starting point
  float starting_point = a_offset + time;

  // Looping based on the life
  float current = mod(starting_point, a_life);
  float percent = current / a_life;

  // Fade In and Out
  v_fade = smoothstep(0.0, 0.15, percent);
  v_fade *= smoothstep(1.0, 0.85, percent);

  // Starting full circle direction from XY plane
  new_position.x += cos(a_angle) * current * 0.1;
  new_position.y += sin(a_angle) * current * 0.1;


  vec4 mvPosition = modelViewMatrix * vec4( new_position, 1. );
  gl_PointSize = 100. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}