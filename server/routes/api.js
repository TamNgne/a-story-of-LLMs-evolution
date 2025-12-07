import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/Benchmark.js';
import ComparisonChartModel from '../models/ConparisionChart.js';
import PercentageModel from '../models/Percentage.js';
import PerformanceModel from '../models/LlmPerformance.js';

const router = express.Router();

// GET /api/llms - Fetch all LLM documents
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