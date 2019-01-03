angular.module('starter')
.service('AdminDataService',function(){
//$scope.ventas;
	var ultimaVenta = [
        {
          price : '2222',
          volume : '2.036'
        },
        {
          price : '22500',
          volume : '3.339'
        },
        {
          price : '3450',
          volume : '2.76'
        },
        {
          price : '14500',
          volume : '2.036'
        }
      ];

      var acumulado = [
        {
          price : '457987',
          volume : '178.098'
        },
        {
          price : '987654',
          volume : '675.098'
        },
        {
          price : '789654',
          volume : '345.876'
        },
        {
          price : '876876',
          volume : '126.765'
        }
      ];


	function getDispenserConfiguration(){//los datos de estado de la maquina autorizacion
		var data = window.localStorage.getItem('CONFIGURATION');
		//var data = JSON.parse(localStorage["CONFIGURATION"]);
		var data1 = JSON.parse(data);
		if(data1){
			//console.log("datos recuperados");
			//console.log(data1);	
			return data1;
		}else{
			return {};
		}
		
	}
//window.localStorage['storageName'] = angular.toJson(data);
	function setDispenserConfiguration(data){
		//window.localStorage.setItem('CONFIGURATION', data);
		window.localStorage['CONFIGURATION'] = angular.toJson(data);
		console.log("datos guardados");
		///console.log(data);
	}

/*
	function setSaleValue(data){

		var ultimaVenta = [
        {
          price : data.price1,
          volume : data.volume1
        },
        {
          price : data.price2,
          volume : data.volume2
        },
        {
          price : data.price3,
          volume : data.volume3
        },
        {
          price : data.price4,
          volume : data.volume4
        }
      ];
	}*/




	return {
		getDispenserConfiguration: getDispenserConfiguration,
		setDispenserConfiguration: setDispenserConfiguration
		/*getSaleValue: function(){
			return ultimaVenta;
		}*/
		/*getAccumulateValue: function(){
			return acumulado;
		},*/
		/*setSaleValue:setSaleValue*/
	};
})