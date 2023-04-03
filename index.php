<?php 
// generate random nick

function randomNick(){
    // List of adjectives to randomly select from
  $adjectives = array("Funky", "Silly", "Crazy", "Zany", "Wacky", "Weird", "Whimsical", "Quirky", "Goofy", "Bizarre");

  // List of nouns to randomly select from
  $nouns = array("Penguin", "Banana", "Sausage", "Llama", "Toaster", "Giraffe", "Hedgehog", "Pickle", "Kangaroo", "Unicorn");

  //$randomWord = $words[array_rand($words)];
  $randomNumber = rand(0, 99);
  //return $randomWord . $randomNumber;

  // Randomly select an adjective and a noun to create a unique username
  $username = $adjectives[array_rand($adjectives)] ."-". $nouns[array_rand($nouns)]."-".$randomNumber;

  // Output the generated username
  return $username;
}

$userName=randomNick();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Platformer</title>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>

    <div style="float:right;">
        Follow this project at Github:
        <a href="https://github.com/tomichGIT/chatGPT-game" target="_blank" rel="noopener">
            <button style="background-color: #24292e; color: #fff; border: none; padding: 10px 20px; border-radius: 5px;">
              View on GitHub
            </button>
          </a><br>
    </div>
      
      <small>Debug:<br></small>
    <div id="debug">
        Debug window
    </div><br>

    <div class="center">
        Just a simple Comunity Made Platformer game made with HTML, JS + ChatGPT<br>
        WAD to Move<br>
        P to turn ON/OFF particle system<br><br>

        <div id="canvas-container">
          <canvas id="gameCanvas"  tabindex="0"></canvas>
        </div>
    </div>

    <div>
        <br>
        <div>Update Player Name</div>
        <div>--------------------------------</div>
      <form action="">
        <input type="text" id="playerName" name="playerName" placeholder="Player Name" value="<?=$userName?>" >
        <input type="button" id="btnSave" value="Save">
      </form>

      <br>
      <div id="topScores">
        <div>Top Scores</div>
        <div>--------------------------------</div>
        <div id="topScoresList">
          <small><i>getting scores...</i></small>
        </div>
      </div>
    </div>


    
    <script src="assets/game.js"></script>
</body>
</html>