import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch LLM data from the API
 * @returns {Object} { data, loading, error }
 */
export const useLlmData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/llms');
        setData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch LLM data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

/**
 * Custom hook to fetch benchmark data from the API
 * @returns {Object} { data, loading, error }
 */
export const useBenchmarkData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/benchmarks');
        setData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch benchmark data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

