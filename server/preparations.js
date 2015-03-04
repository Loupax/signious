/**
 * Created by loupax on 3/4/15.
 */
Meteor.startup(function(){
    var nameless_accounts = Meteor.users.find({username: {$exists: false}}, {fields: {_id:1,emails:1}}).fetch();
    nameless_accounts.forEach(function(account){
        var generatedUsername = account.emails[0].address.replace(/@|\./g, '_');
        Meteor.users.update({_id: account._id}, {$set:{username: generatedUsername}})
    });
});