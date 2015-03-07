Iron.utils.debug = true;

ProfileController = ApplicationController.extend({
    data: {
        messages: function(){
            isReady = Meteor.subscribe('MessagesOfUser');
            console.log('isReady', isReady);
            return SignsCollection.find({poster_id: Meteor.user()?Meteor.user()._id:-1},{
                sort:{
                    when:-1
                }
            });
        },
        isReady: function(){
            return isReady.ready();
        }
    },
    index: function () {
        this.render('UserMessages');
    }
});