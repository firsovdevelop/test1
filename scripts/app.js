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
	this.user = {};
	
	// Авторизация
	this.login = function(callback){
		callback = callback || undefined;
		// Вызов API		
		VK.Auth.login(function(response) {
				console.log(response);
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
			if (response.status == 'connected') { 
				// Пользователь авторизован				
				self.loginStatus = true;				
				self.getUser();
				console.log('Пользователь авторизован');			
			} else { 
				// Пользователь не авторизован
				self.loginStatus = false;
				console.log('Пользователь не авторизован');
			} 
		});	
	};
	
	// Получение данных сессии
	this.getSession = function(){			
		// Вызов API
		var session = VK.Auth.getSession();			
	};
	
	// Получение информации о пользователе
	this.getUser = function(callback){
		callback = callback || undefined;
		VK.Api.call('users.get', {fields:'photo'}, function(r) {
			  if(r.response) {
				self.user.firstName = r.response[0].first_name;
				self.user.lastName = r.response[0].last_name;
				self.user.photo = r.response[0].photo;								
				if(callback) {
					callback();
				}
			  }
		});
	};

	
}]);

myApp.controller('pageCtrl', ['$scope', '$location', 'serviceVK', function($scope, $location, serviceVK) {
		
	var self = this;
	
	
	this.user = {
		firstName: undefined,
		lastName: undefined,
		photo: undefined
	}
			
	this.getCookie = function(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
	
	this.VK = {};	
	
	this.VK.login = function() {
		serviceVK.login(function(){																						
					$scope.$apply($location.path('/secure'));
					serviceVK.getUser(function(){
						console.log('action');
						self.user.firstName = serviceVK.user.firstName; 
						self.user.lastName = serviceVK.user.lastName;
						self.user.photo = serviceVK.user.photo;
						$scope.$apply();
						console.log(self.user);
					}); // Информации о пользователе					
					console.log(self.getCookie('vk_app_5763775'));
		});	
	};
	
	this.VK.logout = function() {
		serviceVK.logout();
		$location.url('/login');
	};
	
	this.VK.initialisation = function() {
		console.log('ini');
		serviceVK.getUser(function(){
						console.log('action');
						self.user.firstName = serviceVK.user.firstName; 
						self.user.lastName = serviceVK.user.lastName;
						self.user.photo = serviceVK.user.photo;
						$scope.$apply();
						console.log(self.user);
					}); 
	}
	this.VK.initialisation();
		
}]);	



// Эксперимент Interceptor 
myApp.factory('MyAuthInterceptor', ['$q', '$location', '$log', 'serviceVK', function($q, $location, $log, serviceVK) {
        		
		// Проверка статуса авторизации
		serviceVK.getLoginStatus(); // Проверка статуcа авторизации
		
        return {
            request: function(config) {
								
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

   
