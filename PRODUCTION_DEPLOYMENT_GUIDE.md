# 🚀 Evalio - Production Deployment Guide

## 📋 Overview
This guide will help you deploy the Evalio startup evaluation platform to production. The application consists of a Node.js backend API and a React frontend.

## 🏗️ Architecture
- **Backend**: Node.js + Express + MySQL
- **Frontend**: React SPA with static files
- **Database**: MySQL for production
- **Authentication**: JWT-based with bcrypt password hashing

## 📦 Prerequisites
- Node.js 18+ and npm
- Git
- MySQL 8.0+ (for production database)
- PM2 (for process management)
- Nginx (for reverse proxy and static file serving)

## 🔧 Installation Steps

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-github-repo-url>
cd yc

# Install dependencies
npm install
cd backend && npm install
cd ../ui && npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
# Copy the template
cp .env.example .env
```

Edit `.env` with your production values:
```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=evalio_production
DB_USER=evalio_user
DB_PASSWORD=your_secure_password
DB_CHARSET=utf8mb4
DB_TIMEZONE=+00:00

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# AI API Keys (provided separately)
DEEPSEEK_API_KEY=your_deepseek_api_key
TAVILY_API_KEY=your_tavily_api_key

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. MySQL Setup
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE evalio_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'evalio_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON evalio_production.* TO 'evalio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Run the production database setup
npm run setup:production
```

### 4. Create Admin User
```bash
# Create the first admin user
npm run create:admin
```

### 5. Build Frontend
```bash
# Build the React frontend for production
cd ui
npm run build
cd ..
```

### 6. Start Production Server
```bash
# Start with PM2
npm run start:production
```

## 🔐 Admin User Creation

### Automatic Creation (Recommended)
```bash
npm run create:admin
```
This will prompt you for admin credentials and create the first admin user.

### Manual Creation
If you need to create an admin user manually:
```bash
node scripts/create-admin.js
```

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/evalio`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (React build files)
    location / {
        root /path/to/your/project/ui/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Admin panel
    location /admin {
        root /path/to/your/project/ui/public;
        try_files $uri $uri/ /admin-login.html;
    }
}
```

## 🔒 SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Process Management (PM2)

### PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'evalio-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### PM2 Commands
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# Restart
pm2 restart evalio-backend

# Stop
pm2 stop evalio-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔍 Monitoring and Logs

### Log Files
- Application logs: `./logs/`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `pm2 logs`

### Health Check
```bash
# Check if the API is responding
curl https://yourdomain.com/api/health

# Check admin panel
curl https://yourdomain.com/admin-login.html
```

## 🛠️ Maintenance

### Database Backup
```bash
# MySQL backup
mysqldump -u evalio_user -p evalio_production > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Or use the automated backup script
npm run backup:db
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install
cd backend && npm install
cd ../ui && npm install

# Rebuild frontend
cd ui && npm run build

# Restart services
pm2 restart evalio-backend
sudo systemctl reload nginx
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3001 already in use**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Database connection issues**
   - Check database credentials in `.env`
   - Ensure MySQL is running: `sudo systemctl status mysql`
   - Verify database exists: `mysql -u evalio_user -p -e "USE evalio_production; SHOW TABLES;"`

3. **Frontend not loading**
   - Check if `ui/build` directory exists
   - Verify Nginx configuration
   - Check browser console for errors

4. **API not responding**
   - Check PM2 status: `pm2 status`
   - Check logs: `pm2 logs evalio-backend`
   - Verify backend is running on port 3001

### Log Locations
- Backend logs: `./logs/`
- Nginx logs: `/var/log/nginx/error.log`
- PM2 logs: `pm2 logs`

## 📞 Support
For technical support, contact the development team with:
- Error logs
- System specifications
- Steps to reproduce issues

## 🔐 Security Checklist
- [ ] SSL certificate installed and working
- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] API keys properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Admin password changed from default
- [ ] Regular backups scheduled
- [ ] Firewall configured
- [ ] Updates scheduled

---

**Note**: Replace `yourdomain.com` with your actual domain name throughout this guide.
