// ==========================================================================
// Ayarlar Modülü (Tema, Font, Tam Ekran)
// ==========================================================================

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");

const themeBtns = document.querySelectorAll("#themeGroup .diff-btn");
const fontSizeBtns = document.querySelectorAll("#fontSizeGroup .diff-btn");
const fullscreenToggleBtn = document.getElementById("fullscreenToggleBtn");

// 1. Durumların yüklenmesi
let currentTheme = localStorage.getItem("sizmaTheme") || "";
let currentFontSize = localStorage.getItem("sizmaFontSize") || "1";

const TEMA_SINIFLARI = ["theme-synthwave", "theme-cyberpunk", "theme-stealth"];

function applySettings() {
  // Tema uygula: yalnızca tema sınıflarını değiştir, body'deki diğer
  // sınıflara (oyun durumu vb.) dokunma
  TEMA_SINIFLARI.forEach(c => document.body.classList.remove(c));
  if (currentTheme) document.body.classList.add(currentTheme);

  // Font boyutu uygula
  document.documentElement.style.setProperty("--font-scale", currentFontSize);

  // Buton aktiflik durumlarını güncelle
  themeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme);
  });

  fontSizeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.size === currentFontSize);
  });
  
  if (typeof window.updateMatrixColors === "function") {
    window.updateMatrixColors();
  }
}

// 2. Event Listeners
if (settingsBtn && settingsPanel && settingsCloseBtn) {
  settingsBtn.addEventListener("click", () => {
    document.getElementById("menu").classList.add("hidden");
    settingsPanel.classList.remove("hidden");
  });

  settingsCloseBtn.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
  });
}

themeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentTheme = btn.dataset.theme;
    localStorage.setItem("sizmaTheme", currentTheme);
    applySettings();
  });
});

fontSizeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFontSize = btn.dataset.size;
    localStorage.setItem("sizmaFontSize", currentFontSize);
    applySettings();
  });
});

if (fullscreenToggleBtn) {
  fullscreenToggleBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Tam ekran modu başlatılamadı:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
}

// Başlangıçta ayarları uygula
applySettings();
