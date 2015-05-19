Session.setDefault('saving_message', 0);
var newMessageSave = function(template){
	var text = template.find('textarea').value,
        response_to_sign_id = template.find('[name="respond_to_sign_id"]').value,
        response_to_user_id = template.find('[name="respond_to_user_id"]').value,
        root_sign_id = response_to_sign_id,
        parent;

        parent = SignsCollection.find({_id: root_sign_id}, {limit:1}).fetch()[0];
        if(parent && parent.discussion_root_sign_id)
            root_sign_id = parent.discussion_root_sign_id;


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
if (window.typedInTexts === undefined) {
    typedInTexts = new ReactiveVar({});
}


Handlebars.registerHelper('unsavedMessageText', function(sign_id){
    var texts = typedInTexts.get();
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
        if(event.which === 13 && !event.shiftKey){
            newMessageSave(template).then(function(response_id){
                var texts = typedInTexts.get();
                delete texts[response_id];
                typedInTexts.set(_.extend(texts));
            }).catch(function(){
                //var texts = typedInTexts.get();
                //delete texts[response_id];
                //typedInTexts.set(_.extend(texts));
            });
		}
	},
    'blur [name="message"]': function blurNewMessageFormHandler(event, template){
        var texts = typedInTexts.get(),
            response_id = template.find('[name="respond_to_sign_id"]').value;
        if(template.find('textarea').value.trim()) {
            texts[response_id] = template.find('textarea').value;
            typedInTexts.set(_.extend(texts));
        }
    }
});
