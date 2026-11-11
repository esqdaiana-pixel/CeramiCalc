// Une lo que hay en pantalla (producto, calidad, textos) con la lógica de cálculo.
// Todas las validaciones de la V1 pasan por acá, antes de calcular.
import { calcular } from './calculo.js';
import { parseNumero } from './numeros.js';

function calcularMaterial(material, m2) {
  const cantidad = Math.ceil(Math.round((m2 / material.coberturaM2) * 1_000_000) / 1_000_000);

  return {
    material,
    cantidad,
    precioUnitario: material.precioEfectivo,
    totalEfectivo: Math.round(material.precioEfectivo * cantidad),
  };
}

export function evaluarPresupuesto({
  producto,
  m2Texto,
  descarteActivo,
  pctTexto,
  pegamento,
  pastina,
}) {
  if (!producto) return { ok: false, errores: ['Elegí un producto de la lista.'] };

  const errores = [];
  if (!pegamento) errores.push('Elegí el tipo de pegamento que necesita el cliente.');
  if (!pastina) errores.push('Elegí la pastina que necesita el cliente.');
  const m2 = parseNumero(m2Texto);
  if (m2 === null) errores.push('Ingresá los metros cuadrados que necesita el cliente.');
  else if (Number.isNaN(m2)) errores.push('Los metros cuadrados tienen que ser un número, por ejemplo 12,5.');

  let pct = 0;
  if (descarteActivo) {
    pct = parseNumero(pctTexto);
    if (pct === null) errores.push('Ingresá el porcentaje de descarte o desactivá el descarte.');
    else if (Number.isNaN(pct)) errores.push('El porcentaje de descarte tiene que ser un número, por ejemplo 10.');
  }

  if (errores.length) return { ok: false, errores };

  const calidades = ['Primera', 'Segunda'].map((calidad) => {
    const variante = producto.variantes[calidad];
    const resultado = calcular({
      m2Solicitados: m2,
      descarteActivo,
      descartePct: pct,
      m2PorCaja: variante?.m2PorCaja ?? producto.m2PorCaja,
      precioLista: variante?.precioLista ?? null,
      precioEfectivo: variante?.precioEfectivo ?? null,
    });
    return resultado.ok ? { ...resultado, calidad, calidadDisponible: Boolean(variante) } : resultado;
  });

  const erroresCalculo = calidades.flatMap((resultado) => (resultado.ok ? [] : resultado.errores));
  if (erroresCalculo.length) return { ok: false, errores: [...new Set(erroresCalculo)] };

  const pegamentoCalculado = calcularMaterial(pegamento, calidades[0].m2ConDescarte);
  const pastinaCalculada = calcularMaterial(pastina, calidades[0].m2ConDescarte);

  return {
    ok: true,
    producto,
    m2Solicitados: m2,
    descartePct: descarteActivo ? pct : 0,
    calidades,
    materiales: {
      m2Calculados: calidades[0].m2ConDescarte,
      pegamento: pegamentoCalculado,
      pastina: pastinaCalculada,
      totalEfectivo: pegamentoCalculado.totalEfectivo + pastinaCalculada.totalEfectivo,
    },
  };
}

export function evaluarEntrada({ producto, calidad, m2Texto, descarteActivo, pctTexto }) {
  if (!producto) return { ok: false, errores: ['Elegí un producto de la lista.'] };

  const errores = [];
  const hayVariantes = Object.keys(producto.variantes).length > 0;
  const variante = calidad ? producto.variantes[calidad] : null;

  if (!hayVariantes) {
    errores.push('Este producto no tiene precio cargado.');
  } else if (!calidad) {
    errores.push('Elegí una calidad.');
  } else if (!variante) {
    errores.push(`Este producto no tiene precio cargado en ${calidad.toLowerCase()} calidad.`);
  }

  const m2 = parseNumero(m2Texto);
  if (m2 === null) errores.push('Ingresá los metros cuadrados que necesita el cliente.');
  else if (Number.isNaN(m2)) errores.push('Los metros cuadrados tienen que ser un número, por ejemplo 12,5.');

  let pct = 0;
  if (descarteActivo) {
    pct = parseNumero(pctTexto);
    if (pct === null) errores.push('Ingresá el porcentaje de descarte o desactivá el descarte.');
    else if (Number.isNaN(pct)) errores.push('El porcentaje de descarte tiene que ser un número, por ejemplo 10.');
  }

  if (errores.length) return { ok: false, errores };

  const resultado = calcular({
    m2Solicitados: m2,
    descarteActivo,
    descartePct: pct,
    m2PorCaja: variante?.m2PorCaja ?? producto.m2PorCaja,
    precioLista: variante.precioLista,
    precioEfectivo: variante.precioEfectivo,
  });
  if (!resultado.ok) return resultado;

  return { ...resultado, producto, calidad };
}
