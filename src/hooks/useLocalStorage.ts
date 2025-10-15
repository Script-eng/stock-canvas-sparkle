// import { useState, useEffect } from 'react';

// function getValueFromStorage<T>(key: string, defaultValue: T): T {
//   // Getting stored value
//   if (typeof window !== 'undefined') {
//     const saved = window.localStorage.getItem(key);
//     if (saved) {
//       try {
//         return JSON.parse(saved) as T;
//       } catch (error) {
//         console.error("Error parsing JSON from localStorage", error);
//         return defaultValue;
//       }
//     }
//   }
//   return defaultValue;
// }

// export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   const [value, setValue] = useState<T>(() => {
//     return getValueFromStorage(key, defaultValue);
//   });

//   useEffect(() => {
//     // Storing value
//     window.localStorage.setItem(key, JSON.stringify(value));
//   }, [key, value]);

//   return [value, setValue];
// }


// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

// Define the structure for a stored item with an optional expiry
interface StoredValue<T> {
  value: T;
  expiry?: number; // Unix timestamp in milliseconds
}

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  expiryInDays?: number // New optional parameter for expiry duration
): [T, SetValue<T>] {

  // Memoize the function to calculate the expiry timestamp
  const calculateExpiry = useCallback((days?: number) => {
    if (days === undefined || days === null) return undefined;
    const now = new Date();
    now.setDate(now.getDate() + days); // Add the specified number of days
    return now.getTime(); // Return as Unix timestamp (milliseconds)
  }, []);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem: StoredValue<T> = JSON.parse(item);

        // Check if an expiry was set and if the item has expired
        if (expiryInDays !== undefined && parsedItem.expiry && Date.now() > parsedItem.expiry) {
          // Item has expired, remove it from localStorage and return initial value
          window.localStorage.removeItem(key);
          console.log(`Local storage item "${key}" expired and was removed.`);
          return initialValue;
        }
        // Item is valid or no expiry was set, return its value
        return parsedItem.value;
      }
      // No item found in local storage, return initial value
      return initialValue;
    } catch (error) {
      console.error(`Error reading key "${key}" from local storage:`, error);
      return initialValue;
    }
  });

  // Effect to update local storage whenever storedValue changes
  // or if the expiry policy (expiryInDays) changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Create the object to store, including the value
      const valueToStore: StoredValue<T> = { value: storedValue };

      // If expiryInDays is provided, calculate and add the expiry timestamp
      if (expiryInDays !== undefined) {
        valueToStore.expiry = calculateExpiry(expiryInDays);
      }
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing key "${key}" to local storage:`, error);
    }
  }, [key, storedValue, expiryInDays, calculateExpiry]); // Dependencies for the effect

  // Return the stored value and the standard useState setter
  return [storedValue, setStoredValue];
}