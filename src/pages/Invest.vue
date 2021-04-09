<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Invest in the liquidity pool</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row">

      <!-- Pool balance (user) -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Pool balance (yours)
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold text-gray-800">
                            ${{ Number(getLiquidityPoolUserBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Pool balance (total) -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Pool balance (total)
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold text-gray-800">
                            ${{ Number(getLiquidityPoolBalance).toFixed(2) }}
                          </div>
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
                              Yield (Since start)</div>
                          <div class="h5 mb-0 font-weight-bold text-gray-800">{{Number(getApy).toFixed(2)}}%</div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-percent fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div class="col-xl-6">
        <div class="card o-hidden border-0 shadow-lg">
            <div class="card-body p-0">
                <div class="p-5">
                  <div class="text-center">
                      <h2 class="h4 text-gray-900 mb-2">Deposit funds in the liquidity pool</h2>
                  </div>

                  <form @submit.prevent="depositIntoPool" class="mt-3">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{selectedToken}}</button>
                        <div class="dropdown-menu dropdown-menu-left">
                          <a class="dropdown-item" @click="changeStablecoin('DAI')" href="#">DAI</a>
                          <a class="dropdown-item" @click="changeStablecoin('USDC')" href="#">USDC</a>
                        </div>
                      </div>
                      <input type="text" class="form-control" v-model="depositValue" placeholder="0.0">
                    </div>

                    <small>
                      Your {{selectedToken}} balance: {{ Number(getUserStablecoinBalance).toFixed(2) }} {{selectedToken}}.
                    </small>

                    <div class="mt-2">
                      <button :disabled="depositValue == null || Number(depositValue) == 0" class="btn btn-primary btn-block">
                        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Deposit {{depositValue}} {{selectedToken}}
                      </button>
                    </div>
                    
                    <span>
                      <small>
                        (You will need to confirm two actions in MetaMask: Sign + Confirm transaction.)
                      </small>
                    </span>
                  </form>
              </div>
            </div>
        </div>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { signERC2612Permit } from 'eth-permit';

export default {
  name: 'Invest',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected", "getActiveAccount", "getWeb3"]),
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth"]),
    ...mapGetters("optionsExchange", ["getLiquidityPoolBalance"]),
    ...mapGetters("liquidityPool", ["getApy", "getLiquidityPoolContract", "getLiquidityPoolAddress", "getLiquidityPoolUserBalance"]),
    ...mapGetters("dai", ["getDaiAddress", "getUserDaiBalance", "getDaiContract"]),
    ...mapGetters("usdc", ["getUsdcAddress", "getUserUsdcBalance", "getUsdcContract"]),

    getStablecoinContract() {
      if (this.selectedToken === "DAI") {
        return this.getDaiContract;
      } else if (this.selectedToken === "USDC") {
        return this.getUsdcContract;
      }

      return null;
    },
    getUserStablecoinBalance() {
      if (this.selectedToken === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.selectedToken === "USDC") {
        return this.getUserUsdcBalance;
      }

      return null;
    },
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/storeAddress");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/storeAddress");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
    this.$store.dispatch("liquidityPool/fetchApy");
    this.$store.dispatch("liquidityPool/storeAddress");
  },
  data() {
    return {
      depositValue: null,
      loading: false,
      selectedToken: "DAI"
    }
  },
  methods: {
    changeStablecoin(token) {
      this.selectedToken = token;
    },
    async depositIntoPool() {
      let component = this;

      let unit = "ether"; // DAI
      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC
      }

      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);

      const result = await signERC2612Permit(
        window.ethereum, 
        component.getStablecoinContract._address, 
        component.getActiveAccount, 
        component.getLiquidityPoolAddress, 
        tokensWei
      );

      // make a deposit
      await component.getLiquidityPoolContract.methods.depositTokens(
        component.getActiveAccount, 
        component.getStablecoinContract._address, 
        tokensWei,
        result.deadline,
        result.v,
        result.r,
        result.s
      ).send({
        from: component.getActiveAccount
      }, function(error, hash) {
        component.loading = true;

        // Deposit tx error
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.");
          component.loading = false;
        }

        // Deposit transaction sent
        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The Deposit transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the Transfer event
          component.getStablecoinContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            component.loading = false;
            
            // failed transaction
            if (error) {
              component.$toast.error("The Deposit transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("Your deposit was successfull.");

              // refresh values
              if (component.selectedToken === "DAI") {
                component.$store.dispatch("dai/fetchUserBalance");
              } else if (component.selectedToken === "USDC") {
                component.$store.dispatch("usdc/fetchUserBalance");
              }
              
              component.$store.dispatch("optionsExchange/fetchLiquidityPoolBalance");
              component.$store.dispatch("liquidityPool/fetchUserBalance");
              component.depositValue = null;
            }
          });
        }
      });
 
    }
  }
}
</script>
