Meteor.methods({
    'getUserProfile': function(username){
        var user = Meteor.users.find({username: username}, {limit: 1, 'fields': {'_id': 1,'username':1, 'profile':1}}).fetch().pop();
        if(!user)
            throw new Meteor.Error('404', 'Not found', 'Not found');

        return user;
    }
});

Meteor.methods({'myGeoIPLocation': function(){
    var clientAddress = this.connection.httpHeaders['x-real-ip'] || this.connection.clientAddress;
    if(!this.connection.httpHeaders['x-real-ip']){
        logger.warn('No x-real-ip header found for IP based geolocation. Using clientAddress instead', this.connection.httpHeaders);
    }
    return JSON.parse(HTTP.call('GET', 'https://freegeoip.net/json/'+clientAddress).content);
}});

Meteor.methods({
    'File:upload': function (file, content) {
        var _id = UploadedFilesCollection.insert({
            'originalFilename': file.name,
            'mimeType': file.type
        });
        var segments = file.name.split('.')
        var filename = _id+'.'+segments[segments.length - 1];
        var thumbnail = _id+'.thumbnail-small.'+segments[segments.length - 1];
        var fs = Npm.require('fs');
        content = content.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(content, 'base64');
        var path = process.env.PWD + "/server/user-content/" + filename;
        var thumbnailPath = process.env.PWD + "/server/user-content/" + thumbnail;

        fs.writeFile(path, buf,Meteor.bindEnvironment(function (err) {
            if (err) {
                return console.error(err);
            }

            Imagemagick.resize({
                srcPath: path,
                dstPath: thumbnailPath,
                width:   256
            });

            Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.avatar': thumbnail}});
            SignsCollection.update({poster_id: Meteor.userId()}, {$set: {'avatar': thumbnail}}, {multi: true});
        }));
    }
});


Meteor.methods({
    'Profile:update': function (data) {
        var duplicateUsername = Meteor.users.find({'username': data.username, _id: {$ne: Meteor.userId()}}, {fields: {_id: 1}, limit: 1}).fetch();
        if(duplicateUsername.length){
            throw new Meteor.Error(409, 'Duplicate', 'Username is taken');
        }

        var disallowedCharacters = [' ', '/', '\\'];
        disallowedCharacters.forEach(function(char){
            if(data.username.indexOf(char) > -1){
                throw new Meteor.Error(400, 'Bad input', 'This username contains disallowed characters');
            }
        });
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