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
  initScene2();
  initSceneName();
  initSceneFlight();
  initScene3();
  initScene4();
  initSceneFriends();
  initSceneSmug();
  initSceneTarpit();
  initSceneseBinkoQ();
  initSceneZironTarpit();
  initSceneLap23();
  initSceneAlmost();
  initSceneHeStopped();
  initSceneDescent();
  initSceneRescue();
  initSceneCrowd();
  initSceneAnswer();
  initSceneZironValid();
  initSceneLessonBuildup();
  initSceneRealReason();
  initSceneMoral();
  initSceneAfterThat();
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
/* ============================================================
   DINOSAUR TIMES — Extended Cut  |  Scenes 8–11
   dino_a.js
   GSAP 3 + ScrollTrigger (already registered externally)
   ============================================================ */

/* ----------------------------------------------------------
   SCENE 8: scene-smug
   Amazasaurus doing his 23-lap morning show.
   ---------------------------------------------------------- */
function initSceneSmug() {
  const trigger = { trigger: '#scene-smug', start: 'top 65%', toggleActions: 'play none none none' };

  // Clouds drift in
  gsap.from('.ssmug-cloud-1', { x: -80, opacity: 0, duration: 1.4, ease: 'power1.out', scrollTrigger: trigger });
  gsap.from('.ssmug-cloud-2', { x: 80,  opacity: 0, duration: 1.6, ease: 'power1.out', scrollTrigger: trigger });
  gsap.from('.ssmug-cloud-3', { x: -60, opacity: 0, duration: 1.8, delay: 0.2, ease: 'power1.out', scrollTrigger: trigger });

  // Amazasaurus slides in from the right
  gsap.from('.ssmug-amaza-wrap', {
    x: '60vw',
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.3,
    scrollTrigger: trigger
  });

  // Scoreboard slams in from top
  gsap.from('.ssmug-scoreboard', {
    y: -80,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.4)',
    delay: 0.6,
    scrollTrigger: trigger
  });

  // Lap counter counts from 1 to 23 once the scoreboard is visible
  const lapEl = document.querySelector('.ssmug-lap-num');
  if (lapEl) {
    const lapObj = { val: 1 };
    gsap.to(lapObj, {
      val: 23,
      duration: 2.2,
      ease: 'power1.inOut',
      delay: 0.9,
      scrollTrigger: trigger,
      onUpdate: function () {
        lapEl.textContent = Math.round(lapObj.val);
      }
    });
  }

  // Sparkles fade in staggered
  gsap.from('.ssmug-sparkle', {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'back.out(2)',
    delay: 1.0,
    scrollTrigger: trigger
  });

  // Crowd dinos pop in from below
  gsap.from('.ssmug-crowd-dino', {
    y: 40,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.5,
    scrollTrigger: trigger
  });

  // Story text lines stagger up
  gsap.from(['.ssmug-line-1', '.ssmug-line-2', '.ssmug-line-3', '.ssmug-line-4'], {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.22,
    ease: 'power2.out',
    delay: 1.4,
    scrollTrigger: trigger
  });

  // Ground line draws in
  gsap.from('.ssmug-ground', {
    scaleX: 0,
    transformOrigin: 'left center',
    duration: 1.2,
    ease: 'power2.out',
    delay: 0.2,
    scrollTrigger: trigger
  });
}

/* ----------------------------------------------------------
   SCENE 9: scene-tarpit
   Mondi is stuck. Very stuck.
   ---------------------------------------------------------- */
function initSceneTarpit() {
  const trigger = { trigger: '#scene-tarpit', start: 'top 65%', toggleActions: 'play none none none' };

  // Story text slides in from left
  gsap.from(['.starpit-line-1', '.starpit-line-2', '.starpit-line-3', '.starpit-line-4', '.starpit-line-5'], {
    x: -60,
    opacity: 0,
    duration: 0.75,
    stagger: 0.18,
    ease: 'power2.out',
    scrollTrigger: trigger
  });

  // Tar pit fades in with a slight scale from below
  gsap.from('.starpit-pit-wrap', {
    opacity: 0,
    scaleY: 0.6,
    transformOrigin: 'center bottom',
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.3,
    scrollTrigger: trigger
  });

  // Mondi sinks into frame from above
  gsap.from('.starpit-mondi-wrap', {
    y: -50,
    opacity: 0,
    duration: 1.0,
    ease: 'power2.out',
    delay: 0.7,
    scrollTrigger: trigger
  });

  // Mondi speech bubble pops in
  gsap.from('.starpit-mondi-bubble', {
    opacity: 0,
    scale: 0.5,
    transformOrigin: 'bottom left',
    duration: 0.5,
    ease: 'back.out(2)',
    delay: 1.2,
    scrollTrigger: trigger
  });

  // Caption fades up
  gsap.from('.starpit-caption', {
    opacity: 0,
    y: 10,
    duration: 0.6,
    delay: 1.5,
    ease: 'power1.out',
    scrollTrigger: trigger
  });

  // Haze atmosphere fades in
  gsap.from('.starpit-haze', {
    opacity: 0,
    duration: 1.8,
    ease: 'power1.inOut',
    scrollTrigger: trigger
  });
}

/* ----------------------------------------------------------
   SCENE 10: scene-binko-q
   Binko arrives with 47 questions. Mondi sinks deeper.
   ---------------------------------------------------------- */
function initSceneseBinkoQ() {
  const trigger = { trigger: '#scene-binko-q', start: 'top 65%', toggleActions: 'play none none none' };

  // Story text top
  gsap.from('.sbinkoq-line-1', {
    opacity: 0, y: -30,
    duration: 0.7, ease: 'power2.out',
    scrollTrigger: trigger
  });
  gsap.from('.sbinkoq-line-2', {
    opacity: 0, y: -20,
    duration: 0.7, delay: 0.25, ease: 'power2.out',
    scrollTrigger: trigger
  });

  // Binko swoops in from upper-right
  gsap.from('.sbinkoq-binko-wrap', {
    x: '40vw',
    y: '-20vh',
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out',
    delay: 0.3,
    scrollTrigger: trigger
  });

  // Mondi slides in lower (already submerged state)
  gsap.from('.sbinkoq-mondi-wrap', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: 'power2.out',
    delay: 0.5,
    scrollTrigger: trigger
  });

  // Mondi sinks visually a little more on scroll (parallax sink)
  gsap.to('.sbinkoq-mondi-wrap', {
    y: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '#scene-binko-q',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Tar pit
  gsap.from('.sbinkoq-pit-wrap', {
    opacity: 0,
    scaleY: 0.65,
    transformOrigin: 'center bottom',
    duration: 1.1,
    ease: 'power2.out',
    delay: 0.2,
    scrollTrigger: trigger
  });

  // Questions pop in one by one (staggered 0.4s)
  const questions = document.querySelectorAll('.sbinkoq-question');
  questions.forEach(function (q, i) {
    gsap.to(q, {
      opacity: 1,
      x: 0,
      rotation: 0,
      duration: 0.55,
      ease: 'back.out(1.5)',
      delay: 0.9 + i * 0.4,
      scrollTrigger: trigger
    });
  });

  // Sink indicator pops in after questions
  gsap.from('.sbinkoq-sink-indicator', {
    opacity: 0,
    y: -10,
    duration: 0.5,
    delay: 3.1,
    ease: 'power1.out',
    scrollTrigger: trigger
  });

  // "Mondi sank a little deeper" — fades in after last question
  gsap.to('.sbinkoq-sink-text', {
    opacity: 1,
    duration: 0.6,
    delay: 3.5,
    ease: 'power1.out',
    scrollTrigger: trigger
  });
  gsap.to('.sbinkoq-well-text', {
    opacity: 1,
    duration: 0.5,
    delay: 3.9,
    ease: 'power1.out',
    scrollTrigger: trigger
  });
}

/* ----------------------------------------------------------
   SCENE 11: scene-ziron-tarpit
   Ziron observes. Accurately.
   ---------------------------------------------------------- */
function initSceneZironTarpit() {
  const trigger = { trigger: '#scene-ziron-tarpit', start: 'top 65%', toggleActions: 'play none none none' };

  // Warm glow bleeds in from Ziron's side
  gsap.from('.sziron-warm-glow', {
    opacity: 0,
    duration: 2.0,
    ease: 'power1.inOut',
    scrollTrigger: trigger
  });

  // Ziron walks in from the right
  gsap.from('.sziron-ziron-wrap', {
    x: '35vw',
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.2,
    scrollTrigger: trigger
  });

  // Story text left, staggered
  gsap.from([
    '.sziron-line-1', '.sziron-line-2', '.sziron-line-3',
    '.sziron-line-4', '.sziron-line-5', '.sziron-line-6', '.sziron-line-7'
  ], {
    opacity: 0,
    x: -40,
    duration: 0.65,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 0.5,
    scrollTrigger: trigger
  });

  // Ziron's speech bubble pops in after he "arrives"
  gsap.to('.sziron-speech-bubble', {
    opacity: 1,
    scale: 1,
    duration: 0.55,
    ease: 'back.out(1.8)',
    delay: 1.3,
    scrollTrigger: trigger
  });
  gsap.from('.sziron-speech-bubble', {
    scale: 0.4,
    transformOrigin: 'bottom right',
    duration: 0.55,
    ease: 'back.out(1.8)',
    delay: 1.3,
    scrollTrigger: trigger
  });

  // Tar pit fades in
  gsap.from('.sziron-pit-wrap', {
    opacity: 0,
    scaleY: 0.55,
    transformOrigin: 'center bottom',
    duration: 1.2,
    ease: 'power2.out',
    delay: 0.1,
    scrollTrigger: trigger
  });

  // Mondi barely visible — fades in low
  gsap.from('.sziron-mondi-wrap', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.8,
    scrollTrigger: trigger
  });

  // Mondi's "...yes." reply fades in after Ziron speaks
  gsap.to('.sziron-mondi-reply', {
    opacity: 1,
    duration: 0.5,
    ease: 'power1.out',
    delay: 2.0,
    scrollTrigger: trigger
  });
  gsap.from('.sziron-mondi-reply', {
    y: 8,
    duration: 0.5,
    ease: 'power1.out',
    delay: 2.0,
    scrollTrigger: trigger
  });

  // Narrator thought bubble appears last, drifts in from upper-right
  gsap.to('.sziron-narrator-bubble', {
    opacity: 1,
    duration: 0.7,
    ease: 'power1.out',
    delay: 2.8,
    scrollTrigger: trigger
  });
  gsap.from('.sziron-narrator-bubble', {
    x: 30,
    y: -15,
    duration: 0.7,
    ease: 'power2.out',
    delay: 2.8,
    scrollTrigger: trigger
  });

  // Ziron nods: the CSS animation handles the loop,
  // but we add a brief "deliberate single nod" on arrival via GSAP
  const headGroup = document.querySelector('.sziron-head-group');
  if (headGroup) {
    // Pause CSS animation briefly so the GSAP arrival nod reads clearly
    gsap.to(headGroup, {
      rotate: -6,
      transformOrigin: '100px 160px',
      duration: 0.35,
      ease: 'power1.out',
      delay: 1.6,
      scrollTrigger: trigger,
      onComplete: function () {
        gsap.to(headGroup, {
          rotate: 0,
          duration: 0.4,
          ease: 'power1.inOut'
        });
      }
    });
  }
}

// INIT_ORDER: initSceneSmug, initSceneTarpit, initSceneseBinkoQ, initSceneZironTarpit
/* ============================================================
   DINOSAUR TIMES — Extended Cut | Scenes 12–16 | dino_b.js
   Requires: GSAP 3.x + ScrollTrigger plugin
   ============================================================ */

/* ---- SCENE 12: initSceneLap23 ---- */
function initSceneLap23() {
  const scene = '#scene-lap23';

  // Draw the sight-line from top to bottom (SVG stroke-dashoffset trick)
  const sightlinePath = document.querySelector('.sightline-dash');
  if (sightlinePath) {
    const totalLength = 600; // matches SVG viewBox height
    gsap.set(sightlinePath, { strokeDasharray: '12 8', strokeDashoffset: totalLength });
    gsap.to(sightlinePath, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: scene,
        start: 'top 65%',
        toggleActions: 'play none none none',
      },
    });
  }

  // Amazasaurus slides down from above
  gsap.from('.slap23-dino-wrap', {
    opacity: 0,
    y: -80,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // LAP 23 badge pops in after dino
  gsap.from('.slap23-lap-badge', {
    opacity: 0,
    scale: 0.5,
    duration: 0.6,
    ease: 'back.out(1.8)',
    delay: 0.6,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Sticky note slides in from left
  gsap.from('.slap23-thought-note', {
    opacity: 0,
    x: -40,
    duration: 0.7,
    ease: 'power2.out',
    delay: 0.9,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Mondi rises from below
  gsap.from('.slap23-mondi-head', {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.3,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Story text lines stagger in
  gsap.from(
    ['.slap23-line1', '.slap23-line2', '.slap23-line3', '.slap23-line4', '.slap23-line5'],
    {
      opacity: 0,
      x: -30,
      duration: 0.65,
      ease: 'power2.out',
      stagger: 0.28,
      delay: 0.5,
      scrollTrigger: {
        trigger: scene,
        start: 'top 65%',
        toggleActions: 'play none none none',
      },
    }
  );
}

/* ---- SCENE 13: initSceneAlmost ---- */
function initSceneAlmost() {
  const scene = '#scene-almost';

  // Dino fades in — held frozen, no movement
  gsap.from('.salmost-dino-wrap', {
    opacity: 0,
    scale: 0.88,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Thought bubble appears slightly after dino
  gsap.from('.salmost-thought-bubble', {
    opacity: 0,
    scale: 0.4,
    x: 20,
    duration: 0.7,
    ease: 'back.out(2)',
    delay: 0.7,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Still leaves drift in (subtle, since they are "still")
  gsap.from('.salmost-leaves', {
    opacity: 0,
    duration: 1.5,
    ease: 'power1.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Tiny dino emojis at bottom fade in
  gsap.from('.salmost-emoji', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 1.0,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // ---- Word-by-word headline: "He ... almost ... kept going." ----
  // Each span gets a long stagger so there's a real dramatic pause between words
  const words = ['.w-he', '.salmost-ellipsis:nth-of-type(1)', '.w-almost', '.salmost-ellipsis:nth-of-type(2)', '.w-kept', '.w-going'];

  // Set all invisible first
  gsap.set(['.w-he', '.w-almost', '.w-kept', '.w-going', '.salmost-ellipsis'], { opacity: 0 });

  // Stagger each element with a generous gap — the "pause" is the effect
  const wordTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
    delay: 0.6,
  });

  wordTimeline
    .to('.w-he', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .to('.salmost-headline .salmost-ellipsis:first-of-type', { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0.8)
    .to('.w-almost', { opacity: 1, duration: 0.45, ease: 'power2.out' }, 1.5)
    .to('.salmost-headline .salmost-ellipsis:last-of-type', { opacity: 1, duration: 0.35, ease: 'power1.out' }, 2.3)
    .to('.w-kept', { opacity: 1, duration: 0.45, ease: 'power2.out' }, 3.0)
    .to('.w-going', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 3.55);

  // Sub-text fades in after headline completes
  gsap.from('.salmost-sub1', {
    opacity: 0,
    y: 16,
    duration: 0.7,
    ease: 'power2.out',
    delay: 5.2,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.salmost-sub2', {
    opacity: 0,
    y: 16,
    duration: 0.7,
    ease: 'power2.out',
    delay: 5.9,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.salmost-aside', {
    opacity: 0,
    y: 10,
    duration: 0.6,
    ease: 'power1.out',
    delay: 6.7,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });
}

/* ---- SCENE 14: initSceneHeStopped ---- */
function initSceneHeStopped() {
  const scene = '#scene-he-stopped';

  // Light rays fade in first (ambient atmosphere)
  gsap.from('.sstopped-rays-wrap', {
    opacity: 0,
    duration: 1.8,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Amazasaurus appears in upper portion
  gsap.from('.sstopped-dino-wrap', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: 'power2.out',
    delay: 0.3,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // HERO TEXT: SLAMS in — elastic, high impact
  gsap.from('.sstopped-hero-text', {
    scale: 0.25,
    opacity: 0,
    duration: 1.0,
    ease: 'elastic.out(1, 0.45)',
    delay: 0.55,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Silhouette dinos rise from the bottom
  gsap.from('.sstopped-silhouettes', {
    opacity: 0,
    y: 50,
    duration: 0.9,
    ease: 'power3.out',
    delay: 1.3,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Caption text fades up after silhouettes
  gsap.from('.sstopped-caption', {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: 'power2.out',
    delay: 1.9,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.sstopped-aside', {
    opacity: 0,
    y: 14,
    duration: 0.6,
    ease: 'power1.out',
    delay: 2.5,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });
}

/* ---- SCENE 15: initSceneDescent ---- */
function initSceneDescent() {
  const scene = '#scene-descent';

  // Text lines cascade in from left — staggered for narrative impact
  const textLines = [
    '.sdescent-line1',
    '.sdescent-line2',
    '.sdescent-line3',
    '.sdescent-line4',
    '.sdescent-line5',
    '.sdescent-line6',
  ];

  gsap.from(textLines, {
    opacity: 0,
    x: -45,
    duration: 0.65,
    ease: 'power2.out',
    stagger: 0.32,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Amazasaurus dives in from upper-right, tilted
  gsap.from('.sdescent-dino-wrap', {
    opacity: 0,
    x: 120,
    y: -60,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.4,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Speed lines zip in rapidly
  gsap.from('.sdescent-speedlines', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.9,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Down arrow bounces in
  gsap.from('.sdescent-arrow', {
    opacity: 0,
    scale: 0.3,
    duration: 0.7,
    ease: 'back.out(2.2)',
    delay: 1.4,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // Tar pit rises from below
  gsap.from('.sdescent-ground', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });
}

/* ---- SCENE 16: initSceneRescue ---- */
function initSceneRescue() {
  const scene = '#scene-rescue';

  // Create a master timeline for sequenced, triumphant entry
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      toggleActions: 'play none none none',
    },
  });

  // 1. HERO TEXT drops in first — elastic bounce from top
  tl.from('.srescue-hero-text', {
    y: -200,
    opacity: 0,
    scale: 0.6,
    duration: 1.1,
    ease: 'elastic.out(1, 0.5)',
  }, 0);

  // 2. Amazasaurus swoops in from top
  tl.from('.srescue-dino-wrap', {
    opacity: 0,
    y: -100,
    x: 80,
    duration: 0.9,
    ease: 'power3.out',
  }, 0.35);

  // 3. Mondi lifts upward from below — the rescue!
  tl.from('.srescue-mondi-wrap', {
    opacity: 0,
    y: 200,
    duration: 1.0,
    ease: 'power2.out',
  }, 0.7);

  // 4. Confetti and sparkles scatter
  tl.from('.srescue-confetti', {
    opacity: 0,
    duration: 0.4,
    ease: 'power1.out',
  }, 1.0);

  tl.from('.sparkle', {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: 'back.out(2)',
    stagger: 0.08,
  }, 1.1);

  // 5. Captions fade in last, in order
  tl.from('.srescue-cap1', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out',
  }, 1.8);

  tl.from('.srescue-cap2', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out',
  }, 2.2);

  tl.from('.srescue-aside', {
    opacity: 0,
    y: 12,
    duration: 0.5,
    ease: 'power1.out',
  }, 2.7);
}

// INIT_ORDER: initSceneLap23, initSceneAlmost, initSceneHeStopped, initSceneDescent, initSceneRescue
/* ============================================================
   DINOSAUR TIMES — Extended Cut | Scenes 17–23
   dino_c.js
   INIT_ORDER: initSceneCrowd, initSceneAnswer, initSceneZironValid,
               initSceneLessonBuildup, initSceneRealReason,
               initSceneMoral, initSceneAfterThat
   ============================================================ */

/* ── Shared scroll trigger config helper ─────────────────── */
function st(trigger, extraOptions) {
  return Object.assign(
    {
      scrollTrigger: {
        trigger: trigger,
        start: 'top 65%',
        toggleActions: 'play none none none',
      },
    },
    extraOptions || {}
  );
}

/* ============================================================
   SCENE 17 — scene-crowd
   ============================================================ */
function initSceneCrowd() {
  const tl = gsap.timeline(
    st('#scene-crowd', {
      defaults: { ease: 'back.out(1.7)', duration: 0.6 },
    })
  );

  // Background bubble dinos stagger in (faint)
  tl.from('.sil-dino', { y: 30, opacity: 0, stagger: 0.08, ease: 'power2.out' }, 0);

  // Characters pop in with elastic bounce — staggered
  tl.to('.char-mondi-crowd',  { opacity: 1, x: 0, ease: 'back.out(2)', duration: 0.7 }, 0.1);
  tl.to('.char-amaza-crowd',  { opacity: 1, ease: 'back.out(2)', duration: 0.7 }, 0.25);
  tl.to('.char-binko-crowd',  { opacity: 1, ease: 'back.out(2.5)', duration: 0.6 }, 0.4);
  tl.to('.char-ziron-crowd',  { opacity: 1, ease: 'back.out(2)', duration: 0.7 }, 0.55);

  // Background speech bubbles stagger in
  tl.to('.bb-1', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.7);
  tl.to('.bb-2', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.0);
  tl.to('.bb-3', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.3);

  // Binko's "But WHY?" bubble
  tl.to('.binko-crowd-bubble', {
    opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.5)',
  }, 1.6);

  // Story text fades up in sequence
  const textEls = [
    '.scrowd-t1', '.scrowd-t2', '.scrowd-t3',
    '.scrowd-t4', '.scrowd-t5', '.scrowd-t6',
  ];
  textEls.forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.9 + i * 0.22);
  });

  // Initial states for off-screen elements
  gsap.set('.bg-bubble', { y: -10 });
  gsap.set('.binko-crowd-bubble', { scale: 0.3 });
  gsap.set('.scrowd-text .story-body, .scrowd-text .story-big-italic', { y: 14 });
}

/* ============================================================
   SCENE 18 — scene-answer
   ============================================================ */
function initSceneAnswer() {
  // Build stars dynamically
  const starsContainer = document.getElementById('answerStars');
  if (starsContainer && starsContainer.children.length === 0) {
    const count = 36;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'star-dot';
      const size = 1.5 + Math.random() * 3;
      dot.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `top:${Math.random() * 100}%`,
        `left:${Math.random() * 100}%`,
        `--tw-dur:${2 + Math.random() * 3}s`,
        `--tw-delay:${Math.random() * 4}s`,
      ].join(';');
      starsContainer.appendChild(dot);
    }
  }

  const tl = gsap.timeline(st('#scene-answer'));

  // Amazasaurus fades in gently
  tl.to('.sanswer-amaza-wrap', {
    opacity: 1, duration: 1.5, ease: 'power2.inOut',
  }, 0);

  // Thought bubble appears — shows "..."
  tl.from('.sanswer-thought-bubble', {
    scale: 0.4, opacity: 0, duration: 0.7, ease: 'back.out(2)',
  }, 1.0);

  // After a pause, dots fade and answer appears in thought bubble
  tl.to('.thought-dots', { opacity: 0, duration: 0.4, ease: 'power2.in' }, 2.2);
  tl.to('.thought-answer', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 2.7);

  // Answer lines appear below, staggered with 0.8s between
  tl.to('.al-big-1', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  }, 2.8);
  tl.to('.al-big-2', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  }, 3.6);
  tl.to('.al-big-3', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  }, 4.4);

  // Small epilogue text — slower and last
  tl.to('.sanswer-t1', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 5.4);
  tl.to('.sanswer-t2', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 5.9);
  tl.to('.sanswer-t3', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 6.4);
  tl.to('.sanswer-t4', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 6.9);

  // Initial states
  gsap.set(['.al-big-1', '.al-big-2', '.al-big-3'], { y: 18 });
  gsap.set('.sanswer-text .story-body', { y: 12 });
}

/* ============================================================
   SCENE 19 — scene-ziron-valid
   ============================================================ */
function initSceneZironValid() {
  const tl = gsap.timeline(st('#scene-ziron-valid'));

  // Story text lines first — fade up in sequence
  tl.to('.sziron-t1', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0);
  tl.to('.sziron-t2', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.5);

  // Ziron character walks in from right
  tl.to('.sziron-char-wrap', {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, 0.3);

  // "Valid." SLAMS in
  tl.to('.ziron-valid-bubble', {
    opacity: 1,
    scale: 1,
    duration: 0.55,
    ease: 'back.out(3)',
  }, 1.0);

  // "Thanks" text
  tl.to('.sziron-t3', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.7);

  // "You're welcome" bubble
  tl.to('.sziron-thanks', {
    opacity: 1,
    y: 0,
    duration: 0.45,
    ease: 'back.out(1.8)',
  }, 2.1);

  // Narrator lines
  tl.to('.sziron-t4', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.7);
  tl.to('.sziron-t5', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.2);

  // Initial states
  gsap.set('.sziron-text .story-body', { y: 12 });
  gsap.set('.sziron-thanks', { y: -8 });
}

/* ============================================================
   SCENE 20 — scene-lesson-buildup
   ============================================================ */
function initSceneLessonBuildup() {
  const tl = gsap.timeline(st('#scene-lesson-buildup'));

  // Opening text
  tl.to('.slessonb-t1', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0);
  tl.to('.slessonb-t2', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.5);

  // Power cards appear elastically, 3 at a time then the next 3
  const cards = ['.pc-1', '.pc-2', '.pc-3', '.pc-4', '.pc-5', '.pc-6'];
  cards.forEach((sel, i) => {
    tl.to(sel, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(2)',
    }, 0.6 + i * 0.14);
  });

  tl.to('.slessonb-t3', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 1.6);

  // All cards slide off screen left with a dramatic swoosh
  tl.to(cards, {
    x: '-130vw',
    opacity: 0,
    duration: 0.55,
    ease: 'power3.in',
    stagger: 0.04,
  }, 2.3);

  // "BUT—" appears and grows
  tl.to('.slessonb-but', {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: 'back.out(1.4)',
  }, 2.7);

  // The "But—" text in the story text
  tl.to('.slessonb-t4', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.7);

  // "None of that..."
  tl.to('.slessonb-t5', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 3.3);

  // "BUT—" fades out gracefully as text stays
  tl.to('.slessonb-but', {
    opacity: 0,
    scale: 1.15,
    duration: 0.6,
    ease: 'power2.inOut',
  }, 3.5);

  // Initial states
  gsap.set('.slessonb-text .story-body', { y: 14 });
  gsap.set('.slessonb-but', { scale: 0.6 });
}

/* ============================================================
   SCENE 21 — scene-real-reason
   ============================================================ */
function initSceneRealReason() {
  // Lines reveal left-to-right using clip-path
  const lines = [
    '.sreason-l1',
    '.sreason-l2',
    '.sreason-l3',
    '.sreason-l4',
    '.sreason-l6',
    '.sreason-l7',
  ];

  // We use a custom ScrollTrigger so we can sequence more carefully
  ScrollTrigger.create({
    trigger: '#scene-real-reason',
    start: 'top 65%',
    toggleActions: 'play none none none',
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      lines.forEach((sel, i) => {
        // Each line "writes in" from left: clip-path reveal
        tl.fromTo(
          sel,
          { 'clip-path': 'inset(0 100% 0 0)' },
          {
            'clip-path': 'inset(0 0% 0 0)',
            duration: 0.7 + (sel === '.sreason-l4' ? 0.4 : 0),
            ease: 'power1.inOut',
          },
          i * 0.9
        );
      });

      // michael-dino doodle fades in at the end
      tl.to('.sreason-doodle-wrap', {
        opacity: 1,
        rotation: 4,
        duration: 0.8,
        ease: 'power2.out',
      }, lines.length * 0.9 + 0.3);
    },
  });
}

/* ============================================================
   SCENE 22 — scene-moral
   ============================================================ */
function initSceneMoral() {
  // Build firefly particles
  const container = document.getElementById('moralFireflies');
  if (container && container.children.length === 0) {
    const fireflies = 18;
    for (let i = 0; i < fireflies; i++) {
      const ff = document.createElement('div');
      ff.className = 'firefly';
      const size    = 3 + Math.random() * 3.5;
      const isAmber = Math.random() > 0.35;
      const color   = isAmber
        ? `rgba(255,${160 + Math.floor(Math.random() * 60)},20,0.9)`
        : `rgba(60,${180 + Math.floor(Math.random() * 60)},180,0.85)`;
      const dur     = 4.5 + Math.random() * 5;
      const delay   = -(Math.random() * dur); // negative to offset so they start mid-loop
      const drift   = (Math.random() - 0.5) * 80;

      ff.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `background:${color}`,
        `left:${Math.random() * 100}%`,
        `bottom:${Math.random() * 30}%`,
        `box-shadow:0 0 ${size * 2.5}px ${color}`,
        `--ff-dur:${dur}s`,
        `--ff-delay:${delay}s`,
        `--ff-drift:${drift}px`,
      ].join(';');
      container.appendChild(ff);
    }
  }

  const tl = gsap.timeline(st('#scene-moral'));

  // Plaque scales in with elastic
  tl.to('#moralPlaque', {
    opacity: 1,
    scale: 1,
    duration: 0.75,
    ease: 'back.out(1.8)',
  }, 0);

  // Content lines inside plaque stagger in
  tl.to('.smoral-pt',  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.55);
  tl.to('.smoral-pl1', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.85);
  tl.to('.smoral-pl2', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.15);
  tl.to('.smoral-pl3', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.45);
  tl.to('.smoral-pl4', {
    opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.5)',
  }, 1.75);

  // Footnotes drop in last
  tl.to('.smoral-fn', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(2)',
  }, 2.2);
  tl.to('.smoral-fnt', {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
  }, 2.65);

  // Initial states
  gsap.set('.plaque-title, .plaque-line', { y: 10 });
  gsap.set('.smoral-fn',  { y: -12 });
}

/* ============================================================
   SCENE 23 — scene-after-that
   ============================================================ */
function initSceneAfterThat() {
  const tl = gsap.timeline(st('#scene-after-that'));

  // Dawn sky glow — bg is already there, animate overlay brightness
  tl.from('.safter-bg', {
    opacity: 0.3,
    duration: 1.8,
    ease: 'power2.inOut',
  }, 0);

  // Amazasaurus flies in from above
  tl.to('#afterAmaza', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  }, 0.4);

  // Lap counter appears
  tl.to('.safter-lap', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  }, 1.0);

  // Spotlight beam draws in (opacity)
  tl.to('#afterSpotlight', {
    opacity: 1,
    duration: 1.2,
    ease: 'power2.inOut',
  }, 1.2);

  // Ground characters wave in staggered
  tl.to('#afterMondi', {
    opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)',
  }, 1.4);
  tl.to('#afterBinko', {
    opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)',
  }, 1.65);
  tl.to('#afterZiron', {
    opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)',
  }, 1.9);

  // Story text rises up from bottom
  const textEls = [
    '.safter-t1', '.safter-t2', '.safter-t3',
    '.safter-t4', '.safter-t5', '.safter-t6', '.safter-t7',
  ];
  textEls.forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.1 + i * 0.28);
  });

  // Thought bubble pops in last
  tl.to('#afterThought', {
    opacity: 1,
    scale: 1,
    duration: 0.45,
    ease: 'back.out(2.5)',
  }, 4.1);

  // Initial states
  gsap.set('#afterAmaza', { y: -30 });
  gsap.set('#afterMondi, #afterBinko, #afterZiron', { y: 20 });
  gsap.set('.safter-text .story-body', { y: 16 });
  gsap.set('#afterThought', { scale: 0.3 });
}

/* ============================================================
   NEW FEATURE: CHARACTER CARD COLLECTION
   ============================================================ */
const characterData = {
  amazasaurus: {
    name: 'Amazasaurus',
    bio: 'The main character. Can do everything — teeth, wings, talons, poison immunity. Flies 23 laps every morning. Kind heart, yaaasified style.',
    traits: ['🦷 Teeth', '🦅 Wings', '🦶 Talons', '☠️ Poison Immune', '❤️ Kind'],
    quote: '"Because Mondi needed it. And I could. So I did."'
  },
  mondi: {
    name: 'Mondi',
    bio: 'The sleepy long-necked dinosaur who accidentally walked into a tar pit while half-asleep. Very polite, very clumsy, needs a lot of help waking up.',
    traits: ['😴 Sleepy', '🌀 Clumsy', '🦒 Long Neck', '😊 Polite'],
    quote: '"Just... five more minutes..."'
  },
  binko: {
    name: 'Binko',
    bio: 'The flying blue dinosaur with a relentless curiosity. Asks "But WHY?" about everything. Has 44 follow-up questions at any given moment.',
    traits: ['🦅 Flying', '❓ Curious', '🤗 Enthusiastic', '❓❓❓ 44 Questions'],
    quote: '"But WHY does he do the laps?"'
  },
  ziron: {
    name: 'Ziron',
    bio: 'The T-Rex who only speaks when something is truly valid. Economical with words. Nods twice as approval. Very majestic.',
    traits: ['👑 Majestic', '🗣️ Brief', '👍 Approving', '🦷 Teeth'],
    quote: '"Valid."'
  },
  trex: {
    name: 'T-Rex',
    bio: 'Just a regular T-Rex with big teeth and tiny arms. Very angry most of the time. Not as special as Amazasaurus, but makes up the numbers.',
    traits: ['😤 Angry', '🦷 Teeth', '💪 Strong', '🙄 Tiny Arms'],
    quote: '"RAWR!"'
  },
  'plant eater': {
    name: 'Plant Eater',
    bio: 'Friendly herbivore who eats plants and agrees with everyone. Cannot handle poison water. Very agreeable.',
    traits: ['🌿 Herbivore', '☠️ Poison Vulnerable', '🤝 Agreeable', '😊 Calm'],
    quote: '"I agree with that."'
  },
  michael: {
    name: 'Michael',
    bio: 'The child prodigy who drew all this. Calls himself a yaaasified flying T-Rex with velociraptor talons. Made everything.',
    traits: ['🎨 Artist', '✨ Yaaasified', '🧠 Genius', '✏️ Creator'],
    quote: '"I was a child prodigy."'
  },
  cooal: {
    name: 'Cooal',
    bio: '"He\'s so yaaasified." Saw the vision — a flying T-Rex with velociraptor talons. AI art enthusiast. Knew Michael\'s creation was special before anyone else.',
    traits: ['👀 Visionary', '🤩 Excitable', '🎨 AI Art', '✨ Believer'],
    quote: '"I can see the vision!"'
  }
};

// Collection state
const collectedCharacters = new Set();

// Load from localStorage
try {
  const saved = localStorage.getItem('dinotales-collection');
  if (saved) {
    JSON.parse(saved).forEach(c => collectedCharacters.add(c));
  }
} catch(e) {}

function saveCollection() {
  try {
    localStorage.setItem('dinotales-collection', JSON.stringify([...collectedCharacters]));
  } catch(e) {}
}

function updateCollectionUI() {
  const total = 8;
  const collected = collectedCharacters.size;
  
  // Update progress
  const progressFill = document.getElementById('collectionProgressFill');
  const progressText = document.getElementById('collectionProgressText');
  if (progressFill) progressFill.style.width = `${(collected/total)*100}%`;
  if (progressText) progressText.textContent = `${collected}/${total} Collected`;
  
  // Update checkboxes and cards
  collectedCharacters.forEach(char => {
    const checkbox = document.getElementById(`check-${char}`);
    if (checkbox) checkbox.textContent = '☑';
    const card = document.querySelector(`.character-card[data-character="${char}"]`);
    if (card) card.classList.add('collected');
  });
}

function toggleCollect(character) {
  if (collectedCharacters.has(character)) {
    collectedCharacters.delete(character);
    const checkbox = document.getElementById(`check-${character}`);
    if (checkbox) checkbox.textContent = '☐';
    const card = document.querySelector(`.character-card[data-character="${character}"]`);
    if (card) card.classList.remove('collected');
  } else {
    collectedCharacters.add(character);
    const checkbox = document.getElementById(`check-${character}`);
    if (checkbox) checkbox.textContent = '☑';
    const card = document.querySelector(`.character-card[data-character="${character}"]`);
    if (card) card.classList.add('collected');
  }
  saveCollection();
  updateCollectionUI();
}

function openCharacterModal(characterId) {
  const data = characterData[characterId];
  if (!data) return;
  
  const modal = document.getElementById('characterModal');
  const avatar = document.getElementById('modalAvatar');
  const name = document.getElementById('modalName');
  const bio = document.getElementById('modalBio');
  const traits = document.getElementById('modalTraits');
  const quote = document.getElementById('modalQuote');
  
  if (avatar) avatar.innerHTML = document.querySelector(`.character-card[data-character="${characterId}"] .card-avatar`).innerHTML;
  if (name) name.textContent = data.name;
  if (bio) bio.textContent = data.bio;
  
  if (traits) {
    traits.innerHTML = data.traits.map(t => `<span class="modal-trait">${t}</span>`).join('');
  }
  
  if (quote) quote.textContent = data.quote;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCharacterModal(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('modal-close')) return;
  const modal = document.getElementById('characterModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleChapter(element) {
  element.classList.toggle('expanded');
}

// Initialize features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for GSAP to set up
  setTimeout(() => {
    updateCollectionUI();
    
    // Animate character cards on scroll
    const cards = document.querySelectorAll('.character-card');
    cards.forEach((card, i) => {
      gsap.set(card, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.08,
            ease: 'power2.out'
          });
        }
      });
    });
    
    // Animate chapter items
    const chapters = document.querySelectorAll('.chapter-item');
    chapters.forEach((chapter, i) => {
      gsap.set(chapter, { opacity: 0, x: -30 });
      ScrollTrigger.create({
        trigger: chapter,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(chapter, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            delay: i * 0.1,
            ease: 'power2.out'
          });
        }
      });
    });
    
    // Animate collection progress
    gsap.from('.collection-progress', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.collection-progress',
        start: 'top 90%'
      }
    });
    
    // Animate chapters header
    gsap.from('.chapters-header', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.chapters-header',
        start: 'top 80%'
      }
    });
    
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCharacterModal(e);
    });
    
  }, 100);
});

/* ============================================================
   AUTO-INIT
   All 7 functions are called in order once DOM is ready.
   If the main site already calls these, remove the block below.
   ============================================================ */
(function autoInit() {
  function run() {
    initSceneCrowd();
    initSceneAnswer();
    initSceneZironValid();
    initSceneLessonBuildup();
    initSceneRealReason();
    initSceneMoral();
    initSceneAfterThat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
