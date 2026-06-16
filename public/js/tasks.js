/* THEME SWTCHER */
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.querySelector("#theme-toggle i");
  if (!icon) return;
  if (theme === "light") {
    icon.className = "fa-solid fa-sun";
  } else {
    icon.className = "fa-solid fa-moon";
  }
};

const initTheme = () => {
  const saved = localStorage.getItem("tasku-theme") || "dark";
  applyTheme(saved);
};

const toggleBtn = document.getElementById("theme-toggle");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const current = localStorage.getItem("tasku-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("tasku-theme", next);
    applyTheme(next);
  });
}

initTheme();

// All tasks fetched from server stored here
let searchQuery = '';
let allTasks = [];
let currentFilter = "all";

/* AUTH GUIDE */
const checkAuth = async () => {
  try {
    const response = await fetch("/api/auth/me");
    const data = await response.json();

    if (!data.loggedIn) {
      window.location.href = "/index.html";
      return;
    }

    document.getElementById("username-display").textContent =
      data.user.username;
    loadTasks();
  } catch (error) {
    window.location.href = "/index.html";
  }
};

/* DATE DISPLAY */
const showDate = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("date-display").textContent = now.toLocaleDateString(
    "en-US",
    options,
  );
};

/* LOAD TASK */
const loadTasks = async () => {
  try {
    const response = await fetch("/api/tasks");
    const data = await response.json();

    allTasks = data.tasks;
    renderTasks();
    updateStats();
  } catch (error) {
    document.getElementById("task-container").innerHTML =
      '<div class="empty-state"><p>Could not load tasks.</p></div>';
  }
};

/* UPDATE STATE */
const updateStats = () => {
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.completed === 1).length;
  const pending = total - done;
  const today = new Date().toISOString().split("T")[0];
  const overdue = allTasks.filter(
    (t) => t.completed === 0 && t.due_date && t.due_date < today,
  ).length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-overdue").textContent = overdue;
};

/* RENDER TASK */
const renderTasks = () => {
  const container = document.getElementById("task-container");

  // Apply current filter
  let filtered = allTasks;

  // Apply search filter first
  if (searchQuery) {
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (currentFilter === "pending") {
    filtered = allTasks.filter((t) => t.completed === 0);
  } else if (currentFilter === "completed") {
    filtered = allTasks.filter((t) => t.completed === 1);
  } else if (currentFilter === "high") {
    filtered = allTasks.filter((t) => t.priority === "high");
  } else if (currentFilter === "overdue") {
    const today = new Date().toISOString().split("T")[0];
    filtered = allTasks.filter(
      (t) => t.completed === 0 && t.due_date && t.due_date < today,
    );
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
      ${filtered
        .map(
          (task) => `
        <div class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">

          <div class="task-check ${task.completed ? "checked" : ""}"
               onclick="toggleComplete(${task.id}, ${task.completed})">
          </div>

          <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            ${
              task.description
                ? `<div class="task-description">${escapeHtml(task.description)}</div>`
                : ""
            }
              <div class="task-meta">
                  <span class="priority-tag ${task.priority}">${task.priority}</span>
                  <span class="task-date">${formatDate(task.created_at)}</span>
                  ${
                    task.due_date
                      ? (() => {
                          const due = formatDueDate(task.due_date);
                          return `<span class="due-date-display ${due.class}">${due.text}</span>`;
                        })()
                      : ""
                  }
              </div>
          </div>

          <div class="task-actions">
            <button class="task-action-btn"
            onclick="editTask(${task.id})">Edit</button>
            <button class="task-action-btn delete"
            onclick="deleteTask(${task.id})">Delete</button>
          </div>

        </div>
      `,
        )
        .join("")}
    </div>
  `;

  container.innerHTML = html;
};

/* ADD TASK */
document.getElementById("add-task-btn").addEventListener("click", async () => {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const priority = document.getElementById("task-priority").value;
  const due_date = document.getElementById("task-due-date").value || null;
  const btn = document.getElementById("add-task-btn");

  if (!title) {
    const errorEl = document.getElementById("task-error");
    errorEl.textContent = "Task title cannot be empty.";
    errorEl.style.display = "block";
    document.getElementById("task-title").focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Adding...";

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, due_date }),
    });

    const data = await response.json();

    if (response.ok) {
      allTasks.unshift(data.task);
      renderTasks();
      updateStats();

      document.getElementById("task-title").value = "";
      document.getElementById("task-description").value = "";
      document.getElementById("task-priority").value = "medium";
      document.getElementById("task-due-date").value = "";
    }
  } catch (error) {
    console.error("Add task error:", error);
  } finally {
    btn.disabled = false;
    btn.textContent = "Add Task";
  }
});

/* TOGGLE COMPLETE */
const toggleComplete = async (taskId, currentCompleted) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: currentCompleted === 1 ? false : true,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const index = allTasks.findIndex((t) => t.id === taskId);
      if (index !== -1) allTasks[index] = data.task;
      renderTasks();
      updateStats();
    }
  } catch (error) {
    console.error("Toggle error:", error);
  }
};

/* DELETE TASKS */
const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      allTasks = allTasks.filter((t) => t.id !== taskId);
      renderTasks();
      updateStats();
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};

/* EDIT TASK */
const editTask = (taskId) => {
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;

  // Find the task item element
  const taskItem = document.querySelector(`[data-id="${taskId}"]`);
  if (!taskItem) return;

  // Replace task content with editable form
  taskItem.innerHTML = `
    <div class="task-check ${task.completed ? "checked" : ""}"
         onclick="toggleComplete(${task.id}, ${task.completed})">
    </div>

    <div class="task-edit-form">
      <input type="text" class="edit-title" value="${escapeHtml(task.title)}"
             placeholder="Task title">
      <textarea class="edit-description"
                placeholder="Description (optional)">${task.description ? escapeHtml(task.description) : ""}</textarea>
      <div class="edit-row">
        <select class="edit-priority">
          <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
          <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
        </select>
        <input type="date" class="edit-due-date"
               value="${task.due_date || ""}">
      </div>
    </div>

    <div class="task-actions">
      <button class="task-action-btn save"
              onclick="saveTask(${task.id})">Save</button>
      <button class="task-action-btn cancel"
              onclick="renderTasks()">Cancel</button>
    </div>
  `;
};

/* SAVE EDITED TASK */
const saveTask = async (taskId) => {
  const taskItem = document.querySelector(`[data-id="${taskId}"]`);
  if (!taskItem) return;

  const title = taskItem.querySelector(".edit-title").value.trim();
  const description = taskItem.querySelector(".edit-description").value.trim();
  const priority = taskItem.querySelector(".edit-priority").value;
  const due_date = taskItem.querySelector(".edit-due-date").value || null;

  if (!title) {
    taskItem.querySelector(".edit-title").style.borderColor = "var(--accent)";
    taskItem.querySelector(".edit-title").focus();
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, due_date }),
    });

    const data = await response.json();

    if (response.ok) {
      const index = allTasks.findIndex((t) => t.id === taskId);
      if (index !== -1) allTasks[index] = data.task;
      renderTasks();
      updateStats();
    }
  } catch (error) {
    console.error("Save task error:", error);
  }
};

/* Search */
document.getElementById('task-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderTasks();
});

/* FILTERS */
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* LOGOUT */
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
});

/* HELPER */
const escapeHtml = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// New function for due date display
const formatDueDate = (dueDateStr) => {
  if (!dueDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatted = dueDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (diffDays < 0) return { text: `Overdue · ${formatted}`, class: "overdue" };
  if (diffDays === 0)
    return { text: `Due today · ${formatted}`, class: "due-today" };
  if (diffDays === 1) return { text: `Due tomorrow · ${formatted}`, class: "" };
  return { text: `Due ${formatted}`, class: "" };
};

/* INITIALIZATION */
showDate();
checkAuth();
