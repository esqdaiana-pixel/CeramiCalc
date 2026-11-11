import { useRef, useState } from 'react';
import { generarTextoPresupuesto } from '../lib/textoPresupuesto.js';

export default function MensajePresupuesto({ presupuesto }) {
  const campo = useRef(null);
  const [estado, setEstado] = useState('');
  const texto = generarTextoPresupuesto(presupuesto);

  async function copiar() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        campo.current?.focus();
        campo.current?.select();
        if (!document.execCommand('copy')) throw new Error('El navegador no permitió copiar.');
      }
      setEstado('Presupuesto copiado. Ya podés pegarlo en el chat.');
    } catch {
      setEstado('No se pudo copiar automáticamente. Mantené presionado el texto, seleccioná todo y tocá Copiar.');
    }
  }

  function seleccionarTodo(evento) {
    evento.currentTarget.select();
  }

  if (!texto) return null;

  return (
    <section className="panel mensaje-presupuesto" aria-labelledby="tit-mensaje">
      <div className="mensaje-presupuesto-encabezado">
        <div>
          <h2 id="tit-mensaje">Mensaje listo para enviar</h2>
          <p>Mantené presionado el texto para seleccionar y copiar, o usá el botón.</p>
        </div>
        <button type="button" className="boton-principal boton-copiar" onClick={copiar}>
          Copiar presupuesto
        </button>
      </div>
      <textarea
        ref={campo}
        className="texto-presupuesto"
        aria-label="Texto del presupuesto para copiar"
        readOnly
        rows={Math.min(18, texto.split('\n').length)}
        value={texto}
        onFocus={seleccionarTodo}
      />
      <p className="mensaje-copiar-estado" role="status" aria-live="polite">{estado}</p>
    </section>
  );
}
