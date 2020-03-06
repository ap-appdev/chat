<template>
	<v-app id="inspire">
		<router-view></router-view>
		<notifications
				group="auth"
				position="top right"
				animation-type="velocity"
		/>
		<notifications
				group="app"
				position="bottom right"
				animation-type="velocity"
		/>
		<notifications
				group="message"
				:duration="60000"
				:width="500"
				position="bottom left"
				animation-name="v-fade-left"
		>
			<template slot="body" slot-scope="props">
				<div class="custom-template">
					<div class="custom-template-icon">
						<i class="zmdi zmdi-comment-alt-text"></i>
					</div>
					<div class="custom-template-content">
						<div class="custom-template-title">
							{{props.item.title}}

							<div class="float-right">
								{{props.item.data.title}}
							</div>
						</div>
						<div class="custom-template-text">
							{{getPreviewTextChat(props.item.data.message)}}
							<div class="grey--text pt-1">
								<div class="float-left"><a @click="openChat(props.item.data.chat, props.close)">{{$t('message.openChat')}}</a></div>
								<div class="float-right">{{getDateMessage(props.item.data.message.date)}}</div>
							</div>

						</div>
					</div>
					<div class="custom-template-close"
					     @click="props.close">
						<i class="zmdi zmdi-close"></i>
					</div>
				</div>
			</template>
		</notifications>
	</v-app>
</template>

<script>
	import { getDateTimeMessage, handlingErrors, getPreviewTextChat } from "Helpers/helpers";

	import api from "Api";
	import { mapGetters } from "vuex";

	export default {
		computed: {
			...mapGetters(["token"])
		},
		data() {
			return {
				animation: {
					enter: {
						opacity: [1, 0],
						translateX: [0, -300],
						scale: [1, 0.2]
					},
					leave: {
						opacity: 0,
						height: 0
					}
				}
			};
		},
		created: function () {
			let vue = this;
			api.interceptors.response.use(undefined, function (err) {
				return new Promise(function (resolve, reject) {
					if (!!err.response && err.response.status === 401 && err.response.config && !err.response.config.__isRetryRequest) {
						vue.$store.dispatch("logout", true);
						// if you ever get an unauthorized, logout the user or refresh token
					}
					throw err;
				});
			});
		},
		sockets : {
			connect: function(){
				this.$socket.emit('authenticate', {token: this.token});
				console.log('socket connected');
			},
			disconnect: function(reason){
				if(reason === 'io server disconnect') {
					this.$socket.connect();
				}
				console.log('socket disconnect');
			},
			authenticated: function(){
				console.log('socket authenticated');
			},
			unauthorized: function(error){
				if (error.data.type === "UnauthorizedError" || error.data.code === "invalid_token") {
					this.$store.dispatch("logout", true);
					console.log("User's token has expired");
				}
			}
		},
		watch: {
			token: function (token) {
				this.$socket.emit('authenticate', {token});
			}
		},
		methods: {
			sendNotification(props) {
				let vue = this;
				if(!!props) this.$notification.show(props.item.title + ' ' + props.item.data.title, {
					body: getPreviewTextChat(props.item.data.message) + '\n' + getDateTimeMessage(props.item.data.message.date),
					icon:   '/static/img/notification.png'
				}, {
					onclick: function () {
						window.focus();
						vue.openChat(props.item.data.chat, props.close);
					}
				});
			},
			getDateMessage(date) {
				return getDateTimeMessage(date);
			},
			openChat(chat, close) {
				this.$store.dispatch("openChat", chat).catch(handlingErrors);
				close();
			},
			getPreviewTextChat
		}
	};
</script>
<style lang="scss">
	.custom-template {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		text-align: left;
		font-size: 11px;
		margin: 0 10px 10px;
		align-items: center;
		justify-content: center;
		&, & > div {
			box-sizing: border-box;
		}
		background: #E8F9F0;
		border: 2px solid #D0F2E1;
		.custom-template-icon {
			flex: 0 1 auto;
			color: #15C371;
			font-size: 32px;
			padding: 0 10px 0 15px;
		}
		.custom-template-close {
			flex: 0 1 auto;
			padding: 0 20px;
			font-size: 16px;
			opacity: 0.2;
			cursor: pointer;
			&:hover {
				opacity: 0.8;
			}
		}
		.custom-template-content {
			width: 355px;
			padding: 10px;
			flex: 1 0 auto;
			.custom-template-title {
				letter-spacing: 1px;
				/*text-transform: uppercase;*/
				font-size: 12px;
				font-weight: 600;
			}
		}
	}
	.v-fade-left-enter-active,
	.v-fade-left-leave-active,
	.v-fade-left-move {
		transition: all .5s;
	}
	.v-fade-left-enter,
	.v-fade-left-leave-to {
		opacity: 0;
		transform: translateX(-500px) scale(0.2);
	}
</style>