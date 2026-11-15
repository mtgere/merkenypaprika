// Formularios de preaviso: valida el email y lo envía al destino configurado.
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwVZ_FP_RAkLZfPI_q5s_eM79WCV9BJEIf9EvCsuF6iq-uCYigrm_WqstnV2Uw4uctygA/exec'; // Apps Script → planilla «Merkén & Paprika · Preaviso (emails)»
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

// Barra fija: aparece al pasar el hero, se oculta cuando hay un formulario a la vista
// y, en escritorio, se esconde al bajar y vuelve al subir.
(function () {
  var top = document.querySelector('.mp-sticky-top');
  var bottom = document.querySelector('.mp-sticky-bottom');
  var hero = document.getElementById('hero');
  if (!top || !bottom || !hero || !('IntersectionObserver' in window)) return;
  var pastHero = false, formsVisible = 0, goingUp = true, lastY = window.scrollY;
  function done() { return !!document.querySelector('.mp-ok:not([hidden])'); }
  function set(el, on) { el.classList.toggle('is-on', on); if (on) el.removeAttribute('inert'); else el.setAttribute('inert', ''); }
  function update() {
    var base = pastHero && formsVisible === 0 && !done();
    set(top, base && goingUp);
    set(bottom, base);
  }
  new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; update(); }).observe(hero);
  var seen = new Map();
  var fo = new IntersectionObserver(function (es) {
    es.forEach(function (e) { seen.set(e.target, e.isIntersecting); });
    formsVisible = 0; seen.forEach(function (v) { if (v) formsVisible++; });
    update();
  }, { threshold: 0.2 });
  document.querySelectorAll('.mp-formwrap, .mp-ok').forEach(function (n) { fo.observe(n.parentElement === document.body ? n : n); });
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) > 6) { goingUp = y < lastY; lastY = y; update(); }
  }, { passive: true });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.mp-go').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var input = document.getElementById('email');
      if (!input || done()) return;
      e.preventDefault();
      document.getElementById('hero').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { input.focus({ preventScroll: true }); }, reduce ? 0 : 500);
    });
  });
  update();
})();
