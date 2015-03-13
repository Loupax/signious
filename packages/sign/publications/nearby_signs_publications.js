Meteor.publish('NearbySigns', function NearbySigns(point) {
    point = new Location(point);

    var query = [];

    if(point.isValid()){
        query.push({
                direct_message: false,
                'location': {
                    $near: {
                        $geometry: point.toMongo(),
                        $maxDistance: 1000
                    }
                }
            })
    }

    if(this.userId){
        query = query.concat([{poster_id: this.userId}, {'mentions._id': this.userId}, {'response_to_user_id': this.userId}]);
    }

    if (query.length) {
        return SignsCollection.find(query.length === 1?query[0]:{$or: query}, {sort: {when: -1}});
    }else{
        return SignsCollection.find({_id: -1});
    }
});