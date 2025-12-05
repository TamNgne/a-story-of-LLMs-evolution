import mongoose from 'mongoose';

const benchmarkSchema = new mongoose.Schema(
  {
    benchmark_id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    max_score: {
      type: Number,
    },
    description: {
      type: String,
    },
    modality: {
      type: String,
    },
    
  },
  {
    timestamps: true,
    collection: 'Benchmark MD', 
  }
);

const BenchmarkModel = mongoose.model('Benchmark', benchmarkSchema);

export default BenchmarkModel;

