/**
 * Extending the user creation functionality
 */
if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.username = Meteor.call('generateUsername');
        var existing = Meteor.users.find({username: user.username}, {limit:1, fields:{_id:1}}).fetch().length;
        if(existing){
            // Get the total number of usernames that start with the existing username, add
            // their total count at the end to make it unique
            var regex = new RegExp(user.username+".*");
            var count = Meteor.users.find({username: regex}, {limit:1, fields:{_id:1}}).fetch().length;
            user.username = [user.username, count + 1].join('_');
        }
        user.profile = user.profile || {avatar: ''};
        return user;
    });

    Meteor.methods({
        'generateUsername': function(){
            console.log(this.connection);
            var exec = Npm.require('child_process').exec,
                os = Npm.require('os'),
                // Dev is osx, prod is Ubuntu. Deal with it
                shuffler = os.platform() === 'darwin'?'gshuf':'shuf';

            var pickAdjective = Meteor.wrapAsync(function(callback){
                exec("cat /usr/share/dict/words | grep 'love$\\|a$\\|ing$\\|ly$\\|ary$\\|ful$\\|ic$\\|ical$\\|ish$\\|less$\\|like$\\|ly$\\|ous$\\|y$' | "+shuffler+" -n 1", callback);
            });
            var pickNoun = Meteor.wrapAsync(function(callback){
                exec("cat /usr/share/dict/words | grep -v 'ing$\\|ly$\\|ary$\\|ful$\\|ic$\\|ical$\\|ish$\\|less$\\|like$\\|ly$\\|ous$\\|y$' | "+shuffler+" -n 1", callback);
            });
            return [pickAdjective().trim(),pickNoun().trim()].map(function(a){return a.toLowerCase();}).join('_');
        }
    })
}