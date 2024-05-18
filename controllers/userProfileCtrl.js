const express=require("express");
const router= express();
const signupcollection=require('../models/signupModel');
const flash = require('connect-flash');
const multer = require('multer');
const fs = require('fs');
const addressMdl=require('../models/addressMdl');
const productMdl=require('../models/admin/productModel');
const cartMdl=require('../models/cartModel');
const wishlistModel=require('../models/wishlist');
const orderModel=require('../models/orderModel');
const couponModel=require('../models/couponModel');
const { log } = require("console");
const Razorpay=require('razorpay');



exports.getUserProfile=async(req,res)=>{
    try{
        const userId=req.session.user;
        const userData=await signupcollection.findById({_id:userId})
        const errorMessage=req.flash("errorMessage");
        
    res.render('user/profile',{userData,errorMessage:errorMessage});
    }catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.getUserAddress=async(req,res)=>{
    try{
    const userSessionId=req.session.user;
    const addressData = await addressMdl.find({ userID: userSessionId });
    res.render('user/address',{addressData});
    }catch(error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.getcheckout=async(req,res)=>{
    try {
        const userId=req.session.user;
        const address=await addressMdl.find({userID:userId})
        const currentCart=await cartMdl.find({userid:userId})
        const couponData=await couponModel.find();
        res.render('user/checkout',{currentCart,address,couponData});
        
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
   
}



exports.getUserCart = async (req, res) => {
    try {
        const userId = req.session.user;
        
        // Assuming cartMdl is a Mongoose model for the cart
        const cartData = await cartMdl.find({ userid: userId });
        //console.log("Cart Data:", cartData);

        let totalPrice = 0;
        let allItemsInStock = true;

        // Iterate over cartData instead of cart
        for (const item of cartData) {
            // Assuming productMdl is a Mongoose model for products
            const product = await productMdl.findById(item.productid);
            console.log('product', product);

            // Handle case where product is not found
            if (!product) {
               
                continue; // Skip this item and move to the next one
            }

            console.log(`Product in cart: ${JSON.stringify(product)}`);

            // Convert price and quantity to numbers
            const price = parseFloat(product.price);
            const quantity = parseFloat(item.quantity);

            if (!isNaN(price) && !isNaN(quantity) && product.stock >= quantity) {
                let itemTotalPrice = price * quantity;
                totalPrice += itemTotalPrice;
            } else {
                allItemsInStock = false;
                console.log(`Product with ID: ${item.productid} is out of stock or invalid quantity.`);
            }
        }

       
        
       
        // Pass additional data to the template if needed
        res.render('user/cart', { cartData, totalPrice, allItemsInStock });

    } catch (error) {
        console.error("Error retrieving user cart:", error);
        res.status(500).send("Internal Server Error");
    }
};
exports.getChangeUSerName=async(req,res)=>{
    try {
        const errorMessage=req.flash("errorMessage");
        const sessionId=req.session.user;
        const userDetails=await signupcollection.findById({_id:sessionId}) ;
       
        res.render('user/changeUserName',{userDetails,errorMessage})
    } catch (error) {
        console.error("Error retrieving user cart:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.getChangeUserPassword=async(req,res)=>{
    try {
        const errorMessage=req.flash("errorMessage");
        res.render('user/changeUserPassword',{errorMessage})
        
    } catch (error) {
        
    }
}
exports.getSuccesspage=(req,res)=>{
    res.render('user/successpage');
}



exports.getUserOrder = async (req, res) => {
    try {
        const userdata = req.session.user;
        const page = parseInt(req.query.page)||1;
        
        const limit = 4; // Number of documents per page

        const totalCount = await orderModel.countDocuments({ userId: userdata });
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;
       

        const orderData = await orderModel.find({ userId: userdata })
                                          .sort({ orderDate: -1 })
                                          .skip(skip)
                                          .limit(limit);

        res.render('user/userOrder', { orderData, totalPages, currentPage: page });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).send("Internal Server Error");
    }
}


exports.getdownloadInvoice=async(req,res)=>{
    try {
        const orderId=req.params.id;
        const order=await orderModel.findById({_id:orderId});
      
        res.render('user/orderDetails',{order})
        
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.getwishlist=async(req,res)=>{
    try {
        const currentUser=req.session.user;
        const userWishlist=await wishlistModel.find({userId:currentUser})
        res.render('user/wishlist',{userWishlist});
        
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).send("Internal Server Error");    
    }
}
exports.getUserCoupon=async(req,res)=>{
    try {
        const couponData=await couponModel.find();
        res.render('user/coupon',{couponData});
        
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).send("Internal Server Error");      
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.posteditprofile = async (req, res) => {
    try {
        const { editedUserName, editPassword, editConfirmPassword} = req.body;
         const image=req.file;
        

        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const strongPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

        if (editedUserName.trim() !== editedUserName) {
            return res.json({ errorMessage: "Username should not start with whitespace" });
        } else if (!strongPasswordRegex.test(editPassword)) {
            return res.json({ errorMessage: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
        } else if (editPassword !== editConfirmPassword) {
            return res.json({ errorMessage: "Passwords do not match" });
        } else if (specialCharsRegex.test(editedUserName)) {
            return res.json({ errorMessage: "Username should not contain special characters" });
        } else {
            const userId = req.session.user;
           
            let updateUser = await signupcollection.findByIdAndUpdate(userId, {
                username: editedUserName,
                password: editPassword,
                
            }).then((pass) => {
                console.log("updateUser",updateUser);
                return res.json({ errorMessage: null });
              }); // To return the modified document
        
           
        }
     
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.postUserCart=async(req,res)=>{
    try{
        const userID=req.session.user;
        const currentProductID=req.params.currentProductID;
        const product=await productMdl.findById({_id:currentProductID});
        const cartData = {
            userid: userID,
            productid: currentProductID,
            product: product.productName,
            price: product.price,
            description:product.description,
            quantity: 1,
            stock:product.stock,
            category:product.cartegory,
            image: product.images[0],
           
          };
          const cartProduct = await cartMdl.findOne({ productid: currentProductID, userid: userID });
          console.log("cartProduct",cartProduct);
          let TotalPrice=0;

         
  
      if (cartProduct) {
        const newQuantity = cartProduct.quantity + 1;
        await cartMdl.updateOne({ _id: cartProduct._id }, { $set: { quantity: newQuantity } });
       
  
      } else {
        await cartMdl.create(cartData);
  
        console.log("Cart added successfully");
      }
      res.redirect('/cart')
  
        
}
catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
}

}
exports.postUSerWishlist=async(req,res)=>{
    try {
        const currentproductId=req.params.currentProductID;
        const currentproduct= await productMdl.findById({_id:currentproductId})
        const existingWishlistItem = await wishlistModel.findOne({
            userId: req.session.user,
            productId: currentproductId
        });
        if (!existingWishlistItem) {
        const data={
            userId:req.session.user,
            productId:currentproductId,
            productName:currentproduct.productName,
            productImage:currentproduct.images,
            price:currentproduct.price
        }
      
        await wishlistModel.create(data);
        return res.redirect('/whistList');
       }else {
      
        return res.redirect('/whistList'); 
       }
        
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");   
    }
   
}
exports.postWishlistRemove=async(req,res)=>{
    try {
        const data=req.params.id;
        const finddataFromWishlistModel=await wishlistModel.findOneAndDelete({productId:data});
        
         res.redirect('/whistList');
        
        
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}


exports.postCartUpdateQuantity=async(req,res)=>{
    try{
        const updateQuanity=req.body.newValue;
        const cartid=req.body.productId;
        const updatedCart=await cartMdl.findById({_id:cartid});

        updatedCart.quantity=updateQuanity;
         await updatedCart.save();


         return res.status(200).json({ success: true, message: "Quantity updated successfully"});

        
   
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
    

}

exports.postCartRemove=async(req,res)=>{
    try{
        const cartId=req.params.id;
        
        await cartMdl.findByIdAndDelete({_id:cartId});
        res.redirect('/cart')


    }catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.postAddAddress=async(req,res)=>{
    try{
    const { userName,address,city,state,zipcode,phone,country }=req.body;
    const userId=req.session.user;
    const existingAddress = await addressMdl.findOne({ userID: userId, address: address });
    
    if (existingAddress) {
        return res.json({ errorMessage: "Address already exists" });
    }

    if (!userName || typeof userName !== 'string') {
        return res.json({ errorMessage: "Invalid userName"});
    }
    if (!address || typeof address !== 'string') {
        return res.json({ errorMessage: "Invalid address"});
    }
    if (!city || typeof city !== 'string') {
        return res.json({ errorMessage: "Invalid city"});
    }
    if (!state || typeof state !== 'string') {
        return res.json({ errorMessage: "Invalid state"});
    }
    if (!zipcode || typeof zipcode !== 'string' || !/^\d{5}(?:-\d{4})?$/.test(zipcode)) {
        return res.json({ errorMessage: "Invalid zipcode. Zipcode must be in format: XXXXX or XXXXX-XXXX"});
    }
    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
        return res.json({ errorMessage: "Invalid phone number. Phone number must be 10 digits without any special characters."});
    }
    if (!country || typeof country !== 'string') {
        return res.json({ errorMessage: "Invalid country"});
    }

    const newAddress=await addressMdl({
        userName:userName,
        userID:userId,
        address:address,
        city:city,
        state:state,
        zipCode:zipcode,
        country:country,
        phone:phone
    })
    
    await newAddress.save();    
    
       
     return res.json({})
   
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }

}


exports.posteditAddress=async(req,res)=>{
    try {
        const id=req.params.id;
       
        const addresscurrent= req.body.editedAddress
        
        const addressmdl=await addressMdl.findById({_id:id})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
}


exports.postDeleteAddress=async(req,res)=>{

    console.log("postdelete is working")
    try{
        const addressId=req.params.id;
        
        await addressMdl.findByIdAndDelete({_id:addressId});
        
        res.redirect('/address');

    }catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.postupdateUserName = async (req, res) => {
    try {
        const UpdatedUserName = req.body.userName;
        
        const user = await signupcollection.findById(req.session.user);

        
        // Validation
        const containsWhitespace = /^\s/.test(UpdatedUserName);
        const containsNumbers = /\d/.test(UpdatedUserName);
        const containsSpecialChars = !/^[a-zA-Z0-9]+$/.test(UpdatedUserName);

        if (containsWhitespace || containsNumbers || containsSpecialChars) {
            let errorMessage = '';
            if (containsWhitespace) {
                errorMessage = 'Name should not start with whitespace.';
            }
            if (containsNumbers) {
                errorMessage += ' Name should not contain numbers.';
            }
            if (containsSpecialChars) {
                errorMessage += ' Name should not contain special characters.';
            }
            req.flash('errorMessage', errorMessage);
            res.redirect('/changeUserName');
        } else {
            user.username = UpdatedUserName;
            await user.save();
            res.redirect('/userProfile');
        }
    } catch (error) {
        console.error("Error during username update:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.postupdateUserPassword = async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        const currentUser = await signupcollection.findById(req.session.user);

        if (!currentUser) {
            req.flash('errorMessage', 'User not found');
            return res.redirect('/changeUserPassword');
        }

        // Verify current password
        if (currentPassword !== currentUser.password) {
            req.flash('errorMessage', 'Current password is incorrect');
            return res.redirect('/changeUserPassword');
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            req.flash('errorMessage', 'New password and confirm password do not match');
            return res.redirect('/changeUserPassword');
        }

        // Check if new password meets strength requirements
        const strongPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            req.flash('errorMessage', 'Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            return res.redirect('/changeUserPassword');
        }
        if(currentPassword===newPassword){
            req.flash('errorMessage', 'New password and current password are same');
            return res.redirect('/changeUserPassword');

        }

        // Update password
        currentUser.password = newPassword;
        await currentUser.save();
        
        req.flash('successMessage', 'Password updated successfully');
        return res.redirect('/userProfile');
    } catch (error) {
        console.error("Error during password update:", error);
        req.flash('errorMessage', 'Internal Server Error');
        res.status(500).send("Internal Server Error");
    }
}

exports.postcheckaddAddress=async(req,res)=>{
    try {
        const userId=req.session.user;
        const {userName,address,city,state,zipcode,phone,country}=req.body;
        const addressdata={
            userName:userName,
            userID:userId,
            address:address,
            city:city,
            state:state,
            zipcode:zipcode,
            phone:phone,
            country:country
        }
        const result = await addressMdl.create(addressdata);
        return res.redirect('/checkout')

        
    } catch (error) {
        console.error("Error during username update:", error);
        res.status(500).send("Internal Server Error");
        
    }
}


exports.postcheckoutform = async (req, res) => {
    try {
        const user = req.session.user;
        const cart = await cartMdl.find({ userid: user });
       
        const payment = req.body.paymentMethod;
       
        const address = req.body.address;
        const addressdata = await addressMdl.findById({ _id: address });
        const coupon=req.body.coupon ? req.body.coupon : null;
        const products = [];

        // Loop through each item in the cart
        for (const item of cart) {
            products.push({
                productId: item.productid,
                productName: item.product,
                productDescription: item.description,
                productRating: null,
                stockCount: parseInt(item.stock), // Corrected field name
                productImage: item.image,
                quantity: item.quantity,
                price: item.price,
                status: "Pending",
                reason: "aaaaaaaa",
                
                referralCode: null, // Corrected field name
            });
        }
       

        const orderData = {
            orderNumber: Math.floor(100000 + Math.random() * 900000),
            userId: user,
            products: products,
            totalQuantity: products.reduce((total, product) => total + product.quantity, 0),
            totalPrice: products.reduce((total, product) => total + (product.price * product.quantity), 0),
            address: {
                address: addressdata.address,
                city: addressdata.city,
                state: addressdata.state,
                country: addressdata.country,
                zipcode: addressdata.zipCode,
                phone: addressdata.phone,
            },
            couponCode: coupon,
            discountPrice: null,
            paymentMethod: payment,
            orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        };

        const orderDetails = await orderModel.create(orderData);
       
        await cartMdl.deleteMany({ userid: user });

        for (const item of cart) {
            const product = await productMdl.findById(item.productid);
            if (product) {
                product.stock -= item.quantity; // Decrease stock by the quantity in the cart
                await product.save(); // Save the updated product
            } else {
                console.error(`Product with ID ${item.productid} not found.`);
            }
        }
       

        // if(res.json){
        //     return res.status(200).json({message:'order'})
        // }
        // else{
       return res.redirect('/successpage');
       // }


    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.postRemoveProductFromOrder = async (req, res) => {
    try {
        const CancelproductID = req.params.id;
        const orderId = req.params.orderId;
        const userData = req.session.user;

        // Assuming signupcollection is your user collection, make sure to replace it with the correct model
        const currentUser = await signupcollection.findById(userData);
        console.log("asdfgh", orderId);

        

        const statusUpdatedOrderModel = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.productId": CancelproductID },
            { $set: { "products.$.status": "cancelled" } },
            { new: true }
        );
       

        const cancelledProduct = statusUpdatedOrderModel.products.find(product => product.productId.toString() === CancelproductID);
        
        const productPrice=cancelledProduct.price;
        const productQuantity=cancelledProduct.quantity;

      
        const moneyWantAddedToTheWallet=productPrice*productQuantity;
       
        
        currentUser.wallet.balance= currentUser.wallet.balance+moneyWantAddedToTheWallet;
        await currentUser.save();

        res.redirect('/userOrder/:page');
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Internal Server Error");
    }
}
exports.postReturnProduct=async(req,res)=>{
    try {
        const CancelproductID=req.body.productId;
        const orderId=req.body.orderId;
        const newStatus=req.body.returnProduct;
        const userData = req.session.user;

        
        const currentUser = await signupcollection.findById(userData);
    
        const statusUpdatedOrderModel = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.productId": CancelproductID },
            { $set: { "products.$.status":'returned' } }, // $ refers to the matched array element
            { new: true }
        );

        const cancelledProduct = statusUpdatedOrderModel.products.find(product => product.productId.toString() === CancelproductID);
        
        const productPrice=cancelledProduct.price;
        const productQuantity=cancelledProduct.quantity;

      
        const moneyWantAddedToTheWallet=productPrice*productQuantity;
       
        
        currentUser.wallet.balance= currentUser.wallet.balance+moneyWantAddedToTheWallet;
        await currentUser.save();
     //  res.redirect('/userOrder')

     res.json({sucess:'true'})
    
        
        
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Internal Server Error");
    }
}


exports.postRazorpayInstance = async (req, res) => {
   
    try {
        const { amount } = req.body;
        
        
        // Creating a new instance of Razorpay
        const razorpay = new Razorpay({
            key_id: 'rzp_test_xxIa2EJbQL3tW2',
            key_secret: 'ofOIgWnOykRYGQ61Uw3nWKdv',
        });

        // Configuring options for creating a Razorpay order
        const options = {
            amount: amount * 100, // Razorpay requires the amount in paisa
            currency: 'INR',
            receipt: 'order-receipt', // Replace with your order receipt ID
            payment_capture: 1, // Auto-capture payments
        };
       

        // Creating a Razorpay order
        razorpay.orders.create(options, (error, order) => {
            if (error) {
                
                // If there's an error, log it and send a 500 status with an error message
                console.error(error);
                res.status(500).json({ error: 'Failed to create Razorpay order' });
            } else {
               
                // If successful, send the order ID in the response
                res.json({ orderId: order.id });
                
            }
        });
    } catch (error) {
        // Catching any asynchronous errors and sending a 500 status with an error message
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.postaddMoneytowallet=async(req,res)=>{
    try {
        const amount=req.body.amount;
        const currentUser=req.session.user;
        const walletUpdate= await signupcollection.findById({_id:currentUser})
        
        walletUpdate.wallet.balance=walletUpdate.wallet.balance+amount;
        await walletUpdate.save();
        return res.json( walletUpdate.wallet.balance);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Internal server error' });
        
    }
    
}
exports.postWalletPayment = async (req, res) => {
    try {
        const user = req.session.user;
        console.log("user", user);
        const userData = await signupcollection.findById({ _id: user });
        console.log("userData", userData);
        const amount = req.body.amount;
        console.log("walletwpaymet", amount);
        if (userData.wallet.balance >= amount) {
            userData.wallet.balance = userData.wallet.balance - amount;
            console.log("vhvhgv",userData.wallet.balance);
            await userData.save();
            res.json({ success: true }); // Send success response to frontend
        } else {
            res.json({ error: "insufficient balance" }); // Send error response to frontend
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' }); // Send error response to frontend
    }
}

exports.postCheckingCoupon=async(req,res)=>{
    try {
        const coupon=req.body.couponCode;
        const coupondiscount=await couponModel.findOne({couponCode:coupon});
        console.log("coupondiscount",coupondiscount.discount);
        const user=req.session.user;
        const ifUserIsAlreadyUsedTheCoupon=await orderModel.find({userId:user,couponCode:coupon});
        if(ifUserIsAlreadyUsedTheCoupon.length === 0 ){
            console.log("coupon is not used");
            res.json({ discount: coupondiscount.discount });;

        }
        else{
            res.json({ error: 'Already used this coupon' });
        }

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' }); // Send error response to frontend
    }
}



