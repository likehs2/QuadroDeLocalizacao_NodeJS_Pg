const jwt = require('jsonwebtoken');
const pool = require('../server/db');

// Middleware para verificar se o usuário está autenticado
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para verificar se o usuário é admin
const isAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
    }
    
    try {
        const user = await pool.query('SELECT admin FROM usuarios WHERE id = $1', [req.user.id]);
        
        if (user.rows.length === 0 || !user.rows[0].admin) {
            return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
        }
        
        next();
    } catch (error) {
        console.error('Erro ao verificar permissão de admin:', error);
        res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
};

// Middleware para verificar acesso a um quadro específico
const hasQuadroAccess = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
    }
    
    try {
        // Verificar se é admin (admins têm acesso a todos os quadros)
        const adminCheck = await pool.query('SELECT admin FROM usuarios WHERE id = $1', [req.user.id]);
        if (adminCheck.rows[0].admin) {
            return next();
        }
        
        const quadroId = req.params.quadroId || req.body.quadroId;
        if (!quadroId) {
            return res.status(400).json({ message: 'ID do quadro não fornecido' });
        }
        
        // Verificar se o usuário tem acesso ao quadro
        const access = await pool.query(
            'SELECT * FROM usuario_quadro WHERE usuario_id = $1 AND quadro_id = $2',
            [req.user.id, quadroId]
        );
        
        if (access.rows.length === 0) {
            return res.status(403).json({ message: 'Acesso negado a este quadro' });
        }
        
        next();
    } catch (error) {
        console.error('Erro ao verificar acesso ao quadro:', error);
        res.status(500).json({ message: 'Erro ao verificar acesso' });
    }
};

module.exports = {
    authenticate,
    isAdmin,
    hasQuadroAccess
};