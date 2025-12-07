import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/Benchmark.js';
import PercentageModel from '../models/Percentage.js';
import PerformanceModel from '../models/LlmPerformance.js';
import LLMOverallInfoModel from '../models/LLMOverallInfo.js';

const router = express.Router();

// GET /api/llms - Fetch all LLM documents
router.get('/llms', async (req, res) => {
  try {
    const llms = await LlmModel.find({}).sort({ release_date: 1 });
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

//benchmark master data
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

//performance chart 
router.get('/performance', async (req, res) => {
  try {
    const performances = await PerformanceModel.find({});
    res.json({
      success: true,
      count: performances.length,
      data: performances,
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

//feature proportion chart
router.get('/percentage', async (req, res) => {
  try {
    const percentages = await PercentageModel.find(
      {},{
        task: 1,
        percentage: 1,
        models: 1
      }
    )
    res.json({
      success: true,
      data: percentages,
    });
  } catch (error) {
    console.error('Error fetching Percentages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Percentage data',
      message: error.message,
    });
  }
});

// GET /api/comparison - Fetch comparison data
router.get('/comparison', async (req, res) => {
  try {
    const data = await LLMOverallInfoModel.find({});

    console.log(`Successfully processed ${data.length} comparison records`);
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison data',
      message: error.message,
    });
  }
});

export default router;