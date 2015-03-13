/**
 * Created by loupax on 3/8/15.
 */
Template.ListMessage.events({
    'click .js-show-response-form': function clickToggleResponseFormHandler(event, template){
        // ListMessage can be used as a reccursive template. Stopping propagation to avoid
        // the handler from firing more than once per parent template instance
        event.stopPropagation();
        var responses = Session.get('NewMessageFormOpenResponseForms'),
            index = responses.indexOf(this._id);

        if(index > -1){
            responses.splice(index, 1);
        }else{
            responses.push(this._id);
        }
        Session.set('NewMessageFormOpenResponseForms', responses.slice());
    }
});

Handlebars.registerHelper('isRespondingTo', function(sign){
    var responses = Session.get('NewMessageFormOpenResponseForms');
    return responses.indexOf(sign._id) > -1;
});
