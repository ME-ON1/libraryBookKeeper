const mysql         = require('mysql'),
      LocalStrategy       = require('passport-local').Strategy,
  
      dbConn                  = require('./db/db');
      bcrypt              = require('bcrypt');

// db.connect(()=>{
//     console.log("db connected to passport")
// })
module.exports  = function(passport){

    passport.serializeUser((user,done)=>{

            done(null,{ id : user.id ,
                        type : user.type})
        console.log("usern = " + user.username)
        
      
    });
    
    passport.deserializeUser((req,user,done)=>{
        if(user.type === 'admin'){
           dbConn.query("SELECT * FROM admin WHERE id LIKE ?",[user.id],(err,admin)=>{
               done(err,admin[0]);
           })
        }
        else{
              dbConn.query("select * from user where id = ?",[user.id],(err,user)=>{
                  done(err,user[0])
               })
        }
        
        
    })
    
    passport.use("local-signup",new localStrategy({
        usernameField     : "username",
        password          : "password",
        passReqToCallback : true
    }, function(req,username,password,done){
       console.log(username,password);
        newUser = {
            username : username,
            password : bcrypt.hashSync(password,saltRounds),
            email : req.body.email,
            univ_rollno : req.body.rollno
        } 
    
        let insertq = "INSERT INTO user (username,password,email,univ_rollno) values(?,?,?,?)";
    
        dbConn.query(insertq,[newUser.username,newUser.password,newUser.email,newUser.univ_rollno],(err,rows)=>{
            if(err){ console.log(err);}
            // if(rows.length){ return done(null,false)}
            else{
                newUser.id = rows.insertId;
                // console.log(rows);
                return done(null,newUser)
                
            }
        })
        
    })
    )
    
    
    passport.use("local-login",new localStrategy({
        usernameField     : 'username',
        typeField         : 'user',
        passwordField     : 'password',
        passReqToCallback : true
    },function(req,username,password,done){
        console.log(username,password)
        dbConn.query("SELECT * FROM user WHERE username = ?",[username],(err,rows)=>{
            if(err){ console.log(err)}
            if(!rows.length){
                return done(null,false)
            }
            if(!bcrypt.compareSync(password,rows[0].password)){
                return done(null,false)
            }
    
            return done(null,rows[0])
          
            
        })
    }))

    passport.use("admin-signup",new LocalStrategy({
        usernameField : "username",
        passwordField : "password",
        emailField    : "email",
        passReqToCallback : true
    },function(req,username,password,done){
        console.log("signup admin username + ",username,password)
        let newAdmin = {
            username : username,
            password : bcrypt.hashSync(password,saltRounds)
        }   
        dbConn.query("INSERT INTO admin(admin_username,password) VALUES (?,?)",[newAdmin.username,newAdmin.password],(err,rows)=>{
            if(err){console.log(err);
            }
            else{
                newAdmin.id = rows.insertId;
                return done(null,newAdmin)
            }
        })
    }))

    passport.use("admin-login",new LocalStrategy({
        usernameField : "username",
        passwordField : "password",
        passReqToCallback : true
    },function(req,username,password,done){
        console.log(username,password);
        
        dbConn.query("SELECT * FROM admin WHERE admin_username LIKE ? ",[username],(err,rows)=>{
                     if(err){console.log("err in the admin password login ", err)}
                     if(!rows.length){
                        return done(null,false)
                     }
                     if(!bcrypt.compareSync(password,rows[0].password)){
                         return done(null,false)
                     }
                     return done(null,rows[0])
                    // console.log(rows);
                    
                     }
        )
    }))
}
