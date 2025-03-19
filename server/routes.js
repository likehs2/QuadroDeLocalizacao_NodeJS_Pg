const express = require('express');
const router = express.Router();
const { renderIndex, getColaboradores, addColaborador, updateStatus, deleteColaborador, updateImagem, renderLogin } = require('./controllers');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const controllers = require('./controllers');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

router.get('/', (req, res) => {
    const token = req.cookies?.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.redirect('/quadros');
    } catch (error) {
        res.redirect('/login');
    }
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/quadros', authenticate, async (req, res) => {
    try {
        // Obter quadros do usuário
        const userId = req.user.id;
        const isAdmin = req.user.admin;
        
        let quadros;
        if (isAdmin) {
            // Admin vê todos os quadros
            const result = await pool.query('SELECT * FROM quadros ORDER BY nome');
            quadros = result.rows;
        } else {
            // Usuário comum vê apenas os quadros que tem acesso
            const result = await pool.query(
                'SELECT q.* FROM quadros q JOIN usuario_quadro uq ON q.id = uq.quadro_id WHERE uq.usuario_id = $1 ORDER BY q.nome',
                [userId]
            );
            quadros = result.rows;
        }
        
        res.render('quadros', { quadros, isAdmin });
    } catch (error) {
        console.error('Erro ao obter quadros:', error);
        res.status(500).send('Erro ao carregar quadros');
    }
});

// Rota para exibir um quadro específico (protegida)
router.get('/quadro/:id', authenticate, async (req, res) => {
    try {
        const quadroId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.admin;
        
        // Verificar se o quadro existe
        const quadroResult = await pool.query('SELECT * FROM quadros WHERE id = $1', [quadroId]);
        
        if (quadroResult.rows.length === 0) {
            return res.status(404).send('Quadro não encontrado');
        }
        
        // Se não for admin, verificar se tem acesso
        if (!isAdmin) {
            const acessoResult = await pool.query(
                'SELECT * FROM usuario_quadro WHERE usuario_id = $1 AND quadro_id = $2',
                [userId, quadroId]
            );
            
            if (acessoResult.rows.length === 0) {
                return res.status(403).send('Você não tem acesso a este quadro');
            }
        }
        
        // Obter colaboradores do quadro
        const colaboradoresResult = await pool.query(
            'SELECT * FROM colaboradores WHERE quadro_id = $1 ORDER BY nome',
            [quadroId]
        );
        
        const quadro = quadroResult.rows[0];
        const colaboradores = colaboradoresResult.rows;
        
        res.render('index', {
            colaboradores,
            quadro,
            isAdmin,
            userId
        });
    } catch (error) {
        console.error('Erro ao obter quadro:', error);
        res.status(500).send('Erro ao carregar quadro');
    }
});
router.get('/quadros', async (req, res) => {
    console.log('Acessando rota /quadros');
    
    // Verificar se há um token no localStorage (isso será feito no cliente)
    // Aqui apenas renderizamos a página
    res.render('quadros', { title: 'Seleção de Quadros' });
});
//router.get('/colaboradores', getColaboradores);
//router.post('/colaboradores', upload.single('imagem'), addColaborador);
//router.put('/colaboradores/:id/status', updateStatus);
//router.put('/colaboradores/:id/imagem', upload.single('imagem'), updateImagem);
//router.delete('/colaboradores/:id', deleteColaborador);

module.exports = router;
