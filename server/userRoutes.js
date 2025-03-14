const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    manageQuadroAccess,
    getUserQuadros
} = require('./userControllers');

// Rotas de autenticação
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rotas de gerenciamento de usuários (admin)
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Rotas de gerenciamento de acesso
router.post('/access', manageQuadroAccess);
router.get('/quadros', getUserQuadros);

module.exports = router;