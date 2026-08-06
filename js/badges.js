// === Başarımlar (Badges) Modülü ===
// Her rozetin 5 kademesi (yıldızı) vardır. Oyun sonunda ölçü değeri hesaplanır,
// geçilen eşik sayısı kadar yıldız dolar. Veri "sizmaBadges" altında saklanır:
//   { rozetId: { v: <ölçü değeri>, stars: <0-5> } }
//
// Ölçü iki türlü olabilir:
//   "life" → ömür boyu toplamdan okunur (zaten artan bir sayı)
//   "best" → tek oyunun değeri; saklanan en iyiyle karşılaştırılır, düşmez

const BADGES_KEY = "sizmaBadges";
const STAR_COUNT = 5;

// Tek oyunun WPM'i (typingMs 0 iken Infinity üretmesin diye korumalı)
function sessionWpm(s) {
  if (!s || !s.typingMs || s.typingMs <= 0) return 0;
  return (s.typedChars / 5) / (s.typingMs / 60000);
}

const BADGES_DB = [
  {
    id: "first_blood",
    title: "Duvar Kırıcı",
    icon: "☠️",
    unit: "boss",
    desc: "Güvenlik Duvarı'nı çökert.",
    mode: "life",
    tiers: [3, 10, 25, 50, 150],
    value: (s, life) => life.bossKilled,
  },
  {
    id: "speed_demon",
    title: "Hız Tutkunu",
    icon: "⚡",
    unit: "WPM",
    desc: "Tek oyunda ulaştığın en yüksek hız.",
    mode: "best",
    tiers: [45, 60, 75, 90, 110],
    value: (s) => Math.floor(sessionWpm(s)),
  },
  {
    id: "sniper",
    title: "Keskin Nişancı",
    icon: "🎯",
    unit: "% doğruluk",
    desc: "En az 30 saniyelik bir oyunda ulaştığın en yüksek doğruluk.",
    mode: "best",
    tiers: [95, 97, 98, 99, 100],
    // Kısa oyunlarda doğruluk anlamsız derecede kolay -> 30 sn şartı korunuyor
    value: (s) => (s.typingMs >= 30000 ? accuracyOf(s) : 0),
  },
  {
    id: "flawless_combo",
    title: "Kusursuz Seri",
    icon: "🔥",
    unit: "seri",
    desc: "Arka arkaya hatasız tamamladığın en uzun komut serisi.",
    mode: "life",
    tiers: [25, 50, 100, 200, 350],
    value: (s, life) => life.bestStreak,
  },
  {
    id: "clean_run",
    title: "Hayalet",
    icon: "👻",
    unit: "temiz oyun",
    desc: "Hiçbir tuzağa veya bombaya düşmeden bitirdiğin oyunlar.",
    mode: "life",
    tiers: [5, 15, 30, 75, 200],
    value: (s, life) => life.cleanRuns || 0,
  },
  {
    id: "bomb_squad",
    title: "Bomba Uzmanı",
    icon: "💣",
    unit: "bomba",
    desc: "Patlamadan yazıp imha ettiğin saatli bombalar.",
    mode: "life",
    tiers: [15, 40, 100, 250, 600],
    value: (s, life) => life.bombDone || 0,
  },
  {
    id: "veteran",
    title: "Kıdemli Sızmacı",
    icon: "🎖️",
    unit: "oyun",
    desc: "Toplam oynadığın oyun sayısı.",
    mode: "life",
    tiers: [10, 50, 200, 500, 1500],
    value: (s, life) => life.games,
  },
];

// --- Yardımcılar ---

// Değere karşılık gelen yıldız sayısı
function starsOf(badge, v) {
  let n = 0;
  for (const t of badge.tiers) if (v >= t) n++;
  return n;
}

// "★★★☆☆"
function starString(n) {
  return "★".repeat(n) + "☆".repeat(STAR_COUNT - n);
}

function loadBadges() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(BADGES_KEY)); }
  catch (e) { raw = null; }

  // Eski biçim (kazanılan id'lerin düz listesi) -> yıldızlı biçime taşı.
  // Kazanılmış her rozet en az 1 yıldızla başlasın ki emek kaybolmasın.
  if (Array.isArray(raw)) {
    const migrated = {};
    for (const b of BADGES_DB) {
      if (raw.includes(b.id)) migrated[b.id] = { v: b.tiers[0], stars: 1 };
    }
    return migrated;
  }
  return raw && typeof raw === "object" ? raw : {};
}

function saveBadges(b) {
  try { localStorage.setItem(BADGES_KEY, JSON.stringify(b)); } catch (e) {}
}

function resetBadges() {
  try { localStorage.removeItem(BADGES_KEY); } catch (e) {}
}

// Toplam yıldız (panel başlığı için)
function totalStars() {
  const store = loadBadges();
  let n = 0;
  for (const b of BADGES_DB) n += (store[b.id] && store[b.id].stars) || 0;
  return n;
}

// --- Oyun sonu değerlendirmesi ---
function evaluateBadges(sessionStats, lifeStats) {
  const store = loadBadges();
  const yukselenler = [];

  for (const badge of BADGES_DB) {
    const onceki = store[badge.id] || { v: 0, stars: 0 };
    let deger = badge.value(sessionStats, lifeStats) || 0;
    // "best" ölçüler geriye gitmez: kötü bir oyun kazanılmış yıldızı düşürmesin
    if (badge.mode === "best") deger = Math.max(onceki.v, deger);

    const yildiz = starsOf(badge, deger);
    store[badge.id] = { v: deger, stars: yildiz };
    if (yildiz > onceki.stars) yukselenler.push({ badge, yildiz });
  }

  saveBadges(store);

  yukselenler.forEach((y, i) => {
    setTimeout(() => showBadgeToast(y.badge, y.yildiz), i * 1500);
  });
}

// --- UI: Bildirim (Toast) ---
function showBadgeToast(badge, yildiz) {
  if (typeof playSound === "function") playSound("badge");

  const tamam = yildiz >= STAR_COUNT;
  const toast = document.createElement("div");
  toast.className = "badge-toast";
  toast.innerHTML =
    '<div class="badge-toast-icon">' + badge.icon + '</div>' +
    '<div class="badge-toast-text">' +
      '<h4>' + (tamam ? "ROZET TAMAMLANDI" : yildiz === 1 ? "BAŞARIM KAZANILDI" : "ROZET YÜKSELDİ") + '</h4>' +
      '<p>' + badge.title + '</p>' +
      '<span class="badge-stars">' + starString(yildiz) + '</span>' +
    '</div>';

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// --- UI: İstatistik panelindeki rozet ızgarası ---
function renderBadgesPanel() {
  const store = loadBadges();
  const enFazla = BADGES_DB.length * STAR_COUNT;

  let html = '<p class="stat-title">rozetlerim (' + totalStars() + '/' + enFazla + ' ★)</p>';
  html += '<div class="badge-grid">';

  BADGES_DB.forEach(badge => {
    const kayit = store[badge.id] || { v: 0, stars: 0 };
    const yildiz = kayit.stars;
    const acik = yildiz > 0;
    const tamam = yildiz >= STAR_COUNT;
    // Henüz yıldız yok ama ilerleme var: tamamen kilitli göstermek yerine
    // "başladın" durumu — simge görünür, ilerleme okunabilir kalır.
    const basladi = !acik && kayit.v > 0;

    // Bir sonraki kademeye ne kaldı?
    let ilerleme;
    if (tamam) {
      ilerleme = "tamamlandı · " + Math.round(kayit.v) + " " + badge.unit;
    } else {
      const hedef = badge.tiers[yildiz];
      ilerleme = Math.round(kayit.v) + " / " + hedef + " " + badge.unit;
    }

    html +=
      '<div class="badge-item ' + (acik ? 'earned' : basladi ? 'started' : 'locked') +
           (tamam ? ' maxed' : '') + '" title="' + badge.desc + '">' +
        '<div class="badge-icon">' + (acik || basladi ? badge.icon : '🔒') + '</div>' +
        '<div class="badge-title">' + badge.title + '</div>' +
        '<div class="badge-stars">' + starString(yildiz) + '</div>' +
        '<div class="badge-progress">' + ilerleme + '</div>' +
      '</div>';
  });

  html += '</div>';
  return html;
}
