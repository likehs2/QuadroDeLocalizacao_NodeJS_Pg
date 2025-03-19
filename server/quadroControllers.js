const pool = require('./db');
const jwt = require('jsonwebtoken');

// Obter todos os quadros que o usuário tem acesso
const getQuadrosUsuario = async (req, res) => {
    try {
        
        const id = req.params.id;
        const admin = req.params.admin;
        
        let userId, isAdmin;
        try {

            userId = id;
            isAdmin = admin;
            
            // Se for admin, retorna todos os quadros
            if (isAdmin) {
                const quadros = await pool.query('SELECT * FROM quadros ORDER BY nome');
                return res.render('quadros', {quadros: quadros.rows, isAdmin });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido linha 25' });
        }
        
        // Retornar quadros que o usuário tem acesso
        const quadros = await pool.query(
            'SELECT q.* FROM quadros q JOIN usuario_quadro uq ON q.id = uq.quadro_id WHERE uq.usuario_id = $1 ORDER BY q.nome',
            [userId]
        );
        
        res.render('quadros', { quadros: quadros.rows, isAdmin });
    } catch (error) {
        console.error('Erro ao listar quadros do usuário:', error);
        res.status(500).json({ message: 'Erro ao listar quadros do usuário' });
    }
};
const getQuadrosUsuarioTela = async (req, res) => {
    try {
        
        const id = req.params.id;
        const admin = req.params.admin;
        
        let userId, isAdmin;
        try {

            userId = id;
            isAdmin = admin;
            
            // Se for admin, retorna todos os quadros
            if (isAdmin) {
                const quadros = await pool.query('SELECT * FROM quadros ORDER BY nome');
                return res.json({ quadros: quadros.rows, isAdmin });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido linha 25' });
        }
        
        // Retornar quadros que o usuário tem acesso
        const quadros = await pool.query(
            'SELECT q.* FROM quadros q JOIN usuario_quadro uq ON q.id = uq.quadro_id WHERE uq.usuario_id = $1 ORDER BY q.nome',
            [userId]
        );
        
        res.render('quadros', { quadros: quadros.rows, isAdmin });
    } catch (error) {
        console.error('Erro ao listar quadros do usuário:', error);
        res.status(500).json({ message: 'Erro ao listar quadros do usuário' });
    }
};
// Criar um novo quadro (apenas admin)
const criarQuadro = async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        
        // Verificar se é admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Não autorizado' });
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.admin) {
                return res.status(403).json({ message: 'Apenas administradores podem criar quadros' });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        // Criar quadro
        const novoQuadro = await pool.query(
            'INSERT INTO quadros (nome, descricao) VALUES ($1, $2) RETURNING *',
            [nome, descricao]
        );
        
        res.status(201).json(novoQuadro.rows[0]);
    } catch (error) {
        console.error('Erro ao criar quadro:', error);
        res.status(500).json({ message: 'Erro ao criar quadro' });
    }
};

// Obter um quadro específico com seus colaboradores
const getQuadro = async (req, res) => {
    try {
        const { id } = req.params.id;
                
        // Verificar se o quadro existe
        const quadro = await pool.query('SELECT * FROM quadros WHERE id = $1', [id]);
        if (quadro.rows.length === 0) {
            return res.status(404).json({ message: 'Quadro não encontrado' });
        }
        
        res.render('index', { quadro: quadro.rows[0] });
    } catch (error) {
        console.error('Erro ao obter quadro:', error);
        res.status(500).json({ message: 'Erro ao obter quadro' });
    }
};

module.exports = {
    getQuadrosUsuario,
    criarQuadro,
    getQuadro,
    getQuadrosUsuarioTela
};