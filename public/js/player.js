/**
 * player.js - Cinematic Video Player & Modal Controller
 * Includes full custom HTML5 video controls, HTTP range buffer tracking, PiP & Fullscreen
 */

let activeVideoData = null;

// Format seconds to mm:ss or hh:mm:ss
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = String(m).padStart(2, '0');
  const sStr = String(s).padStart(2, '0');

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

const TheaterPlayer = (function () {
  const modal = document.getElementById('theaterModal');
  const video = document.getElementById('mainVideoPlayer');
  const wrapper = document.getElementById('videoPlayerWrapper');
  const playBtn = document.getElementById('ctrlPlayBtn');
  const playOverlay = document.getElementById('playOverlay');
  const volumeBtn = document.getElementById('ctrlVolumeBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const timelineContainer = document.getElementById('timelineContainer');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineBuffered = document.getElementById('timelineBuffered');
  const timeTooltip = document.getElementById('timeTooltip');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const durationDisplay = document.getElementById('durationDisplay');
  const speedBtn = document.getElementById('ctrlSpeedBtn');
  const speedMenu = document.getElementById('speedMenu');
  const theaterBtn = document.getElementById('ctrlTheaterBtn');
  const pipBtn = document.getElementById('ctrlPipBtn');
  const fullscreenBtn = document.getElementById('ctrlFullscreenBtn');
  const closeBtn = document.getElementById('modalCloseBtn');
  const backdrop = document.getElementById('modalBackdrop');
  const driveIframe = document.getElementById('drivePlayerIframe');
  const btnSourceLocal = document.getElementById('btnSourceLocal');
  const btnSourceDrive = document.getElementById('btnSourceDrive');
  const driveLink = document.getElementById('modalDriveLink');
  const driveLinkText = document.getElementById('modalDriveLinkText');
  const playerControls = document.getElementById('playerControls');

  let isScrubbing = false;
  let currentSourceMode = 'local';

  function setSourceMode(mode) {
    currentSourceMode = mode;
    if (btnSourceLocal) btnSourceLocal.classList.toggle('active', mode === 'local');
    if (btnSourceDrive) btnSourceDrive.classList.toggle('active', mode === 'drive');

    if (mode === 'drive') {
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
      if (playOverlay) playOverlay.style.display = 'none';
      if (playerControls) playerControls.style.display = 'none';

      if (driveIframe && activeVideoData && activeVideoData.driveId) {
        driveIframe.src = `https://drive.google.com/file/d/${activeVideoData.driveId}/preview`;
        driveIframe.style.display = 'block';
      }
      showToast('☁️ กำลังสตรีมมิ่งผ่าน Google Drive Cloud Player');
    } else {
      if (driveIframe) {
        driveIframe.src = '';
        driveIframe.style.display = 'none';
      }
      if (video) {
        video.style.display = 'block';
        video.play().catch(() => {});
      }
      if (playOverlay) playOverlay.style.display = 'flex';
      if (playerControls) playerControls.style.display = 'block';
      showToast('🖥️ สลับเป็นสตรีมมิ่งจาก Local Server');
    }
    if (typeof SFX !== 'undefined') SFX.playClick();
  }

  function togglePlay() {
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(e => console.log('Auto-play blocked:', e));
      updatePlayUI(true);
    } else {
      video.pause();
      updatePlayUI(false);
    }
  }

  function updatePlayUI(isPlaying) {
    if (!playBtn) return;
    const playIcon = playBtn.querySelector('.icon-play');
    const pauseIcon = playBtn.querySelector('.icon-pause');
    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      wrapper.classList.remove('paused');
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      wrapper.classList.add('paused');
    }
  }

  function updateTimeAndProgress() {
    if (!video) return;
    const current = video.currentTime;
    const duration = video.duration || 0;

    if (!isScrubbing && duration > 0) {
      const pct = (current / duration) * 100;
      timelineProgress.style.width = `${pct}%`;
    }

    currentTimeDisplay.textContent = formatTime(current);
    durationDisplay.textContent = formatTime(duration);

    // Update buffered bar
    if (video.buffered.length > 0 && duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferPct = (bufferedEnd / duration) * 100;
      timelineBuffered.style.width = `${bufferPct}%`;
    }
  }

  function handleScrub(e) {
    if (!video || !video.duration) return;
    const rect = timelineContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    timelineProgress.style.width = `${pos * 100}%`;
  }

  function handleTooltip(e) {
    if (!video || !video.duration) return;
    const rect = timelineContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * video.duration;

    timeTooltip.textContent = formatTime(targetTime);
    timeTooltip.style.left = `${pos * 100}%`;
  }

  function setVolume(val) {
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
    updateVolumeUI();
  }

  function updateVolumeUI() {
    if (!video) return;
    const highIcon = volumeBtn.querySelector('.icon-volume-high');
    const muteIcon = volumeBtn.querySelector('.icon-volume-mute');

    volumeSlider.value = video.muted ? 0 : video.volume;

    if (video.muted || video.volume === 0) {
      if (highIcon) highIcon.style.display = 'none';
      if (muteIcon) muteIcon.style.display = 'block';
    } else {
      if (highIcon) highIcon.style.display = 'block';
      if (muteIcon) muteIcon.style.display = 'none';
    }
  }

  function toggleMute() {
    if (!video) return;
    video.muted = !video.muted;
    updateVolumeUI();
    if (typeof SFX !== 'undefined') SFX.playClick();
  }

  function setPlaybackRate(rate) {
    if (!video) return;
    video.playbackRate = rate;
    speedBtn.textContent = `${rate}x`;
    document.querySelectorAll('.speed-opt').forEach(opt => {
      if (parseFloat(opt.getAttribute('data-speed')) === rate) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
    speedMenu.parentElement.classList.remove('open');
    if (typeof SFX !== 'undefined') SFX.playClick();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  async function togglePiP() {
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.log('PiP not supported or failed:', err);
    }
  }

  function toggleTheaterMode() {
    const container = modal.querySelector('.modal-container');
    if (container) {
      container.classList.toggle('theater-wide');
    }
    if (typeof SFX !== 'undefined') SFX.playClick();
  }

  function setupEvents() {
    // Play overlay & button
    playBtn.addEventListener('click', () => {
      togglePlay();
      if (typeof SFX !== 'undefined') SFX.playClick();
    });
    playOverlay.addEventListener('click', togglePlay);

    // Video events
    video.addEventListener('timeupdate', updateTimeAndProgress);
    video.addEventListener('loadedmetadata', updateTimeAndProgress);
    video.addEventListener('play', () => updatePlayUI(true));
    video.addEventListener('pause', () => updatePlayUI(false));
    video.addEventListener('ended', () => updatePlayUI(false));

    // Timeline Scrubbing
    timelineContainer.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      handleScrub(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) handleScrub(e);
    });
    window.addEventListener('mouseup', () => {
      if (isScrubbing) isScrubbing = false;
    });
    timelineContainer.addEventListener('mousemove', handleTooltip);

    // Touch support for scrubbing
    timelineContainer.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      if (e.touches.length > 0) handleScrub(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isScrubbing && e.touches.length > 0) handleScrub(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', () => {
      isScrubbing = false;
    });

    // Volume
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => {
      setVolume(parseFloat(e.target.value));
    });

    // Speed
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.parentElement.classList.toggle('open');
      if (typeof SFX !== 'undefined') SFX.playClick();
    });
    document.querySelectorAll('.speed-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        setPlaybackRate(parseFloat(opt.getAttribute('data-speed')));
      });
    });
    document.addEventListener('click', (e) => {
      if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) {
        speedMenu.parentElement.classList.remove('open');
      }
    });

    // PiP & Fullscreen
    if (pipBtn) pipBtn.addEventListener('click', togglePiP);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (theaterBtn) theaterBtn.addEventListener('click', toggleTheaterMode);

    // Close Modal Events
    closeBtn.addEventListener('click', closeTheaterModal);
    backdrop.addEventListener('click', closeTheaterModal);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;

      // Do not trigger if typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, video.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, video.volume - 0.1));
          break;
        case 'Escape':
          closeTheaterModal();
          break;
      }
    });

    // Copy link button
    const copyBtn = document.getElementById('copyShareLinkBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!activeVideoData) return;
        const shareUrl = `${window.location.origin}/#watch-${activeVideoData.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast(`คัดลอกลิงก์ผลงาน ${activeVideoData.title} แล้ว!`);
          if (typeof SFX !== 'undefined') SFX.playPop();
        });
      });
    }

    // Source Switcher Buttons
    if (btnSourceLocal) btnSourceLocal.addEventListener('click', () => setSourceMode('local'));
    if (btnSourceDrive) btnSourceDrive.addEventListener('click', () => setSourceMode('drive'));

    // Video error fallback to Drive
    if (video) {
      video.addEventListener('error', () => {
        if (activeVideoData && activeVideoData.driveId && currentSourceMode === 'local') {
          console.log('Local stream failed/not found, falling back to Google Drive stream...');
          setSourceMode('drive');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', setupEvents);

  return {
    open: function (videoData) {
      activeVideoData = videoData;
      const modal = document.getElementById('theaterModal');
      const video = document.getElementById('mainVideoPlayer');
      const title = document.getElementById('modalVideoTitle');
      const badge = document.getElementById('modalBadge');
      const desc = document.getElementById('modalDescription');
      const size = document.getElementById('modalFileSize');
      const highlight = document.getElementById('modalHighlightBadge');
      const toolTags = document.getElementById('modalToolTags');

      title.textContent = videoData.title;
      badge.textContent = videoData.badge || 'VIDEO';
      desc.textContent = videoData.description;
      size.textContent = `ขนาด: ${videoData.sizeFormatted}`;
      highlight.textContent = videoData.highlight || 'High Definition';

      // Tool badges
      toolTags.innerHTML = '';
      if (Array.isArray(videoData.tools)) {
        videoData.tools.forEach(tool => {
          const span = document.createElement('span');
          span.className = 'tool-badge';
          span.textContent = tool;
          toolTags.appendChild(span);
        });
      }

      // Update Google Drive Direct Link button
      if (driveLink) {
        driveLink.href = videoData.driveUrl || 'https://drive.google.com/drive/folders/1rJUM3uc0SRMwIr89VknVdLfFYmTWIoGj?usp=sharing';
      }
      if (driveLinkText) {
        driveLinkText.textContent = videoData.driveUrl ? '📁 เปิดดูคลิปนี้บน Google Drive ↗' : '📁 ดูคลังคลิปต้นฉบับบน Google Drive ↗';
      }

      // Initialize source view: start with local or auto-drive
      currentSourceMode = 'local';
      if (btnSourceLocal) btnSourceLocal.classList.add('active');
      if (btnSourceDrive) btnSourceDrive.classList.remove('active');
      if (driveIframe) {
        driveIframe.src = '';
        driveIframe.style.display = 'none';
      }
      if (video) video.style.display = 'block';
      if (playOverlay) playOverlay.style.display = 'flex';
      if (playerControls) playerControls.style.display = 'block';

      // Load Video Source via Express HTTP Range Stream
      video.src = videoData.streamUrl;
      video.load();

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Reset controls
      timelineProgress.style.width = '0%';
      timelineBuffered.style.width = '0%';
      setPlaybackRate(1.0);

      video.play().then(() => {
        updatePlayUI(true);
      }).catch(err => {
        console.log('User interaction required for autoplay:', err);
        updatePlayUI(false);
      });

      if (typeof SFX !== 'undefined') SFX.playPop();
    },
    close: function () {
      if (!modal) return;
      video.pause();
      video.src = '';
      if (driveIframe) {
        driveIframe.src = '';
        driveIframe.style.display = 'none';
      }
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (typeof SFX !== 'undefined') SFX.playClose();
    }
  };
})();

function openTheaterModal(videoData) {
  TheaterPlayer.open(videoData);
}

function closeTheaterModal() {
  TheaterPlayer.close();
}

function showToast(message) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
