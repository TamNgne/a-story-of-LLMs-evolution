import mongoose from 'mongoose';

const llmPerformanceSchema = new mongoose.Schema(
  {
    benchmark_id: {
        type: String,
        unique: true,
        required: true,
    },
    model_id: {
        type: String,
        required: true,
    },
    normalized_score: {
        type: Number,
        required: true,
    }
  },
  {
    timestamps: true,
    collection: 'LLM Performance',
 }
);
        
const PerformanceModel = mongoose.model('Performance', llmPerformanceSchema);
        
export default PerformanceModel;