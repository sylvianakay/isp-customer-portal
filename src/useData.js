import { useCallback, useEffect, useState } from 'react';

// Loads data from an async API function and exposes a reload().
export function useData(load) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    let active = true;
    load()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => reload(), [reload]);

  return { data, error, setData, reload };
}
