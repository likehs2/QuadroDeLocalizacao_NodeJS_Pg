const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { nome, email, senha, admin } = req.body;
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);
        
        console.log('Senha original:', senha);
        console.log('Hash gerado:', hashedPassword);
        
        // Inserir usuário
        const newUser = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, admin) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, email, hashedPassword, admin || false]
        );
        
        res.status(201).json({
            id: newUser.rows[0].id,
            nome: newUser.rows[0].nome,
            email: newUser.rows[0].email,
            admin: newUser.rows[0].admin
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log('Tentativa de login:', email);
        
        // Verificar se o usuário existe
        const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }
        
        console.log('Senha armazenada:', user.rows[0].senha);
        console.log('Senha fornecida:', senha);
        
        // Verificação temporária para senha em texto plano
        const validPassword = (senha === user.rows[0].senha);
        console.log('Senhas iguais?', validPassword);
        
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { id: user.rows[0].id, admin: user.rows[0].admin },
            process.env.JWT_SECRET || 'sua_chave_secreta_temporaria',
            { expiresIn: '1d' }
        );
        
        res.json({
            id: user.rows[0].id,
            nome: user.rows[0].nome,
            email: user.rows[0].email,
            admin: user.rows[0].admin,
            token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};
// Listar todos os usuários (apenas para admins)
const getUsers = async (req, res) => {
    try {
        // Verificar se é admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Não autorizado' });
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.admin) {
                return res.status(403).json({ message: 'Apenas administradores podem listar usuários' });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        const users = await pool.query('SELECT id, nome, email, admin, created_at FROM usuarios');
        res.json(users.rows);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro ao listar usuários' });
    }
};

// Excluir usuário (apenas para admins)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar se é admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Não autorizado' });
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.admin) {
                return res.status(403).json({ message: 'Apenas administradores podem excluir usuários' });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
};

// Gerenciar acesso aos quadros
const manageQuadroAccess = async (req, res) => {
    try {
        const { usuario_id, quadro_id, grant } = req.body;
        
        // Verificar se é admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Não autorizado' });
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.admin) {
                return res.status(403).json({ message: 'Apenas administradores podem gerenciar acessos' });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        if (grant) {
            // Conceder acesso
            await pool.query(
                'INSERT INTO usuario_quadro (usuario_id, quadro_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [usuario_id, quadro_id]
            );
            res.json({ message: 'Acesso concedido com sucesso' });
        } else {
            // Revogar acesso
            await pool.query(
                'DELETE FROM usuario_quadro WHERE usuario_id = $1 AND quadro_id = $2',
                [usuario_id, quadro_id]
            );
            res.json({ message: 'Acesso revogado com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao gerenciar acesso:', error);
        res.status(500).json({ message: 'Erro ao gerenciar acesso' });
    }
};

// Verificar quais quadros o usuário tem acesso
const getUserQuadros = async (req, res) => {
    try {
        // Verificar token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Não autorizado' });
        
        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
            
            // Se for admin, retorna todos os quadros
            if (decoded.admin) {
                const quadros = await pool.query('SELECT * FROM quadros');
                return res.json(quadros.rows);
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        // Retornar quadros que o usuário tem acesso
        const quadros = await pool.query(
            'SELECT q.* FROM quadros q JOIN usuario_quadro uq ON q.id = uq.quadro_id WHERE uq.usuario_id = $1',
            [userId]
        );
        
        res.json(quadros.rows);
    } catch (error) {
        console.error('Erro ao listar quadros do usuário:', error);
        res.status(500).json({ message: 'Erro ao listar quadros do usuário' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    manageQuadroAccess,
    getUserQuadros
};