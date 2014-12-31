Template.NewMessageForm.events({
	'submit form': function(event, template){
		event.preventDefault();
		var text = template.find('textarea').value;
		if(!text.trim()){
			return;
		}
		else
		{
			var sign = new Sign({text: text, location: Signious.geolocation.lastKnownLocation});
			//console.log(sign, Signious.geolocation.lastKnownLocation);die();
			template.find('textarea').value = '';
			sign.save().then(function(){
				if(!Signious.geolocation.centralPointOfReference.get()){
					Signious.geolocation.centralPointOfReference.set([sign.location.longitude, sign.location.latitude]);	
				}
			}).catch(function(){ 
				console.log('Error...', arguments);
			});
		}
		
		/*Signs.insert({
			text: text,
			when: new Date,
			location: new Location(Signious.geolocation.lastKnownLocation.coords).toMongo()
		});
		console.log(arguments, template.find('textarea').value, this);*/
	}
});