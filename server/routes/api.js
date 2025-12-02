import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/BenchmarkModel.js';
import ComparisonChartModel from '../models/ConparisionChart.js';

const router = express.Router();

// GET /api/llms - Fetch all LLM documents
router.get('/llms', async (req, res) => {
  try {
    const llms = await LlmModel.find({}).sort({ releaseDate: 1 });
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

// GET /api/llms/:id - Fetch a single LLM by ID
router.get('/llms/:id', async (req, res) => {
  try {
    const llm = await LlmModel.findById(req.params.id);
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

// GET /api/benchmarks - Fetch all benchmark data
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

// GET /api/benchmarks/:llmName - Fetch benchmarks for a specific LLM
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

// GET /api/comparison - Fetch comparison data
router.get('/comparison', async (req, res) => {
  try {
    const docs = await ComparisonChartModel.find({}).lean();

    const data = docs.map((d) => ({
      model: d.Model,
      provider: d.Provider,
      contextWindow: d['Context Window'],
      openSource: d['Open-Source'] === 1,

      // Các metric chính cho scatter plot:
      performance: d['Quality Rating'],
      cost: d['Price / Million Tokens'],
      speed: d['Speed (tokens/sec)'],
      latency: d['Latency (sec)'],

      // Metric phụ
      benchmarkMmlu: d['Benchmark (MMLU)'],
      benchmarkArena: d['Benchmark (Chatbot Arena)'],
      energyEfficiency: d['Energy Efficiency'],
      qualityRating: d['Quality Rating'],
      speedRating: d['Speed Rating'],
      priceRating: d['Price Rating'],
      trainingDatasetSize: d['Training Dataset Size'],
      computePower: d['Compute Power'],
    }));

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