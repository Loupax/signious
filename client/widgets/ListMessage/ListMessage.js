/**
 * Created by loupax on 3/8/15.
 */
Template.ListMessage.events({
    'click .js-show-response-form': function clickToggleResponseFormHandler(event, template){
        // ListMessage can be used as a reccursive template. Stopping propagation to avoid
        // the handler from firing more than once per parent template instance
        if (this._id!=template.data._id){
            return;
        }

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

Handlebars.registerHelper('attachedContent', function(sign){
    if(!sign.linkedWebpage || !sign.linkedWebpage.meta){return '';}
    var openGraph = sign.linkedWebpage.meta.filter(function(a){return (a.property) && a.property.indexOf('og:') > -1});
    var ogImage= openGraph.filter(function(a){return (a.property) && a.property.indexOf('og:image') > -1}).pop();
    var ogTitle= openGraph.filter(function(a){return (a.property) && a.property.indexOf('og:title') > -1}).pop();
    var ogUrl  = openGraph.filter(function(a){return (a.property) && a.property.indexOf('og:url') > -1}).pop();

    // First, try to see if we scraped any OpenGraph data
    if(ogTitle && ogImage){
        if(ogUrl){
            return new Handlebars.SafeString('<a target="_blank" href="'+ogUrl.content+'"><img class="responsive-image" src="'+(ogImage.content)+'" title="'+(ogTitle.content)+'"/></a>');
        }else{
            return new Handlebars.SafeString('<img class="responsive-image" src="'+(ogImage.content)+'" title="'+(ogTitle.content)+'"/>');
        }
    }

    return '';
});