/**
 * Data Models
 * Define the structure of core entities
 */

class Player {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        this.lastActiveDate = null;
        this.tasksCompletedToday = 0;
        this.totalTasksCompleted = 0;
        this.unlockedAchievements = [];
        this.createdAt = new Date().toISOString();
    }
    
    /**
     * Save player data to localStorage
     */
    save() {
        localStorage.setItem(GameConfig.storage.PLAYER, JSON.stringify(this));
    }
    
    /**
     * Load player data from localStorage
     * @returns {Player} Player instance
     */
    static load() {
        const data = localStorage.getItem(GameConfig.storage.PLAYER);
        if (data) {
            return Object.assign(new Player(), JSON.parse(data));
        }
        return new Player();
    }
}

class Task {
    constructor(title, difficulty = 'medium', dueDate = null) {
        this.id = Date.now() + Math.random(); // Simple unique ID
        this.title = title;
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.completed = false;
        this.completedAt = null;
        this.createdAt = new Date().toISOString();
        this.dueDate = dueDate;
        this.tags = [];
    }
    
    /**
     * Calculate XP reward for this task
     * @returns {number} XP amount
     */
    getXPReward() {
        const baseXP = {
            easy: GameConfig.xp.EASY_TASK,
            medium: GameConfig.xp.MEDIUM_TASK,
            hard: GameConfig.xp.HARD_TASK
        }[this.difficulty];
        
        // Bonus for completing before due date
        if (this.dueDate && new Date() < new Date(this.dueDate)) {
            return Math.floor(baseXP * GameConfig.xp.BONUS_MULTIPLIER);
        }
        
        return baseXP;
    }
}

class Achievement {
    constructor(id, name, description, xpReward, icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.xpReward = xpReward;
        this.icon = icon;
        this.unlockedAt = null;
    }
}
