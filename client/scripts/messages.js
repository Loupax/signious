Template.NearbyMessages.helpers({
	messages: function(){
		Meteor.subscribe('NearbySigns', Session.get('centralPointOfReference'));
		return SignsCollection.find({},{
			sort:{
  				when:-1
  			}
  		});
	}
});