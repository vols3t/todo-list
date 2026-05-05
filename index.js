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
  constructor() {}

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
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      tasks: [
        { title: "Сделать домашку", done: false },
        { title: "Сделать практику", done: false },
        { title: "Пойти домой", done: false },
      ],
      newTask: "",
    };
  }

  onAddInputChange = (e) => {
    this.state.newTask = e.target.value;
  };

  onAddTask = () => {
    if (this.state.newTask.trim() === "") return;
    this.state.tasks.push({ title: this.state.newTask, done: false });
    this.state.newTask = "";
    this.update();
  };

  onToggleTask = (index) => {
    this.state.tasks[index].done = !this.state.tasks[index].done;
    this.update();
  };

  onDeleteTask = (index) => {
    this.state.tasks.splice(index, 1);
    this.update();
  };

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement(
          "input",
          {
            id: "new-todo",
            type: "text",
            placeholder: "Задание",
            value: this.state.newTask,
          },
          null,
          { input: this.onAddInputChange },
        ),
        createElement("button", { id: "add-btn" }, "+", {
          click: this.onAddTask,
        }),
      ]),
      createElement(
        "ul",
        { id: "todos" },
        this.state.tasks.map((task, index) => {
          const checkboxAttrs = { type: "checkbox" };
          if (task.done) checkboxAttrs.checked = "checked";
          const labelAttrs = task.done ? { style: "color: gray;" } : {};
          return createElement("li", {}, [
            createElement("input", checkboxAttrs, null, {
              change: () => this.onToggleTask(index),
            }),
            createElement("label", labelAttrs, task.title),
            createElement("button", {}, "🗑️", {
              click: () => this.onDeleteTask(index),
            }),
          ]);
        }),
      ),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
