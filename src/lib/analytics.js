export function registrarEvento(nombre, parametros = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', nombre, parametros);
}
