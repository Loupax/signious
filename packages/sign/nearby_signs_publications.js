Meteor.publish('NearbySigns', function NearbySigns(point) {
  //var pointOfReference  = SignsCollection.find({}, {limit:1}).fetch(); 
  if(point){
  	return SignsCollection.find({}); 	
  }else{
  	return SignsCollection.find({_id: '-1'}); 
  }
  

  //return [pointOfReference, nearbySignsCursor];
});

Meteor.publish('CentralPointOfReference', function CentralPointOfReference(position){
	return SignsCollection.find({$near: position},{limit:1, sort:{when:1}});
});