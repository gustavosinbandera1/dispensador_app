angular.module('starter')

.controller('ImageController', function($scope, $cordovaDevice, $cordovaFile, $ionicPlatform,$ionicActionSheet, ImageService, FileService){
	$ionicPlatform.ready(function() {
		$scope.images = FileService.images();
		$scope.$apply();
	});

	$scope.urlForImage = function(imageName){
		var trueOrigin = cordova.file.dataDirectory + imageName;
		return trueOrigin;
	}

	$scope.addMedia = function(imageName) {
		$scope.hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: 'Take photo'},
				{ text: 'Library' }
			],
			titleText: 'Add images',
			cancelText: 'Cancel',
			buttonClicked: function(index) {
				$scope.addImage(index, imageName);
			}
		});
	}

	$scope.addImage = function(type,imageName) {
		$scope.hideSheet();
		ImageService.handleMediaDialog(type, imageName).then(function() {
			$scope.$apply();
		});
	}
});