Meteor.publish('MessagesDirectedToUser', function MessagesDirectedToUser() {
    if(this.userId){
        return SignsCollection.find({
                $or: [
                    {'mentions._id': this.userId},
                    {'response_to_user_id': this.userId}
                ]
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