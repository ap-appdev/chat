import Vue from 'vue'
import Router from 'vue-router'

import chat from './chat';


// session components
const LoginOne = () => import('Views/session/LoginOne');

Vue.use(Router)

export default new Router({
	base: process.env.BASE_URL,
	mode: 'history',
	routes: [
		chat,
		{
			path: '/login',
			component: LoginOne,
			meta: {
				title: 'message.login',
				breadcrumb: null
			}
		}
	]
})
