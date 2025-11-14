/**
 * Task Management System
 */
const TaskManager = {
    tasks: [],
    player: null,
    
    /**
     * Initialize task manager
     */
    init() {
        this.loadTasks();
        this.player = Player.load();
    },
    
    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        const data = localStorage.getItem(GameConfig.storage.TASKS);
        if (data) {
            this.tasks = JSON.parse(data).map(taskData => 
                Object.assign(new Task(), taskData)
            );
        }
    },
    
    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        localStorage.setItem(GameConfig.storage.TASKS, JSON.stringify(this.tasks));
    },
    
    /**
     * Add new task
     * @param {string} title - Task title
     * @param {string} difficulty - Task difficulty
     * @param {Date} dueDate - Due date
     * @returns {Task} Created task
     */
    addTask(title, difficulty, dueDate) {
        const task = new Task(title, difficulty, dueDate);
        this.tasks.push(task);
        this.saveTasks();
        UIController.renderTasks();
        return task;
    },
    
    /**
     * Complete a task
     * @param {string} taskId - Task ID
     */
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        task.completed = true;
        task.completedAt = new Date().toISOString();
        
        // Award XP
        const xpEarned = task.getXPReward();
        const result = GamificationEngine.awardXP(xpEarned, this.player);
        
        // Update stats
        this.player.totalTasksCompleted++;
        GamificationEngine.updateStreak(this.player);
        
        // Show feedback
        UIController.showXPGain(xpEarned, task.title);
        
        if (result.leveledUp) {
            UIController.showLevelUpModal(result.newLevel);
        }
        
        this.saveTasks();
        UIController.renderTasks();
        UIController.updatePlayerStats();
    },
    
    /**
     * Delete a task
     * @param {string} taskId - Task ID
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        UIController.renderTasks();
    },
    
    /**
     * Get active (incomplete) tasks
     * @returns {Array} Active tasks
     */
    getActiveTasks() {
        return this.tasks.filter(t => !t.completed);
    },
    
    /**
     * Get completed tasks
     * @returns {Array} Completed tasks
     */
    getCompletedTasks() {
        return this.tasks.filter(t => t.completed);
    }
};
