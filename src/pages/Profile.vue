<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Your profile</h1>
    </div>
    <!-- END Page Heading -->

    <!-- Outer Row -->
    <div class="row justify-content-center">

      <div class="col-lg-6">
        <div class="card o-hidden border-0 shadow-lg my-5">
          <div class="card-body p-0">
            <div class="p-5">
              <div class="text-center">
                <Gravatar v-if="getActiveAccount" class="img-fluid" :email="getActiveAccount" default-img="robohash" :size=200 />
              
                <p>{{ getActiveAccount }}</p>
                <p><strong>Your ETH balance:</strong> {{ Number(getActiveBalanceEth).toFixed(4) }} ETH</p>
                <p><strong>Your Exchange balance:</strong> {{ Number(getExchangeUserBalance).toFixed(4) }} ???</p>
                <p><strong>Your Fakecoin balance:</strong> {{ Number(getUserFakecoinBalance).toFixed(2) }} fkUSD</p>

                <button type="button" class="btn btn-success btn-user btn-block mt-3" @click="addFakecoinToMetaMask">Add Fakecoin to MetaMask</button>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
          <div class="card o-hidden border-0 shadow-lg my-5">
              <div class="card-body p-0">
                  <div class="p-5">
                    <div class="text-center">
                        <h1 class="h4 text-gray-900 mb-2">Get yourself some fake USD</h1>
                        <p class="mb-4">
                          This is for a testnet only. You'll need some fake stablecoin tokens and here's where you 
                          can mint them.
                        </p>
                    </div>

                    <form class="user" @submit.prevent="getFakeUsd">
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
import Gravatar from "vue-gravatar";

export default {
  name: 'Profile',
  components: {
    Gravatar
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("optionsExchange", ["getExchangeUserBalance"]),
    ...mapGetters("fakecoin", ["getFakecoinContract", "getUserFakecoinBalance"])
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      document.location.href="/";
    }

    this.$store.dispatch("optionsExchange/fetchContract");
    this.$store.dispatch("fakecoin/fetchContract");
    this.$store.dispatch("fakecoin/fetchUserBalance");

    this.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
  },
  data() {
    return {
      ctValue: null
    }
  },
  methods: {
    async getFakeUsd() {
      window.console.log("ctValue:", this.ctValue);
      let tokensWei = this.getWeb3.utils.toWei(this.ctValue, "ether");

      window.console.log("ctValue WEI:", tokensWei);

      await this.getFakecoinContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
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
