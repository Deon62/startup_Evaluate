#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates timestamped backups of the database
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const backupDir = path.join(__dirname, '..', 'backups');

async function backupDatabase() {
    console.log('💾 Creating Database Backup...\n');

    try {
        // Database configuration
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'evalio_production'
        };

        // Create backup directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('📁 Created backup directory');
        }

        // Generate timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                         new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        
        const backupFileName = `evalio_backup_${timestamp}.sql`;
        const backupPath = path.join(backupDir, backupFileName);

        // Create backup using mysqldump
        console.log('🔄 Creating MySQL backup...');
        const mysqldumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > "${backupPath}"`;
        
        await new Promise((resolve, reject) => {
            exec(mysqldumpCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else if (stderr && !stderr.includes('Warning')) {
                    reject(new Error(stderr));
                } else {
                    resolve();
                }
            });
        });

        // Verify backup was created
        if (!fs.existsSync(backupPath)) {
            throw new Error('Backup file was not created successfully.');
        }

        // Get file size
        const stats = fs.statSync(backupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Backup created successfully!');
        console.log(`📄 File: ${backupFileName}`);
        console.log(`📊 Size: ${fileSizeInMB} MB`);
        console.log(`📍 Location: ${backupPath}`);

        // Clean up old backups (keep last 30 days)
        console.log('\n🧹 Cleaning up old backups...');
        const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const files = fs.readdirSync(backupDir);
        let deletedCount = 0;

        for (const file of files) {
            if (file.startsWith('evalio_backup_') && file.endsWith('.sql')) {
                const filePath = path.join(backupDir, file);
                const fileStats = fs.statSync(filePath);
                
                if (fileStats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    console.log(`🗑️  Deleted old backup: ${file}`);
                }
            }
        }

        if (deletedCount > 0) {
            console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
        } else {
            console.log('✅ No old backups to clean up');
        }

        // List current backups
        console.log('\n📋 Current Backups:');
        const currentBackups = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('evalio_backup_') && file.endsWith('.sql'))
            .sort()
            .reverse();

        if (currentBackups.length === 0) {
            console.log('   No backups found');
        } else {
            currentBackups.forEach((file, index) => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                const size = (stats.size / (1024 * 1024)).toFixed(2);
                const date = stats.mtime.toLocaleDateString();
                const time = stats.mtime.toLocaleTimeString();
                console.log(`   ${index + 1}. ${file} (${size} MB) - ${date} ${time}`);
            });
        }

        console.log('\n🎉 Database backup completed successfully!');

    } catch (error) {
        console.error('❌ Error creating database backup:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    backupDatabase();
}

module.exports = { backupDatabase };
