var options = {sort: {when: -1}/*, fields: {location:0}*/};
Meteor.publish('NearbyMessages', function(point){
    point = new Location(point);
    if(!point.isValid())
        return false;

    var cursor = SignsCollection.find({
        is_private: false,
        is_deleted: false,
        'location': {
            $near: {
                $geometry: point.toMongo(),
                $maxDistance: 1000
            }
        }
    }, options);
    return cursor;
});

Meteor.publish('OwnMessages', function(){
    var userId = this.userId || '';
    var userCursor = Meteor.users.find({_id: userId}, {limit:1, fields:{'profile.favorites': 1}});
    var user = userCursor.fetch().pop();
    var query = {
        is_deleted: false
    };

    if(!this.userId){
        query._id = -1;
    }else{
        query.$or = [];
        query.$or.push(
            { 'poster_id': userId },
            { 'mentions._id': userId},
            {'_id': { $in : user.profile.favorites}}
        );
    }
    var cursor = SignsCollection.find(query, options);
console.log('User changed!', user.profile.favorites);
    return [cursor, userCursor];
});
