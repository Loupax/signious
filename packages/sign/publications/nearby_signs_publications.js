var options = {sort: {when: -1}, fields: {location:0}};
Meteor.publish('NearbyMessages', function(point){
    point = new Location(point);
    if(!point.isValid())
        return false;

    var cursor = SignsCollection.find({
        direct_message: false,
        is_deleted: false,
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
    var query = {
        $or: [
            { poster_id: userId },
            {'mentions._id': userId},
            {'response_to_user_id': userId},
        ]
    };

    if(!this.userId){
        query.is_deleted = false;
    }else{
        query.$or.push({poster_id: userId, is_deleted: true});
    }
    var cursor = SignsCollection.find(query, options);

    return cursor;
});