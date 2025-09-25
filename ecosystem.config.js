module.exports = {
  apps: [{
    name: 'evalio-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Auto restart on file changes (development only)
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads', 'backups'],
    
    // Environment variables
    env_file: '.env',
    
    // Advanced settings
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Health monitoring
    health_check_grace_period: 3000,
    
    // Source map support
    source_map_support: true,
    
    // Instance variables
    instance_var: 'INSTANCE_ID'
  }],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/your-repo.git',
      path: '/var/www/evalio',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
