let bubbles = [];
let particles = []; // 粒子系統，用於爆破效果
const NUM = 30;
// 氣球顏色
const COLORS = ['#bee9e8', '#62b6cb', '#1b4965', '#5fa8d3'];
// 目標得分顏色
const TARGET_COLOR = '#1b4965'; 
// 爆破機率改為 0，因為我們將使用滑鼠點擊
const BURST_CHANCE = 0; 

let popSound; // 音效變數
let score = 0; // 遊戲分數變數
const MY_ID = "414730928";
const TEXT_COLOR = '#eb6424';
const TEXT_SIZE = 32;

// --- 預載入 (Preload) ---
function preload() {
    // !! 請務必將 'your_pop_sound.mp3' 替換為您的音效檔案名稱和路徑 !!
    // 範例：popSound = loadSound('assets/pop_sound.mp3');
    popSound = loadSound('pop.mp3'); 
}

// --- 設定 (Setup) ---
function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    rectMode(CENTER); 
    
    for (let i = 0; i < NUM; i++) {
        bubbles.push(createBubble(random(width), random(height)));
    }

    if (popSound) {
        popSound.setVolume(0.5); 
    }
}

// 建立一個新的氣球物件
function createBubble(x, y) {
    return {
        x: x,
        y: y,
        r: random(50, 200),      // 直徑
        col: random(COLORS),
        alpha: random(60, 220),  // 透明度
        speed: random(0.3, 3)    // 向上速度
    };
}


// --- 繪製 (Draw) ---
function draw() {
    background('#cae9ff'); // 全螢幕背景色
    
    // 1. 繪製氣球
    for (let b of bubbles) {
        let c = color(b.col);
        fill(c.levels[0], c.levels[1], c.levels[2], b.alpha);
        circle(b.x, b.y, b.r);
        
        // 繪製反光
        let sqSize = b.r / 6;
        let sqX = b.x + b.r / 4; 
        let sqY = b.y - b.r / 4; 
        fill(255, 180); 
        rect(sqX, sqY, sqSize, sqSize);

        // 更新氣球位置
        b.y -= b.speed;

        // 檢查是否超出畫面，超出則從底部重生
        if (b.y < -b.r / 2) {
            b.y = height + b.r / 2;
            b.x = random(width);
            Object.assign(b, createBubble(b.x, b.y)); 
        }

        // 隨機爆破邏輯被移除
    }

    // 2. 更新並繪製粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.show();
        if (p.isDead()) {
            particles.splice(i, 1);
        }
    }

    // 安全機制：避免粒子太多造成效能問題
    if (particles.length > 2000) {
        particles.splice(0, particles.length - 2000);
    }

    // 3. 繪製文字與分數
    drawTextAndScore();
}

// 繪製學號和分數
function drawTextAndScore() {
    fill(TEXT_COLOR);
    textSize(TEXT_SIZE);
    textAlign(LEFT, TOP);
    
    // 左上角顯示學號
    text(MY_ID, 10, 10);
    
    textAlign(RIGHT, TOP);
    // 右上角顯示分數
    text("Score: " + score, width - 10, 10);
}


// --- 滑鼠事件 (Mouse Click Event) ---
function mousePressed() {
    // 從最後一個氣球開始檢查，以確保點擊到最上層的氣球
    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];
        
        // 檢查滑鼠是否在氣球的圓形範圍內
        let d = dist(mouseX, mouseY, b.x, b.y);
        
        // 如果點擊到氣球
        if (d < b.r / 2) {
            
            // 1. 處理分數
            // 比較氣球顏色是否為目標得分顏色
            if (b.col === TARGET_COLOR) {
                score += 1; // 加一分
            } else {
                score -= 1; // 扣一分
            }
            
            // 2. 播放音效
            if (popSound && !popSound.isPlaying()) {
                 popSound.play();
            }
            
            // 3. 產生爆破粒子
            let count = floor(map(b.r, 50, 200, 10, 40));
            createBurst(b.x, b.y, b.col, count, b.r);
            
            // 4. 氣球重生並從底部開始
            b.y = height + b.r / 2;
            b.x = random(width);
            Object.assign(b, createBubble(b.x, b.y));
            
            // 點擊後跳出迴圈，避免一個點擊觸發多個氣球
            break; 
        }
    }
}


// --- 輔助函式 (Utility Functions) ---

// 建立爆破粒子群
function createBurst(x, y, col, count, parentSize) {
    for (let i = 0; i < count; i++) {
        let angle = random(TWO_PI);
        let speed = random(1, map(parentSize, 50, 200, 2, 8));
        let vx = cos(angle) * speed;
        let vy = sin(angle) * speed;
        let size = random(2, map(parentSize, 50, 200, 4, 10)); 
        particles.push(new Particle(x, y, col, vx, vy, size));
    }
}

// 粒子類別 (Particle Class) - 程式碼與原始版本相同
function Particle(x, y, col, vx, vy, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.life = random(40, 100);
    this.maxLife = this.life;
    
    let c = color(col);
    this.r = c.levels[0];
    this.g = c.levels[1];
    this.b = c.levels[2];

    this.update = function() {
        this.vx *= 0.98; 
        this.vy *= 0.98;
        this.vy += 0.05; 
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 1; 
    }

    this.show = function() {
        let a = map(this.life, 0, this.maxLife, 0, 255);
        noStroke();
        fill(this.r, this.g, this.b, a);
        ellipse(this.x, this.y, this.size);
    }

    this.isDead = function() {
        return this.life <= 0; 
    }
}

// 視窗大小改變時，重新調整畫布大小
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}