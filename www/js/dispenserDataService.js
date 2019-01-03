angular.module('starter')
.service('DispenserDataService', function($http,$q,$log,$timeout) {
	return {

		
		getLastSale : function(){
			var deferred = $q.defer();
			var promise = deferred.promise;

			timer1 = $timeout(function() {
      		  deferred.resolve();
     		}, 2000);

			var params = {
             parameter:{
             "comando"   : "UltimaVenta"
             }
            }
 		
	        $http({
	            url: "http://192.168.4.1/last-sale", 
	            method: "GET",
	            params:params,
	            timeout: deferred.promise
	            }).success(function (data,status, header, config) {
	            	console.log("datos dentro de servicio");
	                console.log(data);
	              
	               //convertimos json a array
                    var result = [];
                    for(var i in data){
                     result.push([i, data[i]]);
                 	 }	
	                if (status == 200) {
						deferred.resolve(data);
					}
					$timeout.cancel(timer1);
	             })
	            .error(function (data, status, header, config) {
				deferred.reject('Error: ' + data);
				console.log("Error al realizar la peticion.");
				deferred = $q.defer();
				$timeout.cancel(timer1);
			});

	        promise.success = function(fn) {
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn) {
				promise.then(null, fn);
				return promise;
			}
		  return promise;
		},

		getAccumulateSale: function(){
			var deferred = $q.defer();
			var promise = deferred.promise;

			var params = {
             parameter:{
             "comando"   : "getAccumulateValue"
             }
            }
 		
	        $http({
	            url: "http://192.168.4.1/accumulate-sale", 
	            method: "GET",
	            params:params
	            }).success(function (data,status, header, config) {
	            	console.log("datos dentro de servicio");
	                console.log(data);

	               //convertimos json a array
                    var result = [];
                    for(var i in data){
                     result.push([i, data[i]]);
                 	 }	
	                if (status == 200) {
						deferred.resolve(data);
					}
	             })
	            .error(function (data, status, header, config) {
				deferred.reject('Error: ' + data);
				console.log("Error al realizar la peticion.");
			});

	        promise.success = function(fn) {
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn) {
				promise.then(null, fn);
				return promise;
			}
		  return promise;
		}
	};
})

