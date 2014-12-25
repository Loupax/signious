Signs = new Meteor.Collection('Signs');
if(Meteor.isServer){
	Signs._ensureIndex({location: '2dsphere'});	
}
