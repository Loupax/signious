var isReady;
ProfileController = ApplicationController.extend({
    data: {
        messages: function(){
            isReady = Meteor.subscribe('MessagesOfUser');
            return SignsCollection.find({
                'response_to_user_id':''
            },{
                sort:{
                    when:-1
                }
            });
        },
        responses: function(){
          return SignsCollection.find({
              'response_to_user_id': Meteor.userId()
          },{
              sort: -1
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