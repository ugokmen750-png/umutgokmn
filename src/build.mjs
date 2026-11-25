// Statik site üretici: node src/build.mjs → public/
// Tema v4 "Atölye" (2026-11-25): kireçtaşı zemin, kömür grisi yazı, ölçülü kiremit vurgu; Schibsted Grotesk.
// Gerçek iş fotoğrafları önde, düz cümle başlıklar, az efekt. (Önceki temalar: .backups/)
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, base, districts, primaryPhone, waLink } from './config.mjs';
import { services, photos, gallery, materials, process as steps, homeFaq, corporate } from './content.mjs';
import { brand, icon, swatch } from './svg.mjs';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));
const V = '14'; // önbellek kırıcı (css/js değişince artır)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const tel = (p = primaryPhone) => `tel:${p.tel}`;
const BIZ_ID = abs('/#isletme');
const OG = '/assets/img/og-hasbey-karo-mermer.jpg';
const lower = (s) => s.toLocaleLowerCase('tr');

// Fotoğrafı olmayan hizmetlerde malzemenin kendi yüzeyi gösterilir
const SVC_TEX = {
  'kirikkale-karo-bordur-tasi': { tex: 'karo', cap: 'Karo ve bordür' },
  'kirikkale-andezit-bazalt-tas-kaplama': { tex: 'bazalt', cap: 'Patinatolu bazalt yüzey' },
  'kirikkale-basamak-merdiven-mermer': { tex: 'gri2', cap: 'Gri mermer yüzey' },
};
// Ana sayfada giriş fotoğrafı tekrar etmesin diye kartta farklı fotoğraf
const CARD_PHOTO = { 'kirikkale-mezar-yapimi': 'granit' };
const SWATCH = { beyaz: 'calacatta', gri: 'gri2', traverten: 'traverten2' };

// ---------- Küçük parçalar ----------
const img = (p, { sizes = '(max-width: 700px) 92vw, 460px', eager = false } = {}) =>
  `<img src="${p.src}-520.webp" srcset="${p.src}-520.webp 520w, ${p.src}.webp 960w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;

const svcImage = (s, { sizes = '(max-width: 700px) 92vw, 420px', eager = false } = {}) =>
  (s.hero ? img(photos[s.hero], { sizes, eager }) : swatch(SVC_TEX[s.slug].tex, 'v', 'swatch', eager));
const svcCaption = (s) => (s.hero ? `${photos[s.hero].cap}, Kırıkkale` : SVC_TEX[s.slug].cap);

const btn = (cls, href, text, { ic = '', ext = false } = {}) =>
  `<a class="btn ${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${ic ? icon(ic) : ''}<span>${text}</span></a>`;
const waBtn = (cls = 'btn--dark', text = "WhatsApp'tan yazın", msg) => btn(cls, waLink(msg), text, { ic: 'whatsapp', ext: true });
const callBtn = (cls = 'btn--line') => btn(cls, tel(), primaryPhone.display, { ic: 'phone' });

const head2 = (title, text = '', extra = '') => `<div class="head">
  <h2>${title}</h2>
  ${text ? `<p>${text}</p>` : ''}${extra}
</div>`;

const crumbs = (items) => `<nav class="crumbs" aria-label="Sayfa yolu">${items.map(([name, href], i) =>
  (i === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${href}">${name}</a><span aria-hidden="true">›</span>`)).join('')}</nav>`;

// ---------- Baş ----------
function head({ title, description, path, schema = [], preload = '' }) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#eeebe5">
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
<link rel="preload" href="/assets/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${preload}${schema.map(ld).join('\n')}
</head>`;
}

// ---------- Üst bölüm ----------
function header(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const inSvc = services.some((s) => s.slug === active);
  return `<header class="site-header" data-header>
  <div class="wrap site-header__in">
    ${brand('hb')}
    <nav class="nav" aria-label="Ana menü">
      <ul class="nav__list">
        <li class="nav__drop">
          <button class="nav__btn" type="button" aria-expanded="false" aria-controls="menu-hizmetler"${inSvc ? ' data-active' : ''}>Hizmetler${icon('chevron')}</button>
          <ul class="dropdown" id="menu-hizmetler">
            ${services.map((s) => `<li><a href="/${s.slug}/"${cur(s.slug)}><b>${s.nav}</b><small>${s.kicker}</small></a></li>`).join('')}
          </ul>
        </li>
        <li><a href="/projeler/"${cur('projeler')}>Projeler</a></li>
        <li><a href="/kurumsal/"${cur('kurumsal')}>Hakkımızda</a></li>
        <li><a href="/iletisim/"${cur('iletisim')}>İletişim</a></li>
      </ul>
    </nav>
    <div class="site-header__cta">
      <a class="hphone" href="${tel()}">${icon('phone')}<span>${primaryPhone.display}</span></a>
      ${waBtn('btn--dark btn--sm', 'WhatsApp')}
    </div>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç">${icon('menu', 'i i--open')}${icon('close', 'i i--close')}</button>
  </div>
  <div class="mnav" id="mobil-menu" hidden>
    <div class="wrap mnav__in">
      <p class="mnav__label">Hizmetler</p>
      <ul class="mnav__list">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
      <ul class="mnav__list mnav__list--main">
        <li><a href="/">Anasayfa</a></li>
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/kurumsal/">Hakkımızda</a></li>
        <li><a href="/iletisim/">İletişim</a></li>
      </ul>
      <div class="mnav__phones">
        ${site.phones.map((p) => `<a href="${tel(p)}"><b>${p.display}</b><span>${p.name}</span></a>`).join('')}
      </div>
    </div>
  </div>
</header>`;
}

// ---------- Alt bölüm ----------
function footer() {
  const year = site.lastmod.slice(0, 4);
  return `<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      ${brand('fb')}
      <p>Kırıkkale'de mezar, mermer, granit, karo, bordür taşı, andezit ve basamak işleri.</p>
      <a class="footer__insta" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}${site.instagramHandle}</a>
    </div>
    <div>
      <h2 class="footer__title">Hizmetler</h2>
      <ul class="footer__links">${services.map((s) => `<li><a href="/${s.slug}/">${s.nav}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer__title">Telefon</h2>
      <ul class="footer__links footer__phones">
        ${site.phones.map((p) => `<li><a href="${tel(p)}">${p.display}</a><span>${p.name}</span></li>`).join('')}
      </ul>
    </div>
    <div>
      <h2 class="footer__title">Hizmet verdiğimiz yerler</h2>
      <p class="footer__area">${districts.map((d) => (d === 'Merkez' ? 'Kırıkkale Merkez' : d)).join(', ')}</p>
      <ul class="footer__links footer__small">
        <li><a href="/kurumsal/">Hakkımızda</a></li>
        <li><a href="/projeler/">Projeler</a></li>
        <li><a href="/iletisim/">İletişim ve teklif</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer__bottom">
    <p>© ${year} ${site.name}</p>
    <p>Kırıkkale</p>
  </div>
</footer>`;
}

const mobileBar = () => `<div class="actionbar" aria-label="Hızlı iletişim">
  <a href="${tel()}" class="actionbar__call">${icon('phone')}<span>Ara</span></a>
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
const servicesBlock = ({ exclude = null, title = 'Yaptığımız işler', text = "Kırıkkale'de en çok yaptığımız işler bunlar. Her birinin sayfasında malzeme seçenekleri ve sık sorulan sorular var.", extra = true } = {}) => {
  const list = services.filter((s) => s.slug !== exclude);
  return `<section class="block" id="hizmetler">
  <div class="wrap">
    ${head2(title, text)}
    <ul class="cards">
      ${list.map((s) => `<li class="card">
        <a href="/${s.slug}/">
          <span class="card__img">${CARD_PHOTO[s.slug] ? img(photos[CARD_PHOTO[s.slug]], { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' }) : svcImage(s, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' })}</span>
          <span class="card__body">
            <b class="card__title">${s.nav}</b>
            <span class="card__text">${s.card}</span>
            <span class="card__more">Detaylar ${icon('arrow')}</span>
          </span>
        </a>
      </li>`).join('')}
      ${extra ? `<li class="card card--note">
        <div class="card__body">
          <b class="card__title">Aradığınız iş listede yok mu?</b>
          <span class="card__text">Çeşme, havuz kenarı, şömine çevresi ya da ölçüye özel bir iş… Arayın, yapılıp yapılamayacağını konuşalım.</span>
          ${callBtn('btn--line btn--sm')}
        </div>
      </li>` : ''}
    </ul>
  </div>
</section>`;
};

const worksGrid = (list) => `<div class="works works--n${list.length}">
  ${list.map((p) => `<figure class="work">
    <button type="button" class="gallery__btn" data-full="${p.src}.webp" data-cap="${esc(p.cap)}" aria-label="${esc(p.cap)} fotoğrafını büyüt">
      ${img(p, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 440px' })}
    </button>
    <figcaption>${p.cap}<span>${p.tag}</span></figcaption>
  </figure>`).join('')}
</div>`;

const projectsBlock = ({ list = gallery, title = 'Son işlerimiz', more = true } = {}) => `<section class="block" id="projeler">
  <div class="wrap">
    ${head2(title, "Kırıkkale'de yaptığımız işlerden birkaçı. Fotoğrafa dokunup büyütebilirsiniz.", `<a class="textlink" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram')}Instagram'da daha fazlası</a>`)}
    ${worksGrid(list)}
    ${more ? `<p class="more"><a class="textlink" href="/projeler/">Tüm projeler ${icon('arrow')}</a></p>` : ''}
  </div>
</section>`;

const materialsBlock = () => `<section class="block" id="malzemeler">
  <div class="wrap">
    ${head2('Hangi taş nereye?', 'Taşı, kullanılacağı yere göre seçiyoruz. En çok çalıştığımız malzemeler:')}
    <ul class="mats">
      ${materials.map((m) => `<li class="mat">
        <span class="mat__sw">${swatch(SWATCH[m.key] || m.key, 'm')}</span>
        <span class="mat__body"><b>${m.name}</b><span>${m.text}</span><small>${m.use.join(', ')}</small></span>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const processBlock = () => `<section class="block">
  <div class="wrap">
    ${head2('Nasıl çalışıyoruz?', 'Her işte aynı sırayla ilerliyoruz; fiyatı ve teslim tarihini baştan konuşuyoruz.')}
    <ol class="steps">
      ${steps.map((s, i) => `<li class="step"><span class="step__n">${i + 1}</span><div><h3>${s.t}</h3><p>${s.d}</p></div></li>`).join('')}
    </ol>
  </div>
</section>`;

const teamBlock = (title = 'Bize doğrudan ulaşın') => `<section class="block">
  <div class="wrap">
    ${head2(title, 'Telefonu biz açıyoruz. WhatsApp için Uğur Bey\'in numarasını kullanabilirsiniz.')}
    <ul class="team">
      ${site.phones.map((p, i) => `<li class="person">
        <span class="person__name">${p.name}</span>
        <a class="person__tel" href="${tel(p)}">${p.display}</a>
        <span class="person__acts">${btn('btn--line btn--sm', tel(p), 'Ara', { ic: 'phone' })}${i === 0 ? waBtn('btn--dark btn--sm', 'WhatsApp') : ''}</span>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

const areaBlock = () => `<section class="block">
  <div class="wrap area">
    <h2>Hizmet verdiğimiz yerler</h2>
    <p>Kırıkkale merkezde ve ilçelerde çalışıyoruz. Keşif için işin yerini söylemeniz yeterli.</p>
    <ul class="chips">${districts.map((d) => `<li>${d === 'Merkez' ? 'Kırıkkale Merkez' : d}</li>`).join('')}</ul>
  </div>
</section>`;

const faqBlock = (list, { title = 'Sık sorulan sorular', id = 'sss' } = {}) => `<section class="block" id="${id}">
  <div class="wrap faq">
    <div class="faq__head">
      <h2>${title}</h2>
      <p>Sorunuz burada yoksa arayın: <a href="${tel()}">${primaryPhone.display}</a></p>
    </div>
    <div class="faq__list">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${f.q}${icon('plus', 'i faq__ic')}</summary><p>${f.a}</p></details>`).join('')}
    </div>
  </div>
</section>`;

const contactBox = (title = 'Fiyat almak için', text = "İşin fotoğrafını ve yaklaşık ölçüsünü WhatsApp'tan gönderin, ön bilgiyi hemen verelim. Kesin fiyatı yerinde ölçüden sonra söylüyoruz.", msg) => `<section class="block block--last">
  <div class="wrap">
    <div class="cbox">
      <div class="cbox__text">
        <h2>${title}</h2>
        <p>${text}</p>
        <div class="actions">${waBtn('btn--dark', "WhatsApp'tan yazın", msg)}${btn('btn--line', '/iletisim/#teklif', 'Teklif formu')}</div>
      </div>
      <ul class="cbox__phones">
        ${site.phones.map((p) => `<li><a href="${tel(p)}">${p.display}</a><span>${p.name}</span></li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;

const pageTop = ({ trail, h1, lead, actions = '', image = '', cap = '' }) => `<section class="ptop">
  <div class="wrap ptop__grid${image ? '' : ' ptop__grid--solo'}">
    <div class="ptop__text">
      ${crumbs(trail)}
      <h1>${h1}</h1>
      <p class="lead">${lead}</p>
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${image ? `<figure class="ptop__img"><div class="frame">${image}</div>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>` : ''}
  </div>
</section>`;

// ---------- Sayfalar ----------
function homePage() {
  const body = `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="hero__place">${icon('pin')}Kırıkkale</p>
      <h1>Kırıkkale'de mermer, mezar ve karo işleri</h1>
      <p class="lead">Mezar, mutfak tezgahı, karo, bordür taşı, andezit ve basamak işleri yapıyoruz. Ölçüyü yerinde alıyor, imalatı ve montajı kendi ekibimizle yapıyoruz.</p>
      <div class="actions">${waBtn('btn--dark', "WhatsApp'tan fiyat sorun")}${callBtn()}</div>
      <ul class="hero__points">
        <li>${icon('check')}Yerinde ölçü ve keşif</li>
        <li>${icon('check')}Montaj kendi ekibimizle</li>
        <li>${icon('check')}Merkez ve 8 ilçe</li>
      </ul>
    </div>
    <figure class="hero__img">
      <div class="frame">${img(photos.traverten, { eager: true, sizes: '(max-width: 900px) 92vw, 560px' })}</div>
      <figcaption>Traverten aile mezarı, Kırıkkale</figcaption>
      <a class="hero__call" href="${tel()}"><span>Hemen arayın</span><b>${primaryPhone.display}</b><small>${primaryPhone.name}</small></a>
    </figure>
  </div>
</section>

${servicesBlock()}
${projectsBlock()}

<section class="block" id="hakkimizda">
  <div class="wrap about">
    <figure class="about__img"><div class="frame">${img(photos.gri, { sizes: '(max-width: 900px) 92vw, 460px' })}</div><figcaption>Gri mermer mezar</figcaption></figure>
    <div class="about__text">
      <h2>İşi baştan sona kendimiz yapıyoruz</h2>
      <p class="lead">${corporate.statement}</p>
      <p>${corporate.about[1]}</p>
      <ul class="ticks">${corporate.principles.slice(0, 4).map((p) => `<li>${icon('check')}<span><b>${p.t}.</b> ${p.d}</span></li>`).join('')}</ul>
      <a class="textlink" href="/kurumsal/">Hakkımızda ${icon('arrow')}</a>
    </div>
  </div>
</section>

${materialsBlock()}
${processBlock()}
${teamBlock()}
${faqBlock(homeFaq)}
${areaBlock()}
${contactBox()}`;

  return layout({
    key: 'home',
    path: '/',
    title: 'Kırıkkale Mermer, Mezar ve Karo İşleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mezar yapımı, mutfak tezgahı, karo imalatı, bordür taşı, andezit ve basamak işleri. Hasbey Karo Mermer'de ölçü, imalat ve montaj tek elden.",
    preload: `<link rel="preload" as="image" href="${photos.traverten.src}-520.webp" imagesrcset="${photos.traverten.src}-520.webp 520w, ${photos.traverten.src}.webp 960w" imagesizes="(max-width: 900px) 92vw, 560px">\n`,
    schema: [graph(business(), website(), faqLd(homeFaq))],
    body,
  });
}

function corporatePage() {
  const body = `
${pageTop({
    trail: [['Anasayfa', '/'], ['Hakkımızda', '/kurumsal/']],
    h1: 'Hasbey Karo Mermer hakkında',
    lead: corporate.statement,
    actions: waBtn() + callBtn(),
    image: img(photos.granit, { eager: true, sizes: '(max-width: 900px) 92vw, 520px' }),
    cap: 'Granit mezar, Kırıkkale',
  })}

<section class="block">
  <div class="wrap split">
    <div class="prose">
      <h2>Kimiz, nasıl çalışırız</h2>
      ${corporate.about.map((p) => `<p>${p}</p>`).join('')}
    </div>
    <aside class="side">
      <h3>Kimlerle çalışıyoruz</h3>
      <ul class="ticks">${corporate.clients.map((c) => `<li>${icon('check')}<span>${c}</span></li>`).join('')}</ul>
    </aside>
  </div>
</section>

<section class="block">
  <div class="wrap">
    ${head2('Dikkat ettiğimiz şeyler', 'Mezar da olsa merdiven de olsa, her işte aynı kurallarla çalışıyoruz.')}
    <ul class="points">
      ${corporate.principles.map((p) => `<li><h3>${p.t}</h3><p>${p.d}</p></li>`).join('')}
    </ul>
  </div>
</section>

${teamBlock()}
${servicesBlock({ title: 'Yaptığımız işler', extra: false })}
${areaBlock()}
${contactBox()}`;

  return layout({
    key: 'kurumsal',
    path: '/kurumsal/',
    title: 'Hakkımızda – Hasbey Karo Mermer | Kırıkkale',
    description: "Hasbey Karo Mermer; Kırıkkale'de mezar, mermer, granit, karo ve doğal taş işlerini yerinde ölçü, kendi imalatı ve kendi montaj ekibiyle yürüten yerel firma.",
    schema: [graph(
      business(),
      { '@type': 'AboutPage', name: 'Hasbey Karo Mermer hakkında', url: abs('/kurumsal/'), isPartOf: { '@id': abs('/#site') }, about: { '@id': BIZ_ID } },
      crumbsLd([['Anasayfa', '/'], ['Hakkımızda', '/kurumsal/']]),
    )],
    body,
  });
}

function servicePage(s) {
  const path = `/${s.slug}/`;
  const gal = s.gallery.map((k) => photos[k]);
  const waText = `Merhaba, ${lower(s.nav)} için bilgi almak istiyorum.`;

  const intro = `<section class="block">
    <div class="wrap split">
      <div class="prose">
        <h2>${s.introTitle}</h2>
        ${s.intro.map((p) => `<p>${p}</p>`).join('')}
      </div>
      <aside class="side side--sticky" aria-label="Fiyat ve keşif">
        <h3>Fiyat ve keşif</h3>
        <p>İşin fotoğrafını ve yaklaşık ölçüsünü gönderin, ön bilgiyi hemen verelim.</p>
        <a class="side__tel" href="${tel()}">${primaryPhone.display}</a>
        <span class="side__name">${primaryPhone.name}</span>
        ${waBtn('btn--dark btn--block', "WhatsApp'tan yazın", waText)}
      </aside>
    </div>
  </section>`;

  const items = `<section class="block">
    <div class="wrap">
      ${head2(s.itemsTitle)}
      <ul class="points">${s.items.map((it) => `<li><h3>${it.t}</h3><p>${it.d}</p></li>`).join('')}</ul>
    </div>
  </section>`;

  const notes = s.notes ? `<section class="block">
    <div class="wrap">
      <div class="notebox">
        <h2>${s.notesTitle}</h2>
        <ul class="notes">${s.notes.map((n) => `<li><h3>${n.t}</h3><p>${n.d}</p></li>`).join('')}</ul>
      </div>
    </div>
  </section>` : '';

  const table = s.table ? `<section class="block">
    <div class="wrap">
      ${head2(s.table.title, 'Kısa bir özet. Kesin seçimi keşifte, kullanım alanınızı görerek birlikte yapıyoruz.')}
      <div class="table-wrap"><table class="table">
        <thead><tr>${s.table.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>` : '';

  const body = `
${pageTop({
    trail: [['Anasayfa', '/'], ['Hizmetler', '/#hizmetler'], [s.nav, path]],
    h1: s.h1,
    lead: s.lead,
    actions: waBtn('btn--dark', "WhatsApp'tan yazın", waText) + callBtn(),
    image: svcImage(s, { eager: true, sizes: '(max-width: 900px) 92vw, 520px' }),
    cap: svcCaption(s),
  })}
${intro}${items}${notes}${table}
${gal.length ? projectsBlock({ list: gal, title: 'Yaptığımız işlerden', more: true }) : ''}
${faqBlock(s.faq, { title: `${s.nav} hakkında sorular` })}
${servicesBlock({ exclude: s.slug, title: 'Diğer işlerimiz', text: '', extra: false })}
${contactBox(`${s.nav} için fiyat alın`, undefined, waText)}`;

  return layout({
    key: s.slug,
    path,
    title: s.title,
    description: s.description,
    preload: s.hero ? `<link rel="preload" as="image" href="${photos[s.hero].src}-520.webp" imagesrcset="${photos[s.hero].src}-520.webp 520w, ${photos[s.hero].src}.webp 960w" imagesizes="(max-width: 900px) 92vw, 520px">\n` : '',
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
${pageTop({
    trail: [['Anasayfa', '/'], ['Projeler', '/projeler/']],
    h1: 'Kırıkkale mermer ve mezar projelerimiz',
    lead: "Kırıkkale'de yaptığımız mezar, mutfak ve taş işlerinden örnekler. Güncel işlerimizi Instagram'da paylaşıyoruz.",
    actions: waBtn() + btn('btn--line', site.instagram, site.instagramHandle, { ic: 'instagram', ext: true }),
  })}
${projectsBlock({ title: 'Tamamlanan işler', more: false })}
${servicesBlock({ title: 'Hangi işi yaptırmak istiyorsunuz?', text: 'Hizmet sayfalarında malzeme seçeneklerini ve sık sorulan soruları bulabilirsiniz.', extra: false })}
${contactBox()}`;
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
${pageTop({
    trail: [['Anasayfa', '/'], ['İletişim', '/iletisim/']],
    h1: 'İletişim ve teklif',
    lead: "Fiyat bilgisi, keşif randevusu ya da aklınıza takılan bir soru için arayın, WhatsApp'tan yazın veya aşağıdaki formu doldurun.",
  })}
<section class="block">
  <div class="wrap contact">
    <div class="contact__info">
      <h2>Telefon</h2>
      <ul class="lines">
        ${site.phones.map((p) => `<li><a href="${tel(p)}">${p.display}</a><span>${p.name}</span></li>`).join('')}
      </ul>
      <h2>WhatsApp ve Instagram</h2>
      <ul class="lines">
        <li><a href="${waLink()}" target="_blank" rel="noopener">${primaryPhone.display}</a><span>WhatsApp, ${primaryPhone.name}</span></li>
        <li><a href="${site.instagram}" target="_blank" rel="noopener">${site.instagramHandle}</a><span>Instagram</span></li>
      </ul>
      <h2>Bölge</h2>
      <p>Kırıkkale Merkez, ${districts.filter((d) => d !== 'Merkez').join(', ')}.</p>
    </div>
    <form class="qform" id="teklif" action="https://wa.me/${site.whatsapp}" method="get" target="_blank" data-wa="${site.whatsapp}">
      <h2>Teklif formu</h2>
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
${pageTop({
    trail: [['Anasayfa', '/'], ['Sayfa bulunamadı', '/404.html']],
    h1: 'Aradığınız sayfa bulunamadı',
    lead: 'Sayfa taşınmış ya da hiç var olmamış olabilir. Ana sayfaya dönebilir ya da bizi doğrudan arayabilirsiniz.',
    actions: btn('btn--dark', '/', 'Ana sayfaya dön') + callBtn(),
  })}`;
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
  background_color: '#eeebe5', theme_color: '#eeebe5',
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

// Yazı tipi (OFL) node_modules'tan siteye kopyalanır; eski tema dosyaları temizlenir
const FONTS = [
  '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2',
  '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-ext-wght-normal.woff2',
];
await rm(OUT + 'assets/fonts', { recursive: true, force: true });
await mkdir(OUT + 'assets/fonts', { recursive: true });
for (const f of FONTS) await copyFile(fileURLToPath(new URL('../node_modules/' + f, import.meta.url)), OUT + 'assets/fonts/' + f.split('/').pop());

await put('index.html', homePage());
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
console.log(`Derlendi → ${OUT} (${services.length + 5} sayfa)${base ? `, alt klasör: ${base}` : ''}`);
