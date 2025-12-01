import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/BenchmarkModel.js';

const router = express.Router();

/**
 * Optional: GET /api/llms/avg_score
 * Fetch LLMs with avg_benchmark_score
 */
router.get('/llms/avg_score', async (req, res) => {
  try {
    const llms = await LlmModel.find(
      {},
      {name: 1, model_id: 1, release_date:1, avg_benchmark_score: 1, _id: 0 }
    )

    res.json({
      success: true,
      count: llms.length,
      data: llms,
    });
  } catch (error) {
    console.error('Error fetching LLM average scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch average benchmark scores',
      message: error.message,
    });
  }
});

/**
 * GET /api/llms
 * Fetch all LLM documents from merged collection, sorted by released_date
 */
router.get('/llms', async (req, res) => {
  try {
    const llms = await LlmModel.find({}).sort({ released_date: 1 });
    res.json({
      success: true,
      count: llms.length,
      data: llms,
    });
  } catch (error) {
    console.error('Error fetching LLMs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LLM data',
      message: error.message,
    });
  }
});

/**
 * GET /api/llms/:id
 * Fetch a single LLM by model_id (instead of Mongo _id)
 */
router.get('/llms/:model_id', async (req, res) => {
  try {
    const llm = await LlmModel.findOne({ model_id: req.params.model_id });
    if (!llm) {
      return res.status(404).json({
        success: false,
        error: 'LLM not found',
      });
    }
    res.json({
      success: true,
      data: llm,
    });
  } catch (error) {
    console.error('Error fetching LLM:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LLM data',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks
 * Fetch all benchmark documents, sorted by date
 */
router.get('/benchmarks', async (req, res) => {
  try {
    const benchmarks = await BenchmarkModel.find({}).sort({ date: 1 });
    res.json({
      success: true,
      count: benchmarks.length,
      data: benchmarks,
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benchmark data',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks/:llmName
 * Fetch benchmarks for a specific LLM by name
 */
router.get('/benchmarks/:llmName', async (req, res) => {
  try {
    const benchmarks = await BenchmarkModel.find({
      llmName: req.params.llmName,
    }).sort({ date: 1 });
    res.json({
      success: true,
      count: benchmarks.length,
      data: benchmarks,
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benchmark data',
      message: error.message,
    });
  }
});



export default router;
