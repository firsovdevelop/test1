'use strict';

var myApp = angular.module('myApp', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider){
		$routeProvider
		.when('/login',
		{
			templateUrl:'views/login.html'
		})
		.when('/secure',
		{
			templateUrl:'views/secure.html'
		})
		.otherwise({
			redirectTo: '/'
		});
	}]);

myApp.controller('pageCtrl', ['$scope', '$ngRoute', function($scope, ngRoute) {	
    	
    
	var self = this;
	
}]);
   