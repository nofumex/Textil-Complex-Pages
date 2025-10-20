module.exports = {
  apps: [
    {
      name: 'textil-kompleks',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        'public/uploads',
      ],
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Health check
      health_check_url: 'http://localhost:3000/api/health',
      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Log rotation
      log_type: 'json',
      merge_logs: true,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/textil-kompleks.git',
      path: '/var/www/textil-kompleks',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && npm run db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install pm2 -g',
    },
  },
};


