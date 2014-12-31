Meteor.publish('NearbySigns', function NearbySigns(point) {
  if(point){
  	var rectangle = Location.makeRectangle({longitude: point[0], latitude: point[1]}, 1000, 1000)
  							.map(function(loc){ return [loc.longitude, loc.latitude];});

  	return SignsCollection.find({
  		'location': {
  			$geoWithin:{
  				$polygon: rectangle
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

Meteor.publish('CentralPointOfReference', function CentralPointOfReference(position){
	return SignsCollection.find({
		$near: {
			$geometry: position,
			$maxDistance: 1000
		}
	}
	,{
		limit:1, 
		sort:{
			when:1
		}
	});
});