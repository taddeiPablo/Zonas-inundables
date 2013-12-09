/* AUTOR : PABLO TADDEI
 * DESDE AQUI MANEJAMOS EL CONSUMO DEL SERVICIO Y EL LLAMADO DE LOS
 * METODOS QUE NOS DEVUELVEN LA DATA.
*/

var informacion = null;

/**
 * Consumo del servicio que nos traera la delimitacion de las
 * comunas y los barrios que la conforman. Cod-1003
 * @param idComuna
 * COD - 1003
 */
function Barrios(ServicesUrl,callback){
	try{
		var datos = {
			"method":"getBarriosComunas"
		};
	
		$.ajax({
			cache: false,
			data : datos,
			url : 'http://localhost/ServicioCABA/view.php',
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
function ZonasInundables(ServicesUrl,barrio,callback){
	try{
		
		var datos = {
			"method" :"getZonasBarrios",
			"var" : barrio
		};
			
		$.ajax({
			cache: false,
			data : datos,
			url : 'http://localhost/ServicioCABA/view.php',
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

/**
 *Lectura del archivo de configuracion de la aplicacion
 *lo que recuperamos es la ruta hacia el webservices
 * @param callback
 */
function getConfiguracion(callback){
	try{
		$.post("../configurations/webconfig.xml", function (xml) {
			var hijo = $(xml).children();
			callback.call(this,hijo);
		});
	}catch(Error){
		alert("Error : Cod-1005" + Error);
	}
}





