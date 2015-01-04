var isReady;

Template.UserMessages.helpers({
	messages: function(){
		isReady = Meteor.subscribe('MessagesOfUser');
		return SignsCollection.find({poster_id: Meteor.user()?Meteor.user()._id:-1},{
			sort:{
  				when:-1
  			}
  		});
	},
	isReady: function(){
		return isReady.ready();
	}
});