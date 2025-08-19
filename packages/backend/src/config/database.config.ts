export const databaseConfig = () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'maxiphy',

  logging: process.env.NODE_ENV === 'development',

  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false,
  } : undefined,
});