<template>
   <v-list-item class="sidebar-profile pa-0"  v-if="!!user">
		<v-list-item-avatar class="mr-4">
			<template v-if="!!user.avatar">
				<img :src="user.avatar" alt="user-profile" class="rounded-circle pos-relative" width="40" height="40">
			</template>
			<template v-else>
				<v-avatar :class="!!user.color ? user.color : 'accent'" size="40">
					<span small class="white--text"> {{user.fio.f.charAt(0)}}</span>
				</v-avatar>
			</template>
		</v-list-item-avatar>
		<v-list-item-content>
			<v-list-item-title>
				<span class="white--text fs-14 fw-normal d-block">{{user.fio.f}} {{user.fio.i}}</span>
				<span class="d-block fs-12 mt-1">{{user.role_name}}</span>
			</v-list-item-title>
		</v-list-item-content>

	   <language-provider></language-provider>
		<v-menu 
			bottom
			offset-y
			left
			content-class="userblock-dropdown" 
			nudge-top="-10"
			nudge-right="0"
			transition="slide-y-transition"
		>	
			<template v-slot:activator="{ on }">
				<v-btn dark icon v-on="on" class="ma-0">
					<v-icon>more_vert</v-icon>
				</v-btn>
			</template>
			<div class="dropdown-content">
<!--				<div class="dropdown-top white&#45;&#45;text primary">-->
<!--					<span class="white&#45;&#45;text fs-14 fw-bold d-block">Попов Андрей</span>-->
<!--					<span class="d-block fs-12 fw-normal">Администратор</span>-->
<!--				</div>-->
				<v-list class="dropdown-list">
					<template v-for="userLink in userLinks" v-if="userLink.id !== 4">
						<v-list-item :to="getMenuLink(userLink.path)" :key="userLink.id">
							<i :class="userLink.icon"></i>
							<span>{{$t(userLink.title)}}</span>
						</v-list-item>
					</template>
					<template v-else>
						<v-list-item @click="logoutUser" :key="userLink.id">
							<i :class="userLink.icon"></i>
							<span>{{$t(userLink.title)}}</span>
						</v-list-item>
					</template>
				</v-list>
			</div>
		</v-menu>
   </v-list-item>
</template>

<script>
import { mapGetters } from "vuex";
import { getCurrentAppLayout } from "Helpers/helpers";
import LanguageProvider from "../Header/LanguageProvider";

export default {
	components: {
		LanguageProvider
	},
	computed: {
		...mapGetters({
			user: 'getUser'
		})
	},
	data() {
		return {
			userLinks: [
				{
					id: 4,
					title: 'message.logOut',
					icon: 'ti-power-off mr-3 error--text'
				}
			]
		}
	},
  methods: {
    logoutUser() {
      this.$store.dispatch("logout");
	 },
	 getMenuLink(path) {
		 return '/' + getCurrentAppLayout(this.$router) +  path;
	 }
  }
};
</script>
