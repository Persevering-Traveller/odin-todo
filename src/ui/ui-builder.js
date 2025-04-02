export class UIBuilder {
    static #projects = [];
    static #contentArea;

    static {
        this.#contentArea = document.querySelector("#content");
    }

    static loadProjects(projects) {
        for(const project of projects) {
            this.#projects.push(project);
        }
    }

    static build() {
        const title = this.#makeElement("div", "projects-title", "Todos");
        const projectsContainer = this.#buildProjectsContainer();
        this.#contentArea.appendChild(title);
        this.#contentArea.appendChild(projectsContainer);
    }

    static #makeElement(type, className, text="") {
        const element = document.createElement(type);
        element.setAttribute("class", className);
        element.textContent = text;

        return element;
    }

    static #buildProjectsContainer() {
        const projectsContainer = this.#makeElement("div", "projects-container");

        this.#projects.forEach((project) =>  {
            // TODO: Build a Project card for each project in the projects list
            console.log(project.getTodoList());
            project.getTodoList().forEach((todo) => {
                console.log(todo.getTitle());
                console.log(todo.getDesc());
                console.log(todo.getDueDate());
            });
        });
        const addProjectBtn = this.#makeElement("button", "add-project-btn", "+");
        // TODO: Add on click event that opens a New Project Modal
        projectsContainer.appendChild(addProjectBtn);

        return projectsContainer;
    }  

    static #buildProjectCard(project) {
        // TODO: Build a project card to be displayed in the projectsContainer
    }

    static #buildNewProjectModal() {
        // TODO: Build a modal that lets users input a project title
    } 
}