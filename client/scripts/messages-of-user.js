var isReady;

Template.UserMessages.helpers({
	messages: function(){
		isReady = Meteor.subscribe('MessagesOfUser');
		return SignsCollection.find({},{
			sort:{
  				when:-1
  			}
  		});
	},
	isReady: function(){
		return isReady.ready();
	}
});