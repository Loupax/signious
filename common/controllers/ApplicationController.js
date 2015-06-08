ApplicationController = RouteController.extend({
    layoutTemplate: 'root',
    data: {},
    fastRender: true,
    onBeforeAction: function () {
        this.next();
    },
    unload: function () {
        // We do not actually stop the Autorun handler, because
        // we work under the premise that a: All our controllers extend ApplicationController
        // and b: These are all the signs we are going to need. We won't have permissions to see anything more
        // or anything less, and any other properties (like paging or whatever) should be handled in the Deps.autorun
        //handler.stop();
    },
    waitOn: function(){
        if(Meteor.isClient) {
            var loc = new Location(Session.get('lastKnownLocation'));
            return [Meteor.subscribe('OwnMessages'), Meteor.subscribe('NearbyMessages', loc)];
        }
    },
    action: function () {
        console.log('this should be overridden!');
    }
});