import db      from '../config/db.js';
import bcrypt  from 'bcrypt';
import jwt     from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ordenha_secret_key';

// ─── Cadastro ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const { nome, email, senha, cpf, telefone, cep, endereco, numero, bairro, cidade, estado } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // Verifica se email já existe
    const [[existing]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const [result] = await db.query(
      `INSERT INTO users (nome, email, senha, cpf, telefone, cep, endereco, numero, bairro, cidade, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, hash, cpf || null, telefone || null, cep || null,
       endereco || null, numero || null, bairro || null, cidade || null, estado || null]
    );

    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: result.insertId, nome, email, estado },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id:       user.id,
        nome:     user.nome,
        email:    user.email,
        estado:   user.estado,
        endereco: user.endereco,
        cidade:   user.cidade,
        cep:      user.cep,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Perfil (rota protegida) ──────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, nome, email, cpf, telefone, cep, endereco, numero, bairro, cidade, estado FROM users WHERE id = ?',
      [req.userId]
    );
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};