import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';


// Find dev.db reliably regardless of cwd or environment
function getDbUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Candidate paths
  const candidates = [
    path.resolve(__dirname, '../../../database/prisma/dev.db'),
    path.resolve(__dirname, '../../database/prisma/dev.db'),
    path.resolve(process.cwd(), 'database/prisma/dev.db'),
    path.resolve(process.cwd(), '../database/prisma/dev.db'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).size > 1000) {
      return `file:${candidate.replace(/\\/g, '/')}`;
    }
  }

  // Default fallback
  const defaultPath = path.resolve(__dirname, '../../../database/prisma/dev.db');
  return `file:${defaultPath.replace(/\\/g, '/')}`;
}

const dbUrl = getDbUrl();

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'test' ? ['error'] : ['warn', 'error'],
});
