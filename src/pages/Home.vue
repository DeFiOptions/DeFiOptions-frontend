<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1>Welcome to DeFiOptions</h1>
    </div>
    <!-- END Page Heading -->

    <h4 class="mb-4 text-gray-600">Open, permissionless, cash-settled options trading.</h4>

    <p v-if="!isUserConnected">
      <strong>Please connect your Ethereum wallet.</strong>

      <br>

      <button type="button" class="btn btn-success mt-3" @click="connectWeb3Modal">Connect wallet</button>
    </p>

    <div class="row" v-if="isUserConnected">

      <div class="col-md-4 mb-3">
        <div class="card pt-4 pl-4 pr-4">
          <router-link to="/trade">
            <img src="@/assets/undraw_Stock_prices_re_js33.svg" class="card-img-top" alt="Trading">
          </router-link>

          <div class="card-body text-center">
            <h3>TRADE</h3>

            <p class="card-text">
              Trade cash-settled ETH and BTC options (CALL/PUT).
            </p>

            <router-link to="/trade">
              <a href="/trade" class="card-link">Go to Trading</a>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3 card-deck">
        <div class="card pt-4 pl-4 pr-4">
          <router-link to="/invest">
            <img src="@/assets/undraw_Invest_re_8jl5.svg" class="card-img-top" alt="Investing">
          </router-link>

          <div class="card-body text-center">
            <h3>INVEST</h3>

            <p class="card-text">
              Invest in the liquidity pool and become an option writer.
            </p>

            <router-link to="/invest">
              <a href="/invest" class="card-link">Go to Investing</a>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3 card-deck">
        <div class="card pt-4 pl-4 pr-4">
          <router-link to="/profile">
            <img src="@/assets/undraw_Data_re_80ws.svg" class="card-img-top" alt="Analyzing">
          </router-link>

          <div class="card-body text-center">
            <h3>ANALYZE</h3>

            <p class="card-text">
              Track your performance and balances.
            </p>

            <router-link to="/profile">
              <a href="/profile" class="card-link">Go to Profile</a>
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected"]),
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),
  }
}
</script>
