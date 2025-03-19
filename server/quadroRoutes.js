const express = require('express');
const router = express.Router();
const {
    getQuadrosUsuario,
    criarQuadro,
    getQuadro,
    getQuadrosUsuarioTela
} = require('./quadroControllers');

// Rotas para quadros
router.get('/acesso/:id/:admin', getQuadrosUsuario);
router.get('/tela/:id/:admin', getQuadrosUsuarioTela);
router.post('/', criarQuadro);
router.get('/:id', getQuadro);

module.exports = router;