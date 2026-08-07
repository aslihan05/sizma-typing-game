# SIZMA — Mimari ve Geliştirici Notları

Bu belge kodun içine girecekler içindir: modüllerin sorumlulukları, oyunun
durum modeli, veri şeması ve sık yapılan değişikliklerin tarifleri. Oyunun ne
olduğu ve nasıl oynandığı için [README](../README.md)'ye bakın.

---

## 1. Temel yaklaşım

- **Derleme yok, bağımlılık yok.** Saf HTML + CSS + JS. Dosyalar `index.html`
  içinde sırayla `<script>` ile yüklenir; modül sistemi (ES modules, bundler)
  kullanılmaz. Her dosya global kapsama yazar.
- **DOM tabanlı oyun.** Canvas yok. Her inen satır bir `<div>`, her harf bir
  `<span>`. Böylece tema/CSS efektleri ve ekran okuyucu davranışı bedava gelir,
  karşılığında satır sayısı düşük tutulmak zorundadır (bkz. `maxCmds`).
- **Backend yok.** Tüm kalıcı veri `localStorage`'da.
- **Modülerleştirme ayrı bir iş olarak yapılmaz.** Çalışan kodu yeniden yazmak
  risktir; bunun yerine her yeni özellik kendi dosyasına yazılır, kod doğal
  olarak bölünür. `js/main.js` bu yüzden hâlâ en büyük dosyadır.

## 2. Modül haritası

Yükleme sırası önemlidir — aşağıdaki sıra `index.html`'deki sıradır ve
bağımlılık yönünü de gösterir (üsttekiler alttakileri bilmez).

| Dosya | Sorumluluk | Dışarıya verdiği başlıcalar |
|---|---|---|
| `js/storage.js` | Depolama güvenlik ağı: `localStorage` kullanılamıyorsa bellek içi taklidini kurar | `SIZMA_DEPOLAMA_KALICI` |
| `js/keyboard.js` | Ekran klavyesi, düzen tabloları, parmak haritaları, ısı haritası çizimi | `KBD_LAYOUTS`, `KBD_FINGER_MAPS`, `renderKeyboard()`, `highlightNextKey()` |
| `js/stats.js` | Session + lifetime analiz, WPM/doğruluk, seviye/XP, trend grafiği, lider tablosu, dışa/içe aktarma | `sStats`, `trackEvent()`, `wpmOf()`, `accuracyOf()`, `levelInfo()`, `exportData()`, `importData()` |
| `js/drills.js` | Parmak antrenmanı dizisi üretimi | `DRILL_TARGETS`, `makeUniqueDrill()`, `drillRowLetters()`, `drillGroup()` |
| `js/lessons.js` | Eğitim modu müfredatı, ders ilerlemesi, değerlendirme | `LESSONS`, `makeUniqueLessonLine()`, `evaluateLesson()`, `recordLessonResult()` |
| `js/balance.js` | Denge sabitleri | `BALANCE`, `DIFFICULTIES` |
| `js/audio.js` | Web Audio ile sentetik sesler | `playKey()`, `playComplete()`, `playGameOver()` … |
| `js/badges.js` | Yıldız kademeli rozetler (5 kademe, `STAR_COUNT`) | `BADGES_DB`, `loadBadges()`, `evaluateBadges()`, `renderBadgesPanel()` |
| `js/settings.js` | Tema, yazı boyutu, tam ekran | (kendi kendine bağlanır) |
| `js/uretici.js` | Nesne + fiil çarpımından komut üretimi (TR/EN, normal/boss) | `URETILEN_TR`, `URETILEN_BOSS_TR`, `URETILEN_EN`, `URETILEN_BOSS_EN` |
| `js/main.js` | Oyun döngüsü, satır üretimi, giriş modeli, modlar, tüm ekranlar | `startGame()`, `endGame()`, `showMenu()` |

`js/lessons.js`, `js/drills.js`'in yardımcılarını (`drillGroup`,
`drillRowLetters`, `isDrillLetter`) yeniden kullanır — **drills.js'ten sonra
yüklenmelidir.**

`js/storage.js` **en başta** yüklenmelidir. Sonraki dosyaların bir kısmı üst
seviyede `localStorage` okur (`settings.js`'te tema/yazı boyutu, `main.js`'te
mod/öğretici/klavye düzeni). Depolama engelliyse bu okumalar istisna fırlatır
ve betiği orada keser: menü açılır ama ekran klavyesi çizilmez ve `startGame`
`SecurityError` atar — yani oyun başlatılamaz. Ağ en başta kurulunca sonraki
dosyalar ham `localStorage`'a hiç dokunmamış olur.

## 3. Oyun döngüsü ve durum

`startGame(zorlukAnahtarı)` → `requestAnimationFrame(gameLoop)` → `endGame()`.

`gameLoop(timestamp)` her karede sırayla:

1. `running` değilse çıkar.
2. `dt` hesaplar. **`waitingStart` doğruysa `elapsed` ilerlemez** — oyuncu ilk
   yazılabilir tuşa basana kadar saat işlemez ve süre erimez. Başlatan tuş
   tüketilmez, ilk harf de yazıma sayılır.
3. Ders bitiş bayrağını (`lessonFinish`) kontrol eder.
4. Saati işletir: baskısız modlarda yukarı sayar, Sızma'da geri sayar.
5. Satırları aşağı taşır, ekrandan çıkanları cezalandırır/siler.
6. Gerekirse yeni satır üretir, boss zamanlayıcısını yürütür.

Önemli global durum (`js/main.js`):

| Değişken | Anlamı |
|---|---|
| `running`, `paused`, `waitingStart` | Döngü durumu |
| `sentences[]` | Ekrandaki satırlar (`{el, charSpans, y, command, isDecoy, …}`) |
| `gameMode` | `sizma` · `pratik` · `gunluk` · `drill` · `egitim` |
| `difficulty`, `currentDiffName` | Seçili `DIFFICULTIES` girdisi |
| `elapsed`, `timeLeft`, `score`, `streak` | Oyun sayaçları |
| `currentLessonNo`, `lessonLinesDone`, `lessonFinish` | Eğitim modu durumu |

**Neden `lessonFinish` bayrağı var:** ders dolduğunda `endGame()`'i doğrudan
`completeCommand()` içinden çağırmak, o fonksiyonun geri kalanını (DOM temizliği,
efektler) yarım bırakırdı. Bayrak konur, bitiş bir sonraki karede yapılır.

### Mod yüklemleri

```
isPratik()  isDrill()  isGunluk()  isEgitim()
isZamansiz() = isPratik() || isDrill() || isEgitim()
```

`isZamansiz()` "süre baskısı yok" demektir: saat yukarı sayar, ceza yoktur,
düşman türü üretilmez, skor/rekor gösterilmez. Yeni bir baskısız mod eklerken
tek yapılması gereken bu yükleme dahil etmektir.

## 4. Giriş modeli — ön ek eşleştirme

Oyun oyuncu adına satır **seçmez**. Basılan harfler bir tamponda birikir;
tamponla başlayan tüm komutlar "aday" olur ve yazılan kısımları yeşile döner.
Yazdıkça adaylar elenir, tek aday kalınca satır kilitlenir.

Kurallar:

- **Yanlış harf yok sayılır**, tamponu sıfırlamaz. (İlk sürümde sıfırlıyordu ve
  tek yanlış tuş 10 harflik emeği siliyordu — bir yazma oyununda kabul edilemez.)
  Hata yine analize kaydedilir ve `rejectKey()` görsel sinyalini tetikler.
- `Backspace` son harfi geri alır, `Esc` yazımı iptal eder.
- Aday kalmadığında tampon kendiliğinden sıfırlanır — aksi halde yazdığın satır
  ekrandan çıkınca klavye "ölü" kalıyordu.
### Tek giriş yolu: `handleTypedKey(tus)`

Oyun mantığı girişin nereden geldiğini bilmez. İki kaynak buraya bağlanır:

1. **Fiziksel klavye** — `document` üzerindeki `keydown`.
2. **Ekrandaki klavyeye dokunma** — `#keyboardSection` üzerinde devredilmiş
   tek bir `click` dinleyicisi. Her tuşun `dataset.key`'i vardır (bkz.
   `js/keyboard.js`), boşluk çubuğu dahil.

İşletim sisteminin yazılım klavyesi **bilerek açılmaz.** Denenen ilk yol
görünmez bir `<input>` odaklayıp `input` olaylarını okumaktı; çalışıyordu ama
klavye ekranın yarısını kaplayıp oyun alanını kapatıyordu. Oyunun zaten
çizdiği 10 parmak rehberini giriş aygıtına çevirmek hem yeri korur, hem parmak
renklerini ve sıradaki tuş vurgusunu dokunmatikte de görünür tutar, hem de
düzeni cihazın klavyesine değil oyuncunun seçimine bağlar.

Dokunma girişi yalnızca oyuncu açıkça "ekrandaki klavyeyle oyna" dediğinde
etkinleşir (`sizmaSoftKeyboard`); aksi halde fare kullanıcısı tuşlara yanlışlıkla
tıklayınca yazmış olurdu. Mod açıkken `.keyboard` elemanı `.tappable` sınıfını
alır ve klavyenin altında `⌫ sil` / `⎋ iptal` düğmeleri belirir.

**CSS tuzağı:** `.keyboard.tappable .key` kuralı (0,3,0) özgüllükte olduğu için
`.key.space-key` (0,2,0) genişliğini eziyor ve boşluk çubuğunu normal tuş
boyutuna düşürüyordu. Genişlik kuralı bu yüzden `:not(.space-key)` ile
sınırlanır. Tuş genişliği de sabit değil `clamp()` ile ekrana bağlıdır — sabit
27px, 360px'lik telefonlarda en kalabalık sırayı (12 tuş + girinti) taşırıyordu.

- `refreshCandidates()` her karede değil, yalnızca satır listesi değiştiğinde
  (`candidatesDirty`) çalışır. Her karede çalışırken 60 fps × ~90 DOM işlemi
  yapıyor ve yazarken takılmalara yol açıyordu.

## 5. Satır üretimi

`generateSentence(forceNormal)` tek karar noktasıdır. Sırası önemlidir:

1. **Bölünme çocuğu** (`forceNormal`) — tavanı dinler.
2. **Komut tavanı** — ekranda `difficulty.maxCmds` (boss'ta `+bossCmdBonus`)
   kadar yazılabilir komut varsa satır zorunlu olarak saf gürültü olur.
   *İş yükünü sabit tutan asıl mekanizma budur;* gürültü oranı tek başına
   dengeyi kurmaz.
3. **Saf gürültü** olasılığı (üst üste en fazla 2).
4. **Boss** → uzun boss komutu + `bossDecoyRate` tuzak.
5. **Eğitim** → `lessonCommand()` (Ders 8'de gerçek komut bankası).
6. **Parmak** → `makeUniqueDrill()`.
7. **Pratik** → düz komut, düşman yok.
8. **Sızma** → düşman türleri, `enemyMult` ile ölçeklenen takvimle açılır.

**Komut tekrarı yoktur:** komutlar karıştırılmış bir torbadan sırayla çekilir
(`BAG_KEY` ile `localStorage`'da saklanır), torba bitmeden hiçbiri tekrar etmez.
Günlük görevde torba dondurulur (`freezeBags()`) ve `Math.random` günün
tarihinden tohumlanan bir LCG'ye bağlanır (`setSeededRandom()`) ki herkes aynı
diziyi görsün.

## 6. Veri modeli (`localStorage`)

| Anahtar | Sabit | İçerik |
|---|---|---|
| `sizmaStats` | `STATS_KEY` | Ömür boyu analiz — XP/seviye buradan türer |
| `sizmaHistory` | `HISTORY_KEY` | Son 20 oyun (WPM trend grafiği) |
| `sizmaLeaderboard` | `LEADERBOARD_KEY` | En iyi 10 maç |
| `sizmaBadges` | `BADGES_KEY` | Rozet ilerlemesi `{id: {v, stars}}` |
| `sizmaLessons` | `LESSONS_KEY` | `{acilan, sonuclar: {no: {wpm, acc, yildiz}}}` |
| `sizmaCmdBags` | `BAG_KEY` | Komut torbaları (tekrar önleme) |
| `sizmaBest` | `BEST_KEY` | En iyi skor |
| `sizmaTutorialSeen` | `TUTORIAL_KEY` | Öğretici gösterildi mi |
| `sizmaMute` | `AUDIO_MUTE_KEY` | Ses kapalı mı |
| `sizmaKeyboardOK` | `KEYBOARD_OK_KEY` | Dokunmatik uyarısı geçildi mi |
| `sizmaSoftKeyboard` | `SOFT_KEY` | Ekran klavyesiyle oynanıyor mu |
| `sizmaLayout`, `sizmaTheme`, `sizmaFontSize`, `sizmaMode`, `sizmaDrillTarget` | — | Tercihler |

**Dışa/içe aktarma** (`exportData()` / `importData()`) şunları taşır:
`stats`, `history`, `leaderboard`, `badges`, `lessons`. Tercihler ve komut
torbaları taşınmaz — cihaza özgüdürler.

`importData()` iki ayrı şeyi birden yapar, ikisini karıştırmayın:

- **Eksik alana toleranslıdır.** Eski bir yedekte `lessons` yoksa mevcut ders
  ilerlemesi korunur, hata verilmez.
- **Yanlış şekle toleranslı DEĞİLDİR.** Her alan tek tek doğrulanır
  (`history`/`leaderboard` → `Array.isArray`, `stats`/`badges`/`lessons` →
  düz nesne). Şekli tutmayan alan **yazılmaz**, tutan alanlar yüklenir.
  Hiçbir alan tanınmazsa `false` döner ve arayüz "dosya hatalı" der.

> **Yeni bir alan eklerken doğrulama satırını yazmayı atlamayın.** Bu koruma
> kozmetik değil: dosya kullanıcıdan geliyor (yarım inmiş, elle düzenlenmiş ya
> da yanlışlıkla seçilmiş başka bir `.json`) ve doğrulama yokken geçerli ama
> yanlış türde tek bir alan oyunu KALICI olarak kırıyordu — `statsEndGame`
> içinde `hist.unshift` patlıyor, `endGame` yarıda kesiliyor, sonuç ekranı hiç
> açılmıyordu. Veri depoda kaldığı için her oyunda tekrar ediyor, tek çıkış
> yolu "verileri sıfırla" oluyordu.

Aynı kural yükleyiciler için de geçerli: **`load*` fonksiyonları depodaki veri
beklenen şekilde değilse boş başlangıca dönmelidir.** `JSON.parse`'ı `try/catch`
içine almak yetmez — geçerli ama yanlış türde bir JSON (`"metin"`, `42`)
sessizce geçer ve kullanıldığı yerde patlar.

> `localStorage` **origin** başına ayrılır (protokol + host + port). Oyunu
> `127.0.0.1:5500` yerine `localhost:5500` üzerinden açmak, tarayıcı için
> bambaşka bir sitedir ve veri "kaybolmuş" görünür. Geliştirirken adresi sabit tutun.

### İki katmanlı analiz

`js/stats.js` iki nesne tutar: **`sStats`** (o anki oyun, `statsStartGame()` ile
sıfırlanır) ve **lifetime** (`localStorage`'da birikir, `statsEndGame()` ile
güncellenir). WPM/doğruluk gibi ölçümler `sStats` üzerinden hesaplanır —
Eğitim modunun ders değerlendirmesi de buradan okur.

Bu veri sadece rapor değil, **oyunun girdisidir**: 150 tuştan sonra
`refreshWeakLetters()` hata oranı yüksek harfleri ve en zayıf parmağın
harflerini seçer, `BALANCE.weakBias` oranında bu harfleri içeren komutlar daha
sık gönderilir, hedef tuşlar klavyede işaretlenir.

## 7. Denge

Bütün sayılar `js/balance.js`'te. Kritik ilişki:

```
Satır geçiş süresi = oyun alanı yüksekliği / hız
Talep              = maxCmds / geçiş süresi
Süre ödülü         = timeRewardBase + etkinUzunluk / difficulty.targetCps
```

**Kural:** bir komutun süre ödülü, o komutu *hedef hızdaki* bir yazıcının yazma
süresine eşittir. Böylece hedef hızda yazan oyuncunun saati sabit kalır, daha
hızlı olan uzatır, yavaş olan eritir. Yani **"zorluk seviyesi" = "hedef yazma
hızı"** demektir (`targetCps`), ki 10 parmak öğreten bir oyun için doğru tanım budur.

Uzun komutlarda azalan getiri vardır: ilk `rewardFullChars` (12) harf tam,
sonrası `rewardLongFactor` (0.6) ağırlıkla sayılır. Tavan koymak yerine bu
seçildi — tavan, belli bir uzunluktan sonra uzunluk farkını anlamsız kılardı.

`DIFFICULTIES.lineHeight`, CSS'teki `.sentence` yüksekliğinden (18 px) küçük
olamaz; yoksa satırlar üst üste biner.

### Komut uzunluğunun üst sınırı — `BALANCE.bossMaxLen`

Bir komut, satırın ekranda kaldığı süreden uzun sürede yazılıyorsa **hedef
hızda yazan biri için bile yetişilmesi imkânsızdır.** Sınır buradan çıkar:

```
satır ömrü      = oyun alanı yüksekliği / (hız × bossSpeedMult)
yazma süresi    = komut uzunluğu / difficulty.targetCps
okuma payı      = satır ömrü − yazma süresi        ← pozitif kalmalı
```

Orta seviyede: 380 / (24 × 1.2) = **13.2 sn** satır ömrü. 40 karakteri hedef
hızda (3.5 kps) yazmak 11.4 sn, yani okuma payı 1.8 sn. `bossMaxLen` bu yüzden
40; 57 karakterlik bir komut 16.3 sn sürer ve satır ekranda kalmadan biter.

Sınır **hem üretece hem elle yazılmış bankaya** uygulanır (bkz. `bossPool()`).

> Ortalamaya değil **medyana** bakın. Üreteç ilk sürümde boss için yalnız sonek
> kullanıyordu: ortalama 33'ten 35.6'ya çıkmış görünüyordu (zararsız), ama
> dağılım 35'e sıkışmış ve kısa komut hiç kalmamıştı. Nefes payı tam da kısa
> komutlardan gelir; medyan 28 → 35 olunca oyun yetişilmez hâle geldi.

## 8. Eğitim modu (`js/lessons.js`)

Dersler **harf değil konum** tabanlıdır: "ev sırası" TR-Q'da `asdfg hjklş`,
TR-F'de `uieaü tkmly` demektir. Böylece klavye düzenini değiştirmek ders
ilerlemesini bozmaz.

**Dayanak (home) tuşları parmak haritasından türetilemez:** `KBD_FINGER_MAPS`
TR-Q'da hem `h` hem `j`'yi sağ işaret parmağına bağlar ama hangisinin "ev"
olduğunu söylemez. Bunun yerine satırdaki **konum** kullanılır —
`LESSON_ANCHOR_POS = [0,1,2,3,6,7,8,9]`. Üç düzende de doğru sonucu verir.

Ders akışı:

```
startLesson(no) → startGame("kolay")   // tempo hep kolay; zorluk eşikten gelir
  her tamamlanan satır → lessonLinesDone++
  lessonLinesDone >= LESSON_LINES (10) → lessonFinish = true
    → gameLoop bir sonraki karede endGame()
      → renderLessonResult() → recordLessonResult(no, wpm, acc)
```

`evaluateLesson()` saf bir fonksiyondur (kaydetmez), `recordLessonResult()`
kaydeder ve gerekirse bir sonraki dersi açar. Kurallar:

- Geçme = doğruluk **ve** hız eşiği. Yıldız: geçme ★, hedef × 1.2 ★★, × 1.5 ★★★.
- Yarım bırakılan ders (`lessonLinesDone < LESSON_LINES`) kaydedilmez.
- Kayıt yalnızca iyileştirirse üzerine yazılır; yıldız düşmez.
- Kilit `nextVisibleLesson()` üzerinden ilerler, yani **gizli dersler zinciri
  kırmaz**: EN düzeninde Ders 9 (Türkçe harfler) gizlidir ve 8'i geçen oyuncu
  doğrudan 10'u açar.

## 9. Tarifler

### Yeni komut eklemek

İki yol var ve **ikincisi neredeyse her zaman daha verimli.**

**Tek bir komut** için: `js/main.js` içindeki `COMMANDS_TR` / `COMMANDS_EN`
(boss için `BOSS_COMMANDS_*`) dizisine ekleyin. Kurguya özel, "lezzetli"
komutlar buraya yazılır. Kazanç: +1 komut.

**Havuzu büyütmek** için: `js/uretici.js` içindeki `U_NESNELER` / `U_FIILLER`
listelerine kelime ekleyin. Çarpımsal olduğu için **bir nesne ≈ +5, bir fiil
≈ +9 komut** getirir.

```js
{ ad: "belleği", tur: "veri" },              // nesne — BELİRTME hâliyle
{ ad: "sızdır",  turler: ["veri"] },         // fiil — kabul ettiği türler
```

Üç kural:

1. **Nesneler belirtme hâliyle yazılır** (`"çekirdeği"`, `"logları"`). Ünlü
   uyumu düzenli ama istisnalı (çekirdek → çekirdeği); kural yazmak yerine
   çekilmiş hâli saklamak sıfır çekim hatası demek.
2. **Tür şart.** Olmadan "kamerayı çöz", "algoritmayı aç" gibi eşleşmeler
   üretilir. Türler: `ağ` · `veri` · `kripto` · `kilit` · `sistem` · `cihaz`.
3. **EN listelerine Türkçe karakter girmez** — o düzende yazılamaz.

Her iki kaynak `cmdPool()` / `bossPool()` içinde birleştirilir (bir kez,
`_havuzlar` içinde saklanır) ve torbaya öyle girer. Düzen dili bankayı seçer:
EN düzendeyken Türkçe karakterli komut gelmez.

### Yeni rozet eklemek
`js/badges.js` → `BADGES_DB`'ye bir nesne ekleyin:

```js
{
  id: "benzersiz_id", title: "Ad", icon: "🎯", unit: "birim",
  desc: "Tooltip metni.",
  mode: "life" | "best",          // ömür boyu toplam mı, tek oyun rekoru mu
  tiers: [5, 10, 25, 50, 100],    // 5 yıldızın eşikleri (STAR_COUNT)
  value: (s, life) => life.birSayac,
}
```
Yeni bir sayaç gerekiyorsa `js/stats.js` → `emptyStats()`'a alanı ekleyin,
`statsEndGame()` içindeki `scalars` listesine katın ve oyun içinde
`trackEvent("alanAdı")` çağırın.

### Yeni ders eklemek
`js/lessons.js` → `LESSONS` dizisine ekleyin. `kind` alanı harf kümesini belirler
(`dayanak`, `satır`, `karışık`, `komut`, `türkçe`, `simge`); `satır` için `row`
ve isteğe bağlı `fingers` verin. Yeni bir `kind` gerekiyorsa `lessonLetterSet()`
içindeki `switch`'e bir dal ekleyin. Ders numaraları kilit sırasını belirler.

### Zorluk ayarlamak
`js/balance.js`. Bir sayıyı tek başına kurcalamadan önce bölüm 7'deki denklemi
gözden geçirin — `speed`, `maxCmds` ve `targetCps` birbirine bağlıdır.

### Yeni mod eklemek
1. `js/main.js`'te bir `isXxx()` yüklemi tanımlayın; baskısızsa `isZamansiz()`'e katın.
2. `generateSentence()` içine satır üretim dalını ekleyin (sıralamaya dikkat).
3. `index.html`'e `.mode-btn[data-mode="xxx"]` düğmesini ekleyin — dinleyici
   otomatik bağlanır.
4. `applyModeUI()` içinde menüyü giydirin, `endGame()` içinde sonuç ekranını.

## 10. Test etme

Otomatik test altyapısı yoktur; doğrulama tarayıcı konsolundan yapılır. Tüm
fonksiyonlar global olduğu için doğrudan çağrılabilirler:

```js
// Ders harf kümeleri düzene göre doğru mu?
currentLayout = "TR-F"; lessonAnchors().join("")     // "uieakmly"
makeLessonLine(3)

// Değerlendirme mantığı
evaluateLesson(1, 40, 80)      // hızlı ama hatalı → geçmemeli

// Rozet ilerlemesi
loadBadges()
```

Dikkat: tarayıcı sekmesi görünür değilse `requestAnimationFrame` kare üretmez,
yani `running` doğru olsa bile oyun döngüsü ilerlemez. Döngüyü elle çevirmek
için `gameLoop(performance.now())` çağırın.

Test ederken `localStorage`'ı kirletmemek için önce
**💾 dışa aktar** ile yedek alın; sonra `resetStats()` / `resetLessons()`
serbestçe kullanılabilir.

### Service worker ve geliştirme

`sw.js` `localhost` / `127.0.0.1` / `[::1]` üzerinde **ağ-öncelikli** çalışır,
yani düzenlenen dosya yenilemede olduğu gibi gelir. Bunun için `fetch`'e
`cache: "no-store"` gerekiyor: yerel sunucu `Cache-Control` göndermediği için
tarayıcı `Last-Modified`'a bakıp sezgisel önbellekleme yapıyor ve düz `fetch`
yine eski dosyayı getiriyordu.

Çevrimdışı davranışı sınamak için sunucuyu durdurup sayfayı yenileyin — ağ
başarısız olunca önbelleğe düşülür. Yayına çıkarken `SURUM` sabitini artırın;
gerçek alan adında dal önbellek-öncelikli olduğu için artırılmazsa kullanıcı
güncellemeyi hiç görmez.

### Depolamasız ortamı sınamak

`index.html`'in bir kopyasını alıp `<head>` sonuna şunu ekleyin:

```html
<script>
Object.defineProperty(window, "localStorage", {
  configurable: true,
  get() { throw new DOMException("blocked", "SecurityError"); }
});
</script>
```

Beklenen: oyun tam çalışır, `SIZMA_DEPOLAMA_KALICI === false` olur ve menüde
uyarı görünür. `js/storage.js` betiğini kaldırırsanız klavye çizilmez ve
`startGame()` `SecurityError` atar — ağın ne işe yaradığını bu fark gösterir.

## 11. Bilerek yapılmayanlar

- **Power-up'lar** — oyuncuyu klavyeden koparıp "ne zaman kullansam" kararına iter.
  Zaten süre = kaynak ve beş düşman tipi var; karmaşıklık bütçesi modlara harcanıyor.
- **Çok oyunculu mod** — backend + eşleştirme + hile önleme; ayrı bir proje.
- ~~**Mobil dokunmatik oynanış**~~ — **karar değişti.** Gerekçe ("10 parmak
  öğreten oyunu dokunmatikte oynatmak amacı boşa çıkarır") hâlâ geçerli
  sayılıyor, ama telefonuyla açan biri ölü bir ekran buluyordu. Ekran klavyesi
  artık giriş aygıtı olabiliyor; mod bir uyarının arkasında, varsayılan değil
  ve öğrenme yolu olarak sunulmuyor.
- **Ayrı bir modülerleştirme fazı** — çalışan 1000+ satırı yeniden yazmak risk;
  bölünme yeni dosyalar üzerinden doğal olarak gerçekleşir.
