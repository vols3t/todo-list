function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  if (callbacks) {
    Object.keys(callbacks).forEach((event) => {
      element.addEventListener(event, callbacks[event]);
    });
  }

  return element;
}

class Component {
  constructor() {
    this._children = new Map();
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newNode = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newNode, this._domNode);
    }
    this._domNode = newNode;
  }

  getChild(key, factory) {
    let child = this._children.get(key);
    if (!child) {
      child = factory();
      this._children.set(key, child);
    }
    return child;
  }

  removeChild(key) {
    this._children.delete(key);
  }
}

class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.onAddTaskCallback = onAddTask;
    this.state = { value: "" };
  }

  onAddInputChange = (e) => {
    this.state.value = e.target.value;
  };

  onAddTask = () => {
    if (this.state.value.trim() === "") return;
    const value = this.state.value;
    this.state.value = "";
    this.onAddTaskCallback(value);
  };

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement(
        "input",
        {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.state.value,
        },
        null,
        { input: this.onAddInputChange },
      ),
      createElement("button", { id: "add-btn" }, "+", {
        click: this.onAddTask,
      }),
    ]);
  }
}

class Task extends Component {
  constructor(task, onToggle, onDelete) {
    super();
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = { confirmDelete: false };
  }

  onToggleClick = () => {
    this.onToggle();
  };

  onDeleteClick = () => {
    if (!this.state.confirmDelete) {
      this.state.confirmDelete = true;
      this.update();
    } else {
      this.onDelete();
    }
  };

  render() {
    const checkboxAttrs = { type: "checkbox" };
    if (this.task.done) checkboxAttrs.checked = "checked";
    const labelAttrs = this.task.done ? { style: "color: gray;" } : {};
    const buttonAttrs = this.state.confirmDelete
      ? { style: "background-color: red;" }
      : {};
    return createElement("li", {}, [
      createElement("input", checkboxAttrs, null, {
        change: this.onToggleClick,
      }),
      createElement("label", labelAttrs, this.task.title),
      createElement("button", buttonAttrs, "🗑️", {
        click: this.onDeleteClick,
      }),
    ]);
  }
}

class TodoList extends Component {
  constructor() {
    super();
    const saved = localStorage.getItem("todoListState");
    if (saved) {
      this.state = JSON.parse(saved);
    } else {
      this.state = {
        tasks: [
          { id: 1, title: "Сделать домашку", done: false },
          { id: 2, title: "Сделать практику", done: false },
          { id: 3, title: "Пойти домой", done: false },
        ],
        nextId: 4,
      };
    }
  }

  saveState = () => {
    localStorage.setItem("todoListState", JSON.stringify(this.state));
  };

  onAddTask = (title) => {
    this.state.tasks.push({ id: this.state.nextId, title, done: false });
    this.state.nextId++;
    this.saveState();
    this.update();
  };

  onToggleTask = (id) => {
    const task = this.state.tasks.find((t) => t.id === id);
    if (task) task.done = !task.done;
    this.saveState();
    this.update();
  };

  onDeleteTask = (id) => {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.removeChild(`task-${id}`);
    this.saveState();
    this.update();
  };

  render() {
    const addTask = this.getChild("addTask", () => new AddTask(this.onAddTask));
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      addTask.getDomNode(),
      createElement(
        "ul",
        { id: "todos" },
        this.state.tasks.map((task) => {
          const taskComp = this.getChild(
            `task-${task.id}`,
            () =>
              new Task(
                task,
                () => this.onToggleTask(task.id),
                () => this.onDeleteTask(task.id),
              ),
          );
          taskComp.task = task;
          return taskComp.getDomNode();
        }),
      ),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
