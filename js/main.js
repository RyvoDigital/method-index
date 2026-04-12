// Method Index — Main JS

// ── BULL SCROLL ANIMATION ──────────────────────────────────────────
// Canvas-based scroll-driven animation using GSAP ScrollTrigger + Lenis.
// 451 WebP frames extracted from 6 transition videos at 10fps.
// Scroll progress (0→1) maps linearly to frame index (0→450).

const FRAME_COUNT = 451;
const FRAMES_PATH = 'assets/bull-frames/';

// Scroll progress thresholds where each service text activates
// Based on video frame boundaries: 80+80+80+80+50+81 = 451 frames
const SERVICE_THRESHOLDS = [
  0,       // Service 1: frames 0-79   (progress 0.000–0.177)
  0.177,   // Service 2: frames 80-159  (progress 0.177–0.355)
  0.355,   // Service 3: frames 160-239 (progress 0.355–0.532)
  0.532,   // Service 4: frames 240-319 (progress 0.532–0.710)
  0.710,   // Service 5: frames 320-369 (progress 0.710–0.821)
           // Exit: frames 370-450 (progress 0.821–1.000)
];
const EXIT_START = 0.821;       // panel begins fading out
const EXIT_PANEL_END = 0.88;    // panel fully gone
const EXIT_CANVAS_START = 0.93; // canvas begins fading out

// DOM references
const scrollContainer = document.querySelector('.services-scroll-container');
const servicesPanel   = document.querySelector('.services-panel');
const serviceItems    = document.querySelectorAll('.service-item');
const bullContainer   = document.querySelector('.bull-container');

// Canvas setup
const canvas = document.createElement('canvas');
canvas.id = 'bull-canvas';
canvas.setAttribute('aria-hidden', 'true');
canvas.style.cssText = 'width: 100%; height: auto; display: block; opacity: 1; transition: opacity 0.8s ease;';
const ctx = canvas.getContext('2d');

// Detect mobile viewport for performance optimization
const isMobile = window.innerWidth <= 768;

// On mobile: cap DPR at 1 and halve canvas backing resolution.
// CSS width:100% handles visual scaling — users can't distinguish
// 640px vs 1280px internal resolution on a phone screen.
const BASE_W = isMobile ? 640 : 1280;
const BASE_H = isMobile ? 357 : 714;
const dpr = isMobile ? 1 : (window.devicePixelRatio || 1);

canvas.width  = BASE_W * dpr;
canvas.height = BASE_H * dpr;
ctx.scale(dpr, dpr);

// Frames storage — indexed 0–450
const frames = new Array(FRAME_COUNT);

// Service text state
let currentServiceIndex = -1;

function getServiceIndex(progress) {
  if (progress >= EXIT_START) return -1; // exit phase
  for (let i = SERVICE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (progress >= SERVICE_THRESHOLDS[i]) return i;
  }
  return 0;
}

function setActiveService(index) {
  if (index === currentServiceIndex) return;
  currentServiceIndex = index;
  serviceItems.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

// Draw a single frame onto the canvas
function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, BASE_W, BASE_H);
  ctx.drawImage(img, 0, 0, BASE_W, BASE_H);
}

// Exit phase: fade panel and canvas
function handleExitPhase(progress) {
  if (progress >= EXIT_START) {
    const panelT = Math.min(1, (progress - EXIT_START) / (EXIT_PANEL_END - EXIT_START));
    servicesPanel.style.opacity = 1 - panelT;
  } else {
    servicesPanel.style.opacity = '';
  }

  if (progress >= EXIT_CANVAS_START) {
    const canvasT = Math.min(1, (progress - EXIT_CANVAS_START) / (1 - EXIT_CANVAS_START));
    canvas.style.opacity = 1 - canvasT;
  } else {
    canvas.style.opacity = '';
  }
}

// Phase 2: load remaining frames in small batches to avoid network saturation
function loadFramesBatch(startIndex, endIndex, batchSize, delayMs) {
  if (startIndex > endIndex) return;
  const batchEnd = Math.min(startIndex + batchSize - 1, endIndex);
  for (let i = startIndex; i <= batchEnd; i++) {
    if (!frames[i]) {
      const img = new Image();
      img.src = FRAMES_PATH + 'frame_' + String(i + 1).padStart(4, '0') + '.webp';
      frames[i] = img;
    }
  }
  if (batchEnd < endIndex) {
    setTimeout(() => {
      loadFramesBatch(batchEnd + 1, endIndex, batchSize, delayMs);
    }, delayMs);
  }
}

// Set up GSAP ScrollTrigger — called after phase 1 is done
function initScrollTrigger() {
  if (!scrollContainer) return;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const frameIndex = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      drawFrame(frameIndex);
      setActiveService(getServiceIndex(p));
      handleExitPhase(p);
    },
  });
}

// Phase 1: load first 15 frames; on completion show canvas and kick off phase 2
function initBullAnimation() {
  if (!bullContainer || !scrollContainer) return;

  bullContainer.appendChild(canvas);

  // Register GSAP plugin and init Lenis
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const PHASE1_COUNT = 15;
  let phase1Loaded = 0;

  function onPhase1Load() {
    phase1Loaded++;
    if (phase1Loaded === PHASE1_COUNT) {
      // Phase 1 complete — draw first frame and start ScrollTrigger
      drawFrame(0);
      setActiveService(0);
      initScrollTrigger();
      // Phase 2: smaller batches on mobile to avoid saturating network
      const batchSize = isMobile ? 6 : 10;
      const batchDelay = isMobile ? 120 : 80;
      loadFramesBatch(PHASE1_COUNT, FRAME_COUNT - 1, batchSize, batchDelay);
    }
  }

  for (let i = 0; i < PHASE1_COUNT; i++) {
    const img = new Image();
    img.onload = onPhase1Load;
    img.onerror = onPhase1Load; // count errors so we don't stall
    img.src = FRAMES_PATH + 'frame_' + String(i + 1).padStart(4, '0') + '.webp';
    frames[i] = img;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBullAnimation);
} else {
  initBullAnimation();
}

// ── NAV SCROLL PROGRESS ─────────────────────────────────────────────
(function () {
  var nav = document.getElementById('nav');
  function updateScrollProgress() {
    var totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = totalScrollable > 0 ? window.scrollY / totalScrollable : 0;
    nav.style.setProperty('--scroll-progress', progress);
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
}());

// ── HERO PARALLAX ───────────────────────────────────────────────────
(function () {
  var heroBgImg = document.querySelector('.hero__bg-img');
  if (!heroBgImg) return;

  function onHeroScroll() {
    var scrollY = window.scrollY;
    var heroHeight = document.getElementById('hero').offsetHeight;
    if (scrollY > heroHeight) return;
    // Move image upward at 35% of scroll speed — subtle and smooth
    heroBgImg.style.transform = 'translateY(' + (scrollY * 0.35) + 'px)';
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true });
}());

// ── PAGE LOAD SEQUENCE ──────────────────────────────────────────────
function runLoadSequence() {
  var delays = [0, 150, 300, 420, 540, 650];
  var elements = document.querySelectorAll('.load-hidden');
  elements.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('loaded');
    }, delays[i] !== undefined ? delays[i] : i * 100);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runLoadSequence);
} else {
  runLoadSequence();
}

// ── SCROLL REVEALS ───────────────────────────────────────────────────
function initScrollReveals() {
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}
initScrollReveals();

// ── FORM HANDLER ────────────────────────────────────────────────────
var contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = contactForm.querySelector('.btn-submit span');
    var originalText = btn.textContent;
    btn.textContent = 'Enquiry Sent';
    contactForm.style.pointerEvents = 'none';
    contactForm.style.opacity = '0.6';
    setTimeout(function () {
      btn.textContent = originalText;
      contactForm.style.pointerEvents = '';
      contactForm.style.opacity = '';
      contactForm.reset();
    }, 3000);
  });
}
