Meteor.methods({
    'getUserProfile': function(username){
        var user = Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}}).fetch().pop();
        if(!user)
            throw new Meteor.Error('404', 'Not found', 'Not found');

        return user;
    }
});