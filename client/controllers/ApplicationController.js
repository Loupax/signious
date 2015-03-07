ApplicationController = RouteController.extend({
    layoutTemplate: 'root',

    onBeforeAction: function () {
        console.log('app before hook!');
        this.next();
    },

    action: function () {
        console.log('this should be overridden!');
    }
});