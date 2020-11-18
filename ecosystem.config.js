module.exports = {
  apps : [
    {
      name: 'trimage',
      script: 'src/index.js',
      autorestart: true,
      restart_delay: 10 * 1000,
    }
  ]
};
