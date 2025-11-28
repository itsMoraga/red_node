const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

console.log('WebSocket server started on port 3000');

wss.on('connection', function connection(ws) {
    console.log('New device connected');
    
    // Send welcome message
    ws.send(JSON.stringify({ 
        type: 'connection', 
        message: 'Connected to Node-RED server' 
    }));

    // Handle incoming messages from clients
    ws.on('message', message => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Message received:', data);
            
            // Broadcast to all connected clients (including Node-RED)
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Send LED commands every 10 seconds
    const ledInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const ledCommand = { 
                led: Math.random() > 0.5 ? 'ON' : 'OFF' 
            };
            ws.send(JSON.stringify(ledCommand));
            console.log('Sent LED command:', ledCommand);
        }
    }, 10000);

    ws.on('close', () => {
        console.log('Device disconnected');
        clearInterval(ledInterval);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Handle server errors
wss.on('error', (error) => {
    console.error('Server error:', error);
});

console.log('WebSocket server is listening on ws://localhost:3000');