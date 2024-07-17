// server/routes.js
const express = require('express');
const router = express.Router();
const { renderIndex, getColaboradores, addColaborador, updateStatus } = require('./controllers');

router.get('/', renderIndex); // Renderiza a página inicial com os colaboradores
router.get('/colaboradores', getColaboradores);
router.post('/colaboradores', addColaborador);
router.put('/colaboradores/:id/status', updateStatus);

module.exports = router;
