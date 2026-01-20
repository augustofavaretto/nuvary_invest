import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import db from '../database/index.js';
import { config } from '../config/index.js';

// Configurações JWT
const JWT_SECRET = config.jwtSecret || 'nuvary-invest-secret-key-change-in-production';
const JWT_REFRESH_SECRET = config.jwtRefreshSecret || 'nuvary-invest-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

class AuthService {
  // === REGISTRO ===

  async register({ nome, email, senha, aceiteTermos }) {
    // Verifica se email já existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

    // Cria o usuário
    const userId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, nome, email, senha, aceite_termos, data_aceite_termos, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, nome, email.toLowerCase(), hashedPassword, aceiteTermos ? 1 : 0, now, now, now);

    return {
      id: userId,
      nome,
      email: email.toLowerCase(),
      aceiteTermos,
    };
  }

  // === LOGIN ===

  async login({ email, senha }) {
    // Busca usuário
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    // Verifica senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      throw new Error('Email ou senha incorretos');
    }

    // Gera tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    };
  }

  // === LOGOUT ===

  async logout(userId, refreshToken) {
    if (refreshToken) {
      // Revoga o refresh token
      db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND token = ?').run(userId, refreshToken);
    }
    return true;
  }

  // === REFRESH TOKEN ===

  async refreshAccessToken(refreshToken) {
    // Verifica se o token existe e é válido
    const tokenRecord = db.prepare(`
      SELECT rt.*, u.nome, u.email
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = ? AND rt.revoked = 0
    `).get(refreshToken);

    if (!tokenRecord) {
      throw new Error('Refresh token inválido');
    }

    // Verifica se expirou
    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new Error('Refresh token expirado');
    }

    // Gera novo access token
    const accessToken = this.generateAccessToken({
      id: tokenRecord.user_id,
      nome: tokenRecord.nome,
      email: tokenRecord.email,
    });

    return { accessToken };
  }

  // === RECUPERAÇÃO DE SENHA ===

  async forgotPassword(email) {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());

    // Sempre retorna sucesso para não revelar se email existe
    if (!user) {
      return true;
    }

    // Gera token de recuperação
    const token = crypto.randomBytes(32).toString('hex');
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

    // Invalida tokens anteriores
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

    // Salva novo token
    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, user.id, token, expiresAt);

    // TODO: Enviar email com o token
    // Por enquanto, retorna o token para testes
    console.log(`🔑 Token de recuperação para ${email}: ${token}`);

    return { token }; // Em produção, não retornar o token
  }

  async resetPassword({ token, novaSenha }) {
    // Busca token válido
    const tokenRecord = db.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token);

    if (!tokenRecord) {
      throw new Error('Token inválido ou expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, SALT_ROUNDS);

    // Atualiza senha
    db.prepare('UPDATE users SET senha = ?, updated_at = ? WHERE id = ?')
      .run(hashedPassword, new Date().toISOString(), tokenRecord.user_id);

    // Marca token como usado
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);

    // Revoga todos os refresh tokens do usuário
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(tokenRecord.user_id);

    return true;
  }

  // === HELPERS ===

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        nome: user.nome,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  async generateRefreshToken(user) {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias

    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, user.id, token, expiresAt);

    return token;
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // === PERFIL DO USUÁRIO ===

  async getUserById(userId) {
    const user = db.prepare('SELECT id, nome, email, email_verificado, created_at FROM users WHERE id = ?').get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }

  async updateUser(userId, { nome }) {
    db.prepare('UPDATE users SET nome = ?, updated_at = ? WHERE id = ?')
      .run(nome, new Date().toISOString(), userId);
    return this.getUserById(userId);
  }

  async deleteUser(userId) {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return true;
  }

  // === PERFIL DE INVESTIDOR ===

  async saveInvestorProfile(userId, profileData) {
    const {
      type,
      name,
      score,
      recommendedAllocation,
      answers,
    } = profileData;

    const profileId = uuidv4();
    const now = new Date().toISOString();

    // Verifica se já existe perfil
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId);

    if (existing) {
      // Atualiza
      db.prepare(`
        UPDATE user_profiles SET
          profile_type = ?,
          profile_name = ?,
          score = ?,
          renda_fixa = ?,
          renda_variavel = ?,
          fundos_imobiliarios = ?,
          internacional = ?,
          answers = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(
        type,
        name,
        score,
        recommendedAllocation.rendaFixa,
        recommendedAllocation.rendaVariavel,
        recommendedAllocation.fundosImobiliarios,
        recommendedAllocation.internacional,
        JSON.stringify(answers),
        now,
        userId
      );
    } else {
      // Insere
      db.prepare(`
        INSERT INTO user_profiles (
          id, user_id, profile_type, profile_name, score,
          renda_fixa, renda_variavel, fundos_imobiliarios, internacional,
          answers, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        userId,
        type,
        name,
        score,
        recommendedAllocation.rendaFixa,
        recommendedAllocation.rendaVariavel,
        recommendedAllocation.fundosImobiliarios,
        recommendedAllocation.internacional,
        JSON.stringify(answers),
        now,
        now
      );
    }

    return this.getInvestorProfile(userId);
  }

  async getInvestorProfile(userId) {
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
    if (!profile) return null;

    return {
      type: profile.profile_type,
      name: profile.profile_name,
      score: profile.score,
      recommendedAllocation: {
        rendaFixa: profile.renda_fixa,
        rendaVariavel: profile.renda_variavel,
        fundosImobiliarios: profile.fundos_imobiliarios,
        internacional: profile.internacional,
      },
      answers: profile.answers ? JSON.parse(profile.answers) : null,
    };
  }

  // === HISTÓRICO DE CHAT ===

  async saveChatMessage(userId, role, content) {
    const messageId = uuidv4();
    db.prepare(`
      INSERT INTO chat_history (id, user_id, role, content)
      VALUES (?, ?, ?, ?)
    `).run(messageId, userId, role, content);
    return messageId;
  }

  async getChatHistory(userId, limit = 50) {
    return db.prepare(`
      SELECT role, content, created_at
      FROM chat_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit).reverse();
  }

  async clearChatHistory(userId) {
    db.prepare('DELETE FROM chat_history WHERE user_id = ?').run(userId);
    return true;
  }
}

export const authService = new AuthService();
