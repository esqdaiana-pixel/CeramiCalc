import { useState } from 'react';
import { formatEntero, formatM2, formatPesos, formatPesosExactos, formatPorcentaje } from '../lib/formato.js';
import { registrarEvento } from '../lib/analytics.js';
import MensajePresupuesto from './MensajePresupuesto.jsx';

function Fila({ etiqueta, valor }) {
  return (
    <div className="fila-detalle">
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

function ResultadoCalidad({ resultado }) {
  const avisoPrecio = resultado.calidadDisponible ? 'Precio no cargado' : 'Confirmar stock';
  const precioPorMetro = (precioCaja) => formatPesosExactos(precioCaja / resultado.m2PorCaja);

  return (
    <article className="resultado-calidad">
      <h3>{resultado.calidad} calidad</h3>
      {!resultado.calidadDisponible && (
        <p className="nota nota-alerta">Confirmar stock con proveedor.</p>
      )}
      {resultado.calidadDisponible && resultado.sinPrecio && (
        <p className="nota nota-alerta">Hay precios pendientes de cargar.</p>
      )}

      <div className="destacado resultado-cajas">
        <span className="destacado-etiqueta">Cajas necesarias</span>
        <span className="destacado-valor">{formatEntero(resultado.cajas)}</span>
        <span className="destacado-nota">{formatM2(resultado.m2Entregados)}</span>
      </div>

      <dl className="detalle precios-calidad">
        <Fila
          etiqueta="Efectivo"
          valor={resultado.sinPrecioEfectivo
            ? avisoPrecio
            : `${precioPorMetro(resultado.precioEfectivoCaja)}/m² · ${formatPesos(resultado.precioEfectivoCaja)}/caja · Total ${formatPesos(resultado.totalEfectivo)}`}
        />
        <Fila
          etiqueta="Lista"
          valor={resultado.sinPrecioLista
            ? avisoPrecio
            : `${precioPorMetro(resultado.precioListaCaja)}/m² · ${formatPesos(resultado.precioListaCaja)}/caja · Total ${formatPesos(resultado.totalLista)}`}
        />
      </dl>
    </article>
  );
}

function ResultadoMaterial({ titulo, resultado, unidad, plural }) {
  return (
    <Fila
      etiqueta={`${titulo} · ${resultado.material.marca} ${resultado.material.nombre}`}
      valor={`${formatEntero(resultado.cantidad)} ${resultado.cantidad === 1 ? unidad : plural} · ${formatPesos(resultado.totalEfectivo)}`}
    />
  );
}

export default function Resultados({ resultado, calculado }) {
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  if (!resultado) {
    return (
      <section className="panel resultados" aria-labelledby="tit-resultado" aria-live="polite">
        <h2 id="tit-resultado">Presupuesto solicitado</h2>
        <p className="vacio">
          {calculado
            ? 'Completá los datos marcados arriba para ver el presupuesto.'
            : 'Elegí un producto, ingresá los metros cuadrados y tocá Calcular.'}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="panel resultados" aria-labelledby="tit-resultado" aria-live="polite">
        <h2 id="tit-resultado">Presupuesto solicitado</h2>
        <p className="resultado-producto">
          <strong>{resultado.producto.modelo}</strong> {resultado.producto.tamano.toLowerCase()}
          {' · '}{resultado.producto.fabricante}
        </p>

        <dl className="detalle detalle-presupuesto">
          <Fila etiqueta="Metros cuadrados solicitados" valor={formatM2(resultado.m2Solicitados)} />
          <Fila etiqueta="Descarte aplicado" valor={formatPorcentaje(resultado.descartePct)} />
          <Fila etiqueta="Metros cuadrados con descarte" valor={formatM2(resultado.calidades[0].m2ConDescarte)} />
        </dl>

        <div className="resultados-calidades">
          {resultado.calidades.map((calidad) => (
            <ResultadoCalidad key={calidad.calidad} resultado={calidad} />
          ))}
        </div>

        <section className="resultado-materiales" aria-labelledby="tit-materiales">
          <h3 id="tit-materiales">Pegamento y pastina</h3>
          <p className="nota">Calculado sobre {formatM2(resultado.materiales.m2Calculados)}.</p>
          <dl className="detalle lista-resultados-materiales">
            <ResultadoMaterial titulo="Pegamento" resultado={resultado.materiales.pegamento} unidad="bolsa" plural="bolsas" />
            <ResultadoMaterial titulo="Pastina" resultado={resultado.materiales.pastina} unidad="kg" plural="kg" />
            <Fila etiqueta="Total materiales" valor={formatPesos(resultado.materiales.totalEfectivo)} />
          </dl>
        </section>
      </section>
      <button
        type="button"
        className="boton-principal boton-enviar-presupuesto"
        onClick={() => {
          registrarEvento('budget_message_opened', {
            available_qualities: resultado.calidades.filter((calidad) => calidad.calidadDisponible).length,
          });
          setMostrarMensaje(true);
        }}
      >
        Enviar presupuesto
      </button>
      {mostrarMensaje && <MensajePresupuesto presupuesto={resultado} />}
    </>
  );
}
