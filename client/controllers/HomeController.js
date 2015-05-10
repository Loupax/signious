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
        }
    },
    index: function () {
        this.render('home');
    }
});