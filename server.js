var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;
//var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());

// POST /todos
app.post('/todos', function(req, res) {
	
	var body = _.pick(req.body, 'description', 'completed');
    
	db.todo.create(body).then(function(todo) {
		res.status(200).json(todo.toJSON());	
	}).catch(function(e){
		res.status(400).json(e);
	});
});

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
	res.json(todos);
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchTodo;
	/*for ( var i = todos.length - 1; i >= 0; i--) {
		if ( i == req.params.id)
			res.json(todos[i]);
	}*/
	todos.forEach(function(todo) {
		if (todoId == todo.id)
			matchTodo = todo;
	});
	if (matchTodo)
		res.json(matchTodo);
	res.status(404).send();
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express Listening on port ' + PORT + '!');
	});
});