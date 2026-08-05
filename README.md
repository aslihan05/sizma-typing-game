# SIZMA

> Hacker temalı, Türkçe 10 parmak yazma oyunu. Kurulum yok, derleme yok, backend yok — saf HTML/CSS/JS.

Terminal ekranında yukarıdan gürültü satırları iner. Her satırın içinde işaretlerle
(`[komut]`, `$komut$`, `(komut)`, `<komut>`, `{komut}`) gizlenmiş bir komut vardır.
Görev: komutu gürültüden ayıklamak ve süre bitmeden doğru yazmak.

Zaman senin canın. Doğru komut süre kazandırır, kaçan komut ve tuzaklar süre götürür.

## Oynanış

- **Ayıklama** — her satırda komut yok; saf gürültü satırları cezasızdır, asıl beceri işareti fark etmek.
- **Harf harf doğrulama** — doğru harfler yeşil yanar, yazdığın satıra kilitlenirsin.
- **Yanlış harfin cezası yoktur** — sadece ilerlemez. Amaç panik değil, doğru refleks.
- **Seri (combo)** — art arda komut tamamladıkça puan çarpanı büyür.

### Düşmanlar

| | Tür | Davranış |
|---|---|---|
| 🎭 | Tuzak | İşaret kırmızı yanıp söner — yazarsan ceza, bırakırsan cezasız |
| 🔀 | Değişken | Hedef değilken komut ara ara değişir |
| ✂️ | Bölünen | Ekranın ortasında ikiye ayrılır |
| ⏱️ | Saatli bomba | Kendi geri sayımı var; kaçarsa büyük ceza, yazarsan 2× puan |
| 🔥 | Boss | "Güvenlik Duvarı" — can barı, uzun komutlar, yoğun tuzak |

Düşmanlar oyun ilerledikçe kademeli açılır.

## Modlar

| Mod | Ne yapar |
|---|---|
| ⏱ **Sızma** | Asıl oyun: geri sayım, cezalar, düşmanlar, boss. |
| 🎯 **Pratik** | Süre yok, ceza yok, düşman yok. Saat yukarı sayar, sonunda analiz raporu. |
| 📅 **Günlük** | Günün tarihinden tohumlanmış sabit görev — herkes aynı komutları, aynı tuzakları görür. |
| ✋ **Parmak** | Komut yerine üretilmiş alıştırma dizileri (`fff jjj fjf`). Ev/üst/alt sıra, sol/sağ el veya "zayıf noktam". |

## Öğrenme tarafı

Bu bir oyun kadar bir **öğretme aracı**:

- **Ekran klavyesi** TR-Q / TR-F / EN düzenlerini destekler, sıradaki tuşu ve hangi parmakla basılacağını gösterir.
- **Uyarlanır hedefleme** — 150 tuştan sonra oyun, hata oranın yüksek olan harfleri ve en zayıf parmağının harflerini içeren komutları daha sık gönderir.
- **Analiz** — WPM trend grafiği, klavye ısı haritası, parmak ve sıra bazlı doğruluk, en yavaş / en hatalı harfler, JSON dışa aktarma.
- **Seviye / XP** — XP doğrudan doğru yazılan karakter sayısıdır. Zorluk seçimiyle veya comboyla oynanamaz.
- **Rozetler** ve yerel en iyi 10 maç tablosu.

Tüm veri tarayıcının `localStorage`'ında durur; hesap yok, sunucuya hiçbir şey gitmez.

## Çalıştırma

Depoyu indirip `index.html`'i açman yeterli. Ancak skoru panoya kopyalama gibi
bazı tarayıcı API'leri `file://` altında kısıtlıdır, bu yüzden küçük bir yerel
sunucu önerilir:

```bash
python -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresine git.

## Erişilebilirlik

`prefers-reduced-motion` açıksa animasyonlar, matrix yağmuru ve sarsma/flash
efektleri devre dışı kalır; işlevsel renkler korunur. Ayarlardan tema
(Hacker / Synthwave / Cyberpunk / Karanlık), yazı boyutu ve tam ekran seçilebilir.

## Klavye

| Tuş | İşlev |
|---|---|
| `Esc` | Kilidi bırak · duraklat/devam |
| `Backspace` | Son harfi sil |
| `P` | Duraklat |

## Proje yapısı

```
index.html
css/style.css        görsel tema, CRT efekti, tema değişkenleri
js/keyboard.js       ekran klavyesi, düzenler, parmak renkleri, ısı haritası
js/stats.js          analiz, seviye/XP, grafik, lider tablosu, dışa aktarma
js/drills.js         parmak antrenmanı dizileri
js/balance.js        zorluk ve denge sabitleri
js/audio.js          Web Audio ile sentetik terminal sesleri
js/badges.js         rozet/başarım sistemi
js/settings.js       tema, yazı boyutu, tam ekran
js/main.js           oyun döngüsü, üretim, modlar, ekranlar
```

Derleme adımı ve bağımlılık yok. Tek dış kaynak: Google Fonts üzerinden JetBrains Mono.

## Tasarım kararları

Birkaç seçim bilinçli ve oyunun tamamını şekillendiriyor:

- **Her satırda komut yok.** Saf gürültü satırları cezasızdır. Denge açısından zorunlu:
  her satırda komut olsaydı orta zorlukta dakikada ~55 komut inerdi, kimse o hızda
  yazamaz. Oyun açısından da zorunlu — "ayıklama" görevinin gerçek olması için
  bazen ayıklanacak bir şey olmamalı.
- **Yanlış harfin cezası yok.** Ceza panik ve tereddüt üretir; yazma öğrenirken
  istenen şey doğru refleks. Yanlış harf sadece ilerletmez.
- **Zaman = can.** Ayrı can barı yok. Tek kaynak olması hem anlatıyı hem dengeyi
  sadeleştiriyor: her ödül ve ceza aynı para biriminden ödeniyor.
- **XP doğrudan doğru yazılan karakter sayısı.** Ayrı bir puan sayacı tutulmuyor,
  yani zorluk seçimiyle veya comboyla şişirilemez. "Verileri sıfırla" dendiğinde
  seviye de dürüstçe sıfırlanır.
- **Parmak antrenmanında gerçek kelime kullanılmıyor.** Kelime yazmak belirli bir
  parmağı izole edemez — "kilidi aç" yazarken sekiz parmak birden çalışır. Parmak
  kası ancak o parmağın harfleri arka arkaya tekrarlanınca oturur. Kurgu bozulmasın
  diye diziler işaretlerin içinde "şifre parçası" gibi iner.
- **Komut tekrarı yok.** Komutlar karıştırılmış bir torbadan sırayla çekilir; torba
  bitmeden hiçbiri tekrar etmez ve torba `localStorage`'da saklandığı için üst üste
  oynanan oyunlarda da tekrar oluşmaz. Günlük görevde torba dondurulur ki herkes
  aynı diziyi görsün.

### Bilerek yapılmayanlar

- **Power-up'lar** — oyuncuyu klavyeden koparıp "ne zaman kullansam" kararına iter.
- **Çok oyunculu mod** — backend, eşleştirme ve hile önleme gerektirir; ayrı bir proje.
- **Mobil dokunmatik oynanış** — 10 parmak öğreten bir oyunu dokunmatikte oynatmak amacı boşa çıkarır.

## Durum

Oynanabilir. Sıradaki işler: denge sayılarının gerçek oynanışla doğrulanması,
zorluk bazlı ayrı istatistikler ve müfredat/hikâye katmanı.
