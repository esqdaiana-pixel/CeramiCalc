import { calidadesDisponibles } from '../lib/catalogo.js';
import { formatM2 } from '../lib/formato.js';

function rendimientos(producto) {
  const calidades = calidadesDisponibles(producto);
  const porCalidad = calidades
    .map((calidad) => ({
      calidad,
      m2: producto.variantes[calidad].m2PorCaja ?? producto.m2PorCaja,
    }))
    .filter((item) => item.m2);
  const unicos = new Set(porCalidad.map((item) => item.m2));

  if (unicos.size <= 1) {
    const m2 = porCalidad[0]?.m2 ?? producto.m2PorCaja;
    return m2 ? `${formatM2(m2)} por caja` : 'Sin rendimiento';
  }

  return porCalidad
    .map(({ calidad, m2 }) => `${calidad === 'Primera' ? '1.ª' : '2.ª'} ${formatM2(m2)}`)
    .join(' · ');
}

function tienePrecio(producto) {
  return calidadesDisponibles(producto).some((calidad) => {
    const variante = producto.variantes[calidad];
    return variante.precioLista > 0 || variante.precioEfectivo > 0;
  });
}

export default function SeleccionProducto({
  productos,
  tamanos,
  texto,
  onTexto,
  tamano,
  onTamano,
  producto,
  onElegirProducto,
}) {
  const sinPrecioCargado = producto && !tienePrecio(producto);
  const buscar = texto.trim().length > 0;

  return (
    <section className="panel seleccion" aria-labelledby="tit-seleccion">
      <h2 id="tit-seleccion">Producto</h2>

      <label className="campo campo-buscador-modelo">
        <span>Buscar por modelo</span>
        <input type="search" value={texto} onChange={(e) => onTexto(e.target.value)} placeholder="Ej: blanco plus" />
      </label>

      <div className="filtro-tamano">
        <label className="campo">
          <span>Filtrar por tamaño (opcional)</span>
          <select value={tamano} onChange={(e) => onTamano(e.target.value)}>
            <option value="">Todos los tamaños</option>
            {tamanos.map((t) => (
              <option key={t} value={t}>{t.toLowerCase()}</option>
            ))}
          </select>
        </label>
      </div>

      {!producto && (
        <>
          <p className="contador" aria-live="polite">
            {!buscar
              ? 'Escribí el nombre del modelo para ver opciones.'
              : productos.length === 1 ? '1 producto' : `${productos.length} productos`}
          </p>

          {buscar && (productos.length === 0 ? (
            <p className="vacio">No hay productos con ese nombre. Probá con otra palabra o dejá el tamaño en “Todos”.</p>
          ) : (
            <ul className="lista-productos">
              {productos.map((p) => {
                const precioCargado = tienePrecio(p);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="fila-producto"
                      onClick={() => onElegirProducto(p.id)}
                    >
                      <span className="fila-nombre">{p.modelo}</span>
                      <span className="fila-tamano">{p.tamano.toLowerCase()}</span>
                      <span className="fila-fabricante">{p.fabricante}</span>
                      <span className="fila-rinde">{rendimientos(p)}</span>
                      {!precioCargado && <span className="fila-aviso">Sin precio cargado</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </>
      )}

      {producto && (
        <div className="producto-seleccionado">
          <span>Modelo seleccionado</span>
          <strong>{producto.modelo} {producto.tamano.toLowerCase()}</strong>
          <span className="fabricante-seleccionado">{producto.fabricante}</span>
          {sinPrecioCargado && <p className="nota nota-alerta">Precios pendientes. Confirmar stock.</p>}
          {!sinPrecioCargado && calidadesDisponibles(producto).length === 1 && (
            <p className="nota">La otra calidad indica “Confirmar stock” en el presupuesto.</p>
          )}
          <p className="rendimiento">Rinde por caja: <strong>{rendimientos(producto)}</strong></p>
        </div>
      )}
    </section>
  );
}
