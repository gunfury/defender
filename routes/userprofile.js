const express= require("express");
const router= express.Router();
const userSession=require('../middleware/usersession');
const multer=require('../middleware/multer');



const {
getUserProfile,
getUserAddress,
getEditAddress,
getUserCart,
getcheckout,
getChangeUSerName,
getChangeUserPassword,
getSuccesspage,
getUserOrder,
getdownloadInvoice,
getwishlist,
getUserCoupon,

postUserCart,
postUSerWishlist,
posteditprofile,
postAddAddress,
posteditAddress,
postCartUpdateQuantity,
postCartRemove,
postWishlistRemove,
postDeleteAddress,
postupdateUserName,
postupdateUserPassword,
postcheckaddAddress,
postcheckoutform,
postRemoveProductFromOrder,
postReturnProduct,
postRazorpayInstance,
postaddMoneytowallet,
postWalletPayment,
postCheckingCoupon,

}=require("../controllers/userProfileCtrl");

router.get('/userProfile',multer,userSession,getUserProfile)
router.get('/address',userSession,getUserAddress)
router.get('/cart',userSession,getUserCart)
router.get('/checkout',userSession,getcheckout)
router.get('/changeUserName',userSession,getChangeUSerName)
router.get('/changeUserPassword',userSession,getChangeUserPassword)
router.get('/successpage',userSession,getSuccesspage)
router.get('/userOrder/:page',userSession,getUserOrder)
router.get('/downloadInvoice/:id',userSession,getdownloadInvoice)
router.get('/whistList',getwishlist)
router.get('/userCoupon',getUserCoupon)






router.post('/edit-profile',multer,userSession,posteditprofile);
router.post('/addAddress',userSession,postAddAddress);
router.post('/editAddress/:id',userSession,posteditAddress)
router.post('/addcart/:currentProductID',userSession,postUserCart);
router.post('/addwishlist/:currentProductID',userSession,postUSerWishlist);
router.post('/update_quantity',userSession,postCartUpdateQuantity);
router.post('/cartRemove/:id',userSession,postCartRemove);
router.post('/removefromwishList/:id',userSession,postWishlistRemove);
router.post('/deleteAddress/:id',userSession,postDeleteAddress);
router.post('/updateUserName',userSession,postupdateUserName);
router.post('/updateUserPassword',userSession,postupdateUserPassword);
router.post('/checkaddAddress',userSession,postcheckaddAddress);
router.post('/checkoutform',userSession,postcheckoutform);
router.post('/removeProductFromOrder/:id/:orderId',userSession,postRemoveProductFromOrder);
router.post('/returnproduct',userSession,postReturnProduct);
router.post('/RazorpayInstance', userSession,postRazorpayInstance);
router.post('/addMoneytowallet',postaddMoneytowallet);
router.post('/walletPayment',postWalletPayment);
router.post('/checkingCoupon',postCheckingCoupon);




module.exports =router;