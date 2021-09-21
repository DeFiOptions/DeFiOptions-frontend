<template>
  <div>

    <AccountBalance 
      :exchangeBalance="Number(getExchangeUserBalance)" 
      :creditTokens="Number(getCreditTokenUserBalance).toFixed(2)" 
    />

    <MyOptions :getUserOptions="getUserOptions" />

    <br />
    <br />
    <br />
    <br />
    <br />



    <!-- Mint fake stablecoins -->
    <div class="row justify-content-center mb-4">

      <div class="col-lg-6">
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
                            Get fake DAI
                        </button>
                    </form>
                </div>
              </div>
          </div>
      </div>

      <div class="col-lg-6">
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
                            Get fake USDC
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
import AccountBalance from '../components/portfolio/AccountBalance.vue';
import MyOptions from '../components/portfolio/MyOptions.vue';

export default {
  name: 'Portfolio',
  components: {
    AccountBalance,
    MyOptions
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3", "isUserConnected"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance", "getUserOptions"]),
    ...mapGetters("dai", ["getDaiContract"]),
    ...mapGetters("usdc", ["getUsdcContract"]),
    ...mapGetters("creditToken", ["getCreditTokenUserBalance"]),
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
    this.$store.dispatch("liquidityPool/storeAddress");
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
    },
    async addUsdcToMetaMask() {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.getUsdcContract._address, // The address that the token is at.
            symbol: "USDC", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 6, // The number of decimals in the token
            image: "", // TODO: A string url of the token logo
          },
        },
      });
    },
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
    }
  }
}
</script>
