require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const db = require("./db");

const SQLiteStore = require("connect-sqlite3")(session);

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.db", dir: "." }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

/* Routes */
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const subtaskRoutes = require('./routes/subtasks');
app.use('/api/subtasks', subtaskRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "TasksU server is running" });
});

/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
