let express = require("express"),
    bp      = require("body-parser"),
    dbConn  = require("./db/db"),
    path              = require("path"),
    mysql             = require("mysql")
    passport          = require("passport"),
    localStorage      = require("passport-local")  

const app   = express();

app.use(bp.urlencoded({extended : true}))

app.set("views",path.join(__dirname,"/views"))
app.set("view engine","pug")

app.get('/borrow',(req,res,next)=>{
    res.render("borrow")
})


app.get("/",(req,res,next)=>{
    res.render("home")
})


app.post("/borrow",(req,res,next)=>{
    dbConn.query(`select count(*) as count from library where univ_rollno like ${req.body.rollno}`,(err,countNum)=>{
        if(err){
            console.log(err)
        }
        else{
            // console.log(countNum[0]['count']);
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
                res.send("YOU CAN NOT ADD MORE AS YOU HAVE 5 BOOKS ALREADy")
            }
    }
    })
    
})


app.get("/info",(req,res,next)=>{
    res.render("info")
})

app.post("/info",(req,res,next)=>{
    dbConn.query(`update library 
    set fine =  case when datediff(curdate(),due_date) < 0 then  '0' else datediff(curdate(),due_date) end,
    days_left = case when datediff(due_date,curdate()) < 0 then '0'  else datediff(due_date,curdate()) end where univ_rollno like ${req.body.rollno};`,(err,result)=>{
        if(err){
               console.log(err);
               
        }else{
            dbConn.query(`select book_id,fine from library where univ_rollno like ${req.body.rollno}`,(err,foundData)=>{
                if(!err){
                    res.render("showfine",{
                        foundData,
                    })
                }
    })
}
     })
    })

app.listen(3000,()=>{
    console.log("SERVER has strated");
    
})