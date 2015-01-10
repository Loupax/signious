var isReady, loc;

Template.NearbyMessages.helpers({
	messages: function(){
		loc = Session.get('lastKnownLocation');
		isReady = Meteor.subscribe('NearbySigns', loc);
		return SignsCollection.find({},{
			sort:{
  				when:-1
  			}
  		});
	},
	isReady: function(){
		return isReady.ready() && loc;
	}
});