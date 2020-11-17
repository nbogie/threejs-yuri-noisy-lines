uniform float time;

varying vec2 vUv;
varying vec4 vPosition;

void main(){
	
	vec3 color1=vec3(fract(time/5.),.847,.745);
	gl_FragColor=vec4(color1,1.);
}