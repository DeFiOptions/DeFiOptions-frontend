import LiquidityPool from "../../contracts/LinearLiquidityPool.json";
import addresses from "../../contracts/addresses.json";

const state = {
  abi: null,
  address: null,
  apy: null,
  contract: null,
  defaultPair: null,
  defaultType: null,
  defaultMaturity: null,
  poolFreeBalance: null,
  poolWithdrawalFee: null,
  symbolsListJson: [],
  userBalance: null,
  userPoolUsdValue: null // USD value of the pool balance
};

const getters = {
  getApy(state) {
    return state.apy;
  },
  getDefaultMaturity(state) {
    return state.defaultMaturity;
  },
  getDefaultPair(state) {
    return state.defaultPair;
  },
  getDefaultType(state) {
    return state.defaultType;
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
  getLiquidityPoolFreeBalance(state) {
    return state.poolFreeBalance;
  },
  getLiquidityPoolUserBalance(state) {
    return state.userBalance;
  },
  getLiquidityPoolWithdrawalFee(state) {
    return state.poolWithdrawalFee;
  },
  getSymbolsListJson(state) {
    return state.symbolsListJson;
  },
  getUserPoolUsdValue(state) {
    return state.userPoolUsdValue;
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
  async fetchApy({ commit, dispatch, state }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let apy = await state.contract.methods.yield(365 * 24 * 60 * 60).call();
    let apyBig = ((apy-1e9)/1e9)*100;

    commit("setApy", apyBig);
  },
  async fetchSymbolsList({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let web3 = rootState.accounts.web3;

    const operation = { BUY: "1" }
    let symbolsRaw = await state.contract.methods.listSymbols(operation.BUY).call();

    commit("setSymbolsList", {web3, symbolsRaw});
  },
  async fetchPoolFreeBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let freeBalanceWei = await state.contract.methods.calcFreeBalance().call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(freeBalanceWei, "ether");

    commit("setPoolFreeBalance", balance);
  },
  async fetchPoolWithdrawalFee({ commit, dispatch, state }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    const withdrawalFeeBig = await state.contract.methods.withdrawFee().call();

    const wFeeSmall = Number(withdrawalFeeBig) / 1000000000; // divide to remove 9 decimal places
    const wFeePercentage = wFeeSmall * 100; // the result is percentage

    commit("setPoolWithdrawalFee", wFeePercentage);
  },
  async fetchUserBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let activeAccount = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(activeAccount).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserLiquidityPoolBalance", balance);
  },
  async fetchUserPoolUsdValue({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let activeAccount = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.valueOf(activeAccount).call();

    let web3 = rootState.accounts.web3;
    let value = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserPoolUsdValue", value);
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
  setDefaultMaturity(state, maturity) {
    state.defaultMaturity = maturity;
  },
  setDefaultPair(state, pair) {
    state.defaultPair = pair;
  },
  setDefaultType(state, type) {
    state.defaultType = type;
  },
  setPoolFreeBalance(state, balance) {
    state.poolFreeBalance = balance;
  },
  setPoolWithdrawalFee(state, fee) {
    state.poolWithdrawalFee = fee;
  },
  setUserLiquidityPoolBalance(state, balance) {
    state.userBalance = balance;
  },
  setUserPoolUsdValue(state, value) {
    state.userPoolUsdValue = value;
  },
  setSymbolsList(state, {web3, symbolsRaw}) {
    let symbolsLines = symbolsRaw.split("\n");

    let symbolsArray = {};

    for (let item of symbolsLines) {
      let itemList = item.split("-");

      // pair
      let pair = itemList[0];
      state.defaultPair = pair

      // type
      let typeName = "CALL";
      if (itemList[1] === "EP") {
        typeName = "PUT";
      }
      state.defaultType = typeName;

      // maturity
      let maturityHumanReadable = new Date(Number(itemList[3])*1e3).toLocaleDateString('en-GB', { day: 'numeric', 
        month: 'short', 
        year: 'numeric' });
      state.defaultMaturity = maturityHumanReadable;
      
      // strike price
      let strikePriceBigUnit = Math.round(web3.utils.fromWei(Number(itemList[2]).toString(16), "ether")*100)/100;

      // populate symbolsArray
      if (pair in symbolsArray) {
        if (maturityHumanReadable in symbolsArray[pair]) {
          if (typeName in symbolsArray[pair][maturityHumanReadable]) {
            if (!(strikePriceBigUnit in symbolsArray[pair][maturityHumanReadable][typeName])) {
              symbolsArray[pair][maturityHumanReadable][typeName].push({strike: strikePriceBigUnit, symbol: item});
            }
          } else {
            symbolsArray[pair][maturityHumanReadable][typeName] = [
              {strike: strikePriceBigUnit, symbol: item}
            ]
          }
        } else {
          symbolsArray[pair][maturityHumanReadable] = {
            [typeName]: [
              {strike: strikePriceBigUnit, symbol: item}
            ]
          }
        }
      } else {
        symbolsArray[pair] = {
          [maturityHumanReadable]: {
            [typeName]: [
              {strike: strikePriceBigUnit, symbol: item}
            ]
          }
        }
      }

    }

    state.symbolsListJson = symbolsArray;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
