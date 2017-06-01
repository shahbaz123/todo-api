var cryptojs = require('crypto-js');
module.exports = function(db) {

	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth') || '';
			//console.log(token);

			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance) {
				if (!tokenInstance) {
					//console.log ('tokenInstance not found');
					throw new Error();
				}
				//console.log ('tokenInstance ' + tokenInstance);
				req.token = tokenInstance;
				//console.log ('tokenInstance ' + tokenInstance);
				return db.user.findByToken(token);
			}).then(function(user) {
				req.user = user;
				//console.log ('user: ' + user);
				next();
			}).catch(function(e) {
				//console.log ('Exception :' + e);
				res.status(401).send();
			});
		}
	};
};