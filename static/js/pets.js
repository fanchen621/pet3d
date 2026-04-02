/* ============================================
   3D Pet Definitions & Rendering (Three.js)
   12种宠物 - 原神级立绘风格建模
   ============================================ */

const Pets3D = {
    petTypes: {
        dragon:   { name: '龙宝宝',     element: 'fire',      color: 0xe74c3c, accent: 0xf39c12 },
        fox:      { name: '冰晶狐',     element: 'ice',       color: 0x74b9ff, accent: 0xa29bfe },
        bear:     { name: '雷霆熊',     element: 'electric',  color: 0xf1c40f, accent: 0xfdcb6e },
        rabbit:   { name: '花灵兔',     element: 'nature',    color: 0x2ecc71, accent: 0x00b894 },
        cat:      { name: '暗影猫',     element: 'dark',      color: 0x8e44ad, accent: 0x6c5ce7 },
        angel:    { name: '光明天使',   element: 'light',     color: 0xf39c12, accent: 0xffeaa7 },
        phoenix:  { name: '凤凰雏鸟',   element: 'fire',      color: 0xff6348, accent: 0xffa502 },
        krystal:  { name: '水灵海马',   element: 'ice',       color: 0x0984e3, accent: 0x74b9ff },
        tiger:    { name: '雷纹虎',     element: 'electric',  color: 0xffa502, accent: 0xffeaa7 },
        sprite:   { name: '木灵小妖',   element: 'nature',    color: 0x00b894, accent: 0x55efc4 },
        wolf:     { name: '暗月狼',     element: 'dark',      color: 0x6c5ce7, accent: 0xa29bfe },
        unicorn:  { name: '星光独角兽', element: 'light',     color: 0xffeaa7, accent: 0xfd79a8 },
    },

    // Rarity labels for UI
    rarityNames: {
        common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说'
    },

    createPet(scene, type, petData) {
        const config = this.petTypes[type] || this.petTypes.dragon;
        const group = new THREE.Group();

        const evo = petData?.evolution || 0;
        const scale = 1 + evo * 0.2;
        group.scale.set(scale, scale, scale);

        const creators = {
            dragon: this._createDragon,
            fox: this._createFox,
            bear: this._createBear,
            rabbit: this._createRabbit,
            cat: this._createCat,
            angel: this._createAngel,
            phoenix: this._createPhoenix,
            krystal: this._createKrystal,
            tiger: this._createTiger,
            sprite: this._createSprite,
            wolf: this._createWolf,
            unicorn: this._createUnicorn,
        };

        (creators[type] || creators.dragon).call(this, group, config, evo);

        // Evolution glow
        if (evo >= 1) {
            const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: config.color, transparent: true,
                opacity: 0.1 + evo * 0.05, side: THREE.BackSide,
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 0.6;
            group.add(glow);
        }

        scene.add(group);

        // Shadow
        const shadowGeo = new THREE.CircleGeometry(0.6, 16);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        scene.add(shadow);

        return new PetAnimator(group, shadow, type, config, evo);
    },

    _mat(color, emissiveIntensity = 0) {
        return new THREE.MeshStandardMaterial({
            color, roughness: 0.4, metalness: 0.1,
            emissive: color, emissiveIntensity,
        });
    },
    _glowMat(color) {
        return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
    },

    // ========== ORIGINAL 6 ==========

    _createDragon(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const eyeMat = this._mat(0xffffff);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), bodyMat);
        body.scale.set(1, 0.9, 0.85); body.position.y = 0.55; body.name = 'body'; group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
        head.position.y = 1.15; head.name = 'head'; group.add(head);

        const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.12, 1.2, 0.26) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.12, 1.2, 0.26) }));

        const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const pupilMat = this._mat(0x2d3436);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(-0.12, 1.2, 0.31) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(0.12, 1.2, 0.31) }));

        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat);
        snout.position.set(0, 1.08, 0.28); snout.scale.set(1, 0.7, 0.8); group.add(snout);

        const hornGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
        const hornL = new THREE.Mesh(hornGeo, accentMat); hornL.position.set(-0.18, 1.42, 0); hornL.rotation.z = 0.3; group.add(hornL);
        const hornR = new THREE.Mesh(hornGeo, accentMat); hornR.position.set(0.18, 1.42, 0); hornR.rotation.z = -0.3; group.add(hornR);

        if (evo >= 1) {
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.5, 0.6, 0.3, 0.1);
            const wingGeo = new THREE.ShapeGeometry(wingShape);
            const wingMat = this._glowMat(config.accent);
            const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.set(-0.3, 0.8, -0.1); wingL.rotation.y = -0.3; wingL.name = 'wingL'; group.add(wingL);
            const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.set(0.3, 0.8, -0.1); wingR.rotation.y = 0.3 + Math.PI; wingR.name = 'wingR'; group.add(wingR);
        }

        const tailGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            tailGroup.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.08 - i * 0.015, 8, 8), bodyMat), { position: new THREE.Vector3(0, 0, -i * 0.12) }));
        }
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), this._mat(config.accent, 0.5));
        flame.position.set(0, 0, -0.5); flame.rotation.x = Math.PI / 2; tailGroup.add(flame);
        tailGroup.position.set(0, 0.55, -0.35); tailGroup.name = 'tail'; group.add(tailGroup);

        const legGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8);
        [[-0.2, 0.12, 0.15], [0.2, 0.12, 0.15], [-0.2, 0.12, -0.15], [0.2, 0.12, -0.15]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        if (evo >= 2) {
            const crown = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 16), this._mat(0xffd700, 0.3));
            crown.position.y = 1.48; crown.rotation.x = Math.PI / 2; group.add(crown);
            for (let i = 0; i < 5; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), this._mat(0xffd700, 0.3));
                const angle = (i / 5) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.18, 1.52, Math.sin(angle) * 0.18); group.add(spike);
            }
        }
    },

    _createFox(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
        body.scale.set(0.9, 0.85, 0.8); body.position.y = 0.5; body.name = 'body'; group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        head.position.y = 1.05; head.name = 'head'; group.add(head);

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), whiteMat);
        snout.position.set(0, 0.98, 0.26); snout.rotation.x = Math.PI / 2; group.add(snout);

        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.12, 1.1, 0.24) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.12, 1.1, 0.24) }));

        const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const pupilMat = this._mat(config.color, 0.3);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(-0.12, 1.1, 0.28) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(0.12, 1.1, 0.28) }));

        const earGeo = new THREE.ConeGeometry(0.1, 0.25, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.15, 1.35, 0); earL.rotation.z = 0.2; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.15, 1.35, 0); earR.rotation.z = -0.2; earR.name = 'earR'; group.add(earR);

        const iearGeo = new THREE.ConeGeometry(0.05, 0.12, 4);
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(-0.15, 1.33, 0.02) }));
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(0.15, 1.33, 0.02) }));

        const tailGroup = new THREE.Group();
        const tailMain = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bodyMat);
        tailMain.scale.set(0.7, 0.7, 1.2); tailMain.position.set(0, 0, -0.2); tailGroup.add(tailMain);
        const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), whiteMat);
        tailTip.position.set(0, 0.05, -0.42); tailGroup.add(tailTip);
        tailGroup.position.set(0, 0.4, -0.35); tailGroup.name = 'tail'; group.add(tailGroup);

        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.15, 0.1, 0.12], [0.15, 0.1, 0.12], [-0.15, 0.1, -0.12], [0.15, 0.1, -0.12]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        if (evo >= 1) {
            for (let i = 0; i < 3; i++) {
                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), this._glowMat(config.accent));
                crystal.position.set(Math.cos(i * 2.1) * 0.7, 0.8 + Math.sin(i * 1.5) * 0.3, Math.sin(i * 2.1) * 0.7);
                crystal.name = `crystal${i}`; group.add(crystal);
            }
        }
        if (evo >= 2) {
            const crown = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 12), this._glowMat(0xffffff));
            crown.position.y = 1.4; crown.rotation.x = Math.PI / 2; group.add(crown);
        }
    },

    _createBear(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bodyMat);
        body.scale.set(1, 0.95, 0.9); body.position.y = 0.55; body.name = 'body'; group.add(body);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), whiteMat);
        belly.scale.set(0.8, 0.85, 0.5); belly.position.set(0, 0.5, 0.2); group.add(belly);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        head.position.y = 1.15; head.name = 'head'; group.add(head);

        const earGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.22, 1.38, 0); earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.22, 1.38, 0); earR.name = 'earR'; group.add(earR);

        const iearGeo = new THREE.SphereGeometry(0.05, 8, 8);
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(-0.22, 1.38, 0.05) }));
        group.add(Object.assign(new THREE.Mesh(iearGeo, accentMat), { position: new THREE.Vector3(0.22, 1.38, 0.05) }));

        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.1, 1.2, 0.25) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.1, 1.2, 0.25) }));
        const pupilGeo = new THREE.SphereGeometry(0.028, 8, 8);
        const pupilMat = this._mat(0x2d3436);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(-0.1, 1.2, 0.29) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, pupilMat), { position: new THREE.Vector3(0.1, 1.2, 0.29) }));

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this._mat(0x2d3436));
        nose.position.set(0, 1.1, 0.28); group.add(nose);

        const armGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
        const armL = new THREE.Mesh(armGeo, bodyMat); armL.position.set(-0.42, 0.6, 0); armL.rotation.z = 0.5; armL.name = 'armL'; group.add(armL);
        const armR = new THREE.Mesh(armGeo, bodyMat); armR.position.set(0.42, 0.6, 0); armR.rotation.z = -0.5; armR.name = 'armR'; group.add(armR);

        const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8);
        group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(-0.2, 0.12, 0.1), name: 'leg0' }));
        group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(0.2, 0.12, 0.1), name: 'leg1' }));

        if (evo >= 1) {
            const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
            const boltMat = this._glowMat(config.accent);
            for (let i = 0; i < 3; i++) {
                const bolt = new THREE.Mesh(boltGeo, boltMat);
                bolt.position.set(Math.cos(i * 2.1) * 0.6, 1.0 + Math.sin(i) * 0.3, Math.sin(i * 2.1) * 0.6);
                bolt.rotation.z = Math.random() * Math.PI; bolt.name = `bolt${i}`; group.add(bolt);
            }
        }
        if (evo >= 2) {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 16), this._glowMat(config.accent));
            halo.position.y = 1.5; halo.rotation.x = Math.PI / 2; group.add(halo);
        }
    },

    _createRabbit(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff);
        const pinkMat = this._mat(0xffb6c1);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
        body.scale.set(0.9, 1, 0.8); body.position.y = 0.45; body.name = 'body'; group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.0; head.name = 'head'; group.add(head);

        const earGeo = new THREE.CapsuleGeometry(0.06, 0.35, 8, 8);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.1, 1.45, -0.02); earL.rotation.z = 0.15; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.1, 1.45, -0.02); earR.rotation.z = -0.15; earR.name = 'earR'; group.add(earR);

        const iearGeo = new THREE.CapsuleGeometry(0.03, 0.25, 8, 8);
        group.add(Object.assign(new THREE.Mesh(iearGeo, pinkMat), { position: new THREE.Vector3(-0.1, 1.45, 0.02) }));
        group.add(Object.assign(new THREE.Mesh(iearGeo, pinkMat), { position: new THREE.Vector3(0.1, 1.45, 0.02) }));

        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.1, 1.05, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.1, 1.05, 0.23) }));
        const pupilGeo = new THREE.SphereGeometry(0.03, 8, 8);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(-0.1, 1.05, 0.27) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(0.1, 1.05, 0.27) }));

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pinkMat);
        nose.position.set(0, 0.96, 0.26); group.add(nose);

        const cheekGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const cheekMat = this._mat(0xffb6c1, 0.2);
        group.add(Object.assign(new THREE.Mesh(cheekGeo, cheekMat), { position: new THREE.Vector3(-0.18, 0.96, 0.2) }));
        group.add(Object.assign(new THREE.Mesh(cheekGeo, cheekMat), { position: new THREE.Vector3(0.18, 0.96, 0.2) }));

        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), whiteMat);
        tail.position.set(0, 0.4, -0.35); tail.name = 'tail'; group.add(tail);

        const legGeo = new THREE.CapsuleGeometry(0.06, 0.12, 8, 8);
        [[-0.15, 0.08, 0.1], [0.15, 0.08, 0.1], [-0.15, 0.08, -0.1], [0.15, 0.08, -0.1]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        if (evo >= 1) {
            for (let i = 0; i < 5; i++) {
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this._glowMat(0xff69b4));
                const angle = (i / 5) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.5, 1.3 + Math.sin(angle) * 0.1, Math.sin(angle) * 0.5);
                petal.name = `petal${i}`; group.add(petal);
            }
        }
        if (evo >= 2) {
            for (let i = 0; i < 7; i++) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), this._glowMat([0xff69b4, 0xffd700, 0xff6347][i % 3]));
                const angle = (i / 7) * Math.PI * 2;
                flower.position.set(Math.cos(angle) * 0.2, 1.3, Math.sin(angle) * 0.2); group.add(flower);
            }
        }
    },

    _createCat(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), bodyMat);
        body.scale.set(0.85, 0.9, 0.8); body.position.y = 0.48; body.name = 'body'; group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.02; head.name = 'head'; group.add(head);

        const earGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.16, 1.3, 0); earL.rotation.z = 0.25; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.16, 1.3, 0); earR.rotation.z = -0.25; earR.name = 'earR'; group.add(earR);

        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = this._mat(0x2ecc71, 0.4);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.1, 1.07, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.1, 1.07, 0.23) }));

        const pupilGeo = new THREE.SphereGeometry(0.02, 6, 6);
        const pupilMat = this._mat(0x000000);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat); pupilL.scale.set(0.5, 1.2, 0.5); pupilL.position.set(-0.1, 1.07, 0.27); group.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat); pupilR.scale.set(0.5, 1.2, 0.5); pupilR.position.set(0.1, 1.07, 0.27); group.add(pupilR);

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), this._mat(0xffb6c1));
        nose.position.set(0, 0.98, 0.26); group.add(nose);

        const whiskerMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
        [[-1, 0.05], [-1, -0.05], [1, 0.05], [1, -0.05]].forEach(([dir, yOff]) => {
            const points = [new THREE.Vector3(dir * 0.05, 0.97 + yOff, 0.25), new THREE.Vector3(dir * 0.3, 0.97 + yOff * 2, 0.2)];
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), whiskerMat));
        });

        const tailGroup = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.05 - i * 0.005, 8, 8), bodyMat);
            seg.position.set(Math.sin(i * 0.4) * 0.15, i * 0.08, -i * 0.1); tailGroup.add(seg);
        }
        tailGroup.position.set(0, 0.4, -0.3); tailGroup.name = 'tail'; group.add(tailGroup);

        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.15, 0.1, 0.1], [0.15, 0.1, 0.1], [-0.15, 0.1, -0.1], [0.15, 0.1, -0.1]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        if (evo >= 1) {
            const aura = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.7, 32), this._glowMat(config.accent));
            aura.rotation.x = -Math.PI / 2; aura.position.y = 0.02; aura.name = 'aura'; group.add(aura);
        }
        if (evo >= 2) {
            for (let i = 0; i < 6; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 6), this._glowMat(config.accent));
                const angle = (i / 6) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.2, 1.33, Math.sin(angle) * 0.2); group.add(spike);
            }
        }
    },

    _createAngel(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xffffff, 0.1);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), whiteMat);
        body.scale.set(0.9, 1, 0.8); body.position.y = 0.5; body.name = 'body'; group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), whiteMat);
        head.position.y = 1.08; head.name = 'head'; group.add(head);

        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x3498db)), { position: new THREE.Vector3(-0.1, 1.13, 0.23) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x3498db)), { position: new THREE.Vector3(0.1, 1.13, 0.23) }));

        const earGeo = new THREE.SphereGeometry(0.08, 8, 8);
        group.add(Object.assign(new THREE.Mesh(earGeo, whiteMat), { position: new THREE.Vector3(-0.2, 1.3, 0) }));
        group.add(Object.assign(new THREE.Mesh(earGeo, whiteMat), { position: new THREE.Vector3(0.2, 1.3, 0) }));

        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 24), this._glowMat(config.color));
        halo.position.y = 1.42; halo.rotation.x = Math.PI / 2; halo.name = 'halo'; group.add(halo);

        const wingMat = this._glowMat(0xffffff);
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.4, 0.5, 0.2, 0.8); wingShape.quadraticCurveTo(0.1, 0.4, 0, 0);
        const wingGeo = new THREE.ShapeGeometry(wingShape);

        const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.set(-0.3, 0.6, -0.2); wingL.rotation.y = -0.4; wingL.name = 'wingL'; group.add(wingL);
        const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.set(0.3, 0.6, -0.2); wingR.rotation.y = 0.4 + Math.PI; wingR.name = 'wingR'; group.add(wingR);

        const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.25, 8);
        const armL = new THREE.Mesh(armGeo, whiteMat); armL.position.set(-0.35, 0.6, 0); armL.rotation.z = 0.4; armL.name = 'armL'; group.add(armL);
        const armR = new THREE.Mesh(armGeo, whiteMat); armR.position.set(0.35, 0.6, 0); armR.rotation.z = -0.4; armR.name = 'armR'; group.add(armR);

        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
        [[-0.12, 0.1, 0.08], [0.12, 0.1, 0.08]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, whiteMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        if (evo >= 1) {
            for (let i = 0; i < 6; i++) {
                const orb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), this._glowMat(config.color));
                const angle = (i / 6) * Math.PI * 2;
                orb.position.set(Math.cos(angle) * 0.6, 0.8 + Math.sin(angle) * 0.3, Math.sin(angle) * 0.6);
                orb.name = `orb${i}`; group.add(orb);
            }
        }
        if (evo >= 2) {
            const halo2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 24), this._glowMat(0xffd700));
            halo2.position.y = 1.5; halo2.rotation.x = Math.PI / 2; group.add(halo2);
        }
    },

    // ========== NEW 6 ==========

    _createPhoenix(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.2);
        const accentMat = this._mat(config.accent, evo * 0.15);
        const darkMat = this._mat(0xc0392b, 0.1);

        // Body - sleek bird shape
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
        body.scale.set(0.85, 1, 0.75); body.position.y = 0.6; body.name = 'body'; group.add(body);

        // Chest feather
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), accentMat);
        chest.scale.set(0.7, 0.8, 0.4); chest.position.set(0, 0.55, 0.15); group.add(chest);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat);
        head.position.y = 1.15; head.name = 'head'; group.add(head);

        // Beak
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), this._mat(0xf39c12));
        beak.position.set(0, 1.1, 0.28); beak.rotation.x = Math.PI / 2; group.add(beak);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMat = this._mat(0xffeaa7, 0.5);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.09, 1.18, 0.2) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.09, 1.18, 0.2) }));

        // Crest feathers
        const crestGeo = new THREE.ConeGeometry(0.03, 0.2, 4);
        for (let i = 0; i < 3; i++) {
            const crest = new THREE.Mesh(crestGeo, accentMat);
            crest.position.set((i - 1) * 0.06, 1.4 + i * 0.02, -0.05);
            crest.rotation.x = -0.3; group.add(crest);
        }

        // Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.6, 0.4, 0.3, 0.8);
        wingShape.quadraticCurveTo(0.1, 0.4, 0, 0);
        const wingGeo = new THREE.ShapeGeometry(wingShape);

        const wingL = new THREE.Mesh(wingGeo, this._glowMat(config.color));
        wingL.position.set(-0.35, 0.7, -0.1); wingL.rotation.y = -0.3; wingL.name = 'wingL'; group.add(wingL);
        const wingR = new THREE.Mesh(wingGeo, this._glowMat(config.color));
        wingR.position.set(0.35, 0.7, -0.1); wingR.rotation.y = 0.3 + Math.PI; wingR.name = 'wingR'; group.add(wingR);

        // Tail feathers
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const feather = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.3, 4), this._glowMat(i % 2 === 0 ? config.color : config.accent));
            feather.position.set((i - 2) * 0.06, i * 0.02, -i * 0.08);
            feather.rotation.x = 0.5; tailGroup.add(feather);
        }
        tailGroup.position.set(0, 0.5, -0.3); tailGroup.name = 'tail'; group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.25, 6);
        group.add(Object.assign(new THREE.Mesh(legGeo, this._mat(0xf39c12)), { position: new THREE.Vector3(-0.1, 0.12, 0.05), name: 'leg0' }));
        group.add(Object.assign(new THREE.Mesh(legGeo, this._mat(0xf39c12)), { position: new THREE.Vector3(0.1, 0.12, 0.05), name: 'leg1' }));

        if (evo >= 1) {
            for (let i = 0; i < 8; i++) {
                const ember = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), this._glowMat(config.accent));
                const angle = (i / 8) * Math.PI * 2;
                ember.position.set(Math.cos(angle) * 0.5, 0.8 + Math.sin(angle) * 0.4, Math.sin(angle) * 0.5);
                ember.name = `ember${i}`; group.add(ember);
            }
        }
        if (evo >= 2) {
            const fireRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 24), this._glowMat(0xff4500));
            fireRing.position.y = 1.5; fireRing.rotation.x = Math.PI / 2; group.add(fireRing);
        }
    },

    _createKrystal(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xdfe6e9);

        // Body - seahorse shape
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
        body.scale.set(0.7, 1.1, 0.6); body.position.y = 0.55; body.name = 'body'; group.add(body);

        // Belly
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), whiteMat);
        belly.scale.set(0.6, 0.9, 0.3); belly.position.set(0, 0.5, 0.15); group.add(belly);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat);
        head.position.y = 1.1; head.name = 'head'; group.add(head);

        // Snout
        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.15, 8), bodyMat);
        snout.position.set(0, 1.05, 0.28); snout.rotation.x = Math.PI / 2; group.add(snout);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(-0.08, 1.15, 0.2) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, whiteMat), { position: new THREE.Vector3(0.08, 1.15, 0.2) }));
        const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(-0.08, 1.15, 0.24) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(0.08, 1.15, 0.24) }));

        // Dorsal fin
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0); finShape.quadraticCurveTo(0.15, 0.3, 0, 0.4);
        finShape.quadraticCurveTo(-0.05, 0.2, 0, 0);
        const finGeo = new THREE.ShapeGeometry(finShape);
        const fin = new THREE.Mesh(finGeo, accentMat);
        fin.position.set(0, 0.8, -0.2); fin.name = 'fin'; group.add(fin);

        // Crown / horn
        const hornGeo = new THREE.ConeGeometry(0.03, 0.15, 6);
        const horn = new THREE.Mesh(hornGeo, accentMat);
        horn.position.set(0, 1.38, 0); group.add(horn);

        // Tail (curled)
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.06 - i * 0.008, 8, 8), bodyMat);
            seg.position.set(Math.sin(i * 0.8) * 0.1, -i * 0.06, -i * 0.08); tailGroup.add(seg);
        }
        // Tail curl
        const curl = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 8, 12), accentMat);
        curl.position.set(0, -0.35, -0.45); curl.rotation.x = Math.PI / 2; tailGroup.add(curl);
        tailGroup.position.set(0, 0.4, -0.25); tailGroup.name = 'tail'; group.add(tailGroup);

        // Tiny fins as arms
        const armGeo = new THREE.ConeGeometry(0.06, 0.15, 4);
        const armL = new THREE.Mesh(armGeo, accentMat); armL.position.set(-0.3, 0.6, 0); armL.rotation.z = 1; armL.name = 'armL'; group.add(armL);
        const armR = new THREE.Mesh(armGeo, accentMat); armR.position.set(0.3, 0.6, 0); armR.rotation.z = -1; armR.name = 'armR'; group.add(armR);

        if (evo >= 1) {
            for (let i = 0; i < 4; i++) {
                const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this._glowMat(config.accent));
                bubble.position.set(Math.cos(i * 1.5) * 0.5, 0.6 + i * 0.2, Math.sin(i * 1.5) * 0.5);
                bubble.name = `bubble${i}`; group.add(bubble);
            }
        }
        if (evo >= 2) {
            const trident = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.3, 6), this._mat(0xffd700, 0.3));
            trident.position.set(0.35, 0.8, 0); trident.rotation.z = -0.5; group.add(trident);
        }
    },

    _createTiger(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const stripeMat = this._mat(0x2d3436);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), bodyMat);
        body.scale.set(1.1, 0.9, 0.85); body.position.y = 0.55; body.name = 'body'; group.add(body);

        // Stripes on body
        for (let i = 0; i < 4; i++) {
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.5), stripeMat);
            stripe.position.set(-0.25 + i * 0.15, 0.6, 0); stripe.rotation.z = 0.3; group.add(stripe);
        }

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        head.position.y = 1.12; head.name = 'head'; group.add(head);

        // Snout
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat);
        snout.position.set(0, 1.05, 0.25); snout.scale.set(1, 0.7, 0.8); group.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._mat(0x2d3436));
        nose.position.set(0, 1.08, 0.34); group.add(nose);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMat = this._mat(0xf39c12, 0.4);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.12, 1.18, 0.22) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.12, 1.18, 0.22) }));
        const pupilGeo = new THREE.SphereGeometry(0.025, 6, 6);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(-0.12, 1.18, 0.26) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(0.12, 1.18, 0.26) }));

        // Ears
        const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.2, 1.38, 0); earL.rotation.z = 0.2; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.2, 1.38, 0); earR.rotation.z = -0.2; earR.name = 'earR'; group.add(earR);

        // Tail (long with tip)
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.06 - i * 0.005, 8, 8), bodyMat);
            seg.position.set(Math.sin(i * 0.5) * 0.1, i * 0.05, -i * 0.12); tailGroup.add(seg);
        }
        const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), accentMat);
        tailTip.position.set(0, 0.3, -0.72); tailGroup.add(tailTip);
        tailGroup.position.set(0, 0.45, -0.35); tailGroup.name = 'tail'; group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.25, 8);
        [[-0.2, 0.12, 0.15], [0.2, 0.12, 0.15], [-0.2, 0.12, -0.15], [0.2, 0.12, -0.15]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        // 王 character on forehead (simplified as a small mark)
        const wangMat = this._mat(0x2d3436, 0.2);
        const wang1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.01), wangMat);
        wang1.position.set(0, 1.32, 0.27); group.add(wang1);
        const wang2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.01), wangMat);
        wang2.position.set(0, 1.28, 0.27); group.add(wang2);
        const wang3 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), wangMat);
        wang3.position.set(0, 1.24, 0.27); group.add(wang3);

        if (evo >= 1) {
            for (let i = 0; i < 4; i++) {
                const spark = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._glowMat(config.accent));
                spark.position.set(Math.cos(i * 1.5) * 0.6, 0.8 + Math.sin(i) * 0.3, Math.sin(i * 1.5) * 0.6);
                spark.name = `spark${i}`; group.add(spark);
            }
        }
        if (evo >= 2) {
            const mane = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.06, 8, 16), this._glowMat(config.accent));
            mane.position.y = 1.12; mane.rotation.x = Math.PI / 2; group.add(mane);
        }
    },

    _createSprite(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const brownMat = this._mat(0x8B4513);

        // Body - small, round
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
        body.scale.set(0.85, 0.95, 0.8); body.position.y = 0.45; body.name = 'body'; group.add(body);

        // Head (oversized for cuteness)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
        head.position.y = 1.0; head.name = 'head'; group.add(head);

        // Eyes (big anime-style)
        const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x55efc4, 0.4)), { position: new THREE.Vector3(-0.1, 1.05, 0.26) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, this._mat(0x55efc4, 0.4)), { position: new THREE.Vector3(0.1, 1.05, 0.26) }));
        const pupilGeo = new THREE.SphereGeometry(0.03, 8, 8);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(-0.1, 1.05, 0.31) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(0.1, 1.05, 0.31) }));

        // Leaf ears
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.1, 0.2, 0, 0.3); leafShape.quadraticCurveTo(-0.1, 0.2, 0, 0);
        const leafGeo = new THREE.ShapeGeometry(leafShape);
        const leafL = new THREE.Mesh(leafGeo, accentMat); leafL.position.set(-0.15, 1.28, 0); leafL.rotation.z = 0.3; leafL.name = 'earL'; group.add(leafL);
        const leafR = new THREE.Mesh(leafGeo, accentMat); leafR.position.set(0.15, 1.28, 0); leafR.rotation.z = -0.3; leafR.name = 'earR'; group.add(leafR);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), brownMat);
        nose.position.set(0, 0.97, 0.3); group.add(nose);

        // Arms (tiny)
        const armGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.15, 6);
        const armL = new THREE.Mesh(armGeo, bodyMat); armL.position.set(-0.25, 0.5, 0); armL.rotation.z = 0.5; armL.name = 'armL'; group.add(armL);
        const armR = new THREE.Mesh(armGeo, bodyMat); armR.position.set(0.25, 0.5, 0); armR.rotation.z = -0.5; armR.name = 'armR'; group.add(armR);

        // Legs
        const legGeo = new THREE.SphereGeometry(0.06, 8, 8);
        group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(-0.1, 0.1, 0.05), name: 'leg0' }));
        group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(0.1, 0.1, 0.05), name: 'leg1' }));

        // Floating leaf (tail)
        const tailLeaf = new THREE.Mesh(leafGeo, accentMat);
        tailLeaf.position.set(0, 0.5, -0.35); tailLeaf.rotation.x = 0.5; tailLeaf.scale.set(1.5, 1.5, 1.5);
        tailLeaf.name = 'tail'; group.add(tailLeaf);

        // Flower on head
        const flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this._mat(0xffd700));
        flowerCenter.position.set(0.15, 1.35, 0); group.add(flowerCenter);
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._mat(0xff69b4, 0.2));
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(0.15 + Math.cos(angle) * 0.06, 1.35, Math.sin(angle) * 0.06); group.add(petal);
        }

        if (evo >= 1) {
            for (let i = 0; i < 6; i++) {
                const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._glowMat(config.accent));
                const angle = (i / 6) * Math.PI * 2;
                leaf.position.set(Math.cos(angle) * 0.5, 0.7 + Math.sin(angle) * 0.3, Math.sin(angle) * 0.5);
                leaf.name = `fleaf${i}`; group.add(leaf);
            }
        }
        if (evo >= 2) {
            const vineCrown = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16), this._glowMat(0x55efc4));
            vineCrown.position.y = 1.35; vineCrown.rotation.x = Math.PI / 2; group.add(vineCrown);
        }
    },

    _createWolf(group, config, evo) {
        const bodyMat = this._mat(config.color, evo * 0.15);
        const accentMat = this._mat(config.accent, evo * 0.1);
        const whiteMat = this._mat(0xb2bec3);

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), bodyMat);
        body.scale.set(1, 0.85, 0.8); body.position.y = 0.5; body.name = 'body'; group.add(body);

        // Chest
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), whiteMat);
        chest.scale.set(0.7, 0.8, 0.4); chest.position.set(0, 0.5, 0.18); group.add(chest);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.08; head.name = 'head'; group.add(head);

        // Snout (pointed)
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), bodyMat);
        snout.position.set(0, 1.0, 0.28); snout.rotation.x = Math.PI / 2; group.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._mat(0x2d3436));
        nose.position.set(0, 1.02, 0.38); group.add(nose);

        // Eyes (fierce, narrow)
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMat = this._mat(config.accent, 0.5);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.1, 1.12, 0.22) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.1, 1.12, 0.22) }));
        const pupilGeo = new THREE.SphereGeometry(0.02, 6, 6);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(-0.1, 1.12, 0.26) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x000000)), { position: new THREE.Vector3(0.1, 1.12, 0.26) }));

        // Ears (pointed, tall)
        const earGeo = new THREE.ConeGeometry(0.07, 0.22, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.15, 1.35, 0); earL.rotation.z = 0.15; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.15, 1.35, 0); earR.rotation.z = -0.15; earR.name = 'earR'; group.add(earR);

        // Tail (bushy)
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.08 - i * 0.01, 8, 8), bodyMat);
            seg.position.set(0, i * 0.06, -i * 0.1); tailGroup.add(seg);
        }
        tailGroup.position.set(0, 0.45, -0.35); tailGroup.rotation.x = 0.5; tailGroup.name = 'tail'; group.add(tailGroup);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.25, 8);
        [[-0.17, 0.12, 0.12], [0.17, 0.12, 0.12], [-0.17, 0.12, -0.12], [0.17, 0.12, -0.12]].forEach((pos, i) => {
            group.add(Object.assign(new THREE.Mesh(legGeo, bodyMat), { position: new THREE.Vector3(...pos), name: `leg${i}` }));
        });

        // Moon mark on forehead
        const moonGeo = new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI);
        const moon = new THREE.Mesh(moonGeo, this._glowMat(config.accent));
        moon.position.set(0, 1.25, 0.25); moon.rotation.z = Math.PI; group.add(moon);

        if (evo >= 1) {
            for (let i = 0; i < 5; i++) {
                const shadow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this._glowMat(config.accent));
                const angle = (i / 5) * Math.PI * 2;
                shadow.position.set(Math.cos(angle) * 0.5, 0.6 + Math.sin(angle) * 0.3, Math.sin(angle) * 0.5);
                shadow.name = `shadow${i}`; group.add(shadow);
            }
        }
        if (evo >= 2) {
            const moonCrown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 24), this._glowMat(config.accent));
            moonCrown.position.y = 1.5; moonCrown.rotation.x = Math.PI / 2; group.add(moonCrown);
        }
    },

    _createUnicorn(group, config, evo) {
        const bodyMat = this._mat(0xffffff, evo * 0.1);
        const accentMat = this._mat(config.accent, evo * 0.15);
        const goldMat = this._mat(0xffd700, 0.2);

        // Body (white horse)
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), bodyMat);
        body.scale.set(1, 0.88, 0.82); body.position.y = 0.55; body.name = 'body'; group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMat);
        head.position.y = 1.12; head.name = 'head'; group.add(head);

        // Snout (horse-like, elongated)
        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 8), bodyMat);
        snout.position.set(0, 1.04, 0.28); snout.rotation.x = Math.PI / 2; group.add(snout);

        // Nostrils
        const nostrilGeo = new THREE.SphereGeometry(0.02, 6, 6);
        group.add(Object.assign(new THREE.Mesh(nostrilGeo, this._mat(0xffb6c1)), { position: new THREE.Vector3(-0.03, 1.04, 0.38) }));
        group.add(Object.assign(new THREE.Mesh(nostrilGeo, this._mat(0xffb6c1)), { position: new THREE.Vector3(0.03, 1.04, 0.38) }));

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = this._mat(config.accent, 0.4);
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(-0.1, 1.16, 0.22) }));
        group.add(Object.assign(new THREE.Mesh(eyeGeo, eyeMat), { position: new THREE.Vector3(0.1, 1.16, 0.22) }));
        const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(-0.1, 1.16, 0.26) }));
        group.add(Object.assign(new THREE.Mesh(pupilGeo, this._mat(0x2d3436)), { position: new THREE.Vector3(0.1, 1.16, 0.26) }));

        // Horn (spiral unicorn horn)
        const hornGeo = new THREE.ConeGeometry(0.04, 0.3, 8);
        const horn = new THREE.Mesh(hornGeo, goldMat);
        horn.position.set(0, 1.45, 0.05); horn.rotation.x = -0.15; group.add(horn);
        // Spiral rings on horn
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04 - i * 0.005, 0.008, 6, 12), accentMat);
            ring.position.set(0, 1.35 + i * 0.08, 0.05); ring.rotation.x = Math.PI / 2; group.add(ring);
        }

        // Ears (horse-like)
        const earGeo = new THREE.ConeGeometry(0.05, 0.15, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.12, 1.38, -0.02); earL.rotation.z = 0.2; earL.name = 'earL'; group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.12, 1.38, -0.02); earR.rotation.z = -0.2; earR.name = 'earR'; group.add(earR);

        // Mane (flowing)
        const maneGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const strand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), accentMat);
            strand.position.set(0, 1.2 - i * 0.1, -0.15 - i * 0.03); maneGroup.add(strand);
        }
        maneGroup.name = 'mane'; group.add(maneGroup);

        // Tail
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.05 - i * 0.005, 8, 8), accentMat);
            seg.position.set(0, i * 0.04, -i * 0.1); tailGroup.add(seg);
        }
        tailGroup.position.set(0, 0.5, -0.35); tailGroup.name = 'tail'; group.add(tailGroup);

        // Legs (slender)
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.28, 8);
        [[-0.15, 0.13, 0.12], [0.15, 0.13, 0.12], [-0.15, 0.13, -0.12], [0.15, 0.13, -0.12]].forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeo, bodyMat); leg.position.set(...pos); leg.name = `leg${i}`; group.add(leg);
            // Hooves
            const hoof = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), goldMat);
            hoof.position.set(pos[0], 0, pos[2]); group.add(hoof);
        });

        // Wings for evo
        if (evo >= 1) {
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.5, 0.6, 0.3, 0.9);
            wingShape.quadraticCurveTo(0.1, 0.5, 0, 0);
            const wingGeo = new THREE.ShapeGeometry(wingShape);
            const wingMat = this._glowMat(config.accent);
            const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.set(-0.3, 0.7, -0.15); wingL.rotation.y = -0.3; wingL.name = 'wingL'; group.add(wingL);
            const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.set(0.3, 0.7, -0.15); wingR.rotation.y = 0.3 + Math.PI; wingR.name = 'wingR'; group.add(wingR);

            for (let i = 0; i < 6; i++) {
                const star = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), this._glowMat(config.color));
                const angle = (i / 6) * Math.PI * 2;
                star.position.set(Math.cos(angle) * 0.6, 0.8 + Math.sin(angle) * 0.3, Math.sin(angle) * 0.6);
                star.name = `star${i}`; group.add(star);
            }
        }
        if (evo >= 2) {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 24), this._glowMat(0xffd700));
            halo.position.y = 1.55; halo.rotation.x = Math.PI / 2; group.add(halo);
            // Second horn ring
            const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12), this._glowMat(0xff69b4));
            ring2.position.y = 1.55; ring2.rotation.x = Math.PI / 2; group.add(ring2);
        }
    },
};


/* ============================================
   Pet Animator
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
    }

    animate(time) {
        const t = time * 0.001;

        if (this.group) {
            const body = this.group.getObjectByName('body');
            if (body) body.scale.y = (this.type === 'bear' || this.type === 'tiger' ? 0.95 : 0.9) + Math.sin(t * 2) * 0.02;

            const head = this.group.getObjectByName('head');
            if (head) head.rotation.z = Math.sin(t * 0.8) * 0.05;

            const tail = this.group.getObjectByName('tail');
            if (tail) {
                tail.rotation.y = Math.sin(t * 3) * 0.3;
                if (this.type === 'cat' || this.type === 'wolf') tail.rotation.z = Math.sin(t * 1.5) * 0.15;
            }

            const earL = this.group.getObjectByName('earL');
            const earR = this.group.getObjectByName('earR');
            if (earL) earL.rotation.z = (this.type === 'fox' ? 0.2 : 0.15) + Math.sin(t * 2 + 1) * 0.08;
            if (earR) earR.rotation.z = -(this.type === 'fox' ? 0.2 : 0.15) - Math.sin(t * 2) * 0.08;

            const wingL = this.group.getObjectByName('wingL');
            const wingR = this.group.getObjectByName('wingR');
            if (wingL) wingL.rotation.z = Math.sin(t * 2.5) * 0.15;
            if (wingR) wingR.rotation.z = -Math.sin(t * 2.5) * 0.15;

            const halo = this.group.getObjectByName('halo');
            if (halo) { halo.position.y += Math.sin(t * 1.5) * 0.001; halo.rotation.z = t * 0.5; }

            const aura = this.group.getObjectByName('aura');
            if (aura) { aura.rotation.z = t; aura.material.opacity = 0.3 + Math.sin(t * 2) * 0.15; }

            // Animated floating objects
            for (let i = 0; i < 8; i++) {
                const names = ['crystal', 'orb', 'bolt', 'petal', 'ember', 'bubble', 'spark', 'fleaf', 'shadow', 'star'];
                for (const n of names) {
                    const obj = this.group.getObjectByName(`${n}${i}`);
                    if (obj) {
                        if (n === 'crystal' || n === 'orb' || n === 'star') {
                            obj.position.y += Math.sin(t * 2 + i * 2) * 0.002;
                            obj.rotation.x = t + i; obj.rotation.y = t * 0.5 + i;
                        } else if (n === 'bolt' || n === 'spark') {
                            obj.material.opacity = Math.random() > 0.7 ? 0.8 : 0.2;
                            obj.rotation.z += 0.05;
                        } else if (n === 'ember' || n === 'bubble') {
                            obj.position.y += Math.sin(t * 3 + i) * 0.003;
                            obj.material.opacity = 0.3 + Math.sin(t * 2 + i) * 0.3;
                        } else if (n === 'petal' || n === 'fleaf') {
                            const angle = (i / 5) * Math.PI * 2 + t * 0.5;
                            obj.position.x = Math.cos(angle) * 0.5;
                            obj.position.z = Math.sin(angle) * 0.5;
                            obj.position.y = 1.3 + Math.sin(t + i) * 0.1;
                        } else if (n === 'shadow') {
                            obj.material.opacity = 0.2 + Math.sin(t + i) * 0.3;
                            obj.position.y += Math.sin(t * 1.5 + i) * 0.002;
                        }
                    }
                }
            }

            const fin = this.group.getObjectByName('fin');
            if (fin) fin.rotation.z = Math.sin(t * 2) * 0.1;

            // Legs
            for (let i = 0; i < 4; i++) {
                const leg = this.group.getObjectByName(`leg${i}`);
                if (leg) leg.rotation.x = Math.sin(t * 2 + i * 1.5) * 0.05;
            }
        }

        // Blink
        this.blinkTimer += 16;
        if (this.blinkTimer > 3000 + Math.random() * 2000) this.blinkTimer = 0;

        if (this.shadow) {
            const s = 0.6 + Math.sin(t * 2) * 0.05;
            this.shadow.scale.set(s, s, 1);
        }

        if (this.currentAnim === 'happy') this._happyAnim();
        else if (this.currentAnim === 'attack') this._attackAnim();
    }

    playAnimation(name, duration = 1000) {
        this.currentAnim = name;
        this.animStartTime = performance.now();
        this.animDuration = duration;
    }

    _happyAnim() {
        const elapsed = performance.now() - this.animStartTime;
        if (elapsed > this.animDuration) {
            this.currentAnim = 'idle';
            this.group.position.y = 0;
            this.group.rotation.y = 0;
            return;
        }
        const progress = elapsed / this.animDuration;
        this.group.position.y = Math.sin(progress * Math.PI * 3) * 0.3;
        this.group.rotation.y = progress * Math.PI * 4;
        const squash = 1 + Math.sin(progress * Math.PI * 6) * 0.1;
        this.group.scale.y = (1 + this.evolution * 0.2) * squash;
    }

    _attackAnim() {
        const elapsed = performance.now() - this.animStartTime;
        if (elapsed > this.animDuration) {
            this.currentAnim = 'idle';
            this.group.position.z = 0;
            this.group.position.x = 0;
            return;
        }
        const progress = elapsed / this.animDuration;
        this.group.position.z = Math.sin(progress * Math.PI) * 0.5;
        this.group.position.x = Math.sin(progress * Math.PI * 8) * 0.05 * (1 - progress);
    }
}
