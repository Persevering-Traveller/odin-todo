import { Todo } from "./todo";

export class Project {
    #name = "";
    #todos = [];
    #color = "";

    constructor(name="Default", color="white") {
        this.#name = name;
        this.#color = color;
    }

    addTodo(title="No Title", desc="No Description", dueDate=null, priority=1, complete=false) {
        this.#todos.push(new Todo(title, desc, dueDate, priority, complete));
    }

    removeTodo(index) {
        if(index < 0 || index >= this.#todos.length) {
            console.error("Requested Todo index out of bounds");
            return;
        }
        this.#todos = this.#todos.filter((todo, i) => { if(i != index) return todo; });
    }

    // Getters
    getName() {
        return this.#name;
    }

    getTodoList() {
        return this.#todos;
    }

    getTodo(index) {
        if(index < 0 || index >= this.#todos.length) {
            console.error("Requested Todo index out of bounds");
            return;
        }
        return this.#todos[index];
    }

    getTodoTitles() {
        const titles = this.#todos.map(todo => todo.getTitle());
        return titles;
    }

    getColor() {
        return this.#color;
    }

    // Setters
    changeName(newName) {
        this.#name = newName;
    }

    changeColor(newColor) {
        this.#color = newColor;
    }
}