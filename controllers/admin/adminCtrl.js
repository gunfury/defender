const express=require("express");
const router= express();
const multer = require('multer');
const fs = require('fs');
const user=require('../../models/signupModel');
const cartegoryModel=require('../../models/admin/categoryModel');
const productMdl=require('../../models/admin/productModel');
const couponModel=require('../../models/couponModel')
const { log, Console } = require("console");
const flash = require('connect-flash');
const orderModel=require('../../models/orderModel');
const PDFDocument = require('pdfkit');







                                    //GET METHODS
/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////// 


exports.getAdminLogin=(req,res)=>{
    const errorMessage="";
    res.render('admin/login',{errorMessage});
}



exports.getAdminDash=(req,res)=>{
    res.render('admin/dashboard');
}
exports.getUserManagement=async(req,res)=>{
    try{
    const users=await user.find();
    res.render('admin/userManagement',{users});
    } catch(error) {
        console.error("can't fetch the data");
        res.status(500).send('Internal Server Error');
    }
}

exports.getProduct=async(req,res)=>{
    try{
        const productModels=await productMdl.find();
        
        res.render('admin/products',{productModels});
    }catch (error){
        console.error("can't fetch the data");
        res.status(500).send('Internal Server Error');
    }
    
}
exports.getCartegoey=async(req,res)=>{
    try{
       
        const items=await cartegoryModel.find();
    res.render('admin/cartegory',{items});
    }catch(error) {
        console.error("can't fetch the data");
        res.status(500).send('Internal Server Error');
    }
}
exports.getDeletecategory = async (req,res) => {
    try {
        const categoryId=req.params.categoryId;
        const data=await cartegoryModel.findById({_id:categoryId})
        data.isBlocked=!data.isBlocked;
        await data.save();
        res.redirect('/cartegories');
    } catch (error) {
        console.error("Error blocking/unblocking category:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAdminLogout = (req, res) => {
    // Destroy the session
    
    delete req.session.admin 
            
            // Redirect to login page after logout
            res.redirect('/adminlogin');
     
}
exports.getEditCartegory=async(req,res)=>{
    const errorMessage=req.flash("errorMessage");
    const id=req.params.cartegoryId;
   
    const cartegory=await cartegoryModel.findOne({_id:id});
   console.log("cartegory",cartegory);
     
    res.render("admin/editCartegory",{cartegory,errorMessage:errorMessage});
}
exports.getAddCartegory=(req,res)=>{
    const errorMessage=req.flash("errorMessage");
    res.render("admin/addCartegory",{errorMessage:errorMessage});
}
exports.getAddproduct = async (req, res) => {
    try {
       
        const items = await cartegoryModel.find();
        const error="";
        res.render('admin/add-product', { items,error}); // Pass error message to EJS template
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Internal Server Error');
    }
}
exports.getEditproduct=async(req,res)=>{
    try{
    const editID=req.params.editId;
    const error="";
    const currentProductData=await productMdl.findOne({_id:editID})
    const cartegoryProductData=await cartegoryModel.find();
    res.render('admin/edit-product',{currentProductData,cartegoryProductData,error});
    }catch (err){
        console.error('Error fetching items', err);
        res.status(500).send('Internal Server Error');

    }
}
exports.getDeleteproduct=async(req,res)=>{

    try{
        const productId=req.params.id;
        const newProductDB =  await productMdl.deleteOne({_id:productId});
        res.redirect("/product");
       

    }catch(error){
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
exports.getSoftDeleteProduct=async(req,res)=>{
    try{
    const productId=req.params.id;
    const data=await productMdl.findById({_id:productId})
    data.isBlocked=!data.isBlocked;
    await data.save();
    res.redirect('/product')
    }catch(error){
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
exports.getBlockUser=async(req,res)=>{
    try{
       
    const userId=req.params.id;
    const data=await user.findById({_id:userId})
    data.isBlocked=!data.isBlocked;
    await data.save();
    res.redirect('/userManagement')
    }catch(error){
        console.log("not working");
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getOrderManagement=async(req,res)=>{
    try {
      
        const orderData=await orderModel.find()
        

        const userNames = [];
        for (const order of orderData) {
            const userdata = await user.findById(order.userId);
            userNames.push(userdata.username);
        }
        res.render('admin/ordermangement',{orderData,userNames})
        
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}

exports.getCoupon = async (req,res)=>{
    try {
        const couponData=await couponModel.find();
        console.log("couponData",couponData);
        res.render('admin/coupon',{couponData})
        
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getSalesReport=async (req,res)=>{
    try {
        const orderData=await orderModel.find()
        let data=0;
        
        const userNames = [];
        for (const order of orderData) {
            const userdata = await user.findById(order.userId);
            userNames.push(userdata.username);
        }
        res.render('admin/saleReport',{orderData,userNames,data:data})
        
        
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
exports.postFilterData=async(req, res)=>{
    try {
        const startDate = req.body.data.startDate;
        const endDate = req.body.data.endDate;
        const salesFilter = req.body.data.salesFilter;
        console.log("sdfgh", new Date(startDate), endDate, salesFilter);
        const orderDat=await orderModel.find()
        // Your filtering logic here based on startDate, endDate, and salesFilter
        
        // Example filtering logic:
        const filteredData = await orderModel.find({
            orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            
        });
        console.log("ghj");
        
        const userNames = [];
        for (const order of filteredData) {
            const userdata = await user.findById(order.userId);
            userNames.push(userdata.username);
        }
        console.log("userNmae",userNames);
        console.log("filteredData", filteredData);
      // return res.render('admin/saleReport', { orderData: filteredData, userNames: userNames });
        // Render filtered data as HTML
        res.json({ filteredData: filteredData ,userNames:userNames});
    } catch (error) {
        console.error("Error filtering data:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.postfetchOrderStatusUpdate = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const newStatus = req.body.newStatus;

        // Update the status of the product within the order
        const statusUpdatedOrderModel = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.productId": productId },
            { $set: { "products.$.status": newStatus } }, // $ refers to the matched array element
            { new: true }
        );

        res.status(200).json({ success: true, order: statusUpdatedOrderModel });
        
    } catch (error) {
        console.error("Error during status update:", error);
        res.status(500).send("Internal Server Error");
    }
}


exports.postPDFdownload = async (req, res) => {
    try {
        const PDFDocument = require('pdfkit'); // Import PDFDocument module
        const doc = new PDFDocument();
        const tableData = req.body.tableData;
        
        res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        // Pipe the PDF content to the response
        doc.pipe(res);

        // Add sales report heading
        doc.font('Helvetica-Bold').fontSize(14).text('Sales Report', { align: 'center' });

        // Set up the table layout
        const table = {
            headers: ['ORDER NO', 'PRODUCT NAME', 'USERNAME', 'ADDRESS', ' QUANTITY', 'TOTALPRICE', 'DISCOUNT', 'PAYMENT METHOD', 'DATE & TIME'],
            rows: []
        };
        const spacedHeaders = table.headers.map(header => header + ' ');

        // Populate the table data
        tableData.forEach(row => {
            table.rows.push(row); // Add each row to the table
        });

        // Draw the table
        // drawTable(doc, {
        //     x: 50,
        //     y: 100, // Adjusted y position with a margin top of 20 units
        //     width: 500,
        //     headers: spacedHeaders, // Use spacedHeaders instead of table.headers
        //     rows: table.rows,
        //     headerMarginBottom: 10, // Specify the margin bottom for the table header
        //     rowSpacing: 5 // Specify the space between rows
        // });
        drawTable(doc, {
            x: 10, // Adjusted x position
            y: 100,
            headers: table.headers,
            rows: table.rows,
            margin: 15, // Adjust the margin as needed
            fourthColumnHeight: 30, // Adjust the height of the fourth column as needed
            pageWidth: 600 // Width of the PDF document's page
        });
        
        // End the PDF document
        doc.end();
    } catch (error) {
        console.error("Error during PDF generation:", error);
        res.status(500).send("Internal Server Error");
    }
}

// Function to draw a table
function drawTable(doc, options) {
    const { x, y, headers, rows, margin, fourthColumnHeight, pageWidth } = options;

    doc.font('Helvetica-Bold');
    doc.fontSize(6); // Reduce the font size further

    // Calculate column widths based on the longest content in each column
    const colWidths = headers.map((header, i) => {
        const headerWidth = doc.widthOfString(header);
        const maxCellWidth = rows.reduce((maxWidth, row) => {
            const cellWidth = doc.widthOfString(row[i].toString());
            return Math.max(maxWidth, cellWidth);
        }, headerWidth);
        return maxCellWidth + margin; // Add a small margin between columns
    });

    // Calculate row heights
    const rowHeights = rows.map(row => {
        // Increase the height of the fourth column in each row
        return row.map((cell, columnIndex) => {
            return columnIndex === 3 ? fourthColumnHeight : 10; // Adjust the height of the fourth column as needed
        });
    });

    // Calculate the total width of the table
    const tableWidth = colWidths.reduce((total, width) => total + width, 0);

    // Calculate the available space on the page
    const availableWidth = pageWidth - x;

    // Adjust the table position if it exceeds the available width
    const adjustedX = Math.max(x, x + (availableWidth - tableWidth) / 2);

    // Draw headers
    doc.fillColor('#000');
    headers.forEach((header, i) => {
        doc.text(header, adjustedX + sum(colWidths.slice(0, i)) + margin / 2, y, { width: colWidths[i], align: 'left' });
    });

    // Draw rows
    doc.font('Helvetica').fontSize(6); // Reduce the font size further
    rows.forEach((row, rowIndex) => {
        const yPosition = y + (rowIndex + 1) * (10 + margin); // Add margin between rows
        row.forEach((cell, columnIndex) => {
            const startX = adjustedX + sum(colWidths.slice(0, columnIndex)) + margin / 2;
            const cellHeight = rowHeights[rowIndex][columnIndex];
            doc.text(cell.toString(), startX, yPosition, { width: colWidths[columnIndex], height: cellHeight, align: 'left' });
        });
    });
}


function sum(arr) {
    return arr.reduce((total, num) => total + num, 0);
}




exports.getBestSeller = async (req, res) => {
    try {
        const topProducts = await orderModel.aggregate([
            // Unwind the products array to deconstruct each order into multiple documents
            { $unwind: "$products" },
            // Group by productId and accumulate the total quantity purchased
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    productImage: { $first: "$products.productImage" },
                    price: { $first: "$products.price" },
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            // Perform the lookup to join the product details
            {
                $lookup: {
                    from: "products", // Name of the products collection
                    localField: "_id", // Field from the grouped result
                    foreignField: "_id", // Field from products collection
                    as: "productDetails" // Name for the resulting array
                }
            },
            // Unwind the productDetails array to get the first matching product
            { $unwind: "$productDetails" },
            // Add the StockCount from productDetails to the results
            {
                $addFields: {
                    StockCount: "$productDetails.stock"
                }
            },
            // Sort by total quantity in descending order
            { $sort: { totalQuantity: -1 } },
            // Limit to top 10 products
            { $limit: 10 }
        ]);

        const topCategories = await orderModel.aggregate([
            // Unwind the products array to deconstruct each order into multiple documents
            { $unwind: "$products" },
            // Perform the lookup to join the product details
            {
                $lookup: {
                    from: "products", // Name of the products collection
                    localField: "products.productId", // Field from the orders collection
                    foreignField: "_id", // Field from products collection
                    as: "productDetails" // Name for the resulting array
                }
            },
            // Unwind the productDetails array to get the first matching product
            { $unwind: "$productDetails" },
            // Group by category and accumulate the total quantity purchased
            
            {
                $group: {
                    _id: "$productDetails.category",
                    cartegory: { $first: "$productDetails.cartegory" },
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            // Sort by total quantity in descending order
            { $sort: { totalQuantity: -1 } },
            // Limit to top 5 categories
            { $limit: 2 }
        ]);

        console.log('Top Selling Categories:', topCategories);

        res.render('admin/bestSeller', { topProducts, topCategories });

    } catch (error) {
        console.error("Error fetching best sellers:", error);
        res.status(500).send("Internal Server Error");
    }
}







                                    //POST METHODS
//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


exports.postAdminLogin=(req,res)=>{
    const name='admin18@gmail.com';
    const password='8963';
    req.body;
    console.log(req.body);
    
    if(name===req.body.username&&password===req.body.password){
        req.session.admin = {
            username: req.body.username,
            password: req.body.password
        };
        console.log("adminSession",req.session.admin);
       return res.redirect('/dashboard');
    }else{
        if(!req.body){
            return res.render('admin/login',{errorMessage:'Please provide both username and password'});
         }
       return res.render('admin/login',{errorMessage:'Invalid user or password'});
    }
    
}

exports.postAddcategory = async (req, res) => {
    try {
        const { Category } = req.body;
        const data=req.body.Category;
        // Check if category already exists
        if (data.trim() === '' || /[a-z]/.test(data) || /\d/.test(data)|| /[!@#$%^&*(),.?":{}|<>]/.test(data)) {
            req.flash('errorMessage', 'Category name should not contain whitespace, lowercase letters, number or special characters');   
            return res.redirect(`/addCartegory`);
        }
        if(data.length > 15){
            req.flash('errorMessage', 'Category name should be lessthan or equal to 15 characters long');   
            return res.redirect(`/addCartegory`);
        }

        const existingCategory = await cartegoryModel.findOne({ Category: Category });
        if (existingCategory) {
            req.flash('errorMessage','Category already exists' );
            return res.redirect(`/addCartegory`);
        }
        // Create a new category document
        const newCategory = new cartegoryModel({ Category: Category });
        // Save the new category document to the database
        await newCategory.save();
        console.log("Category saved successfully");
        res.redirect("/cartegories");
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ success: false, error: 'An error occurred while adding the category. Please try again later.' });
    }
};
exports.postEditCartegory=async(req,res)=>{
   try{
    const dataId=req.params.Id;
    const data=req.body.NewCategory;
    console.log("data",data);
    console.log("dataFromGet",dataId);
    const dataFromDb=await cartegoryModel.findOne({_id:dataId});
    console.log("dataFromDb",dataFromDb);
    if (data.trim() === '' || /[a-z]/.test(data) || /\d/.test(data)|| /[!@#$%^&*(),.?":{}|<>]/.test(data)) {
        req.flash('errorMessage', 'Category name should not contain whitespace, lowercase letters, number or special characters');
        return res.redirect(`/Category/${dataId}`);
    }
    if(data.length > 15){
        req.flash('errorMessage', 'Category name should be lessthan or equal to 15 characters long'); 
        return res.redirect(`/Category/${dataId}`);
    }
    const existingCategory = await cartegoryModel.findOne({ Category: data });
        if (existingCategory) {
            req.flash('errorMessage','Category already exists' );
            return res.redirect(`/Category/${dataId}`);
        }
       
    dataFromDb.Category=data;
    const items=null;
    await dataFromDb.save();
    res.redirect("/cartegories");
        
   }catch(err){
    console.log(err)
   }
};

exports.postAddproduct = async (req, res) => {
    try {
        // Extract necessary data from request body
        const items = await cartegoryModel.find();
        const { productName, description, cartegory, discount, stock, price } = req.body;

        if (!productName || !description || !cartegory || !discount || !stock || !price) {
            return res.render('admin/add-product', { items,error: "All fields are required" });
        }
        // Function to check if a string starts with a capital letter
        function startsWithCapital(str) {
            return str.charAt(0) === str.charAt(0).toUpperCase();
        }
        if (!startsWithCapital(productName)) {
            return res.render('admin/add-product', { items, error: "Product name must start with a capital letter" });
        }
        if ( /^\s/.test(productName)) {
            return res.render('admin/add-product', { items, error: "Product name must start with a capital letter and cannot begin with white space" });
        }
        if (isNaN(discount) || isNaN(stock) || isNaN(price) || discount < 0 || stock < 0 || price < 0 || discount >= 100) {
            return res.render('admin/add-product', { items, error: "Discount must be a non-negative number less than 100, and stock and price must be non-negative numbers" });
        }
        let productImages = [];
        // Map uploaded files to file URLs
        if (req.files && req.files.length > 0) {
            const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
            productImages = fileUrls;
        } else {
            return res.render('admin/add-product', { items, error: "Please upload the images" });
        }
       
        // Create a new product object with details and images
        const newProduct = new productMdl({
            productName: req.body.productName,
            cartegory: req.body.cartegory,
            description: req.body.description,
            images: productImages,
            stock: req.body.stock,
            price: req.body.price,
            discount: req.body.discount
        });

        // Save the new product to the database
        await newProduct.save();

        console.log('Product added successfully:', newProduct);
        res.redirect('/product');
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
  
exports.postEditproduct=async(req,res)=>{
    try{
        const { productName, description, cartegory, discount, stock, price } = req.body;
        const productId=req.params.id
        console.log("product ID in editing",productId);
       
        const currentProductData=await productMdl.findOne({_id:productId})

        const cartegoryProductData=await cartegoryModel.find();
        if (!productName || !description || !cartegory || !discount || !stock || !price) {
            return res.render('admin/edit-product', { currentProductData,cartegoryProductData,error: "All fields are required" });
        }
        // Function to check if a string starts with a capital letter
        function startsWithCapital(str) {
            return str.charAt(0) === str.charAt(0).toUpperCase();
        }
        if (!startsWithCapital(productName)) {
            return res.render('admin/edit-product', { currentProductData, cartegoryProductData,error: "Product name must start with a capital letter" });
        }
        if (isNaN(discount) || isNaN(stock) || isNaN(price) || discount < 0 || stock < 0 || price < 0 || discount >= 100) {
            return res.render('admin/edit-product', { currentProductData, cartegoryProductData, error: "Discount must be a non-negative number less than 100, and stock and price must be non-negative numbers" });
        }


        let productImages = [];

        if (req.files && req.files.length > 0) {
           const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
            productImages = fileUrls;
        }


        console.log("product images in editing",productImages);
        
        await productMdl.findByIdAndUpdate(productId, {
            productName: req.body.productName,
            cartegory: req.body.cartegory,
            description: req.body.description,
            images: productImages,
            stock: req.body.stock,
            price: req.body.price,
            discount:req.body.discount 
          }).then((pass) => {
            console.log("UpdatedProduct", pass);
            res.redirect("/product");
          });
    }catch(error){
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.postAddcoupon = async (req, res) => {
    try {
        const data = req.body.formData;
        console.log("formData", data);
        
        // Check if the coupon code already exists in the database
        const existingCoupon = await couponModel.findOne({ couponCode: data.couponCode });
        if (existingCoupon) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }

        // If the coupon code is unique, proceed with saving the new coupon
        const newCoupon = new couponModel({
            couponCode: data.couponCode,
            discount: data.discount,
            expiryDate: data.expiryDate,
            // Add other fields as needed
        });
        
        // Save the newCoupon instance to the database
        await newCoupon.save();
        
        // Send a JSON response indicating success
        res.json({ success: true });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
exports.postRemoveCoupon=async(req,res)=>{
    try {
        const data=req.params.id;
        console.log("data",data);
        await couponModel.findByIdAndDelete({_id:data})
        return res.redirect("/coupon");
        
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}







