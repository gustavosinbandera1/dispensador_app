angular.module('starter')
.service('DashDataService',function(){

	function getDispenserAuthorization(){//los datos de estado de la maquina autorizacion
		var data = window.localStorage.getItem('AUTHORIZATION');//para apertura y cierre
		if(data){
			if(data=='true'){
				return true;
			}else if(data == 'false'){
				return false;	
			}
			console.log("los datos: ");
			//console.log(data);
		}
		//setDispenserAuthorization(false);
		//return {};
	}

	function setDispenserAuthorization(data){
		window.localStorage.setItem('AUTHORIZATION', data);
		//console.log(data);
	}




	return {
		getDispenserAuthorization: getDispenserAuthorization,
		setDispenserAuthorization: setDispenserAuthorization
		
	};
})