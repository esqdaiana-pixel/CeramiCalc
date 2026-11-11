import { formatEntero, formatM2, formatPesos, formatPorcentaje } from './formato.js';

export function generarTextoPresupuesto(presupuesto) {
  if (!presupuesto?.ok) return '';

  const lineas = [
    `¡Hola! 👋 Te paso el presupuesto solicitado para ${presupuesto.producto.modelo} ${presupuesto.producto.tamano.toLowerCase()} (${presupuesto.producto.fabricante}), en 1.ª y 2.ª calidad:`,
    'Pegamento y pastina cotizados a precio efectivo.',
  ];

  if (presupuesto.descartePct > 0) {
    lineas.push(`Descarte considerado: ${formatPorcentaje(presupuesto.descartePct)}.`);
  }

  const { pegamento, pastina } = presupuesto.materiales;
  for (const calidad of presupuesto.calidades) {
    lineas.push('', `${calidad.calidad === 'Primera' ? '🔹 1.ª' : '🔹 2.ª'} calidad`);
    if (!calidad.calidadDisponible) {
      lineas.push('Disponibilidad y precio: a confirmar con proveedor.');
      continue;
    }
    lineas.push(`${formatEntero(calidad.cajas)} cajas (${formatM2(calidad.m2Entregados)})`);
    lineas.push(`🧱 ${formatEntero(pegamento.cantidad)} ${pegamento.cantidad === 1 ? 'bolsa' : 'bolsas'} de ${pegamento.material.nombre} · ${formatPesos(pegamento.totalEfectivo)}`);
    lineas.push(`🎨 ${formatEntero(pastina.cantidad)} kg de ${pastina.material.nombre} · ${formatPesos(pastina.totalEfectivo)}`);
    lineas.push(
      calidad.sinPrecioEfectivo
        ? 'Total efectivo: a confirmar con proveedor.'
        : `💵 Total efectivo: ${formatPesos(calidad.totalEfectivo + presupuesto.materiales.totalEfectivo)}`,
    );
    lineas.push(
      calidad.sinPrecioLista
        ? 'Total lista: a confirmar con proveedor.'
        : `📋 Total lista: ${formatPesos(calidad.totalLista + presupuesto.materiales.totalEfectivo)}`,
    );
  }

  lineas.push('', 'Cualquier cosa no dudes en consultarme 😊');
  return lineas.join('\n');
}
