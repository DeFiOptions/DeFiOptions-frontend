import Web3Modal from "web3modal";
import Web3 from "web3";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
import Authereum from "authereum";
import router from '@/router';

const state = {
  activeAccount: null,
  activeBalance: 0,
  chainId: null,
  chainName: null,
  web3: null,
  isConnected: false,
  providerW3m: null, // this is "provider" from Web3Modal
  web3Modal: null,
  supportedChains: ["Kovan Testnet", "Polygon PoS Chain"],
  lastSelectedTradePair: null,
  lastSelectedTradeMaturity: null,
  lastSelectedTradeType: null
};

const getters = {
  getActiveAccount(state) {
    if (!state.activeAccount) {
      return window.ethereum.selectedAddress;
    }

    return state.activeAccount;
  },
  getActiveBalanceWei(state) {
    return state.activeBalance;
  },
  getActiveBalanceEth(state) {
    return state.web3.utils.fromWei(state.activeBalance, "ether");
  },
  getChainId(state) {
    return state.chainId;
  },
  getChainName(state) {
    return state.chainName;
  },
  getLastSelectedTradePair(state) {
    return state.lastSelectedTradePair;
  },
  getLastSelectedTradeMaturity(state) {
    return state.lastSelectedTradeMaturity;
  },
  getLastSelectedTradeType(state) {
    return state.lastSelectedTradeType;
  },
  getSupportedChains(state) {
    return state.supportedChains;
  },
  getWeb3(state) {
    if (state.web3) {
      return state.web3;
    } else {
      return new Web3(Web3.givenProvider);
    }
  },
  getWeb3Modal(state) {
    return state.web3Modal;
  },
  isCurrentChainSupported(state) {
    return state.supportedChains.includes(state.chainName);
  },
  isUserConnected(state) {
    return state.isConnected;
  }
};

const actions = {

  async initWeb3Modal({ commit }) {
    const providerOptions = {
      // MetaMask is enabled by default
      // Find other providers here: https://github.com/Web3Modal/web3modal/tree/master/docs/providers
      burnerconnect: {
        package: BurnerConnectProvider // required
      },
      authereum: {
        package: Authereum // required
      }
    };
    
    const w3mObject = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions // required
    });

    
    try {
      // This setting will get deprecated soon. Setting it to false removes a warning from the console.
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    catch(err) {
      console.log(err.message);
    }

    // if the user is flagged as already connected, automatically connect back to Web3Modal
    if (localStorage.getItem('isConnected') === "true") {
      let providerW3m = await w3mObject.connect();
      commit("setIsConnected", true);

      commit("setActiveAccount", window.ethereum.selectedAddress);
      commit("setChainData", window.ethereum.chainId);
      commit("setWeb3Provider", providerW3m);
      actions.fetchActiveBalance({ commit });
    }

    commit("setWeb3ModalInstance", w3mObject);
  },

  async connectWeb3Modal({ commit }) {
    let providerW3m = await state.web3Modal.connect();
    commit("setIsConnected", true);

    commit("setActiveAccount", window.ethereum.selectedAddress);
    commit("setChainData", window.ethereum.chainId);
    commit("setWeb3Provider", providerW3m);
    actions.fetchActiveBalance({ commit });
  },

  async disconnectWeb3Modal({ commit }) {
    commit("disconnectWallet");
    commit("setIsConnected", false);
  },

  async ethereumListener({ commit }) {

    try {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (state.isConnected) {
          commit("setActiveAccount", accounts[0]);
          commit("setWeb3Provider", state.providerW3m);
          actions.fetchActiveBalance({ commit });
        }
      });
    }
    catch(err) {
      console.log(err.message);
    }

    try {
      window.ethereum.on('chainChanged', (chainId) => {
        commit("setChainData", chainId);
        commit("setWeb3Provider", state.providerW3m);
        actions.fetchActiveBalance({ commit });
      });
    }
    catch(err) {
      console.log(err.message);
    }

  },

  async fetchActiveBalance({ commit }) {
    let balance = await state.web3.eth.getBalance(state.activeAccount);
    commit("setActiveBalance", balance);
  }
  
};

const mutations = {

  async disconnectWallet(state) {
    state.activeAccount = null;
    state.activeBalance = 0;
    state.web3 = null;
    if (state.providerW3m.close && state.providerW3m !== null) {
      await state.providerW3m.close();
    }
    state.providerW3m = null;
    await state.web3Modal.clearCachedProvider();

    // window.location.href = '../'; // redirect to the Main page
    router.push({ name: 'home'});
  },

  setActiveAccount(state, selectedAddress) {
    state.activeAccount = selectedAddress;
  },

  setActiveBalance(state, balance) {
    state.activeBalance = balance;
  },

  setChainData(state, chainId) {
    state.chainId = chainId;

    switch(chainId) {
      case "0x1":
        state.chainName = "Ethereum Mainnet";
        break;
      case "0x1A4":
        state.chainName = "Optimism Testnet";
        break;
      case "0x1E":
        state.chainName = "RSK Mainnet";
        break;
      case "0x2a":
        state.chainName = "Kovan Testnet";
        break;
      case "0x3":
        state.chainName = "Ropsten Testnet";
        break;
      case "0x4":
        state.chainName = "Rinkeby Testnet";
        break;
      case "0x5":
        state.chainName = "Goerli Testnet";
        break;
      case "0x38":
        state.chainName = "BSC Mainnet";
        break;
      case "0x64":
        state.chainName = "xDai Chain";
        break;
      case "0x80":
        state.chainName = "Huobi Chain";
        break;
      case "0x89":
        state.chainName = "Polygon PoS Chain";
        break;
      case "0xA86A":
        state.chainName = "Avalanche Mainnet";
        break;
      case "0xA869":
        state.chainName = "Avalanche Testnet";
        break;
      case "0x539": // 1337 (often used on localhost)
      case "0x1691": // 5777 (default in Ganache)
      default:
        state.chainName = "Localhost";
        break;
    }
  },

  setLastSelectedTradePair(state, pair) {
    window.console.log("setLastSelectedTradePair called: " + pair);
    state.lastSelectedTradePair = pair;
  },

  setLastSelectedTradeMaturity(state, maturity) {
    state.lastSelectedTradeMaturity = maturity;
  },

  setLastSelectedTradeType(state, type) {
    state.lastSelectedTradeType = type;
  },

  async setWeb3Provider(state, providerW3m) {
    state.providerW3m = providerW3m;
    state.web3 = new Web3(providerW3m);
  },

  setIsConnected(state, isConnected) {
    state.isConnected = isConnected;
    // add to persistent storage so that the user can be logged back in when revisiting website
    localStorage.setItem('isConnected', isConnected);
  },

  setWeb3ModalInstance(state, w3mObject) {
    state.web3Modal = w3mObject;
  }

};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
