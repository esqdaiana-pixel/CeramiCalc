import { useEffect, useMemo, useState } from 'react';
import { filtrarProductos, listarTamanos } from '../lib/catalogo.js';
import { evaluarPresupuesto } from '../lib/evaluar.js';
import { registrarEvento } from '../lib/analytics.js';
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

  useEffect(() => {
    const consulta = texto.trim();
    if (consulta.length < 2) return undefined;

    const temporizador = window.setTimeout(() => {
      registrarEvento('product_search', {
        query_length: consulta.length,
        results_count: visibles.length,
      });
    }, 700);

    return () => window.clearTimeout(temporizador);
  }, [texto, visibles.length]);

  function cambiarBusqueda(nuevoTexto) {
    setTexto(nuevoTexto);
    setProductoId(null);
  }

  function elegirProducto(id) {
    const seleccionado = catalogo.find((item) => item.id === id);
    if (seleccionado) {
      registrarEvento('product_selected', {
        manufacturer: seleccionado.fabricante,
        product_format: seleccionado.tamano,
      });
    }
    setProductoId(id);
    setTexto('');
  }

  function elegirPegamento(id) {
    const material = pegamentos.find((item) => item.id === id);
    if (material) {
      registrarEvento('material_selected', {
        material_type: 'adhesive',
        application: material.aplicacion,
      });
    }
    setPegamentoId(id);
  }

  function elegirPastina(id) {
    const material = pastinas.find((item) => item.id === id);
    if (material) {
      registrarEvento('material_selected', {
        material_type: 'grout',
        application: material.aplicacion,
      });
    }
    setPastinaId(id);
  }

  function cambiarDescarte(activado) {
    registrarEvento('waste_option_changed', { enabled: activado });
    setDescarteActivo(activado);
  }

  function calcularPresupuesto() {
    const resultado = evaluarPresupuesto({ producto, m2Texto, descarteActivo, pctTexto, pegamento, pastina });
    if (resultado.ok) {
      registrarEvento('budget_calculation_completed', {
        has_waste: resultado.descartePct > 0,
        available_qualities: resultado.calidades.filter((calidad) => calidad.calidadDisponible).length,
      });
    } else {
      registrarEvento('budget_calculation_invalid', {
        error_count: resultado.errores.length,
      });
    }
    setCalculado(true);
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
          onDescarte={cambiarDescarte}
          pctTexto={pctTexto}
          onPct={setPctTexto}
          pegamentos={pegamentos}
          pegamentoId={pegamentoId}
          onPegamento={elegirPegamento}
          pastinas={pastinas}
          pastinaId={pastinaId}
          onPastina={elegirPastina}
          errores={evaluacion && !evaluacion.ok ? evaluacion.errores : []}
          onCalcular={calcularPresupuesto}
        />
        <Resultados resultado={evaluacion?.ok ? evaluacion : null} calculado={calculado} />
      </div>
    </div>
  );
}
