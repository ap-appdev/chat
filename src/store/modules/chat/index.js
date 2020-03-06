/**
 * Auth Module
 */
import Vue from 'vue'
import api from "Api";
import FileSaver from "file-saver";
// import object from "auth0-js/src/helper/object";

const state = {
    skillGroups: null,
    offlineUsers: localStorage.getItem('offline-users') || false,
    loadingChatModule: false,
    selectedChat: null,
    loadingChat: false,
    chatSidebar: false
};

// getters
const getters = {
    loadingChatModule: state => {
        return state.loadingChatModule
    },
    skillGroups: state => {
        return state.skillGroups
    },
    offlineUsers: state => {
        return String(state.offlineUsers) === 'true'
    },
    selectedChat: state => {
        return state.selectedChat
    },
    loadingChat: state => {
        return state.loadingChat
    },
    chatSidebar: state => {
        return state.chatSidebar
    }
}

// actions
const actions = {
    cleanChat({commit}, payload) {
        return commit('cleanChat', payload);
    },
    getUsers(context) {
        context.commit('getUsers');
        return new Promise((resolve, reject) => {
            api.get("users").then(response => {
                context.commit('getUsersSuccess', response.data);
                console.log(response)
                resolve(response)
            });
        });
    },
    offlineUsers(context, payload) {
        context.commit('offlineUsers', !!payload);
    },
    getCleanChat({}, payload) {
        let chat = Object.assign({}, payload);
        if(!!chat.messages) delete chat.messages;
        if(!!chat.users) delete chat.users;
        if(!!chat.roles) delete chat.roles;
        return chat;
    },
    checkChat({getters, rootGetters}, chat) {
        let check = {view: false, write: false};
        let authUser = rootGetters.getUser;
        let skillId = chat.type === 'group' ? chat.id : chat.skill_id;
        if(!skillId) return check;
        let skillGroup = getters.skillGroups.find(group => group.id === skillId);
        if(!skillGroup) return check;
        let roleAuthUser = skillGroup.roles.find(role => role.id === authUser.role_id);
        if(chat.type === 'group') {
            check.view = !!roleAuthUser.general_view;
            check.write = !!roleAuthUser.general_write;
        } else if(chat.type === 'user') {
            let roleUser = skillGroup.roles.find(role => role.id === chat.role_id),
                authRolesWrite = !!roleAuthUser.roles_write ? roleAuthUser.roles_write.split(',') : [],
                rolesWrite = !!roleUser.roles_write ? roleUser.roles_write.split(',') : [],
                write = authUser.role_id === chat.role_id ? !!roleUser.role_write : (rolesWrite.indexOf(roleAuthUser.id.toString()) !== -1 || authRolesWrite.indexOf(roleUser.id.toString()) !== -1);
            check.view = write;
            check.write = write;
        } else return false;
        return check;
    },
    async openChat({state, commit, dispatch}, payload) {
        if(state.selectedChat == payload) return Promise.resolve();
        let check =  await dispatch('checkChat', payload);
        if(!check.view) return Promise.reject(403);
        payload.check = check;
        commit('loadChat', payload);
        let chat =  await dispatch('getCleanChat', payload);
        return api.post("messages", chat).then(response => {
            commit('loadChatSuccess', response.data);
        }).catch(error => {
            commit('loadChatError');
        });
    },
    async sendAttachments({commit, dispatch, getters}, payload) {
        let chat = getters.selectedChat;
        console.log(payload)
        let check =  await dispatch('checkChat', chat);
        if(!check.write) return Promise.reject(403);
        payload.append('chat', JSON.stringify(await dispatch('getCleanChat', chat)));
        return api.post("messages/attachments/add", payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    async getAllAttachments({getters}) {
        return api.post("messages/attachments/get", {
            chat: getters.selectedChat
        });
    },
    async sendMessage({commit, dispatch, getters}, payload) {
        let chat = getters.selectedChat;
        console.log(payload)
        let check =  await dispatch('checkChat', chat);
        if(!check.write) return Promise.reject(403);
        let message = {
            chat: await dispatch('getCleanChat', chat),
            message: payload
        };
        return api.post("messages/add", message);
    },
    toggleChatSidebar(context, payload) {
        context.commit('toggleChatSidebarHandler', payload);
    },
    SOCKET_userConnect(context, payload) {
        context.commit('userConnect', payload);
    },
    SOCKET_userDisconnect(context, payload) {
        context.commit('userDisconnect', payload);
    },
    SOCKET_newMessage({commit, rootGetters}, payload) {
        let authUser = rootGetters.getUser;
        commit('newMessage', {message: payload, authUser});
    }
}

// mutations
const mutations = {
    cleanChat(state) {
        state.skillGroups = null;
        state.selectedChat = null;
    },
    getUsers(state) {
        state.loadingChatModule = true;
    },
    getUsersSuccess(state, skillGroups) {
        state.skillGroups = skillGroups;
        state.loadingChatModule = false;
    },
    userConnect(state, agent_id) {
        if(!!state.skillGroups) state.skillGroups.forEach(function (group) {
            let user = group.users.find(user => user.agent_id === agent_id);
            if(!!user) Object.assign(user, {status: true})
        });
    },
    userDisconnect(state, agent_id) {
        if(!!state.skillGroups) state.skillGroups.forEach(function (group) {
            let user = group.users.find(user => user.agent_id === agent_id);
            if(!!user) Object.assign(user, {status: false})
        });
    },
    offlineUsers(state, status) {
        state.offlineUsers = status;
        localStorage.setItem('offline-users', status);
    },
    loadChat(state, chat) {
        if(chat.type === 'user') {
            let skillGroup = state.skillGroups.find(group => group.id === chat.skill_id);
            if(!!skillGroup) {
                chat.skill_name = skillGroup.name;
                chat.role = skillGroup.roles.find(role => role.id === chat.role_id);
            }
        }
        state.loadingChat = true;
        state.selectedChat = chat;
        state.chatSidebar = false;
    },
    loadChatSuccess(state, messages) {
        state.loadingChat = false;
        state.selectedChat.messages = messages;
    },
    loadChatError(state) {
        state.selectedChat = null;
        state.loadingChat = false;
    },
    newMessage(state, data) {
        let {message, authUser} = data;
        let notify = {title: '', text: '', data: {message}};
        let selectedChat = state.selectedChat ? state.selectedChat : {};
        let selected = true;
        if (message.type_message === 1) {
            let chat_agent_id = message.id_sender === authUser.agent_id ? message.id_recipient : message.id_sender;
            selected = selectedChat.agent_id === chat_agent_id;
            if(!!state.skillGroups) state.skillGroups.forEach(function (group) {
                let user = group.users.find(user => user.agent_id === chat_agent_id);
                if(user) {
                    if (!!user.messages)
                        user.messages.push(message);
                    else
                        user.messages = [message];
                }
                if(group.id === message.id_skill_recipient) {
                    notify.data.chat = user;
                    notify.data.title = group.name;
                }
            });
            notify.title = message.fio_sender;
            notify.text = message.message;
        } else {
            let skillGroup = state.skillGroups.find(group => group.id === message.id_skill_recipient);
            selected = selectedChat.id === skillGroup.id;
            if(skillGroup) {
                if (!!skillGroup.messages)
                    skillGroup.messages.push(message);
                else
                    skillGroup.messages = [message];
                notify.title = skillGroup.name;
                notify.text =  + ': ' + message.message;
                notify.data.chat = skillGroup;
                notify.data.title = message.fio_sender;
            }
        }
        if(message.id_sender !== authUser.agent_id && !selected) {
            Vue.notify({
                group: 'message',
                type: 'success',
                title: notify.title,
                text: notify.text,
                data: notify.data
            });
        }
    },
    toggleChatSidebarHandler(state, val) {
        state.chatSidebar = val;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}
