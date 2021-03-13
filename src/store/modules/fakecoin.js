import ContractJson from "../../contracts/ERC20Mock.json";
import addresses from "../../contracts/addresses.json";

const ContractName = "FakeCoin";

const state = {
  abi: null,
  address: null,
  contract: null
};

const getters = {
  getFakecoinAbi(state) {
    return state.abi;
  },
  getFakecoinAddress(state) {
    return state.address;
  },
  getFakecoinContract(state) {
    return state.contract;
  }
};

const actions = {
  async fetchContract({ commit, rootState }) {
    let web3 = rootState.accounts.web3;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses[ContractName][chainIdDec];
    let contract = new web3.eth.Contract(ContractJson.abi, address);
    commit("setContract", contract);
  },
  storeAbi({commit}) {
    commit("setAbi", ContractJson.abi);
  },
  storeAddress({ commit, rootState }) {
    let chainIdDec = parseInt(rootState.accounts.chainId);
    commit("setAddress", addresses[ContractName][chainIdDec]);
  }
};

const mutations = {
  setAbi(state, abi) {
    state.abi = abi;
  },
  setAddress(state, address) {
    state.address = address;
  },
  setContract(state, _contract) {
    state.contract = _contract;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
