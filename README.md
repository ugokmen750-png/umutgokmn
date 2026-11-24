# Hasbey Karo Mermer — Kırıkkale

Kırıkkale'de mezar, mermer, karo, mutfak tezgahı, bordür taşı, andezit ve basamak işleri yapan
**Hasbey Karo Mermer** firmasının web sitesi. Instagram: [@hasbeymermer71](https://www.instagram.com/hasbeymermer71/)

## Yapı

- `src/config.mjs` — alan adı, telefonlar, ilçeler (tek yer)
- `src/content.mjs` — sayfa metinleri
- `src/build.mjs` — statik site üretici → `public/`
- `src/textures.mjs` — taş dokusu görselleri (Perlin gürültüsü + ffmpeg ile WebP)
- `public/` — yayınlanan site (GitHub Pages bu klasörü yayınlar)

## Komutlar

```bash
npm install          # yazı tipleri (fontsource, SIL OFL)
npm run build        # public/ klasörünü üretir
npm run serve        # http://localhost:5181
```

Kendi alan adına geçerken `src/config.mjs` içindeki `url` değerini alan adıyla değiştirip
`npm run build` çalıştırmak yeterli; iç linkler ve site haritası buna göre güncellenir.
Apache/cPanel için `.htaccess`, Netlify/Cloudflare için `_headers` o zaman üretilir.

Site, yapay zekâ desteğiyle (Claude) hazırlanmıştır.
