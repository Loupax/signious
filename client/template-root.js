Template.root.rendered = function(){
	var routes = ['/','/profile'];
	var current = routes.indexOf(Router.current().location.get().pathname);

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


Template.root.helpers({
	currentRoute: function(url, template){
		if(Router.current().location.get().pathname === url){
			return 'is_current_route';
		}
		return '';
	}
});