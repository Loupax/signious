Signious = {
	geolocation: {
		onChange: function(location){
			Signious.geolocation.lastKnownLocation = location;
			if(!Location.prototype.isIdentical.call(location, Signious.geolocation.lastKnownLocation.coords)){
				Session.set('lastKnownLocation', Signious.geolocation.lastKnownLocation);
				console.log('Location got:', Signious.geolocation.lastKnownLocation);
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
		lastKnownLocation: {latitude:0, longitude: 0, altitude: 0},
		LOCATION_WATCH_ID: undefined
	}
};


Signious.geolocation.LOCATION_WATCH_ID = navigator.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);	
