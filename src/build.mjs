// Statik site üretici: node src/build.mjs → public/
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, base, districts, primaryPhone, waLink } from './config.mjs';
import { services, photos, gallery, materials, process as steps, homeFaq } from './content.mjs';
import { brand, plaque, icon, swatch, marbleBg, PLAQUE_PATH } from './svg.mjs';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));
const V = '6'; // önbellek kırıcı (css/js değişince artır)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const tel = (p = primaryPhone) => `tel:${p.tel}`;
const BIZ_ID = abs('/#isletme');
const OG = '/assets/img/og-hasbey-karo-mermer.jpg';

// ---------- Ortak parçalar ----------
const img = (p, { sizes = '(max-width: 700px) 92vw, 460px', eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${p.src}-520.webp" srcset="${p.src}-520.webp 520w, ${p.src}.webp 960w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;

const tiles = '<span class="tiles" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const eyebrow = (t, light = false) => `<p class="eyebrow${light ? ' eyebrow--light' : ''}">${tiles}${t}</p>`;

const callBtn = (cls = 'btn btn--gold') => `<a class="${cls}" href="${tel()}">${icon('phone')}<span>Hemen Arayın</span></a>`;
const waBtn = (cls = 'btn btn--ghost', text) => `<a class="${cls}" href="${waLink(text)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp'tan Yazın</span></a>`;

const frame = (inner, cap) => `<figure class="frame">
  <svg class="frame__line frame__line--outer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${PLAQUE_PATH}" vector-effect="non-scaling-stroke"/></svg>
  <div class="frame__img">${inner}</div>
  <svg class="frame__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${PLAQUE_PATH}" vector-effect="non-scaling-stroke"/></svg>
  ${cap ? `<figcaption class="frame__cap">${icon('pin')}<span>${cap}</span></figcaption>` : ''}
</figure>`;

function head({ title, description, path, schema = [], preload = '' }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0f0f10">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="${site.regionCode}">
<meta name="geo.placename" content="${site.city}">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs(OG)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Hasbey Karo Mermer, Kırıkkale">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/marcellus-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${preload}${schema.map(ld).join('\n')}
</head>`;
}

function header(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const svcLinks = services.map((s) => `<li><a href="/${s.slug}/"${cur(s.slug)}>${s.nav}</a></li>`).join('');
  return `<header class="site-header" data-header>
  <div class="container site-header__inner">
    ${brand('hb')}
    <nav class="nav" aria-label="Ana menü">
      <ul class="nav__list">
        <li><a href="/"${cur('home')}>Anasayfa</a></li>
        <li class="nav__drop">
          <button class="nav__btn" type="button" aria-expanded="false" aria-controls="menu-hizmetler"${services.some((s) => s.slug === active) ? ' data-active' : ''}>Hizmetler${icon('chevron')}</button>
          <ul class="nav__sub" id="menu-hizmetler">${svcLinks}</ul>
        </li>
        <li><a href="/projeler/"${cur('projeler')}>Projeler</a></li>
        <li><a href="/#hakkimizda">Hakkımızda</a></li>
        <li><a href="/iletisim/"${cur('iletisim')}>İletişim</a></li>
      </ul>
    </nav>
    <a class="btn btn--gold btn--sm header-call" href="${tel()}">${icon('phone')}<span>${primaryPhone.display}</span></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç">${icon('menu', 'i i--open')}${icon('close', 'i i--close')}</button>
  </div>
  <div class="mnav" id="mobil-menu" hidden>
    <div class="container">
      <ul class="mnav__list">
        <li><a href="/">Anasayfa</a></li>
        ${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/#hakkimizda">Hakkımızda</a></li>
        <li><a href="/iletisim/">İletişim</a></li>
      </ul>
      <div class="mnav__contact">
        ${site.phones.map((p) => `<a href="${tel(p)}">${icon('phone')}<span><b>${p.display}</b><small>${p.name}</small></span></a>`).join('')}
      </div>
    </div>
  </div>
</header>`;
}

function footer() {
  const year = site.lastmod.slice(0, 4);
  return `<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      ${brand('fb')}
      <p>Kırıkkale'de mezar yapımı, mutfak tezgahı, karo ve bordür taşı, andezit, basamak ve inşaat mermer işleri. Ölçü, imalat ve montaj tek elden.</p>
      <a class="social" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}<span>${site.instagramHandle}</span></a>
    </div>
    <div>
      <h2 class="site-footer__title">Hizmetler</h2>
      <ul class="site-footer__links">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="site-footer__title">Kurumsal</h2>
      <ul class="site-footer__links">
        <li><a href="/#hakkimizda">Hakkımızda</a></li>
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/#sss">Sık sorulan sorular</a></li>
        <li><a href="/iletisim/">İletişim</a></li>
      </ul>
    </div>
    <div>
      <h2 class="site-footer__title">İletişim</h2>
      <ul class="site-footer__contact">
        ${site.phones.map((p) => `<li><a href="${tel(p)}">${icon('phone')}<span>${p.display}<small>${p.name}</small></span></a></li>`).join('')}
        <li><span class="loc">${icon('pin')}<span>${site.city}, Türkiye<small>Merkez ve tüm ilçeler</small></span></span></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${year} ${site.name}. Tüm hakları saklıdır.</p>
    <p>Kırıkkale mermer · mezar · karo · doğal taş</p>
  </div>
</footer>`;
}

const mobileBar = () => `<div class="actionbar" aria-label="Hızlı iletişim">
  <a href="${tel()}">${icon('phone')}<span>Ara</span></a>
  <a href="${waLink()}" target="_blank" rel="noopener" class="actionbar__wa">${icon('whatsapp')}<span>WhatsApp</span></a>
</div>`;

const lightbox = () => `<dialog class="lightbox" aria-label="Fotoğraf görüntüleyici">
  <button class="lightbox__close" type="button" aria-label="Kapat">${icon('close')}</button>
  <figure><img alt=""><figcaption></figcaption></figure>
</dialog>`;

function layout({ key, title, description, path, schema, preload, body }) {
  return `<!doctype html>
<html lang="tr" class="no-js">
${head({ title, description, path, schema, preload })}
<body class="p-${key}">
<a class="skip" href="#icerik">İçeriğe geç</a>
${header(key)}
<main id="icerik">
${body}
</main>
${footer()}
${mobileBar()}
${lightbox()}
<script src="/assets/js/main.js?v=${V}" defer></script>
</body>
</html>
`;
}

// ---------- Yapısal veri ----------
const business = () => ({
  '@type': 'HomeAndConstructionBusiness',
  '@id': BIZ_ID,
  name: site.name,
  alternateName: ['Hasbey Mermer', 'Hasbey Karo Mermer Kırıkkale'],
  description: "Kırıkkale'de mezar yapımı, mermer ve granit mutfak tezgahı, karo imalatı, bordür taşı, andezit, basamak ve inşaat mermer işleri yapan firma.",
  url: abs('/'),
  logo: abs('/assets/img/logo-512.png'),
  image: [abs(OG), abs(photos.traverten.src + '.webp'), abs(photos.gri.src + '.webp')],
  telephone: primaryPhone.tel,
  priceRange: '₺₺',
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.region, addressCountry: 'TR' },
  areaServed: [{ '@type': 'City', name: 'Kırıkkale' }, ...districts.filter((d) => d !== 'Merkez').map((d) => ({ '@type': 'AdministrativeArea', name: `${d}, Kırıkkale` }))],
  sameAs: [site.instagram],
  contactPoint: site.phones.map((p) => ({ '@type': 'ContactPoint', telephone: p.tel, contactType: 'customer service', name: p.name, areaServed: 'TR', availableLanguage: 'Turkish' })),
  knowsAbout: ['Mezar yapımı', 'Mermer', 'Granit', 'Traverten', 'Mutfak tezgahı', 'Karo imalatı', 'Bordür taşı', 'Andezit', 'Bazalt', 'Basamak', 'Peyzaj', 'Havuz yapımı'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hizmetler',
    itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.nav, url: abs(`/${s.slug}/`) } })),
  },
});
const website = () => ({ '@type': 'WebSite', '@id': abs('/#site'), url: abs('/'), name: site.name, inLanguage: 'tr-TR', publisher: { '@id': BIZ_ID } });
const faqLd = (list) => ({ '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const crumbsLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});
const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

// ---------- Bölümler ----------
const faqBlock = (list, title = 'Sık sorulan sorular', id = 'sss') => `<section class="section" id="${id}">
  <div class="container faq">
    <div class="faq__head reveal">
      ${eyebrow('SSS')}
      <h2 class="h2">${title}</h2>
      <p>Aklınıza takılan başka bir soru varsa arayın, hemen yanıtlayalım.</p>
      <a class="link-arrow" href="${tel()}">${primaryPhone.display}${icon('arrow')}</a>
    </div>
    <div class="faq__list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><span>${f.q}</span><i aria-hidden="true"></i></summary><div class="faq__a"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

const processBlock = () => `<section class="section section--dark process">
  ${marbleBg('pr')}
  <div class="container">
    <div class="section-head section-head--center reveal">
      ${eyebrow('Çalışma şeklimiz', true)}
      <h2 class="h2">Keşiften teslime dört adım</h2>
    </div>
    <ol class="steps">
      ${steps.map((s, i) => `<li class="step reveal" style="--d:${i}"><span class="step__no">0${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const ctaBlock = (title = 'Projenizi konuşalım', text = 'Fiyat bilgisi ve keşif için arayın. İşin fotoğrafını ve yaklaşık ölçüsünü WhatsApp\'tan gönderirseniz ön bilgiyi hemen verelim.') => `<section class="cta">
  ${marbleBg('ct')}
  <div class="container cta__inner">
    <div class="cta__copy reveal">
      ${eyebrow('Teklif ve keşif', true)}
      <h2 class="h2">${title}</h2>
      <p>${text}</p>
      <div class="cta__actions">${waBtn('btn btn--gold')}<a class="btn btn--ghost" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}<span>Instagram</span></a></div>
    </div>
    <ul class="phones reveal">
      ${site.phones.map((p) => `<li><a href="${tel(p)}"><span class="phones__ic">${icon('phone')}</span><span><b>${p.display}</b><small>${p.name}</small></span>${icon('arrow', 'i phones__go')}</a></li>`).join('')}
    </ul>
  </div>
</section>`;

const galleryBlock = (list, { heading = true } = {}) => `<div class="gallery gallery--n${list.length}">
  ${list.map((p, i) => `<figure class="gallery__item gallery__item--${i % 5} reveal" style="--d:${i % 4}">
    <button type="button" class="gallery__btn" data-full="${p.src}.webp" data-cap="${esc(p.cap)}" aria-label="${esc(p.cap)} fotoğrafını büyüt">
      ${img(p, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' })}
      <span class="gallery__zoom">${icon('expand')}</span>
    </button>
    <figcaption><span>${p.tag}</span>${p.cap}</figcaption>
  </figure>`).join('')}
  <a class="gallery__insta reveal" href="${site.instagram}" target="_blank" rel="noopener">
    ${swatch('koyu', 'gi', 'swatch gallery__insta-bg')}
    <span class="gallery__insta-in">${icon('instagram')}<b>${heading ? 'Tüm işlerimiz Instagram’da' : 'Daha fazlası Instagram’da'}</b><small>${site.instagramHandle}</small><span class="link-arrow">Profile git${icon('arrow')}</span></span>
  </a>
</div>`;

const areaBlock = () => `<section class="section area">
  <div class="container area__grid">
    <div class="reveal">
      ${eyebrow('Hizmet bölgemiz')}
      <h2 class="h2">Kırıkkale'nin her ilçesinde yanınızdayız</h2>
      <p class="muted">Kırıkkale Merkez başta olmak üzere ilin dokuz ilçesinde mezar, mutfak tezgahı, karo, bordür taşı, andezit ve basamak işleri yapıyoruz. Keşif için işin yerini söylemeniz yeterli.</p>
    </div>
    <ul class="chips reveal">${districts.map((d) => `<li>${icon('pin')}${d === 'Merkez' ? 'Kırıkkale Merkez' : d}</li>`).join('')}</ul>
  </div>
</section>`;

const svcCard = (s, i) => {
  const visual = s.hero ? img(photos[s.hero], { sizes: '(max-width: 700px) 92vw, 380px' }) : swatch(s.swatch, `sc${i}`);
  return `<li class="card reveal" style="--d:${i % 3}">
    <a href="/${s.slug}/">
      <div class="card__media">${visual}</div>
      <div class="card__body">
        <span class="card__no">0${i + 1}</span>
        <h3>${s.nav}</h3>
        <p>${s.card}</p>
        <span class="link-arrow">Detaylı bilgi${icon('arrow')}</span>
      </div>
    </a>
  </li>`;
};

// ---------- Sayfalar ----------
function homePage() {
  const ticker = ['Mezar Yapımı', 'Mutfak Tezgahı', 'Karo İmalatı', 'Bordür Taşı', 'Basamak', 'Andezit', 'Patinatolu Bazalt', 'Peyzaj', 'Çeşme Modelleri', 'Havuz Yapımı'];
  const tickerRow = ticker.map((t) => `<span>${t}</span><i aria-hidden="true"></i>`).join('');
  const body = `
<section class="hero">
  ${marbleBg('hr')}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div class="hero__copy">
      ${eyebrow('Kırıkkale · Mermer · Karo · Doğal Taş', true)}
      <h1 class="hero__title">Kırıkkale'de mermer, mezar ve karo işlerinde <em>usta işçilik</em></h1>
      <p class="hero__lead">Mezar yapımından mutfak tezgahına, karo ve bordür taşından andezit kaplamaya kadar taşla ilgili her işi ölçüden montaja tek ekiple yapıyoruz.</p>
      <div class="hero__actions">${callBtn()}${waBtn()}</div>
      <ul class="hero__facts">
        <li><strong>Tek elden</strong><span>Ölçü, imalat ve montaj</span></li>
        <li><strong>9 ilçe</strong><span>Kırıkkale'nin tamamı</span></li>
        <li><strong>Yerinde keşif</strong><span>Net fiyat, net süre</span></li>
      </ul>
    </div>
    <div class="hero__visual">
      ${frame(img(photos.traverten, { eager: true, sizes: '(max-width: 900px) 80vw, 480px' }), 'Traverten aile mezarı · Kırıkkale')}
      <ul class="hero__swatches" aria-label="Çalıştığımız taşlardan örnekler">
        ${['beyaz', 'traverten', 'gri', 'granit'].map((k, i) => `<li style="--d:${i}">${swatch(k, 'hs' + i, 'swatch', true)}<span>${materials.find((m) => m.key === k).name}</span></li>`).join('')}
      </ul>
    </div>
  </div>
</section>

<div class="ticker" aria-hidden="true"><div class="ticker__track">${tickerRow}${tickerRow}</div></div>

<section class="section about" id="hakkimizda">
  <div class="container about__grid">
    <div class="about__media reveal">
      <figure class="about__img about__img--a">${img(photos.gri, { sizes: '(max-width: 900px) 60vw, 360px' })}</figure>
      <figure class="about__img about__img--b">${img(photos.beyaz, { sizes: '(max-width: 900px) 46vw, 280px' })}</figure>
      <div class="about__badge">${plaque('ab')}<span>Hasbey<br>Karo Mermer</span></div>
    </div>
    <div class="about__copy reveal">
      ${eyebrow('Hakkımızda')}
      <h2 class="h2">Taşı tanıyan, işini yerinde yapan bir ekip</h2>
      <p class="lead-dark">Hasbey Karo Mermer, Kırıkkale'de mermer, granit, traverten, karo ve doğal taş işleri yapan yerel bir firmadır.</p>
      <p class="muted">Mezarlıktaki bir aile mezarından evinizdeki mutfak tezgahına, bahçenizdeki bordür taşından binanızın basamaklarına kadar her işi aynı özenle ele alıyoruz. İşe yerinde keşifle başlıyor, ölçüyü kendimiz alıyor, malzemeyi sizinle birlikte seçiyor ve montajı kendi ekibimizle yapıyoruz. Böylece işin her aşamasında muhatabınız belli olur.</p>
      <ul class="checks">
        <li>${icon('ruler')}<span><b>Yerinde ölçü</b>Taş, yerine milimetrik oturur.</span></li>
        <li>${icon('layers')}<span><b>Birlikte seçim</b>Numune ve örnek işlerle karar verilir.</span></li>
        <li>${icon('tool')}<span><b>Kendi ekibimizle montaj</b>İş başkasına devredilmez.</span></li>
      </ul>
      <div class="team">
        ${site.phones.map((p) => `<a href="${tel(p)}"><b>${p.name}</b><span>${p.display}</span></a>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section section--paper" id="hizmetler">
  <div class="container">
    <div class="section-head reveal">
      <div>
        ${eyebrow('Hizmetlerimiz')}
        <h2 class="h2">Taşla ilgili ne gerekiyorsa</h2>
      </div>
      <p class="muted">Mezardan mutfağa, bahçeden merdivene kadar Kırıkkale'de yaptığımız işler. Her başlığın altında malzeme seçenekleri, süreç ve sık sorulan soruları bulabilirsiniz.</p>
    </div>
    <ul class="cards">
      ${services.map(svcCard).join('')}
      <li class="card card--cta reveal" style="--d:2">
        <div class="card__cta">
          ${swatch('koyu', 'cc', 'swatch card__cta-bg')}
          <div class="card__cta-in">
            <h3>Aradığınız iş listede yok mu?</h3>
            <p>Çeşme, havuz, şömine çevresi ya da özel ölçü bir iş… Arayın, yapılabilirliğini birlikte konuşalım.</p>
            ${callBtn('btn btn--gold btn--sm')}
          </div>
        </div>
      </li>
    </ul>
  </div>
</section>

<section class="section section--dark materials">
  ${marbleBg('mt')}
  <div class="container">
    <div class="section-head reveal">
      <div>
        ${eyebrow('Malzeme seçenekleri', true)}
        <h2 class="h2">Her iş için doğru taş</h2>
      </div>
      <p>Taşın seçimi, işin hem görünüşünü hem ömrünü belirler. En çok çalıştığımız taşlar ve nerede kullanıldıkları:</p>
    </div>
    <ul class="mats">
      ${materials.map((m, i) => `<li class="mat reveal" style="--d:${i % 3}">${swatch(m.key, 'm' + i)}<div class="mat__body"><h3>${m.name}</h3><p>${m.text}</p></div></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section" id="projeler">
  <div class="container">
    <div class="section-head reveal">
      <div>
        ${eyebrow('Projelerimiz')}
        <h2 class="h2">Son işlerimizden</h2>
      </div>
      <p class="muted">Kırıkkale'de tamamladığımız mezar ve mutfak işlerinden birkaçı. Güncel çalışmalarımızı Instagram'da paylaşıyoruz.</p>
    </div>
    ${galleryBlock(gallery)}
  </div>
</section>

${processBlock()}
${areaBlock()}
${faqBlock(homeFaq)}
${ctaBlock()}`;

  return layout({
    key: 'home',
    path: '/',
    title: 'Kırıkkale Mermer, Mezar ve Karo İşleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mezar yapımı, mutfak tezgahı, karo imalatı, bordür taşı, andezit ve basamak işleri. Hasbey Karo Mermer'de ölçü, imalat ve montaj tek elden.",
    preload: `<link rel="preload" as="image" href="${photos.traverten.src}-520.webp" imagesrcset="${photos.traverten.src}-520.webp 520w, ${photos.traverten.src}.webp 960w" imagesizes="(max-width: 900px) 80vw, 480px">\n`,
    schema: [graph(business(), website(), faqLd(homeFaq))],
    body,
  });
}

function servicePage(s, idx) {
  const path = `/${s.slug}/`;
  const visual = s.hero
    ? frame(img(photos[s.hero], { eager: true, sizes: '(max-width: 900px) 80vw, 440px' }), `${photos[s.hero].cap} · Kırıkkale`)
    : frame(swatch(s.swatch, 'ph', 'swatch', true), s.kicker.split(' · ')[0] + ' · Kırıkkale');
  const others = services.filter((o) => o.slug !== s.slug);
  const gal = s.gallery.map((k) => photos[k]);

  const notes = s.notes ? `<section class="section">
    <div class="container">
      <div class="section-head reveal"><div>${eyebrow('Bilgi')}<h2 class="h2">${s.notesTitle}</h2></div></div>
      <ul class="notes">${s.notes.map((n, i) => `<li class="note reveal" style="--d:${i}"><span class="note__no">0${i + 1}</span><h3>${n.t}</h3><p>${n.d}</p></li>`).join('')}</ul>
    </div>
  </section>` : '';

  const table = s.table ? `<section class="section">
    <div class="container">
      <div class="section-head reveal"><div>${eyebrow('Karşılaştırma')}<h2 class="h2">${s.table.title}</h2></div><p class="muted">Kısa bir özet. Kesin seçimi keşifte, kullanım alanınızı görerek birlikte yapıyoruz.</p></div>
      <div class="table-wrap reveal"><table class="table">
        <thead><tr>${s.table.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>` : '';

  const galleryHtml = gal.length ? `<section class="section section--paper">
    <div class="container">
      <div class="section-head reveal"><div>${eyebrow('Projeler')}<h2 class="h2">Yaptığımız işlerden</h2></div></div>
      ${galleryBlock(gal, { heading: false })}
    </div>
  </section>` : '';

  const body = `
<section class="page-hero">
  ${marbleBg('ph' + idx)}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container page-hero__grid">
    <div class="page-hero__copy">
      <nav class="crumbs" aria-label="Sayfa yolu"><a href="/">Anasayfa</a><span aria-hidden="true">/</span><a href="/#hizmetler">Hizmetler</a><span aria-hidden="true">/</span><span aria-current="page">${s.nav}</span></nav>
      ${eyebrow(s.kicker, true)}
      <h1 class="page-hero__title">${s.h1}</h1>
      <p class="hero__lead">${s.lead}</p>
      <div class="hero__actions">${callBtn()}${waBtn('btn btn--ghost', `Merhaba, ${s.nav.toLocaleLowerCase('tr')} için bilgi almak istiyorum.`)}</div>
    </div>
    <div class="page-hero__visual">${visual}</div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="prose reveal">
      ${eyebrow('Hizmet hakkında')}
      <h2 class="h2">${s.introTitle}</h2>
      ${s.intro.map((p) => `<p>${p}</p>`).join('')}
    </div>
    <aside class="quick reveal" aria-label="Hızlı iletişim">
      <h2 class="quick__title">Fiyat ve keşif</h2>
      <p>İşin fotoğrafını ve yaklaşık ölçüsünü gönderin, ön bilgiyi hemen verelim.</p>
      <a class="quick__phone" href="${tel()}">${icon('phone')}<span><b>${primaryPhone.display}</b><small>${primaryPhone.name}</small></span></a>
      ${waBtn('btn btn--dark btn--block', `Merhaba, ${s.nav.toLocaleLowerCase('tr')} için bilgi almak istiyorum.`)}
      <ul class="quick__list">
        <li>${icon('check')}Kırıkkale merkez ve 8 ilçe</li>
        <li>${icon('check')}Yerinde ölçü ve keşif</li>
        <li>${icon('check')}Montaj kendi ekibimizle</li>
      </ul>
    </aside>
  </div>
</section>

<section class="section section--paper">
  <div class="container">
    <div class="section-head reveal"><div>${eyebrow('Neler yapıyoruz')}<h2 class="h2">${s.itemsTitle}</h2></div></div>
    <ul class="items">
      ${s.items.map((it, i) => `<li class="item reveal" style="--d:${i % 3}"><span class="item__no">0${i + 1}</span><h3>${it.t}</h3><p>${it.d}</p></li>`).join('')}
    </ul>
  </div>
</section>

${notes}${table}${galleryHtml}
${processBlock()}
${faqBlock(s.faq, `${s.nav} hakkında sorular`)}

<section class="section section--paper">
  <div class="container">
    <div class="section-head reveal"><div>${eyebrow('Diğer hizmetler')}<h2 class="h2">Bunlar da ilginizi çekebilir</h2></div></div>
    <ul class="cards cards--4">${others.map((o) => svcCard(o, services.indexOf(o))).join('')}</ul>
  </div>
</section>

${ctaBlock(`${s.nav} için teklif alın`)}`;

  return layout({
    key: s.slug,
    path,
    title: s.title,
    description: s.description,
    schema: [graph(
      {
        '@type': 'Service',
        '@id': abs(path + '#hizmet'),
        name: s.h1,
        serviceType: s.nav,
        description: s.description,
        url: abs(path),
        provider: { '@type': 'HomeAndConstructionBusiness', '@id': BIZ_ID, name: site.name, telephone: primaryPhone.tel, url: abs('/') },
        areaServed: { '@type': 'City', name: 'Kırıkkale' },
        hasOfferCatalog: { '@type': 'OfferCatalog', name: s.itemsTitle, itemListElement: s.items.map((it) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: it.t, description: it.d } })) },
      },
      crumbsLd([['Anasayfa', '/'], ['Hizmetler', '/#hizmetler'], [s.nav, path]]),
      faqLd(s.faq),
    )],
    body,
  });
}

function projectsPage() {
  const body = `
<section class="page-hero page-hero--short">
  ${marbleBg('pp')}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container">
    <nav class="crumbs" aria-label="Sayfa yolu"><a href="/">Anasayfa</a><span aria-hidden="true">/</span><span aria-current="page">Projeler</span></nav>
    ${eyebrow('Kırıkkale · Tamamlanan işler', true)}
    <h1 class="page-hero__title">Kırıkkale mermer ve mezar projelerimiz</h1>
    <p class="hero__lead">Kırıkkale'de yaptığımız mezar, mutfak ve taş işlerinden örnekler. Fotoğrafa dokunarak büyütebilirsiniz.</p>
  </div>
</section>
<section class="section">
  <div class="container">${galleryBlock(gallery)}</div>
</section>
${ctaBlock('Sizin işiniz de burada olsun')}`;
  return layout({
    key: 'projeler',
    path: '/projeler/',
    title: 'Kırıkkale Mezar ve Mermer Projeleri | Hasbey Karo Mermer',
    description: "Hasbey Karo Mermer'in Kırıkkale'de tamamladığı traverten aile mezarı, mermer ve granit mezar, mutfak dolabı ve taş işlerinden fotoğraflar.",
    schema: [graph(
      { '@type': 'CollectionPage', name: 'Projelerimiz', url: abs('/projeler/'), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Projeler', '/projeler/']]),
    )],
    body,
  });
}

function contactPage() {
  const body = `
<section class="page-hero page-hero--short">
  ${marbleBg('ip')}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container">
    <nav class="crumbs" aria-label="Sayfa yolu"><a href="/">Anasayfa</a><span aria-hidden="true">/</span><span aria-current="page">İletişim</span></nav>
    ${eyebrow('Kırıkkale · Hasbey Karo Mermer', true)}
    <h1 class="page-hero__title">İletişim</h1>
    <p class="hero__lead">Fiyat bilgisi, keşif randevusu ya da aklınıza takılan bir soru için doğrudan bizi arayın veya WhatsApp'tan yazın.</p>
  </div>
</section>
<section class="section">
  <div class="container contact">
    <div class="contact__cards">
      ${site.phones.map((p, i) => `<a class="ccard reveal" style="--d:${i}" href="${tel(p)}"><span class="ccard__ic">${icon('phone')}</span><span class="ccard__label">Telefon</span><b>${p.display}</b><small>${p.name}</small></a>`).join('')}
      <a class="ccard ccard--wa reveal" href="${waLink()}" target="_blank" rel="noopener"><span class="ccard__ic">${icon('whatsapp')}</span><span class="ccard__label">WhatsApp</span><b>Mesaj gönderin</b><small>Fotoğraf ve ölçü paylaşabilirsiniz</small></a>
      <a class="ccard reveal" href="${site.instagram}" target="_blank" rel="noopener"><span class="ccard__ic">${icon('instagram')}</span><span class="ccard__label">Instagram</span><b>${site.instagramHandle}</b><small>Güncel işlerimiz</small></a>
      <div class="ccard ccard--static reveal"><span class="ccard__ic">${icon('pin')}</span><span class="ccard__label">Hizmet bölgesi</span><b>Kırıkkale</b><small>Merkez ve tüm ilçeler</small></div>
    </div>
    <div class="contact__note reveal">
      <h2 class="h3">Keşif nasıl yapılır?</h2>
      <ol class="mini-steps">${steps.map((s) => `<li><b>${s.t}</b><span>${s.d}</span></li>`).join('')}</ol>
    </div>
  </div>
</section>
${areaBlock()}`;
  return layout({
    key: 'iletisim',
    path: '/iletisim/',
    title: 'İletişim – Hasbey Karo Mermer Kırıkkale | Telefon ve WhatsApp',
    description: 'Hasbey Karo Mermer Kırıkkale iletişim: 0546 801 95 65 (Uğur Timur), 0543 670 00 17 (Hacı İsa Timur), 0537 312 18 72 (Umut Timur). WhatsApp ile fiyat bilgisi.',
    schema: [graph(
      business(),
      { '@type': 'ContactPage', name: 'İletişim', url: abs('/iletisim/'), about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['İletişim', '/iletisim/']]),
    )],
    body,
  });
}

function notFoundPage() {
  const body = `
<section class="page-hero page-hero--404">
  ${marbleBg('nf')}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container">
    ${eyebrow('404', true)}
    <h1 class="page-hero__title">Aradığınız sayfa bulunamadı</h1>
    <p class="hero__lead">Sayfa taşınmış ya da hiç var olmamış olabilir. Ana sayfaya dönebilir ya da bizi doğrudan arayabilirsiniz.</p>
    <div class="hero__actions"><a class="btn btn--gold" href="/">${icon('arrow')}<span>Ana sayfaya dön</span></a>${callBtn('btn btn--ghost')}</div>
  </div>
</section>`;
  return layout({ key: '404', path: '/404.html', title: 'Sayfa bulunamadı | Hasbey Karo Mermer', description: 'Aradığınız sayfa bulunamadı.', schema: [], body })
    .replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
}

// ---------- Yardımcı dosyalar ----------
const sitemap = () => {
  const urls = [['/', '1.0'], ...services.map((s) => [`/${s.slug}/`, '0.9']), ['/projeler/', '0.7'], ['/iletisim/', '0.7']];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url><loc>${abs(p)}</loc><lastmod>${site.lastmod}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
};

const robots = () => `User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`;

const manifest = () => JSON.stringify({
  name: site.name, short_name: site.short, lang: 'tr', start_url: `${base}/`, display: 'standalone',
  background_color: '#0f0f10', theme_color: '#0f0f10',
  icons: [{ src: `${base}/assets/img/logo-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${base}/assets/img/logo-512.png`, sizes: '512x512', type: 'image/png' }],
}, null, 2);

const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d29c"/><stop offset=".5" stop-color="#b8914d"/><stop offset="1" stop-color="#e0c283"/></linearGradient></defs>
<rect width="100" height="100" rx="22" fill="#111112"/>
<g transform="translate(14 12) scale(.72)">
<path fill="url(#g)" d="M20 14h20v4h-5v64h5v4H20v-4h5V18h-5z"/><path fill="#f2efe9" d="M60 14h20v4h-5v64h5v4H60v-4h5V18h-5z"/><path fill="url(#g)" d="M5 61C29 47 61 40 97 44C66 45 36 52 8 65Z"/>
</g></svg>
`;

// Apache/cPanel barındırma için: HTTPS, www, güvenlik başlıkları, önbellek, 404
const htaccess = () => `# Hasbey Karo Mermer — Apache ayarları
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off [OR]
  RewriteCond %{HTTP_HOST} !^www\\. [NC]
  RewriteRule ^ https://www.${site.url.replace(/^https?:\/\/(www\.)?/, '')}%{REQUEST_URI} [L,R=301]
</IfModule>

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
  <FilesMatch "\\.(webp|png|jpg|svg|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(css|js)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript image/svg+xml application/xml application/manifest+json
</IfModule>

AddType image/webp .webp
AddType application/manifest+json .webmanifest
`;

// Netlify / Cloudflare Pages için aynı başlıklar
const headersFile = () => `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

// ---------- Yaz ----------
// Alt klasörde yayında kök-göreli linklere (/assets/…, /projeler/) ön ek ekler; tam URL'lere (abs) dokunmaz.
const rebase = (html) => !base ? html : html
  .replace(/\b(href|src|data-full)="\/(?!\/)/g, `$1="${base}/`)
  .replace(/\b(srcset|imagesrcset)="([^"]*)"/g, (_, a, v) => `${a}="${v.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`)}"`);

async function put(rel, content) {
  const file = OUT + rel;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, rel.endsWith('.html') ? rebase(content) : content, 'utf8');
}

// Yazı tipleri (OFL) node_modules'tan siteye kopyalanır
const FONTS = [
  ['@fontsource/marcellus/files/marcellus-latin-400-normal.woff2'], ['@fontsource/marcellus/files/marcellus-latin-ext-400-normal.woff2'],
  ['@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'], ['@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2'],
];
await mkdir(OUT + 'assets/fonts', { recursive: true });
for (const [f] of FONTS) await copyFile(fileURLToPath(new URL('../node_modules/' + f, import.meta.url)), OUT + 'assets/fonts/' + f.split('/').pop());

await put('index.html', homePage());
for (const [i, s] of services.entries()) await put(`${s.slug}/index.html`, servicePage(s, i));
await put('projeler/index.html', projectsPage());
await put('iletisim/index.html', contactPage());
await put('404.html', notFoundPage());
await put('sitemap.xml', sitemap());
await put('robots.txt', robots());
await put('site.webmanifest', manifest());
await put('favicon.svg', favicon());
// Sunucu ayar dosyaları yalnız kendi alan adında (kökte) anlamlı; GitHub Pages bunları okumaz.
if (!base) {
  await put('.htaccess', htaccess());
  await put('_headers', headersFile());
} else {
  await rm(OUT + '.htaccess', { force: true });
  await rm(OUT + '_headers', { force: true });
}
console.log(`Derlendi → ${OUT} (${services.length + 4} sayfa)${base ? `, alt klasör: ${base}` : ''}`);
