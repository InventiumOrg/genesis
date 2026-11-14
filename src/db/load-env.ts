/**
 * Environment for scripts run outside Next.
 *
 * Next loads `.env.local` itself; `tsx` does not. Importing this module before
 * anything that reads `process.env` guarantees the order, because ES modules
 * evaluate their imports in source order.
 */
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });
