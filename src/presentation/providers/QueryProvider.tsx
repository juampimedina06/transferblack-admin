import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: Props) => {
  // Aseguramos que el QueryClient se inicialice solo una vez por ciclo de vida de React
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
            staleTime: 1000 * 60, // 1 minuto por defecto para evitar sobrecarga de requests
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
