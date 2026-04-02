/* ============================================
   Battle System Module
   ============================================ */

const Battle = {
    mode: 'pve',
    playerPet: null,
    enemyPet: null,
    battleScene: null,
    battleRenderer: null,
    battleCamera: null,
    playerModel: null,
    enemyModel: null,
    isActive: false,
    animationFrameId: null,
    turnLocked: false,

    init(playerPet, enemyPet, mode = 'pve') {
        this.playerPet = playerPet;
        this.enemyPet = enemyPet;
        this.mode = mode;
        this.isActive = true;
        this.turnLocked = false;

        this.initBattleScene();
        this.updateBattleUI();
        this.addBattleLog(`⚔️ 战斗开始！${playerPet.name} vs ${enemyPet.name}`, 'start');
        this.setTurnState(true);
    },

    initBattleScene() {
        const canvas = document.getElementById('battle-canvas');
        if (!canvas) return;

        // Clean up existing
        if (this.battleRenderer) {
            this.battleRenderer.dispose();
        }

        this.battleScene = new THREE.Scene();
        this.battleCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        this.battleCamera.position.set(0, 3, 6);
        this.battleCamera.lookAt(0, 0.5, 0);

        this.battleRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.battleRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.battleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.battleRenderer.toneMapping = THREE.ACESFilmicToneMapping;

        // Background gradient
        this.battleScene.background = new THREE.Color(0x1a1a2e);

        // Lighting
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.battleScene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 8, 5);
        this.battleScene.add(dirLight);

        const pointLight = new THREE.PointLight(0x6c5ce7, 0.6, 15);
        pointLight.position.set(0, 4, 0);
        this.battleScene.add(pointLight);

        // Arena floor
        const arenaGeo = new THREE.CircleGeometry(4, 32);
        const arenaMat = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.5,
            roughness: 0.3,
            transparent: true,
            opacity: 0.7,
        });
        const arena = new THREE.Mesh(arenaGeo, arenaMat);
        arena.rotation.x = -Math.PI / 2;
        this.battleScene.add(arena);

        // Arena ring
        const ringGeo = new THREE.TorusGeometry(4, 0.05, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.01;
        this.battleScene.add(ring);

        // Center line
        const lineGeo = new THREE.PlaneGeometry(0.02, 8);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x636e72, transparent: true, opacity: 0.4 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        this.battleScene.add(line);

        // Create pet models
        if (this.playerPet) {
            this.playerModel = Pets3D.createPet(this.battleScene, this.playerPet.type, this.playerPet);
            this.playerModel.group.position.set(-2, 0, 0.5);
        }

        if (this.enemyPet) {
            this.enemyModel = Pets3D.createPet(this.battleScene, this.enemyPet.type, this.enemyPet);
            this.enemyModel.group.position.set(2, 0, 0.5);
            this.enemyModel.group.rotation.y = Math.PI; // Face player
        }

        // Particle effects
        Effects.createAmbientParticles(this.battleScene, this.playerPet?.type || 'default');

        this.animateBattle();
    },

    animateBattle() {
        if (!this.battleScene || !this.battleRenderer) return;

        const animate = (time) => {
            this.animationFrameId = requestAnimationFrame(animate);

            if (this.playerModel) this.playerModel.animate(time);
            if (this.enemyModel) this.enemyModel.animate(time);

            // Animate particles
            this.battleScene.children.forEach(child => {
                if (child.userData.animate) child.userData.animate(time);
            });

            Effects.updateFloatingTexts();
            Effects.updateParticles();
            Effects.applyShake(this.battleCamera);

            this.battleRenderer.render(this.battleScene, this.battleCamera);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    },

    endBattle() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.battleRenderer) {
            this.battleRenderer.dispose();
            this.battleRenderer = null;
        }
        this.battleScene = null;
        this.playerModel = null;
        this.enemyModel = null;
    },

    updateBattleUI() {
        // Player info
        const petEmojis = {
            dragon: '🐉', fox: '🦊', bear: '🐻',
            rabbit: '🐰', cat: '🐱', angel: '👼'
        };

        const playerInfo = document.querySelector('.battle-pet-info:not(.enemy)');
        if (playerInfo && this.playerPet) {
            playerInfo.querySelector('div[style]').textContent = petEmojis[this.playerPet.type] || '🐾';
            playerInfo.querySelector('.battle-pet-name').textContent = this.playerPet.name;
            playerInfo.querySelector('.battle-level').textContent = `Lv.${this.playerPet.level}`;
        }

        // Enemy info
        const enemyInfo = document.querySelector('.battle-pet-info.enemy');
        if (enemyInfo && this.enemyPet) {
            enemyInfo.querySelector('div[style]').textContent = petEmojis[this.enemyPet.type] || '🐾';
            enemyInfo.querySelector('.battle-pet-name').textContent = this.enemyPet.name;
            enemyInfo.querySelector('.battle-level').textContent = `Lv.${this.enemyPet.level}`;
        }

        this.updateHPBars();
    },

    updateHPBars() {
        if (!this.playerPet || !this.enemyPet) return;

        const playerPct = Math.max(0, (this.playerPet.hp / this.playerPet.max_hp) * 100);
        const enemyPct = Math.max(0, (this.enemyPet.hp / this.enemyPet.max_hp) * 100);

        const playerBar = document.getElementById('player-hp-bar');
        const enemyBar = document.getElementById('enemy-hp-bar');
        const playerText = document.getElementById('player-hp-text');
        const enemyText = document.getElementById('enemy-hp-text');

        if (playerBar) {
            playerBar.style.width = playerPct + '%';
            playerBar.className = 'battle-hp-bar' + (playerPct < 30 ? ' danger' : playerPct < 60 ? ' warning' : '');
        }
        if (playerText) playerText.textContent = `${this.playerPet.hp}/${this.playerPet.max_hp}`;

        if (enemyBar) {
            enemyBar.style.width = enemyPct + '%';
            enemyBar.className = 'battle-hp-bar' + (enemyPct < 30 ? ' danger' : enemyPct < 60 ? ' warning' : '');
        }
        if (enemyText) enemyText.textContent = `${this.enemyPet.hp}/${this.enemyPet.max_hp}`;
    },

    setTurnState(isPlayerTurn) {
        this.turnLocked = !isPlayerTurn;
        const indicator = document.getElementById('turn-indicator');
        const actions = document.getElementById('battle-actions');

        if (indicator) {
            indicator.textContent = isPlayerTurn ? '你的回合' : '对手回合...';
            indicator.classList.toggle('active', isPlayerTurn);
        }

        if (actions) {
            actions.style.pointerEvents = isPlayerTurn ? 'auto' : 'none';
            actions.style.opacity = isPlayerTurn ? '1' : '0.5';
        }
    },

    addBattleLog(text, type = 'info') {
        const container = document.getElementById('battle-log');
        if (!container) return;

        const entry = document.createElement('div');
        entry.className = `battle-log-entry ${type}`;
        entry.textContent = text;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;

        // Auto-fade old entries
        if (container.children.length > 10) {
            container.children[0]?.remove();
        }
    },

    async playerAction(action, skillIndex = 0) {
        if (!this.isActive || this.turnLocked) return;

        this.turnLocked = true;
        this.setTurnState(false);

        try {
            const res = await App.api('/api/battle_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, skill_index: skillIndex }),
            });

            if (!res.success) {
                App.showToast(res.message || '战斗动作失败', 'error');
                this.setTurnState(true);
                return;
            }

            // Process logs
            for (const log of res.logs) {
                this.addBattleLog(log.text, log.type);

                // Visual effects
                if (log.type === 'player' && log.damage) {
                    // Player attacks enemy
                    if (this.playerModel) this.playerModel.playAnimation('attack', 600);
                    setTimeout(() => {
                        Effects.shake(log.crit ? 12 : 6);
                        if (this.enemyModel) {
                            Effects.createHitEffect(
                                this.battleScene,
                                this.enemyModel.group.position,
                                log.element || 'normal'
                            );
                            if (log.crit) {
                                Effects.createFloatingText(
                                    this.battleScene,
                                    `💥 ${log.damage}`,
                                    this.enemyModel.group.position,
                                    '#fdcb6e',
                                    1.5
                                );
                            } else {
                                Effects.createFloatingText(
                                    this.battleScene,
                                    `-${log.damage}`,
                                    this.enemyModel.group.position,
                                    '#ff7675'
                                );
                            }
                        }
                    }, 300);
                }

                if (log.type === 'enemy' && log.damage) {
                    // Enemy attacks player
                    setTimeout(() => {
                        Effects.shake(5);
                        if (this.playerModel) {
                            Effects.createHitEffect(
                                this.battleScene,
                                this.playerModel.group.position,
                                log.element || 'normal'
                            );
                            Effects.createFloatingText(
                                this.battleScene,
                                `-${log.damage}`,
                                this.playerModel.group.position,
                                '#ff7675'
                            );
                        }
                    }, 500);
                }

                if (log.type === 'heal' || log.type === 'enemy_heal') {
                    const target = log.type === 'heal' ? this.playerModel : this.enemyModel;
                    if (target) {
                        Effects.createHealEffect(this.battleScene, target.group.position);
                        Effects.createFloatingText(
                            this.battleScene,
                            `+${log.heal}`,
                            target.group.position,
                            '#2ecc71'
                        );
                    }
                }

                if (log.type === 'defend') {
                    if (this.playerModel) {
                        Effects.createSparkles(this.playerScene || this.battleScene, this.playerModel.group.position, '#74b9ff', 10);
                    }
                }
            }

            // Update HP
            if (this.playerPet) this.playerPet.hp = res.player_hp;
            if (this.enemyPet) this.enemyPet.hp = res.enemy_hp;
            this.updateHPBars();

            // Battle result
            if (res.battle_over) {
                await this.showBattleResult(res);
                return;
            }

            // Enemy turn animation, then unlock
            setTimeout(() => {
                this.setTurnState(true);
            }, 800);

        } catch (e) {
            console.error('Battle action error:', e);
            App.showToast('战斗出错', 'error');
            this.setTurnState(true);
        }
    },

    async showBattleResult(result) {
        const overlay = document.getElementById('battle-result');
        const icon = document.getElementById('result-icon');
        const text = document.getElementById('result-text');
        const rewards = document.getElementById('result-rewards');
        const closeBtn = document.getElementById('result-close');

        if (!overlay) return;

        if (result.player_won) {
            icon.textContent = '🎉';
            text.textContent = '胜利！';
            text.style.color = '#ffd700';

            if (this.battleScene && this.playerModel) {
                this.playerModel.playAnimation('happy', 2000);
                Effects.createSparkles(this.battleScene, this.playerModel.group.position, '#ffd700', 30);
                Effects.createParticleExplosion(this.battleScene, new THREE.Vector3(0, 2, 0), '#ffd700', 50);
            }
        } else {
            icon.textContent = '😵';
            text.textContent = '失败...';
            text.style.color = '#ff7675';
        }

        let rewardText = `+${result.exp_gained} 经验值`;
        if (result.leveled_up) {
            rewardText += ` | 🎉 升级到 Lv.${result.pet?.level}！`;
            Effects.showLevelUpEffect();
        }
        rewards.textContent = rewardText;

        // Show new achievements
        if (result.new_achievements?.length > 0) {
            result.new_achievements.forEach((ach, i) => {
                setTimeout(() => App.showAchievement(ach.name, ach.icon), 1000 + i * 1500);
            });
        }

        overlay.classList.add('active');

        // Update game state
        if (result.pet) {
            App.gameState.pet = result.pet;
            App.updateUI();
        }

        return new Promise(resolve => {
            closeBtn.onclick = () => {
                overlay.classList.remove('active');
                this.endBattle();
                App.showScreen('main-menu');
                resolve();
            };
        });
    },

    // Skill selection popup
    showSkillSelect() {
        if (!this.playerPet?.skills?.length) {
            App.showToast('没有可用的技能', 'info');
            return;
        }

        const skills = this.playerPet.skills;
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        if (!modal || !title || !body) return;

        title.textContent = '选择技能';

        let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
        skills.forEach((skill, i) => {
            const elemEmoji = {
                fire: '🔥', ice: '❄️', electric: '⚡',
                nature: '🌿', dark: '🌑', light: '✨'
            };
            html += `<button class="battle-btn ${skill.element || 'attack'}" 
                onclick="Battle.playerAction('special', ${i}); document.getElementById('modal-overlay').classList.remove('active');"
                style="width:100%;text-align:left;padding:10px 15px;">
                ${elemEmoji[skill.element] || '💫'} ${skill.name} 
                ${skill.heal ? '(回复)' : `(${skill.power}威力)`}
            </button>`;
        });
        html += '</div>';

        body.innerHTML = html;
        modal.classList.add('active');
    }
};

// Bind battle action buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-attack')?.addEventListener('click', () => Battle.playerAction('attack'));
    document.getElementById('btn-defend')?.addEventListener('click', () => Battle.playerAction('defend'));
    document.getElementById('btn-special')?.addEventListener('click', () => Battle.showSkillSelect());
    document.getElementById('btn-flee')?.addEventListener('click', () => Battle.playerAction('flee'));
});
