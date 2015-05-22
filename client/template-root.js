Template.root.rendered = function(){

};


Template.root.helpers({
	currentRoute: function(url, template){
		if(Router.current().location.get().pathname === url){
			return 'is_current_route';
		}
		return '';
	}
});