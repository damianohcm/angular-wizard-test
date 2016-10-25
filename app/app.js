(function(angular) {

	// create module 'githubViewer'
	var app = angular.module('Main', 
		[
			'ngRoute', 
			'ngAnimate', 
			'ui.bootstrap',
			'ngTagsInput'
		]);

	// indeterminate-checkbox directive for tri-state checkbox
	app.directive('customcheck', function() {
		return {
			// Restrict the directive so it can only be used as an attribute
			restrict: 'A',
            //require: 'ngModel',
            link(scope, elem, attrs, ngModel) {
				//console.log('attrs', attrs);
				var childList = scope.$eval(attrs.childList),
            		property = attrs.property;

				var areAllSelected = function(arr) {
					return arr.every(function(item) {
						return item.selected === true;
					});
				};

				var areSomeSelected = function(arr) {
					return !areAllSelected(arr) && arr.some(function(item) {
						return item.selected === true;
					});
				};

				var setAllSelected = function(val) {
					angular.forEach(childList, function(child) {
						child[property] = val;
					});
				};

				// Watch the children for changes
				var childListWatcher = scope.$watch(function(scope) {
					return childList.map(function(obj) {
							return {'selected': obj.selected}
						});
				}, function (items) {
					//console.log('childListWatcher items', items);
					console.log('childListWatcher areAllSelected', areAllSelected(items));
					console.log('childListWatcher areSomeSelected', areSomeSelected(items));
					var someSelected = areSomeSelected(items);
					if (!someSelected) {
						var allSelected = areAllSelected(items);
						//setAllSelected(allSelected);
						console.log('attrs.ngChecked', attrs.ngChecked);
						//attrs.ngChecked = allSelected;
						scope.$eval(attrs.ngChecked + ' = ' + allSelected);
						//scope.$apply();
					} else {
						scope.$eval(attrs.ngChecked + ' = false');
					}

				}, true);

				var checkedWatcher = scope.$watch(attrs.checked, function(value) {
					console.log('checkedWatcher', value);
					console.log('checkedWatcher loop set set property on children');
					setAllSelected(value);
				});

				/*// Whenever the bound value of the attribute changes we update
				// the internal 'indeterminate' flag on the attached dom element
				var checkedStateWatcher = scope.$watch(attrs.checkedState, function(value) {
					console.log('checkedStateWatcher', value);
					//elem[0].indeterminate = value;
					if (value !== undefined) {
						console.log('checkedStateWatcher loop set set property on children');
						angular.forEach(childList, function(child) {
							child[property] = value;
						});
					}
				});*/

				// Remove the watcher when the directive is destroyed
				scope.$on('$destroy', function() {
					childListWatcher();
					checkedWatcher();
				});

				// Bind the onChange event to update children
				elem.bind('change', function() {
					scope.$apply(function () {
						var isChecked = elem.prop('checked');
						console.log('isChecked', isChecked);
						
						// Set each child's selected property to the checkbox's checked property
						angular.forEach(childList, function(child) {
							child[property] = isChecked;
						});
					});
				});
			}
		};
	});

	
	// configure
	app.config([
		'$routeProvider',
		function($routeProvider) {
		
			$routeProvider
				.when('/', {
					templateUrl: 'views/home.html',
					controller: 'homeController'
				})
				.when('/wizard', {
					templateUrl: 'views/wizard.html',
					controller: 'wizardController'
				})
				.otherwise({
					redirectTo: '/'
				});
		}]);

	// register services with angular
    app.factory('utilsService', [services.utilsService]);
	app.factory('dataService', ['$http', services.dataService]);
	app.factory('wizardServiceFactory', [services.wizardServiceFactory]);
	
	// register controllers
	// home controllers
	app.controller('homeController', [
		'$scope',
		'$rootScope',  
		'$route', '$routeParams', '$location',  
		'utilsService',
		controllers.homeController]);
	
	app.controller('wizardController', [
		'$scope',
		'$rootScope',
		'$route', '$routeParams', '$location', '$filter', 
		'utilsService',
		'dataService',
		'wizardServiceFactory',
		controllers.wizardController]);

		
	

}(window.angular));
