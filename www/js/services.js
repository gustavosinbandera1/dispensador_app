angular.module('starter')

.service('AuthService', function($q, $http,$timeout,  USER_ROLES) {
	var LOCAL_TOKEN_KEY = 'yourTokenKey';
	var username='';
	var isAuthenticated = false;
	var role = '';
	var authToken;
	var actualUser = {};
	var canceler = $q.defer();

	


	function loadUserCredentials(){
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		console.log(token);
		if(token) {
			useCredentials(token);
		}
	}

	function storeUserCredentials(token, roll) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token,roll);
	}

	function useCredentials(token, roll) {
		username = token.split('.')[0];
		isAuthenticated = true;
		authToken = token;
		
		if(roll == 'administrador'){
			role = USER_ROLES.admin;
			//alert(roll);
		}else if(roll == 'islero'){
			role = USER_ROLES.public;
			//alert(roll);
		}
		 // Set the token as header for your requests!
    	//$http.defaults.headers.common['X-Auth-Token'] = token;
	}

	function destroyUserCredentials() {
		authToken = undefined;
		username = '';
		isAuthenticated = false;
		//$http.defaults.headers.common['X-Auth-Token'] = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	}

  var login = function(name,pw,data,authorization) {//users = usuarios registrados vm
		//aqui debemos condicionar de acuerdo al estado de venta del dispensador
//si el sistema esta en apertura solo podra ingresar la persona 
//que la hizo 

	if(authorization == true){//si hay apertura en curso , solo puede ingresar la persona que la inicio
		return $q(function(resolve, reject) {
			//alert("apertura en curso usuario actual: ");
			//alert(actualUser.username);
		  if(name == window.localStorage.getItem('ACTUAL_USER') && pw == window.localStorage.getItem('ACTUAL_PASSWORD') ){
				//si los datos coinciden con el que hizo la apertura
				//buscamos en la base de datos por seguridad
			  for(var i=0; i<data.users.length;i++){
				//console.log(data.users[i].Name.toString());
				if( ((name == data.users[i].Name.toString()) && (pw == data.users[i].Password.toString())) ){
				   storeUserCredentials(name + '.yourServerToken',data.users[i].role);
				   actualUser.username = data.users[i].Name;
				   actualUser.apellido = data.users[i].Apellido;
				   actualUser.telefono = data.users[i].Telefono;
				   actualUser.password = data.users[i].Password;
				   //alert("lo encontre" + data.users[i].Name);
				   //debemos autorizar al dispensador para que siga vendiendo
				   
				   resolve('Login success');
				}
				else{
				}
			  }
           }
		   else{
				reject('apertura en curso');
		   }
		});
	}
	else /*if(authorization == false)*/{//si no hay una apertura en curso
		///alert(actualUser.username);
		return $q(function(resolve, reject) {//alert(name);
			for(var i=0; i<data.users.length;i++){
				//console.log(data.users[i].Name.toString());
				if( ((name == data.users[i].Name.toString()) && (pw == data.users[i].Password.toString())) ){
				   storeUserCredentials(name + '.yourServerToken',data.users[i].role);
				   actualUser.username = data.users[i].Name;
				   actualUser.apellido = data.users[i].Apellido;
				   actualUser.telefono = data.users[i].Telefono;
				   actualUser.password = data.users[i].Password;
				   //alert("lo encontre" + data.users[i].Name);
				   window.localStorage.setItem('ACTUAL_USER',actualUser.username);
				   window.localStorage.setItem('ACTUAL_PASSWORD',actualUser.password);
				   
				   //console.log("usuario en memoria");
				   //console.log(window.localStorage.getItem('ACTUAL_USER'));
				   //console.log(window.localStorage.getItem('ACTUAL_PASSWORD'));
				   resolve('Login success');
				}
				else{
				}
			}
			reject('login failed');
		});
	}
		
 };

	var logout = function() {
		destroyUserCredentials();
	};

	var isAuthorized = function(authorizedRoles) {
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		return (isAuthenticated && authorizedRoles.indexOf(role) != -1);
	};

	var stopSale = function(){
		
		  timer2 = $timeout(function() {
	        canceler.resolve("user cancelled"); //$scope.cancel();
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
                //$scope.test = response;
                console.log(response);
                $timeout.cancel(timer2);
              }).error(function(){
              canceler = $q.defer();
             })
	



	}

	var runSale = function(){
		 timer3 = $timeout(function() {
	        canceler.resolve("user cancelled"); //$scope.cancel();
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
                //$scope.test = response;
                console.log(response);
                $timeout.cancel(timer3);
              }).error(function(){
              canceler = $q.defer();
             })
	}

	loadUserCredentials();

	return {
		login: login,
		logout: logout,
		isAuthorized: isAuthorized,
		runSale: runSale,
		stopSale: stopSale,
		isAuthenticated: function() {return isAuthenticated;},
		username: function() {return username;},
		role: function() {return role;},
		getActualUser: function() {return actualUser;}
	};
})
.service('BirthdayService', ['$q', 'Loki', BirthdayService]);

function BirthdayService($q, Loki) {  
	var _db;
    var _birthdays;
    var _users;
 

	function initDB() {          
    	//var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});  
        _db = new Loki('birthdaysDB',
            {
            	autoload: true,
                autoloadCallback : loadHandler,
             	autosave: true,
                autosaveInterval: 100, // 1 second
                //adapter: adapter
            });
        
    };

    function loadHandler() {
      _users = _db.getCollection('users');
      if (!_users) {
        _users = _db.addCollection('users');
      }
    } 

     

    function getAllBirthdays() {        
        return $q(function (resolve, reject) {
    		var options = {
                birthdays: {
                    proto: Object,
                    inflate: function (src, dst) {
                        var prop;
                        for (prop in src) {
                            if (prop === 'Date') {
                                dst.Date = new Date(src.Date);
                            } else {
                               dst[prop] = src[prop];
                              }
                        }
                    }
                }
            };
    
            _db.loadDatabase(options, function () {
                _birthdays = _db.getCollection('birthdays');
				if (!_birthdays) {
                   _birthdays = _db.addCollection('birthdays');
                }
				resolve(_birthdays.data);
        	});
        });
    };

    function getAllUsers() {        
        return $q(function (resolve, reject) {
	        var options = {};
			_db.loadDatabase(options, function () {
	            _users = _db.getCollection('users');
				if (!_users) {
	            	_users = _db.addCollection('users');
	            }

	            resolve(_users.data);
	        });
    	});
	};
    
    function addBirthday(birthday) {
      _birthdays.insert(birthday);
    };

    function updateBirthday(birthday) {            
      	_birthdays.update(birthday);
    };

    function deleteBirthday(birthday) {
        _birthdays.remove(birthday);
    };

    function addUser(user) {
      _users.insert(user);
    };

    function updateUser(user) {            
      	_users.update(user);
    };

    function deleteUser(user) {
        _users.remove(user);
    };
    


    return {
        initDB: initDB,
       	getAllUsers: getAllUsers,
        getAllBirthdays: getAllBirthdays,
        addUser: addUser,
        updateUser: updateUser,
        deleteUser: deleteUser,
		addBirthday: addBirthday,
        updateBirthday: updateBirthday,
        deleteBirthday: deleteBirthday
    };
}//fin birthdayservice


