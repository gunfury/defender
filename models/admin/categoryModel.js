const mongoose = require('mongoose');


const CategorySchema=new mongoose.Schema({
    Category:{
        type:String
    } ,
    discount:{
        type:Number
    },
    startDate:{ type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),},
    endDate:{ type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),},
    isBlocked: {
        type: Boolean,
        default: false // Assuming categories are initially not blocked
    }
     
   
})

module.exports=mongoose.model('category',CategorySchema)