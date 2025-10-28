import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_USE_MOCK_AUTH: z.string().transform(val => val === 'true').optional(),
  VITE_USE_MOCK_DATA: z.string().transform(val => val === 'true').optional(), // Nova variável
  DEV: z.boolean(),
  PROD: z.boolean(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;