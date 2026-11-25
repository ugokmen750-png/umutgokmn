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

## Görseller

- **Projeler** bölümündeki fotoğraflar Hasbey Karo Mermer'in kendi işleridir.
- Giriş slaytları, koleksiyon ve hizmet görsellerindeki iç/dış mekân ve taş fotoğrafları [Pexels](https://www.pexels.com/license/) lisanslı stok fotoğraflardır (ticari kullanım serbest). Sitede "örnek uygulama / yüzey örneği" olarak geçer.

| Dosya (public/assets/img/px) | Pexels foto no |
|---|---|
| hero-mutfak | [6980655](https://www.pexels.com/photo/6980655/) |
| hero-banyo | [8146152](https://www.pexels.com/photo/8146152/) |
| hero-merdiven | [13821521](https://www.pexels.com/photo/13821521/) |
| beyaz-levha | [3847492](https://www.pexels.com/photo/3847492/) |
| beyaz-uygulama | [7671236](https://www.pexels.com/photo/7671236/) |
| traverten-levha | [12106848](https://www.pexels.com/photo/12106848/) |
| traverten-uygulama | [38689796](https://www.pexels.com/photo/38689796/) |
| gri-levha | [6788339](https://www.pexels.com/photo/6788339/) |
| gri-uygulama | [2102546](https://www.pexels.com/photo/2102546/) |
| granit-uygulama | [8186511](https://www.pexels.com/photo/8186511/) |
| andezit-levha | [36783573](https://www.pexels.com/photo/36783573/) |
| andezit-uygulama | [36779943](https://www.pexels.com/photo/36779943/) |
| bazalt-levha | [35332560](https://www.pexels.com/photo/35332560/) |
| bazalt-uygulama | [38220910](https://www.pexels.com/photo/38220910/) |
| mutfak-tezgah | [36740615](https://www.pexels.com/photo/36740615/) |
| mutfak-masa | [7031879](https://www.pexels.com/photo/7031879/) |
| basamak-spiral | [40211701](https://www.pexels.com/photo/40211701/) |
| banyo-beyaz | [6920610](https://www.pexels.com/photo/6920610/) |
| banyo-siyah | [6903151](https://www.pexels.com/photo/6903151/) |
| peyzaj-yol | [39457331](https://www.pexels.com/photo/39457331/) |
| siyah-mermer | [6788338](https://www.pexels.com/photo/6788338/) |
