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
- **Seri (combo)** — art arda komut tamamladıkça puan çarpanı büyür. 3'te seri
  göstergesi belirir (çarpanın devreye girdiği yer), 5'te terminal
  **Overdrive**'a geçer: yazılar temanın vurgu rengine, arka plan lacivere
  döner ve ekran kenarı mavi parlar. Seriyi bozan şeyler: tuzağa düşmek,
  komut kaçırmak, bomba patlaması/kaçması — **yanlış harf bozmaz.**
  Overdrive boss sırasında kapanır ve Pratik / Parmak / Eğitim modlarında
  hiç çıkmaz (skorun ödülü olduğu için).

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
| 🎓 **Eğitim** | Sıfırdan başlayanlar için 10 derslik müfredat: sıralı kilit, ders başına doğruluk + hız eşiği, yıldızlar. |

### 🎓 Eğitim modu

Parmak modu serbest antrenmandır; Eğitim modu ise bir **öğrenme yoludur** —
"şimdi ne çalışmalıyım, hazır mıyım" sorusunu oyun cevaplar.

| # | Ders | Doğruluk | Hız |
|---|------|----------|-----|
| 1 | Dayanak tuşları | %96 | 12 WPM |
| 2 | Ev sırası | %95 | 14 |
| 3 | Üst sıra — işaret & orta | %95 | 14 |
| 4 | Üst sıra tamamı | %95 | 16 |
| 5 | Alt sıra — işaret & orta | %95 | 16 |
| 6 | Alt sıra tamamı | %95 | 18 |
| 7 | Tüm klavye | %95 | 20 |
| 8 | **Gerçek komutlar** | %95 | 22 |
| 9 | Türkçe harfler (ğüşöçı) | %95 | 22 |
| 10 | Rakam & noktalama | %94 | 18 |

- Bir ders **10 alıştırma satırı** sürer; süre baskısı ve ceza yoktur.
- Geçmek için **hem doğruluk hem hız** eşiği tutmalıdır — hızlı ama hatalı
  yazmak yıldız kazandırmaz.
- Yıldızlar: geçme ★, hedefin 1.2 katı ★★, 1.5 katı ★★★. **Yıldız düşmez** —
  kötü bir tekrar oynayış önceki sonucu bozmaz.
- Kilitli dersler **yine de tıklanabilir**: kilit yol gösterir, duvar örmez.
- Dersler harf değil **konum** tabanlıdır; klavye düzenini değiştirmek
  ilerlemeyi bozmaz. (EN düzeninde Türkçe harfler dersi gizlenir.)

## Öğrenme tarafı

Bu bir oyun kadar bir **öğretme aracı**:

- **Ekran klavyesi** TR-Q / TR-F / EN düzenlerini destekler, sıradaki tuşu ve hangi parmakla basılacağını gösterir.
- **Uyarlanır hedefleme** — 150 tuştan sonra oyun, hata oranın yüksek olan harfleri ve en zayıf parmağının harflerini içeren komutları daha sık gönderir.
- **Müfredat** — 🎓 Eğitim modu sıfırdan başlayanı dayanak tuşlarından gerçek komutlara götürür.
- **Analiz** — WPM trend grafiği, klavye ısı haritası, parmak ve sıra bazlı doğruluk, en yavaş / en hatalı harfler.
- **Seviye / XP** — XP doğrudan doğru yazılan karakter sayısıdır. Zorluk seçimiyle veya comboyla oynanamaz.
- **Rozetler** (5 yıldızlı kademeler) ve yerel en iyi 10 maç tablosu.

Tüm veri tarayıcının `localStorage`'ında durur; hesap yok, sunucuya hiçbir şey gitmez.

### Verini taşımak / yedeklemek

Analiz panelindeki **💾 dışa aktar** bütün ilerlemeni (istatistik, geçmiş, lider
tablosu, rozetler, ders ilerlemesi) tek bir `sizma-data.json` dosyasına indirir;
**📂 içe aktar** aynı dosyayı geri yükler.

> **Dikkat:** `localStorage` adres başına ayrılır — `http://127.0.0.1:5500` ile
> `http://localhost:5500` ya da farklı bir port tarayıcı için ayrı sitelerdir ve
> ilerlemen "kaybolmuş" gibi görünür. Oyunu hep aynı adresten aç; VS Code Live
> Server kullanıyorsan portu sabitle.

Tarayıcı kaydetmeye hiç izin vermiyorsa (site verileri engellenmişse ya da sayfa
`file://` altında açıldıysa) oyun yine tam çalışır — bellek içi bir depolamaya
düşer ve menüde bunu söyleyen bir uyarı gösterir. Tek fark, ilerlemenin sekme
kapanınca uçmasıdır.

## Oyna

**→ [aslihan05.github.io/sizma-typing-game](https://aslihan05.github.io/sizma-typing-game/)**

Kurulum gerekmez, tarayıcıda açılır.

**Oyun fiziksel klavye için tasarlandı.** Dokunmatik bir cihazda başlatmaya
çalışırsan bir uyarı çıkar ve üç seçenek sunar:

- **menüye dön** — klavyesiz de istatistiklerine, rozetlerine ve ders
  ilerlemene bakabilirsin
- **klavyem var, devam et** — klavyeli tablet için
- **⌨ ekrandaki klavyeyle oyna** — oyunun kendi 10 parmak rehberi giriş
  aygıtına dönüşür; tuşlara dokunarak yazarsın

Seçim hatırlanır. Dokunmatik modda işletim sisteminin klavyesi **açılmaz** —
oyun alanı kapanmaz, parmak renkleri ve sıradaki tuş vurgusu görünür kalır ve
düzen senin seçtiğin düzendir (TR-Q / TR-F / EN), cihazınkine bağlı değil.
Klavyenin altında **⌫ sil** ve **⎋ iptal** tuşları belirir.

Yine de: dokunmatik mod **10 parmak öğrenmek için uygun değildir**, tek
parmakla dokunarak yazmak kas hafızası kurmaz. Oyunun asıl amacı için gerçek
bir klavye kullan.

Telefon ve tabletlerde **istatistikler, rozetler, ders listesi, ayarlar ve
veri dışa/içe aktarma** sorunsuz çalışır — ilerlemene her yerden bakabilirsin.

### Uygulama olarak kurmak

Oyun bir **PWA**'dır: Chrome / Edge adres çubuğundaki "Yükle" simgesine
tıklayınca bilgisayarına kendi ikonu ve penceresi olan bir uygulama olarak
kurulur ve **çevrimdışı** çalışır. Android'de "Ana ekrana ekle" aynı işi görür.

Tüm dosyalar ilk ziyarette önbelleğe alınır (`sw.js`); sonraki açılışlarda
internet gerekmez. Veriler zaten `localStorage`'da, sunucuya hiçbir şey gitmez.

## Geliştirme

Depoyu indirip `index.html`'i açman yeterli. Ancak service worker ve panoya
kopyalama gibi bazı tarayıcı API'leri `file://` altında çalışmaz, bu yüzden
küçük bir yerel sunucu önerilir:

```bash
python -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresine git.

Service worker `localhost` / `127.0.0.1` üzerinde **önce ağı** dener, yani
düzenlediğin dosya yenilemede olduğu gibi gelir — `SURUM` artırmana gerek yok.
Ağ yoksa yine önbelleğe düşer, dolayısıyla çevrimdışı davranışı geliştirirken
de sınayabilirsin (sunucuyu durdurup sayfayı yenile). Gerçek alan adından
servis edilen sürüm eskisi gibi önbellek-önceliklidir; **yayına çıkarken
`sw.js` içindeki `SURUM` sabitini artır**, yoksa kullanıcı güncellemeyi görmez.

### PDF dökümantasyonu

`docs/SIZMA-Dokumantasyon.pdf`, bu README ile [docs/MIMARI.md](docs/MIMARI.md)'den
**türetilir** — elle düzenlenmez. Döküman değişince yeniden üretin:

```bash
python tools/dokuman_uret.py
```

> Oyunun hâlâ hiçbir bağımlılığı yok; aşağıdakiler yalnızca bu araca ait ve
> oyunu çalıştırmak için gerekmez:
> `pip install reportlab markdown matplotlib`
> (matplotlib sadece DejaVu fontları için — Türkçe karakterler ReportLab'in
> gömülü fontunda yok.)

## Erişilebilirlik

`prefers-reduced-motion` açıksa animasyonlar, matrix yağmuru ve sarsma/flash
efektleri devre dışı kalır; işlevsel renkler korunur. Ayarlardan tema
(Hacker / Synthwave / Cyberpunk / Karanlık), yazı boyutu ve tam ekran seçilebilir.

Ekran okuyucu tarafında: durum satırı `aria-live` ile duyurulur (oyunun
anlatıcısı orası — "tuzak! -3 sn", "ders bitti", depolama uyarısı), yalnızca
emoji içeren düğmeler `aria-label` taşır, ses düğmesi ile seçim grupları
(mod, tema, yazı boyutu, ekran klavyesi) `aria-pressed` ile hangi seçeneğin
seçili olduğunu bildirir.

> Dürüst sınır: **oyunun kendisi** ekran okuyucuyla oynanamaz. İnen yazıları
> gözle yakalayıp süreye karşı yazmak buna elverişli değil ve bunu değiştirmeye
> çalışmak oyunu başka bir şeye dönüştürür. Yapılan iş, oyun dışındaki her şeyin
> — menü, ayarlar, analiz paneli, ders listesi — gezilebilir olması.

## Klavye

| Tuş | İşlev |
|---|---|
| `Esc` | Kilidi bırak · duraklat/devam |
| `Backspace` | Son harfi sil |
| `P` | Duraklat |

## Proje yapısı

```
index.html
manifest.json        PWA künyesi (ad, ikonlar, renkler)
sw.js                service worker — çevrimdışı önbellek
icons/               uygulama ikonları
css/style.css        görsel tema, CRT efekti, tema değişkenleri
js/storage.js        depolama güvenlik ağı — en başta yüklenir
js/keyboard.js       ekran klavyesi, düzenler, parmak renkleri, ısı haritası
js/stats.js          analiz, seviye/XP, grafik, lider tablosu, dışa/içe aktarma
js/drills.js         parmak antrenmanı dizileri
js/lessons.js        eğitim modu müfredatı, ders ilerlemesi ve değerlendirme
js/balance.js        zorluk ve denge sabitleri
js/audio.js          Web Audio ile sentetik terminal sesleri
js/badges.js         rozet/başarım sistemi
js/settings.js       tema, yazı boyutu, tam ekran
js/main.js           oyun döngüsü, üretim, modlar, ekranlar
docs/MIMARI.md       mimari ve geliştirici notları
docs/SIZMA-Dokumantasyon.pdf   türetilmiş belge (bkz. PDF dökümantasyonu)
tools/dokuman_uret.py          o belgeyi üreten betik
```

Derleme adımı ve bağımlılık yok. Tek dış kaynak: Google Fonts üzerinden JetBrains Mono.

Kodun içine girecekler için mimari, veri modeli ve "yeni komut/rozet/ders nasıl
eklenir" tarifleri: **[docs/MIMARI.md](docs/MIMARI.md)**.

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
- **Baskısız modlarda skor hiç gösterilmez.** Pratik, Parmak ve Eğitim'de ceza
  ve süre yok; skor orada yalnızca "ne kadar oynadığını" ölçerdi. Hem oyun
  sırasında başlıkta hem sonuç ekranında gizlenir — ders ortasında öğrenciye
  anlamsız bir sayı göstermemek için. Saat kalır: yukarı sayar ve kendi hızını
  görmen içindir.
- **XP doğrudan doğru yazılan karakter sayısı.** Ayrı bir puan sayacı tutulmuyor,
  yani zorluk seçimiyle veya comboyla şişirilemez. "Verileri sıfırla" dendiğinde
  seviye de dürüstçe sıfırlanır.
- **Derste geçme kriteri hem doğruluk hem hız.** Yalnız doğruluk olsaydı tek
  parmakla bakarak yazan biri de müfredatı bitirirdi; yalnız hız olsaydı yanlış
  alışkanlık ödüllendirilirdi. Doğruluk birincil, hız ikincildir.
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

### Kararı değişenler

- **Dokunmatik oynanış.** Uzun süre "yapılmayacak" listesindeydi: 10 parmak
  öğreten bir oyunu dokunmatikte oynatmak amacı boşa çıkarır. Karşı gerekçe
  ağır bastı — telefonuyla açan biri karşısında ölü bir ekran buluyordu.
  Şimdi ekran klavyesi bir **giriş aygıtına** dönüşebiliyor, ama asıl gerekçe
  hâlâ geçerli sayılıyor: mod bir uyarının arkasında duruyor, varsayılan değil
  ve öğrenme yolu olarak sunulmuyor (bkz. [Oyna](#oyna)).

## Lisans

[MIT](LICENSE) — © 2026 Aslıhan Erturhan

## Durum

Oynanabilir ve özellik olarak tamam: beş mod, düşman kadrosu ve boss, analiz,
seviye, rozetler, müfredat.

Sıradaki işler:

- **Denge doğrulaması** — `js/balance.js` sayıları ve Eğitim modu ders eşikleri
  masabaşı hesaplarla belirlendi; gerçek oynanışla sınanıp revize edilecek.
- Zorluk bazlı ayrı istatistikler.
- Hikâye katmanı.
