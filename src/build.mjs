// Statik site üretici: node src/build.mjs → public/
// Tema v2 (2026-11-25): açık taş zemin, antrasit, bronz vurgu; logodaki dört karodan türeyen ızgara.
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, base, districts, primaryPhone, waLink } from './config.mjs';
import { services, photos, gallery, materials, process as steps, homeFaq, facts, corporate } from './content.mjs';
import { brand, icon, swatch } from './svg.mjs';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));
const V = '10'; // önbellek kırıcı (css/js değişince artır)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const tel = (p = primaryPhone) => `tel:${p.tel}`;
const BIZ_ID = abs('/#isletme');
const OG = '/assets/img/og-hasbey-karo-mermer.jpg';
const nn = (i) => String(i + 1).padStart(2, '0');
const lower = (s) => s.toLocaleLowerCase('tr');

// ---------- Küçük parçalar ----------
const img = (p, { sizes = '(max-width: 700px) 92vw, 460px', eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${p.src}-520.webp" srcset="${p.src}-520.webp 520w, ${p.src}.webp 960w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;

const label = (t, { no = '', light = false } = {}) => `<p class="label${light ? ' label--light' : ''}">${no ? `<span class="label__no">${no}</span>` : '<span class="label__mark" aria-hidden="true"></span>'}${t}</p>`;

const shead = ({ no, tag, title, text = '', light = false, id = '' }) => `<header class="shead reveal"${id ? ` id="${id}"` : ''}>
  ${label(tag, { no, light })}
  <div class="shead__main">
    <h2 class="h2">${title}</h2>
    ${text ? `<p class="shead__text">${text}</p>` : ''}
  </div>
</header>`;

const callBtn = (cls = 'btn btn--line') => `<a class="${cls}" href="${tel()}">${icon('phone')}<span>${primaryPhone.display}</span></a>`;
const quoteBtn = (cls = 'btn btn--dark', text = 'Teklif alın') => `<a class="${cls}" href="/iletisim/#teklif"><span>${text}</span>${icon('arrow')}</a>`;
const waBtn = (cls = 'btn btn--line', text) => `<a class="${cls}" href="${waLink(text)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp'tan yazın</span></a>`;

// Hizmetin görseli: fotoğraf varsa fotoğraf, yoksa taş dokusu
const svcVisual = (s, { sizes = '(max-width: 900px) 92vw, 520px', eager = false } = {}) =>
  (s.hero ? img(photos[s.hero], { sizes, eager }) : swatch(s.swatch, 'v', 'swatch', eager));

// Logodaki dört karo: 2×2 döşeme, derz aralıklı
const mosaic = (tiles, cls = '') => `<div class="mosaic ${cls}">
  ${tiles.map((t) => `<figure class="mosaic__tile">${t.html}<figcaption class="tag">${t.no ? `<span>${t.no}</span>` : ''}${t.cap}</figcaption></figure>`).join('\n  ')}
</div>`;

const crumbs = (items) => `<nav class="crumbs" aria-label="Sayfa yolu">${items.map(([name, href], i) =>
  (i === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${href}">${name}</a><span class="crumbs__sep" aria-hidden="true">/</span>`)).join('')}</nav>`;

// ---------- Baş ----------
function head({ title, description, path, schema = [], preload = '' }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f3f1ec">
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
<link rel="preload" href="/assets/fonts/instrument-sans-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/geist-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${preload}${schema.map(ld).join('\n')}
</head>`;
}

// ---------- Üst bölüm ----------
function header(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const inSvc = services.some((s) => s.slug === active);
  return `<div class="topbar">
  <div class="container topbar__in">
    <p class="topbar__loc">${icon('pin')}<span>Kırıkkale · Merkez ve 8 ilçe</span></p>
    <ul class="topbar__links">
      ${site.phones.map((p) => `<li><a href="${tel(p)}"><b>${p.display}</b><span>${p.name}</span></a></li>`).join('')}
      <li><a href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}<b>${site.instagramHandle}</b></a></li>
    </ul>
  </div>
</div>
<header class="site-header" data-header>
  <div class="container site-header__in">
    ${brand('hb')}
    <nav class="nav" aria-label="Ana menü">
      <ul class="nav__list">
        <li><a href="/kurumsal/"${cur('kurumsal')}>Kurumsal</a></li>
        <li class="nav__drop">
          <button class="nav__btn" type="button" aria-expanded="false" aria-controls="menu-hizmetler"${inSvc ? ' data-active' : ''}>Hizmetler${icon('chevron')}</button>
          <div class="mega" id="menu-hizmetler">
            <div class="container mega__in">
              <div class="mega__intro">
                ${label('Hizmetler')}
                <p>Kırıkkale'de taşla ilgili tüm işler; keşif, ölçü, imalat ve montaj tek ekipten.</p>
                <a class="link" href="/#hizmetler">Tüm hizmetler${icon('arrow')}</a>
              </div>
              <ul class="mega__list">
                ${services.map((s, i) => `<li><a href="/${s.slug}/"${cur(s.slug)}><span class="mega__no">${nn(i)}</span><span class="mega__txt"><b>${s.nav}</b><small>${s.kicker}</small></span>${icon('arrow')}</a></li>`).join('')}
              </ul>
            </div>
          </div>
        </li>
        <li><a href="/#malzemeler">Malzemeler</a></li>
        <li><a href="/projeler/"${cur('projeler')}>Projeler</a></li>
        <li><a href="/iletisim/"${cur('iletisim')}>İletişim</a></li>
      </ul>
    </nav>
    <div class="site-header__cta">
      <a class="hcall" href="${tel()}"><span class="hcall__ic">${icon('phone')}</span><span class="hcall__txt"><small>Hemen arayın</small><b>${primaryPhone.display}</b></span></a>
      ${quoteBtn('btn btn--dark btn--sm')}
    </div>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç">${icon('menu', 'i i--open')}${icon('close', 'i i--close')}</button>
  </div>
  <div class="mnav" id="mobil-menu" hidden>
    <div class="container mnav__in">
      <ul class="mnav__list">
        <li><a href="/">Anasayfa</a></li>
        <li><a href="/kurumsal/">Kurumsal</a></li>
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/#malzemeler">Malzemeler</a></li>
        <li><a href="/iletisim/">İletişim</a></li>
      </ul>
      ${label('Hizmetler')}
      <ul class="mnav__svc">${services.map((s, i) => `<li><a href="/${s.slug}/"><span>${nn(i)}</span>${s.nav}</a></li>`).join('')}</ul>
      <div class="mnav__contact">
        ${site.phones.map((p) => `<a href="${tel(p)}"><b>${p.display}</b><small>${p.name}</small></a>`).join('')}
      </div>
      ${quoteBtn('btn btn--dark btn--block')}
    </div>
  </div>
</header>`;
}

// ---------- Alt bölüm ----------
function footer() {
  const year = site.lastmod.slice(0, 4);
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        ${brand('fb')}
        <p>Kırıkkale'de mezar yapımı, mutfak tezgahı, karo ve bordür taşı, andezit, basamak ve inşaat mermer işleri. Ölçü, imalat ve montaj tek elden.</p>
      </div>
      <div class="footer__cta">
        ${label('Teklif ve keşif', { light: true })}
        <a class="footer__phone" href="${tel()}">${primaryPhone.display}</a>
        <div class="footer__btns">${waBtn('btn btn--light btn--sm')}${quoteBtn('btn btn--line-light btn--sm', 'Teklif formu')}</div>
      </div>
    </div>
    <div class="footer__grid">
      <div>
        <h2 class="footer__title">Kurumsal</h2>
        <ul class="footer__links">
          <li><a href="/kurumsal/">Hakkımızda</a></li>
          <li><a href="/projeler/">Projeler</a></li>
          <li><a href="/#malzemeler">Malzemeler</a></li>
          <li><a href="/#sss">Sık sorulan sorular</a></li>
          <li><a href="/iletisim/">İletişim</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__title">Hizmetler</h2>
        <ul class="footer__links">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2 class="footer__title">İletişim</h2>
        <ul class="footer__links footer__contact">
          ${site.phones.map((p) => `<li><a href="${tel(p)}"><b>${p.display}</b><small>${p.name}</small></a></li>`).join('')}
          <li><a href="${site.instagram}" target="_blank" rel="noopener"><b>${site.instagramHandle}</b><small>Instagram</small></a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer__title">Hizmet bölgesi</h2>
        <p class="footer__area">${districts.map((d) => (d === 'Merkez' ? 'Kırıkkale Merkez' : d)).join(' · ')}</p>
      </div>
    </div>
    <p class="footer__word" aria-hidden="true">Hasbey Karo Mermer</p>
    <div class="footer__bottom">
      <p>© ${year} ${site.name}. Tüm hakları saklıdır.</p>
      <p>Kırıkkale mermer · mezar · karo · doğal taş</p>
    </div>
  </div>
</footer>`;
}

const mobileBar = () => `<div class="actionbar" aria-label="Hızlı iletişim">
  <a href="${tel()}">${icon('phone')}<span>Ara</span></a>
  <a href="${waLink()}" target="_blank" rel="noopener" class="actionbar__wa">${icon('whatsapp')}<span>WhatsApp</span></a>
  <a href="/iletisim/#teklif" class="actionbar__q">${icon('send')}<span>Teklif</span></a>
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
const factsBar = () => `<div class="facts">
  <div class="container">
    <ul class="facts__list">${facts.map((f) => `<li><b>${f.k}</b><span>${f.v}</span></li>`).join('')}</ul>
  </div>
</div>`;

const servicesIndex = ({ no = '02', exclude = null, title = 'Taşla ilgili her iş, tek çatı altında', text = "Mezardan mutfağa, bahçeden merdivene kadar Kırıkkale'de yaptığımız işler. Her başlıkta malzeme seçenekleri, süreç ve sık sorulan sorular var.", tag = 'Hizmetler', id = 'hizmetler' } = {}) => {
  const list = services.filter((s) => s.slug !== exclude);
  return `<section class="section" id="${id}">
  <div class="container">
    ${shead({ no, tag, title, text })}
    <div class="svc">
      <ol class="svc__list">
        ${list.map((s, i) => `<li class="reveal"><a class="svc__row" href="/${s.slug}/" data-i="${i}">
          <span class="svc__no">${nn(services.indexOf(s))}</span>
          <span class="svc__thumb">${svcVisual(s, { sizes: '96px' })}</span>
          <span class="svc__main"><b class="svc__title">${s.nav}</b><span class="svc__desc">${s.card}</span></span>
          <span class="svc__go">${icon('arrow')}</span>
        </a></li>`).join('')}
      </ol>
      <div class="svc__preview" aria-hidden="true">
        ${list.map((s, i) => `<figure class="svc__fig${i === 0 ? ' is-active' : ''}" data-i="${i}">${svcVisual(s, { sizes: '(max-width: 1100px) 40vw, 520px' })}<figcaption class="tag"><span>${nn(services.indexOf(s))}</span>${s.kicker}</figcaption></figure>`).join('')}
      </div>
    </div>
  </div>
</section>`;
};

const materialsBlock = (no = '03') => `<section class="section section--dark" id="malzemeler">
  <div class="container">
    ${shead({ no, tag: 'Malzemeler', title: 'Taş kütüphanesi', text: 'Taşın seçimi işin hem görünüşünü hem ömrünü belirler. En çok çalıştığımız taşlar ve kullanıldıkları yerler:', light: true })}
    <ul class="mats">
      ${materials.map((m, i) => `<li class="mat reveal" style="--d:${i % 3}">
        <div class="mat__img">${swatch(m.key, 'm' + i)}</div>
        <div class="mat__body">
          <p class="mat__code">T-${nn(i)}</p>
          <h3 class="mat__name">${m.name}</h3>
          <p>${m.text}</p>
          <ul class="mat__use">${m.use.map((u) => `<li>${u}</li>`).join('')}</ul>
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const worksGrid = (list, { insta = true } = {}) => `<div class="works works--n${list.length}">
  ${list.map((p, i) => `<figure class="work reveal" style="--d:${i % 3}">
    <button type="button" class="gallery__btn" data-full="${p.src}.webp" data-cap="${esc(p.cap)}" aria-label="${esc(p.cap)} fotoğrafını büyüt">
      ${img(p, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 440px' })}
      <span class="work__zoom">${icon('expand')}</span>
    </button>
    <figcaption><span class="work__tag">${p.tag} · Kırıkkale</span><b>${p.cap}</b></figcaption>
  </figure>`).join('')}
  ${insta ? `<a class="work work--insta reveal" href="${site.instagram}" target="_blank" rel="noopener">
    <span class="work__insta">${icon('instagram')}<b>Güncel işlerimiz Instagram'da</b><small>${site.instagramHandle}</small><span class="link link--light">Profile git${icon('arrow')}</span></span>
  </a>` : ''}
</div>`;

const processBlock = (no = '05') => `<section class="section section--stone">
  <div class="container">
    ${shead({ no, tag: 'Çalışma şeklimiz', title: 'Keşiften teslime dört adım', text: 'Her işte aynı düzenle ilerliyoruz. Böylece ne zaman, neyin yapılacağını baştan bilirsiniz.' })}
    <ol class="steps">
      ${steps.map((s, i) => `<li class="step reveal" style="--d:${i}"><span class="step__no">${nn(i)}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const areaBlock = (no = '06') => `<section class="section">
  <div class="container area">
    <div class="area__copy reveal">
      ${label('Hizmet bölgesi', { no })}
      <h2 class="h2">Kırıkkale'nin dokuz ilçesinde</h2>
      <p class="muted">Kırıkkale Merkez başta olmak üzere ilin tüm ilçelerinde mezar, mutfak tezgahı, karo, bordür taşı, andezit ve basamak işleri yapıyoruz. Keşif için işin yerini söylemeniz yeterli.</p>
      ${callBtn('btn btn--line')}
    </div>
    <ul class="districts reveal">${districts.map((d, i) => `<li${d === 'Merkez' ? ' class="is-center"' : ''}><span>${d === 'Merkez' ? 'Merkez' : nn(i)}</span><b>${d === 'Merkez' ? 'Kırıkkale' : d}</b></li>`).join('')}</ul>
  </div>
</section>`;

const faqBlock = (list, { title = 'Sık sorulan sorular', no = '07', id = 'sss' } = {}) => `<section class="section section--white" id="${id}">
  <div class="container faq">
    <div class="faq__head reveal">
      ${label('SSS', { no })}
      <h2 class="h2">${title}</h2>
      <p class="muted">Aklınıza takılan başka bir soru varsa arayın, hemen yanıtlayalım.</p>
      <a class="link" href="${tel()}">${primaryPhone.display}${icon('arrow')}</a>
    </div>
    <div class="faq__list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><span class="faq__q">${f.q}</span><span class="faq__ic" aria-hidden="true">${icon('plus')}</span></summary><div class="faq__a"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

const ctaBlock = (title = 'Projenizi konuşalım', text = "Fiyat bilgisi ve keşif için arayın. İşin fotoğrafını ve yaklaşık ölçüsünü WhatsApp'tan gönderirseniz ön bilgiyi hemen verelim.") => `<section class="cta">
  <div class="container cta__in">
    <div class="cta__copy reveal">
      ${label('Teklif ve keşif', { light: true })}
      <h2 class="h2">${title}</h2>
      <p>${text}</p>
      <div class="actions">${quoteBtn('btn btn--light', 'Teklif formu')}${waBtn('btn btn--line-light')}</div>
    </div>
    <ul class="cta__phones reveal">
      ${site.phones.map((p) => `<li><a href="${tel(p)}"><small>${p.name}</small><b>${p.display}</b>${icon('ne')}</a></li>`).join('')}
    </ul>
  </div>
</section>`;

// İç sayfa başlığı
const pageHero = ({ trail, kicker, h1, lead, actions = '', visual = '', spec = null, cls = '' }) => `<section class="phero${cls}">
  <div class="container phero__grid${visual ? '' : ' phero__grid--solo'}">
    <div class="phero__copy">
      ${crumbs(trail)}
      ${label(kicker)}
      <h1 class="phero__title">${h1}</h1>
      <p class="lead">${lead}</p>
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${visual ? `<div class="phero__visual">${visual}</div>` : ''}
  </div>
  ${spec ? `<div class="container"><dl class="spec">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>` : ''}
</section>`;

const tileFig = (html, cap, no = '') => `<figure class="tile">${html}<figcaption class="tag">${no ? `<span>${no}</span>` : ''}${cap}</figcaption></figure>`;

// ---------- Sayfalar ----------
function homePage() {
  const heroTiles = [
    { html: img(photos.traverten, { eager: true, sizes: '(max-width: 900px) 46vw, 330px' }), no: '01', cap: 'Aile mezarı' },
    { html: swatch('beyaz', 'h1', 'swatch', true), cap: 'Beyaz mermer' },
    { html: swatch('granit', 'h2', 'swatch', true), cap: 'Siyah granit' },
    { html: img(photos.gri, { eager: true, sizes: '(max-width: 900px) 46vw, 330px' }), no: '02', cap: 'Gri mermer mezar' },
  ];
  const body = `
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy">
      ${label('Kırıkkale · Mermer · Karo · Doğal taş')}
      <h1 class="hero__title">Kırıkkale'de mermer, mezar ve doğal taş işleri</h1>
      <p class="lead">Hasbey Karo Mermer; mezar yapımından mutfak tezgahına, karo ve bordür taşından andezit kaplamaya kadar taşla ilgili her işi ölçüden montaja tek ekiple yürütür.</p>
      <div class="actions">${quoteBtn()}${callBtn()}</div>
    </div>
    <div class="hero__visual">
      ${mosaic(heroTiles, 'mosaic--hero')}
    </div>
  </div>
</section>
${factsBar()}

<section class="section section--white" id="hakkimizda">
  <div class="container about">
    <figure class="about__img reveal">${img(photos.beyaz, { sizes: '(max-width: 900px) 92vw, 440px' })}<figcaption class="tag"><span>03</span>Beyaz mermer mezar</figcaption></figure>
    <div class="about__copy reveal">
      ${label('Kurumsal', { no: '01' })}
      <p class="statement">${corporate.statement}</p>
      <p class="muted">${corporate.about[1]}</p>
      <ul class="pillars">
        ${corporate.principles.slice(0, 3).map((p, i) => `<li><span>${nn(i)}</span><b>${p.t}</b><p>${p.d}</p></li>`).join('')}
      </ul>
      <a class="link" href="/kurumsal/">Kurumsal sayfamız${icon('arrow')}</a>
    </div>
  </div>
</section>

${servicesIndex()}
${materialsBlock('03')}

<section class="section section--white" id="projeler">
  <div class="container">
    ${shead({ no: '04', tag: 'Projeler', title: 'Son işlerimizden', text: "Kırıkkale'de tamamladığımız mezar ve mutfak işlerinden birkaçı. Güncel çalışmalarımızı Instagram'da paylaşıyoruz." })}
    ${worksGrid(gallery)}
    <p class="more reveal"><a class="link" href="/projeler/">Tüm projeler${icon('arrow')}</a></p>
  </div>
</section>

${processBlock('05')}
${areaBlock('06')}
${faqBlock(homeFaq, { no: '07' })}
${ctaBlock()}`;

  return layout({
    key: 'home',
    path: '/',
    title: 'Kırıkkale Mermer, Mezar ve Karo İşleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mezar yapımı, mutfak tezgahı, karo imalatı, bordür taşı, andezit ve basamak işleri. Hasbey Karo Mermer'de ölçü, imalat ve montaj tek elden.",
    preload: `<link rel="preload" as="image" href="${photos.traverten.src}-520.webp" imagesrcset="${photos.traverten.src}-520.webp 520w, ${photos.traverten.src}.webp 960w" imagesizes="(max-width: 900px) 46vw, 330px">\n`,
    schema: [graph(business(), website(), faqLd(homeFaq))],
    body,
  });
}

function corporatePage() {
  const tiles = [
    { html: swatch('traverten', 'k1', 'swatch', true), cap: 'Traverten' },
    { html: img(photos.granit, { eager: true, sizes: '(max-width: 900px) 46vw, 300px' }), no: '01', cap: 'Granit mezar' },
    { html: img(photos.mutfak, { eager: true, sizes: '(max-width: 900px) 46vw, 300px' }), no: '02', cap: 'Mutfak' },
    { html: swatch('andezit', 'k2', 'swatch', true), cap: 'Andezit' },
  ];
  const body = `
${pageHero({
    trail: [['Anasayfa', '/'], ['Kurumsal', '/kurumsal/']],
    kicker: 'Kurumsal · Hakkımızda',
    h1: 'Hasbey Karo Mermer hakkında',
    lead: corporate.statement,
    actions: quoteBtn() + callBtn(),
    visual: mosaic(tiles, 'mosaic--page'),
  })}

<section class="section section--white">
  <div class="container split">
    <div class="prose reveal">
      ${label('Biz kimiz', { no: '01' })}
      <h2 class="h2">Taşı tanıyan, işini yerinde yapan bir ekip</h2>
      ${corporate.about.map((p) => `<p>${p}</p>`).join('')}
    </div>
    <aside class="panel reveal" aria-label="Kimlerle çalışıyoruz">
      <h2 class="panel__title">Kimlerle çalışıyoruz</h2>
      <ul class="panel__list">${corporate.clients.map((c) => `<li>${icon('check')}${c}</li>`).join('')}</ul>
      <div class="panel__foot">${quoteBtn('btn btn--dark btn--block')}</div>
    </aside>
  </div>
</section>

<section class="section">
  <div class="container">
    ${shead({ no: '02', tag: 'İlkelerimiz', title: 'Nasıl çalışıyoruz', text: 'Her işte aynı ilkelerle ilerliyoruz. Mezar da olsa merdiven de olsa, iş aynı özeni hak eder.' })}
    <ul class="grid6">
      ${corporate.principles.map((p, i) => `<li class="cell reveal" style="--d:${i % 3}"><span class="cell__no">${nn(i)}</span><h3>${p.t}</h3><p>${p.d}</p></li>`).join('')}
    </ul>
  </div>
</section>

${servicesIndex({ no: '03', tag: 'Faaliyet alanları', title: 'Yaptığımız işler', text: 'Beş ana başlıkta topladığımız hizmetlerimizin her biri için ayrı bir sayfa hazırladık.', id: 'faaliyet' })}
${processBlock('04')}

<section class="section section--white">
  <div class="container">
    ${shead({ no: '05', tag: 'İletişim kişileri', title: 'Doğrudan ulaşın', text: 'Aşağıdaki numaralardan bize doğrudan ulaşabilirsiniz. WhatsApp için ilk numarayı kullanın.' })}
    <ul class="people">
      ${site.phones.map((p, i) => `<li class="person reveal" style="--d:${i}"><a href="${tel(p)}"><span class="person__no">${nn(i)}</span><b class="person__name">${p.name}</b><span class="person__tel">${p.display}</span><span class="person__go">${icon('phone')}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

${areaBlock('06')}
${ctaBlock()}`;

  return layout({
    key: 'kurumsal',
    path: '/kurumsal/',
    title: 'Kurumsal – Hasbey Karo Mermer Hakkında | Kırıkkale',
    description: "Hasbey Karo Mermer; Kırıkkale'de mezar, mermer, granit, karo ve doğal taş işlerini yerinde ölçü, kendi imalatı ve kendi montaj ekibiyle yürüten yerel firma.",
    schema: [graph(
      business(),
      { '@type': 'AboutPage', name: 'Hasbey Karo Mermer hakkında', url: abs('/kurumsal/'), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Kurumsal', '/kurumsal/']]),
    )],
    body,
  });
}

function servicePage(s, idx) {
  const path = `/${s.slug}/`;
  const visual = tileFig(svcVisual(s, { eager: true, sizes: '(max-width: 900px) 92vw, 560px' }), s.hero ? `${photos[s.hero].cap} · Kırıkkale` : s.kicker, nn(idx));
  const gal = s.gallery.map((k) => photos[k]);
  const waText = `Merhaba, ${lower(s.nav)} için bilgi almak istiyorum.`;
  let n = 1;
  const no = () => nn(n++);

  const intro = `<section class="section section--white">
    <div class="container split">
      <div class="prose reveal">
        ${label('Hizmet hakkında', { no: no() })}
        <h2 class="h2">${s.introTitle}</h2>
        ${s.intro.map((p) => `<p>${p}</p>`).join('')}
      </div>
      <aside class="panel reveal" aria-label="Fiyat ve keşif">
        <h2 class="panel__title">Fiyat ve keşif</h2>
        <p>İşin fotoğrafını ve yaklaşık ölçüsünü gönderin, ön bilgiyi hemen verelim.</p>
        <a class="panel__phone" href="${tel()}"><small>${primaryPhone.name}</small><b>${primaryPhone.display}</b></a>
        ${waBtn('btn btn--dark btn--block', waText)}
        <ul class="panel__list">
          <li>${icon('check')}Kırıkkale merkez ve 8 ilçe</li>
          <li>${icon('check')}Yerinde ölçü ve keşif</li>
          <li>${icon('check')}Montaj kendi ekibimizle</li>
        </ul>
      </aside>
    </div>
  </section>`;

  const items = `<section class="section">
    <div class="container">
      ${shead({ no: no(), tag: 'Hizmet kapsamı', title: s.itemsTitle })}
      <ul class="grid6">
        ${s.items.map((it, i) => `<li class="cell reveal" style="--d:${i % 3}"><span class="cell__no">${nn(i)}</span><h3>${it.t}</h3><p>${it.d}</p></li>`).join('')}
      </ul>
    </div>
  </section>`;

  const notes = s.notes ? `<section class="section section--dark">
    <div class="container">
      ${shead({ no: no(), tag: 'Bilmeniz gerekenler', title: s.notesTitle, light: true })}
      <ul class="notes">${s.notes.map((nt, i) => `<li class="note reveal" style="--d:${i}"><span class="note__no">${nn(i)}</span><h3>${nt.t}</h3><p>${nt.d}</p></li>`).join('')}</ul>
    </div>
  </section>` : '';

  const table = s.table ? `<section class="section section--white">
    <div class="container">
      ${shead({ no: no(), tag: 'Karşılaştırma', title: s.table.title, text: 'Kısa bir özet. Kesin seçimi keşifte, kullanım alanınızı görerek birlikte yapıyoruz.' })}
      <div class="table-wrap reveal"><table class="table">
        <thead><tr>${s.table.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>` : '';

  const galleryHtml = gal.length ? `<section class="section">
    <div class="container">
      ${shead({ no: no(), tag: 'Projeler', title: 'Yaptığımız işlerden' })}
      ${worksGrid(gal)}
    </div>
  </section>` : '';

  const faqNo = no();
  const body = `
${pageHero({
    trail: [['Anasayfa', '/'], ['Hizmetler', '/#hizmetler'], [s.nav, path]],
    kicker: s.kicker,
    h1: s.h1,
    lead: s.lead,
    actions: quoteBtn() + waBtn('btn btn--line', waText),
    visual,
    spec: [['Kapsam', s.kicker.replace(/ · /g, ', ')], ['Hizmet bölgesi', 'Kırıkkale merkez ve 8 ilçe'], ['Süreç', 'Keşif → Ölçü → İmalat → Montaj']],
  })}
${intro}${items}${notes}${table}${galleryHtml}
${faqBlock(s.faq, { title: `${s.nav} hakkında sorular`, no: faqNo })}
${servicesIndex({ no: nn(n), exclude: s.slug, tag: 'Diğer hizmetler', title: 'Bunlar da ilginizi çekebilir', text: '', id: 'diger-hizmetler' })}
${ctaBlock(`${s.nav} için teklif alın`)}`;

  return layout({
    key: s.slug,
    path,
    title: s.title,
    description: s.description,
    preload: s.hero ? `<link rel="preload" as="image" href="${photos[s.hero].src}-520.webp" imagesrcset="${photos[s.hero].src}-520.webp 520w, ${photos[s.hero].src}.webp 960w" imagesizes="(max-width: 900px) 92vw, 560px">\n` : '',
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
${pageHero({
    trail: [['Anasayfa', '/'], ['Projeler', '/projeler/']],
    kicker: 'Kırıkkale · Tamamlanan işler',
    h1: 'Kırıkkale mermer ve mezar projelerimiz',
    lead: "Kırıkkale'de yaptığımız mezar, mutfak ve taş işlerinden örnekler. Fotoğrafa dokunarak büyütebilirsiniz.",
    actions: quoteBtn() + callBtn(),
  })}
<section class="section section--white">
  <div class="container">${worksGrid(gallery)}</div>
</section>
${servicesIndex({ no: '02', tag: 'Hizmetler', title: 'Hangi işi yaptırmak istiyorsunuz?', text: 'Hizmet sayfalarında malzeme seçeneklerini, süreci ve sık sorulan soruları bulabilirsiniz.' })}
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
${pageHero({
    trail: [['Anasayfa', '/'], ['İletişim', '/iletisim/']],
    kicker: 'Kırıkkale · Hasbey Karo Mermer',
    h1: 'İletişim ve teklif',
    lead: "Fiyat bilgisi, keşif randevusu ya da aklınıza takılan bir soru için doğrudan arayın, WhatsApp'tan yazın veya teklif formunu doldurun.",
  })}
<section class="section section--white">
  <div class="container contact">
    <div class="contact__info reveal">
      ${label('Doğrudan iletişim', { no: '01' })}
      <ul class="channels">
        ${site.phones.map((p) => `<li><a href="${tel(p)}"><span class="channels__k">Telefon · ${p.name}</span><b>${p.display}</b>${icon('ne')}</a></li>`).join('')}
        <li><a href="${waLink()}" target="_blank" rel="noopener"><span class="channels__k">WhatsApp</span><b>Mesaj gönderin</b>${icon('ne')}</a></li>
        <li><a href="${site.instagram}" target="_blank" rel="noopener"><span class="channels__k">Instagram</span><b>${site.instagramHandle}</b>${icon('ne')}</a></li>
        <li><div><span class="channels__k">Hizmet bölgesi</span><b>Kırıkkale · Merkez ve 8 ilçe</b></div></li>
      </ul>
    </div>
    <form class="qform reveal" id="teklif" action="https://wa.me/${site.whatsapp}" method="get" target="_blank" data-wa="${site.whatsapp}">
      ${label('Teklif formu', { no: '02' })}
      <h2 class="h3">Teklif isteyin</h2>
      <p class="muted">Formu doldurun, mesajınız WhatsApp'ta hazır açılsın. Bilgileriniz bize ancak siz WhatsApp'ta gönder'e bastığınızda ulaşır.</p>
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
${processBlock('03')}
${areaBlock('04')}`;
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
<section class="phero phero--404">
  <div class="container phero__grid phero__grid--solo">
    <div class="phero__copy">
      ${label('Hata 404')}
      <h1 class="phero__title">Aradığınız sayfa bulunamadı</h1>
      <p class="lead">Sayfa taşınmış ya da hiç var olmamış olabilir. Ana sayfaya dönebilir ya da bizi doğrudan arayabilirsiniz.</p>
      <div class="actions"><a class="btn btn--dark" href="/"><span>Ana sayfaya dön</span>${icon('arrow')}</a>${callBtn()}</div>
    </div>
  </div>
</section>`;
  return layout({ key: '404', path: '/404.html', title: 'Sayfa bulunamadı | Hasbey Karo Mermer', description: 'Aradığınız sayfa bulunamadı.', schema: [], body })
    .replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
}

// ---------- Yardımcı dosyalar ----------
const sitemap = () => {
  const urls = [['/', '1.0'], ...services.map((s) => [`/${s.slug}/`, '0.9']), ['/kurumsal/', '0.7'], ['/projeler/', '0.7'], ['/iletisim/', '0.7']];
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
  background_color: '#f3f1ec', theme_color: '#f3f1ec',
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
  '@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2',
  '@fontsource-variable/instrument-sans/files/instrument-sans-latin-ext-standard-normal.woff2',
  '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
  '@fontsource-variable/geist-mono/files/geist-mono-latin-ext-wght-normal.woff2',
];
await rm(OUT + 'assets/fonts', { recursive: true, force: true });
await mkdir(OUT + 'assets/fonts', { recursive: true });
for (const f of FONTS) await copyFile(fileURLToPath(new URL('../node_modules/' + f, import.meta.url)), OUT + 'assets/fonts/' + f.split('/').pop());

await put('index.html', homePage());
await put('kurumsal/index.html', corporatePage());
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
console.log(`Derlendi → ${OUT} (${services.length + 5} sayfa)${base ? `, alt klasör: ${base}` : ''}`);
