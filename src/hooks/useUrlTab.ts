import { useCallback, useEffect, useState } from 'react';

/**
 * Sync a Tabs value with a URL search param so sub-views are shareable.
 * Returns [value, setValue] suitable for `<Tabs value=... onValueChange=...>`.
 */
export const useUrlTab = (key: string, defaultValue: string) => {
  const read = () => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  };

  const [value, setValueState] = useState<string>(read);

  useEffect(() => {
    const onPop = () => setValueState(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: string) => {
      setValueState(next);
      const params = new URLSearchParams(window.location.search);
      if (next === defaultValue) params.delete(key);
      else params.set(key, next);
      const search = params.toString();
      const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', newUrl);
    },
    [key, defaultValue]
  );

  return [value, setValue] as const;
};
