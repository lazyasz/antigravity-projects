import type { Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage } from "http";

let socketServer: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function attachRealtime(server: Server) {
  socketServer = new WebSocketServer({ noServer: true });
  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname !== "/ws") return;
    socketServer?.handleUpgrade(request, socket, head, (client) => {
      clients.add(client);
      client.send(JSON.stringify({ type: "CONNECTED", clients: clients.size }));
      client.on("close", () => clients.delete(client));
      client.on("error", () => clients.delete(client));
    });
  });
  return socketServer;
}

export function broadcastCorridorState(state: unknown) {
  const message = JSON.stringify({ type: "CORRIDOR_STATE", state });
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

export function getRealtimeClientCount() {
  return clients.size;
}
