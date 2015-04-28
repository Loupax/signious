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
    index: function () {
        this.render('home');
    }
});