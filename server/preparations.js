Meteor.startup(function(){
    logger.info('Request made!');
    var a = SignsCollection.update({'is_deleted':{$exists: false}}, {$set: {'is_deleted': false}}, {$multi:true});
    logger.info('Updated records', a);
});
