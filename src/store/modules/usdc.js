import ContractJson from "../../contracts/ERC20Mock.json";
import addresses from "../../contracts/addresses.json";

const ContractName = "USDC";

const state = {
  abi: null,
  address: null,
  contract: null,
  userBalance: null,
  permit: true, // does this token have the permit() method?
  decimals: 6
};

const getters = {
  getUsdcDecimals(state) {
    return state.decimals;
  },
  getUsdcAbi(state) {
    return state.abi;
  },
  getUsdcAddress(state) {
    return state.address;
  },
  getUsdcContract(state) {
    return state.contract;
  },
  getUserUsdcBalance(state) {
    return state.userBalance;
  },
  usesPermitUsdc(state) {
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
  async fetchUserBalance({ commit, state, rootState }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let address = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(address).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "mwei"); // mwei because USDC has 6 decimals

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
