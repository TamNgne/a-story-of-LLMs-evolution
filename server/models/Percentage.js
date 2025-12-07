import mongoose from 'mongoose';
const percentageSchema = new mongoose.Schema(
    {
        task:{
            type: String,
            required: true,
        },
        models:{
            type: Array, 
            required: true,
        },
        percentage:{
            type: Number, 
            required: true,
        }
    },
    {
        timestamps: true,
        collection: 'LLMs Task Percentages',
    }
);

const PercentageModel = mongoose.model('Percentage', percentageSchema);
export default PercentageModel;