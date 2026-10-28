/* FILE GUIDE: js/contact.js - used only on contact.html. (1) AJAX submit of the contact form, (2) Kochi/Coimbatore map tabs. */
(function () {
  // ---- CONTACT FORM: send the fields to send-contact.php without reloading the page ----
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('fstat');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      // show progress text in <p id="fstat"> under the button
      status.textContent = 'Sending...';
      try {
        // send-contact.php validates the data and emails sales@monocoqueindia.com (see mail-config.php)
        var res = await fetch('send-contact.php', { method: 'POST', body: new FormData(form) });
        var result = await res.json();
        status.textContent = result.success ? 'Thanks, your message has been sent. We will reply shortly.' : (result.message || 'Something went wrong. Please try again.');
        if (result.success) form.reset();
      } catch (err) {
        status.textContent = 'Network error. Please try again or call us.';
      }
    });
  }
  // ---- MAP TABS: show only the map whose id matches the clicked button's data-map ----
  var tabs = document.querySelectorAll('.maptabs button');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
      document.querySelectorAll('.map iframe').forEach(function (m) { m.hidden = m.id !== t.dataset.map; });
    });
  });
})();
