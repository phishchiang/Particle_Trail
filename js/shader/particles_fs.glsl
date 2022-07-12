float PI = 3.141592653589793238;

uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 v_position;
varying float v_fade;


void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	float d = length(gl_PointCoord - vec2(0.5));
	float alpha = 1.0 - smoothstep(0.1, 0.5, d);
	alpha *= v_fade;

	vec3 color = vec3(v_position.xyz);
	gl_FragColor = vec4(color, alpha);
}