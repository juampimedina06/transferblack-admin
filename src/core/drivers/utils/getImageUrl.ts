export const getImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // Si ya es una URL válida (ej. cuando implementen S3 o Cloudinary)
  if (filePath.startsWith('http')) return filePath;
  
  // MOCK PARA DEMO: Si viene una ruta de disco (/opt/render/...), devolvemos una imagen de prueba
  // con un aviso de que falta implementar el almacenamiento en la nube.
  return 'https://placehold.co/600x400/e2e8f0/475569.png?text=Requiere\\nAWS/S3';
};
