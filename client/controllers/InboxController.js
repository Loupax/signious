var isReady;
InboxController = ApplicationController.extend({
    data: {
        messages: function(){
            isReady = Meteor.subscribe('MessagesDirectedToUser');
            return SignsCollection.find({},{
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
        this.render('Messages');
    }
});