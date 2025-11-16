
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('todo-form');
    var input = document.getElementById('todo-input');
    var list = document.getElementById('todo-list');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      var li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center';

      li.innerHTML = ''
        + '<input class="mr-2" type="checkbox">'
        + '<span class="flex-fill">' + text + '</span>'
        + '<button class="btn btn-sm btn-light text-muted ml-2 btn-todo-remove">'
        + '<i class="fas fa-times"></i>'
        + '</button>';

      list.appendChild(li);
      input.value = '';
    });

    // Delegate clicks for remove + toggle completed
    list.addEventListener('click', function (e) {
      if (e.target.closest('.btn-todo-remove')) {
        e.target.closest('li').remove();
      }

      if (e.target.type === 'checkbox') {
        var span = e.target.closest('li').querySelector('span');
        if (e.target.checked) {
          span.classList.add('text-muted');
          span.innerHTML = '<s>' + span.textContent + '</s>';
        } else {
          span.classList.remove('text-muted');
          span.textContent = span.textContent;
        }
      }
    });
  });
