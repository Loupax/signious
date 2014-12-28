Session.set('lastKnownLocation', new Location({latitude: 0, longitude: 0, altitude: 0}));
Signious = {
	geolocation: {
		onChange: function(location){
			//console.log('Location!', location);
			Signious.geolocation.lastKnownLocation.set(location.coords);
			if(!Location.prototype.isIdentical.call(location, Signious.geolocation.lastKnownLocation)){
				Session.set('lastKnownLocation', new Location(Signious.geolocation.lastKnownLocation));
			}
			
		},
		onError: function(){
			console.log(arguments);
		},
		options: {
		  enableHighAccuracy: false,
		  timeout: 5000,
		  maximumAge: 0
		},
		lastKnownLocation: new Location({latitude:0, longitude: 0, altitude: 0}),
		centralPointOfReference: [0,0],
		LOCATION_WATCH_ID: undefined
	}
};


Signious.geolocation.LOCATION_WATCH_ID = navigator.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);	


Tracker.autorun(function () {
  var lastKnownLocation = Session.get("lastKnownLocation");
  
  if(Location.prototype.isValid.call(lastKnownLocation)){
	console.log(lastKnownLocation);
	Meteor.call('Sign:getCentralPointOfReference',lastKnownLocation, function(err, data){
		var coords = (data && data.location)?data.location.coordinates:undefined;
		Signious.geolocation.centralPointOfReference = coords;
		Session.set('centralPointOfReference', coords);
		console.log(err,coords);
	});	
  }
  
  //Signious.geolocation.centralPointOfReference = SignsCollection.find({});
});