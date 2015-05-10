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
        console.log('Show again');
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
Router.route('/static/resource/:file_id', {
    where: 'server',
    action: function() {
        var fs = Npm.require('fs');
        var _id = this.params.file_id;
        var filePath = process.env.PWD + '/server/user-content/' + _id;
        var stats = fs.statSync(filePath);
        var mtime = stats.mtime;
        var size = stats.size;
        var now = new Date();
        var ETag = _id + mtime.getTime();


        if(this.request.headers['if-none-match'] === ETag){
            this.response.writeHead(304);
            return this.response.end();
        }else {
            var file = UploadedFilesCollection.find({_id: _id}, {limit: 1}).fetch().pop();
            var data = fs.readFileSync(filePath);
            this.response.writeHead(200, {
                'Content-Type': file.mimeType,
                'Date': now.toString(),
                'Content-Length': size,
                'ETag': ETag
            });
            this.response.write(data);
            return this.response.end();
        }
    }
});