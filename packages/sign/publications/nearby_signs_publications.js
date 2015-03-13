Meteor.publish('NearbySigns', function NearbySigns(point) {
    point = new Location(point);
    if (point.isValid() && this.userId) {
        return SignsCollection.find({
                $or: [
                    {
                        direct_message: false,
                        'location': {
                            $near: {
                                $geometry: point.toMongo(),
                                $maxDistance: 1000
                            }
                        }
                    },
                    {poster_id: this.userId},
                    {'mentions._id': this.userId},
                    {'response_to_user_id': this.userId}
                ]
            },
            {
                sort: {
                    when: -1
                }
            });
    } else if(this.userId){
        return SignsCollection.find({
            $or:[
                {poster_id: this.userId},
                {'mentions._id': this.userId},
                {'response_to_user_id': this.userId}
        ]}, {sort: {when: -1}});
    }else{
        return SignsCollection.find({_id: -1});
    }
});