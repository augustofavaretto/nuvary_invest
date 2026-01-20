import { authService } from '../services/auth.js';

// Validações
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula e 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const authController = {
  // === REGISTRO ===
  async register(req, res, next) {
    try {
      const { nome, email, senha, confirmarSenha, aceiteTermos } = req.body;

      // Validações
      const errors = [];

      if (!nome || nome.length < 3) {
        errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 3 caracteres' });
      }

      if (!email || !validateEmail(email)) {
        errors.push({ field: 'email', message: 'Email inválido' });
      }

      if (!senha || !validatePassword(senha)) {
        errors.push({
          field: 'senha',
          message: 'Senha deve ter mínimo 8 caracteres, incluindo maiúscula, minúscula e número',
        });
      }

      if (senha !== confirmarSenha) {
        errors.push({ field: 'confirmarSenha', message: 'Senhas não conferem' });
      }

      if (!aceiteTermos) {
        errors.push({ field: 'aceiteTermos', message: 'Você deve aceitar os termos de uso' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      const user = await authService.register({ nome, email, senha, aceiteTermos });

      res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso',
        user,
      });
    } catch (error) {
      if (error.message === 'Email já cadastrado') {
        return res.status(409).json({
          success: false,
          errors: [{ field: 'email', message: error.message }],
        });
      }
      next(error);
    }
  },

  // === LOGIN ===
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios',
        });
      }

      const result = await authService.login({ email, senha });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
    }
  },

  // === LOGOUT ===
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user.userId, refreshToken);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  // === REFRESH TOKEN ===
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  },

  // === RECUPERAÇÃO DE SENHA ===
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido',
        });
      }

      await authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, novaSenha, confirmarSenha } = req.body;

      // Validações
      const errors = [];

      if (!token) {
        errors.push({ field: 'token', message: 'Token é obrigatório' });
      }

      if (!novaSenha || !validatePassword(novaSenha)) {
        errors.push({
          field: 'novaSenha',
          message: 'Senha deve ter mínimo 8 caracteres, incluindo maiúscula, minúscula e número',
        });
      }

      if (novaSenha !== confirmarSenha) {
        errors.push({ field: 'confirmarSenha', message: 'Senhas não conferem' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await authService.resetPassword({ token, novaSenha });

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // === PERFIL DO USUÁRIO ===
  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.userId);
      const investorProfile = await authService.getInvestorProfile(req.user.userId);

      res.json({
        success: true,
        user,
        investorProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { nome } = req.body;

      if (!nome || nome.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome deve ter pelo menos 3 caracteres',
        });
      }

      const user = await authService.updateUser(req.user.userId, { nome });

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      await authService.deleteUser(req.user.userId);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  // === PERFIL DE INVESTIDOR ===
  async saveInvestorProfile(req, res, next) {
    try {
      const profileData = req.body;
      const profile = await authService.saveInvestorProfile(req.user.userId, profileData);

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async getInvestorProfile(req, res, next) {
    try {
      const profile = await authService.getInvestorProfile(req.user.userId);

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // === HISTÓRICO DE CHAT ===
  async getChatHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const history = await authService.getChatHistory(req.user.userId, limit);

      res.json({
        success: true,
        history,
      });
    } catch (error) {
      next(error);
    }
  },

  async clearChatHistory(req, res, next) {
    try {
      await authService.clearChatHistory(req.user.userId);

      res.json({
        success: true,
        message: 'Histórico limpo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },
};
