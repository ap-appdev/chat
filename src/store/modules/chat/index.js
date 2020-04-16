import Vue from 'vue'
import api from "Api";
import { handlingErrors } from "Helpers/helpers";

const state = {
    skillGroups: null,
    offlineUsers: localStorage.getItem('offline-users') || false,
    loadingChatModule: false,
    selectedChat: null,
    loadingChat: false,
    loadingMessages: false,
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
    loadingMessages: state => {
        return state.loadingMessages
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
        context.commit('loadingChatModule', true);
        return new Promise((resolve, reject) => {
            api.get("users").then(response => {
                context.commit('setUsers', response.data);
                resolve(response)
            }).catch(handlingErrors).finally(() => {
                context.commit('loadingChatModule', false);
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
                // write = authUser.role_id === chat.role_id ? !!roleUser.role_write : (rolesWrite.indexOf(roleAuthUser.id.toString()) !== -1 || authRolesWrite.indexOf(roleUser.id.toString()) !== -1);
                write = rolesWrite.indexOf(roleAuthUser.id.toString()) !== -1 || authRolesWrite.indexOf(roleUser.id.toString()) !== -1;
            check.view = write;
            check.write = write;
        } else return false;
        return check;
    },
    async openChat({ getters, commit, dispatch }, payload) {
        if(getters.selectedChat == payload) return Promise.resolve();
        commit('loadingChat', true);
        let check =  await dispatch('checkChat', payload);
        if(!check.view) return Promise.reject(403);
        payload.check = check;
        commit('setChat', payload);
        commit('loadingChat', false);
    },
    async getMessages({getters, commit, dispatch}) {
        commit('loadingMessages', true);
        let chat = await dispatch('getCleanChat', getters.selectedChat);
        let last = !!getters.selectedChat.messages && getters.selectedChat.messages[0] ? getters.selectedChat.messages[0].id : 0;
        return api.post("messages", { chat, last }).then(response => {
            commit('appendChatMessages', response.data);
            return Promise.resolve(response);
        }).finally(() => {
            commit('loadingMessages', false);
        });
    },
    async sendAttachments({commit, dispatch, getters}, payload) {
        let chat = getters.selectedChat;
        let check =  await dispatch('checkChat', chat);
        if(!check.write) return Promise.reject(403);
        payload.append('chat', JSON.stringify(await dispatch('getCleanChat', chat)));
        return api.post("messages/attachments/add", payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    async getAllAttachments({getters, dispatch}) {
        return api.post("messages/attachments/get", {
            chat: await dispatch('getCleanChat', getters.selectedChat)
        }).catch(handlingErrors);
    },
    async sendMessage({commit, dispatch, getters}, payload) {
        let chat = getters.selectedChat;
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
    },
    SOCKET_readMessage({commit, rootGetters}, payload) {
        let authUser = rootGetters.getUser;
        commit('readMessage', {message: payload, authUser});
    }
}

// mutations
const mutations = {
    cleanChat(state) {
        state.skillGroups = null;
        state.selectedChat = null;
    },
    loadingChatModule(state, boolean) {
        state.loadingChatModule = boolean;
    },
    setUsers(state, skillGroups) {
        state.skillGroups = skillGroups;
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
    loadingChat(state, boolean) {
        state.loadingChat = boolean;
    },
    setChat(state, chat) {
        if(state.selectedChat && Array.isArray(state.selectedChat.messages) && state.selectedChat.messages.length) {
            state.selectedChat.messages = [state.selectedChat.messages.pop()];
        }
        if(chat.type === 'user') {
            let skillGroup = state.skillGroups.find(group => group.id === chat.skill_id);
            if(!!skillGroup) {
                chat.skill_name = skillGroup.name;
                chat.role = skillGroup.roles.find(role => role.id === chat.role_id);
            }
        }
        state.selectedChat = chat;
        state.chatSidebar = false;
    },
    loadingMessages(state, boolean) {
        state.loadingMessages = boolean;
    },
    appendChatMessages(state, messages) {
        if (!state.selectedChat) return false;
        // if (!!user.messages)
        //     user.messages.push(message);
        // else
        //     user.messages = [message];
        // state.selectedChat.messages.unshift(...messages);
        // const message = messages.find(message => message.unread);
        state.selectedChat.messages = messages.concat(!!state.selectedChat.messages ? state.selectedChat.messages : [])
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
                    if (message.unread) user.unread_count = +user.unread_count + 1;
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
                if (message.unread) skillGroup.unread_count = +skillGroup.unread_count + 1;
                if (!!skillGroup.messages)
                    skillGroup.messages.push(message);
                else
                    skillGroup.messages = [message];
                notify.title = skillGroup.name;
                notify.text = message.message;
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
    readMessage(state, data) {
        let { message, authUser } = data;
        if (message.type_message === 1) {
            let chat_agent_id = message.id_sender === authUser.agent_id ? message.id_recipient : message.id_sender;
            if(!!state.skillGroups) state.skillGroups.map(function (group) {
                let user = group.users.find(user => user.agent_id === chat_agent_id);
                if (user) readMessageChat(authUser, user, message);
            });
        } else {
            let skillGroup = state.skillGroups.find(group => group.id === message.id_skill_recipient);
            if (skillGroup) readMessageChat(authUser, skillGroup, message);
        }
    },
    toggleChatSidebarHandler(state, val) {
        state.chatSidebar = val;
    }
};

function readMessageChat(authUser, chat, message) {
    if (message.id_sender !== authUser.agent_id) chat.unread_count = +chat.unread_count > 0 ? (+chat.unread_count - 1) : 0;
    if (!!chat.messages) {
        let mess = chat.messages.find(mess => mess.id === message.id);
        if(mess) {
            if (mess.id_sender !== authUser.agent_id) mess.unread = false;
            else mess.notread_count = +mess.notread_count > 0 ? (+mess.notread_count - 1) : 0;
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
