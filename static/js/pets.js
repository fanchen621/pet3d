/* ============================================
   3D Pet Definitions & Rendering (Three.js)
   Procedural 3D pet models with animations
   ============================================ */

const Pets3D = {
    petTypes: {
        dragon: { name: '龙宝宝', element: 'fire', color: 0xe74c3c, accent: 0xf39c12 },
        fox:    { name: '冰晶狐', element: 'ice', color: 0x74b9ff, accent: 0xa29bfe },
        bear:   { name: '雷霆熊', element: 'electric', color: 0xf1c40f, accent: 0xfdcb6e },
        rabbit: { name: '花灵兔', element: 'nature', color: 0x2ecc71, accent: 0x00b894 },
        cat:    { name: '暗影猫', element: 'dark', color: 0x8e44ad, accent: 0x6c5ce7 },
        angel:  { name: '光明天使', element: 'light', color: 0xf39c12, accent: 0xffeaa7 },
    },

    createPet(scene, type, petData) {
        const config = this.petTypes[type] || this.petTypes.dragon;
        const group = new THREE.Group();
        
        // Evolution affects size and glow
        const evo = petData?.evolution || 0;
        const scale = 1 + evo * 0.2;
        group.scale.set(scale, scale, scale);
        
        switch (type) {
            case 'dragon': this._createDragon(group, config, evo); break;
            case 'fox': this._createFox(group, config, evo); break;
            case 'bear': this._createBear(group, config, evo); break;
            case 'rabbit': this._createRabbit(group, config, evo); break;
            case 'cat': this._createCat(group, config, evo); break;
            case 'angel': this._createAngel(group, config, evo); break;
            default: this._createDragon(group, config, evo);
        }
        
        // Evolution glow
        if (evo >= 1) {
            const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.1 + evo * 0.05,
                side: THREE.BackSide,
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 0.6;
            group.add(glow);
        }
        
        scene.add(group);
        
        // Shadow
        const shadowGeo = new THREE.CircleGeometry(0.6, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.3,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        scene.add(shadow);
        
        return new PetAnimator(group, shadow, type, config, evo);
    },

    _mat(color, emissiveIntensity = 0) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: 0.4,
            metalness: 0.1,
            emissive: color,
            emissiveIntensity,
        });
    },

    _glowMat(color) {
        return new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.6,
        });
    },

    // ===== DRAGON =====
    _createDragon(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const eyeMat = this._mat(0xffffff);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), bodyMat);
        body.scale.set(1, 0.9, 0.85);
        body.position.y = 0.55;
        body.name = 'body';
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
        head.position.y = 1.15;
        head.name = 'head';
        group.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.12, 1.2, 0.26);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.12, 1.2, 0.26);
        group.add(eyeR);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const pupilMat = this._mat(0x2d3436);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.12, 1.2, 0.31);
        group.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.12, 1.2, 0.31);
        group.add(pupilR);

        // Snout
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat);
        snout.position.set(0, 1.08, 0.28);
        snout.scale.set(1, 0.7, 0.8);
        group.add(snout);

        // Horns
        const hornGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
        const hornL = new THREE.Mesh(hornGeo, accentMat);
        hornL.position.set(-0.18, 1.42, 0);
        hornL.rotation.z = 0.3;
        group.add(hornL);
        const hornR = new THREE.Mesh(hornGeo, accentMat);
        hornR.position.set(0.18, 1.42, 0);
        hornR.rotation.z = -0.3;
        group.add(hornR);

        // Wings
        if (evo >= 1) {
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.quadraticCurveTo(0.5, 0.6, 0.3, 0.1);
            const wingGeo = new THREE.ShapeGeometry(wingShape);
            const wingMat = this._glowMat(config.accent);
            
            const wingL = new THREE.Mesh(wingGeo, wingMat);
            wingL.position.set(-0.3, 0.8, -0.1);
            wingL.rotation.y = -0.3;
            wingL.name = 'wingL';
            group.add(wingL);
            
            const wingR = new THREE.Mesh(wingGeo, wingMat);
            wingR.position.set(0.3, 0.8, -0.1);
            wingR.rotation.y = 0.3 + Math.PI;
            wingR.name = 'wingR';
            group.add(wingR);
        }

        // Tail
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            const seg = new THREE.Mesh(
                new THREE.SphereGeometry(0.08 - i * 0.015, 8, 8),
                bodyMat
            );
            seg.position.set(0, 0, -i * 0.12);
            tailGroup.add(seg);
        }
        // Tail flame
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.06, 0.15, 8),
            this._mat(config.accent, 0.5)
        );
        flame.position.set(0, 0, -0.5);
        flame.rotation.x = Math.PI / 2;
        tailGroup.add(flame);
        
        tailGroup.position.set(0, 0.55, -0.35);
        tailGroup.name = 'tail';
        group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8);
        const positions = [[-0.2, 0.12, 0.15], [0.2, 0.12, 0.15], [-0.2, 0.12, -0.15], [0.2, 0.12, -0.15]];
        positions.forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(...pos);
            leg.name = `leg${i}`;
            group.add(leg);
        });

        // Super evolution crown
        if (evo >= 2) {
            const crownGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
            const crown = new THREE.Mesh(crownGeo, this._mat(0xffd700, 0.3));
            crown.position.y = 1.48;
            crown.rotation.x = Math.PI / 2;
            group.add(crown);
            
            // Crown spikes
            for (let i = 0; i < 5; i++) {
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.03, 0.1, 6),
                    this._mat(0xffd700, 0.3)
                );
                const angle = (i / 5) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.18, 1.52, Math.sin(angle) * 0.18);
                group.add(spike);
            }
        }
    },

    // ===== FOX =====
    _createFox(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
        body.scale.set(0.9, 0.85, 0.8);
        body.position.y = 0.5;
        body.name = 'body';
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        head.position.y = 1.05;
        head.name = 'head';
        group.add(head);

        // Snout
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), whiteMat);
        snout.position.set(0, 0.98, 0.26);
        snout.rotation.x = Math.PI / 2;
        group.add(snout);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
        eyeL.position.set(-0.12, 1.1, 0.24);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
        eyeR.position.set(0.12, 1.1, 0.24);
        group.add(eyeR);

        // Pupils (big for cute look)
        const pupilMat = this._mat(config.color, 0.3);
        const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.12, 1.1, 0.28);
        group.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.12, 1.1, 0.28);
        group.add(pupilR);

        // Ears
        const earGeo = new THREE.ConeGeometry(0.1, 0.25, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.15, 1.35, 0);
        earL.rotation.z = 0.2;
        earL.name = 'earL';
        group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.15, 1.35, 0);
        earR.rotation.z = -0.2;
        earR.name = 'earR';
        group.add(earR);

        // Inner ears
        const innerEarGeo = new THREE.ConeGeometry(0.05, 0.12, 4);
        const iearL = new THREE.Mesh(innerEarGeo, accentMat);
        iearL.position.set(-0.15, 1.33, 0.02);
        iearL.rotation.z = 0.2;
        group.add(iearL);
        const iearR = new THREE.Mesh(innerEarGeo, accentMat);
        iearR.position.set(0.15, 1.33, 0.02);
        iearR.rotation.z = -0.2;
        group.add(iearR);

        // Big fluffy tail
        const tailGroup = new THREE.Group();
        const tailMain = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bodyMat);
        tailMain.scale.set(0.7, 0.7, 1.2);
        tailMain.position.set(0, 0, -0.2);
        tailGroup.add(tailMain);
        const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), whiteMat);
        tailTip.position.set(0, 0.05, -0.42);
        tailGroup.add(tailTip);
        tailGroup.position.set(0, 0.4, -0.35);
        tailGroup.name = 'tail';
        group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.15, 0.1, 0.12], [0.15, 0.1, 0.12], [-0.15, 0.1, -0.12], [0.15, 0.1, -0.12]].forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(...pos);
            leg.name = `leg${i}`;
            group.add(leg);
        });

        // Ice crystals for evo
        if (evo >= 1) {
            for (let i = 0; i < 3; i++) {
                const crystal = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.06),
                    this._glowMat(config.accent)
                );
                crystal.position.set(
                    Math.cos(i * 2.1) * 0.7,
                    0.8 + Math.sin(i * 1.5) * 0.3,
                    Math.sin(i * 2.1) * 0.7
                );
                crystal.name = `crystal${i}`;
                group.add(crystal);
            }
        }

        if (evo >= 2) {
            // Ice crown
            const crownGeo = new THREE.TorusGeometry(0.2, 0.025, 6, 12);
            const crown = new THREE.Mesh(crownGeo, this._glowMat(0xffffff));
            crown.position.y = 1.4;
            crown.rotation.x = Math.PI / 2;
            group.add(crown);
        }
    },

    // ===== BEAR =====
    _createBear(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);

        // Body (bigger, rounder)
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bodyMat);
        body.scale.set(1, 0.95, 0.9);
        body.position.y = 0.55;
        body.name = 'body';
        group.add(body);

        // Belly
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), whiteMat);
        belly.scale.set(0.8, 0.85, 0.5);
        belly.position.set(0, 0.5, 0.2);
        group.add(belly);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        head.position.y = 1.15;
        head.name = 'head';
        group.add(head);

        // Ears
        const earGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.22, 1.38, 0);
        earL.name = 'earL';
        group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.22, 1.38, 0);
        earR.name = 'earR';
        group.add(earR);

        // Inner ears
        const iearGeo = new THREE.SphereGeometry(0.05, 8, 8);
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(-0.22, 1.38, 0.05) }));
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(0.22, 1.38, 0.05) }));

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.1, 1.2, 0.25) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.1, 1.2, 0.25) }));

        const pupilGeo = new THREE.SphereGeometry(0.028, 8, 8);
        const pupilMat = this._mat(0x2d3436);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(-0.1, 1.2, 0.29) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(0.1, 1.2, 0.29) }));

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this._mat(0x2d3436));
        nose.position.set(0, 1.1, 0.28);
        group.add(nose);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
        const armL = new THREE.Mesh(armGeo, bodyMat);
        armL.position.set(-0.42, 0.6, 0);
        armL.rotation.z = 0.5;
        armL.name = 'armL';
        group.add(armL);
        const armR = new THREE.Mesh(armGeo, bodyMat);
        armR.position.set(0.42, 0.6, 0);
        armR.rotation.z = -0.5;
        armR.name = 'armR';
        group.add(armR);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8);
        const legL = new THREE.Mesh(legGeo, bodyMat);
        legL.position.set(-0.2, 0.12, 0.1);
        legL.name = 'leg0';
        group.add(legL);
        const legR = new THREE.Mesh(legGeo, bodyMat);
        legR.position.set(0.2, 0.12, 0.1);
        legR.name = 'leg1';
        group.add(legR);

        // Lightning effects for evo
        if (evo >= 1) {
            const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
            const boltMat = this._glowMat(config.accent);
            for (let i = 0; i < 3; i++) {
                const bolt = new THREE.Mesh(boltGeo, boltMat);
                bolt.position.set(
                    Math.cos(i * 2.1) * 0.6,
                    1.0 + Math.sin(i) * 0.3,
                    Math.sin(i * 2.1) * 0.6
                );
                bolt.rotation.z = Math.random() * Math.PI;
                bolt.name = `bolt${i}`;
                group.add(bolt);
            }
        }

        if (evo >= 2) {
            // Thunder crown
            const haloGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 16);
            const halo = new THREE.Mesh(haloGeo, this._glowMat(config.accent));
            halo.position.y = 1.5;
            halo.rotation.x = Math.PI / 2;
            group.add(halo);
        }
    },

    // ===== RABBIT =====
    _createRabbit(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);
        const pinkMat = this._mat(0xffb6c1);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
        body.scale.set(0.9, 1, 0.8);
        body.position.y = 0.45;
        body.name = 'body';
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.0;
        head.name = 'head';
        group.add(head);

        // Long ears
        const earGeo = new THREE.CapsuleGeometry(0.06, 0.35, 8, 8);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.1, 1.45, -0.02);
        earL.rotation.z = 0.15;
        earL.name = 'earL';
        group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.1, 1.45, -0.02);
        earR.rotation.z = -0.15;
        earR.name = 'earR';
        group.add(earR);

        // Inner ears
        const iearGeo = new THREE.CapsuleGeometry(0.03, 0.25, 8, 8);
        group.add(Object.assign(new THREE.Mesh(iearGeo, pinkMat), { position: new THREE.Vector3(-0.1, 1.45, 0.02) }));
        group.add(Object.assign(new THREE.Mesh(iearGeo, pinkMat), { position: new THREE.Vector3(0.1, 1.45, 0.02) }));

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.1, 1.05, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.1, 1.05, 0.23) }));

        const pupilGeo = new THREE.SphereGeometry(0.03, 8, 8);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(-0.1, 1.05, 0.27) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(0.1, 1.05, 0.27) }));

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pinkMat);
        nose.position.set(0, 0.96, 0.26);
        group.add(nose);

        // Cheeks
        const cheekGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const cheekMat = this._mat(0xffb6c1, 0.2);
        group.add(Object.assign(new THREE.Mesh(cheekGeo, cheekMat), { position: new THREE.Vector3(-0.18, 0.96, 0.2) }));
        group.add(Object.assign(new THREE.Mesh(cheekGeo, cheekMat), { position: new THREE.Vector3(0.18, 0.96, 0.2) }));

        // Tail (fluffy)
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), whiteMat);
        tail.position.set(0, 0.4, -0.35);
        tail.name = 'tail';
        group.add(tail);

        // Legs
        const legGeo = new THREE.CapsuleGeometry(0.06, 0.12, 8, 8);
        [[-0.15, 0.08, 0.1], [0.15, 0.08, 0.1], [-0.15, 0.08, -0.1], [0.15, 0.08, -0.1]].forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(...pos);
            leg.name = `leg${i}`;
            group.add(leg);
        });

        // Flower effects
        if (evo >= 1) {
            for (let i = 0; i < 5; i++) {
                const petal = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 8, 8),
                    this._glowMat(0xff69b4)
                );
                const angle = (i / 5) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.5, 1.3 + Math.sin(angle) * 0.1, Math.sin(angle) * 0.5);
                petal.name = `petal${i}`;
                group.add(petal);
            }
        }

        if (evo >= 2) {
            // Flower crown
            for (let i = 0; i < 7; i++) {
                const flower = new THREE.Mesh(
                    new THREE.SphereGeometry(0.035, 8, 8),
                    this._glowMat([0xff69b4, 0xffd700, 0xff6347][i % 3])
                );
                const angle = (i / 7) * Math.PI * 2;
                flower.position.set(Math.cos(angle) * 0.2, 1.3, Math.sin(angle) * 0.2);
                group.add(flower);
            }
        }
    },

    // ===== CAT =====
    _createCat(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), bodyMat);
        body.scale.set(0.85, 0.9, 0.8);
        body.position.y = 0.48;
        body.name = 'body';
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.02;
        head.name = 'head';
        group.add(head);

        // Pointy ears
        const earGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.16, 1.3, 0);
        earL.rotation.z = 0.25;
        earL.name = 'earL';
        group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.16, 1.3, 0);
        earR.rotation.z = -0.25;
        earR.name = 'earR';
        group.add(earR);

        // Eyes (cat-like, almond)
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = this._mat(0x2ecc71, 0.4);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.1, 1.07, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.1, 1.07, 0.23) }));

        // Slit pupils
        const pupilGeo = new THREE.SphereGeometry(0.02, 6, 6);
        const pupilMat = this._mat(0x000000);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.scale.set(0.5, 1.2, 0.5);
        pupilL.position.set(-0.1, 1.07, 0.27);
        group.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.scale.set(0.5, 1.2, 0.5);
        pupilR.position.set(0.1, 1.07, 0.27);
        group.add(pupilR);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), this._mat(0xffb6c1));
        nose.position.set(0, 0.98, 0.26);
        group.add(nose);

        // Whiskers (simple lines)
        const whiskerMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
        [[-1, 0.05], [-1, -0.05], [1, 0.05], [1, -0.05]].forEach(([dir, yOff]) => {
            const points = [
                new THREE.Vector3(dir * 0.05, 0.97 + yOff, 0.25),
                new THREE.Vector3(dir * 0.3, 0.97 + yOff * 2, 0.2),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            group.add(new THREE.Line(geo, whiskerMat));
        });

        // Tail (long, curved)
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(
                new THREE.SphereGeometry(0.05 - i * 0.005, 8, 8),
                bodyMat
            );
            seg.position.set(
                Math.sin(i * 0.4) * 0.15,
                i * 0.08,
                -i * 0.1
            );
            tailGroup.add(seg);
        }
        tailGroup.position.set(0, 0.4, -0.3);
        tailGroup.name = 'tail';
        group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.15, 0.1, 0.1], [0.15, 0.1, 0.1], [-0.15, 0.1, -0.1], [0.15, 0.1, -0.1]].forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(...pos);
            leg.name = `leg${i}`;
            group.add(leg);
        });

        // Dark aura
        if (evo >= 1) {
            const auraGeo = new THREE.RingGeometry(0.5, 0.7, 32);
            const auraMat = this._glowMat(config.accent);
            const aura = new THREE.Mesh(auraGeo, auraMat);
            aura.rotation.x = -Math.PI / 2;
            aura.position.y = 0.02;
            aura.name = 'aura';
            group.add(aura);
        }

        if (evo >= 2) {
            // Dark crown
            for (let i = 0; i < 6; i++) {
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.03, 0.12, 6),
                    this._glowMat(config.accent)
                );
                const angle = (i / 6) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.2, 1.33, Math.sin(angle) * 0.2);
                group.add(spike);
            }
        }
    },

    // ===== ANGEL =====
    _createAngel(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff, 0.1);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), whiteMat);
        body.scale.set(0.9, 1, 0.8);
        body.position.y = 0.5;
        body.name = 'body';
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), whiteMat);
        head.position.y = 1.08;
        head.name = 'head';
        group.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x3498db)), { position: new THREE.Vector3(-0.1, 1.13, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x3498db)), { position: new THREE.Vector3(0.1, 1.13, 0.23) }));

        // Round ears
        const earGeo = new THREE.SphereGeometry(0.08, 8, 8);
        group.add(Object.assign(new THREE.Mesh(earGeo, whiteMat), { position: new THREE.Vector3(-0.2, 1.3, 0) }));
        group.add(Object.assign(new THREE.Mesh(earGeo, whiteMat), { position: new THREE.Vector3(0.2, 1.3, 0) }));

        // Halo
        const haloGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 24);
        const halo = new THREE.Mesh(haloGeo, this._glowMat(config.color));
        halo.position.y = 1.42;
        halo.rotation.x = Math.PI / 2;
        halo.name = 'halo';
        group.add(halo);

        // Wings
        const wingMat = this._glowMat(0xffffff);
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.4, 0.5, 0.2, 0.8);
        wingShape.quadraticCurveTo(0.1, 0.4, 0, 0);
        const wingGeo = new THREE.ShapeGeometry(wingShape);

        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(-0.3, 0.6, -0.2);
        wingL.rotation.y = -0.4;
        wingL.name = 'wingL';
        group.add(wingL);

        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0.3, 0.6, -0.2);
        wingR.rotation.y = 0.4 + Math.PI;
        wingR.name = 'wingR';
        group.add(wingR);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.25, 8);
        const armL = new THREE.Mesh(armGeo, whiteMat);
        armL.position.set(-0.35, 0.6, 0);
        armL.rotation.z = 0.4;
        armL.name = 'armL';
        group.add(armL);
        const armR = new THREE.Mesh(armGeo, whiteMat);
        armR.position.set(0.35, 0.6, 0);
        armR.rotation.z = -0.4;
        armR.name = 'armR';
        group.add(armR);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.12, 0.1, 0.08], [0.12, 0.1, 0.08]].forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, whiteMat);
            leg.position.set(...pos);
            leg.name = `leg${i}`;
            group.add(leg);
        });

        // Light particles
        if (evo >= 1) {
            for (let i = 0; i < 6; i++) {
                const orb = new THREE.Mesh(
                    new THREE.SphereGeometry(0.03, 8, 8),
                    this._glowMat(config.color)
                );
                const angle = (i / 6) * Math.PI * 2;
                orb.position.set(Math.cos(angle) * 0.6, 0.8 + Math.sin(angle) * 0.3, Math.sin(angle) * 0.6);
                orb.name = `orb${i}`;
                group.add(orb);
            }
        }

        if (evo >= 2) {
            // Double halo
            const halo2 = new THREE.Mesh(
                new THREE.TorusGeometry(0.25, 0.02, 8, 24),
                this._glowMat(0xffd700)
            );
            halo2.position.y = 1.5;
            halo2.rotation.x = Math.PI / 2;
            group.add(halo2);
        }
    },
};


/* ============================================
   Pet Animator - Handles all pet animations
   ============================================ */

class PetAnimator {
    constructor(group, shadow, type, config, evolution) {
        this.group = group;
        this.shadow = shadow;
        this.type = type;
        this.config = config;
        this.evolution = evolution;
        this.currentAnim = 'idle';
        this.animStartTime = 0;
        this.animDuration = 0;
        this.blinkTimer = 0;
        this.blinkState = false;
    }

    animate(time) {
        const t = time * 0.001;

        // Idle breathing
        if (this.group) {
            const body = this.group.getObjectByName('body');
            if (body) {
                body.scale.y = (this.type === 'bear' ? 0.95 : 0.9) + Math.sin(t * 2) * 0.02;
            }

            const head = this.group.getObjectByName('head');
            if (head) {
                head.rotation.z = Math.sin(t * 0.8) * 0.05;
            }

            // Tail wagging
            const tail = this.group.getObjectByName('tail');
            if (tail) {
                tail.rotation.y = Math.sin(t * 3) * 0.3;
                if (this.type === 'cat') {
                    tail.rotation.z = Math.sin(t * 1.5) * 0.15;
                }
            }

            // Ear wiggle
            const earL = this.group.getObjectByName('earL');
            const earR = this.group.getObjectByName('earR');
            if (earL) earL.rotation.z = (this.type === 'fox' ? 0.2 : 0.15) + Math.sin(t * 2 + 1) * 0.08;
            if (earR) earR.rotation.z = -(this.type === 'fox' ? 0.2 : 0.15) - Math.sin(t * 2) * 0.08;

            // Wing flap
            const wingL = this.group.getObjectByName('wingL');
            const wingR = this.group.getObjectByName('wingR');
            if (wingL) wingL.rotation.z = Math.sin(t * 2.5) * 0.15;
            if (wingR) wingR.rotation.z = -Math.sin(t * 2.5) * 0.15;

            // Halo float
            const halo = this.group.getObjectByName('halo');
            if (halo) {
                halo.position.y = 1.42 + Math.sin(t * 1.5) * 0.03;
                halo.rotation.z = t * 0.5;
            }

            // Aura rotation
            const aura = this.group.getObjectByName('aura');
            if (aura) {
                aura.rotation.z = t;
                aura.material.opacity = 0.3 + Math.sin(t * 2) * 0.15;
            }

            // Crystals (fox)
            for (let i = 0; i < 3; i++) {
                const crystal = this.group.getObjectByName(`crystal${i}`);
                if (crystal) {
                    crystal.position.y = 0.8 + Math.sin(t * 2 + i * 2) * 0.15;
                    crystal.rotation.x = t + i;
                    crystal.rotation.y = t * 0.5 + i;
                }
            }

            // Orbs (angel)
            for (let i = 0; i < 6; i++) {
                const orb = this.group.getObjectByName(`orb${i}`);
                if (orb) {
                    const angle = (i / 6) * Math.PI * 2 + t * 0.5;
                    orb.position.set(Math.cos(angle) * 0.6, 0.8 + Math.sin(t + i) * 0.2, Math.sin(angle) * 0.6);
                }
            }

            // Lightning bolts (bear)
            for (let i = 0; i < 3; i++) {
                const bolt = this.group.getObjectByName(`bolt${i}`);
                if (bolt) {
                    bolt.material.opacity = Math.random() > 0.7 ? 0.8 : 0.2;
                    bolt.rotation.z += 0.05;
                }
            }

            // Legs subtle movement
            for (let i = 0; i < 4; i++) {
                const leg = this.group.getObjectByName(`leg${i}`);
                if (leg) {
                    leg.rotation.x = Math.sin(t * 2 + i * 1.5) * 0.05;
                }
            }
        }

        // Blink
        this.blinkTimer += 16;
        if (this.blinkTimer > 3000 + Math.random() * 2000) {
            this.blinkTimer = 0;
            this._blink();
        }

        // Shadow pulse
        if (this.shadow) {
            const s = 0.6 + Math.sin(t * 2) * 0.05;
            this.shadow.scale.set(s, s, 1);
        }

        // Current animation override
        if (this.currentAnim === 'happy') {
            this._happyAnim(time);
        } else if (this.currentAnim === 'attack') {
            this._attackAnim(time);
        }
    }

    _blink() {
        // Simple blink by scaling eyes temporarily
        // (visual only, too complex to track individual eye meshes)
    }

    playAnimation(name, duration = 1000) {
        this.currentAnim = name;
        this.animStartTime = performance.now();
        this.animDuration = duration;
    }

    _happyAnim(time) {
        const elapsed = performance.now() - this.animStartTime;
        if (elapsed > this.animDuration) {
            this.currentAnim = 'idle';
            this.group.position.y = 0;
            this.group.rotation.y = 0;
            return;
        }
        const progress = elapsed / this.animDuration;
        // Jump
        this.group.position.y = Math.sin(progress * Math.PI * 3) * 0.3;
        // Spin
        this.group.rotation.y = progress * Math.PI * 4;
        // Squash stretch
        const squash = 1 + Math.sin(progress * Math.PI * 6) * 0.1;
        this.group.scale.y = (1 + this.evolution * 0.2) * squash;
    }

    _attackAnim(time) {
        const elapsed = performance.now() - this.animStartTime;
        if (elapsed > this.animDuration) {
            this.currentAnim = 'idle';
            this.group.position.z = 0;
            this.group.position.x = 0;
            return;
        }
        const progress = elapsed / this.animDuration;
        // Lunge forward
        const lunge = Math.sin(progress * Math.PI) * 0.5;
        this.group.position.z = lunge;
        // Shake
        this.group.position.x = Math.sin(progress * Math.PI * 8) * 0.05 * (1 - progress);
    }
}
