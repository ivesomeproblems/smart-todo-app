class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.applyTheme();
    }

    bindEvents() {
        // Добавление задачи по Enter
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Поиск
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });

        // Переключение темы
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            this.showNotification('Пожалуйста, введите задачу!', 'warning');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            category: categorySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.render();
        
        taskInput.value = '';
        this.showNotification('Задача добавлена!', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Редактировать задачу:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
            this.showNotification('Задача обновлена!', 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            this.showNotification('Задача удалена!', 'error');
        }
    }

    filterTasks() {
        this.currentFilter = document.getElementById('filterSelect').value;
        this.currentCategoryFilter = document.getElementById('categoryFilter').value;
        this.render();
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(this.searchTerm);
            const matchesStatus = this.currentFilter === 'all' || 
                                (this.currentFilter === 'active' && !task.completed) ||
                                (this.currentFilter === 'completed' && task.completed);
            const matchesCategory = this.currentCategoryFilter === 'all' || 
                                  task.category === this.currentCategoryFilter;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }

    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '🎯',
            study: '📚',
            general: '📋'
        };
        return icons[category] || '📋';
    }

    getCategoryName(category) {
        const names = {
            work: 'Работа',
            personal: 'Личное',
            study: 'Учеба',
            general: 'Общее'
        };
        return names[category] || 'Общее';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            document.getElementById('emptyState').classList.add('show');
        } else {
            document.getElementById('emptyState').classList.remove('show');
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }

        this.updateStats();
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.category} ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="app.toggleTask(${task.id})">
                ${task.completed ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="task-category">
                        ${this.getCategoryIcon(task.category)} ${this.getCategoryName(task.category)}
                    </span>
                    <span>${this.formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="app.editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="app.deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return li;
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(t => 
            new Date(t.createdAt).toDateString() === today
        ).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('todayTasks').textContent = todayTasks;
    }

    // Локальное хранилище
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }

    // Темная тема
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Утилиты
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        // Простая реализация уведомления
        alert(message);
    }
}

// Инициализация приложения
const app = new TodoApp();

// Глобальные функции для onclick
function addTask() {
    app.addTask();
}

function filterTasks() {
    app.filterTasks();
}