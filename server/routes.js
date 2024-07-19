const express = require('express');
const router = express.Router();
const { renderIndex, getColaboradores, addColaborador, updateStatus, deleteColaborador, updateImagem } = require('./controllers');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', renderIndex);
router.get('/colaboradores', getColaboradores);
router.post('/colaboradores', upload.single('imagem'), addColaborador);
router.put('/colaboradores/:id/status', updateStatus);
router.put('/colaboradores/:id/imagem', upload.single('imagem'), updateImagem);
router.delete('/colaboradores/:id', deleteColaborador);

module.exports = router;
