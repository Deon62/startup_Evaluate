const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'startup_evaluation.db');
        this.db = null;
    }

    // Initialize database connection
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    // Run SQL schema
    async runSchema() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Error running schema:', err);
                    reject(err);
                } else {
                    console.log('Database schema created successfully');
                    resolve();
                }
            });
        });
    }

    // Create default admin user
    async createDefaultAdmin() {
        const adminEmail = 'admin@startupeval.com';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR IGNORE INTO admin_users (email, password_hash, name, role)
                VALUES (?, ?, ?, ?)
            `;
            
            this.db.run(sql, [adminEmail, hashedPassword, 'System Admin', 'super_admin'], function(err) {
                if (err) {
                    console.error('Error creating default admin:', err);
                    reject(err);
                } else {
                    console.log('Default admin user created');
                    console.log('Admin Email:', adminEmail);
                    console.log('Admin Password:', adminPassword);
                    resolve();
                }
            });
        });
    }

    // Get database instance
    getDB() {
        return this.db;
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }

    // Test database connection
    async testConnection() {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT 1 as test", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection test successful');
                    resolve(row);
                }
            });
        });
    }
}

// Initialize database if this file is run directly
if (require.main === module) {
    async function initializeDatabase() {
        const db = new Database();
        
        try {
            await db.init();
            await db.testConnection();
            await db.runSchema();
            await db.createDefaultAdmin();
            console.log('\n✅ Database initialization completed successfully!');
            console.log('📁 Database file:', db.dbPath);
            console.log('👤 Default admin created: admin@startupeval.com / admin123');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
        } finally {
            db.close();
        }
    }

    initializeDatabase();
}

module.exports = Database;
