#!/usr/bin/env node

/**
 * MySQL Database Setup Script
 * Sets up the MySQL database schema and initial data for production
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const schemaPath = path.join(__dirname, '..', 'backend', 'database', 'schema-mysql.sql');

async function setupMySQLDatabase() {
    console.log('🗄️  Setting up MySQL Database...\n');

    try {
        // Check if schema file exists
        if (!fs.existsSync(schemaPath)) {
            throw new Error('MySQL schema file not found. Please ensure schema-mysql.sql exists.');
        }

        // Read schema file
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Database configuration
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            charset: process.env.DB_CHARSET || 'utf8mb4',
            timezone: process.env.DB_TIMEZONE || '+00:00'
        };

        const dbName = process.env.DB_NAME || 'evalio_production';

        console.log('🔌 Connecting to MySQL server...');
        
        // First connect without database to create it
        const connection = await mysql.createConnection(dbConfig);

        // Create database if it doesn't exist
        console.log(`📋 Creating database '${dbName}'...`);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.execute(`USE \`${dbName}\``);

        // Execute schema
        console.log('📋 Creating database schema...');
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement.trim());
                } catch (error) {
                    // Ignore "table already exists" errors
                    if (!error.message.includes('already exists')) {
                        console.warn(`⚠️  Warning executing statement: ${error.message}`);
                    }
                }
            }
        }

        // Verify tables were created
        console.log('✅ Verifying database setup...');
        const [tables] = await connection.execute("SHOW TABLES");
        const tableNames = tables.map(row => Object.values(row)[0]);

        const expectedTables = ['users', 'projects', 'analytics', 'user_sessions', 'admin_users'];
        const missingTables = expectedTables.filter(table => !tableNames.includes(table));

        if (missingTables.length > 0) {
            throw new Error(`Missing tables: ${missingTables.join(', ')}`);
        }

        // Get database statistics
        const [stats] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users) as user_count,
                (SELECT COUNT(*) FROM projects) as project_count,
                (SELECT COUNT(*) FROM admin_users) as admin_count,
                (SELECT COUNT(*) FROM analytics) as analytics_count
        `);

        console.log('\n📈 Database Statistics:');
        console.log(`   Users: ${stats[0].user_count}`);
        console.log(`   Projects: ${stats[0].project_count}`);
        console.log(`   Admin Users: ${stats[0].admin_count}`);
        console.log(`   Analytics Records: ${stats[0].analytics_count}`);

        // Test database connection with the configured database
        console.log('\n🔍 Testing database connection...');
        const testConnection = await mysql.createConnection({
            ...dbConfig,
            database: dbName
        });

        const [testResult] = await testConnection.execute('SELECT 1 as test');
        if (testResult[0].test === 1) {
            console.log('✅ Database connection test successful');
        }

        await connection.end();
        await testConnection.end();

        console.log('\n✅ MySQL database setup completed successfully!');
        console.log('\n📋 Database Configuration:');
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Port: ${dbConfig.port}`);
        console.log(`   Database: ${dbName}`);
        console.log(`   User: ${dbConfig.user}`);
        console.log(`   Charset: ${dbConfig.charset}`);
        
        console.log('\n📋 Next Steps:');
        console.log('   1. Create an admin user: npm run create:admin');
        console.log('   2. Start the production server: npm run start:production');

    } catch (error) {
        console.error('❌ Error setting up MySQL database:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Ensure MySQL server is running');
            console.log('   2. Check your database credentials in .env');
            console.log('   3. Verify MySQL server is accessible');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check your database username and password');
            console.log('   2. Ensure the user has CREATE DATABASE privileges');
            console.log('   3. Verify the user can connect to MySQL');
        }
        
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    setupMySQLDatabase();
}

module.exports = { setupMySQLDatabase };
