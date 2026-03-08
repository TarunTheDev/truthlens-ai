/* ============================================================
  CRAFTWORLD — main.js (v2 — Industry Grade)
  Full interactivity: Three.js, parallax, cursor glow,
  counter animations, navbar scroll effect, sound, form
  ============================================================ */
'use strict';

/* ─── 1. LOADER ──────────────────────────────────────────── */
const loaderFill = document.getElementById('loaderFill');
const loaderPct = document.getElementById('loaderPct');
const loaderMsgs = ['Generating terrain...', 'Spawning mobs...', 'Placing diamonds...', 'Lighting torches...', 'Almost there!'];
let pct = 0, msgIdx = 0;

const loadTimer = setInterval(() => {
  pct += Math.random() * 14 + 4;
  if (pct > 100) pct = 100;
  loaderFill.style.width = pct + '%';
  loaderPct.textContent = Math.round(pct) + '%';
  if (msgIdx < loaderMsgs.length && pct > msgIdx * 22)
    document.querySelector('.loader-subtitle').textContent = loaderMsgs[msgIdx++];
  if (pct >= 100) {
    clearInterval(loadTimer);
    setTimeout(() => {
      const el = document.getElementById('loader');
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
        onWorldLoaded();
      }, 800);
    }, 500);
  }
}, 130);

function onWorldLoaded() {
  // Start XP bar
  setTimeout(() => {
    const xp = document.getElementById('xpFill');
    if (xp) xp.style.width = '73%';
  }, 400);
  // Animate stat fills from 0
  document.querySelectorAll('.sbar-fill, .cs-fill').forEach(el => {
    const w = el.style.width; el.style.width = '0%';
    setTimeout(() => { el.style.width = w; }, 200);
  });
  // Animate hero content entrance
  const hc = document.querySelector('.hero-content');
  if (hc) {
    hc.style.opacity = '0'; hc.style.transform = 'translateY(30px)';
    setTimeout(() => { hc.style.transition = 'opacity .8s ease,transform .8s ease'; hc.style.opacity = '1'; hc.style.transform = 'none'; }, 100);
  }
}

/* ─── 2. CURSOR GLOW ─────────────────────────────────────── */
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
  if (!glow) return;
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

/* ─── 3. NAVBAR SCROLL EFFECT ────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── 4. NAV LINKS + HOTBAR SCROLL SPY ──────────────────── */
const sections = ['hero', 'about', 'features', 'characters', 'gallery', 'team', 'contact'];
const hotbarSlots = document.querySelectorAll('.hs');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 200) current = id;
  });
  hotbarSlots.forEach(hs => hs.classList.toggle('active', hs.dataset.target === current));
  navLinks.forEach(nl => nl.classList.toggle('active', nl.dataset.target === current));
}, { passive: true });

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

hotbarSlots.forEach(hs => hs.addEventListener('click', () => scrollToSection(hs.dataset.target)));
navLinks.forEach(nl => nl.addEventListener('click', e => { e.preventDefault(); scrollToSection(nl.dataset.target); }));

// Specific buttons
document.getElementById('heroPlay')?.addEventListener('click', () => scrollToSection('about'));
document.getElementById('heroLearn')?.addEventListener('click', () => scrollToSection('characters'));
document.getElementById('aboutCta')?.addEventListener('click', () => scrollToSection('features'));
document.getElementById('wpBtn')?.addEventListener('click', () => scrollToSection('gallery'));
document.getElementById('navCta')?.addEventListener('click', () => scrollToSection('contact'));
document.getElementById('navLogoLink')?.addEventListener('click', e => { e.preventDefault(); scrollToSection('hero'); });
document.getElementById('ctaBannerBtn')?.addEventListener('click', () => scrollToSection('contact'));

// Footer links
['hero', 'about', 'features', 'gallery', 'team', 'contact', 'characters'].forEach((id, i) => {
  const fn = document.getElementById('fn' + (i + 1));
  if (fn) fn.addEventListener('click', e => { e.preventDefault(); scrollToSection(id); });
});

// Mobile hamburger
document.getElementById('hamburger')?.addEventListener('click', () => {
  const nl = document.getElementById('navLinks');
  nl.style.display = nl.style.display === 'flex' ? 'none' : 'flex';
  nl.style.flexDirection = 'column';
  nl.style.position = 'absolute';
  nl.style.top = '68px'; nl.style.left = '0'; nl.style.right = '0';
  nl.style.background = 'rgba(8,12,20,0.98)';
  nl.style.padding = '16px 24px';
  nl.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
});

/* ─── 5. SCROLL REVEAL ───────────────────────────────────── */
new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  .observe.bind(null);

const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ─── 6. NUMBER COUNTERS ─────────────────────────────────── */
function animateCount(el, target, suffix = '') {
  let start = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      const target = parseInt(e.target.dataset.target, 10);
      const suffix = e.target.dataset.suffix || '';
      animateCount(e.target, target, suffix);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

/* ─── 7. PARALLAX WALLPAPER ──────────────────────────────── */
const wpBg = document.querySelector('.wp-bg');
if (wpBg) {
  window.addEventListener('scroll', () => {
    const section = wpBg.closest('.wallpaper-section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const pct = -rect.top / window.innerHeight;
    wpBg.style.transform = `translateY(${pct * 40}px)`;
  }, { passive: true });
}

/* ─── 8. SOUND TOGGLE (Web Audio API) ───────────────────── */
let audioCtx = null, gainNode = null, soundOn = false, oscs = [];
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain(); gainNode.gain.value = 0;
  gainNode.connect(audioCtx.destination);
  [82.5, 110, 165, 220, 330].forEach(freq => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.type = 'sine';
    g.gain.value = 0.025; o.connect(g); g.connect(gainNode); o.start();
    oscs.push({ o, g });
  });
}
document.getElementById('soundToggle')?.addEventListener('click', function () {
  soundOn = !soundOn;
  this.textContent = soundOn ? '🔊' : '🔇';
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  gainNode.gain.setTargetAtTime(soundOn ? 0.08 : 0, audioCtx.currentTime, 0.5);
});

/* ─── 9. THREE.JS SCENE ──────────────────────────────────── */
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050912, 0.028);

  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(12, 14, 20);

  /* Lighting */
  scene.add(new THREE.AmbientLight(0x334466, 0.9));
  const sun = new THREE.DirectionalLight(0xffd080, 1.6);
  sun.position.set(15, 25, 10); sun.castShadow = true; scene.add(sun);
  const fill = new THREE.PointLight(0x2244ff, 0.7, 40);
  fill.position.set(-8, 5, -8); scene.add(fill);
  const topLight = new THREE.HemisphereLight(0x4488aa, 0x224400, 0.6); scene.add(topLight);

  /* Block materials */
  function mat(c, e = 0) { return new THREE.MeshLambertMaterial({ color: c, emissive: e }); }
  const M = {
    grass: mat(0x4AA820), dirt: mat(0x8B6240), stone: mat(0x6A6A6A),
    snow: mat(0xEEEEFF), diamond: mat(0x4DD9E8, 0x1e5060),
    gold: mat(0xFFD700, 0x604000), lava: mat(0xFF4400, 0x882200),
    glass: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.35 }),
    water: new THREE.MeshLambertMaterial({ color: 0x2266AA, transparent: true, opacity: 0.6 }),
    sand: mat(0xF4D57A), gravel: mat(0x888888),
  };
  const GEO = new THREE.BoxGeometry(1, 1, 1);

  /* Terrain */
  const blocks = [];
  const GRID = 16;

  function noise(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
  function h(x, z) { return Math.round((noise(x * .25, z * .25) * 2 + noise(x * .5, z * .5) * 1) * 1.2); }

  function addBlock(x, y, z, m, bob = 0) {
    const mesh = new THREE.Mesh(GEO, m);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { baseY: y, bob, mineable: true };
    scene.add(mesh); blocks.push(mesh); return mesh;
  }

  for (let x = 0; x < GRID; x++) for (let z = 0; z < GRID; z++) {
    const top = h(x, z);
    for (let y = -2; y < top; y++) addBlock(x - GRID / 2, y, z - GRID / 2, M.stone);
    addBlock(x - GRID / 2, top - 1, z - GRID / 2, M.dirt);
    const topM = top > 2 ? M.snow : M.grass;
    addBlock(x - GRID / 2, top, z - GRID / 2, topM, Math.random() * 6.28);
    const r = Math.random();
    if (r < .04) addBlock(x - GRID / 2, top + 1, z - GRID / 2, M.diamond, Math.random() * 6.28);
    else if (r < .07) addBlock(x - GRID / 2, top + 1, z - GRID / 2, M.gold, Math.random() * 6.28);
  }

  /* Floating islands */
  const islands = [];
  [[12, 6, -4], [-9, 7, 8], [14, 9, 10], [-12, 5, -9]].forEach(([ix, iy, iz]) => {
    const m = []; const ph = Math.random() * Math.PI * 2;
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
      [M.grass, M.dirt].forEach((mat, d) => { const b = addBlock(ix + x, iy - d, iz + z, mat); b.userData.mineable = false; m.push(b); });
    }
    const gem = addBlock(ix, iy + 1, iz, Math.random() < .5 ? M.diamond : M.gold);
    gem.userData.mineable = false; m.push(gem);
    islands.push({ m, baseY: iy, ph });
  });

  /* Clouds */
  const clouds = [], cloudMat = new THREE.MeshLambertMaterial({ color: 0xddddff, transparent: true, opacity: .65 });
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group();
    const w = Math.floor(Math.random() * 4) + 2;
    for (let cx = 0; cx < w; cx++) {
      const cm = new THREE.Mesh(new THREE.BoxGeometry(2, .5, 2), cloudMat);
      cm.position.set(cx * 2, 0, 0); g.add(cm);
    }
    g.position.set((Math.random() - .5) * 50, 15 + Math.random() * 5, (Math.random() - .5) * 50);
    g.userData.spd = .005 + Math.random() * .005;
    scene.add(g); clouds.push(g);
  }

  /* Stars */
  const sg = new THREE.BufferGeometry();
  const sp = new Float32Array(500 * 3);
  for (let i = 0; i < 500 * 3; i++) sp[i] = (Math.random() - .5) * 220;
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: .12, transparent: true, opacity: .8 })));

  /* Orbit controls (manual) */
  let drag = false, prev = { x: 0, y: 0 }, theta = 0.5, phi = 0.85, radius = 24;
  function updateCam() {
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi) + 2;
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 1.5, 0);
  }
  canvas.addEventListener('mousedown', e => { drag = true; prev = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('touchstart', e => { drag = true; const t = e.touches[0]; prev = { x: t.clientX, y: t.clientY }; }, { passive: true });
  window.addEventListener('mouseup', () => drag = false);
  window.addEventListener('touchend', () => drag = false);
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    theta -= (e.clientX - prev.x) * .008;
    phi = Math.max(.2, Math.min(Math.PI * .48, phi + (e.clientY - prev.y) * .006));
    prev = { x: e.clientX, y: e.clientY }; updateCam();
  });
  window.addEventListener('touchmove', e => {
    if (!drag) return;
    const t = e.touches[0];
    theta -= (t.clientX - prev.x) * .008;
    phi = Math.max(.2, Math.min(Math.PI * .48, phi + (t.clientY - prev.y) * .006));
    prev = { x: t.clientX, y: t.clientY }; updateCam();
  }, { passive: true });
  canvas.addEventListener('wheel', e => { radius = Math.max(12, Math.min(45, radius + e.deltaY * .02)); updateCam(); });
  updateCam();

  /* Raycasting — hover + mining */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null; const origEmiss = new Map();

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY < rect.top || e.clientY > rect.bottom) return;
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(blocks.filter(b => b.parent === scene));
    if (hovered) { hovered.material.emissive.setHex(origEmiss.get(hovered) || 0); hovered = null; canvas.style.cursor = 'grab'; }
    if (hits.length && hits[0].object.userData.mineable) {
      hovered = hits[0].object;
      if (!origEmiss.has(hovered)) origEmiss.set(hovered, hovered.material.emissive.getHex());
      hovered.material.emissive.setHex(0x3a5a3a);
      canvas.style.cursor = 'crosshair';
    }
  });

  canvas.addEventListener('click', e => {
    if (drag) return;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(blocks.filter(b => b.parent === scene));
    if (hits.length && hits[0].object.userData.mineable) mineBlock(hits[0].object, e.clientX, e.clientY);
  });

  function mineBlock(block, cx, cy) {
    spawnSparks(cx, cy, block.material.color.getHexString());
    const t0 = performance.now(); const dur = 280;
    (function shrink(now) {
      const t = Math.min((now - t0) / dur, 1);
      block.scale.setScalar(1 - t);
      block.position.y = block.userData.baseY + t * t * .5;
      if (t < 1) requestAnimationFrame(shrink);
      else { scene.remove(block); const i = blocks.indexOf(block); if (i > -1) blocks.splice(i, 1); }
    })(performance.now());
  }

  function spawnSparks(x, y, hex) {
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      const angle = (i / 10) * Math.PI * 2, dist = 28 + Math.random() * 22;
      s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:8px;
        background:#${hex || '5d8a28'};z-index:9990;pointer-events:none;
        transition:all .45s ease-out;border-radius:1px;`;
      document.body.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(.3)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 500);
    }
  }

  /* Resize */
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  });

  /* Render loop */
  let time = 0;
  (function animate() {
    requestAnimationFrame(animate); time += .012;
    if (!drag) { theta += .0018; updateCam(); }
    // bob gem blocks
    blocks.forEach(b => {
      if (b.userData.bob !== undefined && b.userData.bob !== 0 && b.parent === scene) {
        b.position.y = b.userData.baseY + Math.sin(time + b.userData.bob) * .14;
        b.rotation.y = time * .6 + b.userData.bob;
      }
    });
    // float islands
    islands.forEach(isl => {
      const dy = Math.sin(time * .45 + isl.ph) * .45;
      isl.m.forEach(mb => { mb.position.y = (mb.userData.baseY || 0) + dy; });
    });
    // move clouds
    clouds.forEach(c => { c.position.x += c.userData.spd; if (c.position.x > 28) c.position.x = -28; });
    fill.intensity = .4 + Math.sin(time * .8) * .35;
    renderer.render(scene, camera);
  })();
})();

/* ─── 10. DAY/NIGHT BACKGROUND CYCLE ────────────────────── */
(function skyLoop() {
  const palettes = [
    ['#080c14', '#111830'], ['#180a28', '#3a1050'], ['#3a0808', '#a03018'],
    ['#082040', '#0a5080'], ['#050e1a', '#0a2848'], ['#120820', '#4a1830'], ['#080c14', '#111830'],
  ];
  let idx = 0, t = 0;
  function lerp(a, b, f) {
    const ca = hexRGB(a), cb = hexRGB(b);
    return `rgb(${r(ca.r + (cb.r - ca.r) * f)},${r(ca.g + (cb.g - ca.g) * f)},${r(ca.b + (cb.b - ca.b) * f)})`;
  }
  function hexRGB(h) { return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) }; }
  function r(n) { return Math.round(n); }
  function cycle() {
    t += .0004; const frac = t % 1;
    const cur = palettes[idx % palettes.length], nxt = palettes[(idx + 1) % palettes.length];
    document.body.style.background = `linear-gradient(180deg,${lerp(cur[0], nxt[0], frac)},${lerp(cur[1], nxt[1], frac)})`;
    if (t >= 1) { t = 0; idx++; }
    requestAnimationFrame(cycle);
  }
  cycle();
})();

/* ─── 11. FLOATING PARTICLES ─────────────────────────────── */
(function particles() {
  const c = document.createElement('canvas');
  c.id = 'particles'; Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none', width: '100%', height: '100%' });
  document.body.insertBefore(c, document.body.firstChild);
  const ctx = c.getContext('2d');
  let W, H, pts = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  function mk() { return { x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 1.6, dx: (Math.random() - .5) * .25, dy: -(Math.random() * .35 + .08), a: Math.random() * .5 + .1, col: ['#5D8A28', '#4DD9E8', '#FFD700', '#C62828'][Math.floor(Math.random() * 4)] }; }
  function init() { resize(); pts = Array.from({ length: 80 }, mk); }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { ctx.globalAlpha = p.a; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.r * 2, p.r * 2); p.x += p.dx; p.y += p.dy; if (p.y < -4 || p.x < -4 || p.x > W + 4) Object.assign(p, mk(), { y: H + 2 }); });
    ctx.globalAlpha = 1; requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  init(); draw();
})();

/* ─── 12. CONTACT FORM ───────────────────────────────────── */
window.handleForm = function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.innerHTML; btn.textContent = '⏳ Sending...'; btn.disabled = true;
  setTimeout(() => {
    e.target.style.display = 'none';
    document.getElementById('formOk').classList.add('show');
  }, 1500);
};

/* ─── 13. BLOCK TOOLTIP ──────────────────────────────────── */
const tip = document.createElement('div');
tip.style.cssText = 'position:fixed;z-index:600;pointer-events:none;background:rgba(5,8,16,.97);border:1px solid rgba(255,255,255,.15);padding:8px 14px;font-family:"Press Start 2P",monospace;font-size:.34rem;color:#fff;display:none;backdrop-filter:blur(8px);';
document.body.appendChild(tip);
document.querySelectorAll('.hs').forEach(sl => {
  const labels = { hero: '🌿 Grass — Home', about: '🪵 Oak Wood — About', features: '💎 Diamond — Features', characters: '⭐ Gold — Characters', gallery: '🔴 Redstone — Gallery', contact: '💚 Emerald — Contact' };
  sl.addEventListener('mouseenter', e => { tip.textContent = labels[sl.dataset.target] || ''; tip.style.display = 'block'; });
  sl.addEventListener('mousemove', e => { tip.style.left = e.clientX + 'px'; tip.style.top = (e.clientY - 48) + 'px'; });
  sl.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
});

console.log('%c🎮 CRAFTWORLD v2 — Industry Edition', 'font-size:18px;color:#5D8A28;font-weight:bold;');
console.log('%c⛏️  Seed: 2026-HACKATHON-CRAFTWORLD', 'color:#FFD700;');
console.log('%c🌍  Three.js + WebGL + Web Audio + CSS3', 'color:#4DD9E8;');

/* ─── 14. PARALLAX EFFECT ────────────────────────────────── */
document.addEventListener('mousemove', e => {
  const x = (window.innerWidth - e.pageX * 2) / 100;
  const y = (window.innerHeight - e.pageY * 2) / 100;

  document.querySelectorAll('.parallax-img, .floating-deco').forEach(img => {
    const speed = parseFloat(img.getAttribute('data-speed')) || 0.05;
    const xPos = x * speed * 100;
    const yPos = y * speed * 100;
    img.style.setProperty('--px', `${xPos}px`);
    img.style.setProperty('--py', `${yPos}px`);
  });
});
