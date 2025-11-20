// ==================== MAIN APP CONTROLLER ====================

document.addEventListener('scripts:loaded', function () {
    console.log('App initializing...');

    // --- State ---
    let currentEditingId = null;

    // --- DOM Elements ---
    const els = {
        addTaskBtn: document.getElementById('add-task-btn'),
        clearCompletedBtn: document.getElementById('clear-completed-btn'),
        saveTaskBtn: document.getElementById('save-task-btn'),
        taskForm: document.getElementById('task-form'),
        taskModal: $('#taskModal'), // Using jQuery for Bootstrap 4 modal
        modalTitle: document.getElementById('modal-title-text'),
        titleInput: document.getElementById('task-title'),
        descInput: document.getElementById('task-description'),
        difficultyBtns: document.querySelectorAll('.difficulty-btn')
    };

    // --- Initialization ---
    GamificationService.init();
    refreshUI();

    // --- Event Handlers ---

    // 1. Task List Actions (Delegation)
    document.body.addEventListener('click', (e) => {
        // Find closest element with data-action (handles clicks on icons inside buttons)
        const trigger = e.target.closest('[data-action]'); 
        if (!trigger) return;

        const action = trigger.dataset.action;
        const id = parseFloat(trigger.dataset.id); // IDs are numeric timestamps

        switch (action) {
            case 'delete':
                handleDelete(id);
                break;
            case 'edit':
                handleEdit(id);
                break;
            case 'expand-desc':
                TaskRenderer.toggleDescriptionUI(id);
                break;
            case 'page-change':
                const type = trigger.dataset.type;
                const page = parseInt(trigger.dataset.page);
                TaskRenderer.setPage(type, page);
                refreshUI();
                break;
        }
    });

    // 2. Checkbox Actions (Delegation - 'change' event)
    document.body.addEventListener('change', (e) => {
        if (e.target.matches('[data-action="toggle"]')) {
            const id = parseFloat(e.target.dataset.id);
            handleToggle(id);
        }
    });

    // 3. Toolbar Buttons
    if (els.addTaskBtn) {
        els.addTaskBtn.addEventListener('click', openCreateModal);
    }

    if (els.clearCompletedBtn) {
        els.clearCompletedBtn.addEventListener('click', handleClearCompleted);
    }

    if (els.saveTaskBtn) {
        els.saveTaskBtn.addEventListener('click', handleSave);
    }

    // 4. Modal Difficulty Selection
    els.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setModalDifficulty(this.dataset.difficulty);
        });
    });

    // 5. Form Submit
    if (els.taskForm) {
        els.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSave();
        });
    }

    // 6. Modal Cleanup
    els.taskModal.on('hidden.bs.modal', () => {
        els.taskForm.reset();
        currentEditingId = null;
        setModalDifficulty('medium');
    });


    // --- Controller Logic ---

    function refreshUI() {
        const tasks = TaskService.getAll();
        TaskRenderer.render(tasks);
    }

    function handleToggle(id) {
        const result = TaskService.toggleComplete(id);
        if (result && result.justCompleted) {
            GamificationService.awardXP(result.task.difficulty);
        }
        refreshUI();
    }

    function handleDelete(id) {
        const task = TaskService.getById(id);
        if (task && confirm(`Delete "${task.title}"?`)) {
            TaskService.delete(id);
            refreshUI();
            NotificationService.show('Task deleted', 'info');
        }
    }

    function handleEdit(id) {
        const task = TaskService.getById(id);
        if (!task) return;

        currentEditingId = id;
        els.titleInput.value = task.title;
        els.descInput.value = task.description;
        els.modalTitle.textContent = 'Edit Task';
        setModalDifficulty(task.difficulty);
        els.taskModal.modal('show');
    }

    function handleSave() {
        const title = els.titleInput.value.trim();
        const description = els.descInput.value.trim();
        const difficulty = document.querySelector('.difficulty-btn.active')?.dataset.difficulty || 'medium';

        if (!title) {
            NotificationService.show('Title is required!', 'warning');
            return;
        }

        const data = { title, description, difficulty };

        if (currentEditingId) {
            TaskService.update(currentEditingId, data);
            NotificationService.show('Task updated!', 'success');
        } else {
            TaskService.create(data);
            NotificationService.show('Task created!', 'success');
        }

        els.taskModal.modal('hide');
        refreshUI();
    }

    function handleClearCompleted() {
        const clearedCount = TaskService.clearCompleted();
        if (clearedCount > 0) {
            refreshUI();
            NotificationService.show(`${clearedCount} tasks cleared`, 'success');
        } else {
            NotificationService.show('No completed tasks', 'info');
        }
    }

    function openCreateModal() {
        currentEditingId = null;
        els.taskForm.reset();
        els.modalTitle.textContent = 'Create New Task';
        setModalDifficulty('medium');
        els.taskModal.modal('show');
    }

    function setModalDifficulty(diff) {
        els.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === diff);
        });
    }
    
    // Debug helpers (Optional)
    window.addSampleTasks = () => {
        ['Task 1', 'Task 2', 'Task 3'].forEach(t => TaskService.create({title: t, difficulty: 'easy'}));
        refreshUI();
    };

    console.log('App initialized!');
});