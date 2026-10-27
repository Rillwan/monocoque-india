(function () {
  var doc = document.documentElement;
  var pre = document.getElementById('pre');
  function ready() {
    if (pre) pre.classList.add('done');
    doc.classList.add('ready');
  }
  window.addEventListener('load', function () { setTimeout(ready, pre ? 900 : 0); });
  setTimeout(ready, 3000);

  var hdr = document.querySelector('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('stuck', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
  function auto() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(function () { show(idx + 1); }, 5500);
  }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); auto(); }); });
  if (slides.length) { show(0); auto(); }

  var nums = document.querySelectorAll('[data-count]');
  function run(el) {
    var end = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
    var t0 = null, dur = 3500;
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
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
  }

  var track = document.querySelector('.track');
  document.querySelectorAll('[data-dir]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (track) track.scrollBy({ left: parseInt(b.dataset.dir, 10) * 260, behavior: 'smooth' });
    });
  });
})();
