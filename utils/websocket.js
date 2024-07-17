const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    const dataString = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(dataString);
        }
    });
}

module.exports = { wss, broadcast };
