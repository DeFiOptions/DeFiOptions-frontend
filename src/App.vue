<template>
  <div class="container">
    <Navbar />

    <div v-if="isUserConnected && !getChainName" class="alert alert-danger" role="alert">
      You are on an unsupported network. Click here to connect to either 
      <span @click="switchToPolygon" class="network-switch-link">Polygon</span> or 
      <span @click="switchToKovan" class="network-switch-link">Kovan testnet</span>.
    </div>

    <router-view />

    <Footer />

    <!-- Compliance modal -->
    <div v-if="isCompliant !== 'true'" class="modal" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Information and Compliance</h5>
          </div>
          <div class="modal-body">
            Before I start using DeFiOptions, I confirm that:

            <ul>
              <li>
                I am aware that DeFi Options has been audited by PeckShield, thoroughly tested on the Kovan testnet, 
                but hasn't been battle tested in a live environment yet, so I will use it at my own risk.
              </li>
              <li>
                Before interacting with DeFi Options, I am aware of the 
                <a href="https://docs.defioptions.org/knowledge-base/risk-factors" target="_blank">risk factors</a> 
                related to options trading.
              </li>
              <li>
                I confirm that I am <strong>not</strong> located, incorporated, or otherwise established in, or a 
                resident of the United States of America.
              </li>
            </ul>

            <p>If you cannot confirm all of the above, please leave this website.</p>
          </div>
          <div class="modal-footer">
            <button @click="confirmCompliance" type="button" class="btn btn-primary">I confirm all of the above</button>
            <button @click="leaveWebsite" type="button" class="btn btn-danger text-capitalize">Leave</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Compliance modal -->

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Footer from './components/Footer.vue';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',

  components: {
    Navbar,
    Footer
  },

  data() {
    return {
      isCompliant: null
    }
  },

  computed: {
    ...mapGetters("accounts", ["getChainName", "getSupportedChains", "isUserConnected"]),
  },

  created() {
    // check if user has already confirmed the compliance modal
    this.isCompliant = localStorage.getItem('isCompliant');
  },

  methods: {
    confirmCompliance() {
      this.isCompliant = "true";
      localStorage.setItem("isCompliant", "true");
    },
    leaveWebsite() {
      window.location.href = "https://docs.defioptions.org/disclaimer";
    },
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
  },

  watch: {
    getChainName: function () {
      // update everything whenever the network is changed
      this.$store.dispatch("optionsExchange/fetchContract");
      this.$store.dispatch("optionsExchange/storeAddress");
      this.$store.dispatch("liquidityPool/fetchContract");
      this.$store.dispatch("liquidityPool/storeAddress");
      this.$store.dispatch("dai/fetchContract");
      this.$store.dispatch("dai/storeAddress");
      this.$store.dispatch("usdc/fetchContract");
      this.$store.dispatch("usdc/storeAddress");
      this.$store.dispatch("creditToken/fetchContract");
      this.$store.dispatch("creditToken/storeAddress");

      this.$store.dispatch("dai/fetchUserBalance");
      this.$store.dispatch("usdc/fetchUserBalance");
      this.$store.dispatch("dai/fetchLpAllowance");
      this.$store.dispatch("usdc/fetchLpAllowance");

      this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
      this.$store.dispatch("optionsExchange/fetchUserOptions");
      this.$store.dispatch("optionsExchange/fetchExchangeBalanceAllowance");
      this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");

      this.$store.dispatch("liquidityPool/fetchUserBalance");
      this.$store.dispatch("liquidityPool/fetchSymbolsList");
      this.$store.dispatch("liquidityPool/fetchApy");
      this.$store.dispatch("liquidityPool/fetchUserPoolUsdValue");
      this.$store.dispatch("liquidityPool/fetchPoolFreeBalance");
      this.$store.dispatch("liquidityPool/fetchPoolWithdrawalFee");
      this.$store.dispatch("liquidityPool/fetchPoolMaturityDate");

      this.$store.dispatch("creditToken/fetchUserBalance");

      this.$store.dispatch("accounts/fetchActiveBalance");
    }
  }
}
</script>

<style scoped>
 .modal {
   display: block;
 }

.network-switch-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
