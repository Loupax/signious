var currentSign = new ReactiveVar(undefined);
if(Meteor.isClient){
    var showGoogleMaps = function showGoogleMaps(sign) {

        var latLng = new google.maps.LatLng(sign.location.coordinates[1],sign.location.coordinates[0]);

        var mapOptions = {
            zoom: 16, // initialize zoom level - the max value is 21
            streetViewControl: false, // hide the yellow Street View pegman
            scaleControl: false, // allow users to zoom the Google Map
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: latLng,
            disableDefaultUI: true,
            scrollwheel: false,
            navigationControl: false,
            mapTypeControl: false,
            scaleControl: false,
            draggable: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        new google.maps.Map($('.google-maps-background').get(0), mapOptions);
    }
}else{
    var showGoogleMaps = function showGoogleMaps(){};
}
var serverSideSubscription;
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
        metaData['url']          = encodeURI(Router.current().url).replace('http://localhost:3000', Meteor.settings.public.baseUrl);
        metaData['description']  = 'You can see any responses to this post if they are nearby';
        // Not sure if geolocation should be given away...
        //metaData['geo.position'] = sign.location.coordinates.join(';');
        //metaData['ICBM']         = metaData['geo.position'];
        metaData['title']        = sign.text;
        var title = metaData['title'].length?'Signious - '+metaData['title']:'Signious';

        SEO.set({
            title: title,
            meta: metaData
        });

        Meteor.setTimeout(function(){showGoogleMaps(sign);}, 1000);
    },
    index: function () {
        var id = Router.current().params.sign_id;
        var sign = SignsCollection.find({_id: id}).fetch().pop();

        if(!sign) {
            this.render('signNotFound');
        }else {
            currentSign.set(sign);
            this.render('SignPage');
            GAnalytics.pageview();
        }
    }
});