/**
 * UI Controller
 * Handles all DOM manipulation and user interactions
 */
const UIController = {

    /**
     * Initialize UI
     */
    init() {
        this.bindEvents();
        this.updatePlayerStats();
        this.renderTasks();
        this.renderAchievements();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskModal();
        });

        // Sidebar toggle for mobile
        document.getElementById('sidebarToggleTop').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('toggled');
        });
    },

    /**
     * Update player statistics display
     */
    updatePlayerStats() {
        const player = TaskManager.player;
        const progress = GamificationEngine.getLevelProgress(player);

        // Update level display
        document.getElementById('levelDisplay').textContent = player.level;
        document.getElementById('userLevel').textContent = `Level ${player.level}`;

        // Update progress bar
        document.getElementById('levelProgress').style.width = `${progress.percentage}%`;
        document.getElementById('xpToNext').textContent =
            `${progress.current}/${progress.required} XP to next level`;

        // Update XP
        document.getElementById('totalXP').textContent = player.xp;
        document.getElementById('xpCount').textContent = player.xp;

        // Update streak
        document.getElementById('streakDisplay').textContent = `${player.streak} Days`;
        document.getElementById('streakCount').textContent = player.streak;

        // Update today's count
        document.getElementById('todayCount').textContent = player.tasksCompletedToday;
    },

    /**
     * Render task list
     */
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const tasks = TaskManager.getActiveTasks();

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No active tasks. Add one to get started!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = tasks.map(task => `
            <div class="task-item mb-3 p-3 border rounded" data-task-id="${task.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="form-check flex-grow-1">
                        <input class="form-check-input task-checkbox" type="checkbox" 
                               id="task-${task.id}" data-task-id="${task.id}">
                        <label class="form-check-label" for="task-${task.id}">
                            <strong>${task.title}</strong>
                            <span class="badge badge-${this.getDifficultyColor(task.difficulty)} ml-2">
                                ${task.difficulty.toUpperCase()} - ${task.getXPReward()} XP
                            </span>
                        </label>
                    </div>
                    <button class="btn btn-sm btn-danger delete-task" data-task-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${task.dueDate ? `<small class="text-muted">Due: ${new Date(task.dueDate).toLocaleDateString()}</small>` : ''}
            </div>
        `).join('');

        // Bind task events
        taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                TaskManager.completeTask(e.target.dataset.taskId);
            });
        });

        taskList.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                TaskManager.deleteTask(e.target.closest('button').dataset.taskId);
            });
        });
    },

    /**
     * Get Bootstrap color class for difficulty
     * @param {string} difficulty - Task difficulty
     * @returns {string} Color class
     */
    getDifficultyColor(difficulty) {
        return {
            easy: 'success',
            medium: 'warning',
            hard: 'danger'
        }[difficulty] || 'secondary';
    },

    /**
     * Show XP gain animation
     * @param {number} amount - XP amount
     * @param {string} taskTitle - Task title
     */
    showXPGain(amount, taskTitle) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed';
        toast.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 250px;';
        toast.innerHTML = `
            <strong><i class="fas fa-star text-warning"></i> +${amount} XP</strong><br>
            <small>Completed: ${taskTitle}</small>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    /**
     * Show level up modal
     * @param {number} newLevel - New level
     */
    showLevelUpModal(newLevel) {
        alert(`🎉 Level Up! You've reached Level ${newLevel}!`);
        // In production, use a proper modal component
    },

    /**
     * Show achievement unlock notification
     * @param {Array} achievements - Unlocked achievements
     */
    showAchievementUnlock(achievements) {
        achievements.forEach(achievement => {
            const notification = document.createElement('div');
            notification.className = 'alert alert-warning position-fixed';
            notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
            notification.innerHTML = `
                <strong><i class="fas ${achievement.icon}"></i> Achievement Unlocked!</strong><br>
                ${achievement.name}<br>
                <small>+${achievement.xpReward} XP</small>
            `;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 4000);
        });
    },

    /**
     * Show add task modal
     */
    showAddTaskModal() {
        AppModal.open({
            title: 'Add New Task',
            size: 'md',
            submitLabel: 'Add Task',
            cancelLabel: 'Cancel',
            body: `
            <div class="form-group">
                <label for="taskTitleInput">Title</label>
                <input type="text" class="form-control" id="taskTitleInput" 
                       placeholder="e.g. Study 30 minutes" required>
            </div>
            <div class="form-group">
                <label for="taskDifficultyInput">Difficulty</label>
                <select class="form-control" id="taskDifficultyInput">
                    <option value="easy">Easy (+${GameConfig.xp.EASY_TASK} XP)</option>
                    <option value="medium" selected>Medium (+${GameConfig.xp.MEDIUM_TASK} XP)</option>
                    <option value="hard">Hard (+${GameConfig.xp.HARD_TASK} XP)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="taskDueInput">Due date (optional)</label>
                <input type="date" class="form-control" id="taskDueInput">
            </div>
        `,
            onSubmit: () => {
                const titleInput = document.getElementById('taskTitleInput');
                const difficultyInput = document.getElementById('taskDifficultyInput');
                const dueInput = document.getElementById('taskDueInput');

                const title = titleInput.value.trim();
                if (!title) {
                    titleInput.classList.add('is-invalid');
                    return false; // keep modal open
                }

                const difficulty = difficultyInput.value || 'medium';
                const dueDate = dueInput.value ? new Date(dueInput.value) : null;

                TaskManager.addTask(title, difficulty, dueDate);
                UIController.updatePlayerStats();

                return true; // close modal
            }
        });
    }
    ,

    /**
     * Render achievements list
     */
    renderAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        const player = TaskManager.player;
        const unlockedIds = player.unlockedAchievements;

        achievementsList.innerHTML = GameConfig.achievements.slice(0, 5).map(ach => {
            const unlocked = unlockedIds.includes(ach.id);
            return `
                <div class="achievement-item mb-2 p-2 ${unlocked ? 'border border-warning' : 'opacity-50'}">
                    <i class="fas ${ach.icon} ${unlocked ? 'text-warning' : 'text-muted'}"></i>
                    <strong>${ach.name}</strong>
                    <p class="small mb-0">${ach.description}</p>
                </div>
            `;
        }).join('');
    }
};
