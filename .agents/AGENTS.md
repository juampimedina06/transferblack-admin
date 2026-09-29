# Frontend y Diseño - Mejores Prácticas

- **Excelencia Visual y de UX:** Priorizar interfaces modernas, dinámicas y de alta calidad (vibrant colors, dark modes, glassmorphism, micro-interacciones, tipografía moderna).
- **Atención al Detalle:** Cada componente debe sentirse premium. Cuidar los márgenes, paddings, y la consistencia en el diseño. Implementar animaciones sutiles (hover states, transiciones fluidas) para mejorar el "feel" de la aplicación.
- **Enfoque Sistemático:** Construir primero un buen sistema de diseño (tokens, utilidades base) y desarrollar componentes reutilizables y enfocados.
- **Optimización y Accesibilidad:** Mantener HTML semántico, etiquetas descriptivas y rendimiento óptimo.
- **Calidad de Código:** Favorecer código modular, limpio, testeable. No sacrificar solidez por velocidad.

## Experiencia de Usuario (UX) — Hacerle la vida más fácil al usuario

- **Reducir la Fricción:** El objetivo principal en cada pantalla es que el usuario (admin, conductor, etc.) entienda exactamente qué está pasando y qué tiene que hacer sin dudar.
- **Anticipar Errores:** Si una acción no se puede realizar (ej. aprobar un conductor sin todos los documentos), la UI debe comunicarlo claramente _antes_ o _en el momento_ de intentarlo, explicando por qué y dando la solución (ej. "Falta agendar reunión").
- **Estados Visibles y Dinámicos:** Evitar transiciones bruscas (como que algo desaparezca sin más). Usar feedback visual continuo (loaders, banners rojos de error, checks verdes, animaciones sutiles) para que el usuario nunca se pregunte "Qué pasó, funcionó mi click?".
- **Guiar al Usuario:** Nunca lo dejes "atrapado" en un error de servidor incomprensible. Traducir siempre los errores técnicos a instrucciones humanas.
- **En resumen:** Si tu diseño le requiere pensar de más al usuario para hacer su tarea diaria, hay que rediseñarlo. Siempre ponte en sus zapatos.

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

## Ley de estructura — respetar la del proyecto
- Antes de crear cualquier componente, hook, servicio o archivo nuevo, el agente revisa la estructura de carpetas ya existente en el proyecto y sigue ese mismo patrón (ubicación, nomenclatura, forma de exportar, etc.).
- Prohibido crear componentes "sueltos" fuera de la estructura (ej. un componente en la raíz de `src/` si el proyecto organiza todo por `features/` o `screens/`).
- Si hay dudas sobre dónde debería ir algo nuevo, buscar un archivo análogo ya existente en el proyecto y replicar su ubicación y convención, no inventar una carpeta nueva por las dudas.
- Si el patrón existente no cubre el caso nuevo (ej. no hay convención para algo tipo modal), preguntar al usuario antes de decidir una estructura nueva.

## Animación de números — "conteo" en vez de aparición instantánea
- Cualquier número que se muestre en un panel/card/dashboard (totales, montos, contadores, KPIs) debe animarse "sumando" desde 0 (o desde el valor anterior) hasta el valor final, nunca aparecer de golpe.
- Usar una librería ya probada para esto (ej. `react-native-count-up`/hook propio con `Animated`/Reanimated en RN, o `react-countup`/`@number-flow` en web), no reinventar el timing a mano en cada componente.
- Duración corta y consistente en toda la app (ej. 400-800ms), no animaciones lentas que hagan sentir la UI pesada.
- Si el número cambia mientras el usuario está en la pantalla (ej. actualización en tiempo real), animar desde el valor anterior al nuevo, no resetear a 0.
- Crear un componente reutilizable único (ej. `<AnimatedNumber value={x} />`) y usarlo en todos los paneles, no duplicar la lógica de animación por pantalla.

## Dark mode / Light mode — soporte obligatorio
- Todo componente o pantalla nueva debe funcionar correctamente tanto en tema claro como oscuro, sin excepción.
- Nunca hardcodear colores fijos (ej. `bg-white`, `text-black`, `#FFFFFF`) sin su contraparte para el otro tema.
- Usar el sistema de theming ya definido en el proyecto (tokens de color, variables de Tailwind con `dark:`, o el theme provider que corresponda), no valores sueltos por componente.
- Antes de dar por terminada una tarea, verificar visualmente (o mentalmente si no hay forma de togglear) que el componente se ve bien en ambos temas: contraste de texto, bordes, iconos, estados (hover/focus/disabled) y sombras.
- Si el proyecto no tiene aún un token o color definido para un caso nuevo, no inventar uno suelto: agregarlo al sistema de theming centralizado (config de Tailwind, theme file, etc.) para que quede disponible para todos.