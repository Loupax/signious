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

        if(!sign || !sign.linkedWebpage){
            return false;
        }

        var metaData = {};
        sign.linkedWebpage.meta.map(function (a) {
            if((a.property) && a.property.indexOf('og:') > -1){
                metaData[a.property.split(':')[1]] = a.content;
            }
            return '';
        });

        sign.linkedWebpage.meta.map(function (a) {
            if((a.property) && a.property.indexOf('og:') === -1){
                metaData[a.property] = a.content;
            }
            return '';
        });

        metaData['site_name'] = 'Signious';
        metaData['url'] = Router.current().originalUrl;
        metaData['description'] = 'You can any responses to this post that are nearby';
        metaData['geo.position'] = sign.location.coordinates.join(';');
        metaData['ICBM'] = metaData['geo.position'];

        var title = metaData['title']?'Signious - '+metaData['title']:'Signious';

        SEO.set({
            title: title,
            meta: metaData//metaData,
            //og: openGraphMeta
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