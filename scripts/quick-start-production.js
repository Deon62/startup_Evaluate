#!/usr/bin/env node

/**
 * Quick Start Production Script
 * Automated setup for production deployment
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 ${description}...`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`⚠️  Warning: ${stderr}`);
            }
            console.log(`✅ ${description} completed`);
            resolve(stdout);
        });
    });
}

async function quickStartProduction() {
    console.log('🚀 Evalio Production Quick Start\n');
    console.log('This script will set up your Evalio platform for production.\n');

    try {
        // Check if .env exists
        if (!fs.existsSync('.env')) {
            console.log('⚠️  .env file not found. Please create it from env.example first.');
            const createEnv = await askQuestion('Do you want to copy env.example to .env now? (y/N): ');
            if (createEnv.toLowerCase() === 'y' || createEnv.toLowerCase() === 'yes') {
                await runCommand('cp env.example .env', 'Copying environment template');
                console.log('📝 Please edit .env file with your production values before continuing.');
                const continueSetup = await askQuestion('Have you configured your .env file? (y/N): ');
                if (continueSetup.toLowerCase() !== 'y' && continueSetup.toLowerCase() !== 'yes') {
                    console.log('❌ Please configure your .env file and run this script again.');
                    rl.close();
                    return;
                }
            } else {
                console.log('❌ .env file is required for production setup.');
                rl.close();
                return;
            }
        }

        // Install dependencies
        await runCommand('npm run install:all', 'Installing all dependencies');

        // Setup production database
        await runCommand('npm run setup:production', 'Setting up production database');

        // Build frontend
        await runCommand('npm run build:prod', 'Building frontend for production');

        // Create logs directory
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs', { recursive: true });
            console.log('📁 Created logs directory');
        }

        // Create backups directory
        if (!fs.existsSync('backups')) {
            fs.mkdirSync('backups', { recursive: true });
            console.log('📁 Created backups directory');
        }

        // Check if PM2 is installed
        try {
            await runCommand('pm2 --version', 'Checking PM2 installation');
        } catch (error) {
            console.log('📦 Installing PM2...');
            await runCommand('npm install -g pm2', 'Installing PM2 globally');
        }

        // Ask about admin user creation
        const createAdmin = await askQuestion('Do you want to create an admin user now? (y/N): ');
        if (createAdmin.toLowerCase() === 'y' || createAdmin.toLowerCase() === 'yes') {
            await runCommand('npm run create:admin', 'Creating admin user');
        }

        // Start production server
        console.log('\n🚀 Starting production server...');
        await runCommand('npm run start:production', 'Starting production server with PM2');

        // Wait a moment for server to start
        console.log('⏳ Waiting for server to start...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Health check
        try {
            await runCommand('npm run health:check', 'Performing health check');
        } catch (error) {
            console.log('⚠️  Health check failed, but server might still be starting...');
        }

        console.log('\n🎉 Production setup completed successfully!\n');
        console.log('📋 Next Steps:');
        console.log('   1. Configure your domain and SSL certificate');
        console.log('   2. Set up Nginx reverse proxy (see PRODUCTION_DEPLOYMENT_GUIDE.md)');
        console.log('   3. Configure your DNS to point to this server');
        console.log('   4. Test your application at http://localhost:3001');
        console.log('\n🔧 Useful Commands:');
        console.log('   - View logs: npm run logs:production');
        console.log('   - Monitor: npm run monitor:production');
        console.log('   - Restart: npm run restart:production');
        console.log('   - Stop: npm run stop:production');
        console.log('   - Backup: npm run backup:db');
        console.log('\n📚 Documentation:');
        console.log('   - Production Guide: PRODUCTION_DEPLOYMENT_GUIDE.md');
        console.log('   - Admin Panel: http://localhost:3001/admin-login.html');

    } catch (error) {
        console.error('❌ Production setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check that all dependencies are installed');
        console.log('   2. Verify your .env configuration');
        console.log('   3. Ensure you have the required permissions');
        console.log('   4. Check the logs for detailed error messages');
    } finally {
        rl.close();
    }
}

// Run the script
if (require.main === module) {
    quickStartProduction();
}

module.exports = { quickStartProduction };
