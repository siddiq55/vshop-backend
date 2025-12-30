// schema for products
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: {

        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
      
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
       
    },
   date: {
        type: Date,
        default: Date.now
    }, 

});

export default mongoose.model('Product', productSchema);