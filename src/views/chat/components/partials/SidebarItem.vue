<template>
	<v-list-item
			class="user-item"
			:class="{'grayish-blue': selected}"
			@click="openChat"
	>
		<v-list-item-avatar class="my-0 mr-4" v-if="!!item.avatar">
			<img :src="item.avatar">
			<span v-if="item.type === 'user'" :class="{'v-badge success rounded floating': !!item.status}"></span>
		</v-list-item-avatar>
		<template v-else>
			<v-avatar class="primary mr-4" size="40" :class="item.color">
				<span small class="white--text">{{item.type === 'group' ? item.name.charAt(0) : item.fio.charAt(0)}}</span>
				<span v-if="item.type === 'user'" :class="{'v-badge success rounded floating': !!item.status}"></span>
			</v-avatar>
		</template>
		<v-list-item-content class="py-0">
			<h6 class="mb-1">{{item.type === 'group' ? $t('message.generalChat') + ' ' + item.name : item.fio}}</h6>
			<span v-if="!!role && !!item.role_name" class="fs-12 grey--text fw-normal">{{item.role_name}}</span>
			<template v-if="!role && !!item.messages && item.messages.length > 0">
				<span class="fs-12 grey--text fw-normal">{{getPreviewTextChat(item.messages[item.messages.length - 1])}}</span>
				<span class="fs-12 fw-normal">{{getDateTimeMessage(item.messages[item.messages.length - 1].date)}}</span>
			</template>
		</v-list-item-content>
	</v-list-item>
</template>

<script>
	import { mapGetters } from "vuex";
	import { handlingErrors, getPreviewTextChat, getDateTimeMessage } from "Helpers/helpers";

	export default {
		props: {
			item: {
				type: Object,
				default: null
			},
			role: Boolean,
			unread: Boolean,
			countUnread: Number
		},
		computed: {
			...mapGetters(["selectedChat"]),
			selected() {
				return !!this.selectedChat && ((this.selectedChat.type === 'group' && this.selectedChat.id == this.item.id) || (this.selectedChat.type === 'user' && this.selectedChat.agent_id == this.item.agent_id));
			}
		},
		methods: {
			openChat() {
				this.$emit('click', this.item);
				this.$store.dispatch("openChat", this.item).catch(handlingErrors);
			},
			getPreviewTextChat,
			getDateTimeMessage
		}
	};
</script>
