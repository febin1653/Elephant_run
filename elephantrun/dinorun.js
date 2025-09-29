const dino = document.getElementById('dino');
const container = document.querySelector('.game-container');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');

let score = 0;
let isGameOver = false;
let gameLoopInterval;
let obstacleGenerationTimeout; // Use timeout for variable time
let scoreIncreaseInterval; 

// Base speed value (in seconds for CSS animation)
let gameSpeed = 2; // Slower time means faster speed

// --- Core Game Functions ---

function jump() {
    if (isGameOver) return; // Prevent jumping when game is over
    if (!dino.classList.contains('jump-animation')) {
        dino.classList.add('jump-animation');
        
        // Remove the class after the animation is finished
        setTimeout(() => {
            dino.classList.remove('jump-animation');
        }, 600); 
    }
}

function createObstacle() {
    if (isGameOver) return;

    const cactus = document.createElement('div');
    cactus.classList.add('cactus');
    container.appendChild(cactus);

    // FIX 1: Set the animation to run ONCE using the dynamic gameSpeed
    cactus.style.animation = `move-cactus ${gameSpeed}s linear forwards`;

    // FIX 2: Score increases when the animation finishes (meaning the obstacle was cleared)
    cactus.addEventListener('animationend', () => {
        cactus.remove();
        if (!isGameOver) {
             // Score is now handled by the separate interval, but the removal is clean.
        }
    });

    // Schedule the next obstacle generation with adjusted timing
    // The faster the gameSpeed, the shorter the gap between obstacles
    let nextGenerationTime = (gameSpeed * 1000) * (Math.random() * 0.5 + 0.8); // e.g., 80% to 130% of current speed time
    obstacleGenerationTimeout = setTimeout(createObstacle, nextGenerationTime);
}


function increaseScoreAndSpeed() {
    if (!isGameOver) {
        // Increase score every second
        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        // PROGRESSIVE DIFFICULTY (Speed Increase)
        // If the score is a multiple of 10, increase the speed.
        if (score % 10 === 0 && score > 0) {
            // Decrease the gameSpeed duration, making the movement faster (e.g., from 2.0s to 1.9s)
            gameSpeed = Math.max(1.0, gameSpeed - 0.1); 
        }
    }
}

function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const cacti = document.querySelectorAll('.cactus');
    
    cacti.forEach(cactus => {
        const cactusRect = cactus.getBoundingClientRect();

        // Check for collision (overlap of bounding boxes)
        if (
            dinoRect.right > cactusRect.left &&
            dinoRect.left < cactusRect.right &&
            dinoRect.bottom > cactusRect.top 
        ) {
            gameOver();
        }
    });
}

function gameOver() {
    isGameOver = true;
    
    // Stop all intervals and timeouts
    clearInterval(gameLoopInterval);
    clearInterval(scoreIncreaseInterval);
    clearTimeout(obstacleGenerationTimeout);
    
    // Pause all visual movement
    document.querySelectorAll('.cactus').forEach(c => {
        // Stop the dynamic animation
        c.style.animationPlayState = 'paused'; 
    });
    dino.style.animationPlayState = 'paused';

    // Show Game Over screen
    finalScoreDisplay.textContent = `Final Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}

window.startGame = function() {
    // Reset state and variables
    isGameOver = false;
    score = 0;
    gameSpeed = 2; // Reset speed to initial value
    scoreDisplay.textContent = 'Score: 0';
    gameOverScreen.style.display = 'none';

    // Cleanup existing elements and animations
    document.querySelectorAll('.cactus').forEach(c => c.remove());
    dino.classList.remove('jump-animation');
    // Ensure the dino doesn't have a paused state from previous game
    dino.style.animationPlayState = ''; 

    // Start the main game loop (collision check)
    gameLoopInterval = setInterval(checkCollision, 10); 

    // Start score and speed increase logic
    scoreIncreaseInterval = setInterval(increaseScoreAndSpeed, 1000); // 1 point per second
    
    // Start obstacle generation
    createObstacle(); 
    
    console.log("Game Started!");
}

// --- Event Listeners ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (isGameOver) {
            window.startGame();
        } else {
            jump();
        }
    }
});

// Initial call to start the game when the script loads
window.startGame();