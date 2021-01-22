import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    signer: '',
    config: {},
  },
  mutations: {
    setSigner(state, payload) {
      state.signer = payload;
    },
    setConfig(state, payload) {
      state.config = payload;
    },
  },
  actions: {
    setSigner({ commit }, payload) {
      commit('setSigner', payload);
    },
    setConfig({ commit }, payload) {
      commit('setConfig', payload);
    },
  },
});
