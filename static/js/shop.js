/* ============================================
   Shop & Inventory Module
   ============================================ */

const Shop = {
    currentTab: 'food',
    
    shopItems: {
        food: [
            { id: 'apple', name: '魔法苹果', icon: '🍎', desc: '恢复20点心情值', price: 10, type: 'food', effect: { mood: 20 }, rarity: 'common' },
            { id: 'cake', name: '星光蛋糕', icon: '🎂', desc: '恢复50点心情值', price: 30, type: 'food', effect: { mood: 50 }, rarity: 'uncommon' },
            { id: 'feast', name: '龙之盛宴', icon: '🍖', desc: '完全恢复心情值', price: 80, type: 'food', effect: { mood: 100 }, rarity: 'rare' },
            { id: 'candy', name: '彩虹糖果', icon: '🍬', desc: '恢复10点心情值', price: 5, type: 'food', effect: { mood: 10 }, rarity: 'common' },
            { id: 'potion', name: '经验药水', icon: '🧪', desc: '获得50点经验值', price: 50, type: 'food', effect: { exp: 50 }, rarity: 'uncommon' },
            { id: 'elixir', name: '超级经验药水', icon: '⚗️', desc: '获得200点经验值', price: 150, type: 'food', effect: { exp: 200 }, rarity: 'rare' }
        ],
        costumes: [
            { id: 'hat_crown', name: '小皇冠', icon: '👑', desc: '华丽的金色小皇冠', price: 100, type: 'costume', slot: 'hat', rarity: 'rare' },
            { id: 'hat_wizard', name: '巫师帽', icon: '🎩', desc: '神秘的巫师帽', price: 120, type: 'costume', slot: 'hat', rarity: 'rare' },
            { id: 'hat_flower', name: '花环', icon: '💐', desc: '美丽的花环头饰', price: 60, type: 'costume', slot: 'hat', rarity: 'uncommon' },
            { id: 'acc_glasses', name: '酷炫墨镜', icon: '🕶️', desc: '超酷的墨镜', price: 80, type: 'costume', slot: 'accessory', rarity: 'uncommon' },
            { id: 'acc_wings', name: '精灵翅膀', icon: '🦋', desc: '闪闪发光的翅膀', price: 200, type: 'costume', slot: 'accessory', rarity: 'epic' },
            { id: 'acc_cape', name: '英雄披风', icon: '🧣', desc: '飘逸的英雄披风', price: 150, type: 'costume', slot: 'accessory', rarity: 'epic' },
            { id: 'cloth_armor', name: '闪亮铠甲', icon: '🛡️', desc: '增加10%防御力', price: 180, type: 'costume', slot: 'body', rarity: 'epic' },
            { id: 'cloth_robe', name: '魔法长袍', icon: '👘', desc: '增加10%特攻', price: 180, type: 'costume', slot: 'body', rarity: 'epic' }
        ],
        skills: [
            { id: 'scroll_fire', name: '火焰技能卷轴', icon: '📜', desc: '学习火系技能', price: 100, type: 'skill_scroll', element: 'fire', rarity: 'rare' },
            { id: 'scroll_ice', name: '冰霜技能卷轴', icon: '📜', desc: '学习冰系技能', price: 100, type: 'skill_scroll', element: 'ice', rarity: 'rare' },
            { id: 'scroll_elec', name: '雷电技能卷轴', icon: '📜', desc: '学习电系技能', price: 100, type: 'skill_scroll', element: 'electric', rarity: 'rare' },
            { id: 'scroll_nature', name: '自然技能卷轴', icon: '📜', desc: '学习自然系技能', price: 100, type: 'skill_scroll', element: 'nature', rarity: 'rare' },
            { id: 'scroll_dark', name: '暗影技能卷轴', icon: '📜', desc: '学习暗系技能', price: 100, type: 'skill_scroll', element: 'dark', rarity: 'rare' },
            { id: 'scroll_light', name: '光明技能卷轴', icon: '📜', desc: '学习光系技能', price: 100, type: 'skill_scroll', element: 'light', rarity: 'rare' }
        ],
        evolution: [
            { id: 'stone_fire', name: '火焰进化石', icon: '🔴', desc: '火系宠物进化材料', price: 300, type: 'evolution_stone', element: 'fire', rarity: 'epic' },
            { id: 'stone_ice', name: '冰霜进化石', icon: '🔵', desc: '冰系宠物进化材料', price: 300, type: 'evolution_stone', element: 'ice', rarity: 'epic' },
            { id: 'stone_elec', name: '雷电进化石', icon: '🟡', desc: '电系宠物进化材料', price: 300, type: 'evolution_stone', element: 'electric', rarity: 'epic' },
            { id: 'stone_nature', name: '自然进化石', icon: '🟢', desc: '自然系宠物进化材料', price: 300, type: 'evolution_stone', element: 'nature', rarity: 'epic' },
            { id: 'stone_dark', name: '暗影进化石', icon: '🟣', desc: '暗系宠物进化材料', price: 300, type: 'evolution_stone', element: 'dark', rarity: 'epic' },
            { id: 'stone_light', name: '光明进化石', icon: '🟠', desc: '光系宠物进化材料', price: 300, type: 'evolution_stone', element: 'light', rarity: 'epic' },
            { id: 'super_stone', name: '超级进化石', icon: '💎', desc: '超级进化必备材料', price: 800, type: 'evolution_stone', element: 'any', rarity: 'legendary' }
        ],
        special: [
            { id: 'rename', name: '改名卡', icon: '✏️', desc: '为宠物更改名字', price: 50, type: 'special', rarity: 'common' },
            { id: 'revive', name: '复活药水', icon: '💖', desc: '战斗中复活一次', price: 40, type: 'special', rarity: 'uncommon' },
            { id: 'exp_boost', name: '经验加倍卡', icon: '⚡', desc: '1小时内经验×2', price: 60, type: 'special', rarity: 'uncommon' },
            { id: 'lucky', name: '幸运符', icon: '🍀', desc: '提高稀有掉落率', price: 70, type: 'special', rarity: 'uncommon' },
            { id: 'capture', name: '宠物球', icon: '🔮', desc: '捕捉新的野生宠物', price: 100, type: 'special', rarity: 'rare' }
        ]
    },
    
    tabNames: {
        food: '🍎 食物',
        costumes: '👔 装扮',
        skills: '📜 技能',
        evolution: '💎 进化',
        special: '✨ 特殊'
    },
    
    async init() {
        this.renderTabs();
        this.renderItems(this.currentTab);
    },
    
    renderTabs() {
        const container = document.getElementById('shop-tabs');
        if (!container) return;
        
        container.innerHTML = '';
        for (const [key, label] of Object.entries(this.tabNames)) {
            const tab = document.createElement('button');
            tab.className = `shop-tab ${key === this.currentTab ? 'active' : ''}`;
            tab.textContent = label;
            tab.onclick = () => {
                this.currentTab = key;
                this.renderTabs();
                this.renderItems(key);
            };
            container.appendChild(tab);
        }
    },
    
    renderItems(category) {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;
        
        const items = this.shopItems[category] || [];
        grid.innerHTML = '';
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = `shop-item rarity-${item.rarity}`;
            
            const owned = App.gameState.inventory.some(i => i.item_id === item.id);
            if (owned && item.type !== 'food') {
                div.classList.add('owned');
            }
            
            div.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-price">${item.price}</div>
            `;
            
            div.onclick = () => this.buyItem(item);
            grid.appendChild(div);
        });
    },
    
    async buyItem(item) {
        if (App.gameState.player.points < item.price) {
            App.showToast('积分不足！', 'error');
            return;
        }
        
        const owned = App.gameState.inventory.find(i => i.item_id === item.id && item.type !== 'food');
        if (owned && item.type !== 'food') {
            App.showToast('你已经拥有这个物品了！', 'warning');
            return;
        }
        
        const confirmed = await App.showConfirm(
            '购买确认',
            `确定要花 ${item.price} 积分购买「${item.name}」吗？`
        );
        
        if (!confirmed) return;
        
        try {
            const res = await App.api('/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: item.id, price: item.price, item_data: item })
            });
            
            if (res.success) {
                App.gameState.player.points = res.remaining_points;
                App.gameState.inventory = res.inventory;
                App.updateUI();
                App.showToast(`成功购买 ${item.name}！`, 'success');
                this.renderItems(this.currentTab);
            } else {
                App.showToast(res.message || '购买失败', 'error');
            }
        } catch (e) {
            App.showToast('购买失败: ' + e.message, 'error');
        }
    },
    
    async useItem(itemId) {
        const invItem = App.gameState.inventory.find(i => i.item_id === itemId);
        if (!invItem || invItem.count <= 0) {
            App.showToast('物品数量不足', 'error');
            return;
        }
        
        try {
            const res = await App.api('/api/use_item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId })
            });
            
            if (res.success) {
                App.gameState.inventory = res.inventory;
                App.gameState.pet = res.pet;
                App.updateUI();
                App.showToast(res.message || '使用成功！', 'success');
            } else {
                App.showToast(res.message || '使用失败', 'error');
            }
        } catch (e) {
            App.showToast('使用失败: ' + e.message, 'error');
        }
    }
};

/* ========== INVENTORY ========== */
const Inventory = {
    currentTab: 'all',
    
    async init() {
        this.renderTabs();
        this.renderItems();
    },
    
    renderTabs() {
        const container = document.getElementById('inventory-tabs');
        if (!container) return;
        
        const tabs = [
            { key: 'all', label: '全部' },
            { key: 'food', label: '食物' },
            { key: 'costume', label: '装扮' },
            { key: 'skill', label: '技能' },
            { key: 'evolution', label: '进化' },
            { key: 'special', label: '特殊' }
        ];
        
        container.innerHTML = '';
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.className = `shop-tab ${tab.key === this.currentTab ? 'active' : ''}`;
            btn.textContent = tab.label;
            btn.onclick = () => {
                this.currentTab = tab.key;
                this.renderTabs();
                this.renderItems();
            };
            container.appendChild(btn);
        });
    },
    
    renderItems() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;
        
        let items = App.gameState.inventory;
        if (this.currentTab !== 'all') {
            items = items.filter(i => {
                const itemData = this.findShopItem(i.item_id);
                return itemData && itemData.type.startsWith(this.currentTab);
            });
        }
        
        grid.innerHTML = '';
        
        if (items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">背包空空如也~</div>';
            return;
        }
        
        items.forEach(inv => {
            const itemData = this.findShopItem(inv.item_id);
            if (!itemData) return;
            
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.innerHTML = `
                <div class="item-icon">${itemData.icon}</div>
                <div class="item-name">${itemData.name}</div>
                ${inv.count > 1 ? `<div class="item-count">×${inv.count}</div>` : ''}
            `;
            
            slot.onclick = () => this.onItemClick(inv, itemData);
            grid.appendChild(slot);
        });
    },
    
    onItemClick(inv, itemData) {
        if (itemData.type === 'food') {
            App.showConfirm('使用物品', `对宠物使用「${itemData.name}」？`).then(ok => {
                if (ok) Shop.useItem(inv.item_id);
            });
        } else if (itemData.type === 'skill_scroll') {
            App.showConfirm('学习技能', `让宠物学习「${itemData.name}」中的技能？`).then(ok => {
                if (ok) Shop.useItem(inv.item_id);
            });
        } else {
            App.showToast(`${itemData.name}: ${itemData.desc}`, 'info');
        }
    },
    
    findShopItem(itemId) {
        for (const category of Object.values(Shop.shopItems)) {
            const item = category.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }
};
