const taskInput = document.querySelector(".task-input input"),
    filters = document.querySelectorAll(".filters span"),
    clearAll = document.querySelector(".clear-btn"),
    taskBox = document.querySelector(".task-box"),
    progress = document.getElementById('progress'),
    levelDisplay = document.getElementById('level'),
    expDisplay = document.getElementById('experience');

let editId,
    isEditTask = false,
    userLevel = parseInt(localStorage.getItem("user-level")) || 1,
    userExp = parseInt(localStorage.getItem("user-exp")) || 0,
    todos = JSON.parse(localStorage.getItem("todo-list")) || [];

filters.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

clearAll.addEventListener("click", () => {
    isEditTask = false;
    todos = todos.filter(task => task.status !== 'completed');
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
    updateProgress();
});

taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  if ((e.key == "Enter" || (e.key === 'v' && e.ctrlKey)) && userTask) {
      if (!isEditTask) {
          const tasksToAdd = splitTasksByLine(userTask);
          addTasks(tasksToAdd);
      } else {
          isEditTask = false;
          todos[editId].name = userTask;
      }
      taskInput.value = "";
      localStorage.setItem("todo-list", JSON.stringify(todos));
      localStorage.setItem("user-exp", userExp);
      showTodo(document.querySelector("span.active").id);
      updateProgress();
  }
});

document.getElementById('paste-tasks-btn').addEventListener('click', () => {
    navigator.clipboard.readText().then(text => {
        const tasksToAdd = splitTasksByLine(text);
        addTasks(tasksToAdd);
        updateProgress();
    });
});

function updateProgress() {
    const completedTasks = todos.filter(task => task.status === 'completed').length;
    const totalTasks = todos.length || 1;
    const percentage = (completedTasks / totalTasks) * 100;

    progress.style.width = `${percentage}%`;

    if (expDisplay) {
        expDisplay.innerText = `+${userExp} XP`;
    }

    if (levelDisplay) {
        if (percentage >= 100) {
            progress.style.width = '0%';
            userLevel++;
            userExp += 50;
            levelDisplay.innerText = `Seu Nível ${userLevel}`;
            localStorage.setItem("user-level", userLevel);
        }

        localStorage.setItem("user-exp", userExp);
    }
}

function addTasks(tasks) {
  tasks.forEach(taskName => {
      const taskInfo = { name: taskName, status: "pending" };
      todos.push(taskInfo);
      userExp += 10;
  });

  localStorage.setItem("todo-list", JSON.stringify(todos));
  localStorage.setItem("user-exp", userExp);
  showTodo();
}

function splitTasksByLine(input) {
    return input.split(/\r?\n/).map(task => task.trim()).filter(task => task !== "");
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.lastElementChild;
    if (selectedTask.checked) {
        taskName.classList.add("checked");
        todos[selectedTask.id].status = "completed";
        userExp += 20;
    } else {
        taskName.classList.remove("checked");
        todos[selectedTask.id].status = "pending";
        userExp -= 20;
    }
    localStorage.setItem("todo-list", JSON.stringify(todos));
    localStorage.setItem("user-exp", userExp);
    showTodo(document.querySelector("span.active").id);
    updateProgress();
}

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.toggle("show");
    document.addEventListener("click", (e) => {
        if (!menuDiv.contains(e.target)) {
            menuDiv.classList.remove("show");
        }
    });
}

function showTodo(filter) {
  let liTag = "";
  if (todos) {
      todos.forEach((todo, id) => {
          let completed = todo.status == "completed" ? "checked" : "";
          if (filter == todo.status || filter == "all") {
              liTag += `<li class="task">
                          <label for="${id}" class="task-item">
                              <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                              <p class="${completed}">${todo.name}</p>
                              <div class="task-options">
                                  <i class="uil uil-pen" onclick='editTask(${id}, "${todo.name}")'></i>
                                  <i class="uil uil-trash" onclick='deleteTask(${id}, "${filter}")'></i>
                              </div>
                          </label>
                      </li>`;
          }
      });
  }
  taskBox.innerHTML =
      liTag || `<span>Sem Tarefas Aqui</span>`;
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length
        ? clearAll.classList.remove("active")
        : clearAll.classList.add("active");
    taskBox.offsetHeight >= 300
        ? taskBox.classList.add("overflow")
        : taskBox.classList.remove("overflow");
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    todos.splice(deleteId, 1);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(filter);
}

updateProgress();
