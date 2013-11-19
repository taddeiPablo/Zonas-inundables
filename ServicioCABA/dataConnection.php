<?php
	/*CONEXION A DATOS*/

	class DataConnection{
		
		private $fileName_comunas = null;
		private $fileName_zonas = null;
		private static $instance;
		
		/***
		 * 
		 */
		function __construct(){
			$this->fileName_comunas = "files/comunas.csv";
			$this->fileName_zonas = "files/zonas.csv";
		}
		
		/***
		 * 
		 */
		public static function getInstance(){
	   		if(!isset(self::$instance)){
	   			$object = __CLASS__;
				self::$instance = new $object;
	   		}
			return self::$instance;
	   	}
		
		/***
		 * 
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
		 * 
		 * */
		public function getNumComuna(){
			try{
				$ars = null;
				$fila = 0;
				if(($gestor = fopen($this->fileName_comunas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){	
							$ars[] = array("Comuna"=>"$datos[3]");		
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
		 * 
		 * */
		public function getBarriosComunas($numComuna){
			try{
				$ars = null;
				$fila = 0;
				if(($gestor = fopen($this->fileName_comunas, "r")) != FALSE){
					while(($datos = fgetcsv($gestor,1000,",")) != FALSE){
						$numero = count($datos);
						$fila++;
						if($fila > 1){
							if($datos[3] == $numComuna){
								$ars[] = array("Barrios" => "$datos[0]","Longitude"=>"$datos[4]","Latitude"=>"$datos[5]","GeoJson"=>"$datos[6]");		
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
		 * 
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
		
		/****/
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