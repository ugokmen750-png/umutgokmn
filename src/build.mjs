// Statik site üretici: node src/build.mjs → public/
// Tema v5 (2026-11-25): referans savasgranit.com tarzı — tam ekran slayt, Gilda Display + Barlow Condensed,
// beyaz / krem / koyu antrasit; doğal taş koleksiyonu ve taş sayfaları. Stok görseller Pexels lisanslı (kaynak/pexels).
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, base, districts, primaryPhone, waLink } from './config.mjs';
import { services, photos, gallery, process as steps, homeFaq, corporate, collection, slides } from './content.mjs';
import { brand, icon, swatch } from './svg.mjs';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));
const V = '16'; // önbellek kırıcı (css/js değişince artır)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const tel = (p = primaryPhone) => `tel:${p.tel}`;
const BIZ_ID = abs('/#isletme');
const OG = '/assets/img/og-hasbey-karo-mermer.jpg';
const lower = (s) => s.toLocaleLowerCase('tr');
const upper = (s) => s.toLocaleUpperCase('tr');
const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:]$/, '') + '.');

// ---------- Görseller ----------
const PX_900 = new Set(['andezit-levha', 'andezit-uygulama', 'gri-levha', 'gri-uygulama', 'beyaz-levha', 'traverten-uygulama']);
const pxImg = (name, { alt = '', sizes = '(max-width: 700px) 92vw, 600px', eager = false, hero = false, cls = '' } = {}) => {
  const P = `/assets/img/px/${name}`;
  const [s, sw, lw] = hero ? [`${P}-960`, 960, 1920] : [`${P}-640`, 640, PX_900.has(name) ? 900 : 1200];
  return `<img${cls ? ` class="${cls}"` : ''} src="${s}.webp" srcset="${s}.webp ${sw}w, ${P}.webp ${lw}w" sizes="${sizes}" width="1200" height="800" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
};
const img = (p, { sizes = '(max-width: 700px) 92vw, 460px', eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${p.src}-520.webp" srcset="${p.src}-520.webp 520w, ${p.src}.webp 960w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;

// Hizmet görselleri: mezarda Hasbey'in kendi işi, diğerlerinde örnek uygulama
const SVC_VIS = {
  'kirikkale-mezar-yapimi': { photo: 'traverten' },
  'kirikkale-mutfak-tezgahi': { px: 'mutfak-tezgah', alt: 'Örnek uygulama: mermer mutfak tezgahı ve tezgah arası' },
  'kirikkale-karo-bordur-tasi': { px: 'peyzaj-yol', alt: 'Örnek uygulama: bordürlü bahçe yolu kaplaması' },
  'kirikkale-andezit-bazalt-tas-kaplama': { px: 'bazalt-uygulama', alt: 'Örnek uygulama: doğal taş bahçe merdiveni ve zemin' },
  'kirikkale-basamak-merdiven-mermer': { px: 'basamak-spiral', alt: 'Örnek uygulama: mermer döner merdiven' },
};
const svcImg = (s, opts = {}) => {
  const v = SVC_VIS[s.slug];
  return v.photo ? img(photos[v.photo], opts) : pxImg(v.px, { alt: v.alt, ...opts });
};
const svcBg = (s) => { const v = SVC_VIS[s.slug]; return v.photo ? { photo: photos[v.photo] } : { px: v.px }; };

const slabImg = (m, opts = {}) => (m.slab.px ? pxImg(m.slab.px, { alt: `${m.name} yüzey örneği`, ...opts }) : swatch(m.slab.tex, 's', 'swatch'));
const appImg = (m, opts = {}) => pxImg(m.app.px, { alt: `Örnek uygulama: ${lower(m.name)}`, ...opts });

// ---------- Küçük parçalar ----------
const kicker = (t) => `<p class="kicker">${t}</p>`;
const btn = (cls, href, text, { ic = '', ext = false } = {}) =>
  `<a class="btn ${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${ic ? icon(ic) : ''}<span>${text}</span></a>`;
const waBtn = (cls = 'btn--dark', text = "WhatsApp'tan yazın", msg) => btn(cls, waLink(msg), text, { ic: 'whatsapp', ext: true });
const callBtn = (cls = 'btn--line') => btn(cls, tel(), primaryPhone.display, { ic: 'phone' });

const title = ({ k = '', h, p = '', center = false, light = false }) => `<header class="ttl${center ? ' ttl--center' : ''}${light ? ' ttl--light' : ''} reveal">
  ${k ? kicker(k) : ''}
  <h2>${h}</h2>
  ${p ? `<p>${p}</p>` : ''}
</header>`;

const crumbs = (items) => `<nav class="crumbs" aria-label="Sayfa yolu">${items.map(([name, href], i) =>
  (i === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${href}">${name}</a><span aria-hidden="true">/</span>`)).join('')}</nav>`;

// ---------- Baş ----------
function head({ title: t, description, path, schema = [], preload = '' }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="${site.regionCode}">
<meta name="geo.placename" content="${site.city}">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(t)}">
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
<link rel="preload" href="/assets/fonts/gilda-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/barlow-condensed-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${preload}${schema.map(ld).join('\n')}
</head>`;
}

// ---------- Üst bölüm ----------
function header(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const inSvc = services.some((s) => s.slug === active);
  const inCol = active === 'koleksiyon' || collection.some((m) => m.slug === active);
  return `<header class="hdr" data-header>
  <div class="wrap hdr__in">
    ${brand('hb')}
    <nav class="nav" aria-label="Ana menü">
      <ul class="nav__list">
        <li><a href="/"${cur('home')}>Anasayfa</a></li>
        <li><a href="/kurumsal/"${cur('kurumsal')}>Kurumsal</a></li>
        <li class="nav__drop">
          <button class="nav__btn" type="button" aria-expanded="false" aria-controls="dd-koleksiyon"${inCol ? ' data-active' : ''}>Koleksiyon${icon('chevron')}</button>
          <ul class="dropdown" id="dd-koleksiyon">
            ${collection.map((m) => `<li><a href="/koleksiyon/${m.slug}/"${cur(m.slug)}>${m.name}</a></li>`).join('')}
            <li class="dropdown__all"><a href="/koleksiyon/">Tüm koleksiyon</a></li>
          </ul>
        </li>
        <li class="nav__drop">
          <button class="nav__btn" type="button" aria-expanded="false" aria-controls="dd-hizmetler"${inSvc ? ' data-active' : ''}>Hizmetler${icon('chevron')}</button>
          <ul class="dropdown" id="dd-hizmetler">
            ${services.map((s) => `<li><a href="/${s.slug}/"${cur(s.slug)}>${s.nav}</a></li>`).join('')}
          </ul>
        </li>
        <li><a href="/projeler/"${cur('projeler')}>Projeler</a></li>
        <li><a href="/iletisim/"${cur('iletisim')}>İletişim</a></li>
      </ul>
    </nav>
    <a class="hdr__phone" href="${tel()}">${icon('phone')}<span>${primaryPhone.display}</span></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç"><span></span><span></span><span></span></button>
  </div>
  <div class="mnav" id="mobil-menu" hidden>
    <div class="wrap mnav__in">
      <ul class="mnav__main">
        <li><a href="/">Anasayfa</a></li>
        <li><a href="/kurumsal/">Kurumsal</a></li>
        <li><a href="/koleksiyon/">Koleksiyon</a></li>
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/iletisim/">İletişim</a></li>
      </ul>
      <p class="mnav__label">Hizmetler</p>
      <ul class="mnav__sub">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
      <p class="mnav__label">Telefon</p>
      <ul class="mnav__sub">${site.phones.map((p) => `<li><a href="${tel(p)}">${p.display} <small>${p.name}</small></a></li>`).join('')}</ul>
    </div>
  </div>
</header>`;
}

// ---------- Alt bölüm ----------
function footer() {
  const year = site.lastmod.slice(0, 4);
  return `<footer class="ftr">
  <div class="wrap ftr__grid">
    <div class="ftr__brand">
      ${brand('fb')}
      <p>Kırıkkale'de mezar, mermer, granit, traverten, karo, bordür taşı, andezit ve basamak işleri. Ölçü, imalat ve montaj kendi ekibimizle.</p>
      <a class="ftr__social" href="${site.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}<span>${site.instagramHandle}</span></a>
    </div>
    <div>
      <h2 class="ftr__title">Doğal Taş Koleksiyonu</h2>
      <ul class="ftr__links">${collection.map((m) => `<li><a href="/koleksiyon/${m.slug}/">${m.name}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="ftr__title">Hizmetler</h2>
      <ul class="ftr__links">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="ftr__title">İletişim</h2>
      <ul class="ftr__contact">
        <li>${icon('pin')}<span>Kırıkkale<br><small>${districts.filter((d) => d !== 'Merkez').join(', ')}</small></span></li>
        ${site.phones.map((p) => `<li>${icon('phone')}<a href="${tel(p)}">${p.display}<small>${p.name}</small></a></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap ftr__bottom">
    <p>Copyright ${year} ${upper(site.name)} // Tüm hakları saklıdır.</p>
    <p><a href="/kurumsal/">Kurumsal</a> · <a href="/projeler/">Projeler</a> · <a href="/iletisim/">İletişim</a></p>
  </div>
</footer>`;
}

const floaters = () => `<a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp ile yazın">${icon('whatsapp')}</a>
<button class="totop" type="button" aria-label="Sayfanın başına dön"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="totop__track" cx="20" cy="20" r="18"/><circle class="totop__bar" cx="20" cy="20" r="18"/></svg>${icon('arrow', 'i totop__ic')}</button>
<div class="actionbar" aria-label="Hızlı iletişim">
  <a href="${tel()}">${icon('phone')}<span>Ara</span></a>
  <a href="${waLink()}" target="_blank" rel="noopener" class="actionbar__wa">${icon('whatsapp')}<span>WhatsApp</span></a>
</div>`;

const lightbox = () => `<dialog class="lightbox" aria-label="Fotoğraf görüntüleyici">
  <button class="lightbox__close" type="button" aria-label="Kapat">${icon('close')}</button>
  <figure><img alt=""><figcaption></figcaption></figure>
</dialog>`;

function layout({ key, title: t, description, path, schema, preload, body, dark = true }) {
  return `<!doctype html>
<html lang="tr" class="no-js">
${head({ title: t, description, path, schema, preload })}
<body class="p-${key}${dark ? ' has-dark-top' : ''}">
<a class="skip" href="#icerik">İçeriğe geç</a>
${header(key)}
<main id="icerik">
${body}
</main>
${footer()}
${floaters()}
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
const collectionGrid = (list = collection) => `<ul class="coll">
  ${list.map((m, i) => `<li class="coll__item reveal" style="--d:${i % 3}">
    <a href="/koleksiyon/${m.slug}/">
      <span class="coll__img">${m.card === 'slab' ? slabImg(m, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' }) : appImg(m, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' })}</span>
      <span class="coll__cap"><b>${m.name}</b><small>İncele ${icon('arrow')}</small></span>
    </a>
  </li>`).join('')}
</ul>`;

const servicesPanels = () => `<section class="sec sec--white" id="hizmetler">
  <div class="wrap">
    ${title({ k: 'Hasbey Karo Mermer', h: 'Hizmetlerimiz', p: "Kırıkkale merkez ve ilçelerde mezardan mutfağa, bahçeden merdivene kadar doğal taş işleri.", center: true })}
    <ul class="panels reveal">
      ${services.map((s) => `<li class="panel">
        <a href="/${s.slug}/">
          ${svcImg(s, { sizes: '(max-width: 900px) 92vw, 50vw' })}
          <span class="panel__body">
            <b>${s.nav}</b>
            <span class="panel__text">${s.card}</span>
            <span class="panel__more">Detaylı bilgi ${icon('arrow')}</span>
          </span>
        </a>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const stonesBand = (heading = 'En çok tercih edilen taşlar') => `<section class="sec sec--dark" id="taslar">
  <div class="wrap">
    <div class="band-head">
      ${title({ k: 'Doğal taş koleksiyonu', h: heading, light: true })}
      <div class="carousel__nav"><button type="button" class="cbtn" data-dir="-1" aria-label="Önceki">${icon('arrow', 'i i--back')}</button><button type="button" class="cbtn" data-dir="1" aria-label="Sonraki">${icon('arrow')}</button></div>
    </div>
  </div>
  <div class="carousel" data-carousel>
    <ul class="carousel__track">
      ${collection.map((m) => `<li class="stone">
        <a href="/koleksiyon/${m.slug}/">
          <span class="stone__img">${slabImg(m, { sizes: '(max-width: 700px) 70vw, 320px' })}</span>
          <span class="stone__name">${m.name}</span>
          <span class="stone__tone">${m.tone} · ${m.props[2][1]}</span>
        </a>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const worksGrid = (list) => `<div class="works works--n${list.length}">
  ${list.map((p, i) => `<figure class="work reveal" style="--d:${i % 3}">
    <button type="button" class="gallery__btn" data-full="${p.src}.webp" data-cap="${esc(p.cap)}" aria-label="${esc(p.cap)} fotoğrafını büyüt">
      ${img(p, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 440px' })}
      <span class="work__cap"><b>${p.cap}</b><small>${p.tag} · Kırıkkale</small></span>
    </button>
  </figure>`).join('')}
</div>`;

const projectsBlock = ({ list = gallery, h = 'Projelerimiz', more = true } = {}) => `<section class="sec sec--white" id="projeler">
  <div class="wrap">
    ${title({ k: 'Kırıkkale', h, p: "Kırıkkale'de yaptığımız işlerden birkaçı. Güncel işlerimizi Instagram'da paylaşıyoruz.", center: true })}
    ${worksGrid(list)}
    <p class="center-actions reveal">${more ? btn('btn--line', '/projeler/', 'Tüm projeler', { ic: 'arrow' }) : ''}${btn('btn--line', site.instagram, site.instagramHandle, { ic: 'instagram', ext: true })}</p>
  </div>
</section>`;

const processBlock = () => `<section class="sec sec--cream">
  <div class="wrap">
    ${title({ k: 'Çalışma şeklimiz', h: 'Keşiften teslime', center: true })}
    <ol class="steps">
      ${steps.map((s, i) => `<li class="step reveal" style="--d:${i}"><span class="step__n">${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const faqBlock = (list, { h = 'Sık sorulan sorular', id = 'sss', cls = 'sec--white' } = {}) => `<section class="sec ${cls}" id="${id}">
  <div class="wrap faq">
    <div class="faq__head reveal">
      ${kicker('Merak edilenler')}
      <h2>${h}</h2>
      <p>Sorunuz burada yoksa arayın: <a href="${tel()}">${primaryPhone.display}</a></p>
    </div>
    <div class="faq__list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${f.q}<span class="faq__ic" aria-hidden="true"></span></summary><p>${f.a}</p></details>`).join('')}
    </div>
  </div>
</section>`;

const ctaBand = (h = 'Projenizi konuşalım', p = "Fiyat bilgisi ve keşif için arayın. İşin fotoğrafını ve yaklaşık ölçüsünü WhatsApp'tan gönderirseniz ön bilgiyi hemen verelim.", msg) => `<section class="cta" data-parallax-wrap>
  <div class="cta__bg" data-parallax="0.18">${pxImg('hero-banyo', { sizes: '100vw', hero: true })}</div>
  <div class="wrap cta__in reveal">
    ${kicker('Teklif ve keşif')}
    <h2>${h}</h2>
    <p>${p}</p>
    <div class="cta__actions">${waBtn('btn--gold', "WhatsApp'tan yazın", msg)}${btn('btn--ghost', '/iletisim/#teklif', 'Teklif formu')}</div>
    <ul class="cta__phones">${site.phones.map((p2) => `<li><a href="${tel(p2)}">${p2.display}</a><small>${p2.name}</small></li>`).join('')}</ul>
  </div>
</section>`;

// İç sayfa başlığı: koyu fotoğraf bant + yol
const pageBand = ({ trail, h1, lead = '', bg = null }) => `<section class="pband">
  ${bg ? `<div class="pband__bg" data-parallax="0.25">${bg.px ? pxImg(bg.px, { sizes: '100vw', eager: true, hero: bg.px.startsWith('hero-') }) : img(bg.photo, { sizes: '100vw', eager: true })}</div>` : ''}
  <div class="wrap pband__in">
    ${crumbs(trail)}
    <h1>${h1}</h1>
    ${lead ? `<p>${lead}</p>` : ''}
  </div>
</section>`;

// ---------- Sayfalar ----------
function homePage() {
  const body = `
<section class="slider" data-slider aria-label="Öne çıkanlar">
  <div class="slider__slides">
    ${slides.map((s, i) => `<div class="slide${i === 0 ? ' is-active' : ''}" data-i="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}">
      ${pxImg(s.px, { sizes: '100vw', eager: i === 0, hero: true, cls: 'slide__img', alt: '' })}
      <div class="slide__content">
        ${i === 0 ? `<h1 class="slide__kicker">${s.kicker}</h1>` : `<p class="slide__kicker">${s.kicker}</p>`}
        <p class="slide__title">${s.title}</p>
        <p class="slide__text">${s.text}</p>
        ${btn('btn--ghost', s.link, s.linkText, { ic: 'arrow' })}
      </div>
    </div>`).join('')}
  </div>
  <div class="slider__phones">${site.phones.slice(0, 2).map((p) => `<a href="${tel(p)}">${p.display}</a>`).join('')}<span>${icon('phone')}</span></div>
  <div class="slider__dots">${slides.map((_, i) => `<button type="button" data-go="${i}" aria-label="${i + 1}. slayt"${i === 0 ? ' aria-current="true"' : ''}>${i + 1}</button>`).join('')}</div>
  <div class="slider__arrows"><button type="button" data-step="-1" aria-label="Önceki">${icon('arrow', 'i i--back')}</button><button type="button" data-step="1" aria-label="Sonraki">${icon('arrow')}</button></div>
  <a class="slider__down" href="#kurumsal" aria-label="Aşağı kaydır">${icon('chevron')}</a>
</section>

<section class="sec sec--white" id="kurumsal">
  <div class="wrap intro">
    <div class="intro__text reveal">
      ${kicker('Hasbey Karo Mermer')}
      <h2>Mezardan mutfağa doğal taş</h2>
      <p>${corporate.statement}</p>
      <p>${corporate.about[1]}</p>
      <a class="intro__phone" href="${tel()}">${icon('phone')}<span><small>Müşteri hattı · ${primaryPhone.name}</small><b>${primaryPhone.display}</b></span></a>
    </div>
    <div class="intro__media" data-parallax-wrap>
      <figure class="intro__a reveal">${pxImg('siyah-mermer', { alt: 'Damarlı siyah mermer yüzey', sizes: '(max-width: 900px) 60vw, 360px' })}</figure>
      <figure class="intro__b reveal" data-parallax="-0.12">${img(photos.gri, { sizes: '(max-width: 900px) 46vw, 300px' })}</figure>
    </div>
  </div>
</section>

<section class="sec sec--cream" id="koleksiyon">
  <div class="wrap">
    ${title({ k: 'Doğal taş', h: 'Koleksiyonumuz', p: 'En çok çalıştığımız taşlar ve kullanıldıkları yerler. Her taşın sayfasında yüzey, kullanım ve bakım bilgisi var.', center: true })}
    ${collectionGrid()}
  </div>
</section>

${servicesPanels()}
${stonesBand()}
${projectsBlock()}
${processBlock()}
${faqBlock(homeFaq)}
${ctaBand()}`;

  return layout({
    key: 'home',
    path: '/',
    title: 'Kırıkkale Mermer, Mezar ve Karo İşleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mezar yapımı, mutfak tezgahı, karo imalatı, bordür taşı, andezit ve basamak işleri. Hasbey Karo Mermer'de ölçü, imalat ve montaj tek elden.",
    preload: `<link rel="preload" as="image" href="/assets/img/px/${slides[0].px}-960.webp" imagesrcset="/assets/img/px/${slides[0].px}-960.webp 960w, /assets/img/px/${slides[0].px}.webp 1920w" imagesizes="100vw">\n`,
    schema: [graph(business(), website(), faqLd(homeFaq))],
    body,
  });
}

function collectionPage() {
  const body = `
${pageBand({ trail: [['Anasayfa', '/'], ['Koleksiyon', '/koleksiyon/']], h1: 'Doğal Taş Koleksiyonu', lead: "Kırıkkale'de mezar, mutfak, merdiven ve dış mekan işlerinde en çok kullandığımız taşlar.", bg: { px: 'siyah-mermer' } })}
<section class="sec sec--white">
  <div class="wrap">
    <ul class="mlist">
      ${collection.map((m, i) => `<li class="mcard reveal" style="--d:${i % 3}">
        <a href="/koleksiyon/${m.slug}/">
          <span class="mcard__pair"><span>${slabImg(m, { sizes: '(max-width: 700px) 46vw, 200px' })}</span><span>${appImg(m, { sizes: '(max-width: 700px) 46vw, 200px' })}</span></span>
          <span class="mcard__body"><small>${m.tone}</small><b>${m.name}</b><span>${m.lead}</span><em>İncele ${icon('arrow')}</em></span>
        </a>
      </li>`).join('')}
    </ul>
  </div>
</section>
${stonesBand('Taşları yan yana görün')}
${ctaBand()}`;
  return layout({
    key: 'koleksiyon',
    path: '/koleksiyon/',
    title: 'Doğal Taş Koleksiyonu | Hasbey Karo Mermer Kırıkkale',
    description: "Kırıkkale'de kullandığımız doğal taşlar: beyaz mermer, traverten, gri mermer, siyah granit, andezit ve patinatolu bazalt. Yüzey, kullanım ve bakım bilgisi.",
    schema: [graph(
      { '@type': 'CollectionPage', name: 'Doğal Taş Koleksiyonu', url: abs('/koleksiyon/'), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Koleksiyon', '/koleksiyon/']]),
    )],
    body,
  });
}

function materialPage(m) {
  const path = `/koleksiyon/${m.slug}/`;
  const rel = services.filter((s) => m.services.includes(s.slug));
  const others = collection.filter((o) => o.slug !== m.slug);
  const waText = `Merhaba, ${lower(m.name)} ile ilgili bilgi almak istiyorum.`;
  const body = `
${pageBand({ trail: [['Anasayfa', '/'], ['Koleksiyon', '/koleksiyon/'], [m.name, path]], h1: m.name, bg: { px: m.app.px } })}
<section class="sec sec--white">
  <div class="wrap">
    <div class="prod reveal">
      <figure class="prod__img">${slabImg(m, { sizes: '(max-width: 900px) 92vw, 520px', eager: true })}<figcaption>Yüzey örneği</figcaption></figure>
      <figure class="prod__img">${appImg(m, { sizes: '(max-width: 900px) 92vw, 520px', eager: true })}<figcaption>Örnek uygulama görseli</figcaption></figure>
    </div>
    <div class="prod__info">
      <div class="prod__text reveal">
        <h2>${m.name}</h2>
        <p class="prod__lead">${m.lead}</p>
        ${m.desc.map((p) => `<p>${p}</p>`).join('')}
        <p class="prod__care"><b>Bakım:</b> ${m.care}</p>
      </div>
      <aside class="prod__side reveal">
        <dl class="specs">${m.props.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        ${waBtn('btn--dark btn--block', "WhatsApp'tan fiyat sorun", waText)}
        ${btn('btn--line btn--block', tel(), primaryPhone.display, { ic: 'phone' })}
      </aside>
    </div>
  </div>
</section>
<section class="sec sec--cream">
  <div class="wrap">
    ${title({ k: m.name, h: 'Bu taşla yaptığımız işler', center: true })}
    <ul class="mini">
      ${rel.map((s) => `<li class="reveal"><a href="/${s.slug}/"><span class="mini__img">${svcImg(s, { sizes: '(max-width: 700px) 92vw, 380px' })}</span><b>${s.nav}</b><small>${s.kicker}</small></a></li>`).join('')}
    </ul>
  </div>
</section>
<section class="sec sec--white">
  <div class="wrap">
    ${title({ k: 'Koleksiyon', h: 'Diğer taşlar', center: true })}
    ${collectionGrid(others)}
  </div>
</section>
${ctaBand(`${m.name} için fiyat alın`, undefined, waText)}`;
  return layout({
    key: m.slug,
    path,
    title: `Kırıkkale ${m.name} – Kullanım ve Uygulamalar | Hasbey Karo Mermer`.length <= 66 ? `Kırıkkale ${m.name} – Kullanım ve Uygulamalar | Hasbey Karo Mermer` : `Kırıkkale ${m.name} | Hasbey Karo Mermer`,
    description: clip(`${m.lead} Kırıkkale'de ${lower(m.name)} ile ${m.props[2][1].toLocaleLowerCase('tr')} işleri.`, 158),
    schema: [graph(
      { '@type': 'WebPage', name: m.name, url: abs(path), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Koleksiyon', '/koleksiyon/'], [m.name, path]]),
    )],
    body,
  });
}

function corporatePage() {
  const body = `
${pageBand({ trail: [['Anasayfa', '/'], ['Kurumsal', '/kurumsal/']], h1: 'Kurumsal', lead: corporate.statement, bg: { px: 'gri-uygulama' } })}
<section class="sec sec--white">
  <div class="wrap intro">
    <div class="intro__text reveal">
      ${kicker('Hakkımızda')}
      <h2>Hasbey Karo Mermer</h2>
      ${corporate.about.map((p) => `<p>${p}</p>`).join('')}
      <a class="intro__phone" href="${tel()}">${icon('phone')}<span><small>Müşteri hattı · ${primaryPhone.name}</small><b>${primaryPhone.display}</b></span></a>
    </div>
    <div class="intro__media" data-parallax-wrap>
      <figure class="intro__a reveal">${img(photos.granit, { sizes: '(max-width: 900px) 60vw, 360px' })}</figure>
      <figure class="intro__b reveal" data-parallax="-0.12">${pxImg('beyaz-levha', { alt: 'Damarlı beyaz mermer yüzey', sizes: '(max-width: 900px) 46vw, 300px' })}</figure>
    </div>
  </div>
</section>
<section class="sec sec--cream">
  <div class="wrap">
    ${title({ k: 'İlkelerimiz', h: 'Nasıl çalışıyoruz', center: true })}
    <ul class="values">${corporate.principles.map((p, i) => `<li class="reveal" style="--d:${i % 3}"><h3>${p.t}</h3><p>${p.d}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="sec sec--white">
  <div class="wrap">
    ${title({ k: 'İletişim', h: 'Bize doğrudan ulaşın', p: "WhatsApp için Uğur Bey'in numarasını kullanabilirsiniz.", center: true })}
    <ul class="people">${site.phones.map((p) => `<li class="reveal"><small>${p.name}</small><a href="${tel(p)}">${p.display}</a></li>`).join('')}</ul>
  </div>
</section>
${servicesPanels()}
${ctaBand()}`;
  return layout({
    key: 'kurumsal',
    path: '/kurumsal/',
    title: 'Kurumsal – Hasbey Karo Mermer | Kırıkkale',
    description: "Hasbey Karo Mermer; Kırıkkale'de mezar, mermer, granit, karo ve doğal taş işlerini yerinde ölçü, kendi imalatı ve kendi montaj ekibiyle yürüten yerel firma.",
    schema: [graph(
      business(),
      { '@type': 'AboutPage', name: 'Hasbey Karo Mermer hakkında', url: abs('/kurumsal/'), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Kurumsal', '/kurumsal/']]),
    )],
    body,
  });
}

function servicePage(s) {
  const path = `/${s.slug}/`;
  const gal = s.gallery.map((k) => photos[k]);
  const mats = collection.filter((m) => m.services.includes(s.slug));
  const waText = `Merhaba, ${lower(s.nav)} için bilgi almak istiyorum.`;
  const body = `
${pageBand({ trail: [['Anasayfa', '/'], ['Hizmetler', '/#hizmetler'], [s.nav, path]], h1: s.h1, lead: s.lead, bg: svcBg(s) })}
<section class="sec sec--white">
  <div class="wrap split">
    <div class="prose reveal">
      ${kicker(s.kicker)}
      <h2>${s.introTitle}</h2>
      ${s.intro.map((p) => `<p>${p}</p>`).join('')}
      <figure class="prose__img">${svcImg(s, { sizes: '(max-width: 900px) 92vw, 640px' })}</figure>
    </div>
    <aside class="side reveal">
      <h3>Fiyat ve keşif</h3>
      <p>İşin fotoğrafını ve yaklaşık ölçüsünü gönderin, ön bilgiyi hemen verelim.</p>
      <a class="side__tel" href="${tel()}">${primaryPhone.display}</a>
      <small class="side__name">${primaryPhone.name}</small>
      ${waBtn('btn--dark btn--block', "WhatsApp'tan yazın", waText)}
      <ul class="side__list"><li>${icon('check')}Kırıkkale merkez ve 8 ilçe</li><li>${icon('check')}Yerinde ölçü ve keşif</li><li>${icon('check')}Montaj kendi ekibimizle</li></ul>
    </aside>
  </div>
</section>
<section class="sec sec--cream">
  <div class="wrap">
    ${title({ k: s.nav, h: s.itemsTitle, center: true })}
    <ul class="values">${s.items.map((it, i) => `<li class="reveal" style="--d:${i % 3}"><h3>${it.t}</h3><p>${it.d}</p></li>`).join('')}</ul>
  </div>
</section>
${s.notes ? `<section class="sec sec--white">
  <div class="wrap">
    ${title({ k: 'Bilgi', h: s.notesTitle, center: true })}
    <ul class="notes">${s.notes.map((n, i) => `<li class="reveal" style="--d:${i}"><h3>${n.t}</h3><p>${n.d}</p></li>`).join('')}</ul>
  </div>
</section>` : ''}
${s.table ? `<section class="sec sec--white">
  <div class="wrap">
    ${title({ k: 'Karşılaştırma', h: s.table.title, p: 'Kısa bir özet. Kesin seçimi keşifte, kullanım alanınızı görerek birlikte yapıyoruz.', center: true })}
    <div class="table-wrap reveal"><table class="table">
      <thead><tr>${s.table.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${s.table.rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
    </table></div>
  </div>
</section>` : ''}
${mats.length ? `<section class="sec sec--cream">
  <div class="wrap">
    ${title({ k: 'Koleksiyon', h: 'Bu işte kullandığımız taşlar', center: true })}
    ${collectionGrid(mats)}
  </div>
</section>` : ''}
${gal.length ? projectsBlock({ list: gal, h: 'Yaptığımız işlerden' }) : ''}
${faqBlock(s.faq, { h: `${s.nav} hakkında`, cls: gal.length ? 'sec--cream' : 'sec--white' })}
${ctaBand(`${s.nav} için teklif alın`, undefined, waText)}`;
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
${pageBand({ trail: [['Anasayfa', '/'], ['Projeler', '/projeler/']], h1: 'Projelerimiz', lead: "Kırıkkale'de yaptığımız mezar, mutfak ve taş işlerinden örnekler.", bg: { photo: photos.gri } })}
${projectsBlock({ h: 'Tamamlanan işler', more: false })}
${servicesPanels()}
${ctaBand('Sizin işiniz de burada olsun')}`;
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
${pageBand({ trail: [['Anasayfa', '/'], ['İletişim', '/iletisim/']], h1: 'İletişim', lead: "Fiyat bilgisi, keşif randevusu ya da aklınıza takılan bir soru için arayın, WhatsApp'tan yazın veya formu doldurun.", bg: { px: 'hero-mutfak' } })}
<section class="sec sec--white">
  <div class="wrap contact">
    <div class="contact__info reveal">
      ${kicker('Hasbey Karo Mermer')}
      <h2>Bize ulaşın</h2>
      <ul class="clist">
        <li>${icon('pin')}<span><small>Bölge</small>Kırıkkale · Merkez ve 8 ilçe</span></li>
        ${site.phones.map((p) => `<li>${icon('phone')}<span><small>${p.name}</small><a href="${tel(p)}">${p.display}</a></span></li>`).join('')}
        <li>${icon('whatsapp')}<span><small>WhatsApp</small><a href="${waLink()}" target="_blank" rel="noopener">${primaryPhone.display}</a></span></li>
        <li>${icon('instagram')}<span><small>Instagram</small><a href="${site.instagram}" target="_blank" rel="noopener">${site.instagramHandle}</a></span></li>
      </ul>
    </div>
    <form class="qform reveal" id="teklif" action="https://wa.me/${site.whatsapp}" method="get" target="_blank" data-wa="${site.whatsapp}">
      ${kicker('Teklif formu')}
      <h2>Teklif isteyin</h2>
      <p class="qform__note">Formu doldurun, mesajınız WhatsApp'ta hazır açılsın. Bilgileriniz bize ancak siz WhatsApp'ta gönder'e bastığınızda ulaşır.</p>
      <div class="qform__row">
        <label class="field"><span>Adınız</span><input id="q-ad" type="text" autocomplete="name" placeholder="Ad Soyad"></label>
        <label class="field"><span>İlçe</span><select id="q-ilce">${districts.map((d) => `<option>${d === 'Merkez' ? 'Kırıkkale Merkez' : d}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Hizmet</span><select id="q-hizmet">${services.map((s) => `<option>${s.nav}</option>`).join('')}<option>Diğer</option></select></label>
      <label class="field"><span>Mesajınız</span><textarea id="q-mesaj" name="text" rows="5" required placeholder="Örneğin: 2 kişilik granit mezar, yaklaşık ölçüler 2 × 1,8 m"></textarea></label>
      <button class="btn btn--dark btn--block" type="submit">${icon('whatsapp')}<span>WhatsApp ile gönder</span></button>
    </form>
  </div>
</section>
${processBlock()}`;
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
${pageBand({ trail: [['Anasayfa', '/'], ['Sayfa bulunamadı', '/404.html']], h1: 'Sayfa bulunamadı', lead: 'Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.', bg: { px: 'siyah-mermer' } })}
<section class="sec sec--white"><div class="wrap center-actions">${btn('btn--dark', '/', 'Ana sayfaya dön', { ic: 'arrow' })}${callBtn()}</div></section>`;
  return layout({ key: '404', path: '/404.html', title: 'Sayfa bulunamadı | Hasbey Karo Mermer', description: 'Aradığınız sayfa bulunamadı.', schema: [], body })
    .replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
}

// ---------- Yardımcı dosyalar ----------
const sitemap = () => {
  const urls = [['/', '1.0'], ...services.map((s) => [`/${s.slug}/`, '0.9']), ['/koleksiyon/', '0.8'], ...collection.map((m) => [`/koleksiyon/${m.slug}/`, '0.7']), ['/kurumsal/', '0.6'], ['/projeler/', '0.7'], ['/iletisim/', '0.7']];
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
  background_color: '#141414', theme_color: '#141414',
  icons: [{ src: `${base}/assets/img/logo-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${base}/assets/img/logo-512.png`, sizes: '512x512', type: 'image/png' }],
}, null, 2);

const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d29c"/><stop offset=".5" stop-color="#b8914d"/><stop offset="1" stop-color="#e0c283"/></linearGradient></defs>
<rect width="100" height="100" rx="22" fill="#111112"/>
<g transform="translate(14 12) scale(.72)">
<path fill="url(#g)" d="M20 14h20v4h-5v64h5v4H20v-4h5V18h-5z"/><path fill="#f2efe9" d="M60 14h20v4h-5v64h5v4H60v-4h5V18h-5z"/><path fill="url(#g)" d="M5 61C29 47 61 40 97 44C66 45 36 52 8 65Z"/>
</g></svg>
`;

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me; object-src 'none'";

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
  Header always set Content-Security-Policy "${CSP}"
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
  Content-Security-Policy: ${CSP}

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

// Yazı tipleri (OFL) node_modules'tan siteye kopyalanır; eski tema dosyaları temizlenir
const FONTS = [
  '@fontsource/gilda-display/files/gilda-display-latin-400-normal.woff2',
  '@fontsource/gilda-display/files/gilda-display-latin-ext-400-normal.woff2',
  ...['400', '500', '600'].flatMap((w) => [`@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff2`, `@fontsource/barlow-condensed/files/barlow-condensed-latin-ext-${w}-normal.woff2`]),
  ...['400', '500', '600'].flatMap((w) => [`@fontsource/barlow/files/barlow-latin-${w}-normal.woff2`, `@fontsource/barlow/files/barlow-latin-ext-${w}-normal.woff2`]),
];
await rm(OUT + 'assets/fonts', { recursive: true, force: true });
await mkdir(OUT + 'assets/fonts', { recursive: true });
for (const f of FONTS) await copyFile(fileURLToPath(new URL('../node_modules/' + f, import.meta.url)), OUT + 'assets/fonts/' + f.split('/').pop());

await rm(OUT + 'koleksiyon', { recursive: true, force: true });
await put('index.html', homePage());
await put('koleksiyon/index.html', collectionPage());
for (const m of collection) await put(`koleksiyon/${m.slug}/index.html`, materialPage(m));
await put('kurumsal/index.html', corporatePage());
for (const s of services) await put(`${s.slug}/index.html`, servicePage(s));
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
console.log(`Derlendi → ${OUT} (${services.length + collection.length + 6} sayfa)${base ? `, alt klasör: ${base}` : ''}`);
