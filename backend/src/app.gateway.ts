import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  @WebSocketGateway({
    cors: {
      origin: '*', 
      methods: ['GET', 'POST'],
    },
  })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
  
    afterInit(server: Server) {
      console.log('✅ WebSocket Server Initialized');
    }
  
    handleConnection(client: Socket) {
      console.log(`🟢 Client connected: ${client.id}`);
      client.emit('message', 'Welcome to the WebSocket server!');
    }
  
    handleDisconnect(client: Socket) {
      console.log(`🔴 Client disconnected: ${client.id}`);
    }
  }
  