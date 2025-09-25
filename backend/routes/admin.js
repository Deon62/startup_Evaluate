const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const Database = require('../database/init');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();
const authMiddleware = new AuthMiddleware();

// Initialize auth middleware
authMiddleware.init();

// Admin login validation
const adminLoginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Admin login
router.post('/login', adminLoginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Get admin from database
        const db = authMiddleware.db.getDB();
        const getAdmin = new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM admin_users WHERE email = ? AND is_active = 1';
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        const admin = await getAdmin;
        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, admin.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        const updateLogin = new Promise((resolve, reject) => {
            const sql = 'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(sql, [admin.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await updateLogin;

        // Generate JWT token
        const token = authMiddleware.generateToken(admin.id, admin.email);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Admin login failed'
        });
    }
});

// Get admin profile
router.get('/profile', authMiddleware.adminAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                admin: req.admin
            }
        });
    } catch (error) {
        console.error('Admin profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get admin profile'
        });
    }
});

// Get dashboard analytics
router.get('/dashboard', authMiddleware.adminAuth, async (req, res) => {
    try {
        const db = authMiddleware.db.getDB();
        
        // Get today's analytics
        const today = new Date().toISOString().split('T')[0];
        const getTodayAnalytics = new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM analytics WHERE date = ?';
            db.get(sql, [today], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        // Get total users
        const getTotalUsers = new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM users WHERE is_active = 1';
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        // Get total projects
        const getTotalProjects = new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM projects';
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        // Get premium users
        const getPremiumUsers = new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM users WHERE subscription_type = "premium" AND is_active = 1';
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        // Get recent users (last 7 days)
        const getRecentUsers = new Promise((resolve, reject) => {
            const sql = `
                SELECT COUNT(*) as count 
                FROM users 
                WHERE created_at >= date('now', '-7 days') AND is_active = 1
            `;
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        // Get recent projects (last 7 days)
        const getRecentProjects = new Promise((resolve, reject) => {
            const sql = `
                SELECT COUNT(*) as count 
                FROM projects 
                WHERE created_at >= date('now', '-7 days')
            `;
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        // Get weekly analytics (last 7 days)
        const getWeeklyAnalytics = new Promise((resolve, reject) => {
            const sql = `
                SELECT date, daily_users, daily_evaluations, daily_registrations, revenue
                FROM analytics 
                WHERE date >= date('now', '-7 days')
                ORDER BY date DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        const [
            todayAnalytics,
            totalUsers,
            totalProjects,
            premiumUsers,
            recentUsers,
            recentProjects,
            weeklyAnalytics
        ] = await Promise.all([
            getTodayAnalytics,
            getTotalUsers,
            getTotalProjects,
            getPremiumUsers,
            getRecentUsers,
            getRecentProjects,
            getWeeklyAnalytics
        ]);

        res.json({
            success: true,
            data: {
                today: todayAnalytics || {
                    date: today,
                    daily_users: 0,
                    daily_evaluations: 0,
                    daily_registrations: 0,
                    revenue: 0
                },
                totals: {
                    users: totalUsers,
                    projects: totalProjects,
                    premium_users: premiumUsers,
                    recent_users: recentUsers,
                    recent_projects: recentProjects
                },
                weekly: weeklyAnalytics
            }
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard analytics'
        });
    }
});

// Get all users (with pagination)
router.get('/users', authMiddleware.adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const db = authMiddleware.db.getDB();
        
        // Build search condition
        let searchCondition = '';
        let searchParams = [];
        
        if (search) {
            searchCondition = 'WHERE (email LIKE ? OR name LIKE ?)';
            searchParams = [`%${search}%`, `%${search}%`];
        }

        // Get users with pagination
        const getUsers = new Promise((resolve, reject) => {
            const sql = `
                SELECT id, email, name, subscription_type, created_at, last_login, is_active
                FROM users 
                ${searchCondition}
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;
            db.all(sql, [...searchParams, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Get total count
        const getTotalCount = new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM users ${searchCondition}`;
            db.get(sql, searchParams, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });

        const [users, totalCount] = await Promise.all([getUsers, getTotalCount]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

// Update user status (activate/deactivate)
router.put('/users/:id/status', authMiddleware.adminAuth, [
    body('is_active').isBoolean().withMessage('is_active must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.params.id;
        const { is_active } = req.body;

        const db = authMiddleware.db.getDB();
        const updateUser = new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
            db.run(sql, [is_active, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });

        const changes = await updateUser;

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
});

// Update user subscription
router.put('/users/:id/subscription', authMiddleware.adminAuth, [
    body('subscription_type').isIn(['free', 'premium']).withMessage('Invalid subscription type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.params.id;
        const { subscription_type } = req.body;

        const db = authMiddleware.db.getDB();
        const updateSubscription = new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET subscription_type = ? WHERE id = ?';
            db.run(sql, [subscription_type, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });

        const changes = await updateSubscription;

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User subscription updated to ${subscription_type}`
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update subscription'
        });
    }
});

// Delete user
router.delete('/users/:id', authMiddleware.adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;

        const db = authMiddleware.db.getDB();
        const deleteUser = new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            db.run(sql, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });

        const changes = await deleteUser;

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

module.exports = router;
