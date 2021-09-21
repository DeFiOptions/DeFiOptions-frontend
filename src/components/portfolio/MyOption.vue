<template>

<div class="section-small">

  <div class="d-flex justify-content-between">

    <div class="d-flex justify-content-center">
      <MyOptionDataItem class="data-item" title="Option" :data="option.pair+' · ' + option.type" :divider="true" />
      <MyOptionDataItem class="data-item" title="Option size" :data="option.holding" :divider="true" />
      <MyOptionDataItem class="data-item" title="Expiration" :data="option.maturity" :divider="true" />
      <MyOptionDataItem class="data-item" title="Intrinsic value" :green="true" :data="'$'+intrinsicValue" />
    </div>

    <div>
      <button v-if="!isOptionExpired(option)" class="btn btn-success text-uppercase">Sell</button>

      <button @click="redeemOption" v-if="isOptionExpired(option) && intrinsicValue > 0" class="btn btn-success text-uppercase">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Redeem
      </button>
      
      <button v-if="isOptionExpired(option) && intrinsicValue == 0" class="btn btn-danger text-uppercase" disabled>Expired</button>

      <span></span>
    </div>

  </div>

  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";
import MyOptionDataItem from './MyOptionDataItem.vue';
import OptionTokenContractJson from "../../contracts/RedeemableToken.json";

export default {
  name: "MyOption",
  props: ["option"],
  data() {
    return {
      loading: false
    }
  },

  components: { 
    MyOptionDataItem 
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),

    intrinsicValue() {
      return (Number(this.option.intrinsicValue)*Number(this.option.holding)).toFixed(2);
    }
  },

  methods: {
    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },

    async redeemOption() {
      let component = this;

      // get option contract
      let optionContract = new this.getWeb3.eth.Contract(OptionTokenContractJson.abi, this.option.address);

      // redeem option transaction
      try {
        await optionContract.methods.redeem(
          component.getActiveAccount
        ).send({
          from: component.getActiveAccount,
          gas: Number(150000)
        }, function(error, hash) {
          component.loading = true;

          // transaction error
          if (error) {
            component.$toast.error("The transaction has been rejected. Please try again.");
            component.loading = false;
          }

          // transaction sent
          if (hash) {
            // show a "tx submitted" toast
            component.$toast.info("The Redeem transaction has been submitted. Please wait for it to be confirmed.");

            // listen for the event
            optionContract.once("Transfer", {
              filter: { owner: component.getActiveAccount }
            }, function(error, event) {
              component.loading = false;
              
              // failed transaction
              if (error) {
                component.$toast.error("The Redeem transaction has failed. Please try again, perhaps with a higher gas limit.");
              }

              // success
              if (event) {
                component.$toast.success("You have successfully redeemed your expired option.");
                component.$store.dispatch("optionsExchange/fetchExchangeUserBalance");
                component.$store.dispatch("optionsExchange/fetchUserOptions");
              }
            });
          }
        });
      } catch (e) {
          window.console.log("Error:", e);
          component.$toast.error("The transaction has been reverted. Please try again or contact project admins.");
          component.loading = false;
      }
    },
  }
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.section-small {
  margin-top: 16px;
}
</style>