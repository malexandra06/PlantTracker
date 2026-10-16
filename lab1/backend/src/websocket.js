import { WebSocket, WebSocketServer } from 'ws';

let wss;

export function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', (socket) => {
    console.log(`WebSocket client connected (${wss.clients.size} total)`);
    socket.on('close', () => console.log(`WebSocket client left (${wss.clients.size} total)`));
  });
}


export function broadcast(type, payload, from) {
  const message = JSON.stringify({ type, payload, from });
  wss?.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}