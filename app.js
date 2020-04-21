let express = require("express"),
    bp      = require("body-parser"),
    dbConn  = require("./db/db"),
    path              = require("path"),
    mysql             = require("mysql")
    passport          = require("passport"),
    localStrategy     = require("passport-local").Strategy,
    bcrypt            = require("bcrypt"),
    saltRounds        = 10;
    authRoutes        = require('./routes/auth'),
    session           = require("./session")
    method            = require("method-override")
const app   = express();
    

app.use(bp.urlencoded({extended : true}))



app.set("views",path.join(__dirname,"/views"))
app.set("view engine","pug")

app.use(require("express-session")(session))

app.use(passport.initialize())
app.use(passport.session())


app.use(method("_method"));
require("./passprt")(passport)

app.use(function(req,res,next){
    if(req.isAuthenticated()){
        res.locals.currentUser = req.user;
    }
    
    next()
})

app.get("/",(req,res,next)=>{
    res.render("home")
})


function isLoggedIn(req,res,next){
   if(req.isAuthenticated()){
       return next();
   }
   return res.redirect("/")
}


app.use('/',authRoutes)



app.get("/:id/borrow",isLoggedIn,(req,res,next)=>{
    dbConn.query(`SELECT univ_rollno FROM user WHERE id LIKE ${req.params.id}`,(err,rows)=>{
        res.render("borrow",{
             row : rows[0]
        })
    
    })
})

app.post("/borrow", isLoggedIn,(req,res,next)=>{
    dbConn.query(`select count(*) as count from library where univ_rollno like ${req.body.rollno}`,(err,countNum)=>{
        if(err){
            console.log(err)
        }
        else{
           
            if(countNum[0]['count']  < 5 ){
                 dbConn.query(`INSERT INTO library(univ_rollno,book_id,issue_date,due_date,days_left,fine)  
                                   VALUES('${req.body.rollno}','${req.body.bookID}', curdate(), adddate(curdate(), interval 20 day), datediff(due_date,issue_date), '0');`,(err,result)=>{
                       if(err){
                             res.json(err)
            
                       }
                       else{
                             res.redirect('/info')
                       }
            })
            }
            else{
                res.send("YOU CAN NOT ADD MORE AS YOU HAVE 5 BOOKS ALREADY")
            }
    }
    })
    
})


app.get("/:id/info",isLoggedIn,(req,res,next)=>{
     console.log(req.user)
    dbConn.query(`update library 
    set fine =  case when datediff(curdate(),due_date) < 0 then  '0' else datediff(curdate(),due_date) end,
    days_left = case when datediff(due_date,curdate()) < 0 then '0'  else datediff(due_date,curdate()) end where univ_rollno like (SELECT univ_rollno FROM user WHERE id LIKE ${req.params.id})`,(err,result)=>{
        if(err){
               res.json(401,err);
               
        }else{
            dbConn.query(`select library.fine, library.book_id, library.univ_rollno, user.id from library,user where user.id = ${req.params.id} AND library.univ_rollno = user.univ_rollno`,(err,foundData)=>{
                if(!err){
                    res.render("showFine",
                    { 
                        foundData : foundData}
                    )
                 
                }
    })
}
    })
})

/* ADMIN ROUTE */

app.get("/fine",isLoggedIn,isAdminLoggedIn,(req,res,next)=>{
    dbConn.query("UPDATE library SET fine =  CASE WHEN DATEDIFF(CURDATE(),due_date) < 0 THEN  '0' ELSE DATEDIFF(CURDATE(),due_date) END, \
    days_left = CASE WHEN DATEDIFF(due_date,CURDATE()) < 0 then '0'  ELSE DATEDIFF(due_date,CURDATE()) END ; SELECT * FROM library WHERE FINE > 0 GROUP BY univ_rollno,book_id ORDER BY issue_date,fine,univ_rollno DESC ;",(err,rows)=>{
        if(err){console.log(err)}
        else{
            console.log(rows);
            res.render("adminfine",{
                foundData : rows[1]
            })
        }
    })
})

function isAdminLoggedIn(req,res,next){
    if(req.user.type === 'admin'){
        return next()
    }
    return res.json("NO ADMIN PREVIALGE")
}

/** clearing fine */

app.get("/:id/clear",isLoggedIn,isAdminLoggedIn,(req,res,next)=>{
    dbConn.query("DELETE FROM library WHERE s_no = ?",[req.params.id],(err,rows)=>{
        res.redirect("back")
    })
})



app.listen(3000,()=>{
    console.log("SERVER has strated");
    
})