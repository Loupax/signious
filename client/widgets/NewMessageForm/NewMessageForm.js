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
		return sign.save().then(function(){
            var responses = Session.get('NewMessageFormOpenResponseForms');
            var index = responses.indexOf(sign.response_to_sign_id);
            if(index > -1){
                responses.splice(index, 1);
                Session.set('NewMessageFormOpenResponseForms', responses.slice());
            }
		});
	}
};

Session.setDefault('NewMessageFormOpenResponseForms', []);
Session.setDefault('TypedInText', {});

Handlebars.registerHelper('unsavedMessageText', function(sign_id){
    var texts = Session.get('TypedInText');
    return texts[sign_id||''] || '';
});

Template.NewMessageForm.events({
	'submit form': function formSubmissionHandler(event, template){
		event.preventDefault();
		newMessageSave(template);
	},
	'keyup [name="message"]': function keyupNewMessageFormHandler(event, template){
		var texts = Session.get('TypedInText'),
            response_id = template.find('[name="respond_to_sign_id"]').value;
        texts[response_id] = template.find('textarea').value;
        Session.set('TypedInText', _.extend(texts));
        if(event.which === 13 && !event.shiftKey){
			newMessageSave(template).then(function(){
                delete texts[response_id];
                Session.set('TypedInText', _.extend(texts));
            }).catch(function(){
                delete texts[response_id];
                Session.set('TypedInText', _.extend(texts));
            });
		}
	}
});
