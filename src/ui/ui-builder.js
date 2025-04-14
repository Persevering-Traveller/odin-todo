import { DataHandler } from "../datahandler";
import { Project } from "../project";

export class UIBuilder {
    static #projects = [];

    static createDefault() {
        this.#projects.push(new Project());
        DataHandler.saveData(this.#projects);
    }

    static loadProjects(projects) {
        for(const project of projects) {
            let builtProject = new Project(project.name, project.color);
            project.todos.forEach(todo => builtProject.addTodo(
                todo.title,
                todo.description,
                (todo.dueDate === null) ? null : new Date(todo.dueDate),
                todo.priority,
                (todo.complete === "true") ? true : false
            ));
            this.#projects.push(builtProject);
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

    static #makeEditButton(modalType, todo, project) {
        const editBtn = this.#makeElement("button", "todo-info-edit-btn", "Edit");
        editBtn.addEventListener("click", () => {
            const editModal = this.#buildTodoEditModal(modalType, todo, project);
            editModal.showModal();
        });

        return editBtn;
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
        const deleteBtn = this.#makeElement("button", "project-card-delete-btn", "X");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            // Open a modal that asks "Are you sure?"
            const modal = this.#buildDeletionConfirmationModal(card, project);
            modal.showModal();
        });
        card.appendChild(deleteBtn);

        const cardContent = this.#makeElement("div", "project-card-content");
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

        cardContent.appendChild(projectName);
        cardContent.appendChild(todoList);

        card.appendChild(cardContent);
        card.style.backgroundColor = project.getColor();
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
        const colorPicker = this.#makeElement("input", "project-color-picker");
        colorPicker.setAttribute("type", "color");
        colorPicker.defaultValue = "#FFFFFF"; // White is default color
        form.appendChild(projectNameEntry);
        form.appendChild(colorPicker);

        const btnSection = this.#makeElement("div", "modal-btns");
        const submitBtn = this.#makeElement("button", "submit-btn", "Submit");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(projectNameEntry.value !== "") {
                this.#projects.push(new Project(projectNameEntry.value, colorPicker.value));
                DataHandler.saveData(this.#projects);
            }
            modal.close();
            this.buildAllProjectsView();
        });

        const closeBtn = this.#makeElement("button", "close-btn", "Close");
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });
        btnSection.appendChild(submitBtn);
        btnSection.appendChild(closeBtn);

        modal.appendChild(form);
        modal.appendChild(btnSection);
        return modal;
    } 

    static #buildDeletionConfirmationModal(card, project) {
        const modal = document.querySelector("#modal");
        this.#clearElementChildren(modal);

        const prompt = this.#makeElement("div", "deletion-conf-prompt", "Are you sure you want to delete this project? (You'll lose all of your Todos)");

        const btnSection = this.#makeElement("div", "modal-btns");
        const confirmBtn = this.#makeElement("button", "submit-btn", "Confirm");
        confirmBtn.addEventListener("click", () => {
            this.#projects = this.#projects.filter(proj => proj.getName() !== project.getName());
            DataHandler.saveData(this.#projects);
            card.remove();
            modal.close();
            this.buildAllProjectsView();
        });

        const cancelBtn = this.#makeElement("button", "close-btn", "Cancel");
        cancelBtn.addEventListener("click", () => {
            modal.close();
        });
        btnSection.appendChild(confirmBtn);
        btnSection.appendChild(cancelBtn);

        modal.appendChild(prompt);
        modal.appendChild(btnSection);
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
        const addBtn = this.#makeElement("button", "add-todo-btn", "+");
        addBtn.addEventListener("click", () => {
            const modal = this.#buildNewTodoModal(project);
            modal.showModal();
        });

        contentArea.appendChild(backBtn);
        contentArea.appendChild(title);
        contentArea.appendChild(addBtn);
        contentArea.appendChild(todosContainer);
    }

    static #buildTodosContainer(project) {
        const todosContainer = this.#makeElement("div", "todos");
        let allTodos = this.#buildTodoItems(project);
        allTodos = this.#sortItems(allTodos, project.getTodoList());
        allTodos.forEach(todo => {
            todosContainer.appendChild(todo);
        });

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
            let completedTodo = "";
            if(todo.getComplete()) completedTodo = " completed-todo-item";
            const todoItem = this.#makeElement("div", 
                                               "todo-item " + 
                                                priorityLevel +
                                                completedTodo);
            
            const completedCheckbox = this.#makeElement("input", "todo-complete");
            completedCheckbox.setAttribute("type", "checkbox");
            completedCheckbox.checked = todo.getComplete();
            completedCheckbox.addEventListener("click", () => {
                todo.changeComplete();
                DataHandler.saveData(this.#projects);
                completedCheckbox.checked = todo.getComplete();
                this.#buildProjectView(project);
            });

            // Only want the title, description and due date area clickable
            const todoInfoArea = this.#makeElement("div", "todo-info-area");
            const title = this.#makeElement("div", "todo-title", todo.getTitle());
            const description = this.#makeElement("div", "todo-desc", todo.getDesc());
            const dueDate = this.#makeElement("div", "todo-due", (todo.getDueDate() !== null) ? todo.prettyPrintDate() : "");
            todoInfoArea.appendChild(title);
            todoInfoArea.appendChild(description);
            todoInfoArea.appendChild(dueDate);
            todoInfoArea.addEventListener("click", () => {
                this.#buildTodoView(todo, project);
            });

            const deleteBtn = this.#makeElement("button", "delete-btn", "X");
            deleteBtn.addEventListener("click", () => {
                project.removeTodo(i);
                todoItem.remove();
            });

            todoItem.appendChild(completedCheckbox);
            todoItem.appendChild(todoInfoArea);
            todoItem.appendChild(deleteBtn);

            todos.push(todoItem);
        });

        return todos;
    }

    static #sortItems(todoElements, todos) {
        /* Place each todo by # of days left till due vs priority value, ex:
            Due today or past due!: (All High Priorities), (All Normal Priorities), (All Low Priorities),
            Due in 1 day: Low Priority,
            Due in 2 days: High Priority, Low Priority,
            Due in 3 days: Normal Priority, Low Priority,
            Due in more than 3 days: (All High Priorities), (All Normal Priorities), (All Low Priorities),
            Completed: (All High Priorities), (All Normal Priorities), (All Low Priorities)
        */
        let sortedByDueDays = [
            [], // Past due
            [], // Due today
            [], // 1 day till due
            [], // 2 days till due
            [], // 3 days till due
            [], // Not due soon or no due date
            []  // Completed
        ];
        
        const today = new Date();
        todos.forEach((todo, i) => {
            if(todo.getComplete()) {
                sortedByDueDays[6].push({element: todoElements[i], priority: todo.getPriority(), due: todo.getDueDate()});
                return;
            }

            if(todo.getDueDate() === null) { // Some Todos don't have due dates
                sortedByDueDays[5].push({element: todoElements[i], priority: todo.getPriority(), due: todo.getDueDate()});
                return;
            }
            
            // Todo is due soon
            let daysTillDue = todo.getDueDate().getDate() - today.getDate()
            if(todo.getDueDate().getFullYear() === today.getFullYear() &&
                todo.getDueDate().getMonth() === today.getMonth() &&
                daysTillDue <= 3) {
                    if(daysTillDue < 0) // Todo is past due
                        sortedByDueDays[0].push({element: todoElements[i], priority: todo.getPriority(), due: todo.getDueDate()});
                    else
                        sortedByDueDays[daysTillDue + 1].push({element: todoElements[i], priority: todo.getPriority(), due: todo.getDueDate()});
                    
                    return;
            }
            
            // Todo isn't due soon
            sortedByDueDays[5].push({element: todoElements[i], priority: todo.getPriority(), due: todo.getDueDate()});
        });

        // Sort each day by priority value
        sortedByDueDays.forEach(day => {
            day.sort((a, b) => b.priority - a.priority);
        });

        // Sort now by which is due soonest
        sortedByDueDays.forEach(day => {
            day.sort((a, b) => {
                if(a.due === null || b.due === null) return 0; // If the todo has no due date
                if(a.due.getFullYear() !== b.due.getFullYear())
                    return a.due.getFullYear() - b.due.getFullYear();
                if(a.due.getMonth() !== b.due.getMonth())
                    return a.due.getMonth() - b.due.getMonth();
                // If in the same year and month, sort by day
                return a.due.getDate() - b.due.getDate();
            });
        });

        // Grab only the elements and flatten the array
        let sortedTodos = []
        sortedByDueDays.forEach(day => {
            sortedTodos.push(day.map(todo => todo.element));
        });

        return sortedTodos.flat(2);
    }

    static #buildTodoView(todo, project) {
        const contentArea = document.querySelector("#content");
        this.#clearElementChildren(contentArea);

        const todoInfoContainer = this.#buildTodoInfoContainer(todo, project);
        
        const backBtn = this.#makeElement("button", "back-btn", "<-");
        backBtn.addEventListener("click", () => {
            this.#buildProjectView(project);
        })

        contentArea.appendChild(backBtn);
        contentArea.appendChild(todoInfoContainer);
    }

    static #buildTodoInfoContainer(todo, project) {
        // TODO: title, desc, and dueDate needs an edit button
        const todoInfo = this.#makeElement("div", "todo-info-container");

        const completedCheckbox = this.#makeElement("input", "todo-info-checkbox");
        completedCheckbox.setAttribute("type", "checkbox");
        completedCheckbox.checked = todo.getComplete();
        completedCheckbox.addEventListener("click", () => {
            todo.changeComplete();
            DataHandler.saveData(this.#projects);
            completedCheckbox.checked = todo.getComplete();
        });
        const titleSect = this.#makeElement("div", "todo-info-section-title");
        titleSect.appendChild(this.#makeEditButton("title", todo, project));
        titleSect.appendChild(this.#makeElement("div", "todo-info-title", todo.getTitle()));
        const descSect = this.#makeElement("div", "todo-info-section-desc");
        descSect.appendChild(this.#makeEditButton("description", todo, project));
        descSect.appendChild(this.#makeElement("div", "todo-info-desc", todo.getDesc()));
        const dueDateSect = this.#makeElement("div", "todo-info-section-due-date");
        dueDateSect.appendChild(this.#makeEditButton("due-date", todo, project));
        dueDateSect.appendChild(this.#makeElement("div", "todo-info-due-date", todo.prettyPrintDate()));
        
        const prioritySelector = this.#makeElement("select", "todo-info-priority");
        const priorityLevels = ["Low", "Normal", "High"];
        priorityLevels.forEach((priority, i) => {
            const priorityOption = this.#makeElement("option", "", priority);
            priorityOption.value = i;
            if(todo.getPriority() === i) // Low is 0, Normal is 1, High is 2
                priorityOption.selected = true;
            prioritySelector.appendChild(priorityOption);
        });
        // Even though priorityOption.value was set to an integer, it's read as a string
        // So reconvert it to integer
        prioritySelector.addEventListener("change", () => {
            todo.changePriority(Number(prioritySelector.value));
            DataHandler.saveData(this.#projects);
        });

        todoInfo.appendChild(completedCheckbox);
        todoInfo.appendChild(titleSect);
        todoInfo.appendChild(descSect);
        todoInfo.appendChild(dueDateSect);
        todoInfo.appendChild(prioritySelector);

        return todoInfo;
    }

    static #buildNewTodoModal(project) {
        const modal = document.querySelector("#modal");
        this.#clearElementChildren(modal);

        const form = this.#makeElement("form", "form");
        form.setAttribute("action", "");
        form.setAttribute("method", "post");

        const title = this.#makeElement("input", "new-todo-title");
        title.setAttribute("type", "text");

        const desc = this.#makeElement("textarea", "new-todo-desc");
        desc.setAttribute("rows", 10);
        desc.setAttribute("cols", 50);

        const dueDate = this.#makeElement("input", "new-todo-date");
        dueDate.setAttribute("type", "date");

        const prioritySelector = this.#makeElement("select", "new-todo-priority");
        const priorityLevels = ["Low", "Normal", "High"];
        priorityLevels.forEach((priority, i) => {
            const priorityOption = this.#makeElement("option", "", priority);
            priorityOption.value = i;
            if(i == 1) // Normal priority is default
                priorityOption.selected = true;
            prioritySelector.appendChild(priorityOption);
        });

        form.appendChild(title);
        form.appendChild(desc);
        form.appendChild(dueDate);
        form.appendChild(prioritySelector);

        const btnSection = this.#makeElement("div", "modal-btns");
        const submitBtn = this.#makeElement("button", "submit-btn", "Submit");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(title.value !== "" && desc.value !== "") {
                project.addTodo(title.value,
                                desc.value,
                                (dueDate.value !== "") ? new Date(dueDate.value.replace(/-/g, '\/')) : null,
                                Number(prioritySelector.value)
                );
                DataHandler.saveData(this.#projects);
            }
            modal.close();
            this.#buildProjectView(project);
        });

        const closeBtn = this.#makeElement("button", "close-btn", "Close");
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });
        btnSection.appendChild(submitBtn);
        btnSection.appendChild(closeBtn);

        modal.appendChild(form);
        modal.appendChild(btnSection);

        return modal;
    }

    static #buildTodoEditModal(modalType, todo, project) {
        const modal = document.querySelector("#modal");
        this.#clearElementChildren(modal);

        const form = this.#makeElement("form", "form");
        form.setAttribute("action", "");
        form.setAttribute("method", "post");

        let input = this.#makeElement("input", "todo-input");
        switch(modalType) {
            case "title":
                input.setAttribute("type", "text");
                break;
            case "description":
                input = this.#makeElement("textarea", "todo-input-textarea");
                input.setAttribute("rows", 10);
                input.setAttribute("cols", 50);
                break;
            case "due-date":
                input.setAttribute("type", "date");
                break;
        }
        form.appendChild(input);

        const btnSection = this.#makeElement("div", "modal-btns");
        const submitBtn = this.#makeElement("button", "submit-btn", "Submit");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(input.value !== "") {
                switch(modalType) {
                    case "title":
                        todo.changeTitle(input.value);
                        break;
                    case "description":
                        todo.changeDesc(input.value);
                        break;
                    case "due-date":
                        // I guess Javascript's Date object is a little weird when parsing
                        // strings to set the date. Depending on the user's timezone
                        // '2025-9-23' the day may or may not evaluate to the 22nd.
                        // But by replacing the dashes with a forward slash, it's guaranteed
                        // to be the date we expect.
                            todo.changeDueDate(new Date(input.value.replace(/-/g, '\/')));
                        break;
                }
                DataHandler.saveData(this.#projects);
            }
            this.#buildTodoView(todo, project);
            modal.close();
        });

        const closeBtn = this.#makeElement("button", "close-btn", "Close");
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });
        btnSection.appendChild(submitBtn);
        btnSection.appendChild(closeBtn);

        modal.appendChild(form);
        modal.appendChild(btnSection);
        return modal;
    }
}