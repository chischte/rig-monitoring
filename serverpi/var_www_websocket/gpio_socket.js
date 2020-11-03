const WebSocket = require("ws");

// starts server instance on http://localhost:8083
const wss = new WebSocket.Server({ port: 8083 });
console.log("gpio_socket.js running, gpio websocket is @ port 8083");

// waits for connection to be established from the client
// the callback argument ws is a unique for each client
wss.on("connection", ws => {
  // runs a callback on message event
  ws.on("message", data => {
    console.log(data);
    // sends the data to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
