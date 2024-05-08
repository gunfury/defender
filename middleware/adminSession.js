async function  adminSession(req,res,next){
    const session=req.session.admin;
    if(session){
        next();
    }else{
        res.redirect("/adminlogin")
    }

}
module.exports=adminSession;