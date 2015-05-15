// Set the coordinates of South Pole as our default coordinates
// That way our subscriptions will be complete even when the browser
// denies Geolocation access. We need that for 2 reasons.
// A: Make the app usable even without geolocation
// B: Make the app crawlable even without geolocation
var INITIAL_LOCATION = new Location({latitude: 90, longitude: 0, altitude: 0});
Session.set('lastKnownLocation', INITIAL_LOCATION);

Signious = {
	geolocation: {
		onChange: function(location){
			//console.log('Location!', location);
			Signious.geolocation.lastKnownLocation.set(location.coords);
			if(!Location.prototype.isIdentical.call(location, Signious.geolocation.lastKnownLocation)){
				Session.set('lastKnownLocation', new Location(Signious.geolocation.lastKnownLocation));
			}
			
		},
		onError: function(error){
			switch(error.code){
				// PERMISSION_DENIED
				case 1:
				break;
				// POSITION_UNAVAILABLE
				case 2:
				break;
				// TIMEOUT
				case 3:
				break;
			}
			console.error(error);
		},
		options: {
		  enableHighAccuracy: false,
		  timeout: 5000,
		  maximumAge: 0
		},

		lastKnownLocation: INITIAL_LOCATION,
		LOCATION_WATCH_ID: undefined
	}
};

if(navigator.geolocation) {
	Signious.geolocation.LOCATION_WATCH_ID = navigator.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);
}