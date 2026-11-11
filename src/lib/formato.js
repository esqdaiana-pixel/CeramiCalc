const numero2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numeroLibre = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const pesosExactos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatM2 = (n) => `${numero2.format(n)} m²`;
export const formatPorcentaje = (n) => `${numeroLibre.format(n)} %`;
export const formatPesos = (n) => pesos.format(n);
export const formatPesosExactos = (n) => pesosExactos.format(n);
export const formatEntero = (n) => new Intl.NumberFormat('es-AR').format(n);
