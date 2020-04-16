<template>
	<div class="chat-body">
		<template v-for="(message, index) in messages">
			<div id="chat-unread-messages" ref="component" class="text-center" v-if="firstUnreadMessage && message.id === firstUnreadMessage.id && scrollToUnread()">
				<v-chip
						outlined
						small
						color="primary"
						class="ma-2 primary--text fw-semi-bold"
				>
					{{$t('message.unreadMessages')}}
				</v-chip>
			</div>
			<div class="text-center separator date-messages" v-if="getDateMessages(messages[index - 1], message)">
				<v-chip
						outlined
						small
						class="ma-2 grey--text"
				>
					{{getDateMessages(messages[index - 1], message)}}
				</v-chip>
			</div>
			<div class="chat-block mb-4" :key="message.id" :id="'message-' + message.id" :class="{'flex-row-reverse': getUser.agent_id == message.id_sender}">
				<template v-if="getUser.agent_id != message.id_sender">
					<v-list-item-avatar class="my-0 mr-4" v-if="!!message.avatar_sender">
						<img :src="message.avatar_sender">
					</v-list-item-avatar>
					<template v-else>
						<v-avatar class="mr-4" size="40" :class="!!message.color_sender ? message.color_sender : 'primary'">
							<span small class="white--text">{{message.fio_sender.charAt(0)}}</span>
						</v-avatar>
					</template>
					<div class="chat-bubble-wrap">
						<div class="chat-bubble even aqua-bg px-4 d-block align-items-center flex-column">
							<h6 class="mb-1 d-block" v-if="type === 'group'">{{message.fio_sender}}</h6>
							<span class="d-block fs-14">{{message.message}}</span>
							<chat-area-body-files :files="message.files"></chat-area-body-files>
						</div>
						<span class="fs-12 text-left d-block mt-1" :class="message.unread ? 'primary--text fw-semi-bold' : 'grey--text fw-normal'"
						      v-observe-visibility="message.unread ? {
										callback: (isVisible, entry) => readMessage(isVisible, entry, message),
										throttle: 300,
										once: true
									} : false"
						>{{getDateMessage(message.date)}}</span>
					</div>
				</template>
				<template v-else>
					<v-list-item-avatar class="my-0 ml-4" v-if="!!getUser.avatar">
						<img :src="getUser.avatar">
					</v-list-item-avatar>
					<template v-else>
						<v-avatar class="ml-4" size="40" :class="!!getUser.color ? getUser.color : 'aqua-bg'">
							<span small :class="!!getUser.color ? 'white--text' : ''">{{getUser.fio.f.charAt(0)}}</span>
						</v-avatar>
					</template>
					<div class="chat-bubble-wrap">
						<div class="chat-bubble odd primary px-4 d-custom-flex align-items-center flex-column">
							<span class="d-inline-block fs-14 white--text">{{message.message}}</span>
							<chat-area-body-files :files="message.files"></chat-area-body-files>
						</div>
						<span class="fs-12 grey--text text-right d-block mt-1 fw-normal">
							{{getDateMessage(message.date)}}
							<v-icon small class="ml-1" style="vertical-align: text-bottom" :color="!message.notread_count ? 'success' : 'grey lighten-1'">mdi-check-all</v-icon>
					</span>
					</div>
				</template>
			</div>
		</template>
		<div class="chat-box-main w-100" style="margin: -30px;" :style="height" v-if="!Array.isArray(messages) || messages.length === 0">
			<div class="centered">
				<p><i class="zmdi zmdi-edit font-3x grey--text"></i></p>
				<p class="grey--text">{{$t('message.noMessagesChat')}}</p>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { getDateTimeMessage, getDateLocalUTC } from "Helpers/helpers";
import ChatAreaBodyFiles from "./ChatAreaBodyFiles";

export default {
	components: {
		ChatAreaBodyFiles
	},
	props: ["type", "messages", "unread_count", "height"],
	computed: {
		...mapGetters(["getUser"]),
		lastMessage: function () {
			return this.messages && this.messages.length ? this.messages[this.messages.length - 1] : null
		}
	},
	watch: {
		// toUnread: function (to) {
		// 	const vue = this;
		// 	if(to) setTimeout(function () {
		// 		console.log('scrollTo')
		// 		vue.$emit('scrollTo', '#chat-unread-messages')
		// 	})
		// },
		messages: function () {
			if (!this.setUnreadMessage) {
				this.setUnreadMessage = true;
				this.setFirstUnreadMessage()
				this.$nextTick(function () {
					if(this.firstUnreadMessage) this.$emit('scrollTo', '#chat-unread-messages')
					else if(this.lastMessage) this.$emit('scrollTo', '#message-' + this.lastMessage.id)
				});
			}
		},
		unread_count: function (to) {
			let vue = this;
			if (to === 0) {
				if(this.clearUnreadMessage) clearTimeout(this.clearUnreadMessage);
				this.clearUnreadMessage = setTimeout(function () {
					vue.firstUnreadMessage = null
				}, 10000);
			}
			if (to >= 3) this.setFirstUnreadMessage()
		}
	},
	data () {
		return {
			clearUnreadMessage: null,
			setUnreadMessage: false,
			firstUnreadMessage: null,
			toUnread: false
		}
	},
	mounted() {
		this.setFirstUnreadMessage()
		// this.$nextTick(function () {
		// 	console.log('$nextTick')
		// 	// if(this.lastMessage) this.$emit('scrollTo', '#message-' + this.lastMessage.id)
		// });
	},
	methods: {
		setFirstUnreadMessage () {
			if(!this.messages) return false;
			let message = this.messages.find(message => message.unread);
			if(message && this.clearUnreadMessage) {
				clearTimeout(this.clearUnreadMessage);
				this.clearUnreadMessage = null;
			}
			this.firstUnreadMessage = message ? Object.assign({}, message) : this.firstUnreadMessage
		},
		scrollToUnread () {
			return this.toUnread = true;
		},
		readMessage(isVisible, entry, message) {
			if(isVisible) {
				this.$socket.emit('readMessage', message);
			}
		},
		getDateMessage(date) {
			return getDateTimeMessage(date, 'HH:mm');
		},
		getDateMessages(oldMessage, message) {
			let oldDate = oldMessage ? getDateLocalUTC(oldMessage.date, 'DD.MM.YYYY') : '';
			let date = getDateLocalUTC(message.date, 'DD.MM.YYYY');
			return (oldDate !== date) ? date : false;
		}
	}
};
</script>
