import mongoose from 'mongoose';

const benchmarkSchema = new mongoose.Schema(
  {
    // Benchmark data fields
    llmName: {
      type: String,
      required: true,
    },
    benchmarkName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
    },
    metric: {
      type: String,
    },
    date: {
      type: Date,
    },
    // Additional fields can be added based on your actual database schema
  },
  {
    timestamps: true,
    collection: 'Benchmark MD', // Specify the collection name
  }
);

const BenchmarkModel = mongoose.model('Benchmark', benchmarkSchema);

export default BenchmarkModel;

