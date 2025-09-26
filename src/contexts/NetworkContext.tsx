import { createContext, type ReactNode } from 'react';
import { useNetworkStatus, type NetworkStatus } from '@/hooks/useNetworkStatus';

const NetworkContext = createContext<NetworkStatus | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const networkStatus = useNetworkStatus();

  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
}

export { NetworkContext };