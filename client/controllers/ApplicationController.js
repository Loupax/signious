Session.setDefault('loadingNearbySigns', false);
var handler = Deps.autorun(function(){
    var loc = new Location(Session.get('lastKnownLocation'));
    Meteor.subscribe('NearbySigns', loc);
    Session.set('loadingNearbySigns', true);
});

ApplicationController = RouteController.extend({
    layoutTemplate: 'root',
    data:{},
    onBeforeAction: function () {
        this.next();
    },
    action: function () {
        console.log('this should be overridden!');
    }
});