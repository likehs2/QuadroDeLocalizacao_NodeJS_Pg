const pool = require('./db');
const jwt = require('jsonwebtoken');
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

const renderLogin = async (req, res) => {
  try {
    res.render('login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir Login');
  }
};

// Modificar a função addColaborador para incluir o quadro_id
const addColaborador = async (req, res) => {
  try {

    const { nome, localizacao, quadro_id } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';

    const newColaborador = await pool.query(
      'INSERT INTO colaboradores (nome, localizacao, imagem, quadro_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, localizacao, imagem, quadro_id]
    );

    // Emitir evento WebSocket
    broadcast(JSON.stringify({
      type: 'add',
      colaborador: newColaborador.rows[0]
    }));

    res.status(201).json(newColaborador.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar colaborador' });
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
  const imagem = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';;
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
  try {

    const { id } = req.params;

    // Obter o colaborador antes de excluir (para obter o nome da imagem)
    const colaborador = await pool.query('SELECT * FROM colaboradores WHERE id = $1', [id]);

    if (colaborador.rows.length === 0) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Excluir o colaborador
    await pool.query('DELETE FROM colaboradores WHERE id = $1', [id]);

    // Emitir evento WebSocket
    broadcast(JSON.stringify({
      type: 'delete',
      id: id
    }));

    res.json({ message: 'Colaborador excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir colaborador' });
  }
};
const getQuadrosUsuario = async (req, res) => {
  try {
    // Verificar token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Não autorizado' });

    let userId, isAdmin;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      isAdmin = decoded.admin;

      // Se for admin, retorna todos os quadros
      if (isAdmin) {
        const quadros = await pool.query('SELECT * FROM quadros ORDER BY nome');
        return res.json(quadros.rows);
      }
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Retornar quadros que o usuário tem acesso
    const quadros = await pool.query(
      'SELECT q.* FROM quadros q JOIN usuario_quadro uq ON q.id = uq.quadro_id WHERE uq.usuario_id = $1 ORDER BY q.nome',
      [userId]
    );

    res.json(quadros.rows);
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
    const { id } = req.params;

    // Verificar token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Não autorizado' });

    let userId, isAdmin;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      isAdmin = decoded.admin;
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Verificar se o quadro existe
    const quadro = await pool.query('SELECT * FROM quadros WHERE id = $1', [id]);
    if (quadro.rows.length === 0) {
      return res.status(404).json({ message: 'Quadro não encontrado' });
    }

    // Se não for admin, verificar se tem acesso
    if (!isAdmin) {
      const acesso = await pool.query(
        'SELECT * FROM usuario_quadro WHERE usuario_id = $1 AND quadro_id = $2',
        [userId, id]
      );

      if (acesso.rows.length === 0) {
        return res.status(403).json({ message: 'Você não tem acesso a este quadro' });
      }
    }

    // Obter colaboradores do quadro
    const colaboradores = await pool.query(
      'SELECT * FROM colaboradores WHERE quadro_id = $1 ORDER BY nome',
      [id]
    );

    res.json({
      quadro: quadro.rows[0],
      colaboradores: colaboradores.rows,
      isAdmin
    });
  } catch (error) {
    console.error('Erro ao obter quadro:', error);
    res.status(500).json({ message: 'Erro ao obter quadro' });
  }
};

module.exports = {
  getColaboradores,
  addColaborador,
  updateStatus,
  renderIndex,
  atualizarLocalizacaoColaborador,
  deleteColaborador,
  updateImagem,
  renderLogin,
  getQuadrosUsuario,
  criarQuadro,
  getQuadro
};
