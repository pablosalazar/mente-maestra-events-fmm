import { useNetwork } from '@/hooks/useNetwork';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import { useEffect } from 'react';

export function useFirestoreSync() {
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (isOnline) {
      enableNetwork(db).catch(console.error);
    } else {
      disableNetwork(db).catch(console.error);
    }
  }, [isOnline]);
}