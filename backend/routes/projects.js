const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const AuthMiddleware = require('../middleware/auth');

const authMiddleware = new AuthMiddleware();

// Initialize auth middleware
authMiddleware.init().catch(console.error);

const dbPath = path.join(__dirname, '..', 'database', 'startup_evaluation.db');
const db = new sqlite3.Database(dbPath);

// Save a new project evaluation
router.post('/save', authMiddleware.authenticate, async (req, res) => {
    try {
        const { name, description, answers, evaluationData, overallScore } = req.body;
        const userId = req.user.id;

        if (!name || !answers || !evaluationData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: name, answers, evaluationData' 
            });
        }

        const sql = `
            INSERT INTO projects (user_id, name, description, answers, evaluation_data, overall_score)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            name,
            description || '',
            JSON.stringify(answers),
            JSON.stringify(evaluationData),
            overallScore || 0
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error saving project:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to save project' 
                });
            }

            res.json({
                success: true,
                projectId: this.lastID,
                message: 'Project saved successfully'
            });
        });

    } catch (error) {
        console.error('Error in save project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get all projects for the authenticated user
router.get('/my-projects', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT id, name, description, overall_score, created_at, updated_at
            FROM projects 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;

        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching projects:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to fetch projects' 
                });
            }

            const projects = rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                overallScore: row.overall_score,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            res.json({
                success: true,
                projects: projects
            });
        });

    } catch (error) {
        console.error('Error in get projects:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get a specific project by ID
router.get('/:projectId', authMiddleware.authenticate, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const sql = `
            SELECT id, name, description, answers, evaluation_data, overall_score, created_at, updated_at
            FROM projects 
            WHERE id = ? AND user_id = ?
        `;

        db.get(sql, [projectId, userId], (err, row) => {
            if (err) {
                console.error('Error fetching project:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to fetch project' 
                });
            }

            if (!row) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Project not found' 
                });
            }

            const project = {
                id: row.id,
                name: row.name,
                description: row.description,
                answers: JSON.parse(row.answers),
                evaluationData: JSON.parse(row.evaluation_data),
                overallScore: row.overall_score,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };

            res.json({
                success: true,
                project: project
            });
        });

    } catch (error) {
        console.error('Error in get project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Delete a project
router.delete('/:projectId', authMiddleware.authenticate, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const sql = `
            DELETE FROM projects 
            WHERE id = ? AND user_id = ?
        `;

        db.run(sql, [projectId, userId], function(err) {
            if (err) {
                console.error('Error deleting project:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to delete project' 
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Project not found' 
                });
            }

            res.json({
                success: true,
                message: 'Project deleted successfully'
            });
        });

    } catch (error) {
        console.error('Error in delete project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

module.exports = router;
