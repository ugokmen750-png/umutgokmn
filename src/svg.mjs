// SVG yardımcıları: logo, ikonlar ve SVG filtreleriyle üretilen taş dokuları (görsel dosyası gerektirmez).

const GOLD = ['#e8d29c', '#b8914d', '#e0c283'];

// Logodaki "H": sol gövde altın, sağ gövde koyu, altın kavisli ara çizgi
export const hPaths = (gold, dark) => `
  <path fill="${gold}" d="M20 14h20v4h-5v64h5v4H20v-4h5V18h-5z"/>
  <path fill="${dark}" d="M60 14h20v4h-5v64h5v4H60v-4h5V18h-5z"/>
  <path fill="${gold}" d="M5 61C29 47 61 40 97 44C66 45 36 52 8 65Z"/>`;

const goldGrad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${GOLD[0]}"/><stop offset=".5" stop-color="${GOLD[1]}"/><stop offset="1" stop-color="${GOLD[2]}"/></linearGradient>`;

// Logodaki tabela biçimi: üstü V kesikli baklava
export const PLAQUE_PATH = 'M50 97L3 52L27 7L50 22L73 7L97 52Z';

export const plaque = (uid) => `<svg class="plaque" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <defs>${goldGrad(uid + 'g')}</defs>
  <path d="${PLAQUE_PATH}" fill="#f5f2ec" stroke="url(#${uid}g)" stroke-width="3.2"/>
  <g transform="translate(29 34) scale(.42)">${hPaths(`url(#${uid}g)`, '#161616')}</g>
</svg>`;

export const brand = (uid, tag = 'a') => `<${tag} class="brand"${tag === 'a' ? ' href="/" aria-label="Hasbey Karo Mermer ana sayfa"' : ''}>
  ${plaque(uid)}
  <span class="brand__text"><span class="brand__name">HASBEY</span><span class="brand__sub">KARO MERMER</span></span>
</${tag}>`;

// ---------- İkonlar (24x24, çizgi) ----------
const P = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  whatsapp: '<path d="M20.5 11.8a8.6 8.6 0 0 1-12.7 7.5L3.5 20.5l1.3-4.1a8.6 8.6 0 1 1 15.7-4.6z"/><path fill="currentColor" stroke="none" d="M9.1 7.9c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.4.1.5 0l.6-.6c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4v.5c0 .3-.1.6-.5.8-.6.4-1.5.6-2.3.4a7.4 7.4 0 0 1-5.4-5.3c-.2-.8 0-1.6.4-2.4z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M20 10c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M3 7h18M3 12h18M3 17h18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  truck: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
};
export const icon = (name, cls = 'i') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name]}</svg>`;

// ---------- Taş dokuları ----------
// Dokular src/textures.mjs ile bir kez WebP olarak üretilir; tarayıcı filtre hesaplamaz.
const TEX = '/assets/img/tex/';
const RASTER = new Set(['beyaz', 'gri', 'traverten', 'granit', 'andezit', 'bazalt', 'koyu']);
const texImg = (kind, cls, eager) =>
  `<img class="${cls}" src="${TEX}${kind}.webp" alt="" width="600" height="600" decoding="async"${eager ? '' : ' loading="lazy"'}>`;

// Deterministik sözde rastgele (karo renkleri her derlemede aynı kalsın)
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const karoArt = () => {
  const r = rng(71); const tones = ['#a9a39b', '#b8b1a7', '#9c968e', '#c2bbb0', '#8f8a83'];
  let tiles = '';
  const s = 96, g = 5;
  for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) {
    const off = y % 2 ? -s / 2 : 0;
    tiles += `<rect x="${x * (s + g) + off}" y="${y * (s + g) - 30}" width="${s}" height="${s}" fill="${tones[Math.floor(r() * tones.length)]}"/>`;
  }
  return `<rect width="400" height="400" fill="#6f6a64"/>${tiles}
    <image href="${TEX}andezit.webp" width="400" height="400" preserveAspectRatio="xMidYMid slice" opacity=".5" style="mix-blend-mode:multiply"/>
    <rect y="352" width="400" height="48" fill="#5d5853"/><rect y="352" width="400" height="7" fill="#837c74"/>
    <path d="M0 359H400" stroke="#c3a061" stroke-width="1.2" opacity=".7"/>`;
};

const basamakArt = () => {
  let steps = '';
  for (let i = 0; i < 6; i++) {
    const x = i * 66, y = 400 - (i + 1) * 58;
    steps += `<path d="M${x} ${y}H400V${y + 58}H${x}Z" fill="#000" opacity="${0.035 + i * 0.008}"/>`;
    steps += `<path d="M${x} ${y}H400" stroke="#ffffff" stroke-width="3" opacity=".75"/>`;
    steps += `<path d="M${x} ${y + 4}H400" stroke="#c3a061" stroke-width="1.1" opacity=".85"/>`;
    steps += `<path d="M${x} ${y}V${y + 58}" stroke="#6f6a63" stroke-width="1.2" opacity=".5"/>`;
  }
  return `<image href="${TEX}beyaz.webp" width="400" height="400" preserveAspectRatio="xMidYMid slice"/>${steps}`;
};

export const swatch = (kind, _uid, cls = 'swatch', eager = false) => {
  if (RASTER.has(kind)) return texImg(kind, cls, eager);
  const inner = kind === 'karo' ? karoArt() : basamakArt();
  return `<svg class="${cls}" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${inner}</svg>`;
};

// Koyu mermer zemin (hero, sayfa başlıkları ve koyu bölümler). Sayfa başındakiler hemen yüklenir.
export const marbleBg = (uid, eager = /^(hr|ph|pp|ip|nf)/.test(uid)) =>
  `<img class="marble-bg" src="${TEX}koyu.webp" alt="" width="1600" height="1000" decoding="async"${eager ? ' fetchpriority="low"' : ' loading="lazy"'}>`;
