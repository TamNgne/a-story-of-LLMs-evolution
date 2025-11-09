import mongoose from 'mongoose';

const llmSchema = new mongoose.Schema(
  {
    // Basic LLM information fields
    name: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
    },
    organization: {
      type: String,
    },
    parameters: {
      type: Number, // in billions
    },
    architecture: {
      type: String,
    },
    description: {
      type: String,
    },
    // Additional fields can be added based on your actual database schema
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'LLM overall info', // Specify the collection name
  }
);

// If your collection name is different, you can adjust it
// The model will use the collection name specified above
const LlmModel = mongoose.model('LLM', llmSchema);

export default LlmModel;

