import ContractJson from "../../contracts/ERC20.json";
import addresses from "../../contracts/addresses.json";

const ContractName = "FakeCoin";

const state = {
  abi: null,
  address: null,
  contract: null,
  userBalance: null
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
  },
  getUserFakecoinBalance(state) {
    return state.userBalance;
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
  async fetchUserBalance({ commit, state, rootState }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let address = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(address).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserBalance", balance);
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
  },
  setUserBalance(state, balance) {
    state.userBalance = balance;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
