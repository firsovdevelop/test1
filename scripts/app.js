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
			redirectTo: '/login'			
		});
	}]);


	
myApp.service('serviceVK', ['$location', function($location) {	
        		
	var self = this;

	this.loginStatus = false; // Статус авторизации
	
	// Авторизация
	this.login = function(callback){
		callback = callback || undefined;
		// Вызов API		
		VK.Auth.login(function(response) {
                if (!response.session) {                    
                    return;
                }
				self.loginStatus = true;   
				console.log('Авторизация завершена');
				if(callback) {
					callback();
				}
		}, VK.access.FRIENDS | VK.access.WIKI);
	};
	
	// Выход из авторизации
	this.logout = function(){
		// Вызов API
		VK.Auth.logout();		
		this.loginStatus = false;		
	}
	
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
	
	this.redirectTo = function(path) {
		console.log('перенаправление в: '+path);
		$rootScope.apply($location.path(path));
	};
}]);

myApp.controller('pageCtrl', ['$scope', '$location', 'serviceVK', function($scope, $location, serviceVK) {
		
	var self = this;
	
	this.VK = {};	
	this.VK.login = function() {
		serviceVK.login(function(){
					$scope.$apply($location.path('/secure')); 								
		});		
	};
	
	this.VK.logout = function() {
		serviceVK.logout();
		$location.url('/login');
	};
}]);	



// Эксперимент Interceptor 
myApp.factory('MyAuthInterceptor', ['$window', '$q', '$location', '$log', 'serviceVK', function($window, $q, $location, $log, serviceVK) {
        
		$log.debug('Начало авторизации');
		serviceVK.getLoginStatus();	// Проверка статуа авторизации
		
        return {
            request: function(config) {
				// Перед каждым запросом добавляем token
                config.headers = config.headers || {};
				// Проверка статуса авторизации			
				$log.debug('запрос...');
				if(serviceVK.loginStatus) {
					// Пользователь авторизован
					$location.url('/secure');		
				}
				else {
					// Пользователь не авторизован					
					$location.url('/login');		
				}	
				/*			
                if ($window.localStorage.getItem('token')) {
					// Подстановка значения token					
                    config.headers.Authorization = 'token ' + $window.localStorage.getItem('token');
                }	*/	
                return config || $q.when(config);
            },
            response: function(response) {
				$log.debug('ответ...');								
				// Если ответ "плохой", сообщаем что пользователь не авторизован
				// Перенаправление на страницу login
                if (response.status === 401) {
					$location.url('/login');
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

   
