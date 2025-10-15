import { useState, useCallback } from 'react';
import Logger from '../utils/logger';

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, errorMessage = 'Operation failed') => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return { success: true, data: result };
    } catch (err) {
      Logger.error(errorMessage, err);
      setError(err.message || errorMessage);
      return { success: false, error: err.message || errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};
