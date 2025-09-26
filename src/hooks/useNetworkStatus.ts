import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
}

interface NetworkConnection {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown'
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection ? connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' : false,
        connectionType: connection ? connection.effectiveType : 'unknown'
      });
    };

    const handleOnline = () => {
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }));
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
}