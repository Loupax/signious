/**
 * Extending the user creation functionality
 */
if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.username = user.emails[0].address.replace(/@|\./g, '_');
        return user;
    });
}