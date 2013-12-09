<?php
	/*CONEXION A DATOS*/

	class DataConnection{
		
		private $fileName_comunas = null;
		private $fileName_zonas = null;
		private static $instance;
		
		/***
		 * CONSTRUCTOR DE LA CLASE
		 */
		function __construct(){
			$this->fileName_comunas = "files/comunas.csv";
			$this->fileName_zonas = "files/zonas.csv";
		}
		
		/***
		 * FUNCION UTILIZADA PARA GENERAR SINGLETON
		 */
		public static function getInstance(){
	   		if(!isset(self::$instance)){
	   			$object = __CLASS__;
				self::$instance = new $object;
	   		}
			return self::$instance;
	   	}
		
		/***
		 * FUNCION POR LA CUAL NOS TRAEMOS TODA
		 * LA INFORMACION SOBRE LAS COMUNAS
		 */
		public function getComunas(){
			try{
				$ars = null;
				$fila = 0;
				if(($gestor = fopen($this->fileName_comunas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){	
							$ars[] = array("Barrios" => "$datos[0]","Perimetro"=>"$datos[1]","Area"=>"$datos[2]","Comuna"=>"$datos[3]","Longitude"=>"$datos[4]","Latitude"=>"$datos[5]","GeoJson"=>"$datos[6]");		
						}
					}
					fclose($gestor);	
				}
				return $ars;
			}catch(Exception $ex){
				echo "ERROR : ".$ex;	
			}	
		}
		
		/***
		 *ESTA FUNCION NOS DEVUELVE SOLO LOS BARRIOS DE LA CIUDAD DE BUENOS AIRES
		 * */
		public function getBarriosComunas(){
			try{
				$ars = null;
				$fila = 0;
				$barrios;
				if(($gestor = fopen($this->fileName_comunas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){
							$barrios = explode("- ","$datos[0]");
							$result = count($barrios);
							if($result > 1){
								for ($i=0; $i < $result ; $i++) {
									$ars[] = array("Barrio" => $barrios[$i],"Longitude"=>"$datos[4]","Latitude"=>"$datos[5]");	
								}
							}else{
								$ars[] = array("Barrio" => "$datos[0]","Longitude"=>"$datos[4]","Latitude"=>"$datos[5]");
							}					
						}
					}
					fclose($gestor);	
				}
				return $ars;
			}catch(Exception $ex){
				echo "ERROR :".$ex->getMessage();
			}
		}

		
		/***
		 * ESTA FUNCION NOS DEVUELVE TODAS LAS ZONAS DE ABNEGAMIENTO DE LA CIUDAD DE BUENOS AIRES
		 */
		public function getZonas(){
			try{
				$ars = null;
				$fila = 0;
				if(($gestor = fopen($this->fileName_zonas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){	
							$ars[] = array("Sector" => "$datos[0]","Afectacion"=>"$datos[1]","Geomatry"=>"$datos[2]");		
						}
					}
					fclose($gestor);	
				}
				return $ars;
			}catch(Exception $ex){
				
			}
		}
		
		/**
		 * ESTA FUNCION NOS DEVUELVE EL TRAZADO DE ADNEGAMIENTO DEL BARRIO QUE LE DETERMINEMOS
		 * **/
		public function getZonasBarrios($barrio){
			try{
				$ars = null;
				$fila = 0;
				if(($gestor = fopen($this->fileName_zonas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){
							if($datos[0] == $barrio){
								$ars[] = array("Afectacion"=>"$datos[1]","Geomatry"=>"$datos[2]");
							}	
						}
					}
					fclose($gestor);	
				}
				return $ars;
			}catch(Exception $ex){
				echo "ERROR :".$ex->getMessage();
			}
		}
		
		
		
		
	}
?>