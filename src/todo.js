export class Todo {
    #title = "";
    #description = "";
    #dueDate;
    #priority; // 0 - Lowest Priority; 1 - Normal Priority; 2 - Highest Priority
    #complete;

    constructor(title="No Title", desc="No Description", dueDate=null, priority=1, complete=false) {
        this.#title = title;
        this.#description = desc;
        this.#dueDate = dueDate;
        this.#priority = priority;
        this.#complete = complete;
    }

    // Getters
    getTitle() {
        return this.#title;
    }

    getDesc() {
        return this.#description;
    }

    getDueDate() {
        return this.#dueDate;
    }

    prettyPrintDate() {
        // MM/DD/YY
        const dueDate = `${this.#dueDate.getMonth()}/` +
                        `${this.#dueDate.getDate()}/` +
                        `${this.#dueDate.getFullYear().toString().slice(2)}`;
        return dueDate;
    }

    getPriority() {
        return this.#priority;
    }

    getComplete() {
        return this.#complete;
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

    changeComplete() {
        this.#complete = !this.#complete;
    }
}