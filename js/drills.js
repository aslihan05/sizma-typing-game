// === Parmak Antrenmanı Alıştırma Üreteci (Faz 7) ===
// Klasik 10 parmak müfredatı: belirli bir parmağın ya da klavye sırasının
// harflerinden diziler üretilir (fff jjj fjf jfj ...).
//
// Neden gerçek kelime değil de üretilen dizi?
// Kelime yazmak belirli bir parmağı İZOLE EDEMEZ — "kilidi aç" yazarken sekiz
// parmak birden çalışır. Parmak kası ancak o parmağın harfleri arka arkaya
// tekrarlanınca oturur. Oyunun kurgusunu bozmamak için diziler "şifre parçası /
// anahtar dizisi" gibi sunulur; zaten işaretlerin içinde iniyorlar.
//
// Klavye düzenine duyarlıdır: TR-Q, TR-F ve EN'de aynı "ev sırası" farklı
// harfler demektir; harfler KBD_LAYOUTS / KBD_FINGER_MAPS üzerinden okunur.

// Klavye sıraları (KBD_LAYOUTS satır indeksleri)
const DRILL_ROW_INDEX = { üst: 1, ev: 2, alt: 3 };

// Alıştırmaya girebilecek karakterler: sadece harfler.
// Rakamlar ve noktalama (. , * - = /) dışarıda — parmak kası kurmak için
// harf tekrarı gerekiyor, "x..v" gibi diziler hem okunmaz hem öğretmez.
function isDrillLetter(ch) {
  return /^[a-zçğıioöşü]$/i.test(ch);
}

// Seçilebilir hedefler. "zayıf" analiz verisinden belirlenir.
const DRILL_TARGETS = [
  { key: "ev",     label: "ev sırası (asdf jklş)" },
  { key: "üst",    label: "üst sıra (qwer uıop)" },
  { key: "alt",    label: "alt sıra (zxcv bnmö)" },
  { key: "tüm",    label: "tüm klavye" },
  { key: "sol",    label: "sol el" },
  { key: "sağ",    label: "sağ el" },
  { key: "zayıf",  label: "zayıf noktam (analize göre)" },
];

// Bir satırdaki harfleri ver (rakamlar hariç)
function drillRowLetters(rowName) {
  const rows = (typeof KBD_LAYOUTS !== "undefined") ? KBD_LAYOUTS[currentLayout] : null;
  if (!rows) return [];
  const idx = DRILL_ROW_INDEX[rowName];
  return (rows[idx] || []).filter(isDrillLetter);
}

// Bir parmağa ait harfler (0-3 sol, 4-7 sağ)
function drillFingerLetters(fingerIdx) {
  const map = (typeof KBD_FINGER_MAPS !== "undefined") ? KBD_FINGER_MAPS[currentLayout] : null;
  if (!map) return [];
  const out = [];
  for (const ch in map) {
    if (map[ch] === fingerIdx && isDrillLetter(ch)) out.push(ch);
  }
  return out;
}

// Ev sırasındaki dayanak (home) tuşları — alıştırmanın çıpası
function drillHomeKeys() {
  return drillRowLetters("ev");
}

// Seçilen hedefin harf kümesi + dayanak tuşları
function drillLetterSet(target) {
  let letters = [];
  const home = drillHomeKeys();

  if (target === "ev" || target === "üst" || target === "alt") {
    letters = drillRowLetters(target);
  } else if (target === "tüm") {
    letters = drillRowLetters("ev").concat(drillRowLetters("üst"), drillRowLetters("alt"));
  } else if (target === "sol" || target === "sağ") {
    const range = target === "sol" ? [0, 1, 2, 3] : [4, 5, 6, 7];
    for (const f of range) letters = letters.concat(drillFingerLetters(f));
  } else if (target === "zayıf") {
    // Analiz verisinden en zayıf parmak; veri yoksa ev sırasına düş
    const f = (typeof weakestFinger === "function") ? weakestFinger() : null;
    letters = f ? drillFingerLetters(f.i) : drillRowLetters("ev");
  }

  if (!letters.length) letters = home.slice();

  // Dayanak: hedefin içinde ev sırasından hangi harfler varsa onlar; hiç yoksa
  // hedefin kendi harfleri çıpa olur.
  let anchors = letters.filter(ch => home.indexOf(ch) !== -1);
  if (!anchors.length) anchors = letters.slice();

  return { letters, anchors };
}

// Hedefin ekranda gösterilecek adı
function drillTargetLabel(target) {
  if (target === "zayıf") {
    const f = (typeof weakestFinger === "function") ? weakestFinger() : null;
    return f ? ("zayıf noktam: " + f.name) : "zayıf noktam (henüz veri yok)";
  }
  const t = DRILL_TARGETS.find(x => x.key === target);
  return t ? t.label : target;
}

function drillPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Tek bir grup üret: ya saf tekrar (fff) ya da karışık (fjf)
function drillGroup(letters, anchors) {
  const len = Math.random() < 0.5 ? 3 : 4;

  // %30 saf tekrar — kas hafızası için, klasik müfredatın ilk adımı
  if (Math.random() < 0.3) {
    const ch = drillPick(Math.random() < 0.6 ? anchors : letters);
    return ch.repeat(len);
  }

  // Karışık grup; dayanak tuşlarına ağırlık verilir ki el evden kopmasın
  let g = "";
  for (let i = 0; i < len; i++) {
    g += drillPick(Math.random() < 0.45 ? anchors : letters);
  }
  return g;
}

// Bir alıştırma satırı: 3-4 grup, aralarında boşluk
// (boşluk da antrenmanın parçası — başparmak çalışır)
function makeDrill(target) {
  const { letters, anchors } = drillLetterSet(target);
  const groupCount = 3 + (Math.random() < 0.4 ? 1 : 0);
  const groups = [];
  for (let i = 0; i < groupCount; i++) groups.push(drillGroup(letters, anchors));
  return groups.join(" ");
}

// Ekranda o an bulunan komutlarla çakışmayan bir alıştırma üret.
// (Ön ek eşleştirmesinde iki aynı satır olursa hangisini yazdığın belirsizleşir)
function makeUniqueDrill(target, avoid) {
  for (let i = 0; i < 12; i++) {
    const d = makeDrill(target);
    if (!avoid || !avoid.has(d)) return d;
  }
  return makeDrill(target);
}
