const websocket = require('ws');
const wss = new websocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
    console.log('Nuevo dispositivo conectado');

    ws.on('message',message => {
        console.log('Mensaje recibido:', message.toString());
    });

    setInterval(() => {
        ws.send(JSON.stringify({led: Math.random() > 0.5 ? 'ON' : 'OFF'}));
    }, 10000);

    ws.on('close', () => {
        console.log('Dispositivo desconectado');
    });
}); 

console.log('Servidor WebSocket escuchando en el puerto 3000');