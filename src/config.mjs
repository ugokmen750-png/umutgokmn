// Tek yerden değişen işletme bilgileri. Alan adı değişirse sadece `url` güncellenir, sonra `node src/build.mjs`.
export const site = {
  url: 'https://ugokmen750-png.github.io/umutgokmn', // kendi alan adı gelince: 'https://www.<alanadi>.com'
  name: 'Hasbey Karo Mermer',
  short: 'Hasbey Mermer',
  city: 'Kırıkkale',
  region: 'Kırıkkale',
  regionCode: 'TR-71',
  instagram: 'https://www.instagram.com/hasbeymermer71/',
  instagramHandle: '@hasbeymermer71',
  whatsapp: '905468019565',
  phones: [
    { name: 'Uğur Timur', tel: '+905468019565', display: '0546 801 95 65' },
    { name: 'Hacı İsa Timur', tel: '+905436700017', display: '0543 670 00 17' },
    { name: 'Umut Timur', tel: '+905373121872', display: '0537 312 18 72' },
  ],
  lastmod: '2026-11-24',
};

// Site bir alt klasörde yayınlanıyorsa (ör. GitHub Pages: kullanici.github.io/depo) iç linkler bu ön eki alır.
// Kendi alan adına geçince `url` alan adı olur, `base` kendiliğinden boşalır.
export const base = new URL(site.url).pathname.replace(/\/$/, '');

export const districts = ['Merkez', 'Yahşihan', 'Keskin', 'Delice', 'Sulakyurt', 'Balışeyh', 'Karakeçili', 'Bahşılı', 'Çelebi'];

export const primaryPhone = site.phones[0];
export const waLink = (text = 'Merhaba, fiyat bilgisi almak istiyorum.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
