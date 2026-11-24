// Hasbey Karo Mermer — küçük etkileşimler (bağımlılık yok)
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // Kaydırınca header gölgesi
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 40);
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
  window.addEventListener('resize', () => { if (window.innerWidth > 1100) setMenu(false); });

  // Hizmetler menüsü (tıklama + klavye; fareyle üzerine gelince CSS açar)
  const drop = document.querySelector('.nav__drop');
  const dropBtn = drop?.querySelector('.nav__btn');
  const setDrop = (open) => { drop?.classList.toggle('is-open', open); dropBtn?.setAttribute('aria-expanded', String(open)); };
  dropBtn?.addEventListener('click', () => setDrop(!drop.classList.contains('is-open')));
  document.addEventListener('click', (e) => { if (drop && !drop.contains(e.target)) setDrop(false); });
  drop?.addEventListener('focusout', (e) => { if (!drop.contains(e.relatedTarget)) setDrop(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drop?.classList.contains('is-open')) { setDrop(false); dropBtn.focus(); }
    if (burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  // Hizmet dizini: satırın üzerine gelince sağdaki görsel değişir
  document.querySelectorAll('.svc').forEach((svc) => {
    const rows = svc.querySelectorAll('.svc__row');
    const figs = svc.querySelectorAll('.svc__fig');
    const show = (i) => {
      figs.forEach((f) => f.classList.toggle('is-active', f.dataset.i === i));
      rows.forEach((r) => r.classList.toggle('is-active', r.dataset.i === i));
    };
    rows.forEach((r) => {
      r.addEventListener('mouseenter', () => show(r.dataset.i));
      r.addEventListener('focus', () => show(r.dataset.i));
    });
    svc.querySelector('.svc__list')?.addEventListener('mouseleave', () => rows.forEach((r) => r.classList.remove('is-active')));
  });

  // Kaydırınca beliren öğeler
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Teklif formu → WhatsApp'ta hazır mesaj (veri sitede tutulmaz, hiçbir yere gönderilmez)
  const form = document.querySelector('form[data-wa]');
  form?.addEventListener('submit', (e) => {
    const val = (id) => (document.getElementById(id)?.value || '').trim();
    const msg = val('q-mesaj');
    if (!msg) return; // tarayıcının "zorunlu alan" uyarısı devreye girer
    e.preventDefault();
    const ad = val('q-ad');
    const text = [
      `Merhaba${ad ? `, ben ${ad}` : ''}.`,
      `${val('q-hizmet')} için ${val('q-ilce')} bölgesinde teklif almak istiyorum.`,
      '',
      msg,
    ].join('\n');
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

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
