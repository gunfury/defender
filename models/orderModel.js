const mongoose = require('mongoose');



const orderSchema = mongoose.Schema({
    orderNumber: { type: String},
    userId: { type: String },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId},
        productName: { type: String},
        productDescription: { type: String,},
        productRating: { type: Number,default:0,},
        status: { type: String,default:"Pending"},
        StockCount: { type: Number},
        productImage: { type: [String]},
        quantity: { type: Number,min: 1 },
        price: { type: Number,min: 0 },
        reason: { type: String,default: "" },
      
       
        refferalCode: { type: String },
    }],
    totalQuantity: { type: Number,min: 1 },
    totalPrice: { type: Number,min: 0 },
    address: {
        address:{type:String},
        city:{type:String},
        state:{type:String},
        country: {type:String},
        zipcode: {type:String},
        phone:{type:String},
    },
    couponCode: { type: String },
    discountPrice: { type: Number},
    paymentMethod: { type: String},
    orderDate: { type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),}
});


    
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;