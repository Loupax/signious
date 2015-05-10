var currentSign = new ReactiveVar(undefined)
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
        var self = this;
        Meteor.call('Sign:fetch', Router.current().params.sign_id, function(err, sign){
            if(err) {
                self.render('signNotFound');
            }else {
                currentSign.set(sign);
                self.render('SignPage');
            }
        });
    }
});