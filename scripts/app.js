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

myApp.controller('pageCtrl', ['$scope', function($scope) {	
        
	var self = this;
	
	// Объект для работы с API вконтакте
	this.VK = {};
	
	// Авторизация
	this.VK.login = function(){
		VK.Auth.login(null, VK.access.FRIENDS);
	};
	
}]);

// Модуль Авторизации вконтакте


// Эксперимент Interceptor 
myApp.factory('MyAuthInterceptor', ['$window', '$q', '$log', function($window, $q, $log) {
        $log.debug('Начало авторизации');
		$log.debug($window.localStorage);
        return {
            request: function(config) {
				// Перед каждым запросом добавляем token
                config.headers = config.headers || {};
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

   
