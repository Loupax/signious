Router.configure({
  // the default layout
  layoutTemplate: 'root'
});
Template.root.rendered = function(){
	var routes = ['/','/profile'];
	var current = routes.indexOf(Router.current().location.get().pathname);
	console.log(current);

	var element = this.find('.signious');
	if(element){
		Hammer(element).on('swiperight', function() {
			current++; 
			if(current > routes.length - 1){
				current = routes.length - 1;
			}
			Router.go(routes[current]);
		});
		Hammer(element).on('swipeleft', function(){
			current--; 
			if(current < 0){
				current = 0;
			}
			Router.go(routes[current]);
		});
	}
};


Router.route('/', function () {
  this.render('home');
});

Router.route('/profile', function () {
  this.render('profile');
});