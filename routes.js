Router.configure({
  // the default layout
  layoutTemplate: 'root'
});

Router.route('/', {
    controller: 'HomeController',
    action: 'index'
});

Router.route('/profile', {
    controller: 'ProfileController',
    action: 'index'
});

Router.route('/deploy', {
    action:function(req, res){
        var exec = Npm.require('child_process').exec;
        function puts(error, stdout, stderr) { res.end(stdout); }
        exec("git pull", puts);
    },
    where: 'server'
});
