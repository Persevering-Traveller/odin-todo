import { Project } from "../project";

export class UIBuilder {
    static #projects = [];

    static loadProjects(projects) {
        for(const project of projects) {
            this.#projects.push(project);
        }
    }

    static buildAllProjectsView() {
        const contentArea = document.querySelector("#content");
        this.#clearElementChildren(contentArea);

        const title = this.#makeElement("div", "all-projects-title", "Todos");
        const projectsContainer = this.#buildAllProjectsContainer();

        contentArea.appendChild(title);
        contentArea.appendChild(projectsContainer);
    }

    static #makeElement(type, className, text="") {
        const element = document.createElement(type);
        element.setAttribute("class", className);
        element.textContent = text;

        return element;
    }

    static #clearElementChildren(element) {
        while(element.hasChildNodes()) {
            element.removeChild(element.firstElementChild);
        }
    }

    static #buildAllProjectsContainer() {
        const projectsContainer = this.#makeElement("div", "all-projects-container");
        this.#projects.forEach((project) =>  {
            projectsContainer.appendChild(this.#buildProjectCard(project));
        });
        const addProjectBtn = this.#makeElement("button", "add-project-btn", "+");
        addProjectBtn.addEventListener("click", () => {
            const newModal = this.#buildNewProjectModal();
            newModal.showModal();
        });
        projectsContainer.appendChild(addProjectBtn);

        return projectsContainer;
    }  

    static #buildProjectCard(project) {
        const card = this.#makeElement("div", "project-card");
        card.addEventListener("click", () => {
            this.#buildProjectView(project);
        });
        const projectName = this.#makeElement("div", "project-card-title", project.getName());

        const todoList = this.#makeElement("ul", "project-card-todo-list");
        // Only have 3 Todo titles in a project card, otherwise, put an elipsis
        const todoTitles = project.getTodoTitles();
        todoTitles.slice(0, 3).forEach((todoTitle) => {
            const todoItem = this.#makeElement("li", "project-card-todo-title", todoTitle);
            todoList.appendChild(todoItem);
        });
        if(todoTitles.length > 3) {
            const elipsis = this.#makeElement("li", "project-card-todo-title", "...");
            todoList.appendChild(elipsis);
        }

        card.appendChild(projectName);
        card.appendChild(todoList);
        return card;
    }

    static #buildNewProjectModal() {
        const modal = document.querySelector("#modal");
        this.#clearElementChildren(modal);

        const form = this.#makeElement("form", "form");
        form.setAttribute("action", "");
        form.setAttribute("method", "post");

        const projectNameEntry = this.#makeElement("input", "form-name-entry");
        projectNameEntry.setAttribute("type", "text");
        form.appendChild(projectNameEntry);

        const submitBtn = this.#makeElement("button", "submit-btn", "Submit");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.#projects.push(new Project(projectNameEntry.value));
            modal.close();
            this.build();
        });

        const closeBtn = this.#makeElement("button", "close-btn", "Close");
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });

        modal.appendChild(form);
        modal.appendChild(submitBtn);
        modal.appendChild(closeBtn);
        return modal;
    } 

    static #buildProjectView(project) {
        const contentArea = document.querySelector("#content");
        this.#clearElementChildren(contentArea);

        const title = this.#makeElement("div", "project-title", project.getName());
        const todosContainer = this.#buildTodosContainer(project);

        const backBtn = this.#makeElement("button", "back-btn", "<-");
        backBtn.addEventListener("click", () => {
            this.buildAllProjectsView();
        });

        contentArea.appendChild(backBtn);
        contentArea.appendChild(title);
        contentArea.appendChild(todosContainer);
    }

    static #buildTodosContainer(project) {
        const todosContainer = this.#makeElement("div", "todos");
        let allTodos = this.#buildTodoItems(project);

        /* TODO: append each todo into the container in the following priority order:
            Due in 3 Days:
                1) High Priority Todo
                2) Normal Priority Todo
                3) Low Priority Todo
            4) High Priority Todo
            5) Normal Priority Todo
            6) Low Priority Todo
        */

        return todosContainer;
    }

    static #buildTodoItems(project) {
        let todos = [];
        project.getTodoList().forEach((todo, i) => {
            const todoItem = this.#makeElement("div", "todo-item");
            // TODO: Make each todo clickable that will open to the Todo View

            const completedCheckbox = this.#makeElement("input", "todo-complete");
            completedCheckbox.setAttribute("type", "checkbox");
            completedCheckbox.value = todo.getComplete();
            completedCheckbox.addEventListener("click", () => {
                todoItem.setAttribute("class", "completed-todo-item");
                todo.changeComplete();
                // TODO: Put this todo item at the end of the list and rebuild Project View
            });

            const title = this.#makeElement("div", "todo-title", todo.getTitle());
            const description = this.#makeElement("div", "todo-desc", todo.getDesc());
            const dueDate = this.#makeElement("div", "todo-due", (todo.getDueDate() !== null) ? todo.getDueDate() : "");

            const deleteBtn = this.#makeElement("button", "delete-btn", "X");
            deleteBtn.addEventListener("click", () => {
                project.removeTodo(i);
                todoItem.remove();
            });

            todoItem.appendChild(completedCheckbox);
            todoItem.appendChild(title);
            todoItem.appendChild(description);
            todoItem.appendChild(dueDate);
            todoItem.appendChild(deleteBtn);

            todos.push(todoItem);
        });

        return todos;
    }
}