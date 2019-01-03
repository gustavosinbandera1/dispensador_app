angular.module('starter')

.controller('AppCtrl', function ($scope, $rootScope,$state, $ionicPopup, AuthService, AUTH_EVENTS,AdminDataService) {
	
  $scope.username = AuthService.username();
  //$scope.nameStation =
  var dataTemp;
   dataTemp=AdminDataService.getDispenserConfiguration();
   $scope.nombreEstacion = dataTemp.nameStation;
	
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
		var alertPopup = $ionicPopup.alert({
			title: 'Unauthorized',
			template: 'You are not allowed to access this resource.'
		});
	});

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout();
		$state.go('login');
		var alertPopup = $ionicPopup.alert({
			title: 'Session Lost',
			template:'Sorry, you have to login again' 
		});
	});

  $scope.$on('changeSale', function (event, data) {
    console.log("se escucho el evento");
    console.log(data); // 'Some data'
    $scope.$broadcast('changeDetect', data); // going down!
  });

  $scope.$on('changeSalePublic', function (event, data) {
    console.log("se escucho el evento publico");
    console.log(data); // 'Some data'
    $scope.$broadcast('changeDetectPublic', data); // going down!
  });
  

  $scope.$on('changeNameStation',function (event, data){
     //$scope.$broadcast('changeNameStation', data);
     $scope.nombreEstacion = data;
  });

  $scope.$on('changeDatabase', function (event, data) {
    console.log("la base de datos cambio en parent");
    console.log(data); // 'Some data'
    $rootScope.$broadcast('changeDatabaseRx', data); // going down!
    //$scope.$broadcast('changeDatabaseRx_', data);
    //$scope.$emit('changeDatabaseRx_', data);
  });


	$scope.setCurrentUsername = function (name) {
    	$scope.username = name;
  	};
})


.controller('LoginCtrl', function($scope,$timeout,$rootScope, $state, $ionicPopup, $ionicPlatform,AuthService,BirthdayService,DashDataService) {
  var vm = $scope;


  $rootScope.$on('changeDatabaseRx', function (event, data) {
      console.log("la base de datos cambio en login");
      console.log(data); // 'Some data'
     $rootScope.timer = $timeout(function() {
         BirthdayService.getAllUsers()
                .then(function (users) {
                  //vm.users = users;
                  //console.log(users);
                  var exist=0;
                  var default_= {};
                  for(var i=0; i<users.length;i++){
                    if(users[i].Name == 'admin' && users[i].Password=='2016'){
                      exist=1;
                    }
                  }
                  if(!exist){
                    default_.Name = 'admin';
                    default_.Password = '2016';
                    default_.role = 'administrador';
                    BirthdayService.addUser(default_);
                  }
                  vm.users = users;


                });
        
        //$scope.images = FileService.images();

      }, 2000);
  });



  $ionicPlatform.ready(function() {
        // Initialize the database.
        BirthdayService.initDB();
        // Get all birthday records from the database.
        BirthdayService.getAllBirthdays()
                        .then(function (birthdays) {
                            vm.birthdays = birthdays;
                        });
        BirthdayService.getAllUsers()
                        .then(function (users) {
                        var exist=0;
                        var default_= {};
                        for(var i=0; i<users.length;i++){
                          if(users[i].Name == 'admin' && users[i].Password=='2016'){
                            exist=1;
                          }
                        }
                        if(!exist){
                          default_.Name = 'admin';
                          default_.Password = '2016';
                          default_.role = 'administrador';
                          BirthdayService.addUser(default_);
                        }
                            vm.users = users;
                        });

    });


  $scope.data = {};
 
  $scope.login = function(data) {
    var authorization =DashDataService.getDispenserAuthorization();
     BirthdayService.initDB();
     BirthdayService.getAllUsers()
                .then(function (users) {
                  vm.users = users;
                  console.log(users);
                });
    AuthService.login(data.username, data.password,vm, authorization)
    .then(function (authenticated) {
      $state.go('main.dash', {}, {reload: true});
      $scope.setCurrentUsername(data.username);
      $scope.username = data.username;
      if(authorization == true){//si hay apertura en progreso habilitamos el dispensador nuevamente
        AuthService.runSale();
        console.log("comprobado 1");
      }
    }, function(err) {//toca cambiar el mensaje, depende de si hay o no apertura en curso, cosa que se revisa en el servicio
          var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          //template: 'Please check your credentials!'
          template: err
      });
    });
    //data.username="";
    data.password = "";
  };
})



.controller('DashCtrl', function(
  $scope,
  $rootScope,
  $q,
  $timeout, 
  $state, 
  $http, 
  $ionicPopup, 
  AuthService,
  DashDataService,
  AdminDataService,
  DispenserDataService,
  BirthdayService) {


   $scope.dashData = {};
   var usuario = AuthService.getActualUser();//usuario actual en dashboard, cuando se deslogea esta variable la dejamos seteada para compararla con el nuevo login si hay una apertura en curso
   //var vm = this;

   console.log("usuario actual");
   console.log(usuario);
   BirthdayService.initDB();
   
   BirthdayService.getAllUsers()
                .then(function (users) {
                  $scope.users = users;
                  //console.log(users[0].Name.toString());
                  for(var i=0; i<$scope.users.length;i++){
                    //console.log(users[i].Name.toString());
                    if( AuthService.username().toString() == $scope.users[i].Name.toString()){
                      $scope.dashData.Name =  $scope.users[i].Name;
                      $scope.dashData.Apellido = $scope.users[i].Apellido;
                      $scope.dashData.Telefono = $scope.users[i].Telefono;
                      console.log("hay coincidencia");
                      console.log( $scope.users[i].Apellido);
                    }
                  }
                }); 
    $scope.$on('changeDetectPublic', function (event, data) {
      console.log("se recivio el evento en el controlador publico");
      console.log(data); // 'Some data'
      $scope.ultimaVenta = data;
    });

  //DashDataService.setDispenserAuthorization(false);
  $scope.dashData.isAuthorized = DashDataService.getDispenserAuthorization();
  $scope.dashData.printerBusy = false;
  //console.log($scope.dashData.isAuthorized);
  var delay=100; //1 second
  setTimeout(function() {
  console.log($scope.dashData.Apellido);
  console.log($scope.dashData.Telefono);
  }, delay);

   $scope.logout = function() {
    var authorization =DashDataService.getDispenserAuthorization();
    AuthService.logout();
    if(authorization == true){//si hay una apertura en progreso detenemos las ventas en el dispensador hasta que el usuario actual vuelva a  logearse
      //para ello debemos enviar una peticion al servidor 
      //$scope.stopSale();//
      AuthService.stopSale();
    }
    
    $state.go('login');
  };

$scope.ssidHandler = function(s){
    //alert("Current SSID"+s);
    var alertPopup = $ionicPopup.alert({
        title: 'ssidHandler encontrado',
        template: 'lo encontre!'
      });
}
$scope.fail= function (e){
    var alertPopup = $ionicPopup.alert({
        title: 'Hubo un fallo',
        template: 'vamos fallando!'
      });
}
$scope.getCurrentSSID = function(){
  var alertPopup = $ionicPopup.alert({
        title: 'GetCurrentSSID!',
        template: 'ya entre a la funcion'
      });

    WifiWizard.getCurrentSSID(ssidHandler, fail);
    var alertPopup1 = $ionicPopup.alert({
        title: 'GetCurrentSSID!',
        template: 'pero no sali'
      });
};

$scope.getDay = function() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var meses = ['','enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  if(dd<10) {
    dd='0'+dd;
  } 
  today = meses[mm]+'-'+dd+'-'+yyyy ;
  console.log(today);
  return today;
  
}

$scope.getHour = function(){
  var time = new Date();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  if(minutes < 10){
    minutes = '0'+minutes;
  }
  return hours + ' : ' + minutes;
}

var canceler = $q.defer();

$scope.hacerCierre = function(){
  var today = $scope.getDay();
  var hour  = $scope.getHour();

  timer = $timeout(function() {
        $scope.cancel();
      }, 2000);

  var params = {
      parameter:{
          "comando":"Cierre",
          "username":usuario.username,
          "apellido":usuario.apellido,
          "telefono":usuario.telefono,
          "fecha"    :today,
          "hora"    :hour
      },
      ad:'hacer un cierre'
  }

  $http({
            url: "http://192.168.4.1/cierre", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                $scope.test = response;
                console.log(response);
                $scope.dashData.isAuthorized = false;//cuando el servidor responda establecemos banderas 
                DashDataService.setDispenserAuthorization(false);
                $timeout.cancel(timer);//apagamos el timer 
                
             }).error(function() {
               $timeout.cancel(timer);
               canceler = $q.defer();
             });
 //DashDataService.setDispenserAuthorization(false);
  //$scope.dashData.isAuthorized = false;
}

  
$scope.hacerApertura = function() {
  //para hacer una apertura debemos ejecutar una peticion GET hacia el servidor 
  //y esperar una respuesta del servidor confirmando la recpcion de la solicitud
  //
  var today = $scope.getDay();
  var hour  = $scope.getHour();
 
  timer1 = $timeout(function() {
        $scope.cancel();
      }, 2000);

  var params = {
      parameter:{
          "comando"  :"apertura",
          "username" :usuario.username,
          "apellido" :usuario.apellido,
          "telefono" :usuario.telefono,
          "fecha"    :today,
          "hora"     :hour
          //"hora"     : hours + ' : ' + minutes
      },
      ad:'hacer una apertura'
  }

  $http({
            url: "http://192.168.4.1/apertura", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                $scope.test = response;
                console.log(response);
                $scope.dashData.isAuthorized = true;//cuando el servidor responda establecemos banderas 
                DashDataService.setDispenserAuthorization(true);
                $timeout.cancel(timer1);
                
             }).error(function(){
              canceler = $q.defer();
             })

}
/*
$scope.stopSale = function() {
 
  timer2 = $timeout(function() {
        $scope.cancel();
      }, 2000);

  var params = {
      parameter:{
          "comando"  :"stopSale"
      },
      ad:'hacer un stop sale'
  }

  $http({
            url: "http://192.168.4.1/stopsale", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                $scope.test = response;
                console.log(response);
                $timeout.cancel(timer2);
              }).error(function(){
              canceler = $q.defer();
             })

}*/
/*
$scope.runSale = function() {
 
  timer3 = $timeout(function() {
        $scope.cancel();
      }, 2000);

  var params = {
      parameter:{
          "comando"  :"runSale"
      },
      ad:'hacer un run sale'
  }

  $http({
            url: "http://192.168.4.1/runsale", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                $scope.test = response;
                console.log(response);
                $timeout.cancel(timer3);
              }).error(function(){
              canceler = $q.defer();
             })

}*/
$scope.cancel = function(){
    canceler.resolve("user cancelled"); 
};

 $scope.crearFactura = function (){
   
     $state.go('factura');
  };

$scope.back = function () {
    $state.go('main.dash');
    $scope.dashData.printerBusy = false;//liberamos el boton de imprimir
}

$scope.performValidRequest = function() {
};

 $scope.showSelectValue = function(value){
  console.log(value);
 };

 $scope.HTTP_Print = function (data){
$scope.dashData.printerBusy = true;//si enviamos formulario desactivamos boton
 var today = $scope.getDay();
 var hour  = $scope.getHour();
 timer1 = $timeout(function() {
        $scope.cancel();
      }, 3000);

    var params = {
           parameter:{
              "comando": "ImprimirFactura",
              "nombre" : data.nombre,
              "nit"    : data.nit,
              "placa"  : data.placa,
              "telefono":data.telefono,
              "kilometraje": data.kilometraje,
              "numCopias" : data.numCopias,
              "puntoVenta":data.puntoVenta,
              "fecha"    :today,
               "hora"     :hour
           }
        };
        //console.log(params);
       $http({
            url: "http://192.168.4.1/factura", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                //$scope.test = response;
                //console.log("llego respuesta");
                console.log(response);
                $scope.dashData.printerBusy = false;
                $timeout.cancel(timer1);
             }).error(function(){
              canceler = $q.defer();
              $scope.dashData.printerBusy = false;
              alert("no hay comunicacion con el servidor");
             })
    
  };
 
  $scope.performUnauthorizedRequest = function() {
    $http.get('http://localhost:8100/notauthorized').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
 
  $scope.performInvalidRequest = function() {
  
  };

  $scope.getLastSale = function (){
    $state.go('last-salePublic');
    $scope.HTTP_getLastSale();
  }
  $scope.HTTP_getLastSale = function (){
    $state.go('last-salePublic');
    //vm.configIsBusy = true;
    DispenserDataService.getLastSale().then(function(data){
       $scope.ultimaVenta = data;
        //vm.configIsBusy = false;
        $scope.$emit('changeSalePublic', data); // going up!
        
    });
      //pedimos datos al servidor periodicamente
      $rootScope.timer = $timeout(function() {
        $scope.HTTP_getLastSale();
      }, 2000);

  };
})



.controller('OverviewController', [
  '$scope',
  '$rootScope',
  '$q',
  '$timeout',
  '$http',
  '$ionicModal',
  '$state',
  '$ionicPlatform',
  '$cordovaDevice',
  '$cordovaFile',
  '$ionicActionSheet',
  '$stateParams',
  'BirthdayService',
  'ImageService',
  'FileService',
  'AdminDataService',
  'DispenserDataService',
  OverviewController]);

 function OverviewController(
  $scope,
  $rootScope, 
  $q,
  $timeout,
  $http, 
  $ionicModal, 
  $state, 
  $ionicPlatform, 
  $cordovaDevice,
  $cordovaFile,
  $ionicActionSheet, 
  $stateParams,
  birthdayService,
  ImageService,
  FileService,
  AdminDataService,
  DispenserDataService) {  

    var vm = this;
    var dataTemp;
    vm.config = {};
    vm.configIsBusy = false;
    dataTemp=AdminDataService.getDispenserConfiguration();

    vm.config.numFueling = dataTemp.numFueling;
    vm.config.numHost    = dataTemp.numHost;
    vm.config.displayTechnology = dataTemp.displayTechnology;
    vm.config.price1 = dataTemp.price1;
    vm.config.price2 = dataTemp.price2;

    vm.config.nameStation = dataTemp.nameStation;
    vm.config.dirStation  = dataTemp.dirStation;
    vm.config.ciudadStation  = dataTemp.ciudadStation;
    vm.config.nitStation  = dataTemp.nitStation;
    vm.config.telStation  = dataTemp.telStation;
    vm.config.idStation    = dataTemp.idStation;

   vm.config.nameProduct1 = dataTemp.nameProduct1;
   vm.config.nameProduct2 = dataTemp.nameProduct2;
 
  
    $scope.$on('changeDetect', function (event, data) {
      console.log("se recivio el evento en el controlador necesario");
      console.log(data); // 'Some data'
      $scope.ultimaVenta = data;
    });

    $rootScope.$on('changeDatabaseRx', function (event, data) {
      console.log("la base de datos cambio y se recibio el evento");
      console.log(data); // 'Some data'
      $rootScope.timer = $timeout(function() {
         birthdayService.getAllUsers()
                .then(function (users) {
                  vm.users = users;
                  console.log(users);
                });
        
        $scope.images = FileService.images();

      }, 500);
      
    });

    $ionicPlatform.ready(function() {
        // Initialize the database.
        birthdayService.initDB();
        // Get all birthday records from the database.
        birthdayService.getAllBirthdays()
                .then(function (birthdays) {
                 vm.birthdays = birthdays;
                 console.log(birthdays);
                });
        
        birthdayService.getAllUsers()
                .then(function (users) {
                  vm.users = users;
                  console.log(users);
                });
        
        $scope.images = FileService.images();


       
        
    });

     // Initialize the modal view.
    $ionicModal.fromTemplateUrl('templates/add-or-edit-birthday.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

     $ionicModal.fromTemplateUrl('templates/add-or-edit-user.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal1 = modal;
    });


     vm.showAddBirthdayModal = function() {
      console.log("llege al modal");
        $scope.birthday = {};
        $scope.action = 'Add';
        $scope.isAdd = true;
        $scope.modal.show();        
    };

    vm.showEditBirthdayModal = function(birthday) {
        $scope.birthday = birthday;
        $scope.action = 'Edit';
        $scope.isAdd = false;          
        $scope.modal.show();
    };

     vm.showAddUserModal = function() {

        $scope.user = {};
        //$scope.user.profile = '';
        $scope.action = 'Add';
        $scope.isAdd = true;
        $scope.modal1.show();        
    };

    vm.showEditUserModal = function(user) {
        $scope.user = user;
        $scope.action = 'Edit';
        $scope.isAdd = false;          
        $scope.modal1.show();
        //alert("mostrando modal");
    };

    $scope.saveBirthday = function() {
        if ($scope.isAdd) {
            birthdayService.addBirthday($scope.birthday);              
        } else {
            birthdayService.updateBirthday($scope.birthday);               
        }                       
        $scope.modal.hide();
    };
     $scope.hideModal = function() {
      $scope.modal.hide();
    }
    $scope.hideModal1 = function() {
      
      /*birthdayService.getAllUsers()
                .then(function (users) {
                  vm.users = users;
                  console.log(users);
                });
      console.log("quitando modal");*/
      $scope.modal1.hide();
    }

    $scope.saveUser = function() {
        if ($scope.isAdd) {
            birthdayService.addUser($scope.user);              
        } else {
            birthdayService.updateUser($scope.user);               
        }  
        //$scope.hideModal1();
        $scope.modal1.hide();
        /* birthdayService.getAllUsers()
                .then(function (users) {
                  vm.users = users;
                  console.log(users);
                });*/
      console.log("salvando datos");
      $scope.$emit('changeDatabase', $scope.user);
    };

    $scope.deleteBirthday = function() {
        birthdayService.deleteBirthday($scope.birthday);           
        $scope.modal.hide();
    };

    $scope.deleteUser = function() {
        birthdayService.deleteUser($scope.user);
        $scope.modal1.hide();
        //$scope.hideModal1();
        $scope.$emit('changeDatabase', $scope.user);
    };

     $scope.$on('$destroy', function() {
        $scope.modal.remove(); 
        console.log("se estan destruyendo los modales");
    });

    // Execute action on hide modal
   $scope.$on('modal.hidden', function() {
    console.log("se estan escondiendo los modales");
      // Execute action
   });
  
   // Execute action on remove modal
   $scope.$on('modal.removed', function() {
    console.log("se estan removiendo los modales");
      // Execute action
   });

   $scope.birthday = function (){
    $state.go('birthday');
  };
   $scope.user = function (){
    $state.go('user');
  };

  $scope.back = function () {
   //$state.go($scope.previousState);
    $state.go('main.admin');
    vm.configIsBusy = false;
  } 
    
 
  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  }

  $scope.addMedia = function(imageName) {
    $scope.takePhoto(0);///foto de la camara  1 de la libreria
    /*$scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Tomar Foto'}//,
        //{ text: 'Libreria' }
      ],
      titleText: 'agregar imagen de perfil',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.takePhoto(index);
      }
    });*/
  }

  $scope.addImage = function(type,imageName) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type, imageName).then(function() {
    $scope.$apply();
    });
  }

  $scope.takePhoto = function(type){
    //alert("tomando foto");
    ImageService.tomarPhoto(type).then(function(imgUrl){
    $scope.user.profile =  imgUrl;
    //alert("foto resuelta");
    }, function (err){

      }
    );
  }

  $scope.removeImage = function(imageName){
     ImageService.deleteMedia(imageName); 
  }

  $scope.configDispenser = function (){
    $state.go('config-dispenser');
    //state.go('main.dask');
  };
  $scope.configStation = function (){
    $state.go('config-station');
    //state.go('main.dask');
  };
  $scope.changePrice = function (){
    $state.go('change-price');
  };

  $scope.getLastSale = function (){
    $state.go('last-sale');
    $scope.HTTP_getLastSale();
  }

var canceler = $q.defer();
  $scope.HTTP_ConfigDispenser = function (){
    vm.configIsBusy = true;

    timer = $timeout(function(){
      canceler.resolve();
    },3000);
    var params = {
           parameter:{
              "comando": "configurarDispensador",
              "numFueling" : parseInt(vm.config.numFueling,10),
              "numHost"    : parseInt(vm.config.numHost,10),
              "displayTechnology" : parseInt(vm.config.displayTechnology,10)
           }
        }
       $http({
            url: "http://192.168.4.1/config_dispenser", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                AdminDataService.setDispenserConfiguration(vm.config);
                $scope.test = response;
                vm.configIsBusy = false;
                $timeout.cancel(timer);
             }).error(function() {
               canceler = $q.defer();
               vm.configIsBusy = false;
               $timeout.cancel(timer);
               //alert("no hay comunicacion con el servidor");
             });
    
  };

  $scope.HTTP_ConfigStation = function (){
    vm.configIsBusy = true;

    timer2 = $timeout(function() {
        canceler.resolve();
      }, 3000);

    var params = {
           parameter:{
              "comando"     : "ConfigurarEstacion",
              "nameStation" : vm.config.nameStation,
              "nitStation"  : vm.config.nitStation,
              "ciudadStation": vm.config.ciudadStation,
              "dirStation"  : vm.config.dirStation,
              "telStation"  : vm.config.telStation,
              "idStation"   : vm.config.idStation,
              "nameProduct1": vm.config.nameProduct1,
              "nameProduct2": vm.config.nameProduct2
           }
        }
       $http({
            url: "http://192.168.4.1/config_station", 
            method: "GET",
            params:params,
            timeout: canceler.promise
            }).success(function (response) {
                AdminDataService.setDispenserConfiguration(vm.config);
                $scope.test = response;
                vm.configIsBusy = false;
                $timeout.cancel(timer2);
                $scope.$emit('changeNameStation', vm.config.nameStation);
             }).error(function() {
                canceler = $q.defer();
                vm.configIsBusy = false;
                //alert("no hay comunicacion con el servidor");
                 $timeout.cancel(timer2);
             });
    
  };

  $scope.HTTP_ChangePrice = function (){
    vm.configIsBusy = true;

    timer3 = $timeout(function() {
        canceler.resolve();
      }, 3000);

    var params = {
           parameter:{
              "comando": "cambiarPrecio",
              "producto1" : vm.config.price1,
              "producto2"    : vm.config.price2
           }
        }
        //console.log(params);
       $http({
            url: "http://192.168.4.1/change_price", 
            method: "GET",
            params:params,
            timeout:canceler.promise
            }).success(function (response) {
              AdminDataService.setDispenserConfiguration(vm.config);
                $scope.test = response;
                console.log(response);
                vm.configIsBusy = false;
                $timeout.cancel(timer3);
             }).error(function() {
              canceler = $q.defer();
               $timeout.cancel(timer3);
               vm.configIsBusy = false;
               alert("no hay comunicacion con el servidor");
             });
    
  };

  
  $scope.HTTP_getLastSale = function (){
    $state.go('last-sale');
    vm.configIsBusy = true;
    DispenserDataService.getLastSale().then(function(data){
       $scope.ultimaVenta = data;
        vm.configIsBusy = false;
        $scope.$emit('changeSale', data); // going up!
        
    });
      //pedimos datos al servidor periodicamente
      $rootScope.timer = $timeout(function() {
        $scope.HTTP_getLastSale();
      }, 2000);

  };

   $scope.HTTP_getAccumulateSale = function (){
    $state.go('last-sale');
    vm.configIsBusy = true;
    DispenserDataService.getAccumulateSale().then(function(data){
        vm.configIsBusy = false;

        
    });

  };


  $scope.kioskeMode = function () {
    
  }

  return vm;



}