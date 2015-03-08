/**
 * Created by loupax on 3/4/15.
 */
Meteor.startup(function(){
    var nameless_accounts = Meteor.users.find({username: {$exists: false}}, {fields: {_id:1,emails:1}}).fetch();
    nameless_accounts.forEach(function(account){
        var generatedUsername = account.emails[0].address.replace(/@|\./g, '_');
        Meteor.users.update({_id: account._id}, {$set:{username: generatedUsername}})
    });

    var nameless_signs = SignsCollection.find({username: {$exists: false}}).fetch();
    console.log(nameless_signs);
    nameless_signs.forEach(function(sign){
        var user = Meteor.users.find(sign.poster_id).fetch()[0];
        if(user) {
            SignsCollection.update({_id: sign._id}, {$set: {username: user.username}});
        }else{
            SignsCollection.update({_id: sign._id}, {$set: {username: 'Anonymous'}});
        }
    });
});