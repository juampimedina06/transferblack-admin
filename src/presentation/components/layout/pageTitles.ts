/** Titulo de cada pantalla privada: se muestra en el encabezado y en la pestaña del navegador. */
const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard', title: 'Dashboard' },
  { prefix: '/mapa', title: 'Mapa en vivo' },
  { prefix: '/viajes-reservados', title: 'Viajes reservados' },
  { prefix: '/viajes', title: 'Viajes' },
  { prefix: '/traslados-recurrentes', title: 'Traslados recurrentes' },
  { prefix: '/conductores', title: 'Conductores' },
  { prefix: '/retiros', title: 'Retiros y billeteras' },
  { prefix: '/reclamos-reembolso', title: 'Reclamos de reembolso' },
  { prefix: '/empresas', title: 'Empresas' },
  { prefix: '/pasajeros', title: 'Pasajeros' },
  { prefix: '/configuracion', title: 'Configuración' },
];

export const getPageTitle = (pathname: string): string =>
  PAGE_TITLES.find((page) => pathname.startsWith(page.prefix))?.title ?? 'Panel';
