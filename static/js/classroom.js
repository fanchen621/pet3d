/* ============================================
   Classroom Module - 班级管理 + Excel导入
   ============================================ */

const Classroom = {
    students: [],
    stats: {},
    currentStudent: null,
    dragCounter: 0,

    async init() {
        await this.loadStudents();
        this.bindEvents();
    },

    bindEvents() {
        // Import modal
        document.getElementById('btn-import-excel')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('import-cancel')?.addEventListener('click', () => this.hideImportModal());
        document.getElementById('excel-upload')?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Drag & drop
        const dropzone = document.getElementById('import-dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragenter', (e) => { e.preventDefault(); this.dragCounter++; dropzone.classList.add('drag-over'); });
            dropzone.addEventListener('dragleave', (e) => { e.preventDefault(); this.dragCounter--; if (this.dragCounter === 0) dropzone.classList.remove('drag-over'); });
            dropzone.addEventListener('dragover', (e) => e.preventDefault());
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dragCounter = 0;
                dropzone.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) this.uploadFile(file);
            });
        }

        // Student modal
        document.getElementById('student-modal-close')?.addEventListener('click', () => this.hideStudentModal());
        document.getElementById('btn-add-points')?.addEventListener('click', () => this.submitPoints(true));
        document.getElementById('btn-sub-points')?.addEventListener('click', () => this.submitPoints(false));

        // Quick point buttons
        document.querySelectorAll('.quick-add, .quick-sub').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseInt(btn.dataset.delta);
                document.getElementById('points-delta-input').value = Math.abs(delta);
                this.submitPoints(delta > 0);
            });
        });
    },

    async loadStudents() {
        try {
            const data = await App.api('/api/students');
            this.students = data.students || [];
            this.stats = data.classroom_stats || {};
            this.renderStudentGrid();
            this.updateStats();
        } catch (e) {
            console.error('Failed to load students:', e);
        }
    },

    updateStats() {
        const els = {
            'stat-students': this.stats.total_students || 0,
            'stat-pets': this.stats.total_pets || 0,
            'stat-avg-level': this.stats.avg_level || 0,
            'stat-top-cp': this.stats.top_cp || 0,
        };
        for (const [id, val] of Object.entries(els)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }
    },

    renderStudentGrid() {
        const grid = document.getElementById('student-grid');
        if (!grid) return;

        if (this.students.length === 0) {
            grid.innerHTML = `
                <div class="empty-classroom">
                    <div class="empty-icon">📋</div>
                    <div class="empty-text">还没有学生数据</div>
                    <div class="empty-hint">点击「导入学生」上传班级优化大师导出的Excel文件</div>
                </div>`;
            return;
        }

        grid.innerHTML = '';
        this.students.forEach((student, idx) => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.style.animationDelay = `${idx * 0.05}s`;

            const hasPet = student.pet_type && student.pet_type !== '';
            const petEmoji = this.getPetEmoji(student.pet_type);
            const elementColor = this.getElementColor(student.pet_type);

            // Mood indicator based on points
            const moodClass = student.current_points > 50 ? 'happy' : student.current_points > 20 ? 'normal' : 'sad';
            const moodEmoji = student.current_points > 50 ? '😊' : student.current_points > 20 ? '😐' : '😢';

            card.innerHTML = `
                <div class="student-card-avatar">
                    <span class="student-avatar-emoji">${student.gender === '女' ? '👧' : '🧑'}</span>
                </div>
                <div class="student-card-pet ${hasPet ? '' : 'no-pet'}" style="${hasPet ? `background: radial-gradient(ellipse at center, ${elementColor}22, transparent)` : ''}">
                    <div class="pet-emoji-display">${hasPet ? petEmoji : '❓'}</div>
                    ${hasPet ? `<div class="pet-mini-info">Lv.${student.pet_level || 1}</div>` : ''}
                </div>
                <div class="student-card-info">
                    <div class="student-card-name">${student.name || '未命名学生'}</div>
                    <div class="student-card-meta">
                        <span class="student-points-badge">⭐ ${student.current_points}</span>
                        <span class="student-mood">${moodEmoji}</span>
                    </div>
                    ${hasPet ? `
                        <div class="student-pet-name" style="color:${elementColor}">${student.pet_name}</div>
                        <div class="student-pet-cp">⚔️ ${student.pet_combat_power || 0} 战力</div>
                    ` : '<div class="no-pet-label">未领养宠物</div>'}
                </div>
            `;

            card.onclick = () => this.showStudentDetail(student);
            grid.appendChild(card);
        });
    },

    getPetEmoji(type) {
        const emojis = {
            dragon: '🐉', fox: '🦊', bear: '🐻', rabbit: '🐰', cat: '🐱', angel: '👼',
            phoenix: '🔥', krystal: '🐬', tiger: '🐯', sprite: '🌿', wolf: '🐺', unicorn: '🦄'
        };
        return emojis[type] || '🐾';
    },

    getElementColor(type) {
        const colors = {
            dragon: '#e74c3c', fox: '#74b9ff', bear: '#f1c40f', rabbit: '#2ecc71',
            cat: '#8e44ad', angel: '#f39c12', phoenix: '#ff6348', krystal: '#0984e3',
            tiger: '#ffa502', sprite: '#00b894', wolf: '#6c5ce7', unicorn: '#ffeaa7'
        };
        return colors[type] || '#6c5ce7';
    },

    // ===== IMPORT =====

    showImportModal() {
        document.getElementById('import-modal')?.classList.add('active');
        document.getElementById('import-result').style.display = 'none';
        document.getElementById('import-progress').style.display = 'none';
    },

    hideImportModal() {
        document.getElementById('import-modal')?.classList.remove('active');
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) this.uploadFile(file);
        event.target.value = '';
    },

    async uploadFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'csv'].includes(ext)) {
            App.showToast('仅支持 .xlsx 和 .csv 文件（.xls 请先另存为 .xlsx）', 'error');
            return;
        }

        const progress = document.getElementById('import-progress');
        const progressFill = document.getElementById('import-progress-fill');
        const progressText = document.getElementById('import-progress-text');
        const result = document.getElementById('import-result');

        progress.style.display = 'block';
        progressFill.style.width = '30%';
        progressText.textContent = '正在解析文件...';
        result.style.display = 'none';

        const formData = new FormData();
        formData.append('file', file);

        try {
            progressFill.style.width = '60%';
            progressText.textContent = '正在导入学生...';

            const res = await fetch('/api/import_excel', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            progressFill.style.width = '100%';

            if (data.success) {
                this.students = data.students || [];
                this.stats = data.classroom_stats || {};
                this.renderStudentGrid();
                this.updateStats();

                result.style.display = 'block';
                result.innerHTML = `
                    <div class="result-success">
                        <div class="result-icon">✅</div>
                        <div class="result-text">导入成功！</div>
                        <div class="result-details">
                            新增 <strong>${data.imported}</strong> 名学生，更新 <strong>${data.updated}</strong> 名
                            <br>共处理 <strong>${data.total}</strong> 条记录
                        </div>
                    </div>`;
                progressText.textContent = '导入完成！';

                App.showToast(`成功导入 ${data.imported} 名学生！`, 'success');
            } else {
                result.style.display = 'block';
                result.innerHTML = `
                    <div class="result-error">
                        <div class="result-icon">❌</div>
                        <div class="result-text">${data.message || '导入失败'}</div>
                    </div>`;
                progressText.textContent = '导入失败';
            }
        } catch (e) {
            progress.style.display = 'none';
            result.style.display = 'block';
            result.innerHTML = `<div class="result-error"><div class="result-icon">❌</div><div class="result-text">上传失败: ${e.message}</div></div>`;
        }
    },

    // ===== STUDENT DETAIL =====

    async showStudentDetail(student) {
        this.currentStudent = student;

        try {
            const data = await App.api(`/api/student/${student.id}`);
            if (data.success) {
                this.currentStudent = data.student;
                student = data.student;
            }
        } catch (e) {}

        document.getElementById('student-avatar').textContent = student.gender === '女' ? '👧' : '🧑';
        document.getElementById('student-detail-name').textContent = student.name;
        document.getElementById('student-detail-no').textContent = student.student_no ? `学号: ${student.student_no}` : '';
        document.getElementById('student-points-value').textContent = student.current_points;

        // Pet display
        const petSection = document.getElementById('student-pet-display');
        const hasPet = student.pet_type && student.pet_type !== '';

        if (hasPet) {
            const petEmoji = this.getPetEmoji(student.pet_type);
            const elementColor = this.getElementColor(student.pet_type);
            const rarityName = Pets3D.rarityNames?.[student.pet_data?.rarity] || '';
            const evoName = ['', '· 已进化', '· 超进化'][student.pet_evolution] || '';

            petSection.innerHTML = `
                <div class="student-pet-card" style="border-color: ${elementColor}">
                    <div class="student-pet-emoji">${petEmoji}</div>
                    <div class="student-pet-details">
                        <div class="student-pet-detail-name" style="color: ${elementColor}">${student.pet_name}</div>
                        <div class="student-pet-detail-type">${Pets3D.petTypes[student.pet_type]?.name || student.pet_type} ${rarityName} ${evoName}</div>
                        <div class="student-pet-detail-stats">
                            <span>Lv.${student.pet_level || 1}</span>
                            <span>⚔️ ${student.pet_combat_power || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="pet-choose-label">更换宠物:</div>
                <div class="pet-choose-grid" id="pet-choose-grid"></div>`;
        } else {
            petSection.innerHTML = `
                <div class="no-pet-hint">该学生还未领养宠物，选择一只吧！</div>
                <div class="pet-choose-grid" id="pet-choose-grid"></div>`;
        }

        // Build pet choose grid
        this.buildPetChooseGrid(student.id);

        // Point logs
        try {
            const data = await App.api(`/api/student/${student.id}`);
            if (data.success && data.point_logs) {
                this.renderPointLogs(data.point_logs);
            }
        } catch (e) {}

        document.getElementById('student-modal')?.classList.add('active');
    },

    buildPetChooseGrid(studentId) {
        const grid = document.getElementById('pet-choose-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const allTypes = Object.entries(Pets3D.petTypes);

        allTypes.forEach(([type, info]) => {
            const btn = document.createElement('button');
            btn.className = 'pet-choose-btn';
            const emoji = this.getPetEmoji(type);
            const color = this.getElementColor(type);
            btn.style.borderColor = color + '40';
            btn.innerHTML = `<span class="pet-choose-emoji">${emoji}</span><span class="pet-choose-name">${info.name}</span>`;
            btn.onmouseenter = () => btn.style.borderColor = color;
            btn.onmouseleave = () => btn.style.borderColor = color + '40';
            btn.onclick = () => this.assignPet(studentId, type);
            grid.appendChild(btn);
        });
    },

    renderPointLogs(logs) {
        const list = document.getElementById('point-logs-list');
        if (!list) return;

        if (!logs || logs.length === 0) {
            list.innerHTML = '<div class="no-logs">暂无积分记录</div>';
            return;
        }

        list.innerHTML = logs.map(log => {
            const isPositive = log.delta > 0;
            const icon = isPositive ? '➕' : '➖';
            const color = isPositive ? '#00b894' : '#ff7675';
            const time = new Date(log.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="log-entry">
                    <span class="log-icon" style="color:${color}">${icon}</span>
                    <span class="log-delta" style="color:${color}">${isPositive ? '+' : ''}${log.delta}</span>
                    <span class="log-reason">${log.reason || '手动调整'}</span>
                    <span class="log-time">${time}</span>
                </div>`;
        }).join('');
    },

    hideStudentModal() {
        document.getElementById('student-modal')?.classList.remove('active');
        this.currentStudent = null;
    },

    async submitPoints(isAdd) {
        if (!this.currentStudent) return;

        const input = document.getElementById('points-delta-input');
        const reasonInput = document.getElementById('points-reason-input');
        let delta = parseInt(input.value);

        if (!delta || delta <= 0) {
            App.showToast('请输入有效的积分数', 'error');
            return;
        }

        if (!isAdd) delta = -delta;

        const reason = reasonInput.value.trim();

        try {
            const res = await App.api(`/api/student/${this.currentStudent.id}/points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta, reason })
            });

            if (res.success) {
                this.currentStudent = res.student;
                this.stats = res.classroom_stats || {};
                document.getElementById('student-points-value').textContent = res.student.current_points;
                input.value = '';
                reasonInput.value = '';

                // Refresh student in list
                const idx = this.students.findIndex(s => s.id === res.student.id);
                if (idx >= 0) this.students[idx] = res.student;
                this.renderStudentGrid();
                this.updateStats();

                const sign = delta > 0 ? '+' : '';
                App.showToast(`${res.student.name} ${sign}${delta} 积分`, 'success');

                // Reload logs
                try {
                    const data = await App.api(`/api/student/${this.currentStudent.id}`);
                    if (data.success && data.point_logs) this.renderPointLogs(data.point_logs);
                } catch (e) {}
            } else {
                App.showToast(res.message || '操作失败', 'error');
            }
        } catch (e) {
            App.showToast('操作失败', 'error');
        }
    },

    async assignPet(studentId, petType) {
        try {
            const res = await App.api(`/api/student/${studentId}/assign_pet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pet_type: petType })
            });

            if (res.success) {
                this.currentStudent = res.student;
                this.stats = res.classroom_stats || {};
                const idx = this.students.findIndex(s => s.id === studentId);
                if (idx >= 0) this.students[idx] = res.student;
                this.renderStudentGrid();
                this.updateStats();

                App.showToast(`${res.student.name} 领养了 ${res.pet.name}！`, 'success');

                // Re-render pet section
                this.showStudentDetail(res.student);
            } else {
                App.showToast(res.message || '分配宠物失败', 'error');
            }
        } catch (e) {
            App.showToast('分配宠物失败', 'error');
        }
    }
};
