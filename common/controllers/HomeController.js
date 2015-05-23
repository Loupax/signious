HomeController = ApplicationController.extend({
    data: {
        messages: function () {
            return SignsCollection.find({
                response_to_sign_id: ''
            }, {
                sort: {
                    when: -1
                }
            });
        }
    },
    index: function () {
        this.render('home');
    }
});