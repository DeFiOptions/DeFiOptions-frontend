<template>
  <div class="section-big row mt-4 mx-3">
    <div class="col-md-3">
      <h3>Account balance</h3>

      <div class="card card-balance">
        <div class="card-body">
          <h5 class="card-title">Your balance</h5>
          <p class="card-text">${{ exchangeBalance.toFixed(2) }}</p>
        </div>
      </div>

      <div class="card card-tokens mb-3">
        <div class="card-body">
          <h5 class="card-title">Credit tokens</h5>
          <p class="card-text">${{ creditTokens }}</p>
        </div>
      </div>
    </div>

    <div class="col-md-9">
      <h3>Withdraw</h3>

      <div class="section-small d-flex">
        <div>
          <input type="text" v-model="withdrawValue" class="form-control withdraw-input" placeholder="0.0" aria-describedby="withdrawText">
          <div id="withdrawText" class="form-text">
            Balance: ${{ exchangeBalance.toFixed(2) }}
            <a href="#" class="withdraw-max-text" @click="withdrawValue=String(Math.floor(exchangeBalance*100000)/100000)">(max)</a>
          </div>
        </div>

        <div>
          <button @click="withdrawBalance" class="btn btn-success btn-user btn-block text-uppercase form-control">Withdraw</button>
          <div></div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AccountBalance",
  props: ["exchangeBalance", "creditTokens"],

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeContract"]),
  },

  data() {
    return {
      withdrawValue: null
    }
  },

  methods: {
    async withdrawBalance() {
      let component = this;
      let tokensWei = this.getWeb3.utils.toWei(this.withdrawValue, "ether");

      await this.getOptionsExchangeContract.methods.withdrawTokens(tokensWei).send({
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

          // listen for the WithdrawTokens event
          component.getOptionsExchangeContract.once("WithdrawTokens", {
            filter: { owner: component.getActiveAccount }
          }, function(error, event) {
            // failed transaction
            
            if (error) {
              component.$toast.error("The withdrawal transaction has failed. Please try again, perhaps with a higher gas limit.");
            }

            // success
            if (event) {
              component.$toast.success("You have successfully withdrew your exchange balance (or were credited with Credit Tokens).");

              // Refresh values
              component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
              component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's usdc balance
              component.$store.dispatch("creditToken/fetchUserBalance"); // refresh the user's credit token balance
              component.withdrawValue = null;
            }

            // Refresh the exchange balance no matter if the tx was successful or not
            component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
          });
        }
      });
    }
  }
}
</script>

<style scoped>
  .card {
    border-radius: 4px;
    border: none;
    margin-top: 16px;
    padding: 8px 0px 4px 8px;
  }

  .card-balance {
    background: linear-gradient(225deg, rgba(90, 255, 99, 0.75) 0%, rgba(16, 86, 133, 0.75) 100%);
  }

  .card-text {
    color: white;
    font-weight: normal;
    font-size: 20px;
  }

  .card-title {
    color: white;
    font-weight: 300;
    font-size: 14px;
  }

  .card-tokens {
    background: #105685;
  }

  .section-small {
    margin-top: 16px;
  }

  .withdraw-input {
    max-width: 200px;
    margin-right: 10px;
  }

  #withdrawText {
    color: white;
    font-weight: 400;
    font-size: 12px;
  }

</style>