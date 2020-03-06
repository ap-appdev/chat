<template>
	<div v-if="files" class="chat-attachments overflow-x-hidden">
		<v-row>
			<v-col
					v-for="(file, index) in files"
					:key="index"
					class="d-flex child-flex"
					cols="auto"
			>
				<v-card flat  max-width="160">
						<v-img
								:src="getUrlPreview(file)"
								:lazy-src="getUrlPreview(file)"
								aspect-ratio="1"
								class="grey lighten-2"
								:style="file.mimetype.indexOf('image') === -1 || 'cursor:zoom-in'"
								@click="openImage(file)"
						>
							<template v-slot:placeholder>
								<v-row
										class="fill-height ma-0"
										align="center"
										justify="center"
								>
									<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
								</v-row>
							</template>
						</v-img>
<!--					<div class="text-right grey&#45;&#45;text">{{getDateTimeMessage(file.date)}}</div>-->
					<v-card-actions>
						<h6 class="m-0 overflow-hidden">{{file.originalname}}</h6>
						<v-spacer></v-spacer>
						<a :href="getUrl(file)" download="">
							<v-btn icon>
								<v-icon>mdi-download</v-icon>
							</v-btn>
						</a>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
		<v-dialog
				v-model="openDialogImage"
				max-width="100%"
		>
			<v-card ref="pCard">
				<v-card-title class="headline" ref="pTitle">
					<v-spacer></v-spacer>
					<v-btn
							icon
							@click="openImage()"
					>
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>

				<v-card-text>
					<vue-perfect-scrollbar style="max-height: calc(100vh - 235px)" class="chat-area-scroll">
						<v-img
								:src="getUrl(selectedImage)"
								:lazy-src="getUrl(selectedImage)"
								class="grey lighten-2"
						>
							<template v-slot:placeholder>
								<v-row
										class="fill-height ma-0"
										align="center"
										justify="center"
								>
									<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
								</v-row>
							</template>
						</v-img>
					</vue-perfect-scrollbar>
				</v-card-text>
				<v-card-actions ref="pActions">
					<h6 class="m-0 overflow-hidden" v-if="selectedImage">{{selectedImage.originalname}}</h6>
					<v-spacer></v-spacer>
					<a :href="getUrl(selectedImage)" download="">
						<v-btn icon>
							<v-icon>mdi-download</v-icon>
						</v-btn>
					</a>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { getHrefAttachments, getHrefFileType, getDateTimeMessage } from "Helpers/helpers";

export default {
	props: ["files", "all"],
	data() {
		return {
			openDialogImage: false,
			selectedImage: null
		}
	},
	computed: {
		...mapGetters(["getUser"])
	},
	methods: {
		openImage(file) {
			if(!!file && file.mimetype.indexOf('image') === -1) return false;
			this.openDialogImage = !this.openDialogImage;
			this.selectedImage = !!file ? file : null;
		},
		getUrlPreview(file) {
			if(!file) return;
			if(file.mimetype.indexOf('image') === -1) {
				return getHrefFileType(file.originalname);
			}
			else return getHrefAttachments(this.getUser, file);
		},
		getUrl(file) {
			if(!file) return;
			else return getHrefAttachments(this.getUser, file);
		},
		getDateTimeMessage
	}
};
</script>
