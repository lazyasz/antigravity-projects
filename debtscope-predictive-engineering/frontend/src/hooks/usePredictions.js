import { useState, useEffect } from 'react';
import { getPredictions } from '../services/api';

export function usePredictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getPredictions();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load predictions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
