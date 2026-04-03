/* ============================================
   Ranking Module
   ============================================ */

const Ranking = {
    async init() {
        await this.loadRanking();
    },
    
    async loadRanking() {
        try {
            const data = await App.api('/api/ranking');
            this.renderRanking(data.ranking || []);
        } catch (e) {
            console.error('Failed to load ranking:', e);
        }
    },
    
    renderRanking(rankings) {
        const container = document.getElementById('ranking-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (rankings.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">暂无排名数据</div>';
            return;
        }
        
        const petEmojis = {
            dragon: '🐉', fox: '🦊', bear: '🐻',
            rabbit: '🐰', cat: '🐱', angel: '👼',
            phoenix: '🔥', krystal: '🐬', tiger: '🐯',
            sprite: '🌿', wolf: '🐺', unicorn: '🦄'
        };
        
        rankings.forEach((entry, index) => {
            const rank = index + 1;
            const div = document.createElement('div');
            
            let topClass = '';
            if (rank === 1) topClass = 'top-1';
            else if (rank === 2) topClass = 'top-2';
            else if (rank === 3) topClass = 'top-3';
            
            div.className = `ranking-entry ${topClass}`;
            
            let medal = rank;
            if (rank === 1) medal = '🥇';
            else if (rank === 2) medal = '🥈';
            else if (rank === 3) medal = '🥉';
            
            div.innerHTML = `
                <div class="ranking-position ${topClass}">${medal}</div>
                <div class="ranking-pet-icon">${petEmojis[entry.pet_type] || '🐾'}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${entry.pet_name || '未命名'}</div>
                    <div class="ranking-owner">Lv.${entry.level} · ${entry.player_name || '未知'}</div>
                </div>
                <div class="ranking-cp">${entry.combat_power || 0}</div>
            `;
            
            container.appendChild(div);
        });
    },
    
    async loadBattleHistory() {
        try {
            const data = await App.api('/api/battle_history');
            return data.history || [];
        } catch (e) {
            console.error('Failed to load battle history:', e);
            return [];
        }
    },
    
    renderBattleHistory(history) {
        const container = document.getElementById('battle-history');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4);">暂无战斗记录</div>';
            return;
        }
        
        history.forEach(record => {
            const div = document.createElement('div');
            div.className = `ranking-entry ${record.won ? 'top-1' : ''}`;
            
            const resultIcon = record.won ? '✅' : '❌';
            const resultText = record.won ? '胜利' : '失败';
            
            div.innerHTML = `
                <div style="font-size: 1.5rem;">${resultIcon}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${resultText} vs ${record.opponent_name || '野生宠物'}</div>
                    <div class="ranking-owner">${record.timestamp || ''}</div>
                </div>
                <div style="color: ${record.won ? '#00b894' : '#ff7675'}">+${record.exp_gained || 0} 经验</div>
            `;
            
            container.appendChild(div);
        });
    }
};
