import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';


// Load .env from server dir or root dir
const serverEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const defaultDbPath = path.resolve(__dirname, '../../../database/prisma/dev.db').replace(/\\/g, '/');

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_ecommerce_2026_antigravity',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'cookie_secret_key_ecommerce_2026',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_dev',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder_key_for_dev',
  databaseUrl: process.env.DATABASE_URL || `file:${defaultDbPath}`,
};
