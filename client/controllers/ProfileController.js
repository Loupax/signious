var currentUser = new ReactiveVar(undefined);

ProfileController = ApplicationController.extend({
    data: {
        user: function(){
          return currentUser.get();
        },
        ownedProfile: function(){
            return currentUser.get() && Meteor.user() && (currentUser.get().username === Meteor.user().username);
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
        var username = (Router.current().params.username || Meteor.user()?Meteor.user().username:'') || -1;
        Meteor.call('getUserProfile', username, function(err, user){
            if(err) {
                self.render('userNotFound');
            }else {
                currentUser.set(user);
                self.render('profile');
            }

        });
    },
    edit: function(){
        this.render('ProfileEditor');
    }
});