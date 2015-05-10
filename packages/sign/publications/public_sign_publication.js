Meteor.publish('SpecificPublicSign', function(_id){
   return SignsCollection.find({_id: _id, direct_message:false}, {limit:1});
});