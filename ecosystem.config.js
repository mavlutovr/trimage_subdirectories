module.exports = {
  apps : [
    {
      name: 'trimage',
      script: 'src/index.js',
      autorestart: true,
      restart_delay: 10 * 1000,
      
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_file: '/dev/null',
    }
  ]
};
