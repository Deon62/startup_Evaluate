const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const Database = require('../database/init');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();
const authMiddleware = new AuthMiddleware();

// Initialize auth middleware
authMiddleware.init();

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
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

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await authMiddleware.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const db = authMiddleware.db.getDB();
        const insertUser = new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (email, password_hash, name, subscription_type)
                VALUES (?, ?, ?, ?)
            `;
            db.run(sql, [email, passwordHash, name, 'free'], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });

        const userId = await insertUser;

        // Generate JWT token
        const token = authMiddleware.generateToken(userId, email);

        // Update analytics
        await updateAnalytics('daily_registrations');

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: userId,
                    email,
                    name,
                    subscription_type: 'free'
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
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

        // Get user from database
        const user = await authMiddleware.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        const db = authMiddleware.db.getDB();
        const updateLogin = new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(sql, [user.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await updateLogin;

        // Generate JWT token
        const token = authMiddleware.generateToken(user.id, user.email);

        // Update analytics
        await updateAnalytics('daily_users');

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subscription_type: user.subscription_type
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Get current user profile
router.get('/profile', authMiddleware.authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

// Update user profile
router.put('/profile', authMiddleware.authenticate, [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required')
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

        const { name, email } = req.body;
        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }

        if (email) {
            // Check if email is already taken by another user
            const existingUser = await authMiddleware.getUserByEmail(email);
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already taken by another user'
                });
            }
            updates.push('email = ?');
            values.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        values.push(req.user.id);

        const db = authMiddleware.db.getDB();
        const updateProfile = new Promise((resolve, reject) => {
            const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            db.run(sql, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await updateProfile;

        // Get updated user data
        const updatedUser = await authMiddleware.getUserById(req.user.id);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    subscription_type: updatedUser.subscription_type
                }
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Profile update failed'
        });
    }
});

// Change password
router.put('/change-password', authMiddleware.authenticate, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password hash
        const db = authMiddleware.db.getDB();
        const getUser = new Promise((resolve, reject) => {
            const sql = 'SELECT password_hash FROM users WHERE id = ?';
            db.get(sql, [req.user.id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        const user = await getUser;

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        const updatePassword = new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
            db.run(sql, [newPasswordHash, req.user.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await updatePassword;

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            error: 'Password change failed'
        });
    }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authMiddleware.authenticate, async (req, res) => {
    try {
        // In a more sophisticated system, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

// Helper function to update analytics
async function updateAnalytics(metric) {
    try {
        const db = authMiddleware.db.getDB();
        const today = new Date().toISOString().split('T')[0];
        
        const updateAnalytics = new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO analytics (date, ${metric})
                VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET
                    ${metric} = ${metric} + 1,
                    daily_users = CASE WHEN ? = 'daily_users' THEN daily_users + 1 ELSE daily_users END,
                    daily_evaluations = CASE WHEN ? = 'daily_evaluations' THEN daily_evaluations + 1 ELSE daily_evaluations END,
                    daily_registrations = CASE WHEN ? = 'daily_registrations' THEN daily_registrations + 1 ELSE daily_registrations END
            `;
            db.run(sql, [today, metric, metric, metric], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await updateAnalytics;
    } catch (error) {
        console.error('Analytics update error:', error);
        // Don't fail the request if analytics update fails
    }
}

module.exports = router;
