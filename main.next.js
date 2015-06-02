if( Meteor.isClient )
    ClientDebugger.debugMode = Meteor.settings.public.debug;


Meteor.startup(function() {
    if(Meteor.isClient){
        return SEO.config({
            title: 'Signious - leaving your sign to the world',
            meta: {
                'description': 'Signious allows you to leave messages in the real world for other people to see'
            }
        });
    }
});
