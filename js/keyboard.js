// === Ekran Klavyesi Modülü ===
// Global: renderKeyboard(), highlightNextKey(), pressKeyAnim()

// --- Klavye düzenleri ---
const KBD_LAYOUTS = {
  "TR-Q": [
    ["1","2","3","4","5","6","7","8","9","0","*","-"],
    ["q","w","e","r","t","y","u","ı","o","p","ğ","ü"],
    ["a","s","d","f","g","h","j","k","l","ş","i"],
    ["z","x","c","v","b","n","m","ö","ç","."]
  ],
  "TR-F": [
    ["1","2","3","4","5","6","7","8","9","0","*","-"],
    ["f","g","ğ","ı","o","d","r","n","h","p","q","w"],
    ["u","i","e","a","ü","t","k","m","l","y","ş","x"],
    ["j","ö","v","c","ç","z","s","b",".",","]
  ],
  "EN": [
    ["1","2","3","4","5","6","7","8","9","0","-","="],
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["z","x","c","v","b","n","m",",",".","/"]
  ]
};

// --- Parmak renkleri (sol serçe → sağ serçe, 8 parmak) ---
const KBD_FINGER_COLORS = [
  "#ff6b6b",   // 0 sol serçe
  "#f0883e",   // 1 sol yüzük
  "#ffd93d",   // 2 sol orta
  "#7ee787",   // 3 sol işaret
  "#58a6ff",   // 4 sağ işaret
  "#bc8cff",   // 5 sağ orta
  "#f78166",   // 6 sağ yüzük
  "#ff9bce",   // 7 sağ serçe
];

// --- Parmak haritaları ---
const KBD_FINGER_MAPS = {
  "TR-Q": {
    "1":0,"2":1,"3":2,"4":3,"5":3,"6":4,"7":4,"8":5,"9":6,"0":7,"*":7,"-":7,
    "q":0,"w":1,"e":2,"r":3,"t":3,"y":4,"u":4,"ı":5,"o":6,"p":7,"ğ":7,"ü":7,
    "a":0,"s":1,"d":2,"f":3,"g":3,"h":4,"j":4,"k":5,"l":6,"ş":7,"i":7,
    "z":0,"x":1,"c":2,"v":3,"b":3,"n":4,"m":4,"ö":5,"ç":6,".":7,
    " ":3
  },
  "TR-F": {
    "1":0,"2":1,"3":2,"4":3,"5":3,"6":4,"7":4,"8":5,"9":6,"0":7,"*":7,"-":7,
    "f":0,"g":1,"ğ":2,"ı":3,"o":3,"d":4,"r":4,"n":5,"h":6,"p":7,"q":7,"w":7,
    "u":0,"i":1,"e":2,"a":3,"ü":3,"t":4,"k":4,"m":5,"l":6,"y":7,"ş":7,"x":7,
    "j":0,"ö":1,"v":2,"c":3,"ç":3,"z":4,"s":4,"b":5,".":6,",":7,
    " ":3
  },
  "EN": {
    "1":0,"2":1,"3":2,"4":3,"5":3,"6":4,"7":4,"8":5,"9":6,"0":7,"-":7,"=":7,
    "q":0,"w":1,"e":2,"r":3,"t":3,"y":4,"u":4,"i":5,"o":6,"p":7,
    "a":0,"s":1,"d":2,"f":3,"g":3,"h":4,"j":4,"k":5,"l":6,";":7,
    "z":0,"x":1,"c":2,"v":3,"b":3,"n":4,"m":4,",":5,".":6,"/":7,
    " ":3
  }
};

// --- Durum ---
let kbdKeyEls = {};         // char → DOM element
let kbdActiveKey = null;    // şu an vurgulanan tuş

// --- Klavyeyi oluştur ---
function renderKeyboard(layout, containerId = "keyboardSection", asHeatmap = false, heatmapData = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Önceki key-row'ları temizle (header korunur)
  container.querySelectorAll(".key-row").forEach(r => r.remove());

  // Eğer ana klavye ise referansları sıfırla
  const isMainKbd = (containerId === "keyboardSection");
  if (isMainKbd) kbdKeyEls = {};

  const rows = KBD_LAYOUTS[layout];
  const fingerMap = KBD_FINGER_MAPS[layout];
  if (!rows || !fingerMap) return;

  // Row offsets: staggered keyboard look
  const offsets = [0, 8, 18, 40];

  rows.forEach((row, rowIdx) => {
    const rowEl = document.createElement("div");
    rowEl.className = "key-row";
    rowEl.style.paddingLeft = offsets[rowIdx] + "px";

    row.forEach(key => {
      const keyEl = document.createElement("span");
      keyEl.className = "key" + (asHeatmap ? " heatmap" : "");
      if (isMainKbd) keyEl.dataset.key = key;
      keyEl.textContent = key;
      
      if (asHeatmap && heatmapData) {
        const errRate = heatmapData[key] || 0;
        // Heatmap renk: 0 = görünmez/koyu, >0 = açık sarı -> kırmızı
        if (errRate === 0) {
          keyEl.style.background = "rgba(255,255,255,0.02)";
          keyEl.style.color = "#30363d";
        } else {
          // Çok basit bir renk skalası:
          // Düşük hata: sarımsı, yüksek hata: kırmızı (#ff6b6b)
          const r = 255;
          const g = Math.max(100, 255 - (errRate * 500)); // error rate %10 ise 0.1 * 500 = 50 -> g = 205
          const b = Math.max(100, 150 - (errRate * 500));
          keyEl.style.background = `rgba(${r}, ${g}, ${b}, 0.6)`;
        }
      } else {
        const finger = fingerMap[key];
        if (finger !== undefined) {
          keyEl.style.borderColor = KBD_FINGER_COLORS[finger];
          keyEl.style.color = KBD_FINGER_COLORS[finger];
        }
      }
      
      rowEl.appendChild(keyEl);
      if (isMainKbd) kbdKeyEls[key] = keyEl;
    });
    container.appendChild(rowEl);
  });

  // Boşluk çubuğu
  const spaceRow = document.createElement("div");
  spaceRow.className = "key-row";
  spaceRow.style.paddingLeft = "80px";
  const spaceKey = document.createElement("span");
  spaceKey.className = "key space-key" + (asHeatmap ? " heatmap" : "");
  if (isMainKbd) spaceKey.dataset.key = " ";
  spaceKey.textContent = "boşluk";
  
  if (asHeatmap && heatmapData) {
    const errRate = heatmapData[" "] || 0;
    if (errRate === 0) {
      spaceKey.style.background = "rgba(255,255,255,0.02)";
      spaceKey.style.color = "#30363d";
    } else {
      const r = 255;
      const g = Math.max(100, 255 - (errRate * 500));
      const b = Math.max(100, 150 - (errRate * 500));
      spaceKey.style.background = `rgba(${r}, ${g}, ${b}, 0.6)`;
    }
  } else {
    const sFinger = fingerMap[" "];
    if (sFinger !== undefined) {
      spaceKey.style.borderColor = KBD_FINGER_COLORS[sFinger];
      spaceKey.style.color = KBD_FINGER_COLORS[sFinger];
    }
  }
  
  spaceRow.appendChild(spaceKey);
  container.appendChild(spaceRow);
  if (isMainKbd) kbdKeyEls[" "] = spaceKey;
}

// --- Sıradaki tuşu vurgula ---
function highlightNextKey(char) {
  if (kbdActiveKey) {
    kbdActiveKey.classList.remove("active");
    kbdActiveKey = null;
  }
  if (!char) return;
  const el = kbdKeyEls[char];
  if (el) {
    el.classList.add("active");
    kbdActiveKey = el;
  }
}

// --- Antrenman hedefi tuşları işaretle (Faz 4) ---
// Analiz verisine göre zayıf bulunan tuşlar klavyede belirgin hale gelir;
// oyuncu neyi çalıştırdığını görür.
let kbdWeakKeys = new Set();
function markWeakKeys(chars) {
  for (const k in kbdKeyEls) kbdKeyEls[k].classList.remove("weak");
  kbdWeakKeys = chars || new Set();
  for (const ch of kbdWeakKeys) {
    const el = kbdKeyEls[ch];
    if (el) el.classList.add("weak");
  }
}

// --- Basılan tuşta kısa animasyon ---
function pressKeyAnim(char) {
  const el = kbdKeyEls[char];
  if (!el) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 120);
}
