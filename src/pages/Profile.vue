<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Your profile</h1>
    </div>
    <!-- END Page Heading -->

    <div class="row mt-3">

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

      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Fakecoin
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserFakecoinBalance).toFixed(2) }}

                            <button class="btn btn-primary btn-sm" @click="addFakecoinToMetaMask" data-toggle="tooltip" data-placement="bottom" title="Add to MetaMask">
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

      <div class="col-xl-3 col-md-6 mb-4">
          <div class="card bg-primary text-white shadow h-100 py-2">
              <div class="card-body">
                  <div class="row no-gutters align-items-center">
                      <div class="col mr-2">
                          <div class="text-xs font-weight-bold text-uppercase mb-1">
                              Fake Dollars
                          </div>
                        
                          <div class="h5 mb-0 font-weight-bold">
                            ${{ Number(getUserFakeDollarBalance).toFixed(2) }}
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

    <!-- Outer Row -->
    <div class="row justify-content-center mb-4">

      <div class="col-md-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some Fakecoins</h2>
                        <p class="mb-4">
                          Fakecoin represents DAI (stablecoin with 18 decimals). Mint some fakecoins here and use 
                          them on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getFakecoins">
                        <div class="form-group">
                            <input type="text" v-model="fakecoinValue" class="form-control form-control-user"
                                placeholder="Enter the amount of Fakecoins">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Gimme Fakecoins! :)
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
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some Fake Dollars</h2>
                        <p class="mb-4">
                          This is another test stablecoin called Fake Dollar, and it represents USDC (6 decimals). 
                          Mint some fakecoins here and use them on DeFiOptions (Kovan testnet only).
                        </p>
                    </div>

                    <form @submit.prevent="getFakeDollars">
                        <div class="form-group">
                            <input type="text" v-model="fakeDollarValue" class="form-control form-control-user"
                                placeholder="Enter the amount of Fake Dollars">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Gimme Fake Dollars! :)
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
    ...mapGetters("optionsExchange", ["getExchangeUserBalance"]),
    ...mapGetters("fakecoin", ["getFakecoinContract", "getUserFakecoinBalance"]),
    ...mapGetters("fakeDollar", ["getFakeDollarContract", "getUserFakeDollarBalance"]),
    ...mapGetters("creditToken", ["getCreditTokenUserBalance"]),
    ...mapGetters("liquidityPool", ["getLiquidityPoolUserBalance"])
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("fakecoin/fetchContract");
    this.$store.dispatch("fakeDollar/fetchContract");
    this.$store.dispatch("creditToken/fetchContract");
    this.$store.dispatch("liquidityPool/fetchUserBalance");
    this.$store.dispatch("fakecoin/fetchUserBalance");
    this.$store.dispatch("fakeDollar/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("accounts/fetchActiveBalance");
  },
  data() {
    return {
      fakecoinValue: null,
      fakeDollarValue: null
    }
  },
  methods: {
    async getFakecoins() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.fakecoinValue, "ether");

      await this.getFakecoinContract.methods.issue(this.getActiveAccount, tokensWei).send({
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
          component.getFakecoinContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The Fakecoin issue transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself fakecoins! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("fakecoin/fetchUserBalance"); // refresh the user's fakecoin balance
              component.fakecoinValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    async getFakeDollars() {
      let component = this;
      // mwei because Fake Dollar has 6 decimals
      let tokensWei = this.getWeb3.utils.toWei(this.fakeDollarValue, "mwei");

      await this.getFakeDollarContract.methods.issue(this.getActiveAccount, tokensWei).send({
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
          component.getFakeDollarContract.once("Transfer", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The Fake Dollar minting transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully issued yourself Fake Dollars! Now go and spend it :)");

              // Refresh values
              component.$store.dispatch("fakeDollar/fetchUserBalance"); // refresh the user's fakecoin balance
              component.fakeDollarValue = null;
            }

            // Refresh the ETH balance no matter if the tx was successful or not
            component.$store.dispatch("accounts/fetchActiveBalance");
          });
        }
      });
    },
    async addFakecoinToMetaMask() {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.getFakecoinContract._address, // The address that the token is at.
            symbol: "fkUSD", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "", // TODO: A string url of the token logo
          },
        },
      });
    }
  }
}
</script>
