Router.configure({
  // the default layout
  layoutTemplate: 'root'
});

Router.route('/', function () {
  this.render('home');
});

Router.route('/profile', function () {
  this.render('profile');
});


Router.route('/deploy',function(req, res){
	var sys = Npm.require('sys')
	var exec = Npm.require('child_process').exec;
	function puts(error, stdout, stderr) { res.end(stdout); }
	exec("git pull", puts);
}, {where: 'server'});