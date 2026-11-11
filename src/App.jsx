import { supabase } from './supabaseClient.js';
import { cargarCatalogo, cargarMateriales } from './lib/api.js';
import Calculadora from './components/Calculadora.jsx';

const cargarDesdeSupabase = () => cargarCatalogo(supabase);
const cargarMaterialesDesdeSupabase = () => cargarMateriales(supabase);

function ConfigFaltante() {
  return (
    <main className="centrado">
      <div className="panel panel-aviso">
        <h1>Falta configurar Supabase</h1>
        <p>
          La app no encuentra <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
          En Vercel, cargá ambas variables en Settings, Environment Variables.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  if (!supabase) return <ConfigFaltante />;

  return (
    <div className="app">
      <header className="encabezado">
        <div className="marca">
          <span className="marca-nombre">CeramiLucho</span>
          <span className="marca-detalle">Calculadora comercial</span>
        </div>
      </header>
      <main>
        <Calculadora
          cargarCatalogo={cargarDesdeSupabase}
          cargarMateriales={cargarMaterialesDesdeSupabase}
        />
      </main>
    </div>
  );
}
