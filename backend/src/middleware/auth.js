import { authService } from '../services/auth.js';

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário ao request
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
    }

    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Tenta autenticar mas permite acesso mesmo sem token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');

      if (bearer === 'Bearer' && token) {
        const decoded = authService.verifyAccessToken(token);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Token inválido, mas permite continuar sem autenticação
    next();
  }
};
