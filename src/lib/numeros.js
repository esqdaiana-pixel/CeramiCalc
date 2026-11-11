// Convierte lo que escribe el asesor ("12,5", "12.5", "1.200,5") en número.
// Devuelve: null si el campo está vacío, NaN si no es un número válido, o el número.
export function parseNumero(texto) {
  if (texto === null || texto === undefined) return null;
  let t = String(texto).trim().replace(/\s/g, '');
  if (t === '') return null;

  if (t.includes(',') && t.includes('.')) {
    t = t.replace(/\./g, '').replace(',', '.'); // 1.200,5 -> 1200.5
  } else {
    t = t.replace(',', '.'); // 12,5 -> 12.5
  }

  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  return Number(t);
}
