if(Meteor.isClient)
    Session.setDefault('limit', 20);
HomeController = ApplicationController.extend({
    data: {
        messages: function () {
            return SignsCollection.find({
                response_to_sign_id: ''
            }, {
                sort: {
                    when: -1
                },
                limit: Meteor.isClient?Session.get('limit'):100
            });
        }
    },
    index: function () {
        this.render('home');
    }
});