ApplicationController = RouteController.extend({
    layoutTemplate: 'root',

    data:{},
    fastRender: true,

    onBeforeAction: function () {
        this.next();
    },

    action: function () {
        console.log('this should be overridden!');
    }
});