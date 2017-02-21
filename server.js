var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');


var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
var usersLoggedIn = [];
MongoClient.connect('mongodb://ritwik:pass@ds147069.mlab.com:47069/to-do-list',(err,database)=>{
	if(err){
		console.log(err);
	}
	db = database;

	app.listen(8080,function(){
		console.log('magic happens at 8080');
	});

});


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/home',function(req,res){
	res.send(__dirname+"/signup/home.html");
});

app.get('/',function(req,res){
	app.use(express.static('signup'));
	res.sendFile(__dirname + '/signup/index.html')
});

app.get('/getCookies',function(req,res){
	console.log(req.cookies);
	res.send(req.cookies);
});

app.post('/sign-up-data',function(req,res){
	console.log(req.body);
	db.collection('users').save(req.body,function(err,result){
		if(err){
			console.log(err);
		}
		console.log('added to database');
		
	});
	res.redirect('/');
});

app.post('/login-data',function(req,res){
	var json = req.body;
	console.log(json);
	db.collection('users').find({"email": json.email, "password" : json.password}).toArray(function(err,result){
		if(err){
			console.log(err);
		}
		console.log(result);
		if(result.length==0){
			res.send({"status": "invalid email or password"});
		}
		else{
			usersLoggedIn.push(result[0]._id);
			res.cookie("userId",result[0]._id, {expire : new Date() + 2592000000});
			res.send({"userId": result[0]._id ,"status": "success"});
		}
	});
});

app.post('/sendItem',function(req,res){
	db.collection('todos').save(req.body,function(err, result){
		if(err){
			console.log(err);
		}
		console.log('added to database');
		res.send('ok');

	});
	console.log(req.body);
});

app.post('/getTodos',function(req,res){
	console.log("getTodos body: \n" + req.body);
	var list;
	db.collection('todos').find({"userId" : req.body.userId}).toArray(function(err, result){
		if(err){
			console.log(err);
		}

		//console.log(result);
		list = result;
		var json = JSON.stringify(list);
		console.log("get todos: \n" + json);
		res.send(json);
	});

});

app.post('/deleteTodo',function(req,res){
	console.log(req.body);
	for(var i=0; i<req.body._id.length;i++){
		console.log(req.body._id[i]);
		db.collection('todos').remove({ "_id":  ObjectId(req.body._id[i]) });
	}
	//console.log(db.collection('todos').find().toArray());
});
	
app.get('/logout',function(req,res){
	console.log("inside logout");
	res.clearCookie('userId');
	res.redirect('/');
});