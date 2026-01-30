// ==================== 游戏状态 ====================
const gameState = {
    energy: 50,
    academics: 50,
    connection: 50,
    self: 50,
    week: 1,
    daysLeft: 112,
    ddlPressure: 0,
    gameOver: false,
    isAnimating: false,
    usedEvents: [],
    inHighPressurePeriod: false,
    highPressureWeeksLeft: 0
};

// ==================== 难度配置 ====================
const DIFFICULTY_CONFIG = {
    easy: {
        name: '轻松模式',
        icon: '☕',
        description: '初始状态较高，DDL压力慢，适合第一次玩',
        hint: '新手友好，大多数选择都能安全过关',
        initialStats: { energy: 95, academics: 90, connection: 85, self: 90 },
        ddlMultiplier: { min: 0.8, max: 1.2 },
        ddlThreshold: 55,
        negativeMultiplier: 0.7,
        positiveMultiplier: 1.0,
        highPressureEnergyMultiplier: 1.2,
        maxWeeks: 65
    },
    standard: {
        name: '标准模式',
        icon: '⚖️',
        description: '默认难度，真实大学体验',
        hint: '需要策略取舍，50%几率自然毕业',
        initialStats: { energy: 85, academics: 80, connection: 75, self: 80 },
        ddlMultiplier: { min: 1.2, max: 2.0 },
        ddlThreshold: 45,
        negativeMultiplier: 1.0,
        positiveMultiplier: 1.0,
        highPressureEnergyMultiplier: 1.5,
        maxWeeks: 55
    },
    hard: {
        name: '地狱模式',
        icon: '🔥',
        description: '初始状态低，DDL压力快，状态扣减放大，挑战你的极限',
        hint: '咖啡永远不够用，DDL如影随形，随时可能崩',
        initialStats: { energy: 65, academics: 60, connection: 55, self: 60 },
        ddlMultiplier: { min: 2.5, max: 4.0 },
        ddlThreshold: 35,
        negativeMultiplier: 1.65,
        positiveMultiplier: 0.7,
        highPressureEnergyMultiplier: 2.0,
        highPressureChance: 0.9,
        highPressureDuration: 10,
        maxWeeks: 45,
        hasDebuffEvents: true
    }
};

let currentDifficulty = 'standard';

// ==================== DOM 元素 ====================
const elements = {
    startScreen: document.getElementById('start-screen'),
    difficultyScreen: document.getElementById('difficulty-screen'),
    gameScreen: document.getElementById('game-screen'),
    endingScreen: document.getElementById('ending-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    card: document.getElementById('card'),
    eventText: document.getElementById('event-text'),
    avatarEmoji: document.getElementById('avatar-emoji'),
    characterName: document.getElementById('character-name'),
    characterRole: document.getElementById('character-role'),
    weekDisplay: document.getElementById('week-number'),
    daysDisplay: null, // 已移除天數計數器
    endingTitle: document.getElementById('ending-title'),
    endingText: document.getElementById('ending-text'),
    endingStats: document.getElementById('ending-stats'),
    endingIcon: document.querySelector('.ending-icon'),
    backToDifficultyBtn: document.getElementById('back-to-difficulty-btn'),
    btnLeft: document.getElementById('btn-left'),
    btnRight: document.getElementById('btn-right'),
    leftBtnText: document.getElementById('left-btn-text'),
    rightBtnText: document.getElementById('right-btn-text'),
    leftHintText: document.getElementById('left-hint-text'),
    rightHintText: document.getElementById('right-hint-text'),
    swipeLeftHint: document.getElementById('swipe-left-hint'),
    swipeRightHint: document.getElementById('swipe-right-hint'),
    feedbackMessage: document.getElementById('feedback-message'),
    // 难度选择相关元素
    difficultyCard: document.getElementById('difficulty-card'),
    previewIcon: document.getElementById('preview-icon'),
    previewName: document.getElementById('preview-name'),
    previewDesc: document.getElementById('preview-desc'),
    diffEasyBtn: document.getElementById('diff-easy-btn'),
    diffStandardBtn: document.getElementById('diff-standard-btn'),
    diffHardBtn: document.getElementById('diff-hard-btn'),
    confirmDifficultyBtn: document.getElementById('confirm-difficulty-btn')
};

// 状态进度条元素
const statusElements = {
    energy: {
        fill: document.getElementById('energy-fill'),
        dot: document.getElementById('energy-dot')
    },
    academics: {
        fill: document.getElementById('academics-fill'),
        dot: document.getElementById('academics-dot')
    },
    connection: {
        fill: document.getElementById('connection-fill'),
        dot: document.getElementById('connection-dot')
    },
    self: {
        fill: document.getElementById('self-fill'),
        dot: document.getElementById('self-dot')
    }
};

// 滑动配置
const SWIPE_THRESHOLD = 100; // 触发阈值（像素）

// 当前事件数据
let currentEvent = null;

// ==================== 滑动变量 ====================
let startX = 0;
let currentX = 0;
let isDragging = false;

// ==================== 初始化游戏 ====================
function initGame(difficulty = 'standard') {
    currentDifficulty = difficulty;
    const config = DIFFICULTY_CONFIG[difficulty];

    gameState.energy = config.initialStats.energy;
    gameState.academics = config.initialStats.academics;
    gameState.connection = config.initialStats.connection;
    gameState.self = config.initialStats.self;
    gameState.week = 1;
    gameState.daysLeft = 112;
    gameState.ddlPressure = 0;
    gameState.gameOver = false;
    gameState.isAnimating = false;
    gameState.usedEvents = [];
    gameState.inHighPressurePeriod = false;
    gameState.highPressureWeeksLeft = 0;
    currentEvent = null;

    // 重置拖拽状态
    startX = 0;
    currentX = 0;
    isDragging = false;

    // 重置卡片状态
    elements.card.style.transition = '';
    elements.card.style.transform = '';
    elements.card.style.opacity = '';
    elements.card.classList.remove('dragging', 'swipe-left-complete', 'swipe-right-complete', 'entering', 'snap-back');

    // 重置提示箭头
    if (elements.swipeLeftHint) {
        elements.swipeLeftHint.style.opacity = '0';
        elements.swipeLeftHint.style.transform = '';
    }
    if (elements.swipeRightHint) {
        elements.swipeRightHint.style.opacity = '0';
        elements.swipeRightHint.style.transform = '';
    }

    // 清理所有事件监听器
    removeEventListeners();

    // 清理按钮事件
    const cardButtons = elements.card.querySelectorAll('.card-button');
    cardButtons.forEach(btn => {
        btn.onclick = null;
        btn.style.animation = '';
        btn.style.transform = '';
        btn.style.boxShadow = '';
    });

    showScreen('game');
    updateStatusDots();

    // 短暂延迟确保DOM更新完成
    setTimeout(() => {
        nextEvent();
    }, 50);
}

// ==================== 显示界面 ====================
function showScreen(screenName) {
    elements.startScreen.classList.remove('active');
    elements.difficultyScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.endingScreen.classList.remove('active');

    switch(screenName) {
        case 'start':
            elements.startScreen.classList.add('active');
            break;
        case 'difficulty':
            elements.difficultyScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
        case 'ending':
            elements.endingScreen.classList.add('active');
            break;
    }
}

// ==================== 获取下一个事件 ====================
function getNextEvent() {
    const availableEvents = EVENTS.filter(event => !gameState.usedEvents.includes(event.text));

    if (availableEvents.length === 0) {
        gameState.usedEvents = [];
        return getNextEvent();
    }

    let eventPool = availableEvents;
    const config = DIFFICULTY_CONFIG[currentDifficulty];
    const threshold = config.ddlThreshold || 45;

    if (gameState.ddlPressure > threshold) {
        const ddlEvents = availableEvents.filter(e => e.isDDL);
        if (ddlEvents.length > 0 && Math.random() < 0.6) {
            eventPool = ddlEvents;
        }
    }

    const randomIndex = Math.floor(Math.random() * eventPool.length);
    const selectedEvent = eventPool[randomIndex];
    gameState.usedEvents.push(selectedEvent.text);

    return selectedEvent;
}

// ==================== 地狱模式专属Debuff事件池 ====================
const DEBUFF_EVENTS = [
    {
        text: "「发烧38.5度，室友说你脸红得像猴屁股。」",
        character: { name: '', role: '生病', avatar: '🤒' },
        left: { text: "硬撑着去上课", effect: { E: -25, A: +5 } },
        right: { text: "躺宿舍休息", effect: { E: -10, A: -15 } }
    },
    {
        text: "「情绪崩溃，在厕所哭了半小时，出来还得假装没事。」",
        character: { name: '', role: '情绪崩溃', avatar: '😭' },
        left: { text: "找朋友倾诉", effect: { C: +10, S: +5 } },
        right: { text: "一个人扛着", effect: { S: -20, E: -10 } }
    },
    {
        text: "「室友凌晨三点还在开麦打游戏，你明天早上有课。」",
        character: { name: '室友', role: '冲突', avatar: '🎮' },
        left: { text: "忍了", effect: { E: -15, S: -10 } },
        right: { text: "爆发争吵", effect: { C: -25, S: +5 } }
    },
    {
        text: "「手机突然收到：某科作业0分，因为你交错了文件。」",
        character: { name: '老师', role: '事故', avatar: '📁' },
        left: { text: "求老师重判", effect: { S: -15, A: +5 } },
        right: { text: "接受现实", effect: { A: -20, S: -10 } }
    },
    {
        text: "「钱包丢了，里面有这个月的生活费。」",
        character: { name: '', role: '意外', avatar: '💸' },
        left: { text: "向家里要", effect: { S: -15, E: +5 } },
        right: { text: "自己扛着", effect: { E: -20, C: -10 } }
    },
    {
        text: "「连续失眠第五天，你看着天花板到天亮。」",
        character: { name: '', role: '失眠', avatar: '😵' },
        left: { text: "吃褪黑素", effect: { E: -10, S: -5 } },
        right: { text: "硬扛着", effect: { E: -25, S: -15 } }
    },
    {
        text: "「暗恋的人官宣恋情了，对方不是你。」",
        character: { name: '', role: '心碎', avatar: '💔' },
        left: { text: "躲宿舍哭", effect: { S: -20, E: -10 } },
        right: { text: "假装祝福", effect: { S: -25, C: -5 } }
    },
    {
        text: "「社团群里@你，说活动你缺席了���次，要退你。」",
        character: { name: '社长', role: '警告', avatar: '⚠️' },
        left: { text: "道歉解释", effect: { S: -10, C: +5 } },
        right: { text: "直接退社", effect: { C: -15, A: +5 } }
    }
];

function getDebuffEvent() {
    const randomIndex = Math.floor(Math.random() * DEBUFF_EVENTS.length);
    return DEBUFF_EVENTS[randomIndex];
}

// ==================== 高压期处理 ====================
function handleHighPressurePeriod() {
    const config = DIFFICULTY_CONFIG[currentDifficulty];

    // 检查是否进入高压期
    if (!gameState.inHighPressurePeriod) {
        const threshold = config.ddlThreshold || 45;
        if (gameState.ddlPressure > threshold) {
            const chance = config.highPressureChance || 0.5;
            if (Math.random() < chance) {
                gameState.inHighPressurePeriod = true;
                gameState.highPressureWeeksLeft = config.highPressureDuration || 5;
            }
        }
    } else {
        // 高压期倒计时
        gameState.highPressureWeeksLeft--;
        if (gameState.highPressureWeeksLeft <= 0) {
            gameState.inHighPressurePeriod = false;
        }
    }
}

// ==================== 显示下一个事件 ====================
function nextEvent() {
    const config = DIFFICULTY_CONFIG[currentDifficulty];

    if (gameState.week > config.maxWeeks) {
        endGame('semester');
        return;
    }

    elements.weekDisplay.textContent = gameState.week;
    if (elements.daysDisplay) {
        elements.daysDisplay.textContent = gameState.daysLeft;
    }

    // 地狱模式：每10回合触发debuff事件
    if (config.hasDebuffEvents && gameState.week % 10 === 0 && gameState.week > 1) {
        const debuffEvent = getDebuffEvent();
        displayEvent(debuffEvent);
    } else {
        const event = getNextEvent();
        displayEvent(event);
    }

    // 处理高压期
    handleHighPressurePeriod();

    updateStatusDots();
}

// ==================== 显示事件 ====================
function displayEvent(event) {
    currentEvent = event;
    elements.eventText.textContent = event.text;

    // 显示人物信息
    if (event.character) {
        elements.avatarEmoji.textContent = event.character.avatar || '';
        elements.characterName.textContent = event.character.name || '';
        elements.characterRole.textContent = event.character.role || '';

        const characterSection = document.querySelector('.character-section');
        if (!event.character.name && !event.character.role) {
            characterSection.style.display = 'none';
        } else {
            characterSection.style.display = 'flex';
        }
    }

    // 更新按钮和提示文字
    elements.leftBtnText.textContent = event.left.text;
    elements.rightBtnText.textContent = event.right.text;
    elements.leftHintText.textContent = event.left.text;
    elements.rightHintText.textContent = event.right.text;

    // 重置箭头提示
    elements.swipeLeftHint.style.opacity = 0;
    elements.swipeRightHint.style.opacity = 0;

    // 设置滑动事件
    setupSwipeHandlers();
}

// ==================== 滑动事件处理 ====================
function setupSwipeHandlers() {
    // 移除之前的事件监听器
    removeEventListeners();

    // 添加新的事件监听器
    elements.card.addEventListener('mousedown', startDrag);
    elements.card.addEventListener('touchstart', startDrag, { passive: false });
}

function removeEventListeners() {
    elements.card.removeEventListener('mousedown', startDrag);
    elements.card.removeEventListener('touchstart', startDrag);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
}

// ==================== 开��拖拽 ====================
function startDrag(e) {
    if (gameState.isAnimating) return;

    e.preventDefault();

    // 获取起始位置
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    if (startX === undefined) return;

    isDragging = true;
    currentX = 0;

    // 禁用过渡效果以实现实时跟随
    elements.card.style.transition = 'none';
    elements.card.classList.add('dragging');

    // 添加移动和结束事件监听
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

// ==================== 拖拽中 ====================
function drag(e) {
    if (!isDragging || gameState.isAnimating) return;

    e.preventDefault();

    // 计算当前位移
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (clientX === undefined) return;

    currentX = clientX - startX;

    // 限制最大拖动距离
    const maxDrag = window.innerWidth * 0.4;
    currentX = Math.max(-maxDrag, Math.min(maxDrag, currentX));

    // 计算旋转角度（最大5度）
    const rotation = (currentX / maxDrag) * 5;

    // 应用变换
    elements.card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

    // 计算滑动进度（0-1）
    const progress = Math.min(Math.abs(currentX) / SWIPE_THRESHOLD, 1);

    // 更新箭头提示
    if (currentX < 0) {
        elements.swipeLeftHint.style.opacity = progress;
        elements.swipeRightHint.style.opacity = 0;
        // 左侧箭头放大
        elements.swipeLeftHint.style.transform = `scale(${0.8 + progress * 0.4})`;
    } else if (currentX > 0) {
        elements.swipeRightHint.style.opacity = progress;
        elements.swipeLeftHint.style.opacity = 0;
        // 右侧箭头放大
        elements.swipeRightHint.style.transform = `scale(${0.8 + progress * 0.4})`;
    } else {
        elements.swipeLeftHint.style.opacity = 0;
        elements.swipeRightHint.style.opacity = 0;
    }

    // 高亮对应按钮
    const btnLeft = elements.card.querySelector('.card-button-left');
    const btnRight = elements.card.querySelector('.card-button-right');

    if (currentX < -30) {
        highlightButton(btnLeft, true);
        highlightButton(btnRight, false);
    } else if (currentX > 30) {
        highlightButton(btnRight, true);
        highlightButton(btnLeft, false);
    } else {
        highlightButton(btnLeft, false);
        highlightButton(btnRight, false);
    }
}

// ==================== 按钮高亮 ====================
function highlightButton(btn, highlight) {
    if (highlight) {
        btn.style.transform = 'scale(1.08)';
        btn.style.boxShadow = '0 0 18px rgba(255, 255, 255, 0.5)';
    } else {
        btn.style.transform = '';
        btn.style.boxShadow = '';
    }
}

// ==================== 结束拖拽 ====================
function endDrag(e) {
    if (!isDragging || gameState.isAnimating) return;

    isDragging = false;
    elements.card.classList.remove('dragging');

    // 移除事件监听
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);

    // 重置按钮高亮
    const btnLeft = elements.card.querySelector('.card-button-left');
    const btnRight = elements.card.querySelector('.card-button-right');
    highlightButton(btnLeft, false);
    highlightButton(btnRight, false);

    const distance = Math.abs(currentX);

    console.log(`滑动距离: ${Math.round(distance)}px, 阈值: ${SWIPE_THRESHOLD}px`);

    if (distance >= SWIPE_THRESHOLD) {
        // 成功触发
        const direction = currentX > 0 ? '右' : '左';
        console.log(`触发: ${direction}`);

        if (currentX > 0) {
            executeSwipe('right', currentEvent.right.effect);
        } else {
            executeSwipe('left', currentEvent.left.effect);
        }
    } else {
        // 失败回弹
        console.log('触发: 失败 (距离不足)');
        snapBack();
    }
}

// ==================== 回弹动画 ====================
function snapBack() {
    elements.card.style.transition = 'transform 0.3s ease-out';
    elements.card.style.transform = 'translateX(0) rotate(0deg)';

    // 按钮抖动
    const buttons = elements.card.querySelectorAll('.card-button');
    buttons.forEach(btn => {
        btn.style.animation = 'shake 0.3s';
    });

    setTimeout(() => {
        buttons.forEach(btn => {
            btn.style.animation = '';
        });
        elements.swipeLeftHint.style.opacity = 0;
        elements.swipeRightHint.style.opacity = 0;
        elements.swipeLeftHint.style.transform = '';
        elements.swipeRightHint.style.transform = '';
    }, 300);
}

// ==================== 执行滑动 ====================
function executeSwipe(direction, effect) {
    if (gameState.isAnimating) return;
    gameState.isAnimating = true;

    // 清除事件监听
    removeEventListeners();

    const cardButtons = elements.card.querySelectorAll('.card-button');
    cardButtons.forEach(btn => btn.onclick = null);

    // 触觉反馈
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    // 屏幕闪白效果
    flashScreen();

    // 计算最终位置和旋转
    const endX = direction === 'right' ? '200%' : '-200%';
    const endRotation = direction === 'right' ? '8deg' : '-8deg';

    // 播放飞出动画
    elements.card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    elements.card.style.transform = `translateX(${endX}) rotate(${endRotation})`;

    // 按钮高亮
    const btn = direction === 'right'
        ? elements.card.querySelector('.card-button-right')
        : elements.card.querySelector('.card-button-left');
    highlightButton(btn, true);

    setTimeout(() => {
        // 应用选择效果
        applyChoiceEffect(effect);

        // 显示反馈消息
        showFeedback(`第${gameState.week}周 · 选择已生效`);

        // 检查游戏是否结束
        if (checkGameOver()) {
            return;
        }

        // 重置卡牌
        elements.card.style.transition = 'none';
        elements.card.style.transform = '';
        elements.card.style.opacity = '0';

        // 重置按钮
        highlightButton(btn, false);

        // 进入下一周
        gameState.week++;
        gameState.daysLeft -= 7;
        // 根据难度增加DDL压力
        const ddlConfig = DIFFICULTY_CONFIG[currentDifficulty].ddlMultiplier;
        gameState.ddlPressure += ddlConfig.min + Math.random() * (ddlConfig.max - ddlConfig.min);

        // 新卡入场动画
        setTimeout(() => {
            elements.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            elements.card.style.transform = 'scale(1)';
            elements.card.style.opacity = '1';

            setTimeout(() => {
                elements.card.style.transition = '';
            }, 300);
        }, 50);

        // 显示下一个事件
        nextEvent();
        gameState.isAnimating = false;
    }, 400);
}

// ==================== 屏幕闪白效果 ====================
function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.2s;
    `;
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 200);
    }, 50);
}

// ==================== 应用选择效果 ====================
function applyChoiceEffect(effect) {
    const config = DIFFICULTY_CONFIG[currentDifficulty];

    if (effect.E) {
        const change = effect.E < 0 ? effect.E * config.negativeMultiplier : effect.E * config.positiveMultiplier;
        gameState.energy = clamp(gameState.energy + change, 0, 100);
    }
    if (effect.A) {
        const change = effect.A < 0 ? effect.A * config.negativeMultiplier : effect.A * config.positiveMultiplier;
        gameState.academics = clamp(gameState.academics + change, 0, 100);
    }
    if (effect.C) {
        const change = effect.C < 0 ? effect.C * config.negativeMultiplier : effect.C * config.positiveMultiplier;
        gameState.connection = clamp(gameState.connection + change, 0, 100);
    }
    if (effect.S) {
        const change = effect.S < 0 ? effect.S * config.negativeMultiplier : effect.S * config.positiveMultiplier;
        gameState.self = clamp(gameState.self + change, 0, 100);
    }

    // 高压期额外扣减精力
    if (gameState.inHighPressurePeriod && effect.E < 0) {
        const extraLoss = effect.E * (config.highPressureEnergyMultiplier - 1);
        gameState.energy = clamp(gameState.energy + extraLoss, 0, 100);
    }
}

// ==================== 显示反馈消息 ====================
function showFeedback(message) {
    elements.feedbackMessage.textContent = message;
    elements.feedbackMessage.classList.add('show');

    setTimeout(() => {
        elements.feedbackMessage.classList.remove('show');
    }, 1500);
}

// ==================== 检查游戏是否结束 ====================
function checkGameOver() {
    if (gameState.energy <= 0) {
        endGame('energy');
        return true;
    }
    if (gameState.academics <= 0) {
        endGame('academics');
        return true;
    }
    if (gameState.connection <= 0) {
        endGame('connection');
        return true;
    }
    if (gameState.self <= 0) {
        endGame('self');
        return true;
    }
    return false;
}

// ==================== 结束游戏 ====================
function endGame(type) {
    gameState.gameOver = true;

    // 清理所有事件监听器
    removeEventListeners();

    // 清理卡片内按钮的事件
    const cardButtons = elements.card.querySelectorAll('.card-button');
    cardButtons.forEach(btn => btn.onclick = null);

    // 重置卡片状态
    elements.card.style.transition = '';
    elements.card.style.transform = '';
    elements.card.style.opacity = '';
    elements.card.classList.remove('dragging', 'swipe-left-complete', 'swipe-right-complete', 'entering', 'snap-back');

    // 重置提示箭头
    elements.swipeLeftHint.style.opacity = '0';
    elements.swipeRightHint.style.opacity = '0';
    elements.swipeLeftHint.style.transform = '';
    elements.swipeRightHint.style.transform = '';

    let ending;
    if (type === 'semester') {
        const avg = (gameState.energy + gameState.academics + gameState.connection + gameState.self) / 4;
        const maxStat = Math.max(gameState.energy, gameState.academics, gameState.connection, gameState.self);

        if (avg > 60) {
            ending = ENDINGS.semester.balanced;
        } else if (gameState.connection === maxStat) {
            ending = ENDINGS.semester.social;
        } else if (gameState.academics === maxStat) {
            ending = ENDINGS.semester.academic;
        } else if (gameState.self === maxStat) {
            ending = ENDINGS.semester.awakened;
        } else {
            ending = ENDINGS.semester.balanced;
        }
    } else {
        ending = ENDINGS[type];
    }

    if (ending.icon) {
        elements.endingIcon.textContent = ending.icon;
    }
    elements.endingTitle.textContent = ending.title;
    elements.endingText.textContent = ending.text;
    elements.endingStats.innerHTML = `
        <span>☕ ${Math.round(gameState.energy)}</span>
        <span>📖 ${Math.round(gameState.academics)}</span>
        <span>❤️ ${Math.round(gameState.connection)}</span>
        <span>🪞 ${Math.round(gameState.self)}</span>
    `;

    showScreen('ending');
}

// ==================== 更新状态进度条 ====================
function updateStatusDots() {
    const stats = {
        energy: gameState.energy,
        academics: gameState.academics,
        connection: gameState.connection,
        self: gameState.self
    };

    Object.keys(stats).forEach(statName => {
        const value = stats[statName];
        const elements = statusElements[statName];

        if (elements.fill && elements.dot) {
            // 更新填充条宽度
            elements.fill.style.width = `${value}%`;

            // 更新圆点位置
            elements.dot.style.left = `calc(${value}% - 7px)`;

            // 低值时添加淡色效果
            if (value <= 30) {
                elements.fill.classList.add('low');
            } else {
                elements.fill.classList.remove('low');
            }
        }
    });
}

// ==================== 限制数值范围 ====================
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==================== 键盘控制 ====================
document.addEventListener('keydown', (e) => {
    if (!elements.gameScreen.classList.contains('active') || gameState.isAnimating) return;

    if (e.key === 'ArrowLeft' && currentEvent) {
        executeSwipe('left', currentEvent.left.effect);
    } else if (e.key === 'ArrowRight' && currentEvent) {
        executeSwipe('right', currentEvent.right.effect);
    }
});

// ==================== 按钮点击事件 ====================
function setupButtonHandlers() {
    const btnLeft = elements.card.querySelector('.card-button-left');
    const btnRight = elements.card.querySelector('.card-button-right');

    if (btnLeft) {
        btnLeft.onclick = () => {
            if (!gameState.isAnimating && currentEvent) {
                executeSwipe('left', currentEvent.left.effect);
            }
        };
    }

    if (btnRight) {
        btnRight.onclick = () => {
            if (!gameState.isAnimating && currentEvent) {
                executeSwipe('right', currentEvent.right.effect);
            }
        };
    }
}

// ==================== 初始化事件绑定 ====================
elements.startBtn.addEventListener('click', () => {
    currentDifficulty = 'standard'; // 重置为标准难度
    updateDifficultyPreview('standard');
    showScreen('difficulty');
});
elements.restartBtn.addEventListener('click', () => {
    // 保持当前难度，直接重新开始游戏
    initGame(currentDifficulty);
});

// ==================== 难度选择相关函数 ====================
function updateDifficultyPreview(difficulty) {
    const config = DIFFICULTY_CONFIG[difficulty];
    elements.previewIcon.textContent = config.icon;
    elements.previewName.textContent = config.name;
    elements.previewDesc.textContent = config.hint || config.description;

    // 更新按钮选中状态
    [elements.diffEasyBtn, elements.diffStandardBtn, elements.diffHardBtn].forEach(btn => {
        btn.classList.remove('selected');
    });

    switch(difficulty) {
        case 'easy':
            elements.diffEasyBtn.classList.add('selected');
            break;
        case 'standard':
            elements.diffStandardBtn.classList.add('selected');
            break;
        case 'hard':
            elements.diffHardBtn.classList.add('selected');
            break;
    }
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    updateDifficultyPreview(difficulty);
}

function startGameWithDifficulty() {
    // 卡牌飞出动画
    elements.difficultyCard.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    elements.difficultyCard.style.transform = 'translateY(-100vh) rotate(10deg)';
    elements.difficultyCard.style.opacity = '0';

    setTimeout(() => {
        // 重置难度卡牌状态
        elements.difficultyCard.style.transition = '';
        elements.difficultyCard.style.transform = '';
        elements.difficultyCard.style.opacity = '';

        // 初始化游戏
        initGame(currentDifficulty);
    }, 500);
}

// 难度按钮事件
elements.diffEasyBtn.addEventListener('click', () => selectDifficulty('easy'));
elements.diffStandardBtn.addEventListener('click', () => selectDifficulty('standard'));
elements.diffHardBtn.addEventListener('click', () => selectDifficulty('hard'));
elements.confirmDifficultyBtn.addEventListener('click', startGameWithDifficulty);

// 回到难度选择按钮事件
elements.backToDifficultyBtn.addEventListener('click', () => {
    // 清理游戏状态
    removeEventListeners();
    showScreen('difficulty');
});

// 每次显示新事件时设置按钮处理器
const originalNextEvent = nextEvent;
nextEvent = function() {
    originalNextEvent();
    setupButtonHandlers();
};

// ==================== 初始显示开始界面 ====================
showScreen('start');
// 初始化难度预览
updateDifficultyPreview('standard');
