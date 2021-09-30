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

            <!-- Nav Item - Portfolio -->
            <router-link to="/portfolio" style="text-decoration: none" v-if="isUserConnected">
              <li class="nav-item">
                  <a class="nav-link" :class="{active:this.$route.name === 'portfolio'}" href="/portfolio">Portfolio</a>
              </li>
            </router-link>
            <!-- END Nav Item - Portfolio -->

            <!-- Nav Item - Liquidity pool -->
            <router-link to="/invest" style="text-decoration: none" v-if="isUserConnected">
              <li class="nav-item">
                  <a class="nav-link" :class="{active:this.$route.name === 'invest'}" href="/invest">Liquidity pool</a>
              </li>
            </router-link>
            <!-- END Nav Item - Liquidity pool -->

            <li class="nav-item" v-if="isUserConnected">
              <a class="nav-link disabled" href="#">Governance</a>
            </li>
          </ul>

        <div class="d-flex flex-wrap">
          <button class="btn btn-success mx-1 mb-2" v-if="isUserConnected && getChainName">{{ getChainName }}</button>
          <button class="btn btn-danger mx-1 mb-2" v-if="isUserConnected && !getChainName">Wrong network</button>

          <button class="btn btn-outline-success mx-1 mb-2 text-uppercase" v-if="!isUserConnected" @click="connectWeb3Modal">Connect wallet</button>
          <button class="btn btn-outline-success mx-1 mb-2" v-if="isUserConnected" @click="disconnectWeb3Modal">{{getActiveAccount.substring(0, 6)}}...{{ getActiveAccount.substring(38, 42)}}</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Navbar",
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainName", "isUserConnected", "getWeb3Modal", "isCurrentChainSupported", "getSupportedChains"]),

    getSupportedChainsString() {
      return String(this.getSupportedChains).replace("[", "").replace("]", "").replace(",", ", ");
    }
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),
  }
}
</script>
