(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory(root, require('angular'));
	} else if (typeof define === 'function' && define.amd) {
		define(['angular'], function (angular) {
			return (root.ngNotificationsBar = factory(root, angular));
		});
	} else {
		root.ngNotificationsBar = factory(root, root.angular);
	}
}(this, function (window, angular) {
	var module = angular.module('ngNotificationsBar', []);

	module.provider('notificationsConfig', function() {
		var config = {};

		function setHideDelay(value){
			config.hideDelay = value;
		}

		function getHideDelay(){
			return config.hideDelay;
		}

		function setAcceptHTML(value){
			config.acceptHTML = value;
		}

		function getAcceptHTML(){
			return config.acceptHTML;
		}


		function setAutoHide(value){
			config.autoHide = value;
		}

		function setAutoHideAnimation(value){
			config.autoHideAnimation = value;
		}

		function getAutoHideAnimation(){
			return config.autoHideAnimation;
		}

		function setAutoHideAnimationDelay(value){
			config.autoHideAnimationDelay = value;
		}

		function getAutoHideAnimationDelay(){
			return config.autoHideAnimationDelay;
		}

		function getAutoHide(){
			return config.autoHide;
		}

		return {
			setHideDelay: setHideDelay,

			setAutoHide: setAutoHide,

			setAutoHideAnimation: setAutoHideAnimation,

			setAutoHideAnimationDelay: setAutoHideAnimationDelay,

			setAcceptHTML: setAcceptHTML,

			$get: function(){
				return {
					getHideDelay: getHideDelay,

					getAutoHide: getAutoHide,

					getAutoHideAnimation: getAutoHideAnimation,

					getAutoHideAnimationDelay: getAutoHideAnimationDelay,

					getAcceptHTML: getAcceptHTML
				};
			}
		};
	});

	module.factory('notifications', ['$rootScope', function ($rootScope) {
		var showError = function (message, buttons) {
			$rootScope.$broadcast('notifications:error', {message: message, buttons: buttons} );
		};

		var showWarning = function (message, buttons) {
			$rootScope.$broadcast('notifications:warning', {message: message, buttons: buttons} );
		};

		var showInfo = function (message, buttons) {
				$rootScope.$broadcast('notifications:info', {message: message, buttons: buttons} );
		};

		var showSuccess = function (message, buttons) {
			$rootScope.$broadcast('notifications:success', {message: message, buttons: buttons} );
		};

		var closeAll = function () {
			$rootScope.$broadcast('notifications:closeAll');
		};

		return {
			showError: showError,
			showInfo: showInfo,
			showWarning: showWarning,
			showSuccess: showSuccess,
			closeAll: closeAll
		};
	}]);

	module.directive('notificationsBar', ['notificationsConfig', '$timeout', function (notificationsConfig, $timeout) {
		return {
			restrict: 'EA',
			template: function(elem, attr){
				var acceptHTML = notificationsConfig.getAcceptHTML() || false;
				var iconClasses = attr.closeicon || 'glyphicon glyphicon-remove';
				return acceptHTML ? '\
					<div class="notifications-container" ng-if="notifications.length">\
						<div class="{{note.type}}" ng-repeat="note in notifications" ng-class="note.animation">\
							<span class="message" ng-bind-html="note.message"></span>\
							<div class="buttons-container">\
								<span ng-repeat="(text, cb) in note.buttons" class=buttons" ng-click="cb(close)" ng-bind-html="text"></span>\
								<span class="' + iconClasses + ' close-click" ng-click="close($index)"></span>\
							<div>\
						</div>\
					</div>\
				' : '\
					<div class="notifications-container" ng-if="notifications.length">\
						<div class="{{note.type}}" ng-repeat="note in notifications" ng-class="note.animation">\
							<span class="message" >{{note.message}}</span>\
							<div class="buttons-container">\
								<span ng-repeat="(text, cb) in note.buttons" class=buttons" ng-click="cb(close)">{{text}}</span>\
								<span class="' + iconClasses + ' close-click" ng-click="close($index)"></span>\
							<div>\
						</div>\
					</div>\
				'

			},
			link: function (scope) {
				var notifications = scope.notifications = [];
				var timers = [];
				var autoHideDelay = notificationsConfig.getHideDelay() || 3000;
				var autoHide = notificationsConfig.getAutoHide() || false;
				var autoHideAnimation = notificationsConfig.getAutoHideAnimation() || '';
				var autoHideAnimationDelay = notificationsConfig.getAutoHideAnimationDelay() || 1200;

				var removeById = function (id) {
					var found = -1;

					notifications.forEach(function (el, index) {
						if (el.id === id) {
							found = index;

							el.animation = {};
							el.animation[autoHideAnimation] = true;

							scope.$apply();
						}
					});

					if (found >= 0) {
						$timeout(function(){
							notifications.splice(found, 1);
						}, autoHideAnimationDelay);
					}
				};

				var notificationHandler = function (event, data, type, animation) {
					var message, hide = autoHide, hideDelay = autoHideDelay;

					if (typeof data === 'object') {
						message = data.message;
						hide = (typeof data.hide === 'undefined') ? autoHide : !!data.hide;
						hideDelay = data.hideDelay || hideDelay;
					} else {
						message = data;
					}

					var id = 'notif_' + (new Date()).getTime();
					notifications.push({id: id, type: type, message: message, animation: animation, buttons: data.buttons});
					if (hide) {
						var timer = $timeout(function () {
							removeById(id);
							$timeout.cancel(timer);
						}, hideDelay);
					}
				};

				scope.$on('notifications:error', function (event, data) {
					notificationHandler(event, data, 'error');
				});

				scope.$on('notifications:warning', function (event, data) {
					notificationHandler(event, data, 'warning');
				});

				scope.$on('notifications:info', function (event, data) {
					notificationHandler(event, data, 'info');
				});

				scope.$on('notifications:success', function (event, data) {
					notificationHandler(event, data, 'success');
				});

				scope.$on('notifications:closeAll', function () {
					notifications.length = 0;
				});

				scope.close = function (index) {
					notifications.splice(index, 1);
				};
			}
		};
	}]);

	return module;
}));
