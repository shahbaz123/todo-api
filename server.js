var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
//var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {

	var body = _.pick(req.body, 'description', 'completed');
	//console.log (body.toJSON());
	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userid: req.user.get('id')
	};

	if (query.hasOwnProperty('completed') &&
		query.completed == 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') &&
		query.completed == 'false')
		where.completed = false;
	if (query.hasOwnProperty('q') &&
		query.q.length > 0)
		where.description = {
			$like: '%' + query.q + '%'
		};
	//res.send(where);
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}).catch(function(e) {
		res.status(500).send();
	});
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchTodo;
	var where = {};

	where.userid = req.user.get('id');
	where.id = todoId;

	//res.send(where);
	db.todo.findOne({
		where: where
	}).then(function(todo) {
		if (!!todo) {
			res.status(200).json(todo.toJSON())
		} else
			res.status(404).send();

	}).catch(function(e) {
		res.status(400).send();
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchTodo;
	var where = {};

	db.todo.destroy({
		where: {
			id: todoId,
			userid: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted == 0) {
			res.status(404).json({
				error: 'No todo with Id'
			});
		} else {
			res.status(204).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var where = {};

	if (body.hasOwnProperty('completed'))
		attributes.completed = body.completed;
	if (body.hasOwnProperty('description'))
		attributes.description = body.description;
	where.userid = req.user.get('id');
	where.id = todoId;
	db.todo.findOne({
		where: where
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

//user Create
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	body.email = body.email.length > 0 ? body.email.toLowerCase() : '';
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		//console.log('user: ' + user);
		//console.log('Token: ' + token);
		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		 //console.error(e);
		res.status(401).send();
	});
});
//Delete /users/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function(e) {
		res.status(500).send();
	});
});
db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express Listening on port ' + PORT + '!');
	});
});