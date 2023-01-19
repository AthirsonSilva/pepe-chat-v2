import { IsString, Length } from 'class-validator'
import { Message } from '../entities/message.entity'

export class CreateMessageDto extends Message {
	@IsString()
	@Length(1, 20)
	name: string

	@IsString()
	@Length(1, 100)
	content: string
}
