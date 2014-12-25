Template.NewMessageForm.events({
	'submit form': function(event, template){
		event.preventDefault();
		var text = template.find('textarea').value;
		if(!text.trim()){
			return;
		}
		else
		{
			var sign = new Sign({text: text, location: Signious.geolocation.lastKnownLocation.coords});
			template.find('textarea').value = '';
			sign.save();
		}
		
		/*Signs.insert({
			text: text,
			when: new Date,
			location: new Location(Signious.geolocation.lastKnownLocation.coords).toMongo()
		});
		console.log(arguments, template.find('textarea').value, this);*/
	}
});