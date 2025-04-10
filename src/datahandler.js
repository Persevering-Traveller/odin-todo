export class DataHandler {
    static loadData() {
        let loadedProjects = JSON.parse(localStorage.getItem("todoProjects"));
        if (loadedProjects === null)
            return null;

        loadedProjects = loadedProjects.map(project => JSON.parse(project));
        loadedProjects.forEach(project => project.todos = project.todos.map(todo => JSON.parse(todo)));
        return loadedProjects;
    }

    static saveData(projects) {
        let stringifiedProj = [];
        projects.forEach(project => {
            stringifiedProj.push(project.stringified());
        });
        
        localStorage.setItem("todoProjects", JSON.stringify(stringifiedProj));
    }
}