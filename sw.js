// === Service Worker — çevrimdışı oynanabilirlik ===
//
// Oyun tamamen statik dosyalardan oluşuyor ve backend'i yok; bu yüzden basit
// bir "uygulama kabuğu" önbelleği yeterli: ilk ziyarette her şey kaydedilir,
// sonraki açılışlar internetsiz de çalışır.
//
// SÜRÜM: Dosyalardan biri değiştiğinde bu numarayı artırın. Eski önbellek
// activate sırasında silinir; aksi halde kullanıcı güncellemeyi hiç görmez.
const SURUM = "sizma-v12";

// Geliştirme ortamı mı? Yerel sunucuda (python -m http.server, Live Server vb.)
// önbellek-öncelikli davranış işi zorlaştırıyor; aşağıdaki fetch dalı buna bakar.
// Yayına alınan sürüm gerçek bir alan adından servis edileceği için orada false.
const GELISTIRME =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "[::1]" ||
  self.location.hostname === "";

// Yalnızca yerel dosyalar. Google Fonts bilerek dışarıda: üçüncü taraf isteği
// önbelleğe alınırsa çevrimdışıyken sessizce başarısız olabiliyor ve açılışı
// geciktiriyor. Font gelmezse CSS'teki monospace yedeğine düşülür (--font-main).
const DOSYALAR = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/storage.js",
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
      fetch(istek).catch(() => caches.match("./index.html", { ignoreSearch: true }))
    );
    return;
  }

  // Diğer yerel varlıklar: önce önbellek (hızlı açılış), yoksa ağdan al ve
  // sakla. Üçüncü taraf istekleri (fontlar) dokunulmadan geçer.
  const url = new URL(istek.url);
  if (url.origin !== self.location.origin) return;

  // Geliştirmede önce ağ. Önbellek-öncelikli dal, SURUM artırılmadıkça
  // düzenlenen dosyayı hiç göstermiyor: kod değişiyor, tarayıcı eskisini
  // sunuyor, "değişiklik neden görünmüyor" avına çıkılıyor. Çevrimdışı
  // güvencesi burada da duruyor — ağ yoksa önbelleğe düşülür.
  if (GELISTIRME) {
    e.respondWith(
      // no-store şart: yerel sunucu (python http.server) Cache-Control
      // göndermiyor, tarayıcı da Last-Modified'a bakıp sezgisel önbellekleme
      // yapıyor. Düz fetch bu yüzden yine eski dosyayı getiriyordu — ağ-öncelikli
      // dal doğru çalışıyor ama önündeki HTTP önbelleği onu boşa çıkarıyordu.
      fetch(istek, { cache: "no-store" })
        .then((yanit) => {
          if (yanit && yanit.ok) {
            const kopya = yanit.clone();
            caches.open(SURUM).then((c) => c.put(istek, kopya));
          }
          return yanit;
        })
        .catch(() => caches.match(istek, { ignoreSearch: true }))
    );
    return;
  }

  e.respondWith(
    caches.match(istek, { ignoreSearch: true }).then((bulunan) => {
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
