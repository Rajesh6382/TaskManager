const API_URL = "http://localhost:5000/task"; // Backend API URL

// Load tasks when the page loads
document.addEventListener("DOMContentLoaded", getTasks);

function getTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = ""; // Clear list
            tasks.forEach(task => {
                let li = createTaskElement(task);
                taskList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching tasks:", error));
}

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();
    if (taskText === "") return;

    // Send new task to backend
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: taskText })
    })
    .then(response => response.json())
    .then(task => {
        let li = createTaskElement(task);
        document.getElementById("taskList").appendChild(li);
        taskInput.value = "";
    })
    .catch(error => console.error("Error adding task:", error));
}

function createTaskElement(task) {
    let li = document.createElement("li");
    let span = document.createElement("span");
    span.textContent = task.description;
    li.appendChild(span);

    let doneButton = document.createElement("button");
    doneButton.textContent = task.completed ? "Undo" : "Done";
    doneButton.onclick = function () { markDone(this, task.id, !task.completed); };
    li.appendChild(doneButton);

    let removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = function () { removeTask(this, task.id); };
    li.appendChild(removeButton);

    if (task.completed) {
        li.classList.add("done");
    }

    return li;
}

function markDone(button, id, completed) {
    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: completed })
    })
    .then(() => getTasks()) // Refresh task list
    .catch(error => console.error("Error updating task:", error));
}

function removeTask(button, id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => getTasks()) // Refresh task list
    .catch(error => console.error("Error deleting task:", error));
}
