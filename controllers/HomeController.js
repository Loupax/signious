HomeController = ApplicationController.extend({
    data: {
        messages: function(){
            return SignsCollection.find({},{
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