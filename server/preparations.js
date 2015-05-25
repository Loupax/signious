Meteor.startup(function(){
    logger.info('Signious is running!');
    Meteor.users.find({'profile.favorites': {$exists: false}}).forEach(function(user){
       Meteor.users.update({_id: user._id}, {$set: {'profile.favorites': []}});
    });
});
