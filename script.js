/* ---------- Theme toggle (light by default, choice is remembered) ---------- */
(function () {
  const root = document.documentElement;
  const LOGO_LIGHT = 'assets/logo-dark.png'; // dark-coloured logo for the light theme
  const LOGO_DARK = 'assets/logo.png';        // light-coloured logo for the dark theme

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  function sync() {
    document.querySelectorAll('img[src$="logo-dark.png"], img[src$="/logo.png"]').forEach(img => {
      const want = isDark() ? LOGO_DARK : LOGO_LIGHT;
      if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    });
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(isDark()));
    }
  }

  function setTheme(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
    sync();
  }

  document.addEventListener('DOMContentLoaded', () => {
    sync();
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  const ring = document.getElementById('preloader-ring');
  window.addEventListener('load', () => {
    gsap.to(ring, {
      strokeDashoffset: 0,
      duration: reduceMotion ? 0.01 : 1,
      ease: 'power2.inOut',
      onComplete: () => {
        preloader.classList.add('done');
        setTimeout(() => preloader.remove(), 700);
        runIntro();
      }
    });
  });
  // Fallback in case load event already fired / takes too long
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('done')) {
      preloader.classList.add('done');
      setTimeout(() => preloader.remove(), 700);
      runIntro();
    }
  }, 2500);

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => navbar.classList.toggle('scrolled', self.scroll() > 80)
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuToggle.classList.toggle('open', menuOpen);
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
    mobileMenu.style.maxHeight = menuOpen ? mobileMenu.scrollHeight + 'px' : '0px';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuOpen = false;
    menuToggle.classList.remove('open');
    mobileMenu.style.maxHeight = '0px';
  }));

  /* ---------- Active nav link on scroll ---------- */
  const sections = ['home', 'about', 'services', 'industries', 'careers', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-link');
  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (!self.isActive) return;
        navLinks.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav-link[href="#${sec.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  });

  /* ---------- Text splitting (hero + section titles) ---------- */
  const splitTargets = document.querySelectorAll('.split-lines');
  const splitInstances = [];
  splitTargets.forEach(el => {
    const split = new SplitType(el, { types: 'lines,words', tagName: 'span' });
    splitInstances.push(split);
    gsap.set(split.words, { yPercent: 120, opacity: 0 });
  });

  function runIntro() {
    const heroSplit = document.querySelector('#home .split-lines');
    if (heroSplit) {
      const words = heroSplit.querySelectorAll('.word');
      gsap.to(words, {
        yPercent: 0, opacity: 1, duration: reduceMotion ? 0.01 : 0.9, stagger: 0.03,
        ease: 'power3.out'
      });
    }
    document.querySelectorAll('#home .reveal-up').forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.8, delay: 0.3 + i * 0.12, ease: 'power2.out' });
    });
  }

  /* ---------- Scroll-triggered reveals for the rest of the page ---------- */
  document.querySelectorAll('section:not(#home) .split-lines').forEach(el => {
    const words = el.querySelectorAll('.word');
    gsap.to(words, {
      yPercent: 0, opacity: 1, duration: reduceMotion ? 0.01 : 0.8, stagger: 0.025, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  document.querySelectorAll('section:not(#home) .reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  gsap.utils.toArray('.card, .ind-card').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.6, ease: 'power2.out',
      delay: (i % 5) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* ---------- Animated stat counters ---------- */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: reduceMotion ? 0.01 : 1.6,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(counter.val) + suffix; }
        });
      }
    });
  });

  /* ---------- Parallax on hero background ---------- */
  if (!reduceMotion) {
    gsap.to('.hero-bg', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
});
