import React from 'react';
import { HostUrlContext, useHostUrlProvider } from '@/hooks/use-host-url';

interface HostUrlProviderProps {
  children: React.ReactNode;
}

export function HostUrlProvider({ children }: HostUrlProviderProps) {
  const hostUrlValue = useHostUrlProvider();

  return (
    <HostUrlContext.Provider value={hostUrlValue}>
      {children}
    </HostUrlContext.Provider>
  );
}