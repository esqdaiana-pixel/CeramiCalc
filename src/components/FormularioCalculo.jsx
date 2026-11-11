export default function FormularioCalculo({
  producto,
  m2Texto,
  onM2,
  descarteActivo,
  onDescarte,
  pctTexto,
  onPct,
  pegamentos,
  pegamentoId,
  onPegamento,
  pastinas,
  pastinaId,
  onPastina,
  errores,
  onCalcular,
}) {
  return (
    <section className="panel calculo" aria-labelledby="tit-calculo">
      <h2 id="tit-calculo">Cálculo</h2>

      <p className="resumen-producto">
        {producto ? (
          <>
            <strong>{producto.modelo}</strong>{' '}
            <span>{producto.tamano.toLowerCase()}</span>
          </>
        ) : (
          'Todavía no elegiste un producto.'
        )}
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onCalcular();
        }}
      >
        <label className="campo">
          <span>Metros cuadrados que necesita el cliente</span>
          <div className="con-sufijo">
            <input inputMode="decimal" autoComplete="off" value={m2Texto} onChange={(e) => onM2(e.target.value)} placeholder="Ej: 24,5" />
            <span className="sufijo" aria-hidden="true">m²</span>
          </div>
        </label>

        <div className="descarte">
          <label className="interruptor">
            <input type="checkbox" role="switch" checked={descarteActivo} onChange={(e) => onDescarte(e.target.checked)} />
            <span className="interruptor-pista" aria-hidden="true" />
            <span>Aplicar descarte</span>
          </label>

          {descarteActivo && (
            <label className="campo campo-descarte">
              <span>Porcentaje de descarte</span>
              <div className="con-sufijo">
                <input inputMode="decimal" autoComplete="off" value={pctTexto} onChange={(e) => onPct(e.target.value)} placeholder="Ej: 10" />
                <span className="sufijo" aria-hidden="true">%</span>
              </div>
            </label>
          )}
        </div>

        <div className="campos-materiales">
          <label className="campo">
            <span>Tipo de pegamento</span>
            <select value={pegamentoId} onChange={(e) => onPegamento(e.target.value)}>
              <option value="">Elegí según la instalación</option>
              {pegamentos.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.marca} · {material.nombre} — {material.aplicacion}
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Pastina</span>
            <select value={pastinaId} onChange={(e) => onPastina(e.target.value)}>
              <option value="">Elegí la pastina</option>
              {pastinas.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.nombre} — {material.presentacion}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errores.length > 0 && (
          <div className="avisos" role="alert">
            <ul>
              {errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="boton-principal">Calcular</button>
      </form>
    </section>
  );
}
