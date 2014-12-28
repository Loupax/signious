Location = function(o){
	this.latitude 	= o?o.latitude:undefined;
	this.longitude 	= o?o.longitude:undefined;
	this.altitude 	= o?o.altitude:undefined;
};

Location.EARTH_RADIUS = 6378137;

Location.prototype.isIdentical = function isIdentical(point){
	return (this.latitude === point.latitude) && (this.longitude === point.longitude) && (this.altitude === point.altitude);
};

Location.prototype.distance = function distance(point){
	var xd = point.latitude  - this.latitude, 
		yd = point.longitude - this.longitude, 
		zd = point.altitude  - this.altitude;

	return Math.sqrt(xd*xd + yd*yd + zd*zd);
};

Location.prototype.set = function set(o){
	var self = this;
	['latitude', 'longitude','altitude'].map(function(prop){
		if (prop in o){
			self[prop] = o[prop];
		}
	});
};

Location.prototype.toMongo = function toMongo(){
	return {type: 'Point', coordinates: [this.longitude, this.latitude]};
};

Location.prototype.isValid = function isValid(){
	return (this.latitude !== undefined) && (this.longitude !== undefined);
};

Location.prototype.distanceTo = function distanceTo(to) {
  var lon1 = this.longitude;
  var lon2 = to.longitude;
  var lat1 = this.latitude;
  var lat2 = to.latitude;

  var R = 6378.137; // Radius of the earth in km
  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
  var dLon = (lon2-lon1).toRad(); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000;
};


Location.prototype.addMetersToLatitude = function addMetersToLatitude(meters){
	var dLat = meters/Location.EARTH_RADIUS;
	this.latitude = this.latitude + dLat * 180/Math.PI;
};

Location.prototype.addMetersToLongitude = function addMetersToLongitude(meters){
	var dLong = meters/(Location.EARTH_RADIUS*Math.cos(Math.PI*this.latitude/180));
	this.longitude = this.longitude+ dLong * 180/Math.PI;
};