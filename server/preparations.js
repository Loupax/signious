Meteor.startup(function(){
    logger.info('Request made!');
    SignsCollection.find({$or: [{discussion_root_sign_id:''}, {discussion_root_sign_id:{$exists:false}}]}, {fields:{_id: 1}}).forEach(function(sign){
        SignsCollection.update({_id: sign._id}, {$set:{discussion_root_sign_id:sign._id}});
    });

    SignsCollection.update({is_deleted:{$exists:false}}, {$set:{is_deleted: false}}, {multi: true});
});
