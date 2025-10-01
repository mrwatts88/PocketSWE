import React from 'react';
import { OpenFilesContext, useOpenFilesProvider } from '@/hooks/use-open-files';

interface OpenFilesProviderProps {
  children: React.ReactNode;
}

export function OpenFilesProvider({ children }: OpenFilesProviderProps) {
  const openFilesValue = useOpenFilesProvider();

  return (
    <OpenFilesContext.Provider value={openFilesValue}>
      {children}
    </OpenFilesContext.Provider>
  );
}