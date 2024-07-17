const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./server/routes'); 
const { atualizarLocalizacaoColaborador } = require('./server/controllers');
const { wss, broadcast } = require('./utils/websocket');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3095;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/scripts'));

app.use('/', routes);

app.put('/colaboradores/:id/localizacao', async (req, res) => {
    const id = req.params.id;
    const novaLocalizacao = req.body.localizacao;

    try {
        const sucesso = await atualizarLocalizacaoColaborador(id, novaLocalizacao);
        if (sucesso) {
            const dadosAtualizados = { id, localizacao: novaLocalizacao };
            broadcast(dadosAtualizados);
            res.sendStatus(200); 
        } else {
            res.sendStatus(500); 
        }
    } catch (error) {
        console.error('Erro ao atualizar localização', error);
        res.sendStatus(500); 
    }
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
