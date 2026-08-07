// === Depolama güvenlik ağı ===
//
// Bazı ortamlarda localStorage'a ERİŞMEK bile istisna fırlatır: tarayıcı
// "tüm site verilerini engelle" ayarındaysa ya da sayfa file:// altında
// açıldıysa. Oyunun üst seviye okumaları (settings.js'teki tema/yazı boyutu,
// main.js'teki mod/öğretici/klavye düzeni) betik yüklenirken çalıştığı için
// istisna orada betiği öldürüyor, main.js'in geri kalanı hiç çalışmıyor ve
// oyun bir açıklama bile vermeden açılmıyordu. file:// desteklenen bir
// kullanım (bkz. README) olduğu için bu varsayımsal bir senaryo değil.
//
// Çözüm tek noktada: depolama bir kez sınanır, kullanılamıyorsa bellek içi
// taklidi devreye girer. Oyunun geri kalanı localStorage'ı normalde olduğu
// gibi çağırmaya devam eder — diğer dosyalarda tek satır değişmez.
// Tek fark: ilerleme sekme kapanınca uçar, oyun yine tam çalışır.
//
// Bu dosya betik sırasında EN BAŞTA yüklenmeli; sonrasında yüklenen hiçbir
// dosya ham localStorage'a dokunmadan önce ağ kurulmuş olur.
(function () {
  "use strict";

  function depolamaCalisiyorMu() {
    try {
      var d = window.localStorage;
      if (!d) return false;
      // Salt okuma yetmez: bazı tarayıcılar okumaya izin verip yazmada
      // kota istisnası atıyor. Gerçek bir yaz-sil turu tek güvenilir sınama.
      var anahtar = "__sizma_depolama_sinamasi__";
      d.setItem(anahtar, "1");
      d.removeItem(anahtar);
      return true;
    } catch (e) {
      return false;
    }
  }

  if (depolamaCalisiyorMu()) {
    window.SIZMA_DEPOLAMA_KALICI = true;
    return;
  }

  // --- Bellek içi taklit ---
  // localStorage'ın oyunda kullanılan yüzeyi: getItem / setItem / removeItem.
  // clear / key / length de eklendi ki üçüncü bir kod yolu beklenmedik
  // biçimde patlamasın.
  var veri = Object.create(null);

  var taklit = {
    getItem: function (anahtar) {
      var k = String(anahtar);
      return Object.prototype.hasOwnProperty.call(veri, k) ? veri[k] : null;
    },
    setItem: function (anahtar, deger) {
      veri[String(anahtar)] = String(deger);
    },
    removeItem: function (anahtar) {
      delete veri[String(anahtar)];
    },
    clear: function () {
      veri = Object.create(null);
    },
    key: function (sira) {
      var anahtarlar = Object.keys(veri);
      return sira >= 0 && sira < anahtarlar.length ? anahtarlar[sira] : null;
    },
    get length() {
      return Object.keys(veri).length;
    }
  };

  try {
    Object.defineProperty(window, "localStorage", {
      value: taklit,
      configurable: true,
      writable: false
    });
    window.SIZMA_DEPOLAMA_KALICI = false;
  } catch (e) {
    // localStorage yeniden tanımlanamıyorsa yapılabilecek bir şey yok;
    // en azından bayrak yanlış bilgi vermesin.
    window.SIZMA_DEPOLAMA_KALICI = false;
  }
})();
