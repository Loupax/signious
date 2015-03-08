var valid, isReady;
HomeController = ApplicationController.extend({
    data: {
        messages: function(){
            var loc = new Location(Session.get('lastKnownLocation'));
            valid = loc && loc.isValid();
            isReady = Meteor.subscribe('NearbySigns', loc);
            return SignsCollection.find({
                'response_to_user_id':''
            },{
                sort:{
                    when:-1
                }
            });
        },
        isReady: function(){
            return isReady.ready() && valid;
        }
    },

    index: function () {
        this.render('home');
    }
});