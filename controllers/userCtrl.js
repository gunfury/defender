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
        res.redirect("/home");
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
        console.log("sort type", sortType);
        const categoryData = await categoryMdl.find();
        console.log("data type", categoryData);

        let productDisplay;

        // Find the category matching the sortType
        const category = categoryData.find(cat => cat.Category === sortType);

        if (category) {
            // If category found, filter products by category
            productDisplay = await productMdl.find({ cartegory: category.Category });
        } else {
            // If category not found, handle it based on sortType
            switch (sortType) {
                case 'aA-zZ':
                    productDisplay = await productMdl.find().sort({ productName: 1 });
                    break;
                case 'zZ-aA':
                    productDisplay = await productMdl.find().sort({ productName: -1 });
                    break;
                case 'Low-High':
                    productDisplay = await productMdl.find().sort({ price: -1 });
                    break;
                case 'High-Low':
                    productDisplay = await productMdl.find().sort({ price: 1 });
                    break;
                case 'new-arrivals':
                    productDisplay = await productMdl.find().sort({ _id: -1 });
                    break;
                case 'old-arrivals':
                    productDisplay = await productMdl.find();
                    break;
                case 'category1':
                    // Sort products by category 1
                    productDisplay = await productMdl.find({ cartegory: 'category1' }).sort({ productName: 1 });
                    break;
                case 'category2':
                    // Sort products by category 2
                    productDisplay = await productMdl.find({ cartegory: 'category2' }).sort({ productName: 1 });
                    break;
                // Add more cases for other categories as needed
                default:
                    // If sortType is not recognized, return all products
                    productDisplay = await productMdl.find();
                    break;
            }
        }

        res.render('user/product', { productDisplay, categoryData });
    } catch (error) {
        console.error(error);
        // Handle error
        res.status(500).send("Internal Server Error");
    }
};



exports.getproductDetails=async(req,res)=>{
    const productID=req.params.id;
    const productDetails=await productMdl.findById({_id:productID})
    const categoryData=await categoryMdl.find();
    
    
    
    res.render('user/productdetails',{productDetails});
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


exports.postsignup=async (req,res)=>{
        
        try {
            const{username,email,password,confirmPassword}=req.body
        console.log("datas" ,req.body);
        if (!username || !email || !password) {
            return res.render("user/signup",{ message: "All fields are required" });
        }
        if (username.trim() !== username) {
            return res.render("user/signup",{ message: "Username should not start with whitespace" });
        }
       

        // Validate email format
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.render("user/signup",{ message: "Invalid email address" });
        }
        const strongPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return res.render("user/signup", { message: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
        }
        if (password !== confirmPassword) {
            return res.render("user/signup",{ message: "Password and confirm password do not match" });
        }
            const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (specialCharsRegex.test(username)) {
            return res.render("user/signup", { message: "Username should not contain special characters" });
        }
            const existingUser = await signupcollection.findOne({ email });
            if (existingUser) {
              return res.render("user/signup", { message: "User Already exists" });
            }
             // Hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);

            const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
                req.session.signupData = {
                username,
                email,
                password
                };
                const newOTP = new otpCollection({
                username,
                email,
                otp: generatedOTP,
                });
                await newOTP.save();
                const mailBody = `Your OTP for registration is ${generatedOTP}`;
                await mailSender(email, "Registration OTP", mailBody);
                res.redirect('/otp')
        } catch (error) {
                         console.error(error);
                         // res.status(500).json({ error: 'Internal server error' });
         }


}




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



