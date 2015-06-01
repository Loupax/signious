/**
 * Created by loupax on 3/8/15.
 */
Template.Message.events({
    'click .js-fave-message': function(event, template){
        Meteor.call('Sign:fave', this._id);
    },
    'click .js-unfave-message': function(event, template){
        Meteor.call('Sign:unfave', this._id);
    },
    'click .js-delete-message': function signDeletionClickHandler(event, template){
        Session.set('MessageBeingDeleted', this);
        Modal.show('DeleteMessageModal');
    },
    'click .js-show-response-form': function clickToggleResponseFormHandler(event, template) {
        // MessageThread can be used as a reccursive template. Stopping propagation to avoid
        // the handler from firing more than once per parent template instance
        if (this._id != template.data._id) {
            return;
        }
        $(template.firstNode).find('.new-reply-form').toggleClass('hidden');
    }
});


Template.Message.helpers({
    'messageBadge': function messageBadge(msg){
        var userId = Meteor.userId();
        if (Meteor.userId() && (Meteor.userId() === msg.poster_id) || (Meteor.user().profile.favorites.indexOf(msg._id) > -1) ){
            return new Handlebars.SafeString('<i title="You can see this message because you own it" class="fa fa-user"></i>');
        }

        if (Meteor.userId() && (msg.mentions.map(function(mention){return mention._id;}).indexOf(Meteor.userId()) > -1) ){
            return new Handlebars.SafeString('<i title="You can see this message because you are mentioned in it" class="fa fa-user-plus"></i>');
        }

        var nearby = SignsCollection.find({
            '_id': msg._id,
            'location': {
            $near: {
                $geometry: Signious.geolocation.lastKnownLocation.toMongo(),
                $maxDistance: 1000
            }
        }}).count();
        if(nearby) {
            return new Handlebars.SafeString('<i title="You can see this message because you are within it\'s range" class="fa fa-crosshairs"></i>');
        }

        return new Handlebars.SafeString('<i title="You can see this message because you have access to it\'s URI" class="fa fa-bolt"></i>');
    },
    'isFaved': function messageIsFaved(msg){
        return Meteor.users.find({_id: Meteor.userId(), 'profile.favorites': msg._id}, {limit:1}).count();
    },
    'isPrivateMessage': function isPrivateMessage(message){
        return message.is_private?'private-message':'';
    },
    'messageClass': function isPrivateMessage(message){
        return 'message-id-'+message._id;
    },
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
    'attachedContent': function attachedContent(sign) {
        if (!sign.linkedWebpage || !sign.linkedWebpage.meta) {
            return '';
        }
	// Make a copy of this object, because we are going to
	// manipulate the shit out of it
	sign = _.extend(sign);
        var meta = sign.linkedWebpage.meta;
        var siteName = meta.filter(function (a) {
            return (a.property) && a.property === 'site_name';
        }).pop();
        // Images are stored inside out own folder
        var image = meta.filter(function (a) {
            return (a.property) && a.property === 'image';
        }).pop();
        if(image && image.content.indexOf('/') !== 0 && image.content.indexOf(Meteor.settings.public.baseUrl) !== 0){
            image.content = Meteor.settings.public.baseUrl+'/static/resource/'+image.content;
        }
        var pageTitle = meta.filter(function (a) {
            return (a.property) && a.property === 'title';
        }).pop();
        var contentUrl = meta.filter(function (a) {
            return (a.property) && a.property === 'url';
        }).pop();

        // Is it a youtube video we can embed?
        if (siteName && siteName.content === 'YouTube') {
            var videoUrl = meta.filter(function (a) {
                return (a.property) && a.property.indexOf('video:url') > -1
            }).pop();
            if (videoUrl && videoUrl.content)
                return new Handlebars.SafeString('<iframe width="420" height="315" src="' + videoUrl.content + '" frameborder="0" allowfullscreen></iframe>');
        }

        // Are there any images we can get from the sign
        var urls = $('<div>'+Autolinker.link(sign.text, {newWindow: true, twitter: false})+'</div>').find('a').map(function(){return this.href;});
        if (urls.length) {
            var header = sign.linkedWebpage.title?'<h1 class="messages-message-linked-webpage-title">'+sign.linkedWebpage.title+'</h1>':'';

            if (image) {
                return new Handlebars.SafeString('<a class="messages-message-linked-webpage-title-link" target="_blank" href="' + urls[0] + '">'+header+'<img class="responsive-image" src="' + (image.content) + '" title="' + (pageTitle?pageTitle.content:'') + '"/></a>');
            }else {
                return new Handlebars.SafeString('<a class="messages-message-linked-webpage-title-link" target="_blank" href="' + urls[0] + '">'+header+'</a>');
            }
        }

        return '';
    }

});