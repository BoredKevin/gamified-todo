// ==================== GAMIFICATION SERVICE ====================

const GamificationService = {
    XP_REWARDS: {
        easy: 10,
        medium: 25,
        hard: 50
    },

    state: {
        user: JSON.parse(localStorage.getItem('userStats')) || { totalXP: 0, level: 1, tasksCompleted: 0 },
        daily: JSON.parse(localStorage.getItem('dailyStats')) || { dailyXP: {}, lastActiveDate: null, currentStreak: 0 }
    },

    /**
     * Save all stats to localStorage
     */
    save() {
        localStorage.setItem('userStats', JSON.stringify(this.state.user));
        localStorage.setItem('dailyStats', JSON.stringify(this.state.daily));
    },

    calculateLevel(totalXP) {
        return Math.floor(Math.sqrt(totalXP / 25)) + 1;
    },

    getXPForLevel(level) {
        return 25 * level * level;
    },

    getLevelProgress() {
        const currentLevel = this.state.user.level;
        const currentLevelXP = this.getXPForLevel(currentLevel - 1);
        const nextLevelXP = this.getXPForLevel(currentLevel);
        const progressXP = this.state.user.totalXP - currentLevelXP;
        const requiredXP = nextLevelXP - currentLevelXP;
        const percentage = Math.min((progressXP / requiredXP) * 100, 100);
        
        return { current: progressXP, required: requiredXP, percentage };
    },

    getTodayString() {
        return new Date().toISOString().split('T')[0];
    },

    calculateStreak() {
        const dates = Object.keys(this.state.daily.dailyXP).sort().reverse();
        if (dates.length === 0) {
            this.state.daily.currentStreak = 0;
            return;
        }
        
        const today = this.getTodayString();
        let streak = 0;
        let currentDate = new Date(today);
        
        // Check grace period (today or yesterday)
        const lastActive = new Date(dates[0]);
        const daysDiff = Math.floor((new Date(today) - lastActive) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
            this.state.daily.currentStreak = 0;
            return;
        }
        
        // Count backwards
        for (let i = 0; i < dates.length; i++) {
            // Simple streak logic based on consecutive entries in keys
            // For robust streak calculation, date comparison is safer, but preserving logic:
            const dateStr = currentDate.toISOString().split('T')[0];
            if (this.state.daily.dailyXP[dateStr]) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (i === 0 && daysDiff === 0) {
                // If today has entry, we continue, if not and we just started loop, we might check yesterday
                 // This logic mimics original implementation roughly
                 continue; 
            } else {
               // Simple break for now based on original logic intent
               // Ideally checking exact date matches
            }
        }
        // Re-using original simpler logic requires just updating the stored value
        // We will trust the dailyXP log for now. 
        // Let's use a simplified logic: if accessed today/yesterday, keep streak.
        
        // Re-implementing exact logic from original file for safety:
        streak = 0;
        currentDate = new Date(today);
        for (let i = 0; i < dates.length; i++) {
             const dString = currentDate.toISOString().split('T')[0];
             if(this.state.daily.dailyXP[dString]) {
                 streak++;
                 currentDate.setDate(currentDate.getDate() - 1);
             } else if (i === 0 && !this.state.daily.dailyXP[today]) {
                 // If we haven't done anything today, check yesterday
                 currentDate.setDate(currentDate.getDate() - 1);
                 const yString = currentDate.toISOString().split('T')[0];
                 if(this.state.daily.dailyXP[yString]) {
                     streak++;
                     currentDate.setDate(currentDate.getDate() - 1);
                 } else {
                     break;
                 }
             } else {
                 break;
             }
        }

        this.state.daily.currentStreak = streak;
    },

    trackDailyXP(amount) {
        const today = this.getTodayString();
        if (!this.state.daily.dailyXP[today]) {
            this.state.daily.dailyXP[today] = 0;
        }
        this.state.daily.dailyXP[today] += amount;
        this.state.daily.lastActiveDate = today;
        this.calculateStreak();
        this.save();
    },

    awardXP(difficulty) {
        const xpEarned = this.XP_REWARDS[difficulty] || 0;
        const previousLevel = this.state.user.level;

        this.state.user.totalXP += xpEarned;
        this.state.user.tasksCompleted++;
        this.state.user.level = this.calculateLevel(this.state.user.totalXP);

        this.trackDailyXP(xpEarned);
        this.save();

        // Notifications & UI Updates
        if (this.state.user.level > previousLevel) {
            this.showLevelUpNotification(this.state.user.level);
        } else {
            NotificationService.show(`+${xpEarned} XP earned! 🌟`, 'success');
        }
        
        this.renderStats();
    },

    showLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-warning alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; border: 3px solid gold;';
        notification.innerHTML = `
            <h5><i class="fas fa-trophy"></i> LEVEL UP!</h5>
            <p class="mb-0">Congratulations! You've reached <strong>Level ${level}</strong>! 🎉</p>
            <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },

    renderStats() {
        const statsContainer = document.getElementById('user-stats');
        if (!statsContainer) return;

        const progress = this.getLevelProgress();

        statsContainer.innerHTML = `
            <div class="stats-header mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="mb-0">Level ${this.state.user.level}</h4>
                        <small class="text-muted">${this.state.user.tasksCompleted} tasks completed</small>
                    </div>
                    <div class="text-right">
                        <div class="xp-badge">
                            <i class="fas fa-star text-warning"></i>
                            <strong>${this.state.user.totalXP}</strong> XP
                        </div>
                    </div>
                </div>
            </div>
            <div class="progress" style="height: 25px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                    role="progressbar" 
                    style="width: ${progress.percentage}%"
                    aria-valuenow="${progress.percentage}" 
                    aria-valuemin="0" 
                    aria-valuemax="100">
                    ${Math.round(progress.current)} / ${progress.required} XP
                </div>
            </div>
            <small class="text-muted mt-2 d-block text-center">
                ${progress.required - progress.current} XP to Level ${this.state.user.level + 1}
            </small>
        `;

        // Update Daily Widgets
        const xpTodayElement = document.querySelector('.card-duo-metric--green .display-4');
        if (xpTodayElement) xpTodayElement.textContent = this.state.daily.dailyXP[this.getTodayString()] || 0;

        const streakElement = document.querySelector('.card-duo-metric--yellow .display-4');
        if (streakElement) streakElement.textContent = this.state.daily.currentStreak;

        const xpGoalElement = document.getElementById('xp-goal');
        if (xpGoalElement) xpGoalElement.textContent = `Goal: ${Math.ceil((progress.required) / 3)}XP`;
    },

    init() {
        this.calculateStreak();
        this.renderStats();
    }
};

window.GamificationService = GamificationService;