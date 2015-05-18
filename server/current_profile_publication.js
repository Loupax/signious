Meteor.publish('SpecificProfilePublication', function(username){
    return Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}});
});
