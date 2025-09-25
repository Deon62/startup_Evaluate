#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Sets up the database schema and initial data for production
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', 'backend', 'database', 'startup_evaluation.db');
const schemaPath = path.join(__dirname, '..', 'backend', 'database', 'schema.sql');

async function setupProductionDatabase() {
    console.log('🗄️  Setting up Production Database...\n');

    try {
        // Check if schema file exists
        if (!fs.existsSync(schemaPath)) {
            throw new Error('Schema file not found. Please ensure schema.sql exists.');
        }

        // Read schema file
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Create database directory if it doesn't exist
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('📁 Created database directory');
        }

        // Connect to database
        console.log('🔌 Connecting to database...');
        const db = new sqlite3.Database(dbPath);

        // Execute schema
        console.log('📋 Creating database schema...');
        await new Promise((resolve, reject) => {
            db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Create indexes for better performance
        console.log('⚡ Creating performance indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type)',
            'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(token_hash)',
            'CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)'
        ];

        for (const index of indexes) {
            await new Promise((resolve, reject) => {
                db.run(index, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Insert initial analytics data (last 30 days)
        console.log('📊 Creating initial analytics data...');
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT OR IGNORE INTO analytics (date, daily_users, daily_evaluations, daily_registrations, revenue, premium_signups)
                    VALUES (?, 0, 0, 0, 0.00, 0)
                `, [dateStr], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Verify tables were created
        console.log('✅ Verifying database setup...');
        const tables = await new Promise((resolve, reject) => {
            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.name));
                }
            });
        });

        const expectedTables = ['users', 'projects', 'analytics', 'user_sessions', 'admin_users'];
        const missingTables = expectedTables.filter(table => !tables.includes(table));

        if (missingTables.length > 0) {
            throw new Error(`Missing tables: ${missingTables.join(', ')}`);
        }

        // Get database statistics
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as user_count,
                    (SELECT COUNT(*) FROM projects) as project_count,
                    (SELECT COUNT(*) FROM admin_users) as admin_count,
                    (SELECT COUNT(*) FROM analytics) as analytics_count
            `, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        console.log('\n📈 Database Statistics:');
        console.log(`   Users: ${stats.user_count}`);
        console.log(`   Projects: ${stats.project_count}`);
        console.log(`   Admin Users: ${stats.admin_count}`);
        console.log(`   Analytics Records: ${stats.analytics_count}`);

        db.close();

        console.log('\n✅ Production database setup completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Create an admin user: npm run create:admin');
        console.log('   2. Configure your environment variables in .env');
        console.log('   3. Start the production server: npm run start:production');

    } catch (error) {
        console.error('❌ Error setting up production database:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
