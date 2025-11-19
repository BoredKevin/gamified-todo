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


// ==================== PAGINATION CONFIGURATION ====================
const TASKS_PER_PAGE = 10;
let activePage = 1;
let completedPage = 1;

/**
 * Calculate total pages for a list
 */
function getTotalPages(itemCount) {
    return Math.ceil(itemCount / TASKS_PER_PAGE);
}

/**
 * Get paginated items
 */
function getPaginatedItems(items, currentPage) {
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    return items.slice(startIndex, endIndex);
}

/**
 * Create pagination controls
 */
function createPaginationControls(totalPages, currentPage, isActiveList) {
    if (totalPages <= 1) return '';
    
    const listType = isActiveList ? 'active' : 'completed';
    
    return `
        <div class="pagination-controls d-flex justify-content-between align-items-center mt-3 p-3 bg-light rounded">
            <button class="btn btn-sm btn-outline-primary ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="changePage('${listType}', ${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            
            <div class="page-info">
                <span class="badge badge-primary">
                    Page ${currentPage} of ${totalPages}
                </span>
                ${createPageNumbers(totalPages, currentPage, listType)}
            </div>
            
            <button class="btn btn-sm btn-outline-primary ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="changePage('${listType}', ${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

/**
 * Create page number buttons
 */
function createPageNumbers(totalPages, currentPage, listType) {
    if (totalPages <= 1) return '';
    
    let pageNumbers = '<div class="btn-group ml-2 mr-2" role="group">';
    
    // Show max 5 page numbers at a time
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // First page button
    if (startPage > 1) {
        pageNumbers += `
            <button class="btn btn-sm btn-outline-secondary" onclick="changePage('${listType}', 1)">
                1
            </button>
        `;
        if (startPage > 2) {
            pageNumbers += '<span class="btn btn-sm disabled">...</span>';
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers += `
            <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}" 
                    onclick="changePage('${listType}', ${i})">
                ${i}
            </button>
        `;
    }
    
    // Last page button
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers += '<span class="btn btn-sm disabled">...</span>';
        }
        pageNumbers += `
            <button class="btn btn-sm btn-outline-secondary" onclick="changePage('${listType}', ${totalPages})">
                ${totalPages}
            </button>
        `;
    }
    
    pageNumbers += '</div>';
    return pageNumbers;
}

/**
 * Change page for active or completed list
 */
function changePage(listType, newPage) {
    console.log(`Changing ${listType} page to ${newPage}`);
    
    if (listType === 'active') {
        const activeTasks = tasks.filter(task => !task.completed);
        const totalPages = getTotalPages(activeTasks.length);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        activePage = newPage;
    } else {
        const completedTasks = tasks.filter(task => task.completed);
        const totalPages = getTotalPages(completedTasks.length);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        completedPage = newPage;
    }
    
    renderTasks();
    
    // Scroll to the list
    const listId = listType === 'active' ? 'active-task-list' : 'completed-task-list';
    document.getElementById(listId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Make function available globally
window.changePage = changePage;

// ==================== UPDATED RENDER FUNCTIONS ====================

/**
 * Render all tasks to the DOM with pagination
 */
function renderTasks() {
    console.log('Rendering tasks with pagination...');
    const activeTaskList = document.getElementById('active-task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    
    if (!activeTaskList || !completedTaskList) {
        console.error('Task list elements not found!');
        return;
    }

    // Get parent containers for pagination controls
    const activeContainer = activeTaskList.parentElement;
    const completedContainer = completedTaskList.parentElement;

    // Clear existing tasks
    activeTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    // Remove old pagination controls
    document.querySelectorAll('.pagination-controls').forEach(el => el.remove());

    // Separate tasks into active and completed
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    // Sort by newest first (based on createdAt)
    activeTasks.sort((a, b) => b.createdAt - a.createdAt);
    completedTasks.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

    // Calculate pagination
    const activeTotalPages = getTotalPages(activeTasks.length);
    const completedTotalPages = getTotalPages(completedTasks.length);

    // Reset to page 1 if current page exceeds total pages
    if (activePage > activeTotalPages && activeTotalPages > 0) {
        activePage = activeTotalPages;
    }
    if (completedPage > completedTotalPages && completedTotalPages > 0) {
        completedPage = completedTotalPages;
    }

    // Get paginated tasks
    const paginatedActiveTasks = getPaginatedItems(activeTasks, activePage);
    const paginatedCompletedTasks = getPaginatedItems(completedTasks, completedPage);

    // Render active tasks
    if (activeTasks.length === 0) {
        activeTaskList.innerHTML = `
            <li class="list-group-item text-center text-muted py-4">
                <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                <p class="mb-0">No active tasks. Click "New Task" to get started!</p>
            </li>
        `;
    } else {
        // Add task count info
        const countInfo = document.createElement('div');
        /*countInfo.className = 'alert alert-info mb-2';
        countInfo.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            Showing ${paginatedActiveTasks.length} of ${activeTasks.length} active task(s)
        `;*/
        activeContainer.insertBefore(countInfo, activeTaskList);

        paginatedActiveTasks.forEach(task => {
            const taskItem = createTaskElement(task, false);
            activeTaskList.appendChild(taskItem);
        });

        // Add pagination controls for active tasks
        const activePaginationHTML = createPaginationControls(activeTotalPages, activePage, true);
        if (activePaginationHTML) {
            const paginationDiv = document.createElement('div');
            paginationDiv.innerHTML = activePaginationHTML;
            activeContainer.appendChild(paginationDiv.firstElementChild);
        }
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
        // Add task count info
        const countInfo = document.createElement('div');
        /*countInfo.className = 'alert alert-success mb-2';
        countInfo.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            Showing ${paginatedCompletedTasks.length} of ${completedTasks.length} completed task(s)
        `;*/
        completedContainer.insertBefore(countInfo, completedTaskList);

        paginatedCompletedTasks.forEach(task => {
            const taskItem = createTaskElement(task, true);
            completedTaskList.appendChild(taskItem);
        });

        // Add pagination controls for completed tasks
        const completedPaginationHTML = createPaginationControls(completedTotalPages, completedPage, false);
        if (completedPaginationHTML) {
            const paginationDiv = document.createElement('div');
            paginationDiv.innerHTML = completedPaginationHTML;
            completedContainer.appendChild(paginationDiv.firstElementChild);
        }
    }

    console.log(`Rendered ${paginatedActiveTasks.length}/${activeTasks.length} active and ${paginatedCompletedTasks.length}/${completedTasks.length} completed task(s)`);
}


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