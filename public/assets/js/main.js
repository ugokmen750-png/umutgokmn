// Hasbey Karo Mermer — etkileşimler (bağımlılık yok)
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Header: kaydırınca beyaz zemin + yukarı çık düğmesi ilerlemesi ----------
  const header = document.querySelector('[data-header]');
  const totop = document.querySelector('.totop');
  const CIRC = 113.1;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 60);
    if (totop) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      totop.classList.toggle('is-visible', y > 500);
      totop.style.setProperty('--p', String(CIRC - CIRC * (max > 0 ? Math.min(1, y / max) : 0)));
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  totop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  // ---------- Mobil menü ----------
  const burger = document.querySelector('.burger');
  const mnav = document.getElementById('mobil-menu');
  const setMenu = (open) => {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    mnav.hidden = !open;
    header.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mnav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) setMenu(false); });

  // ---------- Açılır menüler (tıklama + klavye; fareyle CSS açar) ----------
  const drops = [...document.querySelectorAll('.nav__drop')];
  const closeDrops = (except) => drops.forEach((d) => { if (d !== except) { d.classList.remove('is-open'); d.querySelector('.nav__btn')?.setAttribute('aria-expanded', 'false'); } });
  drops.forEach((d) => {
    const b = d.querySelector('.nav__btn');
    b?.addEventListener('click', () => { const open = !d.classList.contains('is-open'); closeDrops(d); d.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open)); });
    d.addEventListener('focusout', (e) => { if (!d.contains(e.relatedTarget)) { d.classList.remove('is-open'); b?.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav__drop')) closeDrops(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeDrops();
    if (burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  // ---------- Giriş slaytı ----------
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const slides = [...slider.querySelectorAll('.slide')];
    const dots = [...slider.querySelectorAll('[data-go]')];
    let i = 0; let timer = null;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
      // sıradaki slaytın görselini önceden yükle
      const next = slides[(i + 1) % slides.length]?.querySelector('img');
      if (next && next.loading === 'lazy') next.loading = 'eager';
    };
    const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => show(i + 1), 7000); };
    const stop = () => clearInterval(timer);
    slider.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { show(i + Number(b.dataset.step)); play(); }));
    dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.go)); play(); }));
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    slider.addEventListener('focusin', stop);
    // dokunmatik kaydırma
    let sx = null;
    slider.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { show(i + (dx < 0 ? 1 : -1)); play(); } sx = null; });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
    play();

    // arka plan video: hareket azaltma / veri tasarrufu açıksa hiç indirilmez; sayfa yüklendikten sonra başlar,
    // ekrandan çıkınca durur. Oynatılamazsa (ör. iOS düşük güç modu) fotoğraflı slayt olduğu gibi kalır.
    const vid = slider.querySelector('.slider__video');
    const saveData = navigator.connection && navigator.connection.saveData;
    if (vid && !reduce && !saveData && vid.canPlayType('video/mp4')) {
      let visible = true;
      const resume = () => { if (visible && !document.hidden) { const p = vid.play(); if (p) p.catch(() => {}); } };
      const start = () => {
        const tall = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
        vid.src = tall ? vid.dataset.mp4Tall : vid.dataset.mp4;
        vid.addEventListener('playing', () => slider.classList.add('has-video'), { once: true });
        resume();
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? resume() : vid.pause(); }).observe(slider);
        }
        document.addEventListener('visibilitychange', () => (document.hidden ? vid.pause() : resume()));
      };
      if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    }
  }

  // ---------- Taş şeridi: oklar + fareyle sürükleme ----------
  document.querySelectorAll('[data-carousel]').forEach((car) => {
    const band = car.closest('section');
    const step = () => (car.querySelector('.stone')?.getBoundingClientRect().width || 300) + 24;
    band?.querySelectorAll('.cbtn').forEach((b) => b.addEventListener('click', () => car.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' })));
    let down = false; let startX = 0; let startL = 0; let moved = false;
    car.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startL = car.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) { moved = true; car.classList.add('is-drag'); } car.scrollLeft = startL - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; car.classList.remove('is-drag'); });
    car.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  // ---------- Paralaks ----------
  const para = reduce ? [] : [...document.querySelectorAll('[data-parallax]')];
  if (para.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      para.forEach((el) => {
        const box = (el.closest('[data-parallax-wrap]') || el.parentElement).getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) return;
        const center = box.top + box.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(center * Number(el.dataset.parallax)).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---------- Kaydırınca belirme ----------
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // ---------- Teklif formu → WhatsApp'ta hazır mesaj (veri sitede tutulmaz) ----------
  const form = document.querySelector('form[data-wa]');
  form?.addEventListener('submit', (e) => {
    const val = (id) => (document.getElementById(id)?.value || '').trim();
    const msg = val('q-mesaj');
    if (!msg) return;
    e.preventDefault();
    const ad = val('q-ad');
    const text = [`Merhaba${ad ? `, ben ${ad}` : ''}.`, `${val('q-hizmet')} için ${val('q-ilce')} bölgesinde teklif almak istiyorum.`, '', msg].join('\n');
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  // ---------- Galeri büyütme ----------
  const box = document.querySelector('.lightbox');
  if (box && typeof box.showModal === 'function') {
    const bImg = box.querySelector('img');
    const bCap = box.querySelector('figcaption');
    let last = null;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery__btn');
      if (!btn) return;
      last = btn;
      const thumb = btn.querySelector('img');
      bImg.src = btn.dataset.full;
      bImg.alt = thumb ? thumb.alt : '';
      bCap.textContent = btn.dataset.cap || '';
      box.showModal();
    });
    box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('close', () => { bImg.removeAttribute('src'); last?.focus(); });
  }

  // ---------- Kuvars renk paneli ----------
  // Renge basınca o rengin <template id="q-…"> içeriği panele kopyalanır: örnek görseller + tamamlanmış iş.
  // Paneldeki görsellere basınca yukarıdaki büyütme (lightbox) açılır. Adres #renk olur, bağlantıyla paylaşılabilir.
  const qm = document.querySelector('.qmodal');
  if (qm && typeof qm.showModal === 'function') {
    const qBody = qm.querySelector('.qmodal__body');
    let opener = null;
    const open = (key, btn) => {
      const t = document.getElementById('q-' + key);
      if (!t) return;
      qBody.replaceChildren(t.content.cloneNode(true));
      qm.setAttribute('aria-label', t.dataset.name || 'Renk ayrıntısı');
      opener = btn || null;
      document.documentElement.classList.add('is-locked');
      if (!qm.open) qm.showModal();
      qm.scrollTop = 0;
      history.replaceState(null, '', '#' + key);
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (b) open(b.dataset.q, b);
    });
    qm.querySelector('.qmodal__close').addEventListener('click', () => qm.close());
    qm.addEventListener('click', (e) => { if (e.target === qm) qm.close(); });
    qm.addEventListener('close', () => {
      qBody.replaceChildren();
      document.documentElement.classList.remove('is-locked');
      history.replaceState(null, '', location.pathname + location.search);
      opener?.focus({ preventScroll: true });
    });
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && /^[a-z0-9-]+$/.test(h)) open(h, document.querySelector(`[data-q="${h}"]`));
  }
})();
