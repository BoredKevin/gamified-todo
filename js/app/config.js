/**
 * Application Configuration
 * Central location for all game balance parameters
 */
const GameConfig = {
    // XP System
    xp: {
        EASY_TASK: 10,
        MEDIUM_TASK: 25,
        HARD_TASK: 50,
        BONUS_MULTIPLIER: 1.5,  // For completing tasks on time
        STREAK_BONUS: 5         // Extra XP per day of streak
    },
    
    // Leveling System - Uses exponential growth
    levels: {
        BASE_XP: 100,
        GROWTH_RATE: 1.5,       // Each level requires 50% more XP
        MAX_LEVEL: 50,
        
        /**
         * Calculate XP required for a specific level
         * @param {number} level - Target level
         * @returns {number} XP required
         */
        calculateXPForLevel(level) {
            if (level === 1) return 0;
            return Math.floor(this.BASE_XP * Math.pow(this.GROWTH_RATE, level - 2));
        }
    },
    
    // Streak System
    streaks: {
        GRACE_PERIOD_HOURS: 24,
        MIN_TASKS_PER_DAY: 1
    },
    
    // Achievement Definitions
    achievements: [
        { id: 'first_task', name: 'Getting Started', description: 'Complete your first task', xpReward: 20, icon: 'fa-flag' },
        { id: 'task_10', name: 'Task Warrior', description: 'Complete 10 tasks', xpReward: 50, icon: 'fa-shield-alt' },
        { id: 'task_50', name: 'Task Master', description: 'Complete 50 tasks', xpReward: 100, icon: 'fa-crown' },
        { id: 'streak_7', name: 'Week Streak', description: 'Maintain a 7-day streak', xpReward: 75, icon: 'fa-fire' },
        { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', xpReward: 200, icon: 'fa-trophy' },
        { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', xpReward: 50, icon: 'fa-star' },
        { id: 'level_10', name: 'Veteran', description: 'Reach level 10', xpReward: 100, icon: 'fa-medal' }
    ],
    
    // Local Storage Keys
    storage: {
        TASKS: 'gamedo_tasks',
        PLAYER: 'gamedo_player',
        ACHIEVEMENTS: 'gamedo_achievements'
    }
};
