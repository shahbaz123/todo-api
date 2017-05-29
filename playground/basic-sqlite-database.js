var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

// Todo table entries will have one associated user
Todo.belongsTo(User);
// users can have multiple Todo
User.hasMany(Todo);


sequelize.sync(
	//{force:true}
).then(function() {
	console.log('Everything is synced');

	// Find me a first user then get the todos of the users todo records.
	User.findById(1).then(function(user) {
		user.getTodos(
			where: {
				completed: false
			}
		).then(function(todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		});
	});
	/*User.create({
		email:'test@example.com'
	}).then (function(){
		return Todo.create({
			description:'Clean Yard'
		});
	}).then (function(todo){
		User.findById(1).then(function(user){
			user.addTodo(todo);
		});
	});*/
});