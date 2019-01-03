angular.module('starter')
 
.factory('FileService', function() {
  var images;
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(img) {
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };

  function rmImage(img){
    var index = images.indexOf(img);
    if(index != -1){
    images.splice(index,1);
    window.localStorage.removeItem(IMAGE_STORAGE_KEY);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    //alert("imagen removida file service");
    //alert(index);
    }
    else
    {
      //alert("no se removio la imagen");
      //alert(img);
    }
  };
 
  return {
    storeImage: addImage,
    images: getImages,
    deleteImage: rmImage
  }
})