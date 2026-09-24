# Frontend y Diseño - Mejores Prácticas

- **Excelencia Visual y de UX:** Priorizar interfaces modernas, dinámicas y de alta calidad (vibrant colors, dark modes, glassmorphism, micro-interacciones, tipografía moderna).
- **Atención al Detalle:** Cada componente debe sentirse premium. Cuidar los márgenes, paddings, y la consistencia en el diseño. Implementar animaciones sutiles (hover states, transiciones fluidas) para mejorar el "feel" de la aplicación.
- **Enfoque Sistemático:** Construir primero un buen sistema de diseño (tokens, utilidades base) y desarrollar componentes reutilizables y enfocados.
- **Optimización y Accesibilidad:** Mantener HTML semántico, etiquetas descriptivas y rendimiento óptimo.
- **Calidad de Código:** Favorecer código modular, limpio, testeable. No sacrificar solidez por velocidad.

## Backend — solo lectura, nunca modificar

- El proyecto de backend es `transferblack/backend`. El agente **nunca** modifica archivos de este repo (ni "arreglos rápidos", ni refactors, ni ajustes de tipos).
- Si el agente tiene una duda sobre backend (endpoint, modelo, contrato de datos, response shape, etc.), primero **se fija en el código existente** del repo (rutas, controllers, services, models) antes de asumir o inventar algo.
- Si después de revisar el código sigue con dudas, o detecta que hace falta un cambio en el backend para completar la tarea del front, **no lo hace**: se detiene y le pide explícitamente al usuario que haga el cambio, describiendo:
  - Qué archivo/endpoint/modelo está en duda.
  - Qué cambio concreto necesitaría (ej. "agregar campo `x` al response de `GET /trips/:id`").
  - Por qué lo necesita para completar la tarea del front.
- Ninguna tarea de front se marca como completa si depende de un cambio de backend pendiente: queda explícitamente bloqueada hasta que el usuario confirme que lo hizo.

## Referencia de estructura ante dudas

- Si tiene dudas sobre cómo estructurar algo (carpetas, capas, convención de nombres, patrón de servicio/repositorio, etc.), usar como referencia los proyectos `MapsApp` y `ProductsApp`, ubicados en el mismo directorio base.
- Priorizar consistencia con esos proyectos por sobre inventar un patrón nuevo, salvo que el usuario indique lo contrario.

## Build y entorno (Vite)
- No commitear el bundle (`dist/`) ni archivos de `.vite/` cache.
- Variables de entorno con prefijo `VITE_` explícito; nunca hardcodear URLs/keys en el código.
- Separar config por entorno (`.env.development`, `.env.production`) y no exponer secrets en variables `VITE_*` (todo lo que empieza con `VITE_` queda expuesto en el bundle cliente).
- Alias de imports (`@/components`, `@/hooks`, etc.) configurados en `vite.config.ts` y `tsconfig.json` en simultáneo para que no se rompa el autocompletado.

## Routing (React Router)
- Rutas tipadas o centralizadas en un archivo de constantes, no strings sueltos repetidos.
- Code splitting por ruta con `React.lazy` + `Suspense`, no un solo bundle gigante.
- `ErrorBoundary` por ruta o por layout, no solo uno global genérico sin contexto.

## Tailwind (web)
- No usar clases arbitrarias (`w-[123px]`) si existe un valor cercano en la escala; si se repite un valor arbitrario 2+ veces, agregarlo a `tailwind.config.js`.
- Clases condicionales con `clsx`/`cva`, nunca concatenación manual de strings.
- Componentes con muchas variantes de estilo (botones, badges) resueltos con `cva` (class-variance-authority), no con ifs sueltos en el JSX.
- Revisar que `content` en `tailwind.config.js` cubra todos los paths reales (incluyendo librerías propias si las hay), o clases no se generan en build.
- No mezclar Tailwind con CSS modules/styled-components en el mismo componente salvo excepción justificada.

## Data fetching (TanStack Query, ya que lo usás en otros proyectos)
- `queryKey` siempre en array con todos los parámetros que afectan la query (evitar cache stale por key incompleta).
- `staleTime`/`gcTime` definidos explícitamente según el caso, no dejar todo en default si hay datos que cambian poco.
- Loading/error/empty state manejados en el componente que consume el hook, no solo loguear el error.
- Invalidaciones de cache explícitas tras mutaciones (`invalidateQueries` con key específica, no invalidar todo el cache).

## Formularios (web)
- React Hook Form + Zod resolver como estándar, no manejar formularios grandes con `useState` suelto por campo.
- Mensajes de error de validación centralizados en el schema de Zod, no hardcodeados en el JSX.
- Deshabilitar submit mientras la request está en curso (evitar doble submit).

## SEO / meta (si aplica, no SPA pura interna)
- `<title>` y meta tags dinámicos por ruta (react-helmet-async o similar), no un solo `index.html` estático si hay contenido público.

## Performance
- `React.memo` solo en componentes que re-renderizan seguido con las mismas props, no aplicarlo por costumbre.
- Imágenes con `loading="lazy"` y dimensiones explícitas para evitar layout shift.
- Revisar bundle size con `vite-bundle-visualizer` antes de agregar librerías pesadas nuevas.

## Accesibilidad (web)
- Elementos interactivos con `<button>`/`<a>` semánticos, no `<div onClick>`.
- Focus visible en elementos interactivos (no remover el outline sin reemplazo).
- Labels asociados a inputs (`htmlFor` + `id`), no placeholder como único indicador.