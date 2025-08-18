import { useState, useEffect } from 'react';

function getValueFromStorage<T>(key: string, defaultValue: T): T {
  // Getting stored value
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved) as T;
      } catch (error) {
        console.error("Error parsing JSON from localStorage", error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getValueFromStorage(key, defaultValue);
  });

  useEffect(() => {
    // Storing value
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}