// === Ses Modülü (Faz 5c) ===
// Web Audio API ile sentetik terminal sesleri — harici dosya gerekmez.
// Global: initAudio(), playKey(), playError(), playComplete(), playDecoy(),
//         playDamage(), playBossStart(), playBossKill(), playTimeLow(),
//         playGameOver(), toggleMute(), isAudioMuted()

const AUDIO_MUTE_KEY = "sizmaMute";
let audioCtx = null;
let muted = false;
let timeLowPlayed = false;   // düşük süre alarmı oturumda bir kez

function isAudioMuted() { return muted; }

function loadMutePref() {
  try { muted = localStorage.getItem(AUDIO_MUTE_KEY) === "1"; }
  catch (e) { muted = false; }
}

function saveMutePref() {
  try { localStorage.setItem(AUDIO_MUTE_KEY, muted ? "1" : "0"); }
  catch (e) {}
}

// Tarayıcı politikası: ilk kullanıcı etkileşiminde AudioContext açılır
function ensureAudio() {
  if (muted) return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Kısa osilatör tınısı
function tone(freq, dur, type, gain, delay) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || "square";
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function playKey() {
  tone(880, 0.04, "square", 0.05);
}

function playError() {
  tone(220, 0.12, "sawtooth", 0.09);
  tone(180, 0.08, "sawtooth", 0.06, 0.06);
}

function playComplete() {
  tone(660, 0.06, "square", 0.06);
  tone(880, 0.08, "square", 0.07, 0.05);
  tone(1100, 0.1, "square", 0.05, 0.1);
}

function playDecoy() {
  tone(150, 0.2, "sawtooth", 0.1);
  tone(120, 0.25, "sawtooth", 0.08, 0.08);
}

function playDamage() {
  tone(300, 0.1, "square", 0.08);
  tone(200, 0.15, "sawtooth", 0.07, 0.05);
}

function playBossStart() {
  tone(110, 0.15, "sawtooth", 0.1);
  tone(165, 0.15, "sawtooth", 0.09, 0.12);
  tone(220, 0.2, "square", 0.08, 0.24);
}

function playBossKill() {
  tone(440, 0.08, "square", 0.07);
  tone(660, 0.08, "square", 0.07, 0.07);
  tone(880, 0.1, "square", 0.06, 0.14);
  tone(1320, 0.15, "square", 0.05, 0.22);
}

function playTimeLow() {
  if (timeLowPlayed) return;
  timeLowPlayed = true;
  tone(520, 0.08, "square", 0.07);
  tone(520, 0.08, "square", 0.07, 0.15);
  tone(520, 0.12, "square", 0.08, 0.3);
}

function playGameOver() {
  tone(330, 0.15, "sawtooth", 0.08);
  tone(260, 0.2, "sawtooth", 0.07, 0.12);
  tone(196, 0.3, "sawtooth", 0.06, 0.28);
}

function resetAudioSession() {
  timeLowPlayed = false;
}

function toggleMute() {
  muted = !muted;
  saveMutePref();
  updateMuteBtn();
  return muted;
}

function updateMuteBtn() {
  const btn = document.getElementById("muteBtn");
  if (btn) {
    btn.textContent = muted ? "🔇" : "🔊";
    btn.title = muted ? "Sesi aç" : "Sesi kapat";
  }
}

function initAudio() {
  loadMutePref();
  updateMuteBtn();
  const btn = document.getElementById("muteBtn");
  if (btn) btn.addEventListener("click", toggleMute);
}
