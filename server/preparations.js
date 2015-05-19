Meteor.startup(function(){
    logger.info('Request made!');
    SignsCollection.update({'is_deleted':{$exists: false}}, {$set: {'is_deleted': false}}, {$multi:true});
});
