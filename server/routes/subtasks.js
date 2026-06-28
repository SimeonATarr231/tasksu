const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

// GET subtasks for a task
// GET /api/subtasks/:taskId
router.get('/:taskId', requireAuth, (req, res) => {
    try {
        const subtasks = db.prepare(`
            SELECT * FROM subtasks
            WHERE task_id = ? AND user_id = ?
            ORDER BY created_at ASC
        `).all(req.params.taskId, req.user.id);

        res.json({ subtasks });
    } catch (error) {
        console.error('Get subtasks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE subtask
// POST /api/subtasks/:taskId
router.post('/:taskId', requireAuth, (req, res) => {
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // Verify parent task belongs to this user
        const task = db.prepare(`
            SELECT id FROM tasks WHERE id = ? AND user_id = ?
        `).get(req.params.taskId, req.user.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const result = db.prepare(`
            INSERT INTO subtasks (task_id, user_id, title)
            VALUES (?, ?, ?)
        `).run(req.params.taskId, req.user.id, title.trim());

        const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?')
            .get(result.lastInsertRowid);

        res.status(201).json({ subtask });
    } catch (error) {
        console.error('Create subtask error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// TOGGLE subtask complete
// PUT /api/subtasks/:id
router.put('/:id', requireAuth, (req, res) => {
    try {
        const subtask = db.prepare(`
            SELECT * FROM subtasks WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.user.id);

        if (!subtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const newCompleted = subtask.completed === 1 ? 0 : 1;

        db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?')
            .run(newCompleted, req.params.id);

        const updated = db.prepare('SELECT * FROM subtasks WHERE id = ?')
            .get(req.params.id);

        res.json({ subtask: updated });
    } catch (error) {
        console.error('Toggle subtask error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE subtask
// DELETE /api/subtasks/:id
router.delete('/:id', requireAuth, (req, res) => {
    try {
        const subtask = db.prepare(`
            SELECT * FROM subtasks WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.user.id);

        if (!subtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        db.prepare('DELETE FROM subtasks WHERE id = ?').run(req.params.id);

        res.json({ message: 'Subtask deleted' });
    } catch (error) {
        console.error('Delete subtask error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;