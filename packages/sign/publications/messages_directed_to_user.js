Meteor.publish('MessagesDirectedToUser', function MessagesDirectedToUser() {
    if(this.userId){
        return SignsCollection.find({
                'mentions._id': this.userId
            },
            {
                sort:{
                    when:-1
                }
            });
    }else{
        return SignsCollection.find({_id: '-1'});
    }
});