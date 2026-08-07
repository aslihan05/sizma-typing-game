// === Eğitim Modu — Müfredat (Faz 12) ===
// Sıralı, kilitli ders merdiveni. Parmak modu "serbest antrenman"dır (istediğin
// hedefi seçersin); Eğitim modu ise bir ÖĞRENME YOLUDUR: nereden başlayacağını
// ve sıradaki adımın ne olduğunu oyun söyler.
//
// Dersler KONUM tabanlıdır, harf tabanlı değil. "Ev sırası" TR-Q'da asdfg hjklş,
// TR-F'de uieaü tkmly demektir; ders tanımları klavye satırı ve parmak indeksi
// üzerinden yazıldığı için düzen değişince ilerleme bozulmaz.
//
// Alıştırma dizilerini üretmek için js/drills.js'in yardımcıları kullanılır
// (drillGroup, drillRowLetters, drillFingerLetters) — aynı işi iki yerde
// yazmamak için. Bu dosya drills.js'ten SONRA yüklenmelidir.

const LESSONS_KEY = "sizmaLessons";

// Bir ders kaç alıştırma satırı sürer? Süre baskısı yok (Pratik/Parmak gibi);
// ders bu kadar satır tamamlanınca biter ve değerlendirilir.
const LESSON_LINES = 10;

// Yıldız eşikleri: geçme = ★, hedef hızın 1.2 katı = ★★, 1.5 katı = ★★★.
// Doğruluk eşiği her yıldız için şart — hızlı ama hatalı yazmak yıldız kazandırmaz.
const LESSON_STAR_MULT = [1, 1.2, 1.5];

// --- Ders tanımları ---
// row     : "ev" | "üst" | "alt"  → o satırın harfleri
// fingers : verilirse yalnızca bu parmakların harfleri (0-3 sol, 4-7 sağ)
// kind    : "dayanak" | "satır" | "karışık" | "komut" | "türkçe" | "simge"
//
// DOĞRULUK EŞİĞİ YÜKSELEN bir eğridir (88 → 95), düz değil. İlk hâlinde 1. ders
// %96 ile müfredatın EN KATI dersiydi; 10. ders (rakam & noktalama) %94'tü.
// Yani sıfırdan başlayan biri, kasları hiç oturmamışken en sert kapıyla
// karşılaşıyordu. Üstelik yanlış harf ilerletmediği için tuş arayan bir
// başlangıç oyuncusu TEK karakter için birkaç hata biriktiriyor: 137
// karakterlik 1. derste %96, tüm derste yalnızca ~5 yanlış basış demekti.
// Ders 1 tam da "tuş aramayı" bitirmek için var; onu ölçmeden cezalandıramaz.
// "Doğruluk birincil" ilkesi korunuyor — sadece eğri doğru yöne bakıyor.
const LESSONS = [
  {
    no: 1, kind: "dayanak", title: "Dayanak Tuşları",
    desc: "Sekiz parmağın evdeki yeri. Eller buradan kalkmaz, buraya döner.",
    acc: 88, wpm: 12,
  },
  {
    no: 2, kind: "satır", row: "ev", title: "Ev Sırası",
    desc: "Ev sırasının tamamı — işaret parmaklarının yana uzandığı tuşlar dahil.",
    acc: 90, wpm: 14,
  },
  {
    no: 3, kind: "satır", row: "üst", fingers: [2, 3, 4, 5],
    title: "Üst Sıra — İşaret & Orta",
    desc: "Üst sıraya ilk çıkış: en güçlü dört parmakla.",
    acc: 91, wpm: 14,
  },
  {
    no: 4, kind: "satır", row: "üst", title: "Üst Sıra",
    desc: "Üst sıranın tamamı — yüzük ve serçe parmaklar da devrede.",
    acc: 92, wpm: 16,
  },
  {
    no: 5, kind: "satır", row: "alt", fingers: [2, 3, 4, 5],
    title: "Alt Sıra — İşaret & Orta",
    desc: "Alt sıraya iniş. Bilek sabit kalsın, parmaklar insin.",
    acc: 92, wpm: 16,
  },
  {
    no: 6, kind: "satır", row: "alt", title: "Alt Sıra",
    desc: "Alt sıranın tamamı. Serçe parmak en zorlanan yerdir, acele etme.",
    acc: 93, wpm: 18,
  },
  {
    no: 7, kind: "karışık", title: "Tüm Klavye",
    desc: "Üç sıra karışık. Artık klavyeye bakmadan yazabiliyor olmalısın.",
    acc: 94, wpm: 20,
  },
  {
    no: 8, kind: "komut", title: "Gerçek Komutlar",
    desc: "Diziler bitti. Bundan sonrası oyunun kendi komutları — asıl iş bu.",
    acc: 94, wpm: 22,
  },
  {
    no: 9, kind: "türkçe", title: "Türkçe Harfler",
    desc: "ğ ü ş ö ç ı — en çok atlanan, en çok hata yapılan tuşlar.",
    acc: 95, wpm: 22,
  },
  {
    no: 10, kind: "simge", title: "Rakam & Noktalama",
    desc: "En üst sıra ve işaretler. Eller evden kopmadan uzanmayı öğren.",
    acc: 94, wpm: 18,
  },
];

const LESSON_COUNT = LESSONS.length;

function lessonById(no) {
  return LESSONS.find(l => l.no === no) || null;
}

// Seçili klavye düzeninde anlamlı olan dersler.
// EN düzeninde ğüşöçı tuşları YOKTUR; "Türkçe Harfler" dersi orada sessizce
// ev sırası alıştırmasına düşerdi — yani sahte bir ders olurdu. Gizlenir.
function visibleLessons() {
  return LESSONS.filter(l => l.kind !== "türkçe" || lessonTurkishLetters().length > 0);
}

// ==========================================================================
// Harf kümeleri
// ==========================================================================

// Ev sırasındaki DAYANAK tuşları: sekiz parmağın altındaki tuşlar.
// Parmak haritasından türetmek güvenilir değil (TR-Q'da hem h hem j sağ işarete
// bağlı, hangisinin "ev" olduğunu harita söylemez). Bunun yerine satırdaki
// KONUM kullanılıyor: soldan 0-1-2-3 ve 6-7-8-9. Üç düzende de doğru sonucu
// verir (TR-Q: asdf jklş · TR-F: uiea kmly · EN: asdf jkl).
const LESSON_ANCHOR_POS = [0, 1, 2, 3, 6, 7, 8, 9];

function lessonAnchors() {
  const rows = (typeof KBD_LAYOUTS !== "undefined") ? KBD_LAYOUTS[currentLayout] : null;
  if (!rows) return [];
  const home = rows[2] || [];
  return LESSON_ANCHOR_POS.map(i => home[i]).filter(ch => ch && isDrillLetter(ch));
}

// Belirli parmaklara ait harfleri bir satırdan süz
function lessonRowByFingers(rowName, fingers) {
  const letters = drillRowLetters(rowName);
  if (!fingers) return letters;
  const map = (typeof KBD_FINGER_MAPS !== "undefined") ? KBD_FINGER_MAPS[currentLayout] : null;
  if (!map) return letters;
  return letters.filter(ch => fingers.indexOf(map[ch]) !== -1);
}

// Türkçeye özgü harfler — düzende gerçekten varsa alınır (EN düzeninde yok)
const LESSON_TR_CHARS = ["ğ", "ü", "ş", "ö", "ç", "ı"];

function lessonTurkishLetters() {
  const all = drillRowLetters("ev").concat(drillRowLetters("üst"), drillRowLetters("alt"));
  return LESSON_TR_CHARS.filter(ch => all.indexOf(ch) !== -1);
}

// Rakam ve noktalama: en üst sıra + satır sonlarındaki işaretler.
// isDrillLetter bunları eler, o yüzden burada kendi süzgecimiz var.
function lessonSymbols() {
  const rows = (typeof KBD_LAYOUTS !== "undefined") ? KBD_LAYOUTS[currentLayout] : null;
  if (!rows) return [];
  const out = [];
  (rows[0] || []).forEach(ch => out.push(ch));
  rows.slice(1).forEach(row => {
    row.forEach(ch => { if (!isDrillLetter(ch)) out.push(ch); });
  });
  return out;
}

// Bir diziyi n kez tekrarla — seçim havuzunda ağırlık vermenin en basit yolu.
function lessonRepeat(arr, n) {
  let out = [];
  for (let i = 0; i < n; i++) out = out.concat(arr);
  return out;
}

// Dersin harf kümesi ve dayanak (çıpa) tuşları.
// Çıpa, elin evden kopmaması için dizilere serpiştirilen tuşlardır.
function lessonLetterSet(no) {
  const lesson = lessonById(no);
  const anchors = lessonAnchors();
  if (!lesson) return { letters: anchors, anchors };

  let letters;
  switch (lesson.kind) {
    case "dayanak":
      letters = anchors.slice();
      break;
    case "satır":
      letters = lessonRowByFingers(lesson.row, lesson.fingers);
      break;
    case "karışık":
      letters = drillRowLetters("ev").concat(drillRowLetters("üst"), drillRowLetters("alt"));
      break;
    // Bu iki derste hedef harfler dayanak tuşlarıyla harmanlanır (yalnızca
    // ğüşöçı'dan dizi üretmek okunmaz ve bunaltıcı olurdu). Ama dersin KONUSU
    // hedef harfler olduğu için havuzda çoğaltılırlar; yoksa dayanak tuşları
    // baskın çıkıp ders adını hak etmiyordu ("fff sfa kçf" gibi diziler).
    case "türkçe":
      letters = lessonRepeat(lessonTurkishLetters(), 3).concat(anchors);
      break;
    case "simge":
      letters = lessonRepeat(lessonSymbols(), 3).concat(anchors);
      break;
    default:
      letters = anchors.slice();
  }

  if (!letters.length) letters = anchors.slice();

  // Ev sırası dışındaki derslerde bile çıpa ev sırasından gelir; ders ev
  // sırasındaysa zaten harflerin kendisi çıpadır.
  let anc = anchors.filter(ch => letters.indexOf(ch) !== -1);
  if (!anc.length) anc = anchors.length ? anchors.slice() : letters.slice();

  return { letters, anchors: anc };
}

// ==========================================================================
// Alıştırma satırı üretimi
// ==========================================================================

// Ders 8 gerçek komutlarla oynanır; satırı bu dosya üretmez, çağıran taraf
// oyunun komut bankasını kullanır. O yüzden null döner.
function lessonUsesCommands(no) {
  const lesson = lessonById(no);
  return !!lesson && lesson.kind === "komut";
}

function makeLessonLine(no) {
  if (lessonUsesCommands(no)) return null;
  const { letters, anchors } = lessonLetterSet(no);
  const groupCount = 3 + (Math.random() < 0.4 ? 1 : 0);
  const groups = [];
  for (let i = 0; i < groupCount; i++) groups.push(drillGroup(letters, anchors));
  return groups.join(" ");
}

// Ekrandaki satırlarla çakışmayan bir alıştırma üret.
// (Ön ek eşleştirmesinde iki aynı satır olursa hangisini yazdığın belirsizleşir)
function makeUniqueLessonLine(no, avoid) {
  for (let i = 0; i < 12; i++) {
    const line = makeLessonLine(no);
    if (!line) return null;
    if (!avoid || !avoid.has(line)) return line;
  }
  return makeLessonLine(no);
}

// ==========================================================================
// İlerleme kaydı
// ==========================================================================
// { acilan: 1, sonuclar: { "1": { wpm, acc, yildiz } } }

function loadLessons() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(LESSONS_KEY)); } catch (e) {}
  if (!raw || typeof raw !== "object") raw = {};
  return {
    acilan: Math.min(Math.max(raw.acilan || 1, 1), LESSON_COUNT),
    sonuclar: (raw.sonuclar && typeof raw.sonuclar === "object") ? raw.sonuclar : {}
  };
}

function saveLessons(data) {
  try { localStorage.setItem(LESSONS_KEY, JSON.stringify(data)); } catch (e) {}
}

function resetLessons() {
  try { localStorage.removeItem(LESSONS_KEY); } catch (e) {}
}

// Ders açık mı? (Kilitli dersler "yine de dene" ile oynanabilir — kilit yol
// gösterir, duvar örmez. Bu fonksiyon yalnızca görsel durumu söyler.)
function lessonUnlocked(no) {
  return no <= loadLessons().acilan;
}

function lessonResult(no) {
  return loadLessons().sonuclar[String(no)] || null;
}

function lessonStars(no) {
  const r = lessonResult(no);
  return r ? (r.yildiz || 0) : 0;
}

function lessonTotalStars() {
  let t = 0;
  for (const l of visibleLessons()) t += lessonStars(l.no);
  return t;
}

// Bu dersten sonraki İLK GÖRÜNÜR ders. Gizli ders (EN düzeninde Türkçe harfler)
// kilit zincirini kırmamalı: 8'i geçen oyuncu EN'de doğrudan 10'u açmalı,
// yoksa görünmeyen 9'un arkasında sonsuza kadar takılı kalırdı.
function nextVisibleLesson(no) {
  const gorunur = visibleLessons();
  const sonraki = gorunur.find(l => l.no > no);
  return sonraki ? sonraki.no : null;
}

// Bir sonucu değerlendir — kaydetmez, sadece hesaplar.
// Doğruluk eşiği her yıldız için şarttır: hızlı ama hatalı yazmak geçmez.
function evaluateLesson(no, wpm, acc) {
  const lesson = lessonById(no);
  if (!lesson) return { gecti: false, yildiz: 0, accOk: false, wpmOk: false };

  const accOk = acc >= lesson.acc;
  const wpmOk = wpm >= lesson.wpm;
  const gecti = accOk && wpmOk;

  let yildiz = 0;
  if (gecti) {
    yildiz = 1;
    for (let i = 1; i < LESSON_STAR_MULT.length; i++) {
      if (wpm >= lesson.wpm * LESSON_STAR_MULT[i]) yildiz = i + 1;
    }
  }
  return { gecti, yildiz, accOk, wpmOk, hedefAcc: lesson.acc, hedefWpm: lesson.wpm };
}

// Sonucu kaydet ve gerekirse bir sonraki dersi aç.
// Kayıt yalnızca İYİLEŞTİRİRSE üzerine yazılır — kötü bir tekrar oynayış
// önceki yıldızı düşürmez.
function recordLessonResult(no, wpm, acc) {
  const sonuc = evaluateLesson(no, wpm, acc);
  const data = loadLessons();
  const key = String(no);
  const onceki = data.sonuclar[key] || null;

  if (!onceki || sonuc.yildiz > (onceki.yildiz || 0) ||
      (sonuc.yildiz === (onceki.yildiz || 0) && wpm > (onceki.wpm || 0))) {
    data.sonuclar[key] = {
      wpm: Math.round(wpm),
      acc: Math.round(acc),
      yildiz: Math.max(sonuc.yildiz, onceki ? (onceki.yildiz || 0) : 0)
    };
  }

  // Kilit yalnızca gerçekten ilerlediyse açılır. Aynı dersi tekrar oynamak
  // "yeni ders açıldı" kutlamasını yeniden tetiklememeli.
  let yeniAcilan = null;
  if (sonuc.gecti && no >= data.acilan) {
    const sonraki = nextVisibleLesson(no);
    if (sonraki) {
      data.acilan = sonraki;
      yeniAcilan = sonraki;
    }
  }
  saveLessons(data);

  return Object.assign({}, sonuc, {
    yeniAcilan,
    ilkGecis: sonuc.gecti && !(onceki && onceki.yildiz > 0)
  });
}

// Oyuncunun kaldığı yer — ders seçim ekranında öne çıkarılır
function currentLesson() {
  const data = loadLessons();
  const gorunur = visibleLessons();
  for (const l of gorunur) {
    if (!data.sonuclar[String(l.no)] || !data.sonuclar[String(l.no)].yildiz) return l.no;
  }
  return gorunur.length ? gorunur[gorunur.length - 1].no : 1;
}
