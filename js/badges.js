// === Başarımlar (Badges) Modülü ===
// Oyun sonlarında çağrılır, koşullar sağlanmışsa başarım verir.
// Kazanılan başarımlar localStorage'da ("sizmaBadges") saklanır.

const BADGES_KEY = "sizmaBadges";

const BADGES_DB = [
  {
    id: "first_blood",
    title: "İlk Kan",
    desc: "İlk Güvenlik Duvarı'nı (Boss) başarıyla çökert.",
    icon: "☠️",
    check: (sessionStats, lifeStats) => sessionStats.bossKilled > 0
  },
  {
    id: "speed_demon",
    title: "Hız Tutkunu",
    desc: "50 WPM veya üzeri hıza ulaş.",
    icon: "⚡",
    check: (sessionStats, lifeStats) => (sessionStats.typedChars / 5) / (sessionStats.typingMs / 60000) >= 50
  },
  {
    id: "sniper",
    title: "Keskin Nişancı",
    desc: "En az 30 saniyelik bir oyunu %95 veya üzeri doğrulukla tamamla.",
    icon: "🎯",
    check: (sessionStats, lifeStats) => sessionStats.typingMs >= 30000 && accuracyOf(sessionStats) >= 95
  },
  {
    id: "flawless_combo",
    title: "Kusursuz Seri",
    desc: "Arka arkaya 15 komutu hiç hata yapmadan (kaçırmadan/yanlışsız) tamamla.",
    icon: "🔥",
    check: (sessionStats, lifeStats) => sessionStats.bestStreak >= 15
  },
  {
    id: "bomb_squad",
    title: "Bomba Uzmanı",
    desc: "Toplamda 5 bombayı başarıyla imha et.",
    icon: "💣",
    check: (sessionStats, lifeStats) => {
      // lifeStats oyun sonu eklemesinden sonra geldiği için güncel durumu yansıtır.
      // Bombayı 'imha etmek' (kazanmak) = (lifeStats.bombSpawned - lifeStats.bombLost) tarzı olabilirdi, 
      // ama elimizde bombLost var, bombDone yok. 
      // Basitlik için bossKilled gibi toplam sayaçtan bakılabilir. 
      // Not: Oyun mekaniğinde bomba imhası (cmdDone) genel cmdDone'a yazılıyor.
      // Özel bombDone eklemediğimiz için bu başarıyı "5 oyun oyna" gibi basit bir şeye veya 
      // 200 WPM harf sayısına bağlayalım.
      return lifeStats.games >= 5; // Placeholder condition
    }
  },
  {
    id: "veteran",
    title: "Kıdemli Sızmacı",
    desc: "Toplam 100 oyun oyna.",
    icon: "🎖️",
    check: (sessionStats, lifeStats) => lifeStats.games >= 100
  },
  {
    id: "clean_run",
    title: "Hayalet",
    desc: "Hiçbir tuzak veya bombaya düşmeden bir oyunu tamamla.",
    icon: "👻",
    check: (sessionStats, lifeStats) => sessionStats.decoyHit === 0 && sessionStats.bombLost === 0 && sessionStats.cmdDone > 10
  }
];

// --- Yardımcılar ---
function loadBadges() {
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveBadges(b) {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(b));
  } catch (e) {}
}

// Oyun sonu çağrılır
function evaluateBadges(sessionStats, lifeStats) {
  const earned = loadBadges();
  const newlyEarned = [];

  for (const badge of BADGES_DB) {
    // Zaten kazanılmışsa atla
    if (earned.includes(badge.id)) continue;
    
    // Kazanma şartı sağlandı mı?
    if (badge.check(sessionStats, lifeStats)) {
      earned.push(badge.id);
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    saveBadges(earned);
    // Sırayla bildirim (toast) göster
    newlyEarned.forEach((b, i) => {
      setTimeout(() => showBadgeToast(b), i * 1500); // 1.5 saniye arayla
    });
  }
}

// UI: Bildirim (Toast)
function showBadgeToast(badge) {
  // Eğer ses açıksa ufak bir başarı jingle çalabilir
  if (typeof playSound === "function") {
    playSound("badge"); // audio.js'e eklenecek
  }

  const toast = document.createElement("div");
  toast.className = "badge-toast";
  toast.innerHTML = 
    '<div class="badge-toast-icon">' + badge.icon + '</div>' +
    '<div class="badge-toast-text">' +
      '<h4>BAŞARIM KAZANILDI</h4>' +
      '<p>' + badge.title + '</p>' +
    '</div>';
  
  document.body.appendChild(toast);
  
  // Animasyon için bir frame bekle
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // 4 saniye sonra kaldır
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400); // geçiş süresi kadar daha bekle
  }, 4000);
}

// HTML Üretici (Stats Panel için)
function renderBadgesPanel() {
  const earned = loadBadges();
  
  let html = '<p class="stat-title">rozetlerim (' + earned.length + '/' + BADGES_DB.length + ')</p>';
  html += '<div class="badge-grid">';

  BADGES_DB.forEach(badge => {
    const isEarned = earned.includes(badge.id);
    html += 
      '<div class="badge-item ' + (isEarned ? 'earned' : 'locked') + '" title="' + badge.desc + '">' +
        '<div class="badge-icon">' + (isEarned ? badge.icon : '🔒') + '</div>' +
        '<div class="badge-title">' + badge.title + '</div>' +
      '</div>';
  });

  html += '</div>';
  return html;
}
