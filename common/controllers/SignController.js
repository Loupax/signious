var currentSignId = new ReactiveVar(undefined);
var currentSign = new ReactiveVar(undefined);
SignController = ApplicationController.extend({
    data: {
        sign: function () {
            var current = SignsCollection.find({_id: currentSignId.get()}).fetch().pop()
            return current;
        }
    },
    onAfterAction: function () {

        if (Meteor.isServer) {
            return;
        }
        var sign = currentSign.get();

        if (!sign) {
            return false;
        }

        var metaData = {
            image: []
        };
        metaData['content'] = [];
        if (sign.avatar) {
            metaData['image'] = [sign.avatar];
        }
        metaData['description'] = [];
        metaData['content'] = [sign.text];
        if (sign.linkedWebpage) {
            sign.linkedWebpage.meta.map(function (a) {
                metaData[a.property] = metaData[a.property] || [];
                metaData[a.property].push(a.content);
                return '';
            });
        }
        var baseUrl = Meteor.settings.public.baseUrl;
        metaData['image'] = metaData['image'].map(function (a) {
            if (a.indexOf(baseUrl) !== 0) {
                return baseUrl + '/static/resource/' + a;
            }
            return a;
        });

        metaData['site_name'] = 'Signious';
        metaData['url'] = encodeURI(Router.current().url).replace('http://localhost:3000', Meteor.settings.public.baseUrl);
        metaData['description'] = 'You can see any responses to this post if they are nearby';
        // Not sure if geolocation should be given away...
        //metaData['geo.position'] = sign.location.coordinates.join(';');
        //metaData['ICBM']         = metaData['geo.position'];
        metaData['title'] = sign.text;
        console.log(metaData, sign);
        var title = metaData['title'].length ? 'Signious - ' + metaData['title'] : 'Signious';

        SEO.set({
            title: title,
            meta: metaData,
            og: metaData,
            twitter: metaData
        });
    },
    index: function () {
        currentSignId.set(Router.current().params.sign_id);
        currentSign.set(SignsCollection.find({_id: Router.current().params.sign_id}).fetch().pop());
        this.render('SignPage');
        GAnalytics.pageview();
    }
});

Handlebars.registerHelper('mapOptions', function () {
    if (GoogleMaps.loaded()) {
        var sign = currentSign.get();
        var latLng = new google.maps.LatLng(sign.location.coordinates[1], sign.location.coordinates[0]);
        return mapOptions = {
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
            draggable: false
        };
    }

});
