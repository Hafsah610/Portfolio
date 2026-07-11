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
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  sizeIt();
  window.addEventListener('resize', sizeIt);

  scene.add(new THREE.AmbientLight(0xfff0e8, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 8);
  scene.add(key);
  const warm = new THREE.PointLight(0xff5533, 0.9, 50);
  warm.position.set(-6, -4, 6);
  scene.add(warm);

  // red & black field — vermilions, deep reds, charcoals, a few paper pieces
  const palette = [0xe63e21, 0x1f1915, 0xb3401f, 0xf1ede6, 0x2e2621, 0x8c1d0e, 0x3a2f28, 0xe63e21];
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
  const COUNT = 30;
  const rand = (i, salt) => ((i * salt) % 100) / 100; // deterministic pseudo-random

  // the field is a tall column of shapes; scrolling travels through it
  const SCROLL_FACTOR = 0.0032;

  for (let i = 0; i < COUNT; i++) {
    const geo = geos[i % geos.length]();
    // Phong is much cheaper per-pixel than Standard (PBR) and looks the same
    // at this size — glossy toy-like shapes
    const mat = new THREE.MeshPhongMaterial({
      color: palette[i % palette.length],
      shininess: 45,
      specular: 0x555555,
      flatShading: i % 3 !== 0,
    });
    const m = new THREE.Mesh(geo, mat);

    const side = i % 2 === 0 ? -1 : 1;
    if (i < 6) {
      // hero cluster — visible on load
      m.position.set(side * (3 + rand(i, 37) * 6), 3.5 - rand(i, 53) * 6, -2 - rand(i, 29) * 4);
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
      // travel through the field as the page scrolls
      group.position.y = window.scrollY * SCROLL_FACTOR;
      group.rotation.z = Math.sin(t * 0.08) * 0.02;
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

/* ---------------- generic reveals ---------------- */
if (!prefersReduced) {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    // hero reveals are handled by the intro timeline
    if (el.closest('.hero')) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.line > span'),
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });
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
  base.setAttribute('stroke', 'rgba(241, 237, 230, 0.18)');
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
  // is taller than the viewport, pinning would clip it)
  if (window.matchMedia('(min-width: 900px)').matches) {
    ScrollTrigger.create({
      trigger: '#rtm',
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.6,
      onUpdate,
    });
  } else {
    ScrollTrigger.create({
      trigger: '#rtm',
      start: 'top 65%',
      end: 'bottom 85%',
      scrub: 0.6,
      onUpdate,
    });
  }
})();

/* ---------------- chapter indicator + bg shifts ---------------- */
const chapterLabel = document.getElementById('chapterLabel');
const indicator = document.querySelector('.chapter-indicator');
const blobLayer = document.querySelector('.bg-blobs');

const setChapter = (c) => {
  chapterLabel.textContent = c.label;
  indicator.style.opacity = c.hide ? '0' : '1';
  if (prefersReduced) return;
  if (c.bg) {
    gsap.to('body', { backgroundColor: c.bg, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
  }
  if (c.b1) {
    gsap.to(blobLayer, {
      '--b1': c.b1, '--b2': c.b2, '--b3': c.b3, '--b4': c.b4,
      duration: 1.2, ease: 'power2.out', overwrite: 'auto',
    });
  }
};

const chapterTriggers = [];
let chaptersReady = false;

const heroChapter = {
  label: 'Prologue', bg: '#100E0D', hide: false,
  b1: '#3A0E06', b2: '#200B07', b3: '#2A2522', b4: '#E63E21',
};
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
  const c = {
    label: d.chapter, bg: d.bg, hide: sec.id === 'contact',
    b1: d.b1, b2: d.b2, b3: d.b3, b4: d.b4,
  };
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
