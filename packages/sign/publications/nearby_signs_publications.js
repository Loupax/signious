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
    var cursor = SignsCollection.find({
        $or: [
            { poster_id: this.userId },
            {'mentions._id': this.userId},
            {'response_to_user_id': this.userId},
        ]
    }, options);
    return cursor;
});