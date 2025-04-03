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

        const title = this.#makeElement("div", "projects-title", "Todos");
        const projectsContainer = this.#buildProjectsContainer();

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

    static #buildProjectsContainer() {
        const projectsContainer = this.#makeElement("div", "projects-container");
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
        const todosContainer = this.#buildTodosContainer(project.getTodoList());

        const backBtn = this.#makeElement("button", "back-btn", "<-");
        backBtn.addEventListener("click", () => {
            this.buildAllProjectsView();
        });

        contentArea.appendChild(backBtn);
        contentArea.appendChild(title);
        //contentArea.appendChild(todosContainer);
    }

    static #buildTodosContainer(allTodos) {
        // TODO: Build container that will list out each todo's properties
        // TODO: Make each todo clickable that will open to the Todo View
    }
}