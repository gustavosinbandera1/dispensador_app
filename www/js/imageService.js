angular.module("starter")

.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
 
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,//Numner Format of the return value
      sourceType: source,//Set the source of the picture
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG, //JPEG = 0, PNG = 1
      //targetWidth: 100,
      //targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      cameraDirection: Camera.Direction.FRONT
    };
  }
 
  function saveMedia(type,imageName) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
       // alert(imageUrl);//file:///storage/sdcard0/Android/data/com.ionicframework.cam2example875283/cache/1468952747034.jpg
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);//1468952747034.jpg
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);//file:///storage/sdcard0/Android/data/com.ionicframework.cam2example875283/cache/
        //var newName = makeid() + name;//nSxjO1468952747034.jpg
        var newName = imageName;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }

  function removeMedia(imageName) {
  	$cordovaFile.removeFile(cordova.file.dataDirectory, imageName)
      .then(function (success) {
      	//alert("imagen eliminada del sistema: ");
      	FileService.deleteImage(imageName);//eliminamos la referencia en localstorage
        // success
      }, function (error) {
        // error
        //alert("no se pudo eliminar la imagen");
      });

  	//alert(imageName);
  }

  function take_Picture(type){
  	return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
       //alert("tomando foto take_picture()");
       resolve(imageUrl);
      }, function (err){
      	 reject();
      	 //alert("error take_picture()");
      });
    })
  }

/*
  function savePicture(namePath,dataName,profileName){
  	 $cordovaFile.copyFile(namePath, dataName, cordova.file.dataDirectory, profileName)
          .then(function(info) {
            FileService.storeImage(profileName);
            resolve();
          }, function(e) {
            reject();
          });
  }*/
/*
  function deletePicture(imageName){
  	removeMedia(imageName);
  }*/



  return {
    handleMediaDialog: saveMedia,
    deleteMedia: removeMedia,
    tomarPhoto: take_Picture
    /*savePhoto: savePicture,
    deletePhoto: deletePicture*/
  }
});