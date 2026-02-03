import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Ініціалізація клієнта Drizzle ORM.
 * Використовує рядок підключення з перемінних оточення.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Створюємо клієнт для запитів (query client)
const queryClient = postgres(connectionString);

// Створюємо екземпляр Drizzle з нашою схемою
export const db = drizzle(queryClient, { schema });