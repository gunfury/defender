const express=require("express");
const router= express();
const bcrypt = require('bcrypt');
const signupcollection=require('../models/signupModel');
const otpCollection=require('../models/otpModel');
const nodemailer=require('nodemailer');
const productMdl=require('../models/admin/productModel');
const categoryMdl=require('../models/admin/categoryModel');
require('dotenv').config();





const mailSender = async (email, title, body) => {
    try {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "unnivishnu18@gmail.com",
          pass: "ahbv ayzt nmrv fshv",
        },
      });
  
      let info = await transporter.sendMail({
        from: "www.secureSkull.com",
        to: `${email}`,
        subject: `${title}`,
        html: ` ${body}`,
      });
  
      console.log("Info is here: ", info);
      return info;
    } catch (error) {
      console.log(error.message);
    }
  };




                                                      //  GET Method
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



exports.getlogin=(req,res)=>{
    if(!req.session.user){
    const errorMessage = req.session.message;
    delete req.session.message;
    res.render("user/login", { message: "" });
    }else{
        res.redirect("/");
    }
}

exports.getsignup=(req,res)=>{
    res.render("user/signup",{ message: "" })
}

exports.getotp=(req,res)=>{
    res.render("user/otp",{ message: "" })
}

exports.getresendotp=async (req, res) => {
    try {
        const signupdata = req.session.signupData;
        if (!signupdata) {
            return res.render("user/otp",{message: "User data not found. Please sign up again." });
        }

        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        const email = signupdata.email;

        // Save the new OTP to the database
        await otpCollection.findOneAndUpdate(
            { email: email },
            { $set: { otp: generatedOTP } },
            { upsert: true }
        );

        // Send the new OTP to the user's email
        const mailBody = `Your new OTP for registration is ${generatedOTP}`;
        await mailSender(email, "New Registration OTP", mailBody);

        return res.redirect('/otp');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.gethomepage=async(req,res)=>{
    const productDisplay=await productMdl.find();
    res.render("user/home",{productDisplay});
}

exports.getuserlogout=(req,res)=>{
   delete req.session.user;
    res.redirect("/");
}


exports.getuserSideProduct = async (req, res) => {
    try {
        const sortType = req.params.sortType;
        const categoryName = req.query.categoryName;
        console.log("categoryName",categoryName); // Get the category name from the URL
        const categoryData = await categoryMdl.find();
        let productDisplay;

        const searchQuery = req.query.query;

        // Retrieve all products if no search query, otherwise, apply search filter
        if (searchQuery) {
            // Filter products based on search query
            productDisplay = await productMdl.find({ productName: { $regex: new RegExp(searchQuery, 'i') } });
        } else if (categoryName) { // Check if categoryName is provided
            // Filter products based on category name
            productDisplay = await productMdl.find({cartegory:categoryName});
            console.log("hit",productDisplay);
        } else {
            // If there's no search query or category name, retrieve all products
            productDisplay = await productMdl.find();
        }

        // Apply sorting based on sortType to the filtered products
        switch (sortType) {
            case 'aA-zZ':
                productDisplay.sort((a, b) => a.productName.localeCompare(b.productName));
                break;
            case 'zZ-aA':
                productDisplay.sort((a, b) => b.productName.localeCompare(a.productName));
                break;
            case 'Low-High':
                productDisplay.sort((a, b) => a.price - b.price);
                break;
            case 'High-Low':
                productDisplay.sort((a, b) => b.price - a.price);
                break;
            case 'new-arrivals':
                productDisplay.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
                break;
            case 'old-arrivals':
                productDisplay.sort((a, b) => a._id.getTimestamp() - b._id.getTimestamp());
                break;
            case 'category1':
                productDisplay = productDisplay.filter(product => product.category === 'category1');
                break;
            case 'category2':
                productDisplay = productDisplay.filter(product => product.category === 'category2');
                break;
            default:
                break;
        }

        res.render('user/product', { productDisplay, categoryData,sortType});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


        // Apply sorting based on sortType to the filtered products
       

    








exports.getproductDetails=async(req,res)=>{
    const productID=req.params.id;
    const productDetails=await productMdl.findById({_id:productID})
    const categoryData=await categoryMdl.find();
    
    
    
    res.render('user/productdetails',{productDetails});
}


exports.postProductSearch = async (req, res) => {
    try {
        const search = req.body.query;
        console.log("search", search);
        // Use a case-insensitive regex to find products with names that contain the search query
        const matchingSearchingDataFromProduct = await productMdl.find({ productName: { $regex: new RegExp(search, 'i') } });
        console.log("matchingSearchingDataFromProduct",matchingSearchingDataFromProduct);
        
        // Check if there are any matching products
        if (matchingSearchingDataFromProduct.length === 0) {
            return res.json({ message: "No matching products found." });
        }

        // Send the matching products as a response
        res.json({value:matchingSearchingDataFromProduct});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

                                                      // POST Method
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.postlogin = async (req, res) => {
    const { email, pass } = req.body;
    hashedpass=await bcrypt.hash(pass, 10);

    try {
        const user = await signupcollection.findOne({
            email: email,
            password:pass
        });
        

        // Check if user exists and is not blocked
        let message;
        if (!user) {
            message = "Invalid email or password";
        } else if (user.isBlocked) {
            message = "User is blocked";
        }

        // Set the message in the session
        //req.session.message = message;

        // Render the login page with the appropriate message
        

        // Redirect if needed
        if (message) {
            console.log(message);
            return res.render("user/login", { message: message || "" });
        }

        // User is valid and not blocked, set session and redirect to home
        req.session.user =  user._id;
        res.redirect('/home');
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
}


exports.postsignup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Step 1: Check if all required fields are provided
        if (!username || !email || !password) {
            return res.render("user/signup", { message: "All fields are required" });
        }

        // Step 2: Validate the username
        if (username.trim() !== username) {
            return res.render("user/signup", { message: "Username should not start with whitespace" });
        }
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (specialCharsRegex.test(username)) {
            return res.render("user/signup", { message: "Username should not contain special characters" });
        }

        // Step 3: Validate the email format
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.render("user/signup", { message: "Invalid email address" });
        }

        // Step 4: Validate the password
        const strongPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return res.render("user/signup", { message: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
        }

        // Step 5: Ensure the password and confirm password fields match
        if (password !== confirmPassword) {
            return res.render("user/signup", { message: "Password and confirm password do not match" });
        }

        // Step 6: Check if the email already exists in the database
       
        const existingUser = await signupcollection.findOne({ email });
        if (existingUser) {
            return res.json({ message: "Email already exists" });
        }

        // Step 7: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 8: Generate an OTP for registration
        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

        // Step 9: Save the user's data and OTP to the database
        req.session.signupData = {
            username,
            email,
            password
            };
        //await newUser.save();

        const newOTP = new otpCollection({
            username,
            email,
            otp: generatedOTP,
        });
        await newOTP.save();

        // Step 10: Send the OTP to the user's email (Implement mailSender function)
        const mailBody = `Your OTP for registration is ${generatedOTP}`;
        await mailSender(email, "Registration OTP", mailBody);

        // Redirect the user to the OTP verification page
        res.redirect('/otp');
    } catch (error) {
        console.error(error);
        // Handle other errors here
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.postOtp=async(req,res)=>{
    
    const { n1, n2, n3, n4 } = req.body;
    try{
        // Validate input: Check for presence, numeric values, and no white spaces
        const isValidInput = n1 && n2 && n3 && n4 && /^\d+$/.test(n1 + n2 + n3 + n4);

        if (!isValidInput) {
        return res.render("user/otp",{message:"Only numeric values, and no white spaces"})
        }

        const otpData = `${n1}${n2}${n3}${n4}`;
        console.log(otpData);
        const signupdata = req.session.signupData;
        console.log("SinupData in USerCtrl 84",signupdata)
        if(!signupdata){
            return res.render("user/otp",{ message: "User data not found. Please sign up again." });
        }

        const otpRecord = await otpCollection.findOne({ email: signupdata.email });

        

        if (!otpRecord) {
            return res.render("user/otp",{ message: "OTP not found. Please request a new one." });
        }

        console.log(otpRecord);

        if(otpData===otpRecord.otp){
            const newUser= new signupcollection({
                username:signupdata.username,
                email:signupdata.email,
                password:signupdata.password
            })
            await newUser.save();
            delete req.session.signupData;
        return  res.redirect('/');
        } else {
            //console.log("Incorrect OTP");
             res.render("user/otp",{message:"Incorrect OTP. Please try again."})
            
        }
    }catch (error) {
                    console.error(error);
                     //res.status(500).json({ error: "Internal Server Error" });
    }
}

//database confriguation with ejs



