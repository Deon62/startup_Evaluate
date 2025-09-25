#!/usr/bin/env node

/**
 * Admin User Creation Script
 * Creates the first admin user for the Evalio platform
 */

const readline = require('readline');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Helper function to ask for password (hidden input)
function askPassword(question) {
    return new Promise((resolve) => {
        process.stdout.write(question);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        let password = '';
        process.stdin.on('data', function(char) {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeAllListeners('data');
                    console.log(''); // New line
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // Backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

async function createAdminUser() {
    console.log('🔐 Evalio Admin User Creation\n');
    console.log('This script will create the first admin user for your Evalio platform.\n');

    try {
        // Database configuration
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'evalio_production',
            charset: process.env.DB_CHARSET || 'utf8mb4',
            timezone: process.env.DB_TIMEZONE || '+00:00'
        };

        // Connect to database
        console.log('🔌 Connecting to MySQL database...');
        const connection = await mysql.createConnection(dbConfig);

        // Check if admin users already exist
        const [existingAdminsResult] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
        const existingAdmins = existingAdminsResult[0].count;

        if (existingAdmins > 0) {
            console.log('⚠️  Admin users already exist in the database.');
            const overwrite = await askQuestion('Do you want to create another admin user? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('Admin user creation cancelled.');
                await connection.end();
                rl.close();
                return;
            }
        }

        // Get admin details
        console.log('\n📝 Please provide admin user details:\n');

        const name = await askQuestion('Admin Name: ');
        if (!name) {
            console.error('❌ Admin name is required.');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        const email = await askQuestion('Admin Email: ');
        if (!email || !email.includes('@')) {
            console.error('❌ Valid email address is required.');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        // Check if email already exists
        const [existingUserResult] = await connection.execute('SELECT id FROM admin_users WHERE email = ?', [email]);
        const existingUser = existingUserResult[0];

        if (existingUser) {
            console.error('❌ An admin user with this email already exists.');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        const password = await askPassword('Admin Password: ');
        if (!password || password.length < 6) {
            console.error('❌ Password must be at least 6 characters long.');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        const confirmPassword = await askPassword('Confirm Password: ');
        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match.');
            await connection.end();
            rl.close();
            process.exit(1);
        }

        // Hash password
        console.log('\n🔒 Hashing password...');
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert admin user
        console.log('💾 Creating admin user...');
        const insertSql = `
            INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at)
            VALUES (?, ?, ?, 'admin', 1, NOW())
        `;

        const [result] = await connection.execute(insertSql, [email, hashedPassword, name]);

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 Admin Details:');
        console.log(`   Name: ${name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);
        console.log(`   Status: active`);
        
        console.log('\n🌐 You can now access the admin panel at:');
        console.log('   https://yourdomain.com/admin-login.html');
        console.log('\n⚠️  Important Security Notes:');
        console.log('   - Change the default admin password after first login');
        console.log('   - Use a strong, unique password');
        console.log('   - Keep admin credentials secure');
        console.log('   - Consider creating additional admin users for team access');

        await connection.end();
        rl.close();

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        rl.close();
        process.exit(1);
    }
}

// Handle script termination
process.on('SIGINT', () => {
    console.log('\n\n❌ Admin user creation cancelled.');
    rl.close();
    process.exit(0);
});

// Run the script
if (require.main === module) {
    createAdminUser();
}

module.exports = { createAdminUser };
