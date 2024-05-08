
const mongoose = require('mongoose');
const { Schema } = mongoose;



const cartSchema = new Schema({
    userid: {
        type: mongoose.Types.ObjectId
    },
    productid: {
        type: mongoose.Types.ObjectId
    },
    product: {
        type: String
    },
    price: {
        type: Number
    },
    description:{
        type: String
    },
    quantity: {
        type: Number
    },
    image: {
        type: [String]
    },
    totalPrice: {
        type: Number
    },
    category:{
        type: String
    },
    stock:{
        type: Number,
        
    },
});

const cartCollection = mongoose.model('cart', cartSchema);

module.exports = cartCollection;
