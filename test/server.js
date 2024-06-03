const express = require("express");
const app = express();
const port = 4000;

const dataBase = {
  todos: [
    { id: 1, title: "Todo 1", completed: false },
    { id: 2, title: "Todo 2", completed: false },
    { id: 3, title: "Todo 3", completed: false },
  ],
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/todos", (req, res) => {
  res.json(dataBase.todos);
});

app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = dataBase.todos.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  res.json(todo);
});

app.post("/todos", (req, res) => {
  const todo = req.body;
  dataBase.todos.push(todo);
  res.status(201).json(todo);
});

app.put("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = dataBase.todos.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  console.log("body", req.body);
  Object.assign(todo, req.body);
  res.json(todo);
});

app.patch("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = dataBase.todos.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  console.log("body", req.body);
  Object.assign(todo, req.body);
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = dataBase.todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Todo not found" });
  }
  dataBase.todos.splice(index, 1);
  res.status(204).json();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
