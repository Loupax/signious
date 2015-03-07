Meteor.publish('MessagesOfUser', function MessagesOfUser() {
  if(this.userId){
  	return SignsCollection.find({
  		poster_id: this.userId
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