import mongoose from 'mongoose';

const llmSchema = new mongoose.Schema(
  {
    // Unique identifier for the model
    model_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    provider_id: {
      type: String,
    },
    organization_id: {
      type: String,
    },
    release_date: {
      type: Date,
    },
    avg_benchmark_score: {
      type: Number,
    },
    description: {
      type: String,
    },
    source_api_ref: {
        type: String,
    },
    source_scorecard_blog_link: {
        type: String,
    },
    source_weights_link: {
        type: String,
    }
  },
  {
    timestamps: true,
    collection: 'LLM Merged Organization and Provider', // Merged collection
  }
);

// The model will use the collection name specified above
const LlmModel = mongoose.model('LLM', llmSchema);

export default LlmModel;
