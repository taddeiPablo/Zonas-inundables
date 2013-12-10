/***
 * AUTOR : PABLO TADDEI
 * 
 * ARCHIVO JAVASCRIPT QUE MANEJARA TODO LO RELACIONADO
 * CON LA INTERFAZ GRAFICA DE USUARIO DE LA APP WEB.
 * 
 ******************************************************/

/***
 * OBJECTO. que contiene los mapas de comunas y zonas.
 * utilizamos patron de diseño singleton para el manejo de
 * ambos mapas.
 */
var Mapas = {
	 map_comunas : null,
	 map_zonas : null,
     map1Options : null,
     //map2Options : null,
     _singleton: null,
     getSingleton: function() {
          if (!this._singleton) {
             this._singleton = {
                 setInit : function(lat,lng){
					try{
						map1Options = {
							center: new google.maps.LatLng(lat,lng),
							zoom: 15,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
						map_comunas = new google.maps.Map(document.getElementById("map"), map1Options);
					}catch(Error){
						//alert(Error + 'aqui el error');
					}
				},
				getMapaComunas : function(){
					return map_comunas;
				}
            }
          }
          return this._singleton;
    }
};






$(function(){
	
	cargarClima();
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
	$('#dialog').css('display','none');
	$('#dialog').load('../404.html');
	
	$('#barrios').autocomplete({
		source : function(request, response){
			try{
				getConfiguracion(function(data){
					var url = data.text();
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
							response( $.map(data, function( item ) {
								return { label : item.Barrio,long : item.Longitude,lat : item.Latitude}
							}));
						}
					});
				});
			}catch(Error){
				alert("No se a podido encontrar la informacion solicitada disculpe las molestias !");
			}
		},
		select: function(event,ui){
			try{
				console.log(ui.item.label);
			    var barrio = barrio_zonas(ui.item.label);
			    console.log(barrio);
			    var long = ui.item.long;
			    var lat = ui.item.lat;
			    
			    getConfiguracion(function(data){
			    	var url = data.text();
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
							if(data != null){
								var cargar = Mapas.getSingleton();
								cargar.setInit(lat, long);
								arr = jQuery.map(data, function(item, i){
									var afectacion = item.Afectacion;
									var xml = item.Geomatry,
									xmlDoc = $.parseXML( xml ),
									$xml = $( xmlDoc ),
									$title = $xml.find( "coordinates" );
									var arrayLatLgn = $title.text().split('|||');
									var dataArray = [];	
									for (i = 0, l = arrayLatLgn.length; i < l; i +=1) {
										dataArray[i] = arrayLatLgn[i].split(',');
									}	
									google.maps.event.addDomListener(window, 'load',marcarZonas_de_Inundacion(dataArray,afectacion));
								});
							}else{
								getPopUp_Mensaje();
							}
						}
					});
			    	
			    });
			}catch(Error){
				alert("No se a podido encontrar la informacion solicitada disculpe las molestias !");
			}
		 }
	});
	
	
	
});


/**
 * Inicializo los mapas (comunas, zonas)
 */
function initialize() {
	var inicio = Mapas.getSingleton();
	inicio.setInit(-34.603705,-58.381439);
}



function capitalize(strArray){
	return strArray[0].charAt(0).toUpperCase() + strArray[0].slice(1) + ' ' + strArray[1].charAt(0).toUpperCase() + strArray[1].slice(1);
}

function barrio_zonas(barrio){
	var barrioMayus = barrio.toLowerCase().trim();
	var barrioArray = barrioMayus.split('  ');
	var barrioCapitalize;
	console.log("aqui en la funcion" + barrioArray);
	if(barrioArray.length > 1){
		barrioCapitalize = capitalize(barrioArray);
		console.log("aqui en la funcion" + barrioCapitalize + "2");
		if(barrioCapitalize == 'Villa Urquiza'){
			barrioCapitalize +=  ' - Belgrano';
		}else if(barrioCapitalize == 'Villa Devoto'){
			var barrioC = barrioCapitalize.split('Villa ');
			barrioCapitalize = barrioC[1];
		}
	}else{
		barrioCapitalize = barrioMayus.charAt(0).toUpperCase() + barrioMayus.slice(1);
		if(barrioCapitalize == 'Palermo'){
			barrioCapitalize += ' Viejo';
		}
	}
	return barrioCapitalize;
}




/**
 * Metodo que marca las zonas inundables de los
 * Barrios seleccionados.
 * @param paths
 * @param afectacion
 */
function marcarZonas_de_Inundacion(paths,afectacion){
	try{
		var cargar = Mapas.getSingleton();

		var nivel = null;
		var pathLatLng = [];
		
		for (var i = 0; i < paths.length; i++) {
			pathLatLng[i] = new google.maps.LatLng(paths[i][1],paths[i][0]);
		}
		
		if(afectacion == "Mayor anegamiento"){	
			nivel = '#FF1701';
		}else if(afectacion == "Mediano anegamiento"){
			nivel = '#FFF301';
		}
		
		zonas = new google.maps.Polygon({
			paths: pathLatLng,
			strokeColor: nivel,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: nivel,
			fillOpacity: 0.25
		});

		zonas.setMap(cargar.getMapaComunas());
	}catch(Error){
		alert("Error Cod-1006" + Error);
	}
}

/**
 * Metodo que carga el estado del tiempo y su extendido.
 * Cod : 1007.
 * COD - 1007
 */
function cargarClima(){
	try{
		 var loc = 'ARBA0009';
		 var u = 'c';
		 var query = "SELECT *  FROM weather.forecast WHERE location='" + loc + "' AND u='" + u + "'";
		 var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json';
		
		 $.ajax({
		        url: url,
		        dataType: 'jsonp',
		        cache: true,
		        jsonpCallback: 'wxCallback'
		  });
		 
		 window['wxCallback'] = function(data) {
			 var cont = 0;
			 var info = data.query.results.channel.item.condition;
			 var info1 = data.query.results.channel.item.forecast;
			 /*$(info1).each(function(index){
				 if(cont >= 1){
					 var clone = $('#contenedor').clone();
					 clone.removeAttr('id');
					 clone.find('#imgEx').attr('src',"http://l.yimg.com/a/i/us/we/52/" + this.code + ".gif");
					 clone.find('#diaEx').text(this.day);
					 clone.find('.tempMax').text(this.high);
					 clone.find('.tempMin').text(this.low);
					 $('#alerta').append(clone); 
				 }
				 cont++;
			 });*/
			 $('#imgClima').attr('src',"http://l.yimg.com/a/i/us/we/52/" + info.code + ".gif");
			 $('#estado').text("Estado : " + info.text);
			 $('#temp').text("Temp : " + info.temp);
			 $('#fecha').text("Fecha : " + info.date);
		 };
		 
	}catch(Error){
		alert("Error : Cod-1007" + Error);
	}
}


/**
 * Metodo del Abertura del PopUp
 */
function getPopUp_Mensaje(){
	$("#dialog").dialog({
		position : 'top',
	    title : "Mensaje",  
		modal: true,
	    buttons: {
	        Ok: function() {
	          $( this ).dialog( "close" );
	          $('#barrios').val('');
	          initialize();
	        }
	      }
	 });
}



/**
 *Lectura del archivo de configuracion de la aplicacion
 *lo que recuperamos es la ruta hacia el webservices
 * @param callback
 */
function getConfiguracion(callback){
	try{
		$.post("configurations/webconfig.xml", function (xml) {
			var hijo = $(xml).children();
			callback.call(this,hijo);
		});
	}catch(Error){
		alert("Error : Cod-1005" + Error);
	}
}














