import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requisições por minuto
  message: {
    error: 'Muitas requisições',
    message: 'Tente novamente em um minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
