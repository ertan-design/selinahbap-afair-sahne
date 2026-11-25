// Slot 4 · Ekip akışı: 8 GPT şeridi aynı beş istasyondan geçer. Paketler CSS Motion Path
// (offset-path) üstünde Web Animations API ile yürür. Sayılar sayfanın kendi kaydından gelir.
const ISTASYON = ['kap', 'yaz', 'teslim', 'denetle', 'sahne'];

export default {
  slot: 4,
  ad: 'Ekip akışı · 8 GPT',
  kimlik: 'CLAUDE · claude-opus-5-5',
  teknik: ['SVG', 'CSS Motion Path (offset-path)', 'Web Animations API', 'CSS değişkenleri'],
  kur(kap, ortam) {
    const { kayit } = ortam;
    // viewBox kutunun gerçek genişliğinde: yazılar telefonda da 13 px kalır
    const G = Math.max(320, Math.min(1200, Math.round(kap.clientWidth - 32) || 760)), Y = 300, sol = 30, sag = G - 30;
    const x = i => sol + i * (sag - sol) / (ISTASYON.length - 1);
    const seritY = s => 40 + s * (Y - 80) / 7;
    let svg = `<svg viewBox="0 0 ${G} ${Y}" class="s4-svg" role="img" aria-label="Sekiz GPT şeridi ve beş istasyon">`;
    for (let s = 0; s < 8; s++) svg += `<line x1="${sol}" y1="${seritY(s)}" x2="${sag}" y2="${seritY(s)}" stroke="#3b302c" stroke-width="1"/>`;
    ISTASYON.forEach((ad, i) => {
      svg += `<line x1="${x(i)}" y1="24" x2="${x(i)}" y2="${Y - 24}" stroke="${i === 3 ? '#7fffd4' : '#5a4a42'}" stroke-dasharray="3 5"/>` +
        `<text x="${x(i)}" y="16" fill="${i === 4 ? '#f2cb9c' : '#b9aca1'}" font-size="13" text-anchor="middle">${ad}</text>`;
    });
    svg += '</svg>';
    // CSP style-src 'self': satır içi stil yok, görünüm sahne.css'teki s4-* sınıflarında (paket konumu CSSOM ile)
    kap.innerHTML = `<div class="ak s4-ak">${svg}<div class="ak-paket s4-paket"></div></div>` +
      `<p class="s4-not">Kayıttaki dolu sahne: <b class="r-altin">${kayit.sahneler.length}</b>. ` +
      `Denetle istasyonu turkuaz: orada ölçen, üreten değil. Paketler temsilidir; gerçek iş sayısı yukarıdaki sayıdır.</p>`;
    const katman = kap.querySelector('.ak-paket');
    const animasyonlar = [];
    for (let s = 0; s < 8; s++) {
      const p = document.createElement('i');
      const yuzdeY = seritY(s) / Y * 100;
      p.style.cssText = `position:absolute;left:0;top:0;width:10px;height:10px;border-radius:50%;` +
        `background:${s % 2 ? '#7fffd4' : '#f2cb9c'};box-shadow:0 0 12px currentColor;color:${s % 2 ? '#7fffd4' : '#f2cb9c'};` +
        `offset-rotate:0deg;offset-anchor:50% 50%`;
      katman.append(p);
      const ayarla = () => {
        const w = katman.clientWidth, h = katman.clientHeight;
        const y = h * yuzdeY / 100;
        p.style.offsetPath = `path("M ${w * sol / G} ${y} L ${w * sag / G} ${y}")`;
      };
      ayarla(); addEventListener('resize', ayarla);
      if (ortam.azHareket) { p.style.offsetDistance = ((s * 13) % 100) + '%'; continue; }
      const a = p.animate(
        [{ offsetDistance: '0%', opacity: 0 }, { offsetDistance: '8%', opacity: 1 },
         { offsetDistance: '60%', opacity: 1 }, { offsetDistance: '62%', opacity: 1, transform: 'scale(1.8)' },
         { offsetDistance: '100%', opacity: 0, transform: 'scale(1)' }],
        { duration: 5200 + s * 370, delay: -s * 640, iterations: Infinity, easing: 'linear' });
      a.pause(); animasyonlar.push(a);
    }
    return {
      basla() { animasyonlar.forEach(a => a.play()); },
      dur() { animasyonlar.forEach(a => a.pause()); }
    };
  }
};
