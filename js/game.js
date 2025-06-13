document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;
    
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150;
    let gameLoop;
    let isPaused = false;
    let gameStarted = false;
    
    highScoreElement.textContent = highScore;

    function initGame() {
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        
        generateFood();
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameSpeed = 150;
    }

    function generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            validPosition = true;
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    function gameUpdate() {
        if (isPaused) return;
        
        direction = nextDirection;
        
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }

        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;

            if (score % 5 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoop);
                gameLoop = setInterval(gameUpdate, gameSpeed);
            }
            
            generateFood();
        } else {
            snake.pop();
        }
        
        drawGame();
    }
    
    function drawGame() {
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2ecc71';
        for (let segment of snake) {
            ctx.fillRect(
                segment.x * gridSize, 
                segment.y * gridSize, 
                gridSize - 1, 
                gridSize - 1
            );
        }

        ctx.fillStyle = '#24A610';
        ctx.fillRect(
            snake[0].x * gridSize, 
            snake[0].y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(
            food.x * gridSize, 
            food.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        gameStarted = false;
        startBtn.textContent = 'Restart';
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        startBtn.textContent = 'Restart';
        startBtn.disabled = false;
        pauseBtn.disabled = false;
        
        alert(`Game over!Your score is: ${score}`);
    }
    
    document.addEventListener('keydown', e => {
        if (!gameStarted) return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                togglePause();
                break;
        }
    });
    
    startBtn.addEventListener('click', () => {
        if (gameStarted) return;
        
        initGame();
        drawGame();
        gameStarted = true;
        isPaused = false;
        pauseBtn.textContent = 'Pause';
        startBtn.textContent = 'Playing...';
        startBtn.disabled = true;
        
        clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, gameSpeed);
    });
    
    pauseBtn.addEventListener('click', togglePause);
    
    function togglePause() {
        if (!gameStarted) return;
        
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Continue' : 'Pause';
        
        if (!isPaused) {
            drawGame();
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        }
    }

    initGame();
    drawGame();
});
