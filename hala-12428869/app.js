// File: js/app.js
// Student: Hala Madini (12428869)

const STUDENT_ID = "12428869";
const API_KEY = "nYs43u5f1oGK9";
const API_BASE = "https://portal.almasar101.com/assignment/api";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");


function setStatus(message, isError = false) {
    if (!statusDiv) return;
    statusDiv.textContent = message || "";
    statusDiv.style.color = isError ? "#d9363e" : "#666666";
}


async function loadTasks() {
    setStatus("Loading tasks...");
    try {
        const res = await fetch(`${API_BASE}/get.php?stdid=${STUDENT_ID}&key=${API_KEY}`);
        if (!res.ok) throw new Error("Error connecting to API");
        const data = await res.json();

        list.innerHTML = ""; 
        if (data.tasks && Array.isArray(data.tasks)) {
            data.tasks.forEach(task => renderTask(task));
        }

        setStatus(""); 
    } catch (error) {
        console.error(error);
        setStatus("Failed to load tasks", true);
    }
}


function renderTask(task) {
    const li = document.createElement("li");
    li.className = "task-item";

    const span = document.createElement("span");
    span.className = "task-title";
    span.textContent = task.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", async function () {
        await deleteTask(task.id);
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}


async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    try {
        const res = await fetch(`${API_BASE}/delete.php?stdid=${STUDENT_ID}&key=${API_KEY}&id=${id}`);
        if (!res.ok) throw new Error("Error connecting to API");
        const data = await res.json();

        if (data.success) {
            setStatus("Task deleted");
            await loadTasks(); 
        } else {
            setStatus("Failed to delete task", true);
        }
    } catch (error) {
        console.error(error);
        setStatus("Error deleting task", true);
    }
}


if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = input.value.trim();
        if (!title) {
            setStatus("Please write a task", true);
            return;
        }

        setStatus("Adding task...");
        try {
            const res = await fetch(`${API_BASE}/add.php?stdid=${STUDENT_ID}&key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });

            if (!res.ok) throw new Error("Error connecting to API");
            const data = await res.json();

            if (data.success && data.task) {
                setStatus("Task added");
                input.value = "";
                await loadTasks(); 
            } else {
                setStatus("Failed to add task", true);
            }
        } catch (error) {
            console.error(error);
            setStatus("Error adding task", true);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadTasks);
