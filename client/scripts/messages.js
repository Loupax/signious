var isReady, valid;

Template.NearbyMessages.helpers({
	messages: function(){
		var loc = new Location(Session.get('lastKnownLocation'));
		valid = loc && loc.isValid();
		isReady = Meteor.subscribe('NearbySigns', loc);
		return SignsCollection.find({},{
			sort:{
  				when:-1
  			}
  		});
	},
	isReady: function(){
		return isReady.ready() && valid;
	}
});