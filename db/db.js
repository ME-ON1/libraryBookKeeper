let mysql = require("mysql"),
    local = require("passport-local-mysql")
    dbconfig = require("../createdb/createConn")

var myConnection = mysql.createConnection(dbconfig.connection);
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