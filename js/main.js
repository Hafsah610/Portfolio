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

  /* ---- THE star ✦ — the site's own mark, brought to 3D ----
     one extruded four-point star (the same ✦ used in the logo, tickers
     and ghost words) that spins, tumbles and journeys chapter to chapter.
     No field, no extras — a single signature object. */
  const star = new THREE.Group();
  scene.add(star);

  const starShape = new THREE.Shape();
  const R = 2.7, r = 0.62;
  for (let k = 0; k < 8; k++) {
    const ang = Math.PI / 2 - k * (Math.PI / 4);
    const rad = k % 2 === 0 ? R : r;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad;
    if (k === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();

  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.55,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.09,
    bevelSegments: 2,
  });
  starGeo.center();

  // solid black body, shaded just enough to read as 3D…
  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x150307,
    shininess: 26,
    specular: 0x6a0b1d,
  });
  star.add(new THREE.Mesh(starGeo, bodyMat));
  // …with crimson print-style edge lines
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xed1941, transparent: true, opacity: 0.9 });
  star.add(new THREE.LineSegments(new THREE.EdgesGeometry(starGeo, 18), edgeMat));

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.75);
  keyLight.position.set(4, 6, 8);
  scene.add(keyLight);

  // where the star sits for each chapter (x flips sides down the story);
  // c = body color, e = edge color (they swap on the black epilogue)
  const KF = [
    { id: 'hero',    x: 5.9,  y: -0.5, z: -3.5, s: 1.25, c: 0x150307, e: 0xed1941 },
    { id: 'about',   x: -6,   y: 0.2,  z: -4.5, s: 0.85, c: 0x150307, e: 0xed1941 },
    { id: 'work',    x: 6.6,  y: 0.6,  z: -6,   s: 0.7,  c: 0x150307, e: 0xed1941 },
    { id: 'posts',   x: -6.4, y: -0.6, z: -5,   s: 0.8,  c: 0x150307, e: 0xed1941 },
    { id: 'rtm',     x: 6.2,  y: 0.4,  z: -5.5, s: 0.7,  c: 0x150307, e: 0xed1941 },
    { id: 'shelf',   x: -6.2, y: 0.8,  z: -5,   s: 0.8,  c: 0x150307, e: 0xed1941 },
    { id: 'hobbies', x: 6.4,  y: -0.5, z: -4.5, s: 0.9,  c: 0x150307, e: 0xed1941 },
    { id: 'contact', x: 0,    y: 0.4,  z: -2.8, s: 1.3,  c: 0xed1941, e: 0xf2e9dc },
  ];
  // segment i begins when section i is ~half a viewport from the top, so the
  // star HOLDS each chapter position and travels between chapters
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
  window.__starDebug = { star, offsets: () => kfOffsets };

  const colA = new THREE.Color();
  const colB = new THREE.Color();
  const edgeA = new THREE.Color();
  const edgeB = new THREE.Color();
  const targetPos = new THREE.Vector3();

  // start at the hero keyframe — no fly-in from the origin
  const initAspect = isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 1.6;
  star.position.set(KF[0].x * Math.min(1, initAspect / 1.35), KF[0].y, KF[0].z);
  star.scale.setScalar(KF[0].s);

  const placeStar = (t) => {
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
      a.y + (b.y - a.y) * f + Math.sin(t * 0.5) * 0.2 + mouseY * -0.2,
      a.z + (b.z - a.z) * f
    );
    if (isFinite(star.position.x)) star.position.lerp(targetPos, 0.06);
    else star.position.copy(targetPos); // snap out of any NaN state
    const scaleF = aspect < 1 ? 0.7 : 1; // smaller on portrait screens
    const ts = (a.s + (b.s - a.s) * f) * scaleF;
    star.scale.setScalar(star.scale.x + (ts - star.scale.x) * 0.06);

    colA.setHex(a.c).lerp(colB.setHex(b.c), f);
    bodyMat.color.lerp(colA, 0.08);
    edgeA.setHex(a.e).lerp(edgeB.setHex(b.e), f);
    edgeMat.color.lerp(edgeA, 0.08);

    // sparkle spin, scroll-coupled, plus a slow 3D tumble that shows the depth
    star.rotation.z = -t * 0.22 - window.scrollY * 0.0004;
    star.rotation.y = Math.sin(t * 0.24) * 0.55;
    star.rotation.x = Math.sin(t * 0.17) * 0.22;
  };

  if (prefersReduced) {
    star.position.set(KF[0].x, KF[0].y, KF[0].z);
    star.scale.setScalar(KF[0].s);
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);
    if (!prefersReduced) placeStar(clock.getElapsedTime());
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
