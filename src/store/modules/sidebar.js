const state = {
  collapsed: false
};

const getters = {
  getCollapsedStatus(state) {
    return state.collapsed;
  }
};

const actions = {
  async sidebarCollapsedTrue({ commit }) {
    commit("setCollapsedStatus", true);
  },
  async sidebarCollapsedFalse({ commit }) {
    commit("setCollapsedStatus", false);
  },
};

const mutations = {
  setCollapsedStatus(state, status) {
    state.collapsed = status;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
