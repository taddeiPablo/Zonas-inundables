/* AUTOR : PABLO TADDEI
 * DESDE AQUI MANEJAMOS EL CONSUMO DEL SERVICIO Y EL LLAMADO DE LOS
 * METODOS QUE NOS DEVUELVEN LA DATA.
*/




/**
 * Consumo del servicio que nos traera las
 * comunas. Cod-1002.
 * COD - 1002
 */
function Comunas(callback){
	try{
		var dataInfo;
		console.log("si entro aqui en el servicio");
		var datos = {
			"method":"getNumComunas"	
		};
		
		$.ajax({
			cache: false,
			data : datos,
			url :'http://localhost/ServicioCABA/View.php',
			type :'post',
			dataType:'json',
			timeout: 5000,
			success : function(data){
				callback.call(this,data);
			}
		});	
	}catch(Error){
		alert("Error : cod-1002" + Error);
	}
}

/**
 * Consumo del servicio que nos traera la delimitacion de las
 * comunas y los barrios que la conforman. Cod-1003
 * @param idComuna
 * COD - 1003
 */
function Barrios(idComuna,callback){
	try{
		var datos = {
			"method":"getBarriosComunas",
			"var" : idComuna
		};
	
		$.ajax({
			cache: false,
			data : datos,
			url : 'http://localhost/ServicioCABA/View.php',
			type :'post',
			dataType:'json',
			timeout: 5000,
			success : function(data){
				callback.call(this,data);
			}
		});
	}catch(Error){
		alert("Error : Cod-1003" + Error);
	}
}

/**
 * Consumo del servicio que nos traera las zonas inundables segun
 * el barrio que hayamos elegido. Cod : 1004.
 * @param barrio
 * COD - 1004
 */
function ZonasInundables(barrio,callback){
	try{
		
		var datos = {
			"method" :"getZonasBarrios",
			"var" : barrio
		};
			
		$.ajax({
			cache: false,
			data : datos,
			url :'http://localhost/ServicioCABA/View.php',
			type :'post',
			dataType:'json',
			timeout: 5000,
			success : function(data){
				callback.call(this,data);
			}
		});
	}catch(Error){
		alert("Error : Cod-1004" + Error);
	}
}






