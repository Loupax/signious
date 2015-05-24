var options = {sort: {when: -1}, fields: {location:0}};
Meteor.publish('NearbyMessages', function(point){
    point = new Location(point);
    if(!point.isValid())
        return false;

    var cursor = SignsCollection.find({
        is_private: false,
        $or: [{is_deleted: false}, {is_deleted: {$exists: false}}],
        'location': {
            $near: {
                $geometry: point.toMongo(),
                $maxDistance: 1
            }
        }
    }, options);
    return cursor;
});

Meteor.publish('OwnMessages', function(){
    var userId = this.userId || '';
    var query = {};

    if(!this.userId){
        query._id = -1;
    }else{
        query.$or = [];
        query.$or.push(
            { 'poster_id': userId },
            { 'mentions._id': userId, is_deleted: false},
            { 'response_to_user_id': userId, is_deleted: false}
        );
    }
    var cursor = SignsCollection.find(query, options);

    return cursor;
});
