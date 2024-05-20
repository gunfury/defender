const express= require("express");
const router= express.Router();
const multer = require('../../middleware/multer.js')
const adminSession=require("../../middleware/adminSession.js")


const{
    getAdminLogin,
    getAdminDash,
    getUserManagement,
    getProduct,
    getCartegoey,
    getDeletecategory,
    getAdminLogout,
    getEditCartegory,
    getAddCartegory,
    getAddproduct,
    getEditproduct,
    getDeleteproduct,
    getSoftDeleteProduct,
    getBlockUser,
    getOrderManagement,
    getCoupon,
    getSalesReport,
    getBestSeller,
    
    
    
    

    ///postmethods
    postBlockUser,
    postAdminLogin,
    postAddcategory,
    postEditCartegory,
    postAddproduct,
    postEditproduct,
    postfetchOrderStatusUpdate,
    postAddcoupon,
    postRemoveCoupon,
    postFilterData,
    postPDFdownload,
    postExceldownload,
    postdDeleteImage,
    
   


}=require('../../controllers/admin/adminCtrl.js');

// \controllers\admin\adminCtrl.js

//const storage = multer.memoryStorage();

// get
router.get("/adminlogin",getAdminLogin);
router.get("/dashboard",adminSession,getAdminDash);
router.get("/userManagement",adminSession,getUserManagement);
router.get("/product",adminSession,getProduct);
router.get("/cartegories",adminSession,getCartegoey);
router.get("/deleteCategory/:categoryId",adminSession,getDeletecategory);
router.get('/logout',getAdminLogout);
router.get('/Category/:cartegoryId',adminSession,getEditCartegory);
router.get('/addCartegory',adminSession,getAddCartegory);
router.get('/addproduct',adminSession,getAddproduct);
router.get('/editProduct/:editId',adminSession,getEditproduct);
router.get('/deleteProduct/:id',adminSession,getDeleteproduct);
router.get('/softDeleteProduct/:id',adminSession,getSoftDeleteProduct);
router.get('/userblock/:id',adminSession,getBlockUser);
router.get('/order',getOrderManagement);
router.get('/coupon',adminSession,getCoupon);
router.get('/salesReport',getSalesReport);
router.get('/bestSeller',getBestSeller);






//post
router.post("/adminlogin",postAdminLogin);
router.post("/addcartegory",adminSession,postAddcategory);
router.post("/editDone/:Id",adminSession,postEditCartegory);
router.post("/productAdded",adminSession,multer,postAddproduct);
router.post('/editProductDone/:id',adminSession,multer,postEditproduct);
router.post('/orderStatusUpdate',postfetchOrderStatusUpdate);
router.post('/addcoupon',postAddcoupon);
router.post('/removeCoupon/:id',postRemoveCoupon);
router.post('/filterData',postFilterData);
router.post('/generatePdf',postPDFdownload);
router.post('/generateExcel',postExceldownload)
router.post('/deleteImage',postdDeleteImage)


















module.exports =router;