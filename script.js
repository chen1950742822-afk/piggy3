// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const fireworksCanvas = document.getElementById('fireworksCanvas');
    const starsBackground = document.getElementById('starsBackground');
    const snowBackground = document.getElementById('snowBackground');
    const nameDisplay = document.getElementById('nameDisplay');
    const nameText = document.getElementById('nameText');
    const messageDisplay = document.getElementById('messageDisplay');
    const sweetMessage = document.getElementById('sweetMessage');
    const confessionOverlay = document.getElementById('confessionOverlay');
    const confessionTitle = document.getElementById('confessionTitle');
    const confessionText = document.getElementById('confessionText');
    const floatingHearts = document.getElementById('floatingHearts');
    const musicControl = document.getElementById('musicControl');
    const musicIcon = document.getElementById('musicIcon');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    // 点击计数器和音乐状态
    let clickCount = 0;
    let isMusicPlaying = true;
    let isConfessionShown = false;
    
    // Canvas设置
    const ctx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let particles = [];
    
    // 随机情话数组
    const sweetMessages = [
        "朱宝宝，记得多穿衣服哦～",
        "世界有点冷，但我想做你的小太阳，让你一整天都暖洋洋的。",
        "手别太冷，我的心一直给你取暖。",
        "谢谢你走进我的冬天，让它变得不再寒冷。",
        "天气降温啦，也别忘了对自己好一点，就像我对你好一样。",
        "天冷啦，记得多穿点，别让我担心的小笨蛋～",
        "立冬到了，天气变冷了，但你永远是我心里最温暖的那束光。",
        "你要是感冒了，我的世界都要打喷嚏。",
        "一杯热奶茶不如我，一点一滴都暖进你心里。",
        "晚安要早点说，月亮也会替我抱抱你。"
    ];
    
    // 烟花颜色
    const fireworkColors = [
        '#FFD700', // 金色
        '#FF69B4', // 粉红色
        '#FF1493', // 深粉色
        '#FF4500', // 橙红色
        '#FFA500', // 橙色
        '#FF6347', // 番茄色
        '#FFB6C1', // 浅粉色
        '#FFC0CB', // 粉红色
        '#DA70D6', // 兰花紫
        '#9370DB'  // 中紫色
    ];
    
    // 设置Canvas大小
    function resizeCanvas() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 创建星空
    function createStars() {
        // 检测是否为移动端或微信浏览器，减少星星数量
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isWechatBrowser = /micromessenger/i.test(navigator.userAgent);
        
        let starCount = 150;
        if (isMobile || isWechatBrowser) {
            starCount = 80; // 移动端减少星星数量
        }
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机大小
            const sizes = ['small', 'medium', 'large', 'brilliant'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            star.classList.add(randomSize);
            
            // 随机位置
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // 随机动画延迟
            star.style.animationDelay = Math.random() * 3 + 's';
            
            starsBackground.appendChild(star);
        }
    }
    
    // 创建雪花
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        
        // 随机起始位置
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.top = '-10px';
        
        // 随机大小
        const size = Math.random() * 12 + 8; // 8-20px
        snowflake.style.fontSize = size + 'px';
        
        // 随机动画持续时间
        const duration = Math.random() * 4 + 8; // 8-12秒
        snowflake.style.animationDuration = duration + 's';
        
        // 随机透明度
        snowflake.style.opacity = Math.random() * 0.6 + 0.2;
        
        snowBackground.appendChild(snowflake);
        
        // 雪花消失后移除
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, duration * 1000);
    }
    
    // 持续创建雪花
    function startSnowfall() {
        createSnowflake();
        // 每300-700ms创建一片雪花
        setTimeout(startSnowfall, Math.random() * 400 + 300);
    }
    
    // 烟花粒子类
    class Particle {
        constructor(x, y, velocityX, velocityY, color, life) {
            this.x = x;
            this.y = y;
            this.velocityX = velocityX;
            this.velocityY = velocityY;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = Math.random() * 3 + 1;
            this.gravity = 0.1;
            this.friction = 0.98;
        }
        
        update() {
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction; // 修复错误，确保所有速度都受到摩擦力影响
            this.velocityY += this.gravity * 0.5; // 减少重力影响，让圆形保持更久
            this.life--;
            this.size *= 0.985; // 稍微调整缩放速度
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        isDead() {
            return this.life <= 0 || this.size <= 0.1;
        }
    }
    
    // 烟花类
    class Firework {
        constructor(startX, startY, targetX, targetY) {
            this.startX = startX;
            this.startY = startY;
            this.x = startX;
            this.y = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.speed = 2;
            this.angle = Math.atan2(targetY - startY, targetX - startX);
            this.velocityX = Math.cos(this.angle) * this.speed;
            this.velocityY = Math.sin(this.angle) * this.speed;
            this.exploded = false;
            this.color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        }
        
        update() {
            if (!this.exploded) {
                this.x += this.velocityX;
                this.y += this.velocityY;
                
                // 检查是否到达目标位置
                const distance = Math.sqrt(
                    Math.pow(this.targetX - this.x, 2) + 
                    Math.pow(this.targetY - this.y, 2)
                );
                
                if (distance < 10) {
                    this.explode();
                }
            }
        }
        
        explode() {
            this.exploded = true;
            // 检测是否为移动端或微信浏览器，减少粒子数量以提高性能
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isWechatBrowser = /micromessenger/i.test(navigator.userAgent);
            
            let particleCount = 80;
            if (isMobile || isWechatBrowser) {
                particleCount = 40; // 移动端减少粒子数量
            }
            
            const angleStep = (Math.PI * 2) / particleCount;
            const baseSpeed = 2.5; // 基础速度
            const speedVariation = 0.8; // 速度变化范围
            
            for (let i = 0; i < particleCount; i++) {
                // 创建完美的圆形分布
                const angle = i * angleStep + (Math.random() - 0.5) * 0.05; // 添加微小随机角度变化
                const speed = baseSpeed + (Math.random() - 0.5) * speedVariation;
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                const life = Math.random() * 60 + 40; // 减少粒子生命期以提高性能
                
                particles.push(new Particle(
                    this.x, this.y, 
                    velocityX, velocityY, 
                    this.color, life
                ));
            }
            
            // 显示名字
            showName(this.x, this.y);
        }
        
        draw() {
            if (!this.exploded) {
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        isDead() {
            return this.exploded && particles.length === 0;
        }
    }
    
    // 显示名字
    function showName(x, y) {
        // 创建新的名字显示元素
        const newNameDisplay = document.createElement('div');
        newNameDisplay.className = 'name-display';
        
        // 创建新的文字元素
        const newNameText = document.createElement('span');
        newNameText.className = 'name-text';
        newNameText.textContent = '朱宝宝';
        
        // 随机选择文字样式
        const textStyles = [
            { color: '#FFB6C1', glow: 'rgba(255, 182, 193, 0.8)' },
            { color: '#E6E6FA', glow: 'rgba(230, 230, 250, 0.8)' },
            { color: '#F0E68C', glow: 'rgba(240, 230, 140, 0.8)' },
            { color: '#DDA0DD', glow: 'rgba(221, 160, 221, 0.8)' }
        ];
        
        const randomStyle = textStyles[Math.floor(Math.random() * textStyles.length)];
        
        // 设置文字样式
        newNameText.style.color = randomStyle.color;
        newNameText.style.textShadow = `
            0 0 15px ${randomStyle.glow},
            0 0 30px ${randomStyle.glow},
            0 0 45px ${randomStyle.glow}
        `;
        
        // 设置位置
        newNameDisplay.style.left = x + 'px';
        newNameDisplay.style.top = y + 'px';
        
        // 添加文字到显示元素
        newNameDisplay.appendChild(newNameText);
        
        // 添加到页面
        document.body.appendChild(newNameDisplay);
        
        // 触发动画
        setTimeout(() => {
            newNameDisplay.classList.add('show');
        }, 50);
        
        // 2秒后移除元素
        setTimeout(() => {
            if (newNameDisplay.parentNode) {
                newNameDisplay.parentNode.removeChild(newNameDisplay);
            }
        }, 2000);
    }
    
    // 显示随机情话
    function showSweetMessage() {
        const randomMessage = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
        sweetMessage.textContent = randomMessage;
        
        // 重新触发动画
        messageDisplay.classList.remove('show');
        messageDisplay.offsetHeight; // 强制重排
        messageDisplay.classList.add('show');
        
        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 4000);
    }
    
    // 创建飘浮爱心
    function createFloatingHearts() {
        const heartCount = 20;
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '💗';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 6 + 's';
            floatingHearts.appendChild(heart);
        }
    }
    
    // 显示告白动画
    function showConfession() {
        if (isConfessionShown) return;
        isConfessionShown = true;
        
        // 创建多个烟花
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2;
                const targetX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
                const targetY = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
                
                fireworks.push(new Firework(x, window.innerHeight, targetX, targetY));
            }, i * 300);
        }
        
        setTimeout(() => {
            // 显示告白覆盖层
            confessionOverlay.classList.add('active');
            
            // 创建飘浮爱心
            createFloatingHearts();
            
            // 开始音乐（如果用户允许）
            if (isMusicPlaying) {
                backgroundMusic.play().catch(e => {
                    console.log('音频播放需要用户交互:', e);
                });
            }
            
        }, 2000);
    }
    
    // 主循环
    function animate() {
        ctx.fillStyle = 'rgba(10, 16, 44, 0.1)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        // 更新和绘制烟花
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw();
            
            if (fireworks[i].isDead()) {
                fireworks.splice(i, 1);
            }
        }
        
        // 更新和绘制粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // 点击事件（兼容微信浏览器）
    function handleClick(e) {
        if (isConfessionShown) return;
        
        clickCount++;
        
        // 隐藏引导文字
        const instructionText = document.getElementById('instructionText');
        if (instructionText && clickCount === 1) {
            instructionText.style.opacity = '0';
            instructionText.style.transition = 'opacity 0.5s ease';
        }
        
        // 获取点击位置（兼容移动端）
        const rect = fireworksCanvas.getBoundingClientRect();
        let x, y;
        
        if (e.touches && e.touches.length > 0) {
            // 触摸事件
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // 鼠标事件
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // 创建烟花
        const firework = new Firework(window.innerWidth / 2, window.innerHeight, x, y);
        fireworks.push(firework);
        
        // 显示随机情话
        showSweetMessage();
        
        // 第5次点击触发告白
        if (clickCount === 10) {
            setTimeout(showConfession, 1000);
        }
        
        // 尝试播放音频（微信浏览器需要用户交互）
        if (isMusicPlaying) {
            backgroundMusic.play().catch(e => {
                console.log('音频播放需要用户交互:', e);
            });
        }
    }
    
    // 音乐控制
    function toggleMusic() {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            musicIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
            musicControl.classList.remove('playing');
            isMusicPlaying = false;
        } else {
            backgroundMusic.play().catch(e => {
                console.log('音频播放需要用户交互:', e);
            });
            musicIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
            musicControl.classList.add('playing');
            isMusicPlaying = true;
        }
    }
    
    
    // 初始化
    function init() {
        createStars();
        startSnowfall();
        animate();
        
        // 添加事件监听器（兼容微信浏览器）
        // 同时监听点击和触摸事件
        fireworksCanvas.addEventListener('click', handleClick);
        fireworksCanvas.addEventListener('touchend', handleClick);
        document.addEventListener('click', handleClick);
        document.addEventListener('touchend', handleClick);
        musicControl.addEventListener('click', toggleMusic);
        musicControl.addEventListener('touchend', toggleMusic);
        
        // 检测是否为移动端微信浏览器
        const isWechatBrowser = /micromessenger/i.test(navigator.userAgent);
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 移动端隐藏鼠标样式，添加触摸提示
            document.body.style.cursor = 'default';
            const instructionText = document.getElementById('instructionText');
            if (instructionText) {
                const smallText = instructionText.querySelector('.small-text');
                if (smallText) {
                    smallText.textContent = '轻点屏幕有烟花喔宝宝！✨';
                }
            }
        } else {
            // 桌面端保持鼠标样式
            document.body.style.cursor = 'crosshair';
        }
        
        // 微信浏览器不自动播放音频，等待用户交互
        if (!isWechatBrowser) {
            backgroundMusic.play().catch(e => {
                console.log('音频播放失败，可能需要用户交互:', e);
            });
        }

    // 更新音乐图标为播放状态
        musicIcon.innerHTML = '';

        musicControl.classList.add('playing');
    }
    
    // 启动
    init();
    
    // 定期创建背景烟花效果
    setInterval(() => {
        if (!isConfessionShown && Math.random() < 0.1) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.2;
            const targetX = x + (Math.random() - 0.5) * 100;
            const targetY = y + (Math.random() - 0.5) * 100;
            
            fireworks.push(new Firework(x, window.innerHeight, targetX, targetY));
        }
    }, 3000);
});
