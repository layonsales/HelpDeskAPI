import "dotenv/config.js";
import z from "zod";
/**
 * Validando variavel de ambiente para os valores não serem undefined
 */
const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
