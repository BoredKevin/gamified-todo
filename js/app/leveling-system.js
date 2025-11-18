/*The MIT License (MIT)

Copyright (c) 2025 BoredKevin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

// ==================== XP & LEVELING SYSTEM ====================

// XP rewards by difficulty
const XP_REWARDS = {
    easy: 10,
    medium: 25,
    hard: 50
};

// Initialize user stats from localStorage
let userStats = JSON.parse(localStorage.getItem('userStats')) || {
    totalXP: 0,
    level: 1,
    tasksCompleted: 0
};

/**
 * Calculate level from total XP
 * Formula: Level = floor(sqrt(totalXP / 100))
 */
function calculateLevel(totalXP) {
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Calculate XP required for next level
 */
function getXPForLevel(level) {
    return 100 * level * level;
}

/**
 * Get XP progress for current level
 */
function getLevelProgress() {
    const currentLevel = userStats.level;
    const currentLevelXP = getXPForLevel(currentLevel - 1);
    const nextLevelXP = getXPForLevel(currentLevel);
    const progressXP = userStats.totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);
    
    return {
        current: progressXP,
        required: requiredXP,
        percentage: percentage
    };
}

/**
 * Award XP when task is completed
 */
function awardXP(difficulty) {
    const xpEarned = XP_REWARDS[difficulty] || 0;
    const previousLevel = userStats.level;
    
    userStats.totalXP += xpEarned;
    userStats.tasksCompleted++;
    userStats.level = calculateLevel(userStats.totalXP);
    
    saveUserStats();
    
    console.log(`Awarded ${xpEarned} XP for ${difficulty} task`);
    
    // Check if leveled up
    if (userStats.level > previousLevel) {
        showLevelUpNotification(userStats.level);
    } else {
        showXPNotification(xpEarned);
    }
    
    updateStatsDisplay();
}

/**
 * Save user stats to localStorage
 */
function saveUserStats() {
    try {
        localStorage.setItem('userStats', JSON.stringify(userStats));
        console.log('User stats saved:', userStats);
    } catch (error) {
        console.error('Error saving user stats:', error);
    }
}

/**
 * Update stats display in UI
 */
function updateStatsDisplay() {
    const statsContainer = document.getElementById('user-stats');
    if (!statsContainer) return;
    
    const progress = getLevelProgress();
    
    statsContainer.innerHTML = `
        <div class="stats-header mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h4 class="mb-0">Level ${userStats.level}</h4>
                    <small class="text-muted">${userStats.tasksCompleted} tasks completed</small>
                </div>
                <div class="text-right">
                    <div class="xp-badge">
                        <i class="fas fa-star text-warning"></i>
                        <strong>${userStats.totalXP}</strong> XP
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
            ${progress.required - progress.current} XP to Level ${userStats.level + 1}
        </small>
    `;
}

/**
 * Show XP earned notification
 */
function showXPNotification(xp) {
    showNotification(`+${xp} XP earned! 🌟`, 'success');
}

/**
 * Show level up notification
 */
function showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-warning alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; border: 3px solid gold;';
    notification.innerHTML = `
        <h5><i class="fas fa-trophy"></i> LEVEL UP!</h5>
        <p class="mb-0">Congratulations! You've reached <strong>Level ${level}</strong>! 🎉</p>
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

document.addEventListener('scripts:loaded', () => {
    updateStatsDisplay();
});