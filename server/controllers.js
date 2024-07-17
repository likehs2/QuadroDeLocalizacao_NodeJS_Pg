const pool = require('./db');

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
    const { nome, localizacao, imagem, status } = req.body;
    if (!nome || !localizacao || !imagem || !status) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }
    try {
      await pool.query('INSERT INTO colaboradores (nome, localizacao, imagem, status) VALUES ($1, $2, $3, $4)', [nome, localizacao, imagem, status]);
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
    res.send('Status atualizado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar status');
  }
};

async function atualizarLocalizacaoColaborador(id, novaLocalizacao) {
    try {
        const query = 'UPDATE colaboradores SET localizacao = $1 WHERE id = $2';
        const values = [novaLocalizacao, id];
        const result = await pool.query(query, values);
        return true; // Retorna verdadeiro se a atualização for bem-sucedida
    } catch (error) {
        console.error('Erro ao atualizar localização do colaborador', error);
        return false; // Retorna falso se houver erro na atualização
    }
}

module.exports = {
  getColaboradores,
  addColaborador,
  updateStatus,
  renderIndex,
  atualizarLocalizacaoColaborador
};