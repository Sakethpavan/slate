import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number
) {
  const timerRef = useRef<number | undefined>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  );
}
