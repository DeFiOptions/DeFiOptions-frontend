<template>
  <div class="section-big row mt-4 mx-3">
    <div class="col-md-3">
      <h3>Account balance</h3>

      <Card 
        cardClass="card-green" 
        title="Your balance" 
        :text="'$'+exchangeBalance.toFixed(2)" 
        info="Your exchange balance in USD, deposited in the options exchange, which you can withdraw at any time free of charge, use to purchase options from the liquidity pool, or provide as collateral for writing options."
      />

      <Card 
        cardClass="card-blue" 
        title="Credit tokens" 
        :text="creditTokens" class="mb-3" 
        info="Your Credit Tokens balance, which accrues interest over time and is redeemable for stablecoins at a 1:1 value conversion ratio in the options exchange as long as there's enough stablecoin supply available."
      />
    </div>

    <div class="col-md-9">
      <h3>
        Withdraw
        <i 
          class="fas fa-info-circle" 
          data-bs-toggle="tooltip" 
          data-bs-placement="bottom" 
          title="Withdraw stablecoins from your DeFi Options account balance to your Polygon account. Important: you may recieve multiple types of stablecoins (DAI, USDC etc.), not just one."
        ></i>
      </h3>

      <div class="section-small d-flex flex-wrap">
        <div>
          <input type="text" v-model="withdrawValue" class="form-control withdraw-input" placeholder="0.0" aria-describedby="withdrawText">
          <div id="withdrawText" class="form-text">
            Balance: ${{ exchangeBalance.toFixed(2) }}
            <a href="#" class="withdraw-max-text" @click="withdrawValue=String(Math.floor(exchangeBalance*100000)/100000)">(max)</a>
          </div>
        </div>

        <div class="form-button-mobile">
          <button @click="withdrawBalance" class="btn btn-success btn-user btn-block text-uppercase form-control">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Withdraw
          </button>
          <div></div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Card from '../Card.vue';

export default {
  components: { Card },
  name: "AccountBalance",
  props: ["exchangeBalance", "creditTokens"],

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("optionsExchange", ["getOptionsExchangeContract"]),
  },

  created() {
    this.$store.dispatch("creditToken/fetchUserBalance");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
  },

  data() {
    return {
      withdrawValue: null,
      loading: false
    }
  },

  methods: {
    async withdrawBalance() {
      let component = this;
      component.loading = true;

      let tokensWei = this.getWeb3.utils.toWei(this.withdrawValue, "ether");

      await this.getOptionsExchangeContract.methods.withdrawTokens(tokensWei).send({
        from: this.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your withdrawal was successfull. It may take 10s or more for values to update.");

          // refresh values
          component.$store.dispatch("dai/fetchUserBalance"); // refresh the user's dai balance
          component.$store.dispatch("usdc/fetchUserBalance"); // refresh the user's usdc balance
          component.$store.dispatch("creditToken/fetchUserBalance"); // refresh the user's credit token balance
          component.withdrawValue = null;

          component.withdrawAmount = null;
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the DeFi Options support.");
        }

        // Refresh the exchange balance no matter if the tx was successful or not
        component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the DeFi Options support.");
      });
    }
  }
}
</script>

<style scoped>
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