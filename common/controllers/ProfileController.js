var currentUser = new ReactiveVar(undefined);

ProfileController = ApplicationController.extend({
    data: {
        user: function () {
            console.log(Meteor.users.find({_id: currentUser.get()}).fetch().pop());
            return Meteor.users.find({_id: currentUser.get()}).fetch().pop();
        },
        ownedProfile: function () {
            return currentUser.get() && Meteor.user() && (currentUser.get().username === Meteor.user().username);
        },
        messages: function () {
            return SignsCollection.find({
                response_to_sign_id: '',
                poster_id: currentUser.get() || -1
            }, {
                sort: {
                    when: -1
                },
                limit: Meteor.isClient?Session.get('limit'):100
            });
        }
    },
    index: function (path) {
        if (path.url.indexOf('/profile/show') > -1) {
            var user = Meteor.users.find({_id: Meteor.userId()}).fetch().pop();
        } else {
            var user = Meteor.users.find({username: decodeURIComponent(path.url).split('/').pop()}).fetch().pop();
        }
        currentUser.set(user?user._id:-1);
        this.render('profile');
    },
    edit: function () {
        var user = Meteor.users.find({_id: Meteor.userId()}).fetch().pop();
        currentUser.set(user);
        this.render('ProfileEditor');
    }
});