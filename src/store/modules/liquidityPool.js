import LiquidityPool from "../../contracts/LinearLiquidityPool.json";
import addresses from "../../contracts/addresses.json";

const state = {
  abi: null,
  address: null,
  contract: null,
  apy: null,
  symbolsListJson: []
};

const getters = {
  getApy(state) {
    return state.apy;
  },
  getLiquidityPoolAbi(state) {
    return state.abi;
  },
  getLiquidityPoolAddress(state) {
    return state.address;
  },
  getLiquidityPoolContract(state) {
    return state.contract;
  },
  getSymbolsListJson(state) {
    return state.symbolsListJson;
  }
};

const actions = {
  async fetchContract({ commit, rootState }) {
    let web3 = rootState.accounts.web3;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses.LinearLiquidityPool[chainIdDec];
    let contract = new web3.eth.Contract(LiquidityPool.abi, address);
    commit("setContract", contract);
  },
  async fetchApy({ commit, state }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let apy = await state.contract.methods.apy().call();

    commit("setApy", apy);
  },
  async fetchSymbolsList({ commit, state, rootState }) {
    if (!state.contract) {
      this.fetchContract();
    }

    let web3 = rootState.accounts.web3;

    let symbolsRaw = await state.contract.methods.listSymbols().call();
    let symbolsLines = symbolsRaw.split("\n");

    let symbolsList = [];
    for (let item of symbolsLines) {
      let itemList = item.split("-");

      let typeName = "Call";
      if (itemList[1] === "EP") {
        typeName = "Put";
      }

      symbolsList.push({
        pair: itemList[0],
        typeCode: itemList[1],
        typeName: typeName,
        strikePriceSmallestUnit: Number(itemList[2]),
        strikePriceBigUnit: web3.utils.fromWei(Number(itemList[2]).toString(16), "ether"),
        maturityTimestamp: Number(itemList[3]),
        maturityHumanReadable: new Date(Number(itemList[3])*1e3).toLocaleDateString('en-GB', { day: 'numeric', 
                                                                                               month: 'long', 
                                                                                               year: 'numeric' })
      });
    }

    console.log("symbolsList:", symbolsList);

    commit("setSymbolsList", symbolsList);
  },
  storeAbi({commit}) {
    commit("setAbi", LiquidityPool.abi);
  },
  storeAddress({ commit, rootState }) {
    let chainIdDec = parseInt(rootState.accounts.chainId);

    commit("setAddress", addresses.LinearLiquidityPool[chainIdDec]);
  }
};

const mutations = {
  setAbi(state, abi) {
    state.abi = abi;
  },
  setAddress(state, address) {
    state.address = address;
  },
  setApy(state, apy) {
    state.apy = apy;
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
  setSymbolsList(state, symbolsRaw) {
    state;
    symbolsRaw;
    //state.symbolsListJson = symbolsRaw;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
