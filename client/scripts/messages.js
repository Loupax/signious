var isReady, cop;

Template.NearbyMessages.helpers({
	messages: function(){
		cop = Session.get('centralPointOfReference');
		isReady = Meteor.subscribe('NearbySigns', cop);
		return SignsCollection.find({},{
			sort:{
  				when:-1
  			}
  		});
	},
	isReady: function(){
		return isReady.ready() && cop;
	}
});