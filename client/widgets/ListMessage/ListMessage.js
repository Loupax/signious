/**
 * Created by loupax on 3/8/15.
 */
Template.ListMessage.events({
    'click .js-show-response-form': function clickToggleResponseFormHandler(event, template) {
        // ListMessage can be used as a reccursive template. Stopping propagation to avoid
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
        Session.set('NewMessageFormOpenResponseForms', responses.slice());
    }
});


Template.ListMessage.helpers({
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
            if (videoUrl && videoUrl.content);
            return new Handlebars.SafeString('<iframe width="420" height="315" src="' + videoUrl.content + '" frameborder="0" allowfullscreen></iframe>');
        }
        // Are there any images we can get from the sign
        if (ogTitle && ogImage) {
            if (ogUrl) {
                return new Handlebars.SafeString('<a target="_blank" href="' + ogUrl.content + '"><img class="responsive-image" src="' + (ogImage.content) + '" title="' + (ogTitle.content) + '"/></a>');
            } else {
                return new Handlebars.SafeString('<img class="responsive-image" src="' + (ogImage.content) + '" title="' + (ogTitle.content) + '"/>');
            }
        }

        return '';
    }

});
