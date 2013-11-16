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
     map2Options : null,
     _singleton: null,
     getSingleton: function() {
          if (!this._singleton) {
             this._singleton = {
                 setInit : function(lat,lng){
					try{
						map1Options = {
							center: new google.maps.LatLng(lat,lng),
							zoom: 12,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
						map_comunas = new google.maps.Map(document.getElementById("map1"), map1Options);
    
						map2Options = {
							center: new google.maps.LatLng(lat, lng),
							zoom: 14,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
						map_zonas = new google.maps.Map(document.getElementById("map2"), map2Options);
					}catch(Error){
						alert(Error + 'aqui el error');
					}
				},
				getMapaComunas : function(){
					return map_comunas;
				},
				getMapaZonas : function(){
					return map_zonas;
				}
            }
          }
          return this._singleton;
    }
};






$(function(){
	
	cargarComunas();
	
	cargarClima();
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
	$("select").change(function(){
		var valor = $(this).children(":selected").val();
		var ele = valor.split('Comuna');
		var idComuna = ele[1];
		cargarBarrios(idComuna);
	});
	
	$("#ul1").on('click','li',function(){
		var valor = $(this).text();
		cargarZonasInundacion(valor);
	});
	
	$('#dialog').css('display','none');
	$('#dialog').load('../404.html');
});


/**
 * Inicializo los mapas (comunas, zonas)
 */
function initialize() {
	var inicio = Mapas.getSingleton();
	inicio.setInit(-34.603705,-58.381439);
}


/**
 * Consumo del servicio que nos traera las
 * comunas. Cod-1002.
 * COD - 1002
 */
function cargarComunas(){
	try{
		Comunas(function(data){
		 	arr = jQuery.map(data, function(item, i){
				var option = $('#op1').clone();
				option.removeAttr('id');
				option.text("Comuna     "+item.Comuna+"");
				$("#selectable").append(option);
			});
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
function cargarBarrios(idComuna){
	try{
		Barrios(idComuna,function(data){
			arr = jQuery.map(data, function(item, i){
				var str = item.Barrios.search("-");
				if(str != -1){
					getLista(item.Barrios);
				}else{
					$('#ul1 li').remove();
					var li = $('#template').clone();
					li.removeAttr('id');
					li.append(item.Barrios);
					$('#ul1').append(li);
				}
					
				var dataArray = [];
				var cont = 0;
				var obj = jQuery.parseJSON(item.GeoJson);

				$.each(obj.coordinates, function( key, value ) {
					$.each(value,function(key1,value1){
						$.each(value1,function(key2,value2){
							dataArray[cont] = {'latitude':value2[1],'longitude':value2[0]};
							cont++;
						});
					});
				});
				google.maps.event.addDomListener(window, 'load',marcarPosicionComuna(item.Latitude,item.Longitude,dataArray));
			});
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
function cargarZonasInundacion(barrio){
	try{
		
		var barrio = barrio_zonas(barrio);
		
		ZonasInundables(barrio,function(data){
			if(data != null){
				arr = jQuery.map(data, function(item, i){
					var afectacion = item.Afectacion;
					var xml = item.Geomatry,
					xmlDoc = $.parseXML( xml ),
					$xml = $( xmlDoc ),
					$title = $xml.find( "coordinates" );
					var arrayLatLgn = $title.text().split('|||');
					var dataArray = [];
					console.log(arrayLatLgn);	
					for (i = 0, l = arrayLatLgn.length; i < l; i +=1) {
						dataArray[i] = arrayLatLgn[i].split(',');
					}
							
					google.maps.event.addDomListener(window, 'load',marcarZonas_de_Inundacion(dataArray,afectacion));
				});
			}else{
				getPopUp_Mensaje();
			}
		});
	}catch(Error){
		alert("Error : Cod-1004" + Error);
	}
}


function capitalize(strArray){
	return strArray[0].charAt(0).toUpperCase() + strArray[0].slice(1) + ' ' + strArray[1].charAt(0).toUpperCase() + strArray[1].slice(1);
}

function barrio_zonas(barrio){
	var barrioMayus = barrio.toLowerCase().trim();
	var barrioArray = barrioMayus.split(' ');
	var barrioCapitalize;
	
	if(barrioArray.length > 1){
		barrioCapitalize = capitalize(barrioArray);
	
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
 *armado de la lista de barrios. Cod : 100. 
 * @param elementos
 * COD - 100
 */
function getLista(elementos){
	try{
		$('#ul1 li').remove();
		var barriosArray = elementos.split("-");
		for (i = 0, l = barriosArray.length; i < l; i +=1) {
			var li = $('#template').clone();
			li.removeAttr('id');
		    li.text(barriosArray[i]);
			$('#ul1').append(li);
		}
	}catch(Error){
		alert("Error : Cod-100" + Error);
	}
}

/**
 * Metodo que dibuja las posiciones de las comunas
 * en el primer mapa. Cod : 1005.
 * @param lat
 * @param log
 * @param paths
 * COD - 1005
 */
function marcarPosicionComuna(lat,log,paths){
	try{
		var carga = Mapas.getSingleton();
		carga.setInit(lat,log);
		
		var pathLatLng = [];
		   
		 for (var i = 0; i < paths.length; i++) {
			pathLatLng[i] = new google.maps.LatLng(paths[i].latitude,paths[i].longitude);
		}
			
		comuna = new google.maps.Polygon({
			paths: pathLatLng,
			strokeColor: '#0F7EE6',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#0F7EE6',
			fillOpacity: 0.35
		});

		comuna.setMap(carga.getMapaComunas());
	}catch(Error){
		alert("Error Cod-1005" + Error);
	}
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

		zonas.setMap(cargar.getMapaZonas());
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
			 $(info1).each(function(index){
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
			 });
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
	        }
	      }
	 });
}

















