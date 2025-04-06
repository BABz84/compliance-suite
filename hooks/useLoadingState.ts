import { useState, useCallback } from 'react';

interface UseLoadingStateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

/**
 * Custom hook to manage loading state for async operations
 */
export function useLoadingState(options?: UseLoadingStateOptions) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  });

  const startLoading = useCallback(() => {
    setState({
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({
      isLoading: false,
      isError: true,
      error,
      isSuccess: false,
    });
    
    options?.onError?.(error);
  }, [options]);

  const setSuccess = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });
    
    options?.onSuccess?.();
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  /**
   * Helper to run an async function with loading state management
   */
  const runWithLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        startLoading();
        const result = await asyncFn();
        setSuccess();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return undefined;
      }
    },
    [startLoading, setSuccess, setError]
  );

  return {
    ...state,
    startLoading,
    setError,
    setSuccess,
    reset,
    runWithLoading,
  };
} 