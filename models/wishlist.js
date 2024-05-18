const mongoose = require('mongoose');
const {Schema} = mongoose;


const wishlistItemSchema = new mongoose.Schema({
    
  userId : {
      type : String,
  },
  productId :{
    type: mongoose.Types.ObjectId
  },
  productName: {
    type: String,
  },
  productImage: {
    type: [String]
  },    
  price: {
    type: Number,
  },
  addedAt: {
    type: Date,
    default: Date.now
  }

});

const Wishlist = mongoose.model('Wishlist',wishlistItemSchema);

module.exports = Wishlist;