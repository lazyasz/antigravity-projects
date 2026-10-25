import { useState, useEffect } from 'react';
import { getFile } from '../services/api';

export function useFile(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getFile(id);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load file details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}
