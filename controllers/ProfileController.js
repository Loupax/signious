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
        var user = Meteor.users.find({}).fetch().pop();

        if(!user) {
            this.render('userNotFound');
        }else {
            currentUser.set(user);
            this.render('profile');
        }
    },
    edit: function(){
        this.render('ProfileEditor');
    }
});