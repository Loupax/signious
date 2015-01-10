Meteor.publish('NearbySigns', function NearbySigns(point) {
  point = new Location(point);
  if(point.isValid()){
  	return SignsCollection.find({
  		'location': {
            $near: { 
                  $geometry : point.toMongo(),
                  $maxDistance : 1000
            }
        }
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