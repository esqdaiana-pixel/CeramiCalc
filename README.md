# CeramiCalc

Calculadora web pública para presupuestar cerámicas, pegamentos y pastinas. React + Vite, conectado a Supabase.

## Desarrollo local

1. Copiá `.env.example` como `.env` y completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y la clave pública `anon`/`publishable` de Supabase.
2. Ejecutá `npm install` y `npm run dev`.

Nunca uses la clave `service_role` en el frontend ni la subas al repositorio.

## Publicación en Vercel

1. Importá el repositorio privado `CeramiCalc` en Vercel.
2. Vercel detecta Vite automáticamente: comando de build `npm run build`, directorio de salida `dist`.
3. En **Settings → Environment Variables**, agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para Production (y Preview si querés).
4. Hacé el deploy. La calculadora es pública y no requiere cuenta.

Supabase debe tener habilitada lectura anónima únicamente para `productos`, `variantes` y `materiales`, con RLS activo. La tabla `costos` y las funciones de rentabilidad siguen protegidas.
