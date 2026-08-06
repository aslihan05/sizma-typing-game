// === Analiz Modülü ===
// Oyuncunun yazma davranışını ölçer: hangi harflerde hata yapıyor, hangi
// parmağı/klavye sırası zayıf, ne kadar hızlı yazıyor.
// İki katman:
//   1) session  → o anki oyunun verisi (oyun sonu ekranında gösterilir)
//   2) lifetime → localStorage'da biriken tüm oyunların verisi (istatistik paneli)
// Faz 4'teki "zayıf parmak hedefleme" bu verinin üstüne kurulur.

const STATS_KEY   = "sizmaStats";     // birikmiş (lifetime) veri
const HISTORY_KEY = "sizmaHistory";   // son oyunların listesi
const LEADERBOARD_KEY = "sizmaLeaderboard"; // en iyi 10 maç
const HISTORY_MAX = 20;

// --- Boş bir veri kabı üret ---
function emptyStats() {
  return {
    games: 0,
    keysTotal: 0,      // basılan tüm yazılabilir tuşlar
    keysCorrect: 0,    // doğru basış
    keysWrong: 0,      // yanlış harf (hedef kilitliyken)
    keysStray: 0,      // hiçbir komutla eşleşmeyen boşa basış
    typedChars: 0,     // doğru yazılan karakter (WPM için)
    typingMs: 0,       // fiilen yazarken geçen süre (ms)
    charAttempts: {},  // harf → kaç kez yazılması gerekti
    charErrors:  {},   // harf → kaç kez yanlış yazıldı
    charTimeMs:  {},   // harf → doğru basışlar için toplam gecikme
    charTimeN:   {},   // harf → o gecikmelerin sayısı
    confusions:  {},   // "doğru>basılan" → kaç kez (hangi tuşla karıştırıyor)
    fingerErrors: {},  // parmak indeksi → hata
    fingerTotal:  {},  // parmak indeksi → toplam
    rowErrors: {},     // sıra adı → hata
    rowTotal:  {},     // sıra adı → toplam
    cmdDone: 0,        // tamamlanan komut
    cmdMissed: 0,      // yere düşen komut
    decoyHit: 0,       // düşülen tuzak
    decoyAvoided: 0,   // yere düşmesine izin verilen tuzak (doğru davranış)
    bombLost: 0,       // patlayan/kaçan bomba
    bombDone: 0,       // patlamadan yazılıp imha edilen bomba
    cleanRuns: 0,      // tuzağa/bombaya hiç düşülmeden bitirilen oyun (ömür boyu)
    bossKilled: 0,     // yenilen boss
    bestStreak: 0,     // en uzun seri
    score: 0,
  };
}

let sStats = emptyStats();   // o anki oyun
let lastKeyTime = 0;         // önceki tuşun zaman damgası (gecikme ölçümü)

// --- localStorage yardımcıları ---
function loadLifetime() {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY));
    return raw ? Object.assign(emptyStats(), raw) : emptyStats();
  } catch (e) { return emptyStats(); }
}
function saveLifetime(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch (e) { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) {}
}
function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []; }
  catch (e) { return []; }
}
function saveLeaderboard(lb) {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb)); } catch (e) {}
}

// İki sayaç nesnesini topla (a += b)
function mergeCounts(a, b) {
  for (const k in b) a[k] = (a[k] || 0) + b[k];
}

// --- Bir tuşun hangi parmağa / hangi sıraya ait olduğunu bul ---
function fingerOf(ch) {
  if (typeof KBD_FINGER_MAPS === "undefined") return undefined;
  const map = KBD_FINGER_MAPS[currentLayout];
  return map ? map[ch] : undefined;
}

const ROW_NAMES = ["rakam", "üst", "orta (ev)", "alt"];
function rowOf(ch) {
  if (typeof KBD_LAYOUTS === "undefined") return undefined;
  const rows = KBD_LAYOUTS[currentLayout];
  if (!rows) return undefined;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].indexOf(ch) !== -1) return ROW_NAMES[i];
  }
  if (ch === " ") return "boşluk";
  return undefined;
}

// ==========================================================================
//  Ölçüm giriş noktaları — oyun bunları çağırır
// ==========================================================================

// Oyun başlarken sayaçları sıfırla
function statsStartGame() {
  sStats = emptyStats();
  lastKeyTime = 0;
}

// Her tuş basışında çağrılır.
// expected = o an yazılması gereken harf (hedef yoksa null)
function trackKey(pressed, expected) {
  const now = performance.now();
  const gap = lastKeyTime ? now - lastKeyTime : 0;
  lastKeyTime = now;
  // Uzun duraklamaları (düşünme/hedef arama) hız ortalamasına katma
  const usableGap = gap > 0 && gap < 2000 ? gap : 0;

  sStats.keysTotal++;

  if (expected === null || expected === undefined) {
    sStats.keysStray++;                       // hiçbir komutla eşleşmeyen basış
    return;
  }

  sStats.charAttempts[expected] = (sStats.charAttempts[expected] || 0) + 1;

  const f = fingerOf(expected);
  if (f !== undefined) sStats.fingerTotal[f] = (sStats.fingerTotal[f] || 0) + 1;
  const r = rowOf(expected);
  if (r) sStats.rowTotal[r] = (sStats.rowTotal[r] || 0) + 1;

  if (pressed === expected) {
    sStats.keysCorrect++;
    sStats.typedChars++;
    sStats.typingMs += usableGap;
    sStats.charTimeMs[expected] = (sStats.charTimeMs[expected] || 0) + usableGap;
    sStats.charTimeN[expected]  = (sStats.charTimeN[expected]  || 0) + 1;
  } else {
    sStats.keysWrong++;
    sStats.charErrors[expected] = (sStats.charErrors[expected] || 0) + 1;
    const pair = expected + ">" + pressed;
    sStats.confusions[pair] = (sStats.confusions[pair] || 0) + 1;
    if (f !== undefined) sStats.fingerErrors[f] = (sStats.fingerErrors[f] || 0) + 1;
    if (r) sStats.rowErrors[r] = (sStats.rowErrors[r] || 0) + 1;
  }
}

// Oyun olayları: "cmdDone", "cmdMissed", "decoyHit", "decoyAvoided",
// "bombLost", "bossKilled"
function trackEvent(type) {
  if (type in sStats) sStats[type]++;
}

// En uzun seriyi takip et
function trackStreak(streak) {
  if (streak > sStats.bestStreak) sStats.bestStreak = streak;
}

// ==========================================================================
//  Türetilmiş ölçüler
// ==========================================================================

function accuracyOf(s) {
  const graded = s.keysCorrect + s.keysWrong;
  return graded ? Math.round((s.keysCorrect / graded) * 100) : 100;
}

// WPM = (doğru karakter / 5) / dakika — standart formül
function wpmOf(s) {
  const minutes = s.typingMs / 60000;
  if (minutes <= 0.001) return 0;
  return Math.round((s.typedChars / 5) / minutes);
}

// Bir sayaç nesnesini [anahtar, değer] listesine çevirip büyükten küçüğe sırala
function topEntries(obj, n) {
  return Object.keys(obj)
    .map(k => [k, obj[k]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// En çok hata yapılan harfler — sadece ham sayı değil, hata ORANI da önemli.
// (3 kere yazıp 3'ünü de batırdığın harf, 50 kere yazıp 5 hata yaptığından kötü)
// minAttempts: gürültüyü elemek için asgari deneme sayısı
function worstChars(s, n, minAttempts) {
  minAttempts = minAttempts || 3;
  const out = [];
  for (const ch in s.charErrors) {
    const att = s.charAttempts[ch] || 0;
    if (att < minAttempts) continue;
    out.push({ ch, errors: s.charErrors[ch], attempts: att,
               rate: s.charErrors[ch] / att });
  }
  out.sort((a, b) => b.rate - a.rate || b.errors - a.errors);
  return out.slice(0, n || 5);
}

// En yavaş harfler: doğru bassa bile en uzun düşündüklerin
function slowestChars(s, n, minN) {
  minN = minN || 3;
  const out = [];
  for (const ch in s.charTimeN) {
    if (s.charTimeN[ch] < minN) continue;
    out.push({ ch, ms: Math.round(s.charTimeMs[ch] / s.charTimeN[ch]) });
  }
  out.sort((a, b) => b.ms - a.ms);
  return out.slice(0, n || 5);
}

// Parmak bazlı hata oranları (yüksekten düşüğe)
function fingerReport(s) {
  const names = ["sol serçe", "sol yüzük", "sol orta", "sol işaret",
                 "sağ işaret", "sağ orta", "sağ yüzük", "sağ serçe"];
  const out = [];
  for (let i = 0; i < 8; i++) {
    const total = s.fingerTotal[i] || 0;
    if (!total) continue;
    const err = s.fingerErrors[i] || 0;
    out.push({ i, name: names[i], total, err, rate: err / total,
               color: (typeof KBD_FINGER_COLORS !== "undefined") ? KBD_FINGER_COLORS[i] : "#8b949e" });
  }
  out.sort((a, b) => b.rate - a.rate);
  return out;
}

// Klavye sırası bazlı hata oranları
function rowReport(s) {
  const out = [];
  for (const r in s.rowTotal) {
    const total = s.rowTotal[r];
    const err = s.rowErrors[r] || 0;
    out.push({ name: r, total, err, rate: err / total });
  }
  out.sort((a, b) => b.rate - a.rate);
  return out;
}

// ==========================================================================
//  Faz 4 — uyarlanır zayıf parmak hedefleme
//  Analiz verisi oyuna geri beslenir: en çok battığın harfler daha sık gelir.
// ==========================================================================

// Adaptasyon için asgari veri — az veriyle "zayıflık" tespiti gürültü olur
const ADAPT_MIN_KEYS = 150;

// Uyarlama devreye girecek kadar veri birikti mi?
function adaptiveReady() {
  return loadLifetime().keysTotal >= ADAPT_MIN_KEYS;
}

// En zayıf parmak (birikmiş veriden)
function weakestFinger() {
  const life = loadLifetime();
  const rep = fingerReport(life).filter(f => f.total >= 15 && f.err > 0);
  return rep.length ? rep[0] : null;
}

// Antrenman hedefi harfler: hem tek tek zayıf harfler, hem de en zayıf
// parmağın TÜM harfleri (o parmağı bütün olarak çalıştırmak için).
let _weakCache = null;
let _weakCacheAt = 0;

function weakLetters() {
  // Oyun içinde her komut seçiminde yeniden hesaplamayalım — 5 sn önbellek
  const now = Date.now();
  if (_weakCache && now - _weakCacheAt < 5000) return _weakCache;

  const set = new Set();
  const life = loadLifetime();

  if (life.keysTotal >= ADAPT_MIN_KEYS) {
    // 1) Hata oranı yüksek harfler
    for (const w of worstChars(life, 6, 5)) {
      if (w.rate > 0.08) set.add(w.ch);      // %8'in üstü kayda değer zayıflık
    }
    // 2) En zayıf parmağın harfleri
    const f = weakestFinger();
    if (f && f.rate > 0.08 && typeof KBD_FINGER_MAPS !== "undefined") {
      const map = KBD_FINGER_MAPS[currentLayout] || {};
      for (const ch in map) if (map[ch] === f.i && ch !== " ") set.add(ch);
    }
  }

  _weakCache = set;
  _weakCacheAt = now;
  return set;
}

// Önbelleği zorla tazele (oyun başında / veri sıfırlanınca)
function refreshWeakLetters() {
  _weakCache = null;
  return weakLetters();
}

// Menüde gösterilecek kısa antrenman özeti
function adaptiveHint() {
  const life = loadLifetime();
  if (life.keysTotal < ADAPT_MIN_KEYS) {
    const kalan = ADAPT_MIN_KEYS - life.keysTotal;
    return "antrenman modu: " + kalan + " tuş sonra açılıyor";
  }
  const f = weakestFinger();
  const w = Array.from(refreshWeakLetters()).slice(0, 6);
  if (!f && !w.length) return "antrenman modu: zayıf nokta bulunamadı — temiz yazıyorsun";
  let txt = "🎯 antrenman: ";
  if (f) txt += f.name + " parmağı";
  if (w.length) txt += (f ? " · " : "") + w.join(" ");
  return txt;
}

// ==========================================================================
//  Oyun sonu: birleştir, kaydet, özet döndür
// ==========================================================================
function statsEndGame(score, diffName) {
  sStats.score = score;

  const summary = {
    date: Date.now(),
    diff: diffName,
    score: score,
    wpm: wpmOf(sStats),
    acc: accuracyOf(sStats),
    cmdDone: sStats.cmdDone,
    bestStreak: sStats.bestStreak,
  };

  // Geçmişe ekle (en yeni başta, en fazla HISTORY_MAX kayıt)
  const hist = loadHistory();
  hist.unshift(summary);
  saveHistory(hist.slice(0, HISTORY_MAX));

  // Leaderboard'a ekle (Sadece zamansız olmayan modlarda ve >0 skorlarda)
  if (score > 0) {
    const lb = loadLeaderboard();
    lb.push(summary);
    lb.sort((a, b) => b.score - a.score); // Skora göre büyükten küçüğe
    saveLeaderboard(lb.slice(0, 10)); // Sadece ilk 10'u sakla
  }

  // Lifetime güncelle
  const life = loadLifetime();
  life.games++;
  const scalars = ["keysTotal","keysCorrect","keysWrong","keysStray","typedChars",
                   "typingMs","cmdDone","cmdMissed","decoyHit","decoyAvoided",
                   "bombLost","bombDone","bossKilled"];
  for (const k of scalars) life[k] += (sStats[k] || 0);
  // Temiz oyun: hiç tuzağa/bombaya düşmeden ve iş yapmış sayılacak kadar komut
  if (sStats.decoyHit === 0 && sStats.bombLost === 0 && sStats.cmdDone > 10) {
    life.cleanRuns = (life.cleanRuns || 0) + 1;
  }
  if (sStats.bestStreak > life.bestStreak) life.bestStreak = sStats.bestStreak;
  if (score > life.score) life.score = score;
  const maps = ["charAttempts","charErrors","charTimeMs","charTimeN","confusions",
                "fingerErrors","fingerTotal","rowErrors","rowTotal"];
  for (const k of maps) mergeCounts(life[k], sStats[k]);
  saveLifetime(life);

  // Başarımları değerlendir (Faz 9)
  if (typeof evaluateBadges === "function") {
    evaluateBadges(sStats, life);
  }

  return sStats;
}

// Tüm analiz verisini sil
function resetStats() {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {}
  // Rozet yıldızları ömür boyu veriden türüyor; veri sıfırlanınca onlar da
  // sıfırlanmalı, yoksa "300 bomba imha ettin" diyen bir rozet 0 bombayla kalır.
  if (typeof resetBadges === "function") resetBadges();
  // Ders ilerlemesi de ömür boyu veriye dayanır (WPM/doğruluk oradan ölçülür);
  // "her şeyi sıfırla" dendiğinde müfredat da başa dönmeli.
  if (typeof resetLessons === "function") resetLessons();
}

// ==========================================================================
//  Seviye / XP (Faz 7)
//  XP = ömür boyu DOĞRU YAZILAN KARAKTER sayısı.
//  Ayrı bir sayaç tutmuyoruz; analiz zaten bunu topluyor. Tek kaynak olması
//  hem çelişki riskini sıfırlar hem de dürüst bir ölçüdür: skorla ya da zorluk
//  çarpanıyla oynanamaz, pratik ve antrenman modlarında da işler.
//  "Ne kadar yazdıysan o kadar ilerlersin."
// ==========================================================================

// Rütbe adları (hacker teması). 10'un üstü "efsane II, III..." diye devam eder.
const RANKS = ["çaylak", "gözcü", "izci", "sızmacı", "kırıcı",
               "gölge", "hayalet", "mimar", "usta", "efsane"];

// Seviye L'den L+1'e geçmek için gereken karakter: 400 × L
// (1→2: 400, 2→3: 800, 3→4: 1200 ...) Toplam eğri kademeli sertleşir:
// 5. seviye ~4.000, 10. seviye ~18.000 karakter. 25 WPM'de 5 dakikalık bir
// oturum ~600 karakter demek, yani ilk seviyeler bir-iki oturumda gelir.
const XP_STEP = 400;

function xpTotal() {
  return loadLifetime().typedChars || 0;
}

// Verilen XP'den seviye bilgisi çıkar
function levelInfo(xp) {
  if (xp === undefined) xp = xpTotal();
  let level = 1;
  let kalan = xp;
  while (kalan >= XP_STEP * level) {
    kalan -= XP_STEP * level;
    level++;
  }
  const need = XP_STEP * level;              // bu seviyeyi bitirmek için gereken
  const rank = level <= RANKS.length
    ? RANKS[level - 1]
    : RANKS[RANKS.length - 1] + " " + romen(level - RANKS.length + 1);
  return {
    level, rank, xp,
    current: kalan,                          // bu seviyede biriken
    need,                                    // bu seviyenin toplam ihtiyacı
    pct: Math.min(100, Math.round((kalan / need) * 100)),
  };
}

function romen(n) {
  const t = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return t[n] || ("+" + n);
}

// Menüde gösterilen seviye çubuğu
function renderLevelBar() {
  const L = levelInfo();
  return '<div class="level-row">' +
           '<span class="level-num">sv ' + L.level + '</span>' +
           '<span class="level-rank">' + L.rank + '</span>' +
           '<span class="level-track"><span class="level-fill" style="width:' +
             L.pct + '%"></span></span>' +
           '<span class="level-xp">' + L.current + '/' + L.need + '</span>' +
         '</div>';
}

// Oyun sonu: bu oturumda kazanılan XP + seviye atladıysa kutlama.
// oncekiSeviye = oyun BAŞLARKEN kaydedilen seviye numarası.
function renderLevelResult(oncekiSeviye) {
  const L = levelInfo();
  const kazanılan = sStats.typedChars;
  let html = "";

  if (L.level > oncekiSeviye) {
    const atlanan = L.level - oncekiSeviye;
    html += '<p class="level-up">⬆ SEVİYE ' + L.level + ' — ' + L.rank +
            (atlanan > 1 ? ' (' + atlanan + ' seviye birden!)' : '') + '</p>';
  }
  html += '<p class="level-gain">+' + kazanılan + ' XP (doğru karakter)</p>';
  html += renderLevelBar();
  return html;
}

// ==========================================================================
//  Görselleştirme (HTML üretir)
// ==========================================================================

// Küçük yatay çubuk
function statBar(label, value, max, color, right) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return '<div class="stat-row">' +
           '<span class="stat-name">' + label + '</span>' +
           '<span class="stat-track"><span class="stat-fill" style="width:' + pct +
             '%;background:' + color + '"></span></span>' +
           '<span class="stat-val">' + right + '</span>' +
         '</div>';
}

// Oyun sonu özeti (kısa)
function renderGameOverStats() {
  const s = sStats;
  const bad = worstChars(s, 5);
  const fing = fingerReport(s).filter(f => f.total >= 5);

  let html = '<div class="stat-grid">' +
    '<div class="stat-cell"><b>' + wpmOf(s) + '</b><span>WPM</span></div>' +
    '<div class="stat-cell"><b>' + accuracyOf(s) + '%</b><span>doğruluk</span></div>' +
    '<div class="stat-cell"><b>' + s.cmdDone + '</b><span>komut</span></div>' +
    '<div class="stat-cell"><b>' + s.bestStreak + '</b><span>en uzun seri</span></div>' +
  '</div>';

  if (bad.length) {
    const maxRate = bad[0].rate;
    html += '<p class="stat-title">en çok zorlandığın harfler</p>';
    for (const b of bad) {
      html += statBar('<span class="stat-key">' + (b.ch === " " ? "␣" : b.ch) + '</span>',
                      b.rate, maxRate, "#ff6b6b",
                      b.errors + "/" + b.attempts);
    }
  } else {
    html += '<p class="stat-note">temiz oyun — kayda değer harf hatası yok</p>';
  }

  if (fing.length && fing[0].err > 0) {
    html += '<p class="stat-title">en zayıf parmak</p>';
    const f = fing[0];
    html += statBar(f.name, f.rate, Math.max(f.rate, 0.01), f.color,
                    Math.round(f.rate * 100) + "%");
  }

  return html;
}

// ==========================================================================
// Faz 8 Yardımcıları
// ==========================================================================

function getHeatmapData(life) {
  const data = {};
  for (const ch in life.charAttempts) {
    const att = life.charAttempts[ch];
    if (att >= 3) { // Anlamlı veri için min deneme
      data[ch] = (life.charErrors[ch] || 0) / att;
    }
  }
  return data;
}

function renderWpmChart(hist) {
  if (!hist || hist.length < 2) return '';
  // hist, en yeni başta (index 0). Biz soldan sağa eskiden yeniye çizelim.
  const wpmArr = hist.slice(0, 20).map(h => h.wpm).reverse();
  
  const width = 440;
  const height = 120;
  const padding = 20;
  
  const minWpm = Math.max(0, Math.min(...wpmArr) - 5);
  const maxWpm = Math.max(...wpmArr, 30) + 5;
  
  const dx = (width - padding * 2) / (wpmArr.length - 1);
  const dy = (height - padding * 2) / (maxWpm - minWpm || 1);
  
  let d = "";
  let dots = "";
  
  wpmArr.forEach((wpm, i) => {
    const cx = padding + i * dx;
    const cy = height - padding - (wpm - minWpm) * dy;
    
    if (i === 0) d += `M ${cx} ${cy} `;
    else d += `L ${cx} ${cy} `;
    
    dots += `<circle class="dot" cx="${cx}" cy="${cy}" r="4"><title>${wpm} WPM</title></circle>`;
  });
  
  return `
    <div class="wpm-chart-container">
      <p class="stat-title" style="margin-top:0">WPM Trendi (Son ${wpmArr.length} Oyun)</p>
      <svg class="wpm-chart" viewBox="0 0 ${width} ${height}">
        <!-- Y Ekseni Etiketleri -->
        <text x="0" y="${padding + 4}">${maxWpm}</text>
        <text x="0" y="${height - padding + 4}">${minWpm}</text>
        <!-- Çizgi ve Noktalar -->
        <path class="line" d="${d}" />
        ${dots}
      </svg>
    </div>
  `;
}

// Detaylı istatistik paneli (menüden açılır, TÜM oyunların birikimi)
function renderStatsPanel() {
  const life = loadLifetime();
  const hist = loadHistory();

  if (!life.games) {
    return '<p class="stat-note">henüz veri yok — bir oyun oyna, analiz burada birikecek</p>';
  }

  let html = '<div class="stat-grid">' +
    '<div class="stat-cell"><b>' + life.games + '</b><span>oyun</span></div>' +
    '<div class="stat-cell"><b>' + wpmOf(life) + '</b><span>ort. WPM</span></div>' +
    '<div class="stat-cell"><b>' + accuracyOf(life) + '%</b><span>doğruluk</span></div>' +
    '<div class="stat-cell"><b>' + life.cmdDone + '</b><span>komut</span></div>' +
  '</div>';

  // WPM Chart (Faz 8)
  html += renderWpmChart(hist);

  // Klavye Isı Haritası Konteyneri (Faz 8)
  html += '<p class="stat-title">klavye ısı haritası</p>';
  html += '<div class="heatmap-container" id="statsHeatmap"></div>';

  // Başarımlar / Rozetler (Faz 9)
  if (typeof renderBadgesPanel === "function") {
    html += renderBadgesPanel();
  }

  // Harf zayıflıkları
  const bad = worstChars(life, 8, 5);
  if (bad.length) {
    html += '<p class="stat-title">zayıf harfler (hata oranı)</p>';
    const maxRate = bad[0].rate;
    for (const b of bad) {
      html += statBar('<span class="stat-key">' + (b.ch === " " ? "␣" : b.ch) + '</span>',
                      b.rate, maxRate, "#ff6b6b",
                      Math.round(b.rate * 100) + "% (" + b.attempts + ")");
    }
  }

  // Karıştırılan tuş çiftleri
  const conf = topEntries(life.confusions, 5);
  if (conf.length) {
    html += '<p class="stat-title">karıştırdığın tuşlar</p>';
    const maxC = conf[0][1];
    for (const c of conf) {
      const parts = c[0].split(">");
      const label = '<span class="stat-key">' + parts[0] + '</span> yerine ' +
                    '<span class="stat-key wrong">' + parts[1] + '</span>';
      html += statBar(label, c[1], maxC, "#f0883e", c[1] + "×");
    }
  }

  // Yavaş harfler
  const slow = slowestChars(life, 5, 5);
  if (slow.length) {
    html += '<p class="stat-title">en yavaş harfler (ort. gecikme)</p>';
    const maxMs = slow[0].ms;
    for (const s2 of slow) {
      html += statBar('<span class="stat-key">' + (s2.ch === " " ? "␣" : s2.ch) + '</span>',
                      s2.ms, maxMs, "#58a6ff", s2.ms + " ms");
    }
  }

  // Parmak analizi
  const fing = fingerReport(life).filter(f => f.total >= 10);
  if (fing.length) {
    html += '<p class="stat-title">parmak hata oranları</p>';
    const maxF = Math.max(0.01, fing[0].rate);
    for (const f of fing) {
      html += statBar(f.name, f.rate, maxF, f.color, Math.round(f.rate * 100) + "%");
    }
  }

  // Klavye sırası analizi
  const rows = rowReport(life).filter(r => r.total >= 10);
  if (rows.length) {
    html += '<p class="stat-title">klavye sırası hata oranları</p>';
    const maxR = Math.max(0.01, rows[0].rate);
    for (const r of rows) {
      html += statBar(r.name + " sıra", r.rate, maxR, "#bc8cff",
                      Math.round(r.rate * 100) + "%");
    }
  }

  // Oyun davranışı
  html += '<p class="stat-title">oyun davranışı</p>' +
    '<div class="stat-grid small">' +
      '<div class="stat-cell"><b>' + life.cmdMissed + '</b><span>kaçan komut</span></div>' +
      '<div class="stat-cell"><b>' + life.decoyHit + '</b><span>düşülen tuzak</span></div>' +
      '<div class="stat-cell"><b>' + life.bombLost + '</b><span>patlayan bomba</span></div>' +
      '<div class="stat-cell"><b>' + life.bossKilled + '</b><span>yenilen boss</span></div>' +
    '</div>';

  // Son oyunlar
  if (hist.length) {
    html += '<p class="stat-title">son oyunlar</p><div class="hist-list">';
    for (const h of hist.slice(0, 8)) {
      const d = new Date(h.date);
      const when = ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) +
                   " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      html += '<div class="hist-row"><span>' + when + '</span><span>' + h.diff +
              '</span><span>' + h.score + ' p</span><span>' + h.wpm + ' wpm</span><span>' +
              h.acc + '%</span></div>';
    }
    html += '</div>';
  }

  return html;
}

// En İyi 10 Maç (Leaderboard) UI
function renderLeaderboard() {
  const lb = loadLeaderboard();
  if (!lb.length) return '<p class="stat-note">henüz skor yok.</p>';
  let html = '<div class="hist-list">';
  lb.forEach((h, i) => {
    const d = new Date(h.date);
    const when = ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) +
                 " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    let rank = `#${i+1}`;
    if (i === 0) rank = '🥇';
    else if (i === 1) rank = '🥈';
    else if (i === 2) rank = '🥉';
    
    html += '<div class="hist-row"><span>' + rank + '</span><span>' + h.diff + '</span><span>' + when + '</span><span>' + h.score + ' p</span><span>' + h.wpm + ' wpm</span></div>';
  });
  html += '</div>';
  return html;
}

// JSON Olarak Dışa Aktar (Phase 11)
function exportData() {
  const data = {
    stats: loadLifetime(),
    history: loadHistory(),
    leaderboard: loadLeaderboard(),
    badges: typeof loadBadges === "function" ? loadBadges() : {},
    lessons: typeof loadLessons === "function" ? loadLessons() : null
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sizma-data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// JSON Dosyasından İçe Aktar
function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.stats) saveLifetime(data.stats);
    if (data.history) {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history)); } catch (e) {}
    }
    if (data.leaderboard) {
      try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data.leaderboard)); } catch (e) {}
    }
    if (data.badges && typeof saveBadges === "function") {
      saveBadges(data.badges);
    }
    // Eski dosyalarda bu alan yok — olmaması hata değil, ders ilerlemesi
    // dokunulmadan bırakılır.
    if (data.lessons && typeof saveLessons === "function") {
      saveLessons(data.lessons);
    }
    return true;
  } catch (e) {
    console.error("Veri içe aktarma hatası:", e);
    return false;
  }
}
