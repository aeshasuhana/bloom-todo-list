
const taskGrid = document.getElementById("taskGrid");
const modal = document.getElementById("modal");
const taskForm = document.getElementById("taskForm");

let tasks = JSON.parse(localStorage.getItem("bloomTasks")) || [];
let currentFilter = "all";

// Display current date
const today = new Date();
document.getElementById("date").textContent =
  today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

// Save tasks
function saveTasks() {
  localStorage.setItem("bloomTasks", JSON.stringify(tasks));
}

// Open modal
function openModal() {
  modal.classList.add("show");
}

// Close modal
function closeModal() {
  modal.classList.remove("show");
  taskForm.reset();
}

document.getElementById("heroAdd").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Add a new task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const category = document.getElementById("taskCategory").value;
  const date = document.getElementById("taskDate").value;

  if (!title) return;

  const newTask = {
    id: Date.now(),
    title,
    category,
    date: date || todayString,
    completed: false
  };

  tasks.unshift(newTask);

  saveTasks();
  renderTasks();
  closeModal();
});

// Render tasks
function renderTasks() {
  const searchValue = document
    .getElementById("search")
    .value.toLowerCase();

  let filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchValue);

    let matchesFilter = true;

    if (currentFilter === "completed") {
      matchesFilter = task.completed;
    } else if (currentFilter === "today") {
      matchesFilter = task.date === todayString;
    } else if (currentFilter !== "all") {
      matchesFilter = task.category === currentFilter;
    }

    return matchesSearch && matchesFilter;
  });

  taskGrid.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskGrid.innerHTML = `
      <div class="empty-state">
        <span>🌸</span>
        <h3>Nothing here yet!</h3>
        <p>A little space for new beginnings.</p>
      </div>
    `;
  }

  filteredTasks.forEach(task => {
    const card = document.createElement("article");
    card.className = `task-card ${task.completed ? "completed" : ""}`;

    const formattedDate = task.date
      ? new Date(task.date + "T00:00:00").toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        )
      : "No date";

    // Build card safely without inserting user input as HTML
    const top = document.createElement("div");
    top.className = "card-top";

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = task.category;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    top.append(category, deleteBtn);

    const title = document.createElement("h3");
    title.textContent = task.title;

    const date = document.createElement("p");
    date.className = "task-date";
    date.textContent = "♡ " + formattedDate;

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";

    const label = document.createElement("label");
    label.className = "done-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const labelText = document.createElement("span");
    labelText.textContent = task.completed ? "Completed" : "Mark as done";

    label.append(checkbox, labelText);

    const flower = document.createElement("span");
    flower.className = "card-flower";
    flower.textContent = "✿";

    bottom.append(label, flower);
    card.append(top, title, date, bottom);

    taskGrid.appendChild(card);
  });

  updateProgress();
  updateActiveFilters();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Complete / uncomplete task
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

// Update progress bar
function updateProgress() {
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("progressText").textContent =
    percentage + "%";

  document.getElementById("progressFill").style.width =
    percentage + "%";

  const message = document.getElementById("progressMessage");

  if (total === 0) {
    message.textContent = "Every little task counts 🌱";
  } else if (percentage === 100) {
    message.textContent = "You did it! What a beautiful achievement! 🌷";
  } else if (percentage >= 50) {
    message.textContent = "You're halfway there. Keep blooming! 🌸";
  } else {
    message.textContent = `${completed} of ${total} tasks completed. You've got this! 🌱`;
  }
}

// Search
document.getElementById("search").addEventListener("input", renderTasks);

// Filter tasks
function setFilter(filter) {
  currentFilter = filter;

  const heading = document.getElementById("taskHeading");

  const headings = {
    all: "Your tasks ♡",
    today: "Today's tasks ☀",
    completed: "Completed tasks ✓",
    Personal: "Personal tasks 🌷",
    Study: "Study tasks 📚",
    Work: "Work tasks 💻",
    Wishlist: "Your wishlist 🎀"
  };

  heading.textContent = headings[filter] || "Your tasks ♡";

  renderTasks();
}

// Update selected filter buttons
function updateActiveFilters() {
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.filter === currentFilter
    );

    if (button.classList.contains("nav-link")) {
      button.classList.toggle(
        "active",
        button.dataset.filter === currentFilter
      );
    }
  });
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    setFilter(button.dataset.filter);
  });
});

// Initial render
renderTasks();
