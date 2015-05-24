// This is the collection that all signs get stored into
SignsCollection = new Meteor.Collection('Signs');
SignsCollection.deny({
	'remove': function(){return true},
	'update': function(){return true;}
});

if(Meteor.isClient){
	Session.setDefault('loadingNearbySigns', true);
	var handler = Deps.autorun(function () {
		var loc = new Location(Session.get('lastKnownLocation'));
		var subscriptions = [
			Meteor.subscribe('OwnMessages'),
			Meteor.subscribe('NearbyMessages', loc)
		];

		var i = 0;
		subscriptions.forEach(function(sub){if(sub.ready()){i++;}});
		if(i === subscriptions.length)
			Session.set('loadingNearbySigns', false);

	});
}


SignsCollection.allow({
	// We wouldn't want impersonators...
	'remove': function(userId, doc){return userId === doc.poster_id;},
	'insert': function(userId, doc){return userId === doc.poster_id;}
});
if(Meteor.isServer){
	SignsCollection._ensureIndex({location: '2dsphere'});
}



Sign = function Sign(o){
	this.text 		= o.text;
	this.when 		= new Date;
	this.location   = o.location;
    this.is_private = o.is_private || false;
    //this.mentions is populated on the server

	for(var prop in o){
		if(! (prop in this)){
			this[prop] = o[prop];
		}
	}
};

Sign.getMentions = function(sign){
    var re = /@(.+?)(?=\s|$)/g, match, mentions = [];
    while (match = re.exec(sign.text)) {
        mentions.push(match[1]);
    }

    var users = Meteor.users.find({username: {$in: mentions}}, {fields: {'username':1, '_id': 1}}).fetch();
    return users;
};

Sign.prototype.update = function(){
	throw new Error('Not yet implemented');
};

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

        Meteor.call('Sign:save', self, function(err, _id){
            if(err){
                reject(err);
            }else{
                resolve(self);
            }
        });
	});
};