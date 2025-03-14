const express = require('express');
const router = express.Router();
const {
    getQuadrosUsuario,
    criarQuadro,
    getQuadro
} = require('./quadroControllers');

// Rotas para quadros
router.get('/', getQuadrosUsuario);
router.post('/', criarQuadro);
router.get('/:id', getQuadro);

module.exports = router;