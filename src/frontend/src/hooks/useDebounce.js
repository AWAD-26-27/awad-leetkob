import { useState, useEffect } from '../lib/react.js';

/**
 * Custom hook to debounce any fast-changing value.
 * @template T
 * @param {T} value
 * @param {number} delayMs
 * @returns {T}
 */
export function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
