var app = angular.module('app', ['ngNotificationsBar', 'ngSanitize']);
app.config(['notificationsConfigProvider', function(notificationsConfigProvider){
	notificationsConfigProvider.setHideDelay(3000);
	notificationsConfigProvider.setAutoHide(false);
	notificationsConfigProvider.setAcceptHTML(true);
}]);

app.controller('main', function ($scope, notifications) {
	$scope.showError = function () {
		notifications.showError('Oops! Something bad just happend!');
	};

	$scope.showWarning = function () {
		notifications.showWarning('Hey! Take a look <em>here<em>..', {'HEY HEY HEY': function(c){ console.log('HEY!'); c();} });
	};

	$scope.showSuccess = function () {
		notifications.showSuccess('Congrats! Life is great!');
	};

	$scope.closeAll = function () {
		notifications.closeAll();
	};
});
