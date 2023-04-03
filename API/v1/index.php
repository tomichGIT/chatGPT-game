<?php


  class ScoreManager {
    private $scoreFile;

    function __construct($scoreFile) {
      $this->scoreFile = $scoreFile;
    }

    // ordena los puntajes de mayor a menor
    private function sortByScore($a, $b) {
      if ($a["score"] == $b["score"]) {  return 0;   }
      return ($a["score"] > $b["score"]) ? -1 : 1;
    }

    private function sanitizeNick($nick){
        // Convertir la cadena a mayúsculas
        $nick = strtoupper($nick);
       

        // Reemplazar los caracteres con acentos por su letra equivalente
        $nick = strtr($nick, "áéíóúüñäëïöç", "AEIOUUNAEIOC");
        
        // Eliminar todos los caracteres no alfabéticos ni numéricos, excepto -, [ y ]
        $nick = preg_replace("/[^A-Z0-9\-\[\]]/", "", $nick);
        // // Eliminar todos los caracteres no alfabéticos ni numéricos
        // $nick = preg_replace("/[^A-Z0-9]/", "", $nick); 

        // Limitar la cadena a un máximo de 10 caracteres
        $nick = substr($nick, 0, 20);
        return $nick;
    }

    function getScores() {
      //echo "gettingScores";

      if (!file_exists($this->scoreFile)) {
        // Si el archivo no existe, lo creamos y establecemos valores predeterminados
        $A_scores = [];
        $scoresJson = json_encode($A_scores, JSON_PRETTY_PRINT);
        file_put_contents($this->scoreFile, $scoresJson);
      } else {
        $scoresJson = file_get_contents($this->scoreFile);
        $A_scores = json_decode($scoresJson, true);
        // los ordeno en el insert
        //usort($A_scores, array($this, "sortByScore")); // los ordena de mayor a menor
      }
      return $A_scores;
    }

    function addScore() {
      //echo "adding Scores";

      /*
        The FILTER_SANITIZE_NUMBER_INT filter will strip all characters except digits (0-9) from the string. 
        Then, the max() function is used to make sure that the result is not negative. 
        Finally, the (int) cast is used to convert the value to an integer
       */
      $score = $_POST["score"]??0;
      $score = filter_var($score, FILTER_SANITIZE_NUMBER_INT);
      $score = max(0, (int) $score);

      $nick = $this->sanitizeNick($_POST["nick"]);

      // Al igual que en los Arcades de los 80s, si el nick esta repetido se actualiza el puntaje mayor, y queda registro de la NUEVA IP, se borra la anterior.
      //$ip = $_SERVER['REMOTE_ADDR'];
      $ip = ($_SERVER['REMOTE_ADDR']=="::1")?"localHost":$_SERVER['REMOTE_ADDR'];
      // Para debug cuando estoy en localHost puedo usar HTTP_X_FORWARDED_FOR en POSTMAN para probar distintas IP.
      if($ip=="localHost"){
        $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
      }

      $date = date("Y-m-d H:i:s");

      $A_scores = $this->getScores();
      if (!is_array($A_scores)) {
        $A_scores = array();
      }

      $found = false;
      //foreach ($A_scores as &$scoreData) { // complex query, i will use keys
      foreach ($A_scores as $key => $scoreData) {
        if ($scoreData["nick"] == $nick) {

          // Si se encuentra un puntaje para el nick, actualizar si el nuevo puntaje es mayor
          if ($score > $scoreData["score"]) {
            $A_scores[$key]["score"] = $score;
            $A_scores[$key]["date"] = $date;
          }
          // //echo "encontre un nick igual";
          // $A_scores[$key]["score"] = $score;
          // $A_scores[$key]["date"] = $date;
          $found = true; 
          break;
        }
      }
      if (!$found) {
        $newScore = array("nick" => $nick, "date" => $date, "score" => $score, "ip" => $ip);
        $A_scores[] =$newScore;
      }
      usort($A_scores, array($this, "sortByScore")); // los ordena de mayor a menor
      
      // Limitar el tamaño del arreglo de puntajes a 10
      $A_scores = array_slice($A_scores, 0, 10);

      $scoresJson = json_encode($A_scores, JSON_PRETTY_PRINT);
      file_put_contents($this->scoreFile, $scoresJson);
    }

    function clearScores() {
      //echo "Clear Scores";

      file_put_contents($this->scoreFile, "[]");
    }
  }

  class GameManager {
    private $gameDataFile;

    function __construct($gameDataFile) {
      $this->gameDataFile = $gameDataFile;
    }

    function getGameData() {
      //echo "get GameData";
      
      if (!file_exists($this->gameDataFile)) {
        // Si el archivo no existe, lo creamos y establecemos valores predeterminados
        $A_gameData = $this->emptyStruct();
        $gameDataJson = json_encode($A_gameData, JSON_PRETTY_PRINT);
        file_put_contents($this->gameDataFile, $gameDataJson);
      } else {
        $gameJson = file_get_contents($this->gameDataFile);
        $A_gameData = json_decode($gameJson, true);
      }
      return $A_gameData;
    }

    function updateGameData() {
     // echo "update GameData";
      
      $ip = ($_SERVER['REMOTE_ADDR']=="::1")?"localHost":$_SERVER['REMOTE_ADDR'];
      // Para debug cuando estoy en localHost puedo usar HTTP_X_FORWARDED_FOR en POSTMAN para probar distintas IP.
      if($ip=="localHost"){
        $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
      }


      $A_gameData = $this->getGameData();
      if (!is_array($A_gameData)) {
        $A_gameData = $this->emptyStruct();
      }

      $A_gameData["playCount"]["total"]++; // increment total play count

      if (!isset($A_gameData["playCount"]["byIP"][$ip])) {
        $A_gameData["playCount"]["byIP"][$ip] = 0;
      }
      $A_gameData["playCount"]["byIP"][$ip]++;  // increment play count for this IP
      // Update the last played datetime for the current IP
      $A_gameData["lastPlayed"][$ip] = date("Y-m-d H:i:s");

      // Update the last update datetime
      $A_gameData["lastUpdate"] = date("Y-m-d H:i:s");

      $gameDataJson = json_encode($A_gameData, JSON_PRETTY_PRINT);
      file_put_contents($this->gameDataFile, $gameDataJson);
    }

    function clearGameData(){
      $A_gameData = $this->emptyStruct();
      $gameDataJson = json_encode($A_gameData, JSON_PRETTY_PRINT);
      file_put_contents($this->gameDataFile, $gameDataJson);
    }

    private function emptyStruct(){
      return array(
        "playCount" => array(
          "total" => 0,
          "byIP" => array()
        ),
        "lastUpdate" => null
      );
    }

  }

 //echo "hola, post es:".$A_POST["a"];

 

  // Obteniendo datos en $A_POST en vez de $_POST porque se envía como JSON
  $requestMethod = $_SERVER["REQUEST_METHOD"]; // {GET, POST, PUT, PATCH, DELETE}
  if($requestMethod != "POST"){
    return;
  }
  $json = file_get_contents('php://input'); // json crudo
  // hago un UPDATE del SUPERGLOBAL $_POST con el JSON recibido para usar desde las clases
  $_POST = json_decode($json, true); // array asociativo
  // intento recibir vía request o vía JSON.
  $action = $_REQUEST["a"] ?? $_POST["a"];

  
  //eDebug($A_POST);

  if(empty($action)){
    return;
  }
  
  $scoreManager = new ScoreManager("../../db/db_scores.json");  // puntajes de la partida
  $gameManager = new GameManager("../../db/db_game.json");      // configuración de la partida

  switch($action){
    
      /// ----------------- GAME SCORES ----------------- ///
    case "getScores":
      $scores = $scoreManager->getScores();
      echo json_encode($scores);
    break;
    case "addScore":
      $scoreManager->addScore();
      $scores = $scoreManager->getScores();

      echo json_encode($scores);

      $gameData = $gameManager->updateGameData();

    break;
    case "clearScores":
      $scoreManager->clearScores();
      $scores = $scoreManager->getScores();
      echo json_encode($scores);
      break;

      /// ----------------- GAME DATA ----------------- ///
    case "getGameData":
      $gameData = $gameManager->getGameData();
      echo json_encode($gameData);
    break;
    case "updateGameData":  // incrementa el número de jugadas
      $gameData = $gameManager->updateGameData();
      $gameData = $gameManager->getGameData();
      echo json_encode($gameData);
    break;
    case "clearGameData":
      $gameManager->clearGameData();
      $gameData = $gameManager->getGameData();
      echo json_encode($gameData);
    break;
    
  }

  exit;



  // // Obtener los puntajes actuales
  // $scores = $scoreManager->getScores();
  // eDebug($scores, "Puntajes actuales");

  // // Agregar un nuevo puntaje
  // $date=date("Y-m-d H:i:s");
  // $score="100";
  // $nick="player1";
  // $scoreManager->addScore($nick, $score);

  // // Obtener los puntajes actuales
  // $scores = $scoreManager->getScores();
  // eDebug($scores, "Puntaje Nuevo");

  // // Eliminar todos los puntajes
  // //$scoreManager->clearScores();



  function eDebug($var, $msg="") {
      if($msg) echo "<h3>$msg</h3>";
      echo "<pre>";
      print_r($var);
      echo "</pre>";
  }
?>