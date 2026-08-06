// === Service Worker — çevrimdışı oynanabilirlik ===
//
// Oyun tamamen statik dosyalardan oluşuyor ve backend'i yok; bu yüzden basit
// bir "uygulama kabuğu" önbelleği yeterli: ilk ziyarette her şey kaydedilir,
// sonraki açılışlar internetsiz de çalışır.
//
// SÜRÜM: Dosyalardan biri değiştiğinde bu numarayı artırın. Eski önbellek
// activate sırasında silinir; aksi halde kullanıcı güncellemeyi hiç görmez.
const SURUM = "sizma-v7";

// Yalnızca yerel dosyalar. Google Fonts bilerek dışarıda: üçüncü taraf isteği
// önbelleğe alınırsa çevrimdışıyken sessizce başarısız olabiliyor ve açılışı
// geciktiriyor. Font gelmezse CSS'teki monospace yedeğine düşülür (--font-main).
const DOSYALAR = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/keyboard.js",
  "./js/stats.js",
  "./js/drills.js",
  "./js/lessons.js",
  "./js/balance.js",
  "./js/audio.js",
  "./js/badges.js",
  "./js/settings.js",
  "./js/main.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SURUM)
      .then((c) => c.addAll(DOSYALAR))
      // Yeni sürüm beklemeden devreye girsin
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((adlar) => Promise.all(
        adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const istek = e.request;
  if (istek.method !== "GET") return;

  // Gezinme isteği (adres çubuğundan açılış): önce ağ, olmazsa önbellekteki
  // index.html. Böylece çevrimiçiyken hep güncel sürüm gelir, çevrimdışıyken
  // oyun yine açılır.
  if (istek.mode === "navigate") {
    e.respondWith(
      fetch(istek).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Diğer yerel varlıklar: önce önbellek (hızlı açılış), yoksa ağdan al ve
  // sakla. Üçüncü taraf istekleri (fontlar) dokunulmadan geçer.
  const url = new URL(istek.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(istek).then((bulunan) => {
      if (bulunan) return bulunan;
      return fetch(istek).then((yanit) => {
        if (yanit && yanit.ok) {
          const kopya = yanit.clone();
          caches.open(SURUM).then((c) => c.put(istek, kopya));
        }
        return yanit;
      });
    })
  );
});
