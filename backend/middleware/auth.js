const jwt = require('jsonwebtoken');
const Database = require('../database/init');

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthMiddleware {
    constructor() {
        this.db = new Database();
    }

    // Initialize database connection
    async init() {
        await this.db.init();
    }

    // Generate JWT token
    generateToken(userId, email) {
        return jwt.sign(
            { 
                userId, 
                email,
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // Middleware to authenticate requests
    authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Access token required'
                });
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            const decoded = this.verifyToken(token);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }

            // Get user from database to ensure they still exist and are active
            const user = await this.getUserById(decoded.userId);
            
            if (!user || !user.is_active) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found or inactive'
                });
            }

            // Add user info to request object
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                subscription_type: user.subscription_type
            };

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    };

    // Get user by ID
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
            this.db.getDB().get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get user by email
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
            this.db.getDB().get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Optional authentication (doesn't fail if no token)
    optionalAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                req.user = null;
                return next();
            }

            const token = authHeader.substring(7);
            const decoded = this.verifyToken(token);

            if (decoded) {
                const user = await this.getUserById(decoded.userId);
                if (user && user.is_active) {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        subscription_type: user.subscription_type
                    };
                }
            }

            next();
        } catch (error) {
            console.error('Optional auth error:', error);
            req.user = null;
            next();
        }
    };

    // Admin authentication middleware
    adminAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Admin access token required'
                });
            }

            const token = authHeader.substring(7);
            const decoded = this.verifyToken(token);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired admin token'
                });
            }

            // Check if user is admin
            const admin = await this.getAdminById(decoded.userId);
            
            if (!admin || !admin.is_active) {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            req.admin = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            };

            next();
        } catch (error) {
            console.error('Admin authentication error:', error);
            return res.status(500).json({
                success: false,
                error: 'Admin authentication failed'
            });
        }
    };

    // Get admin by ID
    async getAdminById(adminId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM admin_users WHERE id = ? AND is_active = 1';
            this.db.getDB().get(sql, [adminId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = AuthMiddleware;
