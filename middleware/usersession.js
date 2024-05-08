const userData=require('../models/signupModel')
async function userSession(req,res,next){
    const user=await userData.find({_id:req.session.user})
    if(req.session.user&&user[0].isBlocked==false){
        next();
    }else{
        res.redirect('/');
    }
}
module.exports=userSession;