const mysql      = require("mysql")
      dbconfig   = require("../createdb/createConn")

let connection = mysql.createConnection(dbconfig.connection)

connection.query('\
CREATE TABLE library_fine.admin(\
    id INT(6) AUTO_INCREMENT, \
    admin_username VARCHAR(10) NOT NULL, \
    password VARCHAR(60) NOT NULL,\
    type  VARCHAR(6) NOT NULL DEFAULT "admin", \
    PRIMARY KEY(id)\
    )',(err,result)=>{
        if(err){throw err}
        else{
            console.log("HEYA ITS DONE")
        }
    })


    connection.end()