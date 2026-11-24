// Sahne motoru: sahneler.json'daki her slotu ayrı modül olarak yükler, ekranda değilken durdurur,
// bir sahne hata verirse yalnız o sahneyi kapatır. Ağ yok: tüm dosyalar aynı klasörden gelir.
const AZ_HAREKET = matchMedia('(prefers-reduced-motion: reduce)').matches;
const kutu = document.getElementById('sahneler');
const sayac = document.getElementById('sayac');
const teknikListe = document.getElementById('teknikler');
const durum = { yuklu: 0, hata: 0, teknik: new Map() };

function kart(k) {
  const bolum = document.createElement('section');
  bolum.className = 'sahne';
  bolum.id = 's' + String(k.slot).padStart(5, '0');
  bolum.dataset.slot = k.slot;
  bolum.innerHTML = `<header class="sahne-bas"><span class="slot">#${String(k.slot).padStart(5, '0')}</span>` +
    `<h2></h2><span class="kimlik"></span></header><div class="tuval"></div>`;
  bolum.querySelector('h2').textContent = k.ad;
  bolum.querySelector('.kimlik').textContent = k.kimlik;
  kutu.append(bolum);
  return bolum;
}

function teknikEkle(liste) {
  for (const t of liste) durum.teknik.set(t, (durum.teknik.get(t) || 0) + 1);
  teknikListe.replaceChildren(...[...durum.teknik].sort((a, b) => b[1] - a[1]).map(([t, n]) => {
    const li = document.createElement('li');
    li.textContent = t;
    li.dataset.n = n;
    return li;
  }));
}

async function sahneKur(k, bolum, kayit) {
  const modul = await import('./' + k.dosya + '?v=' + k.sha.slice(0, 12));
  const s = modul.default;
  if (!s || s.slot !== k.slot || typeof s.kur !== 'function') throw Error('sözleşme tutmuyor');
  const tuval = bolum.querySelector('.tuval');
  const yonetim = await s.kur(tuval, { azHareket: AZ_HAREKET, kayit }) || {};
  let gorunur = false;
  let kesisiyor = false;
  function gorunurlukGuncelle() {
    const yeni = kesisiyor && !document.hidden;
    if (yeni !== gorunur) { gorunur = yeni; (yeni ? yonetim.basla : yonetim.dur)?.(); }
  }
  const io = new IntersectionObserver(([g]) => {
    kesisiyor = g.isIntersecting;
    gorunurlukGuncelle();
  }, { rootMargin: '120px' });
  io.observe(bolum);
  document.addEventListener('visibilitychange', gorunurlukGuncelle);
  teknikEkle(s.teknik || []);
}

async function ac() {
  let kayit;
  try {
    kayit = await (await fetch('sahneler.json', { cache: 'no-store' })).json();
  } catch {
    kutu.innerHTML = '<p class="uyari">Sahne kaydı okunamadı. Sayfa bir sunucudan açılmalı (dosya:// değil).</p>';
    return;
  }
  const dolu = kayit.sahneler.length;
  sayac.textContent = `${dolu.toLocaleString('tr-TR')} / ${kayit.toplam_slot.toLocaleString('tr-TR')}`;
  document.getElementById('siradaki').textContent = kayit.siradaki_bos ?? '—';
  for (const k of kayit.sahneler.sort((a, b) => a.slot - b.slot)) {
    const bolum = kart(k);
    try {
      await sahneKur(k, bolum, kayit);
      durum.yuklu++;
    } catch (e) {
      durum.hata++;
      bolum.classList.add('bozuk');
      bolum.querySelector('.tuval').textContent = 'Bu sahne açılamadı; öteki sahneler etkilenmedi.';
      console.warn('sahne', k.slot, e.message);
    }
  }
  document.documentElement.dataset.yuklu = durum.yuklu;
  document.documentElement.dataset.hata = durum.hata;
}

ac();
