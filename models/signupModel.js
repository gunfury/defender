const mongoose = require('mongoose')

const signupSchema= new mongoose.Schema({ 
    username:{
        type:String,

    },
    email:{
        type:String,
       

    },
    password:{
        type:String,
       

    } ,
    images: {
        type:[String]
    },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [{
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            date: { type: Date, default: Date.now },
        }],
    },
    isBlocked:{
        type:Boolean,
        default:false
    }  
})


module.exports = mongoose.model("Users",signupSchema)