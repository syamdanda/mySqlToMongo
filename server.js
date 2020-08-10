var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var http = require('http'),
    https = require('https'),
    request = require('request'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    querystring = require('querystring');
var mysql     =    require('mysql');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost/sms', {server: {auto_reconnect: true}});

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'sms',
    debug    :  false
});

function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("show tables",function(err,tables){
            if(!err) {
              var metadata = {};
              var lastIndex = tables.length;
              tables.forEach(function(table, index) {
                connection.query("desc "+table.Tables_in_sms,function(err,tableDesc){
                  if (!err) {
                    lastIndex = lastIndex - 1;
                    metadata[table.Tables_in_sms] = tableDesc;
                    /*var tableName = table.Tables_in_sms;
                    var tableName + 'Schema' = new Schema({ID: String}, {collection: tableName});
                    var tableName + 'Model' = mongoose.model(tableName, tableName + 'Schema');
                    var tableName + 'Obj' = new tableName + 'Model'({});*/
                    /*tableName + 'Obj'.save(function(err) {
                      if (err) {
                        res.json(err);
                      } else {
                        if (lastIndex <= 0) {
                          res.json(metadata);
                        }
                      }
                    });*/  
                    if (lastIndex <= 0) {
                        var collectionNames = Object.keys(metadata);
                        var lastTableCount = collectionNames.length;
                        collectionNames.forEach(function(collectionname) {
                          lastTableCount = lastTableCount - 1;
                          var collectionObj = {};
                          collectionObj[collectionname] = {"Id": "String"};
                          collectionObj[collectionname + 'Schema'] = new Schema(collectionObj.collectionname, {collection: Object.keys(collectionObj)[0]});
                          console.log(JSON.stringify(Object.keys(collectionObj)));
                          collectionObj[collectionname + 'Model'] = mongoose.model(collectionObj[Object.keys(collectionObj)[0]], Object.keys(collectionObj)[1]);
                          collectionObj[collectionname + 'Obj'] = new Object.keys(collectionObj)[2]({});
                          Object.keys(collectionObj)[3].save(function(err) {
                            console.log(JSON.stringify(err));
                            if (err) {
                              res.json(err);
                            } else {
                              if (lastTableCount <= 0) {
                                res.json(metadata);
                              }
                            }
                          })
                          /*console.log(JSON.stringify(collectionObj, null, 2));
                          if (lastTableCount <= 0) {
                            res.json(collectionNames);
                          }*/
                        });                     
                          
                        }                  
                  } else {
                    res.json(err);
                  }
                });
              });                
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}

app.get("/",function(req,res){-
        handle_database(req,res);
});


app.listen(8000,function(){
  console.log(app.settings.env + ';__dirname:' + __dirname + ';');
  console.log('Emportal UI Server started @Port : ' + this.address().port);
});