import OptionsExchange from "../../contracts/OptionsExchange.json";
import addresses from "../../contracts/addresses.json";

const state = {
  abi: null,
  address: null,
  contract: null,
  userBalance: null,
  poolBalance: null
};

const getters = {
  getExchangeUserBalance(state) {
    return state.userBalance;
  },
  getLiquidityPoolBalance(state) {
    return state.poolBalance;
  },
  getOptionsExchangeAbi(state) {
    return state.abi;
  },
  getOptionsExchangeAddress(state) {
    return state.address;
  },
  getOptionsExchangeContract(state) {
    return state.contract;
  }
};

const actions = {
  async fetchContract({ commit, rootState }) {
    let web3 = rootState.accounts.web3;
    let chainIdDec = parseInt(rootState.accounts.chainId);

    console.log("chainIdDec:", chainIdDec);

    let address = addresses.OptionsExchange[chainIdDec];

    console.log("OptionsExchange address:", address);

    let contract = new web3.eth.Contract(OptionsExchange.abi, address);
    commit("setContract", contract);
  },
  async fetchExchangeUserBalance({ commit, state, rootState }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let activeAccount = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(activeAccount).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserExchangeBalance", balance);
  },
  async fetchLiquidityPoolBalance({ commit, state, rootState }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses["LinearLiquidityPool"][chainIdDec];
    let balanceWei = await state.contract.methods.balanceOf(address).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setLiquidityPoolBalance", balance);
  },
  storeAbi({commit}) {
    commit("setAbi", OptionsExchange.abi);
  },
  storeAddress({ commit, rootState }) {
    let chainIdDec = parseInt(rootState.accounts.chainId);

    commit("setAddress", addresses.OptionsExchange[chainIdDec]);
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
  setUserExchangeBalance(state, balance) {
    state.userBalance = balance;
  },
  setLiquidityPoolBalance(state, balance) {
    state.poolBalance = balance;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
