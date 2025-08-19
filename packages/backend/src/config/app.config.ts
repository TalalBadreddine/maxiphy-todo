export const appConfig = () => {
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    port: parseInt(process.env.PORT, 10) || 3001,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

    logLevel: process.env.LOG_LEVEL || 'info',
    logDirectory: process.env.LOG_DIRECTORY || './logs',

    useDocker: process.env.USE_DOCKER === 'true',
  };
};