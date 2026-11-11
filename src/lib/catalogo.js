// Arma el catálogo que usa la pantalla a partir de las filas de Supabase.

// V1: la base guarda hasta tres calidades, pero la interfaz solo ofrece estas dos.
export const CALIDADES_V1 = ['Primera', 'Segunda'];

const aNumero = (v) => (v === null || v === undefined ? null : Number(v));

export function armarCatalogo(productos, variantes) {
  const variantesPorProducto = new Map();

  for (const v of variantes) {
    if (!CALIDADES_V1.includes(v.calidad)) continue; // la Tercera queda guardada, pero no se muestra
    const actuales = variantesPorProducto.get(v.producto_id) ?? {};
    actuales[v.calidad] = {
      varianteId: v.variante_id,
      m2PorCaja: aNumero(v.m2_por_caja),
      precioLista: aNumero(v.precio_lista),
      precioEfectivo: aNumero(v.precio_efectivo),
    };
    variantesPorProducto.set(v.producto_id, actuales);
  }

  return productos.map((p) => ({
    id: p.producto_id,
    fabricante: p.fabricante,
    modelo: p.modelo,
    tamano: p.tamano,
    m2PorCaja: aNumero(p.m2_por_caja),
    variantes: variantesPorProducto.get(p.producto_id) ?? {},
  }));
}

const normalizar = (s) =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const primerNumero = (tamano) => Number.parseInt(String(tamano), 10) || 0;

const porModeloYTamano = (a, b) =>
  a.modelo.localeCompare(b.modelo, 'es')
  || primerNumero(a.tamano) - primerNumero(b.tamano)
  || a.fabricante.localeCompare(b.fabricante, 'es');

// Busca por modelo o fabricante (sin importar mayúsculas ni tildes) y filtra por tamaño.
export function filtrarProductos(catalogo, { texto = '', tamano = '' } = {}) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  return catalogo
    .filter((p) => !tamano || p.tamano === tamano)
    .filter((p) => {
      const datosProducto = normalizar(`${p.fabricante} ${p.modelo}`);
      return palabras.every((w) => datosProducto.includes(w));
    })
    .sort(porModeloYTamano);
}

export function listarTamanos(catalogo) {
  return [...new Set(catalogo.map((p) => p.tamano))].sort(
    (a, b) => primerNumero(a) - primerNumero(b) || a.localeCompare(b),
  );
}

export const calidadesDisponibles = (producto) =>
  CALIDADES_V1.filter((c) => producto?.variantes?.[c]);
