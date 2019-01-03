
angular.module('starter', [
  'ionic', 
  'lokijs', 
  'ngCordova',
  'ngWebsocket'])//'ngMockE2E'//para simular un servidor y sus respuestas



.config(function ($stateProvider, $ionicConfigProvider,$urlRouterProvider, USER_ROLES) {
   $ionicConfigProvider.tabs.position('bottom');
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('factura', {
    url: '/factura',
    templateUrl: 'templates/factura.html',
    controller: 'DashCtrl'
  })
  
  .state('main', {
    url: '/',
    abstract: true,
    templateUrl: 'templates/main.html'
  })
  .state('main.dash', {
    url: 'main/dash',
    views: {
        'dash-tab': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashCtrl'
        }
    }
  })
  .state('main.public', {
    url: 'main/public',
    views: {
        'public-tab': {
          templateUrl: 'templates/public.html'
        }
    }
  })
  .state('last-salePublic', {
    url: '/last-salePublic',
    templateUrl: 'templates/last-salePublic.html',
    controller: 'DashCtrl'
  })
  .state('main.admin', {
    url: 'main/admin',
    views: {
        'admin-tab': {
          templateUrl: 'templates/admin.html',
          controller: 'OverviewController as vm'
        }
    },
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
     
    }
  })

  .state('birthday', {
    url: '/birthday',
    templateUrl: 'templates/birthday.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
     
    }
  })
  .state('user', {
    url: '/user',
    templateUrl: 'templates/user.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
     
    }
  })
  .state('config-dispenser', {
    url: '/config',
    templateUrl: 'templates/config-dispenser.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
    }
  })
  .state('change-price', {
    url: '/price',
    templateUrl: 'templates/change-price.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
    }
  })
   .state('config-station', {
    url: '/station',
    templateUrl: 'templates/config-station.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
    }
  })
   .state('last-sale', {
    url: '/last-sale',
    templateUrl: 'templates/last-sale.html',
    controller: 'OverviewController as vm',
    data: {
      authorizedRoles: [USER_ROLES.superadmin,USER_ROLES.admin],
    }
  })
 
  
  // Thanks to Ben Noblet!
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("main.dash");
  });
})



.run(function ($rootScope,$timeout,$state, AuthService, AUTH_EVENTS,BirthdayService, EVENTS) {
 
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if ('data' in next && 'authorizedRoles' in next.data) {
      //este es el rol que requiere dicho estado
      var authorizedRoles = next.data.authorizedRoles;
      
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
    
     if(next.name == 'main.admin' && fromState.name == 'last-sale') {
         $timeout.cancel($rootScope.timer);
     }
     if(next.name == 'main.dash' && fromState.name == 'last-salePublic') {
         $timeout.cancel($rootScope.timer);
     }


    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {//si el proximo estado al que va no es login y no esta logeado
        event.preventDefault();
        $state.go('login');
      }
    }

    //cuando cambiemos de estado debemos actualizar la base de datos

  });

})


.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
      StatusBar.hide();
      ionic.Platform.fullScreen();
    }
  });
})


 .run(function ($ionicPlatform, $websocket, $rootScope){
    
    /*var ws = $websocket.$new('ws://localhost:3000'); // instance of ngWebsocket, handled by $websocket service

        ws.$on('$open', function () {
            console.log('Oh my gosh, websocket is really open! Fukken awesome!');

            ws.$emit('ping', 'hi listening websocket server'); // send a message to the websocket server

            var data = {
                level: 1,
                text: 'ngWebsocket rocks!',
                array: ['one', 'two', 'three'],
                nested: {
                    level: 2,
                    deeper: [{
                        hell: 'yeah'
                    }, {
                        so: 'good'
                    }]
                }
            };

            ws.$emit('pong', data);
        });


        ws.$on('pong', function (data) {
            console.log('The websocket server has sent the following data:');
            console.log(data);

            ws.$close();
        });

        ws.$on('$close', function () {
            console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
        });*/
  })