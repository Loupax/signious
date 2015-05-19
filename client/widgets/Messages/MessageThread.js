/**
 * Created by loupax on 3/8/15.
 */
Template.Message.events({
    'click .js-delete-message': function signDeletionClickHandler(event, template){
        if(confirm('Are you sure you want to delete this message?'))Meteor.call('Sign:delete', this._id);
    },
    'click .js-undelete-message': function signUndeletionClickHandler(event, template){
        Meteor.call('Sign:undelete', this._id);
    },
    'click .js-show-response-form': function clickToggleResponseFormHandler(event, template) {
        // MessageThread can be used as a reccursive template. Stopping propagation to avoid
        // the handler from firing more than once per parent template instance
        if (this._id != template.data._id) {
            return;
        }

        var responses = Session.get('NewMessageFormOpenResponseForms'),
            index = responses.indexOf(this._id);

        if (index > -1) {
            responses.splice(index, 1);
        } else {
            responses.push(this._id);
        }

        Tracker.afterFlush(function(){
             var input = template.find('.new-message-form-input');
            if(input && !input.value.trim()){
                input.value = '@'+template.data.username + ' ';
                input.focus();
            }
        });
        Session.set('NewMessageFormOpenResponseForms', responses.slice());
    }
});


Template.Message.helpers({
    'belongsToCurrentUser': function(sign){
        return Meteor.userId() && sign.poster_id && (Meteor.userId() === sign.poster_id);
    },
    'isDeletedClass': function(sign){
        return sign.is_deleted?'deleted':'';
    },
    'ownsAttachedContent': function(message){
        return message.linkedWebpage && (message.linkedWebpage.title || (message.linkedWebpage.meta && message.linkedWebpage.meta.length));
    },
    'FormatMessage': function FormatMessage(message) {
        var text = message.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        text = text.replace(/\n/g, "<br>");
        text = Autolinker.link(text, {newWindow: true, twitter: false});

        (message.mentions || []).forEach(function (mention, index) {
            var n = '@' + mention.username;
            text = text.replace(n, '<a href="/'+mention.username+'">' + n + '</a>');
        });
        return new Handlebars.SafeString(text);
    },
    'isRespondingTo': function isRespondingTo(sign) {
        var responses = Session.get('NewMessageFormOpenResponseForms');
        return responses.indexOf(sign._id) > -1;
    },
    'attachedContent': function attachedContent(sign) {
        if (!sign.linkedWebpage || !sign.linkedWebpage.meta) {
            return '';
        }

        var openGraph = sign.linkedWebpage.meta.filter(function (a) {
            return (a.property) && a.property.indexOf('og:') > -1
        });
        var ogName = openGraph.filter(function (a) {
            return (a.property) && a.property === 'og:site_name';
        }).pop();
        var ogImage = openGraph.filter(function (a) {
            return (a.property) && a.property === 'og:image';
        }).pop();

        var ogTitle = openGraph.filter(function (a) {
            return (a.property) && a.property === 'og:title';
        }).pop();
        var ogUrl = openGraph.filter(function (a) {
            return (a.property) && a.property === 'og:url';
        }).pop();

        // Is it a youtube video we can embed?
        if (ogName && ogName.content === 'YouTube') {
            var videoUrl = openGraph.filter(function (a) {
                return (a.property) && a.property.indexOf('og:video:url') > -1
            }).pop();
            if (videoUrl && videoUrl.content)
                return new Handlebars.SafeString('<iframe width="420" height="315" src="' + videoUrl.content + '" frameborder="0" allowfullscreen></iframe>');
        }

        // Are there any images we can get from the sign
        var urls = $('<div>'+Autolinker.link(sign.text, {newWindow: true, twitter: false})+'</div>').find('a').map(function(){return this.href;});
        if (urls.length) {
            var header = sign.linkedWebpage.title?'<h1 class="messages-message-linked-webpage-title">'+sign.linkedWebpage.title+'</h1>':'';

            if (ogImage) {
                return new Handlebars.SafeString('<a class="messages-message-linked-webpage-title-link" target="_blank" href="' + urls[0] + '">'+header+'<img class="responsive-image" src="' + (ogImage.content) + '" title="' + (ogTitle?ogTitle.content:'') + '"/></a>');
            }else {
                return new Handlebars.SafeString('<a class="messages-message-linked-webpage-title-link" target="_blank" href="' + urls[0] + '">'+header+'</a>');
            }
        }

        return '';
    }

});
