/**
 * Gamification Engine
 * Handles XP, levels, streaks, and achievements
 */
const GamificationEngine = {
    
    /**
     * Award XP to player and handle level ups
     * @param {number} amount - XP to award
     * @param {Player} player - Player instance
     * @returns {Object} Result with levelUp flag and new level
     */
    awardXP(amount, player) {
        const oldLevel = player.level;
        player.xp += amount;
        
        // Check for level up
        const newLevel = this.calculateLevel(player.xp);
        const leveledUp = newLevel > oldLevel;
        
        if (leveledUp) {
            player.level = newLevel;
            this.onLevelUp(player, newLevel);
        }
        
        player.save();
        
        return {
            leveledUp,
            oldLevel,
            newLevel,
            totalXP: player.xp
        };
    },
    
    /**
     * Calculate current level based on total XP
     * @param {number} totalXP - Player's total XP
     * @returns {number} Current level
     */
    calculateLevel(totalXP) {
        let level = 1;
        let xpRequired = 0;
        
        while (level < GameConfig.levels.MAX_LEVEL) {
            const nextLevelXP = GameConfig.levels.calculateXPForLevel(level + 1);
            if (totalXP < xpRequired + nextLevelXP) {
                break;
            }
            xpRequired += nextLevelXP;
            level++;
        }
        
        return level;
    },
    
    /**
     * Get XP progress for current level
     * @param {Player} player - Player instance
     * @returns {Object} Progress data
     */
    getLevelProgress(player) {
        const currentLevelXP = GameConfig.levels.calculateXPForLevel(player.level);
        const nextLevelXP = GameConfig.levels.calculateXPForLevel(player.level + 1);
        
        // Calculate total XP at start of current level
        let xpAtLevelStart = 0;
        for (let i = 1; i < player.level; i++) {
            xpAtLevelStart += GameConfig.levels.calculateXPForLevel(i + 1);
        }
        
        const xpIntoCurrentLevel = player.xp - xpAtLevelStart;
        const percentage = (xpIntoCurrentLevel / nextLevelXP) * 100;
        
        return {
            current: xpIntoCurrentLevel,
            required: nextLevelXP,
            percentage: Math.min(percentage, 100)
        };
    },
    
    /**
     * Handle level up event
     * @param {Player} player - Player instance
     * @param {number} newLevel - New level achieved
     */
    onLevelUp(player, newLevel) {
        // Check for level-based achievements
        this.checkAchievements(player);
        
        // Show celebration
        UIController.showLevelUpModal(newLevel);
    },
    
    /**
     * Update streak when task is completed
     * @param {Player} player - Player instance
     */
    updateStreak(player) {
        const today = new Date().toDateString();
        const lastActive = player.lastActiveDate ? new Date(player.lastActiveDate).toDateString() : null;
        
        if (lastActive !== today) {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            
            if (lastActive === yesterday) {
                // Continue streak
                player.streak++;
            } else if (lastActive === null || lastActive < yesterday) {
                // Reset streak (grace period can be added here)
                player.streak = 1;
            }
            
            player.lastActiveDate = new Date().toISOString();
            player.tasksCompletedToday = 1;
        } else {
            player.tasksCompletedToday++;
        }
        
        this.checkAchievements(player);
        player.save();
    },
    
    /**
     * Check and unlock achievements
     * @param {Player} player - Player instance
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements(player) {
        const newAchievements = [];
        
        GameConfig.achievements.forEach(achievementConfig => {
            // Skip if already unlocked
            if (player.unlockedAchievements.includes(achievementConfig.id)) {
                return;
            }
            
            let unlocked = false;
            
            // Check achievement conditions
            if (achievementConfig.id === 'first_task' && player.totalTasksCompleted >= 1) {
                unlocked = true;
            } else if (achievementConfig.id === 'task_10' && player.totalTasksCompleted >= 10) {
                unlocked = true;
            } else if (achievementConfig.id === 'task_50' && player.totalTasksCompleted >= 50) {
                unlocked = true;
            } else if (achievementConfig.id === 'streak_7' && player.streak >= 7) {
                unlocked = true;
            } else if (achievementConfig.id === 'streak_30' && player.streak >= 30) {
                unlocked = true;
            } else if (achievementConfig.id === 'level_5' && player.level >= 5) {
                unlocked = true;
            } else if (achievementConfig.id === 'level_10' && player.level >= 10) {
                unlocked = true;
            }
            
            if (unlocked) {
                player.unlockedAchievements.push(achievementConfig.id);
                newAchievements.push(achievementConfig);
                
                // Award achievement XP
                this.awardXP(achievementConfig.xpReward, player);
            }
        });
        
        if (newAchievements.length > 0) {
            UIController.showAchievementUnlock(newAchievements);
        }
        
        return newAchievements;
    }
};
