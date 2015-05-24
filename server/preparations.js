Meteor.startup(function(){
    logger.info('Signious is running!');
    SignsCollection.update({direct_message: {$exists: false}}, {$set: {direct_message:false}}, {multi: true});
    SignsCollection.update({is_private: {$exists: false}}, {$set: {is_private:false}}, {multi: true});
    SignsCollection.update({direct_message: {$exists: true}}, {$unset: {direct_message:''}}, {multi: true});

    SignsCollection.find({discussion_root_sign_id: ''}).forEach(function(a){
        SignsCollection.update({_id: a._id}, {$set: {discussion_root_sign_id: a._id}});
    });
});
