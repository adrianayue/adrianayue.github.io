// ===== Hora a temps real Barcelona =====

function getBarcelonaParts() {
  const now = new Date();
  const options = {
    timeZone: 'Europe/Madrid',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat('es-ES', options);
  const parts = formatter.formatToParts(now);

  const map = {};
  parts.forEach(p => map[p.type] = p.value);

  return {
    hour: parseInt(map.hour, 10),
    minute: map.minute,
    second: map.second,
    formatted: `${map.hour}:${map.minute}:${map.second}`
  };
}

function updateClock() {
  const { formatted } = getBarcelonaParts();
  document.getElementById('clock').textContent = formatted;

  const yearOptions = { timeZone: 'Europe/Madrid', year: 'numeric' };
  const yearText = new Intl.DateTimeFormat('es-ES', yearOptions).format(new Date());
  document.querySelectorAll('.year').forEach(el => {
    el.textContent = yearText;
  });
}

// ===== Colors segons hores =====

const THEMES = [
  { from: 1,  to: 8,  bg: '#3C2C23', text: '#EAE5DD' },
  { from: 8,  to: 14, bg: '#EAE5DD', text: '#612705' },
  { from: 14, to: 19, bg: '#EAE5DD', text: '#3C2C23' },
  { from: 19, to: 24, bg: '#3C2C23', text: '#F6ECBD' },
  { from: 0,  to: 1,  bg: '#3C2C23', text: '#F6ECBD' }
];

function getThemeForHour(hour) {
  return THEMES.find(t => hour >= t.from && hour < t.to) || THEMES[2];
}

function applyTheme() {
  const { hour } = getBarcelonaParts();
  const theme = getThemeForHour(hour);
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--text', theme.text);
}

// ===== Alçada del header (per calcular scroll i alçades disponibles) =====

function setHeaderHeightVar() {
  const header = document.querySelector('header');
  if (header) {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
}

// ===== Inicialització =====
function tick() {
  updateClock();
  applyTheme();
}

tick();
setInterval(tick, 1000);

function init() {
  setHeaderHeightVar();
  initScrollToCv();
  window.addEventListener('resize', setHeaderHeightVar);
  window.addEventListener('load', setHeaderHeightVar);

  // Les fonts variables es poden carregar més tard i canviar l'alçada del header
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setHeaderHeightVar);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // el DOM ja estava carregat quan el script s'ha executat
  init();
}