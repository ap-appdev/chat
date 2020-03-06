<template>
	<v-list-group
			:ripple="false"
			no-action
			sub-group
	>
		<template v-slot:activator>
			<v-list-item-content>
				<v-list-item-title>{{header}}</v-list-item-title>
			</v-list-item-content>
			<v-list-item-icon>{{onlineUsers}}</v-list-item-icon>
		</template>
		<div>
			<template v-for="(item, index) in users">
				<sidebar-item
						v-if="(!!offlineUsers && !item.status) || !!item.status"
						:key="index"
						:item="item"
				></sidebar-item>
			</template>
		</div>
	</v-list-group>
</template>

<script>
	import SidebarItem from "./SidebarItem";

	export default {
		props: ["users", "header", "offlineUsers"],
		components: {
			SidebarItem
		},
		computed: {
			onlineUsers() {
				return this.users.filter(user => !!user.status).length + '/' + this.users.length
			}
		}
	};
</script>
