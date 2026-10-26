(function () {
  var form = document.getElementById('careerForm');
  if (!form) return;
  var input = document.getElementById('resume');
  var label = document.getElementById('fileLabel');
  var drop = document.getElementById('fileDrop');
  var status = document.getElementById('fstat');
  var idle = label.textContent;
  input.addEventListener('change', function () { if (input.files[0]) label.textContent = input.files[0].name; });
  ['dragover', 'dragleave', 'drop'].forEach(function (evt) {
    drop.addEventListener(evt, function (e) {
      e.preventDefault();
      drop.classList.toggle('drag', evt === 'dragover');
      if (evt === 'drop' && e.dataTransfer.files[0]) { input.files = e.dataTransfer.files; label.textContent = e.dataTransfer.files[0].name; }
    });
  });
  var MAX = 5 * 1024 * 1024;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var file = input.files[0];
    if (!file) { status.textContent = 'Please attach your resume.'; return; }
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) { status.textContent = 'Resume must be a PDF, DOC or DOCX file.'; return; }
    if (file.size > MAX) { status.textContent = 'Resume is too large. Maximum size is 5MB.'; return; }
    status.textContent = 'Sending your application...';
    try {
      var res = await fetch('send-career.php', { method: 'POST', body: new FormData(form) });
      var out = await res.json();
      if (out.success) {
        status.textContent = 'Thank you, your application has been received. We will get back to you soon.';
        form.reset(); label.textContent = idle;
      } else { status.textContent = out.message || 'Something went wrong. Please try again.'; }
    } catch (err) { status.textContent = 'Network error. Please try again.'; }
  });
})();
