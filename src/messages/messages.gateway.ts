import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessagesService } from './messages.service'

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class MessagesGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly messagesService: MessagesService) {}

	@SubscribeMessage('createMessage')
	async create(@MessageBody() createMessageDto: CreateMessageDto) {
		const message = this.messagesService.create(createMessageDto)

		this.server.emit('newMessage', message)

		return message
	}

	@SubscribeMessage('findAllMessages')
	findAll() {
		return this.messagesService.findAll()
	}

	@SubscribeMessage('joinRoom')
	joinRoom(
		@MessageBody('name') name: string,
		@ConnectedSocket() client: Socket,
	) {
		return this.messagesService.identify(name, client.id)
	}

	@SubscribeMessage('leaveRoom')
	leaveRoom(@MessageBody() room: string) {
		this.server.emit('leftRoom', room)
	}

	@SubscribeMessage('typing')
	async typing(
		@MessageBody('isTyping') isTyping: boolean,
		@ConnectedSocket() client: Socket,
	) {
		const name = await this.messagesService.getClientName(client.id)

		client.broadcast.emit('typing', { name, isTyping })
	}
}
