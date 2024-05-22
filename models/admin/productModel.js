const mongoose = require('mongoose');




const productSchema=new mongoose.Schema({
    
    productName:{
        type:String
    },
    cartegory:{
        type:String
    },
    description:{
        type:String
    },
    images: {
        type:[String]

    },

    stock:{
        type:Number
    },
    price:{
        type:Number
    },
    offerPrice:{
        type:Number
    },
    discount:{
        type:Number
    },
    startDate:{ type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),},
    endDate:{ type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),},
    isBlocked: {
        type: Boolean,
        default: false // Assuming categories are initially not blocked
    }

});

module.exports=mongoose.model("product",productSchema);