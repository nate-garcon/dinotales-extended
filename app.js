/* ═══════════════════════════════════════════════════════════
   DINOSAUR TIMES — app.js
   GSAP + ScrollTrigger powered scroll story
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Helpers ──────────────────────────────────────── */
const q = (sel, ctx = document) => ctx.querySelector(sel);
const qa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── PHASE 0: CHAT BUBBLE ENTRANCE ─────────────────── */
function initChat() {
  const msgs = qa('.imsg');

  // Set initial hidden state via GSAP only — no CSS involved
  gsap.set(msgs, { opacity: 0, y: 20, scale: 0.95 });

  // IntersectionObserver fires once when the phone enters view,
  // then disconnects. setTimeout chain sequences each bubble.
  // Zero involvement from ScrollTrigger = zero looping possible.
  let fired = false;
  const observer = new IntersectionObserver((entries) => {
    if (fired) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fired = true;
        observer.disconnect();
        msgs.forEach((msg, i) => {
          setTimeout(() => {
            gsap.to(msg, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
              ease: 'back.out(1.8)',
            });
            // scroll the message body so new messages scroll into view naturally
            const body = q('#imessageBody');
            if (body) body.scrollTop = body.scrollHeight;
          }, 350 + i * 580);
        });
      }
    });
  }, { threshold: 0.4 });

  const phone = q('.imessage-phone');
  if (phone) observer.observe(phone);

  // Portal / smash transition when scrolling out of prologue
  gsap.to('#portalOverlay', {
    opacity: 1,
    duration: 1.2,
    ease: 'power3.in',
    scrollTrigger: {
      trigger: '#prologue',
      start: 'bottom 40%',
      end: 'bottom top',
      scrub: 0.6,
    },
  });

  // Chat window warps out
  gsap.to('.chat-window', {
    scale: 0.6,
    y: -60,
    opacity: 0,
    rotateX: 25,
    filter: 'blur(8px)',
    duration: 1,
    ease: 'power3.in',
    scrollTrigger: {
      trigger: '#prologue',
      start: 'bottom 60%',
      end: 'bottom top',
      scrub: 0.8,
    },
  });
}

/* ── SCENE 1: PREHISTORIC DROP ─────────────────────── */
function initScene1() {
  // Parallax layers
  qa('.parallax-layer').forEach(layer => {
    const speed = parseFloat(layer.dataset.speed || 0);
    gsap.to(layer, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scene1',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Title stamp in
  gsap.from('.stamp-title', {
    opacity: 0,
    scale: 1.4,
    y: 40,
    duration: 1,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '#scene1',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.stamp-sub', {
    opacity: 0,
    y: 20,
    delay: 0.3,
    duration: 0.7,
    scrollTrigger: {
      trigger: '#scene1',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.scene1-text .story-body', {
    opacity: 0,
    y: 30,
    delay: 0.5,
    duration: 0.7,
    scrollTrigger: {
      trigger: '#scene1',
      start: 'top 60%',
      toggleActions: 'play none none none',
    },
  });

  // Silhouette dinos fly / stomp in
  const silTimings = [
    { el: '.sil-mondi', x: -120, delay: 0 },
    { el: '.sil-binko', x: 140,  delay: 0.2 },
    { el: '.sil-ziron', x: -80,  delay: 0.4 },
  ];
  silTimings.forEach(({ el, x, delay }) => {
    gsap.to(el, {
      opacity: 0.55,
      x: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay,
      scrollTrigger: {
        trigger: '#scene1',
        start: 'top 50%',
        toggleActions: 'play none none none',
      },
    });
    gsap.set(el, { x });
  });

  // Ongoing subtle float for silhouettes
  qa('.sil-dino').forEach((el, i) => {
    gsap.to(el, {
      y: -12,
      duration: 2.5 + i * 0.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: i * 0.6,
    });
  });
}

/* ── SCENE NAME: AMAZASAURUS REVEAL ─────────────────── */
function initSceneName() {
  // Populate starfield
  const sf = q('#starfield');
  if (sf) {
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 3 + 1;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%; top:${Math.random()*100}%;
        --dur:${2 + Math.random()*4}s;
        --delay:-${Math.random()*5}s;
      `;
      sf.appendChild(s);
    }
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene-name',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Render dino flies in from right
  tl.to('#namerevealRender', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' });

  // Title stamp explodes in
  tl.to('.name-stamp', { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(0.7, 0.4)' }, '-=0.3');
  tl.to('.name-tagline', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1');
  tl.to('.name-facts',   { opacity: 1, duration: 0.5, ease: 'power2.out' }, '+=0.1');
  tl.to('.namereveal-body', { opacity: 1, y: 0, stagger: 0.2, duration: 0.6, ease: 'power2.out' }, '+=0.1');
}

/* ── SCENE FLIGHT: MORNING LAPS ──────────────────────── */
function initSceneFlight() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene-flight',
      start: 'top 60%',
      toggleActions: 'play none none none',
    },
  });

  // Render dino drops in from above
  tl.to('#renderMainWrap', { opacity: 1, y: 0, duration: 1, ease: 'elastic.out(0.6, 0.5)' });

  // Sketch dino fades in (background, smaller)
  tl.to('#sketchFlyWrap', { opacity: 0.65, x: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');

  // Fact bubble pops in
  tl.to('#flightFact', { opacity: 1, rotation: -3, duration: 0.5, ease: 'back.out(2)' }, '+=0.2');

  // Text lines stagger in
  tl.to('.flight-line', {
    opacity: 1, y: 0, stagger: 0.25, duration: 0.6, ease: 'power2.out',
  }, '+=0.1');
  tl.to('.flight-just-laps', {
    opacity: 1, scale: 1, duration: 0.7, ease: 'elastic.out(0.8, 0.5)',
  }, '-=0.2');
}

/* ── SCENE FRIENDS: THE ASSOCIATES ──────────────────── */
function initSceneFriends() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene-friends',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Header
  tl.to('.friends-header', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });

  // Render dino floats in
  tl.to('#friendsRender', { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');

  // Cards pop in staggered
  qa('.friend-card').forEach((card, i) => {
    tl.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(0.8, 0.5)',
    }, `-=0.${i === 0 ? 2 : 4}`);
    setTimeout(() => card.classList.add('revealed'), 1800 + i * 200);
  });

  tl.to('.friends-footer', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
}

/* ── SCENE 2: APEX PREDATOR ─────────────────────────── */
function initScene2() {
  // Hero dino slams in from above
  gsap.fromTo('.hero-dino-wrap',
    { opacity: 0, y: -150, scale: 0.5, rotation: -15 },
    {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 1.2,
      ease: 'elastic.out(0.8, 0.4)',
      scrollTrigger: {
        trigger: '#scene2',
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    }
  );

  // Show hero PNG (was opacity:0 to prevent FOUC)
  gsap.to('.hero-dino', {
    opacity: 1,
    duration: 0.01,
    scrollTrigger: {
      trigger: '#scene2',
      start: 'top 60%',
      toggleActions: 'play none none none',
    },
  });

  // Label bubble after dino lands
  ScrollTrigger.create({
    trigger: '#scene2',
    start: 'top 55%',
    onEnter: () => {
      setTimeout(() => {
        q('.dino-label-bubble')?.classList.add('visible');
      }, 900);
    },
  });

  // Scene 2 text
  gsap.from('.scene2-text .story-body', {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
      trigger: '#scene2',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Hover tilt effect
  const wrap = q('#heroDinoWrap');
  if (wrap) {
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      gsap.to(wrap, {
        rotateY: dx * 14,
        rotateX: -dy * 10,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
    wrap.addEventListener('mouseleave', () => {
      gsap.to(wrap, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    });
  }
}

/* ── SCENE 3: IMMUNITY ──────────────────────────────── */
function initScene3() {
  // Left side slides in
  gsap.from('.split-left', {
    opacity: 0,
    x: -80,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#scene3',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Right side slides in
  gsap.from('.split-right', {
    opacity: 0,
    x: 80,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#scene3',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Center dino
  gsap.from('.split-dino-center', {
    opacity: 0,
    scale: 0.3,
    duration: 0.7,
    ease: 'back.out(2)',
    delay: 0.3,
    scrollTrigger: {
      trigger: '#scene3',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Poison water glow pulse (CSS handles the ring, extra JS for the text)
  gsap.from('.scene3-text', {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: '#scene3',
      start: 'center 70%',
      toggleActions: 'play none none none',
    },
  });
}

/* ── SCENE 4: GUN PARADOX ───────────────────────────── */
function initScene4() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene4',
      start: 'top 50%',
      toggleActions: 'play none none none',
    },
  });

  // Text appears
  tl.from('.scene4-text-top', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' });

  // Crosshair + bullet slam in
  tl.from('#crosshair', { opacity: 0, scale: 0.1, rotation: 360, duration: 0.9, ease: 'back.out(1.5)' }, '+=0.2');
  tl.from('#bullet',    { opacity: 0, x: -200, duration: 0.6, ease: 'power3.out' }, '-=0.3');

  // Crosshair tracks toward center (scrub-based)
  gsap.to('#crosshair', {
    x: 0,
    scale: 1.3,
    ease: 'none',
    scrollTrigger: {
      trigger: '#scene4',
      start: 'top 30%',
      end: 'center center',
      scrub: 1.2,
    },
  });

  // THE TWIST: gun vanishes as user scrolls further
  const vanishTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene4',
      start: 'center 40%',
      end: 'center top',
      scrub: 0.8,
    },
  });

  vanishTL
    .to('#gunContainer', {
      scale: 0.3,
      opacity: 0,
      filter: 'blur(20px) saturate(0)',
      duration: 1,
      ease: 'power3.in',
    })
    .to('#gunVanish', {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(2)',
    }, '-=0.3')
    .to('#scene4Twist', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.1');

  // Spawn pixel particles on vanish
  ScrollTrigger.create({
    trigger: '#scene4',
    start: 'center 45%',
    onEnter: spawnVanishPixels,
    once: true,
  });
}

function spawnVanishPixels() {
  const container = q('#vanishParticles');
  if (!container) return;
  const colors = ['#ff4444', '#ff8800', '#ffcc00', '#aaa'];
  for (let i = 0; i < 28; i++) {
    const pix = document.createElement('div');
    pix.className = 'pixel';
    pix.style.background = colors[i % colors.length];
    container.appendChild(pix);
    gsap.set(pix, { x: 0, y: 0, opacity: 1 });
    gsap.to(pix, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      opacity: 0,
      scale: Math.random() * 2 + 0.5,
      duration: 0.8 + Math.random() * 0.6,
      ease: 'power2.out',
      delay: Math.random() * 0.3,
    });
  }
}

/* ── SCENE 5: OLD AGE & DISTRACTIONS ───────────────── */
function initScene5() {
  // Old dino drifts in
  gsap.from('.old-dino-wrap', {
    opacity: 0,
    x: 100,
    rotation: 15,
    duration: 1,
    ease: 'elastic.out(0.8, 0.5)',
    scrollTrigger: {
      trigger: '#scene5',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.scene5-text .story-body', {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
      trigger: '#scene5',
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Distraction trigger — click interaction
  const trigger = q('#distractionTrigger');
  const reveal  = q('#distractionReveal');
  const eyes    = q('#followEyes');

  if (trigger) {
    trigger.addEventListener('click', () => {
      reveal?.classList.add('visible');
      eyes?.classList.add('active');
      trigger.style.display = 'none';
    });
  }

  // Also trigger on scroll past
  ScrollTrigger.create({
    trigger: '#scene5',
    start: 'bottom 60%',
    onEnter: () => {
      if (reveal && !reveal.classList.contains('visible')) {
        reveal.classList.add('visible');
        eyes?.classList.add('active');
      }
    },
  });

  // Mouse-following eyes
  document.addEventListener('mousemove', (e) => {
    if (!eyes?.classList.contains('active')) return;
    moveEye(q('#eyeLeft'),  q('#pupilLeft'),  e);
    moveEye(q('#eyeRight'), q('#pupilRight'), e);
  });

  // Touch devices
  document.addEventListener('touchmove', (e) => {
    if (!eyes?.classList.contains('active')) return;
    const t = e.touches[0];
    moveEye(q('#eyeLeft'),  q('#pupilLeft'),  { clientX: t.clientX, clientY: t.clientY });
    moveEye(q('#eyeRight'), q('#pupilRight'), { clientX: t.clientX, clientY: t.clientY });
  }, { passive: true });
}

function moveEye(eye, pupil, pointer) {
  if (!eye || !pupil) return;
  const rect = eye.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = pointer.clientX - cx;
  const dy = pointer.clientY - cy;
  const angle = Math.atan2(dy, dx);
  const maxR = (rect.width / 2) * 0.42;
  const dist = Math.min(Math.hypot(dx, dy), maxR);
  const px = Math.cos(angle) * dist;
  const py = Math.sin(angle) * dist;
  gsap.to(pupil, { x: px, y: py, duration: 0.12, ease: 'power2.out' });
}

/* ── OUTRO: PARACHUTE + CREDITS ─────────────────────── */
function initStoryPage() {
  gsap.to('.story-page-img', {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#story-page',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });

  // Slow parallax drift while scrolling through
  gsap.to('.story-page-img', {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '#story-page',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

function initOutro() {
  // Parachute floats down from top as user scrolls in
  gsap.fromTo('#parachuteDino',
    { y: -120, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: 'elastic.out(0.6, 0.5)',
      scrollTrigger: {
        trigger: '#outro',
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    }
  );

  // Continuous slow float down during scroll
  gsap.to('#parachuteDino', {
    y: 80,
    ease: 'none',
    scrollTrigger: {
      trigger: '#outro',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
    },
  });

  // Credits stagger reveal
  const creditLines = qa('.credit-line, .credit-divider, .finale-emoji');
  creditLines.forEach((line, i) => {
    gsap.to(line, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#outro',
        start: `top ${70 - i * 2}%`,
        toggleActions: 'play none none none',
      },
      delay: i * 0.08,
    });
  });
}

/* ── GLOBAL PARALLAX ON SCROLL ──────────────────────── */
function initGlobalParallax() {
  // Subtle horizontal drift on deep bg based on scroll position
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set('.layer-mountains', { xPercent: p * -6 });
      gsap.set('.layer-trees-back', { xPercent: p * -3 });
    },
  });
}

/* ── SMOOTH MOBILE SCROLL FIX ───────────────────────── */
function fixMobileScroll() {
  // Force GPU composite for key elements
  const gpuEls = qa('.hero-dino, .parachute-svg, .chat-window, .old-dino-svg');
  gpuEls.forEach(el => {
    el.style.willChange = 'transform';
    el.style.backfaceVisibility = 'hidden';
  });

  // iOS Safari rubber-band prevention on fixed overlays
  document.documentElement.style.webkitOverflowScrolling = 'touch';
}

/* ── BOOT ───────────────────────────────────────────── */
function init() {
  fixMobileScroll();
  initChat();
  initScene1();
  initSceneName();
  initScene2();
  initSceneFlight();
  initScene3();
  initScene4();
  initSceneFriends();
  initScene5();
  initStoryPage();
  initOutro();
  initGlobalParallax();

  // Refresh ScrollTrigger after all images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
