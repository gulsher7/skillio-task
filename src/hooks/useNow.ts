import { useEffect, useState } from 'react';

/** A clock that only ticks as often as the UI actually needs. */
export function useNow(intervalMs = 20000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
