(function () {
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('fstat');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      status.textContent = 'Sending...';
      try {
        var res = await fetch('send-contact.php', { method: 'POST', body: new FormData(form) });
        var result = await res.json();
        status.textContent = result.success ? 'Thanks, your message has been sent. We will reply shortly.' : (result.message || 'Something went wrong. Please try again.');
        if (result.success) form.reset();
      } catch (err) {
        status.textContent = 'Network error. Please try again or call us.';
      }
    });
  }
  var tabs = document.querySelectorAll('.maptabs button');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
      document.querySelectorAll('.map iframe').forEach(function (m) { m.hidden = m.id !== t.dataset.map; });
    });
  });
})();
