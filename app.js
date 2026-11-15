// Formularios de preaviso: valida el email y lo envía al destino configurado.
(function () {
  var ENDPOINT = ''; // se completa al conectar la lista de emails
  var RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function show(state) {
    document.querySelectorAll('.mp-formwrap').forEach(function (n) { n.hidden = state === 'ok'; });
    document.querySelectorAll('.mp-ok').forEach(function (n) { n.hidden = state !== 'ok'; });
    document.querySelectorAll('.mp-err').forEach(function (n) { n.hidden = state !== 'err'; });
  }
  function send(email, origen) {
    if (!ENDPOINT) return Promise.resolve();
    var data = new FormData();
    data.append('email', email);
    data.append('origen', origen);
    data.append('pagina', location.href);
    return fetch(ENDPOINT, { method: 'POST', body: data, mode: 'no-cors' });
  }
  document.querySelectorAll('.mp-form').forEach(function (form, i) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = String(new FormData(form).get('email') || '').trim();
      if (!RE.test(email)) { show('err'); form.querySelector('input').focus(); return; }
      var btn = form.querySelector('button');
      btn.disabled = true;
      send(email, i === 0 ? 'hero' : 'cierre').then(function () { show('ok'); }, function () { btn.disabled = false; show('err'); });
    });
  });
})();
