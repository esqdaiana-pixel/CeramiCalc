// Lógica de cálculo de la calculadora comercial CeramiLucho (V1).
// Funciones puras: no tocan la interfaz ni la base de datos, así se pueden probar solas.

// Redondea a n decimales (evita restos de punto flotante como 55.00000000000001)
const redondear = (valor, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
};

const esNumeroPositivo = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

/**
 * Calcula cajas, m² finales y totales.
 *
 * @param {object} p
 * @param {number|null} p.m2Solicitados     m² que necesita el cliente
 * @param {boolean}     p.descarteActivo    si el descarte está activado
 * @param {number}      p.descartePct       porcentaje de descarte (solo cuenta si está activado)
 * @param {number|null} p.m2PorCaja         rendimiento de la caja
 * @param {number|null} p.precioLista       precio de lista por caja (null = sin precio cargado)
 * @param {number|null} p.precioEfectivo    precio efectivo por caja (null = sin precio cargado)
 * @returns {{ok:false, errores:string[]} | {ok:true, ...resultado}}
 */
export function calcular({
  m2Solicitados,
  descarteActivo = false,
  descartePct = 0,
  m2PorCaja,
  precioLista = null,
  precioEfectivo = null,
}) {
  const errores = [];

  if (!esNumeroPositivo(m2PorCaja)) errores.push('El producto no tiene el rendimiento por caja cargado.');
  if (!esNumeroPositivo(m2Solicitados)) errores.push('Los metros cuadrados deben ser mayores a cero.');

  const pct = descarteActivo ? descartePct : 0;
  if (descarteActivo && (typeof pct !== 'number' || !Number.isFinite(pct) || pct < 0)) {
    errores.push('El porcentaje de descarte no puede ser negativo.');
  }
  if (errores.length) return { ok: false, errores };

  // m² con descarte = m² solicitados × (1 + descarte / 100)
  const m2ConDescarte = m2Solicitados * (1 + pct / 100);

  // Cajas = CEIL(m² con descarte / m² por caja).
  // Se redondea a 6 decimales ANTES del CEIL: sin esto, divisiones que deberían dar
  // un número exacto (ej. 6,6 / 1,65 = 4) dan 4,0000000000000001 y suman una caja de más.
  const cajas = Math.ceil(redondear(m2ConDescarte / m2PorCaja, 6));

  const m2Entregados = redondear(cajas * m2PorCaja, 2);
  const m2Excedentes = redondear(m2Entregados - m2Solicitados, 2);

  const sinPrecioLista = !esNumeroPositivo(precioLista);
  const sinPrecioEfectivo = !esNumeroPositivo(precioEfectivo);
  const sinPrecio = sinPrecioLista || sinPrecioEfectivo;

  return {
    ok: true,
    m2Solicitados,
    descartePct: pct,
    m2ConDescarte: redondear(m2ConDescarte, 2),
    m2PorCaja,
    cajas,
    m2Entregados,
    m2Excedentes,
    sinPrecio, // true = mostrar "sin precio cargado", nunca un valor inventado
    sinPrecioLista,
    sinPrecioEfectivo,
    precioListaCaja: sinPrecioLista ? null : precioLista,
    precioEfectivoCaja: sinPrecioEfectivo ? null : precioEfectivo,
    totalLista: sinPrecioLista ? null : redondear(precioLista * cajas, 2),
    totalEfectivo: sinPrecioEfectivo ? null : redondear(precioEfectivo * cajas, 2),
  };
}
