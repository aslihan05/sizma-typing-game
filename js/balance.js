// === Denge Sabitleri (Faz 6) ===
// BALANCE: süre ekonomisi, ceza/ödül, boss, düşman zamanlaması
// DIFFICULTIES: zorluk seviyeleri (hız, gürültü, komut tavanı, hedef CPS)

const BALANCE = {
  startTime: 60,

  timeRewardBase: 0.3, // Daha düşük sabit ödül (eskiden 0.6 idi)
  rewardFullChars: 12,
  rewardLongFactor: 0.6,
  maxTimeBonus: 30,
  missedPenalty: 1.5,
  decoyPenalty: 3,
  bombPenalty: 4,
  bombTimer: 8,
  bossInterval: 45,
  bossHp: 5,
  bossTimeBonus: 10,
  bossScoreBonus: 500,
  bossSpeedMult: 1.2,
  bossDecoyRate: 0.18,
  bossCmdBonus: 2,
  bossNoiseMult: 0.5,
  splitThreshold: 0.45,
  weakBias: 0.5,
  decoyDelay: 10,
  splitterDelay: 22,
  mutatingDelay: 34,
  bombDelay: 30,

  // Seri eşikleri. Seri, ekrana İNEN komut sayısıyla sınırlı — ne kadar hızlı
  // yazarsan yaz, dakikada inenden fazlasını tamamlayamazsın. Eski 20 eşiği
  // bu yüzden ulaşılamıyordu: kolayda dakikada 4.2 komut iniyor, yani 20 seri
  // en az ~4 dk 45 sn sürüyordu — 80 saniyelik bir oyunda imkânsız.
  // comboShowStreak, puan çarpanının başladığı yer olan 3'e denk getirildi
  // (çarpan: 1 + floor(seri/3) × 0.5), yani gösterge çarpan devreye girince çıkar.
  comboShowStreak: 3,
  overdriveStreak: 5,

  // Boss komutunun karakter üst sınırı. Oyun testi: "yetişmesi çok zor".
  // Sayı doğruladı — orta seviyede boss satırı ekranda 13.2 sn kalıyor
  // (380 px / (24 × 1.2 hız)), 40 karakteri hedef hızda yazmak 11.4 sn sürüyor.
  // Bunun üstü, satırı okuyup işareti bulmaya vakit bırakmıyor; 53 karakterlik
  // bir komut 15.1 sn sürüyor, yani satır ekranda kalmadan bitiyor.
  // Hem elle yazılmış bankaya hem üretece uygulanır (bkz. bossPool, uretici.js).
  bossMaxLen: 40,

  // Normal komutun karakter üst sınırı. Aynı kural: bir komut, satırın ekranda
  // kaldığı süreden uzun sürede yazılıyorsa yetişilmesi imkânsızdır.
  // Zor seviyede satır ömrü 380/34 = 11.2 sn, hedef hız 5.0 kps → 30 karakter
  // 6 sn sürer, okuma payı 5.2 sn kalır. Elle yazılmış bankanın en uzunu da
  // 29'du; bu sınır o dağılımı koruyor.
  cmdMaxLen: 30,
};

// Süre ödülü formülü: timeRewardBase + (etkinUzunluk / targetCps)
// Sürenin kolayca artmasını engellemek için targetCps (Hedef Harf/Saniye) değerleri artırıldı.
const DIFFICULTIES = {
  kolay: { speed: 13, noiseCount: 2, lineHeight: 34, scoreMult: 1,   noiseOnly: 0.50, startTime: 80, maxCmds: 2, targetCps: 2.2, enemyMult: 3 },
  orta:  { speed: 24, noiseCount: 4, lineHeight: 28, scoreMult: 1.5, noiseOnly: 0.60, startTime: 60, maxCmds: 3, targetCps: 3.5, enemyMult: 1 },
  zor:   { speed: 34, noiseCount: 6, lineHeight: 22, scoreMult: 2,   noiseOnly: 0.62, startTime: 50, maxCmds: 5, targetCps: 5.0, enemyMult: 0.6 },
};

