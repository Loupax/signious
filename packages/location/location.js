Location = function(o){
	this.latitude 	= o?o.latitude:undefined;
	this.longitude 	= o?o.longitude:undefined;
	this.altitude 	= o?o.altitude:undefined;
};

Location.prototype.isIdentical = function(point){
	return (this.latitude === point.latitude) && (this.longitude === point.longitude) && (this.altitude === point.altitude);
};

Location.prototype.distance = function(point){
	var xd = point.latitude  - this.latitude, 
		yd = point.longitude - this.longitude, 
		zd = point.altitude  - this.altitude;

	return Math.sqrt(xd*xd + yd*yd + zd*zd);
};

Location.prototype.toMongo = function(){
	return {type: 'Point', coordinates: [this.longitude, this.latitude]};
};