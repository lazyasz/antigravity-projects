import { useState, useEffect } from 'react';
import { getTechnicalDebt } from '../services/api';

export function useTechnicalDebt() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getTechnicalDebt();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load technical debt data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
