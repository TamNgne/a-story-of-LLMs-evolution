import mongoose from 'mongoose';

const comparisionChartSchema = new mongoose.Schema(
  {
    // Thông tin nhận diện model
    Model: {
      type: String,
      required: true,
      trim: true,
    },
    Provider: {
      type: String,
      required: true,
      trim: true,
    },

    'Speed (tokens/sec)': {
      type: Number,
      required: true,
    },
    'Latency (sec)': {
      type: Number,
      required: true,
    },
    'Benchmark (MMLU)': {
      type: Number,
      required: false,
    },
    'Benchmark (Chatbot Arena)': {
      type: Number,
      required: false,
    },
    'Price / Million Tokens': {
      type: Number,
      required: true,
    },
    'Energy Efficiency': {
      type: Number,
      required: false,
    },

    'Quality Rating': {
      type: Number,
      required: true,
    },
    'Speed Rating': {
      type: Number,
      required: true,
    },
    'Price Rating': {
      type: Number,
      required: true,
    },

    'Context Window': {
      type: Number,
      required: false,
    },
    'Training Dataset Size': {
      type: Number,
      required: false,
    },
    'Compute Power': {
      type: Number,
      required: false,
    },

    'Open-Source': {
      type: Number, 
      required: true,
      enum: [0, 1],
    },
  },
  {
    timestamps: true,
    collection: 'Comparison Chart', // Specify the collection name
  }
);

// Model name: ComparisonChart, collection: "Comparison Chart"
const ComparisonChartModel = mongoose.model('ComparisonChart', comparisionChartSchema);

export default ComparisonChartModel;
