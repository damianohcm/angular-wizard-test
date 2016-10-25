(function() {

	// create controller
	window.controllers = window.controllers || {};
  
	window.controllers.homeController = function($scope, $rootScope, $route, $routeParams, $location, utilsService) {

		this.$route = $route;
		this.$location = $location;
		this.$routeParams = $routeParams;

	};

}());
