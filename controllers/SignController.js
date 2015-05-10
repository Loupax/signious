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
        },
        metaTags: function(){
            var sign = currentSign.get(),
                meta = (sign && sign.linkedWebpage && sign.linkedWebpage.meta)?sign.linkedWebpage.meta:[],
                domstring = '', iterator;

            meta.push({name: "geo.position", content:currentSign.get().location.coordinates.join(';')});
            for(var i = 0, len = meta.length; i < len; i++){
                iterator = '';
                for(var prop in meta[i]){
                    iterator += prop+'="'+meta[i][prop]+'" ';
                }
                domstring += '<meta class="current-sign-meta" '+iterator+'>';
            }
            $(document.head).append(domstring);
        }
    },
    unload: function(){
        $('meta.current-sign-meta').remove();
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