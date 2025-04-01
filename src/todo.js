export class Todo {
    #title = "";
    #description = "";
    #dueDate;
    #priority; // 0 - Lowest Priority; 1 - Normal Priority; 2 - Highest Priority

    constructor(title="No Title", desc="No Description", dueDate=null, priority=1) {
        this.#title = title;
        this.#description = desc;
        this.#dueDate = dueDate;
        this.#priority = priority;
    }

    // Getters
    getTitle() {
        return this.#title;
    }

    getDesc() {
        return this.#description;
    }

    getDueDate() {
        // TODO: Format this into an easy to read string
        return this.#dueDate;
    }

    getPriority() {
        return this.#priority;
    }

    // Setters
    changeTitle(newTitle) {
        this.#title = newTitle;
    }

    changeDesc(newDesc) {
        this.#description = newDesc;
    }

    changeDueDate(newDate) {
        this.#dueDate = newDate;
    }

    changePriority(newPriority) {
        this.#priority = newPriority;
    }
}