<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Your profile</h1>
    </div>
    <!-- END Page Heading -->

    <!-- Outer Row -->
    <div class="row justify-content-center">

      <div class="col-md-6">
        <div class="card o-hidden border-0 shadow-lg mt-2">
          <div class="card-body p-0">
            <div class="p-5">
              <div class="text-center">
                <h2 class="h4 text-gray-900 mb-2">{{ getActiveAccount }}</h2>

                <p><strong>Your ETH balance:</strong> {{ Number(getActiveBalanceEth).toFixed(4) }} ETH</p>
                <p><strong>Your Exchange balance:</strong> {{ Number(getExchangeUserBalance).toFixed(2) }} fkUSD</p>
                <p><strong>Your Fakecoin balance:</strong> {{ Number(getUserFakecoinBalance).toFixed(2) }} fkUSD</p>

                <button type="button" class="btn btn-success btn-user btn-block mt-3" @click="addFakecoinToMetaMask">Add Fakecoin to MetaMask</button>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
          <div class="card o-hidden border-0 shadow-lg mt-2">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h2 class="h4 text-gray-900 mb-2">Get yourself some fake USD</h2>
                        <p class="mb-4">
                          This is for a testnet only. You'll need some fake stablecoin tokens and here's where you 
                          can mint them.
                        </p>
                    </div>

                    <form @submit.prevent="getFakeUsd">
                        <div class="form-group">
                            <input type="text" v-model="ctValue" class="form-control form-control-user"
                                placeholder="Enter the amount of fake USD">
                        </div>
                        <button class="btn btn-primary btn-user btn-block">
                            Gimme money! :)
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
    ...mapGetters("fakecoin", ["getFakecoinContract", "getUserFakecoinBalance"])
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("fakecoin/fetchContract");
    this.$store.dispatch("fakecoin/fetchUserBalance");
    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
    this.$store.dispatch("accounts/fetchActiveBalance");
  },
  data() {
    return {
      ctValue: null
    }
  },
  methods: {
    async getFakeUsd() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.ctValue, "ether");

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
              component.ctValue = null;
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
