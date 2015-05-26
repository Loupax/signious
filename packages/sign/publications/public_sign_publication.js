Meteor.publish('SpecificPublicSign', function(_id){
   return SignsCollection.find({
      $or: [{'_id': _id, 'is_deleted': false},
         {'_id': _id, 'is_private': false},
         {'_id': _id, 'is_deleted': true, poster_id: this.userId},
         {'_id': _id,'is_private': true, poster_id: this.userId},
         {'_id': _id,'is_private': true, 'mentions.user_id': this.userId}
      ]
   }, {limit:1});
});