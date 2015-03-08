Meteor.publish('MessagesOfUser', function MessagesOfUser() {
  if(this.userId){
  	return SignsCollection.find({
  		$or:[
            {poster_id: this.userId},
            {'mentions._id': this.userId},
            {'response_to_user_id': this.userId}
      ]
  	},
  	{
  		sort:{
  			when:-1
  		}
  	}); 	
  }else{
  	return SignsCollection.find({_id: '-1'}); 
  }
});