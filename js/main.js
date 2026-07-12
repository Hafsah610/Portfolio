/* ============================================================
   Hafsah Sayeedah — portfolio interactions
   Three.js hero · Lenis smooth scroll · GSAP storytelling
   ============================================================ */

document.body.classList.add('js');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) document.documentElement.classList.add('reduced-motion');

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Lenis smooth scroll ---------------- */
let lenis = null;
if (!prefersReduced && window.Lenis) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

// smooth anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(id);
      else document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ---------------- custom cursor ---------------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.05, ease: 'power2.out' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.05, ease: 'power2.out' });
  const fx = gsap.quickTo(follower, 'x', { duration: 0.35, ease: 'power2.out' });
  const fy = gsap.quickTo(follower, 'y', { duration: 0.35, ease: 'power2.out' });
  window.addEventListener('mousemove', (e) => {
    cx(e.clientX); cy(e.clientY); fx(e.clientX); fy(e.clientY);
  });
  document.querySelectorAll('a, button, [data-hover], .shelf-card').forEach((el) => {
    el.addEventListener('mouseenter', () => follower.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('is-hover'));
  });
}

/* ---------------- text splitting ---------------- */
document.querySelectorAll('[data-split]').forEach((el) => {
  el.innerHTML = el.textContent
    .split('')
    .map((c) => `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`)
    .join('');
});

document.querySelectorAll('[data-split-lines]').forEach((el) => {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts
    .map((p) => `<span class="line"><span>${p}</span></span>`)
    .join('');
});

/* ---------------- three.js full-page background field ---------------- */
(() => {
  const canvas = document.getElementById('webgl');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 15;

  // cap the pixel ratio — full-screen rendering at 1.75x+ is the #1 scroll-jank
  // source; MSAA at 1.25x is still far cheaper and keeps edges clean
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);

  const sizeIt = () => {
    // background tabs can report 0x0 — a 0/0 aspect is NaN and poisons
    // every position computed from it, so guard the dimensions
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 800;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  sizeIt();
  window.addEventListener('resize', sizeIt);

  // the whole field is black wireframe line-art (wodniack style) —
  // MeshBasicMaterial needs no lights and is the cheapest possible material
  const geos = [
    () => new THREE.TorusKnotGeometry(0.8, 0.28, 64, 12),
    () => new THREE.IcosahedronGeometry(0.9, 0),
    () => new THREE.TorusGeometry(0.8, 0.32, 12, 36),
    () => new THREE.ConeGeometry(0.8, 1.4, 5),
    () => new THREE.BoxGeometry(1.1, 1.1, 1.1),
    () => new THREE.OctahedronGeometry(0.95, 0),
    () => new THREE.SphereGeometry(0.85, 20, 14),
  ];

  const group = new THREE.Group();
  scene.add(group);
  const meshes = [];
  const COUNT = 20;
  const rand = (i, salt) => ((i * salt) % 100) / 100; // deterministic pseudo-random

  // the field is a tall column of shapes; scrolling travels through it
  const SCROLL_FACTOR = 0.0032;

  for (let i = 0; i < COUNT; i++) {
    const geo = geos[i % geos.length]();
    const mat = new THREE.MeshBasicMaterial({
      color: 0x150307,
      wireframe: true,
      transparent: true,
      opacity: 0.25 + rand(i, 17) * 0.15, // subtle — the planet is the star
    });
    const m = new THREE.Mesh(geo, mat);

    const side = i % 2 === 0 ? -1 : 1;
    if (i < 6) {
      // hero cluster — pushed to the edges so the planet owns the center-right
      m.position.set(side * (6.5 + rand(i, 37) * 4), 4 - rand(i, 53) * 8, -5 - rand(i, 29) * 4);
    } else {
      // spread down the scroll column, biased to the sides for readability
      const depth = 46;
      m.position.set(
        side * (3.5 + rand(i, 37) * 7.5),
        2 - ((i - 6) / (COUNT - 6)) * depth - rand(i, 61) * 1.6,
        -2.5 - rand(i, 29) * 5.5
      );
    }
    m.scale.setScalar(0.4 + rand(i, 41) * 0.85);
    m.userData = {
      baseX: m.position.x,
      baseY: m.position.y,
      floatSpeed: 0.35 + rand(i, 53) * 0.6,
      floatAmp: 0.35 + rand(i, 23) * 0.45,
      rx: 0.002 + rand(i, 13) * 0.004,
      ry: 0.003 + rand(i, 7) * 0.004,
      phase: i * 1.7,
    };
    group.add(m);
    meshes.push(m);
  }

  /* ---- THE planet: her brand at the center, campaigns in orbit ----
     one wireframe globe + orbit rings + satellites that journeys around
     the screen as the story scrolls (ref: sattwikjana.vercel.app, re-cast
     for the red/black print theme) */
  const planet = new THREE.Group();
  scene.add(planet);

  const planetMats = [];
  const pMat = (opacity, wireframe = false) => {
    const m = new THREE.MeshBasicMaterial({
      color: 0x150307, wireframe, transparent: true, opacity,
    });
    planetMats.push(m);
    return m;
  };

  // sparse segments so the globe reads as clean lat/long lines, not a scribble
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 10), pMat(0.6, true)));

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.05, 8, 96), pMat(0.95));
  ring1.rotation.set(Math.PI / 2.15, 0.25, 0);
  planet.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.03, 8, 96), pMat(0.55));
  ring2.rotation.set(Math.PI / 2.6, 0, 0.5);
  planet.add(ring2);

  const makeSat = (ringRot, radius, size, speed, phase) => {
    const base = new THREE.Group();
    base.rotation.copy(ringRot);
    const spinner = new THREE.Group();
    base.add(spinner);
    const sat = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), pMat(1));
    sat.position.x = radius;
    spinner.add(sat);
    planet.add(base);
    return { spinner, sat, speed, phase };
  };
  const sats = [
    makeSat(ring1.rotation, 3.3, 0.24, 0.5, 0),
    makeSat(ring1.rotation, 3.3, 0.15, 0.5, Math.PI * 0.85),
    makeSat(ring2.rotation, 3.9, 0.18, -0.34, 1.4),
  ];

  // where the planet sits for each chapter (x flips sides down the story)
  const KF = [
    { id: 'hero',    x: 5.6,  y: -1.1, z: -3.5, s: 1.6,  c: 0x150307 },
    { id: 'about',   x: -6,   y: 0.2,  z: -4.5, s: 1.1,  c: 0x150307 },
    { id: 'work',    x: 6.6,  y: 0.6,  z: -6,   s: 0.9,  c: 0x150307 },
    { id: 'posts',   x: -6.4, y: -0.6, z: -5,   s: 1,    c: 0x150307 },
    { id: 'rtm',     x: 6.2,  y: 0.4,  z: -5.5, s: 0.9,  c: 0x150307 },
    { id: 'shelf',   x: -6.2, y: 0.8,  z: -5,   s: 1,    c: 0x150307 },
    { id: 'hobbies', x: 6.4,  y: -0.5, z: -4.5, s: 1.1,  c: 0x150307 },
    { id: 'contact', x: 0,    y: 0.4,  z: -2.8, s: 1.6,  c: 0xed1941 },
  ];
  // segment i begins when section i is ~half a viewport from the top, so the
  // planet HOLDS each chapter position and travels between chapters
  let kfOffsets = KF.map(() => 0);
  const computeOffsets = () => {
    kfOffsets = KF.map((k) => {
      const el = document.getElementById(k.id);
      if (!el) return 0;
      return Math.max(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55);
    });
  };
  computeOffsets();
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', computeOffsets);
  window.__planetDebug = { planet: null, offsets: () => kfOffsets };

  const colA = new THREE.Color();
  const colB = new THREE.Color();
  const targetPos = new THREE.Vector3();

  // start at the hero keyframe — no fly-in from the origin
  const initAspect = isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 1.6;
  planet.position.set(KF[0].x * Math.min(1, initAspect / 1.35), KF[0].y, KF[0].z);
  planet.scale.setScalar(KF[0].s);
  window.__planetDebug.planet = planet;

  const placePlanet = (t) => {
    const anchor = window.scrollY;
    let i = 0;
    while (i < KF.length - 2 && anchor > kfOffsets[i + 1]) i++;
    const a = KF[i];
    const b = KF[i + 1] || a;
    const span = Math.max(1, (kfOffsets[i + 1] || kfOffsets[i] + 1) - kfOffsets[i]);
    let f = gsap.utils.clamp(0, 1, (anchor - kfOffsets[i]) / span);
    f = f * f * (3 - 2 * f); // smoothstep

    const aspect = isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 1.6;
    const aspectF = Math.min(1, aspect / 1.35); // pull inward on narrow screens
    targetPos.set(
      (a.x + (b.x - a.x) * f) * aspectF + mouseX * 0.4,
      a.y + (b.y - a.y) * f + Math.sin(t * 0.5) * 0.18,
      a.z + (b.z - a.z) * f
    );
    if (isFinite(planet.position.x)) planet.position.lerp(targetPos, 0.06);
    else planet.position.copy(targetPos); // snap out of any NaN state
    const ts = a.s + (b.s - a.s) * f;
    planet.scale.setScalar(planet.scale.x + (ts - planet.scale.x) * 0.06);

    colA.setHex(a.c).lerp(colB.setHex(b.c), f);
    planetMats.forEach((m) => m.color.lerp(colA, 0.08));

    planet.rotation.y += 0.0035;
    planet.rotation.x = Math.sin(t * 0.18) * 0.1;
    sats.forEach((s) => {
      s.spinner.rotation.z = t * s.speed + s.phase;
      s.sat.rotation.x += 0.02;
      s.sat.rotation.y += 0.015;
    });
  };

  if (prefersReduced) {
    planet.position.set(KF[0].x, KF[0].y, KF[0].z);
    planet.scale.setScalar(KF[0].s);
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);
    const t = clock.getElapsedTime();
    meshes.forEach((m) => {
      const u = m.userData;
      if (!prefersReduced) {
        m.rotation.x += u.rx;
        m.rotation.y += u.ry;
        m.position.y = u.baseY + Math.sin(t * u.floatSpeed + u.phase) * u.floatAmp;
        m.position.x = u.baseX + Math.cos(t * u.floatSpeed * 0.7 + u.phase) * 0.3;
      }
    });
    if (!prefersReduced) {
      group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.04;
      group.rotation.x += (mouseY * 0.06 - group.rotation.x) * 0.04;
      // travel through the field as the page scrolls, slowly rolling
      group.position.y = window.scrollY * SCROLL_FACTOR;
      group.rotation.z = Math.sin(t * 0.08) * 0.02 + window.scrollY * 0.00005;
      placePlanet(t);
    }
    renderer.render(scene, camera);
  };
  render();
})();

/* ---------------- preloader + hero intro (one timeline) ---------------- */
(() => {
  const pre = document.getElementById('preloader');
  const count = document.getElementById('loadCount');

  gsap.set('.hero__line .char', { yPercent: 120 });

  if (prefersReduced) {
    pre.style.display = 'none';
    gsap.set('.hero__line .char', { yPercent: 0 });
    return;
  }

  const counter = { v: 0 };
  const tl = gsap.timeline();
  tl.to(counter, {
    v: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => { count.textContent = Math.round(counter.v); },
  })
    .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.15')
    .set(pre, { display: 'none' })
    .to('.hero__line .char', {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.035,
    }, '-=0.55')
    .to('.hero .hero__kicker', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.9')
    .to('.hero .hero__tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
    .to('.hero .hero__blurb', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
})();

/* ---------------- generic reveals (directional) ---------------- */
if (!prefersReduced) {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    // hero reveals are handled by the intro timeline
    if (el.closest('.hero')) return;
    const dir = el.getAttribute('data-reveal');
    if (dir === 'left') gsap.set(el, { x: -70 });
    if (dir === 'right') gsap.set(el, { x: 70 });
    if (dir === 'rotate') gsap.set(el, { rotation: 3, y: 70 });
    gsap.to(el, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.line > span'),
      { yPercent: 115, rotation: 2 },
      {
        yPercent: 0,
        rotation: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });
}

/* ---------------- whole-page scroll choreography ---------------- */
if (!prefersReduced) {
  // hero splits apart as you scroll away
  gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
  })
    .to('.hero__line:first-child', { xPercent: -14, ease: 'none' }, 0)
    .to('.hero__line--right', { xPercent: 10, ease: 'none' }, 0)
    .to('.hero__meta', { opacity: 0, y: -40, ease: 'none' }, 0);
  // (the kicker is NOT in this scrub — its data-reveal start state is opacity 0,
  //  and a scrubbed .to() would capture that 0 as its start value and lock it)

  // giant ghost words drift sideways behind each chapter
  document.querySelectorAll('.chapter__ghost').forEach((el) => {
    gsap.fromTo(el, { xPercent: 5 }, {
      xPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  });

  // stars spin with scroll
  document.querySelectorAll('.spin-star').forEach((el) => {
    gsap.to(el, {
      rotation: 360,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });

  // portrait drifts inside its arch
  gsap.fromTo('.about__frame img', { yPercent: -6 }, {
    yPercent: 6,
    ease: 'none',
    scrollTrigger: { trigger: '.about__figure', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
  });

  // tickers skew with scroll velocity
  if (lenis) {
    const skews = [...document.querySelectorAll('.marquee__track')].map((t) =>
      gsap.quickTo(t, 'skewX', { duration: 0.4, ease: 'power2.out' })
    );
    lenis.on('scroll', (e) => {
      const s = gsap.utils.clamp(-8, 8, (e.velocity || 0) * 0.35);
      skews.forEach((fn) => fn(s));
    });
  }
}

/* ---------------- stat counters ---------------- */
document.querySelectorAll('[data-count]').forEach((el) => {
  const target = +el.dataset.count;
  if (prefersReduced) { el.textContent = target; return; }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () =>
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target,
        duration: 1.8,
        ease: 'power2.out',
        snap: { innerText: 1 },
      }),
  });
});

/* ---------------- horizontal work timeline ---------------- */
if (!prefersReduced) {
  const track = document.getElementById('workTrack');
  const amount = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -amount(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#work',
      start: 'top top',
      end: () => '+=' + amount(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
} else {
  document.querySelector('.work__track').style.cssText = 'flex-wrap: wrap; width: auto;';
}

/* ---------------- RTM pinned route ---------------- */
(() => {
  const base = document.getElementById('routePath');
  if (!base) return;

  // overlay path that "draws" over the dashed base
  const overlay = base.cloneNode();
  overlay.id = 'routePathDraw';
  overlay.removeAttribute('stroke-dasharray');
  overlay.setAttribute('stroke-width', '4');
  base.setAttribute('stroke', 'rgba(21, 3, 7, 0.3)');
  base.parentNode.insertBefore(overlay, base.nextSibling);

  const len = overlay.getTotalLength();
  overlay.style.strokeDasharray = len;
  overlay.style.strokeDashoffset = len;

  const steps = document.querySelectorAll('.rtm-step');
  const stops = document.querySelectorAll('.rtm-stop');
  const setActive = (idx) => {
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-done', i < idx);
    });
    stops.forEach((s, i) => s.classList.toggle('is-active', i <= idx));
  };

  if (prefersReduced) {
    overlay.style.strokeDashoffset = 0;
    setActive(3);
    return;
  }

  setActive(0);
  const onUpdate = (self) => {
    overlay.style.strokeDashoffset = len * (1 - self.progress);
    setActive(Math.min(3, Math.floor(self.progress * 4)));
  };

  // wide screens: cinematic pin; small screens: plain scrub (stacked layout
  // is taller than the viewport, pinning would clip it). gsap.matchMedia
  // re-evaluates on resize — a plain matchMedia check at load breaks when
  // the page loads in a background tab reporting 0x0.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const st = ScrollTrigger.create({
      trigger: '#rtm',
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.6,
      onUpdate,
    });
    return () => st.kill();
  });
  mm.add('(max-width: 899px)', () => {
    const st = ScrollTrigger.create({
      trigger: '#rtm',
      start: 'top 65%',
      end: 'bottom 85%',
      scrub: 0.6,
      onUpdate,
    });
    return () => st.kill();
  });
})();

/* ---------------- chapter indicator + bg shifts ---------------- */
const chapterLabel = document.getElementById('chapterLabel');
const indicator = document.querySelector('.chapter-indicator');

const setChapter = (c) => {
  chapterLabel.textContent = c.label;
  indicator.style.opacity = c.hide ? '0' : '1';
  if (prefersReduced) return;
  if (c.bg) {
    gsap.to('body', { backgroundColor: c.bg, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
  }
};

const chapterTriggers = [];
let chaptersReady = false;

const heroChapter = { label: 'Prologue', bg: '#ED1941', hide: false };
chapterTriggers.push({
  ...heroChapter,
  st: ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 55%',
    end: 'bottom 45%',
    onEnter: () => chaptersReady && setChapter(heroChapter),
    onEnterBack: () => chaptersReady && setChapter(heroChapter),
  }),
});

document.querySelectorAll('[data-chapter]').forEach((sec) => {
  const d = sec.dataset;
  const c = { label: d.chapter, bg: d.bg, hide: sec.id === 'contact' };
  chapterTriggers.push({
    ...c,
    st: ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => chaptersReady && setChapter(c),
      onEnterBack: () => chaptersReady && setChapter(c),
    }),
  });
});

// layout shifts while images/fonts load can mis-fire the triggers above,
// so re-derive the active chapter after every ScrollTrigger refresh
ScrollTrigger.addEventListener('refresh', () => {
  chaptersReady = true;
  const active = chapterTriggers.filter((t) => t.st.isActive).pop();
  setChapter(active || chapterTriggers[0]);
});

/* ---------------- scroll progress ---------------- */
gsap.to('#progressBar', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
});

/* ---------------- refresh pins once fonts/images settle ---------------- */
window.addEventListener('load', () => ScrollTrigger.refresh());

/* ---------------- hobby video autoplay ---------------- */
(() => {
  const video = document.getElementById('hobbyVideo');
  if (!video) return;
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    },
    { threshold: 0.35 }
  ).observe(video);
})();
