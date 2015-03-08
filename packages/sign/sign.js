SignsCollection = new Meteor.Collection('Signs');
SignsCollection.deny({
	'remove': function(){return true;},
	'update': function(){return true;}
});
SignsCollection.allow({
	// We wouldn't want impersonators...
	'insert': function(userId, doc){return userId === doc.poster_id;}
});


if(Meteor.isServer){
	SignsCollection._ensureIndex({location: '2dsphere'});

    Meteor.methods({
        SignPackage_save: function(sign){
            return SignsCollection.insert({
                poster_id: sign.poster_id,
                username: sign.username,
                text: sign.text,
                when: sign.when,
                location: Location.prototype.toMongo.call(sign.location),
                direct_message: sign.direct_message,
                response_to_user_id: sign.response_to_user_id,
                response_to_sign_id: sign.response_to_sign_id,
                mentions: Sign.getMentions(sign)
            });
        }
    });
}


Sign = function Sign(o){
	this.text 		= o.text;
	this.when 		= new Date;
	this.location   = o.location;
    this.direct_message = o.direct_message || false;
    //this.mentions is populated on the server

	for(var prop in o){
		if(! (prop in this)){
			this[prop] = o[prop];
		}
	}
};

Sign.getMentions = function(sign){
    var re = /(?:^|\W)@(\w+)(?!\w)/g, match, mentions = [];
    while (match = re.exec(sign.text)) {
        mentions.push(match[1]);
    }

    var users = Meteor.users.find({username: {$in: mentions}}, {fields: {'username':1, '_id': 1}}).fetch();
    return users;
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

        Meteor.call('SignPackage_save', self, function(err, _id){
            if(err){
                reject(err);
            }else{
                resolve(self);
            }
        });
	});
};