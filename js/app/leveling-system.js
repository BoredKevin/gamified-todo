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
    return Math.floor(Math.sqrt(totalXP / 25)) + 1;
}

/**
 * Calculate XP required for next level
 */
function getXPForLevel(level) {
    return 25 * level * level;
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
    if (!statsContainer) return error('Stats container not found!');
    
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


// ==================== DAILY XP & STREAK TRACKING ====================

/**
 * Get today's date as a string (YYYY-MM-DD format)
 */
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Initialize daily stats from localStorage
 */
let dailyStats = JSON.parse(localStorage.getItem('dailyStats')) || {
    dailyXP: {},  // { "2025-11-19": 25, "2025-11-18": 50 }
    lastActiveDate: null,
    currentStreak: 0
};

/**
 * Track XP gained today
 */
function trackDailyXP(xpAmount) {
    const today = getTodayString();
    
    // Initialize today's XP if not exists
    if (!dailyStats.dailyXP[today]) {
        dailyStats.dailyXP[today] = 0;
    }
    
    // Add XP to today's total
    dailyStats.dailyXP[today] += xpAmount;
    
    // Update last active date
    dailyStats.lastActiveDate = today;
    
    // Calculate streak
    calculateStreak();
    
    saveDailyStats();
    updateDailyStatsDisplay();
    
    console.log(`Daily XP updated: ${dailyStats.dailyXP[today]} XP today`);
}

/**
 * Calculate current streak
 */
function calculateStreak() {
    const dates = Object.keys(dailyStats.dailyXP).sort().reverse();
    
    if (dates.length === 0) {
        dailyStats.currentStreak = 0;
        return;
    }
    
    const today = getTodayString();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check if user was active today or yesterday (grace period)
    const lastActive = new Date(dates[0]);
    const daysDiff = Math.floor((new Date(today) - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
        // Streak broken
        dailyStats.currentStreak = 0;
        return;
    }
    
    // Count consecutive days backwards
    for (let i = 0; i < dates.length; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        if (dailyStats.dailyXP[dateString]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    dailyStats.currentStreak = streak;
}

/**
 * Get XP gained today
 */
function getXPToday() {
    const today = getTodayString();
    return dailyStats.dailyXP[today] || 0;
}

/**
 * Save daily stats to localStorage
 */
function saveDailyStats() {
    try {
        localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
        console.log('Daily stats saved:', dailyStats);
    } catch (error) {
        console.error('Error saving daily stats:', error);
    }
}

/**
 * Update daily stats display in UI
 */
function updateDailyStatsDisplay() {
    // Update XP Gained Today
    const xpTodayElement = document.querySelector('.card-duo-metric--green .display-4');
    if (xpTodayElement) {
        xpTodayElement.textContent = getXPToday();
    }
    
    // Update Day Streak
    const streakElement = document.querySelector('.card-duo-metric--yellow .display-4');
    if (streakElement) {
        streakElement.textContent = dailyStats.currentStreak;
    }
}

// Modify the existing awardXP function to include daily tracking
// Replace the existing awardXP function with this updated version:
function awardXP(difficulty) {
    const xpEarned = XP_REWARDS[difficulty] || 0;
    const previousLevel = userStats.level;
    
    userStats.totalXP += xpEarned;
    userStats.tasksCompleted++;
    userStats.level = calculateLevel(userStats.totalXP);
    
    saveUserStats();
    
    // Track daily XP
    trackDailyXP(xpEarned);
    
    console.log(`Awarded ${xpEarned} XP for ${difficulty} task`);
    
    // Check if leveled up
    if (userStats.level > previousLevel) {
        showLevelUpNotification(userStats.level);
    } else {
        showXPNotification(xpEarned);
    }
    
    updateStatsDisplay();
}

document.addEventListener('scripts:loaded', () => {
    calculateStreak();
    updateDailyStatsDisplay();
    updateStatsDisplay();
    console.log('Daily stats initialized');
});