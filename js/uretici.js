// === Komut üreteci ===
//
// Sorun: komut bankası sabit bir listeydi. Torba tekrarsız dağıtıyor ama torba
// bitince AYNI liste yeniden karışıyor, yani havuz ne kadar büyürse büyüsün
// döngü kaçınılmaz — sadece periyodu uzuyor. 90 komutluk TR havuzu orta
// seviyede ~6 oyunda tükeniyordu.
//
// Elle komut yazmak TOPLAMALI: bir komut yazarsın, +1 komut olur.
// Kelime listesi ÇARPIMSAL: bir nesne yazarsın +5, bir fiil yazarsın +9 komut.
// Bu dosyaya kelime eklemek, aynı emekle kat kat fazla komut demek.
//
// Elle yazılmış bankaların YERİNE geçmiyor, YANINA ekleniyor (bkz. cmdPool):
// oradakiler seçilmiş, kurguya oturmuş komutlar; burası hacmi dolduruyor.

// --- Türkçe ---
//
// Nesneler BELİRTME HÂLİYLE yazılıyor ("bağlantıyı", "çekirdeği"). Ünlü uyumu
// düzenli ama istisnalı (çekirdek → çekirdeği, log → logu); kural yazıp hata
// riski almak yerine çekilmiş hâli doğrudan yazmak sıfır hata demek.
//
// tur alanı şart: olmadan "kamerayı çöz", "algoritmayı aç" gibi saçma
// eşleşmeler üretiliyor. Her fiil hangi türlerle çalıştığını söylüyor.
const U_NESNELER = [
  { ad: "bağlantıyı",        tur: "ağ" },
  { ad: "ağ geçidini",       tur: "ağ" },
  { ad: "veri akışını",      tur: "ağ" },
  { ad: "sinyali",           tur: "ağ" },
  { ad: "tüneli",            tur: "ağ" },
  { ad: "portu",             tur: "ağ" },
  { ad: "logları",           tur: "veri" },
  { ad: "veritabanını",      tur: "veri" },
  { ad: "dosyayı",           tur: "veri" },
  { ad: "yedeği",            tur: "veri" },
  { ad: "belleği",           tur: "veri" },
  { ad: "kütüğü",            tur: "veri" },
  { ad: "şifreyi",           tur: "kripto" },
  { ad: "anahtarı",          tur: "kripto" },
  { ad: "sertifikayı",       tur: "kripto" },
  { ad: "algoritmayı",       tur: "kripto" },
  { ad: "kilidi",            tur: "kilit" },
  { ad: "sunucuyu",          tur: "sistem" },
  { ad: "çekirdeği",         tur: "sistem" },
  { ad: "servisi",           tur: "sistem" },
  { ad: "işlemi",            tur: "sistem" },
  { ad: "oturumu",           tur: "sistem" },
  { ad: "güvenlik duvarını", tur: "sistem" },
  { ad: "kamerayı",          tur: "cihaz" },
  { ad: "diski",             tur: "cihaz" },
  { ad: "uyduyu",            tur: "cihaz" },
  { ad: "sensörü",           tur: "cihaz" },
];

const U_FIILLER = [
  { ad: "kes",              turler: ["ağ"] },
  { ad: "aç",               turler: ["ağ", "kilit"] },
  { ad: "çöz",              turler: ["kripto", "kilit"] },
  { ad: "sil",              turler: ["veri"] },
  { ad: "kopyala",          turler: ["veri"] },
  { ad: "gizle",            turler: ["veri"] },
  { ad: "ele geçir",        turler: ["sistem", "cihaz", "kripto"] },
  { ad: "dondur",           turler: ["sistem", "cihaz"] },
  { ad: "yeniden başlat",   turler: ["sistem", "cihaz"] },
  { ad: "taklit et",        turler: ["kripto", "ağ"] },
  { ad: "devre dışı bırak", turler: ["cihaz", "sistem"] },
  { ad: "şifrele",          turler: ["ağ", "veri"] },
  { ad: "yönlendir",        turler: ["ağ"] },
  { ad: "sızdır",           turler: ["veri"] },
  { ad: "tara",             turler: ["ağ", "sistem"] },
];

// Türkçede tarz zarfı FİİLDEN ÖNCE gelir: "bağlantıyı sessizce şifrele".
// ("sessizce bağlantıyı şifrele" kulağa yanlış geliyor.)
const U_ZARFLAR = [
  "sessizce", "hızlıca", "tamamen", "kalıcı olarak", "iz bırakmadan", "uzaktan",
];

// Boss komutları uzun olmalı (elle yazılanların ortalaması ~33 karakter).
// Sonek eklemek bunu tek başına sağlıyor; önek de eklenince komutlar
// gereksiz uzayıp havuz 4400'e şişiyordu.
const U_BOSS_SONEKLERI = [
  "ve izleri temizle", "sonra bağlantıyı kes", "ve kaydı gizle",
  "ardından oturumu kapat", "ve yetkiyi yükselt",
];

// --- İngilizce ---
// EN düzende Türkçe karakter yazılamaz, bu yüzden ayrı liste (ASCII).
const U_NESNELER_EN = [
  { ad: "the connection",  tur: "net" },
  { ad: "the gateway",     tur: "net" },
  { ad: "the data stream", tur: "net" },
  { ad: "the signal",      tur: "net" },
  { ad: "the tunnel",      tur: "net" },
  { ad: "the port",        tur: "net" },
  { ad: "the logs",        tur: "data" },
  { ad: "the database",    tur: "data" },
  { ad: "the file",        tur: "data" },
  { ad: "the backup",      tur: "data" },
  { ad: "the memory",      tur: "data" },
  { ad: "the record",      tur: "data" },
  { ad: "the cipher",      tur: "crypto" },
  { ad: "the key",         tur: "crypto" },
  { ad: "the certificate", tur: "crypto" },
  { ad: "the algorithm",   tur: "crypto" },
  { ad: "the lock",        tur: "lock" },
  { ad: "the server",      tur: "system" },
  { ad: "the kernel",      tur: "system" },
  { ad: "the service",     tur: "system" },
  { ad: "the process",     tur: "system" },
  { ad: "the session",     tur: "system" },
  { ad: "the firewall",    tur: "system" },
  { ad: "the camera",      tur: "device" },
  { ad: "the disk",        tur: "device" },
  { ad: "the satellite",   tur: "device" },
  { ad: "the sensor",      tur: "device" },
];

const U_FIILLER_EN = [
  { ad: "cut",     turler: ["net"] },
  { ad: "open",    turler: ["net", "lock"] },
  { ad: "decrypt", turler: ["crypto", "lock"] },
  { ad: "wipe",    turler: ["data"] },
  { ad: "copy",    turler: ["data"] },
  { ad: "hide",    turler: ["data"] },
  { ad: "seize",   turler: ["system", "device", "crypto"] },
  { ad: "freeze",  turler: ["system", "device"] },
  { ad: "restart", turler: ["system", "device"] },
  { ad: "spoof",   turler: ["crypto", "net"] },
  { ad: "disable", turler: ["device", "system"] },
  { ad: "encrypt", turler: ["net", "data"] },
  { ad: "reroute", turler: ["net"] },
  { ad: "leak",    turler: ["data"] },
  { ad: "scan",    turler: ["net", "system"] },
];

// İngilizcede zarf fiilden önce doğal duruyor: "silently wipe the logs".
const U_ZARFLAR_EN = [
  "silently", "quickly", "fully", "permanently", "remotely",
];

const U_BOSS_SONEKLERI_EN = [
  "and clear the traces", "then cut the link", "and hide the record",
  "then close the session", "and escalate rights",
];

// --- Üretim ---

// Aynı kök iki kez geçen komutları ele: "ana bağlantıyı kes sonra bağlantıyı
// kes", "gizli belleği gizle ve izleri temizle" gibi çıktılar üretiliyordu
// (boss havuzunun %8,6'sı). İlk dört harf karşılaştırması bunları yakalıyor.
// Kısa kelimeler (the, and, ve, bir...) atlanır: bunlar anlamlı kök değil,
// doğal olarak tekrar ederler. Atlanmazsa İngilizce boss komutlarının neredeyse
// tamamı "the" iki kez geçiyor diye eleniyordu (havuz 648 yerine 160'ta kaldı).
function u_kokTekrariVar(metin) {
  const kokler = metin
    .split(" ")
    .filter((k) => k.length >= 4)
    .map((k) => k.slice(0, 4).toLowerCase());
  for (let i = 0; i < kokler.length; i++) {
    if (kokler.indexOf(kokler[i]) !== i) return true;
  }
  return false;
}

// nesne + (zarf) + fiil — Türkçe dizilişi. İngilizce için zarf başa alınır.
function u_uret(nesneler, fiiller, zarflar, zarfOnce) {
  const out = [];
  for (const n of nesneler) {
    for (const f of fiiller) {
      if (!f.turler.includes(n.tur)) continue;
      const temel = zarfOnce ? (f.ad + " " + n.ad) : (n.ad + " " + f.ad);
      if (!u_kokTekrariVar(temel)) out.push(temel);
      for (const z of zarflar) {
        const uzun = zarfOnce
          ? (z + " " + f.ad + " " + n.ad)
          : (n.ad + " " + z + " " + f.ad);
        if (!u_kokTekrariVar(uzun)) out.push(uzun);
      }
    }
  }
  return out;
}

// Boss komutunun üst sınırı BALANCE'ta (bossMaxLen) — gerekçesi orada yazılı.
// balance.js bu dosyadan önce yükleniyor; yine de yoksa makul bir varsayılan.
const U_BOSS_MAX = (typeof BALANCE !== "undefined" && BALANCE.bossMaxLen) || 40;

// Boss havuzu İKİ kaynaktan gelir: zarflı (orta boy) + sonekli (uzun).
// Yalnız sonek kullanılınca dağılım 35 karakterde sıkışıyor ve kısa komut
// hiç kalmıyordu; elle yazılmış bankada medyan 28'di, nefes payı oradan
// geliyordu. Karışım o payı geri veriyor.
function u_uretBoss(nesneler, fiiller, sonekler, zarflar, zarfOnce) {
  const out = [];
  const ekle = (metin) => {
    if (metin.length <= U_BOSS_MAX && !u_kokTekrariVar(metin)) out.push(metin);
  };
  for (const n of nesneler) {
    for (const f of fiiller) {
      if (!f.turler.includes(n.tur)) continue;
      const temel = zarfOnce ? (f.ad + " " + n.ad) : (n.ad + " " + f.ad);
      // Orta boy: nesne + zarf + fiil
      for (const z of zarflar) {
        ekle(zarfOnce ? (z + " " + f.ad + " " + n.ad) : (n.ad + " " + z + " " + f.ad));
      }
      // Uzun: nesne + fiil + sonek
      for (const s of sonekler) ekle(temel + " " + s);
    }
  }
  return out;
}

// Yükleme anında bir kez kurulur; her çekimde yeniden hesaplamanın anlamı yok.
const URETILEN_TR      = u_uret(U_NESNELER, U_FIILLER, U_ZARFLAR, false);
const URETILEN_BOSS_TR = u_uretBoss(U_NESNELER, U_FIILLER, U_BOSS_SONEKLERI, U_ZARFLAR, false);
const URETILEN_EN      = u_uret(U_NESNELER_EN, U_FIILLER_EN, U_ZARFLAR_EN, true);
const URETILEN_BOSS_EN = u_uretBoss(U_NESNELER_EN, U_FIILLER_EN, U_BOSS_SONEKLERI_EN, U_ZARFLAR_EN, true);
