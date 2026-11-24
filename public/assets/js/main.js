// Hasbey Karo Mermer — küçük etkileşimler (bağımlılık yok)
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // Kaydırınca header zemini
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobil menü
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
  window.addEventListener('resize', () => { if (window.innerWidth > 1020) setMenu(false); });

  // Hizmetler açılır menüsü (dokunmatik + klavye)
  const drop = document.querySelector('.nav__drop');
  const dropBtn = drop?.querySelector('.nav__btn');
  dropBtn?.addEventListener('click', () => {
    const open = !drop.classList.contains('is-open');
    drop.classList.toggle('is-open', open);
    dropBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (drop && !drop.contains(e.target)) { drop.classList.remove('is-open'); dropBtn?.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drop?.classList.contains('is-open')) { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); dropBtn.focus(); }
    if (burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  // Kaydırınca beliren öğeler
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Galeri büyütme
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
})();
