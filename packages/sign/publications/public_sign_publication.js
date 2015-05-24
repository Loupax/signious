Meteor.publish('SpecificPublicSign', function(_id){
   return SignsCollection.find({
      _id: _id,
      $or: [{'is_deleted': true, poster_id: this.userId}, {'is_private': true, poster_id: this.userId}]
   }, {limit:1});
});