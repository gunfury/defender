const mongoose = require('mongoose')

const addressSchema= new mongoose.Schema({ 

userName:{
    type:String,
},
userID:{
    type:String,
},
address:{
    type:String,
},
city:{
    type:String,
},
state:{
    type:String,
},
zipCode:{
    type:String,
},
country:{
    type:String,
},
phone:{
    type:String,

},
})


module.exports = mongoose.model("address",addressSchema)