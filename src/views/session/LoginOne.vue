<template>
	<div class="session-wrapper">
		<div class="session-left">
			<session-slider-widget></session-slider-widget>
		</div>
		<div class="session-right text-center">
			<div class="session-table-cell">
				<div class="session-content">
					<img
							:src="appLogo"
							class="img-responsive mb-4"
							width="100"
							height="78"
					/>
					<h2 class="mb-4">{{$t('message.chat')}} {{brand}}</h2>
					<p class="fs-14">{{$t('message.enterUsernameAndPassword')}} {{brand}}.</p>
					<v-form v-model="valid" class="mb-5" ref="authForm">
						<v-text-field
								:label="$t('message.Login')"
								v-model="login"
								:rules="emailRules"
								required
						></v-text-field>
						<v-text-field
								:label="$t('message.Password')"
								v-model="password"
								type="password"
								:rules="passwordRules"
								required
						></v-text-field>
<!--						<v-checkbox-->
<!--								color="primary"-->
<!--								label="Remember me"-->
<!--								v-model="checkbox"-->
<!--						></v-checkbox>-->
						<div>
							<v-btn large @click="submit" block color="primary" class="mb-2">{{$t('message.login')}}</v-btn>
						</div>
					</v-form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters } from "vuex";
	import SessionSliderWidget from "Components/Widgets/SessionSlider";
	import AppConfig from "Constants/AppConfig";

	export default {
		components: {
			SessionSliderWidget
		},
		data() {
			return {
				checkbox: false,
				valid: false,
				login: "1008",
				emailRules: [
					v => !!v || this.$t('message.LoginRequired'),
					// v =>
					// 	/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
					// 	"E-mail must be valid"
				],
				password: "92209",
				passwordRules: [v => !!v || this.$t('message.PasswordRequired')],
				appLogo: AppConfig.appLogo2,
				brand: AppConfig.brand
			};
		},
		methods: {
			submit() {
				if(this.$refs.authForm.validate()) {
					const user = {
							login: this.login,
							password: this.password
						},
						vue = this;

					this.$store.dispatch("login", {user}).then(function () {
						console.log('login')
						let redirect = !!vue.$route.query.redirect ? vue.$route.query.redirect : '/';
						vue.$router.replace(redirect);
					});
				}
			}
		}
	};
</script>
