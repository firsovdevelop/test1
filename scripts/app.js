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


	
myApp.service('serviceVK', [function() {	
        		
	var self = this;

	this.loginStatus = false; // Статус авторизации
	
	// Авторизация
	this.login = function(){
		// Вызов API		
		VK.Auth.login(null, VK.access.FRIENDS);

	};
	
	// Проверка авторизации
	this.getLoginStatus = function(){
		// Вызов API	
		VK.Auth.getLoginStatus(function(response) { 					
			if (response.session) { 
				// Пользователь авторизован				
				self.loginStatus = true;
				console.log('Пользователь авторизован');
			} else { 
				// Пользователь не авторизован
				self.loginStatus = false;
				console.log('Пользователь не авторизован');
			} 
		});	
	};
	
}]);

myApp.controller('pageCtrl', ['$scope', 'serviceVK', function($scope, serviceVK) {
		
	var self = this;
	
	this.VK = {};	
	this.VK.login = function() {
		serviceVK.login();
	};
}]);	



// Эксперимент Interceptor 
myApp.factory('MyAuthInterceptor', ['$window', '$q', '$log', 'serviceVK', function($window, $q, $log, serviceVK) {
        $log.debug('Начало авторизации');		
        return {
            request: function(config) {
				// Перед каждым запросом добавляем token
                config.headers = config.headers || {};
				// Проверка статуса авторизации
				serviceVK.getLoginStatus();
				/*
					Проверять VK.Auth.getLoginStatus перед каждым запросом					
					для авторизованных пользователей показывать страницу secter
					для неавторизованных показывать страницу login						
				*/
                if ($window.localStorage.getItem('token')) {
					// Подстановка значения token					
                    config.headers.Authorization = 'token ' + $window.localStorage.getItem('token');
                }		
                return config || $q.when(config);
            },
            response: function(response) {
				// Если ответ "плохой", сообщаем что пользователь не авторизован
				// Перенаправление на страницу login
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

   
