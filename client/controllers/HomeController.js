var valid;
HomeController = ApplicationController.extend({
    data: {
        messages: function(){
            return AccessibleSigns.find({
                response_to_sign_id: ''
            },{
                sort:{
                    when:-1
                }
            });
        },
        isReady: function(){
            return valid;
        }
    },
    waitOn: function(){
        var loc = new Location(Session.get('lastKnownLocation'));
        return Meteor.subscribe('NearbySigns', loc, function(){
            valid = true;
        });
    },

    index: function () {
        this.render('home');
    }
});