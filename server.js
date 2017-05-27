var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id:1,
	description:'Meet Mom for lunch',
	completed:false
},{
	id:2,
	description:'Go to Market',
	completed:false
},{
	id:3,
	description:'Work is done!',
	completed:true
}]

app.get('/', function(req , res){
	res.send('Todo API Root');
});

app.get('/todos' , function(req , res){
	res.json(todos);
});

app.get('/todos/:id' , function(req , res){
	var todoId = parseInt(req.params.id , 10);
	var matchTodo;
    /*for ( var i = todos.length - 1; i >= 0; i--) {
    	if ( i == req.params.id)
    		res.json(todos[i]);
    }*/
    todos.forEach (function (todo){
    	if (todoId == todo.id)
    		matchTodo = todo;
    });
    if (matchTodo)
       res.json(matchTodo);
    res.status(404).send();
});

app.listen(PORT, function(){
   console.log('Express Listening on port ' + PORT + '!');
});