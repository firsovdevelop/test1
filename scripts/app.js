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

// Эксперимент Interceptor 
myApp.factory('MyAuthInterceptor', ['$window', '$q', '$log', function($window, $q, $log) {
        $log.debug('Начало авторизации');		
        return {
            request: function(config) {
				// Перед каждым запросом добавляем token
                config.headers = config.headers || {};
                if ($window.localStorage.getItem('token')) {
					// Подстановка значения token
                    config.headers.Authorization = 'token ' + $window.localStorage.getItem('token');
                }				
                return config || $q.when(config);
            },
            response: function(response) {
				// Если ответ "плохой", сообщаем что пользователь не авторизован
                if (response.status === 401) {
                    $log.debug('Пользователь не авторизован!');
                }
                return response || $q.when(response);
            }
        };
    }
]);

myApp.config(['$httpProvider', function($httpProvider) {      
        $httpProvider.interceptors.push('MyAuthInterceptor');
}]);
   
