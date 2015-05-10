Meteor.methods({
    'getUserProfile': function(username){
        var user = Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}}).fetch().pop();
        if(!user)
            throw new Meteor.Error('404', 'Not found', 'Not found');

        return user;
    }
});


Meteor.methods({
    'File:upload': function (file, content) {
        var _id = UploadedFilesCollection.insert({
            'originalFilename': file.name,
            'mimeType': file.type
        });
        var fs = Npm.require('fs');
        content = content.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(content, 'base64');
        fs.writeFile(process.env.PWD + "/server/user-content/" + _id, buf,Meteor.bindEnvironment(function (err) {
            if (err) {
                return console.error(err);
            }

            Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.avatar': _id}});
            SignsCollection.update({poster_id: Meteor.userId()}, {$set: {'avatar': _id}}, {multi: true});
        }));
    }
});


Meteor.methods({
    'Profile:update': function (data) {
        var duplicateUsername = Meteor.users.find({'username': data.username, _id: {$ne: Meteor.userId()}}, {fields: {_id: 1}, limit: 1}).fetch();
        if(duplicateUsername.length){
            throw new Meteor.Error(409, 'Duplicate', 'Username is taken');
        }

        SignsCollection.update({poster_id: Meteor.userId()}, {$set:{
            username: data.username
        }}, {multi: true});
        Meteor.users.update({_id: Meteor.userId()}, {$set: {
            'profile.bio': data.bio,
            'profile.realname': data.realname,
            'username': data.username
        }});
    }
});