var express = require('express')
var server = express();
server.listen(81)

var mysql = require('mysql')
var source = { host:'localhost', 
							 database:'web',
		   			   user:'james', 
							 password:'bound'
             }
var pool = mysql.createPool(source)

var ejs  = require('ejs')

server.engine('html', ejs.renderFile)
var readBody = express.urlencoded({extended:false})

server.get(['/', '/home'], showHome)
server.get('/test', showTest)
server.get('/browse', showAll)
server.get('/result', showSearchResult)
server.get('/detail', showDetail)
server.get(['/join','/register'], showRegister)
server.post(['/join','/register'], readBody, saveNewMember)

server.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
server.use(express.static('public'))//เข้าได้โดยตรง
server.use(showError)


function saveNewMember(req, res){
	var sql = 'insert into member(email, password, name)' + 
						' values (?, sha2(?, 512), ?)'
	var data = [req.body.email, req.body.password, req.body.name]
	pool.query(sql, data, function(error, result){
		var model = { }
		if(error == null){
			model.message = 'Register Success'
		}else{
			model.message = 'Fail to regsiter'
		}
		res.render('register-result.html')
	})
}
//Search
function showSearchResult(req, res){
	var data = ['%'+req.query.products+'%','%'+req.query.products+'%']//input name= products in index.html
	var sql = 'select * from post where topic like ? or detail like ?'
	pool.query(sql, data, function (error, data){
		var model = { }
					model.all = data
		res.render('result.html', model)
	})
}

function showHome(req, res){
	res.render('index.html')
	var date = Date(Date.now())
	console.log('Server is running: '+date.toString())
}

function showAll(req, res){
	pool.query('select * from post', function(error, data){
		var model = {}
		model.all = data
		res.render('browse.html', model)
	})
}

function showTest(req, res){
	pool.query('select * from post', function(error, data){	
		res.send(data)// data from database show to browser
		console.log('Server is running')
	})
}

function showDetail(req, res){
	var sql = 'select * from post where code=?'
	var info = [req.query.code, 'Welcome', 3]
	pool.query(sql, info, function(error, data){
		var model = { }
		if(data.length == 1){
			model.data =data[0]
		}else{
			model.data = { topic: 'Not Found!!!',detail:''}
		}
		var sql1 = 'select * from photo where post=?'
		pool.query(sql1, info, function(error, image){
			model.image = image
      res.render('detail.html', model)
		})
	})
}

function showError(req, res){
	res.render('error.html')
}
