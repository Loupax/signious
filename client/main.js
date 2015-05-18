// Set the coordinates of South Pole as our default coordinates
// That way our subscriptions will be complete even when the browser
// denies Geolocation access. We need that for 2 reasons.
// A: Make the app usable even without geolocation
// B: Make the app crawlable even without geolocation
var INITIAL_LOCATION = new Location();
Session.set('lastKnownLocation', INITIAL_LOCATION);

Signious = {
	updateLocationFromIP: function updateLocationFromIP(){
		Meteor.call('myGeoIPLocation',function(err, location){
			if(!err){
				Signious.geolocation.set(location);
				Session.set('lastKnownLocation', new Location(Signious.geolocation.lastKnownLocation));
			}
		});
	},
	geolocation: {
		onChange: function(location){
			Signious.geolocation.lastKnownLocation.set(location.coords);
			if(!Location.prototype.isIdentical.call(location, Signious.geolocation.lastKnownLocation)){
				Session.set('lastKnownLocation', new Location(Signious.geolocation.lastKnownLocation));
			}
		},
		onError: function(error){
			switch(error.code){
				// PERMISSION_DENIED
				case 1:
					if(Utilities.geolocation !== geolocationFallback){
						// User denied geolocation... Switching to IP geolocation instead
						// just to keep the app running
						Utilities.clearWatch(Signious.geolocation.LOCATION_WATCH_ID);
						Utilities.geolocation = geolocationFallback;
						Signious.geolocation.LOCATION_WATCH_ID = Utilities.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);
					}
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
		  maximumAge: 1000 * 60
		},

		lastKnownLocation: INITIAL_LOCATION,
		LOCATION_WATCH_ID: undefined
	}
};
Utilities = {};
// We keep the fallback in a variable, to allow switching on the fly later
// in the case the user denies us geolocation. Not as accurate but still better
// than having an unusable app
var geolocationFallback = {
	watchPosition: function watchPosition(onChange, onError, options){
		var o = _.extend({timeout:5000, maximumAge:1000 * 60},options);
		return Meteor.setInterval(function(){
			Utilities.geolocation.getCurrentPosition(function(data){
				onChange(data);
			}, function(error){
				onError(error);
			});
		}, o.maximumAge);
	},
	clearWatch: function clearWatch(watchId){
		Meteor.clearInterval(watchId);
	},
	getCurrentPosition: function getCurrentPosition(success,error){
		Meteor.call('myGeoIPLocation',function(err, location){
			var _loc = {
				coords: {
					accuracy: null,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: location.latitude,
					longitude: location.longitude,
					speed: null
				},
				timestamp: new Date().getTime()
			};
			if(err)
				error(err);
			else
				success(_loc);
		});
	}
};
if(!navigator.geolocation) {
	Utilities.geolocation = geolocationFallback;
}else{
	Utilities.geolocation = navigator.geolocation;
}
Signious.geolocation.LOCATION_WATCH_ID = Utilities.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);
