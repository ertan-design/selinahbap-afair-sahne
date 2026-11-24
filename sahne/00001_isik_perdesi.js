// Slot 1 · Işık perdesi: defile perdesi GPU'da, piksel başına hesaplanır. İmleç spot ışığını taşır.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 boy; uniform float zaman; uniform vec2 imlec;
out vec4 renk;
float gurultu(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float yumusak(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(gurultu(i),gurultu(i+vec2(1,0)),f.x),mix(gurultu(i+vec2(0,1)),gurultu(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/boy; float en=boy.x/boy.y;
  float x=uv.x*en;
  float kivrim=sin(x*9.+sin(uv.y*3.+zaman*.35)*1.6+zaman*.25)*.5+.5;
  kivrim=pow(kivrim,2.2);
  float doku=yumusak(vec2(x*28.,uv.y*2.+zaman*.1))*.25;
  vec3 kadife=mix(vec3(.08,.03,.04),vec3(.45,.22,.14),kivrim+doku);
  vec2 s=vec2(imlec.x*en,imlec.y); float d=length(vec2(x,uv.y)-s);
  float spot=smoothstep(.55,0.,d);
  vec3 altin=vec3(.95,.80,.61), turkuaz=vec3(.5,1.,.83);
  float tarama=smoothstep(.012,0.,abs(fract(uv.y*.5-zaman*.06)-.5))*.35;
  vec3 c=kadife+altin*spot*.75+turkuaz*tarama*(1.-uv.y)*.6;
  c*=smoothstep(0.,.25,uv.y)*.35+.65;
  renk=vec4(c,1.);
}`;
const VERT = `#version 300 es
in vec2 k; void main(){gl_Position=vec4(k,0.,1.);}`;

export default {
  slot: 1,
  ad: 'Işık perdesi',
  kimlik: 'CLAUDE · claude-opus-5-5',
  teknik: ['WebGL2', 'GLSL parça gölgelendirici', 'Pointer Events', 'devicePixelRatio sınırı'],
  kur(kap, ortam) {
    const tuval = document.createElement('canvas');
    tuval.style.cssText = 'display:block;width:100%;height:clamp(16rem,48vw,30rem)';
    tuval.setAttribute('role', 'img');
    tuval.setAttribute('aria-label', 'Hareket eden kadife perde ve imleci izleyen spot ışığı');
    kap.append(tuval);
    const gl = tuval.getContext('webgl2', { antialias: false, powerPreference: 'low-power' });
    if (!gl) {
      tuval.style.background = 'linear-gradient(110deg,#140a0c,#5a2d1d 30%,#1d0f11 55%,#8a5a3c 80%,#140a0c)';
      return {};
    }
    const derle = (tur, kaynak) => {
      const g = gl.createShader(tur); gl.shaderSource(g, kaynak); gl.compileShader(g);
      if (!gl.getShaderParameter(g, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(g));
      return g;
    };
    const p = gl.createProgram();
    gl.attachShader(p, derle(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, derle(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p); gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const yer = gl.getAttribLocation(p, 'k');
    gl.enableVertexAttribArray(yer); gl.vertexAttribPointer(yer, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(p, n);
    const uBoy = u('boy'), uZaman = u('zaman'), uImlec = u('imlec');
    const hedef = [0.5, 0.6], imlec = [0.5, 0.6];
    tuval.addEventListener('pointermove', e => {
      const r = tuval.getBoundingClientRect();
      hedef[0] = (e.clientX - r.left) / r.width; hedef[1] = 1 - (e.clientY - r.top) / r.height;
    });
    const olcekle = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.round(tuval.clientWidth * dpr), h = Math.round(tuval.clientHeight * dpr);
      if (tuval.width !== w || tuval.height !== h) { tuval.width = w; tuval.height = h; gl.viewport(0, 0, w, h); }
    };
    let istek = 0; const t0 = performance.now();
    const ciz = t => {
      olcekle();
      imlec[0] += (hedef[0] - imlec[0]) * 0.08; imlec[1] += (hedef[1] - imlec[1]) * 0.08;
      gl.uniform2f(uBoy, tuval.width, tuval.height);
      gl.uniform1f(uZaman, ortam.azHareket ? 4 : (t - t0) / 1000);
      gl.uniform2f(uImlec, imlec[0], imlec[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!ortam.azHareket) istek = requestAnimationFrame(ciz);
    };
    return {
      basla() { cancelAnimationFrame(istek); istek = requestAnimationFrame(ciz); },
      dur() { cancelAnimationFrame(istek); istek = 0; }
    };
  }
};
