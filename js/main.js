// === 10 Parmak Yazma Oyunu — ana betik ===

// --- DOM tutamaçları: HTML'deki id'leri JavaScript'e bağla ---
const playfield = document.getElementById("playfield");
const clockEl   = document.getElementById("clock");
const scoreClockContainer = document.getElementById("scoreClockContainer");
const termInputEl = document.getElementById("termInput");
const comboDisplayEl = document.getElementById("comboDisplay");
const scoreEl   = document.getElementById("score");
const statusEl  = document.getElementById("status");

// Menü / oyun sonu ekranı tutamaçları
const menuEl       = document.getElementById("menu");
const gameoverEl   = document.getElementById("gameover");
const finalScoreEl = document.getElementById("finalScore");
const bestScoreEl  = document.getElementById("bestScore");
const menuBestEl   = document.getElementById("menuBest");
const restartBtn   = document.getElementById("restartBtn");
const terminalEl   = document.getElementById("terminal");
const flashEl      = document.getElementById("flashOverlay");
const matrixCanvas = document.getElementById("matrixRain");
const inputTextEl  = document.getElementById("inputText");

// Erişilebilirlik: hareket azaltma tercihi
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- İçerik bankaları: komut / gürültü / işaret ayrı ayrı ---
// Cümleler bunlardan birleştirilerek üretilir → bol çeşitlilik.
// TR bankası GERÇEK Türkçe karakterler içerir (ı ğ ü ş ö ç) — 10 parmak
// eğitiminin amacı bu; gürültüyle de tutarlı olur.
const COMMANDS_TR = [
  "sisteme bağlan", "şifreyi çöz", "kayıtları sil", "veriyi indir", "kapıyı aç",
  "güvenliği kapat", "izleri temizle", "ağı tara", "erişim ver", "alarmı durdur",
  "yedeği al", "bağlantıyı kes", "portu aç", "sunucuyu ele geçir", "parolayı kır",
  "kamerayı kapat", "sinyali boz", "diski şifrele", "kilidi aç", "günlüğü sil",
  "ağa sız", "kodu çalıştır", "dosyayı gizle", "sunucuyu tara", "trafiği dinle",
  "paketi yakala", "anahtarı üret", "oturumu çal", "yetkiyi yükselt", "kabuğu aç",
  "arka kapı kur", "modülü yükle", "belleği oku", "sürücüyü bağla", "adresi çöz",
  "vekili değiştir", "zinciri kır", "imzayı taklit et", "katmanı geç", "servisi durdur",
  "önbelleği boşalt", "görevi sonlandır", "işlemi gizle", "kütüğü değiştir",
  "parmak izini sil", "uydu bağlantısı kur", "veri akışını böl", "şifreyi yenile",
  // Yeni eklenenler:
  "veritabanını kopyala", "sistemi dondur", "truva atı gönder", "kalkanları indir",
  "cihazı sıfırla", "ağ geçidini aç", "logları temizle", "kamerayı hackle", 
  "bağlantıyı şifrele", "güvenlik kodunu kır", "veri merkezine sız", "sinyali takip et",
  "sunucuyu yeniden başlat", "proxy ayarlarını değiştir", "ip adresini maskele",
  "mac adresini klonla", "ddos saldırısı başlat", "botnet ağını etkinleştir",
  "hedef portları tara", "güvenlik kalkanını test et", "virüs taramasını başlat",
  "veri sızıntısını engelle", "güvenlik açığını bul", "yazılımı güncelle",
  "kablosuz ağı kır", "şifreli mesajı çöz", "şifreli dosyayı aç",
  "kötü amaçlı yazılımı sil", "ağ trafiğini analiz et", "siber saldırıyı durdur",
  "veri tabanını onar", "erişim günlüğünü indir", "sistem yapılandırmasını al",
  "izinsiz girişi tespit et", "yönetici panelini aç", "misafir erişimini kapat",
  "kullanıcı hesabını kilitle", "yedek sunucuya geç", "acil durum protokolünü aç",
  "bağlantı noktalarını kapat", "yapay zekayı devre dışı bırak", "siber güvenliği sağla"
];

// Boss komut bankası (uzun, zor komutlar)
const BOSS_COMMANDS_TR = [
  "güvenliği devre dışı bırak", "ana sisteme erişim sağla", "tüm kayıtları yedekle",
  "uzaktan bağlantı kur", "şifreleme anahtarını bul", "güvenlik duvarını kaldır",
  "merkez sunucuya sız", "yönetici yetkisi al", "gizli dosyaları aktar",
  "sistem günlüklerini temizle", "arka kapıyı yerleştir", "ağ trafiğini yönlendir",
  "çekirdek modülünü değiştir", "kimlik doğrulamayı atla", "yedek diski çöz",
  "izleme sistemini kandır", "ana anahtarı ele geçir", "protokolü yeniden yaz",
  // Yeni eklenenler:
  "merkezi güç kaynağını kes", "kripto kilitlerini kır", "kullanıcı veritabanını indir",
  "yüksek güvenlik protokolünü atla", "otomatik savunma sistemini durdur",
  "uydu şifreleme algoritmasını çöz", "ana sunucu bağlantısını sabote et",
  "ana bilgisayar şifresini kırma işlemini başlat",
  "kriptografik savunma hattını yarıp içeri sız",
  "merkezi veri tabanındaki tüm kullanıcıları kopyala",
  "ulusal ağ geçidi güvenlik kalkanını devre dışı bırak",
  "sistem çekirdeğindeki kötü amaçlı kodları temizle",
  "otomatik saldırı önleme mekanizmasını etkisizleştir",
  "gizli hükümet protokolü iletişim hattını dinle",
  "sunucu çiftliğindeki tüm yedekleme ünitelerini sil",
  "çok katmanlı şifreleme algoritmasını çöz",
  "şüpheli ağ aktivitelerinin kaynağını tespit et",
  "global yönlendirme protokolü tablolarını değiştir",
  "felaket kurtarma planı modüllerini aktif hale getir",
  "karanlık ağ üzerinden güvenli bir bağlantı tüneli kur",
  "hedef ağdaki tüm iletişim cihazlarını hackle",
  "yapay zeka destekli savunma sistemini kandır"
];

// EN düzeni seçilirse Türkçe karakter yazılamaz → ayrı İngilizce bank
const COMMANDS_EN = [
  "connect system", "crack password", "delete logs", "download data", "open the gate",
  "disable security", "clear traces", "scan network", "grant access", "stop the alarm",
  "backup files", "cut connection", "open port", "seize server", "break the key",
  "kill process", "hide the file", "mount drive", "flush cache", "spoof address",
  "inject payload", "escalate rights", "trace signal", "dump memory", "patch kernel",
  "sniff traffic", "forge token", "unlock vault", "reroute proxy", "wipe the disk",
  // Yeni eklenenler:
  "copy database", "freeze system", "send trojan", "lower shields", "reset device",
  "open gateway", "clear logs", "hack camera", "encrypt connection", "crack security",
  "infiltrate center", "follow the signal",
  "reboot the server", "change proxy settings", "mask ip address",
  "clone mac address", "launch ddos attack", "activate botnet swarm",
  "scan target ports", "test security shield", "start virus scan",
  "prevent data leak", "find security flaw", "update software now",
  "crack wireless net", "decode hidden message", "open encrypted file",
  "delete malware now", "analyze net traffic", "stop cyber attack",
  "repair database now", "download access log", "get system config",
  "detect intrusion now", "open admin panel", "close guest access",
  "lock user account", "switch to backup", "start panic protocol",
  "close open ports", "disable rogue ai", "ensure cyber safety"
];

const BOSS_COMMANDS_EN = [
  "disable the firewall", "gain root access now", "backup all the records",
  "establish remote link", "find encryption key", "tear down the wall",
  "breach the main server", "escalate admin rights", "transfer hidden files",
  "purge the system logs", "plant a backdoor here", "reroute network traffic",
  // Yeni eklenenler:
  "cut central power supply", "break crypto locks", "download user database",
  "bypass high security protocol", "stop automated defense system",
  "decrypt satellite algorithm", "sabotage main server link",
  "initiate mainframe password cracking sequence",
  "breach the cryptographic defense perimeter",
  "clone all users from the central database",
  "disable the national gateway security shield",
  "purge malicious code from the system core",
  "neutralize automated intrusion prevention",
  "eavesdrop on classified government comms",
  "wipe all backup arrays in the server farm",
  "solve multi layered encryption algorithm",
  "pinpoint the source of suspicious activity",
  "alter global routing protocol parameters",
  "activate disaster recovery plan modules",
  "establish secure tunnel via the dark web",
  "hack all comm devices in the target grid",
  "deceive artificial intelligence defenses"
];

// Gürültü parçaları (bitişik, boşluksuz kırıntılar)
const NOISE_TR = [
  "sabahınköründe", "kapıyısessizce", "panikyapmadan", "hızlıcaönce", "kimseyoktu",
  "karanlıktı", "alarmçalarken", "ekranlaryanıp", "güvenlikkameraları", "dönerken",
  "usulcayavaş", "koridordan", "içerisüzüldü", "nefesalıp", "beklemeyebaşladı",
  "sunucuçökmeden", "izinibırakmadan", "günlükleritemizleyip", "odadansessizce",
  "uzaklaştı", "merdivenlerden", "gölgelerinarasında", "kayboldu", "kabloyuçekip",
  "dikkatlice", "çevreyikontroledip", "arkasınabakmadan", "birdenbire", "gizlice",
];

const NOISE_EN = [
  "inthedeadofnight", "thedoorclickedshut", "nobodywaswatching", "screensflickered",
  "thecorridorwasdark", "alarmshummingfaint", "hesliddowntheline", "keepingcountsilent",
  "cablesrunningcold", "serverfansscreaming", "shadowsonthewall", "hepressedonward",
  "notraceleftbehind", "thelogswereburning", "stairwellwasempty", "hevanishedquietly",
];

// İşaret çiftleri (her cümlede rastgele biri)
const MARKERS = [["[","]"], ["$","$"], ["(",")"], ["<",">"], ["{","}"]];

// Aktif klavye düzeni (initKeyboard tarafından ayarlanır)
let currentLayout = "TR-Q";
function isEnLayout() { return currentLayout === "EN"; }

// Düzenin diline göre doğru bankayı ver.
//
// Elle yazılmış banka + js/uretici.js'in ürettikleri birleştirilir: elle
// yazılanlar seçilmiş, kurguya oturmuş komutlar, üretilenler hacmi doldurur.
// Üreteç yoksa (dosya yüklenmediyse) oyun eski hâliyle çalışmaya devam eder.
//
// Birleştirme bir kez yapılıp saklanır — cmdPool her komut çekiminde
// çağrılıyor, her seferinde yüzlerce elemanlı diziyi birleştirmek israf olur.
const _havuzlar = {};
function birlesikHavuz(ad, elle, uretilen) {
  if (!_havuzlar[ad]) {
    _havuzlar[ad] = Array.isArray(uretilen)
      ? Array.from(new Set(elle.concat(uretilen)))   // tekrarları ele
      : elle;
  }
  return _havuzlar[ad];
}

// Normal havuzda da uzunluk sınırı var (bkz. BALANCE.cmdMaxLen): boss'a sınır
// konulurken normal komutlar atlanmıştı ve üreteç oraya 48 karakterlik komutlar
// koyuyordu — elle yazılmış bankanın en uzunu 29'du.
function cmdPool() {
  const havuz = isEnLayout()
    ? birlesikHavuz("cmd-en", COMMANDS_EN, typeof URETILEN_EN !== "undefined" ? URETILEN_EN : null)
    : birlesikHavuz("cmd-tr", COMMANDS_TR, typeof URETILEN_TR !== "undefined" ? URETILEN_TR : null);
  const ad = isEnLayout() ? "cmd-en-kisa" : "cmd-tr-kisa";
  if (!_havuzlar[ad]) _havuzlar[ad] = havuz.filter((k) => k.length <= BALANCE.cmdMaxLen);
  return _havuzlar[ad];
}
// Boss havuzunda uzunluk sınırı var: elle yazılmış bankada 53 karakterlik
// komutlar vardı, hedef hızda yazması 15.1 sn — boss satırının ekranda kalma
// süresinden (13.2 sn) uzun, yani yetişilmesi mümkün değildi. Sınır iki
// kaynağa da uygulanıyor (bkz. BALANCE.bossMaxLen).
function bossPool() {
  const havuz = isEnLayout()
    ? birlesikHavuz("boss-en", BOSS_COMMANDS_EN, typeof URETILEN_BOSS_EN !== "undefined" ? URETILEN_BOSS_EN : null)
    : birlesikHavuz("boss-tr", BOSS_COMMANDS_TR, typeof URETILEN_BOSS_TR !== "undefined" ? URETILEN_BOSS_TR : null);
  const ad = isEnLayout() ? "boss-en-kisa" : "boss-tr-kisa";
  if (!_havuzlar[ad]) _havuzlar[ad] = havuz.filter((k) => k.length <= BALANCE.bossMaxLen);
  return _havuzlar[ad];
}
function noisePool(){ return isEnLayout() ? NOISE_EN : NOISE_TR; }

// Bir diziden rastgele eleman seç
function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Tekrar önleyici "torba" (shuffle bag) ---------------------------------
// Sorun: 15 komutluk bankadan rastgele seçince aynı komut ekranda 2-3 kez
// çıkıyor (hangisine kilitlendiğin karışıyor) ve arka arkaya oynanan
// oyunlarda hep aynı komutlar geliyordu.
// Çözüm: bankayı karıştırıp SIRAYLA tüketiyoruz — banka bitmeden hiçbir komut
// tekrar etmiyor. Torba localStorage'da saklanıyor → yeni oyun kaldığı yerden
// devam ediyor, 5 oyun üst üste oynasan da aynı komutlarla karşılaşmıyorsun.
const BAG_KEY = "sizmaCmdBags";
let bags = {};   // { havuzAdı: [kalan komutlar] }

// Günlük görev sırasında torbalar dondurulur: oyuncunun birikmiş torba durumu
// diske yazılmaz ve görev bitince olduğu gibi geri yüklenir. Yoksa günlük
// görev herkeste farklı bir noktadan başlar → "aynı komutlar" garantisi çöker.
let bagsFrozen = false;
let bagsBackup = null;

function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadBags() {
  try { bags = JSON.parse(localStorage.getItem(BAG_KEY)) || {}; }
  catch (e) { bags = {}; }
}
function saveBags() {
  if (bagsFrozen) return;
  try { localStorage.setItem(BAG_KEY, JSON.stringify(bags)); } catch (e) {}
}

// Günlük görev başlarken torbaları boşalt (tohumlu üreteçle yeniden karılsınlar)
function freezeBags() {
  if (bagsFrozen) return;
  bagsBackup = bags;
  bags = {};
  bagsFrozen = true;
}
function unfreezeBags() {
  if (!bagsFrozen) return;
  bags = bagsBackup || {};
  bagsBackup = null;
  bagsFrozen = false;
}

// Havuzdan komut çek. avoid = şu an ekranda olan komutlar (asla kopyalama).
// prefer = antrenman harfleri; torbanın önündeki birkaç aday arasından bu
// harfleri içeren varsa o seçilir (Faz 4 — zayıf parmak hedefleme).
function drawCommand(poolName, pool, avoid, prefer) {
  let bag = bags[poolName];
  if (!Array.isArray(bag) || bag.length === 0) bag = shuffleArr(pool.slice());

  // Antrenman önceliği: torbanın ilk N adayına bak, zayıf harf içereni öne al.
  // Torbadan çekme mantığını bozmuyoruz (yine tüketiliyor) → tekrar garantisi
  // korunuyor; sadece sıra içinde küçük bir kayırma yapılıyor.
  if (prefer && prefer.size && Math.random() < BALANCE.weakBias) {
    const look = Math.min(8, bag.length);
    for (let k = 0; k < look; k++) {
      const cand = bag[k];
      if (avoid && avoid.has(cand)) continue;
      let hit = false;
      for (const ch of cand) if (prefer.has(ch)) { hit = true; break; }
      if (hit) { bag.splice(k, 1); bag.unshift(cand); break; }
    }
  }

  // Ekranda zaten olan bir komut denk gelirse atla, torbanın sonuna at
  let picked = null;
  for (let tries = 0; tries < bag.length; tries++) {
    const c = bag.shift();
    if (avoid && avoid.has(c) && bag.length > 0) { bag.push(c); continue; }
    picked = c;
    break;
  }
  if (picked === null) picked = randItem(pool);       // güvenlik ağı

  if (bag.length === 0) bag = shuffleArr(pool.slice());  // torba bitti → yenile
  bags[poolName] = bag;
  saveBags();
  return picked;
}

// Ekranda şu an YAZILABİLİR kaç komut var? (gürültü, tamamlanmış ve
// ekrana henüz girmemiş satırlar sayılmaz; tuzaklar sayılır çünkü onlar da
// oyuncunun dikkatini ve okuma süresini tüketir)
function activeCmdCount() {
  let n = 0;
  for (const s of sentences) {
    if (s.noiseOnly || s.done || !s.command) continue;
    if (s.y < 0) continue;
    n++;
  }
  return n;
}

// Şu an ekranda inen komutların kümesi (kopya engeli için)
function activeCommands() {
  const set = new Set();
  for (const s of sentences) if (s.command) set.add(s.command);
  return set;
}

// Dışarıya tek giriş noktası
function pickCommand(boss) {
  const en = isEnLayout();
  const name = (boss ? "boss" : "normal") + "-" + (en ? "en" : "tr");
  // Günlükte zayıf-harf kayırması kapalı: oyuncuya özel istatistiğe bağlı
  // olduğu için herkesin komut sırasını farklılaştırırdı.
  const weak = (!isGunluk() && typeof weakLetters === "function") ? weakLetters() : null;
  return drawCommand(name, boss ? bossPool() : cmdPool(), activeCommands(), weak);
}

// Birkaç gürültü parçasını birleştirip uzun bir metin üret.
// count verilmezse seçili zorluğun gürültü yoğunluğu kullanılır.
function buildNoise(count) {
  if (count === undefined) count = difficulty.noiseCount;
  let s = "";
  for (let i = 0; i < count; i++) s += randItem(noisePool());
  return s;
}

// Rastgele bir cümle üret: gürültü + işaretli komut + gürültü
// forceNormal = true → düşman türü yok (bölünme sonrası çocuk cümleler için)
let noiseStreak = 0;   // arka arkaya kaç saf gürültü satırı üretildi
function generateSentence(forceNormal) {
  const marker = randItem(MARKERS);
  const flexBefore = (Math.random() * 0.55 + 0.22).toFixed(2);
  const flexAfter  = (1 - flexBefore).toFixed(2);

  // Bölünme sonrası çocuk satırlar. Bunlar da tavanı dinlemeli: arka arkaya
  // birkaç bölünme olduğunda tavan sessizce aşılıyordu. Tavan doluysa çocuk
  // gürültü olarak doğar — bölünme yine görünür, ama iş yükü sınırlı kalır.
  if (forceNormal) {
    if (activeCmdCount() >= difficulty.maxCmds + 1) {
      return { noiseOnly: true, text: buildNoise(difficulty.noiseCount + 2) };
    }
    return {
      before: buildNoise(), open: marker[0],
      command: isEgitim() ? lessonCommand()
             : isDrill()  ? makeUniqueDrill(drillTarget, activeCommands())
                          : pickCommand(false),
      close: marker[1],
      after: buildNoise(),
      flexBefore, flexAfter,
      isDecoy: false, isMutating: false, isBomb: false, isSplitter: false,
    };
  }

  // SAF GÜRÜLTÜ satırı: işaret yok, komut yok, ceza yok — sadece kalabalık.
  // Denge açısından şart: her satırda komut olsaydı orta seviyede dakikada ~55
  // komut inerdi, kimse o hızda yazamaz → süre matematiksel olarak tükenirdi.
  // Oyun açısından da şart: ayıklanacak bir şey olsun diye (işaret aramak).
  // TAVAN KONTROLÜ: ekranda hâlihazırda kaç yazılabilir komut var? Tavana
  // ulaşıldıysa bu satır zorunlu olarak saf gürültü olur. İş yükünü sabit
  // tutan asıl mekanizma bu (bkz. DIFFICULTIES.maxCmds notu).
  //
  // ÖNEMLİ: Bu kontrol boss modunu da KAPSAR. Eskiden boss dalı bu kontrolden
  // önce çalışıyordu, yani boss çıktığı anda tavan tamamen devre dışı kalıyor,
  // her satır uzun bir boss komutu oluyordu (üstelik %30 tuzak ve ×1.2 hızla).
  // Oyun testinde "belli bir noktadan sonra takip edilemez oluyor" denen nokta
  // buydu. Boss'un zorluğu artık satır SELİNDEN değil, komutların uzunluğundan,
  // tuzak oranından ve hızdan geliyor.
  const cap = bossActive ? difficulty.maxCmds + BALANCE.bossCmdBonus
                         : difficulty.maxCmds;
  if (activeCmdCount() >= cap) {
    noiseStreak = 0;   // tavan kaynaklı gürültü, seri sayacını doldurmasın
    return { noiseOnly: true, text: buildNoise(difficulty.noiseCount + 2) };
  }

  // Üst üste en fazla 2 gürültü satırı: yoksa ekran uzun süre "boş" hissettirir
  // (boss modda gürültü oranı düşük → daha yoğun ama yine sınırlı bir baskı)
  const noiseP = bossActive ? difficulty.noiseOnly * BALANCE.bossNoiseMult
                            : difficulty.noiseOnly;
  if (noiseStreak < 2 && Math.random() < noiseP) {
    noiseStreak++;
    return { noiseOnly: true, text: buildNoise(difficulty.noiseCount + 2) };
  }
  noiseStreak = 0;

  // Boss aktifken: uzun boss komutları + yüksek tuzak oranı
  if (bossActive) {
    return {
      before:  buildNoise(),
      open:    marker[0],
      command: pickCommand(true),
      close:   marker[1],
      after:   buildNoise(),
      flexBefore, flexAfter,
      isDecoy: Math.random() < BALANCE.bossDecoyRate,
      isMutating: false, isBomb: false, isSplitter: false,
    };
  }

  // Eğitim: dersin harf kümesinden üretilen alıştırma (Ders 8'de gerçek komut)
  if (isEgitim()) {
    return {
      before: buildNoise(), open: marker[0],
      command: lessonCommand(), close: marker[1],
      after: buildNoise(),
      flexBefore, flexAfter,
      isDecoy: false, isMutating: false, isBomb: false, isSplitter: false,
    };
  }

  // Parmak antrenmanı: komut yerine üretilmiş alıştırma dizisi iner
  if (isDrill()) {
    return {
      before: buildNoise(), open: marker[0],
      command: makeUniqueDrill(drillTarget, activeCommands()), close: marker[1],
      after: buildNoise(),
      flexBefore, flexAfter,
      isDecoy: false, isMutating: false, isBomb: false, isSplitter: false,
    };
  }

  // Baskısız modlarda düşman türü yok: tuzak/bomba/bölünen/değişken hepsi süre
  // cezası üzerine kurulu, süre baskısı olmayınca anlamlarını yitiriyorlar.
  // Bu modlar sade kalmalı — tek iş: hedefi bul ve doğru yaz.
  if (isPratik()) {
    return {
      before: buildNoise(), open: marker[0],
      command: pickCommand(false), close: marker[1],
      after: buildNoise(),
      flexBefore, flexAfter,
      isDecoy: false, isMutating: false, isBomb: false, isSplitter: false,
    };
  }

  // Düşmanların açılma süresi seviyeye göre ölçeklenir (enemyMult):
  // kolay ×3 → normal bir oyunda tuzaktan ötesini görmezsin, bomba hiç çıkmaz.
  // zor ×0.6 → hepsi erken sahneye girer.
  const r = Math.random();
  const em = difficulty.enemyMult || 1;
  const decoyOK   = elapsed >= BALANCE.decoyDelay     * em;
  const mutOK     = elapsed >= BALANCE.mutatingDelay  * em;
  const splitOK   = elapsed >= BALANCE.splitterDelay  * em;
  const bombOK    = elapsed >= BALANCE.bombDelay      * em;
  return {
    before:  buildNoise(),
    open:    marker[0],
    command: pickCommand(false),
    close:   marker[1],
    after:   buildNoise(),
    flexBefore, flexAfter,
    isDecoy:    decoyOK   && r < 0.15,                          // %15 tuzak
    isMutating: mutOK     && r >= 0.15 && r < 0.25,             // %10 değişken
    isBomb:     bombOK    && r >= 0.25 && r < 0.33,             // %8 saatli bomba
    isSplitter: splitOK   && r >= 0.33 && r < 0.41,             // %8 bölünen
  };
}

// --- Saniyeyi mm:ss biçimine çevir ---
function formatTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// --- küçük yardımcı: sınıf + metin ile <span> üret ---
function makeSpan(cls, text) {
  const s = document.createElement("span");
  s.className = cls;
  s.textContent = text;
  return s;
}

// === Görsel efekt yardımcıları ===

// Ekran sarsıntısı (hasar anında)
function shakeScreen() {
  if (prefersReducedMotion) return;
  const moves = [
    [-4,2],[4,-2],[-3,-1],[3,1],[-2,2],[2,-1],[-1,1],[1,-1],[0,0]
  ];
  moves.forEach((m, i) => {
    setTimeout(() => {
      terminalEl.style.transform = `translate(${m[0]}px, ${m[1]}px)`;
    }, i * 45);
  });
}

// Kırmızı flaş (hasar anında)
function flashScreen() {
  if (prefersReducedMotion) return;
  flashEl.classList.add("active");
  setTimeout(() => flashEl.classList.remove("active"), 180);
}

// Uçan skor popup
function spawnPopup(text, y, color) {
  const popup = document.createElement("div");
  popup.className = "score-popup";
  popup.textContent = text;
  popup.style.top = y + "px";
  popup.style.color = color || "#7ee787";
  playfield.appendChild(popup);
  setTimeout(() => popup.remove(), 950);
}

// Glitch: tamamlanan komutun harflerini rastgele dağıt
function glitchDissolve(charSpans) {
  if (prefersReducedMotion) {
    charSpans.forEach(span => { span.style.opacity = "0"; });
    return;
  }
  charSpans.forEach(span => {
    const dx = (Math.random() - 0.5) * 80;
    const dy = (Math.random() - 0.5) * 50;
    const rot = (Math.random() - 0.5) * 40;
    span.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    span.style.opacity = "0";
  });
}

// Oyun sonu: skor sayacını animasyonla yukarı say
function animateCountUp(el, target, duration) {
  if (target === 0) { el.textContent = "0"; return; }
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Yazma göstergesi: hedef komutu yazılan/kalan olarak göster
function updateInputDisplay() {
  if (!inputTextEl) return;
  if (!running) {
    inputTextEl.innerHTML = "";
    return;
  }
  // Tek aday kaldıysa komutun tamamını göster (yazılan + kalan).
  if (target) {
    const done = target.command.slice(0, target.progress);
    const remain = target.command.slice(target.progress);
    inputTextEl.innerHTML =
      '<span class="input-done">' + done + '</span>' +
      '<span class="input-remain">' + remain + '</span>' +
      '<span class="input-cursor">█</span>';
  } else if (typedBuf) {
    // Birden fazla aday: yazdığın ön eki ve kaç aday kaldığını göster —
    // oyuncu "daha yazmam lazım" olduğunu buradan anlar.
    inputTextEl.innerHTML =
      '<span class="input-done">' + typedBuf + '</span>' +
      '<span class="input-cursor">█</span>' +
      '<span class="input-hint">' + candidates.length + ' aday</span>';
  } else {
    inputTextEl.innerHTML = '<span class="input-cursor">█</span>';
  }
}

// --- Bir komut sarmalayıcısını harf harf span'lerle doldur (mutasyonda tekrar kullanılır) ---
function fillCommand(cmdEl, command) {
  cmdEl.textContent = "";
  const charSpans = [];
  for (const ch of command) {
    const c = makeSpan("ch", ch);
    cmdEl.appendChild(c);
    charSpans.push(c);
  }
  return charSpans;
}

// --- Bir cümle öğesi oluşturup playfield'a ekle ---
function createSentence(data) {
  const el = document.createElement("div");
  el.className = "sentence";

  // Saf gürültü satırı: tek parça soluk metin, hedef alınamaz
  if (data.noiseOnly) {
    el.classList.add("noise-only");
    el.appendChild(makeSpan("noise", data.text));
    el.style.top = "10px";
    playfield.appendChild(el);
    return { el, charSpans: [], cmdEl: null, bombTimerEl: null };
  }

  if (data.isDecoy)    el.classList.add("decoy");     // tuzak: işaret kırmızı yanıp söner
  if (data.isMutating) el.classList.add("mutating");  // değişken: işaret turuncu
  if (data.isBomb)     el.classList.add("bomb");      // saatli bomba: işaret magenta nabız
  if (data.isSplitter) el.classList.add("splitter");  // bölünen: işaret sarı-yeşil titrer

  const noiseBefore = makeSpan("noise noise-before", data.before);
  noiseBefore.style.flex = data.flexBefore;
  el.appendChild(noiseBefore);

  const cmdWrap = document.createElement("span");
  cmdWrap.className = "cmd-wrap";
  cmdWrap.appendChild(makeSpan("marker", data.open));

  const cmd = makeSpan("command", "");
  const charSpans = fillCommand(cmd, data.command);
  cmdWrap.appendChild(cmd);
  cmdWrap.appendChild(makeSpan("marker", data.close));

  let bombTimerEl = null;
  if (data.isBomb) {
    bombTimerEl = makeSpan("bombtimer", "");
    cmdWrap.appendChild(bombTimerEl);
  }
  el.appendChild(cmdWrap);

  const noiseAfter = makeSpan("noise noise-after", data.after);
  noiseAfter.style.flex = data.flexAfter;
  el.appendChild(noiseAfter);

  el.style.top = "10px";
  playfield.appendChild(el);

  return { el, charSpans, cmdEl: cmd, bombTimerEl };
}

// --- Durum ---
let difficulty = DIFFICULTIES.orta;
let sentences  = [];     // ekranda inen TÜM cümleler (dizi)
let target     = null;   // o an yazdığın (kilitli) cümle
let running    = false;  // oyun oynanıyor mu (menüdeyken false)
let streak     = 0;      // arka arkaya başarı serisi (combo çarpanı için)
let lastStreak = 0;      // son okunan seri (VFX güncellemeleri için)
let score      = 0;      // toplam skor
let timeLeft   = BALANCE.startTime;
let elapsed    = 0;      // oyun başından beri geçen süre (düşman rampası için)
let lastTime   = 0;      // önceki karenin zaman damgası

// Boss durumu
let bossActive      = false;
let bossHp          = 0;
let bossMaxHp       = 0;
let lastBossElapsed = 0;
const bossBarEl     = document.getElementById("bossBar");
const bossHpFillEl  = document.getElementById("bossHpFill");

// --- OYUN MODU (Faz 7) ---------------------------------------------------
// "sizma"  : asıl oyun — geri sayım, cezalar, düşman türleri, boss.
// "pratik" : süre yok (saat yukarı sayar), ceza yok, düşman yok, boss yok.
//            Amaç skor değil temiz ve akıcı yazmak; sonunda analiz raporu.
//            Öğrenme için asıl mod bu: acele ettirmeden 10 parmağı çalıştırır.
// "parmak" : parmak antrenmanı — pratik gibi baskısız, ama komut yerine
//            üretilmiş alıştırma dizileri iner (bkz. js/drills.js)
let gameMode = "sizma";
let drillTarget = "ev";                 // parmak modunda ne çalışılıyor
function isPratik() { return gameMode === "pratik"; }
function isDrill()  { return gameMode === "parmak" || gameMode === "drill"; }
function isGunluk() { return gameMode === "gunluk"; }
function isEgitim() { return gameMode === "egitim"; }

// --- Eğitim modu durumu (bkz. js/lessons.js) ---
let currentLessonNo = 1;    // oynanan ders
let lessonLinesDone = 0;    // bu derste tamamlanan satır
let lessonFinish = false;   // ders doldu → döngü bir sonraki karede bitirsin
                            // (endGame'i completeCommand'in ortasında çağırmak,
                            //  o fonksiyonun geri kalanını yarım bırakırdı)

// --- Seeded PRNG for Daily Challenge ---
let currentSeed = 1;
const originalRandom = Math.random;
function lcgRandom() {
  currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
  return currentSeed / 4294967296;
}
function setSeededRandom() {
  const d = new Date();
  currentSeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  Math.random = lcgRandom;
}
function restoreRandom() {
  Math.random = originalRandom;
}
// Zaman baskısı olmayan modlar: saat yukarı sayar, ceza ve düşman yok
function isZamansiz() { return isPratik() || isDrill() || isEgitim(); }

// Eğitimde satır içeriği: ders alıştırma dizisi üretir; Ders 8 ise oyunun
// gerçek komut bankasını kullanır (dizilerden oyuna köprü).
function lessonCommand() {
  if (typeof lessonUsesCommands === "function" && lessonUsesCommands(currentLessonNo)) {
    return pickCommand(false);
  }
  return makeUniqueLessonLine(currentLessonNo, activeCommands());
}

// Oyun "başladı" mı? Oyuncu ilk harfe basana kadar her şey donuk bekler:
// saat işlemez, satırlar inmez. Ekran yine boştan dolmaya başlar (yumuşak
// giriş korunsun diye), sadece sayaç oyuncu hazır olduğunda çalışmaya başlar.
// (Eskiden startGame ile saat hemen işlemeye başlıyordu; oyuncu daha ekranı
// okumaya fırsat bulamadan 2-3 saniye kaybediyordu.)
// Not: başlatan tuş TÜKETİLMEZ — ilk harfin de yazıma sayılır.
let waitingStart = false;

// Duraklatma durumu
let paused = false;
const pauseBtn     = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");

// --- Zorluk: bkz. js/balance.js ---
// --- Belirli bir y konumunda yeni bir cümle üret ---
function spawnSentenceAt(y, forceNormal) {
  candidatesDirty = true;                     // yeni satır → adaylar bayatladı
  const data = generateSentence(forceNormal);
  const { el, charSpans, cmdEl, bombTimerEl } = createSentence(data);
  el.style.top = y + "px";
  sentences.push({
    el, charSpans, cmdEl, bombTimerEl,
    noiseOnly: !!data.noiseOnly,
    command: data.command || "", progress: 0, y,
    isDecoy: data.isDecoy, isMutating: data.isMutating, mutTimer: 0,
    isBomb: data.isBomb, bombLeft: BALANCE.bombTimer,
    isSplitter: !!data.isSplitter, hasSplit: false,
  });
}

// === Boss sistemi ===
function startBoss() {
  bossActive = true;
  document.body.classList.add("boss-alarm");
  if (typeof updateMatrixColors === "function") updateMatrixColors();
  bossHp = BALANCE.bossHp;
  bossMaxHp = BALANCE.bossHp;
  if (bossBarEl) bossBarEl.classList.remove("hidden");
  updateBossHp();
  terminalEl.classList.add("boss-mode");
  statusEl.textContent = "⚠ GÜVENLİK DUVARI AKTİF";
  spawnPopup("⚠ BOSS!", playfield.clientHeight / 2, "#ff2e97");
  shakeScreen();
  if (typeof playBossStart === "function") playBossStart();
}

function updateBossHp() {
  if (bossHpFillEl) bossHpFillEl.style.width = (bossHp / bossMaxHp * 100) + "%";
}

function damageBoss() {
  bossHp--;
  updateBossHp();
  if (bossHp <= 0) endBoss();
}

function endBoss() {
  bossActive = false;
  document.body.classList.remove("boss-alarm");
  if (typeof updateMatrixColors === "function") updateMatrixColors();
  lastBossElapsed = elapsed;
  if (bossBarEl) bossBarEl.classList.add("hidden");
  terminalEl.classList.remove("boss-mode");
  timeLeft += BALANCE.bossTimeBonus;
  score += BALANCE.bossScoreBonus;
  scoreEl.textContent = "skor: " + score;
  trackEvent("bossKilled");
  statusEl.textContent = "boss yenildi! +" + BALANCE.bossTimeBonus + " sn +" + BALANCE.bossScoreBonus + " puan";
  spawnPopup("👾 BOSS YENİLDİ! +" + BALANCE.bossScoreBonus, playfield.clientHeight / 2, "#ffd93d");
  shakeScreen();
  if (typeof playBossKill === "function") playBossKill();
}

// --- Duraklatma sistemi ---
function togglePause() {
  if (!running && !paused) return;
  if (paused) {
    // Devam et
    paused = false;
    waitingStart = false;
    running = true;
    lastTime = 0;   // delta time sıfırla (büyük atlama olmasın)
    pauseOverlay.classList.add("hidden");
    pauseBtn.textContent = "⏸";
    requestAnimationFrame(gameLoop);
  } else {
    // Duraklat
    paused = true;
    running = false;
    pauseOverlay.classList.remove("hidden");
    pauseBtn.textContent = "▶";
  }
}

// --- Oyun döngüsü: tarayıcı bunu saniyede ~60 kez çağırır ---
function gameLoop(timestamp) {
  if (!running) return;                       // oyun durdurulduysa döngüyü kes
  if (!lastTime) lastTime = timestamp;
  
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!waitingStart) {
    elapsed += dt;                              // oyun süresi ilerler (rampa için)
  }

  // --- Görsel Efektler (VFX) Güncellemesi ---
  // Kombo ve Overdrive skorun ödülü; pratik / parmak / eğitim modlarında skor
  // bilerek geri planda (sonuç ekranında bile gösterilmiyor). Ders ortasında
  // "🔥 15x KOMBO!" yeni başlayanı hedeften koparıyordu.
  const vfxAcik = !isZamansiz();
  if (streak !== lastStreak) {
    if (typeof updateMatrixSpeed === "function") updateMatrixSpeed(vfxAcik ? streak : 0);
    if (streak >= BALANCE.comboShowStreak && vfxAcik) {
      if (comboDisplayEl) {
        comboDisplayEl.textContent = "🔥 " + streak + "x KOMBO!";
        comboDisplayEl.classList.remove("hidden");
        // Zıplama animasyonunu yeniden tetikle: sınıfı kaldır, yeniden akış
        // hesaplat, geri koy. Aksi halde ikinci seride animasyon çalışmaz.
        comboDisplayEl.classList.remove("combo-pop");
        void comboDisplayEl.offsetWidth;
        comboDisplayEl.classList.add("combo-pop");
      }
    } else {
      if (comboDisplayEl) comboDisplayEl.classList.add("hidden");
    }
    lastStreak = streak;
  }

  // Overdrive ve Boss Alarm: seriden bağımsız, her karede duruma göre güncelle
  const wantOverdrive = streak >= BALANCE.overdriveStreak && !bossActive && vfxAcik;
  const hasOverdrive = document.body.classList.contains("theme-overdrive");
  if (wantOverdrive !== hasOverdrive) {
    document.body.classList.toggle("theme-overdrive", wantOverdrive);
    if (typeof updateMatrixColors === "function") updateMatrixColors();
  }

  // Boss zamanlayıcısı
  if (bossActive && !waitingStart) lastBossElapsed += dt;

  // --- Saat ---
  // Sızma modunda geri sayım (zaman = can). Pratik modunda süre baskısı yok,
  // saat geçen süreyi YUKARI sayar; oyunu oyuncu "bitir" ile sonlandırır.
  // Ders tamamlandı: completeCommand içinde bayrak kondu, bitişi burada yapıyoruz
  if (lessonFinish) {
    lessonFinish = false;
    endGame();
    return;
  }

  if (isZamansiz()) {
    if (!waitingStart) clockEl.textContent = formatTime(elapsed);
  } else {
    if (!waitingStart) {
      timeLeft -= dt;
      if (timeLeft <= 10 && typeof playTimeLow === "function") playTimeLow();
      if (timeLeft <= 0) {
        clockEl.textContent = "00:00";
        endGame();                              // oyun bitti → sonuç ekranı
        return;
      }
    }
    clockEl.textContent = formatTime(timeLeft);
  }

  // --- Tüm cümleleri aşağı hareket ettir + ekrandan çıkanları kaldır ---
  // (sondan başa gidiyoruz ki diziden silme güvenli olsun)
  for (let i = sentences.length - 1; i >= 0; i--) {
    const s = sentences[i];
    const currentSpeed = bossActive ? difficulty.speed * BALANCE.bossSpeedMult : difficulty.speed;
    s.y += currentSpeed * dt;
    s.el.style.top = s.y + "px";

    // Tamamlanmış cümle: düşman mantığı artık işlemez. Diziden HEMEN
    // çıkarmıyoruz; dağılma efekti biterken diğerleriyle birlikte akmaya
    // devam etsin diye. (Eskiden donup kalıyor, inen satırlar içinden
    // geçiyordu → "cümleler üst üste biniyor" görüntüsü.)
    if (s.done) {
      s.deadLeft -= dt;
      if (s.deadLeft <= 0 || s.y > playfield.clientHeight) {
        s.el.remove();
        sentences.splice(i, 1); candidatesDirty = true;
      }
      continue;
    }

    // Değişken düşman: hedef değilken komutu ara ara değiştir
    if (s.isMutating && s !== target) {
      s.mutTimer += dt;
      if (s.mutTimer >= 2.5) {
        s.mutTimer = 0;
        s.command = pickCommand(false);
        s.charSpans = fillCommand(s.cmdEl, s.command);
      }
    }

    // Saatli bomba: kişisel geri sayım; sıfırlanırsa patlar
    if (s.isBomb) {
      s.bombLeft -= dt;
      if (s.bombTimerEl) s.bombTimerEl.textContent = " ⏱" + Math.max(0, Math.ceil(s.bombLeft));
      if (s.bombLeft <= 0) {
        timeLeft -= BALANCE.bombPenalty;        // patlama: büyük ceza
        streak = 0;                             // seri bozulur
        statusEl.textContent = "bomba patladı! -" + BALANCE.bombPenalty + " sn";
        trackEvent("bombLost");
        shakeScreen(); flashScreen();
        if (typeof playDamage === "function") playDamage();
        spawnPopup("💥 -" + BALANCE.bombPenalty + " sn", s.y, "#ff2e97");
        if (target === s) clearTyping();
        s.el.remove();
        sentences.splice(i, 1); candidatesDirty = true;
        continue;
      }
    }

    // Bölünen düşman: eşiğe ulaşınca ikiye ayrılır
    if (s.isSplitter && !s.hasSplit && s !== target
        && s.y > playfield.clientHeight * BALANCE.splitThreshold) {
      s.hasSplit = true;
      s.el.remove();
      sentences.splice(i, 1); candidatesDirty = true;

      // Cümleler sabit bir ızgarada (lineHeight aralıklarla) iner. Eskiden
      // çocuklardan biri s.y + lineHeight konumuna konuyordu — ama orası ZATEN
      // DOLU bir slot, yani doğrudan alttaki satırın üstüne biniyordu
      // ("bazı satırlarda üst üste binme" hatasının kaynağı buydu).
      // Doğrusu: yeni slot açmak. Bölünen satırın ÜSTÜNDEKİ her şeyi bir satır
      // yukarı kaydırıyoruz, açılan boşluğa ikinci çocuğu koyuyoruz.
      const lhSplit = difficulty.lineHeight;
      for (const other of sentences) {
        if (other.y <= s.y) {
          other.y -= lhSplit;
          other.el.style.top = other.y + "px";
        }
      }
      spawnSentenceAt(s.y, true);              // 1. çocuk: boşalan slot
      spawnSentenceAt(s.y - lhSplit, true);    // 2. çocuk: yeni açılan slot
      spawnPopup("✂️ bölündü!", s.y, "#c4e03f");
      continue;
    }

    if (s.y > playfield.clientHeight) {        // cümle en alttan tamamen çıktı
      if (s.noiseOnly) {                        // saf gürültü: hiçbir şey olmaz
        // ceza yok, ödül yok — sadece kaybolur
      } else if (s.isBomb) {                    // bomba kaçtı → büyük ceza
        timeLeft -= BALANCE.bombPenalty;
        streak = 0;                             // seri bozulur
        statusEl.textContent = "bomba kaçtı! -" + BALANCE.bombPenalty + " sn";
        trackEvent("bombLost");
        shakeScreen(); flashScreen();
        if (typeof playDamage === "function") playDamage();
        spawnPopup("💥 -" + BALANCE.bombPenalty + " sn", Math.max(0, s.y - 30), "#ff2e97");
      } else if (s.isDecoy) {                   // tuzağı yazmayıp geçirmek DOĞRU davranış
        trackEvent("decoyAvoided");
      } else if (isZamansiz()) {                // baskısız modlarda ceza yok, sadece kayıt
        trackEvent("cmdMissed");
        streak = 0;
      } else {                                  // gerçek komut kaçtı → ceza
        timeLeft -= BALANCE.missedPenalty;
        streak = 0;                             // seri bozulur
        statusEl.textContent = "komut kaçtı! -" + BALANCE.missedPenalty + " sn";
        trackEvent("cmdMissed");
        shakeScreen(); flashScreen();
        if (typeof playDamage === "function") playDamage();
        spawnPopup("-" + BALANCE.missedPenalty + " sn", Math.max(0, s.y - 30), "#f0883e");
      }
      if (target === s) clearTyping();       // hedefimizse kilidi bırak
      s.el.remove();
      sentences.splice(i, 1); candidatesDirty = true;
    }
  }

  // --- Üstteki boşluğu doldur: cümleler bitişik ve kesintisiz aksın ---
  const lh = difficulty.lineHeight;
  let topY = sentences.length ? Math.min(...sentences.map(s => s.y)) : lh;
  while (topY > 0) {
    spawnSentenceAt(topY - lh);
    topY -= lh;
  }

  // --- Adayları tazele ---
  // Satır listesi değiştiyse aday listesi bayatlar (silinmiş satıra kilitli
  // kalmak ya da yeni gelen eşleşmeyi kaçırmak istemiyoruz).
  // ÖNEMLİ: eskiden bu her karede koşuyordu — tüm cümleleri ve harf span'lerini
  // gezip DOM sınıfı yazdığı için 60 fps'de yazarken gözle görülür takılma
  // yaratıyordu. Artık yalnızca satır listesi gerçekten değiştiğinde çalışır.
  if (candidatesDirty) {
    candidatesDirty = false;
    if (typedBuf) refreshCandidates();
  }

  // --- Boss zamanlayıcısı ---
  if (!isZamansiz() && !bossActive && elapsed >= BALANCE.bossInterval
      && elapsed - lastBossElapsed >= BALANCE.bossInterval) {
    startBoss();
  }

  requestAnimationFrame(gameLoop);
}

// ==========================================================================
//  Klavye girişi — ÖN EK EŞLEŞTİRME (2026-08-05 oyun testi sonrası)
//
//  Eski model: ilk harfe basar basmaz oyun senin adına bir satır SEÇİYORDU.
//  Hangisini kastettiğini bilemediği için sık sık yanlışını seçiyor, oyuncu
//  Esc ile başa dönmek zorunda kalıyordu ("y yazıyorum, hemen başka bir
//  cümle beliriyor").
//
//  Yeni model: basılan harfler bir TAMPONDA birikir. Tamponla başlayan tüm
//  komutlar "aday" olur ve yazılan kısmı yeşile döner. Yazdıkça adaylar elenir;
//  tek aday kalınca o satır kilitlenir. Yani seçimi oyun değil, yazdığın
//  harfler yapar — belirsizlik varken hiçbir şeye bağlanmıyoruz.
//
//  Yan etki (bilinçli): tuzaklar da aday olur. Eski kodda kilitlenme tuzakları
//  atlıyordu, yani 🎭 tuzak düşmanı tamamen işlevsizdi — yanlışlıkla bile
//  yazamıyordun. Artık tuzağa düşmek mümkün; savunma, yazmadan ÖNCE kırmızı
//  işareti okumak.
// ==========================================================================

let typedBuf   = "";   // o an yazılmakta olan ön ek
let candidates = [];   // tamponla başlayan satırlar
// Satır listesi değişti mi? (doğum/ölüm) → adayların tazelenmesi gerekir
let candidatesDirty = false;

// Tüm aday işaretlerini temizle
function clearCandidateMarks() {
  for (const s of sentences) {
    if (!s.charSpans || !s.charSpans.length) continue;
    s.el.classList.remove("locked", "candidate");
    if (s.done) continue;                       // tamamlanmışın yeşili kalsın
    for (const c of s.charSpans) c.classList.remove("done");
    s.progress = 0;
  }
}

// Tampona göre adayları yeniden hesapla ve ekranı boya.
// Tek doğruluk kaynağı burası — tuş basışında da, satır silinince de çağrılır.
function refreshCandidates() {
  clearCandidateMarks();
  candidates = [];
  target = null;

  if (typedBuf) {
    for (const s of sentences) {
      if (s.done || s.noiseOnly || !s.command) continue;
      if (s.y < -difficulty.lineHeight) continue;  // henüz ekrana hiç girmemiş
      if (s.command.indexOf(typedBuf) === 0) candidates.push(s);
    }

    // Yazdığın satır ekrandan çıktıysa (ya da bölündüyse) aday kalmaz. Tamponu
    // öylece bırakırsak sonraki her tuş "bu tamponu uzatmıyor" diye yutulur ve
    // klavye birkaç saniye ölü kalır ("bazen harfleri algılamıyor" hatası).
    // Bu yüzden aday bitince tamponu kendiliğinden sıfırlıyoruz.
    if (!candidates.length) {
      typedBuf = "";
      if (typeof highlightNextKey === "function") highlightNextKey(null);
      updateInputDisplay();
      return;
    }

    for (const s of candidates) {
      s.progress = typedBuf.length;
      for (let i = 0; i < s.progress; i++) s.charSpans[i].classList.add("done");
      // Tek aday kaldıysa tam kilit, birden fazlaysa soluk "aday" vurgusu
      s.el.classList.add(candidates.length === 1 ? "locked" : "candidate");
    }
    if (candidates.length === 1) target = candidates[0];
  }

  if (typeof highlightNextKey === "function") {
    highlightNextKey(nextExpectedChar());
  }
  updateInputDisplay();
}

// Reddedilen tuş: hiçbir komutla eşleşmeyen basış.
// Sessizce yutmak "oyun harfleri algılamıyor" hissi veriyordu — oyuncu tuşa
// bastığını mı yoksa oyunun görmezden mi geldiğini ayırt edemiyor. Kısa bir
// görsel sinyal veriyoruz. (Faz 5c'de buna ses de eklenecek.)
function rejectKey() {
  if (typeof playError === "function") playError();
  if (!inputTextEl || prefersReducedMotion) return;
  const bar = inputTextEl.parentElement;
  if (!bar) return;
  bar.classList.remove("rejected");
  void bar.offsetWidth;              // animasyonu yeniden tetiklemek için
  bar.classList.add("rejected");
  setTimeout(() => bar.classList.remove("rejected"), 220);
}

// Tamponu sıfırla
function clearTyping() {
  typedBuf = "";
  refreshCandidates();
}

// Sıradaki beklenen harf. Birden çok aday varsa en acil olanınki (en alttaki)
// gösterilir — klavye rehberi tek bir tuş göstermek zorunda.
function nextExpectedChar() {
  if (!candidates.length) return null;
  let best = candidates[0];
  for (const c of candidates) if (c.y > best.y) best = c;
  return best.command[typedBuf.length] || null;
}

// Adayların kabul ettiği sıradaki harflerin kümesi
function acceptableChars() {
  const set = new Set();
  for (const c of candidates) {
    const ch = c.command[typedBuf.length];
    if (ch !== undefined) set.add(ch);
  }
  return set;
}

// Ekranda şu an yazılabilir bir komutun bu ön ekle başladığı var mı?
// Eşik refreshCandidates ile AYNI olmalı, yoksa "tuş kabul edildi ama aday
// bulunamadı" gibi tutarsız bir durum çıkar.
function prefixExists(prefix) {
  for (const s of sentences) {
    if (s.done || s.noiseOnly || !s.command) continue;
    if (s.y < -difficulty.lineHeight) continue;
    if (s.command.indexOf(prefix) === 0) return true;
  }
  return false;
}

// Bir komutun tamamlanması
function completeCommand(s) {
  if (s.isDecoy) {                                         // TUZAĞA düştün!
    timeLeft -= BALANCE.decoyPenalty;
    streak = 0;
    statusEl.textContent = "tuzak! -" + BALANCE.decoyPenalty + " sn";
    shakeScreen(); flashScreen();
    if (typeof playDecoy === "function") playDecoy();
    spawnPopup("🎭 tuzak! -" + BALANCE.decoyPenalty + " sn", s.y, "#ff6b6b");
    trackEvent("decoyHit");
  } else {
    streak++;
    trackEvent("cmdDone");
    if (s.isBomb) trackEvent("bombDone");   // patlamadan yazılan bomba = imha
    trackStreak(streak);
    // Süre ödülü komut uzunluğuyla ölçekli (uzun komut = çok emek = çok süre)
    // Ödül = okuma payı + hedef hızda bu komutu yazmanın süresi.
    // Uzun komutlarda azalan getiri: ilk rewardFullChars harf tam, sonrası kırpık.
    const uzunluk = s.command.length;
    const tamKısım = Math.min(uzunluk, BALANCE.rewardFullChars);
    const fazlaKısım = Math.max(0, uzunluk - BALANCE.rewardFullChars);
    const etkinUzunluk = tamKısım + fazlaKısım * BALANCE.rewardLongFactor;
    const reward = BALANCE.timeRewardBase + etkinUzunluk / difficulty.targetCps;
    if (isZamansiz()) {
      // Baskısız modlarda saat yok → süre ödülü de yok. Yerine anlık geri bildirim:
      // o komutu kaç saniyede yazdığın (kendi hızını görmen için).
      spawnPopup("✓", s.y - 14, "#58a6ff");
    } else {
      // Saat tavanı: iyi oyuncuda süre sonsuza gitmesin
      const tavan = (difficulty.startTime || BALANCE.startTime) + BALANCE.maxTimeBonus;
      timeLeft = Math.min(timeLeft + reward, tavan);
      spawnPopup("+" + reward.toFixed(1) + " sn", s.y - 14, "#58a6ff");
    }

    let points = s.command.length * 10;                    // harf başına 10 puan
    points *= difficulty.scoreMult;                        // zorluk çarpanı
    if (s.isBomb) points *= 2;                             // bomba bonusu
    const comboMult = 1 + Math.floor(streak / 3) * 0.5;    // 3'te bir +0.5x
    points = Math.round(points * comboMult);
    score += points;
    scoreEl.textContent = "skor: " + score;
    statusEl.textContent = "+" + points + " \u00b7 seri " + streak + " (x" + comboMult + ")";
    spawnPopup("+" + points + (comboMult > 1 ? " x" + comboMult : ""), s.y, "#7ee787");
    if (typeof playComplete === "function") playComplete();
    if (bossActive) damageBoss();

    // Ders ilerlemesi: belirlenen satır sayısı dolunca ders biter ve
    // değerlendirilir. (Kaçan satır dersi uzatır, cezalandırmaz.)
    if (isEgitim()) {
      lessonLinesDone++;
      statusEl.textContent = "ders " + currentLessonNo + " · " +
                             lessonLinesDone + "/" + LESSON_LINES + " satır";
      if (lessonLinesDone >= LESSON_LINES) lessonFinish = true;
    }
  }

  s.el.classList.add("completed");                         // gürültü kaybolur (CSS)
  s.el.classList.remove("locked", "candidate");
  glitchDissolve(s.charSpans);
  s.done = true;                                           // "ölü": akmaya devam eder
  s.deadLeft = 0.5;

  typedBuf = "";
  refreshCandidates();
}

// Giriş işleme — TEK YOL.
// Hem fiziksel klavye (keydown) hem dokunmatik cihazlardaki yazılım klavyesi
// (ekrandaki klavyeye dokunma) buraya bağlanır; oyun mantığı girişin nereden
// geldiğini bilmez. `tus` ya tek bir karakterdir ya da "Backspace".
function handleTypedKey(tus) {
  if (!running || paused) return;                          // menü/sonuç/duraklama

  // İlk yazılabilir tuş oyunu başlatır. Tuşu tüketmiyoruz — aynı basış
  // normal akışta işlenmeye devam eder, yani ilk harfin de sayılır.
  if (waitingStart && tus.length === 1) {
    waitingStart = false;
    statusEl.textContent = "sızma başladı";
  }

  // Backspace: son harfi geri al (tüm yazımı silmez)
  if (tus === "Backspace") {
    if (typedBuf) {
      typedBuf = typedBuf.slice(0, -1);
      refreshCandidates();
    }
    return;
  }

  if (tus.length !== 1) return;                            // sadece yazılabilir karakter
  const pressed = tus.toLocaleLowerCase("tr");             // Türkçe-duyarlı küçük harf
  if (typeof pressKeyAnim === "function") pressKeyAnim(pressed);

  // --- Analiz kaydı: bu basış doğru mu? ---
  // Yazım sürerken beklenen harf, adayların kabul ettiği harflerden biridir.
  if (typedBuf) {
    const ok = acceptableChars();
    trackKey(pressed, ok.has(pressed) ? pressed : nextExpectedChar());
  }

  // --- Tamponu ilerlet ---
  if (prefixExists(typedBuf + pressed)) {
    typedBuf = typedBuf + pressed;
    if (typeof playKey === "function") playKey();
  } else if (typedBuf) {
    // Yanlış harf: YOK SAYILIR, yazdığın silinmez.
    // (İlk sürümde tampon sıfırlanıp bu harfle yeni yazım başlatılıyordu —
    // tek bir yanlış tuş 10 harflik emeği siliyordu. Yazma oyununda doğru
    // davranış, hatalı tuşun hiçbir şeyi geri almaması.)
    // Başka bir komuta geçmek istiyorsan Esc, bir harf geri almak için Backspace.
    statusEl.textContent = "yanlış harf — Esc ile vazgeç";
    rejectKey();
    return;
  } else {
    trackKey(pressed, null);                               // boşa basış
    rejectKey();
    refreshCandidates();
    return;
  }

  refreshCandidates();

  // Tam eşleşme varsa komutu tamamla (bir komut diğerinin ön eki olabilir diye
  // "tek aday" değil, "birebir eşleşen aday" aranıyor)
  for (const c of candidates) {
    if (c.command === typedBuf) { completeCommand(c); break; }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  // Escape: duraklat / devam et / yazımı iptal et (duruma göre)
  if (e.key === "Escape") {
    if (paused) { togglePause(); return; }                 // duraklatılmış → devam et
    if (running && typedBuf) { clearTyping(); return; }    // yazıyordu → iptal
    if (running) { togglePause(); return; }                // boştaysa → duraklat
    return;
  }

  if (!running || paused) return;

  // Tarayıcının kendi davranışını engelle: Backspace geri gitmesin,
  // boşluk sayfayı kaydırmasın.
  if (e.key === "Backspace" || e.key === " ") e.preventDefault();

  handleTypedKey(e.key);
});

// === Oyun akışı: menü → oyna → sonuç ===
const BEST_KEY = "sizmaBest";
function getBest() {
  return parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
}

// Tüm durumu sıfırla (yeni oyuna hazırla)
function resetGame() {
  for (const s of sentences) s.el.remove();
  sentences = [];
  target = null;   // eleman zaten silindi, sınıf temizlemeye gerek yok
  score = 0;
  streak = 0;
  lastStreak = 0;
  if (comboDisplayEl) comboDisplayEl.classList.add("hidden");
  if (typeof updateMatrixSpeed === "function") updateMatrixSpeed(0);
  timeLeft = difficulty.startTime || BALANCE.startTime;
  elapsed = 0;
  lastTime = 0;
  paused = false;
  if (pauseOverlay) pauseOverlay.classList.add("hidden");
  // Boss sıfırla
  bossActive = false;
  document.body.classList.remove("boss-alarm");
  document.body.classList.remove("theme-overdrive");
  bossHp = 0;
  lastBossElapsed = 0;
  if (bossBarEl) bossBarEl.classList.add("hidden");
  terminalEl.classList.remove("boss-mode");
  // UI sıfırla
  scoreEl.textContent = "skor: 0";
  statusEl.textContent = "sızma başladı";
  clockEl.textContent = formatTime(timeLeft);
  if (typeof highlightNextKey === "function") highlightNextKey(null);
  updateInputDisplay();
  if (typeof resetAudioSession === "function") resetAudioSession();
}

// Seçilen zorlukla oyunu başlat
let currentDiffName = "orta";
let levelAtStart = 1;      // oyun başındaki seviye (atlama tespiti için)

// --- Dokunmatik uyarısı ---
// Oyun fiziksel klavye ister. Tarayıcı "klavye takılı mı" diye soramaz; en
// yakın ipucu işaretçi türüdür (coarse = parmak). Klavyeli tablet de coarse
// görünür, o yüzden bu bir ENGEL değil UYARI: geçilebilir ve seçim hatırlanır.
// Ekran genişliğine BAKMIYORUZ — komut sarmalayıcısı (.cmd-wrap) hiç küçülmez,
// yani komut dar ekranda da tam görünür; kırpılan yalnızca gürültüdür.
const KEYBOARD_OK_KEY = "sizmaKeyboardOK";
const touchNoticeEl = document.getElementById("touchNotice");
let bekleyenDiffKey = null;   // uyarı yüzünden ertelenen başlatma

function dokunmatikUyarisiGerekli() {
  if (localStorage.getItem(KEYBOARD_OK_KEY)) return false;
  return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

function showTouchNotice() {
  menuEl.classList.add("hidden");
  if (touchNoticeEl) touchNoticeEl.classList.remove("hidden");
}

const touchBackBtn = document.getElementById("touchBackBtn");
if (touchBackBtn) {
  touchBackBtn.addEventListener("click", () => {
    if (touchNoticeEl) touchNoticeEl.classList.add("hidden");
    showMenu();
  });
}
const touchAnywayBtn = document.getElementById("touchAnywayBtn");
if (touchAnywayBtn) {
  touchAnywayBtn.addEventListener("click", () => {
    localStorage.setItem(KEYBOARD_OK_KEY, "1");   // bir daha sorma
    if (touchNoticeEl) touchNoticeEl.classList.add("hidden");
    startGame(bekleyenDiffKey || currentDiffName);
  });
}

// ==========================================================================
// Ekrandaki klavyeyle oynama (dokunmatik)
// ==========================================================================
// Telefonda fiziksel klavye yok. İşletim sisteminin yazılım klavyesini açmak
// yerine oyunun ZATEN çizdiği 10 parmak rehberi giriş aygıtına dönüştürülüyor:
//   - ekranın yarısını kaplayan bir klavye açılmaz, oyun alanı korunur
//   - parmak renkleri ve sıradaki tuş vurgusu görünür kalır, yani öğretici
//     taraf dokunmatikte de çalışır
//   - düzen oyuncunun seçtiğidir (TR-Q / TR-F / EN), cihazınkine bağlı değil
//
// Her tuş elemanının dataset.key'i var (bkz. js/keyboard.js), bu yüzden
// devredilmiş tek bir dinleyici yeterli.
const SOFT_KEY = "sizmaSoftKeyboard";
const kbdSectionEl = document.getElementById("keyboardSection");
const kbdControlsEl = document.getElementById("kbdControls");

function softAktif() { return localStorage.getItem(SOFT_KEY) === "1"; }

// Denetim tuşları (sil / iptal) yalnızca dokunmatik modda ve oyun sürerken
// anlamlı; klavyenin kendisi ise o modda hep dokunulabilir görünür.
function softArayuzuTazele() {
  if (kbdControlsEl) kbdControlsEl.classList.toggle("hidden", !(softAktif() && running));
  if (kbdSectionEl) kbdSectionEl.classList.toggle("tappable", softAktif());
}

if (kbdSectionEl) {
  kbdSectionEl.addEventListener("pointerdown", (e) => {
    if (!softAktif() || !running || paused) return;
    // Yalnızca birincil basış yazsın: sağ/orta tık ve ikinci parmağın
    // dokunuşu da pointerdown üretiyor, hepsi harf gönderiyordu.
    if (e.button !== 0) return;
    if (!e.isPrimary) return;
    const keyEl = e.target.closest(".key");
    if (!keyEl || !keyEl.dataset.key) return;
    e.preventDefault(); // Odak kaybolmasını ve sonraki click'i engelle
    handleTypedKey(keyEl.dataset.key);
  });
}

const kbdBackspaceBtn = document.getElementById("kbdBackspace");
if (kbdBackspaceBtn) {
  kbdBackspaceBtn.addEventListener("click", () => {
    if (running && !paused) handleTypedKey("Backspace");
  });
}
const kbdEscapeBtn = document.getElementById("kbdEscape");
if (kbdEscapeBtn) {
  kbdEscapeBtn.addEventListener("click", () => {
    if (running && !paused) clearTyping();
  });
}

// Ayarlar panelindeki açık/kapalı anahtarı.
// Uyarı ekranı yalnızca BİR KEZ çıkar (sizmaKeyboardOK yazıldıktan sonra bir
// daha sorulmaz); bu yüzden seçimi sonradan değiştirmenin bir yolu olmalı.
// Olmayınca "klavyem var" diyen oyuncu ekran klavyesine hiç ulaşamıyordu.
const softKbdGroup = document.getElementById("softKbdGroup");

function softAyarTazele() {
  if (!softKbdGroup) return;
  const acik = softAktif();
  softKbdGroup.querySelectorAll("[data-soft]").forEach((b) => {
    const secili = (b.dataset.soft === "1") === acik;
    b.classList.toggle("active", secili);
    b.setAttribute("aria-pressed", secili ? "true" : "false");
  });
}

if (softKbdGroup) {
  softKbdGroup.querySelectorAll("[data-soft]").forEach((b) => {
    b.addEventListener("click", () => {
      if (b.dataset.soft === "1") localStorage.setItem(SOFT_KEY, "1");
      else localStorage.removeItem(SOFT_KEY);
      softAyarTazele();
      softArayuzuTazele();
    });
  });
  softAyarTazele();
}

const touchSoftBtn = document.getElementById("touchSoftBtn");
if (touchSoftBtn) {
  touchSoftBtn.addEventListener("click", () => {
    localStorage.setItem(KEYBOARD_OK_KEY, "1");
    localStorage.setItem(SOFT_KEY, "1");
    if (touchNoticeEl) touchNoticeEl.classList.add("hidden");
    startGame(bekleyenDiffKey || currentDiffName);
  });
}

function startGame(diffKey) {
  // Dokunmatik cihazda önce uyar; oyuncu "klavyem var" derse buraya döneriz.
  if (dokunmatikUyarisiGerekli()) {
    bekleyenDiffKey = diffKey;
    showTouchNotice();
    return;
  }
  // Günlük görevde herkes aynı komut/tuzak dizisini görsün diye Math.random
  // günün tarihinden türeyen sabit tohumlu üretece bağlanır. Diğer modlarda
  // gerçek rastgeleliğe geri dönülür (endGame de ayrıca geri alır).
  if (isGunluk()) { setSeededRandom(); freezeBags(); }
  else { restoreRandom(); unfreezeBags(); }
  noiseStreak = 0;                                   // üretim durumu da sıfırdan başlasın
  difficulty = DIFFICULTIES[diffKey];
  currentDiffName = diffKey;
  resetGame();
  lessonLinesDone = 0;
  lessonFinish = false;
  statsStartGame();                                // analiz sayaçlarını sıfırla
  const weak = refreshWeakLetters();                 // Faz 4: antrenman hedeflerini tazele
  if (typeof markWeakKeys === "function") markWeakKeys(weak);
  menuEl.classList.add("hidden");
  gameoverEl.classList.add("hidden");
  statsPanelEl.classList.add("hidden");
  if (scoreClockContainer) scoreClockContainer.classList.remove("hidden");
  // Baskısız modlarda skor gizlenir. Sonuç ekranı zaten gizliyor ("pratikte
  // skor ve rekor anlamsız"), ama oyun boyunca saatin yanında duruyordu —
  // ders ortasında öğrenciye anlamsız dediğimiz sayıyı göstermek tutarsızdı.
  // Saat kalır: baskısız modlarda yukarı sayar ve kendi hızını görmen içindir.
  if (scoreEl) scoreEl.classList.toggle("hidden", isZamansiz());
  if (termInputEl) termInputEl.classList.remove("hidden");
  // Seviye atlamayı yakalayabilmek için oyun ÖNCESİ seviyeyi sakla
  levelAtStart = levelInfo().level;
  running = true;
  waitingStart = true;                               // ilk tuşa kadar donuk bekle
  statusEl.textContent = "hazır olduğunda yazmaya başla";
  if (pauseBtn) pauseBtn.classList.remove("hidden");
  // "bitir" her modda görünür: baskısız modlarda oyunun tek bitiş yolu,
  // sızma modunda ise istediğin an çıkıp sonucu görmeni sağlar.
  if (finishBtn) finishBtn.classList.remove("hidden");
  // Ekran klavyesi modunda ⌨ düğmesi görünür ve klavye hemen açılır.
  // (startGame bir tıklama işleyicisinden çağrıldığı için focus'a izin verilir.)
  softArayuzuTazele();     // dokunmatik modda sil/iptal tuşları görünsün
  requestAnimationFrame(gameLoop);
}

// Oyunu bitir → sonuç ekranı
function endGame() {
  restoreRandom();
  unfreezeBags();
  running = false;
  paused = false;
  // Boss aktifken süre biterse (ya da "bitir"e basılırsa) boss durumu ekranda
  // kalıyordu: can barı ve boss-mode terminali sonuç ekranıyla menüye taşınıyor,
  // ancak bir sonraki resetGame'de temizleniyordu. Burada tamamını kapatıyoruz.
  bossActive = false;
  document.body.classList.remove("boss-alarm");
  document.body.classList.remove("theme-overdrive");
  if (bossBarEl) bossBarEl.classList.add("hidden");
  terminalEl.classList.remove("boss-mode");
  if (typeof updateMatrixColors === "function") updateMatrixColors();
  if (typeof updateMatrixSpeed === "function") updateMatrixSpeed(0);
  if (pauseBtn) pauseBtn.classList.add("hidden");
  if (finishBtn) finishBtn.classList.add("hidden");
  if (scoreClockContainer) scoreClockContainer.classList.add("hidden");
  if (termInputEl) termInputEl.classList.add("hidden");
  if (pauseOverlay) pauseOverlay.classList.add("hidden");
  // Oyun bitti: ekran klavyesi kapansın, sonuç ekranı görünür olsun
  softArayuzuTazele();     // oyun bitti → sil/iptal tuşları gizlensin
  clearTyping();
  if (typeof highlightNextKey === "function") highlightNextKey(null);
  updateInputDisplay();

  // Skor tutulmayan modlarda paylaşacak bir skor da yok → düğmeyi gizle
  const shareBtn = document.getElementById("shareScoreBtn");
  if (shareBtn) shareBtn.classList.toggle("hidden", isZamansiz());
  if (lessonResultEl && !isEgitim()) lessonResultEl.classList.add("hidden");

  // Pratik modunda skor ve rekor anlamsız (ceza yok, süre yok — skor sadece
  // ne kadar oynadığını gösterirdi). Sonuç ekranı analiz raporuna dönüşür.
  if (isEgitim()) {
    overTitleEl.textContent = "ders " + currentLessonNo + " bitti";
    overScoreRow.classList.add("hidden");
    overBestRow.classList.add("hidden");
    statsEndGame(score, "ders " + currentLessonNo);
    statusEl.textContent = "ders bitti — " + wpmOf(sStats) + " WPM";
    if (lessonResultEl) {
      lessonResultEl.classList.remove("hidden");
      lessonResultEl.innerHTML = renderLessonResult();
    }
  } else if (isZamansiz()) {
    const ad = isDrill() ? "antrenman" : "pratik";
    overTitleEl.textContent = ad + " bitti";
    overScoreRow.classList.add("hidden");
    overBestRow.classList.add("hidden");
    statsEndGame(score, isDrill() ? ("parmak: " + drillTarget) : "pratik");
    statusEl.textContent = ad + " bitti — " + wpmOf(sStats) + " WPM";
  } else {
    overTitleEl.textContent = isGunluk() ? "günlük görev bitti" : "süre doldu";
    overScoreRow.classList.remove("hidden");
    overBestRow.classList.remove("hidden");
    const best = Math.max(score, getBest());
    localStorage.setItem(BEST_KEY, String(best));
    animateCountUp(finalScoreEl, score, 700);                 // skor sayarak yukarı çıkar
    bestScoreEl.textContent = best;
    // Günlük görev lider tablosunda kendi adıyla dursun, "orta" ile karışmasın
    statsEndGame(score, isGunluk() ? "günlük" : currentDiffName);
    statusEl.textContent = "oyun bitti";
  }
  // Seviye kutusu: kazanılan XP + (varsa) seviye atlama.
  // statsEndGame ZATEN çağrıldı, yani lifetime güncel — seviye buradan okunur.
  if (overLevelEl) overLevelEl.innerHTML = renderLevelResult(levelAtStart);
  overStatsEl.innerHTML = renderGameOverStats();              // kısa özeti bas
  gameoverEl.classList.remove("hidden");
  if (!isZamansiz() && typeof playGameOver === "function") playGameOver();
}

// Menüyü göster (en iyi skoru tazele)
function showMenu() {
  clearTyping();
  if (typeof highlightNextKey === "function") highlightNextKey(null);
  updateInputDisplay();
  // Depolama engelliyse (bkz. js/storage.js) oyun bellek içi taklitle çalışır:
  // her şey normal görünür ama sekme kapanınca ilerleme uçar. Sessizce yitirmek
  // yerine söylenmeli — oyuncu isterse tarayıcı ayarını düzeltebilir.
  if (window.SIZMA_DEPOLAMA_KALICI === false) {
    statusEl.textContent = "uyarı: tarayıcı kaydetmeye izin vermiyor — ilerleme saklanmayacak";
  }
  menuBestEl.textContent = getBest();
  if (levelBoxEl) levelBoxEl.innerHTML = renderLevelBar();
  const hintEl = document.getElementById("adaptHint");
  if (hintEl) hintEl.textContent = adaptiveHint();   // Faz 4: neyi çalıştırıyoruz?
  gameoverEl.classList.add("hidden");
  menuEl.classList.remove("hidden");
  if (pauseBtn) pauseBtn.classList.add("hidden");
  if (finishBtn) finishBtn.classList.add("hidden");
  if (scoreClockContainer) scoreClockContainer.classList.add("hidden");
  if (termInputEl) termInputEl.classList.add("hidden");
  applyModeUI();
}

// --- Düğmeleri bağla ---
document.querySelectorAll(".diff-btn[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => startGame(btn.dataset.diff));
});

// --- Share Score (Faz 12) ---
// Pano API'si yoksa (file:// ile açılan sayfa) gizli bir textarea üzerinden kopyala
function copyFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0;";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

const shareScoreBtn = document.getElementById("shareScoreBtn");
if (shareScoreBtn) {
  shareScoreBtn.addEventListener("click", () => {
    const acc = typeof accuracyOf === "function" ? accuracyOf(sStats) : 100;
    const wpm = typeof wpmOf === "function" ? wpmOf(sStats) : 0;
    const modeName = isGunluk() ? "Günlük Görev 📅" : (currentDiffName.toUpperCase() + " Mod");
    
    let text = `SIZMA [${modeName}] 💻\nSkor: ${score} Puan\n🎯 %${acc} Doğruluk | ⌨️ ${wpm} WPM`;
    if (isGunluk()) text += "\nBugünün görevini tamamladım!";

    const geriBildir = (ok) => {
      const oldText = shareScoreBtn.dataset.label || shareScoreBtn.textContent;
      shareScoreBtn.dataset.label = oldText;
      shareScoreBtn.textContent = ok ? "✅ Kopyalandı!" : "⚠ kopyalanamadı";
      setTimeout(() => { shareScoreBtn.textContent = oldText; }, 2000);
    };

    // navigator.clipboard yalnızca güvenli bağlamda (https / localhost) var;
    // dosya olarak açıldığında eski execCommand yoluna düşeriz.
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => geriBildir(true))
        .catch(() => geriBildir(copyFallback(text)));
    } else {
      geriBildir(copyFallback(text));
    }
  });
}

// --- Mod seçimi (Faz 7) ---
const finishBtn    = document.getElementById("finishBtn");
const overTitleEl  = document.getElementById("overTitle");
const overScoreRow = document.getElementById("overScoreRow");
const overBestRow  = document.getElementById("overBestRow");
const modeSubEl    = document.getElementById("modeSub");
const diffLabelEl  = document.getElementById("diffLabel");
const menuBestRow  = document.getElementById("menuBestRow");
const levelBoxEl   = document.getElementById("levelBox");
const overLevelEl  = document.getElementById("overLevel");
const drillTargetRow = document.getElementById("drillTargetRow");
const drillTargetSel = document.getElementById("drillTarget");
const lessonRowEl    = document.getElementById("lessonRow");
const lessonListEl   = document.getElementById("lessonList");
const lessonLabelEl  = document.getElementById("lessonLabel");
const lessonResultEl = document.getElementById("lessonResult");
const diffRowEl      = document.getElementById("diffRow");

// ==========================================================================
// Eğitim modu — ders listesi ve değerlendirme (Faz 12)
// ==========================================================================

function starStr(n, max) {
  return "★".repeat(n) + "☆".repeat(Math.max(0, (max || 3) - n));
}

// Dersi başlat. Dersler baskısız oynanır ve HER ZAMAN "kolay" tempoda iner:
// dersin zorluğu satır hızından değil, geçmek için gereken doğruluk/hız
// eşiğinden gelir. Yeni başlayan bir oyuncu satırları okuyabilmelidir.
function startLesson(no) {
  currentLessonNo = no;
  startGame("kolay");
  const ders = lessonById(no);
  statusEl.textContent = "ders " + no + (ders ? " — " + ders.title.toLowerCase() : "") +
                         " · hazır olduğunda yazmaya başla";
}

function renderLessonList() {
  if (!lessonListEl) return;
  const data = loadLessons();
  const dersler = visibleLessons();
  const siradaki = currentLesson();

  if (lessonLabelEl) {
    lessonLabelEl.textContent = "müfredat · " + lessonTotalStars() + "/" +
                                (dersler.length * 3) + " ★";
  }

  lessonListEl.innerHTML = dersler.map(l => {
    const acik = l.no <= data.acilan;
    const sonuc = data.sonuclar[String(l.no)] || null;
    const yildiz = sonuc ? (sonuc.yildiz || 0) : 0;
    const bitti = yildiz > 0;
    const cls = ["lesson-card"];
    if (!acik) cls.push("locked");
    if (bitti) cls.push("done");
    if (l.no === siradaki) cls.push("current");
    // Kilitli ders de TIKLANABİLİR: kilit yol gösterir, duvar örmez.
    // Zaten yazabilen biri ilk derslerde oyalanmak zorunda kalmamalı.
    const ipucu = l.desc + (acik ? "" : " (kilitli — yine de deneyebilirsin)");
    return '<button class="' + cls.join(" ") + '" data-lesson="' + l.no + '" title="' +
             ipucu.replace(/"/g, "&quot;") + '">' +
             '<span class="lesson-no">' + (acik ? l.no : "🔒") + '</span>' +
             '<span class="lesson-name">' + l.title + '</span>' +
             '<span class="lesson-stars">' + starStr(yildiz, 3) + '</span>' +
             '<span class="lesson-goal">%' + l.acc + ' · ' + l.wpm + ' WPM</span>' +
           '</button>';
  }).join("");

  lessonListEl.querySelectorAll(".lesson-card").forEach(btn => {
    btn.addEventListener("click", () => startLesson(Number(btn.dataset.lesson)));
  });
}

// Ders sonu değerlendirmesi. Yarım bırakılan ders (■ bitir ile erken çıkış)
// kaydedilmez — 2 satır yazıp %100 doğrulukla geçmek mümkün olmamalı.
function renderLessonResult() {
  const ders = lessonById(currentLessonNo);
  if (!ders) return "";
  const wpm = wpmOf(sStats);
  const acc = accuracyOf(sStats);

  if (lessonLinesDone < LESSON_LINES) {
    return '<div class="lesson-result half">' +
             '<p class="lesson-verdict">ders yarım kaldı</p>' +
             '<p class="lesson-detail">' + lessonLinesDone + '/' + LESSON_LINES +
               ' satır — değerlendirme için dersi tamamlaman gerekiyor.</p>' +
           '</div>';
  }

  const sonuc = recordLessonResult(currentLessonNo, wpm, acc);
  const satir = (ok, etiket, deger, hedef) =>
    '<p class="lesson-detail ' + (ok ? "ok" : "fail") + '">' +
      (ok ? "✓" : "✗") + " " + etiket + ": <b>" + deger + "</b> (hedef " + hedef + ")</p>";

  let html = '<div class="lesson-result ' + (sonuc.gecti ? "pass" : "fail") + '">';
  html += '<p class="lesson-verdict">' +
            (sonuc.gecti ? "ders geçildi " + starStr(sonuc.yildiz, 3) : "eşiğin altında kaldın") +
          '</p>';
  html += satir(sonuc.accOk, "doğruluk", "%" + acc, "%" + ders.acc);
  html += satir(sonuc.wpmOk, "hız", wpm + " WPM", ders.wpm + " WPM");
  if (sonuc.yeniAcilan) {
    const y = lessonById(sonuc.yeniAcilan);
    html += '<p class="lesson-unlock">🔓 Ders ' + sonuc.yeniAcilan +
            (y ? " — " + y.title : "") + ' açıldı</p>';
  } else if (!sonuc.gecti) {
    html += '<p class="lesson-detail">tekrar dene — yıldızın düşmez, sadece yükselir.</p>';
  }
  html += '</div>';
  return html;
}

if (drillTargetSel && typeof DRILL_TARGETS !== "undefined") {
  drillTargetSel.innerHTML = DRILL_TARGETS
    .map(t => '<option value="' + t.key + '">' + t.label + '</option>').join("");
  drillTarget = localStorage.getItem("sizmaDrillTarget") || "ev";
  drillTargetSel.value = drillTarget;
  drillTargetSel.addEventListener("change", () => {
    drillTarget = drillTargetSel.value;
    localStorage.setItem("sizmaDrillTarget", drillTarget);
  });
}

// Menüyü seçili moda göre giydir
function applyModeUI() {
  document.querySelectorAll(".mode-btn").forEach((b) => {
    const secili = b.dataset.mode === gameMode;
    b.classList.toggle("active", secili);
    b.setAttribute("aria-pressed", secili ? "true" : "false");
  });
  if (modeSubEl) {
    modeSubEl.textContent =
      isEgitim() ? "sıfırdan başla: dersler, eşikler, yıldızlar" :
      isGunluk() ? "herkes için aynı komutlar, aynı tuzaklar" :
      isDrill()  ? "parmakları izole et, kas hafızasını kur" :
      isPratik() ? "süre yok, ceza yok — sadece yaz ve ölç"
                 : "komutu bul, yaz, süreye karşı yarış";
  }
  // Zorluk satırı moda göre giydirilir: günlükte tek "Oyna" düğmesi kalır,
  // parmak modunda çalışma türüne, diğerlerinde zorluk/hız seçimine döner.
  const diffBtns = document.querySelectorAll(".diff-btn[data-diff]");
  // Eğitimde zorluk seçimi yok: oyunu ders kartları başlatır, tempo hep kolay.
  if (lessonRowEl) lessonRowEl.classList.toggle("hidden", !isEgitim());
  if (diffLabelEl) diffLabelEl.classList.toggle("hidden", isEgitim());
  if (diffRowEl)   diffRowEl.classList.toggle("hidden", isEgitim());
  if (isEgitim()) {
    renderLessonList();
    if (menuBestRow) menuBestRow.classList.add("hidden");
    if (drillTargetRow) drillTargetRow.classList.add("hidden");
    return;
  }

  if (isGunluk()) {
    if (diffLabelEl) diffLabelEl.textContent = "görevi başlat";
    diffBtns.forEach((b) => {
      const tek = b.dataset.diff === "orta";      // günlük hep orta dengede oynanır
      b.style.display = tek ? "" : "none";
      if (tek) b.textContent = "Oyna";
    });
  } else {
    if (diffLabelEl) {
      diffLabelEl.textContent = isDrill() ? "çalışma türü"
                              : isPratik() ? "hız seç"
                              : "zorluk seç";
    }
    const etiketler = isDrill() ? ["Isınma", "Karışık", "Odaklı"]
                                : ["Kolay", "Orta", "Zor"];
    diffBtns.forEach((b, i) => {
      b.style.display = "";
      if (etiketler[i]) b.textContent = etiketler[i];
    });
  }
  // Baskısız modlarda skor tutulmuyor → menüdeki rekor satırı da anlamsız
  if (menuBestRow) menuBestRow.classList.toggle("hidden", isZamansiz());
  // Hedef seçici yalnızca parmak modunda
  if (drillTargetRow) drillTargetRow.classList.toggle("hidden", !isDrill());
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    gameMode = btn.dataset.mode;
    localStorage.setItem("sizmaMode", gameMode);
    applyModeUI();
  });
});

// Pratiği bitir → sonuç/analiz ekranı
if (finishBtn) finishBtn.addEventListener("click", () => { if (running) endGame(); });

// Son seçilen modu hatırla
gameMode = localStorage.getItem("sizmaMode") || "sizma";
// "tekrar oyna" gerçekten yeniden başlatır: aynı mod, aynı zorluk, menüye uğramadan.
// (Eskiden bu düğme de menüye dönüyordu — etiketi yanlıştı.)
restartBtn.addEventListener("click", () => {
  if (isEgitim()) startLesson(currentLessonNo);   // aynı dersi baştan
  else startGame(currentDiffName);
});
// Menüye dönüş ayrı düğmede
const menuBtn = document.getElementById("menuBtn");
if (menuBtn) menuBtn.addEventListener("click", showMenu);

// --- İstatistik paneli ---
const statsPanelEl = document.getElementById("statsPanel");
const statsBodyEl  = document.getElementById("statsBody");
const overStatsEl  = document.getElementById("overStats");
let statsCameFrom  = "menu";      // panelden çıkınca nereye döneceğiz

function openStats(from) {
  statsCameFrom = from;
  statsBodyEl.innerHTML = renderStatsPanel();
  const lbBody = document.getElementById("leaderboardBody");
  if (lbBody && typeof renderLeaderboard === "function") lbBody.innerHTML = renderLeaderboard();
  
  // Heatmap klavyesini çiz (Faz 8)
  if (typeof renderKeyboard === "function" && typeof getHeatmapData === "function") {
    renderKeyboard(currentLayout, "statsHeatmap", true, getHeatmapData(loadLifetime()));
  }
  menuEl.classList.add("hidden");
  gameoverEl.classList.add("hidden");
  statsPanelEl.classList.remove("hidden");
}
function closeStats() {
  statsPanelEl.classList.add("hidden");
  if (statsCameFrom === "gameover") gameoverEl.classList.remove("hidden");
  else showMenu();
}
document.getElementById("statsBtn").addEventListener("click", () => openStats("menu"));
document.getElementById("overStatsBtn").addEventListener("click", () => openStats("gameover"));
document.getElementById("statsCloseBtn").addEventListener("click", closeStats);

const exportBtn = document.getElementById("exportBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    if (typeof exportData === "function") exportData();
  });
}

const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
if (importBtn && importFile) {
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    // aynı dosya tekrar seçilebilsin diye input'u sıfırla
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof importData === "function" && importData(ev.target.result)) {
        alert("Veriler başarıyla içe aktarıldı! Sayfa yenileniyor...");
        location.reload();
      } else {
        alert("Veri içe aktarılamadı. Dosya hatalı veya bozuk olabilir.");
      }
    };
    reader.onerror = () => alert("Dosya okunamadı.");
    reader.readAsText(file);
  });
}
document.getElementById("statsResetBtn").addEventListener("click", () => {
  resetStats();
  statsBodyEl.innerHTML = renderStatsPanel();
  if (typeof renderKeyboard === "function" && typeof getHeatmapData === "function") {
    renderKeyboard(currentLayout, "statsHeatmap", true, getHeatmapData(loadLifetime()));
  }
  // XP = ömür boyu doğru karakter olduğu için veri sıfırlanınca seviye de sıfırlanır
  if (levelBoxEl) levelBoxEl.innerHTML = renderLevelBar();
});

// --- Tutorial sistemi ---
const TUTORIAL_KEY = "sizmaTutorialSeen";
const TUTORIAL_STEPS = [
  {
    title: "🎯 görev",
    body: `Ekrandan inen satırlarda gizli <code>komutları</code> bul.<br>
           Komutlar işaretlerin içinde gizlenir:<br>
           <code>[komut]</code> <code>$komut$</code> <code>(komut)</code> <code>&lt;komut&gt;</code> <code>{komut}</code><br><br>
           Gürültü arasından işaretleri ayıkla ve komutu yaz!`
  },
  {
    title: "⌨️ yazma",
    body: `Harflere bas → eşleşen komutlar <span style="color:#7ee787">yeşile</span> döner.<br>
           Tek aday kalınca o satıra <b>kilitlenirsin</b>; birden fazlaysa
           alttaki yazma çubuğunda kaç aday kaldığını görürsün.<br><br>
           Yazımı iptal etmek için <code>Esc</code>, son harfi silmek için
           <code>Backspace</code>.<br>
           Yanlış harf ceza vermez — sadece ilerlemez; çubuk kırmızı titrer.`
  },
  {
    title: "⏱️ zaman = can",
    body: `Üstteki sayaç senin canın. İlk tuşa basınca süre işlemeye başlar.<br><br>
           ✅ Doğru komut → süre kazancı <b>komut uzunluğuna göre</b> artar
           (orta seviyede ~7 sn / kısa, ~10 sn / uzun komut)<br>
           ❌ Kaçan komut → <span style="color:#f0883e">-1.5 sn</span><br>
           🎭 Tuzağa düşme → <span style="color:#ff6b6b">-3 sn</span><br>
           💥 Bomba patlaması → <span style="color:#ff2e97">-4 sn</span><br><br>
           <b>Hedef hızda yazarsan saat sabit kalır — daha hızlıysan uzar!</b>`
  },
  {
    title: "👾 düşmanlar",
    body: `<span class="emoji-label">🎭</span> <b>Tuzak</b> — işaret <span style="color:#ff6b6b">kırmızı</span> yanıp söner → <b>YAZMA!</b> Geçir gitsin.<br>
           <span class="emoji-label">🔀</span> <b>Değişken</b> — komut arada değişir, hızlı ol.<br>
           <span class="emoji-label">✂️</span> <b>Bölünen</b> — ekranın ortasında ikiye ayrılır.<br>
           <span class="emoji-label">⏱️</span> <b>Bomba</b> — kendi sayacı var, sıfırlanırsa patlar!<br><br>
           Düşmanlar oyun ilerledikçe ortaya çıkar.`
  },
  {
    title: "🔥 boss",
    body: `Her <b>45 saniyede</b> bir boss (Güvenlik Duvarı) gelir.<br>
           Üstte can barı belirir — <b>5 komutu</b> yazarak yık!<br><br>
           Boss aktifken:<br>
           • Komutlar daha uzun<br>
           • Hız biraz artar<br>
           • Ekranda daha çok komut iner (tuzak oranı ~%18)<br><br>
           Boss'u yenersen → <span style="color:#7ee787">+10 sn</span> ve <span style="color:#ffd93d">+500 puan</span>!`
  },
  {
    title: "💡 ipuçları",
    body: `<b>Modlar:</b> ⏱ Sızma (ana oyun) · 🎯 Pratik (baskısız) · ✋ Parmak (izole antrenman)<br><br>
           <b>Seri (combo):</b> Art arda komut yaz → çarpan artar!
           3 seri = x1.5, 6 seri = x2.0, ...<br><br>
           <b>Klavye rehberi:</b> Alt kısımdaki klavye sıradaki tuşu gösterir.<br><br>
           <b>Analiz:</b> İstatistiklerini takip et, zayıf noktanı geliştir!<br><br>
           <b>Duraklat:</b> <code>Esc</code> veya ⏸ butonu · <b>Ses:</b> 🔊 ile kapat/aç<br><br>
           Hazırsan menüden bir zorluk seç ve başla! 🚀`
  },
];

let tutorialStep = 0;

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  const stepEl = document.getElementById("tutStep");
  stepEl.innerHTML =
    '<div class="tut-step-title">' + step.title + '</div>' +
    '<div class="tut-step-body">' + step.body + '</div>';
  // Adım noktaları
  const dotsEl = document.getElementById("tutDots");
  dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) =>
    '<div class="tut-dot' + (i === tutorialStep ? ' active' : '') + '"></div>'
  ).join("");
  // Buton durumları
  document.getElementById("tutPrev").style.visibility =
    tutorialStep === 0 ? "hidden" : "visible";
  const nextBtn = document.getElementById("tutNext");
  nextBtn.textContent =
    tutorialStep === TUTORIAL_STEPS.length - 1 ? "tamam ✓" : "ileri →";
}

function showTutorial() {
  tutorialStep = 0;
  renderTutorialStep();
  menuEl.classList.add("hidden");
  gameoverEl.classList.add("hidden");
  document.getElementById("tutorialOverlay").classList.remove("hidden");
}

function closeTutorial() {
  document.getElementById("tutorialOverlay").classList.add("hidden");
  localStorage.setItem(TUTORIAL_KEY, "1");
  showMenu();
}

document.getElementById("tutPrev").addEventListener("click", () => {
  if (tutorialStep > 0) { tutorialStep--; renderTutorialStep(); }
});
document.getElementById("tutNext").addEventListener("click", () => {
  if (tutorialStep < TUTORIAL_STEPS.length - 1) { tutorialStep++; renderTutorialStep(); }
  else closeTutorial();
});
document.getElementById("tutorialBtn").addEventListener("click", showTutorial);
document.getElementById("resumeBtn").addEventListener("click", togglePause);
// Başlıktaki ⏸ butonu: eskiden HİÇ bağlanmamıştı, duraklatma yalnızca Esc ile
// çalışıyordu ("durdurma butonu çalışmıyor" hatası).
if (pauseBtn) pauseBtn.addEventListener("click", togglePause);
// Duraklatma ekranından menüye dön
const quitBtn = document.getElementById("quitBtn");
if (quitBtn) quitBtn.addEventListener("click", () => {
  paused = false;
  running = false;
  if (pauseOverlay) pauseOverlay.classList.add("hidden");
  if (pauseBtn) pauseBtn.textContent = "\u23F8";
  showMenu();
});

// --- Komut torbalarını diskten geri yükle (oyunlar arası tekrar önleme) ---
loadBags();

// --- Ses sistemi ---
if (typeof initAudio === "function") initAudio();

// --- Açılışta menüyü göster ---
showMenu();
// Dokunmatik tercihi hatırlanmış olabilir: klavyeyi açılışta da o duruma getir
softArayuzuTazele();

// İlk kez oynayan oyuncuya tutorial göster
if (!localStorage.getItem(TUTORIAL_KEY)) {
  showTutorial();
}

// --- Klavyeyi başlat ---
(function initKeyboard() {
  if (typeof renderKeyboard !== "function") return;
  const savedLayout = localStorage.getItem("sizmaLayout") || "TR-Q";
  currentLayout = savedLayout;                       // komut bankası dilini belirler
  const layoutSelect = document.getElementById("layoutSelect");
  if (layoutSelect) {
    layoutSelect.value = savedLayout;
    layoutSelect.addEventListener("change", () => {
      currentLayout = layoutSelect.value;
      renderKeyboard(currentLayout);
      localStorage.setItem("sizmaLayout", currentLayout);
    });
  }
  renderKeyboard(savedLayout);
})();

// === Matrix Rain arka plan efekti ===
(function initMatrixRain() {
  if (!matrixCanvas || prefersReducedMotion) return;
  const ctx = matrixCanvas.getContext("2d");
  const chars = "01アカサタナハマヤラワ:./\\{}[]<>$#@&";
  const fontSize = 16;
  let columns = [];
  
  let fadeColor = "rgba(10, 14, 10, 0.05)";
  let textColor = "rgba(126, 231, 135, 0.25)";
  let matrixSpeed = 1;

  window.updateMatrixSpeed = function(streak) {
    matrixSpeed = 1 + Math.min(streak * 0.1, 4);
  };

  window.updateMatrixColors = function() {
    if (bossActive) {
      textColor = "rgba(255, 50, 50, 0.4)";
      fadeColor = "rgba(20, 0, 0, 0.08)";
      return;
    }
    const style = getComputedStyle(document.body);
    const rgbPrimary = style.getPropertyValue('--rgb-primary').trim() || "126, 231, 135";
    textColor = `rgba(${rgbPrimary}, 0.25)`;
    fadeColor = "rgba(0, 0, 0, 0.05)"; 
  };
  window.updateMatrixColors();

  function resize() {
    matrixCanvas.width  = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const cols = Math.floor(matrixCanvas.width / fontSize);
    columns = Array.from({ length: cols }, () =>
      Math.floor(Math.random() * -30)
    );
  }

  function draw() {
    ctx.fillStyle = fadeColor;
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = textColor;
    ctx.font = fontSize + "px 'JetBrains Mono', monospace";

    for (let i = 0; i < columns.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x  = i * fontSize;
      const y  = Math.floor(columns[i]) * fontSize;
      if (y > 0) ctx.fillText(ch, x, y);
      if (y > matrixCanvas.height && Math.random() > 0.975) {
        columns[i] = Math.floor(Math.random() * -15);
      }
      columns[i] += matrixSpeed;
    }
    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
})();