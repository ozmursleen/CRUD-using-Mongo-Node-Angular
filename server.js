/************ CONFIG ***************/    
var url;
var db;
var portNumber = 3000;

var dbname = 'crud';
var dbUrl = "mongodb://localhost" + '/' + dbname+ '/';
var modelName = 'UserData';

var dataSchema = {
      name   : { type: String, required: true,displayName:'Name',dataType:'String' },
      password     : { type: String, required: true,displayName:'Password',dataType:'String' },
      username   : { type: String, required: false,displayName:'UserName',dataType:'String' },
      email   : { type: String, required: false,displayName:'Email',dataType:'String' },
};

url = '/api/todos/:page/:pageSize';
/*********************************/

// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
const MongoClient = require('mongodb').MongoClient;
var Model;
Model =  new mongoose.Schema(dataSchema);
mongoose.connect(dbUrl);     // connect to mongoDB database on modulus.io
var dataModel = mongoose.model(modelName,Model);
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
// listen (start app with node server.js) ======================================
app.listen(portNumber);
console.log("App listening on port "+portNumber);

var getDataFn;

getDataFn = function(req,res){
	var pageSize = parseInt(req.params.pageSize);
 	var page = parseInt(req.params.page);
 	var skip = (page-1)*pageSize;
 	dataModel.find()
    .sort([['_id', -1]])	    
 	.limit(pageSize)
 	.skip(skip)	    
 	.exec(function(err, datas) {
 		dataModel.count().exec(function(err, count) {
 			if (err)
 				res.send(err);                	
        		res.json({datas:datas,count:count,model:Model.obj}); // return all todos in JSON format
        	});
 	});
 };

var buildObject = function(req,res){

    var obj = {};

    for (var key in Model.obj) {    
            obj[key] = req.body[key];             
    }

    return obj;
};


 // get all users
 app.get(url, function(req, res) {
 	getDataFn(req, res);
 });

// insert data and send back all data after creation
app.post(url, function(req, res) {
	var modelObj = buildObject(req, res);        
    dataModel.create(modelObj, function(err, todo) {
        if (err){                
            res.send(err);
        }else{
            getDataFn(req, res);    
        }            
    });
});

// update data
app.put(url, function(req, res) {

	var modelObj = buildObject(req, res); 

    dataModel.update( {_id: req.body._id},modelObj,{upsert: true},

     function(err, todo) {
        if(err){                
            res.send(err);
        }else{
            getDataFn(req, res);    
        }
    });

});

// delete data
app.delete(url+':todo_id', function(req, res) {
    dataModel.remove({
        _id : req.params.todo_id
    }, function(err, todo) {
        if(err){                
            res.send(err);
        }else{
            getDataFn(req, res);    
        }
    });
});

app.get('*', function(req, res) {
    res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});