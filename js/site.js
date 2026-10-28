/* FILE GUIDE: js/site.js - behaviour shared by every page (plain JavaScript, no libraries).
   Each block below is independent and does nothing if its elements are not on the page.
   Order: 1 page load, 2 sticky header, 3 mobile menu, 4 hero slider, 5 count-up numbers, 6 carousel arrows. */
(function () {
  // ---- 1. PAGE LOAD: hide the preloader and start the 'rise' entrance animation ----
  var doc = document.documentElement;
  var pre = document.getElementById('pre');
  function ready() {
    if (pre) pre.classList.add('done');
    doc.classList.add('ready');
  }
  window.addEventListener('load', function () { setTimeout(ready, pre ? 900 : 0); });
  setTimeout(ready, 3000);

  // ---- 2. STICKY HEADER: adds class 'stuck' (shadow + border) after scrolling 10px ----
  var hdr = document.querySelector('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('stuck', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- 3. MOBILE MENU: burger button opens/closes the nav; clicking a link closes it ----
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  // ---- 4. HERO SLIDER: cross-fades the images in .hero-img, updates caption (data-t / data-s) and 01/02/03 dots ----
  var slides = document.querySelectorAll('.hero-img img');
  var dots = document.querySelectorAll('.dots button');
  var capB = document.querySelector('.cap b');
  var capS = document.querySelector('.cap span');
  var idx = 0, timer;
  function show(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    if (capB && slides[idx]) {
      capB.textContent = slides[idx].dataset.t;
      capS.textContent = slides[idx].dataset.s;
    }
  }
  // restart the auto-play timer: change 5500 to set seconds per slide (milliseconds)
  function auto() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(function () { show(idx + 1); }, 5500);
  }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); auto(); }); });
  if (slides.length) { show(0); auto(); }

  // ---- 5. COUNT-UP NUMBERS ----
  // Any element with data-count="10" data-suffix="+" counts from 0 to 10 and adds the suffix when it scrolls into view.
  // The text inside the tag is only the fallback if JavaScript is off - keep it equal to the final value.
  var nums = document.querySelectorAll('[data-count]');
  function run(el) {
    var end = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
    var t0 = null, dur = 3500; // dur = animation length in milliseconds (3500 = 3.5 seconds); bigger = slower
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      // start each counter once, when at least 60% of it is visible, then stop watching it
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
  }

  // ---- 6. CAROUSEL ARROWS: buttons with data-dir="-1" / "1" scroll the .track sideways by 260px ----
  var track = document.querySelector('.track');
  document.querySelectorAll('[data-dir]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (track) track.scrollBy({ left: parseInt(b.dataset.dir, 10) * 260, behavior: 'smooth' });
    });
  });
})();
