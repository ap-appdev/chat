const config = require('./config');
import 'babel-polyfill';
import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import VueResource from 'vue-resource'
import Notifications from 'vue-notification'
import velocity from 'velocity-animate'
import VueI18n from 'vue-i18n'
import Nprogress from 'nprogress'

// global components
import GlobalComponents from './globalComponents'

// app.vue
import App from './App'

// router
import router from './router'

// store
import { store } from './store/store';

// include all css files
import './lib/VuelyCss'

// messages
import messages from './lang';

import api from "Api";
const token = localStorage.getItem('user-token');
if (!!token) {
	api.defaults.headers.common['Authorization'] = `Token ${token}`
}

// Socket
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
	debug: false,
	connection: config.io.connection,
	vuex: {
		store,
		actionPrefix: config.io.actionPrefix
	}
}));

import moment from 'moment'
moment.locale(store.getters.selectedLocale.locale);

import VueObserveVisibility from 'vue-observe-visibility'
Vue.use(VueObserveVisibility);

Vue.config.productionTip = false;

// navigation guards before each
router.beforeEach((to, from, next) => {
	Nprogress.start()
	if (to.matched.some(record => record.meta.requiresAuth)) {
		// this route requires auth, check if logged in
		// if not, redirect to login page.

		// if (localStorage.getItem('user') === null) {
		if (!store.getters.isAuthenticated) {
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			})
		} else {
			next()
		}
	} else {
		next() // make sure to always call next()!
	}
})

// navigation guard after each
router.afterEach((to, from) => {
	Nprogress.done()
	setTimeout(() => {
		const contentWrapper = document.querySelector(".v-content__wrap");
		if(contentWrapper !== null){
			contentWrapper.scrollTop = 0;
		}
		const boxedLayout = document.querySelector('.app-boxed-layout .app-content');
		if(boxedLayout !==  null){
			boxedLayout.scrollTop = 0;
		}
		const miniLayout = document.querySelector('.app-mini-layout .app-content');
		if(miniLayout !== null){
			miniLayout.scrollTop = 0;
		}
	}, 200);
})

Vue.use(VueI18n)
Vue.use(VueResource)
Vue.use(Notifications, { velocity })
Vue.use(GlobalComponents);

// Create VueI18n instance with options
const i18n = new VueI18n({
	locale: store.getters.selectedLocale.locale, // set locale
	messages, // set locale messages
});


import VueNativeNotification from 'vue-native-notification'

Vue.use(VueNativeNotification, {
	requestOnNotify: true
});

// const token = localStorage.getItem('user-token')
// if (token) {
// 	axios.defaults.headers.common['Authorization'] = token
// }

/* eslint-disable no-new */
export default new Vue({
	store,
	i18n,
	router,
	vuetify,
	render: h => h(App),
	components: { App }
}).$mount('#app');
