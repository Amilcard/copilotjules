// filepath: src/hooks/useFormAutoSave.ts
import { useEffect } from 'react';

export function useFormAutoSave(formState: any, key: string) {
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(formState));
  }, [formState, key]);
}
