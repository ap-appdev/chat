<template>
	<div class="chat-wrapper">
		<div class="app-flex justify-center align-center h-vh-100" v-if="loadingChat">
			<single-chat-loader></single-chat-loader>
		</div>
		<template v-else>
			<template v-if="!!selectedChat">
				<v-toolbar class="chat-head" ref="chatHeader">
					<div class="chat-head-left d-custom-flex align-items-center">
						<v-btn class="mr-2 ham-menu-icon d-none gray--text" @click="toggleChatSidebar" text icon small>
							<v-icon dark>menu</v-icon>
						</v-btn>
						<div class="media align-items-center mt-0">
							<div class="media-left mr-4 pos-relative">
								<template v-if="!!selectedChat.avatar">
									<img :src="selectedChat.avatar" alt="user-profile" class="rounded-circle pos-relative" width="40" height="40">
									<span :class="{'v-badge success rounded floating': !!selectedChat.status}"></span>
								</template>
								<template v-else>
									<v-avatar :class="!!selectedChat.color ? selectedChat.color : 'primary'" size="40">
										<span small class="white--text"> {{selectedChat.type === 'group' ? selectedChat.name.charAt(0) : selectedChat.fio.charAt(0)}}</span>
										<span :class="{'v-badge success rounded floating': !!selectedChat.status}"></span>
									</v-avatar>
								</template>
							</div>
							<div class="media-body" style="line-height: 1">
								<h6 class="mb-0">{{selectedChat.type === 'group' ? $t('message.generalChat')+' '+selectedChat.name : selectedChat.fio}}</h6>
								<span class="grey--text fs-12 d-inline-block fw-normal mt-2" v-if="!!selectedChat.status">{{$t('message.online')}}</span>
<!--								<span class="grey&#45;&#45;text fs-12 d-inline-block fw-normal" v-else>Last seen {{selectedChat.lastSeen}}</span>-->
							</div>
							<div class="media-right ml-4">
								<v-text-field text solo prepend-icon="search" clearable :placeholder="$t('message.search')" v-model="searchMessage" class="search-bar d-flex"></v-text-field>
							</div>
						</div>
					</div>
					<div class="chat-head-right">
						<div class="media d-inline-flex align-items-center text-right mt-0" style="vertical-align: middle">
							<div class="media-body ml-4" style="line-height: 1" v-if="selectedChat.type === 'user'">
								<h6 class="mb-0">{{selectedChat.skill_name}}</h6>
								<span class="grey--text fs-12 d-inline-block fw-normal mt-2">{{selectedChat.role_name}}</span>
							</div>
						</div>
						<v-menu
							offset-y
							origin="left left"
							transition="scale-transition"
							left
						>
							<template v-slot:activator="{ on }" >
								<v-btn v-on="on" icon class="ml-4">
									<v-icon>more_vert</v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item @click="openAllAttachments">
									<v-list-item-title>{{$t('message.showAttachments')}}</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</v-toolbar>
				<vue-perfect-scrollbar :style="chatBodyHeight" class="chat-area-scroll" :settings="settings">
					<chat-area-body :messages="selectedChat.messages" :height="chatBodyHeight"></chat-area-body>
				</vue-perfect-scrollbar>
				<div class="chat-footer pa-4" ref="chatFooter" v-if="selectedChat.check.write">
					<div class="d-custom-flex" style="align-items: flex-end;">
						<v-textarea
							hide-details
							name="input-1-3"
							:label="$t('message.sendMessage')"
							auto-grow
							autofocus
							no-resize
							rows="1"
							:value="newMessage"
							v-model="newMessage"
							single-line
							class="mr-4 mt-0 pt-2 chat-textarea"
							v-on:keyup.ctrl.enter="sendMessage"
						></v-textarea>

						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<v-btn fab small v-on="on" @click.stop="openAttachment">
									<v-icon dark>attachment</v-icon>
								</v-btn>
							</template>
							<span>{{$t('message.attachFile')}}</span>
						</v-tooltip>
						<v-btn fab class="chat-send-btn ml-4" dark small color="primary" @click="sendMessage">
							<v-icon dark>send</v-icon>
						</v-btn>
					</div>

					<!-- Dialog attachment -->
					<v-dialog v-model="attachment" max-width="600px">
						<v-card>
							<v-overlay :value="attachLoading">
								<single-chat-loader></single-chat-loader>
							</v-overlay>
							<v-card-title>
								{{$t('message.selectFilesChat')}}
							</v-card-title>
							<v-card-text>
								<v-form v-model="valid" class="mb-5" ref="attachForm">
									<v-file-input
											show-size
											counter
											small-chips
											multiple
											:label="$t('message.selectFiles')"
											v-model="attachFiles"
											:rules="filesRules"
											required
									></v-file-input>
									<v-text-field
											:label="$t('message.caption')"
											v-model="attachCaption"
									></v-text-field>
								</v-form>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn text color="primary" @click.stop="openAttachment">{{$t('message.cancel')}}</v-btn>
								<v-btn color="primary" @click.stop="sendAttachments">{{$t('message.submit')}}</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</div>

				<!-- All attachment -->
				<v-dialog v-model="allAttachments" max-width="1130px">
					<v-card>
						<v-overlay :value="attachLoading">
							<single-chat-loader></single-chat-loader>
						</v-overlay>
						<v-card-title>
							<v-spacer></v-spacer>
							<v-btn
									icon
									@click="allAttachments = !allAttachments"
							>
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</v-card-title>
						<v-card-text>
							<vue-perfect-scrollbar style="max-height: calc(100vh - 183px)" class="chat-area-scroll">
								<chat-area-body-files :files="allAttachmentsFiles" :all="true"></chat-area-body-files>
							</vue-perfect-scrollbar>
						</v-card-text>
					</v-card>
				</v-dialog>
			</template>
			<div class="chat-box-main" v-else>
				<div class="centered">
					<p><i class="zmdi zmdi-comments font-3x primary--text"></i></p>
					<v-btn class="select-user d-none" text color="primary" @click="toggleChatSidebar">
						{{$t('message.selectChat')}}
					</v-btn>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import SingleChatLoader from "./SingleChatLoader";
import ChatAreaBody from "./ChatAreaBody";
import ChatAreaBodyFiles from "./ChatAreaBodyFiles";
import { getCurrentAppLayout, handlingErrors } from "Helpers/helpers";

export default {
	computed: {
		...mapGetters(["selectedLocale", "getUser", "selectedChat", "loadingChat"]),
		chatBodyHeight: function () {
			let footerHeight = this.selectedChat.check.write ? +this.footer : 0;
			let h = footerHeight + 65;
			return "height: calc(100vh - " + h + "px)";
		}
	},
	data() {
		return {
			valid: false,
			filesRules: [v => !!v || this.$t('message.requiredFiles')],
			settings: {
				maxScrollbarLength: 260
			},
			searchMessage: "",
			newMessage: "",
			allAttachments: false,
			allAttachmentsFiles: null,
			attachment: false,
			attachFiles: null,
			attachCaption: "",
			attachLoading: false,
			footer: 73//81
		};
	},
	components: {
		SingleChatLoader,
		ChatAreaBody,
		ChatAreaBodyFiles
	},
	watch: {
		selectedChat: {
			handler: function (after, before) {
				if(after !== before) this.newMessage = '';
			}
		},
		newMessage: function (newMessage) {
			if(newMessage.length === 0) this.footer = 73;//81
			else this.footer = this.$refs.chatFooter.clientHeight;
		}
	},
	mounted(){
		this.scrollToEnd();
	},
	updated(){
		if(this.newMessage == ''){
			this.scrollToEnd();
		}
	},
	methods: {
		openAllAttachments() {
			this.allAttachments = true;
			this.attachLoading = true;
			this.$store.dispatch("getAllAttachments").then((res) => {
				this.allAttachmentsFiles = res.data;
			}).catch(handlingErrors).finally(() => {
				this.attachLoading = false;
			});
		},
		openAttachment() {
			this.valid = false;
			this.attachFiles = null;
			this.attachCaption = "";
			this.attachment = !this.attachment;
		},
		sendAttachments() {
			console.log(this.attachFiles)
			if(!this.$refs.attachForm.validate() || !Array.isArray(this.attachFiles) || this.attachFiles.length === 0) return false;
			this.attachLoading = true;
			let formData = new FormData();
			this.attachFiles.forEach(function (file, index) {
				formData.append('files[' + index + ']', file);
			});
			formData.append('caption', this.attachCaption);
			this.$store.dispatch("sendAttachments", formData).then((res) => {
				this.attachment = !this.attachment;
			}).catch(handlingErrors).finally(() => {
				this.attachLoading = false;
			});
			this.scrollToEnd();
		},
		sendMessage() {
			if (this.newMessage !== "") {
				this.$store.dispatch("sendMessage", this.newMessage).catch(handlingErrors);
				this.newMessage = "";
				this.scrollToEnd();
			}
		},
		toggleChatSidebar() {
			this.$store.dispatch("toggleChatSidebar", true);
		},
		getScrollHeight() {
			let layout = getCurrentAppLayout(this.$router);
			switch (layout) {
			case "default":
				return "height: calc(100vh - 200px)";
			case "horizontal":
				return "height: calc(100vh - 250px)";
			case "boxed":
				return "height: calc(100vh - 380px)";
			case "boxed-v2":
				return "height: calc(100vh - 380px)";
			case "chat":
				return "height: calc(100vh - 130px)";
			default:
				return "height: calc(100vh - 200px)";
			}
		},
		scrollToEnd() {
			var container = document.querySelector(".chat-area-scroll");
			if(container !== null){
				var scrollHeight = container.scrollHeight;
				container.scrollTop = scrollHeight;
			}	
		}
	}
};
</script>
