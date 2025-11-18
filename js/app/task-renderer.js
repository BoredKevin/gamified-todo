// ==================== RENDER FUNCTIONS ====================

/**
 * Render all tasks to the DOM - separated by completion status
 */
function renderTasks() {
    console.log('Rendering tasks...');
    const activeTaskList = document.getElementById('active-task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    
    if (!activeTaskList || !completedTaskList) {
        console.error('Task list elements not found!');
        return;
    }

    // Clear existing tasks
    activeTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    // Separate tasks into active and completed
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    // Render active tasks
    if (activeTasks.length === 0) {
        activeTaskList.innerHTML = `
            <li class="list-group-item text-center text-muted py-4">
                <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                <p class="mb-0">No active tasks. Click "New Task" to get started!</p>
            </li>
        `;
    } else {
        activeTasks.forEach(task => {
            const taskItem = createTaskElement(task, false);
            activeTaskList.appendChild(taskItem);
        });
    }

    // Render completed tasks
    if (completedTasks.length === 0) {
        completedTaskList.innerHTML = `
            <li class="list-group-item text-center text-muted py-4">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <p class="mb-0">No completed tasks yet!</p>
            </li>
        `;
    } else {
        completedTasks.forEach(task => {
            const taskItem = createTaskElement(task, true);
            completedTaskList.appendChild(taskItem);
        });
    }

    console.log(`Rendered ${activeTasks.length} active and ${completedTasks.length} completed task(s)`);
}

/**
 * Create a task element with expandable description
 */
function createTaskElement(task, isCompleted) {
    const badge = getDifficultyBadge(task.difficulty);
    const hasDescription = task.description && task.description.trim().length > 0;
    const descriptionPreviewLength = 100;
    const needsExpansion = hasDescription && task.description.length > descriptionPreviewLength;
    
    const taskItem = document.createElement('li');
    taskItem.className = 'list-group-item';
    taskItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1" style="min-width: 0;">
                <div class="d-flex align-items-center flex-wrap">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" 
                            id="task-${task.id}" 
                            ${task.completed ? 'checked' : ''}
                            ${task.completed ? 'disabled' : ''}
                            onchange="toggleTask(${task.id})">
                        <label class="custom-control-label" for="task-${task.id}">
                            <strong class="${task.completed ? 'text-muted text-decoration-line-through' : ''}" 
                                    style="word-break: break-word;">
                                ${escapeHtml(task.title)}
                            </strong>
                        </label>
                    </div>
                    <span class="badge badge-${badge.class} ml-2">
                        <i class="fas fa-${badge.icon}"></i> ${badge.text}
                    </span>
                </div>
                ${hasDescription ? `
                    <div class="task-description-container mt-2">
                        <p class="mb-0 text-muted small ${task.completed ? 'text-decoration-line-through' : ''}" 
                           id="desc-${task.id}" 
                           style="word-break: break-word; white-space: pre-wrap;">${needsExpansion 
                                ? escapeHtml(task.description.substring(0, descriptionPreviewLength)) + '...'
                                : escapeHtml(task.description)
                            }</p>
                        ${needsExpansion ? `
                            <button class="btn btn-link btn-sm p-0 mt-1" 
                                    onclick="toggleDescription(${task.id})" 
                                    id="toggle-btn-${task.id}"
                                    style="font-size: 0.85rem; text-decoration: none;">
                                <i class="fas fa-chevron-down"></i> Show more
                            </button>
                            <span id="full-desc-${task.id}" style="display: none;">${escapeHtml(task.description)}</span>
                        ` : ''}
                    </div>
                ` : ''}
                <small class="text-muted d-block mt-1">
                    <i class="far fa-clock"></i> ${isCompleted ? 'Completed' : 'Created'}: ${formatDate(task.updatedAt || task.createdAt)}
                </small>
            </div>
            <div class="btn-group ml-2" style="flex-shrink: 0;">
                ${!isCompleted ? `
                    <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return taskItem;
}


/**
 * Toggle description expansion
 */
function toggleDescription(taskId) {
    const descElement = document.getElementById(`desc-${taskId}`);
    const toggleBtn = document.getElementById(`toggle-btn-${taskId}`);
    const fullDescElement = document.getElementById(`full-desc-${taskId}`);
    
    if (!descElement || !toggleBtn || !fullDescElement) {
        console.error('Description elements not found');
        return;
    }
    
    const task = getTaskById(taskId);
    if (!task) return;
    
    const isExpanded = descElement.dataset.expanded === 'true';
    const descriptionPreviewLength = 100;
    
    if (isExpanded) {
        // Collapse
        descElement.innerHTML = escapeHtml(task.description.substring(0, descriptionPreviewLength)) + '...';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show more';
        descElement.dataset.expanded = 'false';
        console.log(`Description collapsed for task ${taskId}`);
    } else {
        // Expand
        descElement.innerHTML = fullDescElement.innerHTML;
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show less';
        descElement.dataset.expanded = 'true';
        console.log(`Description expanded for task ${taskId}`);
    }
}

// Make function available globally
window.toggleDescription = toggleDescription;




/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}