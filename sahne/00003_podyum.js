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
    // CSP style-src 'self': podyum stili sahne.css'te (pd-* sınıfları)
    kap.innerHTML = `<div class="pd"><div class="pd-yol"></div><div class="pd-isik pd-sol"></div><div class="pd-isik pd-sag"></div>
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
