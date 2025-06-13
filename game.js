document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    // 游戏设置
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;
    
    // 游戏状态
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
    
    // 初始化游戏
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
    
    // 生成食物
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
    
    // 游戏主循环
    function gameUpdate() {
        if (isPaused) return;
        
        direction = nextDirection;
        
        // 移动蛇
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
        
        // 检查碰撞
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }
        
        // 添加新头部
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            
            // 每得5分加速一次
            if (score % 5 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoop);
                gameLoop = setInterval(gameUpdate, gameSpeed);
            }
            
            generateFood();
        } else {
            // 没吃到食物则移除尾部
            snake.pop();
        }
        
        // 绘制游戏
        drawGame();
    }
    
    // 绘制游戏
    function drawGame() {
        // 清空画布
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制蛇
        ctx.fillStyle = '#2ecc71';
        for (let segment of snake) {
            ctx.fillRect(
                segment.x * gridSize, 
                segment.y * gridSize, 
                gridSize - 1, 
                gridSize - 1
            );
        }
        
        // 绘制头部（不同颜色）
        ctx.fillStyle = '#24A610';
        ctx.fillRect(
            snake[0].x * gridSize, 
            snake[0].y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
        
        // 绘制食物
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(
            food.x * gridSize, 
            food.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    }
    
    // 游戏结束
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
        
        // 更新按钮状态
        startBtn.textContent = 'Restart';
        startBtn.disabled = false;
        pauseBtn.disabled = false;
        
        alert(`Game over!Your score is: ${score}`);
    }
    
    // 键盘控制
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
    
    // 开始游戏
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
    
    // 暂停/继续游戏
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
    
    // 初始绘制
    initGame();
    drawGame();
});