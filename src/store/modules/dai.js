import ContractJson from "../../contracts/Dai.json";
import addresses from "../../contracts/addresses.json";

const ContractName = "Dai";

const state = {
  abi: null,
  address: null,
  contract: null,
  decimals: 18,
  lpAllowance: 0, // liquidity pool contract Dai allowance for current user
  exchangeAllowance: 0,// exchange contract dai allowance for current user
  permit: true, // does this token have the permit() method?
  userBalance: null
};

const getters = {
  getDaiDecimals(state) {
    return state.decimals;
  },
  getDaiAbi(state) {
    return state.abi;
  },
  getDaiAddress(state) {
    return state.address;
  },
  getDaiContract(state) {
    return state.contract;
  },
  getLpDaiAllowance(state) {
    return state.lpAllowance;
  },
  getExchangeDaiAllowance(state) {
    return state.exchangeAllowance;
  },
  getUserDaiBalance(state) {
    return state.userBalance;
  },
  usesPermitDai(state) {
    return state.permit;
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
  async fetchLpAllowance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let userAddress = rootState.accounts.activeAccount;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let lpAddress = addresses.LinearLiquidityPool[chainIdDec];

    let allowanceWei = await state.contract.methods.allowance(userAddress, lpAddress).call();

    let web3 = rootState.accounts.web3;
    let allowance = web3.utils.fromWei(allowanceWei, "ether");

    commit("setLpAllowance", allowance);
  },
  async fetchExchangeAllowance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let userAddress = rootState.accounts.activeAccount;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let exchangeAddress = addresses.OptionsExchange[chainIdDec];

    let allowanceWei = await state.contract.methods.allowance(userAddress, exchangeAddress).call();

    let web3 = rootState.accounts.web3;
    let allowance = web3.utils.fromWei(allowanceWei, "ether");

    commit("setExchangeAllowance", allowance);
  },
  async fetchUserBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
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
  setLpAllowance(state, allowance) {
    state.lpAllowance = allowance;
  },
  setExchangeAllowance(state, allowance) {
    state.exchangeAllowance = allowance;
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
