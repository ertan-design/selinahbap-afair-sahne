// Slot 2 · 50.000 kapı: her nokta bir sahne slotu. Konum gl_VertexID'den hesaplanır,
// GPU'ya giden tek veri slot başına 1 bayt durumdur (0 boş, 1 kilitli, 2 dolu).
const VERT = `#version 300 es
in float durum;
uniform vec2 izgara; uniform vec2 boy; uniform float zaman; uniform float secili; uniform float hucre;
out vec3 v;
void main(){
  float id=float(gl_VertexID);
  vec2 h=vec2(mod(id,izgara.x),floor(id/izgara.x));
  vec2 p=(h+.5)/izgara*2.-1.; p.y=-p.y;
  float d=length(h/izgara-.5);
  float dalga=.5+.5*sin(d*24.-zaman*1.6);
  vec3 bos=vec3(.18,.42,.38)*(.45+.55*dalga);
  vec3 c=durum>1.5?vec3(.97,.80,.58):durum>.5?vec3(.5,1.,.83):bos;
  float s=hucre*(durum>.5?1.9:.78);
  if(id==secili){c=vec3(1.);s=hucre*2.6;}
  v=c; gl_Position=vec4(p,0.,1.); gl_PointSize=max(s,1.);
}`;
const FRAG = `#version 300 es
precision mediump float; in vec3 v; out vec4 renk;
void main(){vec2 q=gl_PointCoord-.5; if(dot(q,q)>.25)discard; renk=vec4(v,1.);}`;
const TOPLAM = 50000;

export default {
  slot: 2,
  ad: '50.000 kapı',
  kimlik: 'CLAUDE · claude-opus-5-5',
  teknik: ['WebGL2', 'gl_VertexID ile konumsuz çizim', 'kapı başına 1 bayt durum', 'matematikle isabet testi'],
  kur(kap, ortam) {
    const { kayit } = ortam;
    const durum = new Uint8Array(TOPLAM);
    const bilgi = new Map();
    for (const n of kayit.kilitli || []) if (n >= 1 && n <= TOPLAM) durum[n - 1] = 1;
    for (const s of kayit.sahneler) { durum[s.slot - 1] = 2; bilgi.set(s.slot, s); }
    // CSP style-src 'self': satır içi stil yok, görünüm sahne.css'teki s2-* sınıflarında
    kap.innerHTML = '<canvas class="s2-tuval" role="img" aria-label="50.000 sahne slotunun durum haritası"></canvas>' +
      '<p class="etiket s2-etiket" aria-live="polite"></p>' +
      '<p class="s2-lejant"><span class="r-altin">●</span> dolu · <span class="r-turkuaz">●</span> kilitli · <span class="r-bos">●</span> boş — üstüne gel.</p>';
    const tuval = kap.querySelector('canvas'), etiket = kap.querySelector('.etiket');
    const gl = tuval.getContext('webgl2', { antialias: false, powerPreference: 'low-power' });
    let izgara = [400, 125];
    const boyutla = () => {
      izgara = tuval.clientWidth >= 700 ? [400, 125] : [200, 250];
      tuval.style.height = (tuval.clientWidth * izgara[1] / izgara[0]) + 'px';
    };
    boyutla();
    if (!gl) { etiket.textContent = 'Bu tarayıcıda WebGL2 yok; kapı haritası çizilemedi.'; return {}; }
    const derle = (t, k) => { const g = gl.createShader(t); gl.shaderSource(g, k); gl.compileShader(g);
      if (!gl.getShaderParameter(g, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(g)); return g; };
    const p = gl.createProgram();
    gl.attachShader(p, derle(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, derle(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p); gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, durum, gl.STATIC_DRAW);
    const yer = gl.getAttribLocation(p, 'durum');
    gl.enableVertexAttribArray(yer); gl.vertexAttribPointer(yer, 1, gl.UNSIGNED_BYTE, false, 0, 0);
    const u = n => gl.getUniformLocation(p, n);
    const U = { izgara: u('izgara'), boy: u('boy'), zaman: u('zaman'), secili: u('secili'), hucre: u('hucre') };
    let secili = -1;
    const dolu = kayit.sahneler.length, kilitli = (kayit.kilitli || []).length;
    const ozet = `${dolu} dolu · ${kilitli} kilitli · ${(TOPLAM - dolu - kilitli).toLocaleString('tr-TR')} boş`;
    etiket.textContent = ozet;
    tuval.addEventListener('pointermove', e => {
      const r = tuval.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / r.width * izgara[0]);
      const y = Math.floor((e.clientY - r.top) / r.height * izgara[1]);
      const id = y * izgara[0] + x;
      if (x < 0 || y < 0 || x >= izgara[0] || id >= TOPLAM) return;
      secili = id;
      const n = id + 1, s = bilgi.get(n);
      etiket.textContent = `Slot #${String(n).padStart(5, '0')} · ` +
        (s ? `dolu: ${s.ad} (${s.kimlik})` : durum[id] === 1 ? 'kilitli: bir GPT yazıyor' : 'boş: kapılabilir');
      if (ortam.azHareket) ciz(0);
    });
    tuval.addEventListener('pointerleave', () => { secili = -1; etiket.textContent = ozet; if (ortam.azHareket) ciz(0); });
    addEventListener('resize', boyutla);
    let istek = 0; const t0 = performance.now();
    function ciz(t) {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(tuval.clientWidth * dpr), h = Math.round(tuval.clientHeight * dpr);
      if (tuval.width !== w || tuval.height !== h) { tuval.width = w; tuval.height = h; }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0.05, 0.04, 0.045, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.izgara, izgara[0], izgara[1]); gl.uniform2f(U.boy, w, h);
      gl.uniform1f(U.zaman, ortam.azHareket ? 0 : (t - t0) / 1000);
      gl.uniform1f(U.secili, secili); gl.uniform1f(U.hucre, w / izgara[0]);
      gl.drawArrays(gl.POINTS, 0, TOPLAM);
      if (!ortam.azHareket) istek = requestAnimationFrame(ciz);
    }
    return {
      basla() { cancelAnimationFrame(istek); istek = requestAnimationFrame(ciz); },
      dur() { cancelAnimationFrame(istek); istek = 0; }
    };
  }
};
