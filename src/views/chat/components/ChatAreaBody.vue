<template>
	<div class="chat-body">
		<template v-for="(message, index) in messages">
			<div class="text-center separator" v-if="getDateMessages(messages[index - 1], message)">
				<!--										outlined-->
				<v-chip
						outlined
						small
						class="ma-2 grey--text"
				>
					{{getDateMessages(messages[index - 1], message)}}
				</v-chip>
			</div>
			<div class="chat-block mb-4" :key="message.id" :class="{'flex-row-reverse': getUser.agent_id == message.id_sender}">
				<template v-if="getUser.agent_id != message.id_sender">
					<v-list-item-avatar class="my-0 mr-4" v-if="!!message.avatar_sender">
						<img :src="message.avatar_sender">
					</v-list-item-avatar>
					<template v-else>
						<v-avatar class="mr-4" size="40" :class="!!message.color_sender ? message.color_sender : 'primary'">
							<span small class="white--text">{{message.fio_sender.charAt(0)}}</span>
						</v-avatar>
					</template>
		<!--									<div class="avatar-wrap mr-4">-->
		<!--										<img :src="selectedChat.avatar" alt="user-profile" class="rounded-circle" width="40" height="40" />-->
		<!--									</div>-->
					<div class="chat-bubble-wrap">
						<div class="chat-bubble even aqua-bg px-4 d-block align-items-center flex-column">
							<h6 class="mb-1 d-block">{{message.fio_sender}}</h6>
							<span class="d-block fs-14">{{message.message}}</span>
							<chat-area-body-files :files="message.files"></chat-area-body-files>
						</div>
						<span class="fs-12 grey--text text-left d-block mt-1 fw-normal">{{getDateMessage(message.date)}}</span>
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
						<span class="fs-12 grey--text text-right d-block mt-1 fw-normal">{{getDateMessage(message.date)}}</span>
					</div>
				</template>
			</div>
		</template>
		<div class="chat-box-main" style="margin: -30px;" :style="height" v-if="!Array.isArray(messages) || messages.length === 0">
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
	props: ["messages", "height"],
	computed: {
		...mapGetters(["selectedLocale", "getUser"])
	},
	components: {
		ChatAreaBodyFiles
	},
	methods: {
		getDateMessage(date) {
			return getDateTimeMessage(date);
		},
		getDateMessages(oldMessage, message) {
			let oldDate = !!oldMessage ? getDateLocalUTC(oldMessage.date, 'DD.MM.YYYY') : '';
			let date = getDateLocalUTC(message.date, 'DD.MM.YYYY');
			return (oldDate !== date) ? date : false;
		}
	}
};
</script>
