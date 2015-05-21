Meteor.startup(function(){
    logger.info('Request made!');
    SignsCollection.find({discussion_root_sign_id:''}, {fields:{_id: 1}}).forEach(function(sign){
        SignsCollection.update({_id: sign._id}, {$set:{discussion_root_sign_id:sign._id}});
    });
});
