import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
        
    },
    quantity: {
        type: Number,
        min: 0,
        required: true
    }
    
})
const itemModel = mongoose.models.item || mongoose.model("item", itemSchema)

export default itemModel;

