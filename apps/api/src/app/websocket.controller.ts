import { Events } from '@dashy/api-interfaces'
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ResticResponse } from './native/models/restic-response.type'

@WebSocketGateway(3001, { path: '/socket.io', cors: { origin: '*' } })
export class WebsocketController implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server

  @SubscribeMessage('join_backup_progress')
  handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    return 'success'
  }

  async handleConnection(client: Socket, ...args: any[]) {
    await client.join(Events.BACKUP_PROGRESS)
  }

  sendProgressUpdate(data: ResticResponse) {
    console.log(data)
    return this.server.to(Events.BACKUP_PROGRESS).emit(Events.BACKUP_PROGRESS, data)
  }
}
