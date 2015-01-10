SignsCollection = new Meteor.Collection('Signs');
SignsCollection.deny({
	'remove': function(){return true;},
	'update': function(){return true;},
});
SignsCollection.allow({
	// We wouldn't want impersonators...
	'insert': function(userId, doc){return userId === doc.poster_id;}
})
if(Meteor.isServer){
	SignsCollection._ensureIndex({location: '2dsphere'});	
}


Sign = function(o){
	this.text 		= o.text;
	this.when 		= new Date;
	this.location   = o.location;

	for(var prop in o){
		if(! (prop in this)){
			this[prop] = o[prop];
		}
	}
};

Sign.prototype.update = function(){
	throw new Error('Not yet implemented');
}

Sign.prototype.delete = function(){
	var self = this;

	return new Promise(function(resolve, reject){
		if(self._id === undefined){reject(new Error('Sign does not have an _id. It is not saved yet'));}
		Signs.delete({_id: self._id}, function(err){
			if(err){
				reject(err);
			}else{
				self._id = undefined;
				resolve();
			}
		});
	});
};

Sign.prototype.save = function(){
	var self = this;
	return new Promise(function(resolve, reject){
		if(self._id){
			reject(new Error('Sign already had _id. Maybe you meant to update?'));
		}
		
		SignsCollection.insert({
			poster_id: self.poster_id,
			text: self.text,
			when: self.when,
			location: self.location.toMongo()
		}, function(err, id){
			if(err){
				reject(err);
			}else{
				self._id = id;
				resolve(self);	
			}
		});	
	});
};