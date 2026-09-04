import { validateEnv, env } from './config/env';
import { testConnection } from './config/database';
import app from './app';

async function start() {
  validateEnv();
  await testConnection();

  app.listen(env.PORT, () => {
    console.log(`MediCare API running on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
