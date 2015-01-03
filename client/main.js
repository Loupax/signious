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

		lastKnownLocation: new Location({latitude:0, longitude: 0, altitude: 0}),
		centralPointOfReference: {
			get: function(){
				return this.isValid()?this._val.slice(0):undefined;
			}, 
			isValid: function(){
				return (this._val[0] > -1) && (this._val[1] > -1);
			},
			set: function(arr){ 
				if(!arr){
					this._val[0] = -1;
					this._val[1] = -1;
				}else{
					this._val[0] = Number(arr[0]); 
					this._val[1] = Number(arr[1]);	
				}
				
				Session.set('centralPointOfReference', this.get());
			},
			_val: [-1,-1]
		},
		LOCATION_WATCH_ID: undefined
	}
};


Signious.geolocation.LOCATION_WATCH_ID = navigator.geolocation.watchPosition(Signious.geolocation.onChange, Signious.geolocation.onError, Signious.geolocation.options);	


Tracker.autorun(function () {
  var lastKnownLocation = Session.get("lastKnownLocation");
  
  if(Location.prototype.isValid.call(lastKnownLocation)){
	Meteor.call('Sign:getCentralPointOfReference',lastKnownLocation, function(err, data){
		var coords = (data && data.location)?data.location.coordinates:undefined;
		Signious.geolocation.centralPointOfReference.set(coords);
	});	
  }
});