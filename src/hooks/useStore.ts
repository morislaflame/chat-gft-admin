import { useContext } from 'react';
import { Context } from '@/store/StoreProvider';

export const useStore = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
