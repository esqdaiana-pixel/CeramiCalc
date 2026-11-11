import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las variables de entorno, la app lo avisa en pantalla en vez de romperse.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
