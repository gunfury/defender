const mongoose = require('mongoose');


const CategorySchema=new mongoose.Schema({
    Category:{
        type:String
    } ,isBlocked: {
        type: Boolean,
        default: false // Assuming categories are initially not blocked
    }
     
   
})

module.exports=mongoose.model('category',CategorySchema)