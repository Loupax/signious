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
    action: 'index'
});

Router.route('/profile/show', {
    controller: 'ProfileController',
    action: 'index'
});

Router.route('/:username/sign/:sign_id', {
    controller: 'SignController',
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
Router.route('/static/resource/:file_id', {
    where: 'server',
    action: function() {
        var fs = Npm.require('fs');
        var _id = this.params.file_id;
        var filePath = process.env.PWD + '/server/user-content/' + _id;
        var data = fs.readFileSync(filePath);
        var stats = fs.statSync(filePath);
        var mtime = stats.mtime;
        var size = stats.size;
        var now = new Date();
        var file = UploadedFilesCollection.find({_id: _id}, {limit: 1}).fetch().pop();
        var maxAge = 311040000;
        this.response.writeHead(200, {
            'Content-Type': file.mimeType,
            'Last-Modified': mtime.toUTCString(),
            'Cache-Control':'max-age='+maxAge+', public',
            'Content-Length': size,
            'ETag': _id + mtime.getTime(),
            'Expires': (now.setSeconds(now.getSeconds() + maxAge))?now.toUTCString():''
        });
        this.response.write(data);
        this.response.end();
    }
});