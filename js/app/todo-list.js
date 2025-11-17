/**
 * Task Manager Module
 * Handles task creation, storage, and rendering with modern ES6+ syntax
 */
class TaskManager {
    constructor() {
        this.STORAGE_KEY = 'sbadmin_tasks_v1';
        this.tasks = [];
        this.editingTaskId = null;

        // DOM Elements
        this.elements = {
            modal: $('#taskModal'),
            form: $('#task-form'),
            taskList: $('#task-list'),
            addTaskBtn: $('#add-task-btn'),
            saveTaskBtn: $('#save-task-btn'),
            titleInput: $('#task-title'),
            descriptionInput: $('#task-description'),
            weightInput: $('#task-weight'),
            weightDisplay: $('#weight-display'),
            difficultySelector: $('#difficulty-selector'),
            modalTitle: $('#modal-title-text')
        };

        this.init();
    }

    /**
     * Initialize the task manager
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Open modal for new task
        this.elements.addTaskBtn.on('click', () => this.openModal());

        // Difficulty selector
        this.elements.difficultySelector.on('click', '.difficulty-btn', (e) => {
            this.selectDifficulty($(e.currentTarget));
        });

        // Weight slider
        this.elements.weightInput.on('input', (e) => {
            this.elements.weightDisplay.text(e.target.value);
        });

        // Save task
        this.elements.saveTaskBtn.on('click', () => this.saveTask());

        // Task list interactions
        this.elements.taskList.on('click', '.task-toggle', (e) => {
            e.stopPropagation();
            this.toggleTaskStatus($(e.target).closest('.task-item').data('id'));
        });

        this.elements.taskList.on('click', '.task-remove', (e) => {
            e.stopPropagation();

            // Debugging logs
            console.log('Delete button clicked');
            console.log('e.target:', e.target); // What was actually clicked
            console.log('e.currentTarget:', e.currentTarget); // The .task-remove button

            // FIX: Use e.currentTarget instead of e.target
            const taskItem = $(e.currentTarget).closest('.task-item');
            const taskId = taskItem.data('id');

            console.log('Task item found:', taskItem);
            console.log('Task ID:', taskId);

            this.deleteTask(taskId);
        });

        this.elements.taskList.on('click', '.task-item', (e) => {
            if (!$(e.target).closest('.task-toggle, .task-remove').length) {
                $(e.currentTarget).find('.task-description').slideToggle(200);
            }
        });

        // Reset modal on close
        this.elements.modal.on('hidden.bs.modal', () => this.resetModal());
    }

    /**
     * Open modal for creating/editing task
     */
    openModal(taskId = null) {
        if (taskId) {
            this.editingTaskId = taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.populateForm(task);
                this.elements.modalTitle.text('Edit Task');
            }
        } else {
            this.editingTaskId = null;
            this.elements.modalTitle.text('Create New Task');
        }
        this.elements.modal.modal('show');
    }

    /**
     * Populate form with task data for editing
     */
    populateForm(task) {
        this.elements.titleInput.val(task.title);
        this.elements.descriptionInput.val(task.description);
        this.elements.weightInput.val(task.weight);
        this.elements.weightDisplay.text(task.weight);

        const difficultyBtn = this.elements.difficultySelector
            .find(`[data-difficulty="${task.difficulty}"]`);
        this.selectDifficulty(difficultyBtn);
    }

    /**
     * Reset modal to default state
     */
    resetModal() {
        this.elements.form[0].reset();
        this.elements.weightDisplay.text('1');
        this.selectDifficulty(
            this.elements.difficultySelector.find('[data-difficulty="medium"]')
        );
        this.editingTaskId = null;
    }

    /**
     * Select difficulty level
     */
    selectDifficulty($btn) {
        this.elements.difficultySelector.find('.difficulty-btn').removeClass('active');
        $btn.addClass('active');
    }

    /**
     * Get selected difficulty
     */
    getSelectedDifficulty() {
        return this.elements.difficultySelector.find('.difficulty-btn.active').data('difficulty');
    }

    /**
     * Save or update task
     */
    saveTask() {
        const title = this.elements.titleInput.val().trim();

        if (!title) {
            this.elements.titleInput.focus();
            return;
        }

        const taskData = {
            title,
            description: this.elements.descriptionInput.val().trim(),
            difficulty: this.getSelectedDifficulty(),
            weight: parseInt(this.elements.weightInput.val(), 10),
            status: 'open'
        };

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
        } else {
            this.createTask(taskData);
        }

        this.elements.modal.modal('hide');
    }

    /**
     * Create new task
     */
    createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            ...taskData,
            createdAt: Date.now()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
    }

    /**
     * Update existing task
     */
    updateTask(id, updates) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updates };
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Toggle task completion status
     */
    toggleTaskStatus(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'done' ? 'open' : 'done';
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Delete task
     */
    deleteTask(id) {
        console.log('deleteTask called with ID:', id);
        console.log('Current tasks:', this.tasks);

        if (!id) {
            console.error('ERROR: No task ID provided!');
            return;
        }

        if (confirm('Are you sure you want to delete this task?')) {
            const tasksBefore = this.tasks.length;
            this.tasks = this.tasks.filter(t => t.id !== id);
            const tasksAfter = this.tasks.length;

            console.log(`Tasks before: ${tasksBefore}, after: ${tasksAfter}`);

            this.saveTasks();
            this.render();
            console.log('Task deleted successfully');
        } else {
            console.log('Delete cancelled by user');
        }
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            this.tasks = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
        }
    }

    /**
     * Render all tasks
     */
    render() {
        if (!this.tasks.length) {
            this.renderEmptyState();
            return;
        }

        const html = this.tasks.map(task => this.renderTask(task)).join('');
        this.elements.taskList.html(html);
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        const html = `
            <li class="list-group-item empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p class="mb-0">No tasks yet. Click "New Task" to get started!</p>
            </li>
        `;
        this.elements.taskList.html(html);
    }

    /**
     * Render individual task
     */
    renderTask(task) {
        const difficultyConfig = this.getDifficultyConfig(task.difficulty);
        const isCompleted = task.status === 'done';
        const hasDescription = task.description && task.description.length > 0;

        return `
            <li class="list-group-item task-item ${isCompleted ? 'completed' : ''}" 
                data-id="${task.id}">
                <div class="d-flex align-items-start">
                    <div class="mr-3">
                        <input 
                            type="checkbox" 
                            class="task-toggle" 
                            ${isCompleted ? 'checked' : ''}
                        >
                    </div>
                    <div class="flex-fill">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0 task-title ${isCompleted ? 'text-muted' : ''}">
                                ${this.escapeHtml(task.title)}
                            </h6>
                            <div class="d-flex align-items-center">
                                <span class="badge ${difficultyConfig.badgeClass} mr-2">
                                    <i class="${difficultyConfig.icon} mr-1"></i>
                                    ${difficultyConfig.label}
                                </span>
                                <span class="badge badge-secondary mr-2" title="Priority Weight">
                                    <i class="fas fa-weight-hanging mr-1"></i>${task.weight}
                                </span>
                                <button class="btn btn-sm btn-outline-danger task-remove" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        ${hasDescription ? `
                            <div class="task-description small text-muted" style="display: none;">
                                <i class="fas fa-align-left mr-1"></i>
                                ${this.escapeHtml(task.description)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </li>
        `;
    }

    /**
     * Get difficulty configuration
     */
    getDifficultyConfig(difficulty) {
        const configs = {
            easy: {
                label: 'Easy',
                badgeClass: 'badge-success',
                icon: 'fas fa-smile'
            },
            medium: {
                label: 'Medium',
                badgeClass: 'badge-warning',
                icon: 'fas fa-meh'
            },
            hard: {
                label: 'Hard',
                badgeClass: 'badge-danger',
                icon: 'fas fa-fire'
            }
        };
        return configs[difficulty] || configs.medium;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
$(document).ready(() => {
    window.taskManager = new TaskManager();
});
