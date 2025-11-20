// ==================== TASK SERVICE ====================

const TaskService = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],

    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    getAll() {
        return this.tasks;
    },

    getById(id) {
        return this.tasks.find(task => task.id === id);
    },

    create(taskData) {
        const newTask = {
            id: Utils.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            difficulty: taskData.difficulty || 'medium',
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.tasks.push(newTask);
        this.save();
        return newTask;
    },

    update(id, updatedData) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;

        this.tasks[index] = {
            ...this.tasks[index],
            title: updatedData.title,
            description: updatedData.description || '',
            difficulty: updatedData.difficulty,
            updatedAt: Date.now()
        };
        this.save();
        return this.tasks[index];
    },

    delete(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.save();
    },

    toggleComplete(id) {
        const task = this.getById(id);
        if (!task) return null;

        const wasCompleted = task.completed;
        task.completed = !task.completed;
        task.updatedAt = Date.now();
        this.save();

        return { task, justCompleted: !wasCompleted && task.completed };
    },

    clearCompleted() {
        const initialCount = this.tasks.length;
        this.tasks = this.tasks.filter(task => !task.completed);
        this.save();
        return initialCount - this.tasks.length; // Returns count cleared
    },

    clearAll() {
        this.tasks = [];
        this.save();
    }
};

window.TaskService = TaskService;