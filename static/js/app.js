/* ============================================
   Main Application Module - Enhanced
   Spirit Assistant Intro, Talking Tom Pet Home
   ============================================ */

const App = {
    currentScreen: 'main-menu',
    gameState: {
        player: { name: '', points: 0 },
        pet: null,
        pets: [],
        inventory: [],
        achievements: [],
        students: [],
        classroom_stats: {}
    },
    playerScene: null,
    playerRenderer: null,
    playerCamera: null,
    playerPet: null,
    animationFrameId: null,
    spiritCleanup: null,
    petSpeechTimer: null,
    mousePos: { x: 0, y: 0 },
    isDragging: false,

    async init() {
        await this.loadState();
        this.bindEvents();

        if (!this.gameState.player.name) {
            this.showSpiritIntro();
        } else if (!this.gameState.pet) {
            this.showSpiritPetSelect();
        } else {
            this.showScreen('main-menu');
        }

        document.getElementById('loading-screen').classList.add('hidden');
        this.startAmbientParticles();
    },

    async api(url, options = {}) {
        const res = await fetch(url, options);
        return res.json();
    },

    async loadState() {
        try {
            const data = await this.api('/api/state');
            if (data.player) this.gameState.player = data.player;
            if (data.pet) this.gameState.pet = data.pet;
            if (data.pets) this.gameState.pets = data.pets;
            if (data.inventory) this.gameState.inventory = data.inventory;
            if (data.achievements) this.gameState.achievements = data.achievements;
            if (data.students) this.gameState.students = data.students;
            if (data.classroom_stats) this.gameState.classroom_stats = data.classroom_stats;
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    },

    bindEvents() {
        document.getElementById('btn-classroom')?.addEventListener('click', () => {
            Classroom.init();
            this.showScreen('classroom-screen');
        });
        document.getElementById('btn-adventure')?.addEventListener('click', () => this.showScreen('pet-home'));
        document.getElementById('btn-battle')?.addEventListener('click', () => this.startBattle('pve'));
        document.getElementById('btn-pvp')?.addEventListener('click', () => this.startBattle('pvp'));
        document.getElementById('btn-shop')?.addEventListener('click', () => { Shop.init(); this.showScreen('shop-screen'); });
        document.getElementById('btn-pets')?.addEventListener('click', () => { this.showPetsScreen(); });
        document.getElementById('btn-ranking')?.addEventListener('click', () => { Ranking.init(); this.showScreen('ranking-screen'); });
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettings(false));

        document.getElementById('btn-back-home')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-back-shop')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-back-inventory')?.addEventListener('click', () => this.showScreen('pet-home'));
        document.getElementById('btn-back-ranking')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-back-pets')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-back-battle')?.addEventListener('click', () => { Battle.endBattle(); this.showScreen('main-menu'); });
        document.getElementById('btn-back-classroom')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-back-settings')?.addEventListener('click', () => this.showScreen('main-menu'));

        document.getElementById('btn-feed')?.addEventListener('click', () => this.feedPet());
        document.getElementById('btn-play')?.addEventListener('click', () => this.playWithPet());
        document.getElementById('btn-battle-wild')?.addEventListener('click', () => this.startBattle('pve'));
        document.getElementById('btn-inventory')?.addEventListener('click', () => { Inventory.init(); this.showScreen('inventory-screen'); });

        document.getElementById('btn-save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('btn-reset-game')?.addEventListener('click', () => this.resetGame());

        // Track mouse for pet eye following
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            setTimeout(() => screen.classList.add('active'), 10);
        }

        this.currentScreen = screenId;

        if (screenId === 'pet-home') {
            this.initPetScene();
        } else {
            this.stopPetScene();
        }
    },

    // ========== SPIRIT ASSISTANT INTRO ==========
    showSpiritIntro() {
        this.showScreen('spirit-intro-screen');

        // Start spirit particles
        this.spiritCleanup = Effects.createSpiritParticles('spirit-particles');

        const dialogues = [
            '你好呀，勇敢的冒险者！我是星光精灵 ⭐',
            '欢迎来到「精灵宝贝」的奇妙世界！',
            '在这里，你将拥有一只属于自己的神奇宠物伙伴 🐾',
            '你可以和宠物一起玩耍、喂食、参加激动人心的战斗！',
            '作为一名优秀的老师，你还能管理班级，用积分培养学生们的宠物哦！',
            '每位同学都可以领养自己的宠物，在排行榜上一较高下！',
            '那么，你准备好开始冒险了吗？先告诉我你的名字吧！',
        ];

        let dialogueIndex = 0;
        const textEl = document.getElementById('dialogue-text');
        const nextBtn = document.getElementById('spirit-next');
        const orb = document.getElementById('spirit-orb');

        const typeText = (text, callback) => {
            textEl.textContent = '';
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    textEl.textContent += text[i];
                    i++;
                } else {
                    clearInterval(interval);
                    if (callback) callback();
                }
            }, 40);
        };

        const showNext = () => {
            nextBtn.style.display = 'block';
        };

        typeText(dialogues[0], showNext);

        nextBtn.onclick = () => {
            dialogueIndex++;
            nextBtn.style.display = 'none';

            if (dialogueIndex < dialogues.length) {
                // Orb pulse
                orb.classList.add('pulse');
                setTimeout(() => orb.classList.remove('pulse'), 500);
                typeText(dialogues[dialogueIndex], showNext);
            } else {
                // End of dialogues - show name input or pet select
                this.spiritAskName();
            }
        };
    },

    spiritAskName() {
        const textEl = document.getElementById('dialogue-text');
        const nextBtn = document.getElementById('spirit-next');
        const container = document.querySelector('.spirit-container');

        textEl.innerHTML = `
            <div style="margin-bottom:15px;">请告诉我你的名字，冒险者！</div>
            <input type="text" id="spirit-name-input" class="spirit-name-input" 
                   placeholder="输入你的名字" maxlength="20" autofocus>
        `;

        const input = document.getElementById('spirit-name-input');
        input?.focus();

        nextBtn.textContent = '确认 ✨';
        nextBtn.style.display = 'block';
        nextBtn.onclick = async () => {
            const name = input?.value?.trim();
            if (!name) {
                this.showToast('请输入你的名字', 'error');
                return;
            }

            try {
                const res = await this.api('/api/update_player', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });

                if (res.success) {
                    this.gameState.player = res.player;
                    this.updateUI();
                    if (this.spiritCleanup) this.spiritCleanup();
                    this.showSpiritPetSelect();
                }
            } catch (e) {
                this.showToast('保存失败', 'error');
            }
        };
    },

    showSpiritPetSelect() {
        this.showScreen('spirit-pet-select');
        this.showPetSelectGrid();
    },

    // ========== PET SCENE (Talking Tom Style) ==========
    initPetScene() {
        const canvas = document.getElementById('pet-canvas');
        if (!canvas) return;

        if (this.playerRenderer) {
            this.stopPetScene();
        }

        this.playerScene = new THREE.Scene();
        this.playerCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        this.playerCamera.position.set(0, 1.5, 5);
        this.playerCamera.lookAt(0, 0.5, 0);

        this.playerRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.playerRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.playerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.playerRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.playerRenderer.toneMappingExposure = 1.2;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
        this.playerScene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 8, 5);
        this.playerScene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x6c5ce7, 0.4);
        fillLight.position.set(-3, 2, -3);
        this.playerScene.add(fillLight);

        const rimLight = new THREE.PointLight(0xa29bfe, 0.8, 10);
        rimLight.position.set(0, 3, -3);
        this.playerScene.add(rimLight);

        // Ground
        const groundGeo = new THREE.CircleGeometry(3, 32);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x2d3436, metalness: 0.3, roughness: 0.8,
            transparent: true, opacity: 0.5
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        this.playerScene.add(ground);

        // Day/night cycle background
        const hour = new Date().getHours();
        let bgColor;
        if (hour >= 6 && hour < 10) bgColor = 0x1a2a4a; // Morning
        else if (hour >= 10 && hour < 16) bgColor = 0x1a1a2e; // Day
        else if (hour >= 16 && hour < 19) bgColor = 0x2a1a2e; // Sunset
        else bgColor = 0x0a0a1a; // Night
        this.playerScene.background = new THREE.Color(bgColor);

        if (this.gameState.pet) {
            this.playerPet = Pets3D.createPet(this.playerScene, this.gameState.pet.type, this.gameState.pet);
        }

        Effects.createAmbientParticles(this.playerScene, this.gameState.pet?.type || 'default');

        // Click interaction
        canvas.onclick = (e) => this.onPetClick(e);

        // Drag petting
        let dragStartY = 0;
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            dragStartY = e.clientY;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.playerPet) {
                const dy = Math.abs(e.clientY - dragStartY);
                if (dy > 20) {
                    this.playerPet.playAnimation('happy', 800);
                    this.addMood(1);
                    dragStartY = e.clientY;
                }
            }
        });
        canvas.addEventListener('mouseup', () => { this.isDragging = false; });
        canvas.addEventListener('mouseleave', () => { this.isDragging = false; });

        // Random speech bubble
        this.startPetSpeech();
        this.animatePetScene();
    },

    stopPetScene() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.playerRenderer) {
            this.playerRenderer.dispose();
            this.playerRenderer = null;
        }
        this.playerScene = null;
        this.playerPet = null;
        clearInterval(this.petSpeechTimer);
    },

    animatePetScene() {
        if (!this.playerScene || !this.playerRenderer) return;

        const animate = (time) => {
            this.animationFrameId = requestAnimationFrame(animate);
            if (this.playerPet) {
                this.playerPet.animate(time);

                // Pet follows mouse with head
                const canvas = document.getElementById('pet-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const mx = ((this.mousePos.x - rect.left) / rect.width - 0.5) * 2;
                    const my = ((this.mousePos.y - rect.top) / rect.height - 0.5) * -2;
                    const head = this.playerPet.group.getObjectByName('head');
                    if (head) {
                        head.rotation.y = mx * 0.3;
                        head.rotation.x = my * 0.15;
                    }
                }
            }
            this.playerScene.children.forEach(child => {
                if (child.userData.animate) child.userData.animate(time);
            });
            Effects.updateFloatingTexts();
            Effects.updateParticles();
            Effects.applyShake(this.playerCamera);
            this.playerRenderer.render(this.playerScene, this.playerCamera);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    },

    onPetClick(event) {
        if (!this.playerScene || !this.playerCamera) return;

        const canvas = document.getElementById('pet-canvas');
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.playerCamera);

        if (this.playerPet) {
            const intersects = raycaster.intersectObjects(this.playerPet.group.children, true);
            if (intersects.length > 0) {
                // Random reactions
                const reactions = ['happy', 'happy', 'surprised'];
                const anim = reactions[Math.floor(Math.random() * reactions.length)];
                this.playerPet.playAnimation(anim, 1500);
                Effects.createSparkles(this.playerScene, this.playerPet.group.position, '#f1c40f', 10);
                this.addMood(3);
                this.showPetSpeech();
            }
        }
    },

    // ========== PET SPEECH BUBBLES ==========
    petPhrases: [
        '汪汪！😊', '主人陪我玩嘛~', '我饿了！🍎', '好开心呀！✨',
        '今天天气真好！', '我想出去冒险！', '摸摸头~', '抱抱！🤗',
        '嘿嘿~', '我最厉害了！', '⭐ 给我积分！', '我喜欢你！❤️',
        '我们去战斗吧！', '呜呜~ 好无聊', '想吃蛋糕！🎂',
        '我是最棒的宠物！', '冲鸭！💪', '呼呼~ 午睡时间',
    ],

    startPetSpeech() {
        // Random speech every 8-15 seconds
        const showRandom = () => {
            if (this.currentScreen === 'pet-home' && Math.random() > 0.4) {
                this.showPetSpeech();
            }
        };
        this.petSpeechTimer = setInterval(showRandom, 8000 + Math.random() * 7000);
        // Initial speech
        setTimeout(() => this.showPetSpeech(), 2000);
    },

    showPetSpeech() {
        const bubble = document.getElementById('pet-speech-bubble');
        const textEl = document.getElementById('speech-text');
        if (!bubble || !textEl) return;

        const phrase = this.petPhrases[Math.floor(Math.random() * this.petPhrases.length)];
        textEl.textContent = phrase;
        bubble.style.display = 'block';
        bubble.style.animation = 'speechIn 0.3s ease';

        clearTimeout(this._speechTimeout);
        this._speechTimeout = setTimeout(() => {
            bubble.style.animation = 'speechOut 0.3s ease forwards';
            setTimeout(() => { bubble.style.display = 'none'; }, 300);
        }, 3000);
    },

    startAmbientParticles() {
        const canvas = document.getElementById('menu-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 0.3 - 0.1,
                radius: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                color: ['#6c5ce7', '#a29bfe', '#fd79a8', '#00cec9', '#fdcb6e'][Math.floor(Math.random() * 5)]
            });
        }

        const animateMenu = () => {
            if (this.currentScreen !== 'main-menu') {
                requestAnimationFrame(animateMenu);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            requestAnimationFrame(animateMenu);
        };
        animateMenu();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    },

    updateUI() {
        const nameEls = document.querySelectorAll('.player-name');
        const pointsEls = document.querySelectorAll('.player-points');
        nameEls.forEach(el => el.textContent = this.gameState.player.name || '训练师');
        pointsEls.forEach(el => el.textContent = this.gameState.player.points || 0);

        if (this.gameState.pet) {
            const pet = this.gameState.pet;
            document.querySelectorAll('.pet-name-display').forEach(el => el.textContent = pet.name);

            const typeNames = {
                dragon: '火', fox: '冰', bear: '电', rabbit: '自然', cat: '暗', angel: '光',
                phoenix: '火', krystal: '水', tiger: '电', sprite: '自然', wolf: '暗', unicorn: '光'
            };
            document.querySelectorAll('.pet-type-badge').forEach(el => {
                el.textContent = typeNames[pet.type] || pet.type;
                el.className = `pet-type-badge ${pet.type}`;
            });

            this.updateStatBar('hp', pet.hp, pet.max_hp);
            this.updateStatBar('exp', pet.exp, pet.exp_to_next);
            this.updateStatBar('mood', pet.mood || 100, 100);

            // Update stat text
            document.querySelectorAll('.hp-text').forEach(el => el.textContent = `${pet.hp}/${pet.max_hp}`);
            document.querySelectorAll('.exp-text').forEach(el => el.textContent = `${pet.exp || 0}/${pet.exp_to_next || 50}`);
            document.querySelectorAll('.mood-text').forEach(el => el.textContent = `${pet.mood || 100}%`);
        }

        const shopPoints = document.getElementById('shop-points');
        if (shopPoints) shopPoints.textContent = this.gameState.player.points || 0;
    },

    updateStatBar(type, current, max) {
        const bars = document.querySelectorAll(`.stat-bar.${type}`);
        const pct = Math.min(100, (current / max) * 100);
        bars.forEach(bar => bar.style.width = pct + '%');
    },

    async feedPet() {
        try {
            const res = await this.api('/api/feed', { method: 'POST' });
            if (res.success) {
                this.gameState.pet = res.pet;
                this.updateUI();
                if (this.playerPet) this.playerPet.playAnimation('happy', 1500);
                Effects.createSparkles(this.playerScene, this.playerPet?.group?.position || new THREE.Vector3(), '#fdcb6e', 15);
                this.showToast('宠物吃得很开心！心情+10', 'success');
                this.showPetSpeech();
            } else {
                this.showToast(res.message || '喂食失败', 'error');
            }
        } catch (e) {
            this.showToast('喂食失败', 'error');
        }
    },

    async playWithPet() {
        try {
            const res = await this.api('/api/play', { method: 'POST' });
            if (res.success) {
                this.gameState.pet = res.pet;
                this.updateUI();
                if (this.playerPet) this.playerPet.playAnimation('happy', 2000);
                Effects.createSparkles(this.playerScene, this.playerPet?.group?.position || new THREE.Vector3(), '#fd79a8', 20);
                this.showToast('和宠物玩耍真开心！心情+15', 'success');
                this.showPetSpeech();
            } else {
                this.showToast(res.message || '玩耍失败', 'error');
            }
        } catch (e) {
            this.showToast('玩耍失败', 'error');
        }
    },

    async addMood(amount) {
        try {
            await this.api('/api/add_mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            await this.loadState();
            this.updateUI();
        } catch (e) {}
    },

    async startBattle(mode) {
        try {
            const res = await this.api('/api/start_battle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode })
            });

            if (res.success) {
                Battle.init(res.player_pet, res.enemy_pet, mode);
                this.showScreen('battle-screen');
            } else {
                this.showToast(res.message || '无法开始战斗', 'error');
            }
        } catch (e) {
            this.showToast('战斗初始化失败', 'error');
        }
    },

    showPetsScreen() {
        const grid = document.getElementById('pets-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const allTypes = Pets3D.petTypes;
        const ownedPets = this.gameState.pets || [];
        const activePetId = this.gameState.pet?.id;

        const petEmojis = {
            dragon: '🐉', fox: '🦊', bear: '🐻', rabbit: '🐰', cat: '🐱', angel: '👼',
            phoenix: '🔥', krystal: '🐬', tiger: '🐯', sprite: '🌿', wolf: '🐺', unicorn: '🦄'
        };

        for (const [type, info] of Object.entries(allTypes)) {
            const owned = ownedPets.find(p => p.type === type);
            const card = document.createElement('div');
            card.className = `pet-card ${owned ? '' : 'locked'} ${owned?.id === activePetId ? 'active' : ''}`;

            card.innerHTML = `
                <div class="pet-card-icon">${petEmojis[type] || '🐾'}</div>
                <div class="pet-card-name">${owned ? owned.name : info.name}</div>
                <div class="pet-card-type">${info.name}</div>
                ${owned ? `
                    <div class="pet-card-level">Lv.${owned.level}</div>
                    <div class="pet-card-cp">⚔️ ${owned.combat_power || 0}</div>
                ` : '<div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">🔒 未获得</div>'}
            `;

            if (owned) {
                card.onclick = () => this.switchPet(owned.id);
            }

            grid.appendChild(card);
        }

        this.showScreen('pets-screen');
    },

    async switchPet(petId) {
        try {
            const res = await this.api('/api/switch_pet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pet_id: petId })
            });

            if (res.success) {
                this.gameState.pet = res.pet;
                this.updateUI();
                this.showPetsScreen();
                this.showToast(`切换到 ${res.pet.name}！`, 'success');
            }
        } catch (e) {
            this.showToast('切换宠物失败', 'error');
        }
    },

    showSettings(isFirstTime) {
        const nameInput = document.getElementById('settings-name');
        if (nameInput) nameInput.value = this.gameState.player.name || '';

        const settingsTitle = document.querySelector('.settings-title');
        if (settingsTitle && isFirstTime) settingsTitle.textContent = '欢迎来到宠物大冒险！';

        this.showScreen('settings-screen');
    },

    showPetSelect() {
        this.showPetSelectGrid();
        this.showScreen('spirit-pet-select');
    },

    showPetSelectGrid() {
        const grid = document.getElementById('pet-select-grid');
        if (!grid) return;

        const pets = [
            { type: 'dragon', name: '龙宝宝', emoji: '🐉', element: '火', desc: '高攻击，火焰吐息', color: '#e74c3c', rarity: '传说' },
            { type: 'fox', name: '冰晶狐', emoji: '🦊', element: '冰', desc: '高速度，冰晶射线', color: '#74b9ff', rarity: '史诗' },
            { type: 'bear', name: '雷霆熊', emoji: '🐻', element: '电', desc: '高体力，雷电爪', color: '#f1c40f', rarity: '史诗' },
            { type: 'rabbit', name: '花灵兔', emoji: '🐰', element: '自然', desc: '会回复，藤鞭', color: '#2ecc71', rarity: '稀有' },
            { type: 'cat', name: '暗影猫', emoji: '🐱', element: '暗', desc: '高速高攻，暗影爪', color: '#8e44ad', rarity: '史诗' },
            { type: 'angel', name: '光明天使', emoji: '👼', element: '光', desc: '均衡型，圣光弹', color: '#f39c12', rarity: '传说' },
            { type: 'phoenix', name: '凤凰雏鸟', emoji: '🔥', element: '火', desc: '涅槃重生，浴火而战', color: '#ff6348', rarity: '传说' },
            { type: 'krystal', name: '水灵海马', emoji: '🐬', element: '水', desc: '深海治愈，潮汐之力', color: '#0984e3', rarity: '稀有' },
            { type: 'tiger', name: '雷纹虎', emoji: '🐯', element: '电', desc: '闪电突袭，雷纹之力', color: '#ffa502', rarity: '史诗' },
            { type: 'sprite', name: '木灵小妖', emoji: '🌿', element: '自然', desc: '生命之泉，自然守护', color: '#00b894', rarity: '优秀' },
            { type: 'wolf', name: '暗月狼', emoji: '🐺', element: '暗', desc: '月影突袭，暗月之力', color: '#6c5ce7', rarity: '史诗' },
            { type: 'unicorn', name: '星光独角兽', emoji: '🦄', element: '光', desc: '星光治愈，彩虹护盾', color: '#ffeaa7', rarity: '传说' },
        ];

        grid.innerHTML = '';
        pets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'pet-select-card';
            card.style.cssText = `
                background: linear-gradient(135deg, rgba(${this.hexToRgb(pet.color)},0.2), rgba(0,0,0,0.3));
                border: 2px solid ${pet.color}40;
                border-radius: 16px; padding: 15px; cursor: pointer;
                text-align: center; transition: all 0.3s; width: 140px;
            `;
            card.innerHTML = `
                <div style="font-size:2.5rem;margin-bottom:5px;">${pet.emoji}</div>
                <div style="font-size:1rem;font-weight:700;color:${pet.color};margin-bottom:3px;">${pet.name}</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.5);margin-bottom:2px;">${pet.rarity} · ${pet.element}系</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);">${pet.desc}</div>
            `;
            card.onmouseenter = () => { card.style.transform = 'scale(1.08)'; card.style.borderColor = pet.color; };
            card.onmouseleave = () => { card.style.transform = 'scale(1)'; card.style.borderColor = pet.color + '40'; };
            card.onclick = () => this.selectFirstPet(pet.type);
            grid.appendChild(card);
        });
    },

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    },

    async selectFirstPet(petType) {
        try {
            const res = await this.api('/api/create_pet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pet_type: petType })
            });
            if (res.success) {
                this.gameState.pet = res.pet;
                this.gameState.pets = [res.pet];
                this.updateUI();
                this.showToast(`🎉 ${res.pet.name} 成为了你的伙伴！`, 'success');
                if (res.new_achievements?.length > 0) {
                    res.new_achievements.forEach((a, i) => setTimeout(() => this.showAchievement(a.name, a.icon), 1000 + i * 1500));
                }
                if (this.spiritCleanup) this.spiritCleanup();
                this.showScreen('main-menu');
            } else {
                this.showToast(res.message || '选择失败', 'error');
            }
        } catch (e) {
            this.showToast('选择宠物失败', 'error');
        }
    },

    async saveSettings() {
        const name = document.getElementById('settings-name')?.value?.trim();
        if (!name) {
            this.showToast('请输入你的名字', 'error');
            return;
        }

        try {
            const res = await this.api('/api/update_player', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (res.success) {
                this.gameState.player = res.player;
                this.updateUI();
                this.showToast('设置保存成功！', 'success');
                if (!this.gameState.pet) {
                    this.showSpiritPetSelect();
                } else {
                    this.showScreen('main-menu');
                }
            }
        } catch (e) {
            this.showToast('保存设置失败', 'error');
        }
    },

    async resetGame() {
        const confirmed = await this.showConfirm(
            '⚠️ 重置游戏',
            '确定要重置所有游戏数据吗？此操作不可恢复！'
        );

        if (!confirmed) return;

        try {
            await this.api('/api/reset', { method: 'POST' });
            location.reload();
        } catch (e) {
            this.showToast('重置失败', 'error');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    },

    showConfirm(title, message) {
        return new Promise(resolve => {
            const overlay = document.getElementById('modal-overlay');
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const okBtn = document.getElementById('modal-ok');
            const cancelBtn = document.getElementById('modal-cancel');

            if (!overlay) { resolve(false); return; }

            titleEl.textContent = title;
            bodyEl.textContent = message;
            overlay.classList.add('active');

            const cleanup = (result) => {
                overlay.classList.remove('active');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                resolve(result);
            };

            const onOk = () => cleanup(true);
            const onCancel = () => cleanup(false);

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
        });
    },

    showAchievement(name, icon = '🏆') {
        const popup = document.getElementById('achievement-popup');
        if (!popup) return;

        popup.querySelector('.achievement-icon').textContent = icon;
        popup.querySelector('.achievement-name').textContent = name;
        popup.classList.add('active');

        setTimeout(() => popup.classList.remove('active'), 3000);
    }
};

// Boot
window.addEventListener('DOMContentLoaded', () => App.init());
