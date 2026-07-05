import { env } from "../env";
/**
 * Configuração da autenticação de JWT
 */
export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: 86400,
  },
};
