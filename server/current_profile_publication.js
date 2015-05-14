Meteor.publish('SpecificProfilePublication', function(username){
    console.log(username, Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}}).fetch());
    return Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}});
});
