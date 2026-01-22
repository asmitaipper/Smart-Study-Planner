// Basic smart study planner with localStorage
const taskForm = document.getElementById("task-form");
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const dateInput = document.getElementById("date");
const priorityInput = document.getElementById("priority");
const taskListEl = document.getElementById("task-list");

const totalTasksEl = document.getElementById("total-tasks");
const completedTasksEl = document.getElementById("completed-tasks");
const completionRateEl = document.getElementById("completion-rate");
const todaySubjectEl = document.getElementById("today-subject");

const filterButtons = document.querySelectorAll(".filters button");
let tasks = [];
let currentFilter = "all";

function loadTasks() {
  const saved = localStorage.getItem("smart_study_tasks");
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem("smart_study_tasks", JSON.stringify(tasks));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString();
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  completionRateEl.textContent = rate + "%";

  const todayTasks = tasks.filter((t) => isToday(t.date) && !t.completed);
  if (todayTasks.length > 0) {
    const subjectCounts = {};
    todayTasks.forEach((t) => {
      subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
    });
    const topSubject = Object.entries(subjectCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    todaySubjectEl.textContent = topSubject;
  } else {
    todaySubjectEl.textContent = "—";
  }
}

function renderTasks() {
  taskListEl.innerHTML = "";
  let filtered = tasks.slice();

  if (currentFilter === "today") {
    filtered = filtered.filter((t) => isToday(t.date));
  } else if (currentFilter === "pending") {
    filtered = filtered.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add your first study task!";
    taskListEl.appendChild(empty);
    updateStats();
    return;
  }

  filtered
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.completed ? " completed" : "");
      li.dataset.id = task.id;

      const left = document.createElement("div");
      left.className = "task-left";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const main = document.createElement("div");
      main.className = "task-main";

      const title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.topic;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const subjectBadge = document.createElement("span");
      subjectBadge.className = "task-badge badge-subject";
      subjectBadge.textContent = task.subject || "General";

      const priorityBadge = document.createElement("span");
      priorityBadge.className =
        "task-badge " +
        (task.priority === "high"
          ? "badge-priority-high"
          : task.priority === "medium"
          ? "badge-priority-medium"
          : "badge-priority-low");
      priorityBadge.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

      meta.appendChild(subjectBadge);
      meta.appendChild(priorityBadge);

      main.appendChild(title);
      main.appendChild(meta);

      left.appendChild(checkbox);
      left.appendChild(main);

      const right = document.createElement("div");
      right.className = "task-right";

      const dateEl = document.createElement("div");
      dateEl.className = "task-date";
      dateEl.textContent = formatDate(task.date);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editTask(task.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "icon-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      right.appendChild(dateEl);
      right.appendChild(actions);

      li.appendChild(left);
      li.appendChild(right);

      taskListEl.appendChild(li);
    });

  updateStats();
}

function addTask(e) {
  e.preventDefault();
  const subject = subjectInput.value.trim();
  const topic = topicInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (!topic || !date) return;

  const task = {
    id: Date.now(),
    subject: subject || "General",
    topic,
    date,
    priority,
    completed: false,
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskForm.reset();
}

function toggleTask(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const newTopic = prompt("Update task", task.topic);
  if (newTopic && newTopic.trim().length > 0) {
    task.topic = newTopic.trim();
    saveTasks();
    renderTasks();
  }
}

taskForm.addEventListener("submit", addTask);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

loadTasks();
renderTasks();
