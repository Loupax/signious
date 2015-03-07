var newMessageSave = function(template){
	var text = template.find('textarea').value;
	if(!text.trim()){
		return;
	}
	else
	{
		var sign = new Sign({
            text: text,
            location: Signious.geolocation.lastKnownLocation,
            poster_id: Meteor.user()?Meteor.user()._id:undefined,
            is_direct_message: false
        });
		
		template.find('textarea').value = '';
		sign.save().then(function(){
			
		}).catch(function(){ 
			console.log('Error...', arguments);
		});
	}
};

Template.NewMessageForm.events({
	'submit form': function formSubmissionHandler(event, template){
		event.preventDefault();
		newMessageSave(template);
	},
	'keyup [name="message"]': function keyupNewMessageFormHandler(event, template){
		if(event.which === 13 && !event.shiftKey){
			newMessageSave(template);
		}
	}
});