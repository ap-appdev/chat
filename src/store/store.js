import Vue from 'vue'
import Vuex from 'vuex'

// modules
import auth from './modules/auth';
import chat from './modules/chat';
import settings from './modules/settings';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        auth,
        chat,
        settings
    }
})
