Session.setDefault('saving_message', 0);
var newMessageSave = function(template){
	var text = template.find('textarea').value,
        response_to_sign_id = template.find('[name="respond_to_sign_id"]').value,
        response_to_user_id = template.find('[name="respond_to_user_id"]').value,
        root_sign_id = response_to_sign_id,
        iterator;

    var i = 0;
    // We go bottom up to detect the root response of current response tree (if it exists)
    while(true){
        iterator = AccessibleSigns.find({_id: root_sign_id}).fetch()[0];
        if(iterator && iterator.response_to_sign_id)
            root_sign_id = iterator.response_to_sign_id;
        else
            break;

        // I don't like the fact that this loop can freeze the system...
        // Let's just add an arbitary exit point here
        if(i++ > 1000000){root_sign_id = ''; break;}

    }

	if(!text.trim()){
		return;
	}
	else
	{
		var sign = new Sign({
            text: text,
            location: Signious.geolocation.lastKnownLocation,
            poster_id: Meteor.user()?Meteor.user()._id:undefined,
            username: Meteor.user()?Meteor.user().username:'Anonymous',
            is_direct_message: false,
            response_to_sign_id: response_to_sign_id,
            response_to_user_id: response_to_user_id,
            discussion_root_sign_id: root_sign_id
        });

        var saving = Session.get('saving_message');
        Session.set('saving_message', ++saving);
		template.find('textarea').value = '';
		return sign.save().then(function(){
            var saving = Session.get('saving_message');
            Session.set('saving_message', --saving);
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

Handlebars.registerHelper('readonly', function(sign_id){
    return Session.get('saving_message')?'disabled':'';
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
