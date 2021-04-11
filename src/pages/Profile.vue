<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Portfolio</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row mt-3">

      <!-- Card: Address -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Address
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            {{getActiveAccount.substring(0, 7)}}...{{ getActiveAccount.substring(35, 42) }}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: ETH balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              ETH
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            {{ Number(getActiveBalanceEth).toFixed(2) }} ETH
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fab fa-ethereum fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Exchange balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Exchange Balance
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getExchangeUserBalance).toFixed(2) }}<br>
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Credit tokens -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Credit Tokens
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getCreditTokenUserBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: Pool tokens -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Pool Tokens
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
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

      <!-- Card: DAI balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Dai
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserDaiBalance).toFixed(2) }}

                            <button class="btn btn-primary btn-sm" @click="addDaiToMetaMask" data-toggle="tooltip" data-placement="bottom" title="Add to MetaMask">
                              <i class="fas fa-plus-circle"></i>
                            </button>
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Card: USDC balance -->
      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              USDC
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserUsdcBalance).toFixed(2) }}
                          </div>
                      </div>
                      <div class="col-auto">
                          <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

    </div>

    <!-- Options table -->
    <div class="row mb-4" v-if="getUserOptions">
      <div class="col-md-12">
        <div class="card shadow mt-4">
          <div class="card-body">
            <h5 class="card-title">Your options</h5>

            <!-- Table START -->
            <div class="table-responsive">
              <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Symbol</th>
                        <th>Holding</th>
                        <th>Written</th>
                        <th>Intrinsic value</th>
                    </tr>
                </thead>
                
                <tbody>

                    <tr v-for="(option, index) in getUserOptions" v-bind:key="option.symbol">
                        <td>{{index + 1}}</td>
                        <td>{{option.symbol}}</td>
                        <td>{{option.holding}}</td>
                        <td>{{option.written}}</td>
                        <td>${{ Number(option.intrinsicValue).toFixed(2) }}</td>
                    </tr>

                </tbody>
              </table>
            </div>
            <!-- Table END-->
            
          </div>
        </div>
      </div>
    </div>

    <!-- Outer Row -->
    <div class="row justify-content-center mb-4">

      <div class="col-md-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some DAI</h2>
                        <p class="mb-4">
                          Mint yourself some fake DAI tokens here and use 
                          it on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getDai">
                        <div class="form-group">
                            <input type="text" v-model="daiValue" class="form-control form-control-user"
                                placeholder="Enter the amount of DAI to receive">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Gimme fake DAI! :)
                        </button>
                    </form>
                </div>
              </div>
          </div>
      </div>

      <div class="col-md-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some USDC</h2>
                        <p class="mb-4">
                          Mint some fake USDC here and use it on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getUsdc">
                        <div class="form-group">
                            <input type="text" v-model="usdcValue" class="form-control form-control-user"
                                placeholder="Enter the amount of USDC to receive">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Gimme fake USDC! :)
                        </button>
                    </form>
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
  name: 'Profile',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance", "getUserOptions"]),
    ...mapGetters("dai", ["getDaiContract", "getUserDaiBalance"]),
    ...mapGetters("usdc", ["getUsdcContract", "getUserUsdcBalance"]),
    ...mapGetters("creditToken", ["getCreditTokenUserBalance"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolUserBalance"])
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("dai/fetchContract");
    this.$store.dispatch("usdc/fetchContract");
    this.$store.dispatch("creditToken/fetchContract");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("optionsExchange/fetchUserOptions");
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("accounts/fetchActiveBalance");
  },
  data() {
    return {
      daiValue: null,
      usdcValue: null
    }
  },
  methods: {
    async getDai() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.daiValue, "ether");

      await this.getDaiContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.", {
              timeout: 5000
          });
        }

        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the Transfer event
          component.getDaiContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The Dai issue transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself DAI! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
              component.daiValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    async getUsdc() {
      let component = this;
      // mwei because USDC has 6 decimals
      let tokensWei = this.getWeb3.utils.toWei(this.usdcValue, "mwei");

      await this.getUsdcContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.$toast.error("The transaction has been rejected. Please try again.", {
              timeout: 5000
          });
        }

        if (hash) {
          // show a "tx submitted" toast
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

          // listen for the Transfer event
          component.getUsdcContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The USDC minting transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself USDC! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's USDC balance
              component.usdcValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    async addDaiToMetaMask() {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.getDaiContract._address, // The address that the token is at.
            symbol: "DAI", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "", // TODO: A string url of the token logo
          },
        },
      });
    }
  }
}
</script>
