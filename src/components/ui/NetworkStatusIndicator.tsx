import { useNetwork } from '@/hooks/useNetwork';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export function NetworkStatusIndicator() {
  const { isOnline, isSlowConnection, connectionType } = useNetwork();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline && !wasOffline.current) {
      toast.error('¡Conexión perdida! Por favor verifica tu conexión a internet.', {
        duration: Infinity,
        id: 'offline-toast'
      });
      wasOffline.current = true;
    } else if (isOnline && wasOffline.current) {
      toast.dismiss('offline-toast');
      toast.success('¡Conexión restaurada!');
      wasOffline.current = false;
    }

    if (isSlowConnection && isOnline) {
      toast.warning('Conexión lenta detectada. El rendimiento del juego puede verse afectado.', {
        duration: 5000
      });
    }
  }, [isOnline, isSlowConnection]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
        <span className="font-medium">⚠️ Sin conexión a internet</span>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 z-50">
        <span className="text-sm">🐌 Conexión lenta ({connectionType})</span>
      </div>
    );
  }

  return null;
}