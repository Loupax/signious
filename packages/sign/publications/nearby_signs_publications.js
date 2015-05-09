Meteor.publish('NearbySigns', function NearbySigns(point) {
    point = new Location(point);
    var self = this, published = {}, observers, users = {};

    observers = {
        added: function (sign_id,sign) {
            if(!published[sign_id]) {
                self.added('AccessibleSigns', sign_id, sign);
                published[sign_id] = true;
            }
        },
        changed: function(sign_id, sign){
            self.changed('AccessibleSigns', sign_id, sign);
        },
        removed: function(sign_id, sign){
            self.removed('AccessibleSigns', sign_id, sign);
        }
    };

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
        });
        var handle = cur1.observeChanges(observers);
        self.onStop(function(){handle.stop();});
    }

    if (this.userId) {
        // If the user is logged in, also add any messages that refer to her. We don't care if these are public or not.
        // If they are about her, let her see it
        var cur = SignsCollection.find({$or: [{poster_id: this.userId}, {'mentions._id': this.userId}, {'response_to_user_id': this.userId}]});
        var handle2 = cur.observeChanges(observers);
        self.onStop(function(){handle2.stop();});
    }

    if(point.isValid())
        self.ready();
});