Router.configure({
  // the default layout
    layoutTemplate: 'root',
    notFoundTemplate: "routeNotFound"
});


Router.route('/', {
    controller: 'HomeController',
    action: 'index'
});

Router.route('/:username', {
    controller: 'ProfileController',
    waitOn: function(){
        return Meteor.subscribe('SpecificProfilePublication', this.params.username);
    },
    action: 'index'
});

Router.route('/profile/show', {
    controller: 'ProfileController',
    waitOn: function(){
        console.log('Show');
        return Meteor.subscribe('SpecificProfilePublication', Meteor.userId());
    },
    action: 'index'
});

Router.route('/:username/sign/:sign_id', {
    controller: 'SignController',
    onBeforeAction: function(){
        GoogleMaps.load();
        this.next();
    },
    waitOn: function(){
        return Meteor.subscribe('SpecificPublicSign', this.params.sign_id);
    },
    action: 'index'
});

Router.route('/profile/edit', {
    controller: 'ProfileController',
    action: 'edit'
});

Router.route('/deploy/git', {
    action:function(req, res){
        var exec = Npm.require('child_process').exec;
        function puts(error, stdout, stderr) { res.end(stdout); }
        exec("git pull", puts);
    },
    where: 'server'
});


Router.route('/scrape/html/:sign_id', {
    action:function(req, res){
        Meteor.call('Sign:addURLData', this.params.sign_id);
        res.end();
    },
    where: 'server'
});


UploadedFilesCollection = new Meteor.Collection('uploaded_files');
Router.route('/static/resource/:filename', {
    where: 'server',
    action: function() {
        var fs = Npm.require('fs');
        var _id = this.params.filename.split('.').slice(0, 1).join('.');
        var filePath = process.env.PWD + '/server/user-content/' + this.params.filename;
        var stats = fs.statSync(filePath);
        var mtime = stats.mtime;
        var size = stats.size;
        var now = new Date();
        var ETag = _id + mtime.getTime();

        if(this.request.headers['if-none-match'] === ETag){
            this.response.writeHead(304);
            return this.response.end();
        }

        try {
            var ContentType = Imagemagick.identify(filePath)['mime type'];
        }catch(e){
            var ContentType = null;
        }

        if(ContentType){
            this.response.writeHead(200, {
                'Content-Type': ContentType,
                'Date': now.toString(),
                'Content-Length': size,
                'ETag': ETag
            });
            var readStream = fs.createReadStream(filePath);
            return readStream.pipe(this.response);
        } else {
            // Unsupported media type
            this.response.writeHead(415);
            return this.response.end();
        }


    }
});

Router.route('/mail_notifier/mention', {
   where: 'server',
    action: function(){
        this.response.end();

        var user = this.request.body.user;
        var sign = this.request.body.sign;
        var signUrl = 'http://signious.com/'+sign.username+'/sign/'+sign._id;
        Meteor.call('sendEmail', {
            to:user.emails[0].address,
            from:'notifications@signious.com',
            subject:'You\'ve been mentioned on Signious!',
            text:[
                sign.username + ' mentioned you on a Sign',
                'You can see the discussion by following this link',
                signUrl
            ].join('\r\n'),
            html:[
                '<style type="text/css">*{text-align: center; margin: auto;}</style>',
                '<h1>'+sign.username + ' mentioned you on a Sign'+'</h1>',
                '<p>You can see the discussion by following this link</p>',
                '<a href="'+signUrl+'">'+signUrl+'</a>'
            ].join('')
        });
    }
});