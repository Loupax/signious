Router.configure({
    // the default layout
    loadingTemplate: 'Loading',
    layoutTemplate: 'root',
    notFoundTemplate: "routeNotFound"
});


Router.route('/', {
    controller: 'HomeController',
    action: 'index'
});

Router.route('/:username', {
    controller: 'ProfileController',
    waitOn: function () {
        return Meteor.subscribe('SpecificProfilePublication', this.params.username);
    },
    action: 'index'
});

Router.route('/profile/show', {
    controller: 'ProfileController',
    waitOn: function () {
        return Meteor.subscribe('SpecificProfilePublication', Meteor.user()?Meteor.user().username:null);
    },
    action: 'index'
});

Router.route('/:username/sign/:sign_id', {
    controller: 'SignController',
    onBeforeAction: function () {
        GoogleMaps.load();
        this.next();
    },
    waitOn: function () {
        return Meteor.subscribe('SpecificPublicSign', this.params.sign_id);
    },
    action: 'index'
});


Router.route('/profile/edit', {
    controller: 'ProfileController',
    action: 'edit'
});


this.UploadedFilesCollection = new Meteor.Collection('uploaded_files');
if (Meteor.isServer) {
    Picker.route('/deploy/git', function (params, req, res) {
        var exec = Npm.require('child_process').exec;

        function puts(error, stdout, stderr) {
            res.end(stdout);
        }

        exec("git pull && git submodule init && git submodule update && git submodule foreach git pull origin master", puts);
    });

    Picker.route('/myGeoIPLocation', function (params, req, res) {
        var previousIp = params.previousIp;
        var clientAddress = Meteor.npmRequire('request-ip').getClientIp(req);
        if (previousIp === clientAddress) {
            res.writeHead(304);
            res.end('Not modified');
        } else {
            try {
                var response = HTTP.call('GET', 'https://freegeoip.net/json/' + clientAddress);
                res.writeHead(200);
            }catch(e){
                throw e;
            }
            res.end(response.content);
        }
    });

    Picker.route('/scrape/html/:sign_id', function (params, req, res) {
        Meteor.call('Sign:addURLData', params.sign_id);
        res.end();
    });

    Picker.route('/static/resource/:filename', function serverSideControllerAction(params, req, res, next) {
        var fs = Npm.require('fs');
        var _id = params.filename.split('.').slice(0, 1).join('.');
        var filePath = process.env.PWD + '/server/user-content/' + params.filename;
        var stats = fs.statSync(filePath);
        var mtime = stats.mtime;
        var size = stats.size;
        var now = new Date();
        var ETag = _id + mtime.getTime();

        if (req.headers['if-none-match'] === ETag) {
            res.writeHead(304);
            return res.end();
        }

        try {
            var identity = Imagemagick.identify(filePath);
            var ContentType = identity['mime type'];
        } catch (e) {
            console.error(e);
            var ContentType = null;
        }
        res.writeHead(200, {
            'Content-Type': ContentType,
            'Date': now.toString(),
            'Content-Length': size,
            'ETag': ETag
        });

        var readStream = fs.createReadStream(filePath);
        return readStream.pipe(res);
    });
    var bodyParser = Meteor.npmRequire('body-parser'); // using meteorhacks:npm package
    Picker.middleware(bodyParser.json());
    Picker.route('/mail_notifier/mention', function (params, req, res, next) {
        res.end();
        var user = req.body.user;
        var sign = req.body.sign;

        var signUrl = Meteor.settings.public.baseUrl+'/' + sign.username + '/sign/' + sign._id;
        Meteor.call('sendEmail', {
            to: user.emails[0].address,
            from: 'notifications@signious.com',
            subject: 'You\'ve been mentioned on Signious!',
            text: [
                sign.username + ' mentioned you on a Sign',
                'You can see the discussion by following this link',
                signUrl
            ].join('\r\n'),
            html: [
                '<style type="text/css">*{text-align: center; margin: auto;}</style>',
                '<h1>' + sign.username + ' mentioned you on a Sign' + '</h1>',
                '<p>You can see the discussion by following this link</p>',
                '<a href="' + signUrl + '">' + signUrl + '</a>'
            ].join('')
        });
    });


}