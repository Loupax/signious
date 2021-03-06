var options = {sort: {when: -1}, reactive: false/*, fields: {location:0}*/};
Meteor.publish('NearbyMessages', function(point, limit){
    point = new Location(point);
    if(!point.isValid())
        return false;
    var o  = _.extend(options);
    //o.limit = limit;
    var cursor = SignsCollection.find({
        $where: 'this._id === this.discussion_root_sign_id',
        is_private: false,
        is_deleted: false,
        'location': {
            $near: {
                $geometry: point.toMongo(),
                $maxDistance: 1000
            }
        }
    }, o);
    return cursor;
});

Meteor.publish('OwnMessages', function(limit){
    var userId = this.userId || '';
    
    if(!userId){
        this.ready();
    }else{
        var userCursor = Meteor.users.find({_id: userId}, {limit:1, fields:{'profile.favorites': 1}});
        var user = userCursor.fetch().pop();
        var query = {
            is_deleted: false
        };
    
        if(!this.userId){
            query._id = -1;
        }else{
            query.$where = 'this._id === this.discussion_root_sign_id';
            query.$or = [];
            query.$or.push(
                { 'poster_id': userId },
                { 'mentions._id': userId}
            );
            if(user && user.profile && user.profile.favorites){
                query.$or.push({'_id': { $in : (user.profile)?user.profile.favorites:[]}});
            }
        }
        var o  = _.extend(options);
            o.limit = limit;
        var cursor = SignsCollection.find(query, o);
        return [cursor, userCursor];
    }
});
