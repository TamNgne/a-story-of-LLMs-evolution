import express from 'express';
import LlmModel from '../models/LlmModel.js';
import BenchmarkModel from '../models/BenchmarkModel.js';

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

export default router;

