<script setup lang="ts">
	import { io } from 'socket.io-client';
import { onBeforeMount, ref } from 'vue';

	type Message = {
		name: string;
		content: string;
	};

	const socket = io('http://localhost:3000')
	const messages: any = ref([])
	const messageText = ref('')
	const name = ref('')
	const joined = ref(false)
	const typingDisplay = ref('')

	onBeforeMount(() => {
		socket.emit('findAllMessages', {}, (response: any) => {
			messages.value = response
		})

		socket.on('newMessage', (newMessage) => {
			messages.value.push(newMessage)
		})

		socket.on('typing', ({ name, isTyping }) => {
			if (isTyping) {
				typingDisplay.value = `${name} is typing...`
			} else {
				typingDisplay.value = ''
			}
		})
	})

	const joinRoom = () => {
		socket.emit('joinRoom', { name: name.value }, () => {
			joined.value = true
		})
	}

	const sendMessage = () => {
		socket.emit('createMessage', { content: messageText.value }, () => {
			messageText.value = ''
		})
	}

	let timeout: any = null
	const emitTyping = () => {
		socket.emit('typing', { name: name.value, isTyping: true })

		timeout = setTimeout(() => {
			socket.emit('typing', { name: name.value, isTyping: false })
		}, 2000)
	}
</script>

<template>
	<div class="chat">
		<div v-if="!joined">
				<form @submit.prevent="joinRoom">
					<label>What's your name?</label>
					<input v-model="name" type="text" @input="emitTyping">
					<button type="submit">Send</button>
				</form>
		</div>
		<div v-else class="chat-container">
			<div class="messages-container">
				<div v-for="message in messages">
					<p class="message-text">
						[{{ message.name }}]: {{ message.content }}
					</p>
				</div>
			</div>
		</div>

		<div v-if="typingDisplay">
			{{ typingDisplay }}
		</div>

		<div class="message-input">
			<form @submit.prevent="sendMessage">
				<label>Message:</label>
				<input v-model="messageText" @input="emitTyping" type="text">

				<button type="submit">Send</button>
			</form>
		</div>
	</div>
</template>
  
<style>
	@import url('./assets/base.css');

	form {
		display: flex;
		flex-direction: column;
		justify-content: start;
		height: 100vh;		
	}
	
	.chat {
		padding: 20px;
		height: 100vh;
	}

	.chat-container {
		display: flex;
		flex-direction: column;
		height: 80%;
	}
</style>
