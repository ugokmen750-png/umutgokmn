// Sayfa içerikleri. Metinler Kırıkkale yerel aramaları düşünülerek yazıldı.
// Görsel yolu uzantısız verilir: build hem 520px hem 960px WebP'yi kullanır.

export const photos = {
  traverten: { src: '/assets/img/mezar-traverten-aile', w: 960, h: 1066, alt: "Kırıkkale'de yapılan traverten aile mezarı", cap: 'Traverten aile mezarı', tag: 'Mezar' },
  gri: { src: '/assets/img/mezar-gri-mermer', w: 960, h: 1066, alt: 'Gri damarlı mermerden katlı mezar işçiliği', cap: 'Gri mermer mezar', tag: 'Mezar' },
  beyaz: { src: '/assets/img/mezar-beyaz', w: 960, h: 960, alt: "Kırıkkale'de beyaz mermer mezar uygulaması", cap: 'Beyaz mermer mezar', tag: 'Mezar' },
  granit: { src: '/assets/img/mezar-siyah-granit', w: 960, h: 770, alt: 'Siyah ve gri granit mezar, dalgalı baş taşı', cap: 'Granit mezar', tag: 'Mezar' },
  mutfak: { src: '/assets/img/mutfak-dolap', w: 960, h: 964, alt: 'Ledli üst dolaplı mutfak dolabı uygulaması', cap: 'Mutfak dolabı', tag: 'Mutfak' },
  // 2026-11-28: Mert Başkan'ın WhatsApp'tan ilettiği iş fotoğrafları (kaynak/whatsapp-2026-11-28; taşlardaki adlar gizlendi)
  mezarBeyaz: { src: '/assets/img/mezar-beyaz-mermer', w: 960, h: 1280, alt: 'Oturak taşıyla birlikte yapılmış beyaz mermer mezar', cap: 'Oturaklı beyaz mermer mezar', tag: 'Mezar' },
  mezarTek: { src: '/assets/img/mezar-beyaz-oturakli', w: 960, h: 1280, alt: 'Kırıkkale mezarlığında tek kişilik beyaz mermer mezar ve oturak', cap: 'Tek kişilik mermer mezar', tag: 'Mezar' },
  mezarBantli: { src: '/assets/img/mezar-gri-bantli', w: 960, h: 1280, alt: 'Gri bant detaylı mermer mezar, beton tabanı yeni dökülmüş', cap: 'Bant detaylı mermer mezar', tag: 'Mezar' },
  mezarAile: { src: '/assets/img/mezar-aile-cercevesi', w: 960, h: 886, alt: 'İki baş taşlı aile mezarı için mermer çerçeve', cap: 'Aile mezarı çerçevesi', tag: 'Mezar' },
  cesme: { src: '/assets/img/mermer-cesme', w: 960, h: 1280, alt: 'Ön yüzü motif oymalı gri damarlı mermer çeşme', cap: 'Oymalı mermer çeşme', tag: 'Çeşme' },
  merdiven: { src: '/assets/img/merdiven-yahsihan', w: 960, h: 1088, alt: "Yahşihan'da bej basamaklı, siyah rıhtlı dış merdiven", cap: 'Dış merdiven basamakları', tag: 'Basamak' },
  karo: { src: '/assets/img/karo-numuneleri', w: 960, h: 1280, alt: 'Hasbey Karo Mermer dükkânı önünde dizili renkli karo numuneleri', cap: 'Karo çeşitlerimiz', tag: 'Karo' },
};

// Ana sayfadaki seçki (ilk görsel iki satır kaplar → dikey fotoğraf)
export const gallery = [photos.mezarBeyaz, photos.cesme, photos.merdiven, photos.karo, photos.traverten];
// Projeler sayfası: tüm iş fotoğrafları
export const works = [photos.mezarBeyaz, photos.mezarTek, photos.cesme, photos.mezarBantli, photos.mezarAile, photos.merdiven, photos.karo, photos.traverten, photos.gri, photos.beyaz, photos.granit, photos.mutfak];

export const materials = [
  { key: 'beyaz', name: 'Beyaz Mermer', text: 'Mezar, basamak ve iç mekanda klasik, aydınlık görünüm.', use: ['Mezar', 'Basamak', 'İç mekan'] },
  { key: 'traverten', name: 'Traverten', text: 'Sıcak bej tonları; aile mezarı, duvar ve cephe kaplaması.', use: ['Aile mezarı', 'Cephe', 'Duvar'] },
  { key: 'gri', name: 'Gri Mermer', text: 'Belirgin damarlı dokusuyla mezar ve zemin uygulamaları.', use: ['Mezar', 'Zemin'] },
  { key: 'granit', name: 'Siyah Granit', text: 'Sert ve leke tutmaz; mezar ve mutfak tezgahı için.', use: ['Mezar', 'Tezgah', 'Dış merdiven'] },
  { key: 'andezit', name: 'Andezit', text: 'Dona dayanıklı; bahçe, kaldırım ve dış merdiven.', use: ['Bahçe', 'Kaldırım', 'Havuz kenarı'] },
  { key: 'bazalt', name: 'Patinatolu Bazalt', text: 'Eskitilmiş dokulu avlu, teras ve yürüyüş yolu taşı.', use: ['Avlu', 'Teras', 'Yürüyüş yolu'] },
];

// Ana sayfa bilgi şeridi (uydurma sayı yok: hepsi sitedeki gerçek kapsamdan)
export const facts = [
  { k: 'Tek ekip', v: 'Ölçü, imalat ve montaj' },
  { k: '9 ilçe', v: "Kırıkkale'nin tamamında hizmet" },
  { k: '5 hizmet alanı', v: 'Mezardan inşaat mermerine' },
  { k: 'Yerinde keşif', v: 'Net fiyat, net teslim tarihi' },
];

// Kurumsal sayfa
export const corporate = {
  statement: "Hasbey Karo Mermer, Kırıkkale'de mermer, granit, traverten, karo ve doğal taş işlerini tek çatı altında yürüten yerel bir firmadır.",
  about: [
    'Mezarlıktaki bir aile mezarından evinizdeki mutfak tezgahına, bahçenizdeki bordür taşından binanızın basamaklarına kadar taşla ilgili her işi aynı özenle ele alıyoruz.',
    'İşe yerinde keşifle başlıyor, ölçüyü kendimiz alıyor, malzemeyi sizinle birlikte seçiyor ve montajı kendi ekibimizle yapıyoruz. Böylece işin her aşamasında muhatabınız bellidir; iş başkasına devredilmez.',
    "Kırıkkale'nin iklimini ve zeminini bilen bir ekip olarak dona, neme ve aşınmaya dayanıklı malzemeyi işin yerine göre öneriyoruz. Ev sahipleri, aileler, müteahhitler ve site yönetimleriyle çalışıyoruz.",
  ],
  principles: [
    { t: 'Yerinde ölçü', d: 'Ölçüyü kendimiz alırız. Taş yerine milimetrik oturur, sonradan düzeltme gerekmez.' },
    { t: 'Birlikte seçim', d: 'Numuneler ve daha önce yaptığımız işler üzerinden taşa ve modele birlikte karar veririz.' },
    { t: 'Kendi ekibimizle montaj', d: 'İmalatı yapan ekip montajı da yapar. İş taşeronlara dağıtılmaz.' },
    { t: 'Doğru taş, doğru yer', d: 'Dış mekanda dona dayanıklı, mutfakta lekeye dayanıklı taşı öneririz; gösterişi değil kullanımı esas alırız.' },
    { t: 'Açık fiyat', d: 'Keşiften sonra kalem kalem net fiyat ve teslim tarihi veririz.' },
    { t: 'Temiz teslim', d: 'Montaj bitince alanı temizler, işi yerinde birlikte kontrol ederek teslim ederiz.' },
  ],
  clients: ['Aileler ve ev sahipleri', 'Müteahhitler', 'Site ve apartman yönetimleri', 'İş yerleri', 'Cami ve vakıf hayratları'],
};

export const process = [
  { t: 'Keşif ve ölçü', d: 'Yerinde inceliyor, ölçüyü kendimiz alıyoruz. İşin kapsamını ve süresini baştan konuşuyoruz.' },
  { t: 'Malzeme ve model', d: 'Numuneler ve daha önce yaptığımız işler üzerinden taşı ve modeli birlikte seçiyoruz.' },
  { t: 'İmalat', d: 'Kesim, kenar işçiliği, cila ve yazı işlemleri ölçüye göre hazırlanır.' },
  { t: 'Montaj ve teslim', d: 'Montajı kendi ekibimiz yapar. Alanı temizleyip işi yerinde teslim ederiz.' },
];

export const homeFaq = [
  { q: "Kırıkkale'nin hangi ilçelerine hizmet veriyorsunuz?", a: "Kırıkkale Merkez başta olmak üzere Yahşihan, Keskin, Delice, Sulakyurt, Balışeyh, Karakeçili, Bahşılı ve Çelebi'de çalışıyoruz. İşin yerini söylemeniz yeterli, keşif için gelelim." },
  { q: 'Fiyat teklifi nasıl alabilirim?', a: 'Telefonla arayabilir ya da WhatsApp\'tan işin fotoğrafını ve yaklaşık ölçüsünü gönderebilirsiniz. Ön bilgiyi hemen veriyor, kesin fiyatı yerinde keşiften sonra söylüyoruz.' },
  { q: 'Mezar fiyatları neye göre değişiyor?', a: 'Seçilen taş (mermer, granit, traverten), mezarın ölçüsü ve kat sayısı, baş taşı ve yazı işçiliği fiyatı belirleyen ana etkenlerdir. Aynı bütçeyle farklı seçenekleri yan yana gösteriyoruz.' },
  { q: 'Mutfak tezgahı için hangi malzemeyi önerirsiniz?', a: 'Isıya ve çizilmeye karşı granit ve porselen, lekeye karşı kuvars öne çıkar. Mermer en doğal görünümü verir ama asitli maddelere karşı daha hassastır. Kullanım alışkanlığınıza göre birlikte seçiyoruz.' },
  { q: 'Karo ve bordür taşı işini de yapıyor musunuz?', a: 'Evet. Karo imalatı, karo döşeme ve bordür taşı uygulamasını zemin hazırlığıyla birlikte yapıyoruz.' },
  { q: 'İş ne kadar sürede teslim edilir?', a: 'Süre; işin büyüklüğüne, seçilen malzemenin hazır olup olmamasına ve hava koşullarına göre değişir. Keşif sırasında size net bir teslim tarihi veriyoruz.' },
];

export const services = [
  {
    slug: 'kirikkale-mezar-yapimi',
    introTitle: 'Hatıraya yakışır bir işçilik',
    nav: 'Mezar Yapımı',
    card: 'Tek kişilik, aile ve bebek mezarları; mermer, granit ve traverten seçenekleri, mezar taşı yazısı ve çeşme.',
    title: 'Kırıkkale Mezar Yapımı ve Mezar Modelleri | Hasbey Karo Mermer',
    description: "Kırıkkale'de mermer, granit ve traverten mezar yapımı. Tek kişilik, aile ve bebek mezarı, mezar taşı yazısı ve çeşme modelleri. Ölçüden montaja tek ekip.",
    h1: 'Kırıkkale Mezar Yapımı',
    kicker: 'Mermer · Granit · Traverten',
    lead: "Kırıkkale'de tek kişilik, çift ve aile mezarlarını, bebek mezarlarını mermer, granit ve traverten seçenekleriyle yapıyoruz. Mezar taşı yazısından çeşmeye kadar her detay tek elden.",
    hero: 'traverten',
    swatch: 'traverten',
    intro: [
      'Bir mezar, yakınınızın hatırasını yıllarca taşıyacak bir eserdir. Bu yüzden taşın seçiminden yazının harflerine kadar her detayı ailenizle birlikte belirliyoruz.',
      "Kırıkkale Merkez başta olmak üzere Yahşihan, Keskin, Delice, Sulakyurt, Balışeyh, Karakeçili, Bahşılı ve Çelebi'deki mezarlıklarda çalışıyoruz. Mezarlığın ölçü ve izin kurallarına uygun hareket ediyor, zemini hazırlayıp montajı kendi ekibimizle yapıyoruz.",
    ],
    itemsTitle: 'Mezar modellerimiz',
    items: [
      { t: 'Mermer mezar', d: 'Beyaz ve gri mermerle sade ya da işlemeli, tek ve çift katlı mezar modelleri.' },
      { t: 'Granit mezar', d: 'Siyah ve gri granitle uzun ömürlü, lekeye ve yıpranmaya dayanıklı mezarlar.' },
      { t: 'Traverten aile mezarı', d: 'Birden fazla defin alanını tek çerçevede birleştiren traverten aile mezarlıkları.' },
      { t: 'Bebek mezarı', d: 'Küçük ölçülere özel, ince işçilikli bebek ve çocuk mezarı modelleri.' },
      { t: 'Mezar taşı ve yazı', d: 'Baş taşı, kitabe, isim ve dua yazıları; farklı yazı ve harf seçenekleri.' },
      { t: 'Çeşme modelleri', d: 'Mezarlık, cami avlusu ve bahçe için mermer ve granit hayrat çeşmeleri.' },
    ],
    notesTitle: 'Mezar yaptırırken bilmeniz gerekenler',
    notes: [
      { t: 'Ölçü', d: 'Mezarlık yönetiminin izin verdiği ölçüler esas alınır. Keşifte alanı birlikte kontrol ediyoruz.' },
      { t: 'Malzeme', d: 'Granit daha serttir ve leke tutmaz. Mermer ve traverten daha sıcak, doğal bir görünüm verir.' },
      { t: 'Zemin', d: 'Kalıcı bir mezar için sağlam temel ve suyun birikmemesi şarttır. Zemin hazırlığını biz yapıyoruz.' },
      { t: 'Bakım', d: 'Yılda birkaç kez bol suyla yıkamak yeterlidir. Asitli ve çamaşır suyu içeren temizleyiciler taşa zarar verir.' },
    ],
    gallery: ['mezarBeyaz', 'traverten', 'mezarTek', 'cesme', 'mezarBantli', 'mezarAile', 'gri', 'beyaz', 'granit'],
    faq: [
      { q: "Kırıkkale'de mezar yaptırmak ne kadar tutar?", a: 'Mezar fiyatı; seçilen taşa, mezarın ölçüsüne, kat sayısına ve yazı ile işleme detaylarına göre değişir. Yerinde keşiften sonra net fiyat veriyoruz. Ön bilgi için 0546 801 95 65\'i arayabilir ya da WhatsApp\'tan yazabilirsiniz.' },
      { q: 'Mezar yapımı ne kadar sürer?', a: 'Süre; modele, malzemenin hazır olup olmamasına ve hava koşullarına göre değişir. Keşif sırasında net bir teslim tarihi söylüyoruz.' },
      { q: 'Mezar yapımı için izin gerekiyor mu?', a: 'Mezarlıklarda yapılacak işlerde belediyenin mezarlık biriminin kurallarına uyulması gerekir. Hangi adımların gerektiği konusunda size yol gösteriyoruz.' },
      { q: 'Mermer mi granit mi daha dayanıklı?', a: 'Granit daha serttir; çizilmeye, lekeye ve dona karşı daha dayanıklıdır. Mermer ve traverten daha sıcak bir görünüm sunar ve doğru bakımla uzun yıllar kullanılır.' },
      { q: "Kırıkkale'nin ilçelerine de geliyor musunuz?", a: "Evet. Kırıkkale Merkez'in yanı sıra Yahşihan, Keskin, Delice, Sulakyurt, Balışeyh, Karakeçili, Bahşılı ve Çelebi'de mezar yapıyoruz." },
    ],
  },
  {
    slug: 'kirikkale-mutfak-tezgahi',
    introTitle: 'Her gün kullanılan yüzeye doğru malzeme',
    nav: 'Mutfak Tezgahı ve Dolap',
    card: 'Mermer, granit, kuvars ve porselen mutfak tezgahı, banyo tezgahı ve ölçüye özel mutfak dolabı.',
    title: 'Kırıkkale Mutfak Tezgahı ve Mutfak Dolabı | Hasbey Karo Mermer',
    description: "Kırıkkale'de mermer, granit, kuvars ve porselen mutfak tezgahı, banyo tezgahı ve mutfak dolabı. Yerinde ölçü, eviye-ocak kesimi ve montaj.",
    h1: 'Kırıkkale Mutfak Tezgahı ve Mutfak Dolabı',
    kicker: 'Mermer · Granit · Kuvars · Porselen',
    lead: 'Mutfağınızın ölçüsüne göre mermer, granit, kuvars ve porselen tezgah yapıyor, dolaplarla uyumlu bir mutfak kuruyoruz. Ölçü, kesim ve montaj bizden.',
    hero: 'mutfak',
    swatch: 'granit',
    intro: [
      'Tezgah, mutfakta en çok kullanılan yüzeydir. Sıcağa, çizilmeye ve lekeye ne kadar dayanacağı seçtiğiniz malzemeye bağlıdır. Kullanım alışkanlığınızı dinleyip bütçenize uygun seçeneği birlikte belirliyoruz.',
      'Ölçüyü yerinde alıyor; eviye, ocak ve batarya kesimlerini buna göre yapıyoruz. Kırıkkale merkez ve ilçelerdeki ev ve iş yerlerinde mutfak ile banyo tezgahı uyguluyoruz.',
    ],
    itemsTitle: 'Tezgah ve mutfak çözümlerimiz',
    items: [
      { t: 'Mermer tezgah', d: 'Doğal damarlı görünümü ve serin yüzeyiyle klasik mutfaklar için.' },
      { t: 'Granit tezgah', d: 'Sert yapısı sayesinde sıcağa ve çizilmeye dayanıklı, uzun ömürlü.' },
      { t: 'Kuvars tezgah', d: 'Gözeneksiz yüzeyi lekeye dayanıklıdır, renk seçeneği geniştir.' },
      { t: 'Porselen tezgah', d: 'İnce ve modern görünümlü; yüksek ısıya ve çizilmeye dayanıklı.' },
      { t: 'Banyo tezgahı', d: 'Lavabo ve dolap ölçüsüne uygun mermer ve granit banyo tezgahları.' },
      { t: 'Mutfak dolabı', d: 'Tezgahla uyumlu, ölçüye özel mutfak dolabı uygulamaları.' },
    ],
    table: {
      title: 'Hangi tezgah size uygun?',
      head: ['Malzeme', 'Isıya dayanım', 'Lekeye dayanım', 'Görünüm'],
      rows: [
        ['Mermer', 'Orta', 'Bakım ister', 'Doğal, damarlı'],
        ['Granit', 'Yüksek', 'İyi', 'Doğal, benekli'],
        ['Kuvars', 'Orta', 'Çok iyi', 'Düz, geniş renk seçeneği'],
        ['Porselen', 'Çok yüksek', 'Çok iyi', 'İnce, modern'],
      ],
    },
    gallery: ['mutfak'],
    faq: [
      { q: 'Mutfak tezgahı fiyatı nasıl hesaplanır?', a: 'Fiyat; seçilen malzemeye, tezgahın uzunluğuna ve kalınlığına, eviye ve ocak kesimi gibi işçiliklere göre belirlenir. Ölçü aldıktan sonra net fiyat veriyoruz.' },
      { q: 'Hangi tezgah daha dayanıklı?', a: 'Isıya ve çizilmeye karşı granit ve porselen öne çıkar. Lekeye karşı en rahat seçenek kuvarstır. Mermer güzel görünür ama limon, sirke gibi asitli maddelere karşı daha hassastır.' },
      { q: 'Tezgah ölçüsünü kim alıyor?', a: 'Ölçüyü dolaplar yerine takıldıktan sonra yerinde biz alıyoruz. Böylece tezgah duvara ve dolaba tam oturur.' },
      { q: 'Eski tezgahımı yenisiyle değiştirebilir misiniz?', a: 'Keşifte mevcut tezgahın durumunu inceliyor, sökümü ve yeni tezgahın montajını birlikte planlıyoruz.' },
    ],
  },
  {
    slug: 'kirikkale-karo-bordur-tasi',
    introTitle: 'Sağlam zemin, düzgün döşeme',
    nav: 'Karo ve Bordür Taşı',
    card: 'Karo imalatı ve montajı, bordür taşı, bahçe ve teras zemini, yürüyüş yolları.',
    title: 'Kırıkkale Karo İmalatı ve Bordür Taşı | Hasbey Karo Mermer',
    description: "Kırıkkale'de karo imalatı, karo döşeme ve bordür taşı uygulaması. Bahçe, teras, avlu ve yürüyüş yolları için zemin hazırlığıyla birlikte montaj.",
    h1: 'Kırıkkale Karo İmalatı ve Bordür Taşı',
    kicker: 'Karo · Bordür · Yürüyüş Yolu',
    lead: 'Bahçe, teras, kaldırım ve avlu için karo imalatı yapıyor; karo döşeme ve bordür taşı uygulamasını kendi ekibimizle tamamlıyoruz.',
    hero: null,
    swatch: 'karo',
    intro: [
      'Karo ve bordür taşı, dış mekanın hem görünüşünü hem de kullanım ömrünü belirler. Zemini hazırlanmadan döşenen karo kısa sürede oturur, kırılır ya da su tutar. Biz işe zeminden başlıyoruz.',
      "Kırıkkale'nin sert kışını bilen bir ekip olarak dona ve aşınmaya dayanıklı malzeme seçiyor, eğimi suyun akacağı şekilde veriyoruz.",
    ],
    itemsTitle: 'Karo ve bordür işlerimiz',
    items: [
      { t: 'Karo imalatı', d: 'Farklı ölçü ve renklerde dış mekan karoları üretiyoruz.' },
      { t: 'Karo montajı', d: 'Bahçe, teras, balkon ve avlularda zemin hazırlığıyla birlikte döşeme.' },
      { t: 'Bordür taşı', d: 'Yol, bahçe ve park kenarları için düz ve dekoratif bordür uygulaması.' },
      { t: 'Yürüyüş yolu', d: 'Bahçe içi yollar ve giriş alanları için dayanıklı zemin kaplaması.' },
      { t: 'Mermer karo', d: 'İç mekan zemin ve duvarları için ölçüye kesilmiş mermer karo.' },
      { t: 'Site çevre düzenlemesi', d: 'Ortak alanlarda karo, bordür ve basamak işlerini birlikte planlıyoruz.' },
    ],
    notesTitle: 'Döşemede dikkat ettiklerimiz',
    notes: [
      { t: 'Alt zemin', d: 'Toprak sıkıştırılır, gerekirse dolgu ve şap yapılır. Düzgün zemin, oturmayı önler.' },
      { t: 'Eğim', d: 'Yüzeye suyun akacağı eğim verilir; su birikmez, kışın buz tutmaz.' },
      { t: 'Derz', d: 'Derzler eşit aralıklı ve dolgulu olur. Görüntü düzgün, yüzey sağlam kalır.' },
      { t: 'Kenar', d: 'Döşemenin kenarları bordür taşıyla sabitlenir, karo zamanla dağılmaz.' },
    ],
    gallery: ['karo'],
    faq: [
      { q: 'Karo döşeme fiyatı neye göre değişir?', a: 'Alanın büyüklüğüne, seçilen karonun tipine, zeminin durumuna ve bordür ihtiyacına göre değişir. Yerinde ölçüden sonra fiyat veriyoruz.' },
      { q: 'Karoyu siz mi üretiyorsunuz?', a: 'Evet, karo imalatı da yapıyoruz. Bu sayede ölçü ve renk konusunda işinize uygun seçenek sunabiliyoruz.' },
      { q: 'Kışın karo döşenir mi?', a: 'Don olan günlerde harçlı döşeme yapılmaz, çünkü harç donarsa tutmaz. Hava durumuna göre uygun günleri planlıyoruz.' },
    ],
  },
  {
    slug: 'kirikkale-andezit-bazalt-tas-kaplama',
    introTitle: 'Dış mekanda yıllarca dayanan taş',
    nav: 'Andezit, Bazalt ve Peyzaj',
    card: 'Andezit ve patinatolu bazalt kaplama, taş duvar, traverten, peyzaj ve havuz yapımı.',
    title: 'Kırıkkale Andezit, Bazalt ve Taş Kaplama | Hasbey Karo Mermer',
    description: "Kırıkkale'de andezit taşı, patinatolu bazalt, doğal taş duvar kaplama, traverten, peyzaj düzenlemesi ve havuz yapımı. Keşif, kesim ve montaj tek elden.",
    h1: 'Kırıkkale Andezit, Bazalt ve Taş Kaplama',
    kicker: 'Andezit · Bazalt · Traverten · Peyzaj',
    lead: 'Andezit ve bazalt taşıyla bahçe, merdiven ve kaldırım kaplaması; doğal taşla duvar kaplaması; peyzaj ve havuz uygulamaları yapıyoruz.',
    hero: null,
    swatch: 'andezit',
    intro: [
      'Doğal taş dış mekanda yıllarca rengini ve dokusunu korur. Andezit dona dayanıklı yapısıyla bahçe ve merdivenler için, patinatolu bazalt eskitilmiş görünümüyle avlu ve teraslar için sık tercih edilir.',
      "Taşı işin yerine göre seçiyor, kesim ve montajı kendi ekibimizle yapıyoruz. Kırıkkale'de müstakil ev, villa, site ve iş yerlerinde doğal taş uyguluyoruz.",
    ],
    itemsTitle: 'Doğal taş ve peyzaj işlerimiz',
    items: [
      { t: 'Andezit taşı', d: 'Bahçe, kaldırım, merdiven ve havuz kenarı için dona dayanıklı kaplama.' },
      { t: 'Patinatolu bazalt', d: 'Kenarları eskitilmiş, doğal dokulu dış mekan taşı.' },
      { t: 'Taş duvar kaplama', d: 'Cephe, bahçe duvarı ve şömine çevresi için doğal taş kaplama.' },
      { t: 'Traverten uygulamaları', d: 'Sıcak bej tonlarıyla iç ve dış mekan kaplamaları.' },
      { t: 'Peyzaj düzenlemesi', d: 'Taş, bordür ve yürüyüş yollarıyla bahçenin baştan düzenlenmesi.' },
      { t: 'Havuz yapımı', d: 'Havuz yapımı ve havuz çevresinin kaymaz doğal taşla kaplanması.' },
    ],
    table: {
      title: 'Hangi taş nerede kullanılır?',
      head: ['Taş', 'En uygun kullanım', 'Öne çıkan özelliği'],
      rows: [
        ['Andezit', 'Dış merdiven, bahçe, kaldırım', 'Dona dayanıklı, pürüzlü yüzey'],
        ['Patinatolu bazalt', 'Avlu, teras, yürüyüş yolu', 'Eskitilmiş, doğal görünüm'],
        ['Traverten', 'Duvar, cephe, iç mekan', 'Sıcak bej tonlar'],
        ['Mermer', 'İç basamak, zemin, tezgah', 'Parlak, damarlı yüzey'],
      ],
    },
    gallery: [],
    faq: [
      { q: 'Andezit taşı kayar mı?', a: 'Patlatma ya da çekiçlenmiş yüzeyli andezit pürüzlüdür ve ıslakken bile iyi tutunma sağlar. Bu yüzden dış merdivenlerde ve havuz kenarında sık kullanılır.' },
      { q: 'Patinatolu bazalt nedir?', a: 'Patinato, taşın kenar ve yüzeylerinin özel bir işlemle eskitilmesidir. Bazalta doğal, yıllanmış bir görünüm kazandırır.' },
      { q: 'Doğal taş kaplama fiyatı nasıl belirlenir?', a: 'Taşın türüne, kalınlığına, uygulanacak alanın metrekaresine ve zemin hazırlığına göre belirlenir. Keşiften sonra fiyat veriyoruz.' },
    ],
  },
  {
    slug: 'kirikkale-basamak-merdiven-mermer',
    introTitle: 'Güvenli ve uzun ömürlü merdivenler',
    nav: 'Basamak ve İnşaat Mermeri',
    card: 'Mermer ve granit basamak, merdiven, denizlik, söve, eşik, zemin ve duvar kaplama.',
    title: 'Kırıkkale Basamak, Merdiven ve Denizlik | Hasbey Karo Mermer',
    description: "Kırıkkale'de mermer ve granit basamak, merdiven kaplama, denizlik, söve ve zemin mermeri. Konut, site ve iş yeri inşaatlarına ölçüye göre mermer işleri.",
    h1: 'Kırıkkale Mermer Basamak, Merdiven ve İnşaat Mermeri',
    kicker: 'Basamak · Denizlik · Söve · Zemin',
    lead: 'Konut, site ve iş yeri inşaatlarında mermer ve granit basamak, merdiven, denizlik, söve ve zemin kaplama işlerini ölçüye göre yapıyoruz.',
    hero: null,
    swatch: 'basamak',
    intro: [
      'Merdiven, bir binada en çok yıpranan alanlardan biridir. Basamak taşının kalınlığı, ön kenarının işlenişi ve kaymazlık detayı hem güvenliği hem de ömrü belirler.',
      "Müteahhitler ve ev sahipleri için Kırıkkale'deki inşaatlarda mermer işlerini tek elden üstleniyor; ölçü, kesim ve montajı iş programına uygun yapıyoruz.",
    ],
    itemsTitle: 'İnşaat mermer işlerimiz',
    items: [
      { t: 'Mermer basamak', d: 'İç merdivenler için ölçüye kesilmiş, kenarı işlenmiş basamak ve rıhtlar.' },
      { t: 'Dış merdiven', d: 'Bina girişleri ve bahçe merdivenleri için granit ve andezit basamak.' },
      { t: 'Denizlik', d: 'Pencere ölçüsüne uygun, su damlalıklı mermer pencere önü.' },
      { t: 'Söve ve eşik', d: 'Kapı ve pencere çevresi için mermer söve ve kapı eşiği.' },
      { t: 'Zemin ve duvar kaplama', d: 'Giriş holleri, merdiven boşlukları ve ıslak hacimler için mermer kaplama.' },
      { t: 'Küpeşte', d: 'Balkon ve korkuluk üstleri için mermer küpeşte.' },
    ],
    notesTitle: 'Basamakta dikkat ettiklerimiz',
    notes: [
      { t: 'Eşit ölçü', d: 'Basamak ve rıht yükseklikleri eşit tutulur; merdiven rahat ve güvenli çıkılır.' },
      { t: 'Ön kenar', d: 'Basamak burnuna pah ya da kaymaz kanal açılır, kenar kolay kırılmaz.' },
      { t: 'Doğru taş', d: 'Dış merdivende dona dayanıklı granit veya andezit kullanılır.' },
      { t: 'Sağlam montaj', d: 'Taşlar boşluksuz yapıştırılır, derzler düzgün kapatılır.' },
    ],
    gallery: ['merdiven'],
    faq: [
      { q: 'Merdiven mermeri fiyatı nasıl hesaplanır?', a: 'Basamak sayısına, basamak genişliğine, seçilen taşa ve kenar işçiliğine göre hesaplanır. Yerinde ölçüden sonra fiyat veriyoruz.' },
      { q: 'Dış merdivende hangi taşı önerirsiniz?', a: 'Dış mekanda dona ve kaymaya dayanıklı olduğu için andezit veya granit öneriyoruz.' },
      { q: 'Site ve apartman işleri alıyor musunuz?', a: 'Evet. Denizlik, basamak, söve ve zemin işlerini inşaatın programına göre planlıyor, müteahhitlerle birlikte çalışıyoruz.' },
    ],
  },
];


// ---------- Doğal taş koleksiyonu (tema v5) ----------
// Görseller: levha = yüzey yakın çekimi, uygulama = örnek kullanım. Stok fotoğraflar Pexels lisanslıdır
// (kaynak/pexels/liste.txt) ve sitede "örnek görsel" olarak geçer; Hasbey'in kendi işleri yalnız Projeler'de.
export const collection = [
  {
    slug: 'beyaz-mermer', key: 'beyaz', name: 'Beyaz Mermer', tone: 'Beyaz',
    slab: { px: 'beyaz-levha' }, app: { px: 'beyaz-uygulama' },
    lead: 'Beyaz zemin üzerinde ince gri damarlarıyla en klasik mermer. Mezardan mutfak tezgahına, basamaktan banyoya aydınlık ve temiz bir görünüm verir.',
    desc: [
      'Beyaz mermerin her plakası doğanın kendi deseniyle gelir; damarların yönü ve yoğunluğu plakadan plakaya değişir. Bu yüzden büyük yüzeylerde plakaları yan yana koyup deseni birlikte eşleştiriyoruz.',
      'Cilalı yüzeyde parlak, honlu (mat) yüzeyde daha sakin bir görünüm verir. İç mekanda zemin, duvar, basamak ve tezgahta; mezar yapımında ise baş taşı ve kitabe için sık kullanılır.',
    ],
    props: [['Renk', 'Beyaz zemin, gri damar'], ['Yüzey', 'Cilalı veya honlu'], ['Kullanım', 'Mezar, basamak, tezgah, iç mekan']],
    care: 'Limon, sirke ve kireç sökücü gibi asitli temizleyiciler yüzeyi matlaştırır; nötr bir temizleyici yeterlidir.',
    services: ['kirikkale-mezar-yapimi', 'kirikkale-basamak-merdiven-mermer', 'kirikkale-mutfak-tezgahi'],
  },
  {
    slug: 'traverten', key: 'traverten', name: 'Traverten', tone: 'Bej', card: 'slab',
    slab: { px: 'traverten-levha' }, app: { px: 'traverten-uygulama' },
    lead: 'Sıcak bej tonları ve doğal gözenekleriyle traverten; aile mezarından cepheye, avludan havuz kenarına kadar yumuşak ve doğal bir görünüm verir.',
    desc: [
      'Traverten, katman katman oluşmuş gözenekli bir doğal taştır. Gözenekler dolgulu ya da doğal bırakılabilir; kesim yönüne göre damarlı veya bulutlu görünür.',
      "Kırıkkale'de en çok aile mezarı, duvar ve cephe kaplaması, merdiven ve dış mekan zemininde kullanıyoruz.",
    ],
    props: [['Renk', 'Bej, krem, açık kahve'], ['Yüzey', 'Honlu, eskitme, dolgulu'], ['Kullanım', 'Aile mezarı, cephe, avlu, havuz kenarı']],
    care: 'Dış mekanda yılda bir koruyucu (empregnasyon) uygulaması gözeneklerin kir tutmasını azaltır.',
    services: ['kirikkale-mezar-yapimi', 'kirikkale-andezit-bazalt-tas-kaplama', 'kirikkale-basamak-merdiven-mermer'],
  },
  {
    slug: 'gri-mermer', key: 'gri', name: 'Gri Mermer', tone: 'Gri',
    slab: { px: 'gri-levha' }, app: { px: 'gri-uygulama' },
    lead: 'Koyu zemin üzerinde belirgin açık damarlarıyla gri mermer; ağırbaşlı, modern bir görünüm ister.',
    desc: [
      'Gri mermer, beyaza göre kiri ve kullanım izini daha az gösterir. Bu yüzden giriş holü, merdiven ve zemin uygulamalarında tercih edilir.',
      'Mezar yapımında beyaz ve siyah taşla birlikte kullanıldığında katmanlı, dengeli bir görünüm verir.',
    ],
    props: [['Renk', 'Gri, antrasit, açık damar'], ['Yüzey', 'Cilalı veya honlu'], ['Kullanım', 'Mezar, zemin, merdiven, duvar']],
    care: 'Düzenli silmek yeterlidir; cilalı yüzeyde aşındırıcı temizleyici kullanılmamalıdır.',
    services: ['kirikkale-mezar-yapimi', 'kirikkale-basamak-merdiven-mermer'],
  },
  {
    slug: 'siyah-granit', key: 'granit', name: 'Siyah Granit', tone: 'Siyah',
    slab: { tex: 'granit2' }, app: { px: 'granit-uygulama' },
    lead: 'Sert, yoğun ve leke tutmayan siyah granit; uzun ömürlü bir mezar ya da her gün kullanılan bir mutfak tezgahı için güvenli seçim.',
    desc: [
      'Granit, mermerden daha serttir; çizilmeye, ısıya ve dona karşı dayanıklıdır. Cilalandığında derin bir parlaklık kazanır ve bunu uzun yıllar korur.',
      'Mezarda baş taşı ve çerçevede, mutfakta tezgah ve eviye çevresinde, dış merdivenlerde basamak olarak kullanıyoruz.',
    ],
    props: [['Renk', 'Siyah, gri benekli'], ['Yüzey', 'Cilalı veya alevli (pürüzlü)'], ['Kullanım', 'Mezar, mutfak tezgahı, dış merdiven']],
    care: 'Leke tutmaz; günlük temizlik için su ve yumuşak bir bez yeterlidir.',
    services: ['kirikkale-mezar-yapimi', 'kirikkale-mutfak-tezgahi', 'kirikkale-basamak-merdiven-mermer'],
  },
  {
    slug: 'andezit', key: 'andezit', name: 'Andezit', tone: 'Gri',
    slab: { px: 'andezit-levha' }, app: { px: 'andezit-uygulama' },
    lead: 'Dona dayanıklı, pürüzlü yüzeyli volkanik taş andezit; bahçe, kaldırım, dış merdiven ve havuz kenarı için.',
    desc: [
      "Andezit, Anadolu'da yüzyıllardır dış mekanda kullanılan dayanıklı bir taştır. Patlatma, çekiçleme ya da kumlama ile yüzeyi pürüzlendirildiğinde ıslakken bile kaymaz.",
      "Kırıkkale'nin sert kışında dona dayandığı için bahçe yolu, avlu, dış merdiven ve kaldırım işlerinde ilk önerdiğimiz taştır.",
    ],
    props: [['Renk', 'Gri, pembemsi gri'], ['Yüzey', 'Patlatma, çekiçleme, kumlama'], ['Kullanım', 'Bahçe, kaldırım, dış merdiven']],
    care: 'Basınçlı su ile yıkanabilir; tuz ve kimyasal buz çözücüler uzun vadede yüzeyi yıpratır.',
    services: ['kirikkale-andezit-bazalt-tas-kaplama', 'kirikkale-karo-bordur-tasi', 'kirikkale-basamak-merdiven-mermer'],
  },
  {
    slug: 'patinatolu-bazalt', key: 'bazalt', name: 'Patinatolu Bazalt', tone: 'Antrasit',
    slab: { px: 'bazalt-levha' }, app: { px: 'bazalt-uygulama' },
    lead: 'Koyu rengi ve eskitilmiş kenarlarıyla patinatolu bazalt; avlu, teras ve yürüyüş yollarına yıllanmış, doğal bir hava katar.',
    desc: [
      'Patinato, taşın kenar ve yüzeylerinin özel bir işlemle eskitilmesidir. Bazalta yumuşatılmış köşeler ve doğal, yıllanmış bir görünüm kazandırır.',
      'Koyu tonu yeşil alanla güzel bir kontrast oluşturur; teras, avlu ve bahçe yollarında kullanıyoruz.',
    ],
    props: [['Renk', 'Antrasit, siyah'], ['Yüzey', 'Patinato (eskitme)'], ['Kullanım', 'Avlu, teras, yürüyüş yolu']],
    care: 'Dış mekanda bakım gerektirmez; derzlerdeki ot ve yosun yılda bir temizlenmelidir.',
    services: ['kirikkale-andezit-bazalt-tas-kaplama', 'kirikkale-karo-bordur-tasi'],
  },
];

// Giriş slaytları (örnek mekân görselleri, Pexels)
export const slides = [
  { px: 'hero-mutfak', kicker: 'Kırıkkale mermer, mezar ve karo işleri', title: 'Taşın en güzel hali', text: 'Mezardan mutfağa, basamaktan bahçeye; Kırıkkale’de doğal taşla ilgili her işi ölçüden montaja kendimiz yapıyoruz.', link: '/kirikkale-mutfak-tezgahi/', linkText: 'Mutfak tezgahları' },
  { px: 'hero-banyo', kicker: 'Beyaz mermer · Traverten · Gri mermer', title: 'Doğal taşta usta işçilik', text: 'Plakaları birlikte seçiyor, ölçüyü yerinde alıyor, işi kendi ekibimizle teslim ediyoruz.', link: '/koleksiyon/', linkText: 'Taş koleksiyonu' },
  { px: 'hero-merdiven', kicker: 'Basamak · Merdiven · Denizlik', title: 'Kalıcı, sağlam, zarif', text: 'Konut, site ve iş yeri inşaatlarında basamak, merdiven, denizlik ve zemin mermer işleri.', link: '/kirikkale-basamak-merdiven-mermer/', linkText: 'Basamak ve merdiven' },
];

// ---------- Kuvars tezgâh markaları (2026-11-28) ----------
// Hasbey'de numune kataloğu bulunan markalar (kullanıcının gönderdiği katalog fotoğrafları: Coante Essence,
// Calisco, Çimstone, Maestro Quartz Design). Renk adı, kod ve görseller markaların resmi sitelerinden alındı;
// her marka sayfasında kaynak yazılı. Görseller: public/assets/img/kuvars/<marka>/<renk>-{levha,uygulama}.
// c: [dosya adı, resmi ad, kod, seri/not, görünüm]
export const quartz = [
  {
    slug: 'coante', name: 'Coante', full: 'Coante Quartz Surfaces', line: 'Essence koleksiyonu',
    site: 'https://www.coante.com/tr/essence', siteLabel: 'coante.com',
    lead: "Coante'nin Essence koleksiyonundan seçtiğimiz kuvars renkleri: Calacatta görünümlü beyaz damarlılardan grafit ve siyaha.",
    bg: 'storia', chips: ['storia', 'alba-via', 'magnificent', 'arte-black', 'majestic-brown'],
    colors: [
      ['storia', 'Storia', '9904', 'Mega serisi', 'Beyaz zemin, dallanan gri damar'],
      ['calacatta-riviera', 'Calacatta Riviera Ultra', '9004', 'Ultra serisi', 'Beyaz zemin, kümelenen gri damar'],
      ['thunder', 'Thunder', '9908', 'Mega serisi', 'Beyaz zemin, ince paralel damar'],
      ['tenera', 'Tenera Ultra', '9007', 'Ultra serisi', 'Beyaz zemin, ince dağınık damar'],
      ['majestic-brown', 'Majestic Brown', '9905', 'Mega serisi', 'Beyaz zemin, gri-kahve damar'],
      ['alba-via', 'Alba Via', '5507', 'Emotional serisi', 'Açık bej zemin, ince damar'],
      ['keramos', 'Keramos', '3301', 'Antique serisi', 'Beyaz zemin, ince gri desen'],
      ['magnificent', 'Magnificent', '5503', 'Emotional serisi', 'Gri zemin, dalgalı açık damar'],
      ['arte-black', 'Arte Black', '7716', 'Allure serisi', 'Siyah zemin, ince beyaz damar'],
    ],
  },
  {
    slug: 'calisco', name: 'Calisco', full: 'Calisco Quartz Surfaces', line: 'Kuvars yüzeyler',
    site: 'https://www.calisco.com.tr/urunler', siteLabel: 'calisco.com.tr',
    lead: "Calisco'nun mermer görünümlü kuvars renkleri: geniş damarlı Calacatta beyazlarından bej, kahve ve siyaha.",
    bg: 'calacatta-clara', chips: ['calacatta-clara', 'piana', 'olivia', 'felisia', 'santa'],
    colors: [
      ['calacatta-clara', 'Calacatta Clara', '7352', '', 'Beyaz zemin, geniş krem damar'],
      ['calacatta-aldeon', 'Calacatta Aldeon', '7134', '', 'Beyaz zemin, geniş gri damar'],
      ['bolera', 'Bolera', '7268', '', 'Beyaz zemin, seyrek ince damar'],
      ['milena', 'Milena', '3301', '', 'Beyaz zemin, ince gri damar'],
      ['piana', 'Piana', '7835', '', 'Krem zemin, ince altın tonlu damar'],
      ['olivia', 'Olivia', '4405', '', 'Bej zemin, koyu kıvrımlı damar'],
      ['felisia', 'Felisia', '3302', '', 'Koyu kahve-gri zemin, beyaz damar'],
      ['santa', 'Santa', '3303', '', 'Siyah zemin, ince beyaz damar'],
      ['sadira', 'Sadira', '2210', '', 'Siyah zemin, ince benek ve damar'],
    ],
  },
  {
    slug: 'cimstone', name: 'Çimstone', full: 'Çimstone Kuvars Yüzeyler', line: 'EPIQ koleksiyonu',
    site: 'https://cimstone.com.tr/koleksiyonlar/', siteLabel: 'cimstone.com.tr',
    lead: "Çimstone'un EPIQ koleksiyonundan büyük damarlı, mermer görünümlü kuvars yüzeyler: Calacatta beyazlarından traverten ve koyu griye.",
    bg: 'calacatta-anka', chips: ['calacatta-anka', 'hatra', 'leptis-magna', 'pompei', 'atlantis'],
    colors: [
      ['calacatta-anka', 'Calacatta Anka', '2081', 'EPIQ', 'Beyaz zemin, altın ve gri damar'],
      ['calacatta-lal', 'Calacatta Lâl', '2094', 'EPIQ', 'Beyaz zemin, belirgin gri damar'],
      ['calacatta-tikal', 'Calacatta Tikal', '2087', 'EPIQ', 'Beyaz zemin, çapraz gri damar'],
      ['arpels', 'Arpels', '2038', 'EPIQ', 'Beyaz zemin, yoğun gri damar ağı'],
      ['hatra', 'Hatra', '2057', 'EPIQ', 'Beyaz zemin, kahve-bej damar'],
      ['amber', 'Amber', '2045', 'EPIQ', 'Açık gri zemin, bakır tonlu damar'],
      ['leptis-magna', 'Leptis Magna', '2014', 'EPIQ', 'Traverten görünümlü bej'],
      ['pompei', 'Pompei', '2055', 'EPIQ', 'Koyu gri zemin, beyaz damar'],
      ['atlantis', 'Atlantis', '2017', 'EPIQ', 'Mavi-yeşil zemin, altın tonlu damar'],
    ],
  },
  {
    slug: 'maestro', name: 'Maestro', full: 'Maestro Quartz Design', line: 'Granitaş kuvars markası',
    site: 'https://maestroquartzdesign.com/urunler/maestro-quartz', siteLabel: 'maestroquartzdesign.com',
    lead: "Granitaş'ın kuvars markası Maestro Quartz Design'dan renkler: damarlı beyaz ve kremlerden düz griye ve siyaha.",
    bg: 'norma', chips: ['gilda', 'isolde', 'figaro', 'bolero', 'norma'],
    colors: [
      ['gilda', 'Gilda', '207', '', 'Beyaz zemin, kısa gri damar'],
      ['spring', 'Spring', '501', '', 'Krem zemin, seyrek gri damar'],
      ['amore', 'Amore', '604', '', 'Krem-beyaz zemin, ince damar'],
      ['figaro', 'Figaro', '502', '', 'Gri zemin, ince açık damar'],
      ['fortuna', 'Fortuna', '504', '', 'Siyah zemin, beyaz damar'],
      ['norma', 'Norma', '605', '', 'Siyah zemin, ince beyaz damar'],
      ['isolde', 'Isolde', '208', '', 'Düz krem'],
      ['moonlight', 'Moonlight', '304', '', 'Siyah zemin, parlak benek'],
      ['bolero', 'Bolero', '102', '', 'Düz koyu gri'],
    ],
  },
].map((b) => ({ ...b, colors: b.colors.map(([file, name, code, series, tone]) => ({ file, name, code, series, tone })) }));
