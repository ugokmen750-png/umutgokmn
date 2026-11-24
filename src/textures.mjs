// Taş dokularını bir kez üretir: node src/textures.mjs → public/assets/img/tex/*.webp
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

function render(name, w, h, shade, quality = 72) {
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

rmSync(TMP, { recursive: true, force: true });
