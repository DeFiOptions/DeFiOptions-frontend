<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Invest in the liquidity pool</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row">

      <!-- Pool balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                              Pool balance
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold text-gray-800">{{ Number(getLiquidityPoolBalance).toFixed(2) }} USD</div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- APY -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              APY (Annual)</div>
                          <div class="h5 mb-0 font-weight-bold text-gray-800">{{getApy}}%</div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-percent fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'Invest',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected", "getActiveAccount", "getWeb3"]),
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance", "getLiquidityPoolBalance"]),
    ...mapGetters("liquidityPool", ["getApy"]),
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
    this.$store.dispatch("liquidityPool/fetchApy");
  }
}
</script>
