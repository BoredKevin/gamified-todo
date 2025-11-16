(function () {
  var STORAGE_KEY = 'sbadmin_tasks_v1';
  var tasks = [];

  var form = document.getElementById('task-form');
  var titleInput = document.getElementById('task-title');
  var difficultyInput = document.getElementById('task-difficulty');
  var weightInput = document.getElementById('task-weight');
  var descInput = document.getElementById('task-description');
  var list = document.getElementById('task-list');

  // ---- Storage helpers ----
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse tasks from storage', e);
      return [];
    }
  }

  // ---- Rendering ----
  function difficultyBadgeClass(difficulty) {
    if (difficulty === 'easy') return 'badge-success';
    if (difficulty === 'medium') return 'badge-warning';
    if (difficulty === 'hard') return 'badge-danger';
    return 'badge-secondary';
  }

  function renderTasks() {
    list.innerHTML = '';
    if (!tasks.length) {
      var empty = document.createElement('li');
      empty.className = 'list-group-item text-muted text-center';
      empty.textContent = 'No tasks yet. Add your first one above.';
      list.appendChild(empty);
      return;
    }

    tasks.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'list-group-item';
      li.dataset.id = task.id;

      var completedClass = task.status === 'done' ? 'text-muted' : '';
      var completedCheck = task.status === 'done' ? 'checked' : '';

      li.innerHTML =
        '<div class="d-flex align-items-start">' +
        '<div class="mr-2 mt-1">' +
        '<input type="checkbox" class="task-toggle" ' + completedCheck + '>' +
        '</div>' +
        '<div class="flex-fill">' +
        '<div class="d-flex justify-content-between align-items-center">' +
        '<div class="' + completedClass + ' font-weight-bold">' + escapeHtml(task.title) + '</div>' +
        '<div>' +
        '<span class="badge ' + difficultyBadgeClass(task.difficulty) + ' mr-1">' +
        task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) +
        '</span>' +
        '<span class="badge badge-light">W ' + task.weight + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="small text-muted mt-1 task-description' + (task.description ? '' : ' d-none') + '">' +
        escapeHtml(task.description || '') +
        '</div>' +
        '</div>' +
        '<button class="btn btn-sm btn-light text-muted ml-2 task-remove" title="Delete">' +
        '<i class="fas fa-times"></i>' +
        '</button>' +
        '</div>';

      list.appendChild(li);
    });
  }

  // Basic escaping for safety
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---- Form submit: create task ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var title = titleInput.value.trim();
    if (!title) return;

    var task = {
      id: Date.now().toString(),
      title: title,
      description: descInput.value.trim(),
      difficulty: difficultyInput.value || 'medium',
      weight: parseInt(weightInput.value || '1', 10),
      status: 'open',
      createdAt: Date.now()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();

    form.reset();
    difficultyInput.value = 'medium';
    weightInput.value = 1;
  });

  // ---- List interactions: toggle, delete, expand description ----
  list.addEventListener('click', function (e) {
    var li = e.target.closest('li[data-id]');
    if (!li) return;
    var id = li.dataset.id;
    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) return;

    // Delete
    if (e.target.closest('.task-remove')) {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks();
      renderTasks();
      return;
    }

    // Toggle status
    if (e.target.classList.contains('task-toggle')) {
      task.status = e.target.checked ? 'done' : 'open';
      saveTasks();
      renderTasks();
      return;
    }

    // Click anywhere else on the row: toggle description visibility
    var descEl = li.querySelector('.task-description');
    if (descEl && task.description) {
      descEl.classList.toggle('d-none');
    }
  });

  // ---- Init ----
  tasks = loadTasks();
  renderTasks();
})();