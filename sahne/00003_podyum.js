// Slot 3 · Podyum: CSS 3B dönüşümle perspektif podyum, Web Animations API ile spot ışıkları,
// View Transitions API ile yayın türleri arasında geçiş. Türler afair.live'ın kendi formundan alındı.
const TURLER = [
  ['Koleksiyon gösterimi', 'Podyumda yeni seri; her görünüm bir sahne slotuna bağlanabilir.'],
  ['Tasarımcı söyleşisi', 'Tasarımcı konuşur, GPT ekip notu ve altyazıyı yazar.'],
  ['Sahne arkası', 'Prova ve hazırlık; kamera arkasındaki iş akışı.']
];

export default {
  slot: 3,
  ad: 'Podyum',
  kimlik: 'CLAUDE · claude-opus-5-5',
  teknik: ['CSS 3B perspektif', 'Web Animations API', 'View Transitions API', 'aria-live'],
  kur(kap, ortam) {
    kap.innerHTML = `
<style>
.pd{position:relative;height:clamp(17rem,42vw,26rem);overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#2a1c18,#0d0b0c 70%);perspective:700px}
.pd-yol{position:absolute;left:50%;bottom:-10%;width:min(46%,22rem);height:140%;transform:translateX(-50%) rotateX(68deg);transform-origin:50% 100%;
  background:repeating-linear-gradient(0deg,#f2cb9c18 0 2px,transparent 2px 46px),linear-gradient(90deg,#1b1415,#3a2a24 50%,#1b1415);border-inline:2px solid #f2cb9c55}
.pd-isik{position:absolute;top:-20%;width:38%;height:140%;background:linear-gradient(180deg,#f2cb9c40,transparent 75%);filter:blur(14px);transform-origin:50% 0;mix-blend-mode:screen}
.pd-yazi{position:absolute;left:1rem;right:1rem;bottom:1rem;display:flex;justify-content:space-between;align-items:end;gap:1rem;flex-wrap:wrap}
.pd-yazi h3{margin:0;font:400 clamp(1.3rem,3.4vw,2.4rem) Georgia,serif;view-transition-name:pd-baslik}
.pd-yazi p{margin:.2rem 0 0;color:var(--soluk);max-width:38ch;view-transition-name:pd-not}
.pd-dugme{display:flex;gap:.4rem;flex-wrap:wrap}
.pd-dugme button{font:inherit;font-size:.82rem;color:var(--yazi);background:#1d1617cc;border:1px solid var(--cizgi);border-radius:99px;padding:.3rem .8rem;cursor:pointer}
.pd-dugme button[aria-pressed=true]{background:var(--altin);color:#140f0f;border-color:var(--altin)}
</style>
<div class="pd"><div class="pd-yol"></div><div class="pd-isik" style="left:4%"></div><div class="pd-isik" style="right:4%"></div>
<div class="pd-yazi"><div aria-live="polite"><h3></h3><p></p></div><div class="pd-dugme" role="group" aria-label="Yayın türü"></div></div></div>`;
    const baslik = kap.querySelector('h3'), not = kap.querySelector('.pd-yazi p');
    const grup = kap.querySelector('.pd-dugme');
    const goster = i => {
      const yaz = () => {
        baslik.textContent = TURLER[i][0]; not.textContent = TURLER[i][1];
        for (const [j, b] of [...grup.children].entries()) b.setAttribute('aria-pressed', String(i === j));
      };
      if (document.startViewTransition && !ortam.azHareket) document.startViewTransition(yaz); else yaz();
    };
    TURLER.forEach(([ad], i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = ad;
      b.addEventListener('click', () => goster(i)); grup.append(b);
    });
    goster(0);
    const isiklar = [...kap.querySelectorAll('.pd-isik')];
    const yol = kap.querySelector('.pd-yol');
    const animasyonlar = ortam.azHareket ? [] : [
      ...isiklar.map((el, i) => el.animate(
        [{ transform: `rotate(${i ? 18 : -18}deg)` }, { transform: `rotate(${i ? -6 : 6}deg)` }],
        { duration: 4200 + i * 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' })),
      yol.animate([{ backgroundPosition: '0 0, 0 0' }, { backgroundPosition: '0 48px, 0 0' }],
        { duration: 1400, iterations: Infinity })
    ];
    animasyonlar.forEach(a => a.pause());
    return {
      basla() { animasyonlar.forEach(a => a.play()); },
      dur() { animasyonlar.forEach(a => a.pause()); }
    };
  }
};
