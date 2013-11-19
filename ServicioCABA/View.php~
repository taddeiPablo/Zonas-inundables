<?php
	/*LLAMADAS NECESARIAS PARA EL CORRECTO FUNCIONAMIENTO DEL WEB SERVICES*/
	header('Content-Type: text/javascript; charset=utf8');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Max-Age: 3628800');	
	header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
	include	"dataConnection.php";

	if($_GET['method'] == 'getComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getComunas());
	}elseif($_GET['method'] == 'getzonas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getZonas());
	}elseif($_GET['method'] == 'getNumComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getNumComuna());
	}elseif($_GET['method'] == 'getBarriosComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getBarriosComunas($_GET['var']));
	}elseif($_GET['method'] == 'getZonasBarrios'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getZonasBarrios($_GET['var']));
	}

/*LLAMADAS POST*/

	if($_POST['method'] == 'getComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getComunas());
	}elseif($_POST['method'] == 'getzonas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getZonas());
	}elseif($_POST['method'] == 'getNumComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getNumComuna());
	}elseif($_POST['method'] == 'getBarriosComunas'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getBarriosComunas($_POST['var']));
	}elseif($_POST['method'] == 'getZonasBarrios'){
		$data = DataConnection::getInstance();
		echo json_encode($data->getZonasBarrios($_POST['var']));
	}


?>
