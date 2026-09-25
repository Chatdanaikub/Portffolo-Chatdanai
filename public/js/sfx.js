/**
 * sfx.js - Web Audio API Sound Effects Synthesizer
 * Generates subtle, modern UI sound effects without any external audio files.
 */

const SFX = (function () {
  let audioCtx = null;
  let isEnabled = true;

  // Load user preference
  const savedSFX = localStorage.getItem('profolio_sfx');
  if (savedSFX !== null) {
    isEnabled = savedSFX === 'true';
  }

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playClick() {
    if (!isEnabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Ignore audio policy issues
    }
  }

  function playPop() {
    if (!isEnabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Ignore
    }
  }

  function playClose() {
    if (!isEnabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Ignore
    }
  }

  function toggle() {
    isEnabled = !isEnabled;
    localStorage.setItem('profolio_sfx', isEnabled);
    updateUI();
    if (isEnabled) {
      playPop();
    }
    return isEnabled;
  }

  function updateUI() {
    const sfxBtn = document.getElementById('sfxToggleBtn');
    if (!sfxBtn) return;
    const iconOn = sfxBtn.querySelector('.sfx-icon-on');
    const iconOff = sfxBtn.querySelector('.sfx-icon-off');
    if (iconOn && iconOff) {
      if (isEnabled) {
        iconOn.style.display = 'block';
        iconOff.style.display = 'none';
        sfxBtn.title = 'เสียงเอฟเฟกต์: เปิด (คลิกเพื่อปิด)';
      } else {
        iconOn.style.display = 'none';
        iconOff.style.display = 'block';
        sfxBtn.title = 'เสียงเอฟเฟกต์: ปิด (คลิกเพื่อเปิด)';
      }
    }
  }

  // Initialize UI on load
  document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    const btn = document.getElementById('sfxToggleBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        toggle();
      });
    }
  });

  return {
    playClick,
    playPop,
    playClose,
    toggle,
    isEnabled: () => isEnabled
  };
})();
