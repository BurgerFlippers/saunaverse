module.exports = {
  apps: [
    {
      name: 'app',
      script: 'npm',
      args: 'run start',
      interpreter: 'none', // let npm run the Node process
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'worker',
      script: 'npm',
      args: 'run start:worker',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};