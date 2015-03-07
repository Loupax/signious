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