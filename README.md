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

## Google Analytics 4

La etiqueta GA4 usa el ID de medición configurado en `index.html`. Se registran `product_search` (solo longitud de búsqueda y número de resultados, nunca el texto), `product_selected` (marca y formato, no modelo), `material_selected` (tipo y aplicación), `waste_option_changed`, `budget_calculation_completed`, `budget_calculation_invalid`, `budget_message_opened`, `budget_copied` y `budget_copy_failed`. No se envían m², precios, nombres de modelos, contenido del presupuesto ni mensajes de error. `budget_message_opened` significa que se abrió la vista del texto y `budget_copied` que se usó el botón de copia; la aplicación no puede confirmar que el asesor finalmente lo haya enviado por WhatsApp.

Para analizar estos eventos, abrí GA4 → **Informes → Interacción → Eventos**. Los eventos nuevos pueden tardar hasta 24 horas en aparecer ahí; para validar una sesión usá **Informes → Tiempo real** o **DebugView**. Para desglosarlos por parámetros, creá dimensiones personalizadas de evento en **Administrador → Visualización de datos → Definiciones personalizadas**: `manufacturer`, `product_format`, `material_type`, `application`, `method`, `has_waste` y `enabled`. Para valores numéricos como `results_count`, `query_length`, `available_qualities` y `error_count`, creá métricas personalizadas de evento. Los parámetros no se agregan retroactivamente a los informes.

Si querés marcar una acción como conversión, en **Administrador → Visualización de datos → Eventos clave** marcá `budget_calculation_completed` y/o `budget_copied`. El primero cuenta presupuestos calculados; el segundo, usos del botón de copiar (no confirma el envío por WhatsApp).
