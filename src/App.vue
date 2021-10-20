<template>
  <div class="container">
    <Navbar />

    <div v-if="!getChainName" class="alert alert-danger" role="alert">
      You are on an unsupported network. Click here to connect to either 
      <span @click="switchToPolygon" class="network-switch-link">Polygon</span> or 
      <span @click="switchToKovan" class="network-switch-link">Kovan testnet</span>.
    </div>

    <router-view />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',

  components: {
    Navbar
  },

  computed: {
    ...mapGetters("accounts", ["getChainName", "getSupportedChains"]),
  },

  methods: {
    switchToPolygon() {
      window.ethereum.request({ 
        method: 'wallet_addEthereumChain', 
        params: [{ 
          chainId: '0x89', 
          chainName: 'Polygon PoS Chain', 
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, 
          rpcUrls: ['https://polygon-rpc.com/'], 
          blockExplorerUrls: ['https://polygonscan.com/']
        }] 
      });
    },
    switchToKovan() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x2a'
        }] 
      });
    }
  }
}
</script>

<style scoped>
.network-switch-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
