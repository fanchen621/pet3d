/* ============================================
   Effects Module - Particles, Screen Shake,
   Floating Numbers, Evolution Effects
   Enhanced with element-specific effects,
   combo counter, critical hit flash
   ============================================ */

const Effects = {
    particles: [],
    floatingTexts: [],
    shakeIntensity: 0,
    shakeDecay: 0.9,
    comboTimer: null,
    currentCombo: 0,

    /* ========== SCREEN SHAKE ========== */
    shake(intensity = 8) {
        this.shakeIntensity = intensity;
    },

    applyShake(camera) {
        if (this.shakeIntensity > 0.1) {
            camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.1;
            camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.1;
            this.shakeIntensity *= this.shakeDecay;
        }
    },

    /* ========== COMBO COUNTER ========== */
    showCombo(count) {
        const display = document.getElementById('combo-display');
        const countEl = document.getElementById('combo-count');
        if (!display || !countEl) return;

        this.currentCombo = count;
        countEl.textContent = count;
        display.classList.add('active');

        // Scale effect based on combo
        const scale = Math.min(1.5, 1 + count * 0.05);
        display.style.transform = `scale(${scale})`;

        // Color change for high combos
        if (count >= 5) {
            countEl.style.color = '#ffd700';
            display.style.borderColor = '#ffd700';
        } else if (count >= 3) {
            countEl.style.color = '#fd79a8';
            display.style.borderColor = '#fd79a8';
        } else {
            countEl.style.color = '#fff';
            display.style.borderColor = 'rgba(255,255,255,0.3)';
        }

        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            display.classList.remove('active');
            this.currentCombo = 0;
        }, 2000);
    },

    /* ========== CRITICAL HIT FLASH ========== */
    criticalHitFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(ellipse at center, rgba(253,203,110,0.4), transparent);
            pointer-events: none; z-index: 100;
            animation: critFlash 0.3s ease-out forwards;
        `;
        document.body.appendChild(flash);

        if (!document.getElementById('crit-flash-style')) {
            const style = document.createElement('style');
            style.id = 'crit-flash-style';
            style.textContent = `
                @keyframes critFlash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => flash.remove(), 300);
    },

    /* ========== ELEMENTAL REACTION EFFECT ========== */
    showReactionEffect(reactionName) {
        if (!reactionName) return;
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 1.8rem; font-weight: 900; z-index: 200;
            color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(108,92,231,0.6);
            animation: reactionPop 1s ease forwards;
            pointer-events: none;
        `;
        el.textContent = `⚡ ${reactionName}反应!`;

        if (!document.getElementById('reaction-style')) {
            const style = document.createElement('style');
            style.id = 'reaction-style';
            style.textContent = `
                @keyframes reactionPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                    80% { transform: translate(-50%, -60%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -70%) scale(0.8); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    },

    /* ========== FLOATING DAMAGE NUMBERS ========== */
    createFloatingText(scene, text, position, color = '#ff7675', size = 1) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = `bold ${Math.round(48 * size)}px "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 130, 66);

        ctx.fillStyle = color;
        ctx.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.position.y += 1.5;
        sprite.scale.set(2 * size, 1 * size, 1);

        scene.add(sprite);

        this.floatingTexts.push({
            sprite,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                0.03 + Math.random() * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            life: 1.0,
            decay: 0.015
        });
    },

    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.sprite.position.add(ft.velocity);
            ft.velocity.y *= 0.98;
            ft.life -= ft.decay;
            ft.sprite.material.opacity = ft.life;

            if (ft.life <= 0) {
                ft.sprite.parent.remove(ft.sprite);
                ft.sprite.material.map.dispose();
                ft.sprite.material.dispose();
                this.floatingTexts.splice(i, 1);
            }
        }
    },

    /* ========== PARTICLE SYSTEM ========== */
    createParticleExplosion(scene, position, color, count = 30) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];
        const colors = new Float32Array(count * 3);

        const col = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.15,
                Math.random() * 0.1 + 0.05,
                (Math.random() - 0.5) * 0.15
            ));

            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        this.particles.push({
            points,
            velocities,
            life: 1.0,
            decay: 0.02,
            gravity: -0.002
        });
    },

    createSparkles(scene, position, color = '#f1c40f', count = 15) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const sparklePos = position.clone().add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        Math.random() * 2,
                        (Math.random() - 0.5) * 2
                    )
                );
                this.createSingleSparkle(scene, sparklePos, color);
            }, i * 50);
        }
    },

    createSingleSparkle(scene, position, color) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        scene.add(mesh);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            Math.random() * 0.05 + 0.02,
            (Math.random() - 0.5) * 0.05
        );

        const animate = () => {
            mesh.position.add(velocity);
            velocity.y -= 0.001;
            mesh.material.opacity -= 0.02;
            mesh.scale.multiplyScalar(0.97);

            if (mesh.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        };
        animate();
    },

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const positions = p.points.geometry.attributes.position.array;

            for (let j = 0; j < p.velocities.length; j++) {
                positions[j * 3] += p.velocities[j].x;
                positions[j * 3 + 1] += p.velocities[j].y;
                positions[j * 3 + 2] += p.velocities[j].z;
                p.velocities[j].y += p.gravity;
            }

            p.points.geometry.attributes.position.needsUpdate = true;
            p.life -= p.decay;
            p.points.material.opacity = p.life;

            if (p.life <= 0) {
                p.points.parent.remove(p.points);
                p.points.geometry.dispose();
                p.points.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    },

    /* ========== ELEMENT-SPECIFIC SKILL EFFECTS ========== */
    createElementEffect(scene, position, element, isUltimate = false) {
        const effects = {
            fire: () => this._fireEffect(scene, position, isUltimate),
            ice: () => this._iceEffect(scene, position, isUltimate),
            electric: () => this._electricEffect(scene, position, isUltimate),
            nature: () => this._natureEffect(scene, position, isUltimate),
            dark: () => this._darkEffect(scene, position, isUltimate),
            light: () => this._lightEffect(scene, position, isUltimate),
        };
        (effects[element] || effects.fire)();
    },

    _fireEffect(scene, pos, isUlt) {
        const count = isUlt ? 60 : 30;
        this.createParticleExplosion(scene, pos, '#e74c3c', count);
        this.createSparkles(scene, pos, '#f39c12', isUlt ? 20 : 10);
        if (isUlt) {
            // Screen-wide fire ring
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.1, 0.3, 32),
                new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
            );
            ring.position.copy(pos);
            ring.position.y += 0.5;
            scene.add(ring);
            let scale = 0.1;
            const expandRing = () => {
                scale += 0.15;
                ring.scale.set(scale, scale, 1);
                ring.material.opacity -= 0.03;
                if (ring.material.opacity > 0) requestAnimationFrame(expandRing);
                else { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); }
            };
            expandRing();
        }
    },

    _iceEffect(scene, pos, isUlt) {
        const count = isUlt ? 60 : 30;
        this.createParticleExplosion(scene, pos, '#74b9ff', count);
        this.createSparkles(scene, pos, '#a29bfe', isUlt ? 20 : 10);
        // Ice crystals
        for (let i = 0; i < (isUlt ? 8 : 4); i++) {
            const crystal = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.08 + Math.random() * 0.05),
                new THREE.MeshBasicMaterial({ color: 0x74b9ff, transparent: true, opacity: 0.8 })
            );
            crystal.position.copy(pos);
            crystal.position.x += (Math.random() - 0.5) * 2;
            crystal.position.y += Math.random() * 1.5;
            crystal.position.z += (Math.random() - 0.5) * 2;
            scene.add(crystal);
            const vy = 0.01 + Math.random() * 0.02;
            const spin = () => {
                crystal.rotation.x += 0.05;
                crystal.rotation.y += 0.03;
                crystal.position.y += vy;
                crystal.material.opacity -= 0.01;
                if (crystal.material.opacity > 0) requestAnimationFrame(spin);
                else { scene.remove(crystal); crystal.geometry.dispose(); crystal.material.dispose(); }
            };
            spin();
        }
    },

    _electricEffect(scene, pos, isUlt) {
        const count = isUlt ? 60 : 30;
        this.createParticleExplosion(scene, pos, '#f1c40f', count);
        // Lightning bolts
        for (let i = 0; i < (isUlt ? 5 : 3); i++) {
            setTimeout(() => {
                const points = [];
                let x = pos.x + (Math.random() - 0.5) * 0.5;
                let y = pos.y + 2;
                points.push(new THREE.Vector3(x, y, pos.z));
                for (let j = 0; j < 5; j++) {
                    x += (Math.random() - 0.5) * 0.4;
                    y -= 0.4;
                    points.push(new THREE.Vector3(x, y, pos.z));
                }
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                const mat = new THREE.LineBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 1 });
                const line = new THREE.Line(geo, mat);
                scene.add(line);
                let op = 1;
                const fade = () => {
                    op -= 0.05;
                    line.material.opacity = op;
                    if (op > 0) requestAnimationFrame(fade);
                    else { scene.remove(line); geo.dispose(); mat.dispose(); }
                };
                fade();
            }, i * 100);
        }
    },

    _natureEffect(scene, pos, isUlt) {
        this.createParticleExplosion(scene, pos, '#2ecc71', isUlt ? 50 : 25);
        // Leaf particles
        for (let i = 0; i < (isUlt ? 12 : 6); i++) {
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x2ecc71 : 0x00b894, transparent: true, opacity: 0.9 })
            );
            leaf.position.copy(pos);
            leaf.position.x += (Math.random() - 0.5) * 1.5;
            leaf.position.z += (Math.random() - 0.5) * 1.5;
            scene.add(leaf);
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.02 + Math.random() * 0.02;
            let life = 1;
            const fly = () => {
                leaf.position.x += Math.cos(angle) * speed;
                leaf.position.z += Math.sin(angle) * speed;
                leaf.position.y += Math.sin(life * 5) * 0.02;
                leaf.rotation.x += 0.1;
                leaf.rotation.z += 0.15;
                life -= 0.015;
                leaf.material.opacity = life;
                if (life > 0) requestAnimationFrame(fly);
                else { scene.remove(leaf); leaf.geometry.dispose(); leaf.material.dispose(); }
            };
            fly();
        }
    },

    _darkEffect(scene, pos, isUlt) {
        this.createParticleExplosion(scene, pos, '#8e44ad', isUlt ? 50 : 25);
        // Dark vortex
        const vortex = new THREE.Mesh(
            new THREE.RingGeometry(0.05, 0.5, 32),
            new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
        );
        vortex.position.copy(pos);
        vortex.position.y += 0.3;
        vortex.rotation.x = -Math.PI / 4;
        scene.add(vortex);
        let vOp = 0.6;
        let vScale = 0.5;
        const spin = () => {
            vortex.rotation.z += 0.1;
            vScale += 0.03;
            vortex.scale.set(vScale, vScale, 1);
            vOp -= 0.015;
            vortex.material.opacity = vOp;
            if (vOp > 0) requestAnimationFrame(spin);
            else { scene.remove(vortex); vortex.geometry.dispose(); vortex.material.dispose(); }
        };
        spin();
    },

    _lightEffect(scene, pos, isUlt) {
        this.createParticleExplosion(scene, pos, '#f39c12', isUlt ? 50 : 25);
        this.createSparkles(scene, pos, '#ffeaa7', isUlt ? 25 : 12);
        // Light beam
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.3, 3, 16),
            new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 })
        );
        beam.position.copy(pos);
        beam.position.y += 1.5;
        scene.add(beam);
        let bOp = 0.3;
        const fade = () => {
            bOp -= 0.01;
            beam.material.opacity = bOp;
            beam.scale.x *= 1.02;
            beam.scale.z *= 1.02;
            if (bOp > 0) requestAnimationFrame(fade);
            else { scene.remove(beam); beam.geometry.dispose(); beam.material.dispose(); }
        };
        fade();
    },

    /* ========== EVOLUTION EFFECTS ========== */
    showEvolutionOverlay() {
        const overlay = document.getElementById('evolution-overlay');
        if (overlay) overlay.classList.add('active');
        this.playEvolutionParticles();
    },

    hideEvolutionOverlay() {
        const overlay = document.getElementById('evolution-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    playEvolutionParticles() {
        const colors = ['#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
        let count = 0;
        const interval = setInterval(() => {
            if (count > 50 || !document.getElementById('evolution-overlay')?.classList.contains('active')) {
                clearInterval(interval);
                return;
            }
            const canvas = document.getElementById('evolution-particles');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                for (let i = 0; i < 20; i++) {
                    const x = canvas.width / 2 + (Math.random() - 0.5) * 300;
                    const y = canvas.height / 2 + (Math.random() - 0.5) * 300;
                    const radius = Math.random() * 5 + 2;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                    ctx.fill();
                }
            }
            count++;
        }, 50);
    },

    /* ========== BATTLE HIT EFFECTS ========== */
    createHitEffect(scene, position, type = 'normal') {
        const colors = {
            normal: '#ff7675',
            fire: '#e74c3c',
            ice: '#74b9ff',
            electric: '#f1c40f',
            nature: '#2ecc71',
            dark: '#8e44ad',
            light: '#f39c12',
            critical: '#fdcb6e'
        };

        this.createParticleExplosion(scene, position, colors[type] || colors.normal, type === 'critical' ? 50 : 25);

        if (type === 'critical') {
            this.createSparkles(scene, position, '#fdcb6e', 20);
            this.criticalHitFlash();
        }
    },

    /* ========== HEAL EFFECT ========== */
    createHealEffect(scene, position) {
        const count = 20;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const pos = position.clone().add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 1.5,
                        -1 + Math.random() * 0.5,
                        (Math.random() - 0.5) * 1.5
                    )
                );

                const geometry = new THREE.SphereGeometry(0.08, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x2ecc71,
                    transparent: true,
                    opacity: 0.8
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(pos);
                scene.add(mesh);

                const animateUp = () => {
                    mesh.position.y += 0.03;
                    mesh.material.opacity -= 0.015;
                    mesh.scale.multiplyScalar(0.98);
                    if (mesh.material.opacity > 0) {
                        requestAnimationFrame(animateUp);
                    } else {
                        scene.remove(mesh);
                        mesh.geometry.dispose();
                        mesh.material.dispose();
                    }
                };
                animateUp();
            }, i * 40);
        }
    },

    /* ========== AMBIENT PARTICLES (Pet Home) ========== */
    createAmbientParticles(scene, type = 'default') {
        const group = new THREE.Group();
        group.name = 'ambientParticles';

        const count = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorOptions = {
            default: [new THREE.Color('#6c5ce7'), new THREE.Color('#a29bfe')],
            fire: [new THREE.Color('#e74c3c'), new THREE.Color('#f39c12')],
            ice: [new THREE.Color('#74b9ff'), new THREE.Color('#a29bfe')],
            electric: [new THREE.Color('#f1c40f'), new THREE.Color('#fdcb6e')],
            nature: [new THREE.Color('#2ecc71'), new THREE.Color('#00b894')],
            dark: [new THREE.Color('#8e44ad'), new THREE.Color('#6c5ce7')],
            light: [new THREE.Color('#f39c12'), new THREE.Color('#fdcb6e')]
        };

        const cols = colorOptions[type] || colorOptions.default;

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            const col = cols[Math.floor(Math.random() * cols.length)];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        group.add(points);
        scene.add(group);

        group.userData.animate = (time) => {
            const pos = points.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                pos[i * 3 + 1] += Math.sin(time * 0.001 + i) * 0.002;
                pos[i * 3] += Math.cos(time * 0.0005 + i) * 0.001;
                if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = 0;
                if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 5;
            }
            points.geometry.attributes.position.needsUpdate = true;
        };

        return group;
    },

    /* ========== LEVEL UP EFFECT ========== */
    showLevelUpEffect() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 900;
        `;
        document.body.appendChild(container);

        const text = document.createElement('div');
        text.textContent = '🎉 升级了！';
        text.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 3rem; font-weight: 900;
            background: linear-gradient(135deg, #f1c40f, #fdcb6e);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            animation: levelUpAnim 2s ease forwards;
            filter: drop-shadow(0 0 20px rgba(241,196,15,0.5));
        `;
        container.appendChild(text);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpAnim {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -60%) scale(0.8); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            container.remove();
            style.remove();
        }, 2000);
    },

    /* ========== SPIRIT PARTICLES (for intro screen) ========== */
    createSpiritParticles(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#6c5ce7', '#a29bfe', '#fd79a8', '#00cec9', '#fdcb6e', '#ffd700', '#ff69b4'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.4 - 0.1,
                radius: Math.random() * 3 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: Math.random() * Math.PI * 2,
            });
        }

        let animId;
        const animate = () => {
            animId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.02;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1 + Math.sin(p.pulse) * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        };
        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return () => cancelAnimationFrame(animId);
    }
};
