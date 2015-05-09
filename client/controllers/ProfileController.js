var currentUser = new ReactiveVar(undefined);

ProfileController = ApplicationController.extend({
    data: {
        user: function(){
          return currentUser.get();
        },
        ownedProfile: function(){
            return currentUser.get() && Meteor.user() && (currentUser.get() === Meteor.user().username);
        },
        messages: function(){
            return AccessibleSigns.find({
                response_to_sign_id: '',
                $or:[
                    {poster_id: currentUser.get()?currentUser.get()._id:-1}
                ]

            },{
                sort:{
                    when:-1
                }
            });
        }
    },
    index: function (req) {
        var self = this;
        Meteor.call('getUserProfile', (Router.current().params.username || Meteor.user().username), function(err, user){
            if(err) {
                self.render('userNotFound');
            }else {
                currentUser.set(user);
            }

        });
        this.render('profile');
    },
    edit: function(){
        this.render('ProfileEditor');
    }
});