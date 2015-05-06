ProfileController = ApplicationController.extend({
    data: {
        user: function(){
          return Meteor.user();
        },
        messages: function(){
            return AccessibleSigns.find({
                response_to_sign_id: '',
                $or:[
                    {poster_id: Meteor.userId()}
                ]

            },{
                sort:{
                    when:-1
                }
            });
        }
    },
    index: function () {
        this.render('profile');
    },
    edit: function(){
        this.render('ProfileEditor');
    }
});