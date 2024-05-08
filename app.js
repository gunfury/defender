const express=require('express');
const app=express();
const path= require("path");
const session=require('express-session');
const mongoose=require('mongoose');
const razorpay=require('razorpay');

const bodyParser = require('body-parser');
const flash = require('connect-flash');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));

const port=process.env.PORT;
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads',express.static(__dirname+"/uploads"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(express.json());




//session

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }))

app.use(flash());
//mongoDB connecting



const mongoURl=process.env.MONGODB_URI;
  mongoose.connect(mongoURl)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

//router
const userRouter=require("./routes/user");
app.use("/",userRouter);

const adminRouter=require("./routes/adminroutes/admin");
app.use("/",adminRouter);

const userProfile=require("./routes/userprofile");
app.use("/",userProfile);


//server

app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})