/* ============================================
   Effects Module - Particles, Screen Shake,
   Floating Numbers, Evolution Effects
   ============================================ */

const Effects = {
    particles: [],
    floatingTexts: [],
    shakeIntensity: 0,
    shakeDecay: 0.9,
    
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
    }
};
