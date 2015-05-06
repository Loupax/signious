if (Meteor.isServer) {
    var Busboy = Meteor.npmRequire("busboy");

    var addField = function addField(body, fieldname, value){
        var path = fieldname.replace(/]/g, '').split('[').join('.');

        var parts = path.split("."), part;
        while(part = parts.shift()) {
            if( typeof body[part] != "object") {
                if(parts.length > 0) {
                    body[part] = {};
                }
                else{
                    body[part] = value;
                }
            }
            body = body[part];
        }
    };

    Router.onBeforeAction(function (req, res, next) {
        var files = {}; // Store files in an array and then pass them to request.

        var image = {}; // crate an image object
        req.body = req.body || {};

        if (req.method === "POST") {
            var busboy = new Busboy({ headers: req.headers });
            busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
                image.mimeType = mimetype;
                image.encoding = encoding;
                image.filename = filename;

                // buffer the read chunks
                var buffers = [];

                file.on('data', function(data) {
                    buffers.push(data);
                });
                file.on('end', function() {
                    // concat the chunks
                    image.data = Buffer.concat(buffers);
                    // push the image object to the file array
                    if(image.data.length) {
                        addField(files, fieldname, image);
                    }
                });
            });

            busboy.on("field", function(fieldname, value) {
                addField(req.body, fieldname, value);
            });

            busboy.on("finish", function () {
                // Pass the file array together with the request
                if(Object.keys(files).length > 0) {
                    req.files = files;
                }
                next();
            });
            // Pass request to busboy
            req.pipe(busboy);
        }
        else{
            this.next();
        }


    });
}

Router.configure({
  // the default layout
  layoutTemplate: 'root'
  //loadingTemplate: 'Loading'
});

Router.route('/', {
    controller: 'HomeController',
    action: 'index'
});

Router.route('/profile', {
    controller: 'ProfileController',
    action: 'index'
});

Router.route('/profile/edit', {
    controller: 'ProfileController',
    action: 'edit'
});

Router.route('/deploy', {
    action:function(req, res){
        var exec = Npm.require('child_process').exec;
        function puts(error, stdout, stderr) { res.end(stdout); }
        exec("git pull", puts);
    },
    where: 'server'
});


Router.route('/scrape_html/:sign_id', {
    action:function(req, res){
        Meteor.call('Sign:addURLData', this.params.sign_id);
        res.end();
    },
    where: 'server'
});


var UploadedFilesCollection = new Meteor.Collection('uploaded_files');
Router.route('static', {
    where: 'server',
    path: /^\/static\/(.*)$/,
    action: function() {
        var fs = Npm.require('fs');
        var filePath = process.env.PWD + '/server/user-content/' + this.params[0];
        var data = fs.readFileSync(filePath);
        var file = UploadedFilesCollection.find({_id: this.params[0]}, {limit: 1}).fetch();
        this.response.writeHead(200, {
            'Content-Type': file.mimeType
        });
        this.response.write(data);
        this.response.end();
    }
});

Router.route('/profile/update',{
    action: function(){
        var fs = Npm.require('fs'),
            path = Npm.require('path');

        var self = this;

        var _profile = this.request.body.profile;

        var userId = self.request.body.profile.user_id;
        var existing = Meteor.users.find(userId).fetch()[0];
        if(!existing.profile)
            existing.profile = {};
        if((_profile.realname + '').trim())
            existing.profile.realname = _profile.realname.trim();

        if((_profile.bio + '').trim())
            existing.profile.bio = _profile.bio.trim();

        if((_profile.username + '').trim())
            existing.username = _profile.username.trim();

        Meteor.users.update({_id: userId}, {$set:existing});

        if(this.request.files) {
            var avatar = this.request.files.profile.avatar;
            var _id = UploadedFilesCollection.insert({
                'originalFilename': avatar.filename,
                mimeType: avatar.mimeType,
                encoding: avatar.encoding
            });
            fs.writeFile(process.env.PWD + "/server/user-content/" + _id, avatar.data, Meteor.bindEnvironment(function (err) {
                if (err) {
                    return console.log(err);
                }
                existing.profile.avatar = _id;

                console.log(existing);
                Meteor.users.update({_id: userId}, {$set: existing});
                self.response.writeHead(302, {
                    'Location': '/profile/edit'
                });
                self.response.end();
            }));
        }else{
            self.response.writeHead(302, {
                'Location': '/profile/edit'
            });
            self.response.end();
        }

        //http://localhost:3000/profile/edit

    },
    where: 'server'
});