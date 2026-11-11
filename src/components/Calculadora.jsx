import { useEffect, useMemo, useState } from 'react';
import { filtrarProductos, listarTamanos } from '../lib/catalogo.js';
import { evaluarPresupuesto } from '../lib/evaluar.js';
import SeleccionProducto from './SeleccionProducto.jsx';
import FormularioCalculo from './FormularioCalculo.jsx';
import Resultados from './Resultados.jsx';

const cargarMaterialesVacios = () => Promise.resolve([]);

export default function Calculadora({
  cargarCatalogo,
  cargarMateriales = cargarMaterialesVacios,
  hidden = false,
  onPresupuestoChange,
}) {
  const [carga, setCarga] = useState({ fase: 'cargando', catalogo: [], materiales: [] });
  const [reintentos, setReintentos] = useState(0);

  const [texto, setTexto] = useState('');
  const [tamano, setTamano] = useState('');
  const [productoId, setProductoId] = useState(null);
  const [m2Texto, setM2Texto] = useState('');
  const [descarteActivo, setDescarteActivo] = useState(false);
  const [pctTexto, setPctTexto] = useState('');
  const [pegamentoId, setPegamentoId] = useState('');
  const [pastinaId, setPastinaId] = useState('');
  const [calculado, setCalculado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCarga({ fase: 'cargando', catalogo: [], materiales: [] });
    Promise.all([cargarCatalogo(), cargarMateriales()])
      .then(([catalogo, materiales]) => !cancelado && setCarga({ fase: 'listo', catalogo, materiales }))
      .catch(() => !cancelado && setCarga({ fase: 'error', catalogo: [], materiales: [] }));
    return () => {
      cancelado = true;
    };
  }, [cargarCatalogo, cargarMateriales, reintentos]);

  const { catalogo, materiales } = carga;
  const tamanos = useMemo(() => listarTamanos(catalogo), [catalogo]);
  const visibles = useMemo(() => filtrarProductos(catalogo, { texto, tamano }), [catalogo, texto, tamano]);
  const producto = useMemo(() => catalogo.find((p) => p.id === productoId) ?? null, [catalogo, productoId]);
  const pegamentos = useMemo(() => materiales.filter((m) => m.tipo === 'pegamento'), [materiales]);
  const pastinas = useMemo(() => materiales.filter((m) => m.tipo === 'pastina'), [materiales]);
  const pegamento = useMemo(() => pegamentos.find((m) => m.id === pegamentoId) ?? null, [pegamentos, pegamentoId]);
  const pastina = useMemo(() => pastinas.find((m) => m.id === pastinaId) ?? null, [pastinas, pastinaId]);

  // Una vez calculado, el presupuesto se mantiene al día ante cambios en los datos.
  const evaluacion = useMemo(
    () => (calculado ? evaluarPresupuesto({ producto, m2Texto, descarteActivo, pctTexto, pegamento, pastina }) : null),
    [calculado, producto, m2Texto, descarteActivo, pctTexto, pegamento, pastina],
  );
  useEffect(() => {
    onPresupuestoChange?.(evaluacion?.ok ? evaluacion : null);
  }, [evaluacion, onPresupuestoChange]);

  function cambiarBusqueda(nuevoTexto) {
    setTexto(nuevoTexto);
    setProductoId(null);
  }

  function elegirProducto(id) {
    setProductoId(id);
    setTexto('');
  }

  if (carga.fase === 'cargando') return <div hidden={hidden}><p className="estado">Cargando catálogo…</p></div>;

  if (carga.fase === 'error') {
    return (
      <div className="panel panel-aviso" hidden={hidden}>
        <h2>No se pudo cargar el catálogo</h2>
        <p>Revisá la conexión a internet y volvé a intentar. Si sigue fallando, cerrá sesión y entrá de nuevo.</p>
        <button type="button" className="boton-principal" onClick={() => setReintentos((n) => n + 1)}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="pantalla" hidden={hidden}>
      <SeleccionProducto
        productos={visibles}
        tamanos={tamanos}
        texto={texto}
        onTexto={cambiarBusqueda}
        tamano={tamano}
        onTamano={(nuevoTamano) => {
          setTamano(nuevoTamano);
          setProductoId(null);
        }}
        producto={producto}
        onElegirProducto={elegirProducto}
      />
      <div className="columna-derecha">
        <FormularioCalculo
          producto={producto}
          m2Texto={m2Texto}
          onM2={setM2Texto}
          descarteActivo={descarteActivo}
          onDescarte={setDescarteActivo}
          pctTexto={pctTexto}
          onPct={setPctTexto}
          pegamentos={pegamentos}
          pegamentoId={pegamentoId}
          onPegamento={setPegamentoId}
          pastinas={pastinas}
          pastinaId={pastinaId}
          onPastina={setPastinaId}
          errores={evaluacion && !evaluacion.ok ? evaluacion.errores : []}
          onCalcular={() => setCalculado(true)}
        />
        <Resultados resultado={evaluacion?.ok ? evaluacion : null} calculado={calculado} />
      </div>
    </div>
  );
}
