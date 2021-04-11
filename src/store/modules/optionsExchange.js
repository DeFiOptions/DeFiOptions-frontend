import OptionsExchange from "../../contracts/OptionsExchange.json";
import addresses from "../../contracts/addresses.json";

const state = {
  abi: null,
  address: null,
  contract: null,
  poolBalance: null,
  userBalance: null,
  userOptions: null
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
  },
  getUserOptions(state) {
    return state.userOptions;
  }
};

const actions = {
  async fetchContract({ commit, rootState }) {
    let web3 = rootState.accounts.web3;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses.OptionsExchange[chainIdDec];
    let contract = new web3.eth.Contract(OptionsExchange.abi, address);
    commit("setContract", contract);
  },
  async fetchExchangeUserBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let activeAccount = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(activeAccount).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserExchangeBalance", balance);
  },
  async fetchLiquidityPoolBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses["LinearLiquidityPool"][chainIdDec];
    let balanceWei = await state.contract.methods.balanceOf(address).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setLiquidityPoolBalance", balance);
  },
  async fetchUserOptions({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let activeAccount = rootState.accounts.activeAccount;
    let options = await state.contract.methods.getBook(activeAccount).call();

    let web3 = rootState.accounts.web3;

    let symbolsList = options.symbols.split("\n");

    let optionsList = [];
    let counter = 0;
    for (let symbol of symbolsList) {
      let holding = web3.utils.fromWei(options.holding[counter], "ether");
      let written = web3.utils.fromWei(options.written[counter], "ether");
      let intrinsicValue = web3.utils.fromWei(options.iv[counter], "ether");
      
      let optionObject = {symbol, holding, written, intrinsicValue}
      optionsList.push(optionObject);

      counter++;
    }

    commit("setUserOptions", optionsList);
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
  setLiquidityPoolBalance(state, balance) {
    state.poolBalance = balance;
  },
  setUserExchangeBalance(state, balance) {
    state.userBalance = balance;
  },
  setUserOptions(state, options) {
    state.userOptions = options;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
