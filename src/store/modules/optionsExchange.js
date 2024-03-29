import OptionsExchange from "../../contracts/OptionsExchange.json";
import addresses from "../../contracts/addresses.json";

const state = {
  abi: null,
  address: null,
  contract: null,
  poolBalance: null,
  userBalance: null,
  userSurplusBalance: null,
  userExchangeBalanceAllowance: null,
  userOptions: null,
  underlyingPrice: null
};

const getters = {
  getExchangeUserBalance(state) {
    return state.userBalance;
  },
  getUserCollateralSurplus(state) {
    return state.userSurplusBalance;
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
  getUnderlyingPrice(state) {
    // underlying price for the currently selected pair/symbol
    return state.underlyingPrice;
  },
  getOptionTokenAddress(state) {
    // option token address for the currently selected pair/symbol
    return state.optionTokenAddress;
  },
  getUserExchangeBalanceAllowance(state) {
    return state.userExchangeBalanceAllowance;
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
  async fetchExchangeBalanceAllowance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let chainIdDec = parseInt(rootState.accounts.chainId);
    let spender = addresses["LinearLiquidityPool"][chainIdDec];
    let owner = rootState.accounts.activeAccount;

    // check user's Exchange Balance allowance for the Liquidity Pool contract
    let allowanceWei = await state.contract.methods.allowance(owner, spender).call();

    let web3 = rootState.accounts.web3;
    let allowance = web3.utils.fromWei(allowanceWei, "ether");

    commit("setExchangeBalanceAllowance", allowance);
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
  async fetchExchangeCollateralSurplus({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let activeAccount = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.calcSurplus(activeAccount).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "ether");

    commit("setUserExchangeCollateralSurplus", balance);
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
  async fetchUnderlyingPrice({ commit, dispatch, state, rootState }, data) {
    // underlying price for the currently selected pair/symbol
    if (!state.contract) {
      dispatch("fetchContract");
    }

    commit("setUnderlyingPrice", "N/A");
    
    try {
      let underlyingPrice = await state.contract.methods.getUnderlyingPrice(String(data.symbol)).call();
      
      let web3 = rootState.accounts.web3;

      let underlyingPriceBig = Math.round(web3.utils.fromWei(Number(underlyingPrice).toString(16), "ether")*100)/100;
      commit("setUnderlyingPrice", underlyingPriceBig);
    } catch {
      commit("setUnderlyingPrice", "N/A");
    }
  },
  async fetchOptionTokenAddress({ commit, dispatch, state }, data) {
    // option token address for the currently selected pair/symbol
    if (!state.contract) {
      dispatch("fetchContract");
    }

    commit("setOptionTokenAddress", "N/A");
    
    try {
      let optionTokenAddress = await state.contract.methods.resolveToken(String(data.symbol)).call();
      commit("setOptionTokenAddress", optionTokenAddress);
    } catch {
      commit("setOptionTokenAddress", "N/A");
    }
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
    if (symbolsList[0] !== "") { // if the list is not empty  
      let counter = 0;
      
      for (let symbol of symbolsList) {
        let itemList = symbol.split("-");
        let pair = itemList[0];
        let udlSymbol = pair.split("/")[0];
        let timestamp = itemList[3];
        let strike = Math.round(web3.utils.fromWei(Number(itemList[2]).toString(16), "ether"));
        let strikeRaw = itemList[2];

        let holding = web3.utils.fromWei(options.holding[counter], "ether");
        let written = web3.utils.fromWei(options.written[counter], "ether");
        let intrinsicValue = web3.utils.fromWei(options.iv[counter], "ether");
        let address = options.tokens[counter];

        // type
        let type = "CALL";
        if (itemList[1] === "EP") {
          type = "PUT";
        }

        // maturity
        let maturity = new Date(Number(itemList[3])*1e3).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' });
        
        // option object
        let optionObject = {symbol, pair, udlSymbol, type, maturity, strike, strikeRaw, holding, written, intrinsicValue, timestamp, address}
        optionsList.push(optionObject);

        counter++;
      }
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
  setExchangeBalanceAllowance(state, allowance) {
    state.userExchangeBalanceAllowance = allowance;
  },
  setUserExchangeBalance(state, balance) {
    state.userBalance = balance;
  },
  setUserExchangeCollateralSurplus(state, balance) {
    state.userSurplusBalance = balance;
  },
  setUnderlyingPrice(state, underlyingPrice) {
    state.underlyingPrice = underlyingPrice;
  },
  setOptionTokenAddress(state, optionTokenAddress) {
    state.optionTokenAddress = optionTokenAddress;
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
