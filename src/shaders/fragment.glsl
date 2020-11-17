uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec4 resolution;

varying vec2 vUv;
varying vec4 vPosition;

void main(){
	
	vec3 color1=vec3(fract(time/5.),.847,.745);
	gl_FragColor=vec4(vUv,0.,1.);
}