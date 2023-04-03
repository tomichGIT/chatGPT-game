
    var images = {};
        
    let gameOver = false;
    let highScore = 0; // Add highScore variable here
    let animationFrame = 0; // Set the initial value of animationFrame to 0
    let frameRate="";
    let tf_particleSystem=true;

    
    // variables de GameData y API
    const btnSave = document.getElementById('btnSave');
    const playerNameInput = document.getElementById('playerName');
    let playerNick = playerNameInput.value;


    const canvas = document.getElementById('gameCanvas');    
    const canvasContainer = document.getElementById('canvas-container');
    canvas.focus(); // focus on canvas to start playing.
    let ctx;


    let platforms = [];
    let coins = [];
    const keys = {}; // keboard keys
    


    // Array of image Objects to create and Load
    var imagesToLoad = [
        { name: 'backgroundImage', src: 'assets/imgs/gamebackground2.png' }, 
        { name: 'backgroundImage2', src: 'assets/imgs/gamebackground2.png' }, 
        { name: 'characterImage1', src: 'assets/imgs/character1.png' }, 
        { name: 'characterImage2', src: 'assets/imgs/character2.png' }, 
        { name: 'floorImage', src: 'assets/imgs/lavafloor.png' }, 
        { name: 'explosionImage', src: 'assets/imgs/T-fireexplosion.png' } // Add explosionImage variable here
    ];
    
    
    
    const divDebug = document.getElementById('debug');
    
    // elementos de debug:
    let cantPlataformas = 0;
    let cantMonedas = 0;
     

    // Set the canvas width and height to the size of the browser window or defined in CSS
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;

    // elementos de GameData
    let lastUpdate; // fecha de último juego TOTAL
    let playCounts=0; // cantidad de veces que se jugó total
    let highScoreEver=0; // puntaje más alto total
    
  
   
    
   
    
    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        update: function () {
            this.x = player.x - this.width / 2;
    
            // Ensure the camera doesn't move too far to the left
            if (this.x < 0) {
                this.x = 0;
            }
        },
    };
    
    const player = {
        nick: playerNick,
        x: 50,
        y: canvas.height - 150 - 50, // Subtract 50 (player's height) to make the player start on the first platform
        width: 30,
        height: 50,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        speed: 4,
        jumpHeight: 12,
        score: 0,
        explosionCounter: 0, // Add explosionCounter property here
        currentImage: null,
        // steps of running player
        playerImageFrame1: null,//images['characterImage1'],    // 2 foot
        playerImageFrame2: null,//images['characterImage2']     // 1 foot
    };
    

    
    class Platform {
        constructor(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
        }
    
        draw() {
            ctx.fillStyle = this.color;
    
            // Set the radius for the rounded edges
            const radius = 10;
    
            // Create a custom path for the rounded rectangle
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y);
            ctx.lineTo(this.x + this.width - radius, this.y);
            ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius);
            ctx.lineTo(this.x + this.width, this.y + this.height - radius);
            ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height);
            ctx.lineTo(this.x + radius, this.y + this.height);
            ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - radius);
            ctx.lineTo(this.x, this.y + radius);
            ctx.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
            ctx.closePath();
    
            ctx.fill();
    
            // Add a white border to the platform
            ctx.strokeStyle = 'white'; // Set the border color to white
            ctx.lineWidth = 2; // Set the border width to 2 pixels
            ctx.stroke(); // Draw the border
        }
    }
    
    class Coin {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.rotation = 0; // Add rotation property
        }
    
        draw() {
            // Update the rotation
            this.rotation += 0.1;
            if (this.rotation >= Math.PI * 2) {
                this.rotation = 0;
            }
    
            // Calculate the current width of the ellipse based on the rotation value
            const currentWidth = this.radius * (1 - 0.5 * Math.abs(Math.sin(this.rotation)));
    
            // Draw the coin as an ellipse with varying width and the same yellow color
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(
                this.x - camera.x,
                this.y,
                currentWidth,
                this.radius,
                0,
                0,
                Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
        }
    }
    

    
    // ----------------------------------- Start Listeners -----------------------------------
    canvas.addEventListener('keydown', (event) => { 
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
        keys[event.code] = true;
    });
    
    
    canvas.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });
    
    canvas.addEventListener('keydown', (event) => {
        if (event.code === 'KeyN') {
            //console.log("key n");
            //switchLevel();
        }
    });

    canvas.addEventListener('keyup', (event) => {
        //console.log("code: ",event.code);
        if( event.code === 'KeyP') {
            //console.log("key P");
            tf_particleSystem=!tf_particleSystem;
        }
    });
    
    canvas.addEventListener('click', (event) => {
        if (gameOver) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
    
            const buttonX = canvas.width / 2 - 60;
            const buttonY = canvas.height / 2 + 20;
            const buttonWidth = 120;
            const buttonHeight = 40;
    
            if (
                x >= buttonX &&
                x <= buttonX + buttonWidth &&
                y >= buttonY &&
                y <= buttonY + buttonHeight
            ) {
                resetGame();
            }
        }
    });

    // ----------------------------------- End Listeners -----------------------------------



function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

 
const updateDebug =function (){
    cantPlataformas=platforms.length;
    cantMonedas=coins.length;
    
    divDebug.innerHTML=`- Plataforms: ${cantPlataformas} <br>
    - Coins: ${cantMonedas} <br>
    - Explosion: ${player.explosionCounter} <br>
    - particles: ${particles.length} <br>
    - framerate: ${frameRate} <br>
    ------------------------- <br>
    - lastUpdate: ${lastUpdate} <br>
    - playCounts: ${playCounts} <br>
    `;
}   


const loadImages = () => {
    var imagesLoaded = 0;
    var numImages = imagesToLoad.length;
  
    for (var i = 0; i < numImages; i++) {
      var imageName = imagesToLoad[i].name;
      var image = new Image();
      image.onload = function() {
        imagesLoaded++;
        if (imagesLoaded === numImages) {

            player.nick = playerNick;

            // si cargo todo actualizo valores del player y arranco el loop
            player.playerImageFrame1=images['characterImage1'];
            player.playerImageFrame2=images['characterImage2'];
            player.currentImage=player.playerImageFrame1;
            gameLoop(); // Start the game loop startGame()

            console.log(player);
        }
      };
      image.src = imagesToLoad[i].src;
      images[imageName] = image;
    }
}


var max = 60; // 60 fps
var speed=3;
var size=10;
var particles = [];
//The class we will use to store particles. It includes x and y
//coordinates, horizontal and vertical speed, and how long it's
//been "alive" for.
// type: "lava"/"character"/etc
function Particle(x, y, xs, ys, type) {
    this.type=type;
    this.x=x;
    this.y=y;
    this.xs=xs;
    this.ys=ys;
    this.life=0;
  }


function generatePlatforms() {
    // Check if the last platform in the array is close enough to the camera's right edge
    if (platforms.length === 0 || platforms[platforms.length - 1].x - camera.x < canvas.width - 200) {
        const platformWidth = 200;
        const platformHeight = 20;
        const platformColor = getRandomColor(); // Use the random color function here
        let minHeight = canvas.height / 2;
        let maxHeight = canvas.height - 150;
        const minGap = 50;
        const maxGap = 200;

        // Calculate the x position of the new platform
        const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        const xPos = platforms.length === 0 ? player.x + randomGap : platforms[platforms.length - 1].x + platformWidth + randomGap;

        let yPos;
        if (platforms.length === 0) {
            yPos = player.y;
        } else {
            // Calculate a random y position based on the last platform's height
            const lastPlatformHeight = platforms[platforms.length - 1].y;
            const reachableMinHeight = Math.max(minHeight, lastPlatformHeight - player.jumpHeight * 2);
            const reachableMaxHeight = Math.min(maxHeight, lastPlatformHeight + player.jumpHeight * 2);
            yPos = Math.floor(Math.random() * (reachableMaxHeight - reachableMinHeight + 1) + reachableMinHeight);
        }

        // Create a new platform and add it to the platforms array
        platforms.push(new Platform(xPos, yPos, platformWidth, platformHeight, platformColor));

        // Set the player's position on the first platform
        if (platforms.length === 1) {
            setPlayerPositionOnPlatform(platforms[0]);
        }

        // Call generateCoins() after adding the new platform to the array
        generateCoins();
    }
}


function handlePlayerMovement() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
        player.velocityX = -player.speed; // Update player.velocityX
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
        player.velocityX = player.speed; // Update player.velocityX
    } else {
        player.velocityX = 0; // Set player.velocityX to 0 if player is not moving
    }

    // Prevent the player from going off the screen to the left
    if (player.x < 0) {
        player.x = 0;
    }
}

function handlePlayerVerticalMovement() {
    // Gravity
    player.velocityY += 0.5; // Gravity strength
    player.y += player.velocityY;

    // Check if the player is on the ground or a platform
    let onPlatform = false;
    const floorHeight = 50;
    if (player.y + player.height >= canvas.height - floorHeight) {
        onPlatform = true;
        player.y = canvas.height - player.height - floorHeight;
        player.velocityY = 0;
    }
    platforms.forEach((platform) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y - 5 &&
            player.y + player.height <= platform.y + platform.height
        ) {
            onPlatform = true;
            player.y = platform.y - player.height;
            player.velocityY = 0; // Reset player's vertical velocity when on a platform
        }
    });

        // Update player.isJumping value based on player's position relative to the platforms
//        player.isJumping = !onPlatform;

    // Jumping
    if (
        (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) &&
        onPlatform
    ) {
        player.velocityY = -player.jumpHeight;
    }
}


function detectPlatformCollision() {
    const prevY = player.y - player.velocityY;

    let onPlatform = false;

    // probablemente quiera chequear solo llas plataformas cercanas...
    // acá esta chequeando todas las plataformas

    platforms.forEach((platform) => {
        // Check vertical collision first
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x
        ) {
            // Collision on the top side of the platform
            if (
                prevY + player.height <= platform.y &&
                player.y + player.height >= platform.y &&
                player.velocityY >= 0
            ) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                onPlatform = true;
            }
            // Collision on the bottom side of the platform
            else if (
                prevY >= platform.y + platform.height &&
                player.y <= platform.y + platform.height
            ) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }

        // Check horizontal collision after vertical collision
        if (
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height
        ) {
            // Collision on the left side of the platform
            if (
                player.x + player.width >= platform.x &&
                player.x + player.width <= platform.x + 5
            ) {
                player.x = platform.x - player.width;
            }
            // Collision on the right side of the platform
            else if (
                player.x <= platform.x + platform.width &&
                player.x >= platform.x + platform.width - 5
            ) {
                player.x = platform.x + platform.width;
            }
        }
    });

    if (onPlatform) {
        player.isJumping = false;
    }
}

function detectCoinCollision() {
    coins.forEach((coin, index) => {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const distance = Math.sqrt((playerCenterX - coin.x) ** 2 + (playerCenterY - coin.y) ** 2);
        if (distance < player.width / 2 + coin.radius) {
            player.score += 1;
            coins.splice(index, 1);
        }
    });
}

function checkGroundCollision() {
    const floorHeight = 50;

    if (player.y + player.height > canvas.height - floorHeight) {
        player.y = canvas.height - player.height - floorHeight;
        player.velocityY = 0;
    }
}

function resetGame() {

    sendHighScore(player);

    gameOver = false;
    player.x = 50;
    player.y = canvas.height - 150 - 50;
    player.velocityX = 0;
    player.velocityY = 0;
    player.score = 0;
    camera.x = 0;
    platforms.length = 0;
    coins.length = 0;
    player.explosionDrawn = false; // Add this line here to reset the explosionDrawn property when the game is reset
    player.explosionCounter = 0; // Reset the explosionCounter when the game is reset


    particles=[]; // reset particles
    platforms=[]; // reset platforms
    coins=[]; // reset coins
    
    generatePlatforms();

    // //Cycle through all the particles to remove them
    // for (i=0; i<particles.length; i++) {
    //     particles.splice(i, 1);
    //     i--;
    // }
}

function lavaParticles(){

    //ctx.globalCompositeOperation="xor";
    drawParticles("lava");

    // if particle system is off, don't draw particles
    if(!tf_particleSystem){ return; }

    //Adds ten new particles every frame
    for (var i=0; i<10; i++) {

        // Generate a random X position anywhere on the canvas, and a random starting Y position at the bottom of the canvas
        var x = Math.random() * canvas.width;
        var y = canvas.height - Math.floor(Math.random() * 50);
        
        //Adds a particle at the characters position, with random horizontal and vertical speeds
        var p = new Particle(x, y, (Math.random()*2*speed-speed)/2, 0-Math.random()*2*speed/4, "lava");
        particles.push(p);
    }

    
    //ctx.globalCompositeOperation="source-over"; // es el standar
}

//type "lava", "character", "explosion", "etc"
function drawParticles(tipo){


    const psize=size/2;
    //Cycle through all the particles to draw them
    for (i=0; i<particles.length; i++) {
            
        // solo dibuja las particulas del tipo solicitado
            if(particles[i].type == tipo){
            //Set the file colour to an RGBA value where it starts off red-orange, but progressively gets more grey and transparent the longer the particle has been alive for
            ctx.fillStyle = "rgba("+(260-(particles[i].life*2))+","+((particles[i].life*2)+50)+","+(particles[i].life*2)+","+(((max-particles[i].life)/max)*0.4)+")";

            // Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
            ctx.beginPath();
            ctx.arc(particles[i].x,particles[i].y, (max - particles[i].life) / max * (psize) + (psize), 0, 2 * Math.PI);
            ctx.fill();

             //Move the particle based on its horizontal and vertical speeds
             particles[i].x+=particles[i].xs;
             particles[i].y+=particles[i].ys;
        
         }
        //Increase the particle's life by one
        particles[i].life++;

        //If the particle has lived longer than we are allowing, remove it from the array.
        if (particles[i].life >= max) {
            particles.splice(i, 1);
            i--;
        }
    }

}

function characterParticles(){

    ctx.globalCompositeOperation="lighter";
    drawParticles("character");
    ctx.globalCompositeOperation="source-over"; // es el standar

    // if particle system is off, don't draw particles
    if(!tf_particleSystem){ return; }
    // if player is not moving, don't draw particles
    if(!gameOver && player.velocityX == 0) { return;}

    //Adds ten new particles every frame
    for (var i=0; i<3; i++) {

        var y=player.y+43;
        var x= (player.velocityX > 0) ? player.x+5 : player.x+20; // player going left or right
        // if(player.velocityX > 0) { // si va para la izquierda
        //     var x=player.x+5; 
        // }else {  // si va para la derecha
        //     var x=player.x+20;
        // }
        var p = new Particle(x, y, (Math.random()*2*speed-speed)/2, 0-Math.random()*2*speed/10, "character");
        particles.push(p);
    }

 
  
}

function update() {

    updateDebug(); // actualizo cantidades en pantalla de debug.

    if (!gameOver) {

        
        const prevX = player.x; // Store the player's x position before handling movement
        
        handlePlayerVerticalMovement();
        handlePlayerMovement();

        // detect Collisions
        detectPlatformCollision();
        checkGroundCollision();
        detectCoinCollision();


        // Update player.velocityX based on the change in player.x
        player.velocityX = player.x - prevX;

        camera.update();

        

        // Generate new platforms as the player moves
        generatePlatforms();
    }

    // Check for game over
    if (player.y + player.height >= canvas.height - 50) {
        gameOver = true;
        if (player.score > highScore) {
            highScore = player.score;
        }
    }
}


function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    
    // Draw the platforms, coins, and floor

    // Me falta entender el ctx.Save y el ctx.Restore
    // hay una gran diferencia entre los elemetnos que le hago render antes y despues del ctx.restore
    // El UI, fuego estatico, y personaje van DESPUES del restore.
    // Fondo, plataformas y Piso van ANTES del restore.

    
    // 1. save the canvas state before the camera is applied
    ctx.save();

    
    ctx.translate(-camera.x, 0);

    // 2. draw everything that will be transformed (translate) by the camera like the platforms and background
    platforms.forEach((platform) => platform.draw());
    drawFloor();

    //3. restore the canvas state
    ctx.restore();
    
    //4. draw the UI elements, character, and fire
    coins.forEach((coin) => coin.draw());

    drawCharacter(); // Draw the character image
    
    drawScoreBox(); // Draw the score box and high score box
    //drawHighScoreBox();
    drawFire(canvas.width, canvas.height);

    if (gameOver) { // Display the "Game Over" message and "Reset" button
        drawGameOverAndReset();
    };
}


function setPlayerPositionOnPlatform(platform) {
    //player.currentimage=playerImageFrame1;
    player.x = platform.x;
    player.y = platform.y - player.height  -  100; // 100px mas arriba de la 1er plataforma.
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateCoins() {
    platforms.forEach((platform) => {
        if (!platform.coinsGenerated) {
            const numberOfCoins = Math.floor(Math.random() * 4) + 1; //between 1 and 4 coins
            const coinSpacing = platform.width / (numberOfCoins + 1);

            for (let i = 0; i < numberOfCoins; i++) {
                const coinX = platform.x + coinSpacing * (i + 1);
                const coinY = platform.y - 25;
                coins.push(new Coin(coinX, coinY, 10, 'gold'));
            }
            platform.coinsGenerated = true;
        }
    });
}







/**
 * Draw Functions on Canvas on each Frame of the Game called from Render()
 */

function drawCharacter() {

    // Update the current character image
    if (player.isJumping) {
        player.currentImage = player.playerImageFrame1;
        animationFrame = 0; // Reset animationFrame when the player is jumping
    } else {
        if (keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']) {
            // Increment animationFrame only when the player is moving horizontally
            animationFrame++;
        } else {
            animationFrame = 0; // Reset animationFrame when the player is not moving horizontally
        }
        if (animationFrame % 20 < 10) {
            player.currentImage = player.playerImageFrame1;
        } else {
            player.currentImage = player.playerImageFrame2;
        }
    }

    const characterHeight = player.height;
    const characterWidth = player.width; //(images['characterImage1'].width / images['characterImage1'].height) * characterHeight;

    //console.log(player.currentImage);
    if (!gameOver) {
        ctx.save();
        ctx.translate(-camera.x, 0);

        // Draw the Characters particles (before ctx.restore)
       // ctx.globalCompositeOperation="lighter";
        characterParticles();
       // ctx.globalCompositeOperation="source-over"; // es el standar
        
        // Check if the character is moving left, and if so, flip the character image
        if (player.velocityX < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                player.currentImage,
                -player.x - characterWidth + characterWidth, // Add characterWidth to the x-position calculation
                player.y,
                -characterWidth,
                characterHeight
            );
        } else {
            ctx.drawImage(
                player.currentImage,
                player.x,
                player.y,
                characterWidth,
                characterHeight
            );
        }

        ctx.restore();
       lavaParticles();

    }

     // Draw the Lava particles (after ctx.restore)
     ctx.globalCompositeOperation="lighter";
     ctx.globalCompositeOperation="source-over"; // es el standard

    // Draw the explosion image with the same width as the character
    // increase size for the explosión
    if (gameOver && player.explosionCounter < 50) { // Change this condition
        const explosionWidth = player.explosionCounter +characterWidth * 2; // Multiply by 2 to make the explosion larger
        const explosionHeight = player.explosionCounter + characterHeight * 2; // Multiply by 2 to make the explosion larger

        ctx.save();
        ctx.translate(-camera.x, 0);
        characterParticles();

        ctx.drawImage(
            //explosionImage,
            images['explosionImage'],
            player.x - (explosionWidth - characterWidth) / 2, // Center the explosion horizontally
            player.y - (explosionHeight - characterHeight) / 2, // Center the explosion vertically
            explosionWidth,
            explosionHeight
        );
        ctx.restore();

        player.explosionCounter++; // Increment the explosionCounter
    }
}

function drawFloor() {
    const tileWidth = images['floorImage'].width;
    const tileHeight = images['floorImage'].height;
    const numTiles = Math.ceil(canvas.width / tileWidth) + 1;

    const startX = Math.floor(camera.x / tileWidth) * tileWidth;

    for (let i = 0; i < numTiles; i++) {

        // let posX= startX + i * tileWidth;
        // let posY= canvas.height - 50;
        // drawFire(posX, posY, tileWidth, tileHeight);

        ctx.drawImage(
            images['floorImage'],
            //floorImage,
            startX + i * tileWidth,
            canvas.height - 50,
            tileWidth,
            tileHeight
        );
    }
}

function drawScoreBox() {
    drawRoundedRect(5, 5, 150, 35, 5, 'white', 'black', 3);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 30);

    drawHighScoreBox();
}
function drawHighScoreBox() { // players high score (this session)
    drawRoundedRect(canvas.width - 185, 5, 180, 35, 5, 'white', 'black', 3);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Your Score: ${highScore}`, canvas.width - 180, 30);
    
    drawHighScoreEverBox();

}
function drawHighScoreEverBox() { // high score ever (database)
    drawRoundedRect(canvas.width - 185, 45, 180, 35, 5, 'white', 'black', 3);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${highScoreEver}`, canvas.width - 180, 70);
}


function drawGameOverAndReset() {
    // if (!gameOver) { return };
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Reset', canvas.width / 2 - 25, canvas.height / 2 + 45);

}

function drawBackground() {
    const scale = canvas.height / images['backgroundImage'].height;
    const scaledWidth = images['backgroundImage'].width * scale;
    const numImages = Math.ceil(canvas.width / scaledWidth) + 1;

    // Draw the background layer (slower than the foreground)
    let offsetX = (camera.x * 0.5) % scaledWidth;
    for (let i = 0; i < numImages; i++) {
        ctx.drawImage(
            //backgroundImage,
            images['backgroundImage'],
            i * scaledWidth - offsetX,
            0, 
            scaledWidth, 
            canvas.height
        );
    }
}

function drawRoundedRect(x, y, width, height, radius, fillColor, borderColor, borderWidth) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (borderColor && borderWidth) {
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}

function drawFire(width, height) {
 
    // this particle system is not as expensive as the other one
    // if(!tf_particleSystem){ return; }
    
    // add some random black rectangles to simulate sparks
    ctx.fillStyle = 'red';
    for (var i = 0; i < 10; i++) {
        var x = Math.random() * width;
        var y = height - (Math.random() * 20) -50;
        var w = Math.random() * 5;
        var h = Math.random() * 5;
        ctx.fillRect(x, y, w, h);
    }
}





    //See if the browser supports canvas
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');

        //filtros y efectos locos del stage / ctx
        // ctx.globalCompositeOperation="lighter";
        // ctx.globalCompositeOperation="xor";
        
        loadImages();
        generatePlatforms();
    } else { 
        alert("Canvas not supported.");
    }





    // Define variables to store the time of the last frame and the current frame
var lastFrameTime = 0;
var currentFrameTime = 0;

// Define a variable to store the number of frames that have been rendered
var frameCount = 0;

// Define a function that will be called on every animation frame
function animate() {
  // Request the next animation frame
  window.requestAnimationFrame(animate);
  
  // Calculate the time since the last frame in milliseconds
  currentFrameTime = window.performance.now();
  //var deltaTime = currentFrameTime - lastFrameTime;
  
  // Increment the frame count
  frameCount++;
  
  // Output the frame rate every second
  if (currentFrameTime > lastFrameTime + 1000) {
    var fps = frameCount / ((currentFrameTime - lastFrameTime) / 1000);
    //console.log("Frame rate: " + fps.toFixed(2) + " FPS");
    frameRate= fps.toFixed(2) + " FPS";
    frameCount = 0;
    lastFrameTime = currentFrameTime;
  }
  
  // Do your animation logic here
}

// Start the animation loop
window.requestAnimationFrame(animate);





// --------------------------------- API functions ---------------------------------




btnSave.addEventListener('click', function(event) {
  event.preventDefault(); // prevent form submission
  playerNick = playerNameInput.value;
  player.nick= playerNick;
  console.log("update player: ",player);
  
  canvas.focus(); // focus on canvas to start playing.
  
});

function sendHighScore(player){
    let data={
        a: 'addScore',
        score: player.score,
        nick: player.nick
    };
    data=JSON.stringify(data);

    // var formData = new FormData();
    // formData.append('a', 'getGameData');

    fetch('API/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          //'Content-Type': 'multipart/form-data'
        },
        body: data
        //body: formData
      })
        .then(response => response.json())
        .then(data => {
          //updateScoreTable(data);
          getGameData(); // ya trae los scores
        })
        .catch(error => {
          console.error(error); // handle any errors here
        });
}

function updateScoreTable(json_scores){

    /*
    [{"nick":"LOLI","date":"2023-04-03 22:13:46","score":9999,"ip":"::1"},{"nick":"FRAN","date":"2023-04-03
    22:13:58","score":9999,"ip":"::1"},{"nick":"FRAN2","date":"2023-04-03
    22:14:02","score":9999,"ip":"::1"},{"nick":"FRAN3","date":"2023-04-03
    22:14:07","score":9999,"ip":"::1"},{"nick":"JUANITA35","date":"2023-04-03
    22:13:24","score":99,"ip":"::1"},{"nick":"FRANASDASD","date":"2023-04-03 22:33:52","score":25,"ip":"192.168.1.105"}]
    */

    const table = document.createElement('table');

    const tableHeader = document.createElement('tr');
    const headerCells = ['Rank', 'Nickname', 'Score', 'Date'];
    headerCells.forEach((cellText) => {
      const cell = document.createElement('th');
      cell.textContent = cellText;
      tableHeader.appendChild(cell);
    });
    table.appendChild(tableHeader);
    
    const sortedScores = json_scores.sort((a, b) => b.score - a.score); // sort scores in descending order
    
    sortedScores.forEach((score, index) => {
      if (index >= 10) return; // only show top 10 scores
    
      const row = document.createElement('tr');
    
      const rankCell = document.createElement('td');
      rankCell.textContent = index + 1;
      row.appendChild(rankCell);
    
      const nickCell = document.createElement('td');
      nickCell.textContent = score.nick.toUpperCase();
      row.appendChild(nickCell);
    
      const scoreCell = document.createElement('td');
      scoreCell.textContent = score.score;
      row.appendChild(scoreCell);
    
      const dateCell = document.createElement('td');
      dateCell.textContent = score.date;
      row.appendChild(dateCell);
    
      table.appendChild(row);
    });
    
    const topScoresList = document.getElementById('topScoresList');
    topScoresList.innerHTML = ''; // clear previous scores
    topScoresList.appendChild(table);

}

function getScores(){
    let data={
        a: 'getScores'
    };
    data=JSON.stringify(data);

    fetch('API/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      })
        .then(response => response.json())
        .then(data => {
          updateScoreTable(data);
        })
        .catch(error => {
          console.error(error); // handle any errors here
        });
}

function getGameData(){
    let data={
        a: 'getGameData'
    };
    data=JSON.stringify(data);

    // var formData = new FormData();
    // formData.append('a', 'getGameData');

    fetch('API/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          //'Content-Type': 'multipart/form-data'
        },
        body: data
        //body: formData
      })
        .then(response => response.json())
        .then(data => {
            
          console.log(data); // handle the response data here

            lastUpdate= data.lastUpdate;
            playCounts= data.playCount.total;

            getScores();

        })
        .catch(error => {
          console.error(error); // handle any errors here
        });
}
getGameData();

