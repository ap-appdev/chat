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
			<v-list-item-title class="mb-1 fw-semi-bold fs-14 d-flex">
				{{item.type === 'group' ? $t('message.generalChat') + ' ' + item.name : item.fio}}
				<v-spacer></v-spacer>
				<v-chip v-if="!!item.unread_count" x-small class="primary ml-2 font-weight-regular">{{item.unread_count}}</v-chip>
			</v-list-item-title>
			<v-list-item-subtitle v-if="!!role && !!item.role_name" class="fs-12 fw-normal grey--text">{{item.role_name}}</v-list-item-subtitle>
			<template v-if="!role && !!item.messages && item.messages.length > 0">
				<v-list-item-subtitle class="fs-12 fw-normal">{{getPreviewTextChat(item.messages[item.messages.length - 1])}}</v-list-item-subtitle>
				<v-list-item-subtitle class="fs-12 d-flex align-center" :class="item.messages[item.messages.length - 1].unread ? 'primary--text fw-semi-bold' : 'grey--text fw-normal'">
					<v-spacer></v-spacer>
					<v-icon v-if="getUser.agent_id == item.messages[item.messages.length - 1].id_sender" small class="mr-1" :color="!item.messages[item.messages.length - 1].notread_count ? 'success' : 'grey lighten-1'">mdi-check-all</v-icon>
					{{getDateTimeMessage(item.messages[item.messages.length - 1].date)}}
					</v-list-item-subtitle>
			</template>
		</v-list-item-content>
<!--		<v-list-item-action class="my-0">-->
<!--			<v-list-item-action-text class="fw-semi-bold fs-14 primary&#45;&#45;text">5</v-list-item-action-text>-->
<!--			<v-chip color="primary">5</v-chip>-->
<!--			<v-icon-->
<!--					v-if="!active"-->
<!--					color="grey lighten-1"-->
<!--			>-->
<!--				star_border-->
<!--			</v-icon>-->

<!--			<v-icon-->
<!--					v-else-->
<!--					color="yellow"-->
<!--			>-->
<!--				star-->
<!--			</v-icon>-->
<!--		</v-list-item-action>-->
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
			...mapGetters(["selectedChat", "getUser"]),
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
