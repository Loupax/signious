Handlebars.registerHelper('isLoggedIn', function (){
    return !!Meteor.user();
});