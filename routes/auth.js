let express  = require("express")
let router    = express.Router()
let passport = require("passport"),
    mysql    = require("mysql"),
    bcryopt  = require("bcrypt"),
    localStrategy = require("passport-local").Strategy
                 require("../passprt")(passport)
      
                 
router.get("/login",(req,res,next)=>{
    res.render("login")
})
                
router.post("/login",passport.authenticate("local-login"),(req,res,next)=>{
    res.redirect("/" + req.user.id + "/info")    
})


                
router.get("/signup",(req,res,next)=>{
    res.render("signup")
})
                
                
router.post("/signup",passport.authenticate("local-signup"),(req,res,next)=>{ 
        res.redirect("/" + req.user.id + "/info")
})

router.get("/logout",(req,res,next)=>{
        req.logOut()
})



router.get("/loginadmins",(req,res,next)=>{
    res.render("loginAdmin")
})

router.post("/loginadmins",passport.authenticate("admin-login"),(req,res,next)=>{
    res.redirect("/fine")
})


module.exports = router;