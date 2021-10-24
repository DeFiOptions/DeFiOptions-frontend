<template>
  <div class="section-big row mt-4 mx-3">
    <h3>Mint fake stablecoins (Kovan network only)</h3>

    <div class="row">
      <div class="col">
        <div class="section-small">
          <h3>Mint fake Dai</h3>

          <form @submit.prevent="getDai">
            <div class="form-group">
              <input type="text" v-model="daiValue" class="form-control" placeholder="Enter the amount of DAI to receive">
            </div>
            <button class="btn btn-success mt-2">
              <span v-if="daiLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Get fake DAI
            </button>
          </form>
        </div>
      </div>
      
      <div class="col">
        <div class="section-small">
          <h3>Mint fake USDC</h3>

          <form @submit.prevent="getUsdc">
            <div class="form-group">
              <input type="text" v-model="usdcValue" class="form-control" placeholder="Enter the amount of USDC to receive">
            </div>
            <button class="btn btn-success mt-2">
              <span v-if="usdcLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Get fake USDC
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "MintFakeStablecoin",

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("dai", ["getDaiContract"]),
    ...mapGetters("usdc", ["getUsdcContract"]),
  },

  data() {
    return {
      daiValue: null,
      daiLoading: false,
      usdcValue: null,
      usdcLoading: false,
    }
  },

  methods: {
    async getDai() {
      let component = this;
      component.daiLoading = true;
      let tokensWei = this.getWeb3.utils.toWei(this.daiValue, "ether");

      await this.getDaiContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.daiLoading = false;

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
            component.daiLoading = false;

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
      component.usdcLoading = true;

      // mwei because USDC has 6 decimals
      let tokensWei = this.getWeb3.utils.toWei(this.usdcValue, "mwei");

      await this.getUsdcContract.methods.issue(this.getActiveAccount, tokensWei).send({
        from: this.getActiveAccount
      }, function(error, hash) {
        if (error) {
          component.usdcLoading = false;

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
            component.usdcLoading = false;

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

<style>

</style>