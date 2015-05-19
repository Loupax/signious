Meteor.publish('NearbySigns', function NearbySigns(point) {
    point = new Location(point);
    var self = this, published = {}, observers, options = {sort: {when: -1}, fields: {location:0}};

    //observers =

    if (point.isValid()) {
        // add any nearby messages to the publication, but only if they are not direct messages to anyone
        // In other words "if you are nearby, and it's public, you can see it"
        var cur1 = SignsCollection.find({
            direct_message: false,
            'location': {
                $near: {
                    $geometry: point.toMongo(),
                    $maxDistance: 1000
                }
            }
        }, options);
        var handle = cur1.observeChanges({
            added: function (sign_id,sign) {
                if(!published[sign_id]) {
                    self.added('SignsCollection', sign_id, sign);
                    published[sign_id] = true;
                }
            },
            changed: function(sign_id, sign){
                self.changed('SignsCollection', sign_id, sign);
            },
            removed: function(sign_id, sign){
                if(published[sign_id]) {
                    self.removed('SignsCollection', sign_id);
                    delete published[sign_id];
                }
            }
        });
        self.onStop(function(){handle.stop();});
    }

    if (this.userId) {
        // If the user is logged in, also add any messages that refer to her. We don't care if these are public or not.
        // If they are about her, let her see it
        var cur2 = SignsCollection.find({
            $or: [
                { poster_id: this.userId },
                {'mentions._id': this.userId},
                {'response_to_user_id': this.userId},
            ]
        }, options);
        var handle2 = cur2.observeChanges({
            added: function (sign_id,sign) {
                if(!published[sign_id]) {
                    self.added('SignsCollection', sign_id, sign);
                    published[sign_id] = true;
                }
            },
            changed: function(sign_id, sign){
                self.changed('SignsCollection', sign_id, sign);
            },
            removed: function(sign_id, sign){
                if(published[sign_id]) {
                    self.removed('SignsCollection', sign_id);
                    delete published[sign_id];
                }
            }
        });
        self.onStop(function(){handle2.stop();});
    }

    //self.onStop(function(){handle3.stop();});

    if(point.isValid())
        self.ready();
});

Meteor.publish('NearbyMessages', function(point){
    point = new Location(point);
    if(!point.isValid())
        return false;

    var options = {sort: {when: -1}, fields: {location:0}};
    var cursor = SignsCollection.find({
        direct_message: false,
        is_deleted: false,
        'location': {
            $near: {
                $geometry: point.toMongo(),
                $maxDistance: 1000
            }
        }
    }, options);

    return cursor;//{this.ready(); console.log('Ready!');}
});

Meteor.publish('OwnMessages', function(){
    if(!this.userId)
        return false;
    var options = {sort: {when: -1}, fields: {location:0}};
    var cursor = SignsCollection.find({
        $or: [
            { poster_id: this.userId },
            {'mentions._id': this.userId},
            {'response_to_user_id': this.userId},
        ]
    }, options);

    return cursor;

});