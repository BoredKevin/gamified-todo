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

// ==================== TASK MANAGER APP ====================
// Main application logic with CRUD operations and debugging

// Initialize tasks array from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTaskId = null; // Track task being edited

console.log('Task Manager Initialized');
console.log('Loaded tasks from localStorage:', tasks);

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique ID for tasks
 */
function generateId() {
    const id = Date.now() + Math.random();
    console.log('Generated new task ID:', id);
    return id;
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Tasks saved to localStorage:', tasks);
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

/**
 * Get difficulty badge color
 */
function getDifficultyBadge(difficulty) {
    const badges = {
        easy: { class: 'success', icon: 'smile', text: 'Easy' },
        medium: { class: 'warning', icon: 'meh', text: 'Medium' },
        hard: { class: 'danger', icon: 'fire', text: 'Hard' }
    };
    return badges[difficulty] || badges.medium;
}



// ==================== CRUD OPERATIONS ====================

/**
 * CREATE: Add new task
 */
function createTask(taskData) {
    console.log('Creating new task:', taskData);
    
    const newTask = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description || '',
        difficulty: taskData.difficulty || 'medium',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    console.log('Task created successfully:', newTask);
    showNotification('Task created successfully!', 'success');
}

/**
 * READ: Get task by ID
 */
function getTaskById(id) {
    const task = tasks.find(task => task.id === id);
    console.log(`Getting task with ID ${id}:`, task);
    return task;
}

/**
 * UPDATE: Edit existing task
 */
function updateTask(id, updatedData) {
    console.log(`Updating task ${id} with data:`, updatedData);
    
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
        console.error(`Task with ID ${id} not found!`);
        return;
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: updatedData.title,
        description: updatedData.description || '',
        difficulty: updatedData.difficulty,
        updatedAt: Date.now()
    };

    saveTasks();
    renderTasks();
    
    console.log('Task updated successfully:', tasks[taskIndex]);
    showNotification('Task updated successfully!', 'success');
}

/**
 * DELETE: Remove task
 */
function deleteTask(id) {
    console.log(`Attempting to delete task with ID: ${id}`);
    
    const task = getTaskById(id);
    
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        return;
    }

    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        
        console.log(`Task deleted successfully. Remaining tasks: ${tasks.length}`);
        showNotification('Task deleted successfully!', 'info');
    } else {
        console.log('Task deletion cancelled by user');
    }
}

/**
 * TOGGLE: Mark task as complete/incomplete
 */
function toggleTask(id) {
    console.log(`Toggling task completion for ID: ${id}`);
    
    const task = getTaskById(id);
    
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        return;
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.updatedAt = Date.now();
    
    // Award XP when completing a task
    if (!wasCompleted && task.completed) {
        awardXP(task.difficulty);
    }
    
    saveTasks();
    renderTasks();
    
    console.log(`Task ${task.completed ? 'completed' : 'uncompleted'}:`, task);
}

/**
 * EDIT: Open modal with task data for editing
 */
function editTask(id) {
    console.log(`Opening edit modal for task ID: ${id}`);
    
    const task = getTaskById(id);
    
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        return;
    }

    currentTaskId = id;
    
    // Populate modal with task data
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('modal-title-text').textContent = 'Edit Task';
    
    // Set difficulty
    setDifficulty(task.difficulty);
    
    // Show modal
    $('#taskModal').modal('show');
    
    console.log('Modal populated with task data:', task);
}

// ==================== MODAL FUNCTIONS ====================

/**
 * Open modal for creating new task
 */
function openNewTaskModal() {
    console.log('Opening new task modal');
    
    currentTaskId = null;
    
    // Reset form
    document.getElementById('task-form').reset();
    document.getElementById('modal-title-text').textContent = 'Create New Task';
    
    // Set default difficulty
    setDifficulty('medium');
    
    // Show modal
    $('#taskModal').modal('show');
}

/**
 * Set difficulty in the modal
 */
function setDifficulty(difficulty) {
    console.log(`Setting difficulty to: ${difficulty}`);
    
    const buttons = document.querySelectorAll('.difficulty-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });
}

/**
 * Get selected difficulty from modal
 */
function getSelectedDifficulty() {
    const activeBtn = document.querySelector('.difficulty-btn.active');
    const difficulty = activeBtn ? activeBtn.dataset.difficulty : 'medium';
    console.log(`Selected difficulty: ${difficulty}`);
    return difficulty;
}

/**
 * Save task from modal (create or update)
 */
function saveTask() {
    console.log('Attempting to save task...');
    
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const difficulty = getSelectedDifficulty();

    // Validation
    if (!title) {
        console.warn('Validation failed: Title is required');
        showNotification('Please enter a task title!', 'warning');
        document.getElementById('task-title').focus();
        return;
    }

    const taskData = {
        title,
        description,
        difficulty
    };

    if (currentTaskId) {
        // Update existing task
        updateTask(currentTaskId, taskData);
    } else {
        // Create new task
        createTask(taskData);
    }

    // Close modal
    $('#taskModal').modal('hide');
    
    // Reset form
    document.getElementById('task-form').reset();
    currentTaskId = null;
}

// ==================== NOTIFICATION SYSTEM ====================

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    console.log(`Notification [${type}]: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== EVENT LISTENERS ====================

/**
 * Initialize event listeners when DOM is ready
 */
document.addEventListener('scripts:loaded', function() {
    console.log('scripts:loaded - Initializing event listeners...');

    // New Task Button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', openNewTaskModal);
        console.log('New Task button listener attached');
    }

    // Clear Completed Button
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        console.log('Clear Completed button listener attached');
    }

    // Save Task Button
    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', saveTask);
        console.log('Save Task button listener attached');
    }

    // Difficulty Buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const difficulty = this.dataset.difficulty;
            setDifficulty(difficulty);
        });
    });
    console.log(`${difficultyButtons.length} difficulty button listeners attached`);

    // Form submission on Enter key
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted via Enter key');
            saveTask();
        });
    }

    // Reset modal when closed
    $('#taskModal').on('hidden.bs.modal', function() {
        console.log('Modal closed - Resetting form');
        document.getElementById('task-form').reset();
        currentTaskId = null;
        setDifficulty('medium');
    });

    // Initial render
    renderTasks();
    console.log('Task Manager fully initialized and ready!');
});

// ==================== DEBUGGING FUNCTIONS ====================

/**
 * Debug function: Clear all tasks
 */
function clearAllTasks() {
    console.log('DEBUG: Clearing all tasks...');
    if (confirm('WARNING - DEBUG MODE: This will delete all tasks. Continue?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        console.log('All tasks cleared');
    }
}

/**
 * Debug function: Add sample tasks
 */
function addSampleTasks() {
    console.log('DEBUG: Adding sample tasks...');
    
    const sampleTasks = [
        {
            title: 'Complete project documentation',
            description: 'Write comprehensive documentation for the new feature',
            difficulty: 'medium'
        },
        {
            title: 'Fix critical bug',
            description: 'Resolve the login authentication issue',
            difficulty: 'hard'
        },
        {
            title: 'Team meeting',
            description: 'Weekly sync with the development team',
            difficulty: 'easy'
        }
    ];

    sampleTasks.forEach(task => createTask(task));
    console.log('Sample tasks added');
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
    console.log('Attempting to clear completed tasks...');
    
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear!', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        
        console.log(`Cleared ${completedCount} completed task(s)`);
        showNotification(`${completedCount} completed task(s) cleared!`, 'success');
    } else {
        console.log('Clear completed tasks cancelled by user');
    }
}

// Make function available globally
window.clearCompletedTasks = clearCompletedTasks;


// Make functions available globally for inline event handlers
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.clearAllTasks = clearAllTasks;
window.addSampleTasks = addSampleTasks;

console.log('Global functions registered');
