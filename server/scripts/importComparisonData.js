import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ComparisonChartModel from '../models/ConparisionChart.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV file path
const CSV_PATH = path.join(__dirname, '../../llm_comparison_dataset.csv');

// Simple CSV parser (handles basic CSV without quoted fields)
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Simple split by comma (works for this CSV format)
    const values = lines[i].split(',').map(v => v.trim());
    
    // Ensure we have the same number of values as headers
    if (values.length !== headers.length) {
      console.warn(`⚠️  Line ${i + 1} has ${values.length} values but ${headers.length} headers. Skipping...`);
      continue;
    }
    
    const record = {};
    
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Convert to number if possible (but keep as string if it's empty or NaN)
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          value = numValue;
        }
      } else {
        value = null;
      }
      
      record[header] = value;
    });
    
    data.push(record);
  }
  
  return data;
}

// Import data to MongoDB
async function importData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    console.log(`📖 Reading CSV file: ${CSV_PATH}`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parseCSV(csvContent);
    console.log(`📊 Found ${records.length} records in CSV`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data from Comparison Chart collection...');
    await ComparisonChartModel.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert data
    console.log('💾 Inserting data into MongoDB...');
    const result = await ComparisonChartModel.insertMany(records, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} records`);

    // Verify
    const count = await ComparisonChartModel.countDocuments();
    console.log(`📈 Total documents in collection: ${count}`);

    // Show sample
    const sample = await ComparisonChartModel.findOne();
    if (sample) {
      console.log('📄 Sample document:');
      console.log(JSON.stringify(sample.toObject(), null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    if (error.writeErrors) {
      console.error('Write errors:', error.writeErrors);
    }
    process.exit(1);
  }
}

// Run import
importData();

