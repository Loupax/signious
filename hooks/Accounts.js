/**
 * Extending the user creation functionality
 */
Accounts.onCreateUser(function(options, user){
    user.username = user.emails[0].address.replace(/@|\./g, '_');
    return user;
});