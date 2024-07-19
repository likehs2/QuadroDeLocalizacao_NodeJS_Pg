const pool = require('./db');
const { broadcast } = require('../utils/websocket');

const getColaboradores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colaboradores ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter colaboradores');
  }
};

const renderIndex = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colaboradores ORDER BY id ASC');
    res.render('index', { colaboradores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter colaboradores');
  }
};

const addColaborador = async (req, res) => {
  const { nome, localizacao, status } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;
  if (!nome || !localizacao || !imagem || !status) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }
  try {
    await pool.query('INSERT INTO colaboradores (nome, localizacao, imagem, status) VALUES ($1, $2, $3, $4)', [nome, localizacao, imagem, status]);
    const newColaborador = { nome, localizacao, imagem, status };
    broadcast(newColaborador);
    res.status(201).send('Colaborador adicionado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar colaborador');
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE colaboradores SET status = $1 WHERE id = $2', [status, id]);
    const updatedStatus = { id, status };
    broadcast(updatedStatus);
    res.send('Status atualizado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar status');
  }
};

const updateImagem = async (req, res) => {
  const { id } = req.params;
  const imagem = req.file.path;
  try {
      await pool.query('UPDATE colaboradores SET imagem = $1 WHERE id = $2', [imagem, id]);
      const updatedColaborador = { id, imagem };
      broadcast(updatedColaborador);
      res.json(updatedColaborador);
  } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao alterar imagem');
  }
};

async function atualizarLocalizacaoColaborador(id, novaLocalizacao) {
  console.log('ID:', id);
  console.log('Nova Localização:', novaLocalizacao);
  try {
      const query = 'UPDATE colaboradores SET localizacao = $1 WHERE id = $2';
      const values = [novaLocalizacao, id];
      const result = await pool.query(query, values);
      console.log('Resultado da consulta:', result);
      const updatedLocalizacao = { id, localizacao: novaLocalizacao };
      broadcast(updatedLocalizacao);
      return true; 
  } catch (error) {
      console.error('Erro ao atualizar localização do colaborador', error);
      return false;
  }
}

const deleteColaborador = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('delete from colaboradores WHERE id = $1', [id]);
    const deleteColaborador = { id };
    broadcast(deleteColaborador);
    res.send('Colaborador deletado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar colaborador');
  }
};

module.exports = {
  getColaboradores,
  addColaborador,
  updateStatus,
  renderIndex,
  atualizarLocalizacaoColaborador,
  deleteColaborador,
  updateImagem
};
