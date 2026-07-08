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
  { from: 1,  to: 7,  bg: '#4B362E', text: '#F3EBD5' },
  { from: 7,  to: 13, bg: '#F3EDE6', text: '#615A57' },
  { from: 13, to: 19, bg: '#F3EDE6', text: '#6F4839' },
  { from: 19, to: 24, bg: '#4B362E', text: '#F3E7AD' },
  { from: 0,  to: 1,  bg: '#4B362E', text: '#F3E7AD' }
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
