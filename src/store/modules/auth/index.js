/**
 * Auth Module
 */
import Nprogress from 'nprogress';
import api from "Api";
import router from '../../../router'
import { getCurrentAppLayout, handlingErrors } from "Helpers/helpers";

const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('user-token') || ''
};

const getters = {
    getUser: state => {
        return state.user;
    },
    token: state => {
        return state.token;
    },
    isAuthenticated: state => !!state.token,
};

const actions = {
    login({commit, dispatch}, payload) {
        const { user } = payload;
        Nprogress.start();
        return new Promise((resolve, reject) => {
            api.post("login", user).then(response => {
                let { data: {user, token} } = response;
                console.log(user, token);
                commit('loginUserSuccess', { user, token });
                resolve(user)
            }).catch(error => {
                console.log(error.response)
                commit('loginUserFailure', error);
                reject()
            });
        });
    },
    logout({commit, dispatch}, unauth) {
        Nprogress.start();
        dispatch('cleanChat');
        if(!!unauth) return commit('logoutUser');
        return new Promise((resolve, reject) => {
            api.post("logout").then(response => {
                console.log(response);
                resolve(response)
            }).catch(handlingErrors).finally(() => {
                commit('logoutUser');
            });
        });
    },
};

const mutations = {
    loginUserSuccess(state, resp) {
        Nprogress.done();
        state.user = resp.user;
        state.token = resp.token;
        setAuth(resp);
    },
    loginUserFailure(state, error) {
        Nprogress.done();
        state.user = null;
        state.token = null;
        setAuth();
        handlingErrors(error)
    },
    logoutUser(state) {
        Nprogress.done();
        if(getCurrentAppLayout(router) !== 'login') router.push('/login');
        state.user = null;
        state.token = null;
        setAuth();
    }
};

function setAuth(authData) {
    if(!!authData) {
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('user-token', authData.token);
        api.defaults.headers.common['Authorization'] = `Token ${authData.token}`;
    } else {
        localStorage.removeItem('user');
        localStorage.removeItem('user-token');
        delete api.defaults.headers.common['Authorization'];
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
