// ==================== TASK RENDERER ====================

const TaskRenderer = {
    pagination: {
        activePage: 1,
        completedPage: 1,
        itemsPerPage: 5
    },

    /**
     * Main render function
     */
    render(tasks) {
        const activeList = document.getElementById('active-task-list');
        const completedList = document.getElementById('completed-task-list');
        if (!activeList || !completedList) return;

        // Filter and Sort
        const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => b.createdAt - a.createdAt);
        const completedTasks = tasks.filter(t => t.completed).sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

        this._renderList(activeList, activeTasks, 'active');
        this._renderList(completedList, completedTasks, 'completed');
    },

    _renderList(container, tasks, type) {
        container.innerHTML = '';
        
        // Handle Empty State
        if (tasks.length === 0) {
            container.innerHTML = `
                <li class="list-group-item text-center text-muted py-4">
                    <i class="fas ${type === 'active' ? 'fa-clipboard-list' : 'fa-check-circle'} fa-2x mb-2"></i>
                    <p class="mb-0">${type === 'active' ? 'No active tasks. Click "New Task" to get started!' : 'No completed tasks yet!'}</p>
                </li>
            `;
            // Remove old pagination if exists
            this._removePaginationControls(container);
            return;
        }

        // Pagination Logic
        const totalPages = Math.ceil(tasks.length / this.pagination.itemsPerPage);
        const currentPageVar = type === 'active' ? 'activePage' : 'completedPage';
        
        // Bounds check
        if (this.pagination[currentPageVar] > totalPages) this.pagination[currentPageVar] = totalPages;
        if (this.pagination[currentPageVar] < 1) this.pagination[currentPageVar] = 1;

        const currentPage = this.pagination[currentPageVar];
        const start = (currentPage - 1) * this.pagination.itemsPerPage;
        const paginatedItems = tasks.slice(start, start + this.pagination.itemsPerPage);

        // Render Items
        paginatedItems.forEach(task => {
            container.appendChild(this._createTaskElement(task));
        });

        // Render Pagination Controls
        this._renderPaginationControls(container, totalPages, currentPage, type);
    },

    _createTaskElement(task) {
        const badge = Utils.getDifficultyBadge(task.difficulty);
        const hasDesc = task.description && task.description.trim().length > 0;
        const needsExpansion = hasDesc && task.description.length > 100;
        
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.id = task.id; // Useful for DOM referencing

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1" style="min-width: 0;">
                    <div class="d-flex align-items-center flex-wrap">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" 
                                id="task-${task.id}" 
                                ${task.completed ? 'checked disabled' : ''}
                                data-action="toggle" data-id="${task.id}">
                            <label class="custom-control-label" for="task-${task.id}">
                                <strong class="${task.completed ? 'text-muted text-decoration-line-through' : ''}" 
                                        style="word-break: break-word;">
                                    ${Utils.escapeHtml(task.title)}
                                </strong>
                            </label>
                        </div>
                        <span class="badge badge-${badge.class} ml-2">
                            <i class="fas fa-${badge.icon}"></i> ${badge.text}
                        </span>
                    </div>
                    ${hasDesc ? `
                        <div class="task-description-container mt-2">
                            <p class="mb-0 text-muted small ${task.completed ? 'text-decoration-line-through' : ''}" 
                               id="desc-${task.id}" 
                               style="word-break: break-word; white-space: pre-wrap;">${needsExpansion 
                                    ? Utils.escapeHtml(task.description.substring(0, 100)) + '...'
                                    : Utils.escapeHtml(task.description)
                                }</p>
                            ${needsExpansion ? `
                                <button class="btn btn-link btn-sm p-0 mt-1" 
                                        data-action="expand-desc" data-id="${task.id}"
                                        style="font-size: 0.85rem; text-decoration: none;">
                                    <i class="fas fa-chevron-down"></i> Show more
                                </button>
                                <span id="full-desc-${task.id}" style="display: none;">${Utils.escapeHtml(task.description)}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                    <small class="text-muted d-block mt-1">
                        <i class="far fa-clock"></i> ${task.completed ? 'Completed' : 'Created'}: ${Utils.formatDate(task.updatedAt || task.createdAt)}
                    </small>
                </div>
                <div class="btn-group ml-2" style="flex-shrink: 0;">
                    ${!task.completed ? `
                        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${task.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${task.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        return li;
    },

    _removePaginationControls(container) {
        // Remove from parent div (container-fluid usually)
        const parent = container.parentElement;
        if (parent) {
            const oldPag = parent.querySelector(`.pagination-controls[data-for="${container.id}"]`);
            if (oldPag) oldPag.remove();
        }
    },

    _renderPaginationControls(container, totalPages, currentPage, type) {
        this._removePaginationControls(container);
        if (totalPages <= 1) return;

        const controlsHtml = `
            <div class="pagination-controls d-flex justify-content-between align-items-center mt-3 p-3 bg-light rounded" data-for="${container.id}">
                <button class="btn btn-sm btn-outline-primary ${currentPage === 1 ? 'disabled' : ''}" 
                        data-action="page-change" data-type="${type}" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="page-info">
                    <span class="badge badge-primary">${currentPage} / ${totalPages}</span>
                </div>
                
                <button class="btn btn-sm btn-outline-primary ${currentPage === totalPages ? 'disabled' : ''}" 
                        data-action="page-change" data-type="${type}" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = controlsHtml;
        container.parentElement.appendChild(div.firstElementChild);
    },

    // Helper to change page state
    setPage(type, page) {
        if (type === 'active') this.pagination.activePage = parseInt(page);
        if (type === 'completed') this.pagination.completedPage = parseInt(page);
    },

    toggleDescriptionUI(taskId) {
        const descEl = document.getElementById(`desc-${taskId}`);
        const btn = document.querySelector(`button[data-action="expand-desc"][data-id="${taskId}"]`);
        const fullEl = document.getElementById(`full-desc-${taskId}`);
        
        if (!descEl || !btn || !fullEl) return;
        
        const isExpanded = descEl.dataset.expanded === 'true';
        
        if (isExpanded) {
            // Re-truncate based on original logic logic assumes 100 chars
            descEl.textContent = fullEl.textContent.substring(0, 100) + '...'; 
            btn.innerHTML = '<i class="fas fa-chevron-down"></i> Show more';
            descEl.dataset.expanded = 'false';
        } else {
            descEl.textContent = fullEl.textContent;
            btn.innerHTML = '<i class="fas fa-chevron-up"></i> Show less';
            descEl.dataset.expanded = 'true';
        }
    }
};

window.TaskRenderer = TaskRenderer;