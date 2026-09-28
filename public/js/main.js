/**
 * main.js - Core Application Logic
 * Fetches video portfolio data, handles card previews, 3D tilt, filter tabs,
 * smooth scrolling, mouse glow follower, and contact inquiry form.
 */

let allVideos = [];
let currentFilter = 'all';

// Fallback data in case server endpoint is warming up
const FALLBACK_VIDEOS = [
  {
    id: 1,
    filename: 'รีวิว.mp4',
    streamUrl: '/api/stream/%E0%B8%A3%E0%B8%B5%E0%B8%A7%E0%B8%B4%E0%B8%A7.mp4',
    driveUrl: 'https://drive.google.com/file/d/1Kps7LLMhuo8HMPFna-vwD0UVeR0xcm7e/view?usp=sharing',
    driveId: '1Kps7LLMhuo8HMPFna-vwD0UVeR0xcm7e',
    poster: 'images/sample_Foodmp4.jpg',
    title: 'รีวิวร้านหมูจุ่มอาโม สาขาตลาดไท — Dynamic Food Review',
    category: 'motion',
    categoryLabel: 'รีวิว & ไดนามิกคัต',
    description: 'ผลงานตัดต่อคลิปรีวิวร้านหมูจุ่มอาโม สาขาตลาดไท สไตล์คอนเทนต์รีวิวอาหารยอดนิยม จังหวะตัดต่อกระชับ ฉับไว (Pacing Cut) ซิงก์ดนตรีและซาวด์เอฟเฟกต์ เพื่อเพิ่มความน่ากินและดึงดูดลูกค้า',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'Sound FX', 'Motion Pacing'],
    highlight: 'Viral Food Review',
    badge: 'Trending',
    sizeFormatted: '125.2 MB'
  },
  {
    id: 2,
    filename: 'Arokago.mp4',
    streamUrl: '/api/stream/Arokago.mp4',
    driveUrl: 'https://drive.google.com/file/d/1laOhtOfl7q4sdasFSEMPQ8zyP8cM8-GL/view?usp=sharing',
    driveId: '1laOhtOfl7q4sdasFSEMPQ8zyP8cM8-GL',
    poster: 'images/sample_Arokagomp4.jpg',
    title: 'ArokaGO — Medical & Wellness Tourism Platform',
    category: 'commercial',
    categoryLabel: 'Commercial / แพลตฟอร์ม',
    description: 'ผลงานจัดทำคลิปโปรโมทแพลตฟอร์ม ArokaGO (Medical and Wellness Tourism Platform) จัดวางจังหวะภาพยนตร์ เกรดสีเน้นความน่าเชื่อถือและความสบายตา สอดคล้องกับการท่องเที่ยวเชิงสุขภาพระดับพรีเมียม',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'DaVinci Resolve', 'Commercial Edit'],
    highlight: 'Platform Promo',
    badge: 'Featured',
    sizeFormatted: '266.9 MB'
  },
  {
    id: 3,
    filename: 'coco pop.mp4',
    streamUrl: '/api/stream/coco%20pop.mp4',
    driveUrl: 'https://drive.google.com/file/d/1MNf1PU9cVKe8wDkAt4dxd1PlWB-hNiIc/view?usp=sharing',
    driveId: '1MNf1PU9cVKe8wDkAt4dxd1PlWB-hNiIc',
    poster: 'images/sample_cocopopmp4.jpg',
    title: 'COCO LOVE — Love Yourself Drink For Your Health',
    category: 'commercial',
    categoryLabel: 'Viral Contest / โฆษณา',
    description: 'ผลงานการประกวดคลิปไวรัลสุดสร้างสรรค์ COCO LOVE "Love yourself Drink For your health" คอนเซปต์สดใส ดึงดูดความสนใจตั้งแต่ 3 วินาทีแรก (Hook-first Concept) เพื่อสร้างยอดวิวและการมีส่วนร่วม',
    tools: ['Adobe Premiere Pro', 'After Effects', 'Viral Motion', 'Creative Cut'],
    highlight: 'Viral Contest Entry',
    badge: 'Contest Project',
    sizeFormatted: '64.5 MB'
  },
  {
    id: 4,
    filename: 'Food.mp4',
    streamUrl: '/api/stream/Food.mp4',
    driveUrl: 'https://drive.google.com/file/d/1pFPw8B64CCK_zFRJpwVj_cpo6a57n-4q/view?usp=sharing',
    driveId: '1pFPw8B64CCK_zFRJpwVj_cpo6a57n-4q',
    poster: 'images/sample_Foodmp4.jpg',
    title: 'Food Content & Storytelling — จังหวะภาพ & ซับไตเติลแม่นยำ',
    category: 'subtitle',
    categoryLabel: 'Food Story / ซับไตเติล',
    description: 'ผลงานวิดีโอแนว Food Storytelling เล่าเรื่องอาหารอย่างมีชีวิตชีวา โชว์การวางจังหวะซับไตเติลที่เป๊ะตามเสียงพูด (Timing Precision) ตัดต่อตามจังหวะเสียง ซาวด์ดีไซน์แน่น ชวนให้น่าติดตามตลอดทั้งคลิป',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'Precision Subtitles', 'Sound Design'],
    highlight: 'Precision Timing & Subtitles',
    badge: 'Masterwork',
    sizeFormatted: '1.14 GB'
  },
  {
    id: 5,
    filename: 'มหานาค.mp4',
    streamUrl: '/api/stream/%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%B2%E0%B8%84.mp4',
    driveUrl: 'https://drive.google.com/file/d/1RFvMFCkASRqmIdBM4v5Gt5Lly19QQuGj/view?usp=sharing',
    driveId: '1RFvMFCkASRqmIdBM4v5Gt5Lly19QQuGj',
    poster: 'images/work_mahanak.png',
    title: 'Nitade DPU "มหานาคผ่านเลนส์ จากรอย...สู่เรื่อง" — สารคดีสั้น & ซับไตเติล 2 ภาษา',
    category: 'cinematic',
    categoryLabel: 'สารคดีสั้น / ประกวดนิเทศ DPU',
    description: 'ผลงานโครงการประกวดสร้างสรรค์คลิปวิดีโอ "มหานาคผ่านเลนส์ จากรอย...สู่เรื่อง" โดยคณะนิเทศศาสตร์ มหาวิทยาลัยธุรกิจบัณฑิตย์ (DPU) เล่าเรื่องราววิถีชีวิตและภูมิปัญญาช่างฝีมือชุมชนบ้านบาตร มหานาค โดดเด่นด้วยการเกรดสีภาพยนตร์ (Cinematic Grading), คุมจังหวะภาพที่ลึกซึ้ง (Pacing), บันทึกเสียงบรรยากาศสมจริง และการใส่ซับไตเติล 2 ภาษา (ไทย-อังกฤษ) อย่างแม่นยำประณีต',
    tools: ['Adobe Premiere Pro', 'Adobe After Effects', 'Bilingual Subtitles', 'Cinematic Grading', 'Sound Design'],
    highlight: 'DPU Award Entry • ซับไตเติล 2 ภาษา',
    badge: 'Award Project',
    sizeFormatted: '813.7 MB'
  },
  {
    id: 6,
    filename: 'animation.MP4',
    streamUrl: '/api/stream/animation.MP4',
    driveUrl: 'https://drive.google.com/file/d/17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y/view?usp=sharing',
    driveId: '17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y',
    poster: 'images/sample_animationMP4.jpg',
    title: 'Sweet Treats & Food Truck — 2D Motion Animation (60 FPS)',
    category: 'motion',
    categoryLabel: 'โมชันกราฟิก & แอนิเมชัน',
    description: 'ผลงานสร้างสรรค์โมชันกราฟิกและแอนิเมชันแนวขนมหวานและรถไอศกรีม (Sweet Treats & Food Truck) ออกแบบการเคลื่อนไหวที่นุ่มนวล สนุกสนาน คุมโทนสีพาสเทลสดใส โชว์ทักษะการจัดจังหวะแอนิเมชัน (Easing & Timing Curves), จัดวาง Typography และองค์ประกอบกราฟิกเคลื่อนไหว 60 FPS ลื่นไหลสบายตา',
    tools: ['CapCut Pro', 'Adobe After Effects', 'Motion Graphics 60FPS', 'Vector Animation'],
    highlight: 'Cute Dessert Animation • 60 FPS',
    badge: 'Creative Motion',
    sizeFormatted: '89.5 MB'
  }
];

// Fetch Video Catalog from Backend API
async function loadVideos() {
  const grid = document.getElementById('videoGrid');
  try {
    const res = await fetch('/api/videos');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
      allVideos = data.videos;
    } else {
      allVideos = FALLBACK_VIDEOS;
    }
  } catch (err) {
    console.warn('Using fallback video list due to:', err);
    allVideos = FALLBACK_VIDEOS;
  }

  updateCategoryCounts();
  renderVideoCards(currentFilter);
}

// Update Filter Count Badges
function updateCategoryCounts() {
  const countAll = document.getElementById('countAll');
  const countCinematic = document.getElementById('countCinematic');
  const countCommercial = document.getElementById('countCommercial');
  const countMotion = document.getElementById('countMotion');
  const countSubtitle = document.getElementById('countSubtitle');

  if (countAll) countAll.textContent = allVideos.length;
  if (countCinematic) countCinematic.textContent = allVideos.filter(v => v.category === 'cinematic').length;
  if (countCommercial) countCommercial.textContent = allVideos.filter(v => v.category === 'commercial').length;
  if (countMotion) countMotion.textContent = allVideos.filter(v => v.category === 'motion').length;
  if (countSubtitle) countSubtitle.textContent = allVideos.filter(v => v.category === 'subtitle').length;
}

// Render Video Cards with Hover Preview & 3D Tilt
function renderVideoCards(filterCategory = 'all') {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;

  const filtered = filterCategory === 'all' 
    ? allVideos 
    : allVideos.filter(v => v.category === filterCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="loading-state">
        <p>ไม่พบผลงานในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';

  filtered.forEach((video, index) => {
    const card = document.createElement('div');
    card.className = 'video-card reveal active';
    card.setAttribute('data-id', video.id);
    card.setAttribute('data-category', video.category);
    card.style.animationDelay = `${index * 0.1}s`;

    // Tool pills HTML
    const toolsHtml = (video.tools || [])
      .map(tool => `<span class="tool-badge">${tool}</span>`)
      .join('');

    card.innerHTML = `
      <div class="video-media-box" role="button" tabindex="0" aria-label="เปิดชม ${video.title}">
        <video 
          src="${video.streamUrl}#t=0.5" 
          poster="${video.poster || ''}"
          muted 
          loop 
          playsinline 
          preload="metadata"
          loading="lazy">
        </video>
        
        <div class="card-badges-top">
          <span class="card-pill category-pill">${video.categoryLabel || video.category}</span>
          <span class="card-pill size-pill">${video.sizeFormatted}</span>
        </div>

        <div class="card-play-overlay">
          <div class="play-ring-btn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title">${video.title}</h3>
        <p class="card-desc">${video.description}</p>
        <div class="card-tools">${toolsHtml}</div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm watch-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>รับชมในโรงหนัง</span>
          </button>
          <a href="${video.driveUrl || 'https://drive.google.com/drive/folders/1rJUM3uc0SRMwIr89VknVdLfFYmTWIoGj?usp=sharing'}" target="_blank" rel="noopener" class="card-drive-btn" title="เปิดดูคลิปนี้แบบ Full HD บน Google Drive" style="text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-size:0.78rem; font-weight:600; padding:6px 12px; border-radius:8px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.35); color:#38bdf8;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Drive ↗</span>
          </a>
        </div>
      </div>
    `;

    // Media Box & Button Click -> Open Theater Modal
    const mediaBox = card.querySelector('.video-media-box');
    const previewVideo = card.querySelector('video');
    const watchBtn = card.querySelector('.watch-btn');

    const handleOpen = () => {
      openTheaterModal(video);
      if (typeof SFX !== 'undefined') SFX.playClick();
    };

    mediaBox.addEventListener('click', handleOpen);
    watchBtn.addEventListener('click', handleOpen);

    // Desktop Hover-to-preview
    let playPromise = null;
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768 && previewVideo) {
        playPromise = previewVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay might be restricted
          });
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768 && previewVideo) {
        if (playPromise !== undefined) {
          playPromise.then(() => {
            previewVideo.pause();
            previewVideo.currentTime = 0.5;
          }).catch(() => {
            previewVideo.pause();
          });
        } else {
          previewVideo.pause();
          previewVideo.currentTime = 0.5;
        }
      }
    });

    // 3D Card Tilt on Mouse Move
    setupCard3DTilt(card);

    grid.appendChild(card);
  });
}

// 3D Card Tilt Interaction
function setupCard3DTilt(card) {
  if (window.innerWidth <= 768) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
}

// Mouse Follower Glow
function setupMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  if (!glow || window.innerWidth <= 768) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
    glow.style.opacity = '1';
  });

  window.addEventListener('mouseout', () => {
    glow.style.opacity = '0';
  });
}

// Filter Tabs Handler
function setupFilterTabs() {
  const tabContainer = document.getElementById('filterTabs');
  if (!tabContainer) return;

  const buttons = tabContainer.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderVideoCards(currentFilter);
      if (typeof SFX !== 'undefined') SFX.playClick();
    });
  });
}

// Mobile Menu Drawer Handler
function setupMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.toggle('open');
    drawer.classList.toggle('open', isOpen);
    if (typeof SFX !== 'undefined') SFX.playClick();
  });

  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
}

// Smooth Scroll & Active Nav Link Observer
function setupScrollObserver() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });
}

// Reveal Elements on Scroll
function setupRevealObserver() {
  const reveals = document.querySelectorAll('.workflow-step-card, .skill-card, .about-card, .contact-item, .quick-inquiry-box');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

// Quick Inquiry Form Handler
function handleInquirySubmit() {
  const name = document.getElementById('clientName').value.trim();
  const contact = document.getElementById('clientContact').value.trim();
  const type = document.getElementById('projectType').value;
  const msg = document.getElementById('projectMsg').value.trim();

  if (!name || !contact) {
    alert('กรุณากรอกชื่อและช่องทางติดต่อ');
    return;
  }

  showToast(`ขอบคุณครับคุณ ${name}! ได้รับข้อมูลแล้ว จะติดต่อกลับโดยเร็วที่สุดครับ`);
  if (typeof SFX !== 'undefined') SFX.playPop();

  // Reset form
  const form = document.getElementById('inquiryForm');
  if (form) form.reset();
}

// PDF & Resume Interactive Modal Controller
let currentPdfPage = 1;
let currentPdfModalMode = 'portfolio'; // 'portfolio' (9 pages) or 'resume' (1 page)
const TOTAL_PORTFOLIO_PAGES = 9;

function openPdfFlipbook(pageNumber = 1, mode = 'portfolio') {
  const modal = document.getElementById('pdfFlipbookModal');
  if (modal) {
    currentPdfModalMode = mode;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update active tab styling
    const tabPortfolio = document.getElementById('tabBtnPortfolio');
    const tabResume = document.getElementById('tabBtnResume');
    if (tabPortfolio) tabPortfolio.classList.toggle('active', mode === 'portfolio');
    if (tabResume) tabResume.classList.toggle('active', mode === 'resume');

    // Update download button
    const downloadBtn = document.getElementById('pdfDownloadBtn');
    const downloadText = document.getElementById('pdfDownloadText');
    const openTabBtn = document.getElementById('pdfOpenNewTabBtn');
    const paginationRow = document.getElementById('pdfPaginationRow');
    const prevArrow = document.getElementById('pdfPrevArrow');
    const nextArrow = document.getElementById('pdfNextArrow');

    if (mode === 'portfolio') {
      if (downloadBtn) {
        downloadBtn.href = '/download/portfolio';
        downloadBtn.download = 'Portfolio_Chatdanai_Sattayakun.pdf';
      }
      if (downloadText) downloadText.textContent = 'ดาวน์โหลด Portfolio (8.3MB)';
      if (openTabBtn) openTabBtn.href = 'Portfolio_TH.pdf';
      if (paginationRow) paginationRow.style.display = 'flex';
      if (prevArrow) prevArrow.style.display = 'flex';
      if (nextArrow) nextArrow.style.display = 'flex';
      gotoPdfPage(pageNumber);
    } else {
      // Resume Mode (Single Page)
      currentPdfPage = 1;
      if (downloadBtn) {
        downloadBtn.href = '/download/resume';
        downloadBtn.download = 'Resume_Chatdanai_Sattayakun.pdf';
      }
      if (downloadText) downloadText.textContent = 'ดาวน์โหลด Resume (2.5MB)';
      if (openTabBtn) openTabBtn.href = 'Resume_TH.pdf';
      if (paginationRow) paginationRow.style.display = 'none';
      if (prevArrow) prevArrow.style.display = 'none';
      if (nextArrow) nextArrow.style.display = 'none';

      const display = document.getElementById('pdfPageDisplay');
      const titleSpan = document.getElementById('pdfModalTitle');
      if (display) {
        display.style.opacity = '0.4';
        display.src = 'images/portfolio_pdf/resume_page_1.jpg';
        setTimeout(() => { display.style.opacity = '1'; }, 90);
      }
      if (titleSpan) {
        titleSpan.innerHTML = 'เรซูเม่ (Resume) — ฉัตรดนัย สัตยากูล (เอิร์ท)';
      }
    }

    if (typeof SFX !== 'undefined') SFX.playPop();
  }
}

function switchPdfModalTab(mode) {
  openPdfFlipbook(1, mode);
}

function closePdfFlipbook() {
  const modal = document.getElementById('pdfFlipbookModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (typeof SFX !== 'undefined') SFX.playClose();
  }
}

function gotoPdfPage(pageNum) {
  if (currentPdfModalMode === 'resume') return;

  if (pageNum < 1) pageNum = 1;
  if (pageNum > TOTAL_PORTFOLIO_PAGES) pageNum = TOTAL_PORTFOLIO_PAGES;
  currentPdfPage = pageNum;

  const display = document.getElementById('pdfPageDisplay');
  const titleSpan = document.getElementById('pdfModalTitle');
  if (display) {
    display.style.opacity = '0.4';
    display.src = `images/portfolio_pdf/portfolio_page_${pageNum}.jpg`;
    setTimeout(() => { display.style.opacity = '1'; }, 90);
  }
  if (titleSpan) {
    titleSpan.innerHTML = `แฟ้มสะสมผลงาน — ฉัตรดนัย สัตยากูล (หน้า <span id="pdfCurrentPageNum">${pageNum}</span> / ${TOTAL_PORTFOLIO_PAGES})`;
  }

  // Update thumbnail buttons
  document.querySelectorAll('.pdf-thumb-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', (idx + 1) === pageNum);
  });
}

function flipPdfPage(delta) {
  if (currentPdfModalMode === 'resume') return;
  let target = currentPdfPage + delta;
  if (target < 1) target = TOTAL_PORTFOLIO_PAGES;
  if (target > TOTAL_PORTFOLIO_PAGES) target = 1;
  gotoPdfPage(target);
  if (typeof SFX !== 'undefined') SFX.playClick();
}

function openVideoByFilename(filename) {
  const cleanName = filename.toLowerCase();
  const video = allVideos.find(v => v.filename.toLowerCase() === cleanName) || 
                FALLBACK_VIDEOS.find(v => v.filename.toLowerCase() === cleanName);
  if (video && typeof openTheaterModal === 'function') {
    openTheaterModal(video);
  } else {
    showToast('กำลังเปิดผลงานวิดีโอ...');
    const match = allVideos.find(v => v.filename.toLowerCase().includes(cleanName));
    if (match && typeof openTheaterModal === 'function') {
      openTheaterModal(match);
    }
  }
}

// Backward compatibility
function openResumeDocModal() {
  openPdfFlipbook(1, 'resume');
}

function closeResumeDocModal() {
  closePdfFlipbook();
}

// --------------------------------------------------------------------------
// 3D HUD CAMERA & SCROLL-DRIVEN ORBIT ENGINE (DRIBBLE SPACE SCROLLYTELLING)
// --------------------------------------------------------------------------
let isUserInteractingWithViewer = false;
let userInteractionTimeout = null;

let targetOrbitTheta = 135;
let targetOrbitPhi = 55;
let targetOrbitRadius = 3.3;

let currentOrbitTheta = 135;
let currentOrbitPhi = 55;
let currentOrbitRadius = 3.3;

function initScrollDriven3D() {
  const viewer = document.getElementById('bedroomViewer');
  if (!viewer) return;

  // Listen to user manual touch/drag interaction so we don't fight manual orbiting
  viewer.addEventListener('camera-change', (e) => {
    if (e.detail && e.detail.source === 'user-interaction') {
      isUserInteractingWithViewer = true;
      if (userInteractionTimeout) clearTimeout(userInteractionTimeout);
      userInteractionTimeout = setTimeout(() => {
        isUserInteractingWithViewer = false;
      }, 2400);
    }
  });

  // Window scroll listener for 3D scrollytelling
  window.addEventListener('scroll', onWindowScroll3D, { passive: true });

  // Initial calculation
  onWindowScroll3D();

  // Start 60 FPS buttery smooth lerp animation loop
  requestAnimationFrame(update3DOrbitLoop);
}

function onWindowScroll3D() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return;

  const scrollY = window.scrollY;
  const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);

  // If user is not actively dragging the model, compute target camera trajectory
  if (!isUserInteractingWithViewer) {
    // 360+ degree continuous orbit as user travels through the page
    targetOrbitTheta = 135 + (progress * 480);

    // Subtle dynamic pitch variation (phi between 46deg and 68deg)
    targetOrbitPhi = 55 + Math.sin(progress * Math.PI * 3) * 11;

    // Radius dynamic breathing for cinematic depth
    targetOrbitRadius = 3.3 + Math.cos(progress * Math.PI * 2) * 0.35;
  }

  // Update floating companion HUD telemetry
  updateFloatingCompanion(progress, scrollY);
}

function update3DOrbitLoop() {
  const viewer = document.getElementById('bedroomViewer');
  
  if (viewer && !isUserInteractingWithViewer) {
    // Smooth lerp interpolation factor (0.08 gives a luxurious, responsive glide)
    const lerp = 0.08;
    currentOrbitTheta += (targetOrbitTheta - currentOrbitTheta) * lerp;
    currentOrbitPhi += (targetOrbitPhi - currentOrbitPhi) * lerp;
    currentOrbitRadius += (targetOrbitRadius - currentOrbitRadius) * lerp;

    // Apply to <model-viewer> camera-orbit attribute
    viewer.cameraOrbit = `${currentOrbitTheta.toFixed(1)}deg ${currentOrbitPhi.toFixed(1)}deg ${currentOrbitRadius.toFixed(2)}m`;
  }

  requestAnimationFrame(update3DOrbitLoop);
}

function updateFloatingCompanion(progress, scrollY) {
  const companion = document.getElementById('floating3dCompanion');
  const degEl = document.getElementById('companionDegrees');
  const labelEl = document.getElementById('companionSectionLabel');
  const fillEl = document.getElementById('companionProgressFill');

  if (!companion) return;

  // Show companion when scrolled past hero (e.g. > 350px)
  if (scrollY > 350) {
    companion.classList.add('visible');
  } else {
    companion.classList.remove('visible');
  }

  // Calculate current normalized angle (0 - 360)
  const normDeg = Math.round(targetOrbitTheta % 360);
  if (degEl) degEl.textContent = `${normDeg}°`;

  // Determine current active section label
  const pct = Math.round(progress * 100);
  let secName = 'PORTFOLIO';
  if (progress < 0.12) secName = '01 HERO COVER';
  else if (progress < 0.22) secName = '02 TABLE OF CONTENTS';
  else if (progress < 0.34) secName = '03 PROFILE & ABOUT';
  else if (progress < 0.46) secName = '04 EDUCATION (DPU)';
  else if (progress < 0.60) secName = '05 SELECTED WORK';
  else if (progress < 0.75) secName = '06 UNIVERSITY WORKS';
  else if (progress < 0.88) secName = '07 3D BLENDER PROJECT';
  else secName = '08 ABILITIES & SKILLS';

  if (labelEl) labelEl.textContent = `${secName} · ${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

function toggleFloatingCompanion() {
  const companion = document.getElementById('floating3dCompanion');
  if (companion) {
    companion.classList.toggle('collapsed');
    if (typeof SFX !== 'undefined') SFX.playClick();
  }
}

function resetSection3dCam() {
  const viewer = document.getElementById('section3dViewer');
  if (viewer) {
    viewer.cameraOrbit = '135deg 55deg auto';
    viewer.cameraTarget = 'auto auto auto';
    if (typeof SFX !== 'undefined') SFX.playClick();
  }
}

function switchHeroView(viewType) {
  const modelBox = document.getElementById('heroModelBox');
  const photoBox = document.getElementById('heroPhotoBox');
  const btn3D = document.getElementById('btnView3D');
  const btnPhoto = document.getElementById('btnViewPhoto');
  const toolbar = document.getElementById('hero3dToolbar');
  const stageTitle = document.getElementById('heroStageTitle');
  const guideText = document.getElementById('heroGuideText');

  if (viewType === '3d') {
    if (modelBox) modelBox.style.display = 'block';
    if (photoBox) photoBox.style.display = 'none';
    if (btn3D) btn3D.classList.add('active');
    if (btnPhoto) btnPhoto.classList.remove('active');
    if (toolbar) toolbar.style.display = 'flex';
    if (stageTitle) stageTitle.textContent = 'BLENDER ISOMETRIC BEDROOM 3D';
    if (guideText) {
      guideText.innerHTML = '<span class="guide-dot"></span><span class="guide-text">🛸 <strong>เลื่อนหน้าเว็บลงเพื่อหมุนห้องนอน 3D ตามการเลื่อน</strong> • คลิกซ้ายลากหมุน 360° • คลิกขวาเลื่อนระนาบ • ล้อเมาส์ซูม</span>';
    }
  } else {
    if (modelBox) modelBox.style.display = 'none';
    if (photoBox) photoBox.style.display = 'flex';
    if (btn3D) btn3D.classList.remove('active');
    if (btnPhoto) btnPhoto.classList.add('active');
    if (toolbar) toolbar.style.display = 'none';
    if (stageTitle) stageTitle.textContent = 'FORMAL PORTFOLIO COVER';
    if (guideText) {
      guideText.innerHTML = '<span class="guide-dot"></span><span class="guide-text">ภาพถ่ายทางการจากแฟ้มสะสมผลงานหน้า 01 • สลับชมโมเดล 3D ได้ที่ปุ่มด้านบน</span>';
    }
  }

  if (typeof SFX !== 'undefined') SFX.playPop();
}

function setCameraAngle(preset) {
  const viewer = document.getElementById('bedroomViewer');
  if (!viewer) return;

  const presets = {
    isometric: {
      orbit: '135deg 55deg auto',
      target: 'auto auto auto',
      fov: 'auto'
    },
    workstation: {
      orbit: '110deg 75deg 2.6m',
      target: '-0.4m 0.8m 0.2m',
      fov: '34deg'
    },
    bed: {
      orbit: '215deg 62deg 3.0m',
      target: '0.4m 0.5m -0.2m',
      fov: '36deg'
    },
    topdown: {
      orbit: '180deg 25deg 4.2m',
      target: 'auto auto auto',
      fov: 'auto'
    }
  };

  const targetPreset = presets[preset] || presets.isometric;
  viewer.cameraOrbit = targetPreset.orbit;
  viewer.cameraTarget = targetPreset.target;
  viewer.fieldOfView = targetPreset.fov;

  // Temporarily suspend auto scroll sync so user can inspect preset angle
  isUserInteractingWithViewer = true;
  if (userInteractionTimeout) clearTimeout(userInteractionTimeout);
  userInteractionTimeout = setTimeout(() => {
    isUserInteractingWithViewer = false;
  }, 4000);

  // Update active state on camera buttons
  document.querySelectorAll('.hud-cam-btn').forEach(btn => btn.classList.remove('active'));
  if (preset === 'isometric') document.getElementById('camBtnIso')?.classList.add('active');
  if (preset === 'workstation') document.getElementById('camBtnDesk')?.classList.add('active');
  if (preset === 'bed') document.getElementById('camBtnBed')?.classList.add('active');
  if (preset === 'topdown') document.getElementById('camBtnTop')?.classList.add('active');

  if (typeof SFX !== 'undefined') SFX.playClick();
}

// 3D Model Viewer Controls
function setupModelViewerControls() {
  const viewer = document.getElementById('bedroomViewer');
  const container = document.getElementById('hud3dFrame') || document.getElementById('modelViewerContainer');
  if (!viewer) return;

  const btnAutoRotate = document.getElementById('btnAutoRotate');
  const btnLighting = document.getElementById('btnLighting');
  const lightingModeText = document.getElementById('lightingModeText');
  const btnFullscreen = document.getElementById('btnFullscreen');

  // Toggle Auto Rotate
  if (btnAutoRotate) {
    btnAutoRotate.addEventListener('click', () => {
      viewer.autoRotate = !viewer.autoRotate;
      btnAutoRotate.classList.toggle('active', viewer.autoRotate);
      if (typeof SFX !== 'undefined') SFX.playClick();
    });
  }

  // Lighting Mode Cycle
  const lightingModes = [
    { name: 'แสงสตูดิโอ', exposure: 0.95, shadow: 1.3, env: 'neutral' },
    { name: 'แสงอบอุ่น (Golden)', exposure: 1.1, shadow: 1.5, env: 'legacy' },
    { name: 'แสงกลางคืน (Cyber)', exposure: 0.75, shadow: 2.0, env: 'neutral' }
  ];
  let currentLightIdx = 0;

  if (btnLighting && lightingModeText) {
    btnLighting.addEventListener('click', () => {
      currentLightIdx = (currentLightIdx + 1) % lightingModes.length;
      const mode = lightingModes[currentLightIdx];
      viewer.exposure = mode.exposure;
      viewer.shadowIntensity = mode.shadow;
      viewer.environmentImage = mode.env;
      lightingModeText.textContent = mode.name;
      if (typeof SFX !== 'undefined') SFX.playClick();
    });
  }

  // Fullscreen Mode
  if (btnFullscreen && container) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      if (typeof SFX !== 'undefined') SFX.playPop();
    });
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  setupFilterTabs();
  setupMobileMenu();
  setupMouseGlow();
  setupScrollObserver();
  setupRevealObserver();
  setupModelViewerControls();
  initScrollDriven3D();

  // Keyboard navigation for PDF Flipbook
  document.addEventListener('keydown', (e) => {
    const pdfModal = document.getElementById('pdfFlipbookModal');
    if (pdfModal && pdfModal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        flipPdfPage(-1);
      } else if (e.key === 'ArrowRight') {
        flipPdfPage(1);
      } else if (e.key === 'Escape') {
        closePdfFlipbook();
      }
    }
  });
});


