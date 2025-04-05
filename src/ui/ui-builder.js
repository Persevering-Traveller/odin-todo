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
        allTodos = this.#sortItems(allTodos, project.getTodoList());
        // WARNING -- NOTE -- TODO: Whenever a .forEach() or for..of is used, it puts it in the wrong order
        // but when doing it like this, it's how I'd like it. WHY???
        todosContainer.appendChild(allTodos[0]);
        todosContainer.appendChild(allTodos[1]);
        todosContainer.appendChild(allTodos[2]);
        todosContainer.appendChild(allTodos[3]);
        todosContainer.appendChild(allTodos[4]);

        return todosContainer;
    }

    static #buildTodoItems(project) {
        let todos = [];
        project.getTodoList().forEach((todo, i) => {
            let priorityLevel = "";
            switch(todo.getPriority()) {
                case 0: priorityLevel = "low"; break;
                case 1: priorityLevel = "normal"; break;
                case 2: priorityLevel = "high"; break;
            }
            const todoItem = this.#makeElement("div", "todo-item " + priorityLevel);
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
            const dueDate = this.#makeElement("div", "todo-due", (todo.getDueDate() !== null) ? todo.prettyPrintDate() : "");

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

    static #sortItems(todoElements, todos) {
        /* Place each todo by # of days left till due vs priority value, ex:
            Due in 1 day: Low Priority,
            Due in 2 days: High Priority, Low Priority,
            Due in 3 days: Normal Priority, Low Priority,
            Due in more than 3 days: (All High Priorities), (All Normal Priorities), (All Low Priorities)
        */
        let sortedByDueDays = [
            [], // Due today or past due
            [], // 1 day till due
            [], // 2 days till due
            [], // 3 days till due
            []  // Not due soon or no due date
        ];
        
        const today = new Date();
        todos.forEach((todo, i) => {
            if(todo.getDueDate() === null) { // Some Todos don't have due dates
                sortedByDueDays[4].push({element: todoElements[i], priority: todo.getPriority()});
                return;
            }
            
            // Todo is due soon
            let daysTillDue = todo.getDueDate().getDate() - today.getDate()
            if(todo.getDueDate().getFullYear() === today.getFullYear() &&
                todo.getDueDate().getMonth() === today.getMonth() &&
                daysTillDue <= 3) {
                    if(daysTillDue < 0) // Todo is past due
                        sortedByDueDays[0].push({element: todoElements[i], priority: todo.getPriority()});
                    else
                        sortedByDueDays[daysTillDue].push({element: todoElements[i], priority: todo.getPriority()});
            }
            
            // Todo isn't due soon
            sortedByDueDays[4].push({element: todoElements[i], priority: todo.getPriority()});

        });

        // Sort each day by priority value
        sortedByDueDays.forEach(day => {
            day.sort((a, b) => a.priority - b.priority)
        });

        // Grab only the elements and flatten the array
        let sortedTodos = []
        sortedByDueDays.forEach(day => {
            sortedTodos.push(day.map(todo => todo.element));
        });

        return sortedTodos.flat(2);
    }
}