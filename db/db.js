let mysql = require("mysql"),
    local = require("passport-local-mysql")


var myConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'toor',
    database : 'library_fine',
    multipleStatements: true
  });


  myConnection.connect((err)=>{
      if(err){
          console.log(err);
          
      }
      else{
          console.log("DB SUCCED");
          
      }
  })
// myConnection.plugins(local)   

module.exports = myConnection;