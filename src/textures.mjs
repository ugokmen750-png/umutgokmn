// Taş dokularını bir kez üretir: node src/textures.mjs [ad ad …] → public/assets/img/tex/*.webp
// Ad verilirse yalnız o dokular üretilir (ör. node src/textures.mjs nero calacatta).
// Tarayıcıda SVG filtresi hesaplatmak yerine hazır resim kullanılır (mobilde hızlı).
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TMP = fileURLToPath(new URL('../kaynak/tex/', import.meta.url));
const OUT = fileURLToPath(new URL('../public/assets/img/tex/', import.meta.url));
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

// ---------- Tohumlu Perlin gürültüsü ----------
function makeNoise(seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const p = new Uint8Array(512);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const grad = (h, x, y) => { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const noise = (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const a = p[X] + Y, b = p[X + 1] + Y;
    return lerp(lerp(grad(p[a], x, y), grad(p[b], x - 1, y), u), lerp(grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1), u), v);
  };
  const fbm = (x, y, oct = 5, lac = 2, gain = 0.5) => {
    let sum = 0, amp = 1, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { sum += amp * noise(x * f, y * f); norm += amp; amp *= gain; f *= lac; }
    return sum / norm; // ~[-0.7, 0.7]
  };
  const turb = (x, y, oct = 5) => { let sum = 0, amp = 1, f = 1, norm = 0; for (let i = 0; i < oct; i++) { sum += amp * Math.abs(noise(x * f, y * f)); norm += amp; amp *= 0.5; f *= 2; } return sum / norm; };
  return { noise, fbm, turb, rnd };
}

// ---------- PNG yazıcı ----------
const crcTable = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

const ONLY = new Set(process.argv.slice(2));
function render(name, w, h, shade, quality = 72) {
  if (ONLY.size && !ONLY.has(name)) return;
  const rgb = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = shade(x, y);
    const i = (y * w + x) * 3;
    rgb[i] = Math.max(0, Math.min(255, c[0])); rgb[i + 1] = Math.max(0, Math.min(255, c[1])); rgb[i + 2] = Math.max(0, Math.min(255, c[2]));
  }
  const pngFile = TMP + name + '.png';
  writeFileSync(pngFile, png(w, h, rgb));
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', pngFile, '-c:v', 'libwebp', '-quality', String(quality), OUT + name + '.webp']);
  console.log('✓', name);
}

// Damar: sin(eksen + türbülans) sıfıra yaklaştıkça ince parlak çizgi
const vein = (n, x, y, { f, ang, warp, sharp, wf = f * 0.3, oct = 5 }) => {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const u = (x * ca + y * sa) * f;
  // alçak frekanslı akış + ince titreşim → uzun, dallanan damarlar
  const t = n.fbm(x * wf, y * wf, oct) * warp + n.fbm(x * f * 2.6 + 31, y * f * 2.6, 3) * 0.32;
  const s = Math.abs(Math.sin(u + t));
  return Math.pow(1 - s, sharp);
};

// ---------- Dokular ----------
// Koyu mermer (Nero Marquina benzeri) — hero ve koyu bölümler
{
  const n1 = makeNoise(71), n2 = makeNoise(19), n3 = makeNoise(5);
  const base = hex('#0e0e0f'), cloud = hex('#232326'), white = hex('#ebe6dd'), gold = hex('#c9a865');
  render('koyu', 1600, 1000, (x, y) => {
    const c = n3.fbm(x / 520, y / 420, 4);
    let col = mix(base, cloud, smooth(-0.25, 0.45, c));
    const v1 = vein(n1, x, y, { f: 1 / 300, ang: 0.62, warp: 3.4, sharp: 52 });
    const v1s = vein(n1, x, y, { f: 1 / 300, ang: 0.62, warp: 3.4, sharp: 8 });
    const v2 = vein(n2, x + 300, y, { f: 1 / 150, ang: -0.35, warp: 2.6, sharp: 80 }) * smooth(-0.1, 0.35, n3.fbm(x / 300 + 9, y / 300, 3));
    const v3 = vein(n2, x, y + 500, { f: 1 / 420, ang: 1.1, warp: 3, sharp: 70 });
    const v4 = vein(n3, x, y + 200, { f: 1 / 95, ang: 0.95, warp: 2.2, sharp: 110 }) * smooth(-0.05, 0.3, n1.fbm(x / 420 + 3, y / 420, 3));
    col = mix(col, white, clamp(v1 * 0.62 + v1s * 0.07 + v2 * 0.45 + v4 * 0.32));
    col = mix(col, gold, clamp(v3 * 0.38));
    return col;
  }, 68);
}

// Beyaz mermer
const whiteMarble = (name, seed) => {
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 7), n3 = makeNoise(seed + 13);
  const base = hex('#f3f0ea'), cloud = hex('#dcd6cc'), veinC = hex('#8b867f'), soft = hex('#c7c0b6');
  render(name, 600, 600, (x, y) => {
    let col = mix(base, cloud, smooth(-0.2, 0.55, n3.fbm(x / 260, y / 200, 4)) * 0.8);
    const v = vein(n1, x, y, { f: 1 / 130, ang: 0.8, warp: 3, sharp: 40 });
    const vs = vein(n1, x, y, { f: 1 / 130, ang: 0.8, warp: 3, sharp: 6 });
    const v2 = vein(n2, x, y, { f: 1 / 75, ang: -0.4, warp: 2.2, sharp: 70 }) * smooth(0, 0.4, n3.fbm(x / 150 + 4, y / 150, 3));
    col = mix(col, soft, clamp(vs * 0.35));
    col = mix(col, veinC, clamp(v * 0.75 + v2 * 0.5));
    return col;
  });
};
whiteMarble('beyaz', 11);

// Gri mermer
{
  const n1 = makeNoise(23), n2 = makeNoise(31), n3 = makeNoise(37);
  const base = hex('#8f9193'), dark = hex('#5e6064'), white = hex('#f0eee9');
  render('gri', 600, 600, (x, y) => {
    let col = mix(base, dark, smooth(-0.3, 0.5, n3.fbm(x / 220, y / 180, 4)));
    const v = vein(n1, x, y, { f: 1 / 120, ang: 0.55, warp: 3.2, sharp: 34 });
    const vs = vein(n1, x, y, { f: 1 / 120, ang: 0.55, warp: 3.2, sharp: 5 });
    const v2 = vein(n2, x, y, { f: 1 / 65, ang: -0.7, warp: 2.4, sharp: 65 });
    col = mix(col, white, clamp(v * 0.85 + vs * 0.12 + v2 * 0.4));
    return col;
  });
}

// Traverten (yatay damar bantları ve gözenekler)
{
  const n1 = makeNoise(41), n2 = makeNoise(43), n3 = makeNoise(47);
  const base = hex('#dac8a6'), band = hex('#b5966a'), light = hex('#efe4cd'), pore = hex('#8a7150');
  render('traverten', 600, 600, (x, y) => {
    const warpY = y + n3.fbm(x / 160, y / 160, 3) * 40;
    const b = n1.fbm(x / 900, warpY / 22, 5);
    let col = mix(base, band, smooth(0.02, 0.35, b));
    col = mix(col, light, smooth(0.0, 0.3, -b) * 0.7);
    const p = n2.noise(x / 6.5, warpY / 2.2);
    const pm = smooth(0.45, 0.62, p) * smooth(-0.1, 0.25, n3.fbm(x / 60, y / 60, 2));
    col = mix(col, pore, pm * 0.8);
    return col;
  });
}

// Siyah granit (kristal benekler)
{
  const n1 = makeNoise(53), n2 = makeNoise(59), n3 = makeNoise(61);
  const base = hex('#141414'), mid = hex('#2a2a2a'), gray = hex('#8a8886'), white = hex('#e9e4da');
  render('granit', 420, 420, (x, y) => {
    let col = mix(base, mid, smooth(-0.2, 0.4, n3.fbm(x / 40, y / 40, 3)));
    const g = n1.noise(x / 3.1, y / 3.1), w2 = n2.noise(x / 2.3 + 50, y / 2.3);
    col = mix(col, gray, smooth(0.32, 0.5, g) * 0.85);
    col = mix(col, white, smooth(0.42, 0.55, w2) * 0.9);
    return col;
  }, 62);
}

// Andezit (ince taneli, hafif pembemsi gri)
{
  const n1 = makeNoise(67), n2 = makeNoise(73), n3 = makeNoise(79);
  const base = hex('#8f8984'), light = hex('#aca39b'), dark = hex('#5b5551');
  render('andezit', 480, 480, (x, y) => {
    let col = mix(base, light, smooth(-0.2, 0.4, n3.fbm(x / 120, y / 120, 4)) * 0.8);
    const g = n1.fbm(x / 1.8, y / 1.8, 2);
    col = mix(col, dark, smooth(0.05, 0.4, g) * 0.6);
    col = mix(col, light, smooth(0.1, 0.4, -g) * 0.35);
    const s = n2.noise(x / 2.6, y / 2.6);
    col = mix(col, hex('#3a3633'), smooth(0.48, 0.6, s) * 0.8);
    return col;
  });
}

// Patinatolu bazalt (koyu, eskitilmiş, gözenekli)
{
  const n1 = makeNoise(83), n2 = makeNoise(89), n3 = makeNoise(97);
  const base = hex('#3b3c3e'), light = hex('#5f6164'), dark = hex('#1c1d1e');
  render('bazalt', 600, 600, (x, y) => {
    let col = mix(base, light, smooth(-0.25, 0.45, n3.fbm(x / 140, y / 140, 4)) * 0.75);
    const g = n1.fbm(x / 2, y / 2, 2);
    col = mix(col, dark, smooth(0.05, 0.4, g) * 0.6);
    const pit = n2.noise(x / 5, y / 5);
    col = mix(col, hex('#121314'), smooth(0.4, 0.55, pit) * 0.75);
    return col;
  });
}

// ---------- Tema v3: büyük, gerçekçi levhalar ----------
// Damar = gürültünün sıfır geçişi (|fbm| ≈ 0): paralel bant değil, dallanan doğal ağ.
// Düşük oktav = sakin çizgi; kalınlık (w) damar boyunca gürültüyle değişir.
const ridgeV = (n, x, y, s, oct, w) => clamp(1 - Math.abs(n.fbm(x / s, y / s, oct)) / w);
const flow = (wn, x, y, { ang = 0.5, stretch = 2, warp = 0, ws = 600 }) => {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let u = x * ca + y * sa, v = (-x * sa + y * ca) * stretch;
  if (warp) { u += wn.fbm(x / ws, y / ws, 3) * warp; v += wn.fbm(x / ws + 17.3, y / ws + 5.1, 3) * warp; }
  return [u, v];
};
const grain = (n, x, y, amp) => n.noise(x / 1.7, y / 1.7) * amp;
const width = (n, x, y, s, lo, hi) => lo + (hi - lo) * smooth(-0.35, 0.35, n.fbm(x / s, y / s, 2));

// Nero Marquina: siyah zemin, değişken kalınlıkta beyaz damarlar, ince kırık ağ
{
  const n1 = makeNoise(311), n2 = makeNoise(312), n3 = makeNoise(313), n4 = makeNoise(314), n5 = makeNoise(315), n6 = makeNoise(316), n7 = makeNoise(317);
  const base = hex("#09090a"), cloud = hex("#1a1a1d"), white = hex("#e8e4db"), haze = hex("#2e2e33");
  render("nero", 2400, 1400, (x, y) => {
    const c = n4.fbm(x / 820, y / 560, 5);
    let col = mix(base, cloud, smooth(-0.3, 0.55, c));
    const [u, v] = flow(n2, x, y, { ang: 0.5, stretch: 2.6, warp: 420, ws: 900 });
    const w = width(n7, x, y, 260, 0.0035, 0.016);
    const main = ridgeV(n1, u, v, 2400, 3, w);
    const halo = ridgeV(n1, u, v, 2400, 3, w * 5);
    const fade = smooth(-0.45, 0.1, n5.fbm(x / 900 + 3, y / 900, 2));
    const [u2, v2] = flow(n2, x + 900, y, { ang: -0.3, stretch: 2, warp: 260, ws: 600 });
    const sec = ridgeV(n3, u2, v2, 900, 3, width(n7, x + 99, y, 180, 0.002, 0.009)) * smooth(-0.1, 0.35, n5.fbm(x / 700, y / 700, 3));
    const web = ridgeV(n6, x, y, 260, 3, 0.0045) * smooth(0.1, 0.45, n5.fbm(x / 420 + 7, y / 420, 3));
    col = mix(col, haze, clamp(halo * 0.45 * fade));
    col = mix(col, white, clamp(main * 0.95 * fade + sec * 0.55 + web * 0.22));
    const g = grain(n4, x, y, 3.5);
    return [col[0] + g, col[1] + g, col[2] + g];
  }, 82);
}

// Calacatta: sıcak beyaz zemin, gri-altın, yumuşak kenarlı damarlar
{
  const n1 = makeNoise(411), n2 = makeNoise(412), n3 = makeNoise(413), n4 = makeNoise(414), n5 = makeNoise(415), n7 = makeNoise(417);
  const base = hex("#f6f3ed"), cloud = hex("#e8e2d8"), warm = hex("#f0e6d4"), grey = hex("#8a867f"), gold = hex("#c2a676"), shadow = hex("#d9d2c6");
  render("calacatta", 1800, 1200, (x, y) => {
    let col = mix(base, cloud, smooth(-0.2, 0.6, n4.fbm(x / 560, y / 400, 5)) * 0.8);
    col = mix(col, warm, smooth(0.1, 0.5, n5.fbm(x / 700 + 3, y / 700, 3)) * 0.45);
    const [u, v] = flow(n2, x, y, { ang: 0.75, stretch: 2.2, warp: 340, ws: 760 });
    const w = width(n7, x, y, 220, 0.004, 0.017);
    const core = ridgeV(n1, u, v, 1700, 3, w);
    const edge = ridgeV(n1, u, v, 1700, 3, w * 3.2);
    const soft = ridgeV(n1, u, v, 1700, 3, w * 9);
    const fade = smooth(-0.5, 0.05, n5.fbm(x / 800 + 11, y / 800, 2));
    const [u2, v2] = flow(n2, x, y + 600, { ang: -0.2, stretch: 1.8, warp: 200, ws: 500 });
    const sec = ridgeV(n3, u2, v2, 700, 3, width(n7, x + 50, y, 160, 0.0015, 0.007)) * smooth(-0.1, 0.35, n5.fbm(x / 480, y / 480, 3));
    col = mix(col, shadow, clamp(soft * 0.45 * fade));
    col = mix(col, gold, clamp(edge * 0.5 * fade));
    col = mix(col, grey, clamp(core * 0.8 * fade + sec * 0.4));
    const g = grain(n4, x, y, 2.2);
    return [col[0] + g, col[1] + g, col[2] + g];
  }, 82);
}

// Verde: koyu zümrüt zemin, açık yeşil ve beyaz yoğun damar ağı
{
  const n1 = makeNoise(511), n2 = makeNoise(512), n3 = makeNoise(513), n4 = makeNoise(514), n5 = makeNoise(515), n7 = makeNoise(517);
  const base = hex("#0c221b"), cloud = hex("#1a4033"), deep = hex("#05110d"), mint = hex("#6f9584"), white = hex("#dde5dd");
  render("verde", 1600, 1000, (x, y) => {
    const c = n4.fbm(x / 440, y / 330, 5);
    let col = mix(base, cloud, smooth(-0.1, 0.55, c));
    col = mix(col, deep, smooth(0.05, 0.5, -c) * 0.7);
    const [u, v] = flow(n2, x, y, { ang: 0.45, stretch: 2.2, warp: 260, ws: 600 });
    const w = width(n7, x, y, 200, 0.004, 0.02);
    const mid = ridgeV(n1, u, v, 1100, 3, w);
    const midH = ridgeV(n1, u, v, 1100, 3, w * 4);
    const [u2, v2] = flow(n2, x + 400, y, { ang: 0.1, stretch: 1.6, warp: 160, ws: 380 });
    const fine = ridgeV(n3, u2, v2, 380, 3, width(n7, x + 70, y, 140, 0.002, 0.008)) * smooth(-0.25, 0.3, n5.fbm(x / 360, y / 360, 3));
    col = mix(col, mint, clamp(midH * 0.35 + mid * 0.4));
    col = mix(col, white, clamp(fine * 0.55 + mid * 0.45));
    const g = grain(n4, x, y, 3);
    return [col[0] + g, col[1] + g, col[2] + g];
  }, 80);
}

// Gri mermer (Bardiglio benzeri): orta gri, koyu bulutlar, değişken kalınlıkta açık damarlar — levha oranı
{
  const n1 = makeNoise(611), n2 = makeNoise(612), n3 = makeNoise(613), n4 = makeNoise(614), n5 = makeNoise(615), n7 = makeNoise(617);
  const base = hex("#9a9c9e"), dark = hex("#6a6c70"), light = hex("#b9bbbc"), white = hex("#eeedea");
  render("gri2", 900, 1300, (x, y) => {
    const c = n4.fbm(x / 300, y / 420, 5);
    let col = mix(base, dark, smooth(-0.15, 0.5, c));
    col = mix(col, light, smooth(0.05, 0.45, -c) * 0.6);
    const [u, v] = flow(n2, x, y, { ang: 1.15, stretch: 2.4, warp: 220, ws: 500 });
    const w = width(n7, x, y, 160, 0.003, 0.014);
    const core = ridgeV(n1, u, v, 1300, 3, w);
    const halo = ridgeV(n1, u, v, 1300, 3, w * 4);
    const [u2, v2] = flow(n2, x + 300, y, { ang: 0.6, stretch: 1.8, warp: 140, ws: 320 });
    const sec = ridgeV(n3, u2, v2, 520, 3, width(n7, x + 40, y, 120, 0.0015, 0.006)) * smooth(-0.15, 0.3, n5.fbm(x / 300, y / 300, 3));
    col = mix(col, light, clamp(halo * 0.35));
    col = mix(col, white, clamp(core * 0.9 + sec * 0.5));
    const g = grain(n4, x, y, 4);
    return [col[0] + g, col[1] + g, col[2] + g];
  }, 80);
}

// Traverten: düz yatay katmanlar, ince çizgiler ve gözenekler — levha oranı
{
  const n1 = makeNoise(721), n2 = makeNoise(722), n3 = makeNoise(723), n4 = makeNoise(724), n5 = makeNoise(725);
  const base = hex("#dfceac"), warm = hex("#cdb388"), light = hex("#eee4cd"), line = hex("#b59a70"), pore = hex("#8f7550"), hole = hex("#6f5a3d");
  render("traverten2", 900, 1300, (x, y) => {
    const wy = y + n3.fbm(x / 700, y / 700, 3) * 12;
    const broad = n1.fbm(x / 2600, wy / 70, 4);
    let col = mix(base, warm, smooth(0.02, 0.3, broad) * 0.7);
    col = mix(col, light, smooth(0.02, 0.3, -broad) * 0.55);
    const fine = n5.noise(x / 1600, wy / 4.5) + n5.noise(x / 400, wy / 9) * 0.25;
    col = mix(col, line, smooth(0.28, 0.46, fine) * 0.35);
    col = mix(col, light, smooth(0.28, 0.46, -fine) * 0.25);
    const p = n2.noise(x / 6, wy / 2.4);
    const mask = smooth(-0.05, 0.35, n4.fbm(x / 120, y / 120, 2));
    col = mix(col, pore, smooth(0.42, 0.56, p) * mask * 0.7);
    col = mix(col, hole, smooth(0.56, 0.66, p) * mask * 0.7);
    const g = grain(n4, x, y, 3.5);
    return [col[0] + g, col[1] + g, col[2] + g];
  }, 82);
}

rmSync(TMP, { recursive: true, force: true });
