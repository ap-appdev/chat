<template>
	<v-card class="chat-content v-sheet--tile">
		<v-toolbar color="primary" dark>
			<!--         <v-toolbar-title>Chat</v-toolbar-title>-->
			<!--         <v-spacer></v-spacer>-->
			<!--         <v-btn icon>-->
			<!--            <v-icon>search</v-icon>-->
			<!--         </v-btn>-->
			<user-block></user-block>
		</v-toolbar>
		<v-list-item class="sidebar-profile">
			<v-list-item-content class="mr-3">
				<v-text-field v-model="search" text solo prepend-icon="search" clearable :placeholder="$t('message.search')" class="search-bar d-flex"></v-text-field>
			</v-list-item-content>
			<v-tooltip right>
				<template v-slot:activator="{ on }">
					<v-switch color="error" v-on="on" v-model="offline"></v-switch>
				</template>
				<span>{{$t('message.offlineUsersChat')}}</span>
			</v-tooltip>
		</v-list-item>
		<v-list>
			<vue-perfect-scrollbar class="chat-sidebar-scroll" :style="getScrollHeight()" :settings="settings">
				<template v-for="(item, index) in foundChats">
					<sidebar-item :key="index" :item="item" role></sidebar-item>
				</template>
				<v-list-group
						v-if="newMessages.count > 0"
						prepend-icon="message"
				>
					<template v-slot:activator>
						<v-list-item-title>{{$t('message.newMessages')}}</v-list-item-title>
						<v-list-item-icon class="d-table">
							<v-chip small class="primary">{{newMessages.count}}</v-chip>
						</v-list-item-icon>
					</template>
					<template v-for="(item, index) in newMessages.chats">
						<sidebar-item :key="index" :item="item"></sidebar-item>
					</template>
				</v-list-group>
				<v-list-group
						prepend-icon="group"
						v-for="group in skillGroups"
						:key="group.id"
				>
					<template v-slot:activator>
						<v-list-item-title>{{group.name}}</v-list-item-title>
						<v-list-item-icon>{{onlineUsers(group.id)}}</v-list-item-icon>
					</template>

					<sidebar-item :item="group"></sidebar-item>
					<sidebar-role-users
							v-for="role in group.roles"
							:key="role.id"
							:header="role.header"
							:users="getUsersByRole(role, group)"
							:offlineUsers="offlineUsers">
					</sidebar-role-users>
				</v-list-group>
			</vue-perfect-scrollbar>
		</v-list>
	</v-card>
</template>

<script>
	import { mapGetters } from "vuex";
	import { getCurrentAppLayout, convertDateToTimeStamp } from "Helpers/helpers";
	import UserBlock from "Components/Sidebar/UserBlock";
	import SidebarRoleUsers from "./partials/SidebarRoleUsers";
	import SidebarItem from "./partials/SidebarItem";

	export default {
		components: {
			UserBlock,
			SidebarRoleUsers,
			SidebarItem
		},
		computed: {
			...mapGetters(["getUser", "skillGroups", "users", "offlineUsers"]),
			offline: {
				get: function() {
					return this.offlineUsers;
				},
				set: function(offline) {
					this.$store.dispatch("offlineUsers", offline);
				}
			},
			foundChats() {
				if (!this.search || this.search.length < 3) return [];
				let vue = this;
				let foundChats = this.skillGroups.filter(group => group.name.toLowerCase().indexOf(vue.search.toLowerCase()) !== -1);
				this.skillGroups.forEach(function (group) {
					let users = group.users.filter(user => user.fio.toLowerCase().indexOf(vue.search.toLowerCase()) !== -1);
					users.forEach(user => {
						if(foundChats.findIndex(item => item.agent_id === user.agent_id) === -1) foundChats.push(user);
					});
				});
				return foundChats.sort((a, b) => {
					let aName = a.type === 'group' ? a.name : a.fio;
					let bName = b.type === 'group' ? b.name : b.fio;
					return (aName.toLowerCase() > bName.toLowerCase()) ? 1 : -1;
				});
			},
			newMessages() {
				let chats = this.skillGroups.filter(group => !!group.unread_count);
				this.skillGroups.forEach(function (group) {
					let users = group.users.filter(user => !!user.unread_count);
					users.forEach(user => {
						if(chats.findIndex(item => item.agent_id === user.agent_id) === -1) chats.push(user);
					});
				});
				chats.sort((a, b) => {
					let aDate = a.messages[a.messages.length - 1].date;
					let bDate = b.messages[b.messages.length - 1].date;
					return (convertDateToTimeStamp(aDate, 'YYYY-MM-DDTHH:mm:ss.SSS') < convertDateToTimeStamp(bDate, 'YYYY-MM-DDTHH:mm:ss.SSS')) ? 1 : -1;
				});
				let count = chats.reduce(function(count, chat) {
					return count + +chat.unread_count;
				}, 0);
				return {count, chats};
			}
		},
		data() {
			return {
				settings: {
					maxScrollbarLength: 160
				},
				search: ''
			};
		},
		methods: {
			getScrollHeight() {
				let layout = getCurrentAppLayout(this.$router);
				switch (layout) {
					case "default":
						return "height: calc(100vh - 130px)";
					default:
						return "height: calc(100vh - 130px)";
				}
			},
			getUsersByRole(role, group) {
				return !!role.def
					? group.users.filter(user => group.roles.findIndex(role => role.id === user.role_id && !role.def) === -1)
					: group.users.filter(user => user.role_id === role.id);
			},
			onlineUsers(id) {
				let skillGroup = this.skillGroups.find(group => group.id === id);
				let onlineUsers = {
					all: skillGroup.users.length,
					online: skillGroup.users.filter(user => !!user.status).length
				};
				return `${onlineUsers.online}/${onlineUsers.all}`;
			}
		}
	};
</script>
