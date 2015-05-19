Meteor.publish('SpecificPublicSign', function(_id){
   return SignsCollection.find({
      _id: _id,
      direct_message:false,
      $or: [{'is_deleted': false}, {poster_id: this.userId}]
   }, {limit:1});
});