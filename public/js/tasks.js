/* THEME SWTCHER */
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#theme-toggle i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
};

const initTheme = () => {
  const saved = localStorage.getItem('taskfree-theme') || 'dark';
  applyTheme(saved);
};

const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const current = localStorage.getItem('taskfree-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('taskfree-theme', next);
    applyTheme(next);
  });
}

initTheme();

// All tasks fetched from server stored here
let allTasks = [];
let currentFilter = 'all';

/* AUTH GUIDE */
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();

    if (!data.loggedIn) {
      window.location.href = '/index.html';
      return;
    }

    document.getElementById('username-display').textContent = data.user.username;
    loadTasks();

  } catch (error) {
    window.location.href = '/index.html';
  }
};

/* DATE DISPLAY */
const showDate = () => {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', options);
};

/* LOAD TASK */
const loadTasks = async () => {
  try {
    const response = await fetch('/api/tasks');
    const data = await response.json();

    allTasks = data.tasks;
    renderTasks();
    updateStats();

  } catch (error) {
    document.getElementById('task-container').innerHTML =
      '<div class="empty-state"><p>Could not load tasks.</p></div>';
  }
};

/* UPDATE STATE */
const updateStats = () => {
  const total = allTasks.length;
  const done = allTasks.filter(t => t.completed === 1).length;
  const pending = total - done;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-done').textContent = done;
};

/* RENDER TASK */
const renderTasks = () => {
  const container = document.getElementById('task-container');

  // Apply current filter
  let filtered = allTasks;

  if (currentFilter === 'pending') {
    filtered = allTasks.filter(t => t.completed === 0);
  } else if (currentFilter === 'completed') {
    filtered = allTasks.filter(t => t.completed === 1);
  } else if (currentFilter === 'high') {
    filtered = allTasks.filter(t => t.priority === 'high');
  }

  // Empty state
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">\u{1F4CB}</div>
        <p>No tasks here.<br>Add one above to get started.</p>
      </div>
    `;
    return;
  }

  // THIS LOGIC HERE BUILD TASK LIST HTML
  const html = `
    <div class="task-list">
      ${filtered.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">

          <div class="task-check ${task.completed ? 'checked' : ''}"
               onclick="toggleComplete(${task.id}, ${task.completed})">
          </div>

          <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            ${task.description
              ? `<div class="task-description">${escapeHtml(task.description)}</div>`
              : ''}
            <div class="task-meta">
              <span class="priority-tag ${task.priority}">${task.priority}</span>
              <span class="task-date">${formatDate(task.created_at)}</span>
            </div>
          </div>

          <div class="task-actions">
            <button class="task-action-btn delete"
                    onclick="deleteTask(${task.id})">Delete</button>
          </div>

        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
};

/* ADD TASK */
document.getElementById('add-task-btn').addEventListener('click', async () => {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const priority = document.getElementById('task-priority').value;
  const btn = document.getElementById('add-task-btn');

  if (!title) {
    const errorEl = document.getElementById('task-error');
    errorEl.textContent = 'Task title cannot be empty.';
    errorEl.style.display = 'block';
    document.getElementById('task-title').focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority })
    });

    const data = await response.json();

    if (response.ok) {
      allTasks.unshift(data.task);
      renderTasks();
      updateStats();

      document.getElementById('task-title').value = '';
      document.getElementById('task-description').value = '';
      document.getElementById('task-priority').value = 'medium';
    }

  } catch (error) {
    console.error('Add task error:', error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Task';
  }
});

/* TOGGLE COMPLETE */
const toggleComplete = async (taskId, currentCompleted) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: currentCompleted === 1 ? false : true })
    });

    const data = await response.json();

    if (response.ok) {
      const index = allTasks.findIndex(t => t.id === taskId);
      if (index !== -1) allTasks[index] = data.task;
      renderTasks();
      updateStats();
    }

  } catch (error) {
    console.error('Toggle error:', error);
  }
};

/* DELETE TASKS */
const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      allTasks = allTasks.filter(t => t.id !== taskId);
      renderTasks();
      updateStats();
    }

  } catch (error) {
    console.error('Delete error:', error);
  }
};

/* FILTERS */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* LOGOUT */
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

/* HELPER */
const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* INITIALIZATION */
showDate();
checkAuth();