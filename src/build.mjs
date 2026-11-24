// Statik site üretici: node src/build.mjs → public/
// Tema v3 "Sergi salonu" (2026-11-25): nero mermer, fildişi, zümrüt ve pirinç; serif başlıklar, kemer çerçeveler.
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, base, districts, primaryPhone, waLink } from './config.mjs';
import { services, photos, gallery, materials, process as steps, homeFaq, facts, corporate } from './content.mjs';
import { brand, plaque, icon, swatch, bgTex } from './svg.mjs';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));
const V = '12'; // önbellek kırıcı (css/js değişince artır)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const tel = (p = primaryPhone) => `tel:${p.tel}`;
const BIZ_ID = abs('/#isletme');
const OG = '/assets/img/og-hasbey-karo-mermer.jpg';
const nn = (i) => String(i + 1).padStart(2, '0');
const lower = (s) => s.toLocaleLowerCase('tr');

// Hizmet kartlarında (kemer) kullanılan görsel: fotoğraf ya da taş dokusu
const ARCH = {
  'kirikkale-mezar-yapimi': { photo: 'traverten' },
  'kirikkale-mutfak-tezgahi': { tex: 'calacatta' },
  'kirikkale-karo-bordur-tasi': { tex: 'karo' },
  'kirikkale-andezit-bazalt-tas-kaplama': { tex: 'bazalt' },
  'kirikkale-basamak-merdiven-mermer': { tex: 'basamak' },
};
const SLAB = { beyaz: 'calacatta', gri: 'gri2', traverten: 'traverten2' }; // levha görünümünde daha geniş doku

// ---------- Küçük parçalar ----------
const img = (p, { sizes = '(max-width: 700px) 92vw, 460px', eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${p.src}-520.webp" srcset="${p.src}-520.webp 520w, ${p.src}.webp 960w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;

const eyebrow = (t, light = false) => `<p class="eyebrow${light ? ' eyebrow--light' : ''}"><span class="eyebrow__line" aria-hidden="true"></span>${t}</p>`;

const sh = ({ tag, title, text = '', light = false, center = false, link = '' }) => `<header class="sh${center ? ' sh--center' : ''} reveal">
  <div class="sh__main">
    ${eyebrow(tag, light)}
    <h2 class="h2">${title}</h2>
  </div>
  ${text || link ? `<div class="sh__side">${text ? `<p>${text}</p>` : ''}${link}</div>` : ''}
</header>`;

const arch = (html, { cls = '', outline = false, cap = '' } = {}) =>
  `<figure class="arch${outline ? ' arch--outline' : ''}${cls ? ' ' + cls : ''}"><div class="arch__img">${html}</div>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;

const btn = (cls, href, text, ic = 'arrow', ext = false) =>
  `<a class="btn ${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${ic === 'phone' || ic === 'whatsapp' ? icon(ic) : ''}<span>${text}</span>${ic === 'arrow' ? icon('arrow') : ''}</a>`;
const quoteBtn = (cls = 'btn--brass', text = 'Teklif alın') => btn(cls, '/iletisim/#teklif', text);
const callBtn = (cls = 'btn--line') => btn(cls, tel(), primaryPhone.display, 'phone');
const waBtn = (cls = 'btn--line', text) => btn(cls, waLink(text), "WhatsApp'tan yazın", 'whatsapp', true);

const archVisual = (s, eager = false) => {
  const a = ARCH[s.slug];
  return a.photo ? img(photos[a.photo], { sizes: '(max-width: 700px) 70vw, 300px', eager }) : swatch(a.tex, 'a', 'swatch', eager);
};
const heroVisual = (s) => (s.hero ? img(photos[s.hero], { eager: true, sizes: '(max-width: 900px) 80vw, 440px' }) : swatch(s.swatch, 'p', 'swatch', true));

const crumbs = (items) => `<nav class="crumbs" aria-label="Sayfa yolu">${items.map(([name, href], i) =>
  (i === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${href}">${name}</a><span class="crumbs__sep" aria-hidden="true">/</span>`)).join('')}</nav>`;

// Dönen logo rozeti
const badge = () => `<div class="badge" aria-hidden="true">
  <svg class="badge__ring" viewBox="0 0 200 200"><defs><path id="rozet" d="M100 100m-76 0a76 76 0 1 1 152 0a76 76 0 1 1-152 0"/></defs><text><textPath href="#rozet" textLength="474">HASBEY KARO MERMER · KIRIKKALE · 71 · </textPath></text></svg>
  ${plaque('bd')}
</div>`;

// ---------- Baş ----------
function head({ title, description, path, schema = [], preload = '' }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0b0c0c">
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
<link rel="preload" href="/assets/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-sans-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${preload}${schema.map(ld).join('\n')}
</head>`;
}

// ---------- Üst bölüm ----------
function header(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const inSvc = services.some((s) => s.slug === active);
  return `<header class="site-header" data-header>
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
                ${eyebrow('Hizmetlerimiz')}
                <p class="mega__lead">Taşla ilgili her iş, <em>tek elden.</em></p>
                <a class="link" href="/#hizmetler">Tüm hizmetler${icon('arrow')}</a>
              </div>
              <ul class="mega__list">
                ${services.map((s, i) => `<li><a href="/${s.slug}/"${cur(s.slug)}><span class="mega__img">${archVisual(s)}</span><span class="mega__txt"><span class="mega__no">${nn(i)}</span><b>${s.nav}</b><small>${s.kicker}</small></span></a></li>`).join('')}
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
      <a class="hcall" href="${tel()}">${icon('phone')}<span>${primaryPhone.display}</span></a>
      <a class="btn btn--brass btn--sm" href="/iletisim/#teklif"><span>Teklif alın</span></a>
    </div>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç"><span></span><span></span></button>
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
      ${eyebrow('Hizmetler')}
      <ul class="mnav__svc">${services.map((s, i) => `<li><a href="/${s.slug}/"><span>${nn(i)}</span>${s.nav}</a></li>`).join('')}</ul>
      <div class="mnav__contact">
        ${site.phones.map((p) => `<a href="${tel(p)}"><b>${p.display}</b><small>${p.name}</small></a>`).join('')}
      </div>
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
      <p class="footer__statement">Taşla ilgili her iş,<br><em>tek elden.</em></p>
      <div class="footer__cta">
        <a class="footer__phone" href="${tel()}">${primaryPhone.display}</a>
        <div class="footer__btns">${waBtn('btn--light-line btn--sm')}${quoteBtn('btn--brass btn--sm', 'Teklif formu')}</div>
      </div>
    </div>
    <div class="footer__grid">
      <div class="footer__brand">
        ${brand('fb')}
        <p>Kırıkkale'de mezar yapımı, mutfak tezgahı, karo ve bordür taşı, andezit, basamak ve inşaat mermer işleri.</p>
      </div>
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
    </div>
    <p class="footer__word" aria-hidden="true">Hasbey</p>
    <div class="footer__bottom">
      <p>© ${year} ${site.name}. Tüm hakları saklıdır.</p>
      <p>${districts.map((d) => (d === 'Merkez' ? 'Kırıkkale' : d)).join(' · ')}</p>
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
const marquee = () => {
  const words = ['Mermer', 'Granit', 'Traverten', 'Andezit', 'Bazalt', 'Karo', 'Basamak', 'Mezar', 'Tezgah'];
  const row = words.map((w) => `<span>${w}</span><i></i>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${row}${row}</div></div>`;
};

const colonnade = ({ exclude = null, tag = 'Hizmetlerimiz', title = 'Taşla ilgili <em>her iş</em>', text = "Mezardan mutfağa, bahçeden merdivene kadar Kırıkkale'de yaptığımız işler.", id = 'hizmetler' } = {}) => {
  const list = services.filter((s) => s.slug !== exclude);
  return `<section class="section section--nero" id="${id}">
  <div class="container">
    ${sh({ tag, title, text, light: true })}
    <ul class="colonnade colonnade--n${list.length}">
      ${list.map((s, i) => `<li class="col reveal" style="--d:${i}">
        <a href="/${s.slug}/">
          ${arch(archVisual(s))}
          <span class="col__no">${nn(services.indexOf(s))}</span>
          <h3 class="col__title">${s.nav}</h3>
          <p class="col__desc">${s.card}</p>
          <span class="col__more">İncele${icon('arrow')}</span>
        </a>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
};

const slabsBlock = () => `<section class="section section--ivory" id="malzemeler">
  <div class="container">
    ${sh({ tag: 'Malzeme koleksiyonu', title: 'Her işe <em>doğru taş</em>', text: 'Taşın seçimi işin hem görünüşünü hem ömrünü belirler. En çok çalıştığımız taşlar ve kullanıldıkları yerler:' })}
    <ul class="slabs">
      ${materials.map((m, i) => `<li class="slab reveal" style="--d:${i % 6}">
        <div class="slab__img">${swatch(SLAB[m.key] || m.key, 's' + i)}</div>
        <h3 class="slab__name">${m.name}</h3>
        <p class="slab__text">${m.text}</p>
        <p class="slab__use">${m.use.join(' · ')}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const worksGrid = (list) => {
  const insta = list.length !== 5;
  return `<div class="works works--n${list.length}">
  ${list.map((p, i) => `<figure class="work${i === 0 ? ' work--lead' : ''} reveal" style="--d:${i % 3}">
    <button type="button" class="gallery__btn" data-full="${p.src}.webp" data-cap="${esc(p.cap)}" aria-label="${esc(p.cap)} fotoğrafını büyüt">
      ${img(p, { sizes: i === 0 ? '(max-width: 700px) 92vw, 520px' : '(max-width: 700px) 92vw, 400px' })}
      <span class="work__zoom">${icon('expand')}</span>
    </button>
    <figcaption><span>${p.tag} · Kırıkkale</span>${p.cap}</figcaption>
  </figure>`).join('')}
  ${insta ? `<a class="work work--insta reveal" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}<b>Güncel işlerimiz <em>Instagram'da</em></b><small>${site.instagramHandle}</small></a>` : ''}
</div>`;
};

const projectsBlock = ({ list = gallery, tag = 'Projeler', title = 'Son <em>işlerimizden</em>', more = true } = {}) => `<section class="section section--nero" id="projeler">
  <div class="container">
    ${sh({ tag, title, text: "Kırıkkale'de tamamladığımız işlerden birkaçı. Güncel çalışmalarımızı Instagram'da paylaşıyoruz.", light: true, link: more ? `<a class="link link--light" href="/projeler/">Tüm projeler${icon('arrow')}</a>` : '' })}
    ${worksGrid(list)}
    ${list.length === 5 ? `<p class="works__insta reveal"><a class="link link--light" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}${site.instagramHandle} · Instagram'da tüm işlerimiz${icon('arrow')}</a></p>` : ''}
  </div>
</section>`;

const processBlock = () => `<section class="section section--ivory">
  <div class="container">
    ${sh({ tag: 'Çalışma şeklimiz', title: 'Keşiften teslime <em>dört adım</em>', text: 'Her işte aynı düzenle ilerliyoruz; ne zaman, neyin yapılacağını baştan bilirsiniz.' })}
    <ol class="steps">
      ${steps.map((s, i) => `<li class="step reveal" style="--d:${i}"><span class="step__no">${nn(i)}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const areaBlock = () => `<section class="section section--ivory area">
  <div class="container area__in reveal">
    ${eyebrow('Hizmet bölgemiz')}
    <h2 class="h2">Kırıkkale'nin <em>dokuz ilçesinde</em></h2>
    <ul class="area__list">${districts.map((d) => `<li>${d === 'Merkez' ? 'Kırıkkale Merkez' : d}</li>`).join('')}</ul>
    <p class="area__text">Mezar, mutfak tezgahı, karo, bordür taşı, andezit ve basamak işleri için keşfe geliyoruz. İşin yerini söylemeniz yeterli.</p>
    ${callBtn('btn--line')}
  </div>
</section>`;

const faqBlock = (list, { title = 'Sık sorulan <em>sorular</em>', id = 'sss' } = {}) => `<section class="section section--ivory" id="${id}">
  <div class="container faq">
    <div class="faq__head reveal">
      ${eyebrow('Merak edilenler')}
      <h2 class="h2">${title}</h2>
      <p class="muted">Aklınıza takılan başka bir soru varsa arayın, hemen yanıtlayalım.</p>
      <a class="link" href="${tel()}">${primaryPhone.display}${icon('arrow')}</a>
    </div>
    <div class="faq__list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><span class="faq__q">${f.q}</span><span class="faq__ic" aria-hidden="true">${icon('plus')}</span></summary><div class="faq__a"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

const ctaBlock = (title = 'Projenizi <em>konuşalım</em>', text = "Fiyat bilgisi ve keşif için arayın. İşin fotoğrafını ve yaklaşık ölçüsünü WhatsApp'tan gönderirseniz ön bilgiyi hemen verelim.") => `<section class="cta">
  ${bgTex('calacatta')}
  <div class="container cta__in">
    <div class="cta__copy reveal">
      ${eyebrow('Teklif ve keşif')}
      <h2 class="cta__title">${title}</h2>
      <p>${text}</p>
      <div class="actions">${quoteBtn('btn--ink', 'Teklif formu')}${waBtn('btn--line')}</div>
    </div>
    <ul class="cta__phones reveal">
      ${site.phones.map((p) => `<li><a href="${tel(p)}"><small>${p.name}</small><b>${p.display}</b>${icon('ne')}</a></li>`).join('')}
    </ul>
  </div>
</section>`;

// İç sayfa başlığı (koyu mermer zemin)
const pageHero = ({ trail, kicker, h1, lead, actions = '', visual = '', spec = null, tex = 'nero' }) => `<section class="phero">
  ${bgTex(tex, true)}
  <div class="container phero__grid${visual ? '' : ' phero__grid--solo'}">
    <div class="phero__copy">
      ${crumbs(trail)}
      ${eyebrow(kicker, true)}
      <h1 class="phero__title">${h1}</h1>
      <p class="lead">${lead}</p>
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${visual ? `<div class="phero__visual">${visual}</div>` : ''}
  </div>
  ${spec ? `<div class="container"><dl class="spec">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>` : ''}
</section>`;

// ---------- Sayfalar ----------
function homePage() {
  const body = `
<section class="hero">
  ${bgTex('nero', true)}
  <div class="container hero__grid">
    <div class="hero__copy">
      ${eyebrow('Kırıkkale · Mermer · Mezar · Doğal taş', true)}
      <h1 class="hero__title">Kırıkkale'de <em>mermer</em> ve doğal taş ustalığı</h1>
      <p class="lead">Hasbey Karo Mermer; mezar yapımından mutfak tezgahına, karo ve bordür taşından andezit kaplamaya kadar taşla ilgili her işi ölçüden montaja tek ekiple yürütür.</p>
      <div class="actions">${quoteBtn()}${btn('btn--light-line', '/#hizmetler', 'Hizmetlerimiz')}</div>
    </div>
    <div class="hero__visual">
      ${arch(img(photos.traverten, { eager: true, sizes: '(max-width: 900px) 70vw, 420px' }), { outline: true, cap: 'Traverten aile mezarı · Kırıkkale' })}
      ${badge()}
    </div>
  </div>
  <div class="container hero__foot">
    <ul class="hero__facts">${facts.map((f) => `<li><b>${f.k}</b><span>${f.v}</span></li>`).join('')}</ul>
  </div>
</section>
${marquee()}

<section class="section section--ivory" id="hakkimizda">
  <div class="container about">
    <div class="about__media reveal">
      <div class="about__tex">${swatch('calacatta', 'ab', 'swatch')}</div>
      ${arch(img(photos.gri, { sizes: '(max-width: 900px) 64vw, 400px' }), { cls: 'about__arch' })}
      <figure class="about__sq">${img(photos.beyaz, { sizes: '(max-width: 900px) 42vw, 260px' })}</figure>
    </div>
    <div class="about__copy reveal">
      ${eyebrow('Hakkımızda')}
      <h2 class="h2">Taşı tanıyan, işini <em>yerinde</em> yapan bir ekip</h2>
      <p class="about__lead">${corporate.statement}</p>
      <p class="muted">${corporate.about[1]}</p>
      <ol class="tenets">
        ${corporate.principles.slice(0, 3).map((p, i) => `<li><span class="tenets__no">${['i', 'ii', 'iii'][i]}.</span><div><b>${p.t}</b><p>${p.d}</p></div></li>`).join('')}
      </ol>
      <a class="link" href="/kurumsal/">Kurumsal sayfamız${icon('arrow')}</a>
    </div>
  </div>
</section>

${colonnade()}
${projectsBlock()}
${slabsBlock()}
${processBlock()}
${areaBlock()}
${faqBlock(homeFaq)}
${ctaBlock()}`;

  return layout({
    key: 'home',
    path: '/',
    title: 'Kırıkkale Mermer, Mezar ve Karo İşleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mezar yapımı, mutfak tezgahı, karo imalatı, bordür taşı, andezit ve basamak işleri. Hasbey Karo Mermer'de ölçü, imalat ve montaj tek elden.",
    preload: `<link rel="preload" as="image" href="/assets/img/tex/nero.webp">\n<link rel="preload" as="image" href="${photos.traverten.src}-520.webp" imagesrcset="${photos.traverten.src}-520.webp 520w, ${photos.traverten.src}.webp 960w" imagesizes="(max-width: 900px) 70vw, 420px">\n`,
    schema: [graph(business(), website(), faqLd(homeFaq))],
    body,
  });
}

function corporatePage() {
  const body = `
${pageHero({
    trail: [['Anasayfa', '/'], ['Kurumsal', '/kurumsal/']],
    kicker: 'Kurumsal · Hakkımızda',
    h1: 'Hasbey Karo Mermer <em>hakkında</em>',
    lead: corporate.statement,
    actions: quoteBtn() + callBtn('btn--light-line'),
    visual: arch(img(photos.granit, { eager: true, sizes: '(max-width: 900px) 80vw, 420px' }), { outline: true, cap: 'Granit mezar · Kırıkkale' }),
    tex: 'verde',
  })}

<section class="section section--ivory">
  <div class="container split">
    <div class="prose reveal">
      ${eyebrow('Biz kimiz')}
      <h2 class="h2">Taşı tanıyan, işini <em>yerinde</em> yapan bir ekip</h2>
      ${corporate.about.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ''}>${p}</p>`).join('')}
    </div>
    <aside class="panel reveal" aria-label="Kimlerle çalışıyoruz">
      <h2 class="panel__title">Kimlerle <em>çalışıyoruz</em></h2>
      <ul class="panel__list">${corporate.clients.map((c) => `<li>${icon('check')}${c}</li>`).join('')}</ul>
      ${quoteBtn('btn--ink btn--block')}
    </aside>
  </div>
</section>

<section class="section section--ivory">
  <div class="container">
    ${sh({ tag: 'İlkelerimiz', title: 'Nasıl <em>çalışıyoruz</em>', text: 'Mezar da olsa merdiven de olsa, her iş aynı özeni hak eder.' })}
    <ul class="cells">
      ${corporate.principles.map((p, i) => `<li class="cell reveal" style="--d:${i % 3}"><span class="cell__no">${nn(i)}</span><h3>${p.t}</h3><p>${p.d}</p></li>`).join('')}
    </ul>
  </div>
</section>

${processBlock()}

<section class="section section--ivory">
  <div class="container">
    ${sh({ tag: 'İletişim kişileri', title: 'Doğrudan <em>ulaşın</em>', text: 'Aşağıdaki numaralardan bize doğrudan ulaşabilirsiniz. WhatsApp için ilk numarayı kullanın.' })}
    <ul class="people">
      ${site.phones.map((p, i) => `<li class="person reveal" style="--d:${i}"><a href="${tel(p)}"><span class="person__no">${nn(i)}</span><b class="person__name">${p.name}</b><span class="person__tel">${p.display}</span><span class="person__go">${icon('phone')}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

${areaBlock()}
${colonnade({ tag: 'Faaliyet alanları', title: 'Yaptığımız <em>işler</em>', text: 'Beş ana başlıkta topladığımız hizmetlerimizin her biri için ayrı bir sayfa hazırladık.', id: 'faaliyet' })}
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
  const gal = s.gallery.map((k) => photos[k]);
  const waText = `Merhaba, ${lower(s.nav)} için bilgi almak istiyorum.`;
  const cap = s.hero ? `${photos[s.hero].cap} · Kırıkkale` : s.kicker;

  const intro = `<section class="section section--ivory">
    <div class="container split">
      <div class="prose reveal">
        ${eyebrow('Hizmet hakkında')}
        <h2 class="h2">${s.introTitle}</h2>
        ${s.intro.map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ''}>${p}</p>`).join('')}
      </div>
      <aside class="panel reveal" aria-label="Fiyat ve keşif">
        <h2 class="panel__title">Fiyat ve <em>keşif</em></h2>
        <p>İşin fotoğrafını ve yaklaşık ölçüsünü gönderin, ön bilgiyi hemen verelim.</p>
        <a class="panel__phone" href="${tel()}"><small>${primaryPhone.name}</small><b>${primaryPhone.display}</b></a>
        ${waBtn('btn--ink btn--block', waText)}
        <ul class="panel__list">
          <li>${icon('check')}Kırıkkale merkez ve 8 ilçe</li>
          <li>${icon('check')}Yerinde ölçü ve keşif</li>
          <li>${icon('check')}Montaj kendi ekibimizle</li>
        </ul>
      </aside>
    </div>
  </section>`;

  const items = `<section class="section section--ivory">
    <div class="container">
      ${sh({ tag: 'Hizmet kapsamı', title: s.itemsTitle })}
      <ul class="cells">
        ${s.items.map((it, i) => `<li class="cell reveal" style="--d:${i % 3}"><span class="cell__no">${nn(i)}</span><h3>${it.t}</h3><p>${it.d}</p></li>`).join('')}
      </ul>
    </div>
  </section>`;

  const notes = s.notes ? `<section class="section section--ivory">
    <div class="container">
      ${sh({ tag: 'Bilmeniz gerekenler', title: s.notesTitle })}
      <ul class="notes">${s.notes.map((nt, i) => `<li class="note reveal" style="--d:${i}"><span class="note__no">${nn(i)}</span><h3>${nt.t}</h3><p>${nt.d}</p></li>`).join('')}</ul>
    </div>
  </section>` : '';

  const table = s.table ? `<section class="section section--ivory">
    <div class="container">
      ${sh({ tag: 'Karşılaştırma', title: s.table.title, text: 'Kısa bir özet. Kesin seçimi keşifte, kullanım alanınızı görerek birlikte yapıyoruz.' })}
      <div class="table-wrap reveal"><table class="table">
        <thead><tr>${s.table.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>` : '';

  const body = `
${pageHero({
    trail: [['Anasayfa', '/'], ['Hizmetler', '/#hizmetler'], [s.nav, path]],
    kicker: s.kicker,
    h1: s.h1,
    lead: s.lead,
    actions: quoteBtn() + waBtn('btn--light-line', waText),
    visual: arch(heroVisual(s), { outline: true, cap }),
    spec: [['Kapsam', s.kicker.replace(/ · /g, ', ')], ['Hizmet bölgesi', 'Kırıkkale merkez ve 8 ilçe'], ['Süreç', 'Keşif · Ölçü · İmalat · Montaj']],
    tex: idx % 2 ? 'verde' : 'nero',
  })}
${intro}${items}${notes}${table}
${faqBlock(s.faq, { title: `${s.nav} hakkında <em>sorular</em>` })}
${gal.length ? projectsBlock({ list: gal, tag: 'Projeler', title: 'Yaptığımız <em>işlerden</em>', more: true }) : ''}
${colonnade({ exclude: s.slug, tag: 'Diğer hizmetler', title: 'Bunlar da <em>ilginizi</em> çekebilir', text: '', id: 'diger-hizmetler' })}
${ctaBlock(`${s.nav} için <em>teklif alın</em>`)}`;

  return layout({
    key: s.slug,
    path,
    title: s.title,
    description: s.description,
    preload: s.hero ? `<link rel="preload" as="image" href="${photos[s.hero].src}-520.webp" imagesrcset="${photos[s.hero].src}-520.webp 520w, ${photos[s.hero].src}.webp 960w" imagesizes="(max-width: 900px) 80vw, 440px">\n` : '',
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
    h1: 'Kırıkkale mermer ve mezar <em>projelerimiz</em>',
    lead: "Kırıkkale'de yaptığımız mezar, mutfak ve taş işlerinden örnekler. Fotoğrafa dokunarak büyütebilirsiniz.",
    actions: quoteBtn() + callBtn('btn--light-line'),
  })}
${projectsBlock({ tag: 'Galeri', title: 'Tamamlanan <em>işler</em>', more: false })}
${colonnade({ tag: 'Hizmetler', title: 'Hangi işi <em>yaptırmak</em> istiyorsunuz?', text: 'Hizmet sayfalarında malzeme seçeneklerini, süreci ve sık sorulan soruları bulabilirsiniz.' })}
${ctaBlock('Sizin işiniz de <em>burada</em> olsun')}`;
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
    h1: 'İletişim ve <em>teklif</em>',
    lead: "Fiyat bilgisi, keşif randevusu ya da aklınıza takılan bir soru için doğrudan arayın, WhatsApp'tan yazın veya teklif formunu doldurun.",
    tex: 'verde',
  })}
<section class="section section--ivory">
  <div class="container contact">
    <div class="contact__info reveal">
      ${eyebrow('Doğrudan iletişim')}
      <ul class="channels">
        ${site.phones.map((p) => `<li><a href="${tel(p)}"><span class="channels__k">Telefon · ${p.name}</span><b>${p.display}</b>${icon('ne')}</a></li>`).join('')}
        <li><a href="${waLink()}" target="_blank" rel="noopener"><span class="channels__k">WhatsApp</span><b>Mesaj gönderin</b>${icon('ne')}</a></li>
        <li><a href="${site.instagram}" target="_blank" rel="noopener"><span class="channels__k">Instagram</span><b>${site.instagramHandle}</b>${icon('ne')}</a></li>
        <li><div><span class="channels__k">Hizmet bölgesi</span><b>Kırıkkale · Merkez ve 8 ilçe</b></div></li>
      </ul>
    </div>
    <form class="qform reveal" id="teklif" action="https://wa.me/${site.whatsapp}" method="get" target="_blank" data-wa="${site.whatsapp}">
      ${eyebrow('Teklif formu')}
      <h2 class="qform__title">Teklif <em>isteyin</em></h2>
      <p class="muted">Formu doldurun, mesajınız WhatsApp'ta hazır açılsın. Bilgileriniz bize ancak siz WhatsApp'ta gönder'e bastığınızda ulaşır.</p>
      <div class="qform__row">
        <label class="field"><span>Adınız</span><input id="q-ad" type="text" autocomplete="name" placeholder="Ad Soyad"></label>
        <label class="field"><span>İlçe</span><select id="q-ilce">${districts.map((d) => `<option>${d === 'Merkez' ? 'Kırıkkale Merkez' : d}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Hizmet</span><select id="q-hizmet">${services.map((s) => `<option>${s.nav}</option>`).join('')}<option>Diğer</option></select></label>
      <label class="field"><span>Mesajınız</span><textarea id="q-mesaj" name="text" rows="5" required placeholder="Örneğin: 2 kişilik granit mezar, yaklaşık ölçüler 2 × 1,8 m"></textarea></label>
      <button class="btn btn--ink btn--block" type="submit">${icon('whatsapp')}<span>WhatsApp ile gönder</span></button>
    </form>
  </div>
</section>
${processBlock()}
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
<section class="phero phero--404">
  ${bgTex('nero', true)}
  <div class="container phero__grid phero__grid--solo">
    <div class="phero__copy">
      ${eyebrow('Hata 404', true)}
      <h1 class="phero__title">Aradığınız sayfa <em>bulunamadı</em></h1>
      <p class="lead">Sayfa taşınmış ya da hiç var olmamış olabilir. Ana sayfaya dönebilir ya da bizi doğrudan arayabilirsiniz.</p>
      <div class="actions">${btn('btn--brass', '/', 'Ana sayfaya dön')}${callBtn('btn--light-line')}</div>
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
  background_color: '#0b0c0c', theme_color: '#0b0c0c',
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
  '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2',
  '@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-normal.woff2',
  '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
  '@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-italic.woff2',
  '@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2',
  '@fontsource-variable/instrument-sans/files/instrument-sans-latin-ext-standard-normal.woff2',
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
