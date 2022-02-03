<template>
  <nav class="navbar navbar-expand-xl navbar-dark primary-color">
    <div class="container-fluid">

      <router-link to="/" style="text-decoration: none">
        <a class="navbar-brand primary-color" href="/">
          <img src="@/assets/logo.svg" alt="" width="30" height="24">
          DeFi Options
        </a>
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <ul class="navbar-nav me-auto mb-2 mb-lg-0 text-uppercase">
          <!-- Nav Item - Trade -->
          <router-link to="/trade" style="text-decoration: none" v-if="isUserConnected">
            <li class="nav-item">
                <a class="nav-link" :class="{active:this.$route.name === 'trade'}" href="/trade">Trade</a>
            </li>
          </router-link>
          <!-- END Nav Item - Trade -->

          <!-- Nav Item - Liquidity pool -->
          <router-link to="/invest" style="text-decoration: none" v-if="isUserConnected">
            <li class="nav-item">
                <a class="nav-link" :class="{active:this.$route.name === 'invest'}" href="/invest">Liquidity pool</a>
            </li>
          </router-link>
          <!-- END Nav Item - Liquidity pool -->

          <!-- Nav Item - Portfolio -->
          <router-link to="/portfolio" style="text-decoration: none" v-if="isUserConnected">
            <li class="nav-item">
                <a class="nav-link" :class="{active:this.$route.name === 'portfolio'}" href="/portfolio">Portfolio</a>
            </li>
          </router-link>
          <!-- END Nav Item - Portfolio -->

          <li class="nav-item dropdown" v-if="isUserConnected">
            <a class="nav-link dropdown-toggle primary-color" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              More
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <a class="dropdown-item" target="_blank" href="https://dune.xyz/dod/DeFi-Options?period=3months">
                  <i class="fas fa-chart-bar"></i> Analytics
                </a>
              </li>
              <li>
                <a class="dropdown-item" target="_blank" href="https://docs.defioptions.org/">
                  <i class="fas fa-book"></i> Docs
                </a>
              </li>
              <li><a class="dropdown-item" target="_blank" href="irc://web.libera.chat/DeFiOptionsDAO">
                <i class="fab fa-irc"></i> IRC
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://discord.gg/WCeKgHNz3z">
                <i class="fab fa-discord"></i> Discord
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://forum.defioptions.org/">
                <i class="fab fa-discourse"></i> Forum
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://github.com/DeFiOptions">
                <i class="fab fa-github"></i> GitHub
              </a></li>
              <li>
                <a class="dropdown-item" target="_blank" href="https://snapshot.org/#/defioptionsdao.eth">
                  <i class="fas fa-landmark"></i> Governance
                </a>
              </li>
              <li><a class="dropdown-item" target="_blank" href="https://reddit.com/r/DeFiOptionsDAO/">
                <i class="fab fa-reddit"></i> Reddit
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://t.me/DeFiOptionsDiscussions">
                <i class="fab fa-telegram"></i> Telegram
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://twitter.com/DeFiOptionsDAO">
                <i class="fab fa-twitter"></i> Twitter
              </a></li>
            </ul>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 text-uppercase mx-5" v-if="!isUserConnected">
          <li class="nav-item">
            <a class="nav-link primary-color" aria-current="page" target="_blank" href="https://docs.defioptions.org/">Docs</a>
          </li>

          <li class="nav-item ml-40-px dropdown">
            <a class="nav-link dropdown-toggle primary-color" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Community
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" target="_blank" href="https://dune.xyz/dod/DeFi-Options?period=3months">
                <i class="fas fa-chart-bar"></i> Analytics
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://discord.gg/WCeKgHNz3z">
                <i class="fab fa-discord"></i> Discord
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://forum.defioptions.org/">
                <i class="fab fa-discourse"></i> Forum
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://github.com/DeFiOptions">
                <i class="fab fa-github"></i> GitHub
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://snapshot.org/#/defioptionsdao.eth">
                <i class="fas fa-landmark"></i> Governance
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://reddit.com/r/DeFiOptionsDAO/">
                <i class="fab fa-reddit"></i> Reddit
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://t.me/DeFiOptionsDiscussions">
                <i class="fab fa-telegram"></i> Telegram
              </a></li>
              <li><a class="dropdown-item" target="_blank" href="https://twitter.com/DeFiOptionsDAO">
                <i class="fab fa-twitter"></i> Twitter
              </a></li>
            </ul>
          </li>
        </ul>

        <div class="d-flex flex-wrap">

          <div class="dropdown" v-if="isUserConnected">
            <button 
              v-if="getChainName"
              class="btn btn-success dropdown-toggle" 
              type="button" 
              id="dropdownMenuButton1" 
              data-bs-toggle="dropdown" 
              aria-expanded="false">
              {{ getChainName }}
            </button>

            <button 
              v-if="!getChainName"
              class="btn btn-danger dropdown-toggle" 
              type="button" 
              id="dropdownMenuButton1" 
              data-bs-toggle="dropdown" 
              aria-expanded="false">
              Wrong network
            </button>

            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><button @click="switchToPolygon" class="dropdown-item">Polygon PoS Chain</button></li>
              <li><button @click="switchToKovan" class="dropdown-item">Kovan Testnet</button></li>
            </ul>
          </div>

          <button class="btn btn-outline-success mx-1 mb-2 text-uppercase" v-if="!isUserConnected && isCompliant" @click="connectWeb3Modal">Connect wallet</button>
          <button class="btn btn-outline-success mx-1 mb-2 text-uppercase" v-if="!isUserConnected && !isCompliant" data-bs-toggle="modal" data-bs-target="#complianceModal">Connect wallet</button>
          <button class="btn btn-outline-success mx-1 mb-2" v-if="isUserConnected" @click="disconnectWeb3Modal">{{getActiveAccount.substring(0, 6)}}...{{ getActiveAccount.substring(38, 42)}}</button>
        </div>
      </div>

      <!-- Compliance Modal -->
      <div class="modal fade" id="complianceModal" tabindex="-1" aria-labelledby="complianceModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="complianceModalLabel">Information and Compliance</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <ComplianceModalBody />

            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="confirmComplianceAndConnect">I confirm all of the above</button>
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>

          </div>
        </div>
      </div>
      <!-- End Compliance Modal -->
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ComplianceModalBody from './ComplianceModalBody.vue';

export default {
  name: "Navbar",

  components: { 
    ComplianceModalBody 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainName", "isUserConnected", "getWeb3Modal", "getSupportedChains"]),

    getSupportedChainsString() {
      return String(this.getSupportedChains).replace("[", "").replace("]", "").replace(",", ", ");
    }
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");

    // check if user has already confirmed the compliance modal
    this.isCompliant = localStorage.getItem('isCompliant');
  },

  data() {
    return {
      isCompliant: null
    }
  },

  methods: {
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),

    confirmComplianceAndConnect() {
      this.isCompliant = "true";
      localStorage.setItem("isCompliant", "true");

      this.connectWeb3Modal();
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
  }
}
</script>

<style scoped>
.ml-40-px {
  margin-left: 40px;
}

/* Mobile screens */
@media screen and (max-width: 1200px) {
  #navbarSupportedContent {
    margin-top: 10px;
  }

  .ml-40-px {
    margin-left: 0px;
  }
}
</style>
