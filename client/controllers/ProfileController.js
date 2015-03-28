var valid, isReady;
ProfileController = ApplicationController.extend({
    data: {
        messages: function(){
            return AccessibleSigns.find({
                response_to_sign_id: '',
                $or:[
                    {poster_id: Meteor.userId()},
                    {'mentions._id': Meteor.userId()},
                    {'response_to_user_id': Meteor.userId()}
                ]

            },{
                sort:{
                    when:-1
                }
            });
        },
        waitOn: function(){
            var loc = new Location(Session.get('lastKnownLocation'));
            return Meteor.subscribe('NearbySigns', loc, function(){
                valid = true;
            });
        },
        isReady: function(){
            return valid;
        }
    },

    index: function () {
        this.render('home');
    }
});