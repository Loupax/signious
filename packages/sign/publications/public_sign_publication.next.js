Meteor.publish('SpecificPublicSign', function(_id){
   return SignsCollection.find({
      is_deleted: false,
      $or: [
         {'response_to_sign_id': _id},
         {'discussion_root_sign_id':_id},
         {'_id': _id, 'is_private': false},
         {'_id': _id, 'is_private': true, poster_id: this.userId},
         {'_id': _id, 'is_private': true, 'mentions.user_id': this.userId}
      ]
   });
});