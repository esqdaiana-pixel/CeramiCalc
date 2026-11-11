import { armarCatalogo } from './catalogo.js';

// Lee productos y variantes. Los costos NO se leen: la tabla está cerrada para los asesores.
export async function cargarCatalogo(supabase) {
  const [productos, variantes] = await Promise.all([
    supabase
      .from('productos')
      .select('producto_id, fabricante, modelo, tamano, unidad_venta, m2_por_caja, tipo_producto'),
    supabase.from('variantes').select('variante_id, producto_id, calidad, m2_por_caja, precio_lista, precio_efectivo'),
  ]);

  if (productos.error) throw productos.error;
  if (variantes.error) throw variantes.error;

  return armarCatalogo(productos.data, variantes.data);
}

export async function cargarMateriales(supabase) {
  const { data, error } = await supabase
    .from('materiales')
    .select('material_id, tipo, marca, nombre, aplicacion, presentacion, cobertura_m2, precio_efectivo')
    .order('marca')
    .order('nombre');

  if (error) throw error;

  return data.map((material) => ({
    id: material.material_id,
    tipo: material.tipo,
    marca: material.marca,
    nombre: material.nombre,
    aplicacion: material.aplicacion,
    presentacion: material.presentacion,
    coberturaM2: Number(material.cobertura_m2),
    precioEfectivo: Number(material.precio_efectivo),
  }));
}

export async function verificarPropietario(supabase) {
  const { data, error } = await supabase.rpc('es_propietario');
  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('Supabase devolvió una autorización inválida.');
  return data;
}

export async function cargarRentabilidad(supabase, productoId, calidad) {
  const { data, error } = await supabase.rpc('consultar_rentabilidad', {
    p_producto_id: productoId,
    p_calidad: calidad,
  });
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('Supabase devolvió un informe de rentabilidad inválido.');
  if (data.length !== 1) throw new Error('No hay un costo cargado para el producto y la calidad seleccionados.');
  return data[0];
}
