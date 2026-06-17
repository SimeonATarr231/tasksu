const express = require("express");
const router = express.Router();
const db = require("../db");

// Import our auth middleware
// Every task route will use this as a gatekeeper
const requireAuth = require("../middleware/auth");

// CREATE TASK
// POST /api/tasks
router.post("/", requireAuth, (req, res) => {
  const { title, description, priority, due_date, category } = req.body;

  // Validate - title is the only required field
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Priority must be one of these three values
  const validPriorities = ["low", "medium", "high"];
  const taskPriority = validPriorities.includes(priority) ? priority : "medium";

  try {
    const result = db
      .prepare(
        `
    INSERT INTO tasks (user_id, title, description, priority, due_date, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
      )
      .run(
        req.user.id,
        title,
        description || null,
        taskPriority,
        due_date || null,
        category || null,
      );

    // Fetch the newly created task to return it
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Server error creating task" });
  }
});

// GET ALL TASKS
// GET /api/tasks
router.get("/", requireAuth, (req, res) => {
  try {
    // Only fetch tasks belonging to the logged in user
    // req.user.id was set by our requireAuth middleware
    const tasks = db
      .prepare(
        `
      SELECT * FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      )
      .all(req.user.id);

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Server error fetching tasks" });
  }
});

// UPDATE TASK
// PUT /api/tasks/:id
router.put("/:id", requireAuth, (req, res) => {
  const { title, description, priority, completed, due_date, category } =
    req.body;
  const taskId = req.params.id;

  try {
    // First check the task exists AND belongs to this user
    // A user should never be able to edit someone else's task
    const task = db
      .prepare(
        `
      SELECT * FROM tasks WHERE id = ? AND user_id = ?
    `,
      )
      .get(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Use existing values as fallback if not provided
    db.prepare(
      `
    UPDATE tasks
    SET title = ?,
        description = ?,
        priority = ?,
        completed = ?,
        due_date = ?,
        category = ?
    WHERE id = ? AND user_id = ?
  `,
    ).run(
      title ?? task.title,
      description ?? task.description,
      priority ?? task.priority,
      completed !== undefined ? (completed ? 1 : 0) : task.completed,
      due_date !== undefined ? due_date || null : task.due_date,
      category !== undefined ? category || null : task.category,
      taskId,
      req.user.id,
    );

    // Fetch and return the updated task
    const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
    res.json({ message: "Task updated", task: updated });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Server error updating task" });
  }
});

// DELETE TASK
// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, (req, res) => {
  const taskId = req.params.id;

  try {
    // Check task exists and belongs to this user before deleting
    const task = db
      .prepare(
        `
      SELECT * FROM tasks WHERE id = ? AND user_id = ?
    `,
      )
      .get(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(
      taskId,
      req.user.id,
    );

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Server error deleting task" });
  }
});

module.exports = router;
