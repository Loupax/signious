var currentSign = new ReactiveVar(undefined);
if(Meteor.isClient){

}
var serverSideSubscription;
/*if(Meteor.isServer){
    FastRender.route('/:username/sign/:sign_id', function(params) {
        serverSideSubscription = this.subscribe('SpecificPublicSign', params.sign_id);
        console.log(serverSideSubscription);
    });
}*/
SignController = ApplicationController.extend({
    data: {
        sign: function(){
            return currentSign.get();
        }
    },
    onAfterAction: function(){

        if (Meteor.isServer) {
            return;
        }
        var sign = currentSign.get();

        if(!sign){
            return false;
        }

        var metaData = {};
        metaData['content'] = [];
        if(sign.avatar){
            metaData['image'] = [sign.avatar];
        }
        metaData['description'] = [];
        metaData['content'] = [sign.text];
        if(sign.linkedWebpage){
            sign.linkedWebpage.meta.map(function (a) {
                if((a.property) && a.property.indexOf('og:') > -1){
                    var prop = a.property.split(':')[1];
                    metaData[prop] = metaData[prop]||[];
                    metaData[prop].push(a.content);
                }
                return '';
            });

            sign.linkedWebpage.meta.map(function (a) {
                if((a.property) && a.property.indexOf('og:') === -1){
                    metaData[a.property] = metaData[a.property]||[];
                    metaData[a.property] = a.content;
                }
                return '';
            });
        }

        metaData['site_name']    = 'Signious';
        metaData['url']          = Router.current().url.replace('http://localhost:3000', 'http://signious.com');
        metaData['description']  = 'You can see any responses to this post if they are nearby';
        metaData['geo.position'] = sign.location.coordinates.join(';');
        metaData['ICBM']         = metaData['geo.position'];
        metaData['title']        = sign.text;
        var title = metaData['title'].length?'Signious - '+metaData['title']:'Signious';

        SEO.set({
            title: title,
            meta: metaData
        });
    },
    index: function () {
        var sign = SignsCollection.find({}).fetch().pop();

        if(!sign) {
            this.render('signNotFound');
        }else {
            currentSign.set(sign);
            this.render('SignPage');
            GAnalytics.pageview();
        }
    }
});