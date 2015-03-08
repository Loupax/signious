var newMessageSave = function(template){
	var text = template.find('textarea').value,
        response_to_sign_id = template.find('[name="respond_to_sign_id"]').value,
        response_to_user_id = template.find('[name="respond_to_user_id"]').value;

	if(!text.trim()){
		return;
	}
	else
	{
		var sign = new Sign({
            text: text,
            location: Signious.geolocation.lastKnownLocation,
            poster_id: Meteor.user()?Meteor.user()._id:undefined,
            is_direct_message: false,
            response_to_sign_id: response_to_sign_id,
            response_to_user_id: response_to_user_id
        });
		
		template.find('textarea').value = '';
		sign.save().then(function(){
			console.log(sign);
		}).catch(function(){ 
			console.log('Error...', arguments);
		});
	}
};

Session.setDefault('NewMessageFormOpenResponseForms', []);

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
