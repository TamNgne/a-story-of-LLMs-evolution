import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/BenchmarkModel.js';
import PercentageModel from '../models/Percentage.js';
import PerformanceModel from '../models/LlmPerformance.js';
const router = express.Router();

router.get('/llm', async (req, res) => {
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
 * GET /api/benchmarks
 * Fetch all benchmark documents, sorted by date
 */
router.get('/benchmark', async (req, res) => {
  try {
    const benchmarks = await BenchmarkModel.find({});
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
