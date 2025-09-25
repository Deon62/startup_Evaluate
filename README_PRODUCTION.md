# 🚀 Evalio - Production Deployment

## 📋 Quick Start for Hosting Partner

This repository contains the complete Evalio startup evaluation platform. Follow these steps to deploy it to production.

## 🏗️ System Requirements

- **Node.js**: 18+ 
- **npm**: Latest version
- **MySQL**: 8.0+ for database
- **PM2**: For process management
- **Nginx**: For reverse proxy and static files
- **SSL Certificate**: Let's Encrypt recommended
- **Domain**: Your production domain

## ⚡ Quick Deployment

### 1. Clone and Setup
```bash
git clone <repository-url>
cd yc
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your production values
nano .env
```

**Required Environment Variables:**
- `DEEPSEEK_API_KEY` - Provided separately
- `TAVILY_API_KEY` - Provided separately  
- `JWT_SECRET` - Generate a secure random string
- `DB_PASSWORD` - MySQL database password
- `ADMIN_EMAIL` - Your admin email
- `ADMIN_PASSWORD` - Secure admin password

### 3. MySQL Setup
```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

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

### 4. Automated Setup
```bash
# Run the automated production setup
node scripts/quick-start-production.js
```

This script will:
- ✅ Install all dependencies
- ✅ Setup production database
- ✅ Build frontend
- ✅ Create admin user
- ✅ Start production server

### 5. Manual Setup (Alternative)
```bash
# Setup database
npm run setup:production

# Create admin user
npm run create:admin

# Build frontend
npm run build:prod

# Start server
npm run start:production
```

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/evalio`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /path/to/yc/ui/build;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin Panel
    location /admin {
        root /path/to/yc/ui/public;
        try_files $uri $uri/ /admin-login.html;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/evalio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring

### PM2 Commands
```bash
# View logs
npm run logs:production

# Monitor
npm run monitor:production

# Restart
npm run restart:production

# Stop
npm run stop:production
```

### Health Check
```bash
# Check API health
curl https://yourdomain.com/api/health

# Check admin panel
curl https://yourdomain.com/admin-login.html
```

## 🔧 Maintenance

### Database Backup
```bash
# Create backup
npm run backup:db

# Backups are stored in ./backups/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm run install:all

# Rebuild frontend
npm run build:prod

# Restart services
npm run restart:production
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3001 in use**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Database errors**
   - Check MySQL is running: `sudo systemctl status mysql`
   - Verify database credentials in .env
   - Test connection: `mysql -u evalio_user -p evalio_production`
   - Run database setup again

3. **Frontend not loading**
   - Check if ui/build directory exists
   - Verify Nginx configuration
   - Check browser console

4. **API not responding**
   - Check PM2 status: `pm2 status`
   - Check logs: `pm2 logs evalio-backend`
   - Verify backend is running

### Log Locations
- Application: `./logs/`
- Nginx: `/var/log/nginx/`
- PM2: `pm2 logs`

## 📞 Support

For technical support:
1. Check the logs first
2. Review this documentation
3. Contact the development team with:
   - Error messages
   - Log files
   - System specifications

## 🔐 Security Checklist

- [ ] SSL certificate installed
- [ ] Strong JWT secret configured
- [ ] API keys properly set
- [ ] Admin password changed
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] Updates scheduled

## 📚 Documentation

- **Full Deployment Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **API Keys Setup**: `API_KEYS_SETUP.md`
- **Environment Template**: `env.example`

---

**🎯 Goal**: Get the platform running at `https://yourdomain.com` with admin access at `https://yourdomain.com/admin-login.html`
