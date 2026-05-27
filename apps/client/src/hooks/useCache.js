import { useState, useEffect } from 'react';

// Global cache store
const cache = new Map();

/**
 * A custom hook for zero-latency data rendering.
 * It immediately returns cached data if available, then silently fetches fresh data in the background.
 */
export function useCache(key, fetcher, dependencies = []) {
  const [data, setData] = useState(cache.get(key) || null);
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // If we don't have cache, show loading
      if (!cache.has(key)) {
        setLoading(true);
      }

      try {
        const freshData = await fetcher();
        if (isMounted) {
          cache.set(key, freshData);
          setData(freshData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [key, ...dependencies]);

  return { data, loading, error, mutate: setData };
}
