// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏常量
const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let level = 1;
let gameSpeed = 150; // 初始速度（毫秒）
let gameInterval;
let isGameRunning = false;
let isPaused = false;

// 初始化游戏
function initGame() {
    // 重置蛇的位置
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数和等级
    score = 0;
    level = 1;
    gameSpeed = 150;
    
    // 更新分数和等级显示
    updateScore();
    updateLevel();
    
    // 生成食物
    generateFood();
    
    // 绘制初始状态
    drawGame();
}

// 生成食物
function generateFood() {
    // 生成随机位置，但确保不在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
    
    // 如果游戏暂停，显示暂停文字
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 头部使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#2c3e50';
        } else {
            // 身体颜色渐变
            const colorValue = Math.floor(100 + (index * 15) % 100);
            ctx.fillStyle = `rgb(39, ${colorValue}, 96)`;
        }
        
        // 绘制蛇段
        ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
        
        // 添加边框
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#e74c3c';
    
    // 绘制圆形食物
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 添加食物边框
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 更新游戏状态
function updateGame() {
    if (isPaused) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
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
    
    // 检查是否碰撞到墙壁
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }
    
    // 检查是否碰撞到自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 将新的头部添加到蛇的前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 检查是否升级
        if (score % 50 === 0) {
            level++;
            updateLevel();
            
            // 增加游戏速度，但有上限
            if (gameSpeed > 50) {
                gameSpeed -= 10;
                
                // 重新设置游戏间隔以更新速度
                clearInterval(gameInterval);
                gameInterval = setInterval(updateGame, gameSpeed);
            }
        }
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
    
    // 重新绘制游戏
    drawGame();
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
    
    // 显示游戏结束文字
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`最终等级: ${level}`, canvas.width / 2, canvas.height / 2 + 30);
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新等级显示
function updateLevel() {
    levelElement.textContent = level;
}

// 开始游戏
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    isPaused = false;
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    
    // 设置游戏间隔
    gameInterval = setInterval(updateGame, gameSpeed);
}

// 暂停游戏
function pauseGame() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续游戏' : '暂停游戏';
    
    // 重新绘制游戏以显示暂停文字
    if (isPaused) {
        drawGame();
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    isGameRunning = false;
    isPaused = false;
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    pauseBtn.textContent = '暂停游戏';
    
    // 重新初始化游戏
    initGame();
}

// 处理键盘输入
function handleKeyPress(e) {
    // 防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 根据按键设置下一个方向
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            // 空格键暂停/继续
            if (isGameRunning) {
                pauseGame();
            }
            break;
    }
}

// 添加事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
window.addEventListener('keydown', handleKeyPress);

// 支持触摸屏滑动控制（移动设备）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
    if (!isGameRunning || isPaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定滑动方向
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (diffX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (diffY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
    
    e.preventDefault();
}, { passive: false });

// 初始化游戏
initGame();